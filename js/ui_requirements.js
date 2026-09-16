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

function updateRequiredRows(data, categories) {
    // управляет видимостью строк для открытия следующего элемента в категории
    const requiredRows = allByClass("requiredRow");

    for (const requiredRow of requiredRows) {
        const categoryName = requiredRow.dataset.category
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
            renderRequirementRow(requiredRow, data, nextEntity);
    }
}

function renderRequirementRow(requiredRow, data, nextEntity) {
    const requirementObject = gameData.requirements[nextEntity.name];
    const requirements = requirementObject.requirements;
    const elements = clearAndFetchRequirementElements(requiredRow);
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
        renderResult = handleTaskRequirements(elements, nextEntity, requirementObject, requirements, requiredRow, visibilityMap);
    } else if (data == gameData.itemData) {
        renderResult = handleItemRequirements(elements, nextEntity, requirements, requiredRow, visibilityMap);
    } else if (data == milestoneData) {
        renderResult = handleMilestoneRequirements(elements, nextEntity, requirements, requiredRow, visibilityMap);
    }
    for (const resourceKey in visibilityMap) {
        const isVisible = visibilityMap[resourceKey];
        safeUpdateClass(elements[resourceKey], "hidden", !isVisible);
    }

    renderProgessResource(`#${elements.element.id}`, renderResult.progressPercent, renderResult.pendingPercent, renderResult.targetColorClass)
}

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

function handleTaskRequirements(elements, nextEntity, requirementObject, requirements, requiredRow, visibilityMap) {
    const task = gameData.taskData[nextEntity.name];
    visibilityMap.effect = true;

    let effectValueText = "[Unknown]"
    if (task.unlocked)
        effectValueText = task.name + (task.baseData.description ? " (" + task.baseData.description + ")" : "")

    safeUpdateText(elements.effectValue, effectValueText)

    let result = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };
    const curRequiredValue = requirements[0].requirement

    if (requirementObject instanceof EvilRequirement) {
        visibilityMap.evil = true;
        safeUpdateText(elements.evil, format(curRequiredValue) + " evil")
        result.progressPercent = getDynamicProgress(gameData.evil, curRequiredValue);
        result.targetColorClass = "color-evil";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.evil + getEvilGainAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof EssenceRequirement) {
        visibilityMap.essence = true;
        safeUpdateText(elements.essence, format(curRequiredValue) + " essence")
        result.progressPercent = getDynamicProgress(gameData.essence, curRequiredValue);
        result.targetColorClass = "color-essence";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof DarkMatterRequirement) {
        visibilityMap.darkMatter = true;
        safeUpdateText(elements.darkMatter, format(curRequiredValue) + " Dark Matter")
        result.progressPercent = getDynamicProgress(gameData.dark_matter, curRequiredValue);
        result.targetColorClass = "color-dark-matter";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.dark_matter + getDarkMatterGainAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof HypercubeRequirement) {
        visibilityMap.hypercube = true;
        safeUpdateText(elements.hypercube, format(curRequiredValue) + " hypercubes")
        result.progressPercent = getDynamicProgress(gameData.hypercubes, curRequiredValue);
        result.targetColorClass = "color-hypercubes";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.hypercubes + getHypercubeGenerationAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof AgeRequirement) {
        console.log("requirementObject instanceof AgeRequirement in handleTaskRequirements as essence!")
        visibilityMap.essence = true;
        safeUpdateText(elements.essence, "Age " + format(curRequiredValue))
        result.progressPercent = getDynamicProgress(gameData.days, curRequiredValue);
        result.targetColorClass = "color-essence";
        result.hasProgress = true;
    }
    else {
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
        result.targetColorClass = "color-income";
        result.hasProgress = true;
    }

    return result;
}

function handleItemRequirements(elements, nextEntity, requirements, requiredRow, visibilityMap) {
    visibilityMap.coin = true;
    visibilityMap.effect = true;

    let curRequiredValue = requirements[0].requirement;
    formatCoins(elements.coin, curRequiredValue);
    const item = gameData.itemData[nextEntity.name];

    let effectValueText = "[Unknown]"
    if (item.unlocked)
        effectValueText = (item.baseData.description ? item.baseData.description : "Happiness")

    safeUpdateText(elements.effectValue, effectValueText)

    return {
        progressPercent: getDynamicProgress(gameData.coins, curRequiredValue),
        hasProgress: true,
        targetColorClass: (totalIncome > totalExpense) ? "color-income" : "color-evil"
    };
}

function handleMilestoneRequirements(elements, nextEntity, requirements, requiredRow, visibilityMap) {
    let result = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };
    let tooltipHTML = "";
    const curRequiredValue = requirements[0].requirement

    visibilityMap.essence = true;
    safeUpdateText(elements.essence, format(curRequiredValue) + " essence")
    const milestone = milestoneData[nextEntity.name];
    if (milestone.baseData.description) {
        visibilityMap.effect = true;
        let effectValueText = "[Unknown]"
        if (gameData.stats.maxEssenceReached > milestone.expense) {
            if (nextEntity.name == "Magic Eye")
                effectValueText = nextEntity.name + ': ' + milestone.baseData.description.replace('65', getEyeRequirement())
            else
                effectValueText = nextEntity.name + ': ' + milestone.baseData.description
        }
        safeUpdateText(elements.effectValue, effectValueText)
    }

    result.progressPercent = getDynamicProgress(gameData.essence, curRequiredValue);
    result.targetColorClass = "color-essence";
    result.hasProgress = true;
    result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);

    return result;
}