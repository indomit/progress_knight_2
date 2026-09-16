const BASE_POW_BASE = 1.01;
const HERO_POW_BASE = 1.08;

const LN_BASE_POW_BASE = log(BASE_POW_BASE);
const LN_HERO_POW_BASE = log(HERO_POW_BASE);

const BASE_POW_CACHE = new Float64Array(400000);
const HERO_POW_CACHE = new Float64Array(400000);

function getGrowthMultiplier(base, lvl, isHero) {
    const cache = isHero ? HERO_POW_CACHE : BASE_POW_CACHE;

    if (lvl >= 400000) {
        return pow(base, lvl);
    }

    let val = cache[lvl];
    if (val === 0) {
        val = pow(base, lvl);
        cache[lvl] = val;
    }
    return val;
}

const DECIMAL_1E305 = new Decimal("1e305");
const TEMP_DECIMAL = new Decimal(0);
const CONVERGENCE_FACTOR = 0.35;

/**
 * @typedef {object} TaskBaseData
 * @property {string} name
 * @property {number} maxXp
 * @property {number} [heroxp] 
 * @property {number} effect
 * @property {string} [description]
 */
class Task {
    /**
     * @param {TaskBaseData} baseData
     */
    constructor(baseData) {
        this.baseData = baseData;
        this.name = baseData.name;
        this.maxXpBase = baseData.maxXp;
        this.level = 0;
        this.maxLevel = 0;
        /** @type {Decimal} */
        this.xp = new Decimal(0);
        this.isHero = false;
        this.unlocked = false;
        /** @type {(() => number)[]} */
        this.xpMultipliers = [];
        /** @type {Map<string, HTMLElement | null>} */
        this.elementsCache = new Map();
        this.heroxp = baseData.heroxp ?? 0
        this.pow10heroxp = pow(10, this.heroxp);
        this.heroShift = this.heroxp ? floor(this.heroxp / 9) : 0;

        /** @type {Decimal} */
        this.xpGain = new Decimal(1)
        /** @type {Decimal} */
        this.maxXP = new Decimal(1)
        this.row = getQuerySelector(this.name)
    }

    toJSON() {
        return {
            baseData: this.baseData,
            name: this.name,
            level: this.level,
            maxLevel: this.maxLevel,
            xp: (this.xp instanceof Decimal ? this.xp.toString() : this.xp),
            isHero: this.isHero,
            unlocked: this.unlocked
        }
    }

    getMaxXpForLevel2(level) {
        const heroMultiplier = this.isHero ? this.pow10heroxp : 1;
        const base = this.isHero ? HERO_POW_BASE : BASE_POW_BASE;
        const growthMultiplier = getGrowthMultiplier(base, level, this.isHero);
        const maxXpBase = this.maxXpBase
        const levelMult = level + 1
        const maxXpNormal = heroMultiplier * maxXpBase * levelMult * growthMultiplier;

        if (maxXpNormal > 1e305 || maxXpNormal === Infinity || isNaN(maxXpNormal)) {
            const levelPower = floor(level / 120);
            const totalTwoPower = levelPower + this.heroShift;

            return new Decimal("1e305").times(Decimal.pow(2, totalTwoPower));
        }

        return new Decimal(maxXpNormal);
    }

