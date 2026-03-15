class CardProfile extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("components/card-profile/card-profile.html");
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
    const button = this.shadow.querySelector(".card-button");
    if (button) {
      button.addEventListener("click", () => {
        const profileType = this.getAttribute("data-profile") || "user";
        this.dispatchEvent(
          new CustomEvent("profile-selected", {
            detail: { profile: profileType },
            bubbles: true,
            composed: true,
          })
        );
      });
    }
  }
}

customElements.define("card-profile", CardProfile);
