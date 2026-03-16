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
}
