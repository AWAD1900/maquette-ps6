/**
 * Gestion du rendu des différentes vues du calendrier
 */
class CalendarRenderer {
  constructor(shadow, calendarEvents, eventTypes) {
    this.shadow = shadow;
    this.calendarEvents = calendarEvents;
    this.eventTypes = eventTypes;
  }

  /**
   * Rend la vue mensuelle
   */
  renderMonth(currentDate, onDayClick) {
    const calendarGrid = this.shadow.querySelector(".calendar-grid");
    if (!calendarGrid) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Titre du mois
    const monthName = currentDate.toLocaleString("fr-FR", {
      month: "long",
      year: "numeric"
    });
    const titleEl = this.shadow.querySelector(".calendar-title");
    if (titleEl) titleEl.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Calcul du premier jour de la semaine
    // getDay() retourne: 0=dimanche, 1=lundi, ..., 6=samedi
    // On veut: 0=lundi, ..., 6=dimanche
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    // Convertir: dimanche=6, lundi=0, mardi=1, etc.
    const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Reset styles
    calendarGrid.className = "calendar-grid";
    calendarGrid.style.cssText = "display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #d0d1d5; padding: 1px; border-radius: 8px; overflow: hidden;";
    calendarGrid.innerHTML = "";
    
    // Headers jours de la semaine (7 colonnes)
    const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    days.forEach(day => {
      const header = document.createElement("div");
      header.className = "day-header";
      header.textContent = day;
      calendarGrid.appendChild(header);
    });

    // Créer les 42 cellules (6 semaines)
    // NOTE: On crée exactement 42 cellules qui s'affichent APRÈS les 7 headers
    // Total: 7 headers + 42 jours = 49 éléments = 7x7 grille
    for (let i = 0; i < 42; i++) {
      // Calculer le jour du mois: 
      // i va de 0 à 41
      // Les premiers 'adjustedFirstDay' cellules sont du mois précédent
      // Puis on passe au mois courant
      const dayOfMonth = i - adjustedFirstDay + 1;
      const cellDate = new Date(year, month, dayOfMonth);
      const cellDateNormalized = CalendarUtils.normalizeDate(cellDate);


      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      
      const isCurrentMonth = cellDateNormalized.getMonth() === month;
      if (!isCurrentMonth) dayEl.classList.add("other-month");
      
      const isToday = CalendarUtils.isSameDay(cellDateNormalized, CalendarUtils.getToday());
      if (isToday) dayEl.classList.add("today");

      const dayNum = document.createElement("div");
      dayNum.className = "day-number";
      dayNum.textContent = cellDateNormalized.getDate();
      dayEl.appendChild(dayNum);

      const eventsContainer = document.createElement("div");
      eventsContainer.className = "day-events";
      
      const dateStr = CalendarUtils.dateToString(cellDateNormalized);
      const dayEvents = this.calendarEvents.getEventsForDate(dateStr);
      dayEvents.slice(0, 3).forEach(event => {
        const eventEl = document.createElement("div");
        eventEl.className = "event-badge";
        eventEl.style.backgroundColor = event.color || "#F39C12";
        eventEl.textContent = event.title.substring(0, 15);
        eventEl.title = event.title;
        eventsContainer.appendChild(eventEl);
      });

      if (dayEvents.length > 3) {
        const moreEl = document.createElement("div");
        moreEl.className = "event-more";
        moreEl.textContent = `+${dayEvents.length - 3}`;
        eventsContainer.appendChild(moreEl);
      }

      dayEl.appendChild(eventsContainer);
      
      // Ajouter listener pour le clic
      if (onDayClick) {
        dayEl.addEventListener("click", () => {
          onDayClick(cellDateNormalized);
        });
      }
      
      calendarGrid.appendChild(dayEl);
    }
  }

  /**
   * Rend la vue hebdomadaire avec grille horaire
   */
  renderWeek(currentDate, onCellClick, onEventClick) {
    const calendarGrid = this.shadow.querySelector(".calendar-grid");
    if (!calendarGrid) return;

    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - daysToMonday);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekLabel = `${weekStart.toLocaleDateString("fr-FR")} - ${weekEnd.toLocaleDateString("fr-FR")}`;
    const titleEl = this.shadow.querySelector(".calendar-title");
    if (titleEl) titleEl.textContent = `Semaine du ${weekLabel}`;

    // Reset styles pour semaine
    calendarGrid.className = "calendar-grid week-grid";
    calendarGrid.style.cssText = "display: flex; flex-direction: column; gap: 0; background: white; padding: 0; border-radius: 0; overflow: hidden; grid-template-columns: unset;";
    calendarGrid.innerHTML = "";
    
    // Header avec jours
    const headerRow = document.createElement("div");
    headerRow.className = "week-header-row";
    
    const timeHeader = document.createElement("div");
    timeHeader.className = "week-time-header";
    timeHeader.textContent = "";
    headerRow.appendChild(timeHeader);
    
