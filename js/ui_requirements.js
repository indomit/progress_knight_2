/**
 * @param {string[]} category
 * @param {Record<string, Job | Skill | Item | Milestone>} data
 */
function findNextRequirement(category, data) {
    for (let i = 0; i < category.length; i++) {
        const entityName = category[i]
        if (i >= category.length - 1) break

        const requirements = gameData.requirements[entityName];

        if (i === 0 && requirements && !requirements.completed && requirements.requirements.length > 0) {
            return data[entityName]
        }

        const nextIndex = i + 1;
        if (nextIndex >= category.length) break;

        const nextEntityName = category[nextIndex];
        const nextEntityRequirements = gameData.requirements[nextEntityName];

        if (nextEntityRequirements && !nextEntityRequirements.completed && nextEntityRequirements.requirements.length > 0) {
            return data[nextEntityName]
        }
    }

    return null
}

// updateRequiredRows(gameData.taskData, jobCategories)
// updateRequiredRows(gameData.taskData, skillCategories)
// updateRequiredRows(gameData.itemData, itemCategories)
// updateRequiredRows(milestoneData    , milestoneCategories)
/**
 * 
 * @param {Record<string, Job | Skill | Item | Milestone>} data 
 * @param {Record<string, string[]>} categories 
 */
function updateRequiredRows(data, categories) {
    // управляет видимостью строк для открытия следующего элемента в категории
    const requiredRows = allByClass("requiredRow");

    for (const requiredRow of requiredRows) {
        const categoryName = requiredRow.dataset.category
        if (!categoryName) continue;
        const category = categories[categoryName];
        if (!category) continue;
        let nextEntity = null

        if (gameData.requirements[categoryName]?.completed ?? true)
            nextEntity = findNextRequirement(category, data);

        const tooltip = el(`#${requiredRow.id} .tooltip`);
        if (tooltip) {
            tooltip.setAttribute('data-type', 'requirement');
            tooltip.setAttribute('data-name', nextEntity ? nextEntity.name : "");
        }
        safeUpdateClass(requiredRow, "hidden", nextEntity == null);
        if (nextEntity != null)
            renderRequirementRow(requiredRow, data, nextEntity.name);
    }
}

/**
 * @typedef {Object} VisibilityMap
 * @property {boolean} coin
 * @property {boolean} level
 * @property {boolean} evil
 * @property {boolean} essence
 * @property {boolean} darkMatter
 * @property {boolean} hypercube
 * @property {boolean} effect
 */


/**
 * @param {HTMLElement} requiredRow
 * @param {Record<string, Job | Skill | Item | Milestone>} data
 * @param {string} nextEntityName
 */
function renderRequirementRow(requiredRow, data, nextEntityName) {
    const requirementObject = gameData.requirements[nextEntityName];
    const requirements = requirementObject.requirements;
    const elements = clearAndFetchRequirementElements(requiredRow);

    /** @type {VisibilityMap} */
    const visibilityMap = {
        coin: false,
        level: false,
        evil: false,
        essence: false,
        darkMatter: false,
        hypercube: false,
        effect: false
    };

    let renderResult = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };

    if (data == gameData.taskData) {
        renderResult = handleTaskRequirements(elements, nextEntityName, requirementObject, /** @type {TaskRequirementConfig[]} */(requirements), visibilityMap);
    } else if (data == gameData.itemData) {
        renderResult = handleItemRequirements(elements, nextEntityName, requirements, visibilityMap);
    } else if (data == milestoneData) {
        renderResult = handleMilestoneRequirements(elements, nextEntityName, requirements, visibilityMap);
    }
    for (const resourceKey in visibilityMap) {
        const isVisible = visibilityMap[resourceKey];
        safeUpdateClass(elements[resourceKey], "hidden", !isVisible);
    }

    renderProgessResource(`#${elements.element.id}`, renderResult.progressPercent, renderResult.pendingPercent, renderResult.targetColorClass)
}

