class PageLogin extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("pages/page-login/page-login.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    this._bindEvents();
  }

  _bindEvents() {
    this.shadow.addEventListener("profile-selected", (e) => {
      const profile = e.detail && e.detail.profile;
      if (profile === "aidant") {
        window.location.hash = "#/parametres";
      } else if (profile === "accueilli") {
        window.location.hash = "#/calendrier";
      }
    });
  }
}

customElements.define("page-login", PageLogin);
