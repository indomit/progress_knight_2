function loadSettings() {
    setFontSize(gameData.settings.fontSize, false);
    setNotation(gameData.settings.numberNotation, false);
    setCurrency(gameData.settings.currencyNotation, false);
    setStickySidebar(gameData.settings.stickySidebar, false);
    setRequireShiftForTooltip(gameData.settings.requireShiftForTooltip, false);
    setTaskAnimations(gameData.settings.taskAnimations, false)
    setEPSidebar(gameData.settings.EPSidebar, false);
    setEnableKeybinds(gameData.settings.enableKeybinds ? 0 : 1, false);
    setTheme(gameData.settings.theme, false);
    setLayout(gameData.settings.layout, false);
    setTab(gameData.settings.selectedTab, false);
    setTabSettings(gameData.settings.settingsTab ?? "settingsTab", false);
    setTabDarkMatter(gameData.settings.darkMatterTab ?? "shopTab", false);
    setTabMetaverse(gameData.settings.metaverseTab ?? "metaverseTab1", false);
}


function initializeUI() {
    /*
        Initializes the UI. Adds all html elements required for rendering.
    */

    const randomDelay = Math.random() * -12;
    el("#eventName").style.animationDelay = `${randomDelay}s`;

    createAllRows(jobCategories, "jobTable", "job")
    createAllRows(skillCategories, "skillTable", "skill")
    createAllRows(itemCategories, "itemTable", "item")
    createAllRows(milestoneCategories, "milestoneTable", "milestone")
    createPerks("perksLayout")

    loadSettings();

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key]
        requirement.queryElements()
    }

    initTooltip()

    if (gameData.rebirthOneCount === 0)
        hideMaxLevel()

    if (isTouchDevice)
        safeUpdateText("RequireShiftforTooltip", "Hide tooltips");
}

function showMaxLevel() {
    safeUpdateClass("#jobTable", "no-max", false)
    safeUpdateClass("#skillTable", "no-max", false)
}

function hideMaxLevel() {
    safeUpdateClass("#jobTable", "no-max", true)
    safeUpdateClass("#skillTable", "no-max", true)
}

function renderAliveUI() {
    safeUpdateClass("deathText", "hidden", gameData.is_alive)
}


function updateUI() {
    if (isProcessingOfflineProgress)
        return
    /*
        NOTE: To ensure that performance does not decrease,
        please only call the render function when the user can actually see the content.
        If they can always see the content put the function call at the top of this function.
 
        NOTE2: Do NOT render anything to the screen outside of this function.
    */

    renderAliveUI()
    renderRequirements()
    renderSideBar()

    const currentTab = gameData.settings.selectedTab

    if (currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.taskData, jobCategories)
        renderJobs()
    }

    if (currentTab == Tab.SKILLS || gameData.settings.layout == 0 && currentTab == Tab.JOBS) {
        updateRequiredRows(gameData.taskData, skillCategories)
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
        const tooltipEl = elById("globalTooltip");
        if (!tooltipEl) return;

        const elementClassCache = uiCache.classes.get(tooltipEl);
        const isVisible = elementClassCache ? elementClassCache.get("visible") === true : false;
        if (isVisible) {
            renderTooltipContent(tooltipEl, activeTooltipData, activeTooltipType);
        }
    }
}

