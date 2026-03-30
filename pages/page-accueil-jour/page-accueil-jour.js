// Day View Class
class DayView {
    constructor(eventsData, currentDay = 'aujourd-hui') {
        this.eventsData = eventsData;
        this.currentDay = currentDay;
    }

    generateHTML() {
        const dayData = this.eventsData[this.currentDay];
        
        const weatherHTML = dayData.weather ? `
            <div class="weather-card">
                <div class="sun-icon">${dayData.weather.icon}</div>
                <h2 class="temp">${dayData.weather.temp}</h2>
                <p class="weather-text">${dayData.weather.text}</p>
                <p class="location">${dayData.weather.location}</p>
            </div>
        ` : '';

        // Ensure events have an importance numeric field: 0=low,1=medium,2=high
        const eventsWithImportance = (dayData.events || []).map(ev => {
            if (typeof ev.importance === 'number') return ev;
            // default importance by type
            const typeImportance = {
                'medical': 2,
                'medication': 2,
                'visit': 1,
                'meal': 1,
                'activity': 1
            };
            return { ...ev, importance: typeImportance[ev.type] ?? 0 };
        });

        const eventsHTML = eventsWithImportance.map(event => `
            <div class="event-card event-${event.type}">
                <div class="event-icon">${event.icon}</div>
                <div class="event-time">${event.time}</div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${event.desc}</p>
                </div>
            </div>
        `).join('');

        const dayKeys = ['hier', 'aujourd-hui', 'demain'];
        const daysListHTML = dayKeys.map(key => {
            const d = this.eventsData[key] || { date: '', events: [] };
            const label = key === 'aujourd-hui' ? 'Aujourd\'hui' : (key === 'hier' ? 'Hier' : 'Demain');
            return `
                <div class="day-item" data-day="${key}">
                    <div class="day-label">${label}</div>
                    <div class="day-meta">${d.date ? d.date.split(' ')[0] : ''}<br><small>${d.events.length} activité${d.events.length > 1 ? 's' : ''}</small></div>
                </div>
            `;
        }).join('');

        const topCardsHTML = `
            <div class="top-cards">
                <div class="date-card">
                    <h2 class="time">${dayData.time}</h2>
                    <p class="date">${dayData.date}</p>
                    <p class="year">${dayData.year}</p>
                </div>
                ${weatherHTML}
            </div>
        `;

        const daysSidebarHTML = `
            <div class="days-sidebar">
                ${daysListHTML}
            </div>
        `;

        const mainHTML = `
            ${topCardsHTML}
            <div class="calendar-section">
                <h3 class="calendar-title">Programme du ${this.getDayLabel()}</h3>
                <div class="events-list">
                    ${eventsHTML}
                </div>
            </div>
            ${daysSidebarHTML}
        `;

        return mainHTML;
    }

    getDayLabel() {
        const labels = {
            'aujourd-hui': 'jour',
            'hier': 'jour d\'hier',
            'demain': 'jour de demain'
        };
        return labels[this.currentDay];
    }
}

