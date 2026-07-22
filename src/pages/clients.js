export function clientsPage() {
  return `
        <div class="page-card">

            <div class="page-header">
                <div>
                    <h3>Client Management</h3>
                    <p>Your central database for every BusyBodyz client.</p>
                </div>

                <button
                    id="add-client-button"
                    class="primary-btn"
                    type="button"
                >
                    + Add Client
                </button>
            </div>

            <div
                id="client-form-panel"
                class="client-form-panel"
                hidden
            >
                <div class="client-form-header">
                    <div>
                        <h4>Add New Client</h4>
                        <p>
                            Enter the client’s basic contact information.
                        </p>
                    </div>

                    <button
                        id="cancel-client-button"
                        class="secondary-btn"
                        type="button"
                    >
                        Cancel
                    </button>
                </div>

                <form id="client-form">

                    <div class="form-grid">

                        <label>
                            First Name
                            <input
                                id="client-first-name"
                                name="firstName"
                                type="text"
                                autocomplete="given-name"
                                required
                            >
                        </label>

                        <label>
                            Last Name
                            <input
                                id="client-last-name"
                                name="lastName"
                                type="text"
                                autocomplete="family-name"
                                required
                            >
                        </label>

                        <label>
                            Email
                            <input
                                id="client-email"
                                name="email"
                                type="email"
                                autocomplete="email"
                            >
                        </label>

                        <label>
                            Phone
                            <input
                                id="client-phone"
                                name="phone"
                                type="tel"
                                autocomplete="tel"
                            >
                        </label>

                    </div>

                    <div class="form-actions">
                        <button
                            class="primary-btn"
                            type="submit"
                        >
                            Save Client
                        </button>
                    </div>

                </form>
            </div>

            <div
                id="client-list-empty-state"
                class="empty-state"
            >
                <h4>No clients yet</h4>

                <p>
                    Every client you add will appear here.
                    This will become the master record used by
                    invoices, assessments, programs, appointments,
                    progress tracking, and communications.
                </p>
            </div>
<div
    id="client-list"
    class="client-list"
    hidden
></div>
</div>
    `;
}