/**
 * 
 * @param {string} taskName 
 * @returns 
 */
function getChallengeTaskGoalProgress(taskName) {
    const task = gameData.taskData[taskName]
    if (!task) return 0

    return task.level * (task.isHero ? 1000 : 1)
}

function resetChallenges() {
    for (const challenge in gameData.challenges) {
        gameData.challenges[challenge] = 0
    }
    updateAllChallengeBonusCache()
}

function updateAllChallengeBonusCache() {
    const c = gameData.challenges;
    const cb = gameData.challengeBonuses;

    cb["an_unhappy_life"] = softcap(pow((c.an_unhappy_life || 0) + 1, 0.31), 500, 0.45);
    cb["rich_and_the_poor"] = softcap(pow((c.rich_and_the_poor || 0) + 1, 0.25), 25, 0.55);
    cb["time_does_not_fly"] = softcap(pow((c.time_does_not_fly || 0) + 1, 0.055), 2);
    cb["dance_with_the_devil"] = softcap(pow((c.dance_with_the_devil || 0) + 1, 0.09), 2, 0.75);
    cb["legends_never_die"] = softcap(pow((c.legends_never_die || 0) + 1, 0.85), 25, 0.6);
    cb["the_darkest_time"] = softcap(pow((c.the_darkest_time || 0) + 1, 0.85), 25, 0.6);
}

/**
 * 
 * @param {string} challengeName 
 * @returns 
 */
function enterChallenge(challengeName) {
    if (!gameData.requirements["Challenge_" + challengeName].completed)
        return

    const alreadyInChallenge = gameData.active_challenge !== "";

    if (alreadyInChallenge)
        setChallengeProgress()

    rebirthReset(false)
    gameData.active_challenge = challengeName
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0

    if (!alreadyInChallenge) {
        for (const taskName in gameData.taskData) {
            const task = gameData.taskData[taskName];
            gameData.savedMaxLevels[taskName] = task.maxLevel;
            task.maxLevel = 0;
        }
    } else {
        for (const taskName in gameData.taskData) {
            const task = gameData.taskData[taskName];
            task.maxLevel = 0;
        }
    }
}

function exitChallenge() {
    setChallengeProgress()
    rebirthReset(false)
    gameData.active_challenge = ""
    gameData.rebirthOneTime = 0
    gameData.rebirthTwoTime = 0

    if (gameData.savedMaxLevels) {
        for (const taskName in gameData.taskData) {
            const task = gameData.taskData[taskName];
            task.maxLevel = gameData.savedMaxLevels[taskName] || 0;
        }
    } else {
        for (const taskName in gameData.taskData) {
            const task = gameData.taskData[taskName];
            task.maxLevel = 0;
        }
    }
}


function setChallengeProgress() {
    if (gameData.active_challenge == "an_unhappy_life") {
        gameData.challenges.an_unhappy_life = max(gameData.challenges.an_unhappy_life, getHappiness())
    }
    else if (gameData.active_challenge == "rich_and_the_poor") {
        gameData.challenges.rich_and_the_poor = max(gameData.challenges.rich_and_the_poor, totalIncome)
    }
    else if (gameData.active_challenge == "time_does_not_fly") {
        gameData.challenges.time_does_not_fly = max(gameData.challenges.time_does_not_fly, gameData.game_speed / baseGameSpeed)
    }
    else if (gameData.active_challenge == "dance_with_the_devil") {
        gameData.challenges.dance_with_the_devil = max(gameData.challenges.dance_with_the_devil, max(0, getEvilGain() - 10))
    }
    else if (gameData.active_challenge == "legends_never_die") {
        gameData.challenges.legends_never_die = max(gameData.challenges.legends_never_die, getChallengeTaskGoalProgress("Chairman"))
    }
    else if (gameData.active_challenge == "the_darkest_time") {
        gameData.challenges.the_darkest_time = max(gameData.challenges.the_darkest_time, getChallengeTaskGoalProgress("Sigma Proioxis") / 100)
    }

    updateAllChallengeBonusCache();
}

const getChallengeBonus = getChallengeBonusByName;

/**
 * 
 * @param {string} challenge_name 
 * @returns 
 */
function getChallengeBonusByName(challenge_name) {
    return gameData.challengeBonuses[challenge_name] || 1;
}

