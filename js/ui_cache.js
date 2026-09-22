const uiCache = {
    text: new Map(),       // Map<HTMLElementNullable, string>
    hidden: new Map(),     // Map<HTMLElementNullable, boolean>
    disabled: new Map(),   // Map<HTMLElementNullable, boolean>
    classes: new Map(),    // Map<HTMLElementNullable, Map<string, boolean>>
    styles: new Map(),     // Map<HTMLElementNullable, Map<string, string>>
    viewKey: new Map()     // Map<HTMLElementNullable, string>
};

/**
 * @param {string | HTMLElementNullable} target 
 * @returns {HTMLElementNullable}
 */
function resolveElement(target) {
    if (target instanceof HTMLElement) return target;

    if (typeof target === 'string') {
        const isSelector = target.startsWith('#') || target.startsWith('.') || target.includes(' ') || target.includes('[');
        return isSelector ? el(target) : el(`#${target}`);
    }

    return null;
}

/**
 * @param {string | HTMLElementNullable} target 
 * @param {string} text 
 */
function safeUpdateText(target, text) {
    if (!target) return;
    const element = resolveElement(target);
    if (!element) return;

    if (uiCache.text.get(element) === text) return;

    element.textContent = text;
    uiCache.text.set(element, text);
}

/**
 * @param {string | HTMLElementNullable} target 
 * @param {boolean} hidden 
 */
function safeUpdateHidden(target, hidden) {
    if (!target) return;
    const element = resolveElement(target);
    if (!element) return;

    if (uiCache.hidden.get(element) === hidden) return;

    element.hidden = hidden;
    uiCache.hidden.set(element, hidden);
}

/**
 * @param {string | HTMLElementNullable} target 
 * @param {boolean} disabled 
 */
function safeUpdateDisabled(target, disabled) {
    const element = resolveElement(target);
    if (!element) return;

    if (uiCache.disabled.get(element) === disabled) return;

    if (element instanceof HTMLButtonElement) {
        element.disabled = disabled;
    }
    uiCache.disabled.set(element, disabled);
}

/**
 * Безопасное переключение конкретного класса без задействования других.
 * @param {string | HTMLElementNullable} target 
 * @param {string} className 
 * @param {boolean} force 
 */
function safeUpdateClass(target, className, force) {
    if (!target || !className) return;    
    const element = resolveElement(target);
    if (!element) return;

    let elementClassCache = uiCache.classes.get(element);
    if (!elementClassCache) {
        elementClassCache = new Map();
        uiCache.classes.set(element, elementClassCache);
    }

    if (elementClassCache.get(className) === force) return;

    element.classList.toggle(className, force);
    elementClassCache.set(className, force);
}

/**
 * @template {string} K
 * @typedef {K extends keyof CSSStyleDeclaration ? (CSSStyleDeclaration[K] extends string ? K : never) : never} WritableStyleKeys
 */

/**
 * Безопасное переключение стилей.
 * @param {string | HTMLElementNullable} target 
 * @param {WritableStyleKeys<any>} styleName 
 * @param {string} value 
 */
function safeUpdateStyle(target, styleName, value) {
    const element = resolveElement(target);
    if (!element) return;

    let elementStyleCache = uiCache.styles.get(element);
    if (!elementStyleCache) {
        elementStyleCache = new Map();
        uiCache.styles.set(element, elementStyleCache);
    }

    if (elementStyleCache.get(styleName) === value) return;

    element.style[styleName] = value;
    elementStyleCache.set(styleName, value);
}


function clearAllCaches() {
    clearDomCache();
    uiCache.text.clear();
    uiCache.hidden.clear();
    uiCache.disabled.clear();
    uiCache.classes.clear();
    uiCache.styles.clear();
}
