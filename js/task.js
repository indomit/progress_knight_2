const BASE_POW_BASE = 1.01;
const HERO_POW_BASE = 1.08;
let global_maximum = 0

class Task {
    constructor(baseData) {
        this.baseData = baseData;
        this.name = baseData.name;
        this.level = 0;
        this.maxLevel = 0;
        this.xp = new Decimal(0);
        this.isHero = false;
        this.unlocked = false;
        this.xpMultipliers = [];
        this.elementsCache = new Map();

        this.pow10heroxp = Math.pow(10, this.baseData.heroxp);
        this.heroShift = this.baseData.heroxp ? Math.floor(this.baseData.heroxp / 9) : 0;
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

    /*getMaxXp(level = this.level) {
        // До 1e305 считаем по старой формуле (переводим в Decimal в конце)
        const heroMultiplier = this.isHero ? this.pow10heroxp : 1;
        const growthMultiplier = Math.pow(this.isHero ? HERO_POW_BASE : BASE_POW_BASE, level);
        const maxXpNormal = heroMultiplier * this.baseData.maxXp * (level + 1) * growthMultiplier;

        // Если число вылетает за пределы JS Number (1e308), переключаемся на аналог вашей формулы сдвига
        if (maxXpNormal > 1e305 || maxXpNormal === Infinity || isNaN(maxXpNormal)) {
            // Имитируем ваш битовый сдвиг: MAX_SAFE_XP * (2 ^ (level/120 + shift))
            const power = Math.floor(level / 120) + this.heroShift.toNumber();
            return new Decimal("1e305").times(Decimal.pow(2, power));
        }

        return new Decimal(maxXpNormal);
    }*/

    /*
        getMaxXp() {
    const maxXp = (this.isHero ? Math.pow(10, this.baseData.heroxp) : 1) * this.baseData.maxXp * (this.level + 1) * Math.pow(this.isHero ? 1.08 : 1.01, this.level)

    if (isNaN(maxXp) || maxXp == Infinity || maxXp > 1e305) {
        this.isFinished = true
    }

    return maxXp
}

getMaxBigIntXp() {
    const maxXp = this.getMaxXp() == Infinity ? BigInt(1e305) : BigInt(Math.floor(this.getMaxXp()));

    if (maxXp < 1e305)
        return maxXp

    return maxXp * 2n ** (BigInt(this.level) / 120n) * (2n ** (BigInt(this.baseData.heroxp) / 9n))
}*/

    getMaxXp(level = this.level) {
        // 1. Считаем опыт строго по вашей оригинальной формуле в обычных числах (Number)
        const heroMultiplier = this.isHero ? this.pow10heroxp : 1;
        const growthMultiplier = Math.pow(this.isHero ? HERO_POW_BASE : BASE_POW_BASE, level);
        const maxXpNormal = heroMultiplier * this.baseData.maxXp * (level + 1) * growthMultiplier;

        // 2. Проверяем условие перехода, ОДИН В ОДИН как в вашем проде
        if (maxXpNormal > 1e305 || maxXpNormal === Infinity || isNaN(maxXpNormal)) {
            // Мы перешагнули порог! Включаем лейтгейм-формулу.
            // Заменяем битовый сдвиг (<<) на эквивалентное умножение Decimal.pow(2, ...)
            const levelPower = Math.floor(level / 120);
            const totalTwoPower = levelPower + this.heroShift; // heroShift посчитан в конструкторе

            // Переводим базовые 1e305 в Decimal и умножаем на двойки в нужной степени
            return new Decimal("1e305").times(Decimal.pow(2, totalTwoPower));
        }

        // 3. Если число маленькое и безопасное, просто переводим обычный Number в Decimal
        return new Decimal(maxXpNormal);
    }


    getXpLeft() {
        return this.getMaxXp().minus(this.xp);
    }

    getMaxLevelMultiplier() {
        if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
            return (10 / (this.maxLevel + 1))
        }
        else {
            let effect = gameData.taskData['Cosmic Recollection'].getEffect()
            effect = effect == 0 ? 1 : effect
            return (this.baseData.heroxp < 1000) ? 1 + this.maxLevel / 10 : 1 + this.maxLevel / effect
        }
    }

