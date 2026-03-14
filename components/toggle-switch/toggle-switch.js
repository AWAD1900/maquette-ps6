class ToggleSwitch extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;
    const response = await fetch("components/toggle-switch/toggle-switch.html");
    const htmlContent = await response.text();
    const template = new DOMParser().parseFromString(htmlContent, "text/html").querySelector("template");
    
    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    const input = this.shadow.querySelector("input");
    if (this.hasAttribute("checked")) {
      input.checked = true;
    }

    input.addEventListener("change", (e) => {
      if (input.checked) {
        this.setAttribute("checked", "");
      } else {
        this.removeAttribute("checked");
      }
      this.dispatchEvent(new CustomEvent("change", { detail: { checked: input.checked }, bubbles: true, composed: true }));
    });
  }

  static get observedAttributes() {
    return ["checked"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "checked") {
      const input = this.shadow.querySelector("input");
      if (input) {
        input.checked = newValue !== null;
      }
    }
  }
}

customElements.define("toggle-switch", ToggleSwitch);