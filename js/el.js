/** @type {Map<string, HTMLElementNullable>} */
const domCache = new Map();

/** @type {Map<string, HTMLElement[]>} */
const domCollectionsCache = new Map();

/**
 * 
 * @param {string} selector 
 * @returns {HTMLElementNullable}
 */

function el(selector) {
    const cachedElement = domCache.get(selector);

    if (cachedElement !== undefined) {
        return cachedElement;
    }
    const element = /** @type {HTMLElementNullable} */ (document.querySelector(selector));

    domCache.set(selector, element);
    return element;
}

// function el(selector) {
//     // ЗАЩИТА И ОТЛАДКА ДЛЯ ТРЕНДЕРОВ
//     if (selector === undefined || selector === "undefined" || selector === null || selector === "#undefined") {
//         console.error("КРИТИЧЕСКИЙ БАГ: Вызов el() с undefined селектором!");
//         console.trace(); // Выведет в консоль полную цепочку вызовов (стек-трейс)
//         return null; 
//     }

//     const cachedElement = domCache.get(selector);

//     if (cachedElement !== undefined) {
//         return cachedElement; // вернет элемент ИЛИ null, если его нет на странице
//     }

//     // ОТЛАДКА ДЛЯ ПОВТОРНЫХ СЕЛЕКТОРОВ
//     if (gameData.paused) {
//         console.warn("ОБНОВЛЕНИЕ КЭША НА ПАУЗЕ. Либо этого элемента еще не было, либо кэш трут! Селектор:", selector);
//     }

//     const element = /** @type {HTMLElementNullable} */ (document.querySelector(selector));
//     domCache.set(selector, element);
//     return element;
// }

/**
 * 
 * @param {string} selector 
 * @returns {HTMLElement[]}
 */
function all(selector) {
    const cachedArr = domCollectionsCache.get(selector)
    if (cachedArr !== undefined) {
        return cachedArr;
    }
    const arr = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll(selector)));
    domCollectionsCache.set(selector, arr);
    return arr;
}

/** @param {string} id */
const elById = (id) => el(`#${id}`);

/** @param {string} className */
const elByClass = (className) => el(`.${className}`);

/** @param {string} className */
const allByClass = (className) => all(`.${className}`);

/** @param {string|null} selector */
function clearDomCache(selector = null) {
    if (selector) {
        domCache.delete(selector);
        domCollectionsCache.delete(selector);
    } else {
        domCache.clear();
        domCollectionsCache.clear();
    }
}
