const POWERS_OF_10 = [1, 10, 100, 1000];

const log = Math.log;
const log10 = Math.log10;
const log2 = Math.log2;
const pow = Math.pow;
const exp = Math.exp;
const max = Math.max;
const min = Math.min;
const floor = Math.floor;
const ceil = Math.ceil;
const round = Math.round;
const random = Math.random;
const abs = Math.abs;
const imul = Math.imul;
window['pow'] = Math.pow
/**
 * 
 * @param {number} value 
 * @param {number} cap 
 * @param {number} power 
 * @returns 
 */
function softcap(value, cap, power = 0.5) {
    if (value <= cap) return value

    return pow(value, power) * pow(cap, 1 - power)
}

/**
 * 
 * @param {number} number 
 * @param {number} decimals 
 * @returns 
 */
function fastFloorToString(number, decimals) {
    if (decimals === 0) return String(Math.floor(number));

    const factor = POWERS_OF_10[decimals];
    const floored = Math.floor(number * factor);

    const str = String(floored).padStart(decimals + 1, "0");

    const splitIndex = str.length - decimals;
    const whole = str.slice(0, splitIndex);
    const frac = str.slice(splitIndex);

    return `${whole || "0"}.${frac.padEnd(decimals, "0")}`;
}

/**
 * 
 * @param {number} number 
 * @param {number} decimals 
 * @returns 
 */
function format(number, decimals = 1) {
    if (number === Infinity)
        return "Infinity"
    const units = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "O", "N", "D", "Ud", "Dd", "Td", "Qad", "Qid", "Sxd", "Spd", "Od", "Nd", "V", "Uv", "Dv", "Tv",
        "Qav", "Qiv", "Sxv", "Spv", "Ov", "Nv", "Tr", "Ut", "Dt", "Tt"]

    // what tier? (determines SI symbol)
    const tier = log10(number) / 3 | 0;
    if (tier <= 0) return fastFloorToString(number, decimals)

    if ((gameData.settings.numberNotation == 0 || tier < 3) && (tier < units.length)) {
        const suffix = units[tier];
        const scale = pow(10, tier * 3);
        const scaled = number / scale;
        return fastFloorToString(scaled, decimals) + suffix;
    } else {
        if (gameData.settings.numberNotation == 1) {
            const exp = log10(number) | 0;
            const scale = pow(10, exp);
            const scaled = number / scale;
            return fastFloorToString(scaled, decimals) + "e" + exp;
        }
        else {
            const exp = log10(number) / 3 | 0;
            const scale = pow(10, exp * 3);
            const scaled = number / scale;
            return fastFloorToString(scaled, decimals) + "e" + exp * 3;
        }
    }
}

/**
 * @typedef {Object} CoinsData
 * @property {string} name
 * @property {string} color
 * @property {number} value
 * @property {string} [class]
 * @property {string} [prefix]
 */

/** @type {CoinsData[][]} */
const COINS_DATA = [
    [
        { "name": "p", "color": "#79b9c7", "value": 1e6 },
        { "name": "g", "color": "#E5C100", "value": 10000 },
        { "name": "s", "color": "#a8a8a8", "value": 100 },
        { "name": "c", "color": "#a15c2f", "value": 1 },
    ],
    [
        { "name": " 𒅒", "color": "#ffffff", "value": 1e62, "class": "currency-shadow-rainbow" },
        { "name": " 𒅒", "color": "#ffffff", "value": 1e47, "class": "currency-shadow" },
        { "name": " 𒇫", "color": "#66ccff", "value": 1e41, "class": "currency-shadow" },
        { "name": "🜊", "color": "#00ff00", "value": 1e35, "class": "currency-bold" },
        { "name": "✹", "color": "#ffffcc", "value": 1e30 },
        { "name": "∰", "color": "#ff0083", "value": 1e26 },
        { "name": "Φ", "color": "#27b897", "value": 1e23 },
        { "name": "Ξ", "color": "#cd72ff", "value": 1e20 },
        { "name": "Δ", "color": "#f5c211", "value": 1e17 },
        { "name": "d", "color": "#ffffff", "value": 1e14 },
        { "name": "r", "color": "#ed333b", "value": 1e12 },
        { "name": "S", "color": "#6666ff", "value": 1e10 },
        { "name": "e", "color": "#2ec27e", "value": 1e8 },
        { "name": "p", "color": "#79b9c7", "value": 1e6 },
        { "name": "g", "color": "#E5C100", "value": 10000 },
        { "name": "s", "color": "#a8a8a8", "value": 100 },
        { "name": "c", "color": "#a15c2f", "value": 1 },
    ],
    [
        { "name": "", "color": "#E5C100", "value": 240, "prefix": "£" },
        { "name": "s", "color": "#a8a8a8", "value": 12 },
        { "name": "d", "color": "#a15c2f", "value": 1 },
    ]
];

