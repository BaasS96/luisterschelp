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
            const imageDataRaw = this.ctx.getImageData(0, 0, this.cw, this.ch);
            //const thresholdedData = this.threshold(imageDataRaw);
            //this.ctx.putImageData(thresholdedData, 0, 0);
            const imageData = this.canvas.toDataURL();

            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 256;
            previewCanvas.height = 256;
            const previewSource = document.createElement('canvas');
            previewSource.width = imageDataRaw.width;
            previewSource.height = imageDataRaw.height;
            previewSource.getContext("2d").putImageData(imageDataRaw, 0, 0);
            previewCanvas.getContext("2d").drawImage(
                previewSource,
                0,
                0,
                previewCanvas.width,
                previewCanvas.height
            );
            document.body.appendChild(previewCanvas);
            
            let result = await scanKixBarcodeFromImage(this.canvas);
            if (result && result.success) {
                this.onrecognized(new OCRResult(this.extractLetterFromPostcode(result.rawText), 1.0));
            } else {
                this.onrecognized(new OCRResult("", -1.0));
            }

            // Quagga.decodeSingle({
            //     src: imageData,
            //     locate: true,
            //     decoder: {
            //         readers: ["ean_reader"]
            //     }
            //     }, result => {
            //         if (result && result.codeResult) {
            //             console.log(result);
            //             this.onrecognized(new OCRResult(result.codeResult.code, 1.0));
            //         } else {
            //             this.onrecognized(new OCRResult("", -1.0));
            //         }
            //     }
            // );
        } catch (error) {
            console.error("Recognition failed:", error);
            this.onrecognized(new OCRResult("", -1.0));
        } finally {
            //this.photo = false;
        }
    }

    extractLetterFromPostcode(raw) {
        console.log(raw);
        return raw.charAt(4).toLowerCase();
    }

    draw(v, x, y, w, h, c) {
        if (!this.photo) {
            ctx.drawImage(v, x, y, w, h);
        }
    }

}