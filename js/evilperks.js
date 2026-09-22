/** 
 * Represents an individual perk configuration with a level limit and cost calculator.
 * @typedef {Object} EvilPerkConfigElement
 * @property {number} max The maximum allowed level for this perk.
 * @property {function(number): number} calc Function that calculates the cost for a given level.
 */

/**
 * The configuration object mapping perk IDs to their respective formulas.
 * @typedef {Record<number, EvilPerkConfigElement>} EvilPerkConfig
 */
/** 
 * Global object acting as a pre-calculated cost cache for each perk ID.
 * Contains arrays where the index equals the perk level, and the value is the cost.
 * @type {Record<number, number[]>}
 */
const evilPerkCostsCache = {
	1: [],
	2: [],
	3: [],
	4: [],
	5: []
};

/**
 * Initializes the global `evilPerkCostsCache` object with pre-calculated values
 * based on math formulas up to each perk's maximum level limit.
 * @returns {void}
 */
function initEvilPerkCostsCache() {
	/** @type {EvilPerkConfig} */
	const config = {
		1: { max: 10, calc: (lvl) => pow(2, lvl + 1) + 4.6 },
		2: { max: 14, calc: (lvl) => pow(3, lvl + 1) + 66.6 - 3 },
		3: { max: 9, calc: (lvl) => pow(5, lvl + 1) + 666.6 - 5 },
		4: {
			max: 18,
			calc: (lvl) => lvl < 9
				? pow(5, lvl + 1) + 6666 - 5
				: pow(6.66, lvl + 1) - 666 * 33 - 5e6
		},
		5: { max: 309, calc: (lvl) => pow(10, lvl) * 6.66e10 } // Для 5 кейса предел ~308-309 по условию 1e308
	};

	for (const num in config) {
		const perkId = Number(num);
		const { max, calc } = config[perkId];

		/** @type {number[]} */
		const cache = [];

		// Fill the cache for each possible perk level
		for (let lvl = 0; lvl < max; lvl++) {
			cache.push(calc(lvl));
		}

		// Anything at or above the limit returns Infinity
		cache.push(Infinity);

		evilPerkCostsCache[num] = cache;
	}
}

initEvilPerkCostsCache()


function getEvilPerksGeneration() {
	if (gameData.evil == 0) return 0
	let essence_perk_buff_mult = 1e9
	if (gameData.essence == 0)
		essence_perk_buff_mult = 10
	else if (gameData.essence < 1e308 / essence_perk_buff_mult)
		essence_perk_buff_mult *= gameData.essence
	else
		essence_perk_buff_mult = 1e308
	return log10(gameData.evil + 1) * log10(essence_perk_buff_mult) / 365
}

/**
 * @param {number} i
 * @returns {number}
 */
function getEvilPerkAgeRequirement(i) {
	switch (i) {
		case 1: return getEyeRequirement()
		case 2: return getEvilRequirement()
		case 3: return getVoidRequirement()
		case 4: return getCelestialRequirement()
	}
	return 0
}

/**
 * @param {number} i
 * @returns {number}
 */
function getEvilPerkAgeReduceBy(i) {
	switch (i) {
		case 1: return 5
		case 2: return 12.5
		case 3: return 100
		case 4: return getCelestialReduceYearsBy()
	}
	return 0
}

/**
 * @param {number} i
 * @returns {number}
 */
function getEvilPerkAgeReduceByTotal(i) {
	switch (i) {
		case 1: return 5 * gameData.evil_perks.reduce_eye_requirement
		case 2: return 12.5 * gameData.evil_perks.reduce_evil_requirement
		case 3: return 100 * gameData.evil_perks.reduce_the_void_requirement
		case 4: return gameData.evil_perks.reduce_celestial_requirement < 9 ? 1000 * gameData.evil_perks.reduce_celestial_requirement : 9000 + (gameData.evil_perks.reduce_celestial_requirement - 9) * 100
	}
	return 0
}

function getEyeRequirement() {
	let newreq = 65 - gameData.evil_perks.reduce_eye_requirement * 5
	return newreq < 15 ? 15 : newreq
}

function getEvilRequirement() {
	let newreq = 200 - gameData.evil_perks.reduce_evil_requirement * 12.5
	newreq = newreq < 25 ? 25 : newreq
	newreq = getEyeRequirement() > newreq ? getEyeRequirement() : newreq
	return newreq
}

