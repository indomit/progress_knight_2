function enterChallenge(challengeName) {
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
        gameData.challenges.an_unhappy_life = Math.max(gameData.challenges.an_unhappy_life, getHappiness())
    }
    else if (gameData.active_challenge == "rich_and_the_poor") {
        gameData.challenges.rich_and_the_poor = Math.max(gameData.challenges.rich_and_the_poor, getIncome())
    }
    else if (gameData.active_challenge == "time_does_not_fly") {
        gameData.challenges.time_does_not_fly = Math.max(gameData.challenges.time_does_not_fly, getUnpausedGameSpeed() / baseGameSpeed)
    }
    else if (gameData.active_challenge == "dance_with_the_devil") {
        gameData.challenges.dance_with_the_devil = Math.max(gameData.challenges.dance_with_the_devil, Math.max(0, getEvilGain() - 10))
    }
    else if (gameData.active_challenge == "legends_never_die") {
        gameData.challenges.legends_never_die = Math.max(gameData.challenges.legends_never_die, getChallengeTaskGoalProgress("Chairman"))
    }
    else if (gameData.active_challenge == "the_darkest_time") {
        gameData.challenges.the_darkest_time = Math.max(gameData.challenges.the_darkest_time, getChallengeTaskGoalProgress("Sigma Proioxis") / 100)
    }
}

function getChallengeBonus(challenge_name, current = false) {
    if (challenge_name == "an_unhappy_life" || challenge_name == 1) {
        return softcap(Math.pow((current ? getHappiness() : gameData.challenges.an_unhappy_life) + 1, 0.31), 500, 0.45)
    }
    else if (challenge_name == "rich_and_the_poor" || challenge_name == 2) {
        return softcap(Math.pow((current ? getIncome() : gameData.challenges.rich_and_the_poor) + 1, 0.25), 25, 0.55)
    }
    else if (challenge_name == "time_does_not_fly" || challenge_name == 3) {
        return softcap(Math.pow((current ? getUnpausedGameSpeed() / baseGameSpeed : gameData.challenges.time_does_not_fly) + 1, 0.055), 2)
    }
    else if (challenge_name == "dance_with_the_devil" || challenge_name == 4) {
        return softcap(Math.pow((current ? Math.max(0, getEvilGain() - 10) : gameData.challenges.dance_with_the_devil) + 1, 0.09), 2, 0.75)
    }
    else if (challenge_name == "legends_never_die" || challenge_name == 5) {
        return softcap(Math.pow((current ? getChallengeTaskGoalProgress("Chairman") : gameData.challenges.legends_never_die) + 1, 0.85), 25, 0.6)
    }
    else if (challenge_name == "the_darkest_time" || challenge_name == 6) {
        return softcap(Math.pow((current ? getChallengeTaskGoalProgress("Sigma Proioxis") / 100.0 : gameData.challenges.the_darkest_time) + 1, 0.85), 25, 0.6)
    }
}


function getChallengeName(challenge_id, camel_case = false)
{
    if (camel_case){
        switch (challenge_id){
        case 1: return "anUnhappyLife"
        case 2: return "theRichAndThePoor"
        case 3: return "timeDoesNotFly"
        case 4: return "danceWithTheDevil"
        case 5: return "legendsNeverDie"
        case 6: return "theDarkestTime"
        }
    }
    else{
        switch (challenge_id){
        case 1: return "an_unhappy_life"
        case 2: return "rich_and_the_poor"
        case 3: return "time_does_not_fly"
        case 4: return "dance_with_the_devil"
        case 5: return "legends_never_die"
        case 6: return "the_darkest_time"
        }
    }
}

function getChallengeGoal(challenge_name) {
    if (challenge_name == "an_unhappy_life" || challenge_name == 1) {
        return gameData.challenges.an_unhappy_life + 1
    }
    else if (challenge_name == "rich_and_the_poor" || challenge_name == 2) {
        return gameData.challenges.rich_and_the_poor + 1
    }
    else if (challenge_name == "time_does_not_fly" || challenge_name == 3) {
        return Math.max(1, gameData.challenges.time_does_not_fly + 0.1)
    }
    else if (challenge_name == "dance_with_the_devil" || challenge_name == 4) {
        return gameData.challenges.dance_with_the_devil + 10.1
    }
    else if (challenge_name == "legends_never_die" || challenge_name == 5) {
        return gameData.challenges.legends_never_die + 1
    }
    else if (challenge_name == "the_darkest_time" || challenge_name == 6) {
        return gameData.challenges.the_darkest_time + 1
    }
}