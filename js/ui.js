const uiTextCache = new Map();

function safeUpdateTextElement(element, text, id) {
    if (uiTextCache.get(id) === text)
        return

    element.textContent = text
    uiTextCache.set(id, text)
}

function safeUpdateText(id, text) {
    if (uiTextCache.get(id) === text)
        return

    const element = getElementCachedById(id)

    element.textContent = text
    uiTextCache.set(id, text)
}

function initializeUI() {
    /*
        Initializes the UI. Adds all html elements required for rendering.
    */

    createAllRows(jobCategories, "jobTable", "job")
    createAllRows(skillCategories, "skillTable", "skill")
    createAllRows(itemCategories, "itemTable", "item")
    createAllRows(milestoneCategories, "milestoneTable", "milestone")

    createPerks("perksLayout")

    setLayout(peekSettingFromSave("layout"))
    setFontSize(peekSettingFromSave("fontSize"))
    setNotation(peekSettingFromSave("numberNotation"))
    setCurrency(peekSettingFromSave("currencyNotation"))
    setStickySidebar(peekSettingFromSave("stickySidebar"))
    setRequireShiftForTooltip(peekSettingFromSave("requireShiftForTooltip"))
    setEPSidebar(peekSettingFromSave("EPSidebar"))

    setTheme(peekSettingFromSave("theme"))
    setEnableKeybinds(peekSettingFromSave("enableKeybinds") ? 0 : 1)

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        requirement.queryElements()
    }

    initTooltip()
}

function updateUI() {
    if (in_offline_progress)
        return

    /*
        NOTE: To ensure that performance does not decrease,
        please only call the render function when the user can actually see the content.
        If they can always see the content put the function call at the top of this function.

        NOTE2: Do NOT render anything to the screen outside of this function.
    */

    // Always render all the requirements.
    renderRequirements()

    // Always render the sidebar.
    renderSideBar()

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

    if (currentTab == Tab.EVILPERKS) {
        renderEvilPerks()
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

    if (currentTab == Tab.REBIRTH)
        renderRebirth()

    renderTooltip()

    renderGameOver()
}

function renderTooltip() {
    if (activeTooltipData && activeTooltipType) {
        const tooltipEl = getElementCachedById("globalTooltip");
        if (tooltipEl && tooltipEl.classList.contains("visible"))
            renderTooltipContent(tooltipEl, activeTooltipData, activeTooltipType);
    }
}

function renderSideBar() {
    safeUpdateText("ageDisplay", formatAge(gameData.days))
    safeUpdateText("lifespanDisplay", formatWhole(daysToYears(getLifespan())))
    safeUpdateText("realtimeDisplay", formatTime(gameData.realtime))
    safeUpdateText("boostCooldownDisplay", getBoostCooldownString())
    safeUpdateText("pauseButton", gameData.paused ? "Play" : "Pause")
    getElementCachedById("boostPanel").hidden = gameData.rebirthFiveCount == 0
    renderBoostButton("boostButton")
    safeFormatCoins("coinDisplay", gameData.coins)
    setSignDisplay()
    safeFormatCoins("netDisplay", getNetAbs())
    safeFormatCoins("incomeDisplay", getIncome())
    safeFormatCoins("expenseDisplay", getExpense())
    safeUpdateText("happinessDisplay", format(getHappiness()))
    safeUpdateText("evilDisplay", format(gameData.evil))
    safeUpdateText("evilGainDisplay", format(getEvilGain()))
    safeUpdateText("evilGainButtonDisplay", "+" + format(getEvilGain()))
    safeUpdateText("essenceDisplay", format(gameData.essence))
    safeUpdateText("essenceGainDisplay", format(getEssenceGain()))
    safeUpdateText("essenceGainButtonDisplay", "+" + format(getEssenceGain()))
    safeUpdateText("darkMatterDisplay", formatWhole(gameData.dark_matter))
    safeUpdateText("darkMatterGainDisplay", format(getDarkMatterGain()))
    safeUpdateText("darkMatterGainButtonDisplay", "+" + format(getDarkMatterGain()))
    safeUpdateText("darkOrbsDisplay", formatTreshold(gameData.dark_orbs))
    const dealWithChairmanCost = getADealWithTheChairmanCost()
    const giftFromGodCost = getAGiftFromGodCost()
    const lifeCoachCost = getLifeCoachCost()
    const gottaBeFastCost = getGottaBeFastCost()
    const nextCost = Math.min(dealWithChairmanCost, giftFromGodCost, lifeCoachCost, gottaBeFastCost)

    const currentProgress = getDynamicProgress(gameData.dark_orbs, nextCost)
    renderProgessResource(
        getElementCachedById("darkOrbsInfo"),
        currentProgress,
        currentProgress,
        'color-dark-matter',
        nextCost
    )
    getElementCachedById("timeWarping").hidden = (getUnpausedGameSpeed() / baseGameSpeed) <= 1
    safeUpdateText("timeWarpingDisplay", "x" + format(getUnpausedGameSpeed() / baseGameSpeed, 2))

    safeUpdateText("hypercubesDisplay", formatTreshold(gameData.hypercubes))

    getElementCachedById("hypercubeCapText").hidden = gameData.rebirthFiveCount == 0 || getTotalPerkPoints() > 0
    safeUpdateText("hypercubeCapDisplay", format(getHypercubeCap(1)))

    getElementCachedById("perkPointsGainText").hidden = gameData.essence < 1e90
    safeUpdateText("perkPointsGainDisplay", formatTreshold(getMetaversePerkPointsGain()))

    const rebirth5button = getElementCachedById("metaversePerkPointsGainButtonDisplay")

    if (gameData.essence > 1e90) {
        safeUpdateText("metaversePerkPointsGainButtonDisplay", "+" + formatTreshold(getMetaversePerkPointsGain()))
        rebirth5button.classList.add("color-perk-points")
        rebirth5button.classList.remove("color-hypercubes")
    }
    else if (gameData.rebirthFiveCount > 0) {
        safeUpdateText("metaversePerkPointsGainButtonDisplay", format(getHypercubeCap(1)))
        rebirth5button.classList.remove("color-perk-points")
        rebirth5button.classList.add("color-hypercubes")
    }
    else {
        safeUpdateText("metaversePerkPointsGainButtonDisplay", "Unlock Hypercubes")
    }

    getElementCachedById("rebirthButton5").hidden = getHypercubeCap() == Infinity && gameData.essence < 1e90

    // Embrace evil indicator
    const embraceEvilButton = getElementCachedById("rebirthButton2").querySelector(".button")
    const { inReach: inReachEvil, requirement: requiredEvil } = getNextDarkMagicSkillInReach()
    if (inReachEvil)
        embraceEvilButton.classList.add("button-evil")
    else
        embraceEvilButton.classList.remove("button-evil")

    renderProgessResource(embraceEvilButton,
        getDynamicProgress(gameData.evil, requiredEvil),
        getDynamicProgress(gameData.evil + getEvilGainAvailable(), requiredEvil),
        'color-evil',
        requiredEvil
    )

    // Transcend for Next Milestone indicator

    const transcendButton = getElementCachedById("rebirthButton3").querySelector(".button")
    const { inReach: inReachEssence, requirement: requiredEssence } = getNextMilestoneInReach()

    if (inReachEssence)
        transcendButton.classList.add("button-transcend")
    else
        transcendButton.classList.remove("button-transcend")

    renderProgessResource(transcendButton,
        getDynamicProgress(gameData.essence, requiredEssence),
        getDynamicProgress(gameData.essence + getEssenceGainAvailable(), requiredEssence),
        'color-essence',
        requiredEssence
    )

    const collapseButton = getElementCachedById("rebirthButton4").querySelector(".button")
    const { inReach: inReachDarkMatter, requirement: requiredDarkMatter } = getNextDarkMatterRequirement()

    if (inReachDarkMatter)
        collapseButton.classList.add("button-collapse")
    else
        collapseButton.classList.remove("button-collapse")

    renderProgessResource(collapseButton,
        getDynamicProgress(gameData.dark_matter, requiredDarkMatter),
        getDynamicProgress(gameData.dark_matter + getDarkMatterGainAvailable(), requiredDarkMatter),
        'color-dark-matter',
        requiredDarkMatter
    )

    // Hide the rebirthOneButton from the sidebar when you have `Magic Eye` unlocked.    
    getElementCachedById("rebirthButton1").hidden = gameData.requirements["Magic Eye"].isCompleted() || (isInMetaverse() && gameData.dark_matter > 0)

    if (isInMetaverse()) {
        const buttonsConfig = [
            { id: "rebirthButton1", req: "Rebirth button 1", active: !gameData.requirements["Magic Eye"].isCompleted() },
            { id: "rebirthButton2", req: "Rebirth button 2", active: gameData.dark_matter > 0 || gameData.essence > 0 || gameData.evil > 0 },
            { id: "rebirthButton3", req: "Rebirth button 3", active: gameData.dark_matter > 0 || gameData.essence > 0 },
            { id: "rebirthButton4", req: "Rebirth button 4", active: gameData.dark_matter > 0 }
        ];

        buttonsConfig.forEach(({ id, req, btn, active }) => {
            if (active) {
                const element = getElementCachedById(id)
                element.classList.remove("hidden");
                element.querySelector(".button").disabled = !gameData.requirements[req].isCompleted();
            }
        });
    }

    // Challenges



    if (gameData.active_challenge == "") {
        getElementCachedById("challengeTitle").hidden = true
    } else {
        safeUpdateText("challengeName", getFormattedTitle(gameData.active_challenge))
        getElementCachedById("challengeTitle").hidden = false
    }

    if (gameData.active_challenge == "") {
        for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {
            const elementReward = getElementCachedById("sidebarChallengeReward" + i)
            if (elementReward)
                renderCurrentChallengeReward(elementReward, false)
        }
    } else {

        for (let i = 1; i <= Object.keys(gameData.challenges).length; i++) {

            if (getChallengeName(i) == gameData.active_challenge) {
                const elementReward = getElementCachedById("sidebarChallengeReward" + i)
                if (elementReward)
                    renderCurrentChallengeReward(elementReward, true)
            }
            else {
                const elementReward = getElementCachedById("sidebarChallengeReward" + i)
                if (elementReward)
                    renderCurrentChallengeReward(elementReward, false)
            }
        }
    }

    renderCurrentChallengeRewardValue(true)


    // Events
    const event_id = getCurrentEventId()
    const elBuff = getElementCachedById("enentBuff")
    if (event_id == 0) {
        getElementCachedById("eventInfo").hidden = true
        elBuff.classList.remove(...elBuff.classList)
    }
    else {
        getElementCachedById("eventInfo").hidden = false
        safeUpdateText("enentName", eventsData[event_id].name)
        safeUpdateText("enentDescription", eventsData[event_id].desc)
        elBuff.classList.remove(...elBuff.classList)
        safeUpdateText("enentBuff", eventsData[event_id].effect + eventsData[event_id].mult)
        elBuff.classList.add(eventsData[event_id].style)
        const d = new Date()
        safeUpdateText("enentTime", formatTime(3600 - (d.getUTCMinutes() * 60 + d.getUTCSeconds())))
    }

    if (gameData.settings.EPSidebar)
        renderEvilPerksSideBar()

    // global box 
    const infoQuickBar = getElementCachedById("infoQuickBar")

    infoQuickBar.classList.toggle("sidebar-box-game-paused", gameData.paused)
    infoQuickBar.classList.toggle("sidebar-box-in-challenge", !gameData.paused && gameData.active_challenge !== "")


    infoQuickBar.classList.toggle("sidebar-box-boost-active", !gameData.paused && gameData.active_challenge == "" && isInMetaverse() && gameData.boost_active)
    infoQuickBar.classList.toggle("sidebar-box-boost-ready", !gameData.paused && gameData.active_challenge == "" && isInMetaverse() && !gameData.boost_active && gameData.boost_cooldown <= 0)
}

function renderProgessResource(element, progressPercent, pendingPercent, targetColorClass, visible = true) {
    const progressContainer = element.querySelector(".req-progress-container")
    const progressBar = element.querySelector(".req-progress-bar")
    const pendingBar = element.querySelector(".req-pending-bar")

    if (!progressContainer) return;

    if (progressPercent == Infinity || Number.isNaN(progressPercent)) {
        visible = false;
    }

    const targetVisibility = visible ? "visible" : "hidden";
    if (progressContainer.style.visibility !== targetVisibility) {
        progressContainer.style.visibility = targetVisibility;
    }

    if (!visible) return;

    const currentWidth = Math.min(progressPercent, 100);
    const totalPendingWidth = Math.min(pendingPercent, 100);

    const nextWidthStr = currentWidth + "%";
    if (progressBar.style.width !== nextWidthStr) {
        progressBar.style.width = nextWidthStr;
    }

    const nextPendingWidthStr = totalPendingWidth + "%";
    if (pendingBar.style.width !== nextPendingWidthStr) {
        pendingBar.style.width = nextPendingWidthStr;
    }

    const nextProgressClass = `req-progress-bar ${targetColorClass}${currentWidth === 100 ? ' is-complete' : ''}`;
    const nextPendingClass = `req-pending-bar ${targetColorClass}${totalPendingWidth === 100 ? ' is-complete' : ''}`;

    if (progressBar.className !== nextProgressClass) {
        progressBar.className = nextProgressClass;
    }
    if (pendingBar.className !== nextPendingClass) {
        pendingBar.className = nextPendingClass;
    }
}

function renderProgressBar(task, progressFill, progressBar) {
    let isTurbo = false;

    const gameDaysTotal = task.getGameDaysTotalForCurrentLevel();

    if (gameDaysTotal !== Infinity) {
        const gameSpeed = getUnpausedGameSpeed()

        if (gameSpeed > 0) {
            const realSecondsForLevel = gameDaysTotal / gameSpeed

            if (realSecondsForLevel < 0.2)
                isTurbo = true;
        }
    }

    progressFill.classList.toggle("progress-turbo", isTurbo);

    const widthPercent = isTurbo ? 100 : task.getTaskXpProgressFraction() * 100
    const newWidth = widthPercent + "%"
    if (progressFill.style.width !== newWidth)
        progressFill.style.width = newWidth

    progressFill.classList.toggle("hero", task.isHero)
    progressBar.classList.toggle("hero", task.isHero)
}

function renderJobs() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (!(task instanceof Job)) continue

        const row = getRowByName(task.name)

        safeUpdateTextElement(task.querySelector(".level", row), formatLevel(task.level), task.name + ".level")

        const maxLevel = task.querySelector(".maxLevel", row)
        safeUpdateTextElement(maxLevel, formatLevel(task.maxLevel), task.name + ".maxLevel");

        maxLevel.classList.toggle("hidden", gameData.rebirthOneCount <= 0);

        const progressBar = task.querySelector(".progressBar", row)
        safeUpdateTextElement(progressBar.querySelector(".name"), (task.isHero ? "Great " : "") + task.name, task.name + ".name")
        const progressFill = task.querySelector(".progressFill", row)
        renderProgressBar(task, progressFill, progressBar)

        const valueElement = task.querySelector(".value", row)
        valueElement.querySelector(".income").style.display = 'table-cell'
        valueElement.querySelector(".effect").style.display = 'none'

        if (!task._incomeElem)
            task._incomeElem = valueElement.querySelector(".income");

        formatCoins(task._incomeElem, task.getIncome())
    }
}

