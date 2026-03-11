class SideBarGroupLink extends HTMLElement {
  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadowRootRef.childElementCount > 0) {
      this.syncAttributes();
      return;
    }

    const response = await fetch("components/sidebar/sidebar-group-link/sidebar-group-link.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (!template) {
      return;
    }

    this.shadowRootRef.appendChild(template.content.cloneNode(true));
    this.syncAttributes();
  }

  static get observedAttributes() {
    return ["icon-src", "text", "link"];
  }

  attributeChangedCallback() {
    this.syncAttributes();
  }

  syncAttributes() {
    if (!this.shadowRootRef) {
      return;
    }

    const iconEl = this.shadowRootRef.querySelector(".icon");
    const iconImageEl = this.shadowRootRef.querySelector(".icon-image");
    const labelEl = this.shadowRootRef.querySelector(".label");
    const anchorEl = this.shadowRootRef.querySelector(".sidebar-group-link");

    if (!iconEl || !iconImageEl || !labelEl || !anchorEl) {
      return;
    }

    const iconSrc = this.getAttribute("icon-src") || "";
    const text = this.getAttribute("text") || "";
    const link = this.getAttribute("link") || "#";

    iconImageEl.src = iconSrc;
    labelEl.textContent = text;
    anchorEl.href = link;
  }
}

customElements.define("sidebar-group-link", SideBarGroupLink);
