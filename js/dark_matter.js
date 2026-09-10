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
    return Math.pow(1e3, gameData.dark_matter_shop.a_deal_with_the_chairman + 1)
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
    return Math.pow(1e5, gameData.dark_matter_shop.a_gift_from_god + 1)
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
    return Math.pow(1e10, gameData.dark_matter_shop.life_coach + 1)
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
    return Math.pow(5e7, gameData.dark_matter_shop.gotta_be_fast + 1)
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

    const darkOrbiter = gameData.requirements["Dark Orbiter"].isCompleted() ? 1e10 : 1

    return Math.pow(100, gameData.dark_matter_shop.dark_orb_generator - 1) * darkOrbiter
}

function getTaaAndMagicXpGain() {
    if (gameData.active_challenge == "the_darkest_time") return 1

    return Math.pow(4, gameData.dark_matter_shop.a_deal_with_the_chairman)
}

function getAGiftFromGodEssenceGain() {
    if (gameData.active_challenge == "the_darkest_time") return 1

    return Math.pow(2.1, gameData.dark_matter_shop.a_gift_from_god)
}

function getLifeCoachIncomeGain() {
    if (gameData.active_challenge == "the_darkest_time") return 1

    return Math.pow(14, gameData.dark_matter_shop.life_coach)
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
    return getDarkMatter() >= getAMiracleCost()
}

async function buyAMiracle() {
    if (!gameData.dark_matter_shop.a_miracle && canBuyAMiracle()) {
        if (gameData.dark_matter < 30)
        {            
            const isConfirmed = await customConfirm({
                title: "CONFIRM PURCHASE",
                text: "Are you sure you want to buy A Miracle? Your XP gain will decrease!",
                confirmText : "Buy",
                cancelText : "Cancel"

            });                
            if (!isConfirmed)
                return
        }
        gameData.dark_matter_shop.a_miracle = true
        gameData.dark_matter -= getAMiracleCost()
        gameData.requirements["Magic Eye"].completed = true
    }
    else if (gameData.dark_matter_shop.a_miracle){
        gameData.dark_matter_shop.a_miracle = false
        gameData.dark_matter += getAMiracleCost()
        gameData.requirements["Magic Eye"].completed = false
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
    buyDarkMatterSkill("speed_is_life", getDarkMatterSkillCost(1), number)   
}

function buyYourGreatestDebt(number) {
    buyDarkMatterSkill("your_greatest_debt", getDarkMatterSkillCost(2), number)    
}

function buyEssenceCollector(number) {
    buyDarkMatterSkill("essence_collector", getDarkMatterSkillCost(3), number)
}

function buyExplosionOfTheUniverse(number) {
    buyDarkMatterSkill("explosion_of_the_universe", getDarkMatterSkillCost(4), number)
}

function buyMultiverseExplorer(number) {
    buyDarkMatterSkill("multiverse_explorer", getDarkMatterSkillCost(5), number)
}


function getDarkMatterSkillCost(i){
    switch (i)  {
    case 1:
        return 100
    case 2:
        return 10000 // 1000
    case 3:
        return 50000 // 10000
    case 4:
        return 5e5 // 100000
    case 5:
        return 1e9
    }

}

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

    if (gameData.perks.positive_dark_mater_skills == 1)
        return 1

    let income = 1
    
    income *= [1, 3].includes(gameData.dark_matter_shop.your_greatest_debt) ? 0.1 : 1
    income *= [2, 3].includes(gameData.dark_matter_shop.your_greatest_debt) ? 0.5 : 1
    income *= [2, 3].includes(gameData.dark_matter_shop.essence_collector) ? 0.04 : 1
    income *= [2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe) ? 0.00001 : 1

    return income 

}

function getDarkMatterSkillTimeWarping() {
    if (gameData.active_challenge == "the_darkest_time")
        return 1

    let timewarping = 1

    timewarping *= [1, 3].includes(gameData.dark_matter_shop.speed_is_life) ? 3 : 1
    timewarping *= [2, 3].includes(gameData.dark_matter_shop.speed_is_life) ? 7 : 1
    timewarping *= [1, 3].includes(gameData.dark_matter_shop.multiverse_explorer) ?
        (gameData.perks.positive_dark_mater_skills == 1 ? 1 : 0.001) : 1

    return timewarping
}

function getDarkMatterSkillXP() {
    if (gameData.active_challenge == "the_darkest_time")
        return 1

    let xp = 1

    xp *= [1, 3].includes(gameData.dark_matter_shop.your_greatest_debt) ? 500 : 1
    xp *= [1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe) ? 1e100 : 1
    xp *= [2, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe) ? 1e150 : 1

    return xp
}

function getDarkMatterSkillEssence() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0.25

    let ess = 1

    ess *= (gameData.perks.positive_dark_mater_skills == 0 && [2, 3].includes(gameData.dark_matter_shop.speed_is_life)) ? 0.5 : 1
    ess *= (gameData.perks.positive_dark_mater_skills == 0 && [1, 3].includes(gameData.dark_matter_shop.explosion_of_the_universe)) ? 0.5 : 1

    ess *= [1, 3].includes(gameData.dark_matter_shop.essence_collector) ? 500 : 1
    ess *= [2, 3].includes(gameData.dark_matter_shop.essence_collector) ? 1000 : 1

    ess *= [1, 3].includes(gameData.dark_matter_shop.multiverse_explorer) ? 5000 : 1
    ess *= [2, 3].includes(gameData.dark_matter_shop.multiverse_explorer) ? 10000 : 1

    return ess
}

function getDarkMatterSkillEvil() {
    if (gameData.active_challenge == "the_darkest_time")
        return 0.25

    let evil = 1

    evil *= [2, 3].includes(gameData.dark_matter_shop.your_greatest_debt) ? 100 : 1
    evil *= (gameData.perks.positive_dark_mater_skills == 0 && [1, 3].includes(gameData.dark_matter_shop.speed_is_life)) ? 0.5 : 1
    evil *= (gameData.perks.positive_dark_mater_skills == 0 && [1, 3].includes(gameData.dark_matter_shop.essence_collector)) ? 0.5 : 1

    return evil
}
function getDarkMatterSkillDarkMater() {
    if (gameData.active_challenge == "the_darkest_time")
        return 1

    return (gameData.perks.positive_dark_mater_skills == 0 && [2, 3].includes(gameData.dark_matter_shop.multiverse_explorer)) ? 0.01 : 1
}