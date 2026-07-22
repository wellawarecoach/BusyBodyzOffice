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
    if (pageName === "clients") {
        initializeClientsPage();
    }
}
async function initializeClientsPage() {
    const addClientButton = document.getElementById(
        "add-client-button"
    );

    const cancelClientButton = document.getElementById(
        "cancel-client-button"
    );

    const clientFormPanel = document.getElementById(
        "client-form-panel"
    );

    const firstNameInput = document.getElementById(
        "client-first-name"
    );

    const clientForm = document.getElementById(
        "client-form"
    );

    const clientEmptyState = document.getElementById(
        "client-list-empty-state"
    );

    const clientList = document.getElementById(
        "client-list"
    );

    if (
        !addClientButton ||
        !cancelClientButton ||
        !clientFormPanel ||
        !clientForm ||
        !clientEmptyState ||
        !clientList
    ) {
        return;
    }
    function renderClientCard(client) {
        const clientCard = document.createElement("div");

        clientCard.className = "client-card";

        clientCard.innerHTML = `
        <div>
            <h4>
                ${client.firstName} ${client.lastName}
            </h4>

            <p>
                ${client.email || "No email provided"}
            </p>

            <p>
                ${client.phone || "No phone provided"}
            </p>
        </div>
    `;

        clientList.appendChild(clientCard);
    }
    try {
        const result = await window.busyBodyz.getClients();

        if (result.success && result.clients.length > 0) {
            result.clients.forEach((client) => {
                renderClientCard(client);
            });

            clientEmptyState.hidden = true;
            clientList.hidden = false;
        }
    } catch (error) {
        console.error("Unable to load clients:", error);
    }
    addClientButton.addEventListener("click", () => {
        clientFormPanel.hidden = false;

        if (firstNameInput) {
            firstNameInput.focus();
        }
    });

    cancelClientButton.addEventListener("click", () => {
        clientForm.reset();
        clientFormPanel.hidden = true;
    });

    clientForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const firstName = document
            .getElementById("client-first-name")
            .value
            .trim();

        const lastName = document
            .getElementById("client-last-name")
            .value
            .trim();

        const email = document
            .getElementById("client-email")
            .value
            .trim();

        const phone = document
            .getElementById("client-phone")
            .value
            .trim();

        try {
            const result = await window.busyBodyz.saveClient({
                firstName,
                lastName,
                email,
                phone
            });

            if (!result.success) {
                console.error(
                    "Unable to save client:",
                    result.message
                );

                return;
            }

            const client = result.client;

            renderClientCard(client);

            clientEmptyState.hidden = true;
            clientList.hidden = false;

            clientForm.reset();
            clientFormPanel.hidden = true;
        } catch (error) {
            console.error("Unable to save client:", error);
        }
    });
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