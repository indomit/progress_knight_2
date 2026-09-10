function findNextRequirement(category, data) {
    for (let i = 0; i < category.length; i++) {
        const entityName = category[i]
        if (i >= category.length - 1) break

        const requirements = gameData.requirements[entityName];

        if (i === 0 && requirements && !requirements.isCompleted()) {
            return data[entityName]
        }

        const nextIndex = i + 1;
        if (nextIndex >= category.length) break;

        const nextEntityName = category[nextIndex];
        const nextEntityRequirements = gameData.requirements[nextEntityName];

        if (nextEntityRequirements && !nextEntityRequirements.isCompleted()) {
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
    const requiredRows = document.querySelectorAll(".requiredRow");

    for (const requiredRow of requiredRows) {
        const category = categories[requiredRow.id];
        if (category == null) continue;

        const nextEntity = findNextRequirement(category, data);

        
        const tooltip = requiredRow.querySelector('.tooltip');
        if (tooltip) {
            tooltip.setAttribute('data-type', 'requirement');
            tooltip.setAttribute('data-name', nextEntity ? nextEntity.name : "");
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask");
        } else {
            requiredRow.classList.remove("hiddenTask");
            renderRequirementRow(requiredRow, data, nextEntity);
        }
    }
}

function renderRequirementRow(requiredRow, data, nextEntity) {
    const requirementObject = gameData.requirements[nextEntity.name];
    const requirements = requirementObject.requirements;

    // cache
    const elements = clearAndFetchRequirementElements(requiredRow);

    let renderResult = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };

    if (data == gameData.taskData) {
        renderResult = handleTaskRequirements(elements, nextEntity, requirementObject, requirements, requiredRow);
    } else if (data == gameData.itemData) {
        renderResult = handleItemRequirements(elements, nextEntity, requirements, requiredRow);
    } else if (data == milestoneData) {
        renderResult = handleMilestoneRequirements(elements, nextEntity, requirements, requiredRow);
    }

    renderProgessResource(elements.element, renderResult.progressPercent, renderResult.pendingPercent, renderResult.targetColorClass)
}


function clearAndFetchRequirementElements(requiredRow) {
    const elements = {
        element: requiredRow,
        coin: requiredRow.querySelector(".coins"),
        level: requiredRow.querySelector(".levels"),
        evil: requiredRow.querySelector(".evil"),
        essence: requiredRow.querySelector(".essence"),
        darkMatter: requiredRow.querySelector(".darkMatter"),
        hypercube: requiredRow.querySelector(".hypercube"),
        effect: requiredRow.querySelector(".effect"),
        effectValue: requiredRow.querySelector(".effectValue"),
        progressContainer: requiredRow.querySelector(".req-progress-container"),
        progressBar: requiredRow.querySelector(".req-progress-bar"),
        pendingBar: requiredRow.querySelector(".req-pending-bar"),
    };

    elements.coin.classList.add("hiddenTask");
    elements.level.classList.add("hiddenTask");
    elements.evil.classList.add("hiddenTask");
    elements.essence.classList.add("hiddenTask");
    elements.darkMatter.classList.add("hiddenTask");
    elements.hypercube.classList.add("hiddenTask");
    elements.effect.classList.add("hiddenTask");

    return elements;
}

function handleTaskRequirements(elements, nextEntity, requirementObject, requirements, requiredRow) {
    const task = gameData.taskData[nextEntity.name];
    elements.effect.classList.remove("hiddenTask");

    let effectValueText = "[Unknown]"
    if (task.unlocked)
        effectValueText = task.name + (task.baseData.description ? " (" + task.baseData.description + ")" : "")

    if (elements.effectValue.textContent !== effectValueText)
        elements.effectValue.textContent = effectValueText


    let result = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };
    const curRequiredValue = requirements[0].requirement

    if (requirementObject instanceof EvilRequirement) {
        elements.evil.classList.remove("hiddenTask");
        elements.evil.textContent = format(curRequiredValue) + " evil";
        result.progressPercent = getDynamicProgress(gameData.evil, curRequiredValue);
        result.targetColorClass = "color-evil";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.evil + getEvilGainAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof EssenceRequirement) {
        elements.essence.classList.remove("hiddenTask");
        elements.essence.textContent = format(curRequiredValue) + " essence";
        result.progressPercent = getDynamicProgress(gameData.essence, curRequiredValue);
        result.targetColorClass = "color-essence";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof DarkMatterRequirement) {
        elements.darkMatter.classList.remove("hiddenTask");
        elements.darkMatter.textContent = format(curRequiredValue) + " Dark Matter";
        result.progressPercent = getDynamicProgress(gameData.dark_matter, curRequiredValue);
        result.targetColorClass = "color-dark-matter";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.dark_matter + getDarkMatterGainAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof HypercubeRequirement) {
        elements.hypercube.classList.remove("hiddenTask");
        elements.hypercube.textContent = format(curRequiredValue) + " hypercubes";
        result.progressPercent = getDynamicProgress(gameData.hypercubes, curRequiredValue);
        result.targetColorClass = "color-hypercubes";
        result.hasProgress = true;
        result.pendingPercent = getDynamicProgress(gameData.hypercubes + getHypercubeGenerationAvailable(), curRequiredValue);
    }
    else if (requirementObject instanceof AgeRequirement) {
        elements.essence.classList.remove("hiddenTask");
        elements.essence.textContent = "Age " + format(curRequiredValue);
        result.progressPercent = getDynamicProgress(gameData.days, curRequiredValue);
        result.targetColorClass = "color-essence";
        result.hasProgress = true;
    }
    else {
        // jobs and skills
        elements.level.classList.remove("hiddenTask");

        let finalText = "";

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
                const exactLevel = reqTask.level + Math.min(Math.max(xpProgress, 0), 0.999);
                const totalCurrent = Math.min(exactLevel, curRequiredValue);

                progressPercent += getDynamicProgress(totalCurrent, curRequiredValue)
                reqCount++
            }
        }

        if (reqCount > 0) {
            progressPercent /= reqCount
        }

        if (finalText.length > 0) {
            finalText = finalText.substring(0, finalText.length - 1);
        }
        elements.level.textContent = finalText;

        result.progressPercent = progressPercent;
        result.targetColorClass = "color-income";
        result.hasProgress = true;
    }

    return result;
}

