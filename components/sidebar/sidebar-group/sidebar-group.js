class SideBarGroup extends HTMLElement {
  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadowRootRef.childElementCount > 0) {
      return;
    }

    const response = await fetch("components/sidebar/sidebar-group/sidebar-group.html");
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

customElements.define("side-bar-group", SideBarGroup);
