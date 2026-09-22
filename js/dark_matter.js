// Costs Dark Matter
function getDarkOrbGeneratorCost() {
    return 1 + 3 * gameData.dark_matter_shop.dark_orb_generator
}

function canBuyDarkOrbGenerator() {
    return gameData.dark_matter >= getDarkOrbGeneratorCost() && getDarkOrbGeneration() !== Infinity
}


function buyDarkOrbGenerator() {
    if (canBuyDarkOrbGenerator()) {
        gameData.dark_matter -= getDarkOrbGeneratorCost()
        gameData.dark_matter_shop.dark_orb_generator += 1
    }
}

// Costs Dark Orbs
function getADealWithTheChairmanCost() {
    return pow(1e3, gameData.dark_matter_shop.a_deal_with_the_chairman + 1)
}

function canBuyADealWithTheChairman() {
    return gameData.dark_orbs >= getADealWithTheChairmanCost() && getADealWithTheChairmanCost() !== Infinity
}

function buyAllDarkOrbsUpgrades() {
    while (canBuyADealWithTheChairman())
        buyADealWithTheChairman()
    while (canBuyAGiftFromGod())
        buyAGiftFromGod()
    while (canBuyGottaBeFast())
        buyGottaBeFast()
    while (canBuyLifeCoach())
        buyLifeCoach()
}

function buyADealWithTheChairman() {
    if (canBuyADealWithTheChairman()) {
        gameData.dark_orbs -= getADealWithTheChairmanCost()
        gameData.dark_matter_shop.a_deal_with_the_chairman += 1
    }
}

function getAGiftFromGodCost() {
    return pow(1e5, gameData.dark_matter_shop.a_gift_from_god + 1)
}

function canBuyAGiftFromGod() {
    return gameData.dark_orbs >= getAGiftFromGodCost() && getAGiftFromGodCost() !== Infinity
}

function buyAGiftFromGod() {
    if (canBuyAGiftFromGod()) {
        gameData.dark_orbs -= getAGiftFromGodCost()
        gameData.dark_matter_shop.a_gift_from_god += 1
    }
}

function getLifeCoachCost() {
    return pow(1e10, gameData.dark_matter_shop.life_coach + 1)
}

function canBuyLifeCoach() {
    return gameData.dark_orbs >= getLifeCoachCost() && getLifeCoachCost() !== Infinity
}

function buyLifeCoach() {
    if (canBuyLifeCoach()) {
        gameData.dark_orbs -= getLifeCoachCost()
        gameData.dark_matter_shop.life_coach += 1
    }
}

function getGottaBeFastCost() {
    return pow(5e7, gameData.dark_matter_shop.gotta_be_fast + 1)
}

function canBuyGottaBeFast() {
    return gameData.dark_orbs >= getGottaBeFastCost() && getGottaBeFastCost() !== Infinity
}

function buyGottaBeFast() {
    if (canBuyGottaBeFast()) {
        gameData.dark_orbs -= getGottaBeFastCost()
        gameData.dark_matter_shop.gotta_be_fast += 1
    }
}

// Rewards
function getDarkOrbGeneration() {
    if (gameData.dark_matter_shop.dark_orb_generator == 0) return 0

    const darkOrbiter = gameData.requirements["Dark Orbiter"].completed ? 1e10 : 1

    return pow(100, gameData.dark_matter_shop.dark_orb_generator - 1) * darkOrbiter
}

function getTaaAndMagicXpGain() {
    if (gameData.active_challenge == "the_darkest_time") return 1

    return pow(4, gameData.dark_matter_shop.a_deal_with_the_chairman)
}

function getAGiftFromGodEssenceGain() {
    if (gameData.active_challenge == "the_darkest_time") return 1

    return pow(2.1, gameData.dark_matter_shop.a_gift_from_god)
}

function getLifeCoachIncomeGain() {
    // TODO check slow?

    if (gameData.active_challenge == "the_darkest_time") return 1

    return pow(14, gameData.dark_matter_shop.life_coach)
}

function getGottaBeFastGain() {
    if (gameData.active_challenge == "the_darkest_time") return 1

    return 1 + 0.2 * gameData.dark_matter_shop.gotta_be_fast
}

function getAMiracleCost() {
    return 10
}

// Permanent unlocks
function canBuyAMiracle() {
    return gameData.dark_matter >= getAMiracleCost()
}

/**
 * 
 * @param {boolean} forceState 
 * @returns 
 */
function toggleAMiracle(forceState) {
    const shouldEnable = forceState !== undefined ? forceState : !gameData.dark_matter_shop.a_miracle;

    if (shouldEnable) {
        if (canBuyAMiracle()) {
            gameData.dark_matter_shop.a_miracle = true;
            gameData.dark_matter -= getAMiracleCost();
            gameData.requirements["Magic Eye"].completed = true;
            return true;
        }
        return false;
    } else {
        if (gameData.dark_matter_shop.a_miracle) {
            gameData.dark_matter_shop.a_miracle = false;
            gameData.dark_matter += getAMiracleCost();
            gameData.requirements["Magic Eye"].completed = false;
            return true;
        }
        return false;
    }
}

async function buyAMiracle() {
    if (gameData.dark_matter_shop.a_miracle) {
        toggleAMiracle(false);
        return;
    }

    if (canBuyAMiracle()) {
        if (gameData.dark_matter < 30) {
            const isConfirmed = await customConfirm({
                title: "CONFIRM PURCHASE",
                text: "Are you sure you want to buy A Miracle? Your XP gain will decrease!",
                confirmText: "Buy",
                cancelText: "Cancel"
            });

            if (!isConfirmed) return;
        }

        toggleAMiracle(true);
    }
}


