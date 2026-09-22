onerror = (message, source, lineno, colno, error) => {
    console.error(`🚨 %cCritical error: ${message}`, "font-weight: bold; color: red;");

    console.dir({
        "Message": message,
        "Source": source,
        "Line No": lineno,
        "Col No": colno,
        "Error": error,
        "Stack Trace": error ? error.stack : "Not available"
    });

    safeUpdateHidden("errorInfo", false)
    tempData.hasError = true
    setTimeout(() => {
        safeUpdateHidden("errorInfo", true)
    }, 30 * 1000)
}

const sidebarMediaQuery = window.matchMedia("(min-width: 48em)");
sidebarMediaQuery.addEventListener("change", handleSidebarLayout);

// Initialization

// Loads the game save, does the initial render and starts the game update and render loop.

createGameObjects(gameData.taskData, jobBaseData)
createGameObjects(gameData.taskData, skillBaseData)
createGameObjects(gameData.itemData, itemBaseData)
createGameObjects(milestoneData, milestoneBaseData)

gameData.currentProperty = gameData.itemData["Homeless"]
gameData.currentMisc = []

loadGameData()

initializeUI()


if ("save_date_time" in gameData && gameData.save_date_time > 0) {
    calc_offline_progress(Date.now() - gameData.save_date_time)
}

safeUpdateHidden("mainarea", isProcessingOfflineProgress)

handleSidebarLayout(sidebarMediaQuery);


// game loop
let nextTick = Date.now();

/** @type {number | null} */
var gameloopTimeoutId = null;

function startGameLoop() {
    if (gameloopTimeoutId !== null) return;
    nextTick = Date.now();

    gameLoop();
}

function stopGameLoop() {
    if (gameloopTimeoutId !== null) {
        clearTimeout(gameloopTimeoutId);
        gameloopTimeoutId = null;
    }
}

function gameLoop() {
    let now = Date.now();
    let msSinceLastCall = now - (nextTick - gameTickLength);

    if (msSinceLastCall >= 10000 && !isProcessingOfflineProgress) {
        calc_offline_progress(msSinceLastCall);
        nextTick = Date.now();
    } else {
        while (Date.now() >= nextTick) {
            update();
            nextTick += gameTickLength;
        }
    }

    let delay = Math.max(0, nextTick - Date.now());
    gameloopTimeoutId = setTimeout(gameLoop, delay);
}

// save loop

/** @type {number | null} */
var saveloopIntervalId = null;

function startSaveLoop() {
    if (saveloopIntervalId !== null) return;
    saveGameData();
    saveloopIntervalId = setInterval(saveGameData, saveTickLength)
}

function stopSaveLoop() {
    if (saveloopIntervalId !== null) {
        clearInterval(saveloopIntervalId);
        saveloopIntervalId = null;
    }
}

// render loop

let isRenderPaused = false;

function pauseRender() {
    isRenderPaused = true;
}

function resumeRender() {
    if (!isRenderPaused) return;

    isRenderPaused = false;
    lastFpsUpdateTime = performance.now();
    frameCount = 0;

    requestAnimationFrame(renderLoop);
}

function renderLoop() {
    if (isRenderPaused)
        return;

    updateUI();
    requestAnimationFrame(renderLoop);
}

// start the game loops
startGameLoop()
startSaveLoop()
requestAnimationFrame(renderLoop);
