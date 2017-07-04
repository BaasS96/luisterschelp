//Common code for all ocr based modes
var ocr;

function load(successCallback, failedCallback) {
    ocr = new OCR();
    ocr.init();
    ocr.initCamera();
    ocr.addEventListener('recognized', function(e) {
        if (e.result.hasFailed()) {
            failedCallback();
        } else {
            successCallback(e);
        }
    }, false);
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