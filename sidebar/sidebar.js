class SideBar extends HTMLElement {
  constructor() {
    super();
    let shadowRoot = this.attachShadow({ mode: "open" });

    fetch("sidebar/sidebar.html").then(async function (response) {
      let htmlContent = await response.text();

      let templateContent = new DOMParser()
        .parseFromString(htmlContent, "text/html")
        .querySelector("template").content;

      shadowRoot.appendChild(templateContent.cloneNode(true));
    });
  }
}

customElements.define("side-bar", SideBar);
