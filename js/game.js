function addMultipliers() {
    const taskData = gameData.taskData;
    const itemData = gameData.itemData;

    for (const taskName in taskData) {
        const task = taskData[taskName];

        // Flatten data structures
        task.xpFuncs = [];
        task.xpTasks = [];
        task.xpItems = [];

        if (task instanceof Job) {
            task.incomeFuncs = [];
            task.incomeTasks = [];
            task.incomeItems = [];
        }

        // Core array caches for speed
        const xpFuncs = task.xpFuncs;
        const xpTasks = task.xpTasks;
        const xpItems = task.xpItems;

        // Baseline global functions
        xpFuncs.push(getHappiness, getDarkMatterXpGain, getDarkMatterSkillXP, getTimeIsAFlatCircleXP);

        // Baseline task pointers (Replaces getBindedTaskEffect closures)
        const baseTasks = ["Dark Influence", "Demon Training", "Void Influence", "Parallel Universe", "Immortal Ruler", "Blinded By Darkness"];
        for (let i = 0; i < baseTasks.length; i++) {
            const t = taskData[baseTasks[i]];
            if (t) xpTasks.push(t);
        }

        // Job vs Skill specific push paths
        if (task instanceof Job) {
            const incFuncs = task.incomeFuncs;
            const incTasks = task.incomeTasks;
            const incItems = task.incomeItems;

            if (taskData["Demon's Wealth"]) incTasks.push(taskData["Demon's Wealth"]);
            incFuncs.push(getLifeCoachIncomeGain);

            if (taskData["Productivity"]) xpTasks.push(taskData["Productivity"]);
            if (taskData["Dark Knowledge"]) xpTasks.push(taskData["Dark Knowledge"]);
            if (itemData["Personal Squire"]) xpItems.push(itemData["Personal Squire"]);
        } else if (task instanceof Skill) {
            if (taskData["Concentration"]) xpTasks.push(taskData["Concentration"]);

            const skillItems = ["Book", "Study Desk", "Library", "Void Blade", "Universe Fragment", "Custom Galaxy"];
            for (let i = 0; i < skillItems.length; i++) {
                const it = itemData[skillItems[i]];
                if (it) xpItems.push(it);
            }

            if (taskData["Void Symbiosis"]) xpTasks.push(taskData["Void Symbiosis"]);
            if (taskData["Evil Incarnate"]) xpTasks.push(taskData["Evil Incarnate"]);
            if (taskData["Dark Prince"]) xpTasks.push(taskData["Dark Prince"]);
        }

        // Category/Name checking blocks
        if (jobCategories["Military"]?.includes(task.name)) {
            if (taskData["Strength"]) task.incomeTasks.push(taskData["Strength"]);
            if (taskData["Battle Tactics"]) xpTasks.push(taskData["Battle Tactics"]);
            if (itemData["Steel Longsword"]) xpItems.push(itemData["Steel Longsword"]);
        } else if (task.name === "Strength") {
            if (taskData["Muscle Memory"]) xpTasks.push(taskData["Muscle Memory"]);
            if (itemData["Dumbbells"]) xpItems.push(itemData["Dumbbells"]);
        } else if (skillCategories["Magic"]?.includes(task.name)) {
            if (itemData["Sapphire Charm"]) xpItems.push(itemData["Sapphire Charm"]);
            if (itemData["Observatory"]) xpItems.push(itemData["Observatory"]);
            if (taskData["Universal Ruler"]) xpTasks.push(taskData["Universal Ruler"]);
            xpFuncs.push(getTaaAndMagicXpGain);
        } else if (skillCategories["Void Manipulation"]?.includes(task.name)) {
            if (itemData["Void Necklace"]) xpItems.push(itemData["Void Necklace"]);
            if (itemData["Void Orb"]) xpItems.push(itemData["Void Orb"]);
        } else if (jobCategories["The Arcane Association"]?.includes(task.name)) {
            if (taskData["Mana Control"]) xpTasks.push(taskData["Mana Control"]);
            xpFuncs.push(getTaaAndMagicXpGain);
            if (taskData["All Seeing Eye"]) task.incomeTasks.push(taskData["All Seeing Eye"]);
        } else if (jobCategories["The Void"]?.includes(task.name)) {
            if (taskData["Void Amplification"]) xpTasks.push(taskData["Void Amplification"]);
            if (itemData["Void Armor"]) xpItems.push(itemData["Void Armor"]);
            if (itemData["Void Dust"]) xpItems.push(itemData["Void Dust"]);
        } else if (jobCategories["Galactic Council"]?.includes(task.name)) {
            if (itemData["Celestial Robe"]) xpItems.push(itemData["Celestial Robe"]);
            if (taskData["Epiphany"]) xpTasks.push(taskData["Epiphany"]);
        } else if (skillCategories["Dark Magic"]?.includes(task.name)) {
            xpFuncs.push(getEvilXpGain);
        } else if (skillCategories["Almightiness"]?.includes(task.name)) {
            xpFuncs.push(getEssenceXpGain);
        } else if (skillCategories["Fundamentals"]?.includes(task.name)) {
            if (itemData["Mind's Eye"]) xpItems.push(itemData["Mind's Eye"]);
        } else if (skillCategories["Darkness"]?.includes(task.name)) {
            xpFuncs.push(getDarknessXpGain);
        }
    }

    // Optimize Item Expenses
    for (const itemName in itemData) {
        const item = itemData[itemName];
        item.expenseTasks = [];

        const expenseNames = ["Bargaining", "Intimidation", "Brainwashing", "Abyss Manipulation", "Galactic Command"];
        for (let i = 0; i < expenseNames.length; i++) {
            const t = taskData[expenseNames[i]];
            if (t) item.expenseTasks.push(t);
        }
    }
}


