var letter;
var ocr;
var failcount = 0;
//functions for LETTER GAME
function gameLetterStep2() {
    document.getElementById("step1").style.display = "none";
    document.getElementById("step3").style.display = "none";
    document.getElementById("step5").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.getElementById("progressbar").style.width = "33%";
    if (letter) {
    }
    else {
        let abc = "abcdefghijklmnopqrstuvwxyz";
        let r = _.random(0, abc.length);
        letter = abc.charAt(r);
    }
    document.getElementById("step2_letter_show").innerHTML = letter;
}
function gameLetterStep3() {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
    document.getElementById("progressbar").style.width = "66%";
    ocr = new OCR();
    let func = function(res) {
        if (res.hasFailed()) {
            document.getElementById("bttn_control").src = "images/ic_warning_orange_96dp.png";
            setTimeout(function(){ document.getElementById("bttn_control").src = "images/ic_photo_camera_white_72dp.png"; }, 3000);
        }
        else {
            let result = res.getResult();
            if (result === letter) {
                //ocr.videostream.getTracks()[0].stop();
                //gameLetterStep4(result);
            }
            else {
                //failcount ++
                //if (failcount >= 5) {
                //    gameLetterStep6(result);
                //}
                //else {
                //    gameLetterStep5(result);
                //}
            }
        }
    }
    ocr.init(func);
    ocr.initCamera();
    //alert(navigator.userAgent);
}
function gameLetterControl() {
    ocr.photo = true;
    ocr.recognize();
}
function gameLetterStep4(result) {
    //Answer was correct
    document.getElementById("step3").style.display = "none";
    document.getElementById("step4").style.display = "block";
    let goodImg = ["images/good_ape.png","images/good_smile.png","images/good_thumb.png"];
    let r = _.random(0, goodImg.length);
    document.getElementById("good_IMG").src = goodImg[r];
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("letterholder").innerHTML = letter;
    document.getElementById("letterimg").src = "images/letters/" + letter + ".png";
    document.getElementById("letteroverlay").style.marginLeft = 0;
    var letterSound = new Howl({
        src: ['sound/letters/' + letter + '.flac', 'sound/letters/' + letter + '.mp3'],
        volume: 1,
        onend: function() {
            setTimeout(function() {
                document.getElementById("letteroverlay").style.marginLeft = "-110vw";
            }, 750);
        }
    });
    letterSound.play();
    alert(result + "/" + letter);
}
function gameLetterStep5(result) {
    document.getElementById("step3").style.display = "none";
    document.getElementById("step5").style.display = "block";
    alert(result + "/" + letter);
}
function gameLetterStep6(result) {
    document.getElementById("step4").style.display = "none";
    document.getElementById("step6").style.display = "block";
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("letterholder").innerHTML = letter;
    document.getElementById("letterimg").src = "images/letters/" + letter + ".png";
    document.getElementById("letteroverlay").style.marginLeft = 0;
    var letterSound = new Howl({
        src: ['sound/letters/' + letter + '.flac', 'sound/letters/' + letter + '.mp3'],
        volume: 1,
        onend: function() {
            setTimeout(function() {
                document.getElementById("letteroverlay").style.marginLeft = "-110vw";
            }, 750);
        }
    });
    letterSound.play();
    alert(result + "/" + letter);
}
function gameLetterStep0() {
    letter = undefined;
    failcount = 0;
    document.getElementById("step4").style.display = "none";
    document.getElementById("step6").style.display = "none";
    document.getElementById("step1").style.display = "block";
    document.getElementById("progressbar").style.width = "0%";
}