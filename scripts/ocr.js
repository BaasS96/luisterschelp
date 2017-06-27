var time = 0;
var canvas, ctx;
var w, h, cw, ch;
var photo = false;
var testresult = [];

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    w = window.innerWidth;
    let body = document.body,
        html = document.documentElement;
    h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    if (isMobile) {
        canvas.setAttribute("width", w);
        canvas.setAttribute("height", h);
        cw = w;
        ch = h;
    } else {
        canvas.setAttribute("width", 600);
        canvas.setAttribute("height", 600);
        cw = 600;
        ch = 600;
    }
    initCamera();
}

function initCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingmode: "environment" } }).then(function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
            canvas.addEventListener('click', function() {
                photo = true;
                recognize();
            }, false);
            draw(video, 0, 0, cw, ch);
        }).catch(function(err) {
            console.log(err);
        });
    } else {
        alert("function not supported");
    }
}

function recognize() {
    console.log("recognizing...");
    var timer = setInterval(timeri, 1);
    Tesseract.recognize(ctx)
        .then(function(result) {
            console.log(result);

        }).finally(function(d) {
            photo = false;
            draw();
        });
}

function timeri() {
    time++;
}

function draw(v, x, y, w, h) {
    if (!photo) {
        ctx.drawImage(v, x, y, w, h);
        setTimeout(draw, 20, v, x, y, w, h);
    } else {
        ctx.drawImage(v, x, y, w, h);
    }
}
var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function getResults() {
    var negative = 0;
    _.forEach(testresult, function(val, key) {
        if (val > 1) {
            negative++;
        } else {
            testresult.splice(key);
        }
    });
    console.log(negative + " of " + testresult.length + " run tests were invalid:");
    _.forEach(testresult, function(val, key) {
        console.log(key + ": " + val);
    });
}