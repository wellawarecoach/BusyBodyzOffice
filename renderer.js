import { dashboardPage } from "./src/pages/dashboard.js";
import { clientsPage } from "./src/pages/clients.js";
import { servicesPage } from "./src/pages/services.js";
import { invoicesPage } from "./src/pages/invoices.js";
import { marketingPage } from "./src/pages/marketing.js";
import { reportsPage } from "./src/pages/reports.js";
import { settingsPage } from "./src/pages/settings.js";

const pageMeta = {
    dashboard: ["Dashboard", "Your BusyBodyz command centre."],
    clients: ["Clients", "Manage client profiles, notes, goals, assessments, and progress."],
    services: ["Services", "Manage services, pricing, packages, and categories."],
    invoices: ["Invoices", "Create invoices, track payments, and monitor outstanding balances."],
    marketing: ["Marketing", "Track campaigns, physician outreach, leads, and results."],
    reports: ["Reports", "Review revenue, growth, referrals, and business performance."],
    settings: ["Settings", "Manage business details, branding, invoice settings, and preferences."]
};

const pages = {
    dashboard: dashboardPage,
    clients: clientsPage,
    services: servicesPage,
    invoices: invoicesPage,
    marketing: marketingPage,
    reports: reportsPage,
    settings: settingsPage
};

function loadPage(pageName) {
    document.getElementById("workspace").innerHTML = pages[pageName]();

    document.getElementById("page-title").textContent = pageMeta[pageName][0];
    document.getElementById("page-subtitle").textContent = pageMeta[pageName][1];

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