/**
 * 
 * @param {HTMLElementNullable} element 
 * @param {number} coins 
 * @param {number} decimals 
 * @returns 
 */
function formatCoins(element, coins, decimals = 2) {
    if (!element) {
        console.error("null element in formatCoins")
        return;
    }

    const renderPayload = [];

    switch (gameData.settings.currencyNotation) {
        case 0:
        case 1:
        case 2: {
            const money = COINS_DATA[gameData.settings.currencyNotation];
            for (let i = 0; i < money.length; i++) {
                const m = money[i];
                const prev = money[i - 1];
                const diff = prev ? prev.value / m.value : Infinity;
                const amount = floor(coins / m.value) % diff;

                if (amount > 0 || (coins < 1 && m.value === 1)) {
                    renderPayload.push({
                        text: (m.prefix ?? "") + format(amount, amount < 1000 ? 0 : decimals) + m.name,
                        color: m.color,
                        className: m.class || ""
                    });
                }
                if (renderPayload.length >= 2 || amount >= 100) break;
            }
            break;
        }
        case 3: {
            renderPayload.push({
                text: "$" + format(coins / 100, decimals),
                color: "#E5C100",
                className: ""
            });
            break;
        }
        default:
            throw new Error("Invalid currency notation set");
    }

    let viewKey = "";
    for (let i = 0; i < renderPayload.length; i++) {
        const p = renderPayload[i];
        viewKey += `${p.text}_${p.color}_${p.className}|`;
    }

    if (uiCache.viewKey.get(element) === viewKey) return;
    uiCache.viewKey.set(element, viewKey);

    const payloadLen = renderPayload.length;

    for (let i = 0; i < payloadLen; i++) {
        if (i >= element.children.length) {
            const span = document.createElement("span");
            element.appendChild(span);
        }

        const child = /** @type {HTMLElement} */ (element.children[i]);
        const data = renderPayload[i];

        safeUpdateText(child, data.text);
        safeUpdateStyle(child, "color", data.color);
        if (data.className) {
            safeUpdateClass(child, data.className, true);
        } else {
            child.className = "";
            uiCache.classes.delete(child);
        }
        safeUpdateHidden(child, false);
    }

    const totalChildren = element.children.length;
    for (let i = payloadLen; i < totalChildren; i++) {
        const child = /** @type {HTMLElement} */ (element.children[i]);
        safeUpdateText(child, "");
        safeUpdateHidden(child, true);
        uiCache.classes.delete(child);
    }
}

/**
 * @param {string | HTMLElementNullable} target 
 * @param {number} coins 
 */
function safeFormatCoins(target, coins) {
    if (!target) return;
    const element = resolveElement(target);
    if (!element) return;

    formatCoins(element, coins);
}

/**
 * 
 * @param {number} sec_num 
 * @param {boolean} show_ms 
 * @returns {string}
 */
function formatTime(sec_num, show_ms = false) {
    if (sec_num == null) return "unknown";
    if (sec_num < 0) return '-' + formatTime(-sec_num, show_ms);

    if (sec_num >= 31536000000) { // 1000 * 31536000
        let years = floor(sec_num / 31536000);
        return formatWhole(years) + ' years';
    }

    let prefix = '';

    if (sec_num >= 31536000) {
        let years = floor(sec_num / 31536000);
        prefix += years + 'y ';
        sec_num %= 31536000;
    }

    if (sec_num >= 86400) {
        let days = floor(sec_num / 86400);
        prefix += days + 'd ';
        sec_num %= 86400;
    }

    let hasHours = sec_num > 3600 || prefix.length > 0;

    let hours = floor(sec_num / 3600);
    sec_num %= 3600;

    let minutes = floor(sec_num / 60);
    let seconds = floor(sec_num % 60);

    let ms = floor((sec_num - floor(sec_num)) * 1000);
    let mss = (show_ms ? "." + ms.toString().padStart(3, "0") : "");

    let hoursStr = hours < 10 ? "0" + hours : hours;
    let minutesStr = minutes < 10 ? "0" + minutes : minutes;
    let secondsStr = seconds < 10 ? "0" + seconds : seconds;

    return prefix + (hasHours ? hoursStr + ':' : "") + minutesStr + ':' + secondsStr + mss;
}

