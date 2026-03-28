class AppRouter {
  constructor() {
    this.routes = {};
    this.mainEl = null;
    this.viewCache = new Map();
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

    if (!tagName) {
      this.mainEl.innerHTML = `<h1>404 - Page non trouvée</h1><p>La page "${route}" n'existe pas.</p>`;
      throw new Error(`The ${route} route is not registered in the router.`);
    }

    // Si la route est déjà rendue, on vérifie si c'est le calendrier pour forcer le mode
    const currentView = this.mainEl.firstElementChild;
    if (currentView && currentView.tagName.toLowerCase() === tagName) {
      if (tagName === "page-calendrier") {
        currentView._checkViewFromRoute?.();
        currentView._renderCalendar?.();
      }
      this.updateActiveStates(route);
      this.updateLayoutVisibility(tagName);
      return;
    }

    // Reuse already-created views to avoid remount flashes during navigation.
    let nextView = this.viewCache.get(tagName);
    if (!nextView) {
      nextView = document.createElement(tagName);
      this.viewCache.set(tagName, nextView);
    }

    this.mainEl.replaceChildren(nextView);
    this.updateLayoutVisibility(tagName);

    this.updateActiveStates(route);
  }

  updateLayoutVisibility(tagName) {
    const header = document.querySelector("app-header");
    const sidebar = document.querySelector("app-sidebar");
    const hideChrome = tagName === "page-login" || tagName === "page-accueil";

    if (header) {
      header.style.display = hideChrome ? "none" : "";
    }

    if (sidebar) {
      sidebar.style.display = hideChrome ? "none" : "";
    }
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
        const sidebarLinks =
          sidebar.shadowRoot.querySelectorAll("sidebar-group-link");
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
router.register("/calendrier/jour", "page-calendrier");
router.register("/parametres", "page-parametres");
router.register("/contacts", "page-contacts");
router.register("/quiz", "page-quiz");
router.register("/rdv-medical", "page-rdv-medical");
router.register("/activite", "page-activite");
router.register("/medicament", "page-medicament");
router.register("/famille", "page-famille");

window.addEventListener("DOMContentLoaded", () => {
  window.appRouter = router;
  router.start();
});