function getHeroXpGainMultipliers(job) {
    var baseMult = 1

    if (job instanceof Job)
        baseMult = 50000

    if (gameData.requirements["Rise of Great Heroes"].completed)
        baseMult *= milestoneBaseData["Rise of Great Heroes"].effect

    if (gameData.requirements["Lazy Heroes"].completed)
        baseMult *= milestoneBaseData["Lazy Heroes"].effect

    if (gameData.requirements["Angry Heroes"].completed)
        baseMult *= milestoneBaseData["Angry Heroes"].effect

    if (gameData.requirements["Funny Heroes"].completed)
        baseMult *= milestoneBaseData["Funny Heroes"].effect

    if (gameData.requirements["Beautiful Heroes"].completed)
        baseMult *= milestoneBaseData["Beautiful Heroes"].effect // -27

    if (gameData.requirements["Superb Heroes"].completed) {
        if (job instanceof Job)
            baseMult *= 1000000

        baseMult *= milestoneBaseData["Superb Heroes"].effect
    }

    return baseMult
}

function getFaintHopeTime() {
    return gameData.perks_points > 0 ? gameData.rebirthFiveTime : gameData.rebirthThreeTime
}

const LOG_10 = log(10);
const LOG_3_RECIPROCAL = 1 / log(3);
const LOG_7_RECIPROCAL = 1 / log(7);
const LOG_1_005_RECIPROCAL = 1 / log(1.005);
const LOG_10_RECIPROCAL = 1 / LOG_10;
const LOG_1_01_RECIPROCAL = 1 / log(1.01);
const LOG_33_RECIPROCAL = 1 / log(33);
const LOG_50_RECIPROCAL = 1 / log(50);


function calculateMultiplier(level, isHero) {
    const logMultiplier = isHero ? LOG_3_RECIPROCAL : LOG_7_RECIPROCAL;
    const logValue = log(level + 1) * logMultiplier;

    // 1 - logValue / 10
    const multiplier = 1 - (logValue * 0.1);

    return max(0.1, multiplier);
    return multiplier < 0.1 ? 0.1 : multiplier;
}

function sharedGetEffect() {
    // 'this' directly references the task object calling it, bypassing closure lookup
    return calculateMultiplier(this.level, this.isHero);
}


function setCustomEffects() {

    const taskNames = [
        "Bargaining",
        "Intimidation",
        "Brainwashing",
        "Abyss Manipulation",
        "Galactic Command"
    ];

    for (const name of taskNames) {
        const task = gameData.taskData[name];
        task.getEffect = sharedGetEffect;
    }

    const timeWarping = gameData.taskData["Time Warping"];
    if (timeWarping) {
        const mult = timeWarping.isHero ? LOG_1_005_RECIPROCAL : LOG_10_RECIPROCAL;
        timeWarping.getEffect = () => 1 + log(timeWarping.level + 1) * mult;
    }

    const immortality = gameData.taskData["Life Essence"];
    if (immortality) {
        const mult = immortality.isHero ? LOG_1_01_RECIPROCAL : LOG_33_RECIPROCAL;
        immortality.getEffect = () => 1 + log(immortality.level + 1) * mult;
    }

    const unholyRecall = gameData.taskData["Cosmic Recollection"]
    unholyRecall.getEffect = () => unholyRecall.level * (unholyRecall.isHero ? 0.065 : 0.00065)


    const transcendentMaster = milestoneData["Transcendent Master"]
    transcendentMaster.getEffect = () => gameData.requirements["Transcendent Master"].completed ? 1.5 : 1

    const faintHope = milestoneData["Faint Hope"]
    faintHope.getEffect = function () {
        var mult = 1
        if (gameData.requirements["A New Hope"].completed) {
            mult = softcap(1e308, 10000000, 0.01)
        }
        else if (gameData.requirements["Speed speed speed"].completed) {
            let effectiveTime = getFaintHopeTime()

            if (effectiveTime > 18000) effectiveTime = 18000;
            let baseExp = 7.5275 * exp(0.01 * effectiveTime)

            mult = baseExp * log2(gameData.game_speed)

            if (mult == Infinity)
                mult = 1e308

            mult = softcap(mult, 5000000, 0.01)
        }
        else if (gameData.requirements["Faint Hope"].completed) {

            let delay = (gameData.dark_matter < 30) ? 30 - gameData.dark_matter : 0

            if (gameData.boost_active)
                delay = 0

            let effectiveTime = getFaintHopeTime() - delay
            if (effectiveTime < 0) return 1

            if (effectiveTime > 18000) effectiveTime = 18000;

            let expBase = 0.0032
            if (gameData.dark_matter > 50)
                expBase = 0.0042
            let expBonus = exp(expBase * effectiveTime) - 1;

            mult = 1 + expBonus * log2(gameData.game_speed)
            mult = softcap(mult, 200, 0.02);

        }

        return mult
    }

    const riseOfGreatHeroes = milestoneData["Rise of Great Heroes"]
    riseOfGreatHeroes.getEffect = function () {
        var mult = 1
        if (gameData.requirements["Rise of Great Heroes"].completed) {
            var countHeroes = 0
            for (const taskName in gameData.taskData) {
                if (gameData.taskData[taskName].isHero)
                    countHeroes++
            }
            mult += countHeroes * 6 / 74
        }

        return mult
    }
}

