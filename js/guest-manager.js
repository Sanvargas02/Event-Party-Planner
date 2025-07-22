// JavaScript for the guest manager page (guest-manager.html)

let currentEventId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initGuestManager();
    
    // Event listeners
    
    // Event selection change
    document.getElementById('event-select').addEventListener('change', function() {
        currentEventId = this.value;
        loadEventDetails(currentEventId);
        loadGuestList(currentEventId);
        updateRSVPSummary(currentEventId);
    });
    
    // Add guest form submission
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        addGuest();
    });
    
    // Guest list filter
    document.querySelector('section:nth-of-type(4) select').addEventListener('change', function() {
        filterGuestList(this.value);
    });
    
    // Guest search
    document.querySelector('section:nth-of-type(4) input[type="text"]').addEventListener('input', function() {
        searchGuests(this.value);
    });
});

// Initialize the guest manager page
function initGuestManager() {
    // Load events into the dropdown
    loadEventOptions();
    
    // Select the first event by default
    const eventSelect = document.getElementById('event-select');
    if (eventSelect.options.length > 0) {
        currentEventId = eventSelect.options[0].value;
        loadEventDetails(currentEventId);
        loadGuestList(currentEventId);
        updateRSVPSummary(currentEventId);
    }
}

// Load events into the dropdown
function loadEventOptions() {
    const events = getAllEvents();
    const eventSelect = document.getElementById('event-select');
    
    // Clear current options
    eventSelect.innerHTML = '';
    
    // Add events to dropdown
    events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.name;
        eventSelect.appendChild(option);
    });
}

// Load event details
function loadEventDetails(eventId) {
    const event = getEventById(eventId);
    if (!event) return;
    
    // Update total invited and responses
    const totalInvited = event.guests.length;
    const totalResponded = event.guests.filter(guest => guest.rsvp !== 'pending').length;
    
    document.querySelector('section:nth-of-type(1) h3:nth-of-type(2) span:nth-of-type(1)').textContent = totalInvited;
    document.querySelector('section:nth-of-type(1) h3:nth-of-type(2) span:nth-of-type(2)').textContent = totalResponded;
}

// Load guest list
function loadGuestList(eventId, filter = 'all', searchTerm = '') {
    const event = getEventById(eventId);
    if (!event) return;
    
    const guestList = document.querySelector('section:nth-of-type(4) ul');
    guestList.innerHTML = '';
    
    // Filter and search guests
    let filteredGuests = event.guests;
    
    // Apply status filter
    if (filter !== 'all') {
        filteredGuests = filteredGuests.filter(guest => guest.rsvp === filter);
    }
    
    // Apply search filter
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredGuests = filteredGuests.filter(guest => 
            guest.name.toLowerCase().includes(term) || 
            guest.email.toLowerCase().includes(term) ||
            (guest.phone && guest.phone.includes(term))
        );
    }
    
    // Display guests
    if (filteredGuests.length === 0) {
        guestList.innerHTML = '<li>No guests found.</li>';
        return;
    }
    
    filteredGuests.forEach(guest => {
        const guestElement = document.createElement('li');
        guestElement.dataset.guestId = guest.id;
        
        // Get RSVP status emoji
        const statusEmoji = getRSVPEmoji(guest.rsvp);
        
        guestElement.innerHTML = `
            <h3>${statusEmoji} ${guest.name}</h3>
            ${guest.phone ? `<p>📱 ${guest.phone}</p>` : ''}
            <p>📧 ${guest.email}</p>
            <p>RSVP: ${capitalizeFirstLetter(guest.rsvp)} ${guest.rsvpDate ? `(${guest.rsvpDate})` : ''}</p>
            <button onclick="editGuest(${eventId}, ${guest.id})">Edit</button>
            <button onclick="removeGuest(${eventId}, ${guest.id})">Remove</button>
            ${guest.rsvp === 'pending' ? 
                `<button onclick="changeGuestStatus(${eventId}, ${guest.id})">Change Status</button>` : 
                `<button onclick="sendReminder(${eventId}, ${guest.id})">Send Reminder</button>`
            }
        `;
        
        guestList.appendChild(guestElement);
    });
}

// Update RSVP summary
function updateRSVPSummary(eventId) {
    const event = getEventById(eventId);
    if (!event) return;
    
    const rsvpCounts = getRSVPCounts(eventId);
    
    // Update counts
    document.querySelector('section:nth-of-type(3) h3:nth-of-type(1) span').textContent = rsvpCounts.going;
    document.querySelector('section:nth-of-type(3) h3:nth-of-type(2) span').textContent = rsvpCounts.maybe;
    document.querySelector('section:nth-of-type(3) h3:nth-of-type(3) span').textContent = rsvpCounts.pending;
    document.querySelector('section:nth-of-type(3) h3:nth-of-type(4) span').textContent = rsvpCounts.notGoing;
    
    // Update progress bar
    const totalGuests = event.guests.length;
    const respondedGuests = totalGuests - rsvpCounts.pending;
    const responsePercentage = totalGuests > 0 ? Math.round((respondedGuests / totalGuests) * 100) : 0;
    
    const progressBar = document.querySelector('section:nth-of-type(3) progress');
    progressBar.value = respondedGuests;
    progressBar.max = totalGuests;
    
    document.querySelector('section:nth-of-type(3) span:last-child').textContent = `${responsePercentage}% responded`;
}

