/** @type {string | null} */
let activeTooltipData = null;

/** @type {string | null} */
let activeTooltipType = null;

function initTooltip() {
    const tooltip = /** @type {HTMLElement} */ (elById("globalTooltip"));
    if (!tooltip) return;
    let isVisible = false;
    let hideTimeout = null;
    let showTimeout = null;
    let currentTargetElement = null;
    let lastMouseEvent = null;

    let isHiding = false;
    let lockedFlipX = false;
    let lockedFlipY = false;
    let lockedShiftX = false;
    let lockedShiftY = false;

    function updatePosition(e) {
        if (!tooltip || !e) return;
        const padding = 15;
        let x = e.clientX + padding;
        let y = e.clientY + padding;

        if (!isHiding) {
            lockedFlipX = (x + tooltip.offsetWidth > window.innerWidth);

            if (lockedFlipX) {
                let tempX = e.clientX - tooltip.offsetWidth - padding;
                lockedShiftY = (tempX < 0);
            } else {
                lockedShiftY = false;
            }

            lockedFlipY = (y + tooltip.offsetHeight > window.innerHeight);

            if (lockedFlipY) {
                let tempY = e.clientY - tooltip.offsetHeight - padding;
                lockedShiftX = (tempY < 0);
            } else {
                lockedShiftX = false;
            }

        }

        if (lockedFlipX)
            x = e.clientX - tooltip.offsetWidth - padding;

        if (lockedFlipY)
            y = e.clientY - tooltip.offsetHeight - padding;

        if (lockedShiftY)
            x = 0;

        if (lockedShiftX)
            y = 0;

        tooltip.style.left = x + "px";
        tooltip.style.top = y + "px";
    }

    function triggerShow(target, e, instant = false) {
        isHiding = false;

        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }

        activeTooltipType = target.dataset.type;
        activeTooltipData = target.dataset.name;

        if (activeTooltipData && activeTooltipType) {
            renderTooltipContent(tooltip, activeTooltipData, activeTooltipType);
            updatePosition(e);

            if (showTimeout) clearTimeout(showTimeout);

            if (isVisible || instant) {
                safeUpdateClass(tooltip, "visible", true)
                isVisible = true;
            } else {
                showTimeout = setTimeout(function () {
                    safeUpdateClass(tooltip, "visible", true)
                    isVisible = true;
                }, 300);
            }
        }
    }

    function triggerHide() {
        if (showTimeout) {
            clearTimeout(showTimeout);
            showTimeout = null;
        }
        isHiding = true;

        hideTimeout = setTimeout(function () {
            safeUpdateClass(tooltip, "visible", false)
            isVisible = false;

            activeTooltipData = null;
            activeTooltipType = null;
            hideTimeout = null;
        }, 50);
    }

    document.addEventListener("mouseover", function (e) {
        const target = /** @type {Element} */(e.target).closest(".tooltip");

        if (target) {
            currentTargetElement = target;
            lastMouseEvent = e;

            if (gameData?.settings?.requireShiftForTooltip && !e.shiftKey) {
                return;
            }

            triggerShow(target, e, false);
        }
    });

    document.addEventListener("mousemove", function (e) {
        if (currentTargetElement) {
            lastMouseEvent = e;
        }

        if (!tooltip || window.getComputedStyle(tooltip).visibility === "hidden") return;
        updatePosition(e);
    });

    document.addEventListener("mouseout", function (e) {
        const target = /** @type {Element} */(e.target)?.closest?.(".tooltip");
        const relatedTarget = e.relatedTarget ? /** @type {Element} */(e.relatedTarget).closest?.(".tooltip") : null;

        if (target && target !== relatedTarget) {
            currentTargetElement = null;
            triggerHide();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Shift" && gameData?.settings?.requireShiftForTooltip && currentTargetElement && !isVisible) {
            triggerShow(currentTargetElement, lastMouseEvent, true);
        }
    });

    document.addEventListener("keyup", function (e) {
        if (e.key === "Shift" && gameData?.settings?.requireShiftForTooltip && isVisible) {
            triggerHide();
        }
    });
}

