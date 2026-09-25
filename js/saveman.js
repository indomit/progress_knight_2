const isSmallScreen = window.matchMedia("(max-width: 48em)").matches;
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

function setDefaultSettings() {
    const isMoblie = (isSmallScreen || isTouchDevice)

    // 1 std // 0 wide
    gameData.settings.layout = isMoblie ? 1 : 0
    gameData.settings.requireShiftForTooltip = isMoblie

}

function createMilestoneRequirements() {
    for (const key in milestoneBaseData) {
        const milestone = milestoneData[key]
        gameData.requirements[milestone.name] = new EssenceRequirement([getQuerySelector(milestone.name)],
            [{ requirement: milestone.expense }])
    }
}

function createRequirements() {
    gameData.requirements = {}

    for (const key in requirementsBaseData) {
        const baseRequirement = requirementsBaseData[key]

        gameData.requirements[key] = Object.assign(
            Object.create(Object.getPrototypeOf(baseRequirement)),
            baseRequirement
        )
    }
}

function restorePrototypes() {
    for (const key in gameData.taskData) {
        let task = gameData.taskData[key]
        if ("income" in task.baseData)
            task = Object.assign(new Job(jobBaseData[task.name]), task)
        else
            task = Object.assign(new Skill(skillBaseData[task.name]), task)


        task.xp = new Decimal(task.xp || 0)
        gameData.taskData[key] = task
    }


    gameData.jobData = {};
    gameData.skillData = {};
    for (const key in gameData.taskData) {
        const t = gameData.taskData[key];
        if (t instanceof Job) gameData.jobData[key] = t;
        else if (t instanceof Skill) gameData.skillData[key] = t;
    }

    for (const key in gameData.itemData) {
        let item = gameData.itemData[key]
        item.baseData = itemBaseData[item.name]
        item = Object.assign(new Item(itemBaseData[item.name]), item)
        gameData.itemData[key] = item
    }

    if (gameData.currentProperty?.name && gameData.itemData?.[gameData.currentProperty.name]) {
        gameData.currentProperty = gameData.itemData[gameData.currentProperty.name];
    } else {
        gameData.currentProperty = gameData.itemData["Homeless"]
    }

    const newArray = []
    for (const misc of gameData.currentMisc) {
        newArray.push(gameData.itemData[misc.name])
    }
    gameData.currentMisc = newArray
}

/**
 * 
 * @param {any} data 
 * @returns 
 */
function isValidSaveData(data) {
    if (!data || typeof data !== 'object') return false;

    const requiredKeys = [
        'taskData',
        'itemData',
        'coins',
        'days',
        'evil'
    ];

    for (const key of requiredKeys) {
        if (!(key in data)) return false;
    }

    if (typeof data.taskData !== 'object' || typeof data.itemData !== 'object') {
        return false;
    }

    return true;
}

/**
 * 
 * @param {any} saveDict 
 * @param {any} gameDict 
 */
function syncSaveWithGameData(saveDict, gameDict) {
    for (const key in gameDict) {
        if (!(key in saveDict)) {
            saveDict[key] = gameDict[key]
        }
    }

    for (const key in saveDict) {
        if (!(key in gameDict)) {
            delete saveDict[key]
        }
    }
}

function saveGameData(data = gameData) {
    if (gameData.p4)
        return

    const { requirements, ...saveCopy } = data;
    saveCopy.save_date_time = Date.now()
    saveCopy.completed_requirements = Object.keys(data.requirements).filter(key => data.requirements[key].completed);
    localStorage.setItem("gameDataSave", JSON.stringify(saveCopy))
}

