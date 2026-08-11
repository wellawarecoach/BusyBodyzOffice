export function getClientProgramsPage(client) {
    const firstName = client?.firstName || "";
    const lastName = client?.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim() || "Unnamed Client";

    return `
        <section class="client-programs-page">
            <div class="client-profile-topbar">
                <button
                    id="back-to-client-profile-button"
                    class="secondary-btn"
                    type="button"
                >
                    ← Back to Client Profile
                </button>
            </div>

            <div class="client-profile-hero">
                <div>
                    <p class="client-profile-label">
                        Programs
                    </p>

                    <h2>
                        ${fullName}
                    </h2>

                    <p class="client-profile-contact">
                        Manage coaching programs, enrollment,
                        status and program history.
                    </p>
                </div>
            </div>

            <div class="client-programs-content">
                <div class="client-programs-toolbar">
                    <div>
                        <h3>Client Programs</h3>

                        <p>
                            Programs assigned to this client
                            will appear here.
                        </p>
                    </div>

                    <button
                        id="add-client-program-button"
                        class="primary-btn"
                        type="button"
                    >
                        + Add Program
                    </button>
                </div>

                <div
                    id="client-programs-list"
                    class="client-programs-list"
                >
                    <div class="empty-state">
                        <h3>No programs assigned</h3>

                        <p>
                            This client does not currently have
                            any coaching programs assigned.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    `;
}