var cameraOverlayopen = false;

function letterOverlay(objId) {
    var letterId = objId.id;
    var letterOn = letterId.split("-");
    var letter = letterOn[1];
    document.getElementById("letterholder").innerHTML = letter;
    document.getElementById("letterimg").src = "images/letters/" + letter + ".png";
    document.getElementById("letteroverlay").style.marginLeft = 0;
    //var sound = newHowl({
    //  src: ['sound/sound.webm', 'sound/sound.mp3']
    //});
    setTimeout(function() {
        document.getElementById("letteroverlay").style.marginLeft = "-110vw";
    }, 2000);
}

function cameraOverlay() {
    var overlay = document.getElementById("cameraoverlay");
    if (!cameraOverlayopen) {
        overlay.style.marginLeft = 0;
        cameraOverlayopen = true;
    } else {
        overlay.style.marginLeft = "-310vw";
        cameraOverlayopen = false;
    }
}