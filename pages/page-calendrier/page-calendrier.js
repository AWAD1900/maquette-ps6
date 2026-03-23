class PageCalendrier extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    
    // État du calendrier
    this.currentDate = CalendarUtils.getToday();
    this.viewMode = "month"; // month, week, day
    this.selectedDate = CalendarUtils.getToday();
    
    // Types d'événements
    this.eventTypes = [
      { name: "Rendez-vous médical", color: "#E74C3C" },
      { name: "Médicament", color: "#3498DB" },
      { name: "Activité", color: "#27AE60" },
      { name: "Autre", color: "#F39C12" }
    ];
    
    // Modules
    this.calendarEvents = new CalendarEvents();
    this.renderer = new CalendarRenderer(this.shadow, this.calendarEvents, this.eventTypes);
    this.dialog = new CalendarDialog(this.shadow, this.calendarEvents, this.eventTypes);
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    this._checkViewFromRoute();

    const response = await fetch("pages/page-calendrier/page-calendrier.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    this._bindEvents();
    this._renderCalendar();
  }

  _checkViewFromRoute() {
    const hash = window.location.hash;
    if (hash === "#/calendrier/hebdomadaire") {
      this.viewMode = "week";
    } else if (hash === "#/calendrier") {
      this.viewMode = "month";
    }
    this._updateViewButtons();
  }

  _bindEvents() {
    const btnMonth = this.shadow.querySelector("[data-view='month']");
    const btnWeek = this.shadow.querySelector("[data-view='week']");
    const btnDay = this.shadow.querySelector("[data-view='day']");
    const prevBtn = this.shadow.querySelector(".btn-prev");
    const nextBtn = this.shadow.querySelector(".btn-next");
    const todayBtn = this.shadow.querySelector(".btn-today");

    if (btnMonth) btnMonth.addEventListener("click", () => this._setView("month"));
    if (btnWeek) btnWeek.addEventListener("click", () => this._setView("week"));
    if (btnDay) btnDay.addEventListener("click", () => this._setView("day"));
    if (prevBtn) prevBtn.addEventListener("click", () => this._prevPeriod());
    if (nextBtn) nextBtn.addEventListener("click", () => this._nextPeriod());
    if (todayBtn) todayBtn.addEventListener("click", () => this._today());
  }

  _setView(mode) {
    this.viewMode = mode;
    // Mettre à jour le hash pour activer le lien correspondant dans la sidebar
    if (mode === "week") {
      history.pushState(null, null, "#/calendrier/hebdomadaire");
    } else if (mode === "month") {
      history.pushState(null, null, "#/calendrier");
    }
    this._updateViewButtons();
    this._renderCalendar();
  }

  _updateViewButtons() {
    const btnMonth = this.shadow.querySelector("[data-view='month']");
    const btnWeek = this.shadow.querySelector("[data-view='week']");
    const btnDay = this.shadow.querySelector("[data-view='day']");

    [btnMonth, btnWeek, btnDay].forEach(btn => btn?.removeAttribute("active"));
    const activeBtn = this.shadow.querySelector(`[data-view='${this.viewMode}']`);
    if (activeBtn) activeBtn.setAttribute("active", "");
  }

  _prevPeriod() {
    if (this.viewMode === "month") {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.viewMode === "week") {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else if (this.viewMode === "day") {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    }
    this._renderCalendar();
  }

  _nextPeriod() {
    if (this.viewMode === "month") {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.viewMode === "week") {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else if (this.viewMode === "day") {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    }
    this._renderCalendar();
  }

  _today() {
    this.currentDate = CalendarUtils.getToday();
    this._renderCalendar();
  }

  _renderCalendar() {
    if (this.viewMode === "month") {
      this.renderer.renderMonth(this.currentDate, (date) => {
        this.dialog.show(date, null, null, () => this._renderCalendar());
      });
    } else if (this.viewMode === "week") {
      this.renderer.renderWeek(
        this.currentDate,
        (date, time) => {
          this.dialog.show(date, null, time, () => this._renderCalendar());
        },
        (date, event) => {
          const dateStr = CalendarUtils.dateToString(date);
          const dayEvents = this.calendarEvents.getEventsForDate(dateStr);
          const eventIdx = dayEvents.indexOf(event);
          this.dialog.show(date, eventIdx, null, () => this._renderCalendar());
        }
      );
    } else if (this.viewMode === "day") {
      const dateStr = CalendarUtils.dateToString(this.currentDate);
      const dayEvents = this.calendarEvents.getEventsForDate(dateStr);
      
      this.renderer.renderDay(
        this.currentDate,
        dayEvents,
        () => this.dialog.show(this.currentDate, null, null, () => this._renderCalendar()),
        (idx) => this.dialog.show(this.currentDate, idx, null, () => this._renderCalendar()),
        (idx) => {
          this.calendarEvents.deleteEvent(dateStr, idx);
          this._renderCalendar();
        }
      );
    }
  }
}

customElements.define("page-calendrier", PageCalendrier);
