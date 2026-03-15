class PageAccueil extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentDay = 'aujourd-hui';
        this.storageKey = 'page-accueil-events';
        this.eventsData = this.loadEventsFromStorage();
    }

    async connectedCallback() {
        const timestamp = new Date().getTime();
        const [htmlResponse, cssResponse] = await Promise.all([
            fetch(`/pages/page-accueil/page-accueil.html?v=${timestamp}`),
            fetch(`/pages/page-accueil/page-accueil.css?v=${timestamp}`)
        ]);

        const html = await htmlResponse.text();
        const css = await cssResponse.text();

        this.shadowRoot.innerHTML = `
            <style>${css}</style>
            ${html}
        `;

        this.setupEventListeners();
        this.updateContent();
        
        // Listen for route changes
        this._hashChangeListener = () => this.updateContent();
        window.addEventListener('hashchange', this._hashChangeListener);
    }

    disconnectedCallback() {
        if (this._hashChangeListener) {
            window.removeEventListener('hashchange', this._hashChangeListener);
        }
    }

    setupEventListeners() {
        const navBtns = this.shadowRoot.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.hash = btn.getAttribute('href');
            });
        });
    }

    loadEventsFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error loading events from localStorage:', e);
                return this.getDefaultEventsData();
            }
        }
        return this.getDefaultEventsData();
    }

    saveEventsToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.eventsData));
        } catch (e) {
            console.error('Error saving events to localStorage:', e);
        }
    }

    getDefaultEventsData() {
        return {
            'aujourd-hui': {
                date: 'Dimanche 15 Mars',
                year: '2026',
                time: '21:42',
                weather: null,
                events: [
                    { icon: '🍽️', time: '09:00', title: 'Petit-déjeuner', desc: 'Cuisine - Préparer le petit-déjeuner ensemble', type: 'meal' },
                    { icon: '🎨', time: '10:30', title: 'Activité Créative', desc: 'Dessin ou peinture', type: 'activity' },
                    { icon: '💊', time: '11:30', title: 'Médicaments', desc: 'Prendre les médicaments du matin', type: 'medication' },
                    { icon: '👥', time: '14:00', title: 'Visite - Sophie', desc: 'Visite de Sophie l\'après-midi', type: 'visit' },
                    { icon: '📺', time: '17:00', title: 'Émission TV', desc: 'Regarder son émission préférée', type: 'activity' },
                    { icon: '🍽️', time: '19:00', title: 'Dîner', desc: 'Dîner en famille', type: 'meal' }
                ]
            },
            'hier': {
                date: 'Samedi 14 Mars',
                year: '2026',
                time: '21:42',
                weather: null,
                events: [
                    { icon: '🍽️', time: '09:30', title: 'Petit-déjeuner', desc: 'Repas du matin', type: 'meal' },
                    { icon: '🚶', time: '10:00', title: 'Promenade', desc: 'Promenade au parc avec Jean', type: 'activity' },
                    { icon: '🍽️', time: '12:00', title: 'Déjeuner', desc: 'Déjeuner au restaurant', type: 'meal' },
                    { icon: '🧩', time: '15:00', title: 'Activité - Puzzle', desc: 'Activité puzzle en famille', type: 'activity' },
                    { icon: '🃏', time: '16:30', title: 'Jeux de Cartes', desc: 'Jouer aux cartes avec des amis', type: 'activity' },
                    { icon: '💊', time: '18:00', title: 'Médicaments', desc: 'Prendre les médicaments du soir', type: 'medication' },
                    { icon: '🍽️', time: '19:30', title: 'Dîner', desc: 'Repas du soir', type: 'meal' }
                ]
            },
            'demain': {
                date: 'Lundi 16 Mars',
                year: '2026',
                time: '21:42',
                weather: { icon: '⛅', temp: '15°C', text: 'Partiellement nuageux', location: '📍 Paris' },
                events: [
                    { icon: '🍽️', time: '09:00', title: 'Petit-déjeuner', desc: 'Repas du matin', type: 'meal' },
                    { icon: '🌱', time: '09:45', title: 'Jardinage', desc: 'Activités légères au jardin', type: 'activity' },
                    { icon: '👨‍⚕️', time: '10:30', title: 'RDV Médecin', desc: 'Visite médicale - 15 min de route', type: 'medical' },
                    { icon: '🍽️', time: '13:00', title: 'Déjeuner', desc: 'Repas de midi', type: 'meal' },
                    { icon: '📖', time: '14:30', title: 'Lecture', desc: 'Lire le journal ou un bon livre', type: 'activity' },
                    { icon: '📞', time: '16:00', title: 'Appel vidéo familial', desc: 'Appel avec la famille', type: 'visit' },
                    { icon: '📺', time: '18:00', title: 'Émission TV', desc: 'Moment détente devant la télé', type: 'activity' },
                    { icon: '🍽️', time: '19:30', title: 'Dîner', desc: 'Repas du soir', type: 'meal' }
                ]
            }
        };
    }

    updateContent() {
        const hash = window.location.hash;
        const navBtns = this.shadowRoot.querySelectorAll('.nav-btn');
        const contentContainer = this.shadowRoot.getElementById('day-content');
        
        this.currentDay = "aujourd-hui";
        if (hash.includes("/hier")) this.currentDay = "hier";
        if (hash.includes("/demain")) this.currentDay = "demain";

        // Update active class on nav buttons
        navBtns.forEach(btn => {
            const href = btn.getAttribute('href');
            if (
                (this.currentDay === 'hier' && href.endsWith('/hier')) ||
                (this.currentDay === 'demain' && href.endsWith('/demain')) ||
                (this.currentDay === 'aujourd-hui' && href === '#/accueil')
            ) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.renderDayContent(contentContainer);
    }

    renderDayContent(container) {
        const dayData = this.eventsData[this.currentDay];
        container.innerHTML = this.generateDayHTML(dayData);
    }

    generateDayHTML(dayData) {
        const weatherHTML = dayData.weather ? `
            <div class="weather-card">
                <div class="sun-icon">${dayData.weather.icon}</div>
                <h2 class="temp">${dayData.weather.temp}</h2>
                <p class="weather-text">${dayData.weather.text}</p>
                <p class="location">${dayData.weather.location}</p>
            </div>
        ` : '';

        const eventsHTML = dayData.events.map(event => `
            <div class="event-card event-${event.type}">
                <div class="event-icon">${event.icon}</div>
                <div class="event-time">${event.time}</div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${event.desc}</p>
                </div>
            </div>
        `).join('');

        return `
            <div class="top-cards">
                <div class="date-card">
                    <h2 class="time">${dayData.time}</h2>
                    <p class="date">${dayData.date}</p>
                    <p class="year">${dayData.year}</p>
                </div>
                ${weatherHTML}
            </div>
            <div class="calendar-section">
                <h3 class="calendar-title">Programme du ${this.getDayLabel()}</h3>
                <div class="events-list">
                    ${eventsHTML}
                </div>
            </div>
        `;
    }

    getDayLabel() {
        const labels = {
            'aujourd-hui': 'jour',
            'hier': 'jour d\'hier',
            'demain': 'jour de demain'
        };
        return labels[this.currentDay];
    }

    // Methods to manage events
    addEvent(day, event) {
        if (this.eventsData[day] && this.eventsData[day].events) {
            this.eventsData[day].events.push(event);
            this.saveEventsToStorage();
            this.renderDayContent(this.shadowRoot.getElementById('day-content'));
        }
    }

    removeEvent(day, index) {
        if (this.eventsData[day] && this.eventsData[day].events && index >= 0) {
            this.eventsData[day].events.splice(index, 1);
            this.saveEventsToStorage();
            this.renderDayContent(this.shadowRoot.getElementById('day-content'));
        }
    }

    updateEvent(day, index, updatedEvent) {
        if (this.eventsData[day] && this.eventsData[day].events && index >= 0) {
            this.eventsData[day].events[index] = { ...this.eventsData[day].events[index], ...updatedEvent };
            this.saveEventsToStorage();
            this.renderDayContent(this.shadowRoot.getElementById('day-content'));
        }
    }

    getEvents(day) {
        return this.eventsData[day]?.events || [];
    }
}

customElements.define('page-accueil', PageAccueil);