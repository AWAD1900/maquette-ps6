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
    const hash = location.hash.slice(1);
    return hash === "" ? "/" : hash;
  }

  render() {
    const route = this.currentRoute;
    const tagName = this.routes[route];

    if (!this.mainEl) return;

    // Si la route est déjà rendue, on vérifie si c'est le calendrier pour forcer le mode
    const currentView = this.mainEl.firstChild;
    if (currentView && currentView.tagName.toLowerCase() === tagName) {
      if (tagName === "page-calendrier") {
        currentView._checkViewFromRoute?.();
        currentView._renderCalendar?.();
      }
      this.updateActiveStates(route);
      return;
    }

    this.mainEl.innerHTML = "";

    if (tagName) {
      const currentElement = this.mainEl.firstElementChild;
      
      // Only recreate the element if the component tag actually changed
      if (!currentElement || currentElement.tagName.toLowerCase() !== tagName) {
        this.mainEl.innerHTML = "";
        this.mainEl.appendChild(document.createElement(tagName));
        
        // Hide header and sidebar for login and accueil pages
        const header = document.querySelector("app-header");
        const sidebar = document.querySelector("app-sidebar");
        if (tagName === "page-login" || tagName === "page-accueil") {
          if (header) header.style.display = "none";
          if (sidebar) sidebar.style.display = "none";
        } else {
          if (header) header.style.display = "";
          if (sidebar) sidebar.style.display = "";
        }
      }
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

router.register("/", "page-login");
router.register("/login", "page-login");
router.register("/accueil", "page-accueil");
router.register("/accueil/hier", "page-accueil");
router.register("/accueil/demain", "page-accueil");
router.register("/calendrier", "page-calendrier");
router.register("/calendrier/hebdomadaire", "page-calendrier");
router.register("/parametres", "page-parametres");
router.register("/contacts", "page-contacts");
router.register("/quiz", "page-quiz");
router.register("/rdv-medical", "page-rdv-medical");
router.register("/activite", "page-activite");
router.register("/medicament", "page-medicament");
router.register("/famille", "page-famille");

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    window.appRouter = router;
    router.start();
  }, 100);
});
