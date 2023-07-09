function initializeUI() {
    /*
        Initializes the UI. Adds all html elements required for rendering.
    */

    createAllRows(jobCategories, "jobTable")
    createAllRows(skillCategories, "skillTable")
    createAllRows(itemCategories, "itemTable")
    createAllRows(milestoneCategories, "milestoneTable")

    createPerks("perksLayout")

    setLayout(peekSettingFromSave("layout"))
    setFontSize(peekSettingFromSave("fontSize"))
    setNotation(peekSettingFromSave("numberNotation"))
    setCurrency(peekSettingFromSave("currencyNotation"))
    setStickySidebar(peekSettingFromSave("stickySidebar"))

    setTheme(peekSettingFromSave("theme"))
    selectElementInGroup("EnableKeybinds", peekSettingFromSave("enableKeybinds") ? 0 : 1)

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        requirement.queryElements()
    }
}

function updateUI() {
    /*
        NOTE: To ensure that performance does not decrease,
        please only call the render function when the user can actually see the content.
        If they can always see the content put the function call at the top of this function.

        NOTE2: Do NOT render anything to the screen outside of this function.
    */

    // Always render the sidebar.
    renderSideBar()

    // Always render all the requirements.
    renderRequirements()

    const currentTab = gameData.settings.selectedTab

    if (currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.taskData, jobCategories)
        renderHeaderRows(jobCategories)
        renderJobs()
    }

    if (currentTab == Tab.SKILLS || gameData.settings.layout == 0 && currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.taskData, skillCategories)
        renderHeaderRows(skillCategories)
        renderSkills()
    }

    if (currentTab == Tab.SHOP || gameData.settings.layout == 0 && currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.itemData, itemCategories)
        renderShop()
    }

    if (currentTab == Tab.CHALLENGES)
        renderChallenges()

    if (currentTab == Tab.MILESTONES) {
        updateRequiredRows(milestoneData, milestoneCategories)
        renderMilestones()
    }

    if (currentTab == Tab.DARK_MATTER)
        renderDarkMatter()

    if (currentTab == Tab.METAVERSE)
        renderMetaverse()

    if (currentTab == Tab.SETTINGS)
        renderSettings()
}

function renderSideBar() {
    const task = gameData.currentJob
    const quickTaskDisplayElement = document.getElementById("quickTaskDisplay")

    const progressBar = quickTaskDisplayElement.getElementsByClassName("job")[0]
    progressBar.querySelector(".name").textContent = (task.isHero ? "Great " : "") + task.name + " lvl " + formatLevel(task.level)
    const progressFill = progressBar.getElementsByClassName("progressFill")[0]
    renderProgressBar(task, progressFill, progressBar)   

    document.getElementById("ageDisplay").textContent = formatAge(gameData.days)
    document.getElementById("lifespanDisplay").textContent = formatWhole(daysToYears(getLifespan()))
    document.getElementById("realtimeDisplay").textContent = formatTime(gameData.realtime)
    document.getElementById("boostCooldownDisplay").textContent = getBoostCooldownString()            
    document.getElementById("pauseButton").textContent = gameData.paused ? "Play" : "Pause"
    document.getElementById("boostPanel").hidden = gameData.rebirthFiveCount == 0
    renderBoostButton("boostButton")

    formatCoins(gameData.coins, document.getElementById("coinDisplay"))
    setSignDisplay()
    formatCoins(getNet(), document.getElementById("netDisplay"))
    formatCoins(getIncome(), document.getElementById("incomeDisplay"))
    formatCoins(getExpense(), document.getElementById("expenseDisplay"))

    document.getElementById("happinessDisplay").textContent = format(getHappiness())

    document.getElementById("evilDisplay").textContent = format(gameData.evil)
    document.getElementById("evilGainDisplay").textContent = format(getEvilGain())
    document.getElementById("evilGainButtonDisplay").textContent = "+" + format(getEvilGain())

    document.getElementById("essenceDisplay").textContent = format(gameData.essence)
    document.getElementById("essenceGainDisplay").textContent = format(getEssenceGain())
    document.getElementById("essenceGainButtonDisplay").textContent = "+" + format(getEssenceGain())

    document.getElementById("darkMatterDisplay").textContent = format(gameData.dark_matter)
    document.getElementById("darkMatterGainDisplay").textContent = format(getDarkMatterGain())
    document.getElementById("darkMatterGainButtonDisplay").textContent = "+" + format(getDarkMatterGain())

    document.getElementById("darkOrbsDisplay").textContent = formatTreshold(gameData.dark_orbs)

    document.getElementById("timeWarping").hidden = (getUnpausedGameSpeed() / baseGameSpeed) <= 1
    document.getElementById("timeWarpingDisplay").textContent = "x" + format(getUnpausedGameSpeed() / baseGameSpeed, 2)

    document.getElementById("hypercubesDisplay").textContent = formatTreshold(gameData.hypercubes)


    document.getElementById("hypercubeCapText").hidden = gameData.rebirthFiveCount == 0 || getTotalPerkPoints() > 0
    document.getElementById("hypercubeCapDisplay").textContent = format(getHypercubeCap(1))

    document.getElementById("perkPointsGainText").hidden = gameData.essence < 1e90        
    document.getElementById("perkPointsGainDisplay").textContent = formatTreshold(getMetaversePerkPointsGain())

    const rebirth5button = document.getElementById("metaversePerkPointsGainButtonDisplay")

    if (gameData.essence > 1e90) {
        rebirth5button.textContent = "+" + formatTreshold(getMetaversePerkPointsGain())
        rebirth5button.classList.add("color-perk-points")
        rebirth5button.classList.remove("color-hypercubes")
    }
    else if (gameData.rebirthFiveCount > 0) {
        rebirth5button.textContent = format(getHypercubeCap(1))
        rebirth5button.classList.remove("color-perk-points")
        rebirth5button.classList.add("color-hypercubes")
    }
    else {
        rebirth5button.textContent = "Unlock Hypercubes"
    }

    document.getElementById("rebirthButton5").hidden = getHypercubeCap() == Infinity && gameData.essence < 1e90

    // Embrace evil indicator
    const embraceEvilButton = document.getElementById("rebirthButton2").querySelector(".button")
    if (isNextDarkMagicSkillInReach())
        embraceEvilButton.classList.add("button-evil")
    else
        embraceEvilButton.classList.remove("button-evil")

    // Transcend for Next Milestone indicator
    const transcendButton = document.getElementById("rebirthButton3").querySelector(".button")
    if (isNextMilestoneInReach())
        transcendButton.classList.add("button-transcend")
    else
        transcendButton.classList.remove("button-transcend")

    // Hide the rebirthOneButton from the sidebar when you have `Almighty Eye` unlocked.
    document.getElementById("rebirthButton1").hidden = gameData.requirements["Almighty Eye"].isCompleted()

    // Challenges
    document.getElementById("challengeName").textContent = getFormattedTitle(gameData.active_challenge)

    if (gameData.active_challenge == "") {
        document.getElementById("challengeTitle").hidden = true
        document.getElementById("info").classList.remove("challenge")
    } else {
        document.getElementById("challengeTitle").hidden = false
        document.getElementById("info").classList.add("challenge")
        // challenge reward
        renderCurrentChallengeReward("sidebarChallengeReward")
        renderCurrentChallengeRewardValue(true)
    }

    if (getDarkMatter() == 0)
        gameData.requirements["Dark Matter info"].completed = false
}

