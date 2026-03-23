class AppContact extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("components/contact/contact.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    this._syncAttributes();
  }

  static get observedAttributes() {
    return ["name", "role", "phone", "avatar"];
  }

  attributeChangedCallback() {
    this._syncAttributes();
  }

  _syncAttributes() {
    const nameEl = this.shadow.querySelector(".contact-name");
    const roleEl = this.shadow.querySelector(".contact-role");
    const phoneLink = this.shadow.querySelector(".phone-link");
    const avatarEl = this.shadow.querySelector(".contact-avatar");

    if (!nameEl || !roleEl || !phoneLink || !avatarEl) return;

    nameEl.textContent = this.getAttribute("name") || "";
    roleEl.textContent = this.getAttribute("role") || "";

    const phone = this.getAttribute("phone") || "";
    phoneLink.textContent = phone;
    phoneLink.href = "tel:" + phone.replace(/\s/g, "");

    const avatarImg = this.shadow.querySelector(".avatar-img");
    if (avatarImg) {
      avatarImg.src = this.getAttribute("avatar") || "https://www.svgrepo.com/show/496485/profile-circle.svg";
    }
  }
}

customElements.define("app-contact", AppContact);
