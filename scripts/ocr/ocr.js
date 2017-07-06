class OCRResult {
    constructor(result) {
        if (result === false) {
            this.failed = true;
            this.result = "";
        } else {
            this.failed = false;
            this.result = result;
        }
    }
    hasFailed() {
        return this.failed;
    }
    getResult() {
        return this.result;
    }
}

var ctx;

class OCR {

    init(onrecognized) {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        ctx = this.ctx;
        console.log(this.ctx);
        this.w = window.innerWidth;
        let body = document.body,
            html = document.documentElement;
        this.h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        if (this.w < this.h) {
            canvas.setAttribute("width", this.w * 0.7);
            canvas.setAttribute("height", this.w * 0.7);
            this.cw = this.w * 0.7;
            this.ch = this.w * 0.7;
        }
        else {
            canvas.setAttribute("width", this.h * 0.7);
            canvas.setAttribute("height", this.h * 0.7);
            this.cw = this.h * 0.7;
            this.ch = this.h * 0.7;
        }
        if (navigator.userAgent.includes("Gecko")) {
            if (navigator.userAgent.includes("Linux") || navigator.userAgent.includes("Android")) {
                //We're dealing with mobile firefox here, or on linux but nobody uses that.
                //this.canvas.style.transform = "scaleY(-1)";
            }
        }
        this.photo = false;
        this.backcam = undefined;
        this.onrecognized = onrecognized;
    }

    initCamera() {
        var t = this;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: this.backcam }
                }
            }).then(function(stream) {
                t.videostream = stream;
                video.src = window.URL.createObjectURL(stream);
                video.play();
                setInterval(t.draw, 20, video, 0, 0, t.cw, t.ch, t.ctx);
                //t.draw(video, 0, 0, t.cw, t.ch, t.ctx);
            }).catch(function(err) {
                console.log(err);
            });
        } else {
            alert("function not supported");
        }
    }


    tresholdimage() {
        this.photo = true;
        let img = document.getElementById("text");
        this.ctx.drawImage(img, 0, 0, cw, ch);
        let data = threshold(this.ctx.getImageData(0, 0, cw, ch));
        console.log(data);
        this.ctx.putImageData(data, 0, 0);
    }

    recognize() {
        console.log("recognizing...");
        this.photo = true;
        console.log(this.ctx.getImageData(0, 0, this.cw, this.ch));
        let data = this.threshold(this.ctx.getImageData(0, 0, this.cw, this.ch));
        console.log(data);
        this.ctx.putImageData(data, 0, 0);
        var text = OCRAD(data);
        let conf = this.confidence(text);
        let res = new OCRResult(conf);
        this.onrecognized(res);
        //alert(string);
        //this.canvas.style.transform = "scaleY(-1)";
        setTimeout(function() {
            //this.photo = false;
        }, 1000);
        //this.photo = false;
    }

    draw(v, x, y, w, h, c) { 
        if (!this.photo) {
            ctx.scale(1, -1);
            ctx.drawImage(v, x, y, w, h);
            ctx.save();
        } else {
            //ctx.drawImage(v, x, y, w, h);
        }
    }

    //Functions to prepare the image for recognition 
    threshold(d) {
        var imageData = d.data;
        //Treshold the image to get a contrasted image.
        //First, calculate the histogram
        let hist = this.getHistogram(imageData);
        //Using the histogram, calculate the appropriate treshold to separate the image in back and forground
        var threshold = this.otus(hist, imageData.length / 4);
        console.log(threshold);
        //Apply the treshold
        var newIData = imageData;
        for (var i = 0; i < newIData.length; i += 4) {
            if (newIData[i] >= threshold) {
                newIData[i] = 255;
                newIData[i + 1] = 255;
                newIData[i + 2] = 255;
            } else {
                newIData[i] = 0;
                newIData[i + 1] = 0;
                newIData[i + 2] = 0;
            }
        }
        d.data.set(newIData);
        return d;
    }

    getHistogram(data) {
        let histogram = Array(256);
        for (var i = 0; i < 256; i++) {
            histogram[i] = 0;
        }
        for (var i = 0; i < data.length; i += 4) {
            let red = data[i];
            let blue = data[i + 1];
            let green = data[i + 2];
            let gray = red * .2126 + green * .07152 + blue * .0722;
            gray = Math.round(gray);
            histogram[gray] += 1;
        }
        return histogram;
    }

    otus(histData, total) {
            let sum = 0;
            for (let t = 0; t < 256; t++) sum += t * histData[t];
            let sumB = 0;
            let wB = 0;
            let wF = 0;
            let varMax = 0;
            let threshold = 0;
            for (let t = 0; t < 256; t++) {
                wB += histData[t];
                if (wB == 0) continue;
                wF = total - wB;
                if (wF == 0) break;
                sumB += t * histData[t];
                let mB = sumB / wB;
                let mF = (sum - sumB) / wF;
                let varBetween = wB * wF * (mB - mF) * (mB - mF);
                if (varBetween > varMax) {
                    varMax = varBetween;
                    threshold = t;
                }
            }
            return threshold;
        }
        /**
         * @param {string} rawtext Raw input text that was recognized
         */
    confidence(rawtext) {
        if (rawtext.length === 0) {return false;}
        let answer = "";
        let charcount = 0;
        let letters = "",
            i = 0,
            abc = "abcdefghijklmnopqrstuvwxyz",
            exceptioncharacters = "!\/\\015",
            charsforI = "!\/\\1";
        for (i = 0; i <= rawtext.length; i++) {
            let char = rawtext.charAt(i).toLowerCase();
            if (abc.indexOf(char) !== -1) {
                //The answer contains letter(s)
                letters += char;
                continue;
            }
            if (exceptioncharacters.indexOf(char) !== -1 && rawtext.length <= 3) {
                //A letter may have been recognized as a character, but we assume that this is the case if the length of the full string is less than 3
                if (charsforI.indexOf(char) !== -1) {
                    letters += "i";
                } else if (char === "0") {
                    letters += "o";
                } else {
                    letters += "s";
                }
                continue;
            }
            charcount++;
        }
        if (letters.length > 5) {
            //Too suspicious
            return false;
        } else {
            if (charcount > 5) {
                //probs not a great guess to return a letter now.
                return false;
            }
            answer = letters.charAt(0);
        }
        return answer;
    }
}