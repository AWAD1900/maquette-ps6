class PageRdvMedical extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("pages/page-rdv-medical/page-rdv-medical.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }
  }
}

customElements.define("page-rdv-medical", PageRdvMedical);
