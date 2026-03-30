// Day View Class
class DayView {
  constructor(eventsData, currentDay = "aujourd-hui") {
    this.eventsData = eventsData;
    this.currentDay = currentDay;
    this.startHour = 7;
    this.endHour = 21;
    const hoursSpan = this.endHour - this.startHour;
    const viewportWidth =
      typeof window !== "undefined" && window.innerWidth
        ? window.innerWidth
        : 896; // valeur de repli
    // Calcule dynamiquement la largeur de la frise pour occuper l'écran
    this.pxPerHour = viewportWidth / hoursSpan;
    this.totalPx = (this.endHour - this.startHour) * this.pxPerHour;
  }

  generateHTML() {
    const dayData =
      this.eventsData[this.currentDay] || this.eventsData["aujourd-hui"];
    const events = this.normalizeEvents(dayData.events || []);
    const timeline = this.buildTimeline(events);
    // Pour le prochain rendez-vous, on peut aller chercher une activité
    // dans une journée proche (aujourd'hui ou demain) et afficher un
    // libellé simple comme "Bientôt" ou "Très bientôt" au lieu d'une heure.
    const nextEvent =
      this.currentDay === "aujourd-hui"
        ? this.getNextEventFromNearbyDays()
        : this.getNextEvent(events);

    return `
      <div class="cal-root">
        <div class="cal-header">
          <div class="cal-date-block">
            <div class="cal-weekday">${this.escapeHTML(this.getWeekdayLabel())}</div>
            <div class="cal-dayname">${this.escapeHTML(this.getDayNameLabel(dayData))}</div>
            <div class="cal-fulldate">${this.escapeHTML(this.getSubDateLabel())}</div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item"><span class="legend-dot" style="background:#7bbde0"></span>Médecin</div>
          <div class="legend-item"><span class="legend-dot" style="background:#f0a05a"></span>Repas</div>
          <div class="legend-item"><span class="legend-dot" style="background:#72c28a"></span>Activité</div>
          <div class="legend-item"><span class="legend-dot" style="background:#e88faa"></span>Visite</div>
        </div>

        <div class="section-label">Frise du jour</div>
        <div class="timeline-wrapper">
          <div class="timeline-inner">
            <div class="tl-hours-row" style="width:${this.totalPx}px;">
              ${timeline.hoursHTML}
            </div>
            <div class="tl-events-zone" style="width:${this.totalPx}px; height:${timeline.zoneHeight}px;">
              ${timeline.periodsHTML}
              ${timeline.hourLinesHTML}
              ${timeline.nowLineHTML}
              ${timeline.eventsHTML}
            </div>
          </div>
        </div>

        <div class="section-label">Prochain rendez-vous</div>
        <div class="next-event-card ${nextEvent ? nextEvent.cls : ""}">
          <span class="next-event-icon">${nextEvent ? this.escapeHTML(nextEvent.icon) : "🕓"}</span>
          <div class="next-event-body">
            <div class="next-event-title">${nextEvent ? this.escapeHTML(nextEvent.title) : "Aucun événement à venir"}</div>
            <div class="next-event-meta">${nextEvent ? this.escapeHTML(`${nextEvent.timeLabel} · ${nextEvent.sub}`) : "La journée est terminée"}</div>
          </div>
          <div class="next-event-countdown">
            <span class="countdown-num">${nextEvent ? this.escapeHTML(nextEvent.countdown) : "-"}</span>
            <span class="countdown-label">à venir</span>
          </div>
        </div>

        ${nextEvent && nextEvent.extraActivity ? `
        <div class="next-extra-activity">
          <span class="next-extra-icon">${this.escapeHTML(nextEvent.extraActivity.icon)}</span>
          <span class="next-extra-text">Bientôt : ${this.escapeHTML(nextEvent.extraActivity.title)}</span>
        </div>
        ` : ""}
      </div>
    `;
  }