    const days = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      
      const dayHeader = document.createElement("div");
      dayHeader.className = "week-day-header";
      const isToday = CalendarUtils.isSameDay(dayDate, CalendarUtils.getToday());
      if (isToday) dayHeader.classList.add("today");
      
      dayHeader.innerHTML = `<div class="day-name">${days[i]}</div><div class="day-date">${dayDate.getDate()}</div>`;
      headerRow.appendChild(dayHeader);
    }
    
    calendarGrid.appendChild(headerRow);
    
    // Grille horaire
    const hoursPerDay = 24;
    for (let hour = 0; hour < hoursPerDay; hour++) {
      const hourRow = document.createElement("div");
      hourRow.className = "week-hour-row";
      
      // Label heure
      const hourLabel = document.createElement("div");
      hourLabel.className = "week-time-label";
      hourLabel.textContent = CalendarUtils.hourToString(hour);
      hourRow.appendChild(hourLabel);
      
      // 7 colonnes pour les jours
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const cellDate = new Date(weekStart);
        cellDate.setDate(weekStart.getDate() + dayIdx);
        const cellDateNormalized = CalendarUtils.normalizeDate(cellDate);
        
        const dayColumn = document.createElement("div");
        dayColumn.className = "week-hour-cell";
        const isToday = CalendarUtils.isSameDay(cellDateNormalized, CalendarUtils.getToday());
        if (isToday) dayColumn.classList.add("today");
        
        const dateStr = CalendarUtils.dateToString(cellDateNormalized);
        const hourEvents = this.calendarEvents.getEventsForHour(dateStr, hour);
        
        hourEvents.forEach(event => {
          const eventEl = document.createElement("div");
          eventEl.className = "week-event";
          eventEl.style.backgroundColor = event.color || "#F39C12";
          eventEl.innerHTML = `
            <div class="week-event-title">${event.title}</div>
            <div class="week-event-time">${event.time}</div>
            ${event.description ? `<div class="week-event-desc">${event.description}</div>` : ""}
          `;
          eventEl.addEventListener("click", (e) => {
            e.stopPropagation();
            onEventClick(cellDateNormalized, event);
          });
          dayColumn.appendChild(eventEl);
        });
        
        // Click pour créer événement
        dayColumn.addEventListener("click", () => {
          onCellClick(cellDateNormalized, CalendarUtils.hourToString(hour));
        });
        
        hourRow.appendChild(dayColumn);
      }
      
      calendarGrid.appendChild(hourRow);
    }
  }

  /**
   * Rend la vue journalière
   */
  renderDay(currentDate, dayEvents, onAddClick, onEditClick, onDeleteClick) {
    const calendarGrid = this.shadow.querySelector(".calendar-grid");
    if (!calendarGrid) return;

    const dateStr = currentDate.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const titleEl = this.shadow.querySelector(".calendar-title");
    if (titleEl) titleEl.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Reset styles pour jour
    calendarGrid.className = "calendar-grid day-view";
    calendarGrid.style.cssText = "display: flex; flex-direction: column; gap: 0; background: transparent; padding: 0; border-radius: 0; overflow: visible; grid-template-columns: unset;";
    calendarGrid.innerHTML = "";

    if (dayEvents.length === 0) {
      const emptyEl = document.createElement("div");
      emptyEl.className = "empty-day";
      emptyEl.innerHTML = `<p>Aucun événement</p><button class="btn-add-today">+ Ajouter un événement</button>`;
      emptyEl.querySelector(".btn-add-today").addEventListener("click", onAddClick);
      calendarGrid.appendChild(emptyEl);
      return;
    }

    dayEvents.forEach((event, idx) => {
      const eventEl = document.createElement("div");
      eventEl.className = "day-event-item";
      eventEl.style.borderLeftColor = event.color || "#F39C12";
      eventEl.innerHTML = `
        <div class="event-time">${CalendarUtils.formatTime(event.time)}</div>
        <div class="event-info">
          <div class="event-title">${event.title}</div>
          <div class="event-description">${event.description || ""}</div>
        </div>
        <div class="event-controls">
          <button class="btn-edit-small" data-idx="${idx}">✎</button>
          <button class="btn-delete-small" data-idx="${idx}">🗑️</button>
        </div>
      `;
      
      eventEl.querySelector(".btn-edit-small").addEventListener("click", () => {
        onEditClick(idx);
      });
      
      eventEl.querySelector(".btn-delete-small").addEventListener("click", () => {
        onDeleteClick(idx);
      });

      calendarGrid.appendChild(eventEl);
    });

    const addBtn = document.createElement("button");
    addBtn.className = "btn-add-day-event";
    addBtn.textContent = "+ Ajouter un événement";
    addBtn.addEventListener("click", onAddClick);
    calendarGrid.appendChild(addBtn);
  }
}
