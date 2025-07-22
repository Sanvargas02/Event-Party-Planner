// JavaScript for the home page (index.html)

document.addEventListener('DOMContentLoaded', function() {
    displayEvents();

    // Add event listeners for event actions
    document.addEventListener('click', function(event) {
        // Delete event button
        if (event.target.matches('button:contains("Delete")')) {
            const eventId = event.target.closest('li').dataset.eventId;
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(eventId);
                displayEvents(); // Refresh the display
            }
        }
    });
});

// Display all events on the home page
function displayEvents() {
    const events = getAllEvents();
    const eventsList = document.querySelector('section ul');
    
    // Clear current events
    eventsList.innerHTML = '';
    
    if (events.length === 0) {
        eventsList.innerHTML = '<li>No events found. Create a new event to get started!</li>';
        return;
    }
    
    // Sort events by date (closest first)
    events.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    
    // Add each event to the list
    events.forEach(event => {
        // Get RSVP counts
        const rsvpCounts = getRSVPCounts(event.id);
        
        // Calculate days left
        const daysLeft = getDaysLeft(event.date + 'T' + event.time);
        
        // Create event element
        const eventElement = document.createElement('li');
        eventElement.dataset.eventId = event.id;
        
        // Get event type emoji
        const eventEmoji = getEventEmoji(event.type);
        
        eventElement.innerHTML = `
            <h3>${eventEmoji} ${event.name}</h3>
            <p>📅 ${formatDate(event.date, event.time)}</p>
            <p>📍 ${event.location}</p>
            <p>👥 ${rsvpCounts.going} going, ${rsvpCounts.maybe} maybe, ${rsvpCounts.pending} pending</p>
            <p>⏰ ${daysLeft} days left${daysLeft <= 7 ? '!' : ''}</p>
            
            <div>
                <button onclick="viewEventDetails(${event.id})">
                    View Details
                </button>
                <button onclick="editEvent(${event.id})">
                    Edit Event
                </button>
                <button onclick="deleteEventHandler(${event.id})">
                    Delete
                </button>
            </div>
        `;
        
        eventsList.appendChild(eventElement);
    });
}

// Get emoji based on event type
function getEventEmoji(eventType) {
    const emojiMap = {
        'birthday': '🎂',
        'study': '📚',
        'social': '🎉',
        'graduation': '🎓',
        'game': '🎮'
    };
    
    return emojiMap[eventType] || '🎉';
}

// Handler functions for event actions
function viewEventDetails(eventId) {
    window.location.href = `../event-view-details/event-view-details.html?id=${eventId}`;
}

function editEvent(eventId) {
    window.location.href = `../event-edit/event-edit.html?id=${eventId}`;
}

function deleteEventHandler(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        deleteEvent(eventId);
        displayEvents(); // Refresh the display
    }
} 