const spaceFormatter = new Intl.NumberFormat(undefined, { useGrouping: true });
const GROUP_SEPARATOR = (() => {
    const parts = spaceFormatter.formatToParts(1234567);
    for (const p of parts) {
        if (p.type === "group") return p.value;
    }
    return " ";
})();

/**
 * Fast integer formatter with a thousands separator.
 * @param {number} n
 * @returns {string}
 */
function formatWithSeparator(n) {
    n = floor(n)
    if (n < 1000) return String(n);

    const str = String(n);
    const len = str.length;
    let result = "";
    let count = 0;

    for (let i = len - 1; i >= 0; i--) {
        if (count === 3) {
            result = GROUP_SEPARATOR + result;
            count = 0;
        }
        result = str[i] + result;
        count++;
    }
    return result;
}

/**
 * Uses spaceFormatter for values less than 100000, otherwise uses format()
 * @param {number} level 
 * @returns 
 */
function formatLevel(level) {
    if (level >= 100000)
        return format(level);

    return formatWithSeparator(level);
}

/**
 * Uses formatLevel() before treshold, otherwise uses format()
 * @param {number} number 
 * @param {number} decimals 
 * @param {number} treshold 
 * @returns 
 */
function formatTreshold(number, decimals = 1, treshold = 100000) {
    if (number < treshold)
        return formatLevel(floor(number))
    else
        return format(number, decimals)
}

/**
 * Formats as Integers in range (0-1000), otherwise uses format(n, d)
 * @param {number} number 
 * @param {number} decimals 
 * @returns 
 */
function formatWhole(number, decimals = 1) {
    if (number >= 1e3 || (number <= 0.99 && number !== 0)) {
        return format(number, decimals)
    }
    return format(number, 0);
}

/** @param {number} days */
function formatAge(days) {
    const years = daysToYears(days)
    const day = getCurrentDay(days)
    if (years > 10000)
        return "Age " + format(years)
    else
        return "Age " + years + " Day " + day
}

/** @param {number} days */
function formatGameDays(days) {
    if (days === Infinity || isNaN(days)) return "Infinity"

    const years = floor(days / 365)
    const remainingDays = floor(days % 365)

    if (years > 10000) {
        return format(years) + " years"
    } else if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
    } else {
        return `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`
    }
}

/** @param {number} years */
function yearsToDays(years) {
    return years * 365
}

/** @param {number} days */
function daysToYears(days) {
    return floor(days / 365)
}

/** @param {number} days */
function getCurrentDay(days) {
    return floor(days - daysToYears(days) * 365)
}

/** @param {string} str */
function toId(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        // 32 — код пробела, 39 — код одинарной кавычки
        if (code !== 32 && code !== 39) {
            result += str[i];
        }
    }
    return result;
}

// challenges 

/**
 * 
 * @param {string} taskName 
 * @param {number} level 
 * @returns 
 */
function getFormattedChallengeTaskGoal(taskName, level) {
    if (level < 100000)
        return taskName + " lvl " + formatLevel(level)
    else
        return "Great " + taskName + " lvl " + formatLevel(ceil(level / 1000))
}

/**
 * 
 * @param {string} parameter 
 * @returns 
 */
function getFormattedTitle(parameter) {
    let title = parameter.replaceAll("_", " ")
    title = title.charAt(0).toUpperCase() + title.slice(1)

    return title
}



