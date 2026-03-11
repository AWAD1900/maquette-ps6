class AppHeader extends HTMLElement {
  constructor() {
    super();
    let shadowRoot = this.attachShadow({ mode: "open" });

    fetch("components/header/header.html").then(async function (response) {
      let htmlContent = await response.text();

      let templateContent = new DOMParser()
        .parseFromString(htmlContent, "text/html")
        .querySelector("template").content;

      shadowRoot.appendChild(templateContent.cloneNode(true));
    });
  }
}

customElements.define("app-header", AppHeader);