function renderSkills() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]

        if (!(task instanceof Skill)) continue

        const row = getRowByName(task.name)

        safeUpdateTextElement(task.querySelector(".level", row), formatLevel(task.level), task.name + ".level")

        const maxLevel = task.querySelector(".maxLevel", row)
        safeUpdateTextElement(maxLevel, formatLevel(task.maxLevel), task.name + ".maxLevel");

        maxLevel.classList.toggle("hidden", gameData.rebirthOneCount <= 0);

        const progressBar = task.querySelector(".progressBar", row)
        safeUpdateTextElement(progressBar.querySelector(".name"), (task.isHero ? "Great " : "") + task.name, task.name + ".name")
        const progressFill = task.querySelector(".progressFill", row)
        renderProgressBar(task, progressFill, progressBar)

        const valueElement = task.querySelector(".value", row)
        valueElement.querySelector(".income").style.display = 'none'
        valueElement.querySelector(".effect").style.display = 'table-cell'

        safeUpdateTextElement(valueElement.querySelector(".effect"), task.getEffectDescription(), task.name + ".value.effect")
    }
}

function renderShop() {
    for (const key in gameData.itemData) {
        const item = gameData.itemData[key]
        const row = getRowByName(item.name)
        const button = row.querySelector(".button")
        button.disabled = gameData.coins < item.getExpense()
        const name = button.querySelector(".name")

        const isLegendary = isHeroesUnlocked()
        if (isLegendary)
            name.classList.add("legendary")
        else
            name.classList.remove("legendary")

        const active = row.querySelector(".active")
        const color = autoBuyEnabled
            ? itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties_Auto"] : headerRowColors["Misc_Auto"]
            : itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"]

        const isItemActive = gameData.currentMisc.includes(item) || item == gameData.currentProperty
        active.style.backgroundColor = isItemActive ? color : "white"

        safeUpdateTextElement(row.querySelector(".effect"), item.getEffectDescription(), "id" + item.name + ".effect")

        formatCoins(row.querySelector(".expense"), item.getExpense())
    }
}

