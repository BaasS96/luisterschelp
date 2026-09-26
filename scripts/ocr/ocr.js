import { scanKixBarcodeFromImage } from "../scanner/kixDecoder";

var ctx, drawImage;

export class OCRResult {
    constructor(guess, confidence) {
        this.guessedLetter = guess;
        this.confidence = confidence;
    }
    hasFailed(letter) {
        if (this.guessedLetter == letter) {
            //Benefit of the doubt
            return false;
        } 
        return this.confidence < 0.9;
    }
    isCorrect(letter) {
        if (this.guessedLetter === letter) {
            return true;
        }
        return (this.confidence >= 0.9 && this.guessedLetter === letter);
    }
    getResult() {
        return this.guessedLetter;
    }
}

export class OCR {
    constructor(word) {
        this.word = word;
        this.model = null;
        this.modelReady = false;
    }

    async init(onrecognized) {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        ctx = this.ctx;
        drawImage = this.drawImage;
        console.log(this.ctx);
        
        this.w = window.innerWidth;
        let body = document.body,
            html = document.documentElement;
        this.h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        
        if (this.w < this.h) {
            this.canvas.setAttribute("width", this.w * 0.7);
            this.canvas.setAttribute("height", this.w * 0.7);
            this.cw = this.w * 0.7;
            this.ch = this.w * 0.7;
        } else {
            this.canvas.setAttribute("width", this.h * 0.7);
            this.canvas.setAttribute("height", this.h * 0.7);
            this.cw = this.h * 0.7;
            this.ch = this.h * 0.7;
        }
        
        this.photo = false;
        this.backcam = undefined;
        this.onrecognized = onrecognized;
    
    }

    initCamera() {
        var t = this;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
            }).then(function(stream) {
                t.videostream = stream;
                video.srcObject = stream;
                video.play();
                setInterval(t.draw, 20, video, 0, 0, t.cw, t.ch, t.ctx);
            }).catch(function(err) {
                console.error(err);
            });
        } else {
            alert("function not supported");
        }
    }

    async recognize() {
        console.log("Finding barcodes");
        this.photo = true;

        try {
            let result = await scanKixBarcodeFromImage(this.canvas);
            if (result && result.success) {
                this.onrecognized(new OCRResult(this.extractLetterFromPostcode(result.rawText), 1.0));
            } else {
                this.onrecognized(new OCRResult("", -1.0));
            }
        } catch (error) {
            console.error("Recognition failed:", error);
            this.onrecognized(new OCRResult("", -1.0));
        } finally {
            this.photo = false;
        }
    }

    extractLetterFromPostcode(raw) {
        console.log(raw);
        return raw.charAt(4).toLowerCase();
    }

    draw(v, x, y, w, h, c) {
        if (this.photo || !v.videoWidth || !v.videoHeight) {
            return;
        }
    
        const cropSize = Math.min(v.videoWidth, v.videoHeight);
        const sourceX = (v.videoWidth - cropSize) / 2;
        const sourceY = (v.videoHeight - cropSize) / 2;
    
        c.drawImage(
            v,
            sourceX, sourceY, cropSize, cropSize,
            x, y, w, h
        );
    }

}