    getMaxLevelMultiplier() {
        if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
            return (10 / (this.maxLevel + 1))
        }
        else {
            let effect = gameData.taskData['Cosmic Recollection'].getEffect()
            effect = effect == 0 ? 1 : effect
            return (this.heroxp < 1000) ? 1 + this.maxLevel / 10 : 1 + this.maxLevel / effect
        }
    }

    updateXpGain() {
        let xpGain = new Decimal(this.isHero ? getHeroXpGainMultipliers(this) : 10);

        xpGain = xpGain.times(this.getMaxLevelMultiplier());

        const funcs = this.xpFuncs;
        const fLen = funcs.length;
        for (let i = 0; i < fLen; i++) {
            xpGain = xpGain.times(funcs[i]());
        }

        const tasks = this.xpTasks;
        const tLen = tasks.length;
        for (let i = 0; i < tLen; i++) {
            xpGain = xpGain.times(tasks[i].getEffect());
        }

        const items = this.xpItems;
        const iLen = items.length;
        for (let i = 0; i < iLen; i++) {
            xpGain = xpGain.times(items[i].getEffect());
        }

        this.xpGain = xpGain;
    }


    getTaskXpProgressFraction() {
        const maxXp = this.maxXP;
        if (this.xp.gte(maxXp)) return 1;
        return this.xp.div(maxXp).toNumber();
    }

    getXpGainFormatted() {
        return this.xpGain.toExponential(2);
    }

    getCurrentXpFormatted() {
        return this.xp.toExponential(2);
    }

    getMaxXpFormatted() {
        return this.maxXP.toExponential(2);
    }

    getGameDaysLeft() {
        if (!gameData.requirements[this.name].completed) return Infinity;

        const xpLeft = this.maxXP.minus(this.xp);
        const xpGain = this.xpGain;

        if (xpGain.eq(0)) return Infinity;
        return xpLeft.div(xpGain).toNumber();
    }

    /**
     * 
     * @param {number} level 
     * @returns {number}
     */
    getGameDaysTotalForLevel(level) {
        if (!gameData.requirements[this.name].completed) return Infinity;

        const maxXP = this.getMaxXpForLevel2(level);
        const xpGain = this.xpGain

        if (xpGain.eq(0)) return Infinity;

        return maxXP.div(xpGain).toNumber();
    }


    getGameDaysTotalForCurrentLevel() {
        if (!gameData.requirements[this.name].completed) {
            return Infinity;

        }

        const maxXP = this.maxXP;
        const xpGain = this.xpGain;

        if (xpGain.eq(0)) return Infinity;

        return maxXP.div(xpGain).toNumber();
    }

    /**
     * 
     * @param {number} level 
     * @returns {number}
     */
    getGameDaysTotalTillLevel(level) {
        if (level < this.level)
            return 0
        else if (level == this.level)
            return this.getGameDaysLeft()
        else {
            let result = 0
            for (var i = this.level + 1; i < level; i++) {
                result += this.getGameDaysTotalForLevel(i)
            }
            return result
        }
    }

    getGameDaysLeftFormatted() {
        return formatGameDays(this.getGameDaysLeft())
    }

    getRealTimeLeftFormatted() {
        const gameDaysLeft = this.getGameDaysLeft()
        const gameSpeed = getGameSpeed()

        if (gameSpeed <= 0) {
            return "[Paused]"
        }

        if (gameDaysLeft === Infinity || isNaN(gameDaysLeft)) {
            return "Infinity"
        }

        const realSecondsLeft = gameDaysLeft / gameSpeed
        return formatTime(realSecondsLeft)
    }

    /**
    * 
    * @param {number} targetLevel 
    * @returns {number}
    */
    getTargetLevelGameDaysLeft(targetLevel) {
        if (this.level >= targetLevel) return 0;
        const levelsLeft = targetLevel - this.level;
        const currentLevelDays = this.getGameDaysLeft();
        if (currentLevelDays === Infinity) return Infinity;
        return currentLevelDays * levelsLeft;
    }

    /**
     * 
     * @param {number} targetLevel 
     * @returns {string}
     */
    getTargetLevelRealTimeLeftFormatted(targetLevel) {
        if (this.level >= targetLevel) return "00:00:00";

        const gameDaysLeft = this.getTargetLevelGameDaysLeft(targetLevel);
        const gameSpeed = getGameSpeed();

        if (gameSpeed <= 0 || gameDaysLeft === Infinity || isNaN(gameDaysLeft)) {
            return "Infinity";
        }

        const realSecondsLeft = gameDaysLeft / gameSpeed;
        return formatTime(realSecondsLeft);
    }



    updateMaxXP(level, isHero, maxXpBase, pow10heroxp, heroShift) {
        const heroMultiplier = isHero ? pow10heroxp : 1;
        const base = isHero ? HERO_POW_BASE : BASE_POW_BASE;
        const growthMultiplier = getGrowthMultiplier(base, level, isHero);

        const levelMult = level + 1;
        const maxXpNormal = heroMultiplier * maxXpBase * levelMult * growthMultiplier;

        let calculatedResult;

        if (maxXpNormal > 1e305 || maxXpNormal === Infinity || isNaN(maxXpNormal)) {
            const levelPower = floor(level / 120);
            const totalTwoPower = levelPower + heroShift;

            calculatedResult = DECIMAL_1E305.times(Decimal.pow(2, totalTwoPower));
        } else {
            calculatedResult = TEMP_DECIMAL.add(maxXpNormal);
        }

        this.maxXP = calculatedResult;
    }

    increaseXp() {
        const gameSpeed = getGameSpeed();
        if (gameSpeed <= 0 || isNaN(gameSpeed)) return;

        const isHero = this.isHero
        const maxXpBase = this.maxXpBase
        const pow10heroxp = this.pow10heroxp
        const heroShift = this.heroShift
        const speedMultiplier = gameSpeed / updateSpeed;

        this.updateXpGain()
        const gain = this.xpGain.times(speedMultiplier);
        this.xp = this.xp.plus(gain);

        this.updateMaxXP(this.level, isHero, maxXpBase, pow10heroxp, heroShift)
        let currentMax = this.maxXP;

        if (this.xp.gte(currentMax)) {
            this.unlocked = true;

            if (currentMax.lt("1e305")) {
                let iterations = 0;

                while (this.xp.gte(currentMax)) {
                    iterations++;

                    if (currentMax.gte("1e305"))
                        break;

                    let target = (this.xp.gt(DECIMAL_1E305)) ? DECIMAL_1E305 : this.xp

                    if (currentMax.lt(target)) {
                        const logRatio = target.div(currentMax).log10() * LOG_10;
                        const lnbase = isHero ? LN_HERO_POW_BASE : LN_BASE_POW_BASE;
                        const denominator = lnbase + (1.0 / (this.level + 1));
                        const deltaLevel = Math.floor((CONVERGENCE_FACTOR * logRatio) / denominator);
                        if (deltaLevel > 1) {

                            // if (this.name === "Beggar") console.log(deltaLevel)

                            this.level += deltaLevel;
                            this.updateMaxXP(this.level, isHero, maxXpBase, pow10heroxp, heroShift);
                            currentMax = this.maxXP;
                            continue;
                        }
                    }

                    this.level += 1;
                    this.xp = this.xp.minus(currentMax);
                    this.updateMaxXP(this.level, isHero, maxXpBase, pow10heroxp, heroShift)
                    currentMax = this.maxXP;

                    if (iterations > 50)
                        break;
                }
            }
            else {
                for (let index = 0; index < 3; index++) {
                    const levelsToGainD = this.xp.div(currentMax).floor();
                    let levels = levelsToGainD.toNumber();
                    if (levels > 0) {
                        const nextBoundary = 120 - (this.level % 120);
                        if (levels > nextBoundary) {
                            levels = nextBoundary;
                        }

                        this.level += levels;
                        this.xp = this.xp.minus(currentMax.times(levels));
                        this.updateMaxXP(this.level, isHero, maxXpBase, pow10heroxp, heroShift)
                        currentMax = this.maxXP;
                    }
                    else
                        break;
                }
            }
        }
    }

    /**
     * 
     * @param {string} selector 
     * @param {HTMLElement} row 
     * @returns {HTMLElement | null}
     */
    querySelector(selector, row) {
        const cachedElement = this.elementsCache.get(selector);
        if (cachedElement)
            return cachedElement;
        const element = /** @type {HTMLElement | null} */ (row.querySelector(selector));
        this.elementsCache.set(selector, element);
        return element;
    }
}