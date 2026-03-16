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

        const visibleEvents = events.slice(0, 5);
        const hiddenCount = events.length - 5;

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
