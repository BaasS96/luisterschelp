var time = 0;
var canvas, ctx;

function errorCallback(e) {
    console.log("User denied permission to use camera.", e);
    //Reload;
}

function initCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();;
        });
    } else {
        alert("function not supported");
    }
}

function startOverlay() {
    canvas = document.getElementById("photocanvas");
    ctx = canvas.getContext("2d");
    var timer = setInterval(
        function() {
            //ctx.drawImage(video, 0, 0, 320, 240);
        }, 50
    );
    cameraOverlay();
    initCamera();
    $("#video").click(function() {
        ctx.drawImage(video, 0, 0);
        document.querySelector("img").src = canvas.toDataURL("image/webp");
    });
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