/**
 * @typedef {Object} RequirementElements
 * @property {HTMLElement} element
 * @property {HTMLElementNullable} coin
 * @property {HTMLElementNullable} level
 * @property {HTMLElementNullable} evil
 * @property {HTMLElementNullable} essence
 * @property {HTMLElementNullable} darkMatter
 * @property {HTMLElementNullable} hypercube
 * @property {HTMLElementNullable} effect
 * @property {HTMLElementNullable} effectValue
 * @property {HTMLElementNullable} progressContainer
 * @property {HTMLElementNullable} progressBar
 * @property {HTMLElementNullable} pendingBar
 */


/**
 * @param {HTMLElement} requiredRow
 * @returns {RequirementElements}
 */
function clearAndFetchRequirementElements(requiredRow) {
    const id = requiredRow.id
    return {
        element: requiredRow,
        coin: el(`#${id} .coins`),
        level: el(`#${id} .levels`),
        evil: el(`#${id} .evil`),
        essence: el(`#${id} .essence`),
        darkMatter: el(`#${id} .darkMatter`),
        hypercube: el(`#${id} .hypercube`),
        effect: el(`#${id} .effect`),
        effectValue: el(`#${id} .effectValue`),
        progressContainer: el(`#${id} .req-progress-container`),
        progressBar: el(`#${id} .req-progress-bar`),
        pendingBar: el(`#${id} .req-pending-bar`),
    };
}

/**
 * @param {RequirementElements} elements
 * @param {string} nextEntityName
 * @param {Requirement} requirementObject
 * @param {TaskRequirementConfig[]} requirements
 * @param {VisibilityMap} visibilityMap
 */
function handleTaskRequirements(elements, nextEntityName, requirementObject, requirements, visibilityMap) {
    const task = gameData.taskData[nextEntityName];
    visibilityMap.effect = true;

    let effectValueText = "[Unknown]"
    if (task.unlocked) {
        if (task instanceof Skill)
            effectValueText = task.name + (task.baseData.description ? " (" + task.baseData.description + ")" : "")
        else
            effectValueText = task.name
    }

    safeUpdateText(elements.effectValue, effectValueText)

    let result = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };
    const curRequiredValue = requirements[0].requirement

    if (requirementObject instanceof EvilRequirement) {
        visibilityMap.evil = true;
        safeUpdateText(elements.evil, format(curRequiredValue) + " evil")
        result.progressPercent = getDynamicProgress(gameData.evil, curRequiredValue);
        result.pendingPercent = getDynamicProgress(gameData.evil + getEvilGainAvailable(), curRequiredValue);
        result.targetColorClass = "color-evil";
        result.hasProgress = true;
    }
    else if (requirementObject instanceof EssenceRequirement) {
        visibilityMap.essence = true;
        safeUpdateText(elements.essence, format(curRequiredValue) + " essence")
        result.progressPercent = getDynamicProgress(gameData.essence, curRequiredValue);
        result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);
        result.targetColorClass = "color-essence";
        result.hasProgress = true;
    }
    else if (requirementObject instanceof DarkMatterRequirement) {
        visibilityMap.darkMatter = true;
        safeUpdateText(elements.darkMatter, format(curRequiredValue) + " Dark Matter")
        result.progressPercent = getDynamicProgress(gameData.dark_matter, curRequiredValue);
        result.pendingPercent = getDynamicProgress(gameData.dark_matter + getDarkMatterGainAvailable(), curRequiredValue);
        result.targetColorClass = "color-dark-matter";
        result.hasProgress = true;
    }
    else if (requirementObject instanceof HypercubeRequirement) {
        visibilityMap.hypercube = true;
        safeUpdateText(elements.hypercube, format(curRequiredValue) + " hypercubes")
        result.progressPercent = getDynamicProgress(gameData.hypercubes, curRequiredValue);
        result.pendingPercent = getDynamicProgress(gameData.hypercubes + getHypercubeGenerationAvailable(), curRequiredValue);
        result.targetColorClass = "color-hypercubes";
        result.hasProgress = true;
    }
    else if (requirementObject instanceof AgeRequirement) {
        console.log("requirementObject instanceof AgeRequirement in handleTaskRequirements as essence!")
        visibilityMap.essence = true;
        safeUpdateText(elements.essence, "Age " + format(curRequiredValue))
        result.progressPercent = getDynamicProgress(gameData.days, curRequiredValue);
        result.pendingPercent = getDynamicProgress(gameData.days, curRequiredValue);
        result.targetColorClass = "color-essence";
        result.hasProgress = true;
    }
    else if (requirementObject instanceof TaskRequirement) {
        // jobs and skills
        visibilityMap.level = true;

        let finalText = ""
        let progressPercent = 0
        let reqCount = 0

        for (const requirement of requirements) {
            const reqTask = gameData.taskData[requirement.task];
            const curRequiredValue = requirement.requirement;

            if (reqTask.level >= curRequiredValue) {
                progressPercent += 100
                reqCount++
            } else {

                const reqTaskName = gameData.taskData[requirement.task].unlocked ? requirement.task : "[Unknown]"

                finalText += " " + reqTaskName + " " + formatLevel(reqTask.level) + "/" + formatLevel(curRequiredValue) + ",";

                const xpProgress = reqTask.getTaskXpProgressFraction();
                const exactLevel = reqTask.level + min(max(xpProgress, 0), 0.999);
                const totalCurrent = min(exactLevel, curRequiredValue);

                progressPercent += getDynamicProgress(totalCurrent, curRequiredValue)
                reqCount++
            }
        }

        if (reqCount > 0) progressPercent /= reqCount

        if (finalText.length > 0) finalText = finalText.substring(0, finalText.length - 1);

        safeUpdateText(elements.level, finalText)

        result.progressPercent = progressPercent;
        result.pendingPercent = progressPercent;
        result.targetColorClass = "color-income";
        result.hasProgress = true;
    }

    return result;
}

