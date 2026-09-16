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

// Хэш-функция для создания стабильного числового сида из строки
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

function getCurrentEventId() {
	return getCurrentEventIdByDate(new Date());
}

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