function renderProgressBar(task, progressFill, progressBar){
    if (task.isFinished) {
        let width = 0
        if (task.level > 10000) {
            width = task.level % 100
        }
        else {
            width = 100n * task.xpBigInt / task.getMaxBigIntXp()
            if (width > 100n)
                width = 100n
        }        
        progressFill.style.width = width + "%"
    }
    else
        progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"

    if (task.isHero) {
        progressFill.classList.add("progress-fill-hero")
        progressBar.classList.add("progress-bar-hero")

        if (task == gameData.currentJob) {
            progressFill.classList.add("current-hero")
            progressFill.classList.remove("current")
        }
        else {
            progressFill.classList.remove("current")
            progressFill.classList.remove("current-hero")
        }

        progressFill.classList.remove("progress-fill")
        progressBar.classList.remove("progress-bar")
    }
    else {
        progressFill.classList.remove("progress-fill-hero")
        progressBar.classList.remove("progress-bar-hero")

        if (task == gameData.currentJob) {
            progressFill.classList.add("current")
            progressFill.classList.remove("current-hero")
        }
        else {
            progressFill.classList.remove("current")
            progressFill.classList.remove("current-hero")
        }

        progressFill.classList.add("progress-fill")
        progressBar.classList.add("progress-bar")
    }
}

function renderJobs() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (!(task instanceof Job)) continue

        const row = getRowByName(task.name)

        task.querySelector(".level", row).textContent = formatLevel(task.level)
        task.querySelector(".xpGain", row).textContent = task.getXpGainFormatted()
        task.querySelector(".xpLeft", row).textContent = task.getXpLeftFormatted()

        let tooltip = tooltips[key]

        if (!task.isHero && isHeroesUnlocked()) {
            tooltip += getHeroicRequiredTooltip(key)
        }

        const tooltipElement = task.querySelector(".tooltipText", row)
        if (tooltipElement.innerHTML != tooltip)
            tooltipElement.innerHTML = tooltip

        const maxLevel = row.getElementsByClassName("maxLevel")[0]
        maxLevel.textContent = formatLevel(task.maxLevel)
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        const progressBar = task.querySelector(".progressBar", row)
        progressBar.querySelector(".name").textContent = (task.isHero ? "Great " : "") + task.name
        const progressFill = task.querySelector(".progressFill", row)
        renderProgressBar(task, progressFill, progressBar)

        const valueElement = task.querySelector(".value", row)
        valueElement.querySelector(".income").style.display = true
        valueElement.querySelector(".effect").style.display = false

        formatCoins(task.getIncome(), valueElement.querySelector(".income"))
    }
}

function renderSkills() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]

        if (!(task instanceof Skill)) continue

        const row = getRowByName(task.name)

        task.querySelector(".level", row).textContent = formatLevel(task.level)
        task.querySelector(".xpGain", row).textContent = task.getXpGainFormatted()
        task.querySelector(".xpLeft", row).textContent = task.getXpLeftFormatted()

        let tooltip = tooltips[key]

        if (!task.isHero && isHeroesUnlocked()) {
            tooltip += getHeroicRequiredTooltip(key)
        }

        const tooltipElement = task.querySelector(".tooltipText", row)
        if (tooltipElement.innerHTML != tooltip)
            tooltipElement.innerHTML = tooltip

        const maxLevel = task.querySelector(".maxLevel", row)
        maxLevel.textContent = formatLevel(task.maxLevel)
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        const progressBar = task.querySelector(".progressBar", row)
        progressBar.querySelector(".name").textContent = (task.isHero ? "Great " : "") + task.name
        const progressFill = task.querySelector(".progressFill", row)
        renderProgressBar(task, progressFill, progressBar)

        const valueElement = task.querySelector(".value", row)
        valueElement.querySelector(".income").style.display = false
        valueElement.querySelector(".effect").style.display = true

        valueElement.querySelector(".effect").textContent = task.getEffectDescription()
    }
}

function renderShop() {
    for (const key in gameData.itemData) {
        const item = gameData.itemData[key]
        const row = getRowByName(item.name)
        const button = row.querySelector(".button")
        button.disabled = gameData.coins < item.getExpense()
        const name = button.querySelector(".name")

        if (isHeroesUnlocked())
            name.classList.add("legendary")
        else
            name.classList.remove("legendary")

        const active = row.querySelector(".active")
        const color = autoBuyEnabled
            ? itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties_Auto"] : headerRowColors["Misc_Auto"]
            : itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"]

        active.style.backgroundColor = gameData.currentMisc.includes(item) || item == gameData.currentProperty ? color : "white"
        row.querySelector(".effect").textContent = item.getEffectDescription()
        formatCoins(item.getExpense(), row.querySelector(".expense"))
    }
}

