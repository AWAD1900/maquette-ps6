// Day View Class
class DayView {
  constructor(eventsData, currentDay = "aujourd-hui") {
    this.eventsData = eventsData;
    this.currentDay = currentDay;
  }

  generateHTML() {
    const dayData = this.eventsData[this.currentDay];

    const eventsHTML = dayData.events
      .map(
        (event) => `
            <div class="event-card event-${event.type}">
                <div class="event-icon">${event.icon}</div>
                <div class="event-time">${event.time}</div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${event.desc}</p>
                </div>
            </div>
        `,
      )
      .join("");

    return `
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
      "aujourd-hui": "jour",
      hier: "jour d'hier",
      demain: "jour de demain",
    };
    return labels[this.currentDay];
  }
}

// Week View Class
class WeekView {
  constructor(eventsData, weekOffset = 0) {
    this.eventsData = eventsData;
    this.weekOffset = weekOffset;
  }

  generateHTML() {
    const jours = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];
    const today = new Date(2026, 2, 15); // 15 mars 2026 (dimanche)

    // Calculer le lundi de la semaine
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    // Appliquer le décalage de semaine
    monday.setDate(monday.getDate() + this.weekOffset * 7);

    let html = '<div class="week-view">';

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
      const isToday =
        date.toDateString() === new Date(2026, 2, 15).toDateString();

      // Déterminer quel jour correspond (hier/aujourd'hui/demain pour affichage)
      let dayKey = "aujourd-hui";
      if (i === 5) dayKey = "demain"; // samedi
      if (i === 6) dayKey = "demain"; // dimanche

      const dayData = this.eventsData[dayKey] || this.eventsData["aujourd-hui"];

      html += `
                <div class="week-day ${isToday ? "today" : ""}">
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

    html += "</div>";
    return html;
  }

  getEventsHTML(events) {
    if (events.length === 0) {
      return '<div class="week-empty">Pas d\'activités</div>';
    }

    const visibleEvents = events.slice(0, 5);
    const hiddenCount = events.length - 5;

    let html = visibleEvents
      .map(
        (event) => `
            <div class="week-event event-${event.type}">
                <div class="week-event-header">
                    <span class="week-event-time">${event.time}</span>
                    <span class="week-event-icon">${event.icon}</span>
                </div>
                <span class="week-event-title">${event.title}</span>
            </div>
        `,
      )
      .join("");

    if (hiddenCount > 0) {
      html += `<div class="week-more">+${hiddenCount} activité${hiddenCount > 1 ? "s" : ""}</div>`;
    }

    return html;
  }

  getDateRange() {
    const today = new Date(2026, 2, 15);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    monday.setDate(monday.getDate() + this.weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayStr = `${monday.getDate()} ${monday.toLocaleString("fr-FR", { month: "short" })}`;
    const sundayStr = `${sunday.getDate()} ${sunday.toLocaleString("fr-FR", { month: "short" })}`;

    return `Semaine du ${mondayStr} - ${sundayStr}`;
  }
}

// Month View Class
class MonthView {
  constructor(eventsData, monthOffset = 0) {
    this.eventsData = eventsData;
    this.monthOffset = monthOffset;
  }

  generateHTML() {
    const baseDate = new Date(2026, 2, 15); // 15 mars 2026
    const targetDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + this.monthOffset,
      1,
    );
    const daysInMonth = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfWeek = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1,
    ).getDay();

    const monthName =
      targetDate
        .toLocaleString("fr-FR", { month: "long", year: "numeric" })
        .charAt(0)
        .toUpperCase() +
      targetDate
        .toLocaleString("fr-FR", { month: "long", year: "numeric" })
        .slice(1);

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

