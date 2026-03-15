/**
 * Gestion du stockage et de la persistance des événements
 */
class CalendarEvents {
  constructor() {
    this.storageKey = "calendar_events";
    this.events = this._loadEvents();
  }

  /**
   * Charge les événements depuis localStorage
   */
  _loadEvents() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const events = stored ? JSON.parse(stored) : {};
      console.log("📦 Événements chargés du localStorage:", events);
      return events;
    } catch (error) {
      console.error("❌ Erreur lors du chargement du localStorage:", error);
      return {};
    }
  }

  /**
   * Sauvegarde les événements dans localStorage
   */
  saveEvents() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events));
      console.log("💾 Événements sauvegardés dans localStorage:", this.events);
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde dans localStorage:", error);
    }
  }

  /**
   * Récupère tous les événements d'un jour
   */
  getEventsForDate(dateStr) {
    return this.events[dateStr] || [];
  }

  /**
   * Ajoute un événement
   */
  addEvent(dateStr, event) {
    if (!this.events[dateStr]) {
      this.events[dateStr] = [];
    }
    this.events[dateStr].push(event);
    this.saveEvents();
  }

  /**
   * Modifie un événement
   */
  updateEvent(dateStr, index, event) {
    if (this.events[dateStr] && this.events[dateStr][index]) {
      this.events[dateStr][index] = event;
      this.saveEvents();
    }
  }

  /**
   * Supprime un événement
   */
  deleteEvent(dateStr, index) {
    if (this.events[dateStr]) {
      this.events[dateStr].splice(index, 1);
      this.saveEvents();
    }
  }

  /**
   * Filtre les événements par heure
   */
  getEventsForHour(dateStr, hour) {
    const dayEvents = this.getEventsForDate(dateStr);
    return dayEvents.filter(event => {
      const eventHour = CalendarUtils.getHourFromTime(event.time);
      return eventHour === hour;
    });
  }
}
