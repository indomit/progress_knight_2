function importGameData() {
    let data;

    // check import data
    try {
        const importExportBox = /** @type {HTMLInputElement} */ (elById("importExportBox"))
        if (!importExportBox || (importExportBox).value == "") {
            alert(`It looks like you tried to load an empty save... Paste save data into the box, then click "Import Save" again.`)
            return
        }

        data = JSON.parse(window.atob(importExportBox.value))
        if (!isValidSaveData(data)) {
            throw new Error("Invalid save structure");
        }
    } catch (error) {
        alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!")
        return;
    }

    // enter critical section
    try {
        stopSaveLoop()
        stopGameLoop()
        pauseRender()
        saveGameData(data)

    } catch (criticalError) {
        console.error("Critical import crash:", criticalError);
        alert("Critical error: Failed to apply the new save. Your previous progress was kept safe. The page will now reload.");
    }

    // always reload
    location.reload()
}

function importGameDataFromFile() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt";

    fileInput.onchange = (event) => {
        const target = /** @type {HTMLInputElement} */ (event.target);
        const file = target?.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const result = e.target?.result;
            const saveContent = typeof result === "string" ? result.trim() : "";

            if (!saveContent) {
                alert("Cannot read file or file is empty!");
                return;
            }

            let data;
            try {
                data = JSON.parse(window.atob(saveContent));

                if (!isValidSaveData(data)) {
                    throw new Error("Invalid save structure");
                }
            } catch (error) {
                alert("It looks like you tried to load a corrupted save... If this issue persists, feel free to contact the developers!");
                return;
            }

            try {
                stopSaveLoop()
                stopGameLoop()
                pauseRender()
                saveGameData(data);
            } catch (criticalError) {
                console.error("Critical import crash:", criticalError);
                alert("Critical error: Failed to apply the new save. Your previous progress was kept safe. The page will now reload.");
            }

            // always reload
            location.reload()
        };

        reader.readAsText(file);
    };

    fileInput.click();
}

function exportGameData() {
    const importExportBox = /** @type {HTMLInputElement} */ (elById("importExportBox"))
    const saveString = window.btoa(JSON.stringify(gameData))
    importExportBox.value = saveString

    copyTextToClipboard(saveString)
        .then(() => {
            const tooltip = elById("exportTooltip")
            if (tooltip)
                tooltip.innerHTML = "&nbsp;&nbsp;Save copied to clipboard!"
        })
        .catch(err => {
            console.error('Could not copy text: ', err)
        })
    setTimeout(() => {
        if (importExportBox.value == saveString) {
            importExportBox.value = ""
        }
    }, 15 * 1000)
}

function outExportButton() {
    const tooltip = elById("exportTooltip")
    safeUpdateText(tooltip, "")
}

function exportGameDataToFile() {
    const saveString = window.btoa(JSON.stringify(gameData))
    exportToFile(saveString)
}

/**
 * 
 * @param {string} saveString 
 */
function exportToFile(saveString) {
    try {
        const blob = new Blob([saveString], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;

        const now = new Date();
        const dateString = now.toISOString().slice(0, 10);
        const timeString = now.toISOString().slice(11, 16).replace(":", "-");

        downloadLink.download = `progress_knight_quest_${dateString}_${timeString}.txt`;


        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to download the save file:", error);
    }
}