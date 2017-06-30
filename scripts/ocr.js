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

function cameraOverlay() {
    var overlay = document.getElementById("cameraoverlay");
    if (!cameraOverlayopen) {
        overlay.style.marginLeft = 0;
        cameraOverlayopen = true;
    } else {
        overlay.style.marginLeft = "-310vw";
        cameraOverlayopen = false;
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
    var video = document.getElementById("video");
    video.setAttribute("width", w);
    video.setAttribute("height", h);
    video.style.display = "inline-block";
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

//Functions to prepare the image for recognition 
function treshold(imageData) {
    //Treshold the image to get a contrasted image.
    //First, calculate the histogram
    let hist = getHistogram(imageData);
    //Using the histogram, calculate the appropriate treshold to separate the image in back and forground
    var treshold = otus(hist, imageData.length / 4);
    //Apply the treshold
    for (var i = 0; i < data.length; i += 4) {
        imageData[i] = imageData[i + 1] = imagedata[i + 2] = imagedata[i] >= threshold ? 255 : 0;
    }
    return imageData;
}

function getHistogram(data) {
    let histogram = Array(256);
    for (var i = 0; i < 256; i++) {
        histogram[i] = 0;
    }
    for (var i = 0; i < data.length; i += 4) {
        let red = data[i];
        let blue = data[i + 1];
        let green = data[i + 2];
        let gray = red * .2126 + green * .07152 + blue * .0722;
        gray = Math.round(gray);
        histogram[gray] += 1;
    }
    return histogram;
}

function otus(histData, total) {
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * histData[t];
    let sumB = 0;
    let wB = 0;
    let wF = 0;
    let varMax = 0;
    let threshold = 0;
    for (let t = 0; t < 256; t++) {
        wB += histData[t];
        if (wB == 0) continue;
        wF = total - wB;
        if (wF == 0) break;
        sumB += t * histData[t];
        let mB = sumB / wB;
        let mF = (sum - sumB) / wF;
        let varBetween = wB * wF * (mB - mF) * (mB - mF);
        if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
        }
    }
    return threshold;
}