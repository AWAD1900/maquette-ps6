class PageQuiz extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this._currentEdit = null; // référence à la question en cours d'édition
    this._currentScheduleTarget = null;
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) {
      const dialog = this.shadow.getElementById("dialog-new-question");
      if (dialog) dialog.removeAttribute("open");
      return;
    }

    const response = await fetch("pages/page-quiz/page-quiz.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    const dialog = this.shadow.getElementById("dialog-new-question");
    if (dialog) dialog.removeAttribute("open");

    this._bindEvents();
  }

  _bindEvents() {
    const btnCreate = this.shadow.getElementById("btn-create-question");
    const dialog = this.shadow.getElementById("dialog-new-question");
    const btnCancel = this.shadow.getElementById("btn-cancel");
    const btnPublish = this.shadow.getElementById("btn-publish");
    const scheduleDialog = this.shadow.getElementById(
      "dialog-schedule-question",
    );
    const btnCancelSchedule = this.shadow.getElementById("btn-cancel-schedule");
    const btnSaveSchedule = this.shadow.getElementById("btn-save-schedule");
    const list = this.shadow.querySelector(".questions-list");

    if (btnCreate && dialog) {
      btnCreate.addEventListener("click", () => {
        // création = pas d'édition en cours
        this._currentEdit = null;
        // reset form to ensure empty fields
        const form = this.shadow.querySelector("#form-new-question");
        if (form) form.reset();
        dialog.open();
      });
    }

    if (btnCancel && dialog) {
      btnCancel.addEventListener("click", () => dialog.close());
    }

    if (btnPublish && dialog) {
      btnPublish.addEventListener("click", (e) => {
        e.preventDefault();
        this._saveQuestion(dialog);
      });
    }

    if (btnCancelSchedule && scheduleDialog) {
      btnCancelSchedule.addEventListener("click", () => {
        this._currentScheduleTarget = null;
        scheduleDialog.close();
      });
    }

    if (btnSaveSchedule && scheduleDialog) {
      btnSaveSchedule.addEventListener("click", (e) => {
        e.preventDefault();
        this._saveSchedule(scheduleDialog);
      });
    }

    // Listen for edit/delete events dispatched from quiz-question components
    if (list) {
      list.addEventListener("edit-question", (e) => {
        const src = e.detail && e.detail.source ? e.detail.source : e.target;
        const questionEl = src.closest ? src.closest("quiz-question") : src;
        if (questionEl) this._openEdit(dialog, questionEl);
      });

      list.addEventListener("delete-question", (e) => {
        const src = e.detail && e.detail.source ? e.detail.source : e.target;
        const questionEl = src.closest ? src.closest("quiz-question") : src;
        if (!questionEl) return;
        const confirmed = confirm("Supprimer cette question ?");
        if (confirmed) questionEl.remove();
      });

      list.addEventListener("schedule-question", (e) => {
        const src = e.detail && e.detail.source ? e.detail.source : e.target;
        const questionEl = src.closest ? src.closest("quiz-question") : src;
        if (questionEl) this._openScheduleDialog(scheduleDialog, questionEl);
      });
    }
  }

  _openScheduleDialog(dialog, questionEl) {
    if (!dialog || !questionEl) return;

    this._currentScheduleTarget = questionEl;
    const input = this.shadow.getElementById("input-launch-datetime");
    if (!input) return;

    const existingDateTime = questionEl.dataset.launchAt || "";
    input.value = existingDateTime;

    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    input.min = localNow.toISOString().slice(0, 16);

    dialog.open();
  }

  _saveSchedule(dialog) {
    const target = this._currentScheduleTarget;
    if (!target) return;

    const input = this.shadow.getElementById("input-launch-datetime");
    const launchAt = input?.value?.trim() || "";
    if (!launchAt) return;

    target.dataset.launchAt = launchAt;

    let statusEl = target.querySelector('[slot="status"]');
    if (!statusEl) {
      statusEl = document.createElement("span");
      statusEl.slot = "status";
      target.appendChild(statusEl);
    }
    statusEl.textContent = `Lancement prévu - ${this._formatLaunchDate(launchAt)}`;

    this._currentScheduleTarget = null;
    dialog.close();
  }

  _formatLaunchDate(dateTimeValue) {
    const parsed = new Date(dateTimeValue);
    if (Number.isNaN(parsed.getTime())) return dateTimeValue;
    return parsed.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  _addQuestion(dialog) {
    const root = this.shadow;
    const questionVal =
      root.querySelector("#input-question")?.value?.trim() || "";
    const correctVal =
      root.querySelector("#input-correct")?.value?.trim() || "";
    const wrong1Val = root.querySelector("#input-wrong1")?.value?.trim() || "";
    const wrong2Val = root.querySelector("#input-wrong2")?.value?.trim() || "";
    const imageInput = root.querySelector("#input-image");

    if (questionVal && correctVal && wrong1Val) {
      const questionEl = document.createElement("quiz-question");

      const statusSpan = document.createElement("span");
      statusSpan.slot = "status";
      statusSpan.textContent = "Nouvelle question – Active ✓";
      questionEl.appendChild(statusSpan);

      const qsSpan = document.createElement("span");
      qsSpan.slot = "question";
      qsSpan.textContent = questionVal;
      questionEl.appendChild(qsSpan);

      if (imageInput && imageInput.files && imageInput.files[0]) {
        const imgEl = document.createElement("img");
        imgEl.slot = "image";
        imgEl.src = URL.createObjectURL(imageInput.files[0]);
        imgEl.alt = "Image de la question";
        questionEl.appendChild(imgEl);
      }

      const ans1 = document.createElement("quiz-answer");
      ans1.slot = "answers";
      ans1.setAttribute("correct", "");
      ans1.textContent = correctVal;
      questionEl.appendChild(ans1);

      const ans2 = document.createElement("quiz-answer");
      ans2.slot = "answers";
      ans2.textContent = wrong1Val;
      questionEl.appendChild(ans2);

      if (wrong2Val) {
        const ans3 = document.createElement("quiz-answer");
        ans3.slot = "answers";
        ans3.textContent = wrong2Val;
        questionEl.appendChild(ans3);
      }

      const list = root.querySelector(".questions-list");
      if (list) {
        list.insertBefore(questionEl, list.firstChild);
      }
    }

    const form = root.querySelector("#form-new-question");
    if (form) form.reset();

    dialog.close();
  }

  _openEdit(dialog, questionEl) {
    if (!dialog || !questionEl) return;
    this._currentEdit = questionEl;

    const root = this.shadow;
    const qSpan = questionEl.querySelector('[slot="question"]');
    const answers = Array.from(questionEl.querySelectorAll("quiz-answer"));
    const image = questionEl.querySelector('img[slot="image"]');

    root.querySelector("#input-question").value = qSpan
      ? qSpan.textContent.trim()
      : "";
    // find correct answer
    const correct = answers.find((a) => a.hasAttribute("correct"));
    if (correct) {
      root.querySelector("#input-correct").value = correct.textContent.trim();
    } else {
      root.querySelector("#input-correct").value = "";
    }
    // other answers
    root.querySelector("#input-wrong1").value =
      answers[0] && !answers[0].hasAttribute("correct")
        ? answers[0].textContent.trim()
        : answers[1] && !answers[1].hasAttribute("correct")
          ? answers[1].textContent.trim()
          : "";
    // try to get a second wrong answer
    let wrong2 = "";
    if (answers.length === 3) {
      const wrongs = answers.filter((a) => !a.hasAttribute("correct"));
      wrong2 = wrongs[1] ? wrongs[1].textContent.trim() : "";
    }
    root.querySelector("#input-wrong2").value = wrong2;

    // store current image src on dialog for potential reuse
    if (image) dialog.dataset.currentImage = image.src;
    else delete dialog.dataset.currentImage;

    dialog.open();
  }

  _saveQuestion(dialog) {
    // if editing, update existing, otherwise add new
    if (this._currentEdit) {
      const root = this.shadow;
      const questionVal =
        root.querySelector("#input-question")?.value?.trim() || "";
      const correctVal =
        root.querySelector("#input-correct")?.value?.trim() || "";
      const wrong1Val =
        root.querySelector("#input-wrong1")?.value?.trim() || "";
      const wrong2Val =
        root.querySelector("#input-wrong2")?.value?.trim() || "";
      const imageInput = root.querySelector("#input-image");

      // update question text
      const qSpan = this._currentEdit.querySelector('[slot="question"]');
      if (qSpan) qSpan.textContent = questionVal;

      // remove existing answers and recreate
      const oldAnswers = Array.from(
        this._currentEdit.querySelectorAll("quiz-answer"),
      );
      oldAnswers.forEach((a) => a.remove());

      if (correctVal) {
        const ans1 = document.createElement("quiz-answer");
        ans1.slot = "answers";
        ans1.setAttribute("correct", "");
        ans1.textContent = correctVal;
        this._currentEdit.appendChild(ans1);
      }
      if (wrong1Val) {
        const ans2 = document.createElement("quiz-answer");
        ans2.slot = "answers";
        ans2.textContent = wrong1Val;
        this._currentEdit.appendChild(ans2);
      }
      if (wrong2Val) {
        const ans3 = document.createElement("quiz-answer");
        ans3.slot = "answers";
        ans3.textContent = wrong2Val;
        this._currentEdit.appendChild(ans3);
      }

      // handle image: if a new file was chosen, replace/create img; otherwise keep existing
      if (imageInput && imageInput.files && imageInput.files[0]) {
        let imgEl = this._currentEdit.querySelector('img[slot="image"]');
        if (!imgEl) {
          imgEl = document.createElement("img");
          imgEl.slot = "image";
          this._currentEdit.appendChild(imgEl);
        }
        imgEl.src = URL.createObjectURL(imageInput.files[0]);
      }

      // reset edit state
      this._currentEdit = null;
      const form = this.shadow.querySelector("#form-new-question");
      if (form) form.reset();
      dialog.close();
      return;
    }

    // otherwise create new
    this._addQuestion(dialog);
  }
}

customElements.define("page-quiz", PageQuiz);
