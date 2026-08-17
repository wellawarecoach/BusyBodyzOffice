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
    win.webContents.openDevTools();
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
            questions: [],
            protocol: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
