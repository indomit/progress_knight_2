onerror = () => {
    document.getElementById("errorInfo").hidden = false
    tempData.hasError = true
    setTimeout(() => {
        document.getElementById("errorInfo").hidden = true
    }, 30 * 1000)
}

window.addEventListener('resize', function(event) {
    onResize(event.target.outerWidth)
}, true);


function addMultipliers() {
    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getHappiness)
        task.xpMultipliers.push(getDarkMatterXpGain)
        task.xpMultipliers.push(getBindedTaskEffect("Dark Influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Demon Training"))
        task.xpMultipliers.push(getBindedTaskEffect("Void Influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Parallel Universe"))
        task.xpMultipliers.push(getBindedTaskEffect("Immortal Ruler"))
        task.xpMultipliers.push(getBindedTaskEffect("Blinded By Darkness"))
        task.xpMultipliers.push(getDarkMatterSkillXP)
        task.xpMultipliers.push(getTimeIsAFlatCircleXP)

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            task.incomeMultipliers.push(getBindedTaskEffect("Demon's Wealth"))
            task.incomeMultipliers.push(getLifeCoachIncomeGain)
            task.xpMultipliers.push(getBindedTaskEffect("Productivity"))
            task.xpMultipliers.push(getBindedTaskEffect("Dark Knowledge"))
            task.xpMultipliers.push(getBindedItemEffect("Personal Squire"))
        } else if (task instanceof Skill) {
            task.xpMultipliers.push(getBindedTaskEffect("Concentration"))
            task.xpMultipliers.push(getBindedItemEffect("Book"))
            task.xpMultipliers.push(getBindedItemEffect("Study Desk"))
            task.xpMultipliers.push(getBindedItemEffect("Library"))
            task.xpMultipliers.push(getBindedItemEffect("Void Blade"))
            task.xpMultipliers.push(getBindedTaskEffect("Void Symbiosis"))
            task.xpMultipliers.push(getBindedItemEffect("Universe Fragment"))
            task.xpMultipliers.push(getBindedItemEffect("Custom Galaxy"))
            task.xpMultipliers.push(getBindedTaskEffect("Evil Incarnate"))
            task.xpMultipliers.push(getBindedTaskEffect("Dark Prince"))
        }

        if (jobCategories["Military"].includes(task.name)) {
            task.incomeMultipliers.push(getBindedTaskEffect("Strength"))
            task.xpMultipliers.push(getBindedTaskEffect("Battle Tactics"))
            task.xpMultipliers.push(getBindedItemEffect("Steel Longsword"))
        } else if (task.name == "Strength") {
            task.xpMultipliers.push(getBindedTaskEffect("Muscle Memory"))
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (skillCategories["Magic"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Sapphire Charm"))
            task.xpMultipliers.push(getBindedItemEffect("Observatory"))
            task.xpMultipliers.push(getBindedTaskEffect("Universal Ruler"))
            task.xpMultipliers.push(getTaaAndMagicXpGain)
        } else if (skillCategories["Void Manipulation"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Void Necklace"))
            task.xpMultipliers.push(getBindedItemEffect("Void Orb"))
        } else if (jobCategories["The Arcane Association"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Mana Control"))
            task.xpMultipliers.push(getTaaAndMagicXpGain)
            task.incomeMultipliers.push(getBindedTaskEffect("All Seeing Eye"))
        } else if (jobCategories["The Void"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Void Amplification"))
            task.xpMultipliers.push(getBindedItemEffect("Void Armor"))
            task.xpMultipliers.push(getBindedItemEffect("Void Dust"))
        } else if (jobCategories["Galactic Council"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Celestial Robe"))
            task.xpMultipliers.push(getBindedTaskEffect("Epiphany"))
        } else if (skillCategories["Dark Magic"].includes(task.name)) {
            task.xpMultipliers.push(getEvilXpGain)
        } else if (skillCategories["Almightiness"].includes(task.name)) {
            task.xpMultipliers.push(getEssenceXpGain)
        } else if (skillCategories["Fundamentals"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Mind's Eye"))
        } else if (skillCategories["Darkness"].includes(task.name)) {
            task.xpMultipliers.push(getDarknessXpGain)
        }
    }

    for (const itemName in gameData.itemData) {
        const item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"))
        item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"))
        item.expenseMultipliers.push(getBindedTaskEffect("Brainwashing"))
        item.expenseMultipliers.push(getBindedTaskEffect("Abyss Manipulation"))
        item.expenseMultipliers.push(getBindedTaskEffect("Galactic Command"))
    }
}

function getHeroXpGainMultipliers(job)
{
    var baseMult = 1

    if (job instanceof Job)
        baseMult = 50000

    if (gameData.requirements["Rise of Great Heroes"].isCompleted())
        baseMult *= 10000

    if (gameData.requirements["Lazy Heroes"].isCompleted())
        baseMult *= 1e12

    if (gameData.requirements["Dirty Heroes"].isCompleted())
        baseMult *= 1e15

    if (gameData.requirements["Angry Heroes"].isCompleted())
        baseMult *= 1e15

    if (gameData.requirements["Tired Heroes"].isCompleted())
        baseMult *= 1e15

    if (gameData.requirements["Scared Heroes"].isCompleted())
        baseMult *= 1e15

    if (gameData.requirements["Good Heroes"].isCompleted())
        baseMult *= 1e15

    if (gameData.requirements["Funny Heroes"].isCompleted())
        baseMult *= 1e25

    if (gameData.requirements["Beautiful Heroes"].isCompleted())
        baseMult *= 1e50

    if (gameData.requirements["Awesome Heroes"].isCompleted())
        baseMult *= 1e10

    if (gameData.requirements["Furious Heroes"].isCompleted()) {
        if (job instanceof Job)
            baseMult *= 1000000
        baseMult *= 1e12
    }

    if (gameData.requirements["Superb Heroes"].isCompleted())
        baseMult *= 1e3

    return baseMult
}


function setCustomEffects() {
    const bargaining = gameData.taskData["Bargaining"]
    bargaining.getEffect = function () {
        const multiplier = 1 - getBaseLog(bargaining.isHero? 3 : 7, bargaining.level + 1) / 10
        if (multiplier < 0.1) return 0.1
        return multiplier
    }

    const intimidation = gameData.taskData["Intimidation"]
    intimidation.getEffect = function () {
        const multiplier = 1 - getBaseLog(intimidation.isHero ? 3 : 7, intimidation.level + 1) / 10
        if (multiplier < 0.1) return 0.1
        return multiplier
    }

    const brainwashing = gameData.taskData["Brainwashing"]
    brainwashing.getEffect = function () {
        const multiplier = 1 - getBaseLog(brainwashing.isHero ? 3 : 7, brainwashing.level + 1) / 10
        if (multiplier < 0.1) return 0.1
        return multiplier
    }

    const abyssManipulation = gameData.taskData["Abyss Manipulation"]
    abyssManipulation.getEffect = function () {
        const multiplier = 1 - getBaseLog(abyssManipulation.isHero ? 3 : 7, abyssManipulation.level + 1) / 10
        if (multiplier < 0.1) return 0.1
        return multiplier
    }

    const galacticCommand = gameData.taskData["Galactic Command"]
    galacticCommand.getEffect = function () {
        const multiplier = 1 - getBaseLog(galacticCommand.isHero ? 3 : 7, galacticCommand.level + 1) / 10
        if (multiplier < 0.1) return 0.1
        return multiplier
    }

    const timeWarping = gameData.taskData["Time Warping"]
    timeWarping.getEffect = function() {
        return 1 + getBaseLog(timeWarping.isHero ? 1.005 : 10, timeWarping.level + 1)
    }

    const immortality = gameData.taskData["Life Essence"]
    immortality.getEffect = function () {
        return 1 + getBaseLog(immortality.isHero ? 1.01 : 33, immortality.level + 1)
    }

    const unholyRecall = gameData.taskData["Cosmic Recollection"];
    unholyRecall.getEffect = function() {
        return unholyRecall.level * (unholyRecall.isHero ? 0.065 : 0.00065);
    }

    const transcendentMaster = milestoneData["Transcendent Master"]
    transcendentMaster.getEffect = function () {
        if (gameData.requirements["Transcendent Master"].isCompleted())
            return 1.5

        return 1
    }

    const faintHope = milestoneData["Faint Hope"]
    faintHope.getEffect = function () {
        var mult = 1
        if (gameData.requirements["A New Hope"].isCompleted()) { 
            mult = softcap(1e308, 10000000, 0.01)
        }
        else if (gameData.requirements["Speed speed speed"].isCompleted()) {
            mult = 7.5275 * Math.exp(0.0053 * (gameData.requirements["Strong Hope"].isCompleted() ? gameData.rebirthFiveTime
                : gameData.rebirthThreeTime)) * (Math.log(getUnpausedGameSpeed()) / Math.log(2))            
            if (mult == Infinity)
                mult = 1e308
            mult = softcap(mult, 10000000, 0.01)
        }
        else if (gameData.requirements["Faint Hope"].isCompleted()) {
            let kickin = 1.1754 - 0.082 * Math.log(gameData.rebirthThreeTime)
            if (kickin < 0.15)
                kickin = 0.15

            mult = 1 + ((gameData.rebirthThreeTime * (gameData.requirements["Angry Heroes"].isCompleted() ? 10 : 1)) / (7750 * kickin)) * (Math.log(getUnpausedGameSpeed()) / Math.log(2))            
            mult = softcap(mult, 200)
        }

        return mult
    }

    const riseOfGreatHeroes = milestoneData["Rise of Great Heroes"]
    riseOfGreatHeroes.getEffect = function () {
        var mult = 1
        if (gameData.requirements["Rise of Great Heroes"].isCompleted()) {
            var countHeroes = 0
            for (const taskName in gameData.taskData) {
                if (gameData.taskData[taskName].isHero)
                    countHeroes++
            }
            mult = 1 + 6 * countHeroes / 74
        }

        return mult
    }
}

function getDarknessXpGain() {
    const strangeMagic = gameData.requirements["Strange Magic"].isCompleted() ? 1e50 : 1
    return strangeMagic
}

function getHappiness() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1

    const meditationEffect = getBindedTaskEffect("Meditation")
    const butlerEffect = getBindedItemEffect("Butler")
    const mindreleaseEffect = getBindedTaskEffect("Mind Release")
    const multiverseFragment = getBindedItemEffect("Multiverse Fragment")
    const godsBlessings = gameData.requirements["God's Blessings"].isCompleted() ? 10000000 : 1
    const stairWayToHeaven = getBindedItemEffect("Stairway to heaven")
    const happiness = godsBlessings * meditationEffect() * butlerEffect() * mindreleaseEffect()
        * multiverseFragment() * gameData.currentProperty.getEffect() * getChallengeBonus("an_unhappy_life") * stairWayToHeaven()

    if (gameData.active_challenge == "dance_with_the_devil") return Math.pow(happiness, 0.075)
    if (gameData.active_challenge == "an_unhappy_life") return Math.pow(happiness, 0.5)

    return happiness
}

function getEvil() {
    return gameData.evil
}

function getEvilXpGain() {
    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return 1

    if (gameData.active_challenge == "dance_with_the_devil") {
        const evilEffect = (Math.pow(getEvil(), 0.35) / 1e3) - 1
        return evilEffect < 0 ? 0 : evilEffect
    }

    return getEvil()
}

function getEssence() {
    if (gameData.essence == Infinity || gameData.essence > 1e308)
        return 1e308
    return gameData.essence
}

function getEssenceXpGain() {
    if (gameData.active_challenge == "dance_with_the_devil" || gameData.active_challenge == "the_darkest_time") {
        const essenceEffect = (Math.pow(getEssence(), 0.35) / 1e2) - 1
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

function applySpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    return value * getGameSpeed() / updateSpeed
}

function applyUnpausedSpeed(value) {
    if (value == 0)
        return 0
    if (value == Infinity)
        return Infinity
    return value * getUnpausedGameSpeed() / updateSpeed
}

function applySpeedOnBigInt(value) {
    if (value == 0n)
        return 0n
    return value * BigInt(Math.floor(getGameSpeed())) / BigInt(Math.floor(updateSpeed))
}

function getEvilGain() {
    const evilControl = gameData.taskData["Evil Control"]
    const bloodMeditation = gameData.taskData["Blood Meditation"]
    const absoluteWish = gameData.taskData ["Absolute Wish"]
    const oblivionEmbodiment = gameData.taskData ["Void Embodiment"]
    const yingYang = gameData.taskData["Yin Yang"]
    const inferno = gameData.requirements["Inferno"].isCompleted() ? 5 : 1    
    const theDevilInsideYou = gameData.requirements["The Devil inside you"].isCompleted() ? 1e15 : 1
    const stairWayToHell = getBindedItemEffect("Highway to hell")
    const evilBooster = (gameData.perks.evil_booster == 1) ? 1e50 : 1

    const evilGain = evilControl.getEffect() * bloodMeditation.getEffect() * absoluteWish.getEffect()
        * oblivionEmbodiment.getEffect() * yingYang.getEffect() * inferno * getChallengeBonus("legends_never_die")
        * getDarkMatterSkillEvil() * theDevilInsideYou * stairWayToHell() * evilBooster

    return Math.min(evilGain, 1e308)
}

function getEssenceGain() {
    const essenceControl = gameData.taskData["Yin Yang"]
    const essenceCollector = gameData.taskData["Essence Collector"]
    const transcendentMaster = milestoneData["Transcendent Master"]
    const faintHope = milestoneData["Faint Hope"]
    const rise = milestoneData["Rise of Great Heroes"]
    const darkMagician = gameData.taskData["Dark Magician"]

    const theNewGold = gameData.requirements["The new gold"].isCompleted() ? 1000 : 1
    const lifeIsValueable = gameData.requirements["Life is valueable"].isCompleted() ? gameData.dark_matter : 1

    const essenceGain = essenceControl.getEffect() * essenceCollector.getEffect() * transcendentMaster.getEffect()
        * faintHope.getEffect() * rise.getEffect() * getChallengeBonus("dance_with_the_devil")
        * getAGiftFromGodEssenceGain() * darkMagician.getEffect() * getDarkMatterSkillEssence() 
        * theNewGold * lifeIsValueable *  essenceMultGain()

    return Math.min(essenceGain, 1e308)
}

function getDarkMatterGain() {
    const darkRuler = gameData.taskData["Dark Ruler"]
    const darkMatterHarvester = gameData.requirements["Dark Matter Harvester"].isCompleted() ? 10 : 1
    const darkMatterMining = gameData.requirements["Dark Matter Mining"].isCompleted() ? 3 : 1
    const darkMatterMillionaire = gameData.requirements["Dark Matter Millionaire"].isCompleted() ? 500 : 1
    const Desintegration = gameData.itemData['Desintegration'].getEffect()
    const TheEndIsNear = getUnspentPerksDarkmatterGainBuff() 


    return 1 * darkRuler.getEffect() * darkMatterHarvester * darkMatterMining * darkMatterMillionaire * getChallengeBonus("the_darkest_time") * getDarkMatterSkillDarkMater() * darkMatterMultGain() *
        (Desintegration == 0 ? 1 : Desintegration) * TheEndIsNear
}

function getDarkMatter() {
    return gameData.dark_matter;
}

function getDarkMatterXpGain() {
    if (getDarkMatter() < 1)
        return 1

    return getDarkMatter() + 1;
}

function getDarkOrbs() {
    return gameData.dark_orbs
}

function getGameSpeed() {
    if (!canSimulate())
        return 0

    return getUnpausedGameSpeed()
}

function getUnpausedGameSpeed() {
    const boostWarping = gameData.boost_active ? gameData.metaverse.boost_warp_modifier : 1
    const timeWarping = gameData.taskData["Time Warping"]
    const temporalDimension = gameData.taskData["Temporal Dimension"]
    const timeLoop = gameData.taskData["Time Loop"]
    const warpDrive = (gameData.requirements["Eternal Time"].isCompleted()) ? 2 : 1
    const speedSpeedSpeed = gameData.requirements["Speed speed speed"].isCompleted() ? 1000 : 1
    const timeIsAFlatCircle = gameData.requirements["Time is a flat circle"].isCompleted() ? 1000 : 1

    const timeWarpingSpeed = boostWarping * timeWarping.getEffect() * temporalDimension.getEffect() * timeLoop.getEffect() * warpDrive * speedSpeedSpeed * timeIsAFlatCircle

    const gameSpeed = baseGameSpeed * timeWarpingSpeed * getChallengeBonus("time_does_not_fly") * getGottaBeFastGain() * getDarkMatterSkillTimeWarping() 

    if (gameData.active_challenge == "time_does_not_fly" || gameData.active_challenge == "the_darkest_time")
        return Math.pow(gameSpeed, 0.7)

    if (gameData.active_challenge == "legends_never_die")
        return Math.pow(gameSpeed, 0.75)

    return gameSpeed
}

function applyExpenses() {
    if (gameData.coins == Infinity)
        return

    gameData.coins -= applySpeed(getExpense())

    if (gameData.coins < 0) {
        gameData.coins = 0
        if (getIncome() < getExpense())
            goBankrupt()
    }
}

function goBankrupt() {
    gameData.coins = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    autoBuyEnabled = true
}

async function downloadFile() {
    let response = await fetch("./changelog.txt");

    if (response.status != 200) {
        throw new Error("Server Error");
    }

    // read response stream as text
    let text_data = await response.text();

    return text_data;
}

document.querySelector("#changelogTabTabButton").addEventListener('click', async function () {
    try {
        let text_data = await downloadFile();
        document.querySelector("#changelog").textContent = text_data;
    }
    catch (e) {
        alert(e.message);
    }
});

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
    else {data[entity.name] = new Item(entity)}
    data[entity.name].id = "row " + entity.name
}

function setCurrency(index) {
    gameData.settings.currencyNotation = index
    selectElementInGroup("CurrencyNotation", index)
}

function setNotation(index) {
    gameData.settings.numberNotation = index
    selectElementInGroup("Notation", index)
}

function getNet() {
    return Math.abs(getIncome() - getExpense())
}

function getIncome() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0
    
    return gameData.currentJob.getIncome() * getDarkMatterSkillIncome()
}

function getExpense() {
    var expense = 0
    expense += gameData.currentProperty.getExpense()
    for (misc of gameData.currentMisc) {
        expense += misc.getExpense()
    }
    return expense
}

function increaseCoins() {
    gameData.coins += applySpeed(getIncome())
}

function autoPerks() {
    // perks
    if (gameData.perks.auto_boost == 1 && !gameData.boost_active && gameData.boost_cooldown <= 0)
        applyBoost()

    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter >= getDarkOrbGeneratorCost() * 10 && gameData.dark_orbs != Infinity)
        buyDarkOrbGenerator()

    if (gameData.perks.auto_dark_orb == 1 && gameData.dark_matter >= 100 && gameData.dark_matter_shop.a_miracle == false)
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

function autoPromote() {
    let maxIncome = 0;
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (task instanceof Job && gameData.requirements[key].isCompleted()) {
            const income = task.getIncome();
            if (income > maxIncome) {
                maxIncome = income
                gameData.currentJob = task
            }
        }
    }
}

function autoBuy() {
    if (!autoBuyEnabled) return

    let usedExpense = 0
    const income = getIncome()

    for (const key in gameData.itemData) {
        if (gameData.requirements[key].isCompleted()) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()

            if (itemCategories['Properties'].indexOf(key) != -1) {
                if (expense < income && expense >= usedExpense) {
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
        if (gameData.requirements[key].isCompleted()) {
            const item = gameData.itemData[key]
            const expense = item.getExpense()
            if (itemCategories['Misc'].indexOf(key) != -1) {
                if (expense < income - usedExpense) {
                    if (gameData.currentMisc.indexOf(item) == -1) {
                        gameData.currentMisc.push(item)
                        usedExpense += expense
                    }
                }
            }
        }
    }   
}

function increaseDays() {
    gameData.days += applySpeed(1)
    gameData.totalDays += applySpeed(1)
}

function increaseRealtime() {
    if (!canSimulate())
        return;

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

function setTheme(index, reload=false) {
    const body = document.getElementById("body")

    body.classList.remove("dark")
    body.classList.remove("colorblind")


    if (index == 0) {
        // lignt
    }
    else if (index == 1) {
        // dark
        body.classList.add("dark")
    }
    else if (index == 2){
        // colorblind Tritanopia
        body.classList.add("colorblind")
    }

    gameData.settings.theme = index
    selectElementInGroup("Theme", index)

    if (reload) {
        saveGameData()
        location.reload()
    }
}

function setEnableKeybinds(enableKeybinds) {
    gameData.settings.enableKeybinds = enableKeybinds
    selectElementInGroup("EnableKeybinds", enableKeybinds ? 0 : 1)
}

function resetEvilPerks(){
    if (gameData.requirements["God's Blessings"].isCompleted())
        return;
    gameData.evil_perks_points = 0
    gameData.evil_perks.receive_essence = 0
    
    if (!gameData.evil_perks_keep){
        gameData.evil_perks.reduce_eye_requirement = 0
        gameData.evil_perks.reduce_evil_requirement = 0
        gameData.evil_perks.reduce_the_void_requirement = 0
        gameData.evil_perks.reduce_celestial_requirement = 0
    }
}

function rebirthOne() {
    if (!gameData.requirements["Rebirth button 1"].isCompleted())
        return;

    gameData.rebirthOneCount += 1
    if (gameData.stats.fastest1 == null || gameData.rebirthOneTime < gameData.stats.fastest1)
        gameData.stats.fastest1 = gameData.rebirthOneTime
    gameData.rebirthOneTime = 0

    rebirthReset()
}

function rebirthTwo() {
    if (!gameData.requirements["Rebirth button 2"].isCompleted())
        return;

    gameData.rebirthTwoCount += 1
    gameData.evil += getEvilGain()

    resetEvilPerks()

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
    if (!gameData.requirements["Rebirth button 3"].isCompleted())
        return;

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

    const recallEffect = gameData.taskData["Cosmic Recollection"].getEffect();

    for (const taskName in gameData.taskData) {
        const task = gameData.taskData[taskName]
        task.maxLevel = Math.floor(recallEffect * task.level);
    }

    rebirthReset()
    gameData.active_challenge = ""
}

function rebirthFour() {
    if (!gameData.requirements["Rebirth button 4"].isCompleted())
        return;

    gameData.rebirthFourCount += 1
    gameData.essence = 0
    gameData.evil = 0
    gameData.dark_matter += getDarkMatterGain()
    gameData.evil_perks_points = 0
    gameData.evil_perks.receive_essence = 0

    if (gameData.metaverse.challenge_altar == 0 && gameData.perks.save_challenges == 0)  {
        for (const challenge in gameData.challenges) {
            gameData.challenges[challenge] = 0
        }
        gameData.requirements["Challenges"].completed = false
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

function rebirthFive() {
    if (!gameData.requirements["Rebirth button 5"].isCompleted())
        return;

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
        for (const challenge in gameData.challenges) {
            gameData.challenges[challenge] = 0
        }
        gameData.requirements["Challenges"].completed = false
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

function applyMilestones() {
    if (((gameData.requirements["Magic Eye"].isCompleted()) && (gameData.requirements["Rebirth note 2"].isCompleted())) ||
        (gameData.requirements["Almighty Eye"].isCompleted())){
        for (taskName in gameData.taskData) {
            const task = gameData.taskData[taskName]
            const effect = gameData.taskData["Cosmic Recollection"].getEffect()
            const maxlevel = Math.floor(task.level * (effect == 0 ? 1 : effect))
            if (maxlevel > task.maxLevel)
                task.maxLevel = maxlevel
        }
    }

    if (canSimulate()) {
        if (gameData.requirements["Deal with the Devil"].isCompleted() && gameData.requirements["Rebirth note 3"].isCompleted()) {
            if (gameData.evil == 0)
                gameData.evil = 1
            if (gameData.evil < getEvilGain())
                gameData.evil *= Math.pow(1.001, 1)
        }

        if (gameData.requirements["Hell Portal"].isCompleted()) {
            if (gameData.evil == 0)
                gameData.evil = 1
            if (gameData.evil < getEvilGain()) {
                const exponent = gameData.requirements["Mind Control"].isCompleted() ? 1.07 : 1.01
                gameData.evil *= Math.pow(exponent, 1)
            }
        }

        if (gameData.requirements["Galactic Emperor"].isCompleted()) {
            if (gameData.essence == 0)
                gameData.essence = 1
            if (gameData.essence < getEssenceGain() * 10)
                gameData.essence *= Math.pow(1.002, 1)
            if (gameData.essence == Infinity || gameData.essence > 1e308)
                gameData.essence = 1e308
        }
    }
}

function rebirthReset(set_tab_to_jobs = true) {
    if (set_tab_to_jobs) {
        // if (gameData.settings.selectedTab == Tab.METAVERSE && gameData.perks.)

        if (gameData.settings.selectedTab == Tab.METAVERSE && gameData.hypercubes > 0
            || gameData.settings.selectedTab == Tab.CHALLENGES && gameData.evil > 10000
            || gameData.settings.selectedTab == Tab.MILESTONES && gameData.essence > 0
            || gameData.settings.selectedTab == Tab.DARK_MATTER && gameData.dark_matter > 0
            || gameData.settings.selectedTab == Tab.REBIRTH
            || gameData.settings.selectedTab == Tab.EVILPERKS 
            || gameData.settings.selectedTab == Tab.INFO 
        ) {
            // do not switch tab
        }
        else
            setTab("jobs")
    }

    gameData.coins = 0
    gameData.days = 365 * 14
    gameData.realtime = 0
    gameData.currentJob = gameData.taskData["Beggar"]
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
        task.xp = 0
        task.xpBigInt = BigInt(0)
        task.isHero = false
        task.isFinished =false
    }

    for (const itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.isHero = false
    }

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        if (requirement.completed && (permanentUnlocks.includes(key) || metaverseUnlocks.includes(key))) continue
        requirement.completed = false
    }

    // Keep milestones which were bought in the Dark Matter shop
    if (gameData.dark_matter_shop.a_miracle) {
        gameData.requirements["Magic Eye"].completed = true
        if (gameData.rebirthOneCount == 0)
            gameData.rebirthOneCount = 1
    }
}

function getLifespan() {
    const immortality = gameData.taskData["Life Essence"]
    const superImmortality = gameData.taskData["Astral Body"]
    const higherDimensions = gameData.taskData["Higher Dimensions"]
    const abyss = gameData.taskData["Ceaseless Abyss"]
    const cosmicLongevity = gameData.taskData["Cosmic Longevity"]
    const speedSpeedSpeed = gameData.requirements["Speed speed speed"].isCompleted() ? 1000 : 1
    const lifeIsValueable = gameData.requirements["Life is valueable"].isCompleted() ? 1e5 : 1
    const lifespan = baseLifespan * immortality.getEffect() * superImmortality.getEffect() * abyss.getEffect()
        * cosmicLongevity.getEffect() * higherDimensions.getEffect() * lifeIsValueable * speedSpeedSpeed

    if (gameData.active_challenge == "legends_never_die" || gameData.active_challenge == "the_darkest_time") return Math.pow(lifespan, 0.72) + 365 * 25

    if (gameData.rebirthFiveCount > 0) return Infinity

    return lifespan
}

function isAlive() {
    const condition = gameData.days < getLifespan() || getLifespan() == Infinity

    if (!condition) {
        gameData.days = getLifespan()        
    }

    if (!in_offline_progress){
        const deathText = document.getElementById("deathText")
        if (!condition)  
            deathText.classList.remove("hidden")        
        else 
            deathText.classList.add("hidden")        
    }
    return condition && !tempData.hasError
}

function canSimulate() {
    return !gameData.paused && isAlive()
}

function isHeroesUnlocked() {
    return gameData.requirements["New Beginning"].isCompleted() && (gameData.taskData["One Above All"].level >= 2000 || gameData.taskData["One Above All"].isHero)
}

function makeHero(task) {
    if ((task instanceof Job || task instanceof Skill) && !task.isHero) {
        task.level = 0
        task.maxLevel = 0
        task.xp = 0
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

        if (prev != "" && (!gameData.taskData[prev].isHero || gameData.taskData[prev].level < 20))
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


function assignMethods() {
    for (const key in gameData.taskData) {
        let task = gameData.taskData[key]
        if (task.baseData.income) {
            task.baseData = jobBaseData[task.name]
            task = Object.assign(new Job(jobBaseData[task.name]), task)

        } else {
            task.baseData = skillBaseData[task.name]
            task = Object.assign(new Skill(skillBaseData[task.name]), task)
        }

        // There are two cases. The number is stored as a large number or in the scientific notation.
        if (typeof task.xpBigInt === "string" && task.xpBigInt.includes("e"))
            task.xpBigInt = BigInt(exponentialToRawNumberString(task.xpBigInt))
        else
            task.xpBigInt = BigInt(task.xpBigInt)

        gameData.taskData[key] = task
    }

    for (const key in gameData.itemData) {
        let item = gameData.itemData[key]
        item.baseData = itemBaseData[item.name]
        item = Object.assign(new Item(itemBaseData[item.name]), item)
        gameData.itemData[key] = item
    }

    for (const key in gameData.requirements) {
        let requirement = gameData.requirements[key]
        if (requirement.type == "task") {
            requirement = Object.assign(new TaskRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "coins") {
            requirement = Object.assign(new CoinRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "age") {
            requirement = Object.assign(new AgeRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "evil") {
            requirement = Object.assign(new EvilRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "essence") {
            requirement = Object.assign(new EssenceRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "darkMatter") {
            requirement = Object.assign(new DarkMatterRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "darkOrb") {
            requirement = Object.assign(new DarkOrbsRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "metaverse") {
            requirement = Object.assign(new MetaverseRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "hypercube") {
            requirement = Object.assign(new HypercubeRequirement(requirement.querySelectors, requirement.requirements), requirement)
        } else if (requirement.type == "perkpoint") {
            requirement = Object.assign(new PerkPointRequirement(requirement.querySelectors, requirement.requirements), requirement)
        }
        

        const tempRequirement = tempData["requirements"][key]
        requirement.elements = tempRequirement.elements
        requirement.requirements = tempRequirement.requirements
        gameData.requirements[key] = requirement
    }

    gameData.currentJob = gameData.taskData[gameData.currentJob.name]
    gameData.currentProperty = gameData.itemData[gameData.currentProperty.name]
    const newArray = []
    for (const misc of gameData.currentMisc) {
        newArray.push(gameData.itemData[misc.name])
    }
    gameData.currentMisc = newArray
}

function replaceSaveDict(dict, saveDict) {
    for (const key in dict) {
        if (!(key in saveDict)) {
            saveDict[key] = dict[key]
        } else if (dict == gameData.requirements) {
            if (saveDict[key].type != tempData["requirements"][key].type) {
                saveDict[key] = tempData["requirements"][key]
            }
            else if (saveDict[key].querySelectors == undefined) {
                saveDict[key].querySelectors = tempData["requirements"][key].querySelectors
            }

        }
    }

    for (const key in saveDict) {
        if (!(key in dict)) {
            delete saveDict[key]
        }
    }
}

function saveGameData() {
    gameData.save_date_time = Date.now()
    localStorage.setItem("gameDataSave", JSON.stringify(gameData))
}

function peekSettingFromSave(setting) {
    try {
        const save = localStorage.getItem("gameDataSave")
        if (save == null)
            return gameData.settings[setting]
        const gameDataSave = JSON.parse(save)
        if (gameDataSave.settings == undefined || gameDataSave.settings[setting] == undefined)
            return gameData.settings[setting]
        return gameDataSave.settings[setting]
    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function loadGameData() {
    try {
        const gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"))

        if (gameDataSave !== null) {
            // When the game contains completedTimes, add 1 Dark Matter and remove the instance.
            if ("completedTimes" in gameDataSave && gameDataSave["completedTimes"] > 0) {
                delete gameDataSave["completedTimes"]
                gameDataSave.dark_matter += 1
                console.log("Gave 1 free Dark Matter")
            }

            // remove milestoneData from gameData
            if ("milestoneData" in gameDataSave) {
                delete gameDataSave["milestoneData"]                
            }

            replaceSaveDict(gameData, gameDataSave)
            replaceSaveDict(gameData.requirements, gameDataSave.requirements)
            replaceSaveDict(gameData.taskData, gameDataSave.taskData)
            replaceSaveDict(gameData.itemData, gameDataSave.itemData)
            replaceSaveDict(gameData.settings, gameDataSave.settings)
            replaceSaveDict(gameData.stats, gameDataSave.stats)
            replaceSaveDict(gameData.challenges, gameDataSave.challenges)
            replaceSaveDict(gameData.dark_matter_shop, gameDataSave.dark_matter_shop)
            replaceSaveDict(gameData.metaverse, gameDataSave.metaverse)
            replaceSaveDict(gameData.perks, gameDataSave.perks)
            gameData = gameDataSave

            if (gameData.coins == null)
                gameData.coins = 0

            if (gameData.essence == null)
                gameData.essence = 0

            if (gameData.days == null)
                gameData.days = 365 * 14

            if (gameData.evil == null)
                gameData.evil = 0

            if (gameData.dark_matter == null || isNaN(gameData.dark_matter))
                gameData.dark_matter = 0

            if (gameData.dark_orbs == null || isNaN(gameData.dark_matter) || isNaN(gameData.dark_orbs))
                gameData.dark_orbs = 0

            if (gameData.hypercubes == null || isNaN(gameData.hypercubes))
                gameData.hypercubes = 0

            if (gameData.perks_points == null || isNaN(gameData.perks_points))
                gameData.perks_points = 0

            if (gameData.settings.theme == null) {
                gameData.settings.theme = 1
            }

            if (gameData.rebirthOneTime == null || gameData.rebirthOneTime === 0) {
                gameData.rebirthOneTime = gameData.realtime
            }

            if (gameData.rebirthTwoTime == null || gameData.rebirthTwoTime === 0) {
                gameData.rebirthTwoTime = gameData.realtime
            }

            if (gameData.rebirthThreeTime == null || gameData.rebirthThreeTime === 0) {
                gameData.rebirthThreeTime = gameData.realtime
            }

            if (gameData.rebirthFourTime == null || gameData.rebirthFourTime === 0) {
                gameData.rebirthFourTime = gameData.realtime
            }

            // Remove invalid active misc items
            gameData.currentMisc = gameData.currentMisc.filter((element) => element instanceof Item)
            
        }
    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }

    assignMethods()
}

var intervalID = 0;
var totalTimes = 0;
var executedTimes = 0;
var in_offline_progress=false;
var lastUpdate = 0;

function setIntervalX(callback, delay, repetitions) {
    var x = 0;
    intervalID = window.setInterval(function () {

       callback();

       if (++x >= repetitions) {
           stopOffline()
       }
    }, delay);
}

function calc_offline_progress(ms){
    if (ms > 10000){
        in_offline_progress = true
        intervalID = 0
        totalTimes = 0
        executedTimes = 0        
        var offline_max_time = 3600 * 1000 // 1 hour
        if (ms > offline_max_time)
            ms = offline_max_time
        const updates_in_one_tick = 100
        totalTimes = ms / (1000 / updateSpeed)
        var times = totalTimes / updates_in_one_tick
        document.getElementById("offline_progress").hidden = false
        document.getElementById("mainarea").hidden = true
        setIntervalX(() => update_times(updates_in_one_tick), 20, times)        
    }
}

function update_times(times){
    for (var i = 0; i < times; i++) {
        update(false)
        executedTimes++
        document.getElementById("offline_time").textContent = Math.floor(executedTimes*100/totalTimes) + "%"
        if (!isAlive())
            stopOffline()
    }   
}

function stopOffline(){
    window.clearInterval(intervalID);
    document.getElementById("offline_progress").hidden = true
    document.getElementById("mainarea").hidden = false
    in_offline_progress = false;
}

function update(needUpdateUI = true) {
    if (in_offline_progress && needUpdateUI)
        return
    makeHeroes()
    increaseRealtime()
    increaseDays()
    autoPerks()
    autoPromote()
    autoBuy()
    applyExpenses()
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if ((task instanceof Skill || task instanceof Job) && gameData.requirements[key].isCompleted()) {
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
    if (needUpdateUI && !document.hidden)
        updateUI()
    else
        updateRequirements()
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
    if (!gameData.evil_perks_keep && gameData.requirements["Dark Orbiter"].isCompleted())
        gameData.evil_perks_keep = true


    gameData.requirements["Rebirth note 0"].requirements[0].requirement = getAge0Requirement()
    gameData.requirements["Rebirth note 1"].requirements[0].requirement = getAge1Requirement()
    gameData.requirements["Rebirth note 2"].requirements[0].requirement = getEyeRequirement()
    gameData.requirements["Rebirth button 1"].requirements[0].requirement = getEyeRequirement()
    gameData.requirements["key1"].requirements[0].requirement = getEyeRequirement()

    gameData.requirements["Rebirth note 3"].requirements[0].requirement = getEvilRequirement()
    gameData.requirements["Rebirth button 2"].requirements[0].requirement = getEvilRequirement()
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
    if (gameData.requirements["Rebirth stats evil"].isCompleted()) {
        gameData.stats.EvilPerSecond = Math.min(getEvilGain() / gameData.rebirthTwoTime, Number.MAX_VALUE)
        if (gameData.stats.EvilPerSecond > gameData.stats.maxEvilPerSecond) {
            gameData.stats.maxEvilPerSecond = gameData.stats.EvilPerSecond
            gameData.stats.maxEvilPerSecondRt = gameData.rebirthTwoTime
        }
    }

    if (gameData.requirements["Rebirth stats essence"].isCompleted()) {
        gameData.stats.EssencePerSecond = Math.min(getEssenceGain() / gameData.rebirthThreeTime, Number.MAX_VALUE)
        if (gameData.stats.EssencePerSecond > gameData.stats.maxEssencePerSecond) {
            gameData.stats.maxEssencePerSecond = gameData.stats.EssencePerSecond
            gameData.stats.maxEssencePerSecondRt = gameData.rebirthThreeTime
        }
    }

    if (gameData.essence > gameData.stats.maxEssenceReached)
        gameData.stats.maxEssenceReached = gameData.essence
}

function resetGameData() {
    clearInterval(saveloop)
    clearInterval(gameloop)
    if (!confirm('Are you sure you want to reset the game?')) {
        gameloop = setInterval(update, 1000 / updateSpeed)
        saveloop = setInterval(saveGameData, 3000)
        return
    }
    localStorage.clear()
    location.reload()
}

function importGameData() {
    try {
        const importExportBox = document.getElementById("importExportBox")
        if (importExportBox.value == "") {
            alert("It looks like you tried to load an empty save... Paste save data into the box, then click \"Import Save\" again.")
            return
        }
        const data = JSON.parse(window.atob(importExportBox.value))
        clearInterval(gameloop)
        gameData = data
        saveGameData()
        location.reload()
    } catch (error) {
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

function exportGameData() {
    const importExportBox = document.getElementById("importExportBox")
    const saveString = window.btoa(JSON.stringify(gameData))
    importExportBox.value = saveString
    copyTextToClipboard(saveString)
    setTimeout(() => {
        if (importExportBox.value == saveString) {
            importExportBox.value = ""
        }
    }, 15 * 1000)
}

function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const tooltip = document.getElementById("exportTooltip");
        tooltip.innerHTML = "&nbsp;&nbsp;Save copied to clipboard!" ;
    }, err => {
        //console.error('Async: Could not copy text: ', err);
    })
}

function outExportButton() {
    const tooltip = document.getElementById("exportTooltip");
    tooltip.textContent = "";
}

function onFontButtonHover() {
    const tooltip = document.getElementById("fontSizeTooltip");
    tooltip.classList.remove("hidden")
}

function onFontButtonStopHover() {
    const tooltip = document.getElementById("fontSizeTooltip");
    tooltip.classList.add("hidden")
}

function isNextDarkMagicSkillInReach() {
    const totalEvil = gameData.evil + getEvilGain()

    for (const key in gameData.taskData) {
        const skill = gameData.taskData[key]
        if (skillCategories["Dark Magic"].includes(key)) {
            const requirement = gameData.requirements[key]
            if (!requirement.isCompleted()) {
                if (totalEvil >= requirement.requirements[0].requirement) {
                    return true
                }
            }
        }
    }
    return false
}

// Loads the game save, does the initial render and starts the game update and render loop.

createGameObjects(gameData.taskData, jobBaseData)
createGameObjects(gameData.taskData, skillBaseData)
createGameObjects(gameData.itemData, itemBaseData)
createGameObjects(milestoneData, milestoneBaseData)

gameData.currentJob = gameData.taskData["Beggar"]
gameData.currentProperty = gameData.itemData["Homeless"]
gameData.currentMisc = []

gameData.requirements = requirementsBaseData

createMilestoneRequirements()

tempData["requirements"] = {}
for (const key in gameData.requirements) {
    const requirement = gameData.requirements[key]
    tempData["requirements"][key] = requirement
}

loadGameData()

initializeUI()


setCustomEffects()
addMultipliers()

if ("save_date_time" in gameData && gameData.save_date_time > 0) {
   calc_offline_progress(Date.now() - gameData.save_date_time);            
}

if (!in_offline_progress)
    document.getElementById("mainarea").hidden = false

onResize(window.outerWidth)
update()

setTab(gameData.settings.selectedTab)
setTabSettings("settingsTab")
setTabDarkMatter("shopTab")
setTabMetaverse("metaverseTab1")

let ticking = false;

var gameloop = setInterval(function() {
    if (ticking) return;
    ticking = true;
    update();
    var ms = Date.now() - lastUpdate
    if (lastUpdate != 0 && ms >= 10000 && !in_offline_progress)
        calc_offline_progress(ms)
    lastUpdate = Date.now()

    // fps for debug only
    //var thisFrameTime = (thisLoop = new Date) - lastLoop;
    //frameTime += (thisFrameTime - frameTime) / filterStrength;
    //lastLoop = thisLoop;

    ticking = false;
}, 1000 / updateSpeed)
var saveloop = setInterval(saveGameData, 3000)

/* FPS */
/*
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var fpsOut = document.getElementById('fps');
setInterval(function () {
    fpsOut.innerHTML = (1000 / frameTime).toFixed(1) + " fps";
}, 1000);
*/