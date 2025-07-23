document.addEventListener('DOMContentLoaded', function() {
    function calculateDaysLeft(eventDate) {
        const today = new Date();
        const event = new Date(eventDate);
        const diffTime = event - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return 'Event has passed';
        } else if (diffDays === 0) {
            return 'Today!';
        } else if (diffDays === 1) {
            return '1 day left';
        } else {
            return `${diffDays} days left`;
        }
    }

    function renderEvents() {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        const ul = document.querySelector('section ul');
        if (!ul) return;
        ul.innerHTML = '';
        if (events.length === 0) {
            ul.innerHTML = '<li>No upcoming events.</li>';
            return;
        }
        events.forEach((event, idx) => {
            // Obtener información de invitados para este evento
            const guests = JSON.parse(localStorage.getItem('guests_' + event.name) || '[]');
            const going = guests.filter(g => g.status === 'going').length;
            const maybe = guests.filter(g => g.status === 'maybe').length;
            const pending = guests.filter(g => g.status === 'pending').length;
            const notGoing = guests.filter(g => g.status === 'not-going').length;
            const total = guests.length;
            
            // Calcular días restantes
            const daysLeft = calculateDaysLeft(event.date);
            
            const li = document.createElement('li');
            li.classList.add('event-card');
            li.innerHTML = `
                <h3>${event.name}</h3>
                <p>${event.date} ${event.time}</p>
                <p>${event.location}</p>
                <p>Guests information: (${going} going, ${maybe} maybe, ${pending} pending${notGoing > 0 ? ', ' + notGoing + ' not going' : ''})</p>
                <p>${daysLeft}</p>
                <div>
                    <button class="view-details" data-idx="${idx}">View Details</button>
                    <button class="edit-event" data-idx="${idx}">Edit Event</button>
                    <button class="delete-event" data-idx="${idx}">Delete</button>
                </div>
            `;
            ul.appendChild(li);
        });
        
        // Asignar eventos a los botones
        ul.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                window.location.href = `../event-view-details/event-view-details.html?event=${idx}`;
            });
        });
        
        ul.querySelectorAll('.edit-event').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                window.location.href = `../event-edit/event-edit.html?event=${idx}`;
            });
        });
        
        // Asignar eventos a los botones Delete
        ul.querySelectorAll('.delete-event').forEach(btn => {
            btn.addEventListener('click', function() {
                if (window.confirm('Are you sure you want to delete this event?')) {
                    const idx = parseInt(this.getAttribute('data-idx'));
                    let events = JSON.parse(localStorage.getItem('events') || '[]');
                    const eventToDelete = events[idx];
                    // También eliminar los invitados asociados
                    localStorage.removeItem('guests_' + eventToDelete.name);
                    events.splice(idx, 1);
                    localStorage.setItem('events', JSON.stringify(events));
                    renderEvents();
                }
            });
        });
    }
    renderEvents();
}); 