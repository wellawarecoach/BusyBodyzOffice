const {
    contextBridge,
    ipcRenderer
} = require("electron");

contextBridge.exposeInMainWorld("busyBodyz", {
    appName: "BusyBodyzOffice",
    version: "0.3",

    chooseInvoiceFolder: () =>
        ipcRenderer.invoke("choose-invoice-folder"),

    getInvoiceFolder: () =>
        ipcRenderer.invoke("get-invoice-folder"),

    createClientInvoiceFolder: (clientName) =>
        ipcRenderer.invoke(
            "create-client-invoice-folder",
            clientName
        ),

    getClients: () =>
        ipcRenderer.invoke("get-clients"),

    saveClient: (clientData) =>
        ipcRenderer.invoke(
            "save-client",
            clientData
        ),

    updateClient: (clientData) =>
        ipcRenderer.invoke(
            "update-client",
            clientData
        ),

    addClientProgram: (payload) =>
        ipcRenderer.invoke(
            "add-client-program",
            payload
        ),

    deleteClientProgram: (payload) =>
        ipcRenderer.invoke(
            "delete-client-program",
            payload
        ),

    updateClientProgram: (payload) =>
        ipcRenderer.invoke(
            "update-client-program",
            payload
        ),

    saveAssessmentTemplate: (templateData) =>
        ipcRenderer.invoke(
            "save-assessment-template",
            templateData
        ),

    getAssessmentTemplates: () =>
        ipcRenderer.invoke(
            "get-assessment-templates"
        ),

    updateAssessmentTemplate: (templateData) =>
        ipcRenderer.invoke(
            "update-assessment-template",
            templateData
        ),

    deleteAssessmentTemplate: (templateId) =>
        ipcRenderer.invoke(
            "delete-assessment-template",
            templateId
        )
});