  normalizeEvents(events) {
    const durations = {
      medication: 0.25,
      meal: 0.75,
      visit: 1.25,
      activity: 1,
      medical: 1,
    };

    const sorted = [...events].sort(
      (a, b) => this.parseHour(a.time) - this.parseHour(b.time),
    );
    const rowEndTimes = [];

    return sorted.map((event) => {
      const start = this.parseHour(event.time);
      const dur = durations[event.type] || 1;
      const end = Math.min(start + dur, this.endHour);

      let row = 0;
      while (rowEndTimes[row] && rowEndTimes[row] > start) {
        row++;
      }
      rowEndTimes[row] = end;

      return {
        ...event,
        start,
        dur,
        row,
        cls: this.getEventClass(event.type),
        done: !!event.done,
      };
    });
  }

  buildTimeline(events) {
    const now = this.getReferenceHour();
    const boundedNow = Math.max(this.startHour, Math.min(this.endHour, now));
    const currentHourMark = Math.round(boundedNow);
    // Bande unique pleine largeur pour la période actuelle (Matin / Après-midi / Soir ...)
    const currentPeriodLabel = this.formatHourCoarse(now);

    // Un seul bandeau centré, un peu moins large que la frise pour alléger visuellement
    const bandWidth = this.totalPx * 0.9;
    const bandLeft = (this.totalPx - bandWidth) / 2;
    const periodsHTML = `
      <div class="tl-period" style="left:${bandLeft}px; width:${bandWidth}px;">
        <span class="tl-period-label">${currentPeriodLabel}</span>
      </div>
    `;

    // Affiche aussi les différentes périodes (Matin / Midi / Après-midi / Soir / Nuit)
    // le long de la frise, en haut, sans répétition par heure
    const hoursHTML = [
      { label: "Matin", start: 6, end: 12 },
      { label: "Midi", start: 12, end: 15 },
      { label: "Après-midi", start: 15, end: 18 },
      { label: "Soir", start: 18, end: 22 },
      { label: "Nuit", start: 22, end: 24 },
    ]
      .map((p) => {
        const periodStart = Math.max(this.startHour, p.start);
        const periodEnd = Math.min(this.endHour, p.end);
        if (periodEnd <= periodStart) return "";
        const left = this.hToX(periodStart);
        const width = this.hToX(periodEnd) - this.hToX(periodStart);
        return `<div class="tl-period-label-top" style="left:${left}px; width:${width}px;"><span>${p.label}</span></div>`;
      })
      .join("");

    const hourLinesHTML = Array.from(
      { length: this.endHour - this.startHour + 1 },
      (_, i) => this.startHour + i,
    )
      .map(
        (hour) =>
          `<div class="tl-hour-line" style="left:${this.hToX(hour)}px;"></div>`,
      )
      .join("");

    const rowHeight = 100;
    const topOffset = 12;
    const rowCount = Math.max(2, ...events.map((event) => event.row + 1), 2);
    const zoneHeight = rowCount * rowHeight + topOffset;

    const eventsHTML = events
      .map((event) => {
        const left = this.hToX(event.start);
        const width = Math.max(event.dur * this.pxPerHour - 6, 88);
        const top = topOffset + event.row * rowHeight;
        const endHour = event.start + event.dur;
        return `
          <div class="tl-event ${event.cls}${event.done ? ' tl-event-done' : ''}" style="left:${left}px; width:${width}px; top:${top}px; height:88px;">
            <span class="tl-event-icon">${this.escapeHTML(event.icon)}</span>
            <span class="tl-event-title">${this.escapeHTML(event.title)}</span>
            <span class="tl-event-time">${this.formatHourCoarse(event.start)}</span>
            <span class="tl-event-sub">${this.escapeHTML(event.desc || "")}</span>
          </div>
        `;
      })
      .join("");

    const nowLineHTML =
      this.currentDay === "aujourd-hui"
        ? `
          <div class="tl-now-line" style="left:${this.hToX(boundedNow)}px;">
            <div class="tl-now-dot"></div>
            <div class="now-badge">${this.formatHourCoarse(boundedNow)}</div>
          </div>
        `
        : "";

    return {
      hoursHTML,
      periodsHTML,
      hourLinesHTML,
      nowLineHTML,
      eventsHTML,
      zoneHeight,
    };
  }