    getXpGain() {
        // 1. Базовое значение из вашей старой логики
        let xpGain = new Decimal(this.isHero ? getHeroXpGainMultipliers(this) : 10);

        // 2. То самое условие баланса: если опыт еще НЕ ушел в лейтгейм (меньше 1e305)
        // Метод .lt() работает молниеносно
        // if (this.xp.lt("1e305")) {
        //    xpGain = xpGain.times(10);
        // }

        // 3. Чистое перемножение всех остальных мультипликаторов
        this.xpMultipliers.forEach(multiplier => {
            const mult = multiplier()
            if (mult == Infinity) {
                console.log(this.toJSON())
            }
            xpGain = xpGain.times(mult);
        });

        return xpGain;
    }

    getTaskXpProgressFraction() {
        const maxXp = this.getMaxXp();
        if (this.xp.gte(maxXp)) return 1;
        return this.xp.div(maxXp).toNumber(); // Переводим отношение в обычный float [0, 1]
    }

    getXpGainFormatted() {
        return this.getXpGain().toExponential(2); // Автоматически отформатирует (например: 1.23e350)
    }

    getCurrentXpFormatted() {
        return this.xp.toExponential(2);
    }

    getMaxXpFormatted() {
        return this.getMaxXp().toExponential(2);
    }

    getGameDaysLeft() {
        if (!gameData.requirements[this.name].isCompleted()) return Infinity;

        const xpLeft = this.getXpLeft();
        const xpGain = this.getXpGain();

        if (xpGain.eq(0)) return Infinity;
        return xpLeft.div(xpGain).toNumber();
    }

    getGameDaysTotalForLevel(level) {
        if (!gameData.requirements[this.name].isCompleted()) return Infinity;

        const maxXP = this.getMaxXp(level);
        const xpGain = this.getXpGain();

        if (xpGain.eq(0)) return Infinity;

        return maxXP.div(xpGain).toNumber();
    }


    getGameDaysTotalForCurrentLevel() {
        return this.getGameDaysTotalForLevel(this.level)
    }

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

    // Возвращает отформатированную строку оставшихся игровых дней
    getGameDaysLeftFormatted() {
        return formatGameDays(this.getGameDaysLeft())
    }

    // Возвращает отформатированную строку реального времени до левелапа (hh:mm:ss)
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

    // Возвращает ETA до целевого уровня в игровых днях
    getTargetLevelGameDaysLeft(targetLevel) {
        if (this.level >= targetLevel) return 0;

        // Сколько уровней осталось набрать
        const levelsLeft = targetLevel - this.level;

        // Время текущего уровня в днях
        const currentLevelDays = this.getGameDaysLeft();

        if (currentLevelDays === Infinity) return Infinity;

        return currentLevelDays * levelsLeft;
    }

    // Возвращает отформатированную строку реального времени (hh:mm:ss) до целевого уровня
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

    increaseXp() {
        const gameSpeed = getGameSpeed();
        if (gameSpeed <= 0 || isNaN(gameSpeed)) return;

        const speedMultiplier = gameSpeed / updateSpeed;
        const gain = this.getXpGain().times(speedMultiplier);

        this.xp = this.xp.plus(gain);

        let currentMax = this.getMaxXp();

        if (this.xp.gte(currentMax)) {
            this.unlocked = true;

            // ЕСЛИ МЫ В РАННЕЙ ИГРЕ (до 1e305): стоимости маленькие, уровней мало
            if (currentMax.lt("1e305")) {
                let iterations = 0;
                while (this.xp.gte(currentMax)) {
                    iterations++;
                    this.level += 1;
                    this.xp = this.xp.minus(currentMax);
                    currentMax = this.getMaxXp();
                    if (iterations > 2500) break; // Жесткий кап для ранней игры
                }
            }
            // ЕСЛИ МЫ В ЛЕЙТГЕЙМЕ (после 1e305): стоимость стабильна на отрезке в 120 уровней
            else {
                // Считаем прыжок уровней за одну операцию деления без циклов!
                const levelsToGainD = this.xp.div(currentMax).floor();
                let levels = levelsToGainD.toNumber();

                if (levels > 0) {
                    // Защита: не перепрыгиваем через границу изменения формулы (120 уровней)
                    // Чтобы формула стоимости обновилась вовремя
                    const nextBoundary = 120 - (this.level % 120);
                    if (levels > nextBoundary) {
                        levels = nextBoundary;
                    }

                    this.level += levels;
                    // Вычитаем весь потраченный опыт ОДНОЙ операцией вместо цикла while!
                    this.xp = this.xp.minus(currentMax.times(levels));
                }
            }
        }
    }

    querySelector(selector, row) {
        const cachedElement = this.elementsCache.get(selector);
        if (cachedElement)
            return cachedElement;
        const element = row.querySelector(selector);
        this.elementsCache.set(selector, element);
        return element;
    }
}