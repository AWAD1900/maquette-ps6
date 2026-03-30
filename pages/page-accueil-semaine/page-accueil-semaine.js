// Week View Class
class WeekView {
    constructor(eventsData, weekOffset = 0) {
        this.eventsData = eventsData;
        this.weekOffset = weekOffset;
    }

    generateHTML() {
        const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const today = new Date(2026, 2, 15); // 15 mars 2026 (dimanche)
        
        // Calculer le lundi de la semaine
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        
        // Appliquer le décalage de semaine
        monday.setDate(monday.getDate() + (this.weekOffset * 7));
        
        let html = '<div class="week-view">';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const isToday = date.toDateString() === new Date(2026, 2, 15).toDateString();
            
            // Déterminer quel jour correspond (hier/aujourd'hui/demain pour affichage)
            let dayKey = 'aujourd-hui';
            if (i === 5) dayKey = 'demain'; // samedi
            if (i === 6) dayKey = 'demain'; // dimanche
            
            const dayData = this.eventsData[dayKey] || this.eventsData['aujourd-hui'];
            
            html += `
                <div class="week-day ${isToday ? 'today' : ''}">
                    <div class="week-day-header">
                        <h4>${jours[i]}</h4>
                        <p class="date">${formattedDate}</p>
                    </div>
                    <div class="week-day-events">
                        ${this.getEventsHTML(dayData.events)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }

    getEventsHTML(events) {
        if (events.length === 0) {
            return '<div class="week-empty">Pas d\'activités</div>';
        }

        // Week view should show medium+ importance events (importance >= 1)
        const filtered = events.filter(ev => (typeof ev.importance === 'number' ? ev.importance : 0) >= 1);
        const visibleEvents = filtered.slice(0, 2);
        const hiddenCount = Math.max(0, filtered.length - 2);

        let html = visibleEvents.map(event => `
            <div class="week-event event-${event.type}">
                <div class="week-event-header">
                    <span class="week-event-time">${event.time}</span>
                    <span class="week-event-icon">${event.icon}</span>
                </div>
                <span class="week-event-title">${event.title}</span>
            </div>
        `).join('');

        if (hiddenCount > 0) {
            html += `<div class="week-more">+${hiddenCount} activité${hiddenCount > 1 ? 's' : ''}</div>`;
        }

        return html;
    }

    getDateRange() {
        const today = new Date(2026, 2, 15);
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        
        monday.setDate(monday.getDate() + (this.weekOffset * 7));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const mondayStr = `${monday.getDate()} ${monday.toLocaleString('fr-FR', { month: 'short' })}`;
        const sundayStr = `${sunday.getDate()} ${sunday.toLocaleString('fr-FR', { month: 'short' })}`;
        
        return `Semaine du ${mondayStr} - ${sundayStr}`;
    }
}

class PageAccueilSemaine extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.weekOffset = 0;
        this.eventsData = this.loadEventsData();
    }

    async connectedCallback() {
        // Load HTML template
        const timestamp = Date.now();
        const response = await fetch(`/pages/page-accueil-semaine/page-accueil-semaine.html?v=${timestamp}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const template = doc.querySelector('template');
        
        if (template) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            
            // Load CSS files
            const cssFiles = [
                `/pages/page-accueil-semaine/page-accueil-semaine-common.css?v=${timestamp}`,
                `/pages/page-accueil-semaine/page-accueil-semaine-week.css?v=${timestamp}`
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

        // Week navigation
        sr.querySelector('.prev-week')?.addEventListener('click', () => {
            this.weekOffset--;
            this.render();
        });
        sr.querySelector('.curr-week')?.addEventListener('click', () => {
            this.weekOffset = 0;
            this.render();
        });
        sr.querySelector('.next-week')?.addEventListener('click', () => {
            this.weekOffset++;
            this.render();
        });

        // Highlight active view button
        this.updateActiveViewButton();
    }

    updateActiveViewButton() {
        const sr = this.shadowRoot;
        sr.querySelectorAll('.view-btn').forEach(btn => {
            if (btn.dataset.view === 'semaine') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    render() {
        const contentContainer = this.shadowRoot.getElementById('week-content');
        if (!contentContainer) return;

        const weekView = new WeekView(this.eventsData, this.weekOffset);
        contentContainer.innerHTML = weekView.generateHTML();
    }
}

customElements.define('page-accueil-semaine', PageAccueilSemaine);
