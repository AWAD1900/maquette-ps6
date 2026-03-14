class PageQuiz extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
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

    if (btnCreate && dialog) {
      btnCreate.addEventListener("click", () => dialog.open());
    }

    if (btnCancel && dialog) {
      btnCancel.addEventListener("click", () => dialog.close());
    }

    if (btnPublish && dialog) {
      btnPublish.addEventListener("click", (e) => {
        e.preventDefault();
        this._addQuestion(dialog);
      });
    }
  }

  _addQuestion(dialog) {
    const root = this.shadow;
    const questionVal = root.querySelector("#input-question")?.value?.trim() || "";
    const correctVal = root.querySelector("#input-correct")?.value?.trim() || "";
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
}

customElements.define("page-quiz", PageQuiz);