/**
 * 
 * @param {number} challenge_id 
 * @returns 
 */
function getChallengeBonusById(challenge_id) {
    const cb = gameData.challengeBonuses;
    switch (challenge_id) {
        case 1: return cb["an_unhappy_life"] || 1;
        case 2: return cb["rich_and_the_poor"] || 1;
        case 3: return cb["time_does_not_fly"] || 1;
        case 4: return cb["dance_with_the_devil"] || 1;
        case 5: return cb["legends_never_die"] || 1;
        case 6: return cb["the_darkest_time"] || 1;
        default: return 1;
    }
}

/**
 * 
 * @param {string} challenge_name 
 * @returns 
 */
function getCurrentChallengeBonusByName(challenge_name) {
    switch (challenge_name) {
        case "an_unhappy_life": return softcap(pow(getHappiness() + 1, 0.31), 500, 0.45);
        case "rich_and_the_poor": return softcap(pow(totalIncome + 1, 0.25), 25, 0.55);
        case "time_does_not_fly": return softcap(pow((gameData.game_speed / baseGameSpeed) + 1, 0.055), 2);
        case "dance_with_the_devil": return softcap(pow(max(0, getEvilGain() - 10) + 1, 0.09), 2, 0.75);
        case "legends_never_die": return softcap(pow(getChallengeTaskGoalProgress("Chairman") + 1, 0.85), 25, 0.6);
        case "the_darkest_time": return softcap(pow((getChallengeTaskGoalProgress("Sigma Proioxis") / 100.0) + 1, 0.85), 25, 0.6);
        default: return 1;
    }
}

/**
 * 
 * @param {number} challenge_id 
 * @returns 
 */
function getCurrentChallengeBonusById(challenge_id) {
    switch (challenge_id) {
        case 1: return softcap(pow(getHappiness() + 1, 0.31), 500, 0.45);
        case 2: return softcap(pow(totalIncome + 1, 0.25), 25, 0.55);
        case 3: return softcap(pow((gameData.game_speed / baseGameSpeed) + 1, 0.055), 2);
        case 4: return softcap(pow(max(0, getEvilGain() - 10) + 1, 0.09), 2, 0.75);
        case 5: return softcap(pow(getChallengeTaskGoalProgress("Chairman") + 1, 0.85), 25, 0.6);
        case 6: return softcap(pow((getChallengeTaskGoalProgress("Sigma Proioxis") / 100.0) + 1, 0.85), 25, 0.6);
        default: return 1;
    }
}



/**
 * 
 * @param {number} challenge_id 
 * @param {boolean} camel_case 
 * @returns 
 */
function getChallengeName(challenge_id, camel_case = false) {
    if (camel_case) {
        switch (challenge_id) {
            case 1: return "anUnhappyLife"
            case 2: return "theRichAndThePoor"
            case 3: return "timeDoesNotFly"
            case 4: return "danceWithTheDevil"
            case 5: return "legendsNeverDie"
            case 6: return "theDarkestTime"
        }
    }
    else {
        switch (challenge_id) {
            case 1: return "an_unhappy_life"
            case 2: return "rich_and_the_poor"
            case 3: return "time_does_not_fly"
            case 4: return "dance_with_the_devil"
            case 5: return "legends_never_die"
            case 6: return "the_darkest_time"
        }
    }
}

/**
 * 
 * @param {string | number} challenge_name_or_id 
 * @returns {number}
 */
function getChallengeGoal(challenge_name_or_id) {
    let challenge_name = typeof challenge_name_or_id === "number" ? getChallengeName(challenge_name_or_id) : challenge_name_or_id;

    switch (challenge_name) {
        case "an_unhappy_life":
            return gameData.challenges.an_unhappy_life + 1
        case "rich_and_the_poor":
            return gameData.challenges.rich_and_the_poor + 1
        case "time_does_not_fly":
            return max(1, gameData.challenges.time_does_not_fly + 0.1)
        case "dance_with_the_devil":
            return gameData.challenges.dance_with_the_devil + 10.1
        case "legends_never_die":
            return gameData.challenges.legends_never_die + 1
        case "the_darkest_time":
            return gameData.challenges.the_darkest_time + 1
    }

    return Infinity
}