/**
 * @param {RequirementElements} elements
 * @param {string} nextEntityName
 * @param {RequirementConfig[]} requirements
 * @param {VisibilityMap} visibilityMap
 */
function handleItemRequirements(elements, nextEntityName, requirements, visibilityMap) {
    visibilityMap.coin = true;
    visibilityMap.effect = true;

    let curRequiredValue = requirements[0].requirement;
    formatCoins(elements.coin, curRequiredValue);
    const item = gameData.itemData[nextEntityName];

    let effectValueText = "[Unknown]"
    if (item.unlocked)
        effectValueText = (item.baseData.description ? item.baseData.description : "Happiness")

    safeUpdateText(elements.effectValue, effectValueText)

    let percent = getDynamicProgress(gameData.coins, curRequiredValue)

    return {
        progressPercent: percent,
        pendingPercent: percent,
        hasProgress: true,
        targetColorClass: (totalIncome > totalExpense) ? "color-income" : "color-evil"
    };
}

/**
 * @param {RequirementElements} elements
 * @param {string} nextEntityName
 * @param {RequirementConfig[]} requirements
 * @param {VisibilityMap} visibilityMap
 */
function handleMilestoneRequirements(elements, nextEntityName, requirements, visibilityMap) {
    const curRequiredValue = requirements[0].requirement

    visibilityMap.essence = true;
    safeUpdateText(elements.essence, format(curRequiredValue) + " essence")
    const milestone = milestoneData[nextEntityName];
    if (milestone.baseData.description) {
        visibilityMap.effect = true;
        let effectValueText = "[Unknown]"
        if (gameData.stats.maxEssenceReached > milestone.expense) {
            if (nextEntityName == "Magic Eye")
                effectValueText = nextEntityName + ': ' + milestone.baseData.description.replace('65', `${getEyeRequirement()}`)
            else
                effectValueText = nextEntityName + ': ' + milestone.baseData.description
        }
        safeUpdateText(elements.effectValue, effectValueText)
    }

    let percent = getDynamicProgress(gameData.essence, curRequiredValue)

    return {
        progressPercent: percent,
        pendingPercent: percent,
        hasProgress: true,
        targetColorClass: "color-essence"
    }
}