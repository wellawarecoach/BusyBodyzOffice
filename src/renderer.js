import { dashboardPage } from "./pages/dashboard.js";
import { clientsPage } from "./pages/clients.js";
import { servicesPage } from "./pages/services.js";
import { invoicesPage } from "./pages/invoices.js";
import { marketingPage } from "./pages/marketing.js";
import { reportsPage } from "./pages/reports.js";
import { settingsPage } from "./pages/settings.js";
console.log(
    "Electron bridge:",
    window.busyBodyz?.appName,
    window.busyBodyz?.version
);
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

    document.querySelectorAll(".sidebar button").forEach((button) => {
        button.classList.remove("active");
    });

    document
        .querySelector(`[data-page="${pageName}"]`)
        .classList.add("active");
    if (pageName === "invoices") {
        initializeInvoicePage();
    }
}
async function initializeInvoicePage() {
    const chooseFolderButton = document.getElementById(
        "choose-invoice-folder"
    );

    const folderStatus = document.getElementById(
        "invoice-folder-status"
    );
    const clientNameInput = document.getElementById(
        "invoice-client-name"
    );

    const createClientFolderButton = document.getElementById(
        "create-client-folder"
    );

    const clientFolderStatus = document.getElementById(
        "client-folder-status"
    );
    if (!chooseFolderButton || !folderStatus) {
        return;
    }
    try {
        const savedFolder =
            await window.busyBodyz.getInvoiceFolder();

        if (savedFolder.success) {
            folderStatus.textContent =
                `Invoice folder: ${savedFolder.folderPath}`;
        }
    } catch (error) {
        console.error(
            "Unable to load saved invoice folder:",
            error
        );
    }
    chooseFolderButton.addEventListener("click", async () => {
        folderStatus.textContent = "Opening folder selector...";

        try {
            const result =
                await window.busyBodyz.chooseInvoiceFolder();

            if (result.canceled) {
                folderStatus.textContent =
                    "Folder selection canceled.";
                return;
            }

            if (!result.success) {
                folderStatus.textContent =
                    "Unable to select invoice folder.";
                return;
            }

            folderStatus.textContent =
                `Invoice folder: ${result.folderPath}`;
        } catch (error) {
            console.error(
                "Unable to choose invoice folder:",
                error
            );

            folderStatus.textContent =
                "An error occurred while selecting the folder.";
        }
    });
    if (
        clientNameInput &&
        createClientFolderButton &&
        clientFolderStatus
    ) {
        createClientFolderButton.addEventListener(
            "click",
            async () => {
                const clientName =
                    clientNameInput.value.trim();

                clientFolderStatus.textContent =
                    "Creating client folder...";

                try {
                    const result =
                        await window.busyBodyz
                            .createClientInvoiceFolder(
                                clientName
                            );

                    if (!result.success) {
                        clientFolderStatus.textContent =
                            result.message;
                        return;
                    }

                    clientFolderStatus.textContent =
                        `Client folder created: ${result.folderPath}`;

                    clientNameInput.value = "";
                } catch (error) {
                    console.error(
                        "Unable to create client folder:",
                        error
                    );

                    clientFolderStatus.textContent =
                        "An error occurred while creating the folder.";
                }
            }
        );
    }
}
document.querySelectorAll(".sidebar button").forEach((button) => {
    button.addEventListener("click", () => {
        loadPage(button.dataset.page);
    });
});

loadPage("dashboard");