  getNextEvent(events) {
    const now = this.getReferenceHour();
    const future = events
      .filter((event) => event.start > now)
      .sort((a, b) => a.start - b.start);

    if (!future.length) {
      return null;
    }

    const next = future[0];
    const diffMin = Math.round((next.start - now) * 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffMins = diffMin % 60;

    let countdown = `${diffMins} min`;
    if (diffHours > 0) {
      countdown = `${diffHours}h${diffMins > 0 ? ` ${diffMins}min` : ""}`;
    }

    return {
      ...next,
      timeLabel: this.formatHourCoarse(next.start),
      sub: next.desc || "",
      countdown,
    };
  }

  // Prochain événement en regardant une journée proche (aujourd'hui / demain)
  // et en simplifiant l'indication temporelle ("Très bientôt", "Bientôt"...).
  getNextEventFromNearbyDays() {
    const dayOrder = ["aujourd-hui", "demain"]; // journées proches

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    const candidates = [];

    dayOrder.forEach((dayKey, index) => {
      const dayOffset = index; // 0 = aujourd'hui, 1 = demain
      const dayData = this.eventsData[dayKey];
      if (!dayData || !Array.isArray(dayData.events)) return;

      dayData.events.forEach((event) => {
        const start = this.parseHour(event.time);
        // différence en minutes entre maintenant et l'événement
        const diffMin = Math.round((dayOffset * 24 + (start - currentHour)) * 60);
        if (diffMin > 0) {
          candidates.push({ event, dayKey, start, dayOffset, diffMin });
        }
      });
    });

    if (!candidates.length) {
      return null;
    }

  // Choisir l'événement le plus proche dans le temps
  candidates.sort((a, b) => a.diffMin - b.diffMin);
  const best = candidates[0];

    const diffMin = best.diffMin;
    const diffHours = Math.floor(diffMin / 60);
    const remainingMin = diffMin % 60;

    let countdown = `${remainingMin} min`;
    if (diffHours > 0) {
      countdown = `${diffHours}h${remainingMin > 0 ? ` ${remainingMin}min` : ""}`;
    }

    // Libellé simplifié pour remplacer l'heure précise
    let timeLabel = "À venir";
    if (diffMin <= 60) {
      timeLabel = "Très bientôt";
    } else if (diffMin <= 3 * 60) {
      timeLabel = "Bientôt";
    } else if (best.dayOffset === 0) {
      timeLabel = "Dans la journée";
    } else if (best.dayOffset === 1) {
      timeLabel = "Demain";
    }

    const base = best.event;

    // Chercher une autre activité IMPORTANTE à venir (priorité aux rdv médicaux/visites),
    // pour l'afficher aussi dans la section.
    const isImportant = (ev) => ev.type === "medical" || ev.type === "visit";

    let extraActivity = null;
    // D'abord, on cherche un événement important (médecin / visite)
    for (let i = 1; i < candidates.length; i++) {
      const cand = candidates[i];
      if (cand.event && isImportant(cand.event)) {
        extraActivity = cand.event;
        break;
      }
    }

    // Sinon, on retombe sur une activité classique
    if (!extraActivity) {
      for (let i = 1; i < candidates.length; i++) {
        const cand = candidates[i];
        if (cand.event && cand.event.type === "activity") {
          extraActivity = cand.event;
          break;
        }
      }
    }

    return {
      icon: base.icon,
      title: base.title,
      sub: base.desc || "",
      timeLabel,
      countdown,
      cls: this.getEventClass(base.type),
      extraActivity: extraActivity
        ? {
            icon: extraActivity.icon,
            title: extraActivity.title,
            sub: extraActivity.desc || "",
            type: extraActivity.type,
          }
        : null,
    };
  }

  getReferenceHour() {
    if (this.currentDay === "hier") {
      return 24;
    }
    if (this.currentDay === "demain") {
      return 0;
    }
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }

  getEventClass(type) {
    const map = {
      medical: "evt-doctor",
      meal: "evt-meal",
      activity: "evt-walk",
      visit: "evt-birthday",
      medication: "evt-meds",
    };
    return map[type] || "evt-walk";
  }

  parseHour(timeValue) {
    if (!timeValue || !timeValue.includes(":")) {
      return this.startHour;
    }
    const [hh, mm] = timeValue.split(":").map((value) => Number(value));
    return hh + mm / 60;
  }

  formatHour(value) {
    const safeValue = Math.max(0, value);
    const hh = Math.floor(safeValue);
    const mm = Math.round((safeValue - hh) * 60);
    return `${String(hh).padStart(2, "0")}h${String(mm).padStart(2, "0")}`;
  }

  // Retourne un label grossier pour une heure donnée (Matin / Midi / Après-midi / Soir / Nuit)
  formatHourCoarse(value) {
    const safeValue = Math.max(0, value);
    const hh = Math.floor(safeValue) % 24;
    if (hh >= 6 && hh < 12) return "Matin";
    if (hh >= 12 && hh < 15) return "Midi";
    if (hh >= 15 && hh < 18) return "Après-midi";
    if (hh >= 18 && hh < 22) return "Soir";
    return "Nuit";
  }

  hToX(hour) {
    return (hour - this.startHour) * this.pxPerHour;
  }

  getWeekdayLabel() {
    const map = {
      "aujourd-hui": "Aujourd'hui",
      hier: "Hier",
      demain: "Demain",
    };
    return map[this.currentDay] || "Aujourd'hui";
  }

  getDayNameLabel(dayData) {
    const datePart = dayData.date || "Dimanche 15 Mars";
    return `${datePart} ${dayData.year || "2026"}`;
  }

  getSubDateLabel() {
    if (this.currentDay === "hier") {
      return "Vue journalière - jour précédent";
    }
    if (this.currentDay === "demain") {
      return "Vue journalière - jour suivant";
    }
    // Hide the 'Vue journalière' label for today to reduce clutter
    return "";
  }

  getGreeting() {
    if (this.currentDay === "hier") {
      return "Voici le résumé de la journée d'hier.";
    }
    if (this.currentDay === "demain") {
      return "Voici les rendez-vous prévus pour demain.";
    }
    return "";
  }

  escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
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

    // helper local pour transformer HH:mm -> label grossier
    const coarseFromTime = (time) => {
      if (!time) return "";
      const hh = Number(time.split(":")[0]);
      if (hh >= 6 && hh < 12) return "Matin";
      if (hh >= 12 && hh < 15) return "Midi";
      if (hh >= 15 && hh < 18) return "Après-midi";
      if (hh >= 18 && hh < 22) return "Soir";
      return "Nuit";
    };

    let html = visibleEvents
      .map(
        (event) => `
            <div class="week-event event-${event.type}">
                <div class="week-event-header">
                    <span class="week-event-time">${coarseFromTime(event.time)}</span>
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
      if (dayNav) dayNav.style.display = "flex";
      if (calendarNav) calendarNav.style.display = "none";
    } else {
      if (dayNav) dayNav.style.display = "none";
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
            icon: "📝",
            time: "08:00",
            title: "Tâche faite",
            desc: "Activité déjà réalisée",
            type: "activity",
            done: true,
          },
          {
            icon: "🍽️",
            time: "09:00",
            title: "Petit-déjeuner",
            desc: "Repas du matin",
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
            icon: "🎲",
            time: "11:30",
            title: "Jeu de société",
            desc: "Moment ludique en famille",
            type: "activity",
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
            icon: "🎵",
            time: "18:00",
            title: "Musique relaxante",
            desc: "Écouter ses chansons préférées",
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
