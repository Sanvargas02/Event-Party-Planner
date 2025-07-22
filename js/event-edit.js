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
    
    // Llenar el formulario con los datos del evento
    const form = document.getElementById('edit-event-form');
    form['event-name'].value = event.name;
    form['event-type'].value = event.type;
    form['event-date'].value = event.date;
    form['event-time'].value = event.time;
    form['event-location'].value = event.location;
    form['event-description'].value = event.description || '';
    form['max-guests'].value = event.maxGuests || '';
    
    // Manejar el envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener los datos actualizados
        const updatedEvent = {
            name: form['event-name'].value,
            type: form['event-type'].value,
            date: form['event-date'].value,
            time: form['event-time'].value,
            location: form['event-location'].value,
            description: form['event-description'].value,
            maxGuests: form['max-guests'].value
        };
        
        // Actualizar el evento en localStorage
        events[eventIndex] = updatedEvent;
        localStorage.setItem('events', JSON.stringify(events));
        
        // Si el nombre cambió, actualizar la clave de los invitados
        if (event.name !== updatedEvent.name) {
            const guests = JSON.parse(localStorage.getItem('guests_' + event.name) || '[]');
            localStorage.removeItem('guests_' + event.name);
            localStorage.setItem('guests_' + updatedEvent.name, JSON.stringify(guests));
        }
        
        alert('Event updated successfully!');
        window.location.href = '../home-page/index.html';
    });
}); 