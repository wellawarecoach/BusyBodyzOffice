export function getAssessmentTemplatesPage(client) {
    const firstName = client?.firstName || "";
    const lastName = client?.lastName || "";

    const fullName =
        `${firstName} ${lastName}`.trim() || "Unnamed Client";

    return `
        <section class="assessment-templates-page">
            <div class="client-profile-topbar">
                <button
                    id="back-to-client-assessments-button"
                    class="secondary-btn"
                    type="button"
                >
                    ← Back to Assessments
                </button>
            </div>

            <div class="client-profile-hero">
                <div>
                    <p class="client-profile-label">
                        Assessment Templates
                    </p>

                    <h2>
                        ${fullName}
                    </h2>

                    <p class="client-profile-contact">
                        Create and manage reusable assessment
                        templates, questions and protocols.
                    </p>
                </div>
            </div>

            <div class="assessment-templates-content">
                <div class="assessment-templates-toolbar">
                    <div>
                        <h3>
                            Templates
                        </h3>

                        <p>
                            Build reusable assessment structures
                            before assigning them to clients.
                        </p>
                    </div>

                    <button
                        id="add-assessment-template-button"
                        class="primary-btn"
                        type="button"
                    >
                        + New Template
                    </button>
                </div>

                <div
                    id="assessment-template-form-panel"
                    class="assessment-template-form-panel hidden"
                >
                    <form id="assessment-template-form">
                        <div class="form-section-heading">
                            <h3>
                                New Assessment Template
                            </h3>

                            <p>
                                Define the basic information for
                                this reusable assessment template.
                            </p>
                        </div>

                        <div class="form-grid">
                            <div class="form-field">
                                <label for="assessment-template-name">
                                    Template Name
                                </label>

                                <input
                                    id="assessment-template-name"
                                    name="templateName"
                                    type="text"
                                    autocomplete="off"
                                    required
                                >
                            </div>

                            <div class="form-field">
                                <label for="assessment-template-category">
                                    Category
                                </label>

                                <select
                                    id="assessment-template-category"
                                    name="category"
                                >
                                    <option value="">
                                        Select category
                                    </option>

                                    <option value="Comprehensive Fitness">
                                        Comprehensive Fitness
                                    </option>

                                    <option value="Movement">
                                        Movement
                                    </option>

                                    <option value="Strength">
                                        Strength
                                    </option>

                                    <option value="Cardiorespiratory">
                                        Cardiorespiratory
                                    </option>

                                    <option value="Mobility">
                                        Mobility
                                    </option>

                                    <option value="Performance">
                                        Performance
                                    </option>

                                    <option value="Health and Lifestyle">
                                        Health and Lifestyle
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="assessment-template-version">
                                    Version
                                </label>

                                <input
                                    id="assessment-template-version"
                                    name="version"
                                    type="text"
                                    value="1.0"
                                    autocomplete="off"
                                >
                            </div>

                            <div class="form-field">
                                <label for="assessment-template-status">
                                    Status
                                </label>

                                <select
                                    id="assessment-template-status"
                                    name="status"
                                >
                                    <option
                                        value="Active"
                                        selected
                                    >
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="form-field">
                            <label for="assessment-template-description">
                                Description
                            </label>

                            <textarea
                                id="assessment-template-description"
                                name="description"
                                rows="4"
                                placeholder="Purpose, intended client population, assessment focus, or other relevant information."
                            ></textarea>
                        </div>

                        <div class="assessment-template-builder-section">
                            <div class="form-section-heading">
                                <h3>
                                    Questions
                                </h3>

                                <p>
                                    Questions and response fields
                                    will be added here in the next stage.
                                </p>
                            </div>

                            <button
                                id="add-assessment-question-button"
                                class="secondary-btn"
                                type="button"
                                disabled
                            >
                                + Add Question
                            </button>
                        </div>

                        <div class="assessment-template-builder-section">
                            <div class="form-section-heading">
                                <h3>
                                    Protocol
                                </h3>

                                <p>
                                    Testing instructions, procedures,
                                    scoring and reference information
                                    will be added here in the next stage.
                                </p>
                            </div>

                            <button
                                id="edit-assessment-protocol-button"
                                class="secondary-btn"
                                type="button"
                                disabled
                            >
                                Add Protocol
                            </button>
                        </div>

                        <div class="form-actions">
                            <button
                                id="save-assessment-template-button"
                                class="primary-btn"
                                type="submit"
                            >
                                Save Template
                            </button>

                            <button
                                id="cancel-assessment-template-button"
                                class="secondary-btn"
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                <div
                    id="assessment-templates-list"
                    class="assessment-templates-list"
                >
                    <div class="empty-state">
                        <h3>
                            No assessment templates yet
                        </h3>

                        <p>
                            Create your first assessment template
                            to begin building editable questions
                            and testing protocols.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    `;
}