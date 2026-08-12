function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function renderProgramCard(program) {
    const programName =
        escapeHtml(program?.programName || "Unnamed Program");

    const programType =
        escapeHtml(program?.programType || "Not specified");

    const status =
        escapeHtml(program?.status || "Active");

    const startDate =
        escapeHtml(program?.startDate || "Not specified");

    const endDate =
        escapeHtml(program?.endDate || "Not specified");

    const notes =
        escapeHtml(program?.notes || "");

    const programId =
        escapeHtml(program?.id || "");

    return `
        <article
            class="client-program-card"
            data-program-id="${programId}"
        >
            <div class="client-program-card-header">
                <div>
                    <p class="client-profile-label">
                        ${programType}
                    </p>

                    <h3>
                        ${programName}
                    </h3>
                </div>

                <span class="client-status">
                    ${status}
                </span>
            </div>

            <div class="client-program-card-details">
                <p>
                    <strong>Start Date:</strong>
                    ${startDate}
                </p>

                <p>
                    <strong>End Date:</strong>
                    ${endDate}
                </p>
            </div>

            ${notes
            ? `
                        <div class="client-program-card-notes">
                            <strong>Notes:</strong>

                            <p>
                                ${notes}
                            </p>
                        </div>
                    `
            : ""
        }

           <div class="client-program-card-actions">
    <button
        class="secondary-btn edit-client-program-button"
        type="button"
        data-program-id="${programId}"
    >
        Edit Program
    </button>

    <button
        class="secondary-btn delete-client-program-button"
        type="button"
        data-program-id="${programId}"
    >
        Delete Program
    </button>
</div>
        </article>
    `;
}

export function getClientProgramsPage(client) {
    const firstName = client?.firstName || "";
    const lastName = client?.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim() || "Unnamed Client";

    const programs =
        Array.isArray(client?.programs)
            ? client.programs
            : [];

    const programsContent =
        programs.length > 0
            ? programs
                .map((program) => renderProgramCard(program))
                .join("")
            : `
                <div class="empty-state">
                    <h3>
                        No programs assigned
                    </h3>

                    <p>
                        This client does not currently have
                        any coaching programs assigned.
                    </p>
                </div>
            `;

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
                        ${escapeHtml(fullName)}
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
                        <h3>
                            Client Programs
                        </h3>

                        <p>
                            Manage active, planned and completed
                            programs for this client.
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
                    id="client-program-form-panel"
                    class="client-program-form-panel hidden"
                >
                    <form id="client-program-form">
                        <div class="form-section-heading">
                            <h3>
                                Add Program
                            </h3>

                            <p>
                                Enter the details for this client's
                                coaching program.
                            </p>
                        </div>

                        <div class="form-grid">
                            <div class="form-field">
                                <label for="client-program-name">
                                    Program Name
                                </label>

                                <input
                                    id="client-program-name"
                                    name="programName"
                                    type="text"
                                    autocomplete="off"
                                    required
                                >
                            </div>

                            <div class="form-field">
                                <label for="client-program-type">
                                    Program Type
                                </label>

                                <select
                                    id="client-program-type"
                                    name="programType"
                                >
                                    <option value="">
                                        Select program type
                                    </option>

                                    <option value="Personal Training">
                                        Personal Training
                                    </option>

                                    <option value="Online Coaching">
                                        Online Coaching
                                    </option>

                                    <option value="Hybrid Coaching">
                                        Hybrid Coaching
                                    </option>

                                    <option value="Group Coaching">
                                        Group Coaching
                                    </option>

                                    <option value="Assessment">
                                        Assessment
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="client-program-start-date">
                                    Start Date
                                </label>

                                <input
                                    id="client-program-start-date"
                                    name="startDate"
                                    type="date"
                                >
                            </div>

                            <div class="form-field">
                                <label for="client-program-end-date">
                                    End Date
                                </label>

                                <input
                                    id="client-program-end-date"
                                    name="endDate"
                                    type="date"
                                >
                            </div>

                            <div class="form-field">
                                <label for="client-program-status">
                                    Status
                                </label>

                                <select
                                    id="client-program-status"
                                    name="status"
                                >
                                    <option value="Planned">
                                        Planned
                                    </option>

                                    <option
                                        value="Active"
                                        selected
                                    >
                                        Active
                                    </option>

                                    <option value="On Hold">
                                        On Hold
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="form-field">
                            <label for="client-program-notes">
                                Notes
                            </label>

                            <textarea
                                id="client-program-notes"
                                name="notes"
                                rows="4"
                                placeholder="Program focus, schedule, coaching notes or other relevant details."
                            ></textarea>
                        </div>

                        <div class="form-actions">
                            <button
                                id="save-client-program-button"
                                class="primary-btn"
                                type="submit"
                            >
                                Save Program
                            </button>

                            <button
                                id="cancel-client-program-button"
                                class="secondary-btn"
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div
                    id="client-programs-list"
                    class="client-programs-list"
                >
                    ${programsContent}
                </div>
            </div>
        </section>
    `;
}