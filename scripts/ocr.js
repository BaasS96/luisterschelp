var time = 0;
function initCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
    } else {
        alert("function not supported");
    }
}
function recognize() {
    let video = document.getElementById("video");
    console.log("recognizing...");
    var timer = setInterval(timeri, 1);
				OCRAD(video, {
				}, function(text){
                    clearInterval(timer);
					console.log("recognized, took "+time+"ms:");
                    time = 0;
					console.log(text || "(empty)");
				})
}
function timeri() {
    time++;
}