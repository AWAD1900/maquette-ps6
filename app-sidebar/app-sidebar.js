class AppSidebar extends HTMLElement {
  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadowRootRef.childElementCount > 0) {
      return;
    }

    const response = await fetch("app-sidebar/app-sidebar.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (!template) {
      return;
    }

    this.shadowRootRef.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("app-sidebar", AppSidebar);
