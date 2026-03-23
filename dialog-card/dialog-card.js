class DialogCard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const response = await fetch("dialog-card/dialog-card.html");
    const htmlContent = await response.text();

    const templateContent = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template").content;

    const clone = templateContent.cloneNode(true);

    // Close dialog on overlay click
    clone.querySelector(".overlay").addEventListener("click", (e) => {
      if (e.target.classList.contains("overlay")) {
        this.close();
      }
    });

    // Cancel button
    clone.querySelector(".btn-cancel").addEventListener("click", () => {
      this.close();
    });

    // Publish button
    clone.querySelector(".btn-publish").addEventListener("click", () => {
      const inputs = this.shadow.querySelectorAll(".form-input");
      const data = {
        question: inputs[0].value,
        correctAnswer: inputs[1].value,
        wrongAnswer1: inputs[2].value,
        wrongAnswer2: inputs[3].value,
        hint: inputs[4].value,
      };
      this.dispatchEvent(new CustomEvent("publish", { detail: data }));
      this.close();
    });

    this.shadow.appendChild(clone);
  }

  close() {
    this.remove();
  }
}

customElements.define("dialog-card", DialogCard);
