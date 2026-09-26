import { BarState, DetectedBar, DecodedCharacter, KixDecodeResult, BoundingBox } from './types/kix';
import { DAFT_TO_CHAR } from './kixConstants';

export interface ScanOptions {
  manualThreshold?: number; // 0-255 or -1 for auto
  invertColors?: boolean;
  deskewAngle?: number; // in degrees
  enhanceContrast?: boolean;
  roi?: BoundingBox; // region of interest
}

interface InternalBar {
  x: number;
  y: number;
  width: number;
  height: number;
  topHeight: number;
  bottomHeight: number;
  trackerHeight: number;
  state: BarState;
}

interface ScanCandidate {
  bars: InternalBar[];
  boundingBox: BoundingBox;
  rotation: number;
  thresholdMethod: string;
}

/**
 * Loads an image from a Data URL or Image URL into an HTMLImageElement
 * All processing is strictly local inside the browser.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image into browser: ' + String(e)));
    img.src = src;
  });
}

/**
 * Creates an image data canvas for analysis with optional scaling
 */
export function createCanvasFromImage(
  img: HTMLImageElement,
  maxDimension = 1600
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; scale: number } {
  let { naturalWidth: width, naturalHeight: height } = img;
  let scale = 1;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      scale = maxDimension / width;
      width = maxDimension;
      height = Math.round(img.naturalHeight * scale);
    } else {
      scale = maxDimension / height;
      height = maxDimension;
      width = Math.round(img.naturalWidth * scale);
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(width, 1);
  canvas.height = Math.max(height, 1);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx, scale };
}

/**
 * Rotates a canvas by given angle in degrees (supports arbitrary fine angles and 90/180/270)
 */
function rotateCanvas(source: HTMLCanvasElement, angleDegrees: number): HTMLCanvasElement {
  if (angleDegrees === 0) return source;

  const canvas = document.createElement('canvas');
  const rad = (angleDegrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  canvas.width = Math.round(source.width * cos + source.height * sin);
  canvas.height = Math.round(source.height * cos + source.width * sin);

  const ctx = canvas.getContext('2d');
  if (!ctx) return source;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);

  return canvas;
}

/**
 * Converts image data to grayscale with optional min-max contrast stretch
 */
function toGrayscaleWithStretch(imageData: ImageData, stretch = true): Uint8Array {
  const { data, width, height } = imageData;
  const total = width * height;
  const gray = new Uint8Array(total);

  let minVal = 255;
  let maxVal = 0;

  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    gray[j] = lum;
    if (lum < minVal) minVal = lum;
    if (lum > maxVal) maxVal = lum;
  }

  if (stretch && maxVal > minVal && (minVal > 20 || maxVal < 235)) {
    const range = maxVal - minVal;
    for (let i = 0; i < total; i++) {
      gray[i] = Math.round(((gray[i] - minVal) / range) * 255);
    }
  }

  return gray;
}

/**
 * Otsu Global Threshold
 */
function calculateOtsu(gray: Uint8Array): number {
  const histogram = new Int32Array(256);
  const total = gray.length;
  for (let i = 0; i < total; i++) {
    histogram[gray[i]]++;
  }

  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  return threshold;
}

/**
 * Bradley-Roth Local Adaptive Thresholding using Integral Image
 * Fast O(1) per-pixel local mean calculation. Outstanding for uneven lighting, envelope wrinkles, shadows.
 */