function renderRebirth() {

    safeUpdateText("age0", getAge0Requirement())
    safeUpdateText("age1", getAge1Requirement())
    safeUpdateText("age1a", getEyeRequirement())

    const age2req = getEvilRequirement()
    let age2 = ""
    if (age2req == 200)
        age2 = "2 whole centuries"
    else if (age2req == 100)
        age2 = "1 century"
    else
        age2 = age2req + " years"

    safeUpdateText("age2", age2)
    safeUpdateText("age2a", age2req)


    const age3req = getVoidRequirement()
    let age3 = ""
    if (age3req == 1000)
        age3 = "a millennium"
    else if (age3req > 100)
        age3 = (age3req / 100) + " whole centuries"
    else
        age3 = "1 century"
    safeUpdateText("age3", age3)

    var ones = new Array('', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten')

    let age3a = ""
    if (age3req == 1000)
        age3a = "thousand "
    else
        age3a = ones[age3req / 100] + " hundred "

    safeUpdateText("age3a", age3a)

    const age4req = getCelestialRequirement()
    let age4 = ""
    if (age4req == 1000)
        age4 = "a millennium"
    else
        age4 = ones[age4req / 1000] + " millennia"

    safeUpdateText("age4", age4)
    safeUpdateText("age4a", age4.charAt(0).toUpperCase() + age4.slice(1))
}

function renderEvilPerks() {
    safeUpdateText("eppInfo", (gameData.essence > 0) ? "Evil and buffed by Essence" : "Evil")
    safeUpdateText("evilperksDisplay", format(gameData.evil_perks_points, 3))
    safeUpdateText("evilperksGainDisplay", format(getEvilPerksGeneration() * 365))
    safeUpdateText("eyeReq", getEyeRequirement())
    safeUpdateText("evilReq", getEvilRequirement())
    safeUpdateText("voidManipulationReq", getVoidRequirement())
    safeUpdateText("celestialReq", getCelestialRequirement())
    safeUpdateText("celestialReduceYearsBy", getCelestialReduceYearsBy())
    safeUpdateText("essenceReward", format(getEssenceReward()))
    safeUpdateText("essenceRewardPercent", format(getEssenceRewardPercent(), 0))

    for (var i = 1; i <= 5; i++) {
        const perkCost = getEvilPerkCost(i)
        safeUpdateText("evilperkCost" + i, format(perkCost, 3))
        getElementCachedById("evilperkCostDiv" + i).hidden = perkCost == Infinity
        getElementCachedById("evilperkBuyDiv" + i).hidden = perkCost == Infinity

        const button = getElementCachedById("evilperk" + i)

        renderEvilPerkButton(button, i, perkCost)
    }
}


function renderEvilPerkButton(button, i, perkCost) {
    if (perkCost == Infinity) {
        button.classList.add("evilperkcompleted")
        button.style.backgroundImage = ""
    }
    else if (gameData.evil_perks_points >= perkCost) {
        button.classList.remove("evilperkcompleted")
        button.style.backgroundImage = ""
    }
    else {
        const percent = gameData.evil_perks_points / perkCost * 100
        button.style.backgroundImage = "linear-gradient(to right, rgb(240, 80, 80) 0%, rgb(180, 0, 0) " + percent + "%, rgb(128, 128, 128) " + percent + "%, rgb(128, 128, 128) 100%)"
    }
}

function renderEvilPerksSideBar() {
    safeUpdateText("evilperksDisplaySideBar", format(gameData.evil_perks_points, 1))
    safeUpdateText("eyeReqSideBar", getEyeRequirement())
    safeUpdateText("evilReqSideBar", getEvilRequirement())
    safeUpdateText("voidManipulationReqSideBar", getVoidRequirement())
    safeUpdateText("celestialReqSideBar", getCelestialRequirement())
    safeUpdateText("essenceRewardSideBar", format(getEssenceReward()))

    for (var i = 1; i <= 5; i++) {
        const perkCost = getEvilPerkCost(i)
        safeUpdateText("evilperkCostSideBar" + i, format(perkCost, 1))
        getElementCachedById("evilperkCostDivSideBar" + i).hidden = perkCost == Infinity

        const button = getElementCachedById("evilperkSideBar" + i)

        renderEvilPerkButton(button, i, perkCost)
    }
}


function renderChallenges() {
    let active_challenge_id = 0
    const challenges_count = Object.keys(gameData.challenges).length

    if (gameData.active_challenge !== "") {
        for (let i = 1; i <= challenges_count; i++) {
            if (getChallengeName(i) == gameData.active_challenge)
                active_challenge_id = i
        }
    }

    for (let i = 1; i <= challenges_count; i++) {
        const challengeElementId = getChallengeName(i, true) + "Challenge"

        if (i == active_challenge_id) {
            getElementCachedById("challengeButton" + i).classList.add("hidden")
            getElementCachedById("exitChallenge" + i).classList.remove("hidden")
            getElementCachedById(challengeElementId).classList.add("active-challenge")
            renderCurrentChallengeReward(getElementCachedById("currentChallengeReward" + i), true)
        }
        else {
            getElementCachedById("challengeButton" + i).classList.remove("hidden")
            getElementCachedById("exitChallenge" + i).classList.add("hidden")
            getElementCachedById(challengeElementId).classList.remove("active-challenge")
            renderCurrentChallengeReward(getElementCachedById("currentChallengeReward" + i), false)
        }

    }

    safeUpdateText("challengeGoal1", format(getChallengeGoal("an_unhappy_life")))
    safeFormatCoins("challengeGoal2", getChallengeGoal("rich_and_the_poor"))
    safeUpdateText("challengeGoal3", format(getChallengeGoal("time_does_not_fly")))
    safeUpdateText("challengeGoal4", format(getChallengeGoal("dance_with_the_devil")))
    safeUpdateText("challengeGoal5", getFormattedChallengeTaskGoal("Chairman", Math.floor(getChallengeGoal("legends_never_die"))))
    safeUpdateText("challengeGoal6", getFormattedChallengeTaskGoal("Sigma Proioxis", Math.floor(100 * (getChallengeGoal("the_darkest_time") - 1))))

    getElementCachedById("challengeReward1").hidden = gameData.challenges.an_unhappy_life == 0
    getElementCachedById("challengeReward2").hidden = gameData.challenges.rich_and_the_poor == 0
    getElementCachedById("challengeReward3").hidden = gameData.challenges.time_does_not_fly == 0
    getElementCachedById("challengeReward4").hidden = gameData.challenges.dance_with_the_devil == 0
    getElementCachedById("challengeReward5").hidden = gameData.challenges.legends_never_die == 0
    getElementCachedById("challengeReward6").hidden = gameData.challenges.the_darkest_time == 0


    for (i = 1; i <= 6; i++) {
        if (!getElementCachedById("challengeReward" + i).hidden)
            getElementCachedById(getChallengeName(i, true) + "Challenge").classList.remove("hidden")
        getElementCachedById("challengeButton" + i).disabled = !gameData.requirements["Challenge_" + getChallengeName(i)].completed
    }

    renderCurrentChallengeRewardValue()

    safeUpdateText("challengeHappinessBuff", format(getChallengeBonus("an_unhappy_life"), 2))
    safeUpdateText("challengeIncomeBuff", format(getChallengeBonus("rich_and_the_poor"), 2))
    safeUpdateText("challengeTimewarpingBuff", format(getChallengeBonus("time_does_not_fly"), 2))
    safeUpdateText("challengeEssenceGainBuff", format(getChallengeBonus("dance_with_the_devil"), 2))
    safeUpdateText("challengeEvilGainBuff", format(getChallengeBonus("legends_never_die"), 2))
    safeUpdateText("challengeDarkMatterGainBuff", format(getChallengeBonus("the_darkest_time"), 2))

    getElementCachedById("challenge5MetaverseLifespanDebuff").hidden = gameData.rebirthFiveCount == 0
}


function renderCurrentChallengeReward(elementReward, visible) {
    if (visible) {
        elementReward.classList.remove("hidden")

        if (getChallengeBonus(gameData.active_challenge, true) > getChallengeBonus(gameData.active_challenge))
            elementReward.classList.add("reward")
        else
            elementReward.classList.remove("reward")
    }
    else
        elementReward.classList.add("hidden")
}

function renderCurrentChallengeRewardValue(isSidebar = false) {
    const totalChallenges = Object.keys(gameData.challenges).length;

    for (let i = 1; i <= totalChallenges; i++) {
        if (isSidebar) {
            safeUpdateText(`sidebarCurrentChallengeBuff${i}`, format(getChallengeBonus(i, true), 2))
            safeUpdateText(`sidebarChallengeBuff${i}`, format(getChallengeBonus(i), 2))
        }
        else {
            safeUpdateText(`currentChallengeBuff${i}`, format(getChallengeBonus(i, true), 2))
        }
    }
}

function renderMilestones() {
    for (const key in milestoneData) {
        const milestone = milestoneData[key]
        const row = getRowByName(milestone.name)
        safeUpdateTextElement(row.querySelector(".essence"), format(milestone.expense), milestone.name + ".essence")


        // TODO: Переписать на !== или typeof, когда определится точная структура требований (может быть undefined)

        let desc = milestone.description
        if (milestone.getEffect != null)
            desc = "x" + format(milestone.getEffect(), 1) + " " + desc

        if (milestone.baseData.effect != null)
            desc = "x" + format(milestone.baseData.effect, 0) + " " + desc

        if (key == "Magic Eye")
            desc = desc.replace('65', getEyeRequirement())

        safeUpdateTextElement(row.querySelector(".description"), desc, milestone.name + ".description")
    }
}

function renderBoostButton(elemName) {
    // render boost button to look nicier :)
    const boostButton = getElementCachedById(elemName)
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
    getElementCachedById("currentHypercubesCap").hidden = getHypercubeCap() == Infinity
    safeUpdateText("currentHypercubesCapValue", format(getHypercubeCap()))

    for (var i = 0; i < 3; i++) {
        const nextH = getNextPowerOfNumber(gameData.hypercubes * Math.pow(10, i))
        const newText = format(nextH) + " Hypercubes in " + formatTime(getTimeTillNextHypercubePower(i))
        safeUpdateText("timeTillNextHypercubePower" + (i + 1), newText)

        const elem = getElementCachedById("timeTillNextHypercubePower" + (i + 1))
        if (i > 0)
            elem.hidden = nextH > getHypercubeCap() || getTotalPerkPoints() == 0 || gameData.hypercubes < 1e20 * Math.pow(10, i)
        else
            elem.hidden = false
    }

    renderBoostButton("boostMetaButton")

    safeUpdateText("hypercubesMetaDisplay", format(gameData.hypercubes))
    safeUpdateText("hypercubesBonusMetaDisplay", "x" + format(getHypercubeGeneration() / 0.03))
    safeUpdateText("boostCooldownMetaDisplay", getBoostCooldownString())

    safeUpdateText("reduceBoostCooldown", formatTime(getBoostCooldownSeconds()))
    safeUpdateText("reduceBoostCooldownCost", format(reduceBoostCooldownCost()))
    getElementCachedById("reduceBoostCooldownBuyButton").disabled = !canBuyReduceBoostCooldown()

    safeUpdateText("boostDuration", formatTime(getBoostTimeSeconds()))
    safeUpdateText("boostDurationCost", format(boostDurationCost()))
    getElementCachedById("boostDurationBuyButton").disabled = !canBuyBoostDuration()

    safeUpdateText("hypercubeGain", format(getHypercubeGeneration() * getUnpausedGameSpeed(), 2))
    safeUpdateText("hypercubeGainCost", format(hypercubeGainCost()))
    getElementCachedById("hypercubeGainBuyButton").disabled = !canBuyHypercubeGain()

    safeUpdateText("evilTranGain", format(evilTranGain(), 2))
    safeUpdateText("evilTranCost", format(evilTranCost()))
    getElementCachedById("evilTranBuyButton").disabled = !canBuyEvilTran()

    safeUpdateText("essenceMultGain", format(essenceMultGain(), 2))
    safeUpdateText("essenceMultCost", format(essenceMultCost()))
    getElementCachedById("essenceMultButton").disabled = !canBuyEssenceMult()

    safeUpdateText("challengeAltarCost", format(challengeAltarCost()))
    safeUpdateText("challengeAltarState", gameData.metaverse.challenge_altar == 0 ? "" : "Active")
    getElementCachedById("challengeAltarButton").disabled = !canBuyChallengeAltar()
    if (gameData.metaverse.challenge_altar == 0)
        getElementCachedById("challengeAltarButton").classList.remove("hidden")
    else
        getElementCachedById("challengeAltarButton").classList.add("hidden")

    safeUpdateText("darkMatterMultGain", format(darkMatterMultGain(), 2))
    safeUpdateText("darkMatterMultCost", format(darkMatterMultCost()))
    getElementCachedById("darkMaterMultButton").disabled = !canBuyDarkMatterMult()

    // Perks
    renderPerks()
}

function renderPerks() {
    safeUpdateText("perkPointDisplay", formatTreshold(gameData.perks_points))
    safeUpdateText("totalPerkPointDisplay", formatTreshold(getTotalPerkPoints()))

    // Info

    if (gameData.requirements["The End is near"].isCompleted()) {
        getElementCachedById("mppInfo").hidden = true
        getElementCachedById("mppInfo2").hidden = false
        safeUpdateText("mppDMBuff", format(getUnspentPerksDarkmatterGainBuff()))
    }
    else {
        getElementCachedById("mppInfo").hidden = false
        getElementCachedById("mppInfo2").hidden = true
    }

    // PerkButtons
    const total_mpp = getTotalPerkPoints()
    let hide_next = false
    let index = 0

    for (const perkName of getSortedPerks()) {
        const key = perkName[0]
        const button = getElementCachedById("id" + key)

        if (hide_next)
            button.classList.add("hidden")
        else {
            button.classList.remove("hidden")

            if (gameData.perks[key] == 0)
                button.classList.remove("active-perk")
            else
                button.classList.add("active-perk")

            const perk_cost = getPerkCost(key)

            const perkNameElement = el(`#id${key} .perkName`)

            if (total_mpp >= perk_cost) {
                safeUpdateTextElement(perkNameElement, getMetaversePerkName(key), "id" + key + ".perkName")
                button.classList.remove("perk-locked")
            }
            else {
                safeUpdateTextElement(perkNameElement, "LOCKED", "id" + key + ".perkName")
                button.classList.add("perk-locked")
                if (index % 2 == 1)
                    hide_next = true
            }
        }
        index++
    }
}

function renderDarkMatter() {
    renderDarkMatterResources();
    renderDarkMatterShop();
    renderDarkMatterSkillTree();
}

function renderDarkMatterResources() {
    const { dark_matter, dark_orbs, settings } = gameData;

    safeUpdateText("darkMatterShopDisplay", dark_matter < 1e6 ? Math.round(dark_matter) : format(dark_matter));
    safeUpdateText("darkMatterSkillsDisplay", settings.layout === 0 ? "" : format(dark_matter));
    safeUpdateText("darkOrbsShopDisplay", formatTreshold(dark_orbs))

    const nextCost = Math.min(
        getADealWithTheChairmanCost(),
        getAGiftFromGodCost(),
        getLifeCoachCost(),
        getGottaBeFastCost()
    );

    const currentProgress = getDynamicProgress(dark_orbs, nextCost);

    renderProgessResource(
        getElementCachedById("darkOrbsProgress"),
        currentProgress,
        currentProgress,
        'color-dark-matter',
        nextCost
    );
}


function renderDarkMatterShop() {

    function renderButton(elemName, condition) {
        getElementCachedById(elemName).disabled = !condition
    }

    const shopItems = [
        { id: "darkOrbGeneratorCost", text: format(getDarkOrbGeneratorCost(), 0) },
        { id: "darkOrbGenerator", text: format(getDarkOrbGeneration()) },
        { id: "aDealWithTheChairmanEffect", text: format(getTaaAndMagicXpGain()) },
        { id: "aDealWithTheChairmanCost", text: format(getADealWithTheChairmanCost()) },
        { id: "aGiftFromGodEffect", text: format(getAGiftFromGodEssenceGain()) },
        { id: "aGiftFromGodCost", text: format(getAGiftFromGodCost()) },
        { id: "lifeCoachEffect", text: format(getLifeCoachIncomeGain()) },
        { id: "lifeCoachCost", text: format(getLifeCoachCost()) },
        { id: "gottaBeFastEffect", text: format(getGottaBeFastGain(), 2) },
        { id: "gottaBeFastCost", text: format(getGottaBeFastCost()) }
    ];
    shopItems.forEach(item => getElementCachedById(item.id).textContent = item.text);

    const aMiracleBuyButton = getElementCachedById("aMiracleBuyButton");
    if (gameData.dark_matter_shop.a_miracle) {
        if (gameData.dark_matter < 1000) {
            aMiracleBuyButton.textContent = "Refund";
            aMiracleBuyButton.classList.remove("hidden");
        } else {
            aMiracleBuyButton.classList.add("hidden");
        }
    } else {
        aMiracleBuyButton.textContent = "Buy a Miracle";
        aMiracleBuyButton.classList.remove("hidden");
    }

    const isGeneratorInfinity = getDarkOrbGeneration() === Infinity;
    getElementCachedById("darkOrbGeneratorBuyButton").classList.toggle("hidden", isGeneratorInfinity);

    const purchaseStatus = [
        { id: "darkOrbGeneratorBuyButton", canBuy: canBuyDarkOrbGenerator() },
        { id: "aMiracleBuyButton", canBuy: canBuyAMiracle() },
        { id: "aDealWithTheChairmanBuyButton", canBuy: canBuyADealWithTheChairman() },
        { id: "aGiftFromGodBuyButton", canBuy: canBuyAGiftFromGod() },
        { id: "gottaBeFastBuyButton", canBuy: canBuyGottaBeFast() },
        { id: "lifeCoachBuyButton", canBuy: canBuyLifeCoach() }
    ];
    purchaseStatus.forEach(item => renderButton(item.id, item.canBuy));

    const toggleItems = [
        { id: "aDealWithTheChairmanBuyButton", costId: "aDealWithTheChairmanCost", cost: getADealWithTheChairmanCost() },
        { id: "aGiftFromGodBuyButton", costId: "aGiftFromGodCost", cost: getAGiftFromGodCost() },
        { id: "gottaBeFastBuyButton", costId: "gottaBeFastCost", cost: getGottaBeFastCost() },
        { id: "lifeCoachBuyButton", costId: "lifeCoachCost", cost: getLifeCoachCost() }
    ];

    toggleItems.forEach(item => {
        const isHidden = item.cost === Infinity;
        getElementCachedById(item.id).classList.toggle("hidden", isHidden);
        getElementCachedById(item.costId).closest("div").classList.toggle("hidden", isHidden);
    });

    const canBuyAny = purchaseStatus.slice(2).some(item => item.canBuy);
    const hasAnyValidCost = toggleItems.some(item => item.cost !== Infinity);
    const isMetaverseCompleted = isInMetaverse();

    if (isMetaverseCompleted && hasAnyValidCost) {
        getElementCachedById("darkOrbsBuyAllButton").classList.remove("hidden");
        renderButton("darkOrbsBuyAllButton", canBuyAny);
    } else {
        getElementCachedById("darkOrbsBuyAllButton").classList.add("hidden");
    }
}

function renderDarkMatterSkillTreeButton(id, categoryBought, elementBought, canBuy) {
    const hasBothSkillsPerk = gameData.perks.both_dark_mater_skills !== 0;
    const element = getElementCachedById(id)

    if (!hasBothSkillsPerk) {

        element.disabled = categoryBought || !canBuy;

        if (categoryBought) {
            safeUpdateText(id, elementBought ? "Accepted" : "Rejected")
            element.classList.toggle("w3-green", elementBought);
            element.classList.toggle("w3-red", !elementBought);
        } else {
            safeUpdateText(id, "Buy")
            element.classList.remove("w3-green", "w3-red");
        }
    } else {

        element.disabled = elementBought;
        safeUpdateText(id, elementBought ? "Accepted" : "Buy")

        element.classList.toggle("w3-green", elementBought);
        element.classList.remove("w3-red");
    }
}


function renderDarkMatterSkillTree() {
    const skills = [
        { id: "speedIsLife", key: "speed_is_life", costIndex: 1 },
        { id: "yourGreatestDebt", key: "your_greatest_debt", costIndex: 2 },
        { id: "essenceCollector", key: "essence_collector", costIndex: 3 },
        { id: "explosionOfTheUniverse", key: "explosion_of_the_universe", costIndex: 4 },
        { id: "multiverseExplorer", key: "multiverse_explorer", costIndex: 5 }
    ];

    skills.forEach(skill => {
        const skillState = gameData.dark_matter_shop[skill.key];
        const currentCost = getDarkMatterSkillCost(skill.costIndex);
        const canAfford = gameData.dark_matter >= currentCost;

        renderDarkMatterSkillTreeButton(`${skill.id}1`, skillState !== 0, [1, 3].includes(skillState), canAfford);
        renderDarkMatterSkillTreeButton(`${skill.id}2`, skillState !== 0, [2, 3].includes(skillState), canAfford);
        safeUpdateText(`darkMatterSkillCost${skill.costIndex}`, format(currentCost))
    });

    const toggleElements = (className, isHidden) => {
        allByClass(className).forEach(elem => {
            if (elem.hidden !== isHidden) {
                elem.hidden = isHidden;
            }
        });
    };

    toggleElements("negative-effect", gameData.perks.positive_dark_mater_skills === 1);
    toggleElements("darkMatterSkillOR", gameData.perks.both_dark_mater_skills === 1);
}

function renderSettings() {
    // Stats
    const date = new Date(gameData.stats.startDate)
    safeUpdateText("startDateDisplay", date.toLocaleDateString())

    const currentDate = new Date()
    safeUpdateText("playedDaysDisplay", format((currentDate.getTime() - date.getTime()) / (1000 * 3600 * 24), 2))
    safeUpdateText("playedRealTimeDisplay", formatTime(gameData.realtimeRun))

    safeUpdateText("playedGameTimeDisplay", formatGameDays(gameData.totalDays, 2))

    getElementCachedById("statsRebirth1").classList.toggle("hidden", gameData.rebirthOneCount <= 0);
    getElementCachedById("statsRebirth2").classList.toggle("hidden", gameData.rebirthTwoCount <= 0);
    getElementCachedById("statsRebirth3").classList.toggle("hidden", gameData.rebirthThreeCount <= 0);
    getElementCachedById("statsRebirth4").classList.toggle("hidden", gameData.rebirthFourCount <= 0);
    getElementCachedById("statsRebirth5").classList.toggle("hidden", gameData.rebirthFiveCount <= 0);


    safeUpdateText("rebirthOneCountDisplay", gameData.rebirthOneCount)
    safeUpdateText("rebirthTwoCountDisplay", gameData.rebirthTwoCount)
    safeUpdateText("rebirthThreeCountDisplay", gameData.rebirthThreeCount)
    safeUpdateText("rebirthFourCountDisplay", gameData.rebirthFourCount)
    safeUpdateText("rebirthFiveCountDisplay", gameData.rebirthFiveCount)

    safeUpdateText("rebirthOneTimeDisplay", formatTime(gameData.rebirthOneTime))
    safeUpdateText("rebirthTwoTimeDisplay", formatTime(gameData.rebirthTwoTime))
    safeUpdateText("rebirthThreeTimeDisplay", formatTime(gameData.rebirthThreeTime))
    safeUpdateText("rebirthFourTimeDisplay", formatTime(gameData.rebirthFourTime))
    safeUpdateText("rebirthFiveTimeDisplay", formatTime(gameData.rebirthFiveTime))

    safeUpdateText("rebirthOneFastestDisplay", formatTime(gameData.stats.fastest1, true))
    safeUpdateText("rebirthTwoFastestDisplay", formatTime(gameData.stats.fastest2, true))
    safeUpdateText("rebirthThreeFastestDisplay", formatTime(gameData.stats.fastest3, true))
    safeUpdateText("rebirthFourFastestDisplay", formatTime(gameData.stats.fastest4, true))
    safeUpdateText("rebirthFiveFastestDisplay", formatTime(gameData.stats.fastest5, true))

    // Gain Stats
    safeUpdateText("evilPerSecondDisplay", format(gameData.stats.EvilPerSecond, 3))
    safeUpdateText("maxEvilPerSecondDisplay", format(gameData.stats.maxEvilPerSecond, 3))
    safeUpdateText("maxEvilPerSecondRtDisplay", formatTime(gameData.stats.maxEvilPerSecondRt))

    // Challenge Stats
    getElementCachedById("challengeStat1").hidden = gameData.challenges.an_unhappy_life == 0
    getElementCachedById("challengeStat2").hidden = gameData.challenges.rich_and_the_poor == 0
    getElementCachedById("challengeStat3").hidden = gameData.challenges.time_does_not_fly == 0
    getElementCachedById("challengeStat4").hidden = gameData.challenges.dance_with_the_devil == 0
    getElementCachedById("challengeStat5").hidden = gameData.challenges.legends_never_die == 0
    getElementCachedById("challengeStat6").hidden = gameData.challenges.the_darkest_time == 0

    safeUpdateText("challengeHappinessBuffDisplay", format(getChallengeBonus("an_unhappy_life"), 2))
    safeUpdateText("challengeIncomeBuffDisplay", format(getChallengeBonus("rich_and_the_poor"), 2))
    safeUpdateText("challengeTimewarpingBuffDisplay", format(getChallengeBonus("time_does_not_fly"), 2))
    safeUpdateText("challengeEssenceGainBuffDisplay", format(getChallengeBonus("dance_with_the_devil"), 2))
    safeUpdateText("challengeEvilGainBuffDisplay", format(getChallengeBonus("legends_never_die"), 2))
    safeUpdateText("challengeDarkMaterGainBuffDisplay", format(getChallengeBonus("the_darkest_time"), 2))

    // Next Events
    events = getPendingEvents()
    for (var i = 0; i <= 10; i++) {
        getElementCachedById("NextEvent" + i).innerHTML = events[i]
    }

    getElementCachedById("NextEvent0").hidden = events[0] == ""
}

function renderRequirements() {
    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        for (const element of requirement.elements) {
            if (requirement.isCompleted()) {
                element.classList.remove("hidden")

                if (Object.values(tabToRequirementMap).includes(key) && !gameData.viewedTabs[key]) {
                    element.classList.add("blink-highlight")
                }

            } else {
                element.classList.add("hidden")
                element.classList.remove("blink-highlight")
            }
        }
    }
}