// Add a new guest
function addGuest() {
    if (!currentEventId) return;
    
    const nameInput = document.getElementById('guest-name');
    const phoneInput = document.getElementById('guest-phone');
    const emailInput = document.getElementById('guest-email');
    const statusSelect = document.getElementById('guest-status');
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const rsvp = statusSelect.value;
    
    if (!name || !email) {
        alert('Please enter a name and email for the guest.');
        return;
    }
    
    // Get current events
    const events = getAllEvents();
    const eventIndex = events.findIndex(event => event.id === parseInt(currentEventId));
    
    if (eventIndex === -1) return;
    
    // Create new guest
    const newGuest = {
        id: Date.now(), // Use timestamp as unique ID
        name,
        email,
        phone: phone || null,
        rsvp,
        rsvpDate: new Date().toISOString().split('T')[0] // Today's date
    };
    
    // Add guest to event
    events[eventIndex].guests.push(newGuest);
    
    // Save updated events
    saveEvents(events);
    
    // Reset form
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    statusSelect.value = 'going';
    
    // Refresh guest list and summary
    loadGuestList(currentEventId);
    updateRSVPSummary(currentEventId);
    loadEventDetails(currentEventId);
    
    alert(`${name} has been added to the guest list.`);
}

// Filter guest list by RSVP status
function filterGuestList(filter) {
    const searchInput = document.querySelector('section:nth-of-type(4) input[type="text"]');
    loadGuestList(currentEventId, filter, searchInput.value);
}

// Search guests
function searchGuests(searchTerm) {
    const filterSelect = document.querySelector('section:nth-of-type(4) select');
    loadGuestList(currentEventId, filterSelect.value, searchTerm);
}

// Edit guest
function editGuest(eventId, guestId) {
    const event = getEventById(eventId);
    if (!event) return;
    
    const guest = event.guests.find(g => g.id === guestId);
    if (!guest) return;
    
    // For simplicity, we'll use prompt dialogs
    const name = prompt('Edit guest name:', guest.name);
    if (!name) return;
    
    const email = prompt('Edit guest email:', guest.email);
    if (!email) return;
    
    const phone = prompt('Edit guest phone:', guest.phone || '');
    
    const statusOptions = ['going', 'maybe', 'pending', 'not-going'];
    const statusIndex = prompt(`Edit RSVP status (0: Going, 1: Maybe, 2: Pending, 3: Not Going):`, 
        statusOptions.indexOf(guest.rsvp));
    
    const status = statusOptions[statusIndex] || guest.rsvp;
    
    // Update guest
    const events = getAllEvents();
    const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
    const guestIndex = events[eventIndex].guests.findIndex(g => g.id === guestId);
    
    events[eventIndex].guests[guestIndex] = {
        ...guest,
        name,
        email,
        phone: phone || null,
        rsvp: status,
        rsvpDate: new Date().toISOString().split('T')[0] // Update RSVP date
    };
    
    // Save updated events
    saveEvents(events);
    
    // Refresh guest list and summary
    loadGuestList(currentEventId);
    updateRSVPSummary(currentEventId);
    
    alert(`${name}'s information has been updated.`);
}

// Remove guest
function removeGuest(eventId, guestId) {
    if (!confirm('Are you sure you want to remove this guest?')) return;
    
    const events = getAllEvents();
    const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
    
    if (eventIndex === -1) return;
    
    // Get guest name before removing
    const guest = events[eventIndex].guests.find(g => g.id === guestId);
    const guestName = guest ? guest.name : 'Guest';
    
    // Remove guest
    events[eventIndex].guests = events[eventIndex].guests.filter(g => g.id !== guestId);
    
    // Save updated events
    saveEvents(events);
    
    // Refresh guest list and summary
    loadGuestList(currentEventId);
    updateRSVPSummary(currentEventId);
    loadEventDetails(currentEventId);
    
    alert(`${guestName} has been removed from the guest list.`);
}

// Change guest RSVP status
function changeGuestStatus(eventId, guestId) {
    const event = getEventById(eventId);
    if (!event) return;
    
    const guest = event.guests.find(g => g.id === guestId);
    if (!guest) return;
    
    const statusOptions = ['going', 'maybe', 'not-going'];
    const status = prompt(`Change ${guest.name}'s RSVP status to:\n0: Going\n1: Maybe\n2: Not Going`);
    
    if (status === null) return;
    
    const newStatus = statusOptions[status] || 'pending';
    
    // Update guest status
    const events = getAllEvents();
    const eventIndex = events.findIndex(e => e.id === parseInt(eventId));
    const guestIndex = events[eventIndex].guests.findIndex(g => g.id === guestId);
    
    events[eventIndex].guests[guestIndex].rsvp = newStatus;
    events[eventIndex].guests[guestIndex].rsvpDate = new Date().toISOString().split('T')[0];
    
    // Save updated events
    saveEvents(events);
    
    // Refresh guest list and summary
    loadGuestList(currentEventId);
    updateRSVPSummary(currentEventId);
    
    alert(`${guest.name}'s RSVP status has been updated to ${capitalizeFirstLetter(newStatus)}.`);
}

// Send reminder to guest (simulated)
function sendReminder(eventId, guestId) {
    const event = getEventById(eventId);
    if (!event) return;
    
    const guest = event.guests.find(g => g.id === guestId);
    if (!guest) return;
    
    // In a real app, this would send an actual reminder
    alert(`A reminder has been sent to ${guest.name} for ${event.name}.`);
}

// Get RSVP status emoji
function getRSVPEmoji(status) {
    const emojiMap = {
        'going': '✅',
        'maybe': '❓',
        'pending': '⏳',
        'not-going': '❌'
    };
    
    return emojiMap[status] || '⏳';
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
} 