var lettervolume = 1;

const abc = "abcdefghijklmnopqrstuvwxyz";
var blobreg = new Map();

function letterOverlay(objId) {
    var letterId = objId.id;
    var letterOn = letterId.split("-");
    var letter = letterOn[1];
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
}

function setVolumeOnLoad() {
    let oldVolume = sessionStorage.volume;
    let oldButton;
    if (oldVolume === "1") {
        oldButton = "volhigh";
    } else if (oldVolume === "0.1") {
        oldButton = "vollow";
    } else if (oldVolume === "0.6") {
        oldButton = "volmid";
    } else {
        oldVolume = "0.6";
        oldButton = "volmid";
    }
    setVolume(oldVolume, oldButton);
}

function setVolume(volume, button) {
    document.getElementById("volhigh").src = "images/ic_volume_up_gray_48dp.png";
    document.getElementById("volmid").src = "images/ic_volume_down_gray_48dp.png";
    document.getElementById("vollow").src = "images/ic_volume_mute_gray_36dp.png";
    Howler.volume(volume);
    sessionStorage.volume = volume;
    let speaker = document.getElementById(button);
    if (button === "vollow") {
        speaker.src = "images/ic_volume_mute_orange_36dp.png";
    } else if (button === "volmid") {
        speaker.src = "images/ic_volume_down_orange_48dp.png";
    } else {
        speaker.src = "images/ic_volume_up_orange_48dp.png";
    }
}

function getWordList() {
    fetch('data/words.json')
    .then(function(res) {
        return res.json();
    })
    .then(function(json) {
        var words = json.words;
        let index = _.random(words.length - 1);
        let word = words[index];
    });
}
function preload() {
    for (var i = 0; i < abc.length; i++) {
        let letter = abc.charAt(i);
        fetch('sound/letters/' + letter + ".mp3")
            .then(function(res) {
                return res.blob();
            })
            .then(function(blob) {
                blobreg.set(letter + ".mp3", URL.createObjectURL(blob));
            });
    }
}