    const dayLabels = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];

    let html = `
            <div class="month-view">
                <h3 class="month-title">${monthName}</h3>
                <div class="month-grid">
                    <div class="month-weekdays">
                        ${dayLabels.map((day) => `<div class="month-weekday">${day}</div>`).join("")}
                    </div>
                    <div class="month-days">
        `;

    weeks.forEach((week) => {
      week.forEach((day) => {
        if (!day) {
          html += '<div class="month-day empty"></div>';
        } else {
          const isToday = day === 15 && this.monthOffset === 0;
          const hasEvents =
            (day === 15 || day === 16) && this.monthOffset === 0;
          const dayData =
            day === 15 && this.monthOffset === 0
              ? this.eventsData["aujourd-hui"]
              : day === 16 && this.monthOffset === 0
                ? this.eventsData["demain"]
                : this.eventsData["aujourd-hui"];

          html += `
                        <div class="month-day ${isToday ? "today" : ""} ${hasEvents ? "has-events" : ""}">
                            <div class="month-day-number">${day}</div>
                            <div class="month-day-events">
                                ${dayData.events
                                  .slice(0, 2)
                                  .map(
                                    (event) => `
                                    <div class="month-event event-${event.type}" title="${event.title}">
                                        ${event.icon}
                                    </div>
                                `,
                                  )
                                  .join("")}
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
    const targetDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + this.monthOffset,
      1,
    );
    const monthStr = targetDate.toLocaleString("fr-FR", {
      month: "long",
      year: "numeric",
    });
    return monthStr.charAt(0).toUpperCase() + monthStr.slice(1);
  }
}

class PageAccueil extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.currentDay = "aujourd-hui";
    this.currentView = "jour"; // jour, semaine, mois
    this.storageKey = "page-accueil-events";
    this.eventsData = this.loadEventsFromStorage();

    // Navigation state
    this.weekOffset = 0; // 0 = current week, 1 = next week, -1 = previous week
    this.monthOffset = 0; // 0 = current month, 1 = next month, -1 = previous month
  }

  async connectedCallback() {
    const timestamp = new Date().getTime();
    const [
      htmlResponse,
      commonResponse,
      dayResponse,
      weekResponse,
      monthResponse,
    ] = await Promise.all([
      fetch(`/pages/page-accueil/page-accueil.html?v=${timestamp}`),
      fetch(
        `/pages/page-accueil/common/page-accueil-common.css?v=${timestamp}`,
      ),
      fetch(`/pages/page-accueil/day/page-accueil-day.css?v=${timestamp}`),
      fetch(`/pages/page-accueil/week/page-accueil-week.css?v=${timestamp}`),
      fetch(`/pages/page-accueil/month/page-accueil-month.css?v=${timestamp}`),
    ]);

    const html = await htmlResponse.text();
    const commonCss = await commonResponse.text();
    const dayCss = await dayResponse.text();
    const weekCss = await weekResponse.text();
    const monthCss = await monthResponse.text();

    this.shadowRoot.innerHTML = `
            <style>${commonCss}</style>
            <style>${dayCss}</style>
            <style>${weekCss}</style>
            <style>${monthCss}</style>
            ${html}
        `;

    this.setupEventListeners();
    this.updateContent();

    // Listen for route changes
    this._hashChangeListener = () => this.updateContent();
    window.addEventListener("hashchange", this._hashChangeListener);
  }

  disconnectedCallback() {
    if (this._hashChangeListener) {
      window.removeEventListener("hashchange", this._hashChangeListener);
    }
  }

  setupEventListeners() {
    // Navigation buttons
    const navBtns = this.shadowRoot.querySelectorAll(".nav-btn");
    navBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.hash = btn.getAttribute("href");
      });
    });

    // View selector buttons
    const viewBtns = this.shadowRoot.querySelectorAll(".view-btn");
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const view = btn.getAttribute("data-view");
        this.switchView(view);
      });
    });

    // Calendar navigation buttons (prev/next)
    const navPrevBtn = this.shadowRoot.querySelector(".nav-prev");
    const navNextBtn = this.shadowRoot.querySelector(".nav-next");

    if (navPrevBtn) {
      navPrevBtn.addEventListener("click", () => {
        if (this.currentView === "semaine") {
          this.weekOffset--;
          this.updateWeekNavigation();
        } else if (this.currentView === "mois") {
          this.monthOffset--;
          this.updateMonthNavigation();
        }
      });
    }

    if (navNextBtn) {
      navNextBtn.addEventListener("click", () => {
        if (this.currentView === "semaine") {
          this.weekOffset++;
          this.updateWeekNavigation();
        } else if (this.currentView === "mois") {
          this.monthOffset++;
          this.updateMonthNavigation();
        }
      });
    }
  }

  switchView(newView) {
    this.currentView = newView;

    // Reset navigation offsets when switching views
    this.weekOffset = 0;
    this.monthOffset = 0;

    // Update active button
    const viewBtns = this.shadowRoot.querySelectorAll(".view-btn");
    viewBtns.forEach((btn) => {
      if (btn.getAttribute("data-view") === newView) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update day navigation and calendar navigation visibility
    const dayNav = this.shadowRoot.getElementById("day-nav");
    const calendarNav = this.shadowRoot.getElementById("calendar-nav");

    if (newView === "jour") {
      dayNav.style.display = "flex";
      if (calendarNav) calendarNav.style.display = "none";
    } else {
      dayNav.style.display = "none";
      if (calendarNav) calendarNav.style.display = "flex";

      // Update the label for the new view
      if (newView === "semaine") {
        this.updateWeekNavigation();
      } else if (newView === "mois") {
        this.updateMonthNavigation();
      }
    }

    // Re-render content
    this.renderDayContent(this.shadowRoot.getElementById("day-content"));
  }

  loadEventsFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error loading events from localStorage:", e);
        return this.getDefaultEventsData();
      }
    }
    return this.getDefaultEventsData();
  }

  saveEventsToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.eventsData));
    } catch (e) {
      console.error("Error saving events to localStorage:", e);
    }
  }

  getDefaultEventsData() {
    return {
      "aujourd-hui": {
        date: "Dimanche 15 Mars",
        year: "2026",
        time: "21:42",
        weather: null,
        events: [
          {
            icon: "🍽️",
            time: "09:00",
            title: "Petit-déjeuner",
            desc: "Cuisine - Préparer le petit-déjeuner ensemble",
            type: "meal",
          },
          {
            icon: "🎨",
            time: "10:30",
            title: "Activité Créative",
            desc: "Dessin ou peinture",
            type: "activity",
          },
          {
            icon: "💊",
            time: "11:30",
            title: "Médicaments",
            desc: "Prendre les médicaments du matin",
            type: "medication",
          },
          {
            icon: "👥",
            time: "14:00",
            title: "Visite - Sophie",
            desc: "Visite de Sophie l'après-midi",
            type: "visit",
          },
          {
            icon: "📺",
            time: "17:00",
            title: "Émission TV",
            desc: "Regarder son émission préférée",
            type: "activity",
          },
          {
            icon: "🍽️",
            time: "19:00",
            title: "Dîner",
            desc: "Dîner en famille",
            type: "meal",
          },
        ],
      },
      hier: {
        date: "Samedi 14 Mars",
        year: "2026",
        time: "21:42",
        weather: null,
        events: [
          {
            icon: "🍽️",
            time: "09:30",
            title: "Petit-déjeuner",
            desc: "Repas du matin",
            type: "meal",
          },
          {
            icon: "🚶",
            time: "10:00",
            title: "Promenade",
            desc: "Promenade au parc avec Jean",
            type: "activity",
          },
          {
            icon: "🍽️",
            time: "12:00",
            title: "Déjeuner",
            desc: "Déjeuner au restaurant",
            type: "meal",
          },
          {
            icon: "🧩",
            time: "15:00",
            title: "Activité - Puzzle",
            desc: "Activité puzzle en famille",
            type: "activity",
          },
          {
            icon: "🃏",
            time: "16:30",
            title: "Jeux de Cartes",
            desc: "Jouer aux cartes avec des amis",
            type: "activity",
          },
          {
            icon: "💊",
            time: "18:00",
            title: "Médicaments",
            desc: "Prendre les médicaments du soir",
            type: "medication",
          },
          {
            icon: "🍽️",
            time: "19:30",
            title: "Dîner",
            desc: "Repas du soir",
            type: "meal",
          },
        ],
      },
      demain: {
        date: "Lundi 16 Mars",
        year: "2026",
        time: "21:42",
        weather: {
          icon: "⛅",
          temp: "15°C",
          text: "Partiellement nuageux",
          location: "📍 Paris",
        },
        events: [
          {
            icon: "🍽️",
            time: "09:00",
            title: "Petit-déjeuner",
            desc: "Repas du matin",
            type: "meal",
          },
          {
            icon: "🌱",
            time: "09:45",
            title: "Jardinage",
            desc: "Activités légères au jardin",
            type: "activity",
          },
          {
            icon: "👨‍⚕️",
            time: "10:30",
            title: "RDV Médecin",
            desc: "Visite médicale - 15 min de route",
            type: "medical",
          },
          {
            icon: "🍽️",
            time: "13:00",
            title: "Déjeuner",
            desc: "Repas de midi",
            type: "meal",
          },
          {
            icon: "📖",
            time: "14:30",
            title: "Lecture",
            desc: "Lire le journal ou un bon livre",
            type: "activity",
          },
          {
            icon: "📞",
            time: "16:00",
            title: "Appel vidéo familial",
            desc: "Appel avec la famille",
            type: "visit",
          },
          {
            icon: "📺",
            time: "18:00",
            title: "Émission TV",
            desc: "Moment détente devant la télé",
            type: "activity",
          },
          {
            icon: "🍽️",
            time: "19:30",
            title: "Dîner",
            desc: "Repas du soir",
            type: "meal",
          },
        ],
      },
    };
  }

  updateContent() {
    const hash = window.location.hash;
    const navBtns = this.shadowRoot.querySelectorAll(".nav-btn");
    const contentContainer = this.shadowRoot.getElementById("day-content");

    this.currentDay = "aujourd-hui";
    if (hash.includes("/hier")) this.currentDay = "hier";
    if (hash.includes("/demain")) this.currentDay = "demain";

    // Update active class on nav buttons
    navBtns.forEach((btn) => {
      const href = btn.getAttribute("href");
      if (
        (this.currentDay === "hier" && href.endsWith("/hier")) ||
        (this.currentDay === "demain" && href.endsWith("/demain")) ||
        (this.currentDay === "aujourd-hui" && href === "#/accueil")
      ) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    this.renderDayContent(contentContainer);
  }

  renderDayContent(container) {
    if (this.currentView === "jour") {
      const dayView = new DayView(this.eventsData, this.currentDay);
      container.innerHTML = dayView.generateHTML();
    } else if (this.currentView === "semaine") {
      const weekView = new WeekView(this.eventsData, this.weekOffset);
      container.innerHTML = weekView.generateHTML();
    } else if (this.currentView === "mois") {
      const monthView = new MonthView(this.eventsData, this.monthOffset);
      container.innerHTML = monthView.generateHTML();
    }
  }

  updateWeekNavigation() {
    const weekView = new WeekView(this.eventsData, this.weekOffset);
    const navLabel = this.shadowRoot.querySelector(".nav-label");
    if (navLabel) {
      navLabel.textContent = weekView.getDateRange();
    }

    // Re-render content
    this.renderDayContent(this.shadowRoot.getElementById("day-content"));
  }

  updateMonthNavigation() {
    const monthView = new MonthView(this.eventsData, this.monthOffset);
    const navLabel = this.shadowRoot.querySelector(".nav-label");
    if (navLabel) {
      navLabel.textContent = monthView.getMonthLabel();
    }

    // Re-render content
    this.renderDayContent(this.shadowRoot.getElementById("day-content"));
  }

  // Methods to manage events
  addEvent(day, event) {
    if (this.eventsData[day] && this.eventsData[day].events) {
      this.eventsData[day].events.push(event);
      this.saveEventsToStorage();
      this.renderDayContent(this.shadowRoot.getElementById("day-content"));
    }
  }

  removeEvent(day, index) {
    if (this.eventsData[day] && this.eventsData[day].events && index >= 0) {
      this.eventsData[day].events.splice(index, 1);
      this.saveEventsToStorage();
      this.renderDayContent(this.shadowRoot.getElementById("day-content"));
    }
  }

  updateEvent(day, index, updatedEvent) {
    if (this.eventsData[day] && this.eventsData[day].events && index >= 0) {
      this.eventsData[day].events[index] = {
        ...this.eventsData[day].events[index],
        ...updatedEvent,
      };
      this.saveEventsToStorage();
      this.renderDayContent(this.shadowRoot.getElementById("day-content"));
    }
  }

  getEvents(day) {
    return this.eventsData[day]?.events || [];
  }
}

customElements.define("page-accueil", PageAccueil);