function renderSideBar() {
    safeUpdateText("ageDisplay", formatAge(gameData.days))
    safeUpdateText("lifespanDisplay", formatWhole(daysToYears(getLifespan())))
    safeUpdateText("realtimeDisplay", formatTime(gameData.realtime))
    safeUpdateText("boostCooldownDisplay", getBoostCooldownButtonString())
    safeUpdateText("pauseButton", gameData.paused ? "Play" : "Pause")
    safeUpdateHidden("boostPanel", gameData.rebirthFiveCount == 0)
    renderBoostButton("boostButton")
    safeFormatCoins("coinDisplay", gameData.coins)
    const net = totalIncome - totalExpense
    setSignDisplay(net)
    safeFormatCoins("netDisplay", abs(net))
    safeFormatCoins("incomeDisplay", totalIncome)
    safeFormatCoins("expenseDisplay", totalExpense)
    safeUpdateText("happinessDisplay", format(getHappiness()))
    safeUpdateText("evilDisplay", format(gameData.evil))
    safeUpdateText("evilGainDisplay", format(getEvilGainAvailable()))
    safeUpdateText("evilGainButtonDisplay", "+" + format(getEvilGainAvailable()))
    safeUpdateText("essenceDisplay", format(gameData.essence))
    safeUpdateText("essenceGainDisplay", format(getEssenceGainAvailable()))
    safeUpdateText("essenceGainButtonDisplay", "+" + format(getEssenceGainAvailable()))
    safeUpdateText("darkMatterDisplay", formatWhole(gameData.dark_matter))
    safeUpdateText("darkMatterGainDisplay", format(getDarkMatterGainAvailable()))
    safeUpdateText("darkMatterGainButtonDisplay", "+" + format(getDarkMatterGainAvailable()))
    safeUpdateText("darkOrbsDisplay", formatTreshold(gameData.dark_orbs))
    const dealWithChairmanCost = getADealWithTheChairmanCost()
    const giftFromGodCost = getAGiftFromGodCost()
    const lifeCoachCost = getLifeCoachCost()
    const gottaBeFastCost = getGottaBeFastCost()
    const nextCost = min(dealWithChairmanCost, giftFromGodCost, lifeCoachCost, gottaBeFastCost)

    const currentProgress = getDynamicProgress(gameData.dark_orbs, nextCost)
    renderProgessResource(
        "#darkOrbsInfo",
        currentProgress,
        undefined,
        'color-dark-matter',
        nextCost
    )

    safeUpdateText("timeWarpingDisplay", "x" + format(gameData.game_speed / baseGameSpeed, 2))
    safeUpdateText("hypercubesDisplay", formatTreshold(gameData.hypercubes))

    safeUpdateHidden("hypercubeCapText", gameData.rebirthFiveCount == 0 || getTotalPerkPoints() > 0)
    safeUpdateText("hypercubeCapDisplay", format(getHypercubeCap(1)))

    safeUpdateHidden("perkPointsGainText", gameData.essence < 1e90)
    safeUpdateText("perkPointsGainDisplay", formatTreshold(getMetaversePerkPointsGain()))

    const rebirth5button = elById("metaversePerkPointsGainButtonDisplay")

    if (gameData.essence > 1e90) {
        safeUpdateText("metaversePerkPointsGainButtonDisplay", "+" + formatTreshold(getMetaversePerkPointsGain()))
        safeUpdateClass(rebirth5button, "color-perk-points", true)
        safeUpdateClass(rebirth5button, "color-hypercubes", false)
    }
    else if (gameData.rebirthFiveCount > 0) {
        safeUpdateText("metaversePerkPointsGainButtonDisplay", format(getHypercubeCap(1)))
        safeUpdateClass(rebirth5button, "color-perk-points", false)
        safeUpdateClass(rebirth5button, "color-hypercubes", true)
    }
    else {
        safeUpdateText("metaversePerkPointsGainButtonDisplay", "Unlock Hypercubes")
    }

    // Embrace evil indicator
    const { inReach: inReachEvil, requirement: requiredEvil } = getNextDarkMagicSkillInReach()
    safeUpdateClass("#rebirthButton2 .button", "button-evil", inReachEvil)
    renderProgessResource("#rebirthButton2 .button",
        getDynamicProgress(gameData.evil, requiredEvil),
        getDynamicProgress(gameData.evil + getEvilGainAvailable(), requiredEvil),
        'color-evil',
        requiredEvil
    )

    // Transcend for Next Milestone indicator
    const { inReach: inReachEssence, requirement: requiredEssence } = getNextMilestoneInReach()
    safeUpdateClass("#rebirthButton3 .button", "button-transcend", inReachEssence)
    renderProgessResource("#rebirthButton3 .button",
        getDynamicProgress(gameData.essence, requiredEssence),
        getDynamicProgress(gameData.essence + getEssenceGainAvailable(), requiredEssence),
        'color-essence',
        requiredEssence
    )

    const { inReach: inReachDarkMatter, requirement: requiredDarkMatter } = getNextDarkMatterRequirement()
    safeUpdateClass("#rebirthButton4 .button", "button-collapse", inReachDarkMatter)
    renderProgessResource("#rebirthButton4 .button",
        getDynamicProgress(gameData.dark_matter, requiredDarkMatter),
        getDynamicProgress(gameData.dark_matter + getDarkMatterGainAvailable(), requiredDarkMatter),
        'color-dark-matter',
        requiredDarkMatter
    )

    // базовая видимость
    let rebirthButton1Visible = allowRebirth(1)
    let rebirthButton2Visible = allowRebirth(2)
    let rebirthButton3Visible = allowRebirth(3)
    let rebirthButton4Visible = allowRebirth(4)
    let rebirthButton5Visible = allowRebirth(5)

    if (gameData.requirements["Magic Eye"].completed || (isInMetaverse() && gameData.dark_matter > 0))
        rebirthButton1Visible = false

    if (gameData.rebirthThreeCount > 30) {
        if (gameData.dark_matter > 0 || gameData.essence > 0 || gameData.evil > 0)
            rebirthButton2Visible = true

        if (gameData.dark_matter > 0 || gameData.essence > 0)
            rebirthButton3Visible = true
    }

    if (gameData.rebirthFourCount > 30) {
        if (gameData.dark_matter > 0)
            rebirthButton4Visible = true
    }

    // кастомная видимость кнопки 5
    if (getHypercubeCap() == Infinity && gameData.essence < 1e90)
        rebirthButton5Visible = false

    safeUpdateClass("rebirthButton1", "hidden", !rebirthButton1Visible)
    safeUpdateClass("rebirthButton2", "hidden", !rebirthButton2Visible)
    safeUpdateClass("rebirthButton3", "hidden", !rebirthButton3Visible)
    safeUpdateClass("rebirthButton4", "hidden", !rebirthButton4Visible)
    safeUpdateClass("rebirthButton5", "hidden", !rebirthButton5Visible)


    // чтобы не ебать мозг, дизеблим кнопки всегда, даже если они невидимы, чтобы так надо вот почему   
    const buttonsConfig = [
        { id: "rebirthButton1", req: "Rebirth note 2" },
        { id: "rebirthButton2", req: "Rebirth note 3" },
        { id: "rebirthButton3", req: "Rebirth note 6" },
        { id: "rebirthButton4", req: "Rebirth note 7" }
    ];

    buttonsConfig.forEach(({ id, req }) => {
        safeUpdateDisabled(`#${id} .button`, !gameData.requirements[req].completed)
    });


    // Challenges
    const isActiveChallenge = gameData.active_challenge !== ""

    safeUpdateHidden("challengeTitle", !isActiveChallenge)
    if (isActiveChallenge) {
        safeUpdateText("challengeName", getFormattedTitle(gameData.active_challenge))
        renderCurrentChallengeRewardValue(true)

        const totalChallenges = Object.keys(gameData.challenges).length;
        for (let i = 1; i <= totalChallenges; i++) {
            const isVisible = getChallengeName(i) === gameData.active_challenge;
            renderCurrentChallengeReward(elById("sidebarChallengeReward" + i), isVisible);
        }
    }



    renderEventUI()

    if (gameData.settings.EPSidebar)
        renderEvilPerksSideBar()

    // global box 
    const infoQuickBar = elById("infoQuickBar")

    const isPaused = gameData.paused;
    const hasChallenge = gameData.active_challenge !== "";
    const inMetaverse = isInMetaverse();

    safeUpdateClass(infoQuickBar, "sidebar-box-game-paused", isPaused);
    safeUpdateClass(infoQuickBar, "sidebar-box-in-challenge", !isPaused && hasChallenge);
    safeUpdateClass(infoQuickBar, "sidebar-box-boost-active", !isPaused && !hasChallenge && inMetaverse && gameData.boost_active);
    safeUpdateClass(infoQuickBar, "sidebar-box-boost-ready", !isPaused && !hasChallenge && inMetaverse && !gameData.boost_active && gameData.boost_cooldown <= 0);
}

const uiEventStyleCache = {
    currentStyle: null
};

function renderEventUI() {
    const event_id = getCurrentEventId();
    if (event_id === 0) {
        safeUpdateHidden("eventInfo", true);
        uiEventStyleCache.currentStyle = null;
        return;
    }

    safeUpdateHidden("eventInfo", false);

    const event = eventsData[event_id];

    safeUpdateText("eventName", event.name);
    safeUpdateText("eventDescription", event.desc);
    safeUpdateText("eventBuff", event.effect + event.mult);
    safeUpdateText("eventTime", formatTime(getSecondsUntilEventEnd()));

    if (uiEventStyleCache.currentStyle !== event.style) {
        const elInfo = elById("eventInfo");
        const elBuff = elById("eventBuff");

        if (elInfo && elBuff) {
            elInfo.className = `event-info ${event.style}`;
            elBuff.className = event.style;
            uiCache.classes.delete(elInfo);
            uiCache.classes.delete(elBuff);
            uiEventStyleCache.currentStyle = event.style;
        }
    }
}
/*
function renderProgessResource(selector, progressPercent, pendingPercent = progressPercent, targetColorClass = 'color-income', visible = true) {
    // TODO
    const progressContainer = el(`${selector} .req-progress-container`)
    const progressBar = el(`${selector} .req-progress-bar`)
    const pendingBar = el(`${selector} .req-pending-bar`)

    if (!progressContainer) return;

    if (progressPercent == Infinity || Number.isNaN(progressPercent)) {
        visible = false;
    }

    const targetVisibility = visible ? "visible" : "hidden";
    if (progressContainer.style.visibility !== targetVisibility) {
        progressContainer.style.visibility = targetVisibility;
    }

    if (!visible) return;

    const currentWidth = min(progressPercent, 100);
    const totalPendingWidth = min(pendingPercent, 100);

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
}*/

