document.addEventListener('DOMContentLoaded', () => {
    const playTimeInput = document.getElementById('playTime');
    const pauseTimeInput = document.getElementById('pauseTime');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusText = document.getElementById('statusText');

    // Load trạng thái cũ nếu có
    chrome.storage.local.get(['playTime', 'pauseTime', 'isRunning'], (result) => {
        if (result.playTime) playTimeInput.value = result.playTime;
        if (result.pauseTime) pauseTimeInput.value = result.pauseTime;
        updateStatusUI(result.isRunning);
    });

    function updateStatusUI(isRunning) {
        if (isRunning) {
            statusText.textContent = "Trạng thái: Đang CHẠY";
            statusText.classList.add('active');
        } else {
            statusText.textContent = "Trạng thái: Đang TẮT";
            statusText.classList.remove('active');
        }
    }

    function sendMessageToContentScript(command, data = {}) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0].url.includes("youtube.com/watch")) {
                chrome.tabs.sendMessage(tabs[0].id, {command: command, ...data}, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log("Could not establish connection. Maybe page is reloading.");
                    }
                });
            } else {
                statusText.textContent = "Chỉ hoạt động trên Youtube!";
            }
        });
    }

    startBtn.addEventListener('click', () => {
        const playTime = parseFloat(playTimeInput.value) || 5;
        const pauseTime = parseFloat(pauseTimeInput.value) || 1;

        chrome.storage.local.set({playTime: playTime, pauseTime: pauseTime, isRunning: true});
        updateStatusUI(true);

        sendMessageToContentScript("START", {
            playDurationMs: playTime * 1000,
            pauseDurationMs: pauseTime * 1000
        });
    });

    stopBtn.addEventListener('click', () => {
        chrome.storage.local.set({isRunning: false});
        updateStatusUI(false);
        sendMessageToContentScript("STOP");
    });
});