// Skill tree
async function resetSkillTree() {
    const needConfirmation = gameData.dark_matter < 1e11;

    const isConfirmed = needConfirmation
        ? await customConfirm({
            title: "RESET ABILITIES",
            text: "Are you sure you want to reset your Dark Matter Abilities? You will NOT get your Dark Matter back!",
            confirmText: "Yes, reset it and lose Dark Matter",
            cancelText: "Save my precious Dark Matter",
            confirmColor: "red",
            cancelColor: "green"
        })
        : true;

    if (isConfirmed) {
        gameData.dark_matter_shop.speed_is_life = 0;
        gameData.dark_matter_shop.your_greatest_debt = 0;
        gameData.dark_matter_shop.essence_collector = 0;
        gameData.dark_matter_shop.explosion_of_the_universe = 0;
        gameData.dark_matter_shop.multiverse_explorer = 0;

        return true;
    }

    return false;
}


function buySpeedOfLife(number) {
    buyDarkMatterSkill("speed_is_life", DARK_MATTER_SKILL_COSTS[1], number)
}

function buyYourGreatestDebt(number) {
    buyDarkMatterSkill("your_greatest_debt", DARK_MATTER_SKILL_COSTS[2], number)
}

function buyEssenceCollector(number) {
    buyDarkMatterSkill("essence_collector", DARK_MATTER_SKILL_COSTS[3], number)
}

function buyExplosionOfTheUniverse(number) {
    buyDarkMatterSkill("explosion_of_the_universe", DARK_MATTER_SKILL_COSTS[4], number)
}

function buyMultiverseExplorer(number) {
    buyDarkMatterSkill("multiverse_explorer", DARK_MATTER_SKILL_COSTS[5], number)
}

const DARK_MATTER_SKILL_COSTS = [0, 100, 10000, 50000, 500000, 1000000000];

function buyDarkMatterSkill(skill_name, cost, number) {
    if (gameData.dark_matter >= cost) {
        gameData.dark_matter -= cost

        if (gameData.dark_matter_shop[skill_name] == 0)
            gameData.dark_matter_shop[skill_name] = number
        else if (gameData.dark_matter_shop[skill_name] == 1 && (number == 2 || number == 3))
            gameData.dark_matter_shop[skill_name] = 3
        else if (gameData.dark_matter_shop[skill_name] == 2 && (number == 1 || number == 3))
            gameData.dark_matter_shop[skill_name] = 3
        else
            gameData.dark_matter += cost
    }
}

function getDarkMatterSkillIncome() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0

    if (gameData.perks.positive_dark_mater_skills)
        return 1

    let income = 1
    const shop = gameData.dark_matter_shop

    const debt = shop.your_greatest_debt
    if (debt === 1 || debt === 3) income *= 0.1
    if (debt === 2 || debt === 3) income *= 0.5

    const collector = shop.essence_collector
    if (collector === 2 || collector === 3) income *= 0.04

    const explosion = shop.explosion_of_the_universe
    if (explosion === 2 || explosion === 3) income *= 0.00001

    return income
}

function getDarkMatterSkillTimeWarping() {
    if (gameData.active_challenge == "the_darkest_time")
        return 1

    let timewarping = 1
    const shop = gameData.dark_matter_shop
    const positive = gameData.perks.positive_dark_mater_skills

    const speed = shop.speed_is_life
    if (speed === 1 || speed === 3) timewarping *= 3
    if (speed === 2 || speed === 3) timewarping *= 7

    const multiverse = shop.multiverse_explorer
    if (multiverse === 1 || multiverse === 3) timewarping *= positive ? 1 : 0.001

    return timewarping
}

function getDarkMatterSkillXP() {
    if (gameData.active_challenge == "the_darkest_time")
        return 1

    let xp = 1
    const shop = gameData.dark_matter_shop

    const debt = shop.your_greatest_debt
    if (debt === 1 || debt === 3) xp *= 500

    const explosion = shop.explosion_of_the_universe
    if (explosion === 1 || explosion === 3) xp *= 1e100
    if (explosion === 2 || explosion === 3) xp *= 1e150

    return xp
}

function getDarkMatterSkillEssence() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0.25

    let ess = 1
    const shop = gameData.dark_matter_shop
    const positive = gameData.perks.positive_dark_mater_skills

    const speed = shop.speed_is_life
    if (!positive && (speed === 2 || speed === 3)) ess *= 0.5

    const explosion = shop.explosion_of_the_universe
    if (!positive && (explosion === 1 || explosion === 3)) ess *= 0.5

    const collector = shop.essence_collector
    if (collector === 1 || collector === 3) ess *= 500
    if (collector === 2 || collector === 3) ess *= 1000

    const multiverse = shop.multiverse_explorer
    if (multiverse === 1 || multiverse === 3) ess *= 5000
    if (multiverse === 2 || multiverse === 3) ess *= 10000

    return ess
}

function getDarkMatterSkillEvil() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0.25

    let evil = 1
    const shop = gameData.dark_matter_shop
    const positive = gameData.perks.positive_dark_mater_skills

    const debt = shop.your_greatest_debt
    if (debt === 2 || debt === 3) evil *= 100

    const speed = shop.speed_is_life
    if (!positive && (speed === 1 || speed === 3)) evil *= 0.5

    const collector = shop.essence_collector
    if (!positive && (collector === 1 || collector === 3)) evil *= 0.5

    return evil
}


function getDarkMatterSkillDarkMater() {
    if (gameData.active_challenge == "the_darkest_time")
        return 1

    const multiverse = gameData.dark_matter_shop.multiverse_explorer
    return (!gameData.perks.positive_dark_mater_skills && (multiverse === 2 || multiverse === 3)) ? 0.01 : 1
}