function renderChallenges() {
    document.getElementById("activeChallengeName").textContent = getFormattedTitle(gameData.active_challenge)

    if (gameData.active_challenge == "") {
        document.getElementById("exitChallengeDiv").hidden = true

        for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
            const element = document.getElementById("challengeButton" + i)
            if (element != null)
                element.classList.remove("hidden")

        }
    } else {
        document.getElementById("exitChallengeDiv").hidden = false

        for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
            const element = document.getElementById("challengeButton" + i)
            if (element != null)
                element.classList.add("hidden")
        }

        renderCurrentChallengeReward("currentChallengeReward")
    }

    //TODO (indomit)

    document.getElementById("challengeGoal1").textContent = format(getChallengeGoal("an_unhappy_life"))
    formatCoins(getChallengeGoal("rich_and_the_poor"), document.getElementById("challengeGoal2"))
    document.getElementById("challengeGoal3").textContent = format(getChallengeGoal("time_does_not_fly"))
    document.getElementById("challengeGoal4").textContent = format(getChallengeGoal("dance_with_the_devil"))
    document.getElementById("challengeGoal5").textContent = getFormattedChallengeTaskGoal("Chairman", Math.floor(getChallengeGoal("legends_never_die")))
    document.getElementById("challengeGoal6").textContent = getFormattedChallengeTaskGoal("Sigma Proioxis", Math.floor(100*(getChallengeGoal("the_darkest_time")-1)))

    document.getElementById("challengeReward1").hidden = gameData.challenges.an_unhappy_life == 0
    document.getElementById("challengeReward2").hidden = gameData.challenges.rich_and_the_poor == 0
    document.getElementById("challengeReward3").hidden = gameData.challenges.time_does_not_fly == 0
    document.getElementById("challengeReward4").hidden = gameData.challenges.dance_with_the_devil == 0
    document.getElementById("challengeReward5").hidden = gameData.challenges.legends_never_die == 0
    document.getElementById("challengeReward6").hidden = gameData.challenges.the_darkest_time == 0

    renderCurrentChallengeRewardValue()

    document.getElementById("challengeHappinessBuff").textContent = format(getChallengeBonus("an_unhappy_life"), 2)
    document.getElementById("challengeIncomeBuff").textContent = format(getChallengeBonus("rich_and_the_poor"), 2)
    document.getElementById("challengeTimewarpingBuff").textContent = format(getChallengeBonus("time_does_not_fly"), 2)
    document.getElementById("challengeEssenceGainBuff").textContent = format(getChallengeBonus("dance_with_the_devil"), 2)
    document.getElementById("challengeEvilGainBuff").textContent = format(getChallengeBonus("legends_never_die"), 2)
    document.getElementById("challengeDarkMatterGainBuff").textContent = format(getChallengeBonus("the_darkest_time"), 2)

    document.getElementById("challenge5MetaverseLifespanDebuff").hidden = gameData.rebirthFiveCount == 0
}

function renderCurrentChallengeReward(blockclass) {
    const elements = document.getElementsByClassName(blockclass)
    for (const elementReward of elements) {
        if (elementReward.classList.contains(gameData.active_challenge)) {
            elementReward.classList.remove("hidden")

            if (getChallengeBonus(gameData.active_challenge, true) > getChallengeBonus(gameData.active_challenge))
                elementReward.classList.add("reward")
            else
                elementReward.classList.remove("reward")
        }
        else
            elementReward.classList.add("hidden")
    }
}

function renderCurrentChallengeRewardValue(side_bar = false) {

    for (var i = 1; i <= Object.keys(gameData.challenges).length; i++) {
        document.getElementById((side_bar ? "sidebarC" : "c") + "urrentChallengeBuff" + i).textContent = format(getChallengeBonus(i, true), 2)
        if (side_bar)
            document.getElementById("sidebarChallengeBuff" + i).textContent = format(getChallengeBonus(i), 2)
    }    
}


function renderMilestones() {
    for (const key in milestoneData) {
        const milestone = milestoneData[key]
        const row = getRowByName(milestone.name)
        row.querySelector(".essence").textContent = format(milestone.expense)


        let desc = milestone.description
        if (milestone.getEffect != null)
            desc = "x" + format(milestone.getEffect(), 1) + " " + desc

        if (milestone.baseData.effect != null)
            desc = "x" + format(milestone.baseData.effect, 0) + " " + desc

        row.querySelector(".description").textContent = desc
    }
}

function renderDarkMatterShopButton(elemName, condition) {
    document.getElementById(elemName).disabled = !condition    
}

function renderBoostButton(elemName) {
    // render boost button to look nicier :)
    const boostButton = document.getElementById(elemName)
    if (gameData.boost_active) {
        // active
        boostButton.classList.add("perk-boost-active")
        boostButton.classList.remove("perk-boost-cooldown")
    }
    else if (gameData.boost_cooldown <= 0) {
        // ready
        boostButton.classList.remove("perk-boost-active")
        boostButton.classList.remove("perk-boost-cooldown")
    }
    else {
        // cooldown
        boostButton.classList.add("perk-boost-cooldown")
        boostButton.classList.remove("perk-boost-active")
    }

    boostButton.disabled = !canApplyBoost()
}

function renderMetaverse() {
    document.getElementById("currentHypercubesCap").hidden = getHypercubeCap() == Infinity
    document.getElementById("currentHypercubesCapValue").textContent = format(getHypercubeCap())

    for (var i = 0; i < 3; i++) {
        const elem = document.getElementById("timeTillNextHypercubePower" + (i + 1))
        const nextH = getNextPowerOfNumber(gameData.hypercubes * Math.pow(10, i))
        elem.textContent =
            format(nextH) + " Hypercubes in " + formatTime(getTimeTillNextHypercubePower(i))
        if (i>0)
            elem.hidden = nextH > getHypercubeCap() || gameData.perks_points == 0 || gameData.hypercubes < 1e20 * Math.pow(10, i)
        else
            elem.hidden = false
    }

    renderBoostButton("boostMetaButton")

    document.getElementById("hypercubesMetaDisplay").textContent = format(gameData.hypercubes)
    document.getElementById("hypercubesBonusMetaDisplay").textContent = "x" + format(getHypercubeGeneration() / 0.03)
    document.getElementById("boostCooldownMetaDisplay").textContent = getBoostCooldownString()  

    document.getElementById("reduceBoostCooldown").textContent = formatTime(getBoostCooldownSeconds())
    document.getElementById("reduceBoostCooldownCost").textContent = format(reduceBoostCooldownCost())
    document.getElementById("reduceBoostCooldownBuyButton").disabled = !canBuyReduceBoostCooldown()

    document.getElementById("boostDuration").textContent = formatTime(getBoostTimeSeconds())
    document.getElementById("boostDurationCost").textContent = format(boostDurationCost())
    document.getElementById("boostDurationBuyButton").disabled = !canBuyBoostDuration()

    document.getElementById("hypercubeGain").textContent = format(getHypercubeGeneration() * getUnpausedGameSpeed(),2)
    document.getElementById("hypercubeGainCost").textContent = format(hypercubeGainCost())
    document.getElementById("hypercubeGainBuyButton").disabled = !canBuyHypercubeGain()

    document.getElementById("evilTranGain").textContent = format(evilTranGain(), 2)
    document.getElementById("evilTranCost").textContent = format(evilTranCost())
    document.getElementById("evilTranBuyButton").disabled = !canBuyEvilTran()

    document.getElementById("essenceMultGain").textContent = format(essenceMultGain(), 2)
    document.getElementById("essenceMultCost").textContent = format(essenceMultCost())
    document.getElementById("essenceMultButton").disabled = !canBuyEssenceMult()

    document.getElementById("challengeAltarCost").textContent = format(challengeAltarCost())
    document.getElementById("challengeAltarState").textContent = gameData.metaverse.challenge_altar == 0 ? "" : "Active"
    document.getElementById("challengeAltarButton").disabled = !canBuyChallengeAltar()
    if (gameData.metaverse.challenge_altar == 0)
        document.getElementById("challengeAltarButton").classList.remove("hidden")
    else
        document.getElementById("challengeAltarButton").classList.add("hidden")

    document.getElementById("darkMatterMultGain").textContent = format(darkMatterMultGain(), 2)
    document.getElementById("darkMatterMultCost").textContent = format(darkMatterMultCost())
    document.getElementById("darkMaterMultButton").disabled = !canBuyDarkMatterMult()

    // Perks
    renderPerks()
}