function createAdaptiveBinaryMap(
  gray: Uint8Array,
  width: number,
  height: number,
  windowSizeFraction = 0.08,
  percentageDarker = 0.15,
  invert = false
): Uint8Array {
  const total = width * height;
  const integral = new Float64Array(total);

  // Compute integral image
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      rowSum += gray[offset + x];
      if (y === 0) {
        integral[offset + x] = rowSum;
      } else {
        integral[offset + x] = integral[(y - 1) * width + x] + rowSum;
      }
    }
  }

  const binary = new Uint8Array(total);
  const s = Math.max(3, Math.round(width * windowSizeFraction));
  const s2 = Math.floor(s / 2);

  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - s2);
    const y2 = Math.min(height - 1, y + s2);
    const rowOffset = y * width;

    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - s2);
      const x2 = Math.min(width - 1, x + s2);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      // Sum of window from integral image
      const A = y1 > 0 && x1 > 0 ? integral[(y1 - 1) * width + (x1 - 1)] : 0;
      const B = y1 > 0 ? integral[(y1 - 1) * width + x2] : 0;
      const C = x1 > 0 ? integral[y2 * width + (x1 - 1)] : 0;
      const D = integral[y2 * width + x2];
      const sum = D - B - C + A;

      const pixel = gray[rowOffset + x];
      // Pixel is considered dark (ink) if its value is sufficiently below local mean
      const isDark = pixel * count <= sum * (1 - percentageDarker);

      binary[rowOffset + x] = invert ? (isDark ? 0 : 1) : (isDark ? 1 : 0);
    }
  }

  return binary;
}

/**
 * Scans a binarized matrix to locate aligned periodic vertical bars and extract their 4 states
 */