function renderProgessResource(selector, progressPercent, pendingPercent = progressPercent, targetColorClass = 'color-income', visible = true) {
    const progressContainer = el(`${selector} .req-progress-container`);
    if (!progressContainer) return;

    if (progressPercent === Infinity || Number.isNaN(progressPercent)) {
        visible = false;
    }

    const targetVisibility = visible ? "visible" : "hidden";
    safeUpdateStyle(progressContainer, "visibility", targetVisibility);

    if (!visible) return;

    const progressBar = el(`${selector} .req-progress-bar`);
    const pendingBar = el(`${selector} .req-pending-bar`);

    const currentWidth = Math.min(progressPercent, 100);
    const totalPendingWidth = Math.min(pendingPercent, 100);

    const nextWidthStr = fastFloorToString(currentWidth, 2) + "%";
    const nextPendingWidthStr = fastFloorToString(totalPendingWidth, 2) + "%";

    safeUpdateStyle(progressBar, "width", nextWidthStr);
    safeUpdateStyle(pendingBar, "width", nextPendingWidthStr);

    safeUpdateClass(progressBar, "color-income", targetColorClass === "color-income");
    safeUpdateClass(progressBar, "color-evil", targetColorClass === "color-evil");
    safeUpdateClass(progressBar, "color-essence", targetColorClass === "color-essence");
    safeUpdateClass(progressBar, "color-dark-matter", targetColorClass === "color-dark-matter");
    safeUpdateClass(progressBar, "color-hypercubes", targetColorClass === "color-hypercubes");
    safeUpdateClass(progressBar, "is-complete", currentWidth === 100);

    safeUpdateClass(pendingBar, "color-income", targetColorClass === "color-income");
    safeUpdateClass(pendingBar, "color-evil", targetColorClass === "color-evil");
    safeUpdateClass(pendingBar, "color-essence", targetColorClass === "color-essence");
    safeUpdateClass(pendingBar, "color-dark-matter", targetColorClass === "color-dark-matter");
    safeUpdateClass(pendingBar, "color-hypercubes", targetColorClass === "color-hypercubes");
    safeUpdateClass(pendingBar, "is-complete", totalPendingWidth === 100);
}

function renderProgressBar(task, progressFill, progressBar) {
    let isTurbo = false;
    let isBreakTrough = !task.isHero && task.maxXP.gte(DECIMAL_1E305);

    const gameDaysTotal = task.getGameDaysTotalForCurrentLevel();

    if (gameDaysTotal !== Infinity) {
        const gameSpeed = gameData.game_speed

        if (gameSpeed > 0) {
            const realSecondsForLevel = gameDaysTotal / gameSpeed

            if (realSecondsForLevel < 0.4)
                isTurbo = true;
        }
    }

    safeUpdateClass(progressFill, "progress-turbo", isTurbo && gameData.settings.taskAnimations);

    const widthPercent = isTurbo || isBreakTrough ? 100 : task.getTaskXpProgressFraction() * 100
    const newWidth = fastFloorToString(widthPercent, 2) + "%"
    safeUpdateStyle(progressFill, "width", newWidth)

    safeUpdateClass(progressFill, "hero", task.isHero)
    safeUpdateClass(progressBar, "hero", task.isHero)

    safeUpdateClass(progressFill, "breakthrough", isBreakTrough);
    safeUpdateClass(progressBar, "breakthrough", isBreakTrough);
}



function renderTaskRow(task) {
    const row = task.row

    safeUpdateText(`${row} .progressBar .name`, (task.isHero ? "Great " : "") + task.name, task.name + ".name");

    const progressBar = el(`${row} .progressBar`);
    const progressFill = el(`${row} .progressFill`);
    renderProgressBar(task, progressFill, progressBar);

    safeUpdateText(`${row} .level`, formatLevel(task.level), task.name + ".level");
    safeUpdateText(`${row} .maxLevel`, formatLevel(task.maxLevel), task.name + ".maxLevel");
}

function renderJobs() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (!(task instanceof Job)) continue

        renderTaskRow(task);

        formatCoins(el(`${task.row} .value .income`), task.getIncome())
    }
}

function renderSkills() {
    for (const key in gameData.taskData) {
        const task = gameData.taskData[key]
        if (!(task instanceof Skill)) continue

        renderTaskRow(task);

        safeUpdateText(`${task.row} .value .effect`, task.getEffectDescription(), task.name + ".value.effect")
    }
}

function renderShop() {
    for (const key in gameData.itemData) {
        const item = gameData.itemData[key]
        const expense = item.getExpense()
        const row = item.row

        safeUpdateDisabled(`${row} .button`, gameData.coins < expense)
        safeUpdateClass(`${row} .button .name`, "legendary", isHeroesUnlocked())

        const color = autoBuyEnabled
            ? item.isProperty ? headerRowColors["Properties_Auto"] : headerRowColors["Misc_Auto"]
            : item.isProperty ? headerRowColors["Properties"] : headerRowColors["Misc"]

        const isItemActive = gameData.currentMisc.includes(item) || item == gameData.currentProperty
        const backgroundColor = isItemActive ? color : "white"
        safeUpdateStyle(`${row} .active`, "backgroundColor", backgroundColor)
        safeUpdateText(`${row} .effect`, item.getEffectDescription(), "id" + item.name + ".effect")

        formatCoins(el(`${row} .expense`), expense, 1)
    }
}

const numberWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const numberWordsCapitalized = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

function renderRebirth() {
    safeUpdateText("age0", getAge0Requirement())
    safeUpdateText("age1", getAge1Requirement())
    safeUpdateText("age1a", getEyeRequirement())

    // 1. Evil
    const evilReq = getEvilRequirement()
    const evilText = evilReq === 200 ? "2 whole centuries" :
        evilReq === 100 ? "1 century" :
            `${evilReq} years`
    safeUpdateText("age2", evilText)
    safeUpdateText("age2a", evilReq)

    // 2. Void
    const voidReq = getVoidRequirement()
    const voidText = voidReq === 1000 ? "a millennium" :
        voidReq > 100 ? `${voidReq / 100} whole centuries` :
            "1 century"

    const voidWordText = voidReq === 1000 ? "thousand " : `${numberWords[voidReq / 100]} hundred `

    safeUpdateText("age3", voidText)
    safeUpdateText("age3a", voidWordText)

    // 3. Celestial
    const celestialReq = getCelestialRequirement()
    let celestialText = ""

    if (celestialReq >= 1000) {
        celestialText = celestialReq === 1000 ? "a millennium" : `${numberWords[celestialReq / 1000]} millennia`
    } else {
        celestialText = celestialReq === 100 ? "1 century" : `${celestialReq / 100} whole centuries`
    }

    const celestialCapitalized = celestialText.charAt(0).toUpperCase() + celestialText.slice(1)

    safeUpdateText("age4", celestialText)
    safeUpdateText("age4a", celestialCapitalized)
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
        safeUpdateHidden("evilperkCostDiv" + i, perkCost == Infinity)
        safeUpdateHidden("evilperkBuyDiv" + i, perkCost == Infinity)
        const button = elById("evilperk" + i)
        renderEvilPerkButton(button, i, perkCost)
    }
}

