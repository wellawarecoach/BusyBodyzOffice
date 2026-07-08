const pageMeta = {
    dashboard: {
        title: "Dashboard",
        subtitle: "Your BusyBodyz command centre."
    },
    clients: {
        title: "Clients",
        subtitle: "Manage client profiles, notes, goals, assessments, and progress."
    },
    services: {
        title: "Services",
        subtitle: "Manage services, pricing, packages, and categories."
    },
    invoices: {
        title: "Invoices",
        subtitle: "Create invoices, track payments, and monitor outstanding balances."
    },
    marketing: {
        title: "Marketing",
        subtitle: "Track campaigns, physician outreach, leads, and results."
    },
    reports: {
        title: "Reports",
        subtitle: "Review revenue, growth, referrals, and business performance."
    },
    settings: {
        title: "Settings",
        subtitle: "Manage business details, branding, invoice settings, and preferences."
    }
};

const pages = {
    dashboard: `
    <div class="cards">
      <div class="card"><h3>Clients</h3><p>Track client profiles, notes, goals, assessments, and progress.</p></div>
      <div class="card"><h3>Invoices</h3><p>Create, save, print, and track invoice payments.</p></div>
      <div class="card"><h3>Services</h3><p>Manage service names, pricing, categories, and packages.</p></div>
      <div class="card"><h3>Marketing</h3><p>Track campaigns, physician outreach, leads, results, and revenue.</p></div>
    </div>
  `,

    clients: `
    <div class="page-card">
      <h3>Client Management</h3>
      <p>This will become the central CRM for BusyBodyzOffice.</p>
      <button class="primary-btn">+ Add Client</button>
    </div>
  `,

    services: `
    <div class="page-card">
      <h3>Services</h3>
      <p>Manage coaching services, reset sessions, packages, and pricing.</p>
      <button class="primary-btn">+ Add Service</button>
    </div>
  `,

    invoices: `
    <div class="page-card">
      <h3>Invoices</h3>
      <p>Create invoices, track payments, and manage outstanding balances.</p>
      <button class="primary-btn">+ New Invoice</button>
    </div>
  `,

    marketing: `
    <div class="page-card">
      <h3>Marketing Campaigns</h3>
      <p>Track physician outreach, QR campaigns, referrals, and campaign results.</p>
      <button class="primary-btn">+ New Campaign</button>
    </div>
  `,

    reports: `
    <div class="page-card">
      <h3>Reports</h3>
      <p>View revenue, client growth, services, referrals, and marketing performance.</p>
    </div>
  `,

    settings: `
    <div class="page-card">
      <h3>Settings</h3>
      <p>Manage BusyBodyzOffice preferences and business information.</p>
    </div>
  `
};

function loadPage(pageName) {
    document.getElementById("workspace").innerHTML = pages[pageName];
    document.getElementById("page-title").textContent = pageMeta[pageName].title;
    document.getElementById("page-subtitle").textContent = pageMeta[pageName].subtitle;

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