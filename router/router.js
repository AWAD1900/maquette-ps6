class AppRouter {
  constructor() {
    this.routes = {};
    this.mainEl = null;
  }

  register(path, tagName) {
    this.routes[path] = tagName;
  }

  start() {
    this.mainEl = document.querySelector("main");
    window.addEventListener("hashchange", () => this.render());
    this.render();
  }

  get currentRoute() {
    return location.hash.slice(1) || "/calendrier";
  }

  render() {
    const route = this.currentRoute;
    const tagName = this.routes[route];

    if (!this.mainEl) return;

    this.mainEl.innerHTML = "";

    if (tagName) {
      this.mainEl.appendChild(document.createElement(tagName));
    } else {
      this.mainEl.innerHTML = `<h1>404 - Page non trouvée</h1><p>La page "${route}" n'existe pas.</p>`;
      throw new Error(`The ${route} route is not registered in the router.`);
    }

    this.updateActiveStates(route);
  }

  updateActiveStates(route) {
    this.updateHeaderActiveStates(route);
    this.updateSideBarActiveStates(route);
  }

  updateSideBarActiveStates(route) {
    const sidebar = document.querySelector("app-sidebar");
    if (sidebar && sidebar.shadowRoot) {
      const sideBar = sidebar.shadowRoot.querySelector("side-bar");
      if (sideBar && sideBar.shadowRoot) {
        const sidebarLinks = sidebar.shadowRoot.querySelectorAll("sidebar-group-link");
        sidebarLinks.forEach((link) => {
          const href = link.getAttribute("link");
          if (href === "#" + route) {
            link.setAttribute("active", "");
          } else {
            link.removeAttribute("active");
          }
        });
      }
    }
  }

  updateHeaderActiveStates(route) {
    const header = document.querySelector("app-header");
    if (header && header.shadowRoot) {
      const navLinks = header.shadowRoot.querySelectorAll("nav-link");
      navLinks.forEach((link) => {
        const href = link.getAttribute("link") || "";
        if (href === "#" + route) {
          link.setAttribute("active", "");
        } else {
          link.removeAttribute("active");
        }
      });
    }
  }
}

const router = new AppRouter();

router.register("/calendrier", "page-calendrier");
router.register("/calendrier/mensuelle", "page-calendrier");
router.register("/calendrier/hebdomadaire", "page-hebdomadaire");
router.register("/contacts", "page-contacts");
router.register("/quiz", "page-quiz");
router.register("/parametres", "page-parametres");
router.register("/rdv-medical", "page-rdv-medical");
router.register("/activite", "page-activite");
router.register("/medicament", "page-medicament");
router.register("/famille", "page-famille");

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => router.start(), 100);
});
