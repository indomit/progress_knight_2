class Job extends Task {

    /** @param {JobBaseData} baseData */
    constructor(baseData) {
        super(baseData)
        this.baseData = /** @type {JobBaseData} */ (this.baseData)

        /** @type {(() => number)[]} Dynamic income calculation functions */
        this.incomeFuncs = []

        /** @type {Skill[]} List of skills that generate income */
        this.incomeTasks = [];

        /** @type {Item[]} List of items in the inventory providing passive income */
        this.incomeItems = [];
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

    /** @param {SkillBaseData} baseData */
    constructor(baseData) {
        super(baseData)
        this.baseData = /** @type {SkillBaseData} */ (this.baseData)
        this.boundEffect = () => { return 1 }
    }

    getEffect() {
        let effect = this.baseData.effect
        return 1 + effect * (this.isHero ? 1000 * this.level + 8000 : this.level)
    }

    getEffectDescription() {
        let effect = this.getEffect()
        return "x" + format(effect, 2) + " " + this.baseData.description
    }
}

class Item {
    /** @param {ItemBaseData} baseData */
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.effect = baseData.effect
        this.heroeffect = baseData.heroeffect
        this.description = baseData.description
        this.expense = baseData.expense
        this.heromult = baseData.heromult
        this.isHero = false
        this.unlocked = false
        this.isMisc = itemCategories["Misc"]?.includes(this.name) || false;
        this.isProperty = itemCategories["Properties"]?.includes(this.name) || false;
        this.heroExpenseMult = 4 * pow(10, this.heromult) * heroIncomeMult
        this.row = getQuerySelector(this.name)

        /** @type {Skill[]} */
        this.expenseSkills = []

        /** @type {() => number} */
        this.boundEffect = () => { return 1 }
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

        const skills = this.expenseSkills;
        const tLen = skills.length;
        for (let i = 0; i < tLen; i++) {
            expense *= skills[i].getEffect();
        }

        return expense;
    }

}

class Milestone {

    /** @param {MilestoneBaseData} baseData */
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.tier = baseData.tier
        this.expense = baseData.expense
        this.description = baseData.description
        this.unlocked = false
        this.getEffect = () => { return 1 }
    }
}

/** 
* @typedef {Object} CommonRequirementConfig
 * @property {string} [task]
 * @property {number} requirement
 * @property {number} [herequirement]
*/

/** 
* @typedef {Object} TaskRequirementConfig
 * @property {string} task
 * @property {number} requirement
 * @property {number} [herequirement]
*/

/**
 * Union of all valid data configurations that can initialize a Task or its child classes
 * @typedef {CommonRequirementConfig | TaskRequirementConfig } RequirementConfig
 */



class Requirement {

    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {

        /** @type {string[]} */
        this.querySelectors = querySelectors

        /** @type {HTMLElement[]} */
        this.elements = []

        /** @type {RequirementConfig[]} */
        this.requirements = requirements

        /** @type {boolean} */
        this.completed = false

        this.needs_rerender = true
    }

    /**
     * Abstract method to be implemented by subclasses.
     * @param {boolean} isHero 
     * @param {RequirementConfig} requirement 
     * @returns {boolean}
     */
    getCondition(isHero, requirement) {
        throw new Error("getCondition() must be implemented by a subclass");
    }

    queryElements() {
        this.querySelectors.forEach(querySelector => {
            const nodes = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll(querySelector));
            this.elements.push(...nodes);
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
        this.needs_rerender = true
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

    /**
     * @inheritdoc
     * @param {string[]} querySelectors
     * @param {TaskRequirementConfig[]} requirements
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "task"
    }

    /**
     * @inheritdoc
     * @param {boolean} isHero
     * @param { TaskRequirementConfig } requirement
     */
    getCondition(isHero, requirement) {
        if (isHero && requirement.herequirement)
            return gameData.taskData[requirement.task].level >= requirement.herequirement
        else
            return gameData.taskData[requirement.task].level >= requirement.requirement
    }
}

class CoinRequirement extends Requirement {
    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "coins"
    }

    /**
     * 
     * @param {boolean} isHero 
     * @param {RequirementConfig} requirement 
     * @returns {boolean}
     */

    getCondition(isHero, requirement) {
        return gameData.coins >= requirement.requirement
    }
}

class AgeRequirement extends Requirement {
    /**
     * @param {string[]} querySelectors
     * @param {RequirementConfig[]} requirements
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "age"
    }

    /**
     * @param {boolean} isHero
     * @param { RequirementConfig } requirement
     */
    getCondition(isHero, requirement) {
        return daysToYears(gameData.days) >= requirement.requirement
    }
}

class EvilRequirement extends Requirement {
    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "evil"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        return gameData.evil >= requirement.requirement
    }
}

class EssenceRequirement extends Requirement {
    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "essence"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        if (isHero && requirement.herequirement)
            return gameData.essence >= requirement.herequirement
        else
            return gameData.essence >= requirement.requirement
    }
}

class DarkMatterRequirement extends Requirement {
    /**
    * 
    * @param {string[]} querySelectors 
    * @param {RequirementConfig[]} requirements 
    */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "darkMatter"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        if (isHero && requirement.herequirement != null)
            return gameData.dark_matter >= requirement.herequirement
        else
            return gameData.dark_matter >= requirement.requirement
    }
}

class DarkOrbsRequirement extends Requirement {
    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "darkOrb"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        return gameData.dark_orbs >= requirement.requirement
    }
}

class MetaverseRequirement extends Requirement {
    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "metaverse"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        return gameData.rebirthFiveCount >= requirement.requirement
    }
}

class HypercubeRequirement extends Requirement {
    /**
     * 
     * @param {string[]} querySelectors 
     * @param {RequirementConfig[]} requirements 
     */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "hypercube"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        return gameData.hypercubes >= requirement.requirement
    }
}

class PerkPointRequirement extends Requirement {
    /**
    * 
    * @param {string[]} querySelectors 
    * @param {RequirementConfig[]} requirements 
    */
    constructor(querySelectors, requirements) {
        super(querySelectors, requirements)
        this.type = "perkpoint"
    }

    /**
     * @param {boolean} isHero
     * @param {RequirementConfig} requirement
     */
    getCondition(isHero, requirement) {
        return gameData.perks_points >= requirement.requirement
    }
}