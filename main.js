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
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});