class QuizQuestion extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch(
      "components/quiz-question/quiz-question.html"
    );
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }
    // Hook actions inside the component and re-dispatch as composed events
    const editBtn = this.shadow.querySelector('.btn-edit');
    const deleteBtn = this.shadow.querySelector('.btn-delete');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('edit-question', { bubbles: true, composed: true, detail: { source: this } }));
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('delete-question', { bubbles: true, composed: true, detail: { source: this } }));
      });
    }
  }
}

customElements.define("quiz-question", QuizQuestion);
