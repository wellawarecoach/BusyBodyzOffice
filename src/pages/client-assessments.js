export function getClientAssessmentsPage(client) {
    const firstName = client?.firstName || "";
    const lastName = client?.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim() || "Unnamed Client";

    return `
        <section class="client-assessments-page">
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
                        Assessments
                    </p>

                    <h2>
                        ${fullName}
                    </h2>

                    <p class="client-profile-contact">
                        Manage client assessments, reassessments,
                        results and assessment history.
                    </p>
                </div>
            </div>

            <div class="client-assessments-content">
                <div class="client-assessments-toolbar">
                    <div>
                        <h3>
                            Client Assessments
                        </h3>

                        <p>
                            Completed and scheduled assessments
                            for this client will appear here.
                        </p>
                    </div>

                  <div class="client-assessments-actions">
    <button
        id="manage-assessment-templates-button"
        class="secondary-btn"
        type="button"
    >
        Manage Templates
    </button>

    <button
        id="add-client-assessment-button"
        class="primary-btn"
        type="button"
    >
        + New Assessment
    </button>
</div>
                </div>

                <div
                    id="client-assessments-list"
                    class="client-assessments-list"
                >
                    <div class="empty-state">
                        <h3>
                            No assessments yet
                        </h3>

                        <p>
                            This client does not currently have
                            any saved assessments.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    `;
}