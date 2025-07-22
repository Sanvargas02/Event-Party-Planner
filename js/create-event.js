document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Obtener datos del formulario
        const event = {
            name: form['event-name'].value,
            type: form['event-type'].value,
            date: form['event-date'].value,
            time: form['event-time'].value,
            location: form['event-location'].value,
            description: form['event-description'].value,
            maxGuests: form['max-guests'].value
        };
        // Leer eventos existentes
        let events = JSON.parse(localStorage.getItem('events') || '[]');
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        // Redirigir al home
        window.location.href = '../home-page/index.html';
    });
}); 