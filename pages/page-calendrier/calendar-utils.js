/**
 * Utilitaires pour la gestion des dates et du formatage
 */
class CalendarUtils {
  /**
   * Récupère la date d'aujourd'hui normalisée (00:00:00)
   */
  static getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Normalise une date (défini à 00:00:00)
   */
  static normalizeDate(date) {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Convertit une date en chaîne format YYYY-MM-DD
   */
  static dateToString(date) {
    const normalized = this.normalizeDate(date);
    return `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, "0")}-${String(normalized.getDate()).padStart(2, "0")}`;
  }

  /**
   * Vérifie si deux dates sont le même jour
   */
  static isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Formate l'heure au format français (HH h)
   */
  static formatTime(time) {
    if (!time) return "—";
    // Convertir de HH:mm à "HH h"
    const parts = time.split(":");
    if (parts.length >= 1) {
      return `${parts[0]} h`;
    }
    return time;
  }

  /**
   * Extrait l'heure d'une chaîne de temps (HH:mm)
   */
  static getHourFromTime(time) {
    if (!time) return -1;
    return parseInt(time.split(":")[0]);
  }

  /**
   * Formate un numéro d'heure au format français (HH h)
   */
  static hourToString(hour) {
    return `${String(hour).padStart(2, "0")} h`;
  }
}