/** @param {number} a */
function splitmix32(a) {
    return function () {
        a |= 0; a = a + 0x9e3779b9 | 0;
        var t = a ^ a >>> 16; t = imul(t, 0x21f0aaad);
        t = t ^ t >>> 15; t = imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

/** @param {number} seed @param {number} limit */
function getRandomInt(seed, limit) {
    var rand = splitmix32(seed)
    return floor(rand() * limit)
}

/**
 * @param {string} data
 * @param {number} key
 */
function f12(data, key) {
    const bytes = new Uint8Array(data.length / 2);

    for (let i = 0; i < data.length; i += 2) {
        let hexPair = data.slice(i, i + 2);
        let byteValue = parseInt(hexPair, 16);
        bytes[i / 2] = byteValue ^ key;
    }

    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

/**
 * @param {string} text
 * @param {number} key
 */
function f13(text, key) {
    const encoder = new TextEncoder();
    const view = encoder.encode(text);

    let encryptedHex = "";

    for (let i = 0; i < view.length; i++) {
        let xorValue = view[i] ^ key;
        encryptedHex += xorValue.toString(16).padStart(2, '0');
    }

    return encryptedHex;
}

/**
 * 
 * @param {number} current 
 * @param {number | null} required 
 * @returns 
 */
function getDynamicProgress(current, required) {
    const logThreshold = 1e100

    if (!required) return 0
    if (current <= 0) return 0

    if (required < logThreshold || current < logThreshold) {
        return (current / required) * 100
    }

    const logCurrent = log10(current)
    const logRequired = log10(required)

    if (logRequired - 99 > 0) {
        const percent = ((logCurrent - 99) / (logRequired - 99)) * 100
        return min(max(percent, 0), 100)
    }

    return 100
}

/** @param {string} text */
function copyTextToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

/**
 * 
 * @param {string} imageSrc 
 * @param {number} ratio 
 * @returns {Promise<string>} 
 */
async function applyCustomImage(imageSrc, ratio) {
    const f = window['fe' + 'tch'];
    const response = await f(imageSrc);
    if (!response.ok) throw new Error("Failed to load the image.");
    const arrayBuffer = await response.arrayBuffer();
    const img = UPNG.decode(arrayBuffer);
    const pixels = new Uint8Array(UPNG.toRGBA8(img)[0]);
    const bitStream = [];
    for (let i = 0; i < pixels.length; i += 4) {
        for (let channel = 0; channel < 3; channel++) {
            bitStream.push(pixels[i + channel] & 1);
        }
    }
    let dataLen = 0;
    let bitIndex = 0;
    for (let i = 0; i < 32; i++) {
        dataLen = (dataLen << 1) | bitStream[bitIndex++];
    }
    if (dataLen <= 0 || dataLen > (bitStream.length - 32) / 8) {
        throw new Error("Failed to read the data.");
    }

    const bytesData = new Uint8Array(dataLen);
    for (let i = 0; i < dataLen; i++) {
        let byteVal = 0;
        for (let bit = 0; bit < 8; bit++) {
            byteVal = (byteVal << 1) | bitStream[bitIndex++];
        }
        bytesData[i] = byteVal;
    }

    const bytes = new Uint8Array(dataLen);
    let currentRatio = ratio;
    let prevByte = 0;
    let prevCByte = 0;

    for (let i = 0; i < dataLen; i++) {
        currentRatio = (currentRatio * 1103515245 + 12345) | 0;
        let baseKeyByte = currentRatio & 0xFF;

        let xorMask = baseKeyByte ^ prevByte ^ prevCByte;
        bytes[i] = bytesData[i] ^ xorMask;

        prevByte = bytes[i];
        prevCByte = bytesData[i];
    }
    const _td = window['\x54\x65\x78\x74\x44\x65\x63\x6f\x64\x65\x72'];
    return new _td()['\x64\x65\x63\x6f\x64\x65'](bytes);
}


/** 
 * @param {string} setting 
 * @deprecated Save/load behavior has been refactored. Use `gameData.settings[setting]` directly instead. 
 */
function peekSettingFromSave(setting) {
    console.warn(`Deprecated function peekSettingFromSave('${setting}') called! Redirecting to gameData.settings.`);

    try {
        const save = localStorage.getItem("gameDataSave");
        if (!save) return gameData?.settings?.[setting];

        const gameDataSave = JSON.parse(save);
        return gameDataSave?.settings?.[setting] ?? gameData?.settings?.[setting];
    } catch (error) {
        console.error("peekSettingFromSave ERROR, BUT WHY?!");
        console.error(error);
        try {
            console.log(localStorage.getItem("gameDataSave"));
        } catch (e) {
            console.log("LocalStorage is blocked completely");
        }
    }
}

/** @param {string} name */
function getQuerySelector(name) {
    return "#row" + toId(name)
}