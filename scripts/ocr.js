var time = 0;

function errorCallback(e) {
    console.log("User denied permission to use camera.", e);
    //Reload;
}

function initCamera(video) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }, function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        }, errorCallback);
    } else {
        alert("function not supported");
    }
}

function startOverlay() {
    var video = document.getElementById("videofeed");
    var timer = setInterval(
        function() {
            //ctx.drawImage(video, 0, 0, 320, 240);
        }, 50
    );
    initCamera(video);
    cameraOverlay();
}

function recognize() {
    let video = document.getElementById("video");
    console.log("recognizing...");
    var timer = setInterval(timeri, 1);
    OCRAD(video, {}, function(text) {
        clearInterval(timer);
        console.log("recognized, took " + time + "ms:");
        time = 0;
        console.log(text || "(empty)");
    })
}

function timeri() {
    time++;
}