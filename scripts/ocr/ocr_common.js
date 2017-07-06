//Common code for all ocr based modes
var ocr;

function load(successCallback, failedCallback) {
    ocr = new OCR();
    ocr.init(recognized, successCallback, failedCallback);
    ocr.initCamera();
}

function recognized(res, successCallback, failedCallback) {
            if (res.hasFailed()) {
            failedCallback();
        } else {
            successCallback(e);
        }
}

function fail() {
    alert('fail');
}

function load_1() {
    let abc = "abcdefghijklmnopqrstuvwxyz";
    let r = _.random(0, abc.length);
    letter = abc.charAt(r);
    var letterSound = new Howl({
        src: ['sound/letters/' + letter + '.flac', 'sound/letters/' + letter + '.mp3'],
        volume: 1,
        onend: function() {
            setTimeout(function() {
                document.getElementById("sound").style.display = "none";
                document.getElementById("controlholder").style.display = "block";
                init();
                initCamera();
            }, 1000);
        }
    });
    letterSound.play();
}

function checkAnswer() {

}