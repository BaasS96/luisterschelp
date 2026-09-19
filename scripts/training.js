const alphabet = "abcdefghijklmnopqrstuvwxyz";

let currentLetterIndex = 0;
let videoStream;
let outputDirectory;
let processor;
const directoryFilenames = new Set();

const intro = document.getElementById("training-intro");
const capturePanel = document.getElementById("training-capture");
const donePanel = document.getElementById("training-done");
const startButton = document.getElementById("start-training");
const captureButton = document.getElementById("capture-training");
const chooseFolderButton = document.getElementById("choose-folder");
const video = document.getElementById("training-video");
const canvas = document.getElementById("training-canvas");
const letterElement = document.getElementById("training-letter");
const progressElement = document.getElementById("training-progress");
const statusElement = document.getElementById("training-status");
const introStatusElement = document.getElementById("training-intro-status");
const preview = document.getElementById("training-preview");

function setStatus(message) {
    statusElement.textContent = message;
}

function showCurrentLetter() {
    const letter = alphabet[currentLetterIndex];
    letterElement.textContent = letter;
    progressElement.textContent = `letter ${currentLetterIndex + 1} van ${alphabet.length}`;
    captureButton.disabled = false;
}

async function chooseOutputDirectory() {
    if (!window.showDirectoryPicker) {
        introStatusElement.textContent = "Deze browser kan niet automatisch een map vullen. Gebruik Chrome of Edge via https of localhost.";
        return false;
    } 

    outputDirectory = await window.showDirectoryPicker({ mode: "readwrite" });
    await refreshDirectoryFilenames();
    setStatus("Map gekozen. De foto's worden automatisch bewaard.");
    return true;
}

async function refreshDirectoryFilenames() {
    directoryFilenames.clear();
    for await (const [name] of outputDirectory.entries()) {
        directoryFilenames.add(name);
    }
}

function splitFilename(filename) {
    const extensionIndex = filename.lastIndexOf(".");
    return extensionIndex < 0
        ? { base: filename, extension: "" }
        : {
            base: filename.slice(0, extensionIndex),
            extension: filename.slice(extensionIndex),
        };
}

async function getAvailableFilename(filename) {
    const { base, extension } = splitFilename(filename);
    await refreshDirectoryFilenames();
    let counter = 1;

    while (true) {
        const candidate = counter === 1
            ? filename
            : `${base}_${counter}${extension}`;

        if (!directoryFilenames.has(candidate)) {
            return candidate;
        }

        counter += 1;
    }
}

async function saveBlob(blob, filename) {
    if (!outputDirectory) {
        throw new Error("Kies eerst een map om de trainingsfoto's automatisch te bewaren.");
    }

    const availableFilename = await getAvailableFilename(filename);
    const fileHandle = await outputDirectory.getFileHandle(availableFilename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    directoryFilenames.add(availableFilename);
    return availableFilename;
}

function imageDataToBlob(imageData) {
    const processedCanvas = document.createElement("canvas");
    processedCanvas.width = imageData.width;
    processedCanvas.height = imageData.height;
    processedCanvas.getContext("2d").putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
        processedCanvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("De verwerkte afbeelding kon niet worden opgeslagen."));
            }
        }, "image/png");
    });
}

async function captureTrainingImage() {
    captureButton.disabled = true;
    setStatus("Afbeelding verwerken...");

    try {
        const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        const processedImageData = processor.processImage(imageData);
        const blob = await imageDataToBlob(processedImageData);
        const letter = alphabet[currentLetterIndex];
        const filename = `${letter}_capture_${String(currentLetterIndex + 1).padStart(2, "0")}.png`;

        preview.src = URL.createObjectURL(blob);
        preview.hidden = false;
        const savedFilename = await saveBlob(blob, filename);
        setStatus(`${savedFilename} bewaard.`);

        currentLetterIndex += 1;
        if (currentLetterIndex === alphabet.length) {
            stopCamera();
            capturePanel.hidden = true;
            donePanel.hidden = false;
            return;
        }

        showCurrentLetter();
    } catch (error) {
        console.error(error);
        setStatus(error.name === "AbortError" ? "Kies een map om verder te gaan." : error.message);
        captureButton.disabled = false;
    }
}

function drawVideoFrame() {
    if (!videoStream) {
        return;
    }

    const size = Math.min(window.innerWidth * 0.92, window.innerHeight * 0.62, 720);
    canvas.width = Math.round(size);
    canvas.height = Math.round(size);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawVideoFrame);
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        videoStream = undefined;
    }
}

async function startTraining() {
    try {
        if (!outputDirectory && !(await chooseOutputDirectory())) {
            return;
        }

        processor = new OCRModule.OCR();
        videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            },
            audio: false,
        });
        video.srcObject = videoStream;
        await video.play();
        intro.hidden = true;
        capturePanel.hidden = false;
        showCurrentLetter();
        drawVideoFrame();
    } catch (error) {
        console.error(error);
        introStatusElement.textContent = error.name === "AbortError"
            ? "Kies een map om te beginnen."
            : error.name === "NotAllowedError"
                ? "Geef toestemming voor de camera."
                : error.message;
    }
}

startButton.addEventListener("click", startTraining);
captureButton.addEventListener("click", captureTrainingImage);
chooseFolderButton.addEventListener("click", chooseOutputDirectory);
window.addEventListener("beforeunload", stopCamera);