function renderPerks() {
    document.getElementById("perkPointDisplay").textContent = formatTreshold(gameData.perks_points)
    document.getElementById("totalPerkPointDisplay").textContent = formatTreshold(getTotalPerkPoints())
    // Info

    if (gameData.requirements["The End is near"].isCompleted()) {
        document.getElementById("mppInfo").hidden = true
        document.getElementById("mppInfo2").hidden = false
        document.getElementById("mppDMBuff").textContent = format(getUnspentPerksDarkmatterGainBuff())
    }
    else {
        document.getElementById("mppInfo").hidden = false
        document.getElementById("mppInfo2").hidden = true
    }



    // PerkButtons
    const total_mpp = getTotalPerkPoints()
    let hide_next = false
    let index = 0

    for (const perkName of getSortedPerks()) {
        const key = perkName[0]
        const button = document.getElementById("id" + key)

        if (hide_next)
            button.classList.add("hidden")
        else {
            button.classList.remove("hidden")

            if (gameData.perks[key] == 0)
                button.classList.remove("active-perk")
            else
                button.classList.add("active-perk")

            const perk_cost = getPerkCost(key)

            if (total_mpp >= perk_cost) {
                button.getElementsByClassName("perkName")[0].textContent = getFormattedTitle(key)
                button.classList.remove("perk-locked")
            }
            else {
                button.getElementsByClassName("perkName")[0].textContent = "LOCKED"
                button.classList.add("perk-locked")
                if (index % 2 == 1)
                    hide_next = true
            }
        }
        index++
    }
}

function renderDarkMatter() {
    // Display currency
    document.getElementById("darkMatterShopDisplay").textContent = format(gameData.dark_matter)
    document.getElementById("darkMatterSkillsDisplay").textContent = gameData.settings.layout == 0 ? "" : format(gameData.dark_matter)    
    document.getElementById("darkOrbsShopDisplay").textContent = formatTreshold(gameData.dark_orbs)

    // Dark Matter Shop
    document.getElementById("darkOrbGeneratorCost").textContent = format(getDarkOrbGeneratorCost())
    document.getElementById("darkOrbGenerator").textContent = format(getDarkOrbGeneration())

    document.getElementById("aDealWithTheChairmanCost").textContent = format(getADealWithTheChairmanCost())
    document.getElementById("aDealWithTheChairmanEffect").textContent = format(getTaaAndMagicXpGain())

    document.getElementById("aGiftFromGodEffect").textContent = format(getAGiftFromGodEssenceGain())
    document.getElementById("aGiftFromGodCost").textContent = format(getAGiftFromGodCost())

    document.getElementById("lifeCoachEffect").textContent = format(getLifeCoachIncomeGain())
    document.getElementById("lifeCoachCost").textContent = format(getLifeCoachCost())

    document.getElementById("gottaBeFastEffect").textContent = format(getGottaBeFastGain(), 2)
    document.getElementById("gottaBeFastCost").textContent = format(getGottaBeFastCost())

    if (gameData.dark_matter_shop.a_miracle)
        document.getElementById("aMiracleBuyButton").classList.add("hidden")

    if (getDarkOrbGeneration() != Infinity)
        document.getElementById("darkOrbGeneratorBuyButton").classList.remove("hidden")
    else
        document.getElementById("darkOrbGeneratorBuyButton").classList.add("hidden")

    // enable/disable buttons

    renderDarkMatterShopButton("darkOrbGeneratorBuyButton", canBuyDarkOrbGenerator())
    renderDarkMatterShopButton("aMiracleBuyButton", canBuyAMiracle())
    renderDarkMatterShopButton("aDealWithTheChairmanBuyButton", canBuyADealWithTheChairman())
    renderDarkMatterShopButton("aGiftFromGodBuyButton", canBuyAGiftFromGod())
    renderDarkMatterShopButton("gottaBeFastBuyButton", canBuyGottaBeFast())
    renderDarkMatterShopButton("lifeCoachBuyButton", canBuyLifeCoach())

    // Dark Matter Skill tree
    renderSkillTreeButton(document.getElementById("speedIsLife1"), gameData.dark_matter_shop.speed_is_life != 0, [1, 3].includes(gameData.dark_matter_shop.speed_is_life), gameData.dark_matter >= 100)
    renderSkillTreeButton(document.getElementById("speedIsLife2"), gameData.dark_matter_shop.speed_is_life != 0, [2, 3].includes(gameData.dark_matter_shop.speed_is_life), gameData.dark_matter >= 100)

    renderSkillTreeButton(document.getElementById("yourGreatestDebt1"), gameData.dark_matter_shop.your_greatest_debt != 0, [1, 3].includes(gameData.dark_matter_shop.your_greatest_debt), gameData.dark_matter >= 1000)
    renderSkillTreeButton(document.getElementById("yourGreatestDebt2"), gameData.dark_matter_shop.your_greatest_debt != 0, [2, 3].includes(gameData.dark_matter_shop.your_greatest_debt), gameData.dark_matter >= 1000)

    renderSkillTreeButton(document.getElementById("essenceCollector1"), gameData.dark_matter_shop.essence_collector != 0, [1, 3].includes(gameData.dark_matter_shop.essence_collector), gameData.dark_matter >= 10000)
    renderSkillTreeButton(document.getElementById("essenceCollector2"), gameData.dark_matter_shop.essence_collector != 0, [2, 3].includes(gameData.dark_matter_shop.essence_collector), gameData.dark_matter >= 10000)

    renderSkillTreeButton(document.getElementById("explosionOfTheUniverse1"), gameData.dark_matter_shop.explosion_of_the_universe != 0, [1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe), gameData.dark_matter >= 100000)
    renderSkillTreeButton(document.getElementById("explosionOfTheUniverse2"), gameData.dark_matter_shop.explosion_of_the_universe != 0, [2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe), gameData.dark_matter >= 100000)

    renderSkillTreeButton(document.getElementById("multiverseExplorer1"), gameData.dark_matter_shop.multiverse_explorer != 0, [1, 3].includes(gameData.dark_matter_shop.multiverse_explorer), gameData.dark_matter >= 100000000)
    renderSkillTreeButton(document.getElementById("multiverseExplorer2"), gameData.dark_matter_shop.multiverse_explorer != 0, [2, 3].includes(gameData.dark_matter_shop.multiverse_explorer), gameData.dark_matter >= 100000000)

    const effects = document.getElementsByClassName("negative-effect")
    for (const effect of effects) {
        effect.hidden = (gameData.perks.positive_dark_mater_skills == 1)
    }

    // turn off OR
    const ors = document.getElementsByClassName("darkMatterSkillOR")
    for (const elem of ors) {
        elem.hidden = (gameData.perks.both_dark_mater_skills == 1)
    }
}

