export function getClientProfilePage(client) {
    return `
        <section class="client-profile-page">
            <div class="client-profile-topbar">
                <button
                    id="back-to-clients-button"
                    class="secondary-btn"
                    type="button"
                >
                    ← Back to Clients
                </button>
            </div>

            <div class="client-profile-hero">
                <div>
                    <p class="client-profile-label">
                        Client Profile
                    </p>

                    <h2>
                        ${client.firstName} ${client.lastName}
                    </h2>

                    <p class="client-profile-contact">
                        ${client.email || "No email provided"}
                        <span>•</span>
                        ${client.phone || "No phone provided"}
                    </p>
                </div>

                <span class="client-status">
                    Active Client
                </span>
            </div>

            <div class="client-profile-grid">
                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Personal Information
                    </span>

                    <span class="profile-module-description">
                        Contact details and client information
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Programs
                    </span>

                    <span class="profile-module-description">
                        Coaching programs and enrollment
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Assessments
                    </span>

                    <span class="profile-module-description">
                        Intake forms and evaluations
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Goals
                    </span>

                    <span class="profile-module-description">
                        Client priorities and milestones
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Progress
                    </span>

                    <span class="profile-module-description">
                        Measurements, photos and results
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Invoices
                    </span>

                    <span class="profile-module-description">
                        Billing and payment history
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Notes
                    </span>

                    <span class="profile-module-description">
                        Coaching notes and observations
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Documents
                    </span>

                    <span class="profile-module-description">
                        Forms, files and attachments
                    </span>
                </button>

                <button class="profile-module-card" type="button">
                    <span class="profile-module-title">
                        Appointments
                    </span>

                    <span class="profile-module-description">
                        Upcoming and past sessions
                    </span>
                </button>
            </div>
        </section>
    `;
}