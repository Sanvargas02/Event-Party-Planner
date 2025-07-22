// Common utility functions for the Party Planner application

// Local storage keys
const EVENTS_STORAGE_KEY = 'partyPlannerEvents';

// Sample event data structure
const sampleEvents = [
    {
        id: 1,
        name: "Sarah's Birthday Bash",
        type: "birthday",
        date: "2024-03-25",
        time: "19:00",
        location: "Community Center",
        description: "Come celebrate Sarah's 21st birthday!",
        maxGuests: 30,
        guests: [
            {
                id: 1,
                name: "John Smith",
                email: "john@email.com",
                phone: "(555) 123-4567",
                rsvp: "going",
                rsvpDate: "2024-03-18"
            },
            {
                id: 2,
                name: "Emma Wilson",
                email: "emma@email.com",
                phone: "(555) 987-6543",
                rsvp: "maybe",
                rsvpDate: "2024-03-19"
            },
            {
                id: 3,
                name: "Mike Johnson",
                email: "mike@email.com",
                phone: "(555) 456-7890",
                rsvp: "pending",
                rsvpDate: "2024-03-15"
            }
        ]
    },
    {
        id: 2,
        name: "Graduation Party",
        type: "graduation",
        date: "2024-04-15",
        time: "14:00",
        location: "University Park",
        description: "Celebrating our graduation!",
        maxGuests: 50,
        guests: [
            {
                id: 1,
                name: "Alex Brown",
                email: "alex@email.com",
                phone: "(555) 222-3333",
                rsvp: "going",
                rsvpDate: "2024-03-10"
            },
            {
                id: 2,
                name: "Jessica Lee",
                email: "jessica@email.com",
                phone: "(555) 444-5555",
                rsvp: "maybe",
                rsvpDate: "2024-03-12"
            }
        ]
    }
];

// Initialize events data in local storage if not present
function initializeEvents() {
    if (!localStorage.getItem(EVENTS_STORAGE_KEY)) {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(sampleEvents));
    }
}

// Get all events from local storage
function getAllEvents() {
    const events = localStorage.getItem(EVENTS_STORAGE_KEY);
    return events ? JSON.parse(events) : [];
}

// Get a specific event by ID
function getEventById(eventId) {
    const events = getAllEvents();
    return events.find(event => event.id === parseInt(eventId));
}

// Save events to local storage
function saveEvents(events) {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

// Delete an event
function deleteEvent(eventId) {
    const events = getAllEvents();
    const updatedEvents = events.filter(event => event.id !== parseInt(eventId));
    saveEvents(updatedEvents);
}

// Calculate days left until an event
function getDaysLeft(eventDate) {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    const timeDiff = eventDateTime - now;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Get RSVP counts for an event
function getRSVPCounts(eventId) {
    const event = getEventById(eventId);
    if (!event) return { going: 0, maybe: 0, pending: 0, notGoing: 0 };
    
    return {
        going: event.guests.filter(g => g.rsvp === 'going').length,
        maybe: event.guests.filter(g => g.rsvp === 'maybe').length,
        pending: event.guests.filter(g => g.rsvp === 'pending').length,
        notGoing: event.guests.filter(g => g.rsvp === 'not-going').length
    };
}

// Format date for display
function formatDate(dateString, timeString) {
    const date = new Date(`${dateString}T${timeString}`);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeEvents); 