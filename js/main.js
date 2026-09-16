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

    elById("errorInfo").hidden = false
    tempData.hasError = true
    setTimeout(() => {
        elById("errorInfo").hidden = true
    }, 30 * 1000)
}


const sidebarMediaQuery = window.matchMedia("(min-width: 48em)");
sidebarMediaQuery.addEventListener("change",handleSidebarLayout);


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

el("#mainarea").hidden = isProcessingOfflineProgress

handleSidebarLayout(sidebarMediaQuery);
update()

let ticking = false
let lastUpdate = 0
let nextTick = Date.now();

/*
var gameloop = setInterval(function () {
    if (ticking)
        return
    ticking = true
    update()
    var ms = Date.now() - lastUpdate
    if (lastUpdate !== 0 && ms >= 10000 && !isProcessingOfflineProgress)
        calc_offline_progress(ms)
    lastUpdate = Date.now()

    ticking = false
}, gameTickLength) */

function gameloop() {
    let now = Date.now();
    let msSinceLastCall = now - (nextTick - gameTickLength);

    // 1. Check for massive offline gaps first
    if (msSinceLastCall >= 10000 && !isProcessingOfflineProgress) {
        calc_offline_progress(msSinceLastCall);
        nextTick = Date.now(); // Reset the clock after offline processing
    } else {
        // 2. Catch up on missed ticks if a frame took too long
        while (Date.now() >= nextTick) {
            update();
            nextTick += gameTickLength; // Strictly advances by exactly 50ms
        }
    }

    // 3. Dynamic delay: schedules the next check based on how much time is left
    let delay = Math.max(0, nextTick - Date.now());
    setTimeout(gameloop, delay);
}

var saveloop = setInterval(saveGameData, 3000)


let isRenderPaused = false;
let lastFpsUpdateTime = performance.now();
let frameCount = 0;

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
    if (isRenderPaused) {
        return;
    }

    updateUI();

    // ---FPS ---
    /*
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFpsUpdateTime;

    if (elapsed >= 1000) {
        const currentFps = round((frameCount * 1000) / elapsed);

        safeUpdateText("fpsCounter", `FPS: ${currentFps}`);
        safeUpdateText("fps", `FPS: ${currentFps}`);

        frameCount = 0;
        lastFpsUpdateTime = now;
    }
    */
    // -------------------------

    requestAnimationFrame(renderLoop);
}

gameloop()
requestAnimationFrame(renderLoop);
