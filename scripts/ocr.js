var time = 0;
var canvas, ctx;
var w, h, cw, ch;
var photo = false;
var testresult = [];
var backcam;

window.onload = function() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    w = window.innerWidth;
    let body = document.body,
        html = document.documentElement;
    h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    canvas.setAttribute("width", 600);
    canvas.setAttribute("height", 600);
    cw = 600;
    ch = 600;
    initCamera();
}

function initCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: { exact: backcam }
            }
        }).then(function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
            canvas.addEventListener('click', function() {
                photo = true;
                console.log(ctx.getImageData(0, 0, cw, ch));
                let data = threshold(ctx.getImageData(0, 0, cw, ch));
                console.log(data);
                ctx.putImageData(data, 0, 0);
                recognize(data);
            }, false);
            draw(video, 0, 0, cw, ch);
        }).catch(function(err) {
            console.log(err);
        });
    } else {
        alert("function not supported");
    }
}


function tresholdimage() {
    photo = true;
    let img = document.getElementById("text");
    ctx.drawImage(img, 0, 0, cw, ch);
    let data = threshold(ctx.getImageData(0, 0, cw, ch));
    console.log(data);
    ctx.putImageData(data, 0, 0);
}

function recognize(data) {
    console.log("recognizing...");
    var timer = setInterval(timeri, 1);
    var text = OCRAD(data);
    let conf = confidence(text);
    if (conf === false) {
        //Returned false, need to scan again.
        alert("scan again!");
    } else {
        //Further process the answer.
        alert(conf);
    }
    //alert(string);
    photo = false;
}

function timeri() {
    time++;
}

function draw(v, x, y, w, h) {
    if (!photo) {
        ctx.drawImage(v, x, y, w, h);
        setTimeout(draw, 20, v, x, y, w, h);
    } else {
        //ctx.drawImage(v, x, y, w, h);
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

//Functions to prepare the image for recognition 
function threshold(d) {
    var imageData = d.data;
    //Treshold the image to get a contrasted image.
    //First, calculate the histogram
    let hist = getHistogram(imageData);
    //Using the histogram, calculate the appropriate treshold to separate the image in back and forground
    var threshold = otus(hist, imageData.length / 4);
    console.log(threshold);
    //Apply the treshold
    var newIData = imageData;
    for (var i = 0; i < newIData.length; i += 4) {
        if (newIData[i] >= threshold) {
            newIData[i] = 255;
            newIData[i + 1] = 255;
            newIData[i + 2] = 255;
        } else {
            newIData[i] = 0;
            newIData[i + 1] = 0;
            newIData[i + 2] = 0;
        }
    }
    d.data = newIData;
    return d;
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
/**
 * @param {string} rawtext Raw input text that was recognized
 */
function confidence(rawtext) {
    if (rawtext.length === 0) return false;
    let answer = "";
    let charcount = 0;
    let letters = "",
        i = 0,
        abc = "abcdefghijklmnopqrstuvw",
        exceptioncharacters = "!/\015",
        charsforI = "!/\1";
    for (i = 0; i <= rawtext.length; i++) {
        let char = rawtext.charAt(i).toLowerCase();
        if (abc.indexOf(char) !== -1) {
            //The answer contains letter(s)
            letters += char;
            continue;
        }
        if (exceptioncharacters.indexOf(char) !== -1 && rawtext.length <= 3) {
            //A letter may have been recognized as a character, but we assume that this is the case if the length of the full string is less than 3
            if (charsforI.indexOf(char) !== -1) {
                letters += "i";
            } else if (char === "0") {
                letters += "o";
            } else {
                letters += "s";
            }
            continue;
        }
        charcount++;
    }
    if (letters.length > 5) {
        //Too suspicious
        return false;
    } else {
        if (charcount > 5) {
            //probs not a great guess to return a letter now.
            return false;
        }
        answer = letters.charAt(0);
    }
    return answer;
}