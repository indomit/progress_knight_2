const uiCache = {
    text: new Map(),       // Map<HTMLElement, string>
    hidden: new Map(),     // Map<HTMLElement, boolean>
    disabled: new Map(),   // Map<HTMLElement, boolean>
    classes: new Map(),    // Map<HTMLElement, Map<string, boolean>>
    styles: new Map()      // Map<HTMLElement, Map<string, string>>
};

/**
 * @param {string | HTMLElement} target 
 * @returns {HTMLElement | null}
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
 * @param {string | HTMLElement} target 
 * @param {string} text 
 */
function safeUpdateText(target, text) {
    const element = resolveElement(target);
    if (!element) return;

    if (uiCache.text.get(element) === text) return;

    element.textContent = text;
    uiCache.text.set(element, text);
}

/**
 * @param {string | HTMLElement} target 
 * @param {boolean} hidden 
 */
function safeUpdateHidden(target, hidden) {
    const element = resolveElement(target);
    if (!element) return;

    if (uiCache.hidden.get(element) === hidden) return;

    element.hidden = hidden;
    uiCache.hidden.set(element, hidden);
}

/**
 * @param {string | HTMLElement} target 
 * @param {boolean} disabled 
 */
function safeUpdateDisabled(target, disabled) {
    const element = resolveElement(target);
    if (!element) return;

    if (uiCache.disabled.get(element) === disabled) return;

    element.disabled = disabled;
    uiCache.disabled.set(element, disabled);
}

/**
 * Безопасное переключение конкретного класса без задействования других.
 * @param {string | HTMLElement} target 
 * @param {string} className 
 * @param {boolean} force 
 */
function safeUpdateClass(target, className, force) {
    const element = resolveElement(target);
    if (!element) return;

    // Достаем или создаем внутренний кэш классов для конкретно этого элемента
    let elementClassCache = uiCache.classes.get(element);
    if (!elementClassCache) {
        elementClassCache = new Map();
        uiCache.classes.set(element, elementClassCache);
    }

    // Проверяем состояние именно этого класса на этом элементе
    if (elementClassCache.get(className) === force) return;

    element.classList.toggle(className, force);
    elementClassCache.set(className, force);
}

/**
 * Безопасное переключение стилей.
 * @param {string | HTMLElement} target 
 * @param {string} styleName 
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
