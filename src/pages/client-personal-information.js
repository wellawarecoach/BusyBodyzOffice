export function getClientPersonalInformationPage(client) {
    return `
        <section class="client-personal-information-page">
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
                        Personal Information
                    </p>

                    <h2>
                        ${client.firstName} ${client.lastName}
                    </h2>

                    <p class="client-profile-contact">
                        Review and manage this client’s contact details.
                    </p>
                </div>

                <span class="client-status">
                    Active Client
                </span>
            </div>

           <div class="client-information-card">
    <div class="client-information-header">
        <div>
            <p class="client-profile-label">
                Client Details
            </p>

            <h3>
                Personal and contact information
            </h3>
        </div>

        <button
            id="edit-client-information-button"
            class="primary-btn"
            type="button"
        >
            Edit Information
        </button>
        <button
    id="cancel-client-information-button"
    class="secondary-btn hidden"
    type="button"
>
    Cancel
</button>
    </div>

   <div
    id="client-information-display"
    class="client-information-grid"
>
        <div class="client-information-field">
            <span class="client-information-field-label">
                First Name
            </span>

            <span class="client-information-field-value">
                ${client.firstName || "Not provided"}
            </span>
        </div>

        <div class="client-information-field">
            <span class="client-information-field-label">
                Last Name
            </span>

            <span class="client-information-field-value">
                ${client.lastName || "Not provided"}
            </span>
        </div>

        <div class="client-information-field">
            <span class="client-information-field-label">
                Email
            </span>

            <span class="client-information-field-value">
                ${client.email || "Not provided"}
            </span>
        </div>

        <div class="client-information-field">
            <span class="client-information-field-label">
                Phone
            </span>

            <span class="client-information-field-value">
                ${client.phone || "Not provided"}
            </span>
        </div>

        <div class="client-information-field client-information-field-wide">
            <span class="client-information-field-label">
                Address
            </span>

            <span class="client-information-field-value">
                ${client.address || "Not provided"}
            </span>
        </div>
    </div>
    <form
    id="client-information-form"
    class="client-information-form hidden"
>
    <div class="client-information-grid">
        <label class="client-information-field">
            <span class="client-information-field-label">
                First Name
            </span>

            <input
                id="client-first-name-input"
                type="text"
                value="${client.firstName || ""}"
                required
            >
        </label>

        <label class="client-information-field">
            <span class="client-information-field-label">
                Last Name
            </span>

            <input
                id="client-last-name-input"
                type="text"
                value="${client.lastName || ""}"
                required
            >
        </label>

        <label class="client-information-field">
            <span class="client-information-field-label">
                Email
            </span>

            <input
                id="client-email-input"
                type="email"
                value="${client.email || ""}"
            >
        </label>

        <label class="client-information-field">
            <span class="client-information-field-label">
                Phone
            </span>

            <input
                id="client-phone-input"
                type="tel"
                value="${client.phone || ""}"
            >
        </label>

        <label class="client-information-field client-information-field-wide">
            <span class="client-information-field-label">
                Address
            </span>

            <textarea
                id="client-address-input"
                rows="3"
            >${client.address || ""}</textarea>
        </label>
    </div>

    <div class="client-information-actions">
        <button
            class="primary-btn"
            type="submit"
        >
            Save Changes
        </button>
    </div>
</form>
</div>
        </section>
    `;
}