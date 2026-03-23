/**
 * Gestion du dialogue d'événements
 */
class CalendarDialog {
  constructor(shadow, calendarEvents, eventTypes) {
    this.shadow = shadow;
    this.calendarEvents = calendarEvents;
    this.eventTypes = eventTypes;
    this.editingEventIdx = null;
  }

  /**
   * Affiche le dialogue d'événement
   */
  show(date, editIdx = null, defaultTime = null, onDialogClose = null) {
    const dateStr = CalendarUtils.dateToString(date);
    const dayEvents = this.calendarEvents.getEventsForDate(dateStr);
    
    const dialog = this.shadow.querySelector(".events-dialog");
    if (!dialog) return;

    const isEditing = editIdx !== null && editIdx !== undefined;
    const editingEvent = isEditing ? dayEvents[editIdx] : null;

    const dialogContent = dialog.querySelector(".dialog-content");
    dialogContent.innerHTML = `
      <div class="dialog-header">
        <h3>${date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
        <button class="btn-close">✕</button>
      </div>
      <div class="events-list">
        ${dayEvents.map((evt, idx) => `
          <div class="event-item" style="border-left: 4px solid ${evt.color || '#F39C12'}">
            <div class="event-time">${CalendarUtils.formatTime(evt.time)}</div>
            <div class="event-details">
              <div class="event-title">${evt.title}</div>
              <div class="event-description">${evt.description || ""}</div>
              <div class="event-type-badge" style="background-color: ${evt.color || '#F39C12'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; display: inline-block; margin-top: 4px;">${evt.type || "Autre"}</div>
            </div>
            <div class="event-actions">
              <button class="btn-edit-event" data-idx="${idx}">✎</button>
              <button class="btn-delete-event" data-idx="${idx}">🗑️</button>
            </div>
          </div>
        `).join("")}
      </div>
      <form class="add-event-form" ${isEditing ? 'style="display: none;"' : ''}>
        <input type="text" placeholder="Titre" class="input-title" required />
        <input type="time" class="input-time" value="${defaultTime || ""}" />
        <textarea placeholder="Description" class="input-description"></textarea>
        <select class="input-type" required>
          <option value="" disabled selected>Sélectionner le type</option>
          ${this.eventTypes.map(type => `<option value="${type.name}" data-color="${type.color}" style="padding-left: 20px;">${type.name}</option>`).join("")}
        </select>
        <button type="submit" class="btn-add-event">+ Ajouter</button>
      </form>
      
      <form class="edit-event-form" ${!isEditing ? 'style="display: none;"' : ''}>
        <h4>Modifier l'événement</h4>
        <input type="text" placeholder="Titre" class="edit-input-title" value="${editingEvent?.title || ""}" required />
        <input type="time" class="edit-input-time" value="${editingEvent?.time || ""}" />
        <textarea placeholder="Description" class="edit-input-description">${editingEvent?.description || ""}</textarea>
        <select class="edit-input-type" required>
          ${this.eventTypes.map(type => `<option value="${type.name}" data-color="${type.color}" style="padding-left: 20px;" ${editingEvent?.type === type.name ? 'selected' : ''}>${type.name}</option>`).join("")}
        </select>
        <div class="button-group">
          <button type="submit" class="btn-save-event">Sauvegarder</button>
          <button type="button" class="btn-cancel-edit">Annuler</button>
        </div>
      </form>
    `;

    dialog.classList.add("open");

    const closeBtn = dialogContent.querySelector(".btn-close");
    const closeDialog = () => {
      dialog.classList.remove("open");
      if (onDialogClose) onDialogClose();
    };
    closeBtn.addEventListener("click", closeDialog);
    
    const overlay = dialog.querySelector(".dialog-overlay");
    overlay.addEventListener("click", closeDialog);

    const form = dialogContent.querySelector(".add-event-form");
    const editForm = dialogContent.querySelector(".edit-event-form");

    // Formulaire d'ajout
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = dialogContent.querySelector(".input-title").value;
        const time = dialogContent.querySelector(".input-time").value;
        const description = dialogContent.querySelector(".input-description").value;
        const typeSelect = dialogContent.querySelector(".input-type");
        const typeName = typeSelect.value;
        const color = this.eventTypes.find(t => t.name === typeName)?.color || "#F39C12";

        this.calendarEvents.addEvent(dateStr, { title, time, description, type: typeName, color });
        closeDialog();
      });
    }

    // Formulaire d'édition
    if (editForm) {
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = dialogContent.querySelector(".edit-input-title").value;
        const time = dialogContent.querySelector(".edit-input-time").value;
        const description = dialogContent.querySelector(".edit-input-description").value;
        const typeSelect = dialogContent.querySelector(".edit-input-type");
        const typeName = typeSelect.value;
        const color = this.eventTypes.find(t => t.name === typeName)?.color || "#F39C12";

        this.calendarEvents.updateEvent(dateStr, editIdx, { title, time, description, type: typeName, color });
        closeDialog();
      });

      const cancelBtn = editForm.querySelector(".btn-cancel-edit");
      cancelBtn.addEventListener("click", () => {
        editForm.style.display = "none";
        if (form) form.style.display = "flex";
      });
    }

    // Boutons d'édition
    dialogContent.querySelectorAll(".btn-edit-event").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(e.target.dataset.idx);
        if (form) form.style.display = "none";
        if (editForm) editForm.style.display = "block";
        
        const event = dayEvents[idx];
        dialogContent.querySelector(".edit-input-title").value = event.title;
        dialogContent.querySelector(".edit-input-time").value = event.time || "";
        dialogContent.querySelector(".edit-input-description").value = event.description || "";
        dialogContent.querySelector(".edit-input-type").value = event.type || "Autre";
        this.editingEventIdx = idx;
      });
    });

    // Boutons de suppression
    dialogContent.querySelectorAll(".btn-delete-event").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(e.target.dataset.idx);
        this.calendarEvents.deleteEvent(dateStr, idx);
        closeDialog();
      });
    });
  }

  /**
   * Ferme le dialogue
   */
  hide() {
    const dialog = this.shadow.querySelector(".events-dialog");
    if (dialog) {
      dialog.classList.remove("open");
    }
  }
}
