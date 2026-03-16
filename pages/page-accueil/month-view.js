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