function scanBinaryMatrixForKix(
  binary: Uint8Array,
  width: number,
  height: number,
  methodName: string
): ScanCandidate | null {
  if (width < 30 || height < 15) return null;

  const stepY = Math.max(2, Math.floor(height / 140));
  let bestCandidate: ScanCandidate | null = null;
  let bestScore = -1;

  for (let y = 4; y < height - 4; y += stepY) {
    const rowOffset = y * width;

    // Detect dark runs (bars) and light runs (gaps) along this horizontal line
    const runs: Array<{ xStart: number; xEnd: number; width: number; centerX: number }> = [];
    let inRun = false;
    let runStart = 0;

    for (let x = 0; x < width; x++) {
      const isDark = binary[rowOffset + x] === 1;
      if (isDark && !inRun) {
        inRun = true;
        runStart = x;
      } else if (!isDark && inRun) {
        inRun = false;
        const w = x - runStart;
        if (w >= 1 && w <= 40) {
          runs.push({ xStart: runStart, xEnd: x - 1, width: w, centerX: Math.round((runStart + x - 1) / 2) });
        }
      }
    }
    if (inRun) {
      const w = width - runStart;
      if (w >= 1 && w <= 40) {
        runs.push({ xStart: runStart, xEnd: width - 1, width: w, centerX: Math.round((runStart + width - 1) / 2) });
      }
    }

    if (runs.length < 24) continue;

    // A valid KIX code has N * 4 bars (e.g. 7 to 24 characters = 28 to 96 bars)
    for (let startIdx = 0; startIdx <= runs.length - 28; startIdx++) {
      for (let barCount = 28; barCount <= 96 && startIdx + barCount <= runs.length; barCount += 4) {
        const subRuns = runs.slice(startIdx, startIdx + barCount);

        // Check pitch regularity
        const pitches: number[] = [];
        for (let i = 1; i < subRuns.length; i++) {
          pitches.push(subRuns[i].centerX - subRuns[i - 1].centerX);
        }

        const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
        if (avgPitch < 2 || avgPitch > 60) continue;

        let pitchVariance = 0;
        for (const p of pitches) {
          pitchVariance += Math.abs(p - avgPitch);
        }
        pitchVariance /= pitches.length;

        // Pitch must be relatively regular across the barcode
        if (pitchVariance / avgPitch > 0.45) continue;

        // Trace vertical extents of each bar
        const measuredBars: InternalBar[] = [];
        let minBarY = height;
        let maxBarY = 0;

        for (const run of subRuns) {
          const cx = run.centerX;

          // Trace upwards
          let topY = y;
          while (topY > 0 && binary[topY * width + cx] === 1) {
            topY--;
          }

          // Trace downwards
          let botY = y;
          while (botY < height - 1 && binary[botY * width + cx] === 1) {
            botY++;
          }

          const barHeight = botY - topY;
          minBarY = Math.min(minBarY, topY);
          maxBarY = Math.max(maxBarY, botY);

          measuredBars.push({
            x: run.xStart,
            y: topY,
            width: run.width,
            height: barHeight,
            topHeight: y - topY,
            bottomHeight: botY - y,
            trackerHeight: 0,
            state: 'T',
          });
        }

        const totalSpanY = maxBarY - minBarY;
        if (totalSpanY < 6) continue;

        // Determine Ascender / Tracker / Descender thresholds from the bar heights
        const topHeights = measuredBars.map((b) => b.topHeight).sort((a, b) => a - b);
        const botHeights = measuredBars.map((b) => b.bottomHeight).sort((a, b) => a - b);

        const shortTop = topHeights[Math.floor(topHeights.length * 0.25)];
        const tallTop = topHeights[Math.floor(topHeights.length * 0.85)];
        const topCutoff = (shortTop + tallTop) / 2;

        const shortBot = botHeights[Math.floor(botHeights.length * 0.25)];
        const tallBot = botHeights[Math.floor(botHeights.length * 0.85)];
        const botCutoff = (shortBot + tallBot) / 2;

        const daftChars: string[] = [];
        let validCharCount = 0;

        for (let i = 0; i < measuredBars.length; i++) {
          const b = measuredBars[i];
          const hasAscender = b.topHeight > topCutoff && tallTop - shortTop >= 2;
          const hasDescender = b.bottomHeight > botCutoff && tallBot - shortBot >= 2;

          let state: BarState = 'T';
          if (hasAscender && hasDescender) state = 'F';
          else if (hasAscender) state = 'A';
          else if (hasDescender) state = 'D';
          else state = 'T';

          b.state = state;
          daftChars.push(state);
        }

        // Test if this matches valid 4-state characters
        for (let c = 0; c < daftChars.length; c += 4) {
          const token = daftChars.slice(c, c + 4).join('');
          if (DAFT_TO_CHAR[token]) {
            validCharCount++;
          }
        }

        const charCount = measuredBars.length / 4;
        const matchRatio = validCharCount / charCount;

        const candidateScore = matchRatio * 120 + charCount * 2 - (pitchVariance / avgPitch) * 20;

        if (candidateScore > bestScore && matchRatio >= 0.5) {
          bestScore = candidateScore;
          bestCandidate = {
            bars: measuredBars,
            boundingBox: {
              x: subRuns[0].xStart,
              y: minBarY,
              width: subRuns[subRuns.length - 1].xEnd - subRuns[0].xStart,
              height: totalSpanY,
            },
            rotation: 0,
            thresholdMethod: methodName,
          };

          // If perfect match found (100%), return immediately!
          if (matchRatio >= 0.95 && charCount >= 7) {
            return bestCandidate;
          }
        }
      }
    }
  }

  return bestCandidate;
}

/**
 * Decodes a DAFT bar sequence into characters
 */
function decodeDaftSequence(bars: InternalBar[]): {
  text: string;
  daftSequence: string;
  characters: DecodedCharacter[];
  detectedBars: DetectedBar[];
  validCount: number;
} {
  const characters: DecodedCharacter[] = [];
  const detectedBars: DetectedBar[] = [];
  let text = '';
  let validCount = 0;
  const daftSequence = bars.map((b) => b.state).join('');

  for (let i = 0; i < bars.length; i += 4) {
    const charIndex = Math.floor(i / 4);
    const chunk = bars.slice(i, i + 4);
    const token = chunk.map((b) => b.state).join('');
    const char = DAFT_TO_CHAR[token] || '?';

    if (char !== '?') validCount++;
    text += char;

    const barIndices = [i, i + 1, i + 2, i + 3];
    characters.push({
      char,
      daft: token,
      barIndices,
    });

    for (let j = 0; j < chunk.length; j++) {
      const b = chunk[j];
      detectedBars.push({
        index: i + j,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        state: b.state,
        confidence: char !== '?' ? 0.95 : 0.4,
        charIndex,
      });
    }
  }

  return { text, daftSequence, characters, detectedBars, validCount };
}