function loadGameData() {
    try {
        const gameDataSave = JSON.parse(localStorage.getItem("gameDataSave") ?? "null")
        if (!gameDataSave) {
            // default settings
            createRequirements()
            createMilestoneRequirements()
            setDefaultSettings()
        }
        else {
            // When the game contains completedTimes, add 2 Dark Matter and remove the instance.
            if ("completedTimes" in gameDataSave && gameDataSave["completedTimes"] > 0) {
                delete gameDataSave["completedTimes"]
                gameDataSave.dark_matter ??= 0
                gameDataSave.dark_matter += 2
            }

            syncSaveWithGameData(gameDataSave, gameData)
            syncSaveWithGameData(gameDataSave.taskData, gameData.taskData)
            syncSaveWithGameData(gameDataSave.itemData, gameData.itemData)
            syncSaveWithGameData(gameDataSave.settings, gameData.settings)
            syncSaveWithGameData(gameDataSave.stats, gameData.stats)
            syncSaveWithGameData(gameDataSave.challenges, gameData.challenges)
            syncSaveWithGameData(gameDataSave.dark_matter_shop, gameData.dark_matter_shop)
            syncSaveWithGameData(gameDataSave.metaverse, gameData.metaverse)
            syncSaveWithGameData(gameDataSave.perks, gameData.perks)

            // migration from old save for completed requirements
            if (!("completed_requirements" in gameDataSave)) {
                if (gameDataSave.requirements) {
                    if (Array.isArray(gameDataSave.requirements)) {
                        gameDataSave.completed_requirements = gameDataSave.requirements;
                    } else {
                        // old save
                        for (const key in gameDataSave.requirements) {
                            if (gameDataSave.requirements[key].completed) {
                                gameDataSave.completed_requirements.push(key);
                            }
                        }
                    }
                }
            }


            gameData = gameDataSave

            // copy actual requirements
            createRequirements()
            createMilestoneRequirements()

            // set completed state
            gameData.completed_requirements.forEach(name => {
                if (gameData.requirements[name]) {
                    gameData.requirements[name].completed = true;
                    gameData.requirements[name].needs_rerender = true;
                }
            });

            // fix for old saves
            if (gameData.dark_orbs > 0 && gameData.dark_matter === 0 && !gameData.requirements["Dark Matter"].completed) {
                gameData.requirements["Dark Matter"].completed = true
                gameData.requirements["Dark Matter"].needs_rerender = true
            }

            gameData.coins ??= 0
            gameData.essence ??= 0
            gameData.days ??= 365 * 14
            gameData.evil ??= 0
            gameData.dark_matter ??= 0
            gameData.dark_orbs ??= 0
            gameData.hypercubes ??= 0
            gameData.perks_points ??= 0

            gameData.settings.theme ??= 1
            gameData.rebirthOneTime ||= gameData.realtime
            gameData.rebirthTwoTime ||= gameData.realtime
            gameData.rebirthThreeTime ||= gameData.realtime
            gameData.rebirthFourTime ||= gameData.realtime

            gameData.currentMisc = gameData.currentMisc.filter((element) => element instanceof Item)


        }
        restorePrototypes()
        setCustomEffects()
        initializeSkillBindings()
        initializeItemBindings()
        addMultipliers()
        updateAllChallengeBonusCache()

    } catch (error) {
        console.error(error)
        console.log(localStorage.getItem("gameDataSave"))
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
    }
}

async function resetGameData() {

    function restoreLoops() {
        startGameLoop()
        startSaveLoop()
    }

    stopSaveLoop()
    stopGameLoop()

    let isConfirmed = await customConfirm({
        title: "HARD RESET",
        text: "Are you absolutely sure you want to reset the game? You will lose ALL your progress forever!",
        confirmText: "Yes, wipe everything",
        cancelText: "No, save my save!",
        confirmColor: "red",
        cancelColor: "green",
        delay: 3000
    });

    if (!isConfirmed) {
        restoreLoops();
        return;
    }

    isConfirmed = await customConfirm({
        title: "FINAL WARNING",
        text: "This action is irreversible. To confirm deletion, please type RESET in the field below:",
        requiredText: "RESET",
        confirmText: "DELETE PERMANENTLY",
        confirmColor: "red",
        cancelText: "I changed my mind",
        cancelColor: "green"
    });

    if (!isConfirmed) {
        restoreLoops();
        return;
    }

    localStorage.clear();
    location.reload();
}