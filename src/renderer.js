import { dashboardPage } from "./pages/dashboard.js";
import { clientsPage } from "./pages/clients.js";
import { servicesPage } from "./pages/services.js";
import { invoicesPage } from "./pages/invoices.js";
import { marketingPage } from "./pages/marketing.js";
import { reportsPage } from "./pages/reports.js";
import { settingsPage } from "./pages/settings.js";
import { getClientProfilePage } from "./pages/client-profile.js";
import { getClientPersonalInformationPage } from "./pages/client-personal-information.js";
import { getClientProgramsPage } from "./pages/client-programs.js";
import { getClientAssessmentsPage } from "./pages/client-assessments.js";
import { getAssessmentTemplatesPage } from "./pages/assessment-templates.js";
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

    const activeSidebarButton = document.querySelector(
        `[data-page="${pageName}"]`
    );

    if (activeSidebarButton) {
        activeSidebarButton.classList.add("active");
    }
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
        clientCard.dataset.clientId = client.id;

        clientCard.innerHTML = `
      
    <div class="client-card-header">
        <h3>
            ${client.firstName} ${client.lastName}
        </h3>

        <span class="client-status">
            Active
        </span>
    </div>

    <div class="client-card-body">

        <p><strong>Email:</strong>
        ${client.email || "—"}</p>

        <p><strong>Phone:</strong>
        ${client.phone || "—"}</p>

    </div>

    <div class="client-card-footer">

        <button
            class="secondary-btn client-view-button"
            data-client-id="${client.id}"
        >
            View Profile
        </button>

    </div>
`;
        const viewButton = clientCard.querySelector(".client-view-button");

        viewButton.addEventListener("click", () => {
            const workspace = document.getElementById("workspace");

            workspace.innerHTML = getClientProfilePage(client);

            initializeClientProfilePage(client);
        });

        return clientCard;
    }
    try {
        const result = await window.busyBodyz.getClients();

        if (result.success && result.clients.length > 0) {
            result.clients.forEach((client) => {
                const clientCard = renderClientCard(client);
                clientList.appendChild(clientCard);
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
                alert(
                    result.message ||
                    "Unable to save the client."
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
function initializeClientProfilePage(client) {
    const backButton = document.getElementById(
        "back-to-clients-button"
    );
    const programsButton = document.getElementById(
        "programs-button"
    );
    const assessmentsButton = document.getElementById(
        "assessments-button"
    );
    const personalInformationButton = document.getElementById(
        "personal-information-button"
    );
    if (!backButton) {
        return;
    }

    backButton.addEventListener("click", () => {
        loadPage("clients");
    });
    function initializeClientPersonalInformationPage(client) {
        const backButton = document.getElementById(
            "back-to-client-profile-button"
        );
        const editButton = document.getElementById(
            "edit-client-information-button"
        );

        const cancelButton = document.getElementById(
            "cancel-client-information-button"
        );

        const informationDisplay = document.getElementById(
            "client-information-display"
        );

        const informationForm = document.getElementById(
            "client-information-form"
        );
        const firstNameInput = document.getElementById(
            "client-first-name-input"
        );

        const lastNameInput = document.getElementById(
            "client-last-name-input"
        );

        const emailInput = document.getElementById(
            "client-email-input"
        );

        const phoneInput = document.getElementById(
            "client-phone-input"
        );

        const addressInput = document.getElementById(
            "client-address-input"
        );
        const saveButton = document.getElementById(
            "save-client-information-button"
        );
        if (!backButton) {
            return;
        }

        backButton.addEventListener("click", () => {
            const workspace = document.getElementById("workspace");

            workspace.innerHTML = getClientProfilePage(client);

            initializeClientProfilePage(client);
        });
        if (
            editButton &&
            cancelButton &&
            informationDisplay &&
            informationForm
        ) {
            editButton.addEventListener("click", () => {
                informationDisplay.classList.add("hidden");
                informationForm.classList.remove("hidden");
                editButton.classList.add("hidden");
                cancelButton.classList.remove("hidden");
            });

            cancelButton.addEventListener("click", () => {
                informationDisplay.classList.remove("hidden");
                informationForm.classList.add("hidden");
                editButton.classList.remove("hidden");
                cancelButton.classList.add("hidden");
            });
        }
        console.log("Personal information elements:", {
            informationForm,
            firstNameInput,
            lastNameInput,
            emailInput,
            phoneInput,
            addressInput
        });
        if (
            saveButton &&
            firstNameInput &&
            lastNameInput &&
            emailInput &&
            phoneInput &&
            addressInput
        ) {
            saveButton.addEventListener("click", async () => {
                const updatedClient = {
                    ...client,
                    firstName: firstNameInput.value.trim(),
                    lastName: lastNameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    address: addressInput.value.trim()
                };

                try {
                    const result =
                        await window.busyBodyz.updateClient(updatedClient);

                    if (!result.success) {
                        alert(
                            result.message ||
                            result.error ||
                            "Unable to update the client."
                        );

                        return;
                    }

                    const savedClient = result.client;

                    const workspace =
                        document.getElementById("workspace");

                    workspace.innerHTML =
                        getClientPersonalInformationPage(savedClient);

                    initializeClientPersonalInformationPage(savedClient);
                } catch (error) {
                    console.error(
                        "Unable to update client information:",
                        error
                    );

                    alert(
                        "An unexpected error occurred while updating the client."
                    );
                }
            });
        }
    }
    function initializeClientProgramsPage(client) {
        const backButton = document.getElementById(
            "back-to-client-profile-button"
        );

        const addProgramButton = document.getElementById(
            "add-client-program-button"
        );

        const cancelProgramButton = document.getElementById(
            "cancel-client-program-button"
        );

        const programFormPanel = document.getElementById(
            "client-program-form-panel"
        );

        const programForm = document.getElementById(
            "client-program-form"
        );

        const programNameInput = document.getElementById(
            "client-program-name"
        );
        const programFormHeading = document.querySelector(
            "#client-program-form .form-section-heading h3"
        );

        const saveProgramButton = document.getElementById(
            "save-client-program-button"
        );
        if (!backButton) {
            return;
        }

        backButton.addEventListener("click", () => {
            const workspace =
                document.getElementById("workspace");

            workspace.innerHTML =
                getClientProfilePage(client);

            initializeClientProfilePage(client);
        });

        if (
            addProgramButton &&
            programFormPanel &&
            programForm
        ) {
            addProgramButton.addEventListener("click", () => {
                programForm.reset();

                delete programForm.dataset.editingProgramId;

                if (programFormHeading) {
                    programFormHeading.textContent =
                        "Add Program";
                }

                if (saveProgramButton) {
                    saveProgramButton.textContent =
                        "Save Program";
                }

                programFormPanel.classList.remove("hidden");

                if (programNameInput) {
                    programNameInput.focus();
                }
            });
        }

        if (
            cancelProgramButton &&
            programFormPanel &&
            programForm
        ) {
            cancelProgramButton.addEventListener("click", () => {
                programForm.reset();

                delete programForm.dataset.editingProgramId;

                if (programFormHeading) {
                    programFormHeading.textContent =
                        "Add Program";
                }

                if (saveProgramButton) {
                    saveProgramButton.textContent =
                        "Save Program";
                }

                programFormPanel.classList.add("hidden");
            });
        }
        if (programForm) {
            programForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const programName = document
                    .getElementById("client-program-name")
                    .value
                    .trim();

                const programType = document
                    .getElementById("client-program-type")
                    .value
                    .trim();

                const startDate = document
                    .getElementById("client-program-start-date")
                    .value
                    .trim();

                const endDate = document
                    .getElementById("client-program-end-date")
                    .value
                    .trim();
                if (
                    startDate &&
                    endDate &&
                    endDate < startDate
                ) {
                    alert(
                        "End Date cannot be earlier than Start Date."
                    );

                    return;
                }
                const status = document
                    .getElementById("client-program-status")
                    .value
                    .trim();

                const notes = document
                    .getElementById("client-program-notes")
                    .value
                    .trim();

                const editingProgramId =
                    programForm.dataset.editingProgramId || "";

                try {
                    let result;

                    if (editingProgramId) {
                        result =
                            await window.busyBodyz.updateClientProgram({
                                clientId: client.id,
                                programId: editingProgramId,
                                program: {
                                    programName,
                                    programType,
                                    startDate,
                                    endDate,
                                    status,
                                    notes
                                }
                            });
                    } else {
                        result =
                            await window.busyBodyz.addClientProgram({
                                clientId: client.id,
                                program: {
                                    programName,
                                    programType,
                                    startDate,
                                    endDate,
                                    status,
                                    notes
                                }
                            });
                    }

                    if (!result.success) {
                        alert(
                            result.error ||
                            "Unable to save the program."
                        );

                        return;
                    }

                    const updatedClient =
                        result.client;

                    const workspace =
                        document.getElementById("workspace");

                    workspace.innerHTML =
                        getClientProgramsPage(updatedClient);

                    initializeClientProgramsPage(
                        updatedClient
                    );
                } catch (error) {
                    console.error(
                        "Unable to save client program:",
                        error
                    );

                    alert(
                        "An unexpected error occurred while saving the program."
                    );
                }
            });
        }
        const editProgramButtons =
            document.querySelectorAll(
                ".edit-client-program-button"
            );

        editProgramButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const programId =
                    button.dataset.programId;

                if (!programId) {
                    return;
                }

                const programs =
                    Array.isArray(client.programs)
                        ? client.programs
                        : [];

                const program = programs.find(
                    (item) => item.id === programId
                );

                if (!program) {
                    alert("Program not found.");
                    return;
                }

                const programNameInput =
                    document.getElementById(
                        "client-program-name"
                    );

                const programTypeInput =
                    document.getElementById(
                        "client-program-type"
                    );

                const startDateInput =
                    document.getElementById(
                        "client-program-start-date"
                    );

                const endDateInput =
                    document.getElementById(
                        "client-program-end-date"
                    );

                const statusInput =
                    document.getElementById(
                        "client-program-status"
                    );

                const notesInput =
                    document.getElementById(
                        "client-program-notes"
                    );

                if (
                    !programFormPanel ||
                    !programForm ||
                    !programNameInput ||
                    !programTypeInput ||
                    !startDateInput ||
                    !endDateInput ||
                    !statusInput ||
                    !notesInput
                ) {
                    return;
                }

                programForm.dataset.editingProgramId =
                    program.id;
                if (programFormHeading) {
                    programFormHeading.textContent =
                        "Edit Program";
                }

                if (saveProgramButton) {
                    saveProgramButton.textContent =
                        "Update Program";
                }
                programNameInput.value =
                    program.programName || "";

                programTypeInput.value =
                    program.programType || "";

                startDateInput.value =
                    program.startDate || "";

                endDateInput.value =
                    program.endDate || "";

                statusInput.value =
                    program.status || "Active";

                notesInput.value =
                    program.notes || "";

                programFormPanel.classList.remove(
                    "hidden"
                );

                programNameInput.focus();
            });
        });
        const deleteProgramButtons =
            document.querySelectorAll(
                ".delete-client-program-button"
            );

        deleteProgramButtons.forEach((button) => {
            button.addEventListener("click", async () => {
                const programId =
                    button.dataset.programId;

                if (!programId) {
                    return;
                }

                const confirmed = confirm(
                    "Delete this program?"
                );

                if (!confirmed) {
                    return;
                }

                try {
                    const result =
                        await window.busyBodyz.deleteClientProgram({
                            clientId: client.id,
                            programId
                        });

                    if (!result.success) {
                        alert(
                            result.error ||
                            "Unable to delete the program."
                        );

                        return;
                    }

                    const updatedClient =
                        result.client;

                    const workspace =
                        document.getElementById("workspace");

                    workspace.innerHTML =
                        getClientProgramsPage(updatedClient);

                    initializeClientProgramsPage(
                        updatedClient
                    );
                } catch (error) {
                    console.error(
                        "Unable to delete client program:",
                        error
                    );

                    alert(
                        "An unexpected error occurred while deleting the program."
                    );
                }
            });
        });
    }
    function initializeClientAssessmentsPage(client) {
        const backButton = document.getElementById(
            "back-to-client-profile-button"
        );

        const manageTemplatesButton = document.getElementById(
            "manage-assessment-templates-button"
        );

        if (!backButton) {
            return;
        }

        backButton.addEventListener("click", () => {
            const workspace =
                document.getElementById("workspace");

            workspace.innerHTML =
                getClientProfilePage(client);

            initializeClientProfilePage(client);
        });

        if (manageTemplatesButton) {
            manageTemplatesButton.addEventListener("click", () => {
                const workspace =
                    document.getElementById("workspace");

                workspace.innerHTML =
                    getAssessmentTemplatesPage(client);

                initializeAssessmentTemplatesPage(client);
            });
        }
    }
    async function initializeAssessmentTemplatesPage(client) {
        const backButton = document.getElementById(
            "back-to-client-assessments-button"
        );

        const addTemplateButton = document.getElementById(
            "add-assessment-template-button"
        );

        const cancelTemplateButton = document.getElementById(
            "cancel-assessment-template-button"
        );

        const templateFormPanel = document.getElementById(
            "assessment-template-form-panel"
        );

        const templateForm = document.getElementById(
            "assessment-template-form"
        );

        const templateNameInput = document.getElementById(
            "assessment-template-name"
        );

        const templatesList = document.getElementById(
            "assessment-templates-list"
        );
        const addQuestionButton = document.getElementById(
            "add-assessment-question-button"
        );

        const questionsList = document.getElementById(
            "assessment-template-questions-list"
        );
        if (!backButton) {
            return;
        }

        async function renderAssessmentTemplates() {
            if (!templatesList) {
                return;
            }

            try {
                const result =
                    await window.busyBodyz.getAssessmentTemplates();

                if (!result.success) {
                    templatesList.innerHTML = "";

                    const errorState =
                        document.createElement("div");

                    errorState.className = "empty-state";

                    const heading =
                        document.createElement("h3");

                    heading.textContent =
                        "Unable to load assessment templates";

                    const message =
                        document.createElement("p");

                    message.textContent =
                        result.error ||
                        "Assessment templates could not be loaded.";

                    errorState.appendChild(heading);
                    errorState.appendChild(message);

                    templatesList.appendChild(errorState);

                    return;
                }

                const templates = result.templates || [];

                templatesList.innerHTML = "";

                if (templates.length === 0) {
                    const emptyState =
                        document.createElement("div");

                    emptyState.className = "empty-state";

                    const heading =
                        document.createElement("h3");

                    heading.textContent =
                        "No assessment templates yet";

                    const message =
                        document.createElement("p");

                    message.textContent =
                        "Create your first assessment template to begin building editable questions and testing protocols.";

                    emptyState.appendChild(heading);
                    emptyState.appendChild(message);

                    templatesList.appendChild(emptyState);

                    return;
                }

                templates.forEach((template) => {
                    const card =
                        document.createElement("div");

                    card.className =
                        "assessment-template-card";

                    const header =
                        document.createElement("div");

                    header.className =
                        "assessment-template-card-header";

                    const titleArea =
                        document.createElement("div");

                    const title =
                        document.createElement("h3");

                    title.textContent =
                        template.templateName ||
                        "Unnamed Template";

                    const meta =
                        document.createElement("p");

                    const category =
                        template.category ||
                        "Uncategorized";

                    const version =
                        template.version ||
                        "1.0";

                    meta.textContent =
                        `${category} • Version ${version}`;

                    titleArea.appendChild(title);
                    titleArea.appendChild(meta);

                    const status =
                        document.createElement("span");

                    status.className =
                        "assessment-template-status";

                    status.textContent =
                        template.status ||
                        "Active";

                    header.appendChild(titleArea);
                    header.appendChild(status);

                    card.appendChild(header);

                    if (template.description) {
                        const description =
                            document.createElement("p");

                        description.className =
                            "assessment-template-description";

                        description.textContent =
                            template.description;

                        card.appendChild(description);
                    }

                    const actions =
                        document.createElement("div");

                    actions.className =
                        "assessment-template-card-actions";

                    const editButton =
                        document.createElement("button");

                    editButton.type = "button";
                    editButton.className = "secondary-btn";
                    editButton.textContent = "Edit";

                    editButton.addEventListener("click", () => {
                        const categoryInput =
                            document.getElementById(
                                "assessment-template-category"
                            );

                        const versionInput =
                            document.getElementById(
                                "assessment-template-version"
                            );

                        const statusInput =
                            document.getElementById(
                                "assessment-template-status"
                            );

                        const descriptionInput =
                            document.getElementById(
                                "assessment-template-description"
                            );

                        const saveButton =
                            document.getElementById(
                                "save-assessment-template-button"
                            );

                        const formHeading =
                            templateFormPanel?.querySelector(
                                ".form-section-heading h3"
                            );

                        if (
                            !templateForm ||
                            !templateFormPanel ||
                            !templateNameInput
                        ) {
                            return;
                        }

                        templateForm.dataset.editingTemplateId =
                            template.id;

                        templateNameInput.value =
                            template.templateName || "";

                        if (categoryInput) {
                            categoryInput.value =
                                template.category || "";
                        }

                        if (versionInput) {
                            versionInput.value =
                                template.version || "1.0";
                        }

                        if (statusInput) {
                            statusInput.value =
                                template.status || "Active";
                        }

                        if (descriptionInput) {
                            descriptionInput.value =
                                template.description || "";
                        }
                        if (questionsList) {
                            questionsList.innerHTML = "";

                            const savedQuestions =
                                Array.isArray(template.questions)
                                    ? template.questions
                                    : [];

                            savedQuestions.forEach((question) => {
                                const questionRow =
                                    document.createElement("div");

                                questionRow.className =
                                    "assessment-template-question-row";

                                if (
                                    typeof question === "object" &&
                                    question?.id
                                ) {
                                    questionRow.dataset.questionId =
                                        String(question.id);
                                }
                                const questionLabel =
                                    document.createElement("label");

                                questionLabel.textContent =
                                    "Question";

                                const questionInput =
                                    document.createElement("input");

                                questionInput.type = "text";
                                questionInput.className =
                                    "assessment-template-question-input";

                                questionInput.placeholder =
                                    "Enter assessment question";

                                const questionText =
                                    typeof question === "string"
                                        ? question
                                        : String(
                                            question?.text || ""
                                        );

                                questionInput.value =
                                    questionText;

                                questionLabel.appendChild(
                                    questionInput
                                );

                                questionRow.appendChild(
                                    questionLabel
                                );

                                const requiredLabel =
                                    document.createElement("label");

                                const requiredCheckbox =
                                    document.createElement("input");

                                requiredCheckbox.type = "checkbox";
                                requiredCheckbox.className =
                                    "assessment-template-question-required";

                                requiredCheckbox.checked =
                                    typeof question === "object"
                                        ? Boolean(question?.required)
                                        : false;

                                requiredLabel.appendChild(
                                    requiredCheckbox
                                );

                                requiredLabel.appendChild(
                                    document.createTextNode(" Required")
                                );

                                questionRow.appendChild(
                                    requiredLabel
                                );

                                const moveUpButton =
                                    document.createElement("button");

                                moveUpButton.type = "button";
                                moveUpButton.className =
                                    "secondary-btn";

                                moveUpButton.textContent =
                                    "Move Up";

                                moveUpButton.addEventListener(
                                    "click",
                                    () => {
                                        const previousRow =
                                            questionRow.previousElementSibling;

                                        if (previousRow) {
                                            questionsList.insertBefore(
                                                questionRow,
                                                previousRow
                                            );
                                        }
                                    }
                                );

                                const moveDownButton =
                                    document.createElement("button");

                                moveDownButton.type = "button";
                                moveDownButton.className =
                                    "secondary-btn";

                                moveDownButton.textContent =
                                    "Move Down";

                                moveDownButton.addEventListener(
                                    "click",
                                    () => {
                                        const nextRow =
                                            questionRow.nextElementSibling;

                                        if (nextRow) {
                                            questionsList.insertBefore(
                                                nextRow,
                                                questionRow
                                            );
                                        }
                                    }
                                );
                                const duplicateQuestionButton =
                                    document.createElement("button");

                                duplicateQuestionButton.type = "button";
                                duplicateQuestionButton.className =
                                    "secondary-btn";

                                duplicateQuestionButton.textContent =
                                    "Duplicate Question";

                                duplicateQuestionButton.addEventListener(
                                    "click",
                                    () => {
                                        const questionText =
                                            questionInput.value;

                                        const responseType =
                                            responseTypeSelect.value;

                                        const required =
                                            requiredCheckbox.checked;

                                        const optionValues =
                                            Array.from(
                                                questionRow.querySelectorAll(
                                                    ".assessment-template-multiple-choice-option-input"
                                                )
                                            ).map((optionInput) =>
                                                optionInput.value
                                            );

                                        const existingRows =
                                            new Set(
                                                Array.from(
                                                    questionsList.children
                                                )
                                            );

                                        addQuestionButton.click();

                                        const duplicateRow =
                                            Array.from(
                                                questionsList.children
                                            ).find(
                                                (row) =>
                                                    !existingRows.has(row)
                                            );

                                        if (!duplicateRow) {
                                            return;
                                        }

                                        const duplicateQuestionInput =
                                            duplicateRow.querySelector(
                                                ".assessment-template-question-input"
                                            );

                                        const duplicateResponseTypeSelect =
                                            duplicateRow.querySelector(
                                                ".assessment-template-question-response-type"
                                            );

                                        const duplicateRequiredCheckbox =
                                            duplicateRow.querySelector(
                                                ".assessment-template-question-required"
                                            );

                                        if (duplicateQuestionInput) {
                                            duplicateQuestionInput.value =
                                                questionText;
                                        }

                                        if (duplicateRequiredCheckbox) {
                                            duplicateRequiredCheckbox.checked =
                                                required;
                                        }

                                        if (duplicateResponseTypeSelect) {
                                            duplicateResponseTypeSelect.value =
                                                responseType;

                                            duplicateResponseTypeSelect.dispatchEvent(
                                                new Event("change")
                                            );
                                        }

                                        if (
                                            responseType ===
                                            "multiple-choice"
                                        ) {
                                            const getDuplicateOptionInputs =
                                                () =>
                                                    Array.from(
                                                        duplicateRow.querySelectorAll(
                                                            ".assessment-template-multiple-choice-option-input"
                                                        )
                                                    );

                                            const addOptionButton =
                                                Array.from(
                                                    duplicateRow.querySelectorAll(
                                                        ".assessment-template-multiple-choice-options button"
                                                    )
                                                ).find(
                                                    (button) =>
                                                        button.textContent ===
                                                        "+ Add Option"
                                                );

                                            optionValues.forEach(
                                                (optionValue, index) => {
                                                    let optionInputs =
                                                        getDuplicateOptionInputs();

                                                    if (
                                                        index >=
                                                        optionInputs.length &&
                                                        addOptionButton
                                                    ) {
                                                        addOptionButton.click();

                                                        optionInputs =
                                                            getDuplicateOptionInputs();
                                                    }

                                                    if (optionInputs[index]) {
                                                        optionInputs[index].value =
                                                            optionValue;
                                                    }
                                                }
                                            );
                                        }

                                        questionsList.insertBefore(
                                            duplicateRow,
                                            questionRow.nextElementSibling
                                        );

                                        duplicateQuestionInput?.focus();
                                    }
                                );
                                const removeQuestionButton =
                                    document.createElement("button");

                                removeQuestionButton.type = "button";
                                removeQuestionButton.className =
                                    "secondary-btn";

                                removeQuestionButton.textContent =
                                    "Remove Question";

                                removeQuestionButton.addEventListener(
                                    "click",
                                    () => {
                                        questionRow.remove();
                                    }
                                );

                                questionRow.appendChild(
                                    moveUpButton
                                );

                                questionRow.appendChild(
                                    moveDownButton
                                );

                                questionRow.appendChild(
                                    duplicateQuestionButton
                                );

                                questionRow.appendChild(
                                    removeQuestionButton
                                );
                                const responseTypeLabel =
                                    document.createElement("label");

                                responseTypeLabel.textContent =
                                    "Response Type";

                                const responseTypeSelect =
                                    document.createElement("select");

                                responseTypeSelect.className =
                                    "assessment-template-question-response-type";

                                const responseTypes = [
                                    {
                                        value: "text",
                                        label: "Text"
                                    },
                                    {
                                        value: "number",
                                        label: "Number"
                                    },
                                    {
                                        value: "yes-no",
                                        label: "Yes / No"
                                    },
                                    {
                                        value: "multiple-choice",
                                        label: "Multiple Choice"
                                    }
                                ];

                                responseTypes.forEach((responseType) => {
                                    const option =
                                        document.createElement("option");

                                    option.value =
                                        responseType.value;

                                    option.textContent =
                                        responseType.label;

                                    responseTypeSelect.appendChild(
                                        option
                                    );
                                });

                                responseTypeSelect.value =
                                    typeof question === "object"
                                        ? question?.responseType || "text"
                                        : "text";

                                responseTypeLabel.appendChild(
                                    responseTypeSelect
                                );

                                questionRow.appendChild(
                                    responseTypeLabel
                                );
                                const savedOptions =
                                    typeof question === "object" &&
                                        Array.isArray(question?.options)
                                        ? question.options
                                        : [];

                                const {
                                    optionsContainer,
                                    addOption
                                } = createMultipleChoiceOptionsEditor(
                                    questionRow,
                                    savedOptions
                                );

                                const updateMultipleChoiceOptionsVisibility =
                                    () => {
                                        const isMultipleChoice =
                                            responseTypeSelect.value ===
                                            "multiple-choice";

                                        optionsContainer.classList.toggle(
                                            "hidden",
                                            !isMultipleChoice
                                        );

                                        if (
                                            isMultipleChoice &&
                                            !optionsContainer.querySelector(
                                                ".assessment-template-multiple-choice-option-input"
                                            )
                                        ) {
                                            addOption();
                                        }
                                    };

                                responseTypeSelect.addEventListener(
                                    "change",
                                    updateMultipleChoiceOptionsVisibility
                                );

                                updateMultipleChoiceOptionsVisibility();
                                questionsList.appendChild(
                                    questionRow
                                );
                            });
                        }
                        if (formHeading) {
                            formHeading.textContent =
                                "Edit Assessment Template";
                        }

                        if (saveButton) {
                            saveButton.textContent =
                                "Update Template";

                            saveButton.disabled = false;
                        }

                        templateFormPanel.classList.remove(
                            "hidden"
                        );

                        templateFormPanel.scrollIntoView({
                            block: "start"
                        });
                    });

                    const deleteButton =
                        document.createElement("button");



                    deleteButton.type = "button";
                    deleteButton.className = "secondary-btn";
                    deleteButton.textContent = "Delete";

                    deleteButton.addEventListener(
                        "click",
                        async () => {
                            const confirmed = window.confirm(
                                `Delete "${template.templateName}"?`
                            );

                            if (!confirmed) {
                                return;
                            }

                            try {
                                const result =
                                    await window.busyBodyz.deleteAssessmentTemplate(
                                        template.id
                                    );

                                if (!result.success) {
                                    alert(
                                        result.error ||
                                        "Unable to delete the assessment template."
                                    );

                                    return;
                                }

                                if (
                                    templateForm?.dataset.editingTemplateId ===
                                    template.id
                                ) {
                                    templateForm.reset();
                                    if (questionsList) {
                                        questionsList.innerHTML = "";
                                    }
                                    delete templateForm.dataset.editingTemplateId;

                                    const saveButton =
                                        document.getElementById(
                                            "save-assessment-template-button"
                                        );

                                    const formHeading =
                                        templateFormPanel?.querySelector(
                                            ".form-section-heading h3"
                                        );

                                    if (formHeading) {
                                        formHeading.textContent =
                                            "New Assessment Template";
                                    }

                                    if (saveButton) {
                                        saveButton.textContent =
                                            "Save Template";

                                        saveButton.disabled = false;
                                    }

                                    templateFormPanel.classList.add(
                                        "hidden"
                                    );
                                }

                                await renderAssessmentTemplates();

                                alert(
                                    "Assessment template deleted."
                                );
                            } catch (error) {
                                console.error(
                                    "Unable to delete assessment template:",
                                    error
                                );

                                alert(
                                    "An unexpected error occurred while deleting the assessment template."
                                );
                            }
                        }
                    );

                    actions.appendChild(editButton);
                    actions.appendChild(deleteButton);

                    card.appendChild(actions);

                    templatesList.appendChild(card);
                });
            } catch (error) {
                console.error(
                    "Unable to load assessment templates:",
                    error
                );

                templatesList.innerHTML = "";

                const errorState =
                    document.createElement("div");

                errorState.className = "empty-state";

                const heading =
                    document.createElement("h3");

                heading.textContent =
                    "Unable to load assessment templates";

                const message =
                    document.createElement("p");

                message.textContent =
                    "An unexpected error occurred while loading assessment templates.";

                errorState.appendChild(heading);
                errorState.appendChild(message);

                templatesList.appendChild(errorState);
            }
        }
        backButton.addEventListener("click", () => {
            const workspace =
                document.getElementById("workspace");

            workspace.innerHTML =
                getClientAssessmentsPage(client);

            initializeClientAssessmentsPage(client);
        });

        if (
            addTemplateButton &&
            templateFormPanel &&
            templateForm
        ) {
            addTemplateButton.addEventListener("click", () => {
                templateForm.reset();
                if (questionsList) {
                    questionsList.innerHTML = "";
                }
                delete templateForm.dataset.editingTemplateId;

                const saveButton =
                    document.getElementById(
                        "save-assessment-template-button"
                    );

                const formHeading =
                    templateFormPanel.querySelector(
                        ".form-section-heading h3"
                    );

                if (formHeading) {
                    formHeading.textContent =
                        "New Assessment Template";
                }

                if (saveButton) {
                    saveButton.textContent =
                        "Save Template";

                    saveButton.disabled = false;
                }

                templateFormPanel.classList.remove(
                    "hidden"
                );

                if (templateNameInput) {
                    templateNameInput.focus();
                }
            });
        }

        if (
            cancelTemplateButton &&
            templateFormPanel &&
            templateForm
        ) {
            cancelTemplateButton.addEventListener("click", () => {
                templateForm.reset();
                if (questionsList) {
                    questionsList.innerHTML = "";
                }
                templateFormPanel.classList.add(
                    "hidden"
                );
            });
        }
        function createMultipleChoiceOptionsEditor(
            questionRow,
            initialOptions = []
        ) {
            const optionsContainer =
                document.createElement("div");

            optionsContainer.className =
                "assessment-template-multiple-choice-options";

            const optionsList =
                document.createElement("div");

            optionsList.className =
                "assessment-template-multiple-choice-options-list";

            function addOption(optionText = "") {
                const optionRow =
                    document.createElement("div");

                optionRow.className =
                    "assessment-template-multiple-choice-option-row";

                const optionInput =
                    document.createElement("input");

                optionInput.type = "text";
                optionInput.className =
                    "assessment-template-multiple-choice-option-input";

                optionInput.placeholder =
                    "Enter option";

                optionInput.value =
                    String(optionText || "");

                const removeOptionButton =
                    document.createElement("button");

                removeOptionButton.type = "button";
                removeOptionButton.className =
                    "secondary-btn";

                removeOptionButton.textContent =
                    "Remove";

                removeOptionButton.addEventListener(
                    "click",
                    () => {
                        optionRow.remove();
                    }
                );

                optionRow.appendChild(optionInput);
                optionRow.appendChild(removeOptionButton);

                optionsList.appendChild(optionRow);
            }

            const addOptionButton =
                document.createElement("button");

            addOptionButton.type = "button";
            addOptionButton.className =
                "secondary-btn";

            addOptionButton.textContent =
                "+ Add Option";

            addOptionButton.addEventListener(
                "click",
                () => {
                    addOption();
                }
            );

            initialOptions.forEach((option) => {
                addOption(option);
            });

            optionsContainer.appendChild(optionsList);
            optionsContainer.appendChild(addOptionButton);

            questionRow.appendChild(optionsContainer);

            return {
                optionsContainer,
                addOption
            };
        }

        if (
            addQuestionButton &&
            questionsList
        ) {
            addQuestionButton.addEventListener("click", () => {
                const questionRow =
                    document.createElement("div");

                questionRow.className =
                    "assessment-template-question-row";

                questionRow.dataset.questionId =
                    `assessment-question-${Date.now()}`;

                const questionLabel =
                    document.createElement("label");

                questionLabel.textContent =
                    "Question";

                const questionInput =
                    document.createElement("input");

                questionInput.type = "text";
                questionInput.className =
                    "assessment-template-question-input";

                questionInput.placeholder =
                    "Enter assessment question";

                questionLabel.appendChild(
                    questionInput
                );

                questionRow.appendChild(
                    questionLabel
                );

                const responseTypeLabel =
                    document.createElement("label");

                responseTypeLabel.textContent =
                    "Response Type";

                const responseTypeSelect =
                    document.createElement("select");

                responseTypeSelect.className =
                    "assessment-template-question-response-type";

                const responseTypes = [
                    {
                        value: "text",
                        label: "Text"
                    },
                    {
                        value: "number",
                        label: "Number"
                    },
                    {
                        value: "yes-no",
                        label: "Yes / No"
                    },
                    {
                        value: "multiple-choice",
                        label: "Multiple Choice"
                    }
                ];

                responseTypes.forEach((responseType) => {
                    const option =
                        document.createElement("option");

                    option.value =
                        responseType.value;

                    option.textContent =
                        responseType.label;

                    responseTypeSelect.appendChild(
                        option
                    );
                });

                responseTypeSelect.value = "text";

                responseTypeLabel.appendChild(
                    responseTypeSelect
                );

                questionRow.appendChild(
                    responseTypeLabel
                );

                const requiredLabel =
                    document.createElement("label");

                const requiredCheckbox =
                    document.createElement("input");

                requiredCheckbox.type = "checkbox";
                requiredCheckbox.className =
                    "assessment-template-question-required";

                requiredCheckbox.checked = false;

                requiredLabel.appendChild(
                    requiredCheckbox
                );

                requiredLabel.appendChild(
                    document.createTextNode(" Required")
                );

                questionRow.appendChild(
                    requiredLabel
                );
                const moveUpButton =
                    document.createElement("button");

                moveUpButton.type = "button";
                moveUpButton.className =
                    "secondary-btn";

                moveUpButton.textContent =
                    "Move Up";

                moveUpButton.addEventListener(
                    "click",
                    () => {
                        const previousRow =
                            questionRow.previousElementSibling;

                        if (previousRow) {
                            questionsList.insertBefore(
                                questionRow,
                                previousRow
                            );
                        }
                    }
                );

                const moveDownButton =
                    document.createElement("button");

                moveDownButton.type = "button";
                moveDownButton.className =
                    "secondary-btn";

                moveDownButton.textContent =
                    "Move Down";

                moveDownButton.addEventListener(
                    "click",
                    () => {
                        const nextRow =
                            questionRow.nextElementSibling;

                        if (nextRow) {
                            questionsList.insertBefore(
                                nextRow,
                                questionRow
                            );
                        }
                    }
                );
                const duplicateQuestionButton =
                    document.createElement("button");

                duplicateQuestionButton.type = "button";
                duplicateQuestionButton.className =
                    "secondary-btn";

                duplicateQuestionButton.textContent =
                    "Duplicate Question";

                duplicateQuestionButton.addEventListener(
                    "click",
                    () => {
                        const questionText =
                            questionInput.value;

                        const responseType =
                            responseTypeSelect.value;

                        const required =
                            requiredCheckbox.checked;

                        const optionValues =
                            Array.from(
                                questionRow.querySelectorAll(
                                    ".assessment-template-multiple-choice-option-input"
                                )
                            ).map((optionInput) =>
                                optionInput.value
                            );

                        const existingRows =
                            new Set(
                                Array.from(
                                    questionsList.children
                                )
                            );

                        addQuestionButton.click();

                        const duplicateRow =
                            Array.from(
                                questionsList.children
                            ).find(
                                (row) =>
                                    !existingRows.has(row)
                            );

                        if (!duplicateRow) {
                            return;
                        }

                        const duplicateQuestionInput =
                            duplicateRow.querySelector(
                                ".assessment-template-question-input"
                            );

                        const duplicateResponseTypeSelect =
                            duplicateRow.querySelector(
                                ".assessment-template-question-response-type"
                            );

                        const duplicateRequiredCheckbox =
                            duplicateRow.querySelector(
                                ".assessment-template-question-required"
                            );

                        if (duplicateQuestionInput) {
                            duplicateQuestionInput.value =
                                questionText;
                        }

                        if (duplicateRequiredCheckbox) {
                            duplicateRequiredCheckbox.checked =
                                required;
                        }

                        if (duplicateResponseTypeSelect) {
                            duplicateResponseTypeSelect.value =
                                responseType;

                            duplicateResponseTypeSelect.dispatchEvent(
                                new Event("change")
                            );
                        }

                        if (
                            responseType ===
                            "multiple-choice"
                        ) {
                            const getDuplicateOptionInputs =
                                () =>
                                    Array.from(
                                        duplicateRow.querySelectorAll(
                                            ".assessment-template-multiple-choice-option-input"
                                        )
                                    );

                            const addOptionButton =
                                Array.from(
                                    duplicateRow.querySelectorAll(
                                        ".assessment-template-multiple-choice-options button"
                                    )
                                ).find(
                                    (button) =>
                                        button.textContent ===
                                        "+ Add Option"
                                );

                            optionValues.forEach(
                                (optionValue, index) => {
                                    let optionInputs =
                                        getDuplicateOptionInputs();

                                    if (
                                        index >=
                                        optionInputs.length &&
                                        addOptionButton
                                    ) {
                                        addOptionButton.click();

                                        optionInputs =
                                            getDuplicateOptionInputs();
                                    }

                                    if (optionInputs[index]) {
                                        optionInputs[index].value =
                                            optionValue;
                                    }
                                }
                            );
                        }

                        questionsList.insertBefore(
                            duplicateRow,
                            questionRow.nextElementSibling
                        );

                        duplicateQuestionInput?.focus();
                    }
                );
                const removeQuestionButton =
                    document.createElement("button");

                removeQuestionButton.type = "button";
                removeQuestionButton.className =
                    "secondary-btn";

                removeQuestionButton.textContent =
                    "Remove Question";

                removeQuestionButton.addEventListener(
                    "click",
                    () => {
                        questionRow.remove();
                    }
                );

                questionRow.appendChild(
                    moveUpButton
                );

                questionRow.appendChild(
                    moveDownButton
                );

                questionRow.appendChild(
                    duplicateQuestionButton
                );

                questionRow.appendChild(
                    removeQuestionButton
                );

                const {
                    optionsContainer,
                    addOption
                } = createMultipleChoiceOptionsEditor(
                    questionRow
                );

                optionsContainer.classList.add("hidden");

                responseTypeSelect.addEventListener(
                    "change",
                    () => {
                        const isMultipleChoice =
                            responseTypeSelect.value ===
                            "multiple-choice";

                        optionsContainer.classList.toggle(
                            "hidden",
                            !isMultipleChoice
                        );

                        if (
                            isMultipleChoice &&
                            !optionsContainer.querySelector(
                                ".assessment-template-multiple-choice-option-input"
                            )
                        ) {
                            addOption();
                        }
                    }
                );

                questionsList.appendChild(
                    questionRow
                );

                questionInput.focus();
            });
        }
        if (templateForm) {
            templateForm.addEventListener(
                "submit",
                async (event) => {
                    event.preventDefault();

                    const templateName = document
                        .getElementById("assessment-template-name")
                        .value
                        .trim();

                    const category = document
                        .getElementById("assessment-template-category")
                        .value
                        .trim();

                    const version = document
                        .getElementById("assessment-template-version")
                        .value
                        .trim();

                    const status = document
                        .getElementById("assessment-template-status")
                        .value
                        .trim();

                    const description = document
                        .getElementById("assessment-template-description")
                        .value
                        .trim();

                    document
                        .querySelectorAll(
                            ".assessment-template-question-validation"
                        )
                        .forEach((message) => {
                            message.remove();
                        });

                    let hasInvalidMultipleChoiceQuestion = false;

                    const questions = Array.from(
                        document.querySelectorAll(
                            ".assessment-template-question-row"
                        )
                    )
                        .map((row, index) => {
                            const input =
                                row.querySelector(
                                    ".assessment-template-question-input"
                                );

                            const text =
                                input?.value.trim() || "";

                            if (!text) {
                                return null;
                            }

                            const responseTypeSelect =
                                row.querySelector(
                                    ".assessment-template-question-response-type"
                                );

                            const requiredCheckbox =
                                row.querySelector(
                                    ".assessment-template-question-required"
                                );

                            const responseType =
                                responseTypeSelect?.value || "text";

                            const options =
                                responseType === "multiple-choice"
                                    ? Array.from(
                                        row.querySelectorAll(
                                            ".assessment-template-multiple-choice-option-input"
                                        )
                                    )
                                        .map((optionInput) =>
                                            optionInput.value.trim()
                                        )
                                        .filter(Boolean)
                                    : [];

                            if (
                                responseType === "multiple-choice" &&
                                options.length < 2
                            ) {
                                hasInvalidMultipleChoiceQuestion = true;

                                const validationMessage =
                                    document.createElement("p");

                                validationMessage.className =
                                    "assessment-template-question-validation";

                                validationMessage.textContent =
                                    "Add at least two Multiple Choice options.";

                                row.appendChild(
                                    validationMessage
                                );

                                return null;
                            }

                            return {
                                id:
                                    row.dataset.questionId ||
                                    `assessment-question-${Date.now()}-${index}`,
                                text,
                                responseType,
                                required:
                                    requiredCheckbox?.checked || false,
                                options,
                                order: index
                            };
                        })
                        .filter(Boolean);

                    if (hasInvalidMultipleChoiceQuestion) {
                        const firstInvalidQuestion =
                            document.querySelector(
                                ".assessment-template-question-validation"
                            )?.closest(
                                ".assessment-template-question-row"
                            );

                        firstInvalidQuestion?.scrollIntoView({
                            block: "center"
                        });

                        return;
                    }

                    const editingTemplateId =
                        templateForm.dataset.editingTemplateId || "";

                    try {
                        let result;

                        if (editingTemplateId) {
                            result =
                                await window.busyBodyz.updateAssessmentTemplate({
                                    id: editingTemplateId,
                                    templateName,
                                    category,
                                    version,
                                    status,
                                    description,
                                    questions
                                });
                        } else {
                            result =
                                await window.busyBodyz.saveAssessmentTemplate({
                                    templateName,
                                    category,
                                    version,
                                    status,
                                    description,
                                    questions
                                });
                        }

                        if (!result.success) {
                            alert(
                                result.error ||
                                (
                                    editingTemplateId
                                        ? "Unable to update the assessment template."
                                        : "Unable to save the assessment template."
                                )
                            );

                            return;
                        }

                        templateForm.reset();

                        if (questionsList) {
                            questionsList.innerHTML = "";
                        }

                        delete templateForm.dataset.editingTemplateId;

                        const saveButton =
                            document.getElementById(
                                "save-assessment-template-button"
                            );

                        const formHeading =
                            templateFormPanel?.querySelector(
                                ".form-section-heading h3"
                            );

                        if (formHeading) {
                            formHeading.textContent =
                                "New Assessment Template";
                        }

                        if (saveButton) {
                            saveButton.textContent =
                                "Save Template";

                            saveButton.disabled = false;
                        }

                        templateFormPanel.classList.add(
                            "hidden"
                        );

                        await renderAssessmentTemplates();

                        console.log(
                            editingTemplateId
                                ? "Assessment template updated."
                                : "Assessment template saved."
                        );
                    } catch (error) {
                        console.error(
                            editingTemplateId
                                ? "Unable to update assessment template:"
                                : "Unable to save assessment template:",
                            error
                        );

                        alert(
                            editingTemplateId
                                ? "An unexpected error occurred while updating the assessment template."
                                : "An unexpected error occurred while saving the assessment template."
                        );
                    }
                }
            );
        }
        await renderAssessmentTemplates();
    }
    if (personalInformationButton) {
        personalInformationButton.addEventListener("click", () => {
            const workspace =
                document.getElementById("workspace");

            workspace.innerHTML =
                getClientPersonalInformationPage(client);

            initializeClientPersonalInformationPage(client);
        });
    }

    if (programsButton) {
        programsButton.addEventListener("click", () => {
            const workspace =
                document.getElementById("workspace");

            workspace.innerHTML =
                getClientProgramsPage(client);

            initializeClientProgramsPage(client);
        });
    }

    if (assessmentsButton) {
        assessmentsButton.addEventListener("click", () => {
            const workspace =
                document.getElementById("workspace");

            workspace.innerHTML =
                getClientAssessmentsPage(client);

            initializeClientAssessmentsPage(client);
        });
    }
}

document.querySelectorAll(".sidebar button").forEach((button) => {
    button.addEventListener("click", () => {
        loadPage(button.dataset.page);
    });
});

loadPage("dashboard");