class Task {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.level = 0
        this.maxLevel = 0 
        this.xp = 0
        this.isHero = false
        this.isFinished = false

        this.xpMultipliers = []
    }

    getMaxXp() {
        if (this.isFinished)
            return 1e305

        const maxXp = (this.isHero ? Math.pow(10, this.baseData.heroxp) : 1) * this.baseData.maxXp * (this.level + 1) * Math.pow(this.isHero ? 1.08 : 1.01, this.level)

        if (isNaN(maxXp) || maxXp == Infinity || maxXp > 1e305) {
            this.isFinished = true
            return 1e305
        }

        return maxXp
    }

    getXpLeft() {
        if (this.isFinished)
            return 0

        return this.getMaxXp() - this.xp
    }

    getMaxLevelMultiplier() {
        return gameData.active_challenge == "dance_with_the_devil" ? (10 / (this.maxLevel + 1))  : 1 + this.maxLevel / 10
    }

    getXpGain() {
        if (this.isFinished)
            return 0

        return (this.isHero ? getHeroXpGainMultipliers(this) : 1) * applyMultipliers(10, this.xpMultipliers)
    }

    increaseXp() {
        if (this.isFinished) {
            if (Math.random() < (0.02 / updateSpeed)) // approx 1 level every 50 seconds
                this.level += 1
            return
        }

        this.xp += applySpeed(this.getXpGain())

        if (this.xp > 1e305)        
            this.xp = 1e305        
        else if (isNaN(this.xp))
        {
            this.isFinished = true
            return
        }
       
        if (this.xp >= this.getMaxXp()) {
            let excess = this.xp - this.getMaxXp()
            while (excess >= 0) {
                this.level += 1
                excess -= this.getMaxXp()
            }
            this.xp = this.getMaxXp() + excess
        }
    }
}

class Milestone {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.tier = baseData.tier
        this.expense = baseData.expense
        this.description = baseData.description
    }

    getTier() { return this.tier }
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

        return gameData.active_challenge == "rich_and_the_poor" ? Math.pow(income, 0.35) : income
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
        return "x" + String(this.getEffect().toFixed(2)) + " " + this.baseData.description
    }
}

class Item {
    constructor(baseData) {  
        this.baseData = baseData
        this.name = baseData.name
        this.expenseMultipliers = []
        this.isHero = false
    }

    getEffect() {
        let effect = this.baseData.effect        

        if (this.isHero) {
            if (itemCategories["Misc"].includes(this.name))
            {
                if (gameData.currentMisc.includes(this)) {
                    effect *= 10
                    if (this.name == "Universe Fragment" || this.name == "Multiverse Fragment")
                        effect *= 100000
                }
            }

            if (itemCategories["Properties"].includes(this.name)) {
                if (gameData.currentProperty == this)
                    effect = this.baseData.heroeffect
                else
                    effect = 1
            }
        } else {
            if (gameData.currentProperty != this && !gameData.currentMisc.includes(this)) return 1
        }

        return effect
    }

    getEffectDescription() {
        let description = this.baseData.description
        let effect = this.baseData.effect

        if (this.isHero) {
            if (itemCategories["Misc"].includes(this.name)) {
                effect *= 10
                if (this.name == "Universe Fragment" || this.name == "Multiverse Fragment")
                    effect *= 100000
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

    getExpense() {
        return (this.isHero ? 4 * Math.pow(10, this.baseData.heromult) * heroIncomeMult : 1) 
            * applyMultipliers(this.baseData.expense, this.expenseMultipliers) 
    }
}

class Requirement {
    constructor(elements, requirements) {
        this.elements = elements
        this.requirements = requirements
        this.completed = false
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
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "task"
    }

    getCondition(isHero, requirement) {
        if (isHero && requirement.herequirement != null)
            return gameData.taskData[requirement.task].level >= requirement.herequirement
        else if (gameData.taskData[requirement.task].isHero && requirement.isHero)
            return true
        else
            return gameData.taskData[requirement.task].level >= requirement.requirement
    }
}

class CoinRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "coins"
    }

    getCondition(isHero, requirement) {
        return gameData.coins >= requirement.requirement
    }
}

class AgeRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "age"
    }

    getCondition(isHero, requirement) {
        return daysToYears(gameData.days) >= requirement.requirement
    }
}

class EvilRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "evil"
    }

    getCondition(isHero, requirement) {
        return gameData.evil >= requirement.requirement
    }    
}

class EssenceRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "essence"
    }

    getCondition(isHero, requirement) {
        return gameData.essence >= requirement.requirement
    }    
}

class DarkMatterRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "darkMatter"
    }

    getCondition(isHero, requirement) {
        return gameData.dark_matter >= requirement.requirement
    }    
}

class DarkOrbsRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "darkOrb"
    }

    getCondition(isHero, requirement) {
        return gameData.dark_orbs >= requirement.requirement
    }    
}