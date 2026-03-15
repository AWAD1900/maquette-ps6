class HeaderAccueil extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const timestamp = new Date().getTime();
        const [htmlResponse, cssResponse] = await Promise.all([
            fetch(`/components/header-accueil/header-accueil.html?v=${timestamp}`),
            fetch(`/components/header-accueil/header-accueil.css?v=${timestamp}`)
        ]);

        const html = await htmlResponse.text();
        const css = await cssResponse.text();

        this.shadowRoot.innerHTML = `
            <style>${css}</style>
            ${html}
        `;

        const changeProfileBtn = this.shadowRoot.querySelector('.change-profile-btn');
        if (changeProfileBtn) {
            changeProfileBtn.addEventListener('click', () => {
                window.location.hash = '#/login';
            });
        }
    }
}

customElements.define('app-header-accueil', HeaderAccueil);