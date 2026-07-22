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
        )
});