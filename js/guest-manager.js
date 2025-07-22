// JavaScript for the guest manager page (guest-manager.html)

let currentEventId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Utilidades para localStorage
    function getEvents() {
        return JSON.parse(localStorage.getItem('events') || '[]');
    }
    function getGuests(eventName) {
        return JSON.parse(localStorage.getItem('guests_' + eventName) || '[]');
    }
    function setGuests(eventName, guests) {
        localStorage.setItem('guests_' + eventName, JSON.stringify(guests));
    }

    // Elementos
    const eventSelect = document.getElementById('event-select');
    const guestListUl = document.getElementById('guest-list-ul');
    const rsvpSection = document.getElementById('rsvp-summary-section');
    const form = document.querySelector('form');
    const cancelBtn = document.querySelector('a > button[type="button"]');
    const sendInvitationBtn = form.querySelector('button[type="button"], button:not([type])');
    const statusFilter = document.querySelector('#guest-list-section select');
    const searchInput = document.querySelector('#guest-list-section input[type="text"]');

    // Variables para filtros
    let currentStatusFilter = 'All';
    let currentSearchTerm = '';

    // Llenar select de eventos
    function renderEventOptions() {
        const events = getEvents();
        eventSelect.innerHTML = '';
        if (events.length === 0) {
            eventSelect.innerHTML = '<option value="">No events</option>';
            return;
        }
        events.forEach(ev => {
            const opt = document.createElement('option');
            opt.value = ev.name;
            opt.textContent = ev.name;
            eventSelect.appendChild(opt);
        });
    }

    // Aplicar filtros a la lista de invitados
    function applyFilters(guests) {
        let filteredGuests = guests;
        
        // Filtrar por status
        if (currentStatusFilter !== 'All') {
            filteredGuests = filteredGuests.filter(guest => guest.status === currentStatusFilter.toLowerCase());
        }
        
        // Filtrar por nombre
        if (currentSearchTerm) {
            filteredGuests = filteredGuests.filter(guest => 
                guest.name.toLowerCase().includes(currentSearchTerm.toLowerCase())
            );
        }
        
        return filteredGuests;
    }

    // Mostrar invitados del evento seleccionado
    function renderGuestList(eventName) {
        const allGuests = getGuests(eventName);
        const filteredGuests = applyFilters(allGuests);
        
        guestListUl.innerHTML = '';
        if (filteredGuests.length === 0) {
            guestListUl.innerHTML = '<li>No guests found for this filter.</li>';
            renderGuestTotals(eventName);
            return;
        }
        
        filteredGuests.forEach((guest, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="guest-view">
                    <h3>${guest.name}</h3>
                    <p>Phone: ${guest.phone || '-'} </p>
                    <p>Email: ${guest.email}</p>
                    <p>RSVP Status: <span>${guest.status}</span></p>
                    <button class="edit-guest" data-idx="${idx}">Edit</button>
                    <button class="remove-guest" data-idx="${idx}">Remove</button>
                    <button class="change-status-guest" data-idx="${idx}">Change Status</button>
                </div>
            `;
            guestListUl.appendChild(li);
        });
        
        // Botón Remove
        guestListUl.querySelectorAll('.remove-guest').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                let guests = getGuests(eventSelect.value);
                if (window.confirm('Are you sure you want to remove this guest?')) {
                    guests.splice(idx, 1);
                    setGuests(eventSelect.value, guests);
                    renderGuestList(eventSelect.value);
                    renderRSVPSummary(eventSelect.value);
                    renderGuestTotals(eventSelect.value);
                }
            });
        });
        
        // Botón Edit
        guestListUl.querySelectorAll('.edit-guest').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                let guests = getGuests(eventSelect.value);
                const guest = guests[idx];
                const li = this.closest('li');
                li.innerHTML = `
                    <div class="guest-edit">
                        <input type="text" class="edit-name" value="${guest.name}" placeholder="Name" required />
                        <input type="tel" class="edit-phone" value="${guest.phone || ''}" placeholder="Phone" />
                        <input type="email" class="edit-email" value="${guest.email}" placeholder="Email" required />
                        <select class="edit-status">
                            <option value="going" ${guest.status === 'going' ? 'selected' : ''}>Going</option>
                            <option value="maybe" ${guest.status === 'maybe' ? 'selected' : ''}>Maybe</option>
                            <option value="pending" ${guest.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="not-going" ${guest.status === 'not-going' ? 'selected' : ''}>Not going</option>
                        </select>
                        <button class="save-edit" data-idx="${idx}">Save</button>
                        <button class="cancel-edit">Cancel</button>
                    </div>
                `;
                // Guardar cambios
                li.querySelector('.save-edit').addEventListener('click', function() {
                    const newName = li.querySelector('.edit-name').value;
                    const newPhone = li.querySelector('.edit-phone').value;
                    const newEmail = li.querySelector('.edit-email').value;
                    const newStatus = li.querySelector('.edit-status').value;
                    if (!newName || !newEmail) {
                        alert('Name and Email are required');
                        return;
                    }
                    guests[idx] = { name: newName, phone: newPhone, email: newEmail, status: newStatus };
                    setGuests(eventSelect.value, guests);
                    renderGuestList(eventSelect.value);
                    renderRSVPSummary(eventSelect.value);
                    renderGuestTotals(eventSelect.value);
                });
                // Cancelar edición
                li.querySelector('.cancel-edit').addEventListener('click', function() {
                    renderGuestList(eventSelect.value);
                    renderGuestTotals(eventSelect.value);
                });
            });
        });
        
        // Botón Change Status
        guestListUl.querySelectorAll('.change-status-guest').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                let guests = getGuests(eventSelect.value);
                const guest = guests[idx];
                const li = this.closest('li');
                li.innerHTML = `
                    <div class="guest-status-edit">
                        <h3>${guest.name}</h3>
                        <select class="edit-status">
                            <option value="going" ${guest.status === 'going' ? 'selected' : ''}>Going</option>
                            <option value="maybe" ${guest.status === 'maybe' ? 'selected' : ''}>Maybe</option>
                            <option value="pending" ${guest.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="not-going" ${guest.status === 'not-going' ? 'selected' : ''}>Not going</option>
                        </select>
                        <button class="save-status" data-idx="${idx}">Save</button>
                        <button class="cancel-status">Cancel</button>
                    </div>
                `;
                // Guardar nuevo status
                li.querySelector('.save-status').addEventListener('click', function() {
                    const newStatus = li.querySelector('.edit-status').value;
                    guests[idx].status = newStatus;
                    setGuests(eventSelect.value, guests);
                    renderGuestList(eventSelect.value);
                    renderRSVPSummary(eventSelect.value);
                    renderGuestTotals(eventSelect.value);
                });
                // Cancelar cambio
                li.querySelector('.cancel-status').addEventListener('click', function() {
                    renderGuestList(eventSelect.value);
                    renderGuestTotals(eventSelect.value);
                });
            });
        });
        
        renderGuestTotals(eventName);
    }

    // Mostrar totales de invitados y respuestas
    function renderGuestTotals(eventName) {
        const guests = getGuests(eventName);
        const total = guests.length;
        const responded = guests.filter(g => g.status !== 'pending').length;
        const totalSpan = document.querySelector('h3 span');
        const responsesSpan = document.querySelector('h3 span + span');
        if (totalSpan && responsesSpan) {
            totalSpan.textContent = total;
            responsesSpan.textContent = responded;
        }
    }

    // Mostrar resumen RSVP
    function renderRSVPSummary(eventName) {
        const guests = getGuests(eventName);
        const going = guests.filter(g => g.status === 'going').length;
        const maybe = guests.filter(g => g.status === 'maybe').length;
        const pending = guests.filter(g => g.status === 'pending').length;
        const notGoing = guests.filter(g => g.status === 'not-going').length;
        const total = guests.length;
        rsvpSection.querySelector('h3:nth-of-type(1) span').textContent = going;
        rsvpSection.querySelector('h3:nth-of-type(2) span').textContent = maybe;
        rsvpSection.querySelector('h3:nth-of-type(3) span').textContent = pending;
        rsvpSection.querySelector('h3:nth-of-type(4) span').textContent = notGoing;
        const progress = rsvpSection.querySelector('progress');
        progress.value = going;
        progress.max = total > 0 ? total : 1;
        // Porcentaje dinámico
        let percent = total > 0 ? Math.round((going / total) * 100) : 0;
        rsvpSection.querySelector('progress').nextSibling.textContent = ` ${percent}% responded`;
    }

    // Al cambiar de evento
    eventSelect && eventSelect.addEventListener('change', function() {
        const eventName = eventSelect.value;
        renderGuestList(eventName);
        renderRSVPSummary(eventName);
        renderGuestTotals(eventName);
    });

    // Filtro por status
    statusFilter && statusFilter.addEventListener('change', function() {
        currentStatusFilter = this.value;
        if (eventSelect.value) {
            renderGuestList(eventSelect.value);
        }
    });

    // Filtro por búsqueda
    searchInput && searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value;
        if (eventSelect.value) {
            renderGuestList(eventSelect.value);
        }
    });

    // Al enviar el formulario de nuevo invitado
    form && form.addEventListener('submit', function(e) {
        e.preventDefault();
        const eventName = eventSelect.value;
        if (!eventName) return;
        const guest = {
            name: form['guest-name'].value,
            phone: form['guest-phone'].value,
            email: form['guest-email'].value,
            status: form['guest-status'].value
        };
        const guests = getGuests(eventName);
        guests.push(guest);
        setGuests(eventName, guests);
        renderGuestList(eventName);
        renderRSVPSummary(eventName);
        renderGuestTotals(eventName);
        form.reset();
    });

    // Botón Cancel Invitation limpia el formulario
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            form.reset();
        });
    }
    // Botón Send Invitation no hace nada
    if (sendInvitationBtn) {
        sendInvitationBtn.addEventListener('click', function(e) {
            e.preventDefault();
        });
    }

    // Inicializar
    renderEventOptions();
    if (eventSelect && eventSelect.value) {
        renderGuestList(eventSelect.value);
        renderRSVPSummary(eventSelect.value);
        renderGuestTotals(eventSelect.value);
    } else if (eventSelect && eventSelect.options.length > 0) {
        eventSelect.selectedIndex = 0;
        renderGuestList(eventSelect.value);
        renderRSVPSummary(eventSelect.value);
        renderGuestTotals(eventSelect.value);
    }
}); 