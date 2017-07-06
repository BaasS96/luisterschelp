var letter;
//functions for LETTER GAME
function gameLetterStep2() {
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
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
    ocr = new OCR();
    let func = function(res) {
        if (res.hasFailed()) {
            failedCallback();
        } else {
            successCallback(res);
        }
    }
    ocr.init(func);
    ocr.initCamera();
    alert(navigator.userAgent);
}
function gameLetterControl() {
    
}