function getVoidRequirement() {
	let newreq = 1000 - gameData.evil_perks.reduce_the_void_requirement * 100
	newreq = getEvilRequirement() > newreq ? getEvilRequirement() : newreq
	return newreq < 100 ? 100 : newreq
}

function getCelestialReduceYearsBy() {
	if (gameData.evil_perks.reduce_celestial_requirement < 9)
		return 1000
	else
		return 100
}

function getCelestialRequirement() {
	let newreq = 10000
	newreq -= min(9, gameData.evil_perks.reduce_celestial_requirement) * 1000
	if (gameData.evil_perks.reduce_celestial_requirement > 9)
		newreq -= min(9, gameData.evil_perks.reduce_celestial_requirement - 9) * 100
	return newreq < 100 ? 100 : newreq
}

function getEssenceReward() {
	return getEssenceRewardPercent() / 100.0 * gameData.essence
}

function getEssenceRewardPercent() {
	return (gameData.evil_perks.receive_essence + 1) * 10
}


/**
 * @param {number} evilperknum
 */
function getEvilPerkCost(evilperknum) {
	const currentLevels = [
		0,
		gameData.evil_perks.reduce_eye_requirement,
		gameData.evil_perks.reduce_evil_requirement,
		gameData.evil_perks.reduce_the_void_requirement,
		gameData.evil_perks.reduce_celestial_requirement,
		gameData.evil_perks.receive_essence
	];

	const lvl = currentLevels[evilperknum];
	const perkCache = evilPerkCostsCache[evilperknum];

	return perkCache[lvl]
}


/**
 * @param {number} i
 */
function getEvilPerkRank(i) {
	switch (i) {
		case 1:
			return gameData.evil_perks.reduce_eye_requirement
		case 2:
			return gameData.evil_perks.reduce_evil_requirement
		case 3:
			return gameData.evil_perks.reduce_the_void_requirement
		case 4:
			return gameData.evil_perks.reduce_celestial_requirement
		case 5:
			return gameData.evil_perks.receive_essence
	}
}

/**
 * @param {number} evilperknum
 */
function buyEvilPerk(evilperknum) {
	switch (evilperknum) {
		case 1:
			if (gameData.evil_perks_points >= getEvilPerkCost(1)) {
				gameData.evil_perks_points -= getEvilPerkCost(1)
				gameData.evil_perks.reduce_eye_requirement += 1
			}
			break
		case 2:
			if (gameData.evil_perks_points >= getEvilPerkCost(2)) {
				gameData.evil_perks_points -= getEvilPerkCost(2)
				gameData.evil_perks.reduce_evil_requirement += 1
			}
			break
		case 3:
			if (gameData.evil_perks_points >= getEvilPerkCost(3)) {
				gameData.evil_perks_points -= getEvilPerkCost(3)
				gameData.evil_perks.reduce_the_void_requirement += 1
			}
			break
		case 4:
			if (gameData.evil_perks_points >= getEvilPerkCost(4)) {
				gameData.evil_perks_points -= getEvilPerkCost(4)
				gameData.evil_perks.reduce_celestial_requirement += 1
			}
			break
		case 5:
			if (gameData.evil_perks_points >= getEvilPerkCost(5)) {
				gameData.evil_perks_points -= getEvilPerkCost(5)
				gameData.evil_perks.receive_essence += 1
				gameData.essence += getEssenceReward()
			}
			break
	}
}

/**
 * @param {number} i
 */
function hasEvilPerk(i) {
	switch (i) {
		case 1: return gameData.evil_perks.reduce_eye_requirement > 0
		case 2: return gameData.evil_perks.reduce_evil_requirement > 0
		case 3: return gameData.evil_perks.reduce_the_void_requirement > 0
		case 4: return gameData.evil_perks.reduce_celestial_requirement > 0
		case 5: return gameData.evil_perks.receive_essence > 0
	}
	return false
}

/**
 * 
 * @returns {number}
 */
function getAge0Requirement() {
	const eyeReq = getEyeRequirement();

	const ageMap = {
		65: 25, 60: 25, 55: 25, 50: 25, 45: 25, 40: 25,
		35: 20, 30: 20,
		25: 18,
		20: 16,
		15: 13
	};

	return ageMap[eyeReq];
}

/**
 * 
 * @returns {number}
 */
function getAge1Requirement() {
	const eyeReq = getEyeRequirement();

	const ageMap = {
		65: 45, 60: 45, 55: 45, 50: 45,
		45: 40,
		40: 35,
		35: 30,
		30: 25,
		25: 20,
		20: 18,
		15: 14
	};

	return ageMap[eyeReq];
}

