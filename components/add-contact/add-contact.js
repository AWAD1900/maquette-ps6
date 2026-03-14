class AppAddContact extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("components/add-contact/add-contact.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    const btn = this.shadow.querySelector(".add-contact-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("add-contact-click", { bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define("app-add-contact", AppAddContact);