function renderEvilPerkButton(button, i, perkCost) {
    const isCompleted = perkCost === Infinity;
    const canBuy = !isCompleted && gameData.evil_perks_points >= perkCost;

    safeUpdateClass(button, "evilperkcompleted", isCompleted);

    if (isCompleted || canBuy) {
        safeUpdateStyle(button, "backgroundImage", "");
    } else {
        const rawPercent = (gameData.evil_perks_points / perkCost) * 100;
        const percent = fastFloorToString(rawPercent, 2);
        const gradient = `linear-gradient(to right, rgb(240, 80, 80) 0%, rgb(180, 0, 0) ${percent}%, rgb(128, 128, 128) ${percent}%, rgb(128, 128, 128) 100%)`;
        safeUpdateStyle(button, "backgroundImage", gradient);
    }
}

const sideBarRequirements = [
    () => getEyeRequirement(),
    () => getEvilRequirement(),
    () => getVoidRequirement(),
    () => getCelestialRequirement(),
    () => format(getEssenceReward())
];


function renderEvilPerksSideBar() {
    safeUpdateText("evilperksDisplaySideBar", format(gameData.evil_perks_points, 1))

    for (var i = 1; i <= 5; i++) {
        safeUpdateText("reqSideBar" + i, sideBarRequirements[i - 1]());

        // Обновляем стоимость и состояние перка
        const perkCost = getEvilPerkCost(i)
        safeUpdateClass("evilperkSideBar" + i, "hidden", perkCost === Infinity)

        if (perkCost !== Infinity) {
            safeUpdateText("evilperkCostSideBar" + i, format(perkCost, 1))
            safeUpdateHidden("evilperkCostDivSideBar" + i, perkCost === Infinity)
            const button = elById("evilperkSideBar" + i)
            renderEvilPerkButton(button, i, perkCost)
        }
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
        const isCurrentActive = (i == active_challenge_id);
        const challengeElementId = getChallengeName(i, true) + "Challenge";
        const rewardElement = elById("currentChallengeReward" + i);

        safeUpdateClass("challengeButton" + i, "hidden", isCurrentActive);
        safeUpdateClass("exitChallenge" + i, "hidden", !isCurrentActive);
        safeUpdateClass(challengeElementId, "active-challenge", isCurrentActive);

        renderCurrentChallengeReward(rewardElement, isCurrentActive);
    }

    safeUpdateText("challengeGoal1", format(getChallengeGoal("an_unhappy_life")))
    safeFormatCoins("challengeGoal2", getChallengeGoal("rich_and_the_poor"))
    safeUpdateText("challengeGoal3", format(getChallengeGoal("time_does_not_fly")))
    safeUpdateText("challengeGoal4", format(getChallengeGoal("dance_with_the_devil")))
    safeUpdateText("challengeGoal5", getFormattedChallengeTaskGoal("Chairman", floor(getChallengeGoal("legends_never_die"))))
    safeUpdateText("challengeGoal6", getFormattedChallengeTaskGoal("Sigma Proioxis", floor(100 * (getChallengeGoal("the_darkest_time") - 1))))

    safeUpdateHidden("challengeReward1", gameData.challenges.an_unhappy_life == 0)
    safeUpdateHidden("challengeReward2", gameData.challenges.rich_and_the_poor == 0)
    safeUpdateHidden("challengeReward3", gameData.challenges.time_does_not_fly == 0)
    safeUpdateHidden("challengeReward4", gameData.challenges.dance_with_the_devil == 0)
    safeUpdateHidden("challengeReward5", gameData.challenges.legends_never_die == 0)
    safeUpdateHidden("challengeReward6", gameData.challenges.the_darkest_time == 0)

    for (i = 1; i <= challenges_count; i++) {
        const completed = gameData.requirements["Challenge_" + getChallengeName(i)].completed
        safeUpdateDisabled(`#challengeButton${i} button`, !completed)
        safeUpdateHidden(`#challengeButton${i} span`, completed)
    }

    renderCurrentChallengeRewardValue()

    safeUpdateText("challengeHappinessBuff", format(getChallengeBonus("an_unhappy_life"), 2))
    safeUpdateText("challengeIncomeBuff", format(getChallengeBonus("rich_and_the_poor"), 2))
    safeUpdateText("challengeTimewarpingBuff", format(getChallengeBonus("time_does_not_fly"), 2))
    safeUpdateText("challengeEssenceGainBuff", format(getChallengeBonus("dance_with_the_devil"), 2))
    safeUpdateText("challengeEvilGainBuff", format(getChallengeBonus("legends_never_die"), 2))
    safeUpdateText("challengeDarkMatterGainBuff", format(getChallengeBonus("the_darkest_time"), 2))

    safeUpdateHidden("challenge5MetaverseLifespanDebuff", gameData.rebirthFiveCount == 0)
}


function renderCurrentChallengeReward(elementReward, visible) {
    safeUpdateClass(elementReward, "hidden", !visible);
    if (visible) {
        const isBonusBetter = getCurrentChallengeBonusByName(gameData.active_challenge) > getChallengeBonusByName(gameData.active_challenge);
        safeUpdateClass(elementReward, "reward", isBonusBetter);
    } else {
        safeUpdateClass(elementReward, "reward", false);
    }
}

function renderCurrentChallengeRewardValue(isSidebar = false) {
    const totalChallenges = Object.keys(gameData.challenges).length;

    for (let i = 1; i <= totalChallenges; i++) {
        if (isSidebar) {
            safeUpdateText(`sidebarCurrentChallengeBuff${i}`, format(getCurrentChallengeBonusById(i), 2))
            safeUpdateText(`sidebarChallengeBuff${i}`, format(getChallengeBonusById(i), 2))
        }
        else {
            safeUpdateText(`currentChallengeBuff${i}`, format(getCurrentChallengeBonusById(i), 2))
        }
    }
}

function renderMilestones() {
    for (const key in milestoneData) {
        const milestone = milestoneData[key]
        const row = getQuerySelector(milestone.name)
        safeUpdateText(`${row} .essence`, format(milestone.expense), milestone.name + ".essence")


        // TODO: Переписать на !== или typeof, когда определится точная структура требований (может быть undefined)

        let desc = milestone.description

        if (milestone.getEffect != null)
            desc = "x" + format(milestone.getEffect(), 1) + " " + desc
        else if (milestone.baseData.effect != null)
            desc = "x" + format(milestone.baseData.effect, 0) + " " + desc

        if (key == "Magic Eye")
            desc = desc.replace('65', getEyeRequirement())

        safeUpdateText(`${row} .description`, desc, milestone.name + ".description")
    }
}

function renderBoostButton(elemName) {
    const boostButton = elById(elemName);
    if (!boostButton) return;

    const isActive = gameData.boost_active;
    const isCooldown = !isActive && gameData.boost_cooldown > 0;

    safeUpdateClass(boostButton, "perk-boost-active", isActive);
    safeUpdateClass(boostButton, "perk-boost-cooldown", isCooldown);

    safeUpdateDisabled(boostButton, !canApplyBoost());
}