/**
 * Inverts DAFT sequence if barcode was captured upside down (180 deg)
 * Inverted 4-state bar: A <-> D, T <-> T, F <-> F, reversed order
 */
function invertDaftBars(bars: InternalBar[]): InternalBar[] {
  return [...bars].reverse().map((b) => {
    let state = b.state;
    if (state === 'A') state = 'D';
    else if (state === 'D') state = 'A';
    return { ...b, state };
  });
}


/**
 * Scans an image or canvas for a KIX barcode and decodes its contents.
 *
 * @param imgOrCanvas - The source image or canvas to scan.
 * @param options - Optional scan settings, including a manual region of interest.
 * @returns The decoded barcode result with scan metadata.
 */
export async function scanKixBarcodeFromImage(
  imgOrCanvas: HTMLImageElement | HTMLCanvasElement,
  options: ScanOptions = {}
): Promise<KixDecodeResult> {
  const startTime = performance.now();

  let baseCanvas: HTMLCanvasElement;
  let scale = 1;

  if (imgOrCanvas instanceof HTMLCanvasElement) {
    baseCanvas = imgOrCanvas;
  } else {
    const prep = createCanvasFromImage(imgOrCanvas);
    baseCanvas = prep.canvas;
    scale = prep.scale;
  }

  // If manual ROI is provided, crop to ROI
  if (options.roi && options.roi.width > 20 && options.roi.height > 10) {
    const roiCanvas = document.createElement('canvas');
    roiCanvas.width = options.roi.width;
    roiCanvas.height = options.roi.height;
    const roiCtx = roiCanvas.getContext('2d');
    if (roiCtx) {
      roiCtx.drawImage(
        baseCanvas,
        options.roi.x,
        options.roi.y,
        options.roi.width,
        options.roi.height,
        0,
        0,
        options.roi.width,
        options.roi.height
      );
      baseCanvas = roiCanvas;
    }
  }

  // Orientations to evaluate
  // Standard: 0°, 180°, 90°, 270°
  // If deskewAngle is specified or if search requires it, evaluate fine angles
  let anglesToTry = [0, 180, 90, 270];
  if (typeof options.deskewAngle === 'number' && options.deskewAngle !== 0) {
    anglesToTry = [options.deskewAngle, 0, 180, 90, 270];
  }

  let bestResult: KixDecodeResult | null = null;
  let highestScore = -1;

  for (const angle of anglesToTry) {
    const rotatedCanvas = rotateCanvas(baseCanvas, angle);
    const ctx = rotatedCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) continue;

    const w = rotatedCanvas.width;
    const h = rotatedCanvas.height;
    const imageData = ctx.getImageData(0, 0, w, h);
    const gray = toGrayscaleWithStretch(imageData, options.enhanceContrast ?? true);

    // Multi-Thresholding passes for this orientation:
    // 1. Bradley-Roth Adaptive Local Thresholding (handles shadows & postal lighting gradients)
    // 2. Otsu Global Thresholding
    // 3. Otsu 0.85x and 1.15x
    const binaryPasses: Array<{ binary: Uint8Array; method: string }> = [];

    if (options.manualThreshold !== undefined && options.manualThreshold >= 0) {
      const manualBin = new Uint8Array(w * h);
      for (let i = 0; i < gray.length; i++) {
        manualBin[i] = gray[i] < options.manualThreshold ? 1 : 0;
      }
      binaryPasses.push({ binary: manualBin, method: `Manual Threshold (${options.manualThreshold})` });
    } else {
      // Adaptive pass
      const adaptiveBin = createAdaptiveBinaryMap(gray, w, h, 0.08, 0.14, options.invertColors ?? false);
      binaryPasses.push({ binary: adaptiveBin, method: 'Local Adaptive (Shadow-Resistant)' });

      // Otsu pass
      const otsuVal = calculateOtsu(gray);
      const otsuBin = new Uint8Array(w * h);
      for (let i = 0; i < gray.length; i++) {
        otsuBin[i] = gray[i] < otsuVal ? 1 : 0;
      }
      binaryPasses.push({ binary: otsuBin, method: `Global Otsu (${otsuVal})` });
    }

    for (const { binary, method } of binaryPasses) {
      const candidate = scanBinaryMatrixForKix(binary, w, h, method);
      if (!candidate) continue;

      // Try forward decoding
      const forward = decodeDaftSequence(candidate.bars);
      const totalChars = forward.characters.length;
      if (totalChars < 5) continue;

      const forwardRatio = forward.validCount / totalChars;
      //const forwardAddress = parseKixAddress(forward.text);
      const forwardBonus = 0; //forwardAddress.isValidPostNL ? 50 : 0;
      const forwardScore = forwardRatio * 100 + totalChars * 2 + forwardBonus;

      if (forwardScore > highestScore && forwardRatio >= 0.5) {
        highestScore = forwardScore;
        const confidence = Math.min(1.0, forwardRatio * 1.0);//(forwardAddress.isValidPostNL ? 1.0 : 0.88));

        const bbox: BoundingBox = {
          x: Math.round(candidate.boundingBox.x / scale),
          y: Math.round(candidate.boundingBox.y / scale),
          width: Math.round(candidate.boundingBox.width / scale),
          height: Math.round(candidate.boundingBox.height / scale),
        };

        const adjustedBars: DetectedBar[] = forward.detectedBars.map((b) => ({
          ...b,
          x: Math.round(b.x / scale),
          y: Math.round(b.y / scale),
          width: Math.max(1, Math.round(b.width / scale)),
          height: Math.max(1, Math.round(b.height / scale)),
        }));

        bestResult = {
          success: forwardRatio >= 0.75,
          rawText: forward.text,
          daftSequence: forward.daftSequence,
          bars: adjustedBars,
          characters: forward.characters,
          boundingBox: bbox,
          addressInfo: null,
          confidence,
          rotation: angle,
          latencyMs: Math.round(performance.now() - startTime),
          engine: 'client-cv',
          debugInfo: {
            totalBarsFound: candidate.bars.length,
            validBarTuples: forward.validCount,
            thresholdMethod: `${method} (${angle}°)`,
          },
        };

        if (forwardRatio >= 0.95) {
          return bestResult;
        }
      }

      // Try backward/inverted decoding (upside-down 180° check)
      const invertedBars = invertDaftBars(candidate.bars);
      const backward = decodeDaftSequence(invertedBars);
      const backwardRatio = backward.validCount / totalChars;
      //const backwardAddress = parseKixAddress(backward.text);
      const backwardBonus = 0; //backwardAddress.isValidPostNL ? 50 : 0;
      const backwardScore = backwardRatio * 100 + totalChars * 2 + backwardBonus;

      if (backwardScore > highestScore && backwardRatio >= 0.5) {
        highestScore = backwardScore;
        const confidence = Math.min(1.0, backwardRatio * 1.0); //(backwardAddress.isValidPostNL ? 1.0 : 0.88));

        const bbox: BoundingBox = {
          x: Math.round(candidate.boundingBox.x / scale),
          y: Math.round(candidate.boundingBox.y / scale),
          width: Math.round(candidate.boundingBox.width / scale),
          height: Math.round(candidate.boundingBox.height / scale),
        };

        const adjustedBars: DetectedBar[] = backward.detectedBars.map((b) => ({
          ...b,
          x: Math.round(b.x / scale),
          y: Math.round(b.y / scale),
          width: Math.max(1, Math.round(b.width / scale)),
          height: Math.max(1, Math.round(b.height / scale)),
        }));

        bestResult = {
          success: backwardRatio >= 0.75,
          rawText: backward.text,
          daftSequence: backward.daftSequence,
          bars: adjustedBars,
          characters: backward.characters,
          boundingBox: bbox,
          addressInfo: null,
          confidence,
          rotation: (angle + 180) % 360,
          latencyMs: Math.round(performance.now() - startTime),
          engine: 'client-cv',
          debugInfo: {
            totalBarsFound: candidate.bars.length,
            validBarTuples: backward.validCount,
            thresholdMethod: `${method} (Inverted ${angle}°)`,
          },
        };

        if (backwardRatio >= 0.95) {
          return bestResult;
        }
      }
    }
  }

  // If not found in primary cardinal angles, run a fine deskew angle sweep (-12° to +12° in 3° steps)
  if (!bestResult || !bestResult.success) {
    const fineAngles = [-12, -9, -6, -3, 3, 6, 9, 12];
    for (const fineAngle of fineAngles) {
      const fineCanvas = rotateCanvas(baseCanvas, fineAngle);
      const ctx = fineCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;

      const w = fineCanvas.width;
      const h = fineCanvas.height;
      const gray = toGrayscaleWithStretch(ctx.getImageData(0, 0, w, h), true);
      const adaptiveBin = createAdaptiveBinaryMap(gray, w, h, 0.08, 0.14, options.invertColors ?? false);

      const candidate = scanBinaryMatrixForKix(adaptiveBin, w, h, `Fine Deskew (${fineAngle}°)`);
      if (!candidate) continue;

      const forward = decodeDaftSequence(candidate.bars);
      const totalChars = forward.characters.length;
      if (totalChars < 5) continue;

      const ratio = forward.validCount / totalChars;
      //const address = parseKixAddress(forward.text);

      if (ratio >= 0.75) {
        const bbox: BoundingBox = {
          x: Math.round(candidate.boundingBox.x / scale),
          y: Math.round(candidate.boundingBox.y / scale),
          width: Math.round(candidate.boundingBox.width / scale),
          height: Math.round(candidate.boundingBox.height / scale),
        };

        const adjustedBars: DetectedBar[] = forward.detectedBars.map((b) => ({
          ...b,
          x: Math.round(b.x / scale),
          y: Math.round(b.y / scale),
          width: Math.max(1, Math.round(b.width / scale)),
          height: Math.max(1, Math.round(b.height / scale)),
        }));

        return {
          success: true,
          rawText: forward.text,
          daftSequence: forward.daftSequence,
          bars: adjustedBars,
          characters: forward.characters,
          boundingBox: bbox,
          addressInfo: null,
          confidence: ratio, //* (address.isValidPostNL ? 1.0 : 0.88),
          rotation: fineAngle,
          latencyMs: Math.round(performance.now() - startTime),
          engine: 'client-cv',
          debugInfo: {
            totalBarsFound: candidate.bars.length,
            validBarTuples: forward.validCount,
            thresholdMethod: `Deskewed ${fineAngle}° Adaptive`,
          },
        };
      }
    }
  }

  const latencyMs = Math.round(performance.now() - startTime);

  if (bestResult && bestResult.success) {
    return bestResult;
  }

  if (bestResult) {
    return {
      ...bestResult,
      latencyMs,
      error: `Detected potential KIX barcode (${bestResult.rawText}), but some bars had noise or low contrast.`,
    };
  }

  return {
    success: false,
    rawText: '',
    daftSequence: '',
    bars: [],
    characters: [],
    addressInfo: { isValidPostNL: false },
    confidence: 0,
    rotation: 0,
    latencyMs,
    engine: 'client-cv',
    error: 'No 4-state KIX barcode detected on this device. Try fine-tuning contrast or angle in Local Controls.',
  };
}
