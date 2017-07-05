const abc = "abcdefghijklmnopqrstuvwxyz";
const totalfiles = 94;
var done = 0;
var blobreg = new Map();

function preload() {
     setInterval(checkProgress, 500);
     loadLetterSounds();
     loadMiscSounds();
     loadLetterImages();
     loadMiscImages();
}

function checkProgress() {
    if (done === totalfiles)  {
        //Done!
    }
}

function loadLetterSounds() {
    for (var i = 0; i < abc.length; i++) {
        let letter = abc.charAt(i);
        fetch('sound/letters/' + letter + ".mp3")
        .then(function(res) {
            blobreg.set(letter + ".mp3", URL.createObjectURL(res.blob()));
            done += 0.5;
        })
        fetch('sound/letters/' + letter + ".flac")
        .then(function(res)  {
            blobreg.set(letter + ".flac", URL.createObjectURL(res.blob()));
            done += 0.5;
        });
    }
}
function loadMiscSounds() {
    let sounds = ["bubblepop", "seagull", "wave"];
    for (var i = 0; i < sounds.length; i++) {
        fetch('sound/' + sounds[i] + ".mp3")
        .then(function(res) {
            blobreg.set(sounds[i] + ".mp3", URL.createObjectURL(res.blob()));
            done += 0.5;
        });
        fetch('sound/' + sounds[i] + ".flac")
        .then(function(res) {
            blobreg.set(sounds[i] + ".flac", URL.createObjectURL(res.blob()));
        });
    }
}
function loadLetterImages() {
    for (var i = 0; i < abc.length; i++) {
        let letter = abc.charAt(i);
        fetch('images/letters/' + letter + ".png")
        .then(function(res) {
            blobreg.set(letter + ".png", URL.createObjectURL(res.blob()));
            done++;
        })
    }
}
function loadMiscImages() {
    let images = ["bubble-2009029" + "ic_camera_alt_white_48dp", "ic_home_white_48dp", "ic_view_module_white_48dp", "ic_volume_down_orange_48dp", "ic_volume_down_white_48dp",
    "ic_volume_mute_orange_36dp", "ic_volume_mute_white_48dp", "ic_volume_up_orange_48dp", "ic_volume_up_white_48dp"];
    for (var i = 0; i < images.length; i++) {
        fetch('images/' + images[i] + ".png")
        .then(function(res) {
            blobreg.set(images[i] + ".png", URL.createObjectURL(res.blob()));
            done++;
        });
    }
}