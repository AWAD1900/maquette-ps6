class AppDialog extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this._onOverlayClick = this._onOverlayClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("components/dialog/dialog.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    const overlay = this.shadow.querySelector(".dialog-overlay");
    if (overlay) {
      overlay.addEventListener("click", this._onOverlayClick);
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this._onKeyDown);
  }

  static get observedAttributes() {
    return ["open"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      if (newValue !== null) {
        document.addEventListener("keydown", this._onKeyDown);
      } else {
        document.removeEventListener("keydown", this._onKeyDown);
      }
    }
  }

  open() {
    this.setAttribute("open", "");
    this.dispatchEvent(new CustomEvent("dialog-open"));
  }

  close() {
    this.removeAttribute("open");
    this.dispatchEvent(new CustomEvent("dialog-close"));
  }

  _onOverlayClick(e) {
    if (e.target.classList.contains("dialog-overlay")) {
      this.close();
    }
  }

  _onKeyDown(e) {
    if (e.key === "Escape") {
      this.close();
    }
  }
}

customElements.define("app-dialog", AppDialog);
