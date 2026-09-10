class Milestone {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.tier = baseData.tier
        this.expense = baseData.expense
        this.description = baseData.description
        this.unlocked = false
    }
}

class Job extends Task {
    constructor(baseData) {
        super(baseData)
        this.incomeMultipliers = []
    }

    getLevelMultiplier() {
        return 1 + Math.log10(this.level + 1)
    }

    getIncome() {
        const income = (this.isHero ? heroIncomeMult
            * (this.baseData.heroxp > 78 ? 1e6 : 1)
            * (this.baseData.heroxp > 130 ? 1e5 : 1)
            : 1) * applyMultipliers(this.baseData.income, this.incomeMultipliers) * getChallengeBonus("rich_and_the_poor")

        return gameData.active_challenge == "rich_and_the_poor" || gameData.active_challenge == "the_darkest_time" ? Math.pow(income, 0.35) : income
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData)
    }

    getEffect() {
        var effect = 1 + this.baseData.effect * (this.isHero ? 1000 * this.level + 8000 : this.level)
        return effect
    }

    getEffectDescription() {
        return "x" + format(this.getEffect(), 2) + " " + this.baseData.description
    }
}

class Item {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.expenseMultipliers = []
        this.isHero = false
        this.unlocked = false
    }

    getEffect() {
        let effect = this.baseData.effect

        if (this.isHero) {
            if (itemCategories["Misc"].includes(this.name))
            {
                if (gameData.currentMisc.includes(this)) {
                    effect *= this.baseData.heroeffect                    
                    this.unlocked = true
                }
            }

            if (itemCategories["Properties"].includes(this.name)) {
                if (gameData.currentProperty == this) {
                    effect = this.baseData.heroeffect
                    this.unlocked = true
                }
                else
                    effect = 1
            }
        } else {
            // TODO: Переписать на !== или typeof, когда определится точная структура требований (может быть undefined)

            if (gameData.currentProperty != this && !gameData.currentMisc.includes(this))
                return 1
            else
                this.unlocked = true
        }

        return effect
    }

    getEffectDescription() {
        let description = this.baseData.description
        let effect = this.baseData.effect

        if (this.isHero) {
            if (itemCategories["Misc"].includes(this.name)) {
                effect *= this.baseData.heroeffect
            }

            if (itemCategories["Properties"].includes(this.name)) {
                description = "Happiness"
                effect = this.baseData.heroeffect
            }
        }
        else {
            if (itemCategories["Properties"].includes(this.name)) description = "Happiness"
        }

        return "x" + format(effect) + " " + description
    }

    getExpense(heroic) {
        if (heroic === undefined)
            heroic = this.isHero
        return (heroic ? 4 * Math.pow(10, this.baseData.heromult) * heroIncomeMult : 1)
            * applyMultipliers(this.baseData.expense, this.expenseMultipliers)
    }
}

class Requirement {
    constructor(querySelectors, requirements) {
        this.querySelectors = querySelectors
        this.elements = []
        this.requirements = requirements
        this.completed = false
    }

    queryElements() {
        this.querySelectors.forEach(querySelector => {
            this.elements.push(...document.querySelectorAll(querySelector))
        })
    }

    isCompleted() {
        if (this.completed) return true
        for (const requirement of this.requirements) {
            if (!this.getCondition(false, requirement)) {
                return false
            }
        }
        this.completed = true
        return true
    }

    isCompletedActual(isHero = false) {
        for (const requirement of this.requirements) {
            if (!this.getCondition(isHero, requirement)) {
                return false
            }
        }
        return true
    }
}

class TaskRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "task"
    }

    getCondition(isHero, requirement) {
        // TODO: Переписать на !== или typeof, когда определится точная структура требований (может быть undefined)

        if (isHero && requirement.herequirement != null)
            return gameData.taskData[requirement.task].level >= requirement.herequirement
        else if (gameData.taskData[requirement.task].isHero && requirement.isHero)
            return true
        else
            return gameData.taskData[requirement.task].level >= requirement.requirement
    }
}

class CoinRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "coins"
    }

    getCondition(isHero, requirement) {
        return gameData.coins >= requirement.requirement
    }
}

class AgeRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "age"
    }

    getCondition(isHero, requirement) {
        return daysToYears(gameData.days) >= requirement.requirement
    }
}

class EvilRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "evil"
    }

    getCondition(isHero, requirement) {
        return gameData.evil >= requirement.requirement
    }
}

class EssenceRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "essence"
    }

    getCondition(isHero, requirement) {        
        // TODO: Переписать на !== или typeof, когда определится точная структура требований (может быть undefined)

        if (isHero && requirement.herequirement != null)
            return gameData.essence >= requirement.herequirement
        else
            return gameData.essence >= requirement.requirement
    }
}

class DarkMatterRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "darkMatter"
    }

    getCondition(isHero, requirement) {
        // TODO: Переписать на !== или typeof, когда определится точная структура требований (может быть undefined)

        if (isHero && requirement.herequirement != null)
            return gameData.dark_matter >= requirement.herequirement
        else
            return gameData.dark_matter >= requirement.requirement
    }
}

class DarkOrbsRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "darkOrb"
    }

    getCondition(isHero, requirement) {
        return gameData.dark_orbs >= requirement.requirement
    }
}

class MetaverseRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "metaverse"
    }

    getCondition(isHero, requirement) {
        return gameData.rebirthFiveCount >= requirement.requirement
    }
}

class HypercubeRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "hypercube"
    }

    getCondition(isHero, requirement) {
        return gameData.hypercubes >= requirement.requirement
    }
}

class PerkPointRequirement extends Requirement {
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "perkpoint"
    }

    getCondition(isHero, requirement) {
        return gameData.perks_points >= requirement.requirement
    }
}