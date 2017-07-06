var letter;
var woord;
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
    ocr = new OCR(false);
    let func = function(res) {
        if (res.hasFailed()) {
            var soundIntFail = new Howl({
                src: ['sound/beep_intfail.flac', 'sound/beep_intfail.mp3'],
                volume: 1
            });
            soundIntFail.play();
            document.getElementById("bttn_control").src = "images/ic_warning_orange_96dp.png";
            setTimeout(function(){ document.getElementById("bttn_control").src = "images/ic_photo_camera_white_72dp.png"; }, 3000);
        }
        else {
            var result = res.getResult();
            if (result === letter) {
                ocr.videostream.getTracks()[0].stop();
                let soundGood = new Howl({
                    src: ['sound/beep_good.flac', 'sound/beep_good.mp3'],
                    volume: 1,
                    onend: function() {
                        setTimeout(function() {
                            gameLetterStep4(result);
                        }, 500)
                    }
                });
                soundGood.play();
            }
            else {
                failcount ++;
                if (failcount >= 5) {
                    gameLetterStep6(result);
                    ocr.videostream.getTracks()[0].stop();
                    let soundFail = new Howl({
                    src: ['sound/beep_fail.flac', 'sound/beep_fail.mp3'],
                        volume: 1,
                        onend: function() {
                            setTimeout(function() {
                                gameLetterStep6(result);
                            }, 500)
                        }
                    });
                    soundFail.play();
                }
                else {
                    let soundFail = new Howl({
                    src: ['sound/beep_fail.flac', 'sound/beep_fail.mp3'],
                        volume: 1,
                        onend: function() {
                            setTimeout(function() {
                                gameLetterStep5(result);
                            }, 500)
                        }
                    });
                    soundFail.play();
                }
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
    let r = _.random(0, goodImg.length-1);
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
    console.log(result + "/" + letter);
}
function gameLetterStep5(result) {
    document.getElementById("step3").style.display = "none";
    document.getElementById("step5").style.display = "block";
    console.log(result + "/" + letter);
}
function gameLetterStep6(result) {
    document.getElementById("step4").style.display = "none";
    document.getElementById("step3").style.display = "none";
    document.getElementById("step6").style.display = "block";
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("step6_letter_show").innerHTML = letter;
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
    console.log(result + "/" + letter);
}
function gameLetterStep0() {
    letter = undefined;
    failcount = 0;
    document.getElementById("step4").style.display = "none";
    document.getElementById("step6").style.display = "none";
    document.getElementById("step1").style.display = "block";
    document.getElementById("progressbar").style.width = "0%";
}

//functions for KLANK GAME
function playSound() {
    var letterSound = new Howl({
        src: ['sound/letters/' + letter + '.flac', 'sound/letters/' + letter + '.mp3'],
        volume: 1
    });
    letterSound.play();
}
function gameKlankStep2() {
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
    playSound();
}
function gameKlankStep3() {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
    document.getElementById("progressbar").style.width = "66%";
    ocr = new OCR(false);
    let func = function(res) {
        if (res.hasFailed()) {
            var soundIntFail = new Howl({
                src: ['sound/beep_intfail.flac', 'sound/beep_intfail.mp3'],
                volume: 1
            });
            soundIntFail.play();
            document.getElementById("bttn_control").src = "images/ic_warning_orange_96dp.png";
            setTimeout(function(){ document.getElementById("bttn_control").src = "images/ic_photo_camera_white_72dp.png"; }, 3000);
        }
        else {
            var result = res.getResult();
            if (result === letter) {
                ocr.videostream.getTracks()[0].stop();
                let soundGood = new Howl({
                    src: ['sound/beep_good.flac', 'sound/beep_good.mp3'],
                    volume: 1,
                    onend: function() {
                        setTimeout(function() {
                            gameKlankStep4(result);
                        }, 500)
                    }
                });
                soundGood.play();
            }
            else {
                failcount ++;
                if (failcount >= 5) {
                    gameLetterStep6(result);
                    ocr.videostream.getTracks()[0].stop();
                    let soundFail = new Howl({
                    src: ['sound/beep_fail.flac', 'sound/beep_fail.mp3'],
                        volume: 1,
                        onend: function() {
                            setTimeout(function() {
                                gameKlankStep6(result);
                            }, 500)
                        }
                    });
                    soundFail.play();
                }
                else {
                    let soundFail = new Howl({
                    src: ['sound/beep_fail.flac', 'sound/beep_fail.mp3'],
                        volume: 1,
                        onend: function() {
                            setTimeout(function() {
                                gameKlankStep5(result);
                            }, 500)
                        }
                    });
                    soundFail.play();
                }
            }
        }
    }
    ocr.init(func);
    ocr.initCamera();
    //alert(navigator.userAgent);
}
function gameKlankControl() {
    ocr.photo = true;
    ocr.recognize();
}
function gameKlankStep4(result) {
    //Answer was correct
    document.getElementById("step3").style.display = "none";
    document.getElementById("step4").style.display = "block";
    let goodImg = ["images/good_ape.png","images/good_smile.png","images/good_thumb.png"];
    let r = _.random(0, goodImg.length-1);
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
    console.log(result + "/" + letter);
}
function gameKlankStep5(result) {
    document.getElementById("step3").style.display = "none";
    document.getElementById("step5").style.display = "block";
    console.log(result + "/" + letter);
}
function gameKlankStep6(result) {
    document.getElementById("step4").style.display = "none";
    document.getElementById("step3").style.display = "none";
    document.getElementById("step6").style.display = "block";
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("step6_letter_show").innerHTML = letter;
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
    console.log(result + "/" + letter);
}
function gameKlankStep0() {
    letter = undefined;
    failcount = 0;
    document.getElementById("step4").style.display = "none";
    document.getElementById("step6").style.display = "none";
    document.getElementById("step1").style.display = "block";
    document.getElementById("progressbar").style.width = "0%";
}

//functions for WOORD GAME
function getWordList() {
    fetch('data/words.json')
    .then(function(res) {
        return res.json();
    })
    .then(function(json) {
        var words = json.words;
        do {
        var index = _.random(words.length - 1);
        } while (words[index] === woord);
        woord = words[index];
        playWoord();
    });
}
function playWoord() {
    for (var i = 0; i < woord.length; i ++) {
        let letterWoord = woord.charAt(i);
        if (i === 0) {
            var letterSound = new Howl({
                src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                volume: 1
            });
            letterSound.play();
        }
        else {
            setTimeout(function() {
                var letterSound = new Howl({
                    src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                    volume: 1
                });
                letterSound.play();
            }, 900 * i)
        }
    }  
}

function gameWoordStep2() {
    document.getElementById("step1").style.display = "none";
    document.getElementById("step3").style.display = "none";
    document.getElementById("step5").style.display = "none";
    document.getElementById("step2").style.display = "block";
    document.getElementById("progressbar").style.width = "33%";
    if (woord) {
    }
    else {
        getWordList();
    }
}
function gameWoordStep3() {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
    document.getElementById("progressbar").style.width = "66%";
    ocr = new OCR(true);
    let func = function(res) {
        if (res.hasFailed()) {
            var soundIntFail = new Howl({
                src: ['sound/beep_intfail.flac', 'sound/beep_intfail.mp3'],
                volume: 1
            });
            soundIntFail.play();
            document.getElementById("bttn_control").src = "images/ic_warning_orange_96dp.png";
            setTimeout(function(){ document.getElementById("bttn_control").src = "images/ic_photo_camera_white_72dp.png"; }, 3000);
        }
        else {
            var result = res.getResult();
            if (result === woord) {
                ocr.videostream.getTracks()[0].stop();
                let soundGood = new Howl({
                    src: ['sound/beep_good.flac', 'sound/beep_good.mp3'],
                    volume: 1,
                    onend: function() {
                        setTimeout(function() {
                            gameWoordStep4(result);
                        }, 500)
                    }
                });
                soundGood.play();
            }
            else {
                failcount ++;
                if (failcount >= 5) {
                    gameLetterStep6(result);
                    ocr.videostream.getTracks()[0].stop();
                    let soundFail = new Howl({
                    src: ['sound/beep_fail.flac', 'sound/beep_fail.mp3'],
                        volume: 1,
                        onend: function() {
                            setTimeout(function() {
                                gameWoordStep6(result);
                            }, 500)
                        }
                    });
                    soundFail.play();
                }
                else {
                    let soundFail = new Howl({
                    src: ['sound/beep_fail.flac', 'sound/beep_fail.mp3'],
                        volume: 1,
                        onend: function() {
                            setTimeout(function() {
                                gameWoordStep5(result);
                            }, 500)
                        }
                    });
                    soundFail.play();
                }
            }
        }
    }
    ocr.init(func);
    ocr.initCamera();
    //alert(navigator.userAgent);
}
function gameWoordControl() {
    ocr.photo = true;
    ocr.recognize();
}
function gameWoordStep4(result) {
    //Answer was correct
    document.getElementById("step3").style.display = "none";
    document.getElementById("step4").style.display = "block";
    let goodImg = ["images/good_ape.png","images/good_smile.png","images/good_thumb.png"];
    let r = _.random(0, goodImg.length-1);
    document.getElementById("good_IMG").src = goodImg[r];
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("woordholder").innerHTML = woord;
    document.getElementById("letteroverlay").style.marginLeft = 0;
    for (var i = 0; i < woord.length; i ++) {
        let letterWoord = woord.charAt(i);
        if (i === 0) {
            var letterSound = new Howl({
                src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                volume: 1
            });
            letterSound.play();
        }
        else if (i === woord.length - 1) {
            setTimeout(function() {
                var letterSound = new Howl({
                    src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                    volume: 1,
                    onend: function() {
                        setTimeout(function() {
                        document.getElementById("letteroverlay").style.marginLeft = "-110vw";
                        }, 750);
                    }
                });
                letterSound.play();
            }, 900 * i)
        }
        else {
            setTimeout(function() {
                var letterSound = new Howl({
                    src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                    volume: 1
                });
                letterSound.play();
            }, 900 * i)
        }
    } 
    alert(result + "/" + woord);
    console.log(result + "/" + woord);
}
function gameWoordStep5(result) {
    document.getElementById("step3").style.display = "none";
    document.getElementById("step5").style.display = "block";
    alert(result + "/" + woord);
    console.log(result + "/" + woord);
}
function gameWoordStep6(result) {
    document.getElementById("step4").style.display = "none";
    document.getElementById("step3").style.display = "none";
    document.getElementById("step6").style.display = "block";
    document.getElementById("progressbar").style.width = "100%";
    document.getElementById("step6_letter_show").innerHTML = woord;
    document.getElementById("woordholder").innerHTML = woord;
    document.getElementById("letteroverlay").style.marginLeft = 0;
    for (var i = 0; i < woord.length; i ++) {
        let letterWoord = woord.charAt(i);
        if (i === 0) {
            var letterSound = new Howl({
                src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                volume: 1
            });
            letterSound.play();
        }
        else if (i === woord.length - 1) {
            setTimeout(function() {
                var letterSound = new Howl({
                    src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                    volume: 1,
                    onend: function() {
                        setTimeout(function() {
                        document.getElementById("letteroverlay").style.marginLeft = "-110vw";
                        }, 750);
                    }
                });
                letterSound.play();
            }, 900 * i)
        }
        else {
            setTimeout(function() {
                var letterSound = new Howl({
                    src: ['sound/letters/' + letterWoord + '.flac', 'sound/letters/' + letterWoord + '.mp3'],
                    volume: 1
                });
                letterSound.play();
            }, 900 * i)
        }
    }
    alert(result + "/" + woord);
    console.log(result + "/" + woord);
}
function gameWoordStep0() {
    letter = undefined;
    failcount = 0;
    document.getElementById("step4").style.display = "none";
    document.getElementById("step6").style.display = "none";
    document.getElementById("step1").style.display = "block";
    document.getElementById("progressbar").style.width = "0%";
}