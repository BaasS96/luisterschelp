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