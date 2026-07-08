const pages = {
    dashboard: `
    <h2>Dashboard</h2>
    <p>Your offline command centre for BusyBodyz Energy & Performance Solutions.</p>

    <div class="cards">
      <div class="card"><h3>Clients</h3><p>Track client profiles, notes, goals, assessments, and progress.</p></div>
      <div class="card"><h3>Invoices</h3><p>Create, save, print, and track invoice payments.</p></div>
      <div class="card"><h3>Services</h3><p>Manage service names, pricing, categories, and packages.</p></div>
      <div class="card"><h3>Marketing</h3><p>Track campaigns, physician outreach, leads, results, and revenue.</p></div>
    </div>
  `,

    clients: `
    <h2>Clients</h2>
    <p>Manage client profiles, goals, notes, assessments, and progress.</p>
    <button class="primary-btn">+ Add Client</button>
  `,

    services: `
    <h2>Services</h2>
    <p>Manage training services, coaching packages, pricing, and categories.</p>
    <button class="primary-btn">+ Add Service</button>
  `,

    invoices: `
    <h2>Invoices</h2>
    <p>Create invoices, track payments, and manage outstanding balances.</p>
    <button class="primary-btn">+ New Invoice</button>
  `,

    marketing: `
    <h2>Marketing</h2>
    <p>Track campaigns, physician outreach, leads, referrals, and campaign results.</p>
    <button class="primary-btn">+ New Campaign</button>
  `,

    reports: `
    <h2>Reports</h2>
    <p>View revenue, client growth, services, referrals, and marketing performance.</p>
  `,

    settings: `
    <h2>Settings</h2>
    <p>Manage business details, branding, invoice settings, and app preferences.</p>
  `
};

function loadPage(pageName) {
    const workspace = document.getElementById("workspace");
    workspace.innerHTML = pages[pageName];

    document.querySelectorAll(".sidebar button").forEach(button => {
        button.classList.remove("active");
    });

    document.querySelector(`[data-page="${pageName}"]`).classList.add("active");
}

document.querySelectorAll(".sidebar button").forEach(button => {
    button.addEventListener("click", () => {
        loadPage(button.dataset.page);
    });
});

loadPage("dashboard");