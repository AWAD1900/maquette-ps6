// Month View Class
class MonthView {
    constructor(eventsData, monthOffset = 0) {
        this.eventsData = eventsData;
        this.monthOffset = monthOffset;
    }

    generateHTML() {
        const baseDate = new Date(2026, 2, 15); // 15 mars 2026
        const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + this.monthOffset, 1);
        const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        const firstDayOfWeek = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).getDay();
        
        const monthName = targetDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + 
                         targetDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).slice(1);
        
        const weeks = [];
        let currentWeek = new Array(firstDayOfWeek).fill(null);
        
        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }
        
        const dayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        
        let html = `
            <div class="month-view">
                <h3 class="month-title">${monthName}</h3>
                <div class="month-grid">
                    <div class="month-weekdays">
                        ${dayLabels.map(day => `<div class="month-weekday">${day}</div>`).join('')}
                    </div>
                    <div class="month-days">
        `;
        
        weeks.forEach((week) => {
            week.forEach((day) => {
                if (!day) {
                    html += '<div class="month-day empty"></div>';
                } else {
                    const isToday = day === 15 && this.monthOffset === 0;
                    const hasEvents = (day === 15 || day === 16) && this.monthOffset === 0;
                    const dayData = (day === 15 && this.monthOffset === 0) ? this.eventsData['aujourd-hui'] : 
                                   (day === 16 && this.monthOffset === 0) ? this.eventsData['demain'] : 
                                   this.eventsData['aujourd-hui'];
                    
                    html += `
                        <div class="month-day ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
                            <div class="month-day-number">${day}</div>
                            <div class="month-day-events">
                                ${dayData.events.slice(0, 2).map(event => `
                                    <div class="month-event event-${event.type}" title="${event.title}">
                                        ${event.icon}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            });
        });
        
        html += `
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    getMonthLabel() {
        const baseDate = new Date(2026, 2, 15);
        const targetDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + this.monthOffset, 1);
        const monthStr = targetDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        return monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
    }
}

class PageAccueilMois extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.monthOffset = 0;
        this.eventsData = this.loadEventsData();
    }

    async connectedCallback() {
        // Load HTML template
        const timestamp = Date.now();
        const response = await fetch(`/pages/page-accueil-mois/page-accueil-mois.html?v=${timestamp}`);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const template = doc.querySelector('template');
        
        if (template) {
            this.shadowRoot.appendChild(template.content.cloneNode(true));
            
            // Load CSS files
            const cssFiles = [
                `/pages/page-accueil-mois/page-accueil-mois-common.css?v=${timestamp}`,
                `/pages/page-accueil-mois/page-accueil-mois-month.css?v=${timestamp}`
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

        // Month navigation
        sr.querySelector('.prev-month')?.addEventListener('click', () => {
            this.monthOffset--;
            this.render();
        });
        sr.querySelector('.curr-month')?.addEventListener('click', () => {
            this.monthOffset = 0;
            this.render();
        });
        sr.querySelector('.next-month')?.addEventListener('click', () => {
            this.monthOffset++;
            this.render();
        });

        // Highlight active view button
        this.updateActiveViewButton();
    }

    updateActiveViewButton() {
        const sr = this.shadowRoot;
        sr.querySelectorAll('.view-btn').forEach(btn => {
            if (btn.dataset.view === 'mois') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    render() {
        const contentContainer = this.shadowRoot.getElementById('month-content');
        if (!contentContainer) return;

        const monthView = new MonthView(this.eventsData, this.monthOffset);
        contentContainer.innerHTML = monthView.generateHTML();
    }
}

customElements.define('page-accueil-mois', PageAccueilMois);
