import * as tf from '@tensorflow/tfjs';
import {loadLiteRt, getWebGpuDevice} from '@litertjs/core';
import {runWithTfjsTensors} from '@litertjs/tfjs-interop';
import {WebGPUBackend} from '@tensorflow/tfjs-backend-webgpu'

// Model configuration
const MODEL_IMAGE_SIZE = [256, 256]; // Updated to 256x256
const MODEL_PATH = 'model_trainer/model.tflite';

//SHOULD BE UPDATED IF/WHEN YOU UPDATE LiteRT
const WASM_PATH = 'scripts/ocr/dist/wasm';

export class OCRResult {
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

function imageDataToModelInput(imageData) {
    return tf.tidy(() => {
        const rgba = tf.tensor(
            imageData.data,
            [imageData.height, imageData.width, 4],
            'int32',
        );
        const rgb = rgba.slice([0, 0, 0], [-1, -1, 3]);
        const grayscale = tf.sum(
            rgb.mul(tf.tensor1d([0.2126, 0.7152, 0.0722])).toFloat(),
            2,
        ).expandDims(-1);

        const resized = tf.image.resizeBilinear(grayscale, MODEL_IMAGE_SIZE, false);
        
        // Use reshape with -1 to let TensorFlow infer batch dimension
        return resized.reshape([-1, 256, 256, 1]);
    });
}

var ctx, drawImage;

export class OCR {
    constructor(word) {
        this.word = word;
        this.liteRt = null;
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
        
        // Initialize TensorFlow.js
        await tf.ready();
        await tf.setBackend('webgpu');
        
        // Initialize LiteRT with WASM
        await this.initializeLiteRT();

        const device = getWebGpuDevice();
        tf.removeBackend('webgpu');
        tf.registerBackend('webgpu', () => new WebGPUBackend(device, device.adapterInfo));
        await tf.setBackend('webgpu');
        
        // Load model
        await this.loadModel();
    }

    async initializeLiteRT() {
        try {
            // Initialize LiteRT with WASM support
            this.liteRt = await loadLiteRt(WASM_PATH)
            
            console.log("LiteRT.js initialized with WASM support");
        } catch (error) {
            console.error("Failed to initialize LiteRT.js:", error);
            throw error;
        }
    }

    async loadModel() {
        try {
            // Load and compile model with accelerator (try WebGPU first, fallback to WASM)
            try {
                this.model = await this.liteRt.loadAndCompile(MODEL_PATH, {
                    accelerator: 'webgpu'
                });
                console.log("Model loaded with WebGPU acceleration");
            } catch (webGpuError) {
                console.warn("WebGPU not available, falling back to WASM:", webGpuError.message);
                this.model = await this.liteRt.loadAndCompile(MODEL_PATH, {
                    accelerator: 'wasm'
                });
                console.log("Model loaded with WASM acceleration");
            }
            
            this.modelReady = true;
            console.log("OCR model loaded successfully");
            console.log("Input details:", this.model.getInputDetails());
            console.log("Output details:", this.model.getOutputDetails());
        } catch (error) {
            console.error("Failed to load OCR model:", error);
            this.modelReady = false;
            throw error;
        }
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

    tresholdimage() {
        this.photo = true;
        let img = document.getElementById("text");
        this.ctx.drawImage(img, 0, 0, this.cw, this.ch);
        let data = this.ctx.getImageData(0, 0, this.cw, this.ch);
        this.ctx.putImageData(data, 0, 0);
    }

    async recognize() {
        if (!this.modelReady) {
            console.error("Model not ready");
            this.onrecognized(new OCRResult(false));
            return;
        }

        console.log("recognizing with LiteRT.js model...");
        this.photo = true;

        try {
            const imageData = this.ctx.getImageData(0, 0, this.cw, this.ch);
            const inputTensor = imageDataToModelInput(imageData);
            
            // Run inference with LiteRT
            const outputs = await runWithTfjsTensors(this.model, [inputTensor]);
            const outputData = await outputs[0].data();
            
            // Clean up
            tf.dispose(outputs);
            tf.dispose(inputTensor);
            
            // Post-process
            const text = await this.postprocessPredictions(outputData);

            this.onrecognized(new OCRResult(text));
        } catch (error) {
            console.error("Recognition failed:", error);
            this.onrecognized(new OCRResult(false));
        } finally {
            this.photo = false;
        }
    }

   async postprocessPredictions(outputData) {
        // Adjust based on your model's output format
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
    
        const outputArray = tf.tensor1d(outputData);
        let maxconfidence = await tf.argMax(outputArray).data();
        tf.dispose(outputArray);

        return alphabet[maxconfidence[0]];
    }

    draw(v, x, y, w, h, c) {
        if (!this.photo) {
            ctx.drawImage(v, x, y, w, h);
        }
    }

    confidence(rawtext) {
        if (rawtext.length === 0) { return false; }
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
                letters += char;
                continue;
            }
            if (exceptioncharacters.indexOf(char) !== -1 && rawtext.length <= 3) {
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
        
        if (letters.length > 5 && !this.word) {
            return false;
        } else {
            if (charcount > 5) {
                return false;
            }
            answer = this.word ? letters : letters.charAt(0);
        }
        return answer;
    }
}