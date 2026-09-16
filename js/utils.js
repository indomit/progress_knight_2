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

function softcap(value, cap, power = 0.5) {
    if (value <= cap) return value

    return pow(value, power) * pow(cap, 1 - power)
}

const POWERS_OF_10 = [1, 10, 100, 1000];

/*
function fastFloorToString(number, decimals) {
    const factor = POWERS_OF_10[decimals];

    return (floor(number * factor) / factor).toFixed(decimals);
}*/


function fastFloorToString(number, decimals) {
    if (decimals === 0) return String(Math.floor(number));

    const factor = POWERS_OF_10[decimals];
    const floored = Math.floor(number * factor);

    const str = String(floored);

    const splitIndex = str.length - decimals;
    const whole = str.slice(0, splitIndex);
    const frac = str.slice(splitIndex);

    return `${whole || "0"}.${frac.padEnd(decimals, "0")}`;
}


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

function formatWhole(number, decimals = 1) {
    if (number >= 1e3 || (number <= 0.99 && number !== 0)) {
        return format(number, decimals)
    }
    return format(number, 0);
}

function formatCoins(element, coins, decimals = 2) {
    const renderPayload = [];

    switch (gameData.settings.currencyNotation) {
        case 0:
        case 1:
        case 2: {
            const money2 = COINS_DATA[gameData.settings.currencyNotation];
            for (let i = 0; i < money2.length; i++) {
                const m = money2[i];
                const prev = money2[i - 1];
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

    if (element._lastViewKey === viewKey) return;
    element._lastViewKey = viewKey;

    const payloadLen = renderPayload.length;

    for (let i = 0; i < payloadLen; i++) {
        // Безопасное создание элемента, если в HTML их не хватило
        if (i >= element.children.length) {
            const span = document.createElement("span");
            element.appendChild(span);
        }

        const child = element.children[i];
        const data = renderPayload[i];

        if (child.textContent !== data.text) child.textContent = data.text;
        if (child.style.color !== data.color) child.style.color = data.color;
        if (child.className !== data.className) child.className = data.className;
    }

    // Очистка оставшихся неиспользуемых элементов
    for (let i = payloadLen; i < element.children.length; i++) {
        if (element.children[i].textContent !== "") {
            element.children[i].textContent = "";
        }
    }
}

function safeFormatCoins(elementId, coins) {
    const element = elById(elementId);
    formatCoins(element, coins);
}

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

function formatLevel(level) {
    if (level >= 100000)
        return format(level);

    return spaceFormatter.format(level);
}

function formatTreshold(number, decimals = 1, treshold = 100000) {
    if (number < treshold)
        return formatLevel(floor(number))
    else
        return format(number, decimals)
}

function formatAge(days) {
    const years = daysToYears(days)
    const day = getCurrentDay(days)
    if (years > 10000)
        return "Age " + format(years)
    else
        return "Age " + years + " Day " + day
}

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

function yearsToDays(years) {
    return years * 365
}

function daysToYears(days) {
    return floor(days / 365)
}

function getCurrentDay(days) {
    return floor(days - daysToYears(days) * 365)
}

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

function bigIntToExponential(value, fractionDigits = 2) {
    if (typeof value !== 'bigint') {
        throw new Error("Argument must be a bigint, but a " + (typeof value) + " was supplied.");
    }
    if (typeof fractionDigits !== 'number' || fractionDigits < 0) {
        throw new Error("fractionDigits must be a non-negative number.");
    }

    const isNegative = value < 0n;
    const str = (isNegative ? -value : value).toString();
    const exp = str.length - 1;

    const requiredLength = 1 + fractionDigits;
    let roundedStr = str;
    let finalExp = exp;

    if (str.length > requiredLength) {
        const significand = str.slice(0, requiredLength + 1);

        let num = round(parseInt(significand) / 10);

        if (num.toString().length > requiredLength) {
            num = round(num / 10);
            finalExp++;
        }
        roundedStr = num.toString();
    } else {
        roundedStr = str.padEnd(requiredLength, '0');
    }

    const firstDigit = roundedStr.charAt(0);
    const fractionalPart = roundedStr.slice(1);

    const dotAndFraction = fractionDigits > 0 ? "." + fractionalPart : "";

    return (isNegative ? "-" : '') + firstDigit + dotAndFraction + "e" + finalExp;
}


function exponentialToRawNumberString(value) {
    if (!value) return "0";

    const [mantissa, exponentStr] = value.split("e");
    const exponent = Number(exponentStr);

    if (isNaN(exponent) || exponent <= 0) {
        if (mantissa.includes('.')) {
            const [integerPart, fractionalPart] = mantissa.split('.');
            return integerPart
        }
        return mantissa;
    }

    if (mantissa.includes('.')) {
        const [integerPart, fractionalPart] = mantissa.split('.');

        const remainingZeros = exponent - fractionalPart.length;

        if (remainingZeros < 0) {
            return integerPart + fractionalPart.slice(0, exponent);
        }

        return integerPart + fractionalPart + "0".repeat(remainingZeros);
    }

    return mantissa + "0".repeat(exponent);
}


function getChallengeTaskGoalProgress(taskName) {
    if (!Object.keys(gameData.taskData).includes(taskName))
        return 0
    if (gameData.taskData[taskName].isHero)
        return gameData.taskData[taskName].level * 1000
    else
        return gameData.taskData[taskName].level
}

function getFormattedChallengeTaskGoal(taskName, level) {
    if (level < 100000)
        return taskName + " lvl " + formatLevel(level)
    else
        return "Great " + taskName + " lvl " + formatLevel(ceil(level / 1000))
}

function getFormattedTitle(parameter) {
    let title = parameter.replaceAll("_", " ")
    title = title.charAt(0).toUpperCase() + title.slice(1)

    return title
}

function splitmix32(a) {
    return function () {
        a |= 0; a = a + 0x9e3779b9 | 0;
        var t = a ^ a >>> 16; t = imul(t, 0x21f0aaad);
        t = t ^ t >>> 15; t = imul(t, 0x735a2d97);
        return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

function getRandomInt(seed, limit) {
    var rand = splitmix32(seed)
    return floor(rand() * limit)
}

function getDynamicProgress(current, required) {
    const prevRequired = 0
    const logThreshold = 1e100

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

function copyTextToClipboard(text) {
    return navigator.clipboard.writeText(text);
}

function peekSettingFromSave(setting) {
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

function getQuerySelector(name) {
    return "#row" + toId(name)
}

function getRowByName(name) {
    return el(getQuerySelector(name))
}