function getDarknessXpGain() {
    const strangeMagic = gameData.requirements["Strange Magic"].completed ? 1e50 : 1
    return strangeMagic
}

function getHappiness() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1

    const meditationEffect = getBindedTaskEffect("Meditation")
    const butlerEffect = getBindedItemEffect("Butler")
    const mindreleaseEffect = getBindedTaskEffect("Mind Release")
    const multiverseFragment = getBindedItemEffect("Multiverse Fragment")
    const godsBlessings = gameData.requirements["God's Blessings"].completed ? 10000000 : 1
    const stairWayToHeaven = getBindedItemEffect("Stairway to heaven")
    const happiness = godsBlessings * meditationEffect() * butlerEffect() * mindreleaseEffect()
        * multiverseFragment() * gameData.currentProperty.getEffect() * getChallengeBonus("an_unhappy_life") * stairWayToHeaven()

    if (gameData.active_challenge == "dance_with_the_devil") return pow(happiness, 0.075)
    if (gameData.active_challenge == "an_unhappy_life") return pow(happiness, 0.5)

    const event_id = getCurrentEventId()
    const eventHappiness = (event_id == 3) ? eventsData[event_id].mult : 1

    return happiness * eventHappiness
}

function getEvil() {
    return gameData.evil
}

function getEvilXpGain() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1

    if (gameData.active_challenge == "dance_with_the_devil") {
        const evilEffect = (pow(getEvil(), 0.35) / 1e3) - 1
        return evilEffect < 0 ? 0 : evilEffect
    }

    return getEvil()
}

function getEssence() {
    if (gameData.essence == Infinity || gameData.essence > 1e308) {
        return 1e308
    }
    return gameData.essence
}

function getEssenceXpGain() {
    if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
        const essenceEffect = (pow(getEssence(), 0.35) / 1e2) - 1
        return essenceEffect <= 0.01 ? 0 : essenceEffect
    }

    return getEssence()
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = 1
    multipliers.forEach((multiplierFunction) => {
        finalMultiplier *= multiplierFunction()
    })
    return value * finalMultiplier
}

function applyUnpausedSpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    return value * gameData.game_speed / updateSpeed
}

function applySpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    return value * getGameSpeed() / updateSpeed
}

function getEvilGain() {
    const evilControl = gameData.taskData["Evil Control"]
    const bloodMeditation = gameData.taskData["Blood Meditation"]
    const absoluteWish = gameData.taskData["Absolute Wish"]
    const oblivionEmbodiment = gameData.taskData["Void Embodiment"]
    const yingYang = gameData.taskData["Yin Yang"]
    const inferno = gameData.requirements["Inferno"].completed ? 5 : 1
    const theDevilInsideYou = gameData.requirements["The Devil inside you"].completed ? 1e15 : 1
    const stairWayToHell = getBindedItemEffect("Highway to hell")
    const evilBooster = (gameData.perks.evil_booster == 1) ? 1e50 : 1

    const event_id = getCurrentEventId()
    const eventEvil = (event_id == 4) ? eventsData[event_id].mult : 1

    return evilControl.getEffect() * bloodMeditation.getEffect() * absoluteWish.getEffect()
        * oblivionEmbodiment.getEffect() * yingYang.getEffect() * inferno * getChallengeBonus("legends_never_die")
        * getDarkMatterSkillEvil() * theDevilInsideYou * stairWayToHell() * evilBooster * eventEvil
}

function getEvilGainAvailable() {
    if (!allowRebirth(2))
        return 0
    return getEvilGain()
}

function getEssenceGain() {
    const essenceControl = gameData.taskData["Yin Yang"]
    const essenceCollector = gameData.taskData["Essence Collector"]
    const transcendentMaster = milestoneData["Transcendent Master"]
    const faintHope = milestoneData["Faint Hope"]
    const rise = milestoneData["Rise of Great Heroes"]
    const darkMagician = gameData.taskData["Dark Magician"]

    const lifeIsValueable = gameData.requirements["Life is valueable"].completed ? gameData.dark_matter : 1

    const infernoFlatBonus = gameData.requirements["Inferno"].completed ? 5000 : 0

    const event_id = getCurrentEventId()
    const eventEssence = (event_id == 2) ? eventsData[event_id].mult : 1

    return essenceControl.getEffect() * essenceCollector.getEffect() * transcendentMaster.getEffect()
        * faintHope.getEffect() * rise.getEffect() * getChallengeBonus("dance_with_the_devil")
        * getAGiftFromGodEssenceGain() * darkMagician.getEffect() * getDarkMatterSkillEssence()
        * lifeIsValueable * essenceMultGain() * eventEssence + infernoFlatBonus
}

function getEssenceGainAvailable() {
    if (!allowRebirth(3))
        return 0
    return getEssenceGain()
}

