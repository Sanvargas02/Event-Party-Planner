document.addEventListener('DOMContentLoaded', function() {
    // Obtener el índice del evento desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventIndex = parseInt(urlParams.get('event'));
    
    if (isNaN(eventIndex)) {
        alert('No event selected');
        window.location.href = '../home-page/index.html';
        return;
    }
    
    // Obtener el evento desde localStorage
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events[eventIndex];
    
    if (!event) {
        alert('Event not found');
        window.location.href = '../home-page/index.html';
        return;
    }
    
    // Mostrar los detalles del evento
    document.getElementById('event-name').textContent = event.name;
    document.getElementById('event-type').textContent = event.type || 'Not specified';
    document.getElementById('event-date').textContent = event.date || 'Not specified';
    document.getElementById('event-time').textContent = event.time || 'Not specified';
    document.getElementById('event-location').textContent = event.location || 'Not specified';
    document.getElementById('event-description').textContent = event.description || 'No description provided';
    document.getElementById('max-guests').textContent = event.maxGuests || 'No limit';
    
    // Mostrar información de invitados
    const guests = JSON.parse(localStorage.getItem('guests_' + event.name) || '[]');
    const going = guests.filter(g => g.status === 'going').length;
    const maybe = guests.filter(g => g.status === 'maybe').length;
    const pending = guests.filter(g => g.status === 'pending').length;
    const notGoing = guests.filter(g => g.status === 'not-going').length;
    const total = guests.length;
    
    document.getElementById('guest-info').textContent = 
        `${total} total guests (${going} going, ${maybe} maybe, ${pending} pending${notGoing > 0 ? ', ' + notGoing + ' not going' : ''})`;
    
    // Botón para editar el evento
    document.getElementById('edit-event-btn').addEventListener('click', function() {
        window.location.href = `../event-edit/event-edit.html?event=${eventIndex}`;
    });
}); 