const domCache = new Map();
const domCollectionsCache = new Map();

/**
 * Ищет ОДИН элемент по CSS-селектору (с кэшированием)
 */
function el(selector) {
    if (domCache.has(selector)) {
        return domCache.get(selector);
    }
    const element = document.querySelector(selector);
    domCache.set(selector, element);
    return element;
}

/**
 * Ищет КОЛЛЕКЦИЮ элементов по CSS-селектору (сохраняет как массив)
 */
function all(selector) {
    if (domCollectionsCache.has(selector)) {
        return domCollectionsCache.get(selector);
    }
    const arr = Array.from(document.querySelectorAll(selector));
    domCollectionsCache.set(selector, arr);
    return arr;
}

const elById = (id) => el(`#${id}`);
const elByClass = (className) => el(`.${className}`);
const allByClass = (className) => all(`.${className}`);
const getElementCachedById = (id) => el(`#${id}`);


/**
 * СБРОС КЭША. 
 * Ключевая функция для инкременталок. Вызывайте её, когда в игре 
 * происходят глобальные изменения (например: Престиж/Мягкий сброс, 
 * переключение глобального экрана, или удаление/добавление динамических зданий).
 */
function clearDomCache(selector = null) {
    if (selector) {
        // Удаляем конкретный элемент или коллекцию, если они обновились
        domCache.delete(selector);
        domCollectionsCache.delete(selector);
    } else {
        // Полная очистка при Престиже / перезапуске
        domCache.clear();
        domCollectionsCache.clear();
    }
}