function renderSettings() {
    // Stats
    const date = new Date(gameData.stats.startDate)
    document.getElementById("startDateDisplay").textContent = date.toLocaleDateString()

    const currentDate = new Date()
    document.getElementById("playedDaysDisplay").textContent = format((currentDate.getTime() - date.getTime()) / (1000 * 3600 * 24), 2)
    document.getElementById("playedRealTimeDisplay").textContent = formatTime(gameData.realtimeRun)

    document.getElementById("playedGameTimeDisplay").textContent = format(gameData.totalDays, 2)

    if (gameData.rebirthOneCount > 0)
        document.getElementById("statsRebirth1").classList.remove("hidden")
    else
        document.getElementById("statsRebirth1").classList.add("hidden")

    if (gameData.rebirthTwoCount > 0)
        document.getElementById("statsRebirth2").classList.remove("hidden")
    else
        document.getElementById("statsRebirth2").classList.add("hidden")

    if (gameData.rebirthThreeCount > 0)
        document.getElementById("statsRebirth3").classList.remove("hidden")
    else
        document.getElementById("statsRebirth3").classList.add("hidden")

    if (gameData.rebirthFourCount > 0)
        document.getElementById("statsRebirth4").classList.remove("hidden")
    else
        document.getElementById("statsRebirth4").classList.add("hidden")

    if (gameData.rebirthFiveCount > 0)
        document.getElementById("statsRebirth5").classList.remove("hidden")
    else
        document.getElementById("statsRebirth5").classList.add("hidden")

    document.getElementById("rebirthOneCountDisplay").textContent = gameData.rebirthOneCount
    document.getElementById("rebirthTwoCountDisplay").textContent = gameData.rebirthTwoCount
    document.getElementById("rebirthThreeCountDisplay").textContent = gameData.rebirthThreeCount
    document.getElementById("rebirthFourCountDisplay").textContent = gameData.rebirthFourCount
    document.getElementById("rebirthFiveCountDisplay").textContent = gameData.rebirthFiveCount

    document.getElementById("rebirthOneTimeDisplay").textContent = formatTime(gameData.rebirthOneTime, true)
    document.getElementById("rebirthTwoTimeDisplay").textContent = formatTime(gameData.rebirthTwoTime, true)
    document.getElementById("rebirthThreeTimeDisplay").textContent = formatTime(gameData.rebirthThreeTime, true)
    document.getElementById("rebirthFourTimeDisplay").textContent = formatTime(gameData.rebirthFourTime, true)
    document.getElementById("rebirthFiveTimeDisplay").textContent = formatTime(gameData.rebirthFiveTime, true)

    document.getElementById("rebirthOneFastestDisplay").textContent = formatTime(gameData.stats.fastest1, true)
    document.getElementById("rebirthTwoFastestDisplay").textContent = formatTime(gameData.stats.fastest2, true)
    document.getElementById("rebirthThreeFastestDisplay").textContent = formatTime(gameData.stats.fastest3, true)
    document.getElementById("rebirthFourFastestDisplay").textContent = formatTime(gameData.stats.fastest4, true)
    document.getElementById("rebirthFiveFastestDisplay").textContent = formatTime(gameData.stats.fastest5, true)

    // Gain Stats
    document.getElementById("evilPerSecondDisplay").textContent = format(gameData.stats.EvilPerSecond, 3)
    document.getElementById("maxEvilPerSecondDisplay").textContent = format(gameData.stats.maxEvilPerSecond, 3)
    document.getElementById("maxEvilPerSecondRtDisplay").textContent = formatTime(gameData.stats.maxEvilPerSecondRt)

    document.getElementById("essencePerSecondDisplay").textContent = format(gameData.stats.EssencePerSecond, 3)
    document.getElementById("maxEssencePerSecondDisplay").textContent = format(gameData.stats.maxEssencePerSecond, 3)
    document.getElementById("maxEssencePerSecondRtDisplay").textContent = formatTime(gameData.stats.maxEssencePerSecondRt)

    // Challenge Stats
    document.getElementById("challengeStat1").hidden = gameData.challenges.an_unhappy_life == 0
    document.getElementById("challengeStat2").hidden = gameData.challenges.rich_and_the_poor == 0
    document.getElementById("challengeStat3").hidden = gameData.challenges.time_does_not_fly == 0
    document.getElementById("challengeStat4").hidden = gameData.challenges.dance_with_the_devil == 0
    document.getElementById("challengeStat5").hidden = gameData.challenges.legends_never_die == 0
    document.getElementById("challengeStat6").hidden = gameData.challenges.the_darkest_time == 0

    document.getElementById("challengeHappinessBuffDisplay").textContent = format(getChallengeBonus("an_unhappy_life"), 2)
    document.getElementById("challengeIncomeBuffDisplay").textContent = format(getChallengeBonus("rich_and_the_poor"), 2)
    document.getElementById("challengeTimewarpingBuffDisplay").textContent = format(getChallengeBonus("time_does_not_fly"), 2)
    document.getElementById("challengeEssenceGainBuffDisplay").textContent = format(getChallengeBonus("dance_with_the_devil"), 2)
    document.getElementById("challengeEvilGainBuffDisplay").textContent = format(getChallengeBonus("legends_never_die"), 2)
    document.getElementById("challengeDarkMaterGainBuffDisplay").textContent = format(getChallengeBonus("the_darkest_time"), 2)
}