function getDarkMatterGain() {
    const darkRuler = gameData.taskData["Dark Ruler"]
    const darkMatterHarvester = gameData.requirements["Dark Matter Harvester"].completed ? 10 : 1
    const darkMatterMining = gameData.requirements["Dark Matter Mining"].completed ? 3 : 1
    const darkMatterMillionaire = gameData.requirements["Dark Matter Millionaire"].completed ? 500 : 1
    const Desintegration = gameData.itemData['Desintegration'].getEffect()
    const TheEndIsNear = getUnspentPerksDarkmatterGainBuff()

    const metaverseBuff = gameData.rebirthFiveCount > 0 ? pow(1.7, gameData.rebirthFiveCount) : 1

    const event_id = getCurrentEventId()
    const eventDarkMatter = (event_id == 6) ? eventsData[event_id].mult : 1

    return 1 + 1 * darkRuler.getEffect() * darkMatterHarvester * darkMatterMining * darkMatterMillionaire * getChallengeBonus("the_darkest_time") * getDarkMatterSkillDarkMater() * darkMatterMultGain() *
        (Desintegration == 0 ? 1 : Desintegration) * TheEndIsNear * eventDarkMatter * metaverseBuff
}

function getDarkMatterGainAvailable() {
    if (!allowRebirth(4))
        return 0
    return getDarkMatterGain()
}

function getDarkMatterXpGain() {
    if (gameData.dark_matter < 1)
        return 1

    return gameData.dark_matter + 1
}

function getDarkOrbs() {
    return gameData.dark_orbs
}

function getGameSpeed() {
    if (!canSimulate())
        return 0

    return gameData.game_speed
}

function getUnpausedGameSpeed() {

    let eppEffect = 1;

    if (gameData.evil_perks_points > 0 && gameData.active_challenge === "") {
        const rawLog = log(gameData.evil_perks_points + 50) * LOG_50_RECIPROCAL;

        // Faster clamp than min(max(1, rawLog), 3)
        eppEffect = rawLog < 1 ? 1 : (rawLog > 3 ? 3 : rawLog);
    }

    const boostWarping = gameData.boost_active ? gameData.metaverse.boost_warp_modifier : 1
    const timeWarping = gameData.taskData["Time Warping"]
    const temporalDimension = gameData.taskData["Temporal Dimension"]
    const timeLoop = gameData.taskData["Time Loop"]
    const warpDrive = (gameData.requirements["Eternal Time"].completed) ? 2 : 1
    const speedSpeedSpeed = gameData.requirements["Speed speed speed"].completed ? 1000 : 1
    const timeIsAFlatCircle = gameData.requirements["Time is a flat circle"].completed ? 1000 : 1

    const event_id = getCurrentEventId()
    const eventWarping = (event_id == 1) ? eventsData[event_id].mult : 1

    const timeWarpingSpeed = eppEffect * boostWarping * timeWarping.getEffect() * temporalDimension.getEffect() * timeLoop.getEffect() * warpDrive * speedSpeedSpeed * timeIsAFlatCircle

    const gameSpeed = baseGameSpeed * timeWarpingSpeed * getChallengeBonus("time_does_not_fly") * getGottaBeFastGain() * getDarkMatterSkillTimeWarping() * eventWarping

    if (gameData.active_challenge == "time_does_not_fly" || gameData.active_challenge == "the_darkest_time")
        return pow(gameSpeed, 0.7)

    if (gameData.active_challenge == "legends_never_die")
        return pow(gameSpeed, 0.75)

    return gameSpeed
}

function applyExpenses() {
    if (gameData.coins == Infinity)
        return

    gameData.coins -= applySpeed(totalExpense)

    if (gameData.coins < 0) {
        gameData.coins = 0
        if (totalExpense > totalIncome)
            goBankrupt()
    }
}

function goBankrupt() {
    gameData.coins = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    autoBuyEnabled = true
}

function togglePause() {
    gameData.paused = !gameData.paused
}

function forceAutobuy() {
    autoBuyEnabled = true
}

function setCurrentProperty(propertyName) {
    if (gameData.paused)
        return
    autoBuyEnabled = false
    gameData.currentProperty = gameData.itemData[propertyName]
}

function setMisc(miscName) {
    if (gameData.paused)
        return
    autoBuyEnabled = false
    const misc = gameData.itemData[miscName]
    if (gameData.currentMisc.includes(misc)) {
        for (i = 0; i < gameData.currentMisc.length; i++) {
            if (gameData.currentMisc[i] == misc) {
                gameData.currentMisc.splice(i, 1)
            }
        }
    } else {
        gameData.currentMisc.push(misc)
    }
}

function createGameObjects(data, baseData) {
    for (const key in baseData)
        createGameObject(data, baseData[key])
}

function createGameObject(data, entity) {
    if ("income" in entity) { data[entity.name] = new Job(entity) }
    else if ("maxXp" in entity) { data[entity.name] = new Skill(entity) }
    else if ("tier" in entity) { data[entity.name] = new Milestone(entity) }
    else { data[entity.name] = new Item(entity) }
    data[entity.name].id = "row " + entity.name
}

function getTotalNet() {
    return totalIncome - totalExpense
}

function updateTotalIncome() {
    if (gameData.active_challenge == "the_darkest_time") {
        totalIncome = 0
        return
    }

    let totalBaseIncome = 0
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (task instanceof Job && gameData.requirements[key].completed) {
            totalBaseIncome += task.getIncome()
        }
    }

    const event_id = getCurrentEventId()
    const eventIncome = (event_id == 5) ? eventsData[event_id].mult : 1

    totalIncome = totalBaseIncome * getDarkMatterSkillIncome() * eventIncome
}

function updateTotalExpense() {
    var expense = 0
    expense += gameData.currentProperty.getExpense()
    for (misc of gameData.currentMisc) {
        expense += misc.getExpense()
    }
    totalExpense = expense
}

