class PageContacts extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) {
      const dialog = this.shadow.getElementById("dialog-new-contact");
      if (dialog) dialog.removeAttribute("open");
      return;
    }

    const response = await fetch("pages/page-contacts/page-contacts.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    const dialog = this.shadow.getElementById("dialog-new-contact");
    if (dialog) {
      dialog.removeAttribute("open");
    }

    this._bindEvents();
  }

  _bindEvents() {
    const root = this.shadow;
    const dialog = root.getElementById("dialog-new-contact");
    const addContactBtn = root.querySelector("app-add-contact");
    const btnCancel = root.getElementById("btn-cancel");
    const btnAdd = root.getElementById("btn-add");
    const form = root.getElementById("form-new-contact");

    if (addContactBtn && dialog) {
      addContactBtn.addEventListener("add-contact-click", () => dialog.open());
    }

    if (btnCancel && dialog) {
      btnCancel.addEventListener("click", () => dialog.close());
    }

    if (form && dialog) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this._addContact(dialog);
      });
    }

    if (btnAdd && dialog) {
      btnAdd.addEventListener("click", (e) => {
        e.preventDefault();
        this._addContact(dialog);
      });
    }
  }

  _addContact(dialog) {
    const root = this.shadow;
    const nameVal = root.querySelector("#input-name")?.value?.trim() || "";
    const roleVal = root.querySelector("#input-role")?.value?.trim() || "";
    const phoneVal = root.querySelector("#input-phone")?.value?.trim() || "";

    if (nameVal && roleVal && phoneVal) {
      const contact = document.createElement("app-contact");
      contact.setAttribute("name", nameVal);
      contact.setAttribute("role", roleVal);
      contact.setAttribute("phone", phoneVal);
      contact.setAttribute("avatar", "https://www.svgrepo.com/show/496485/profile-circle.svg");

      const list = root.querySelector("#contacts-list");
      if (list) list.appendChild(contact);
    }

    const form = root.querySelector("#form-new-contact");
    if (form) form.reset();

    dialog.close();
  }
}

customElements.define("page-contacts", PageContacts);
