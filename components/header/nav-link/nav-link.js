class NavItem extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const icon = this.getAttribute("icon") || "";
    const text = this.getAttribute("text") || "";
    const link = this.getAttribute("link") || "#";

    const response = await fetch("components/header/nav-link/nav-link.html");
    const htmlContent = await response.text();

    const templateContent = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template").content;

    const clone = templateContent.cloneNode(true);

    clone.querySelector(".nav-icon").src = icon;
    clone.querySelector(".nav-text").href = link;
    clone.querySelector(".nav-text").textContent = text;

    this.shadow.appendChild(clone);
  }
}

customElements.define("nav-link", NavItem);