function increaseCoins() {
    gameData.coins += applySpeed(totalIncome)
}

function autoPerks() {
    // perks
    if (gameData.perks.auto_boost == 1 && !gameData.boost_active && gameData.boost_cooldown <= 0)
        applyBoost()

    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter >= getDarkOrbGeneratorCost() * 10 && gameData.dark_orbs !== Infinity)
        buyDarkOrbGenerator()

    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter >= 100 && !gameData.dark_matter_shop.a_miracle)
        buyAMiracle()

    if (gameData.perks.auto_dark_shop == 1 && gameData.dark_orbs >= 1000) {
        buyADealWithTheChairman()
        buyAGiftFromGod()
        buyGottaBeFast()
        buyLifeCoach()
    }

    if (gameData.perks.auto_sacrifice == 1 && gameData.hypercubes > 1000) {
        buyDarkMaterMult()
        buyChallengeAltar()
        buyEssenceMult()
        if (gameData.hypercubes > evilTranCost() * 100)
            buyEvilTran()
        if (gameData.hypercubes > boostDurationCost() * 100)
            buyBoostDuration()
        if (gameData.hypercubes > reduceBoostCooldownCost() * 100)
            buyReduceBoostCooldown()
        if (gameData.hypercubes > hypercubeGainCost() * 100)
            buyHypercubeGain()
    }
}

function autoBuy() {
    // TODO refactor this shit
    if (!autoBuyEnabled) return

    let usedExpense = 0

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].completed) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()

            if (item.isProperty) {
                if (expense < totalIncome && expense >= usedExpense) {
                    gameData.currentProperty = item
                    usedExpense = expense
                }
            }
        }
    }

    for (const key in gameData.currentMisc) {
        usedExpense += gameData.currentMisc[key].getExpense()
    }

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].completed) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()
            if (item.isMisc) {
                if (expense < totalIncome - usedExpense) {
                    if (gameData.currentMisc.indexOf(item) == -1) {
                        gameData.currentMisc.push(item)
                        usedExpense += expense
                    }
                }
            }
        }
    }

    totalExpense = usedExpense
}

function increaseDays() {
    gameData.days += applySpeed(1)
    gameData.totalDays += applySpeed(1)
}

function increaseRealtime() {
    if (!canSimulate())
        return

    const realDiff = 1.0 / updateSpeed

    gameData.realtime += realDiff
    gameData.realtimeRun += realDiff
    gameData.rebirthOneTime += realDiff
    gameData.rebirthTwoTime += realDiff
    gameData.rebirthThreeTime += realDiff
    gameData.rebirthFourTime += realDiff
    gameData.rebirthFiveTime += realDiff

    if (gameData.boost_active) {
        gameData.boost_timer -= realDiff
        if (gameData.boost_timer < 0) {
            gameData.boost_timer = 0
            gameData.boost_active = false
            gameData.boost_cooldown = getBoostCooldownSeconds()
        }
    }
    else {
        gameData.boost_cooldown -= realDiff

        if (gameData.boost_cooldown < 0)
            gameData.boost_cooldown = 0
    }
}

function resetEvilPerks() {
    if (gameData.requirements["God's Blessings"].completed)
        return
    gameData.evil_perks_points = 0
    gameData.evil_perks.receive_essence = 0

    if (!gameData.evil_perks_keep) {
        if (!gameData.requirements["Almighty Eye"].completed)
            gameData.evil_perks.reduce_eye_requirement = 0

        if (gameData.requirements["Eternal Time"].completed)
            gameData.evil_perks.reduce_evil_requirement = min(4, gameData.evil_perks.reduce_evil_requirement) // keep max 4 ranks
        else
            gameData.evil_perks.reduce_evil_requirement = 0

        gameData.evil_perks.reduce_the_void_requirement = 0
        gameData.evil_perks.reduce_celestial_requirement = 0
    }
}

function resetEvilPerksByHalf() {
    if (gameData.requirements["God's Blessings"].completed)
        return
    gameData.evil_perks_points = 0
    gameData.evil_perks.receive_essence = 0

    if (!gameData.evil_perks_keep) {
        if (!gameData.requirements["Almighty Eye"].completed)
            gameData.evil_perks.reduce_eye_requirement = floor(gameData.evil_perks.reduce_eye_requirement / 2)

        let reduce_evil_requirement = floor(gameData.evil_perks.reduce_evil_requirement / 2)

        if (gameData.requirements["Eternal Time"].completed)
            gameData.evil_perks.reduce_evil_requirement = min(gameData.evil_perks.reduce_evil_requirement, reduce_evil_requirement + 2)
        else
            gameData.evil_perks.reduce_evil_requirement = reduce_evil_requirement

        gameData.evil_perks.reduce_the_void_requirement = floor(gameData.evil_perks.reduce_the_void_requirement / 2)
        gameData.evil_perks.reduce_celestial_requirement = floor(gameData.evil_perks.reduce_celestial_requirement / 2)
    }
}