class PageAccueilJour extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentDay = 'aujourd-hui';
        this.eventsData = this.loadEventsData();
    }

    async connectedCallback() {
        // Load HTML template
        const timestamp = Date.now();
        const response = await fetch(`/pages/page-accueil-jour/page-accueil-jour.html?v=${timestamp}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const template = doc.querySelector('template');
        
        if (template) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            
            // Load CSS files
            const cssFiles = [
                `/pages/page-accueil-jour/page-accueil-jour-common.css?v=${timestamp}`,
                `/pages/page-accueil-jour/page-accueil-jour-day.css?v=${timestamp}`
            ];
            
            for (const cssFile of cssFiles) {
                const style = document.createElement('link');
                style.rel = 'stylesheet';
                style.href = cssFile;
                this.shadowRoot.appendChild(style);
            }
            
            this.setupEventListeners();
            this.render();
        }
    }

    loadEventsData() {
        const rawData = localStorage.getItem('calendarEvents');
        if (!rawData) return this.getDefaultData();
        try {
            return JSON.parse(rawData);
        } catch {
            return this.getDefaultData();
        }
    }

    getDefaultData() {
        return {
            'hier': {
                date: '22 Mars 2026',
                time: '08:30',
                year: 'Samedi',
                weather: { icon: '☀️', temp: '22°C', text: 'Ensoleillé', location: 'Paris' },
                events: [
                    { icon: '🎲', time: '08:00', title: 'Jeu de société', desc: 'Partie calme le matin', type: 'activity', importance: 2 },
                    { icon: '🍳', time: '12:00', title: 'Déjeuner', desc: 'Menu équilibré', type: 'meal', importance: 1 },
                    { icon: '🎨', time: '14:00', title: 'Activité créative', desc: 'Dessin ou peinture', type: 'activity', importance: 0 }
                ]
            },
            'aujourd-hui': {
                date: '23 Mars 2026',
                time: '09:45',
                year: 'Dimanche',
                weather: { icon: '⛅', temp: '20°C', text: 'Partiellement nuageux', location: 'Paris' },
                events: [
                    { icon: '🎵', time: '08:00', title: 'Musique douce', desc: 'Écouter des chansons préférées', type: 'activity', importance: 2 },
                    { icon: '🍴', time: '12:30', title: 'Repas en famille', desc: 'Déjeuner', type: 'meal', importance: 1 },
                    { icon: '🏃', time: '15:00', title: 'Promenade', desc: '30 minutes', type: 'activity', importance: 0 },
                    { icon: '👨‍⚕️', time: '16:00', title: 'Visite médicale', desc: 'Consultation générale', type: 'medical', importance: 2 },
                    { icon: '🎥', time: '18:00', title: 'Regarder un film', desc: 'Comédie', type: 'activity', importance: 0 },
                    { icon: '🍽️', time: '19:30', title: 'Dîner', desc: 'Pâtes', type: 'meal', importance: 1 }
                ]
            },
            'demain': {
                date: '24 Mars 2026',
                time: '07:15',
                year: 'Lundi',
                weather: { icon: '🌧️', temp: '18°C', text: 'Pluie', location: 'Paris' },
                events: [
                    { icon: '�', time: '08:00', title: 'Lecture tranquille', desc: 'Lire un livre ou le journal', type: 'activity', importance: 2 },
                    { icon: '🍳', time: '12:00', title: 'Déjeuner', desc: 'Légumes', type: 'meal', importance: 1 },
                    { icon: '🧘', time: '14:00', title: 'Séance de yoga', desc: '1 heure', type: 'activity', importance: 0 }
                ]
            }
        };
    }

    setupEventListeners() {
        const sr = this.shadowRoot;

        // View switching buttons
        sr.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                window.location.hash = `#/accueil/${view}`;
            });
        });

        // Day navigation
        sr.querySelector('.prev-day')?.addEventListener('click', () => {
            this.currentDay = 'hier';
            this.render();
        });
        sr.querySelector('.curr-day')?.addEventListener('click', () => {
            this.currentDay = 'aujourd-hui';
            this.render();
        });
        sr.querySelector('.next-day')?.addEventListener('click', () => {
            this.currentDay = 'demain';
            this.render();
        });

        // Day sidebar clicks
        sr.querySelectorAll('.day-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentDay = item.dataset.day;
                this.render();
            });
        });

        // Highlight active view button
        this.updateActiveViewButton();
    }

    updateActiveViewButton() {
        const sr = this.shadowRoot;
        sr.querySelectorAll('.view-btn').forEach(btn => {
            if (btn.dataset.view === 'jour') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    render() {
        const contentContainer = this.shadowRoot.getElementById('day-content');
        if (!contentContainer) return;

        const dayView = new DayView(this.eventsData, this.currentDay);
        contentContainer.innerHTML = dayView.generateHTML();
        
        // Attach modal listeners to day items
        this.attachDayItemListeners();
    }

    attachDayItemListeners() {
        const sr = this.shadowRoot;
        sr.querySelectorAll('.day-item').forEach(item => {
            item.addEventListener('click', () => {
                const dayKey = item.dataset.day;
                this.currentDay = dayKey;
                this.render();
            });
        });
    }
}

customElements.define('page-accueil-jour', PageAccueilJour);