function renderHeaderRows(categories) {
    for (const categoryName in categories) {
        const className = removeSpaces(categoryName);
        const headerRow = elByClass(className);
        if (!headerRow) continue;

        const maxLevelElement = el(`.${className} .maxLevel`);

        const shouldHide = gameData.rebirthOneCount == 0;
        if (maxLevelElement.classList.contains("hidden") !== shouldHide) {
            maxLevelElement.classList.toggle("hidden", shouldHide);
        }
    }
}


/* CREATE ELEMENTS */

function createHeaderRow(templates, categoryType, categoryName, categoryTypeName) {
    const headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    const categoryElement = headerRow.querySelector(".category")

    if (categoryType == itemCategories) {
        categoryElement.querySelector(".name").textContent = categoryName
    } else {
        categoryElement.textContent = categoryName
    }


    if (categoryType == jobCategories || categoryType == skillCategories) {
        const valueTypeElement = headerRow.querySelector(".valueType")
        valueTypeElement.textContent = categoryType == jobCategories ? "Income" : "Effect"
        valueTypeElement.style.width = categoryType == jobCategories ? "8em" : "18em"
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.style.color = (gameData.settings.theme == 2) ? headerRowTextColors[categoryName] : "#ffffff"
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")

    return headerRow
}

function createRequiredRow(categoryName) {
    const row = document.querySelector(".requiredRowTemplate").content.firstElementChild.cloneNode(true)
    row.classList.add("requiredRow")
    row.classList.add(removeSpaces(categoryName))
    row.id = categoryName
    return row
}


function createRow(templates, name, categoryName, categoryType, categoryTypeName) {
    const row = templates.row.content.firstElementChild.cloneNode(true)

    row.querySelector(".name").textContent = name
    row.id = "row" + removeSpaces(removeStrangeCharacters(name))

    if (categoryType == itemCategories) {
        row.querySelector(".button").onclick = categoryName == "Properties"
            ? () => { setCurrentProperty(name) }
            : () => { setMisc(name) }
    }

    const tooltip = row.querySelector('.tooltip');
    if (tooltip) {
        tooltip.setAttribute('data-type', categoryTypeName);
        tooltip.setAttribute('data-name', name);
    }

    return row
}


function createAllRows(categoryType, tableId, categoryTypeName) {
    const templates = {
        headerRow: elByClass(
            categoryType == itemCategories
                ? "headerRowItemTemplate"
                : (categoryType == milestoneCategories ? "headerRowMilestoneTemplate" : "headerRowTaskTemplate")

        ),
        row: elByClass(
            categoryType == itemCategories
                ? "rowItemTemplate"
                : (categoryType == milestoneCategories ? "rowMilestoneTemplate" : "rowTaskTemplate")),
    }

    const table = getElementCachedById(tableId)

    for (const categoryName in categoryType) {
        const headerRow = createHeaderRow(templates, categoryType, categoryName, categoryTypeName)
        table.appendChild(headerRow)

        const category = categoryType[categoryName]
        category.forEach(function (name) {
            const row = createRow(templates, name, categoryName, categoryType, categoryTypeName)
            table.appendChild(row)
        })

        const requiredRow = createRequiredRow(categoryName)
        table.append(requiredRow)
    }
}

function setStickySidebar(sticky) {
    gameData.settings.stickySidebar = sticky

    const settingsStickySidebar = getElementCachedById("settingsStickySidebar")
    settingsStickySidebar.checked = sticky

    const infoQuickBar = getElementCachedById("infoQuickBar")
    infoQuickBar.style.position = sticky ? 'sticky' : 'initial'
    infoQuickBar.style.zIndex = sticky ? '100' : 'initial'
}

function setRequireShiftForTooltip(requireShiftForTooltip) {
    gameData.settings.requireShiftForTooltip = requireShiftForTooltip
    const settingsRequireShiftForTooltip = getElementCachedById("settingsRequireShiftForTooltip")
    settingsRequireShiftForTooltip.checked = requireShiftForTooltip
}

function setEPSidebar(enabled) {
    gameData.settings.EPSidebar = enabled
    const settingsEPSidebar = getElementCachedById("settingsEPSidebar")
    settingsEPSidebar.checked = enabled

    if (enabled)
        getElementCachedById("sidebarEP").classList.remove("hidden")
    else
        getElementCachedById("sidebarEP").classList.add("hidden")

    const evilperkSideBar1 = getElementCachedById("evilperkSideBar1")
    const evilperkSideBar2 = getElementCachedById("evilperkSideBar2")
    const evilperkSideBar3 = getElementCachedById("evilperkSideBar3")
    const evilperkSideBar4 = getElementCachedById("evilperkSideBar4")

    evilperkSideBar1.classList.toggle("hidden", gameData.evil_perks_keep)
    evilperkSideBar2.classList.toggle("hidden", gameData.evil_perks_keep)
    evilperkSideBar3.classList.toggle("hidden", gameData.evil_perks_keep)
    evilperkSideBar4.classList.toggle("hidden", gameData.evil_perks_keep)
}

function selectElementInGroup(group, index) {
    const elements = allByClass(group)

    for (const el of elements) {
        el.classList.remove("selected")
    }

    if (elements[index]) {
        elements[index].classList.add("selected")
    }
}


function handleSidebarLayout(e) {
    const infoPage = getElementCachedById("infoPage");
    const infoQuickBar = getElementCachedById("infoQuickBar");
    const infoTabPage = getElementCachedById("info");
    const infoTabButton = getElementCachedById("infoTabButton");

    if (!infoPage || !infoQuickBar || !infoTabPage || !infoTabButton) return;

    const isWide = e.matches;

    infoQuickBar.hidden = !isWide;
    infoTabPage.classList.toggle("hidden", isWide);
    infoTabButton.classList.toggle("hidden", isWide);

    if (isWide) {
        infoQuickBar.appendChild(infoPage);

        if (gameData.settings.selectedTab === Tab.INFO) {
            setTab(Tab.HERO);
        }
    } else {
        infoTabPage.appendChild(infoPage);
    }
}

function setCurrency(index) {
    gameData.settings.currencyNotation = index
    selectElementInGroup("CurrencyNotation", index)
}

function setNotation(index) {
    gameData.settings.numberNotation = index
    selectElementInGroup("Notation", index)
}

async function setTheme(index, reload = false) {
    if (index == 0 && reload) {
        const userWantsLightMode = await showLightModeConfirm();
        if (!userWantsLightMode)
            return
    }

    const body = getElementCachedById("body")

    body.classList.remove("dark")
    body.classList.remove("colorblind")


    if (index == 0) {
        // light
    }
    else if (index == 1) {
        // dark
        body.classList.add("dark")
    }
    else if (index == 2) {
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

function setLayout(id) {
    gameData.settings.layout = id
    const isWideLayout = (id == 0)

    const skillsTabBtn = getElementCachedById("skillsTabButton")
    const shopTabBtn = getElementCachedById("shopTabButton")
    const skillsTab = getElementCachedById("skills")
    const shopTab = getElementCachedById("shop")
    const tabcolumn = getElementCachedById("tabcolumn")
    const maincolumn = getElementCachedById("maincolumn")

    const jobs = getElementCachedById("jobs")
    const jobPage = getElementCachedById("jobPage")
    const skillPage = getElementCachedById("skillPage")
    const itemPage = getElementCachedById("itemPage")
    const skillTreePage = getElementCachedById("skillTreePage")

    const tabcolumnDM = getElementCachedById("tabcolumnDarkMater")
    const shopTabDM = getElementCachedById("shopTab")
    const maincolumnDM = getElementCachedById("maincolumnDarkMatter")
    const dmTitle = getElementCachedById("skillTreePageDarkMaterTitle")

    const tabcolumnMeta = getElementCachedById("tabcolumnMetaverse")
    const metaverseTab1 = getElementCachedById("metaverseTab1")
    const metaverseTab2 = getElementCachedById("metaverseTab2")
    const metaversePage2 = getElementCachedById("metaversePage2")
    const maincolumnMeta = getElementCachedById("maincolumnMetaverse")

    if (isWideLayout) {
        skillsTabBtn?.classList.add("hidden")
        shopTabBtn?.classList.add("hidden")
        skillsTab?.classList.add("hidden")
        shopTab?.classList.add("hidden")

        tabcolumn?.classList.remove("tabs-tab-column")
        tabcolumn?.classList.add("plain-tab-column")

        maincolumn?.classList.remove("tabs-main-column")
        maincolumn?.classList.add("plain-main-column")

        // Перемещаем страницы в одну колонку
        if (jobs && jobPage && skillPage && itemPage) {
            jobs.appendChild(jobPage)
            jobs.appendChild(skillPage)
            jobs.appendChild(itemPage)
        }

        if (jobPage) jobPage.style.flex = 0.8
        if (skillPage) skillPage.style.flex = 1.2
        if (itemPage) itemPage.style.flex = 0.9
    } else {
        skillsTabBtn?.classList.remove("hidden")
        shopTabBtn?.classList.remove("hidden")
        skillsTab?.classList.remove("hidden")
        shopTab?.classList.remove("hidden")

        tabcolumn?.classList.remove("plain-tab-column")
        tabcolumn?.classList.add("tabs-tab-column")

        maincolumn?.classList.remove("plain-main-column")
        maincolumn?.classList.add("tabs-main-column")

        // Возвращаем страницы по своим вкладкам
        skillsTab?.appendChild(skillPage)
        shopTab?.appendChild(itemPage)

        if (jobPage) jobPage.style.flex = 1
        if (skillPage) skillPage.style.flex = 1
        if (itemPage) itemPage.style.flex = 1
    }

    // --- 2. ЛЕЙАУТ ТЁМНОЙ МАТЕРИИ (DARK MATTER) ---
    if (isWideLayout) {
        tabcolumnDM?.classList.add("hidden")
        shopTabDM?.appendChild(skillTreePage)
        setTabDarkMatter("shopTab")

        maincolumnDM?.classList.remove("settings-main-column")
        if (dmTitle) dmTitle.textContent = "Dark Matter Abilities "
    } else {
        tabcolumnDM?.classList.remove("hidden")
        const skillTreeTab = getElementCachedById("skillTreeTab")
        skillTreeTab?.appendChild(skillTreePage)

        maincolumnDM?.classList.add("settings-main-column")
        if (dmTitle) dmTitle.textContent = "Dark Matter: "
    }

    // --- 3. ЛЕЙАУТ МЕТАВСЕЛЕННОЙ (METAVERSE) ---
    if (isWideLayout) {
        tabcolumnMeta?.classList.add("hidden")
        metaverseTab1?.appendChild(metaversePage2)
        setTabMetaverse("metaverseTab1")

        maincolumnMeta?.classList.remove("settings-main-column")
    } else {
        tabcolumnMeta?.classList.remove("hidden")
        metaverseTab2?.appendChild(metaversePage2)

        maincolumnMeta?.classList.add("settings-main-column")
    }

    selectElementInGroup("Layout", isWideLayout ? 1 : 0)
}

function setFontSizeLarger() {
    const before = gameData.settings.fontSize
    setFontSize(gameData.settings.fontSize + 1)
    const after = gameData.settings.fontSize
    console.log(`setFontSizeLarger ${before} -> ${after} current: (${getElementCachedById("body").style.fontSize})`)
}

function setFontSizeSmaller() {
    const before = gameData.settings.fontSize
    setFontSize(gameData.settings.fontSize - 1)
    const after = gameData.settings.fontSize
    console.log(`setFontSizeSmaller ${before} -> ${after} current: (${getElementCachedById("body").style.fontSize})`)
}

function setFontSizeDefault() {
    const before = gameData.settings.fontSize
    setFontSize(3)
    const after = gameData.settings.fontSize
    console.log(`setFontSizeDefault ${before} -> ${after} current: (${getElementCachedById("body").style.fontSize})`)
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
    getElementCachedById("body").style.fontSize = fontSizes[id]
}

function setSignDisplay() {
    const signDisplay = getElementCachedById("signDisplay")

    if (getNet() > -1 && getNet() < 1) {
        safeUpdateText("signDisplay", "")
        signDisplay.style.color = "gray"
    } else if (getNet() > 0) {
        safeUpdateText("signDisplay", "+")
        signDisplay.style.color = "green"
    } else {
        safeUpdateText("signDisplay", "-")
        signDisplay.style.color = "red"
    }
}

function getQuerySelector(taskName) {
    return "#row" + removeSpaces(removeStrangeCharacters(taskName))
}

function getRowByName(name) {
    return getElementCachedById("row" + removeSpaces(removeStrangeCharacters(name)))
}

const Tab = Object.freeze({
    JOBS: "jobs",
    SKILLS: "skills",
    SHOP: "shop",
    EVILPERKS: "evilperks",
    CHALLENGES: "challenges",
    MILESTONES: "milestones",
    REBIRTH: "rebirth",
    DARK_MATTER: "darkMatter",
    METAVERSE: "metaverse",
    SETTINGS: "settings",
    INFO: "info"
})

/**
 * @param {Tab} selectedTab
 */
function setTab(selectedTab) {
    const tabElement = getElementCachedById(selectedTab)

    if (tabElement == null) {
        setTab(Tab.JOBS)
        return
    }

    gameData.settings.selectedTab = selectedTab

    // Update the UI when switching tabs to prevent flikering.
    updateUI()

    const element = getElementCachedById(selectedTab + "TabButton")

    allByClass("tab").forEach(function (tab) {
        tab.style.display = "none"
    })
    tabElement.style.display = "flex"

    allByClass("tabButton").forEach(function (tabButton) {
        tabButton.classList.remove("w3-blue-gray")
    })

    if (element) {
        element.classList.add("w3-blue-gray")
    }

    const requirementKey = tabToRequirementMap[selectedTab];

    if (requirementKey) {
        gameData.viewedTabs[requirementKey] = true;

        const requirement = gameData.requirements[requirementKey];
        if (requirement) {
            for (const el of requirement.elements) {
                el.classList.remove("blink-highlight");
            }
        }
    }

    saveGameData()
}


// --- УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ЛЮБЫХ ПОД-ВКЛАДОК ---
function setSubTab(tab, tabClassName, buttonClassName) {
    const element = getElementCachedById(tab + "TabButton")

    // Скрываем все вкладки этой категории через кэш
    allByClass(tabClassName).forEach(function (t) {
        t.style.display = "none"
    })

    const currentTabEl = getElementCachedById(tab);
    if (currentTabEl) currentTabEl.style.display = "flex"

    // Снимаем активный класс со всех кнопок этой категории через кэш
    allByClass(buttonClassName).forEach(function (btn) {
        btn.classList.remove("w3-blue-gray")
    })

    if (element) element.classList.add("w3-blue-gray")
    saveGameData()
}

// --- ВАШИ СТАРЫЕ ФУНКЦИИ (теперь они супер-короткие и вызывают универсальную) ---

function setTabSettings(tab) {
    gameData.settings.settingsTab = tab

    // Оптимизация: используем наш кэш вместо querySelector
    if (tab === 'changelogTab') {
        const changelogEl = el("#changelog");
        if (changelogEl) changelogEl.textContent = changelogText;
    }

    setSubTab(tab, "tabSettings", "tabButtonSettings")
}

function setTabDarkMatter(tab) {
    setSubTab(tab, "tabDarkMatter", "tabButtonDarkMatter")
}

function setTabMetaverse(tab) {
    setSubTab(tab, "tabMetaverse", "tabButtonMetaverse")
}

// --- СТРЕЛОЧНАЯ СМЕНА ВКЛАДОК (ОПТИМИЗИРОВАННАЯ) ---
function changeTab(direction) {
    // Берём массивы из кэша — больше никакого slice.call и обращений к DOM
    const tabs = allByClass("tab")
    const tabButtons = allByClass("tabButton")

    // Оптимизация: ищем индекс активной вкладки через стандартный findIndex
    let currentTab = tabs.findIndex(tab =>
        !tab.style.display.includes("none") && !tab.classList.contains("hidden")
    )
    if (currentTab === -1) currentTab = 0

    let targetTab = currentTab + direction

    if (targetTab < 0) {
        setTab(Tab.SETTINGS)
        return
    }

    // Зацикливаем индекс, если вышли за границы массива
    if (targetTab > tabs.length - 1) targetTab = 0

    // Безопасный цикл: ищем доступную (не скрытую) вкладку
    let attempts = 0;
    while (
        tabButtons[targetTab] &&
        (tabButtons[targetTab].style.display.includes("none") || tabButtons[targetTab].classList.contains("hidden"))
    ) {
        targetTab = targetTab + direction
        if (targetTab > tabs.length - 1) targetTab = 0
        if (targetTab < 0) targetTab = tabs.length - 1

        // Защита от бесконечного цикла, если вдруг ВСЕ вкладки скрыты
        attempts++
        if (attempts > tabs.length) break
    }

    if (tabs[targetTab]) {
        setTab(tabs[targetTab].id)
    }
}



function getSortedPerks() {
    let sortable = []
    for (var perkname in perks_cost) {
        sortable.push([perkname, perks_cost[perkname]])
    }

    sortable.sort(function (a, b) {
        return a[1] - b[1]
    })

    return sortable
}

function createPerks(perkLayoutName) {
    const buttonTemplate = elByClass("perkItem")
    const perksLayout = getElementCachedById(perkLayoutName)
    for (const perkName of getSortedPerks()) {
        const perk = createPerk(buttonTemplate, perkName[0])
        perksLayout.appendChild(perk)
    }
}

function createPerk(template, name) {
    const button = template.content.firstElementChild.cloneNode(true)
    button.querySelector(".perkName").textContent = getMetaversePerkName(name)
    button.querySelector(".perkCost").textContent = getPerkCost(name)
    button.id = "id" + removeSpaces(removeStrangeCharacters(name))
    button.onclick = () => { buyPerk(name) }
    button.classList.add("tooltip")
    button.setAttribute('data-type', 'meta_perk')
    button.setAttribute('data-name', name)
    return button
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

// Keyboard shortcuts + Loadouts ( courtesy of Pseiko )
window.addEventListener('keydown', function (e) {
    if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
        if (e.key == " " && !e.repeat) {
            togglePause()
            if (e.target == document.body) {
                e.preventDefault()
            }
        }
        if (e.key == "ArrowRight") changeTab(1)
        if (e.key == "ArrowLeft") changeTab(-1)

        // The "dangerous" keybinds can be disabled.
        if (!gameData.settings.enableKeybinds)
            return

        if (e.key == "q") {
            rebirthOne()
        }

        if (e.key == "e") {
            rebirthTwo()
        }

        if (e.key == "t") {
            rebirthThree()
        }

        if (e.key == "u") {
            rebirthFour()
        }

        if (e.key == "g") {
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


function renderGameOver() {
    if (gameData.essence < 1e308)
        return

    if (gameData.game_over_viewed)
        return

    gameData.game_over_viewed = true
    saveGameData()
    gameOver()
}

function gameOver() {
    if (gameData.is_game_over)
        return
    gameData.is_game_over = true
    gameData.settings.requireShiftForTooltip = true

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    getElementCachedById("settingsTabButton").classList.add("hidden")

    // === НАСТРОЙКИ И ФЛАГИ ===
    const SEPARATE_TAB_HIDE = true;    // true: вкладки и их страницы исчезают по очереди; false: всё разом
    const ENABLE_GLITCH_EFFECT = false; // true: включить эффект глитча перед исчезновением
    const GLITCH_DURATION = 1000;      // Длительность глитча (в мс)
    const TAB_SWITCH_DELAY = 700;      // Время отображения вкладки и страницы (в мс) перед исчезновением

    // Отключаем клики по панели поздравления
    const congratsPanel = getElementCachedById('Congratulations');
    if (congratsPanel) congratsPanel.style.pointerEvents = 'none';

    // Вспомогательная функция для плавного исчезновения
    function fadeOut(element, duration, callback) {
        if (!element || element.style.display === 'none' || element.hasAttribute('hidden')) {
            if (callback) callback();
            return;
        }
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
            if (callback) callback();
        }, duration);
    }

    // Вспомогательная функция для применения эффекта глитча
    function applyGlitch(callback) {
        if (!ENABLE_GLITCH_EFFECT) {
            callback();
            return;
        }

        const styleId = 'glitch-animation-style';
        if (!getElementCachedById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                @keyframes gameGlitch {
                    0% { transform: translate(0, 0); filter: hue-rotate(0deg) skew(0deg); }
                    10% { transform: translate(-4px, 2px); filter: hue-rotate(90deg) skew(-2deg); }
                    20% { transform: translate(3px, -2px); filter: hue-rotate(180deg) skew(3deg); }
                    30% { transform: translate(-2px, -3px); filter: hue-rotate(270deg) skew(0deg); }
                    40% { transform: translate(4px, 3px); filter: hue-rotate(360deg) skew(4deg); }
                    50% { transform: translate(-3px, 1px); filter: hue-rotate(45deg) skew(-3deg); }
                    60% { transform: translate(2px, -4px); filter: invert(0.2); }
                    70% { transform: translate(-4px, -1px); filter: hue-rotate(120deg); }
                    80% { transform: translate(3px, 4px); filter: skew(5deg); }
                    90% { transform: translate(-1px, -2px); filter: hue-rotate(240deg); }
                    100% { transform: translate(0, 0); filter: hue-rotate(0deg) skew(0deg); }
                }
                .glitching-active {
                    animation: gameGlitch 0.15s infinite linear !important;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.classList.add('glitching-active');

        setTimeout(() => {
            document.body.classList.remove('glitching-active');
            const styleElement = getElementCachedById(styleId);
            if (styleElement) styleElement.remove();
            callback();
        }, GLITCH_DURATION);
    }

    // === ЗАПУСК ПРОЦЕССА ===
    applyGlitch(() => {

        // ШАГ 1: Последовательное переключение и исчезновение вкладок И страниц
        const tabColumn = getElementCachedById('tabcolumn');

        if (SEPARATE_TAB_HIDE && tabColumn) {
            // Берем только видимые кнопки меню
            const visibleTabs = Array.from(tabColumn.children).filter(child => {
                return child.classList.contains('tabButton') && !child.classList.contains('hidden');
            });

            if (visibleTabs.length === 0) {
                fadeOut(tabColumn, 500, startStep2);
                return;
            }

            let currentTabIndex = visibleTabs.length - 1;

            function processNextTab() {
                if (currentTabIndex < 0) {
                    // Переходим к шагу 2, когда скрыли все вкладки
                    fadeOut(tabColumn, 0, startStep2);
                    return;
                }

                const currentTab = visibleTabs[currentTabIndex];

                // 1. Кликаем на вкладку, чтобы игра её активировала
                currentTab.click();

                // Находим id страницы, которую открыла игра (вытаскиваем имя из onClick="setTab('имя')")
                const onClickAttr = currentTab.getAttribute('onClick') || '';
                const match = onClickAttr.match(/setTab\(['"](.+?)['"]\)/);
                const tabId = match ? match[1] : null;
                const associatedPage = tabId ? getElementCachedById(tabId) : null;

                // 2. Даем игроку рассмотреть открывшуюся вкладку
                setTimeout(() => {
                    let tabFadeDone = false;
                    let pageFadeDone = false;

                    function checkNext() {
                        if (tabFadeDone && pageFadeDone) {
                            currentTabIndex--;
                            processNextTab();
                        }
                    }

                    // 3. Плавно убираем саму кнопку вкладки
                    fadeOut(currentTab, 1000, () => {
                        tabFadeDone = true;
                        checkNext();
                    });

                    // 4. Плавно убираем открытую страницу внутри игрового поля
                    if (associatedPage) {
                        fadeOut(associatedPage, 1000, () => {
                            pageFadeDone = true;
                            checkNext();
                        });
                    } else {
                        pageFadeDone = true;
                        checkNext();
                    }

                }, TAB_SWITCH_DELAY);
            }

            processNextTab();

        } else {
            // Обычное скрытие всей панели разом, если флаг выключен
            fadeOut(tabColumn, 1500, startStep2);
        }

        // ШАГ 2: Исчезновение остатков основного контейнера (границы, обертки)
        function startStep2() {
            //startStep3()
            const mainColumn = getElementCachedById('maincolumn');
            //mainColumn.classList.add("hidden")
            fadeOut(mainColumn, 0, startStep3);
        }

        // ШАГ 3: Одновременное исчезновение сайдбара и панели быстрого доступа
        function startStep3() {
            const infoPage = getElementCachedById('infoPage');
            const infoQuickBar = getElementCachedById('infoQuickBar');

            let sidebarDone = false;
            let quickbarDone = false;

            function checkStep4() {
                if (sidebarDone && quickbarDone) {
                    showFinalCredits();
                }
            }

            fadeOut(infoPage, 1500, () => {
                sidebarDone = true;
                checkStep4();
            });

            fadeOut(infoQuickBar, 1500, () => {
                quickbarDone = true;
                checkStep4();
            });

            if (!infoQuickBar || infoQuickBar.hasAttribute('hidden') || infoQuickBar.style.display === 'none') {
                quickbarDone = true;
                checkStep4();
            }
        }
    });
}

function showFinalCredits() {
    document.body.style.transition = 'background-color 3000ms ease, background 3000ms ease';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#000000';

    const credits = document.createElement('div');
    credits.id = 'final_credits';

    Object.assign(credits.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontFamily: 'monospace',
        color: '#e0e0e0',
        maxWidth: '600px',
        width: '90%',
        zIndex: '100000',
        fontSize: '14px',
        lineHeight: '1.8',
        opacity: '0',
        transition: 'opacity 2500ms ease'
    });

    credits.innerHTML = `
        <h1 style="color: #24d2d9; font-size: 28px; margin-bottom: 1em; text-shadow: 0 0 10px rgba(36,210,217,0.5);">
            The Knight's Journey is Complete
        </h1>
        <p>You have walked through countless eras, transcended the laws of time, conquered Death, and subjugated the Metaverse itself.</p>
        <p>The ancient amulet has finally found its eternal peace, and with it, your immortal soul.</p>
        <br>
        <p style="color: #d91877; font-size: 18px; font-weight: bold;">Thank you for playing!</p>
        <p style="color: gray; font-size: 11px; margin-top: 2em;">Progress Knight Quest • Created with Passion</p>
        <br>
        <button onclick="location.reload()" class="w3-button button" style="margin-top: 1.5em; padding: 10px 20px;">
            Keep Playing
        </button>
    `;

    document.body.appendChild(credits);

    setTimeout(() => {
        credits.style.opacity = '1';
    }, 100);
}

const buttonColors = {
    blue: '#4444ff',
    green: '#12bb12',
    red: '#ff4444',
    gray: '#333333',
    grey: '#333333',
};

function applyButtonColor(btnElement, colorName) {
    const hexColor = buttonColors[colorName];

    if (hexColor) {
        btnElement.style.setProperty('--btn-color', hexColor);
        btnElement.style.setProperty('--btn-shadow', `0 0 0.625em ${hexColor}4d`);
    } else {
        btnElement.style.removeProperty('--btn-color');
        btnElement.style.removeProperty('--btn-shadow');
    }
}
/*
function customConfirm({ title, text, confirmText = "OK", cancelText = "Cancel", confirmColor = "blue", cancelColor = "" }) {
    return new Promise((resolve) => {
        const modal = getElementCachedById('game-confirm');
        const titleEl = getElementCachedById('game-modal-title');
        const textEl = getElementCachedById('game-modal-text');
        const confirmBtn = getElementCachedById('game-modal-confirm-btn');
        const cancelBtn = getElementCachedById('game-modal-cancel-btn');

        titleEl.textContent = title;
        textEl.textContent = text;
        confirmBtn.textContent = confirmText;
        cancelBtn.textContent = cancelText;

        applyButtonColor(confirmBtn, confirmColor);
        applyButtonColor(cancelBtn, cancelColor);

        modal.classList.remove('hidden');

        const closeWithResult = (result) => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            resolve(result);
        };

        const onConfirm = () => closeWithResult(true);
        const onCancel = () => closeWithResult(false);

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}
*/

function customConfirm({
    title,
    text,
    confirmText = "OK",
    cancelText = "Cancel",
    confirmColor = "blue",
    cancelColor = "",
    delay = 0,
    requiredText = ""
}) {
    return new Promise((resolve) => {
        const modal = getElementCachedById('game-confirm');
        const titleEl = getElementCachedById('game-modal-title');
        const textEl = getElementCachedById('game-modal-text');
        const confirmBtn = getElementCachedById('game-modal-confirm-btn');
        const cancelBtn = getElementCachedById('game-modal-cancel-btn');
        const inputEl = getElementCachedById('game-modal-input');

        titleEl.textContent = title;
        textEl.textContent = text;
        cancelBtn.textContent = cancelText;

        applyButtonColor(confirmBtn, confirmColor);
        applyButtonColor(cancelBtn, cancelColor);

        let timerActive = delay > 0;

        // 1. Function to evaluate if the confirm button should be enabled
        const checkButtonState = () => {
            const isTextValid = requiredText ? inputEl.value === requiredText : true;
            confirmBtn.disabled = timerActive || !isTextValid;
        };

        // 2. Setup Input Field
        if (requiredText) {
            inputEl.value = "";
            inputEl.classList.remove('hidden');
            inputEl.addEventListener('input', checkButtonState);
        } else {
            inputEl.classList.add('hidden');
        }

        // 3. Setup Timer Cooldown
        let timerInterval = null;
        if (delay > 0) {
            let secondsLeft = Math.ceil(delay / 1000);
            confirmBtn.textContent = `${confirmText} (${secondsLeft})`;

            timerInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    timerActive = false;
                    confirmBtn.textContent = confirmText;
                    checkButtonState();
                } else {
                    confirmBtn.textContent = `${confirmText} (${secondsLeft})`;
                }
            }, 1000);
        } else {
            confirmBtn.textContent = confirmText;
        }

        checkButtonState();

        modal.classList.remove('hidden');
        if (requiredText) inputEl.focus();

        const closeWithResult = (result) => {
            if (timerInterval) clearInterval(timerInterval);
            modal.classList.add('hidden');

            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            if (requiredText) inputEl.removeEventListener('input', checkButtonState);

            resolve(result);
        };

        const onConfirm = () => closeWithResult(true);
        const onCancel = () => closeWithResult(false);

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
    });
}