function rebirthReset(set_tab_to_jobs = true) {
    if (set_tab_to_jobs) {
        if (gameData.settings.selectedTab == Tab.METAVERSE && gameData.hypercubes > 0
            || gameData.settings.selectedTab == Tab.CHALLENGES && gameData.evil > 10000
            || gameData.settings.selectedTab == Tab.MILESTONES && gameData.essence > 0
            || gameData.settings.selectedTab == Tab.DARK_MATTER && (gameData.dark_matter > 0 || gameData.perks_points > 100)
            || gameData.settings.selectedTab == Tab.REBIRTH
            || gameData.settings.selectedTab == Tab.EVILPERKS
            || gameData.settings.selectedTab == Tab.INFO
        ) {
            // do not switch tab
        }
        else if (!(gameData.settings.selectedTab == Tab.JOBS))
            setTab(Tab.JOBS, false)
    }

    gameData.coins = 0
    gameData.days = 365 * 14
    gameData.realtime = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    gameData.stats.EssencePerSecond = 0
    gameData.stats.maxEssencePerSecond = 0
    gameData.stats.maxEssencePerSecondRt = 0
    gameData.stats.EvilPerSecond = 0
    gameData.stats.maxEvilPerSecond = 0
    gameData.stats.maxEvilPerSecondRt = 0
    autoBuyEnabled = true

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        if (task.level > task.maxLevel) task.maxLevel = task.level
        task.level = 0
        task.xp = new Decimal(0)
        task.isHero = false
        task.isFinished = false
    }

    for (const itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.isHero = false
    }

    // reset requirements 
    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        if (requirement.completed && permanentUnlocks.includes(key)) continue
        requirement.completed = false
    }

    // Keep milestones which were bought in the Dark Matter shop
    if (gameData.dark_matter_shop.a_miracle) {
        gameData.requirements["Magic Eye"].completed = true
        if (gameData.rebirthOneCount == 0)
            gameData.rebirthOneCount = 1
    }
}

const rebirthRequirements = [
    "",
    "Rebirth note 2",
    "Rebirth note 3",
    "Rebirth note 6",
    "Rebirth note 7",
    "Rebirth note 8"
];

function allowRebirth(n) {
    return gameData.requirements[rebirthRequirements[n]]?.completed ?? false
}

function rebirthOne() {
    if (!allowRebirth(1))
        return

    if (gameData.rebirthOneCount === 0)
        showMaxLevel()

    gameData.rebirthOneCount += 1
    if (gameData.stats.fastest1 == null || gameData.rebirthOneTime < gameData.stats.fastest1)
        gameData.stats.fastest1 = gameData.rebirthOneTime
    gameData.rebirthOneTime = 0

    rebirthReset()
}

function rebirthTwo() {
    if (!allowRebirth(2))
        return

    gameData.rebirthTwoCount += 1
    gameData.evil += getEvilGain()

    resetEvilPerksByHalf()

    if (gameData.stats.fastest2 == null || gameData.rebirthTwoTime < gameData.stats.fastest2)
        gameData.stats.fastest2 = gameData.rebirthTwoTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0

    rebirthReset()
    gameData.active_challenge = ""

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }
}

function rebirthThree() {
    if (!allowRebirth(3))
        return

    gameData.rebirthThreeCount += 1
    gameData.essence += getEssenceGain()
    if (gameData.essence == Infinity || gameData.essence > 1e308)
        gameData.essence = 1e308
    gameData.evil = evilTranGain()

    resetEvilPerks()

    if (gameData.stats.fastest3 == null || gameData.rebirthThreeTime < gameData.stats.fastest3)
        gameData.stats.fastest3 = gameData.rebirthThreeTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0
    gameData.rebirthThreeTime = 0

    const recallEffect = gameData.taskData["Cosmic Recollection"].getEffect()

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = floor(recallEffect * task.level)
    }

    rebirthReset()
    gameData.active_challenge = ""
}

function rebirthFour() {
    if (!allowRebirth(4))
        return

    gameData.rebirthFourCount += 1
    gameData.essence = 0
    gameData.evil = 0
    gameData.dark_matter += getDarkMatterGain()
    gameData.evil_perks_points = 0
    gameData.evil_perks.receive_essence = 0

    if (gameData.metaverse.challenge_altar == 0 && gameData.perks.save_challenges == 0) {
        resetChallenges();
    }

    if (gameData.stats.fastest4 == null || gameData.rebirthFourTime < gameData.stats.fastest4)
        gameData.stats.fastest4 = gameData.rebirthFourTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0
    gameData.rebirthThreeTime = 0
    gameData.rebirthFourTime = 0

    rebirthReset()

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }

    gameData.active_challenge = ""
}

