/** @type {number | null} */
let offlineIntervalId = null;
let offlineTotalTicks = 0;
let offlineExecutedTicks = 0;
let isProcessingOfflineProgress = false;

const OFFLINE_CONFIG = {
    MAX_TIME_MS: 3600 * 1000, // 1 час
    TICKS_PER_INTERVAL: 200,   // Сколько тиков за один шаг таймера
    INTERVAL_DELAY_MS: 2,     // Пауза между батчами для отзывчивости UI
    UI_UPDATE_FREQUENCY: 600   // Частота обновления UI (в тиках)
};

function clearIntervalX() {
    if (offlineIntervalId !== null) {
        clearTimeout(offlineIntervalId); // Изменено на clearTimeout
        offlineIntervalId = null;
    }
}

function stopOfflineProgress() {
    isProcessingOfflineProgress = false;
    clearIntervalX();
    toggleOfflineUi(false);
    // Сбрасываем переменные для безопасности
    offlineTotalTicks = 0;
    offlineExecutedTicks = 0;
}

/**
 * 
 * @param {number} ms 
 * @returns 
 */
function calc_offline_progress(ms) {
    if (ms <= 10000) return;

    stopOfflineProgress();

    const validMs = min(ms, OFFLINE_CONFIG.MAX_TIME_MS); // 10001 - 3600000
    const totalTicks = floor(validMs / gameTickLength); // 200 - 72000

    isProcessingOfflineProgress = true;
    offlineExecutedTicks = 0;
    offlineTotalTicks = totalTicks; // 200+

    toggleOfflineUi(true);
    updateOfflinePercentageUi();

    runOfflineTickLoop();
}

function runOfflineTickLoop() {
    if (!isProcessingOfflineProgress) return;

    const ticksLeft = offlineTotalTicks - offlineExecutedTicks;
    const ticksToRun = min(OFFLINE_CONFIG.TICKS_PER_INTERVAL, ticksLeft);

    if (ticksToRun > 0) {
        const canContinue = updateOfflineBatch(ticksToRun);
        if (!canContinue) {
            stopOfflineProgress();
            return;
        }
    }

    if (offlineExecutedTicks >= offlineTotalTicks) {
        stopOfflineProgress();
    } else {
        offlineIntervalId = setTimeout(runOfflineTickLoop, OFFLINE_CONFIG.INTERVAL_DELAY_MS);
    }
}

/**
 * 
 * @param {number} ticksToRun 
 * @returns 
 */
function updateOfflineBatch(ticksToRun) {
    let uiNeedsUpdate = false;

    for (let i = 0; i < ticksToRun; i++) {
        if (!gameData.is_alive)
            return false;

        update();

        if (!gameData.is_alive)
            return false;

        offlineExecutedTicks++;

        if (offlineExecutedTicks % OFFLINE_CONFIG.UI_UPDATE_FREQUENCY === 0) {
            uiNeedsUpdate = true;
        }
    }

    if (uiNeedsUpdate || offlineExecutedTicks >= offlineTotalTicks) {
        updateOfflinePercentageUi();
    }
    return true;
}

/**
 * 
 * @param {boolean} showOffline 
 * @returns 
 */
function toggleOfflineUi(showOffline) {
    safeUpdateHidden("offline_progress", !showOffline)
    safeUpdateHidden("mainarea", showOffline)
}

function updateOfflinePercentageUi() {
    if (!offlineTotalTicks) return;

    const percentage = floor((offlineExecutedTicks * 100) / offlineTotalTicks);
    const text = `${percentage}%`;
    safeUpdateText("offline_time", text)

    renderProgessResource("#offline_progress", percentage);
}
