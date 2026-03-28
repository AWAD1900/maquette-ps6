class PageActivite extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.activityStats = [
      { name: "Marche quotidienne", completed: 6, total: 7 },
      { name: "Hydratation", completed: 12, total: 14 },
      { name: "Jeux de memoire", completed: 4, total: 5 },
      { name: "Prise de medicaments", completed: 13, total: 14 },
      { name: "Appel famille", completed: 3, total: 4 },
    ];

    this.quizStats = {
      answered: 48,
      correct: 39,
      averageTimeSeconds: 22,
      byCategory: [
        { label: "Souvenirs personnels", correct: 16, total: 20 },
        { label: "Orientation temporelle", correct: 13, total: 16 },
        { label: "Reconnaissance visuelle", correct: 10, total: 12 },
      ],
    };
  }

  async connectedCallback() {
    if (this.shadow.childElementCount > 0) return;

    const response = await fetch("pages/page-activite/page-activite.html");
    const htmlContent = await response.text();

    const template = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("template");

    if (template) {
      this.shadow.appendChild(template.content.cloneNode(true));
    }

    this.renderStatistics();
  }

  renderStatistics() {
    this.renderActivityStats();
    this.renderQuizStats();
  }

  renderActivityStats() {
    const totals = this.activityStats.reduce(
      (acc, item) => {
        acc.completed += item.completed;
        acc.total += item.total;
        return acc;
      },
      { completed: 0, total: 0 },
    );

    const overallRate = this.toPercent(totals.completed, totals.total);

    this.setText("#kpi-activity-rate", `${overallRate}%`);
    this.setText("#kpi-activity-done", `${totals.completed} / ${totals.total}`);
    this.setText("#activity-overall-rate", `${overallRate}%`);

    const trend = overallRate >= 75 ? "+6% cette semaine" : "+2% cette semaine";
    this.setText("#kpi-activity-trend", trend);

    const list = this.shadow.querySelector("#activity-list");
    if (!list) return;

    list.innerHTML = "";

    this.activityStats.forEach((item) => {
      const rate = this.toPercent(item.completed, item.total);
      const row = document.createElement("div");
      row.className = "activity-row";
      row.innerHTML = `
        <div class="activity-row-head">
          <span>${item.name}</span>
          <strong>${item.completed}/${item.total} (${rate}%)</strong>
        </div>
        <div class="meter">
          <span style="width: ${rate}%"></span>
        </div>
      `;
      list.appendChild(row);
    });
  }

  renderQuizStats() {
    const { answered, correct, averageTimeSeconds, byCategory } =
      this.quizStats;
    const wrong = Math.max(answered - correct, 0);
    const successRate = this.toPercent(correct, answered);

    this.setText("#kpi-quiz-rate", `${successRate}%`);
    this.setText("#kpi-quiz-count", `${answered} questions repondues`);
    this.setText("#kpi-quiz-time", `${averageTimeSeconds}s`);

    this.setText("#quiz-score-tag", `${successRate}% correct`);
    this.setText("#quiz-ring-value", `${successRate}%`);
    this.setText("#quiz-correct-count", String(correct));
    this.setText("#quiz-wrong-count", String(wrong));

    const ring = this.shadow.querySelector("#quiz-ring");
    if (ring) {
      ring.style.setProperty("--score", `${successRate}%`);
    }

    const breakdown = this.shadow.querySelector("#quiz-breakdown");
    if (!breakdown) return;

    breakdown.innerHTML = "";

    byCategory.forEach((category) => {
      const rate = this.toPercent(category.correct, category.total);
      const block = document.createElement("div");
      block.className = "breakdown-row";
      block.innerHTML = `
        <div class="breakdown-head">
          <span>${category.label}</span>
          <strong>${rate}%</strong>
        </div>
        <div class="meter">
          <span style="width: ${rate}%"></span>
        </div>
      `;
      breakdown.appendChild(block);
    });
  }

  toPercent(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  setText(selector, value) {
    const element = this.shadow.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }
}

customElements.define("page-activite", PageActivite);