async function rebirthFive() {
    if (!allowRebirth(5))
        return

    if ((gameData.perks.save_challenges == 0) && (getTotalPerkPoints() >= getPerkCost('save_challenges'))) {
        const isConfirmed = await customConfirm({
            title: "SANITY CHECK",
            text: "You haven't purchased the \"Save challenges\" metaverse perk, are you sure you want to enter the Metaverse?",
            confirmText: "Do it anyway",
            cancelText: "Oops, my bad!",
            confirmColor: "red",
            cancelColor: "blue"

        });

        if (!isConfirmed)
            return
    }

    gameData.rebirthFiveCount += 1
    gameData.perks_points += getMetaversePerkPointsGain()
    gameData.essence = 0
    gameData.evil = 0
    gameData.evil_perks_points = 0
    gameData.evil_perks.receive_essence = 0



    gameData.dark_matter = 0
    gameData.dark_orbs = 0
    gameData.dark_matter_shop.dark_orb_generator = 0
    gameData.dark_matter_shop.a_miracle = false
    gameData.dark_matter_shop.a_deal_with_the_chairman = 0
    gameData.dark_matter_shop.a_gift_from_god = 0
    gameData.dark_matter_shop.gotta_be_fast = 0
    gameData.dark_matter_shop.life_coach = 0

    if (gameData.perks.keep_dark_mater_skills == 0) {
        gameData.dark_matter_shop.speed_is_life = 0
        gameData.dark_matter_shop.your_greatest_debt = 0
        gameData.dark_matter_shop.essence_collector = 0
        gameData.dark_matter_shop.explosion_of_the_universe = 0
        gameData.dark_matter_shop.multiverse_explorer = 0
    }

    if (gameData.perks.save_challenges == 0) {
        resetChallenges();
    }

    gameData.requirements["Dark Matter"].completed = false
    gameData.requirements["Dark Matter Skills"].completed = false
    gameData.requirements["Dark Matter Skills2"].completed = false

    if (gameData.stats.fastest5 == null || gameData.rebirthFiveTime < gameData.stats.fastest5)
        gameData.stats.fastest5 = gameData.rebirthFiveTime
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0
    gameData.rebirthThreeTime = 0
    gameData.rebirthFourTime = 0
    gameData.rebirthFiveTime = 0

    gameData.boost_active = false
    gameData.boost_timer = 0
    gameData.boost_cooldown = 0

    gameData.hypercubes = 0
    gameData.metaverse.boost_cooldown_modifier = 1
    gameData.metaverse.boost_timer_modifier = 1
    gameData.metaverse.boost_warp_modifier = 100
    gameData.metaverse.hypercube_gain_modifier = 1
    gameData.metaverse.evil_tran_gain = 0
    gameData.metaverse.essence_gain_modifier = 0
    gameData.metaverse.challenge_altar = 0
    gameData.metaverse.dark_mater_gain_modifer = 0

    rebirthReset()

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = 0
    }

    gameData.active_challenge = ""
}

function getLifespan() {
    if (gameData.rebirthFiveCount > 0) return Infinity

    const immortality = gameData.taskData["Life Essence"]
    const superImmortality = gameData.taskData["Astral Body"]
    const higherDimensions = gameData.taskData["Higher Dimensions"]
    const abyss = gameData.taskData["Ceaseless Abyss"]
    const cosmicLongevity = gameData.taskData["Cosmic Longevity"]
    const speedSpeedSpeed = gameData.requirements["Speed speed speed"].completed ? 1000 : 1
    const lifeIsValueable = gameData.requirements["Life is valueable"].completed ? 1e5 : 1
    let lifespan = baseLifespan * immortality.getEffect() * superImmortality.getEffect() * abyss.getEffect()
        * cosmicLongevity.getEffect() * higherDimensions.getEffect() * lifeIsValueable * speedSpeedSpeed

    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time")
        lifespan = pow(lifespan, 0.72) + 365 * 25

    return lifespan
}

// nope. we must not use this check in an game loop wtf
function applyIsAlive() {
    const lifespan = getLifespan()
    const condition = gameData.days < lifespan || lifespan == Infinity
    gameData.is_alive = condition && !tempData.hasError
}

function canSimulate() {
    return !gameData.paused && gameData.is_alive
}

function isHeroesUnlocked() {
    return gameData.requirements["New Beginning"].completed && (gameData.taskData["One Above All"].level >= 2000 || gameData.taskData["One Above All"].isHero)
}

function makeHero(task) {
    if ((task instanceof Job || task instanceof Skill) && !task.isHero) {
        task.level = 0
        task.maxLevel = 0
        task.xp = new Decimal(0)
        task.isHero = true
    }
}

function makeHeroes() {
    if (!isHeroesUnlocked()) return

    for (const taskname in gameData.taskData) {
        const task = gameData.taskData[taskname]

        if (task.isHero)
            continue

        const prev = getPreviousTaskInCategory(taskname)

        if (prev !== "" && (!gameData.taskData[prev].isHero || gameData.taskData[prev].level < 20))
            continue

        const req = gameData.requirements[taskname]
        let isNewHero = true

        if (req instanceof TaskRequirement) {
            if (!req.isCompletedActual(true))
                continue
            for (const requirement of req.requirements)
                if (!(gameData.taskData[requirement.task] && gameData.taskData[requirement.task].isHero)) {
                    isNewHero = false
                    break
                }
        }
        else if (req instanceof EssenceRequirement) {
            if (!req.isCompletedActual(true))
                continue
        }
        else if (req instanceof DarkMatterRequirement) {
            if (!req.isCompletedActual(true))
                continue
        }

        if (isNewHero)
            makeHero(task)
    }

    for (const key in gameData.itemData) {
        const item = gameData.itemData[key]
        if (item.isHero)
            continue
        item.isHero = true
        gameData.currentProperty = gameData.itemData["Homeless"]
        gameData.currentMisc = []
    }
}