/**
 * @param {string} resourceName
 * @param {number} currentValue
 * @param {number} requiredValue
 * @param {{ progressPercent: any; pendingPercent?: any; targetColorClass: any; }} renderResult
 */
function buildResourceTooltipHTML(resourceName, currentValue, requiredValue, pendingValue = 0, renderResult, speed = 0) {
    // pending here is without current

    const progressPercent = renderResult.progressPercent
    const addedPercent = renderResult.pendingPercent - renderResult.progressPercent
    const pendingPercent = renderResult.pendingPercent
    let result = `
        <div class="shop-tooltip-header">Requirements Goal Tracker: ${resourceName}</div>
        <div class="job-tooltip-body" style="text-align: left; font-size: 0.85em;">
            <div><span class="label">Current:</span> <span><span class="${renderResult.targetColorClass}">${format(currentValue)}</span> (${format(progressPercent)}%)</span></div>`
    if (addedPercent > 0)
        result += `<div><span class="label">Pending:</span> <span><span class="${renderResult.targetColorClass}">${format(pendingValue)}</span> (${format(addedPercent)}%)</span></div>`

    result += `<div><span class="label">Required:</span> <span class="${renderResult.targetColorClass}">${format(requiredValue)}</span></div>            
        </div>`

    if (resourceName == "Essence" && gameData.requirements["Faint Hope"].completed) {

        const faintHopeTime = getFaintHopeTime()
        const faintHopeEffect = milestoneData["Faint Hope"].getEffect()
        const ETA = (requiredValue - pendingValue - currentValue) / gameData.stats.EssencePerSecond


        result += `<div class="job-tooltip-body" style="text-align: left; font-size: 0.85em;">
        <div><span class="label">Faint Hope mult:</span> ${format(faintHopeEffect)}</div>
        <div><span class="label">Faint Hope time:</span> ${formatTime(faintHopeTime)}</div>
        <div><span class="label">Essence per second:</span> <span class="${renderResult.targetColorClass}">${format(gameData.stats.EssencePerSecond)}</span></div>
        <div><span class="label">Maximum essence per second:</span> <span class="${renderResult.targetColorClass}">${format(gameData.stats.maxEssencePerSecond)} </span> at ${formatTime(gameData.stats.maxEssencePerSecondRt)}</div>
        <div><span class="label">ETA to next Milestone:</span> ${ETA > 0 ? "<span class=\"w3-text-orange\">" + formatTime(ETA) + "</span>" : "<span style=\"color:limegreen;\">[Ready]</span>"}</div>
        </div>`
    }

    if (speed > 0) {
        const { readyInGameTime, readyInRealTime } = calculateETA(currentValue, requiredValue, speed)
        result += `
        <div class="job-tooltip-body" style="text-align: left; font-size: 0.85em;">
            <div>Game Time: ${readyInGameTime}</div>
            <div>Real Time: ${readyInRealTime}</div>
        </div>`;
    }

    result += `<div class="job-tooltip-footer" style="text-align: left; font-size: 0.85em;">
                <span class="label" style="color: #fff; font-weight: bold;">Progress:</span> 
                <span>${format(progressPercent)}% (${format(pendingPercent)}%)</span>
            </div>`
    return result
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContent(tooltip, data, type) {
    switch (type) {
        case 'simple':
            tooltip.style.borderColor = "rgb(92, 92, 247)";
            renderTooltipContentSimple(tooltip, data, type);
            break;
        case 'milestone':
            tooltip.style.borderColor = "rgb(24, 210, 217)";
            renderTooltipContentSimple(tooltip, data, type);
            break;
        case 'job':
            tooltip.style.borderColor = "rgb(92, 92, 247)";
            renderTooltipContentJob(tooltip, data, type);
            break;
        case 'skill':
            tooltip.style.borderColor = "rgb(0, 180, 160)";
            renderTooltipContentSkill(tooltip, data, type);
            break;
        case 'item':
            tooltip.style.borderColor = "rgb(218, 165, 32)";
            renderTooltipContentItem(tooltip, data, type);
            break;
        case 'requirement':
            tooltip.style.borderColor = "rgb(120, 120, 120)";
            renderTooltipContentRequirement(tooltip, data, type);
            break;
        case 'evil_perk':
            tooltip.style.borderColor = "rgb(180, 40, 40)";
            renderTooltipContentEvilPerk(tooltip, data, type);
            break;
        case 'dark_orbs':
            tooltip.style.borderColor = "rgb(143, 114, 207)";
            renderTooltipContentDarkOrbs(tooltip, data, type);
            break;
        case 'meta_perk':
            tooltip.style.borderColor = "#EA4C89";
            renderTooltipContentMetaPerk(tooltip, data, type);
            break;
        default:
            tooltip.style.borderColor = "#ff0000";
            renderTooltipContentError(tooltip, data, type);
    }
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentMetaPerk(tooltip, data, type) {
    const name = data
    const perkCost = getPerkCost(name);
    let displayName = "LOCKED"
    let baseDescription = "Collect a total of " + perkCost + " MPP to unlock"

    if (perkCost <= getTotalPerkPoints()) {
        displayName = perk_names[name];
        baseDescription = perk_descriptions[name];
    }


    let tooltipHTML = `
        <div class="tooltip-header">${displayName}</div>
        <div class="tooltip-body">${baseDescription}</div>    
        <div class="tooltip-footer">
            <div><span class="label">Cost:</span> <span class="color-perk-points">${perkCost} MPP</span></div>
        </div>
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} task
 * @param {string} type
 */
function renderTooltipContentDarkOrbs(tooltip, task, type) {

    const dealWithChairmanCost = getADealWithTheChairmanCost()
    const giftFromGodCost = getAGiftFromGodCost()
    const lifeCoachCost = getLifeCoachCost()
    const gottaBeFastCost = getGottaBeFastCost()

    const nextCost = min(dealWithChairmanCost, giftFromGodCost, lifeCoachCost, gottaBeFastCost)
    const percent = getDynamicProgress(gameData.dark_orbs, nextCost)

    let result = { progressPercent: percent, pendingPercent: percent, targetColorClass: "color-dark-orbs" };

    let tooltipHTML = buildResourceTooltipHTML("Dark Orbs", gameData.dark_orbs, nextCost, 0, result, getDarkOrbGeneration());

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentSimple(tooltip, data, type) {
    const text = tooltips[data]
    let tooltipHTML = `
        <div class="generic-tooltip-header" style="font-weight: bold; margin-bottom: 5px;">
            ${text}
        </div>        
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}


/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentError(tooltip, data, type) {
    let tooltipHTML = `
        <div class="generic-tooltip-header" style="font-weight: bold; margin-bottom: 5px;">
            Tooltip Error
        </div>
        <div class="generic-tooltip-body" style="font-style: italic; color: #ccc;">
            "No description available."
        </div>
        <div style="font-size: 0.8em; color: #ff5555; margin-top: 8px;">
            (Unknown type: "${type}". Data: "${data}". Needs render code)
        </div>
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}

/**
 * 
 * @param {string} taskName 
 * @returns 
 */
function getHeroicRequiredTooltip(taskName) {
    const requirementObject = gameData.requirements[taskName]
    const requirements = requirementObject.requirements
    const prev = getPreviousTaskInCategory(taskName)

    let tooltip = "<br> <span style=\"color: red\">Required</span>: <span style=\"color: orange\">"
    let reqlist = ""
    let prevReq = ""
    let prevTask = null
    let prevlvl = 0

    if (prev !== "") {
        prevTask = gameData.taskData[prev]
        prevlvl = (prevTask.isHero ? prevTask.level : 0)
        if (prevlvl < 20)
            prevReq = "Great " + prev + " " + prevlvl + "/20<br>"
    }

    if (requirementObject instanceof EvilRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " evil<br>"
    } else if (requirementObject instanceof EssenceRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " essence<br>"
    } else if (requirementObject instanceof AgeRequirement) {
        reqlist += "Age " + format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + "<br>"
    } else if (requirementObject instanceof DarkMatterRequirement) {
        reqlist += format((requirements[0].herequirement == undefined) ? requirements[0].requirement : requirements[0].herequirement) + " Dark Matter<br>"
    } else if (requirementObject instanceof TaskRequirement) {
        for (const requirement of requirements) {
            const task_check = gameData.taskData[/** @type {TaskRequirementConfig} */ (requirement).task]

            const reqvalue = (requirement.herequirement == null ? requirement.requirement : requirement.herequirement)

            if (task_check.isHero && task_check.level >= reqvalue) continue
            if (prev !== "" && task_check.name == prevTask?.name) {
                if (reqvalue <= 20)
                    continue
                else
                    prevReq = " Great " + requirement.task + " " + (task_check.isHero ? task_check.level : 0) + "/" + reqvalue + "<br>"
            } else {
                reqlist += " Great " + requirement.task + " " + (task_check.isHero ? task_check.level : 0) + "/" + reqvalue + "<br>"
            }
        }
    }

    reqlist += prevReq
    reqlist = reqlist.substring(0, reqlist.length - 4)
    tooltip += reqlist + "</span>"
    return tooltip
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentJob(tooltip, data, type) {
    const job = gameData.jobData[data]

    const displayName = (job.isHero ? "Great " : "") + job.name;
    const currentLevelFormatted = formatLevel(job.level);
    const baseDescription = tooltips[job.name] || "";
    const progressPercent = (job.getTaskXpProgressFraction() * 100);

    let tooltipHTML = `
        <div class="job-tooltip-header">
            ${displayName}
            <span class="tooltip-lvl-span">Lv. ${currentLevelFormatted}</span>
        </div>
        <div class="job-tooltip-body">${baseDescription}</div>
    `;

    if (!job.isHero && isHeroesUnlocked()) {
        tooltipHTML += `<div class="job-tooltip-heroic-req">${getHeroicRequiredTooltip(job.name)}</div>`;
    }

    tooltipHTML += `
        <div class="job-tooltip-footer">
            <div><span class="label">Progress:</span> <span>${job.getCurrentXpFormatted()} / ${job.getMaxXpFormatted()} (${format(progressPercent)}%)</span></div>
            <div><span class="label">XP Gain:</span> <span class="w3-text-green">${job.getXpGainFormatted()} / day</span></div>
            <div><span class="label">Time to Level Up:</span> <span class="w3-text-blue">${job.getGameDaysLeftFormatted()}</span></div>
            <div><span class="label">ETA (realtime):</span> <span class="w3-text-orange">${job.getRealTimeLeftFormatted()}</span></div>
            <div class="income-desc">
                <span class="label">Income:</span> 
                <span class="income-value">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </div>
        </div>
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }

    const tooltipIncomeElement = /** @type {HTMLElement} */ (tooltip.querySelector(".income-value"));
    if (tooltipIncomeElement) {
        formatCoins(tooltipIncomeElement, job.getIncome());
    }
}


/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentSkill(tooltip, data, type) {
    const skill = gameData.skillData[data]

    const displayName = (skill.isHero ? "Great " : "") + skill.name;
    const currentLevelFormatted = formatLevel(skill.level);
    const baseDescription = tooltips[skill.name] || "";
    const progressPercent = (skill.getTaskXpProgressFraction() * 100);

    let tooltipHTML = `
        <div class="skill-tooltip-header">
            ${displayName}
            <span class="tooltip-lvl-span">Lv. ${currentLevelFormatted}</span>
        </div>
        <div class="skill-tooltip-body">${baseDescription}</div>
    `;

    if (!skill.isHero && isHeroesUnlocked()) {
        tooltipHTML += `<div class="skill-tooltip-heroic-req">${getHeroicRequiredTooltip(skill.name)}</div>`;
    }

    tooltipHTML += `
        <div class="skill-tooltip-footer">
            <div><span class="label">Progress:</span> <span>${skill.getCurrentXpFormatted()} / ${skill.getMaxXpFormatted()} (${format(progressPercent)}%)</span></div>
            <div><span class="label">XP Gain:</span> <span class="w3-text-green">${skill.getXpGainFormatted()} / day</span></div>
            <div><span class="label">Time to Level Up:</span> <span class="w3-text-blue">${skill.getGameDaysLeftFormatted()}</span></div>
            <div><span class="label">ETA (realtime):</span> <span class="w3-text-orange">${skill.getRealTimeLeftFormatted()}</span></div>
            <div class="skill-tooltip-footer-effect"><span class="label">Effect:</span> ${skill.getEffectDescription()}</div>
        </div>
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentItem(tooltip, data, type) {
    const item = gameData.itemData[data]
    const isLegendary = isHeroesUnlocked();
    const isItemActive = gameData.currentMisc.includes(item) || item == gameData.currentProperty;

    let statusDotColor = "#444";
    if (isItemActive) {
        statusDotColor = autoBuyEnabled
            ? (item.isProperty ? headerRowColors["Properties_Auto"] : headerRowColors["Misc_Auto"])
            : (item.isProperty ? headerRowColors["Properties"] : headerRowColors["Misc"]);
    }

    const baseDescription = tooltips[item.name] || "";

    let tooltipHTML = `
        <div class="shop-tooltip-header ${isLegendary ? 'legendary' : ''}">
            <span class="shop-tooltip-status-dot" style="background-color: ${statusDotColor};"></span>
            ${item.name}
        </div>
        <div class="shop-tooltip-body">${baseDescription}</div>
        <div class="shop-tooltip-footer">
            <div class="effect-desc"><span class="label">Effect:</span> ${item.getEffectDescription()}</div>
        </div>
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}

/**
 * @param {number} current
 * @param {number} required
 * @param {number} genSpeed
 */
function calculateETA(current, required, genSpeed) {
    let percent = 0;
    let readyInRealTime = "";
    let readyInGameTime = "";


    if (required == Infinity) {
        readyInRealTime = `<span style="color:red;">[Never]</span>`;
        readyInGameTime = readyInRealTime;
    }
    else if (current >= required || required == 0) {
        percent = 100;
        readyInRealTime = `<span style="color:limegreen;">[Ready]</span>`;
        readyInGameTime = readyInRealTime;
    }
    else {
        percent = (current / required) * 100;
        if (genSpeed > 0) {
            const totalGameDaysLeft = (required - current) / genSpeed;
            const gameSpeed = gameData.game_speed;
            if (gameSpeed > 0) {
                const seconds = totalGameDaysLeft / gameSpeed;
                readyInRealTime = `<span class="w3-text-orange">${formatTime(seconds)}</span>`;
                const goalGameTime = formatGameDays(totalGameDaysLeft);
                readyInGameTime = `<span class="w3-text-blue">${goalGameTime}</span>`;
            }
            else {
                readyInRealTime = `<span class="w3-text-orange">[Paused]</span>`;
                readyInGameTime = readyInRealTime;
            }
        }
        else {
            readyInRealTime = `<span style="color:red;">[Never]</span>`;
            readyInGameTime = readyInRealTime;
        }
    }

    return { readyInGameTime, readyInRealTime };
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentRequirement(tooltip, data, type) {
    const requirementObject = gameData.requirements[data];
    if (!requirementObject) return;

    const requirements = requirementObject.requirements;
    const curRequiredValue = requirements[0].requirement;
    let tooltipHTML = "";

    if (requirementObject instanceof EvilRequirement) {
        let result = { progressPercent: getDynamicProgress(gameData.evil, curRequiredValue), targetColorClass: "color-evil" };
        result.pendingPercent = getDynamicProgress(gameData.evil + getEvilGainAvailable(), curRequiredValue);
        tooltipHTML = buildResourceTooltipHTML("Evil", gameData.evil, curRequiredValue, getEvilGainAvailable(), result);
    }
    else if (requirementObject instanceof EssenceRequirement) {
        let result = { progressPercent: getDynamicProgress(gameData.essence, curRequiredValue), targetColorClass: "color-essence" };
        result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);
        tooltipHTML = buildResourceTooltipHTML("Essence", gameData.essence, curRequiredValue, getEssenceGainAvailable(), result);
    }
    else if (requirementObject instanceof DarkMatterRequirement) {
        let result = { progressPercent: getDynamicProgress(gameData.dark_matter, curRequiredValue), targetColorClass: "color-dark-matter" };
        result.pendingPercent = getDynamicProgress(gameData.dark_matter + getDarkMatterGainAvailable(), curRequiredValue);
        tooltipHTML = buildResourceTooltipHTML("Dark Matter", gameData.dark_matter, curRequiredValue, getDarkMatterGainAvailable(), result);
    }
    else if (requirementObject instanceof HypercubeRequirement) {
        let result = { progressPercent: getDynamicProgress(gameData.hypercubes, curRequiredValue), targetColorClass: "color-hypercubes" };
        result.pendingPercent = getDynamicProgress(gameData.hypercubes + getHypercubeGenerationAvailable(), curRequiredValue);
        tooltipHTML = buildResourceTooltipHTML("Hypercubes", gameData.hypercubes, curRequiredValue, getHypercubeGenerationAvailable(), result);
    }
    else if (requirementObject instanceof AgeRequirement) {
        let result = { progressPercent: getDynamicProgress(gameData.days, curRequiredValue), targetColorClass: "color-essence", pendingPercent: 0 };
        tooltipHTML = buildResourceTooltipHTML("Age", gameData.days, curRequiredValue, 0, result);
    }
    else if (gameData.taskData[data]) {
        tooltipHTML = `
            <div class="shop-tooltip-header">Requirements Goal Tracker</div>
            <div class="job-tooltip-body" style="text-align: left; font-size: 0.85em;">
        `;
        let progressPercent = 0;
        let reqCount = 0;

        for (const requirement of requirements) {
            if (!requirement.task) {
                console.warn("requirement has no task assigned (renderTooltipContentRequirement)")
                continue
            }
            const reqTask = gameData.taskData[requirement.task];
            const curReqVal = requirement.requirement;

            if (reqTask.level >= curReqVal) {
                progressPercent += 100;
                reqCount++;
                tooltipHTML += `
                    <div style="margin-bottom: 0.5em; color: #888; border-bottom: 1px dotted #333; padding-bottom: 0.5em;">
                        <span class="label">${requirement.task}:</span> Completed (Lv. ${curReqVal})
                    </div>
                `;
            } else {
                const xpProgress = reqTask.getTaskXpProgressFraction();
                const exactLevel = reqTask.level + min(max(xpProgress, 0), 0.999);
                const totalCurrent = min(exactLevel, curReqVal);
                progressPercent += getDynamicProgress(totalCurrent, curReqVal);
                reqCount++;

                const daysLeftForCurrentLevel = reqTask.getGameDaysLeft();
                const totalGameDaysLeft = daysLeftForCurrentLevel + reqTask.getGameDaysTotalTillLevel(curReqVal);
                let goalGameTime = "[A lot]";
                let goalRealTime = "[A lot]";

                if (daysLeftForCurrentLevel !== Infinity) {
                    goalGameTime = formatGameDays(totalGameDaysLeft);
                    const gameSpeed = gameData.game_speed;
                    if (gameSpeed > 0) goalRealTime = formatTime(totalGameDaysLeft / gameSpeed);
                    const lifespan = getLifespan();
                    if (totalGameDaysLeft + gameData.days > lifespan) {
                        goalGameTime += ' <span style="color: red;">(not enough lifespan)</span>';
                    }
                }
                tooltipHTML += `
                    <div style="margin-bottom: 0.5em; border-bottom: 1px dotted #333; padding-bottom: 0.5em;">
                        <span class="label" style="color: #fff; font-weight: bold;">${requirement.task}:</span>
                        <span style="color: #ffeb3b;">Lv. ${reqTask.level}/${curReqVal}</span>
                        <div style="padding-left: 8px; color: #aaa; font-size: 0.95em;">
                            <div>Game Time: <span class="w3-text-blue">${goalGameTime}</span></div>
                            <div>Real Time: <span class="w3-text-orange">${goalRealTime}</span></div>
                        </div>
                    </div>
                `;
            }
        }
        if (reqCount > 0) {
            progressPercent /= reqCount;
            tooltipHTML += `<div><span class="label" style="color: #fff; font-weight: bold;">Progress:</span> <span>${format(progressPercent)}%</span></div>`;
        }
        tooltipHTML += `</div>`;
    }
    else if (gameData.itemData[data]) {
        tooltipHTML = `
            <div class="shop-tooltip-header">Requirements Goal Tracker</div>
            <div class="job-tooltip-body" style="text-align: left; font-size: 0.85em;">
        `;
        let goalGameTime = "Infinity";
        let goalRealTime = "Infinity";
        const moneyLeft = max(curRequiredValue - gameData.coins, 0);

        if (moneyLeft !== Infinity) {
            let realIncome = getTotalNet();
            if (realIncome > 0) {
                let totalGameDaysLeft = moneyLeft / realIncome;
                goalGameTime = formatGameDays(totalGameDaysLeft);
                const gameSpeed = gameData.game_speed;
                if (gameSpeed > 0) goalRealTime = formatTime(totalGameDaysLeft / gameSpeed);
                const lifespan = getLifespan();
                if (totalGameDaysLeft + gameData.days > lifespan) {
                    goalGameTime += ' <span style="color: red;">(not enough lifespan)</span>';
                }
            } else {
                goalGameTime = '[Negative Net]';
                goalRealTime = '[Never]';
            }
        }
        const progressPercent = getDynamicProgress(gameData.coins, curRequiredValue);
        tooltipHTML += `
            <div style="margin-bottom: 6px; border-bottom: 1px dotted #333; padding-bottom: 4px;">
                <div style="padding-left: 8px; color: #aaa; font-size: 0.95em;">
                    <div>Game Time: <span class="w3-text-blue">${goalGameTime}</span></div>
                    <div>Real Time: <span class="w3-text-orange">${goalRealTime}</span></div>
                </div>
            </div>
            <div><span class="label" style="color: #fff; font-weight: bold;">Progress:</span> <span>${format(progressPercent)}%</span></div>
        </div>`;
    }
    else if (milestoneData && milestoneData[data]) {
        let result = { progressPercent: getDynamicProgress(gameData.essence, curRequiredValue), targetColorClass: "color-essence" };
        result.pendingPercent = getDynamicProgress(gameData.essence + getEssenceGainAvailable(), curRequiredValue);
        tooltipHTML = buildResourceTooltipHTML("Essence", gameData.essence, curRequiredValue, getEssenceGainAvailable(), result);
    }

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}

/**
 * @param {HTMLElement} tooltip
 * @param {string} data
 * @param {string} type
 */
function renderTooltipContentEvilPerk(tooltip, data, type) {
    const i = Number(data);
    const perkCost = getEvilPerkCost(i);

    let percent = 0;
    let readyInRealTime = "";
    let readyInGameTime = "";

    if (perkCost == Infinity) {
        readyInRealTime = `<span style="color:red;">[Never]</span>`;
        readyInGameTime = readyInRealTime;
    }
    else if (gameData.evil_perks_points >= perkCost) {
        percent = 100;
        readyInRealTime = `<span style="color:limegreen;">[Ready]</span>`;
        readyInGameTime = readyInRealTime;
    }
    else {
        percent = (gameData.evil_perks_points / perkCost) * 100;
        const gen = getEvilPerksGeneration();
        if (gen > 0) {
            const totalGameDaysLeft = (perkCost - gameData.evil_perks_points) / gen;
            const gameSpeed = gameData.game_speed;
            if (gameSpeed > 0) {
                const seconds = totalGameDaysLeft / gameSpeed;
                readyInRealTime = `<span class="w3-text-orange">${formatTime(seconds)}</span>`;
                const goalGameTime = formatGameDays(totalGameDaysLeft);
                readyInGameTime = `<span class="w3-text-blue">${goalGameTime}</span>`;
            }
            else {
                readyInRealTime = `<span class="w3-text-orange">[Paused]</span>`;
                readyInGameTime = readyInRealTime;
            }
        }
        else {
            readyInRealTime = `<span style="color:red;">[Never]</span>`;
            readyInGameTime = readyInRealTime;
        }
    }

    const cost = format(perkCost, 0);
    const cost_percent = (gameData.evil_perks_points > 0) ? (perkCost / gameData.evil_perks_points) * 100 : Infinity;

    let footer = "";
    let body = "";
    const header = { 1: "The Eye Age Requirement", 2: "Evil Age Requirement", 3: "The Void Age Requirement", 4: "Celestial Age Requirement", 5: "Receive Essence" };

    if (i < 5) {
        body = `<div style="padding-bottom: 0.4em;"><span class="label">Current:</span> <span class="currency-bold epp-color">${getEvilPerkAgeRequirement(i)}</span> years</div>`;

        if (perkCost !== Infinity) {
            body += `<div style="padding-bottom: 0.8em;"><span class="label">Next:</span> <span class="currency-bold epp-color">${getEvilPerkAgeRequirement(i) - getEvilPerkAgeReduceBy(i)}</span> years</div>`;
            body += `<div style="padding-bottom: 0.4em;"><span class="label">This Upgrade: </span>${-getEvilPerkAgeReduceBy(i)} years</div>`;
        }

        body += `<div style="padding-bottom: 0.8em;"><span class="label">Total Reduced: </span>${-getEvilPerkAgeReduceByTotal(i)} years</div>`;
        if (perkCost !== Infinity) {
            body += `
                <div style="padding-bottom: 0.4em;"><span class="label">Game Time:</span> <span>${readyInGameTime}</span></div>
                <div style="padding-bottom: 0.4em;"><span class="label">Real Time:</span> <span>${readyInRealTime}</span></div>
                <div style="padding-bottom: 0.4em;"><span class="label">Progress:</span> <span>${format(percent)}%</span></div>
            `;
        }
    }
    else {
        const essenceReward = getEssenceReward();
        const essenceRewardPercent = getEssenceRewardPercent();

        body = `<div style="padding-bottom: 0.4em;"><span class="label">Essence Reward:</span> <span class="currency-bold color-essence">${format(essenceReward)}</span></div>`;
        body += `<div style="padding-bottom: 0.4em;"><span class="label">Essence Reward Bonus:</span> <span class="currency-bold color-essence">${essenceRewardPercent}</span>%</div>`;

        if (perkCost !== Infinity) {
            body += `<div style="padding-bottom: 0.8em;"><span class="label">Next Bonus:</span> <span class="currency-bold color-essence">${essenceRewardPercent + 10}</span>%</div>`;
        }

        if (perkCost !== Infinity) {
            body += `
                <div style="padding-bottom: 0.4em;"><span class="label">Game Time:</span> <span>${readyInGameTime}</span></div>
                <div style="padding-bottom: 0.4em;"><span class="label">Real Time:</span> <span>${readyInRealTime}</span></div>
                <div style="padding-bottom: 0.4em;"><span class="label">Progress:</span> <span>${format(percent)}%</span></div>
            `;
        }
    }

    if (perkCost !== Infinity) {
        footer = `<div class="color-evil" style="font-size: 1.3em"><span class="label">Cost:</span> ${cost} EPP <span class="label">(${format(cost_percent)}% of current EPP)</span></div>`;
    }
    else {
        footer = `<div class="w3-text-orange" style="font-size: 1.2em">Maximum Rank</div>`;
    }

    let tooltipHTML = `
        <div class="job-tooltip-header">${header[i]}<span style="padding-left:1em;" class="tooltip-lvl-span ${perkCost == Infinity ? "w3-text-orange" : ""}">Rank. ${getEvilPerkRank(i)}</span></div>
        <div class="shop-tooltip-body" style="text-align: left;">${body}</div>
        <div class="shop-tooltip-footer">
            ${footer}
        </div>
    `;

    if (tooltip.innerHTML !== tooltipHTML) {
        tooltip.innerHTML = tooltipHTML;
    }
}
