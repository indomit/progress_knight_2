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

class Job extends  Task {
    constructor(baseData) {
        super(baseData)
        this.incomeMultipliers = []
    }

    getIncome() {
        let income = this.baseData.income

        income *= (this.isHero ? heroIncomeMult
            * (this.baseData.heroxp > 78 ? 1e6 : 1)
            * (this.baseData.heroxp > 130 ? 1e5 : 1)
            : 1)

        income *= getChallengeBonus("rich_and_the_poor")

        income *= 1 + log10(this.level + 1);

        const funcs = this.incomeFuncs;
        const fLen = funcs.length;
        for (let i = 0; i < fLen; i++) {
            income *= funcs[i]();
        }

        const tasks = this.incomeTasks;
        const tLen = tasks.length;
        for (let i = 0; i < tLen; i++) {
            income *= tasks[i].getEffect();
        }

        return gameData.active_challenge == "rich_and_the_poor" || gameData.active_challenge == "the_darkest_time"
            ? pow(income, 0.35)
            : income
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
        this.effect = baseData.effect
        this.heroeffect = baseData.heroeffect
        this.description = baseData.description
        this.expense = baseData.expense
        this.heromult = baseData.heromult
        this.expenseMultipliers = []
        this.isHero = false
        this.unlocked = false
        this.isMisc = itemCategories["Misc"]?.includes(this.name) || false;
        this.isProperty = itemCategories["Properties"]?.includes(this.name) || false;
        this.heroExpenseMult = 4 * pow(10, this.heromult) * heroIncomeMult
        this.row = getQuerySelector(this.name)
    }

    getEffect() {
        const currentMisc = gameData.currentMisc;
        const currentProp = gameData.currentProperty;

        if (this.isHero) {
            if (this.isMisc && currentMisc.includes(this)) {
                this.unlocked = true;
                return this.effect * this.heroeffect;
            }

            if (this.isProperty) {
                if (currentProp === this) {
                    this.unlocked = true;
                    return this.heroeffect;
                }
                return 1;
            }

            return this.effect;
        } else {
            if (currentProp !== this && !currentMisc.includes(this)) {
                return 1;
            }

            this.unlocked = true;
            return this.effect;
        }
    }

    getEffectDescription() {
        let description = this.description
        let effect = this.effect

        if (this.isHero) {
            if (this.isMisc) {
                effect *= this.heroeffect
            }

            if (this.isProperty) {
                description = "Happiness"
                effect = this.heroeffect
            }
        }
        else {
            if (this.isProperty) description = "Happiness"
        }

        return "x" + format(effect) + " " + description
    }

    getExpense() {
        let expense = this.expense

        expense *= (this.isHero ? this.heroExpenseMult : 1)

        const tasks = this.expenseTasks;
        const tLen = tasks.length;
        for (let i = 0; i < tLen; i++) {
            expense *= tasks[i].getEffect();
        }

        return expense;
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