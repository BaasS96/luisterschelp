import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
//import { createWorker } from 'tesseract.js';

// Model configuration
const MODEL_IMAGE_SIZE = [256, 256];
const MODEL_PATH = 'model_trainer/browser_model/model.json';

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

        const grayscale = rgba
            .slice([0, 0, 0], [-1, -1, 1]);

        const resized = tf.image.resizeBilinear(grayscale, MODEL_IMAGE_SIZE, false);
        
        // Use reshape with -1 to let TensorFlow infer batch dimension
        return resized.reshape([-1, 256, 256, 1]);
    });
}

function normalizeThresholdedImageData(imageData) {
    const { data, width, height } = imageData;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4] < 128) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (maxX < 0) {
        return imageData;
    }

    const foregroundWidth = maxX - minX + 1;
    const foregroundHeight = maxY - minY + 1;
    const padding = Math.round(Math.max(foregroundWidth, foregroundHeight) * 0.15);
    const cropSize = Math.max(foregroundWidth, foregroundHeight) + padding * 2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const cropLeft = Math.max(0, Math.min(width - cropSize, Math.round(centerX - cropSize / 2)));
    const cropTop = Math.max(0, Math.min(height - cropSize, Math.round(centerY - cropSize / 2)));

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sourceContext = sourceCanvas.getContext('2d');
    sourceContext.fillStyle = 'white';
    sourceContext.fillRect(0, 0, width, height);
    sourceContext.putImageData(imageData, 0, 0);

    const normalizedCanvas = document.createElement('canvas');
    normalizedCanvas.width = 256;
    normalizedCanvas.height = 256;
    const normalizedContext = normalizedCanvas.getContext('2d');
    normalizedContext.fillStyle = 'white';
    normalizedContext.fillRect(0, 0, 256, 256);
    normalizedContext.drawImage(
        sourceCanvas,
        cropLeft,
        cropTop,
        cropSize,
        cropSize,
        0,
        0,
        256,
        256,
    );

    return normalizedContext.getImageData(0, 0, 256, 256);
}

var ctx, drawImage;

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
        
        // Initialize TensorFlow.js and use WebGPU when it is available.
        await tf.ready();
        try {
            await tf.setBackend('webgpu');
        } catch (error) {
            console.warn('WebGPU not available, falling back to WebGL:', error.message);
            await tf.setBackend('webgl');
        }
        
        // Load model
        await this.loadModel();
    }

    async loadModel() {
        try {
            this.model = await tf.loadGraphModel(MODEL_PATH);
            this.modelReady = true;
            console.log("OCR model loaded successfully");
            console.log("Input details:", this.model.inputs);
            console.log("Output details:", this.model.outputs);
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

    async recognize() {
        if (!this.modelReady) {
            console.error("Model not ready");
            this.onrecognized(new OCRResult(false));
            return;
        }

        console.log("Recognizing with TensorFlow.js model...");
        this.photo = true;

        try {
            const saveTarget = await this.requestPngSaveTarget();
            const imageData = this.ctx.getImageData(0, 0, this.cw, this.ch);
            const thresholdedData = this.threshold(imageData);
            this.ctx.putImageData(thresholdedData, 0, 0);
            const normalizedData = normalizeThresholdedImageData(thresholdedData);
            const inputTensor = imageDataToModelInput(normalizedData);
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 256;
            previewCanvas.height = 256;
            document.body.appendChild(previewCanvas);

            await tf.browser.toPixels(
                inputTensor.squeeze().div(255),
                previewCanvas,
            );
            await this.savePng(previewCanvas, saveTarget);

            const tesseractCanvas = document.createElement('canvas');
            tesseractCanvas.width = thresholdedData.width;
            tesseractCanvas.height = thresholdedData.height;
            tesseractCanvas.getContext('2d').putImageData(thresholdedData, 0, 0);

            // Run inference with TensorFlow.js.
            const outputs = this.model.execute(inputTensor);
            const outputTensor = Array.isArray(outputs) ? outputs[0] : outputs;
            const outputData = await outputTensor.data();
            
            // Clean up
            tf.dispose(outputs);
            tf.dispose(inputTensor);
            
            // Post-process
            const text = await this.postprocessPredictions(outputData);

            //Run recognition with tesseract.js
            // let worker = await createWorker('eng');
            // let letter = await (async() => {
            //     const { data: { text } } = await worker.recognize(tesseractCanvas);
            //     await worker.terminate();
            //     return text.toLowerCase();
            // })();

            //this.onrecognized(new OCRResult(letter));
            this.onrecognized(new OCRResult(text));
        } catch (error) {
            console.error("Recognition failed:", error);
            this.onrecognized(new OCRResult(false));
        } finally {
            this.photo = false;
        }
    }

    async requestPngSaveTarget() {
        if (!window.showSaveFilePicker) {
            return null;
        }

        try {
            return await window.showSaveFilePicker({
                suggestedName: `ocr-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
                types: [{
                    description: 'PNG image',
                    accept: { 'image/png': ['.png'] },
                }],
            });
        } catch (error) {
            if (error.name === 'AbortError') {
                return { cancelled: true };
            }
            throw error;
        }
    }

    async savePng(canvas, saveTarget) {
        if (saveTarget && saveTarget.cancelled) {
            return;
        }

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Could not encode the image as PNG'));
                }
            }, 'image/png');
        });

        if (saveTarget) {
            const writable = await saveTarget.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        }

        const download = document.createElement('a');
        download.href = URL.createObjectURL(blob);
        download.download = `ocr-${Date.now()}.png`;
        download.click();
        URL.revokeObjectURL(download.href);
    }

   async postprocessPredictions(outputData) {
        // Adjust based on your model's output format
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
    
        const outputArray = tf.tensor1d(outputData);
        let maxconfidence = await tf.argMax(outputArray).data();
        tf.dispose(outputArray);

        return alphabet[maxconfidence[0]];
    }

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

    draw(v, x, y, w, h, c) {
        if (!this.photo) {
            ctx.drawImage(v, x, y, w, h);
        }
    }

}