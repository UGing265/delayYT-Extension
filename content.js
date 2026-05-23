let isRunning = false;
let timeoutId = null;
let playDuration = 5000;
let pauseDuration = 1000;

function loop() {
    if (!isRunning) return;
    
    const video = document.querySelector('.html5-main-video');
    if (!video) {
        console.error("YT Auto Pause: No main video found!");
        return;
    }

    // Play video
    video.play();
    
    // Wait for play duration
    timeoutId = setTimeout(() => {
        if (!isRunning) return;
        
        // Pause video
        video.pause();
        
        // Wait for pause duration
        timeoutId = setTimeout(() => {
            loop(); // Repeat cycle
        }, pauseDuration);
        
    }, playDuration);
}

// Lắng nghe lệnh từ popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "START") {
        playDuration = request.playDurationMs;
        pauseDuration = request.pauseDurationMs;
        isRunning = true;
        clearTimeout(timeoutId);
        
        console.log(`YT Auto Pause: Started (${playDuration}ms play, ${pauseDuration}ms pause)`);
        loop();
        sendResponse({status: "started"});
    } 
    else if (request.command === "STOP") {
        isRunning = false;
        clearTimeout(timeoutId);
        
        const video = document.querySelector('.html5-main-video');
        if (video) video.pause();
        
        console.log("YT Auto Pause: Stopped");
        sendResponse({status: "stopped"});
    }
    return true; // Keep message channel open for async response
});

// Khôi phục trạng thái nếu tải lại trang
chrome.storage.local.get(['playTime', 'pauseTime', 'isRunning'], (result) => {
    if (result.isRunning) {
        playDuration = (result.playTime || 5) * 1000;
        pauseDuration = (result.pauseTime || 1) * 1000;
        isRunning = true;
        
        // Delay a bit to let YouTube load the video element
        setTimeout(() => {
            loop();
        }, 2000);
    }
});