function renderRequirements() {
    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        for (const element of requirement.elements) {
            if (requirement.isCompleted()) {
                element.classList.remove("hidden")
            } else {
                element.classList.add("hidden")
            }
        }
    }
}

function renderHeaderRows(categories) {
    for (const categoryName in categories) {
        const className = removeSpaces(categoryName)
        const headerRow = document.getElementsByClassName(className)[0]
        const maxLevelElement = headerRow.querySelector(".maxLevel")
        gameData.rebirthOneCount > 0 ? maxLevelElement.classList.remove("hidden") : maxLevelElement.classList.add("hidden")
    }
}

function createRequiredRow(categoryName) {
    const requiredRow = document.querySelector(".requiredRowTemplate").content.firstElementChild.cloneNode(true)
    requiredRow.classList.add("requiredRow")
    requiredRow.classList.add(removeSpaces(categoryName))
    requiredRow.id = categoryName
    return requiredRow
}

function createHeaderRow(templates, categoryType, categoryName) {
    const headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    const categoryElement = headerRow.getElementsByClassName("category")[0]

    if (categoryType == itemCategories) {
        categoryElement.getElementsByClassName("name")[0].textContent = categoryName
    } else {
        categoryElement.textContent = categoryName
    }


    if (categoryType == jobCategories || categoryType == skillCategories) {
        headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? "Income/day" : "Effect"
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.style.color = (gameData.settings.theme == 2) ? headerRowTextColors[categoryName] : "#ffffff"
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")

    return headerRow
}

function createRow(templates, name, categoryName, categoryType) {
    const row = templates.row.content.firstElementChild.cloneNode(true)
    row.getElementsByClassName("name")[0].textContent = name
    row.getElementsByClassName("tooltipText")[0].textContent = tooltips[name]
    row.id = "row" + removeSpaces(removeStrangeCharacters(name))

    if (categoryType == itemCategories) {
        row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? () => { setCurrentProperty(name) } : () => { setMisc(name) }
    }

    return row
}

function createAllRows(categoryType, tableId) {
    const templates = {
        headerRow: document.getElementsByClassName(
            categoryType == itemCategories
                ? "headerRowItemTemplate"
                : (categoryType == milestoneCategories ? "headerRowMilestoneTemplate" : "headerRowTaskTemplate")

        )[0],
        row: document.getElementsByClassName(
            categoryType == itemCategories
                ? "rowItemTemplate"
                : (categoryType == milestoneCategories ? "rowMilestoneTemplate": "rowTaskTemplate"))[0],
    }

    const table = document.getElementById(tableId)

    for (const categoryName in categoryType) {
        const headerRow = createHeaderRow(templates, categoryType, categoryName)
        table.appendChild(headerRow)

        const category = categoryType[categoryName]
        category.forEach(function(name) {
            const row = createRow(templates, name, categoryName, categoryType)
            table.appendChild(row)
        })

        const requiredRow = createRequiredRow(categoryName)
        table.append(requiredRow)
    }
}

function updateRequiredRows(data, categoryType) {
    const requiredRows = document.getElementsByClassName("requiredRow")
    for (const requiredRow of requiredRows) {
        let nextEntity = null
        const category = categoryType[requiredRow.id]
        if (category == null) {continue}
        for (let i = 0; i < category.length; i++) {
            const entityName = category[i]
            if (i >= category.length - 1) break

            const requirements = gameData.requirements[entityName]
            if (requirements && i == 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            const nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            const nextEntityName = category[nextIndex]
            nextEntityRequirements = gameData.requirements[nextEntityName]

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask")
        } else {
            requiredRow.classList.remove("hiddenTask")
            const requirementObject = gameData.requirements[nextEntity.name]            
            const requirements = requirementObject.requirements

            const coinElement = requiredRow.querySelector(".coins")
            const levelElement = requiredRow.querySelector(".levels")
            const evilElement = requiredRow.querySelector(".evil")
            const essenceElement = requiredRow.querySelector(".essence")
            const darkMatterElement = requiredRow.querySelector(".darkMatter")
            const hypercubeElement = requiredRow.querySelector(".hypercube")
            const effectElement = requiredRow.querySelector(".effect")
            const effectValueElement = requiredRow.querySelector(".effectValue")

            coinElement.classList.add("hiddenTask")
            levelElement.classList.add("hiddenTask")
            evilElement.classList.add("hiddenTask")
            essenceElement.classList.add("hiddenTask")
            darkMatterElement.classList.add("hiddenTask")
            hypercubeElement.classList.add("hiddenTask")
            effectElement.classList.add("hiddenTask")

            let finalText = ""
            let effectText = ""
            if (data == gameData.taskData) {
                const task = gameData.taskData[nextEntity.name]
                effectElement.classList.remove("hiddenTask")
                effectValueElement.textContent = task.unlocked ? (task.baseData.description != null ? task.baseData.description : "Income") : "Unknown"

                if (requirementObject instanceof EvilRequirement) {
                    evilElement.classList.remove("hiddenTask")                    
                    evilElement.textContent = format(requirements[0].requirement) + " evil"                   
                } else if (requirementObject instanceof EssenceRequirement) {
                    essenceElement.classList.remove("hiddenTask")
                    essenceElement.textContent = format(requirements[0].requirement) + " essence"
                } else if (requirementObject instanceof DarkMatterRequirement) {
                    darkMatterElement.classList.remove("hiddenTask")
                    darkMatterElement.textContent = format(requirements[0].requirement) + " Dark Matter"
                } else if (requirementObject instanceof MetaverseRequirement) {

                } else if (requirementObject instanceof HypercubeRequirement) {
                    hypercubeElement.classList.remove("hiddenTask")
                    hypercubeElement.textContent = format(requirements[0].requirement) + " hypercubes"
                } else if (requirementObject instanceof AgeRequirement) {
                    essenceElement.classList.remove("hiddenTask")
                    essenceElement.textContent = "Idade " + format(requirements[0].requirement)
                }
                else {
                    levelElement.classList.remove("hiddenTask")
                    for (const requirement of requirements) {
                        const task = gameData.taskData[requirement.task]
                        if (task.level >= requirement.requirement) continue
                        finalText += " " + requirement.task + " " + formatLevel(task.level) + "/" + formatLevel(requirement.requirement) + ","
                    }
                    finalText = finalText.substring(0, finalText.length - 1)
                    levelElement.textContent = finalText
                }
            }
            else if (data == gameData.itemData) {
                coinElement.classList.remove("hiddenTask")
                formatCoins(requirements[0].requirement, coinElement)

                const item = gameData.itemData[nextEntity.name]
                
                effectElement.classList.remove("hiddenTask")
                effectValueElement.textContent = item.unlocked ? (item.baseData.description != null ? item.baseData.description : "Happiness") : "Unknown"
            }
            else if (data == milestoneData) {
                essenceElement.classList.remove("hiddenTask")
                essenceElement.textContent = format(requirements[0].requirement) + " essence"

                const milestone = milestoneData[nextEntity.name]
                if (milestone.baseData.description != null) {
                    effectElement.classList.remove("hiddenTask")
                    effectValueElement.textContent = (gameData.stats.maxEssenceReached > milestone.expense) ? milestone.baseData.description : "Unknown"
                }
            }
        }
    }
}

function getHeroicRequiredTooltip(task) {
    const requirementObject = gameData.requirements[task]
    const requirements = requirementObject.requirements
    const prev = getPreviousTaskInCategory(task)

    let tooltip = "<br> <span style=\"color: red\">Required</span>: <span style=\"color: orange\">"
    let reqlist = ""
    let prevReq = ""

    if (prev != "") {
        var prevTask = gameData.taskData[prev]
        var prevlvl = (prevTask.isHero ? prevTask.level : 0)
        if (prevlvl < 20)
            prevReq = "Great " + prev + " " + prevlvl + "/20<br>"
    }

    if (requirementObject instanceof EvilRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " evil<br>"
    } else if (requirementObject instanceof EssenceRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " essence<br>"
    } else if (requirementObject instanceof AgeRequirement) {
        reqlist += "Age " + format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + "<br>"
    } else if (requirementObject instanceof DarkMatterRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " Dark Matter<br>"
    } else {
        for (const requirement of requirements) {
            const task_check = gameData.taskData[requirement.task]

            const reqvalue = (requirement.herequirement == null ? requirement.requirement : requirement.herequirement)

            if (task_check.isHero && task_check.level >= reqvalue) continue
            if (prev != "" && task_check.name == prevTask.name) {
                if (reqvalue <= 20)
                    continue
                else
                    prevReq = " Great " + requirement.task + " " + (task_check.isHero ? task_check.level : 0) + "/" + reqvalue + "<br>"
            } else {
                reqlist += " Great " + requirement.task + " " + (task_check.isHero ? task_check.level : 0) + "/" + reqvalue + "<br>"
            }
        }
    }

    reqlist += prevReq
    reqlist = reqlist.substring(0, reqlist.length - 4)
    tooltip += reqlist + "</span>"
    return tooltip
}

function setStickySidebar(sticky) {
    gameData.settings.stickySidebar = sticky;
    settingsStickySidebar.checked = sticky;
    info.style.position = sticky ? 'sticky' : 'initial';
}

function selectElementInGroup(group, index) {
    const elements = document.getElementsByClassName(group)
    for (const el of elements) {
        el.classList.remove("selected")
    }
    elements[index].classList.add("selected")
}

function setLayout(id) {
    gameData.settings.layout = id
    if (id == 0) {
        document.getElementById("skillsTabButton").classList.add("hidden")
        document.getElementById("shopTabButton").classList.add("hidden")

        document.getElementById("skills").classList.add("hidden")
        document.getElementById("shop").classList.add("hidden")

        document.getElementById("tabcolumn").classList.add("plain-tab-column")
        document.getElementById("tabcolumn").classList.remove("tabs-tab-column")

        document.getElementById("maincolumn").classList.add("plain-main-column")
        document.getElementById("maincolumn").classList.remove("tabs-main-column")

        document.getElementById("jobs").appendChild(document.getElementById("skillPage"))
        document.getElementById("jobs").appendChild(document.getElementById("itemPage"))
    } else {
        document.getElementById("skillsTabButton").classList.remove("hidden")
        document.getElementById("shopTabButton").classList.remove("hidden")

        document.getElementById("skills").classList.remove("hidden")
        document.getElementById("shop").classList.remove("hidden")

        document.getElementById("tabcolumn").classList.add("tabs-tab-column")
        document.getElementById("tabcolumn").classList.remove("plain-tab-column")

        document.getElementById("maincolumn").classList.add("tabs-main-column")
        document.getElementById("maincolumn").classList.remove("plain-main-column")

        document.getElementById("skills").appendChild(document.getElementById("skillPage"))
        document.getElementById("shop").appendChild(document.getElementById("itemPage"))
    }

    // dark matter layout
    if (id == 0) {
        document.getElementById("tabcolumnDarkMater").classList.add("hidden")
        document.getElementById("shopTab").appendChild(document.getElementById("skillTreePage"))
        setTabDarkMatter("shopTab")

        document.getElementById("maincolumnDarkMatter").classList.remove("settings-main-column")
        document.getElementById("skillTreePageDarkMaterTitle").textContent = "Dark Matter Skills "
    }
    else {
        document.getElementById("tabcolumnDarkMater").classList.remove("hidden")
        document.getElementById("skillTreeTab").appendChild(document.getElementById("skillTreePage"))

        document.getElementById("maincolumnDarkMatter").classList.add("settings-main-column")
        document.getElementById("skillTreePageDarkMaterTitle").textContent = "Dark Matter: "

    }

    // metaverse layout

    if (id == 0) {
        document.getElementById("tabcolumnMetaverse").classList.add("hidden")
        document.getElementById("metaverseTab1").appendChild(document.getElementById("metaversePage2"))
        setTabMetaverse("metaverseTab1")

        document.getElementById("maincolumnMetaverse").classList.remove("settings-main-column")
    }
    else {
        document.getElementById("tabcolumnMetaverse").classList.remove("hidden")
        document.getElementById("metaverseTab2").appendChild(document.getElementById("metaversePage2"))

        document.getElementById("maincolumnMetaverse").classList.add("settings-main-column")     
    }

    selectElementInGroup("Layout", id == 0 ? 1 : 0)
}

function setFontSize(id) {
    const fontSizes = {
        0: "xx-small",
        1: "x-small",
        2: "small",
        3: "medium",
        4: "large",
        5: "x-large",
        6: "xx-large",
        7: "xxx-large",
    }

    if (id < 0) id = 0
    if (id > 7) id = 7

    gameData.settings.fontSize = id
    document.getElementById("body").style.fontSize = fontSizes[id]
}

function renderSkillTreeButton(element, categoryBought, elementBought, canBuy) {
    if (gameData.perks.both_dark_mater_skills == 0) {

        element.disabled = categoryBought | !canBuy

        if (categoryBought) {
            if (elementBought) {
                element.textContent = "Accepted"
                element.classList.add("w3-green")
                element.classList.remove("w3-red")
            } else {
                element.textContent = "Rejected"
                element.classList.add("w3-red")
                element.classList.remove("w3-green")
            }
        }
        else {
            element.textContent = "Buy"
            element.classList.remove("w3-green")
            element.classList.remove("w3-red")
        }
    }
    else {
        element.disabled = elementBought

        if (elementBought) {
            element.textContent = "Accepted"
            element.classList.add("w3-green")
            element.classList.remove("w3-red")
        } else {
            element.textContent = "Buy"
            element.classList.remove("w3-green")
            element.classList.remove("w3-red")
        }
    }
}

function setSignDisplay() {
    const signDisplay = document.getElementById("signDisplay")

    if (getNet() > -1 && getNet() < 1) {
        signDisplay.textContent = ""
        signDisplay.style.color = "gray"
    } else if (getIncome() > getExpense()) {
        signDisplay.textContent = "+"
        signDisplay.style.color = "green"
    } else {
        signDisplay.textContent = "-"
        signDisplay.style.color = "red"
    }
}

function getQuerySelector(taskName) {    
    return "#row" + removeSpaces(removeStrangeCharacters(taskName))
}

function getRowByName(name) {
    return document.getElementById("row" + removeSpaces(removeStrangeCharacters(name)))
}

const Tab = Object.freeze({
    JOBS: "jobs",
    SKILLS: "skills",
    SHOP: "shop",
    CHALLENGES: "challenges",
    MILESTONES: "milestones",
    REBIRTH: "rebirth",
    DARK_MATTER: "darkMatter",
    METAVERSE: "metaverse",
    SETTINGS: "settings"
})

/**
 * @param {Tab} selectedTab
 */
function setTab(selectedTab) {
    const tabElement = document.getElementById(selectedTab)

    if (tabElement == null) {
        setTab(Tab.JOBS)
        return
    }

    gameData.settings.selectedTab = selectedTab

    // Update the UI when switching tabs to prevent flikering.
    updateUI()

    const element = document.getElementById(selectedTab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    tabs.forEach(function(tab) {
        tab.style.display = "none"
    })
    tabElement.style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButton")
    for (tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setTabSettings(tab) {
    const element = document.getElementById(tab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tabSettings"))
    tabs.forEach(function (tab) {
        tab.style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButtonSettings")
    for (const tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setTabDarkMatter(tab) {
    const element = document.getElementById(tab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tabDarkMatter"))
    tabs.forEach(function (tab) {
        tab.style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButtonDarkMatter")
    for (const tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setTabMetaverse(tab) {
    const element = document.getElementById(tab + "TabButton")

    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tabMetaverse"))
    tabs.forEach(function (tab) {
        tab.style.display = "none"
    })
    document.getElementById(tab).style.display = "flex"

    const tabButtons = document.getElementsByClassName("tabButtonMetaverse")
    for (const tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function getSortedPerks() {
    let sortable = [];
    for (var perkname in perks_cost) {
        sortable.push([perkname, perks_cost[perkname]]);
    }

    sortable.sort(function (a, b) {
        return a[1] - b[1];
    });

    return sortable
}

function createPerks(perkLayoutName) {
    const buttonTemplate = document.getElementsByClassName("perkItem")
    const perksLayout = document.getElementById(perkLayoutName)
    for (const perkName of getSortedPerks()) {
        const perk = createPerk(buttonTemplate, perkName[0])
        perksLayout.appendChild(perk)
    }
}

function createPerk(template, name) {
    const button = template[0].content.firstElementChild.cloneNode(true)
    button.getElementsByClassName("perkName")[0].textContent = getFormattedTitle(name)
    button.getElementsByClassName("perkCost")[0].textContent = getPerkCost(name)
    button.id = "id" + removeSpaces(removeStrangeCharacters(name))
    button.onclick = () => { buyPerk(name) }    

    return button
}

// Keyboard shortcuts + Loadouts ( courtesy of Pseiko )
function changeTab(direction){
    const tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    const tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"))

    let currentTab = 0
    for (const i in tabs) {
        if (!tabs[i].style.display.includes("none") && !tabs[i].classList.contains("hidden"))
             currentTab = i*1
    }
    let targetTab = currentTab + direction
    if (targetTab < 0) {
        setTab(Tab.SETTINGS)
        return
    }
    targetTab = Math.max(0,targetTab)
    if (targetTab > tabs.length - 1) targetTab = 0
    while (tabButtons[targetTab].style.display.includes("none") || tabButtons[targetTab].classList.contains("hidden")){
        targetTab = targetTab + direction
        targetTab = Math.max(0, targetTab)
        if (targetTab > tabs.length-1) targetTab = 0
    }

    setTab(tabs[targetTab].id)
}

function toggleChallenge(challengeName) {
    if (!gameData.requirements["Challenges"].isCompleted())
        return

    if (gameData.active_challenge == "") {
        if (gameData.requirements["Challenge_" + challengeName].isCompleted())
            enterChallenge(challengeName)
    }
    else if (gameData.active_challenge == challengeName)
        exitChallenge()
    else {
        exitChallenge()
        if (gameData.requirements["Challenge_" + challengeName].isCompleted())
            enterChallenge(challengeName)
    }
}

window.addEventListener('keydown', function (e) {
    if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
        if (e.key == " " && !e.repeat) {
            togglePause()
            if (e.target == document.body) {
                e.preventDefault();
            }
        }
        if (e.key == "ArrowRight") changeTab(1)
        if (e.key == "ArrowLeft") changeTab(-1)

        // The "dangerous" keybinds can be disabled.
        if (!gameData.settings.enableKeybinds)
            return

        if (e.key == "q") {
            if (gameData.requirements["Rebirth button 1"].isCompleted())
                rebirthOne()
        }

        if (e.key == "e") {
            if (gameData.requirements["Rebirth button 2"].isCompleted())
                rebirthTwo()
        }

        if (e.key == "t") {
            if (gameData.requirements["Rebirth button 3"].isCompleted())
                rebirthThree()
        }

        if (e.key == "u") {
            if (gameData.requirements["Rebirth button 4"].isCompleted())
                rebirthFour()
        }

        if (e.key == "g") {
            if (gameData.requirements["Rebirth button 5"].isCompleted())
                rebirthFive()
        }

        switch (e.key) {
            case "1": toggleChallenge("an_unhappy_life"); break
            case "2": toggleChallenge("rich_and_the_poor"); break
            case "3": toggleChallenge("time_does_not_fly"); break
            case "4": toggleChallenge("dance_with_the_devil"); break
            case "5": toggleChallenge("legends_never_die"); break
            case "6": toggleChallenge("the_darkest_time"); break
        }
    }
});