function applyMilestones() {
    if (canSimulate()) {
        const reqs = gameData.requirements;

        if ((reqs["Magic Eye"].completed && reqs["Rebirth note 2"].completed) || reqs["Almighty Eye"].completed) {

            const effect = gameData.taskData["Cosmic Recollection"].getEffect() || 1;

            for (const key in gameData.taskData) {
                const task = gameData.taskData[key]
                const maxlevel = floor(task.level * effect);
                if (maxlevel > task.maxLevel) {
                    task.maxLevel = maxlevel;
                }
            }
        }

        if (reqs["Deal with the Devil"].completed && reqs["Rebirth note 3"].completed) {
            if (gameData.evil == 0)
                gameData.evil = 1
            if (gameData.evil < getEvilGain())
                gameData.evil *= pow(1.001, 1)
        }

        if (reqs["Hell Portal"].completed) {
            if (gameData.evil == 0)
                gameData.evil = 1
            if (gameData.evil < getEvilGain()) {
                const exponent = reqs["Mind Control"].completed ? 2 : (gameData.rebirthFiveCount > 0) ? 1.3 : 1.01
                gameData.evil *= pow(exponent, 1)
            }
        }

        if (reqs["Galactic Emperor"].completed) {
            if (gameData.essence == 0)
                gameData.essence = 1
            if (gameData.essence < getEssenceGain() * 10) {
                const exponent = reqs["Speed speed speed"].completed ? 2 : 1.002
                gameData.essence *= pow(exponent, 1)
            }
            if (gameData.essence == Infinity || gameData.essence > 1e308)
                gameData.essence = 1e308
        }
    }
}

function applyPerks() {
    if (gameData.perks.instant_evil == 1) {
        if (gameData.evil < getEvilGain() * 10)
            gameData.evil = getEvilGain() * 10
    }

    if (gameData.perks.instant_essence == 1) {
        if (gameData.essence < getEssenceGain() * 10)
            gameData.essence = getEssenceGain() * 10
        if (gameData.essence == Infinity || gameData.essence > 1e308)
            gameData.essence = 1e308
    }

    if (gameData.perks.instant_dark_matter == 1) {
        if (gameData.dark_matter < getDarkMatterGain() * 10)
            gameData.dark_matter = getDarkMatterGain() * 10
    }
}

function applyEvilPerks() {
    if (!gameData.evil_perks_keep && gameData.requirements["Dark Orbiter"].completed)
        gameData.evil_perks_keep = true

    // обновляем требования, т.к. evil perks их меняет

    gameData.requirements["Rebirth note 0"].requirements[0].requirement = getAge0Requirement()
    gameData.requirements["Rebirth note 1"].requirements[0].requirement = getAge1Requirement()
    gameData.requirements["Rebirth note 2"].requirements[0].requirement = getEyeRequirement()
    gameData.requirements["key1"].requirements[0].requirement = getEyeRequirement()

    gameData.requirements["Rebirth note 3"].requirements[0].requirement = getEvilRequirement()
    gameData.requirements["Rebirth stats evil"].requirements[0].requirement = getEvilRequirement()
    gameData.requirements["key2"].requirements[0].requirement = getEvilRequirement()

    gameData.requirements["Rebirth note 4"].requirements[0].requirement = getVoidRequirement()
    gameData.requirements["Void Manipulation"].requirements[0].requirement = getVoidRequirement()
    gameData.requirements["The Void"].requirements[0].requirement = getVoidRequirement()
    gameData.requirements["Corrupted"].requirements[0].requirement = getVoidRequirement()

    gameData.requirements["Galactic Council"].requirements[0].requirement = getCelestialRequirement()
    gameData.requirements["Celestial Powers"].requirements[0].requirement = getCelestialRequirement()
    gameData.requirements["Rebirth note 5"].requirements[0].requirement = getCelestialRequirement()
    gameData.requirements["Eternal Wanderer"].requirements[0].requirement = getCelestialRequirement()
}

function updateRequirements() {
    // Call isCompleted on every requirement as that function caches its result in requirement.completed
    for (const i in gameData.requirements) gameData.requirements[i].isCompleted()
}

function updateStats() {
    if (gameData.requirements["Rebirth stats evil"].completed) {
        gameData.stats.EvilPerSecond = getEvilGain() / gameData.rebirthTwoTime
        if (gameData.stats.EvilPerSecond > gameData.stats.maxEvilPerSecond) {
            gameData.stats.maxEvilPerSecond = gameData.stats.EvilPerSecond
            gameData.stats.maxEvilPerSecondRt = gameData.rebirthTwoTime
        }
    }

    if (gameData.requirements["Rebirth stats essence"].completed) {
        const faintHopeTime = getFaintHopeTime()
        gameData.stats.EssencePerSecond = getEssenceGain() / faintHopeTime
        if (gameData.stats.EssencePerSecond > gameData.stats.maxEssencePerSecond) {
            gameData.stats.maxEssencePerSecond = gameData.stats.EssencePerSecond
            gameData.stats.maxEssencePerSecondRt = faintHopeTime
        }
    }

    if (gameData.essence > gameData.stats.maxEssenceReached)
        gameData.stats.maxEssenceReached = gameData.essence
}

let totalIncome = 0
let totalExpense = 0


/* GAME LOOP */
function update() {
    // lets try cache it for one tick
    gameData.game_speed = getUnpausedGameSpeed()
    applyIsAlive()
    makeHeroes()
    increaseRealtime()
    increaseDays()
    autoPerks()
    updateTotalIncome()
    updateTotalExpense()

    autoBuy()
    applyExpenses()

    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (gameData.requirements[key].completed) {
            task.increaseXp()
        }
    }
    increaseCoins()

    gameData.evil_perks_points += applySpeed(getEvilPerksGeneration())
    gameData.dark_orbs += applySpeed(getDarkOrbGeneration())
    gameData.hypercubes += applySpeed(getHypercubeGeneration())
    if (gameData.hypercubes > getHypercubeCap())
        gameData.hypercubes = getHypercubeCap()

    applyMilestones()
    applyEvilPerks()
    applyPerks()
    updateStats()
    updateRequirements()
}

