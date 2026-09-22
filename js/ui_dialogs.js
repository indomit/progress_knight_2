/** @type {Record<string,string>} */
const buttonColors = {
    blue: '#4444ff',
    green: '#12bb12',
    red: '#ff4444',
    gray: '#333333',
    grey: '#333333',
};

/**
 * 
 * @param {HTMLElement} btnElement 
 * @param {string} colorName 
 */
function applyButtonColor(btnElement, colorName) {
    const hexColor = buttonColors[colorName];

    if (hexColor) {
        btnElement.style.setProperty('--btn-color', hexColor);
        btnElement.style.setProperty('--btn-shadow', `0 0 0.625em ${hexColor}4d`);
    } else {
        btnElement.style.removeProperty('--btn-color');
        btnElement.style.removeProperty('--btn-shadow');
    }
}

/** @returns {Promise<boolean>} */
function showLightModeConfirm() {

    return new Promise((resolve) => {
        const modal = elById('custom-confirm');
        const titleEl = elById('modal-title');
        const textEl = elById('modal-text');
        const confirmBtn = elById('modal-confirm-btn');
        const cancelBtn = elById('modal-cancel-btn');

        if (!modal || !titleEl || !textEl || !confirmBtn || !cancelBtn) {
            throw new Error("Missing essential confirmation modal DOM elements.");
        }

        const warning = getRandomWarning();
        titleEl.textContent = warning.title;
        textEl.textContent = warning.text;

        modal.classList.remove('hidden');

        const closeWithResult = (/** @type {boolean} */ result) => {
            modal.classList.add('hidden');

            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            resolve(result);
        };

        const onConfirm = () => closeWithResult(true);
        const onCancel = () => closeWithResult(false);

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}

/** 
 * Confirm Description Object
 * @typedef {Object} ConfirmDescription
 * @property {string} title
 * @property {string} text 
 * @property {string} [confirmText]
 * @property {string} [cancelText]
 * @property {string} [confirmColor]
 * @property {string} [cancelColor]
 * @property {number} [delay]
 * @property {string} [requiredText]
 */

/** 
 * @param {ConfirmDescription} config 
 * @returns {Promise<boolean>}
 * 
*/
function customConfirm({
    title,
    text,
    confirmText = "OK",
    cancelText = "Cancel",
    confirmColor = "blue",
    cancelColor = "",
    delay = 0,
    requiredText = ""
}) {
    /** @type {Promise<boolean>} */
    return new Promise((resolve) => {
        const modal = elById('game-confirm');
        const titleEl = elById('game-modal-title');
        const textEl = elById('game-modal-text');
        const confirmBtn = /** @type {HTMLButtonElement | null} */ (elById('game-modal-confirm-btn'));
        const cancelBtn = /** @type {HTMLButtonElement | null} */ (elById('game-modal-cancel-btn'));
        const inputEl = /** @type {HTMLInputElement | null} */ (elById('game-modal-input'));

        if (!modal || !titleEl || !textEl || !confirmBtn || !cancelBtn || !inputEl) {
            throw new Error("Missing essential confirmation modal DOM elements.");
        }

        titleEl.textContent = title;
        textEl.textContent = text;
        cancelBtn.textContent = cancelText;

        applyButtonColor(confirmBtn, confirmColor);
        applyButtonColor(cancelBtn, cancelColor);

        let timerActive = delay > 0;

        // 1. Function to evaluate if the confirm button should be enabled
        const checkButtonState = () => {
            const isTextValid = requiredText ? inputEl.value === requiredText : true;
            confirmBtn.disabled = timerActive || !isTextValid;
        };

        // 2. Setup Input Field
        if (requiredText) {
            inputEl.value = "";
            inputEl.classList.remove('hidden');
            inputEl.addEventListener('input', checkButtonState);
        } else {
            inputEl.classList.add('hidden');
        }

        // 3. Setup Timer Cooldown
        /** @type {number | null} */
        let timerInterval = null;
        if (delay > 0) {
            let secondsLeft = ceil(delay / 1000);
            confirmBtn.textContent = `${confirmText} (${secondsLeft})`;

            timerInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft <= 0) {
                    if (timerInterval != null) {
                        clearInterval(timerInterval);
                        timerInterval = null;
                    }
                    timerActive = false;
                    confirmBtn.textContent = confirmText;
                    checkButtonState();
                } else {
                    confirmBtn.textContent = `${confirmText} (${secondsLeft})`;
                }
            }, 1000);
        } else {
            confirmBtn.textContent = confirmText;
        }

        checkButtonState();

        modal.classList.remove('hidden');
        if (requiredText) inputEl.focus();

        const closeWithResult = (/** @type {boolean} */result) => {
            if (timerInterval) clearInterval(timerInterval);
            modal.classList.add('hidden');

            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            if (requiredText) inputEl.removeEventListener('input', checkButtonState);

            resolve(result);
        };

        const onConfirm = () => closeWithResult(true);
        const onCancel = () => closeWithResult(false);

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}
