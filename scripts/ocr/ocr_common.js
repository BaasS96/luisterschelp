//Common code for all ocr based modes
var ocr;

function load(successCallback, failedCallback) {
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
    switch (document.URL) {
        case letter.html:
        
    }
    load_1();
}

function c() {}

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
            }, 1000);
        }
    });
    letterSound.play();
}

function checkAnswer() {

}
