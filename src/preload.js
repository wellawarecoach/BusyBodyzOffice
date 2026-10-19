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
        ),

    saveClientAssessment: (payload) =>
        ipcRenderer.invoke(
            "save-client-assessment",
            payload
        ),
    linkClientAssessments: (payload) =>
        ipcRenderer.invoke(
            "link-client-assessments",
            payload
        ),
    exportAssessmentReportPdf: (payload) =>
        ipcRenderer.invoke(
            "export-assessment-report-pdf",
            payload
        ),

    openClientAssessmentFolder: (clientName) =>
        ipcRenderer.invoke(
            "open-client-assessment-folder",
            clientName
        ),
    // Batch 17C — Retrieve saved assessment reports.

    getClientAssessmentReports: (clientName) =>
        ipcRenderer.invoke(
            "get-client-assessment-reports",
            clientName
        ),
    // Batch 17C.5 — Open a saved assessment PDF.

    openClientAssessmentReport: (payload) =>
        ipcRenderer.invoke(
            "open-client-assessment-report",
            payload
        ),
    // Batch 18A.2 — Rename a saved assessment PDF.

    renameClientAssessmentReport: (payload) =>
        ipcRenderer.invoke(
            "rename-client-assessment-report",
            payload
        ),
});