function renderMetaverse() {
    safeUpdateHidden("currentHypercubesCap", getHypercubeCap() === Infinity);
    safeUpdateText("currentHypercubesCapValue", format(getHypercubeCap()))

    for (var i = 0; i < 3; i++) {
        const nextH = getNextPowerOfNumber(gameData.hypercubes * pow(10, i))
        const newText = format(nextH) + " Hypercubes in " + formatTime(getTimeTillNextHypercubePower(i))
        const elem = elById("timeTillNextHypercubePower" + (i + 1))

        safeUpdateText(elem, newText)


        if (i > 0) {
            const shouldHide = nextH > getHypercubeCap() || getTotalPerkPoints() === 0 || gameData.hypercubes < 1e20 * pow(10, i);
            safeUpdateHidden(elem, shouldHide);
        } else {
            safeUpdateHidden(elem, false);
        }
    }

    renderBoostButton("boostMetaButton")

    safeUpdateText("hypercubesMetaDisplay", format(gameData.hypercubes))
    safeUpdateText("hypercubesBonusMetaDisplay", "x" + format(getHypercubeGeneration() / 0.03))
    safeUpdateText("boostCooldownMetaDisplay", getBoostCooldownString())

    safeUpdateText("reduceBoostCooldown", formatTime(getBoostCooldownSeconds()))
    safeUpdateText("reduceBoostCooldownCost", format(reduceBoostCooldownCost()))
    safeUpdateDisabled("reduceBoostCooldownBuyButton", !canBuyReduceBoostCooldown())

    safeUpdateText("boostDuration", formatTime(getBoostTimeSeconds()))
    safeUpdateText("boostDurationCost", format(boostDurationCost()))
    safeUpdateDisabled("boostDurationBuyButton", !canBuyBoostDuration())

    safeUpdateText("hypercubeGain", format(getHypercubeGeneration() * gameData.game_speed, 2))
    safeUpdateText("hypercubeGainCost", format(hypercubeGainCost()))
    safeUpdateDisabled("hypercubeGainBuyButton", !canBuyHypercubeGain())

    safeUpdateText("evilTranGain", format(evilTranGain(), 2))
    safeUpdateText("evilTranCost", format(evilTranCost()))
    safeUpdateDisabled("evilTranBuyButton", !canBuyEvilTran())

    safeUpdateText("essenceMultGain", format(essenceMultGain(), 2))
    safeUpdateText("essenceMultCost", format(essenceMultCost()))
    safeUpdateDisabled("essenceMultButton", !canBuyEssenceMult())

    const isAltarActive = gameData.metaverse.challenge_altar !== 0;
    safeUpdateText("challengeAltarCost", format(challengeAltarCost()))
    safeUpdateText("challengeAltarState", isAltarActive ? "Active" : isAltarActive)
    safeUpdateDisabled("challengeAltarButton", !canBuyChallengeAltar())
    safeUpdateClass("challengeAltarButton", "hidden", isAltarActive)


    safeUpdateText("darkMatterMultGain", format(darkMatterMultGain(), 2))
    safeUpdateText("darkMatterMultCost", format(darkMatterMultCost()))
    safeUpdateDisabled("darkMaterMultButton", !canBuyDarkMatterMult())

    // Perks
    renderMataversePerksInfo()
    renderMetaversePerkButtons()
}

function renderMataversePerksInfo() {
    safeUpdateText("perkPointDisplay", formatTreshold(gameData.perks_points))
    safeUpdateText("totalPerkPointDisplay", formatTreshold(getTotalPerkPoints()))

    // Info
    const isTheEndNear = gameData.requirements["The End is near"].completed;

    safeUpdateHidden("mppInfo", isTheEndNear);
    safeUpdateHidden("mppInfo2", !isTheEndNear);

    if (isTheEndNear) {
        safeUpdateText("mppDMBuff", format(getUnspentPerksDarkmatterGainBuff()));
    }
}

function renderMetaversePerkButtons() {
    const total_mpp = getTotalPerkPoints();
    let hide_next = false;
    let index = 0;

    for (const perkName of getSortedPerks()) {
        const key = perkName[0];
        const button = elById("id" + key);
        if (!button) continue;

        if (hide_next) {
            safeUpdateClass(button, "hidden", true);
        } else {
            safeUpdateClass(button, "hidden", false);

            const isActive = gameData.perks[key] !== 0;
            safeUpdateClass(button, "active-perk", isActive);

            const perk_cost = getPerkCost(key);
            const perkNameElement = el(`#id${key} .perkName`);
            const isAvailable = total_mpp >= perk_cost;

            safeUpdateClass(button, "perk-locked", !isAvailable);

            if (isAvailable) {
                safeUpdateText(perkNameElement, getMetaversePerkName(key));
            } else {
                safeUpdateText(perkNameElement, "LOCKED");

                if (index % 2 === 1) {
                    hide_next = true;
                }
            }
        }
        index++;
    }
}

function renderDarkMatter() {
    renderDarkMatterResources();
    renderDarkMatterShop();
    renderDarkMatterSkillTree();
}

function renderDarkMatterResources() {
    const { dark_matter, dark_orbs, settings } = gameData;

    safeUpdateText("darkMatterShopDisplay", dark_matter < 1e6 ? round(dark_matter) : format(dark_matter));
    safeUpdateText("darkMatterSkillsDisplay", settings.layout === 0 ? "" : format(dark_matter));
    safeUpdateText("darkOrbsShopDisplay", formatTreshold(dark_orbs))

    const nextCost = min(
        getADealWithTheChairmanCost(),
        getAGiftFromGodCost(),
        getLifeCoachCost(),
        getGottaBeFastCost()
    );

    const currentProgress = getDynamicProgress(dark_orbs, nextCost);

    renderProgessResource(
        "#darkOrbsProgress",
        currentProgress,
        undefined,
        'color-dark-matter',
        nextCost
    );
}


function renderDarkMatterShop() {

    function renderButton(elemName, condition) {
        safeUpdateDisabled(elemName, !condition)
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
    shopItems.forEach(item => safeUpdateText(item.id, item.text));


    const aMiracleBuyButton = elById("aMiracleBuyButton");
    const hasMiracle = gameData.dark_matter_shop.a_miracle;
    const isEnoughDarkMatter = gameData.dark_matter > 1000;
    const isMiracleVisible = !hasMiracle || !isEnoughDarkMatter;
    safeUpdateClass(aMiracleBuyButton, "hidden", !isMiracleVisible);
    if (isMiracleVisible)
        safeUpdateText(aMiracleBuyButton, hasMiracle ? "Refund" : "Buy a Miracle");

    const isGeneratorInfinity = getDarkOrbGeneration() === Infinity;
    safeUpdateClass("darkOrbGeneratorBuyButton", "hidden", isGeneratorInfinity);

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
        safeUpdateClass(item.id, "hidden", isHidden);
        const costContainer = elById(item.costId)?.closest("div");
        if (costContainer) {
            safeUpdateClass(costContainer, "hidden", isHidden);
        }
    });

    const canBuyAny = purchaseStatus.slice(2).some(item => item.canBuy);
    const hasAnyValidCost = toggleItems.some(item => item.cost !== Infinity);
    const isMetaverseCompleted = isInMetaverse();
    const showBuyAll = isMetaverseCompleted && hasAnyValidCost;
    safeUpdateClass("darkOrbsBuyAllButton", "hidden", !showBuyAll);

    if (showBuyAll) {
        renderButton("darkOrbsBuyAllButton", canBuyAny);
    }
}

