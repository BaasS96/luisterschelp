<<<<<<< HEAD
var lettervolume = 1, blobreg = new Map();
var wperitem, bar, progress= 0;
=======
>>>>>>> 9a46100b5b34231c4c1715f9db3092dc3d508055
function letterOverlay(objId) {
    var letterId = objId.id;
    var letterOn = letterId.split("-");
    var letter = letterOn[1];
    document.getElementById("letterholder").innerHTML = letter;
    document.getElementById("letterimg").src = "images/letters/" + letter + ".png";
    document.getElementById("letteroverlay").style.marginLeft = 0;
    var letterSound = new Howl({
        src: [blobreg.get("sound/letters" + letter + ".flac"), blobreg.get('sound/letters/' + letter + '.mp3')],
        format: ["flac", "mp3"],
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
  }
  else if (oldVolume === "0.1") {
    oldButton = "vollow";
  }
  else if (oldVolume === "0.6") {
    oldButton = "volmid";
  }
  else {
      oldVolume = "0.6";
      oldButton = "volmid";
  }
  setVolume(oldVolume, oldButton);
}