function handleItemRequirements(elements, nextEntity, requirements, requiredRow) {
    elements.coin.classList.remove("hiddenTask");
    let curRequiredValue = requirements[0].requirement;
    formatCoins(elements.coin, curRequiredValue);
    const item = gameData.itemData[nextEntity.name];
    elements.effect.classList.remove("hiddenTask");

    let effectValueText = "[Unknown]"
    if (item.unlocked)
        effectValueText = (item.baseData.description ? item.baseData.description : "Happiness")

    if (elements.effectValue.textContent !== effectValueText)
        elements.effectValue.textContent = effectValueText

    return {
        progressPercent: getDynamicProgress(gameData.coins, curRequiredValue),
        hasProgress: true,
        targetColorClass: (getNet() > 0) ? "color-income" : "color-evil"
    };
}


function handleMilestoneRequirements(elements, nextEntity, requirements, requiredRow) {
    let result = { progressPercent: 0, pendingPercent: 0, hasProgress: false, targetColorClass: "color-income" };
    let tooltipHTML = "";
    const curRequiredValue = requirements[0].requirement

    elements.essence.classList.remove("hiddenTask");
    elements.essence.textContent = format(curRequiredValue) + " essence";
    const milestone = milestoneData[nextEntity.name];
    if (milestone.baseData.description) {
        elements.effect.classList.remove("hiddenTask");

        let effectValueText = "[Unknown]"
        if (gameData.stats.maxEssenceReached > milestone.expense) {
            if (nextEntity.name == "Magic Eye")
                effectValueText = nextEntity.name + ': ' + milestone.baseData.description.replace('65', getEyeRequirement())
            else
                effectValueText = nextEntity.name + ': ' + milestone.baseData.description
        }

        if (elements.effectValue.textContent !== effectValueText)
            elements.effectValue.textContent = effectValueText

    }

    result.progressPercent = getDynamicProgress(gameData.essence, curRequiredValue);
    result.targetColorClass = "color-essence";
    result.hasProgress = true;
    result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);

    return result;
}