function renderDarkMatterSkillTreeButton(id, categoryBought, elementBought, canBuy) {
    const hasBothSkillsPerk = gameData.perks.both_dark_mater_skills !== 0;
    const element = elById(id); // Оставляем получение элемента, чтобы передавать объект

    if (!hasBothSkillsPerk) {
        safeUpdateDisabled(element, categoryBought || !canBuy);

        if (categoryBought) {
            safeUpdateText(id, elementBought ? "Accepted" : "Rejected");
            safeUpdateClass(element, "w3-green", elementBought);
            safeUpdateClass(element, "w3-red", !elementBought);
        } else {
            safeUpdateText(id, "Buy");
            safeUpdateClass(element, "w3-green", false);
            safeUpdateClass(element, "w3-red", false);
        }
    } else {
        safeUpdateDisabled(element, elementBought);
        safeUpdateText(id, elementBought ? "Accepted" : "Buy");

        safeUpdateClass(element, "w3-green", elementBought);
        safeUpdateClass(element, "w3-red", false);
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
        const currentCost = DARK_MATTER_SKILL_COSTS[skill.costIndex];
        const canAfford = gameData.dark_matter >= currentCost;

        renderDarkMatterSkillTreeButton(`${skill.id}1`, skillState !== 0, [1, 3].includes(skillState), canAfford);
        renderDarkMatterSkillTreeButton(`${skill.id}2`, skillState !== 0, [2, 3].includes(skillState), canAfford);
        safeUpdateText(`darkMatterSkillCost${skill.costIndex}`, format(currentCost))
    });

    const toggleElements = (className, isHidden) => {
        allByClass(className).forEach(elem => {
            safeUpdateHidden(elem, isHidden);
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

    for (let i = 1; i <= 5; i++) {
        const capitalizedWord = numberWordsCapitalized[i]

        const count = gameData[`rebirth${capitalizedWord}Count`];
        const time = gameData[`rebirth${capitalizedWord}Time`];
        const fastest = gameData.stats[`fastest${i}`];

        safeUpdateClass(`statsRebirth${i}`, "hidden", count <= 0);
        safeUpdateText(`rebirth${capitalizedWord}CountDisplay`, count);
        safeUpdateText(`rebirth${capitalizedWord}TimeDisplay`, formatTime(time));
        safeUpdateText(`rebirth${capitalizedWord}FastestDisplay`, formatTime(fastest, true));
    }

    // Gain Stats
    safeUpdateText("evilPerSecondDisplay", format(gameData.stats.EvilPerSecond, 3))
    safeUpdateText("maxEvilPerSecondDisplay", format(gameData.stats.maxEvilPerSecond, 3))
    safeUpdateText("maxEvilPerSecondRtDisplay", formatTime(gameData.stats.maxEvilPerSecondRt))

    safeUpdateText("essencePerSecondDisplay", format(gameData.stats.EssencePerSecond, 3))
    safeUpdateText("maxEssencePerSecondDisplay", format(gameData.stats.maxEssencePerSecond, 3))
    safeUpdateText("maxEssencePerSecondRtDisplay", formatTime(gameData.stats.maxEssencePerSecondRt))

    // Challenge Stats
    safeUpdateHidden("challengeStat1", gameData.challenges.an_unhappy_life == 0)
    safeUpdateHidden("challengeStat2", gameData.challenges.rich_and_the_poor == 0)
    safeUpdateHidden("challengeStat3", gameData.challenges.time_does_not_fly == 0)
    safeUpdateHidden("challengeStat4", gameData.challenges.dance_with_the_devil == 0)
    safeUpdateHidden("challengeStat5", gameData.challenges.legends_never_die == 0)
    safeUpdateHidden("challengeStat6", gameData.challenges.the_darkest_time == 0)

    safeUpdateText("challengeHappinessBuffDisplay", format(getChallengeBonus("an_unhappy_life"), 2))
    safeUpdateText("challengeIncomeBuffDisplay", format(getChallengeBonus("rich_and_the_poor"), 2))
    safeUpdateText("challengeTimewarpingBuffDisplay", format(getChallengeBonus("time_does_not_fly"), 2))
    safeUpdateText("challengeEssenceGainBuffDisplay", format(getChallengeBonus("dance_with_the_devil"), 2))
    safeUpdateText("challengeEvilGainBuffDisplay", format(getChallengeBonus("legends_never_die"), 2))
    safeUpdateText("challengeDarkMaterGainBuffDisplay", format(getChallengeBonus("the_darkest_time"), 2))

    // Next Events
    const events = getPendingEvents()
    for (var i = 0; i <= 10; i++) {
        elById("NextEvent" + i).innerHTML = events[i]
    }

    safeUpdateHidden("NextEvent0", events[0] == "")
}

function renderRequirements() {
    // управляет видимостью по селекторам в requirements

    const tabRequirementKeys = Object.values(tabToRequirementMap);

    for (const key in gameData.requirements) {
        const requirement = gameData.requirements[key];
        const isCompleted = requirement.completed;
        const shouldBlink = isCompleted && tabRequirementKeys.includes(key) && !gameData.viewedTabs[key];

        for (const element of requirement.elements) {
            safeUpdateClass(element, "hidden", !isCompleted);
            safeUpdateClass(element, "blink-highlight", shouldBlink);
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
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.style.color = (gameData.settings.theme == 2) ? headerRowTextColors[categoryName] : "#ffffff"
    headerRow.classList.add(toId(categoryName))
    headerRow.classList.add("headerRow")

    return headerRow
}

function createRequiredRow(categoryName) {
    const row = document.querySelector(".requiredRowTemplate").content.firstElementChild.cloneNode(true)
    row.classList.add("requiredRow")
    row.dataset.category = categoryName
    row.id = "reqRow" + toId(categoryName)
    return row
}


function createRow(templates, name, categoryName, categoryType, categoryTypeName) {
    const row = templates.row.content.firstElementChild.cloneNode(true)

    row.querySelector(".name").textContent = name
    row.id = "row" + toId(name)

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

    if (categoryTypeName === "job") {
        row.querySelector(`.value .income`).style.display = 'inline' // jobs
        row.querySelector(`.value .effect`).style.display = 'none'  // skills
    }
    else if (categoryTypeName === "skill") {
        row.querySelector(`.value .income`).style.display = 'none' // jobs
        row.querySelector(`.value .effect`).style.display = 'inline'  // skills
    }
    return row
}

/*
    createAllRows(jobCategories, "jobTable", "job")
    createAllRows(skillCategories, "skillTable", "skill")
    createAllRows(itemCategories, "itemTable", "item")
    createAllRows(milestoneCategories, "milestoneTable", "milestone")
*/

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

    const table = elById(tableId)

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

function setStickySidebar(sticky, needsave = true) {
    gameData.settings.stickySidebar = sticky

    const settingsStickySidebar = elById("settingsStickySidebar")
    settingsStickySidebar.checked = sticky

    const infoQuickBar = elById("infoQuickBar")
    infoQuickBar.style.position = sticky ? 'sticky' : 'initial'
    infoQuickBar.style.zIndex = sticky ? '100' : 'initial'
    if (needsave)
        saveGameData()
}

function setRequireShiftForTooltip(requireShiftForTooltip, needsave = true) {
    gameData.settings.requireShiftForTooltip = requireShiftForTooltip
    const settingsRequireShiftForTooltip = elById("settingsRequireShiftForTooltip")
    settingsRequireShiftForTooltip.checked = requireShiftForTooltip
    if (needsave)
        saveGameData()
}

function setTaskAnimations(taskAnimations, needsave = true) {
    gameData.settings.taskAnimations = taskAnimations
    const settingsTaskAnimations = elById("settingsTaskAnimations")
    settingsTaskAnimations.checked = taskAnimations
    if (needsave)
        saveGameData()
}

setTaskAnimations

function setEPSidebar(enabled, needsave = true) {
    gameData.settings.EPSidebar = enabled
    const settingsEPSidebar = elById("settingsEPSidebar")
    settingsEPSidebar.checked = enabled
    elById("sidebarEP").classList.toggle("hidden", !enabled)

    if (needsave)
        saveGameData()
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
    const infoPage = elById("infoPage");
    const infoQuickBar = elById("infoQuickBar");
    const infoTabPage = elById("info");
    const infoTabButton = elById("infoTabButton");
    const quickButtons = elById("quickButtons");
    const sidebarQuickButtons = elById("sidebarQuickButtons");
    const infoQuickButtons = elById("infoQuickButtons");


    if (!infoPage || !infoQuickBar || !infoTabPage || !infoTabButton) return;

    const isWide = e.matches;

    infoQuickBar.hidden = !isWide;
    safeUpdateClass(infoTabPage, "hidden", isWide);
    safeUpdateClass(infoTabButton, "hidden", isWide);

    if (isWide) {
        infoQuickBar.appendChild(infoPage);
        sidebarQuickButtons.appendChild(quickButtons)

        if (gameData.settings.selectedTab === Tab.INFO) {
            setTab(Tab.HERO);
        }
    } else {
        infoTabPage.appendChild(infoPage);
        infoQuickButtons.appendChild(quickButtons)
    }
}

function setCurrency(index, needsave = true) {
    gameData.settings.currencyNotation = index
    selectElementInGroup("CurrencyNotation", index)
    if (needsave)
        saveGameData()
}

function setNotation(index, needsave = true) {
    gameData.settings.numberNotation = index
    selectElementInGroup("Notation", index)
    if (needsave)
        saveGameData()
}

async function setTheme(index, reload = true) {
    if (index == 0 && reload) {
        const userWantsLightMode = await showLightModeConfirm();
        if (!userWantsLightMode)
            return
    }

    const body = elById("body")

    safeUpdateClass(body, "dark", index === 1);
    safeUpdateClass(body, "colorblind", index === 2);

    gameData.settings.theme = index
    selectElementInGroup("Theme", index)

    if (reload) {
        clearInterval(saveloop)
        clearInterval(gameloop)
        pauseRender()
        saveGameData()
        location.reload()
    }
}

function setEnableKeybinds(enableKeybinds, needsave = true) {
    gameData.settings.enableKeybinds = enableKeybinds
    selectElementInGroup("EnableKeybinds", enableKeybinds ? 0 : 1)
    if (needsave)
        saveGameData()
}

function setLayout(id, needsave = true) {
    gameData.settings.layout = id

    const isWideLayout = (id == 0)

    const skillsTabBtn = elById("skillsTabButton")
    const shopTabBtn = elById("shopTabButton")
    const skillsTab = elById("skills")
    const shopTab = elById("shop")
    const tabcolumn = elById("tabcolumn")
    const maincolumn = elById("maincolumn")

    const jobs = elById("jobs")
    const jobPage = elById("jobPage")
    const skillPage = elById("skillPage")
    const itemPage = elById("itemPage")
    const skillTreePage = elById("skillTreePage")

    const tabcolumnDM = elById("tabcolumnDarkMater")
    const shopTabDM = elById("shopTab")
    const maincolumnDM = elById("maincolumnDarkMatter")
    const dmTitle = elById("skillTreePageDarkMaterTitle")

    const tabcolumnMeta = elById("tabcolumnMetaverse")
    const metaverseTab1 = elById("metaverseTab1")
    const metaverseTab2 = elById("metaverseTab2")
    const metaversePage2 = elById("metaversePage2")
    const maincolumnMeta = elById("maincolumnMetaverse")

    if (isWideLayout) {
        skillsTabBtn?.classList.add("hidden")
        shopTabBtn?.classList.add("hidden")
        skillsTab?.classList.add("hidden")
        shopTab?.classList.add("hidden")

        tabcolumn?.classList.remove("tabs-tab-column")
        tabcolumn?.classList.add("plain-tab-column")

        maincolumn?.classList.remove("tabs-main-column")
        maincolumn?.classList.add("plain-main-column")

        if (jobs && jobPage && skillPage && itemPage) {
            jobs.appendChild(jobPage)
            jobs.appendChild(skillPage)
            jobs.appendChild(itemPage)
        }

        if (jobPage) jobPage.style.flex = 1
        if (skillPage) skillPage.style.flex = 1
        if (itemPage) itemPage.style.flex = 1
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

    if (isWideLayout) {
        tabcolumnDM?.classList.add("hidden")
        shopTabDM?.appendChild(skillTreePage)
        setTabDarkMatter("shopTab", false)

        maincolumnDM?.classList.remove("settings-main-column")
        if (dmTitle) dmTitle.textContent = "Dark Matter Abilities "
    } else {
        tabcolumnDM?.classList.remove("hidden")
        const skillTreeTab = elById("skillTreeTab")
        skillTreeTab?.appendChild(skillTreePage)

        maincolumnDM?.classList.add("settings-main-column")
        if (dmTitle) dmTitle.textContent = "Dark Matter: "
    }

    if (isWideLayout) {
        tabcolumnMeta?.classList.add("hidden")
        metaverseTab1?.appendChild(metaversePage2)
        setTabMetaverse("metaverseTab1", false)

        maincolumnMeta?.classList.remove("settings-main-column")
    } else {
        tabcolumnMeta?.classList.remove("hidden")
        metaverseTab2?.appendChild(metaversePage2)

        maincolumnMeta?.classList.add("settings-main-column")
    }

    selectElementInGroup("Layout", isWideLayout ? 1 : 0)

    gameData.settings.layout = id
    if (needsave)
        saveGameData()
}

function setFontSizeLarger() {
    const before = gameData.settings.fontSize
    setFontSize(gameData.settings.fontSize + 1)
    const after = gameData.settings.fontSize
    console.log(`setFontSizeLarger ${before} -> ${after} current: (${elById("body").style.fontSize})`)
}

function setFontSizeSmaller() {
    const before = gameData.settings.fontSize
    setFontSize(gameData.settings.fontSize - 1)
    const after = gameData.settings.fontSize
    console.log(`setFontSizeSmaller ${before} -> ${after} current: (${elById("body").style.fontSize})`)
}

function setFontSizeDefault() {
    const before = gameData.settings.fontSize
    setFontSize(3)
    const after = gameData.settings.fontSize
    console.log(`setFontSizeDefault ${before} -> ${after} current: (${elById("body").style.fontSize})`)
}

function setFontSize(id, needsave = true) {
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
    elById("body").style.fontSize = fontSizes[id]

    if (needsave)
        saveGameData()
}

function setSignDisplay(net) {
    const signDisplay = elById("signDisplay")

    if (net > -1 && net < 1) {
        safeUpdateText("signDisplay", "")
        signDisplay.style.color = "gray"
    } else if (net > 0) {
        safeUpdateText("signDisplay", "+")
        signDisplay.style.color = "green"
    } else {
        safeUpdateText("signDisplay", "-")
        signDisplay.style.color = "red"
    }
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
 * @param {boolean} isUserAction
 */
function setTab(selectedTab, needsave = true) {
    const tabElement = elById(selectedTab)

    if (tabElement == null) {
        setTab(Tab.JOBS, needsave)
        return
    }

    gameData.settings.selectedTab = selectedTab

    // Update the UI when switching tabs to prevent flikering.
    if (needsave)
        updateUI()

    const element = elById(selectedTab + "TabButton")

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
    if (needsave)
        saveGameData()
}


function setSubTab(tab, tabClassName, buttonClassName, needsave = true) {
    const element = elById(tab + "TabButton")

    // Скрываем все вкладки этой категории через кэш
    allByClass(tabClassName).forEach(function (t) {
        t.style.display = "none"
    })

    const currentTabEl = elById(tab);
    if (currentTabEl) currentTabEl.style.display = "flex"

    allByClass(buttonClassName).forEach(function (btn) {
        btn.classList.remove("w3-blue-gray")
    })

    if (element)
        element.classList.add("w3-blue-gray")

    if (needsave)
        saveGameData()
}


function setTabSettings(tab, needsave = true) {
    if (tab === 'changelogTab') {
        const changelogEl = el("#changelog");
        if (changelogEl && changelogEl.textContent !== changelogText)
            changelogEl.textContent = changelogText;
    }

    gameData.settings.settingsTab = tab
    setSubTab(tab, "tabSettings", "tabButtonSettings", needsave)
}

function setTabDarkMatter(tab, needsave = true) {
    gameData.settings.darkMatterTab = tab
    setSubTab(tab, "tabDarkMatter", "tabButtonDarkMatter", needsave)
}

function setTabMetaverse(tab, needsave = true) {
    gameData.settings.metaverseTab = tab
    setSubTab(tab, "tabMetaverse", "tabButtonMetaverse", needsave)
}

function changeTab(direction) {
    const tabs = allByClass("tab")
    const tabButtons = allByClass("tabButton")

    let currentTab = tabs.findIndex(tab =>
        !tab.style.display.includes("none") && !tab.classList.contains("hidden")
    )
    if (currentTab === -1) currentTab = 0

    let targetTab = currentTab + direction

    if (targetTab < 0) {
        setTab(Tab.SETTINGS, true)
        return
    }

    if (targetTab > tabs.length - 1) targetTab = 0

    let attempts = 0;
    while (
        tabButtons[targetTab] &&
        (tabButtons[targetTab].style.display.includes("none") || tabButtons[targetTab].classList.contains("hidden"))
    ) {
        targetTab = targetTab + direction
        if (targetTab > tabs.length - 1) targetTab = 0
        if (targetTab < 0) targetTab = tabs.length - 1

        attempts++
        if (attempts > tabs.length) break
    }

    if (tabs[targetTab]) {
        setTab(tabs[targetTab].id, true)
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
    const perksLayout = elById(perkLayoutName)
    for (const perkName of getSortedPerks()) {
        const perk = createPerk(buttonTemplate, perkName[0])
        perksLayout.appendChild(perk)
    }
}

function createPerk(template, name) {
    const button = template.content.firstElementChild.cloneNode(true)
    button.querySelector(".perkName").textContent = getMetaversePerkName(name)
    button.querySelector(".perkCost").textContent = getPerkCost(name)
    button.id = "id" + toId(name)
    button.onclick = () => { buyPerk(name) }
    button.classList.add("tooltip")
    button.setAttribute('data-type', 'meta_perk')
    button.setAttribute('data-name', name)
    return button
}

function toggleChallenge(challengeName) {
    if (!gameData.requirements["Challenges"].completed || gameData.evil < 10000)
        return

    if (gameData.active_challenge == challengeName)
        exitChallenge()
    else {
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
    clearInterval(saveloop);

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

    elById("settingsTabButton").classList.add("hidden")

    const SEPARATE_TAB_HIDE = true;
    const ENABLE_GLITCH_EFFECT = false;
    const GLITCH_DURATION = 1000;
    const TAB_SWITCH_DELAY = 700;

    const congratsPanel = elById('Congratulations');
    if (congratsPanel) congratsPanel.style.pointerEvents = 'none';

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

    function applyGlitch(callback) {
        if (!ENABLE_GLITCH_EFFECT) {
            callback();
            return;
        }

        const styleId = 'glitch-animation-style';
        if (!elById(styleId)) {
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
            const styleElement = elById(styleId);
            if (styleElement) styleElement.remove();
            callback();
        }, GLITCH_DURATION);
    }

    applyGlitch(() => {

        const tabColumn = elById('tabcolumn');

        if (SEPARATE_TAB_HIDE && tabColumn) {
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
                    fadeOut(tabColumn, 0, startStep2);
                    return;
                }

                const currentTab = visibleTabs[currentTabIndex];

                currentTab.click();

                const onClickAttr = currentTab.getAttribute('onClick') || '';
                const match = onClickAttr.match(/setTab\(['"](.+?)['"]\)/);
                const tabId = match ? match[1] : null;
                const associatedPage = tabId ? elById(tabId) : null;

                setTimeout(() => {
                    let tabFadeDone = false;
                    let pageFadeDone = false;

                    function checkNext() {
                        if (tabFadeDone && pageFadeDone) {
                            currentTabIndex--;
                            processNextTab();
                        }
                    }

                    fadeOut(currentTab, 1000, () => {
                        tabFadeDone = true;
                        checkNext();
                    });

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
            fadeOut(tabColumn, 1500, startStep2);
        }

        function startStep2() {
            const mainColumn = elById('maincolumn');
            fadeOut(mainColumn, 0, startStep3);
        }

        function startStep3() {
            const infoPage = elById('infoPage');
            const infoQuickBar = elById('infoQuickBar');

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

function showLightModeConfirm() {
    return new Promise((resolve) => {
        const modal = elById('custom-confirm');
        const titleEl = elById('modal-title');
        const textEl = elById('modal-text');
        const confirmBtn = elById('modal-confirm-btn');
        const cancelBtn = elById('modal-cancel-btn');

        const warning = getRandomWarning();
        titleEl.textContent = warning.title;
        textEl.textContent = warning.text;

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
        const modal = elById('game-confirm');
        const titleEl = elById('game-modal-title');
        const textEl = elById('game-modal-text');
        const confirmBtn = elById('game-modal-confirm-btn');
        const cancelBtn = elById('game-modal-cancel-btn');
        const inputEl = elById('game-modal-input');

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
            let secondsLeft = ceil(delay / 1000);
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


