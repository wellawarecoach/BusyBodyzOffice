const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require("electron");
const path = require("path");
const fs = require("fs");
function getSettingsFilePath() {
    return path.join(
        app.getPath("userData"),
        "busybodyz-settings.json"
    );
}

function readSettings() {
    const settingsPath = getSettingsFilePath();

    try {
        if (!fs.existsSync(settingsPath)) {
            return {};
        }

        const savedSettings = fs.readFileSync(
            settingsPath,
            "utf8"
        );

        return JSON.parse(savedSettings);
    } catch (error) {
        console.error("Unable to read settings:", error);
        return {};
    }
}

function writeSettings(settings) {
    const settingsPath = getSettingsFilePath();

    try {
        fs.writeFileSync(
            settingsPath,
            JSON.stringify(settings, null, 2),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error("Unable to save settings:", error);
        return false;
    }
}
function getClientsFilePath() {
    return path.join(
        app.getPath("userData"),
        "busybodyz-clients.json"
    );
}

function readClients() {
    const clientsPath = getClientsFilePath();

    try {
        if (!fs.existsSync(clientsPath)) {
            return [];
        }

        const savedClients = fs.readFileSync(
            clientsPath,
            "utf8"
        );

        const clients = JSON.parse(savedClients);

        return Array.isArray(clients) ? clients : [];
    } catch (error) {
        console.error("Unable to read clients:", error);
        return [];
    }
}

function writeClients(clients) {
    const clientsPath = getClientsFilePath();

    try {
        fs.writeFileSync(
            clientsPath,
            JSON.stringify(clients, null, 2),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error("Unable to save clients:", error);
        return false;
    }
}
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true,
        webPreferences: {
            preload: path.join(__dirname, "src", "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile(path.join(__dirname, "index.html"));
}
ipcMain.handle("choose-invoice-folder", async () => {
    const result = await dialog.showOpenDialog({
        title: "Choose Client Invoices Folder",
        properties: ["openDirectory", "createDirectory"]
    });

    if (result.canceled || !result.filePaths.length) {
        return {
            success: false,
            canceled: true
        };
    }

    const folderPath = result.filePaths[0];
    const settings = readSettings();

    settings.invoiceFolder = folderPath;

    const saved = writeSettings(settings);

    return {
        success: saved,
        folderPath
    };
});

ipcMain.handle("get-invoice-folder", () => {
    const settings = readSettings();

    return {
        success: Boolean(settings.invoiceFolder),
        folderPath: settings.invoiceFolder || ""
    };
});
ipcMain.handle(
    "create-client-invoice-folder",
    (event, clientName) => {
        const cleanClientName = String(clientName || "")
            .trim()
            .replace(/[<>:"/\\|?*]/g, "");

        if (!cleanClientName) {
            return {
                success: false,
                message: "Enter a client name."
            };
        }

        const settings = readSettings();
        const invoiceFolder = settings.invoiceFolder;

        if (!invoiceFolder) {
            return {
                success: false,
                message: "Choose an invoice folder first."
            };
        }

        try {
            const clientFolderPath = path.join(
                invoiceFolder,
                cleanClientName
            );

            fs.mkdirSync(clientFolderPath, {
                recursive: true
            });

            return {
                success: true,
                folderPath: clientFolderPath,
                clientName: cleanClientName
            };
        } catch (error) {
            console.error(
                "Unable to create client folder:",
                error
            );

            return {
                success: false,
                message: "Unable to create the client folder."
            };
        }
    }
);
ipcMain.handle("get-clients", () => {
    try {
        const clients = readClients();

        return {
            success: true,
            clients
        };
    } catch (error) {
        console.error("Unable to retrieve clients:", error);

        return {
            success: false,
            clients: [],
            message: "Unable to retrieve clients."
        };
    }
});

ipcMain.handle("save-client", (event, clientData) => {
    const firstName = String(
        clientData?.firstName || ""
    ).trim();

    const lastName = String(
        clientData?.lastName || ""
    ).trim();

    const email = String(
        clientData?.email || ""
    ).trim();

    const phone = String(
        clientData?.phone || ""
    ).trim();

    if (!firstName || !lastName) {
        return {
            success: false,
            message: "First and last name are required."
        };
    }

    const clients = readClients();

    const duplicateClient = clients.find((client) => {
        return (
            client.firstName.toLowerCase() ===
            firstName.toLowerCase() &&
            client.lastName.toLowerCase() ===
            lastName.toLowerCase() &&
            client.email.toLowerCase() ===
            email.toLowerCase()
        );
    });

    if (duplicateClient) {
        return {
            success: false,
            message: "This client already exists."
        };
    }

    const client = {
        id: `client-${Date.now()}`,
        firstName,
        lastName,
        email,
        phone,
        createdAt: new Date().toISOString()
    };

    clients.push(client);

    const saved = writeClients(clients);

    if (!saved) {
        return {
            success: false,
            message: "Unable to save the client."
        };
    }

    return {
        success: true,
        client
    };
});
ipcMain.handle("update-client", async (event, clientData) => {
    try {
        if (!clientData || !clientData.id) {
            return {
                success: false,
                error: "A valid client ID is required.",
            };
        }

        const clients = readClients();

        const clientIndex = clients.findIndex(
            (client) => client.id === clientData.id
        );

        if (clientIndex === -1) {
            return {
                success: false,
                error: "Client not found.",
            };
        }

        const existingClient = clients[clientIndex];

        const updatedClient = {
            ...existingClient,

            firstName: String(clientData.firstName || "").trim(),
            lastName: String(clientData.lastName || "").trim(),
            email: String(clientData.email || "").trim(),
            phone: String(clientData.phone || "").trim(),

            updatedAt: new Date().toISOString(),
        };

        if (!updatedClient.firstName || !updatedClient.lastName) {
            return {
                success: false,
                error: "First name and last name are required.",
            };
        }

        clients[clientIndex] = updatedClient;

        const saved = writeClients(clients);

        if (!saved) {
            return {
                success: false,
                error: "Unable to save client changes.",
            };
        }

        return {
            success: true,
            client: updatedClient,
        };
    } catch (error) {
        console.error("Failed to update client:", error);

        return {
            success: false,
            error: "An unexpected error occurred while updating the client.",
        };
    }
});
ipcMain.handle("add-client-program", async (event, payload) => {
    try {
        const clientId = String(
            payload?.clientId || ""
        ).trim();

        const programData = payload?.program;

        if (!clientId) {
            return {
                success: false,
                error: "A valid client ID is required."
            };
        }

        if (!programData) {
            return {
                success: false,
                error: "Program information is required."
            };
        }

        const programName = String(
            programData.programName || ""
        ).trim();

        if (!programName) {
            return {
                success: false,
                error: "Program name is required."
            };
        }

        const clients = readClients();

        const clientIndex = clients.findIndex(
            (client) => client.id === clientId
        );

        if (clientIndex === -1) {
            return {
                success: false,
                error: "Client not found."
            };
        }

        const client = clients[clientIndex];

        const existingPrograms =
            Array.isArray(client.programs)
                ? client.programs
                : [];

        const program = {
            id: `program-${Date.now()}`,
            programName,
            programType: String(
                programData.programType || ""
            ).trim(),
            startDate: String(
                programData.startDate || ""
            ).trim(),
            endDate: String(
                programData.endDate || ""
            ).trim(),
            status: String(
                programData.status || "Active"
            ).trim(),
            notes: String(
                programData.notes || ""
            ).trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updatedClient = {
            ...client,
            programs: [
                ...existingPrograms,
                program
            ],
            updatedAt: new Date().toISOString()
        };

        clients[clientIndex] = updatedClient;

        const saved = writeClients(clients);

        if (!saved) {
            return {
                success: false,
                error: "Unable to save the program."
            };
        }

        return {
            success: true,
            client: updatedClient,
            program
        };
    } catch (error) {
        console.error(
            "Failed to add client program:",
            error
        );

        return {
            success: false,
            error: "An unexpected error occurred while saving the program."
        };
    }
});
ipcMain.handle("delete-client-program", async (event, payload) => {
    try {
        const clientId = String(
            payload?.clientId || ""
        ).trim();

        const programId = String(
            payload?.programId || ""
        ).trim();

        if (!clientId) {
            return {
                success: false,
                error: "A valid client ID is required."
            };
        }

        if (!programId) {
            return {
                success: false,
                error: "A valid program ID is required."
            };
        }

        const clients = readClients();

        const clientIndex = clients.findIndex(
            (client) => client.id === clientId
        );

        if (clientIndex === -1) {
            return {
                success: false,
                error: "Client not found."
            };
        }

        const client = clients[clientIndex];

        const existingPrograms =
            Array.isArray(client.programs)
                ? client.programs
                : [];

        const programExists =
            existingPrograms.some(
                (program) => program.id === programId
            );

        if (!programExists) {
            return {
                success: false,
                error: "Program not found."
            };
        }

        const updatedClient = {
            ...client,
            programs: existingPrograms.filter(
                (program) => program.id !== programId
            ),
            updatedAt: new Date().toISOString()
        };

        clients[clientIndex] = updatedClient;

        const saved = writeClients(clients);

        if (!saved) {
            return {
                success: false,
                error: "Unable to delete the program."
            };
        }

        return {
            success: true,
            client: updatedClient
        };
    } catch (error) {
        console.error(
            "Failed to delete client program:",
            error
        );

        return {
            success: false,
            error: "An unexpected error occurred while deleting the program."
        };
    }
});
ipcMain.handle("update-client-program", async (event, payload) => {
    try {
        const clientId = String(
            payload?.clientId || ""
        ).trim();

        const programId = String(
            payload?.programId || ""
        ).trim();

        const programData = payload?.program;

        if (!clientId) {
            return {
                success: false,
                error: "A valid client ID is required."
            };
        }

        if (!programId) {
            return {
                success: false,
                error: "A valid program ID is required."
            };
        }

        if (!programData) {
            return {
                success: false,
                error: "Program information is required."
            };
        }

        const programName = String(
            programData.programName || ""
        ).trim();

        if (!programName) {
            return {
                success: false,
                error: "Program name is required."
            };
        }

        const clients = readClients();

        const clientIndex = clients.findIndex(
            (client) => client.id === clientId
        );

        if (clientIndex === -1) {
            return {
                success: false,
                error: "Client not found."
            };
        }

        const client = clients[clientIndex];

        const programs =
            Array.isArray(client.programs)
                ? client.programs
                : [];

        const programIndex = programs.findIndex(
            (program) => program.id === programId
        );

        if (programIndex === -1) {
            return {
                success: false,
                error: "Program not found."
            };
        }

        const existingProgram =
            programs[programIndex];

        const updatedProgram = {
            ...existingProgram,
            programName,
            programType: String(
                programData.programType || ""
            ).trim(),
            startDate: String(
                programData.startDate || ""
            ).trim(),
            endDate: String(
                programData.endDate || ""
            ).trim(),
            status: String(
                programData.status || "Active"
            ).trim(),
            notes: String(
                programData.notes || ""
            ).trim(),
            updatedAt: new Date().toISOString()
        };

        const updatedPrograms = [
            ...programs
        ];

        updatedPrograms[programIndex] =
            updatedProgram;

        const updatedClient = {
            ...client,
            programs: updatedPrograms,
            updatedAt: new Date().toISOString()
        };

        clients[clientIndex] =
            updatedClient;

        const saved =
            writeClients(clients);

        if (!saved) {
            return {
                success: false,
                error: "Unable to update the program."
            };
        }

        return {
            success: true,
            client: updatedClient,
            program: updatedProgram
        };
    } catch (error) {
        console.error(
            "Failed to update client program:",
            error
        );

        return {
            success: false,
            error: "An unexpected error occurred while updating the program."
        };
    }
});
function validateAndNormalizeAssessmentTemplateQuestions(questions) {
    if (!Array.isArray(questions) || questions.length === 0) {
        return {
            success: false,
            code: "ASSESSMENT_TEMPLATE_REQUIRES_QUESTION",
            error: "Add at least one assessment question before saving the template."
        };
    }

    const supportedResponseTypes = new Set([
        "text",
        "number",
        "yes-no",
        "multiple-choice"
    ]);

    const normalizedQuestionTexts = new Set();
    const normalizedQuestions = [];

    for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];

        const questionText =
            typeof question === "string"
                ? question.trim()
                : String(
                    question?.text || ""
                ).trim();

        if (!questionText) {
            return {
                success: false,
                code: "INVALID_ASSESSMENT_QUESTION",
                error: "Question text is required."
            };
        }

        const normalizedQuestionText =
            questionText.toLowerCase();

        if (
            normalizedQuestionTexts.has(
                normalizedQuestionText
            )
        ) {
            return {
                success: false,
                code: "DUPLICATE_ASSESSMENT_QUESTION",
                error: "Assessment question text must be unique."
            };
        }

        normalizedQuestionTexts.add(
            normalizedQuestionText
        );

        const responseType =
            (
                typeof question === "object" &&
                question?.responseType
            )
                ? String(question.responseType).trim()
                : "text";

        if (!supportedResponseTypes.has(responseType)) {
            return {
                success: false,
                code: "INVALID_ASSESSMENT_RESPONSE_TYPE",
                error: "Assessment question response type is invalid."
            };
        }

        const options =
            (
                responseType === "multiple-choice" &&
                typeof question === "object" &&
                Array.isArray(question?.options)
            )
                ? question.options
                    .map((option) =>
                        String(option).trim()
                    )
                    .filter(Boolean)
                : [];

        if (
            responseType === "multiple-choice" &&
            options.length < 2
        ) {
            return {
                success: false,
                code: "INVALID_MULTIPLE_CHOICE_OPTIONS",
                error: "Multiple Choice questions require at least two options."
            };
        }

        if (responseType === "multiple-choice") {
            const normalizedOptions =
                options.map((option) =>
                    option.toLowerCase()
                );

            const hasDuplicateOptions =
                new Set(normalizedOptions).size !==
                normalizedOptions.length;

            if (hasDuplicateOptions) {
                return {
                    success: false,
                    code: "DUPLICATE_MULTIPLE_CHOICE_OPTION",
                    error: "Multiple Choice options must be unique."
                };
            }
        }

        normalizedQuestions.push({
            id:
                (
                    typeof question === "object" &&
                    question?.id
                )
                    ? String(question.id)
                    : `assessment-question-${Date.now()}-${index}`,
            text: questionText,
            instructions:
                typeof question === "object"
                    ? String(
                        question?.instructions || ""
                    ).trim()
                    : "",
            responseType,
            required:
                typeof question === "object"
                    ? Boolean(question?.required)
                    : false,
            options,
            order: index
        });
    }

    return {
        success: true,
        questions: normalizedQuestions
    };
}

ipcMain.handle("save-assessment-template", async (event, templateData) => {
    try {
        const templateName = String(
            templateData?.templateName || ""
        ).trim();

        if (!templateName) {
            return {
                success: false,
                error: "Template name is required."
            };
        }

        const templatesFilePath = path.join(
            app.getPath("userData"),
            "busybodyz-assessment-templates.json"
        );

        let templates = [];

        if (fs.existsSync(templatesFilePath)) {
            try {
                const fileContents = fs.readFileSync(
                    templatesFilePath,
                    "utf8"
                );

                templates = JSON.parse(fileContents);

                if (!Array.isArray(templates)) {
                    templates = [];
                }
            } catch (error) {
                console.error(
                    "Unable to read assessment templates:",
                    error
                );

                templates = [];
            }
        }

        const normalizedTemplateName =
            templateName.toLowerCase();

        const duplicateTemplate =
            templates.some((template) =>
                String(
                    template?.templateName || ""
                )
                    .trim()
                    .toLowerCase() ===
                normalizedTemplateName
            );

        if (duplicateTemplate) {
            return {
                success: false,
                code: "DUPLICATE_TEMPLATE_NAME",
                error: "An assessment template with this name already exists."
            };
        }

        const questionValidation =
            validateAndNormalizeAssessmentTemplateQuestions(
                templateData?.questions
            );

        if (!questionValidation.success) {
            return questionValidation;
        }

        const template = {
            id: `assessment-template-${Date.now()}`,
            templateName,
            category: String(
                templateData?.category || ""
            ).trim(),
            version: String(
                templateData?.version || "1.0"
            ).trim(),
            status: String(
                templateData?.status || "Active"
            ).trim(),
            description: String(
                templateData?.description || ""
            ).trim(),
            protocol: String(
                templateData?.protocol || ""
            ).trim(),
            questions: questionValidation.questions,
            createdAt: new Date().toISOString(),
        };

        templates.push(template);

        fs.writeFileSync(
            templatesFilePath,
            JSON.stringify(templates, null, 2),
            "utf8"
        );

        return {
            success: true,
            template
        };
    } catch (error) {
        console.error(
            "Failed to save assessment template:",
            error
        );

        return {
            success: false,
            error: "An unexpected error occurred while saving the assessment template."
        };
    }
});

ipcMain.handle("get-assessment-templates", async () => {
    try {
        const templatesFilePath = path.join(
            app.getPath("userData"),
            "busybodyz-assessment-templates.json"
        );

        if (!fs.existsSync(templatesFilePath)) {
            return {
                success: true,
                templates: []
            };
        }

        const fileContents = fs.readFileSync(
            templatesFilePath,
            "utf8"
        );

        const templates = JSON.parse(fileContents);

        if (!Array.isArray(templates)) {
            return {
                success: false,
                error: "Assessment template data is invalid."
            };
        }

        return {
            success: true,
            templates
        };
    } catch (error) {
        console.error(
            "Failed to load assessment templates:",
            error
        );

        return {
            success: false,
            error: "Unable to load assessment templates."
        };
    }
});

ipcMain.handle(
    "update-assessment-template",
    async (event, templateData) => {
        try {
            const templateId = String(
                templateData?.id || ""
            ).trim();

            const templateName = String(
                templateData?.templateName || ""
            ).trim();

            if (!templateId) {
                return {
                    success: false,
                    error: "Template ID is required."
                };
            }

            if (!templateName) {
                return {
                    success: false,
                    error: "Template name is required."
                };
            }

            const templatesFilePath = path.join(
                app.getPath("userData"),
                "busybodyz-assessment-templates.json"
            );

            if (!fs.existsSync(templatesFilePath)) {
                return {
                    success: false,
                    error: "Assessment template file was not found."
                };
            }

            const fileContents = fs.readFileSync(
                templatesFilePath,
                "utf8"
            );

            const templates = JSON.parse(fileContents);

            if (!Array.isArray(templates)) {
                return {
                    success: false,
                    error: "Assessment template data is invalid."
                };
            }

            const templateIndex =
                templates.findIndex(
                    (template) =>
                        template.id === templateId
                );

            if (templateIndex === -1) {
                return {
                    success: false,
                    error: "Assessment template was not found."
                };
            }

            const normalizedTemplateName =
                templateName.toLowerCase();

            const duplicateTemplate =
                templates.some(
                    (template, index) =>
                        index !== templateIndex &&
                        String(
                            template?.templateName || ""
                        )
                            .trim()
                            .toLowerCase() ===
                        normalizedTemplateName
                );

            if (duplicateTemplate) {
                return {
                    success: false,
                    code: "DUPLICATE_TEMPLATE_NAME",
                    error: "An assessment template with this name already exists."
                };
            }

            const questionValidation =
                validateAndNormalizeAssessmentTemplateQuestions(
                    templateData?.questions
                );

            if (!questionValidation.success) {
                return questionValidation;
            }

            const existingTemplate =
                templates[templateIndex];

            const updatedTemplate = {
                ...existingTemplate,
                templateName,
                category: String(
                    templateData?.category || ""
                ).trim(),
                version: String(
                    templateData?.version || "1.0"
                ).trim(),
                status: String(
                    templateData?.status || "Active"
                ).trim(),
                description: String(
                    templateData?.description || ""
                ).trim(),
                protocol: String(
                    templateData?.protocol || ""
                ).trim(),
                questions: questionValidation.questions,
                updatedAt: new Date().toISOString()
            };

            templates[templateIndex] =
                updatedTemplate;

            fs.writeFileSync(
                templatesFilePath,
                JSON.stringify(templates, null, 2),
                "utf8"
            );

            return {
                success: true,
                template: updatedTemplate
            };
        } catch (error) {
            console.error(
                "Failed to update assessment template:",
                error
            );

            return {
                success: false,
                error: "An unexpected error occurred while updating the assessment template."
            };
        }
    }
);
ipcMain.handle(
    "delete-assessment-template",
    async (event, templateId) => {
        try {
            const normalizedTemplateId = String(
                templateId || ""
            ).trim();

            if (!normalizedTemplateId) {
                return {
                    success: false,
                    error: "Template ID is required."
                };
            }

            const templatesFilePath = path.join(
                app.getPath("userData"),
                "busybodyz-assessment-templates.json"
            );

            if (!fs.existsSync(templatesFilePath)) {
                return {
                    success: false,
                    error: "Assessment template file was not found."
                };
            }

            const fileContents = fs.readFileSync(
                templatesFilePath,
                "utf8"
            );

            const templates = JSON.parse(fileContents);

            if (!Array.isArray(templates)) {
                return {
                    success: false,
                    error: "Assessment template data is invalid."
                };
            }

            const templateExists =
                templates.some(
                    (template) =>
                        template.id === normalizedTemplateId
                );

            if (!templateExists) {
                return {
                    success: false,
                    error: "Assessment template was not found."
                };
            }

            const updatedTemplates =
                templates.filter(
                    (template) =>
                        template.id !== normalizedTemplateId
                );

            fs.writeFileSync(
                templatesFilePath,
                JSON.stringify(updatedTemplates, null, 2),
                "utf8"
            );

            return {
                success: true
            };
        } catch (error) {
            console.error(
                "Failed to delete assessment template:",
                error
            );

            return {
                success: false,
                error: "An unexpected error occurred while deleting the assessment template."
            };
        }
    }
);
ipcMain.handle(
    "save-client-assessment",
    async (event, payload) => {
        try {
            const clientId = String(
                payload?.clientId || ""
            ).trim();

            const assessmentData =
                payload?.assessment;

            if (!clientId) {
                return {
                    success: false,
                    error: "A valid client ID is required."
                };
            }

            if (!assessmentData) {
                return {
                    success: false,
                    error: "Assessment information is required."
                };
            }

            const templateId = String(
                assessmentData.templateId || ""
            ).trim();

            const templateName = String(
                assessmentData.templateName || ""
            ).trim();

            if (!templateId) {
                return {
                    success: false,
                    error: "Assessment template ID is required."
                };
            }

            if (!templateName) {
                return {
                    success: false,
                    error: "Assessment template name is required."
                };
            }

            const questions =
                Array.isArray(
                    assessmentData.questions
                )
                    ? assessmentData.questions
                    : [];

            if (questions.length === 0) {
                return {
                    success: false,
                    error: "Assessment questions are required."
                };
            }

            const normalizedQuestions =
                questions.map(
                    (question, index) => ({
                        id: String(
                            question?.id ||
                            `assessment-question-${index}`
                        ),
                        text: String(
                            question?.text || ""
                        ).trim(),
                        instructions: String(
                            question?.instructions || ""
                        ).trim(),
                        responseType: String(
                            question?.responseType ||
                            "text"
                        ).trim(),
                        required:
                            Boolean(
                                question?.required
                            ),
                        options:
                            Array.isArray(
                                question?.options
                            )
                                ? question.options.map(
                                    (option) =>
                                        String(
                                            option
                                        ).trim()
                                )
                                : [],
                        response:
                            question?.response ===
                                null ||
                                question?.response ===
                                undefined
                                ? ""
                                : String(
                                    question.response
                                ).trim(),
                        order: index
                    })
                );

            const clients =
                readClients();

            const clientIndex =
                clients.findIndex(
                    (client) =>
                        client.id === clientId
                );

            if (clientIndex === -1) {
                return {
                    success: false,
                    error: "Client not found."
                };
            }

            const client =
                clients[clientIndex];

            const existingAssessments =
                Array.isArray(
                    client.assessments
                )
                    ? client.assessments
                    : [];

            const now =
                new Date().toISOString();

            const assessment = {
                id:
                    `assessment-${Date.now()}`,

                templateId,
                templateName,

                templateVersion: String(
                    assessmentData.templateVersion ||
                    "1.0"
                ).trim(),

                category: String(
                    assessmentData.category || ""
                ).trim(),

                description: String(
                    assessmentData.description || ""
                ).trim(),

                protocol: String(
                    assessmentData.protocol || ""
                ).trim(),

                status: String(
                    assessmentData.status ||
                    "Completed"
                ).trim(),

                assessmentType: String(
                    assessmentData.assessmentType ||
                    "Assessment"
                ).trim(),

                parentAssessmentId: String(
                    assessmentData.parentAssessmentId ||
                    ""
                ).trim(),

                baselineAssessmentId: String(
                    assessmentData.baselineAssessmentId ||
                    ""
                ).trim(),

                questions:
                    normalizedQuestions,

                createdAt: now,
                updatedAt: now
            };
            const updatedClient = {
                ...client,
                assessments: [
                    ...existingAssessments,
                    assessment
                ],
                updatedAt: now
            };

            clients[clientIndex] =
                updatedClient;

            const saved =
                writeClients(clients);

            if (!saved) {
                return {
                    success: false,
                    error: "Unable to save the assessment."
                };
            }

            return {
                success: true,
                client: updatedClient,
                assessment
            };
        } catch (error) {
            console.error(
                "Failed to save client assessment:",
                error
            );

            return {
                success: false,
                error: "An unexpected error occurred while saving the assessment."
            };
        }
    }
);
// Batch 15H.3C — Link independent assessments.

ipcMain.handle(
    "link-client-assessments",
    async (event, payload) => {
        try {
            const clientId = String(
                payload?.clientId || ""
            ).trim();

            const assessmentIds =
                payload?.assessmentIds;

            if (
                !clientId ||
                !Array.isArray(assessmentIds) ||
                assessmentIds.length < 2 ||
                new Set(assessmentIds).size !==
                assessmentIds.length
            ) {
                return {
                    success: false,
                    error:
                        "Select at least two distinct assessments."
                };
            }

            const clients = readClients();

            const clientIndex =
                clients.findIndex(
                    (client) =>
                        client.id === clientId
                );

            if (clientIndex === -1) {
                return {
                    success: false,
                    error: "Client not found."
                };
            }

            const client =
                clients[clientIndex];

            const assessments =
                Array.isArray(client.assessments)
                    ? client.assessments
                    : [];

            const selected =
                assessmentIds.map(
                    (id) =>
                        assessments.find(
                            (assessment) =>
                                assessment.id === id
                        )
                );

            if (
                selected.some(
                    (assessment) =>
                        !assessment
                )
            ) {
                return {
                    success: false,
                    error:
                        "One or more selected assessments were not found."
                };
            }

            // Only independent initial assessments
            // can be linked.

            if (
                selected.some(
                    (assessment) =>
                        assessment.assessmentType ===
                        "Reassessment"
                )
            ) {
                return {
                    success: false,
                    error:
                        "Existing reassessments cannot be linked using this tool."
                };
            }

            // Do not reorganize assessments
            // that already have linked records.

            const selectedIds =
                new Set(assessmentIds);

            const hasExistingLinks =
                assessments.some(
                    (assessment) =>
                        assessment.assessmentType ===
                        "Reassessment" &&
                        (
                            selectedIds.has(
                                assessment.parentAssessmentId
                            ) ||
                            selectedIds.has(
                                assessment.baselineAssessmentId
                            )
                        )
                );

            if (hasExistingLinks) {
                return {
                    success: false,
                    error:
                        "One or more selected assessments already belong to an assessment history."
                };
            }

            // All assessments must use the same template.

            const templateId =
                selected[0].templateId;

            if (
                !templateId ||
                !selected.every(
                    (assessment) =>
                        assessment.templateId ===
                        templateId
                )
            ) {
                return {
                    success: false,
                    error:
                        "Selected assessments must use the same template."
                };
            }

            // Verify question compatibility.

            const getQuestionStructure =
                (assessment) =>
                    (
                        Array.isArray(
                            assessment.questions
                        )
                            ? assessment.questions
                            : []
                    ).map(
                        (question) => ({
                            id: question.id || "",
                            text: question.text || "",
                            responseType:
                                question.responseType ||
                                "text",
                            options:
                                Array.isArray(
                                    question.options
                                )
                                    ? question.options
                                    : []
                        })
                    );

            const baselineStructure =
                JSON.stringify(
                    getQuestionStructure(
                        selected[0]
                    )
                );

            if (
                !selected.every(
                    (assessment) =>
                        JSON.stringify(
                            getQuestionStructure(
                                assessment
                            )
                        ) === baselineStructure
                )
            ) {
                return {
                    success: false,
                    error:
                        "Selected assessments have incompatible question structures."
                };
            }

            // Establish chronological order.

            if (
                selected.some(
                    (assessment) =>
                        !Number.isFinite(
                            Date.parse(
                                assessment.createdAt ||
                                ""
                            )
                        )
                )
            ) {
                return {
                    success: false,
                    error:
                        "One or more assessments have invalid dates."
                };
            }

            const ordered =
                [...selected].sort(
                    (a, b) =>
                        Date.parse(a.createdAt) -
                        Date.parse(b.createdAt)
                );

            const hasDuplicateTimestamps =
                ordered.some(
                    (assessment, index) =>
                        index > 0 &&
                        Date.parse(
                            assessment.createdAt
                        ) ===
                        Date.parse(
                            ordered[index - 1]
                                .createdAt
                        )
                );

            if (hasDuplicateTimestamps) {
                return {
                    success: false,
                    error:
                        "Assessment timestamps must be distinct before linking."
                };
            }

            // Build the linked history.
            // Preserve original responses, dates,
            // IDs, questions and template snapshots.

            const baseline =
                ordered[0];

            const updatedAssessments =
                assessments.map(
                    (assessment) => {
                        const position =
                            ordered.findIndex(
                                (item) =>
                                    item.id ===
                                    assessment.id
                            );

                        if (position <= 0) {
                            return assessment;
                        }

                        return {
                            ...assessment,

                            assessmentType:
                                "Reassessment",

                            baselineAssessmentId:
                                baseline.id,

                            parentAssessmentId:
                                ordered[
                                    position - 1
                                ].id
                        };
                    }
                );

            const updatedClient = {
                ...client,
                assessments:
                    updatedAssessments,
                updatedAt:
                    new Date().toISOString()
            };

            clients[clientIndex] =
                updatedClient;

            const saved =
                writeClients(clients);

            if (!saved) {
                return {
                    success: false,
                    error:
                        "Unable to save the linked assessment history."
                };
            }

            return {
                success: true,
                client: updatedClient,
                baselineAssessmentId:
                    baseline.id,
                linkedCount:
                    ordered.length
            };

        } catch (error) {
            console.error(
                "Unable to link client assessments:",
                error
            );

            return {
                success: false,
                error:
                    "An unexpected error occurred while linking assessments."
            };
        }
    }
);
// Batch 16D.2 — Export assessment report as PDF.

ipcMain.handle(
    "export-assessment-report-pdf",
    async (event, payload = {}) => {

        try {
            const window =
                BrowserWindow.fromWebContents(
                    event.sender
                );

            if (!window) {
                return {
                    success: false,
                    error:
                        "Unable to identify the application window."
                };
            }

            const requestedName =
                String(
                    payload.fileName ||
                    "BusyBodyz-Assessment-Report.pdf"
                ).trim();

            const safeFileName =
                requestedName
                    .replace(
                        /[<>:"/\\|?*]/g,
                        "-"
                    )
                    .replace(
                        /\s+/g,
                        " "
                    );

            const finalFileName =
                safeFileName
                    .toLowerCase()
                    .endsWith(".pdf")
                    ? safeFileName
                    : `${safeFileName}.pdf`;

            const saveResult =
                await dialog.showSaveDialog(
                    window,
                    {
                        title:
                            "Save Assessment Report",
                        defaultPath:
                            finalFileName,
                        filters: [
                            {
                                name:
                                    "PDF Documents",
                                extensions: [
                                    "pdf"
                                ]
                            }
                        ]
                    }
                );

            if (
                saveResult.canceled ||
                !saveResult.filePath
            ) {
                return {
                    success: false,
                    canceled: true
                };
            }

            const pdfData =
                await window.webContents
                    .printToPDF({
                        printBackground: true,
                        landscape: true,
                        pageSize: "A4"
                    });

            fs.writeFileSync(
                saveResult.filePath,
                pdfData
            );

            return {
                success: true,
                filePath:
                    saveResult.filePath
            };

        } catch (error) {
            console.error(
                "Unable to export assessment report PDF:",
                error
            );

            return {
                success: false,
                error:
                    error.message ||
                    "Unable to export the assessment report."
            };
        }
    }
);
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
