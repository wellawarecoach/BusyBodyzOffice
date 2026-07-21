export function invoicesPage() {
  return `
        <section class="page-card">
            <h3>Invoice Workspace</h3>

            <p>
                Choose the main folder where BusyBodyzOffice will
                store client invoice folders and PDF files.
            </p>

            <button
                id="choose-invoice-folder"
                class="primary-btn"
                type="button"
            >
                Choose Invoice Folder
            </button>

            <p id="invoice-folder-status">
                No invoice folder selected.
            </p>
        </section>

        <section class="page-card">
            <h3>Create Client Folder</h3>

            <p>
                Enter the client’s name to create their invoice
                folder.
            </p>

            <label for="invoice-client-name">
                Client name
            </label>

            <input
                id="invoice-client-name"
                type="text"
                placeholder="Example: Jane Smith"
                autocomplete="off"
            />

            <button
                id="create-client-folder"
                class="primary-btn"
                type="button"
            >
                Create Client Folder
            </button>

            <p id="client-folder-status"></p>
        </section>
    `;
}