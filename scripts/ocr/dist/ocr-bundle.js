const V = {
  0: "TTFF",
  1: "TDAF",
  2: "TDFA",
  3: "DTAF",
  4: "DTFA",
  5: "DDAA",
  6: "TADF",
  7: "TFTF",
  8: "TFDA",
  9: "DATF",
  A: "DADA",
  B: "DFTA",
  C: "TAFD",
  D: "TFAD",
  E: "TFFT",
  F: "DAAD",
  G: "DAFT",
  H: "DFAT",
  I: "ATDF",
  J: "ADTF",
  K: "ADDA",
  L: "FTTF",
  M: "FTDA",
  N: "FDTA",
  O: "ATFD",
  P: "ADAD",
  Q: "ADFT",
  R: "FTAD",
  S: "FTFT",
  T: "FDAT",
  U: "AADD",
  V: "AFTD",
  W: "AFDT",
  X: "FATD",
  Y: "FADT",
  Z: "FFTT"
}, K = Object.entries(V).reduce(
  (s, [t, e]) => (s[e] = t, s),
  {}
);
function _(s, t = 1600) {
  let { naturalWidth: e, naturalHeight: d } = s, a = 1;
  (e > t || d > t) && (e >= d ? (a = t / e, e = t, d = Math.round(s.naturalHeight * a)) : (a = t / d, d = t, e = Math.round(s.naturalWidth * a)));
  const u = document.createElement("canvas");
  u.width = Math.max(e, 1), u.height = Math.max(d, 1);
  const n = u.getContext("2d", { willReadFrequently: !0 });
  if (!n) throw new Error("Failed to get 2D canvas context");
  return n.drawImage(s, 0, 0, e, d), { canvas: u, ctx: n, scale: a };
}
function Y(s, t) {
  if (t === 0) return s;
  const e = document.createElement("canvas"), d = t * Math.PI / 180, a = Math.abs(Math.sin(d)), u = Math.abs(Math.cos(d));
  e.width = Math.round(s.width * u + s.height * a), e.height = Math.round(s.height * u + s.width * a);
  const n = e.getContext("2d");
  return n ? (n.fillStyle = "#ffffff", n.fillRect(0, 0, e.width, e.height), n.translate(e.width / 2, e.height / 2), n.rotate(d), n.drawImage(s, -s.width / 2, -s.height / 2), e) : s;
}
function U(s, t = !0) {
  const { data: e, width: d, height: a } = s, u = d * a, n = new Uint8Array(u);
  let c = 255, m = 0;
  for (let o = 0, i = 0; o < e.length; o += 4, i++) {
    const h = Math.round(0.299 * e[o] + 0.587 * e[o + 1] + 0.114 * e[o + 2]);
    n[i] = h, h < c && (c = h), h > m && (m = h);
  }
  if (t && m > c && (c > 20 || m < 235)) {
    const o = m - c;
    for (let i = 0; i < u; i++)
      n[i] = Math.round((n[i] - c) / o * 255);
  }
  return n;
}
function G(s) {
  const t = new Int32Array(256), e = s.length;
  for (let o = 0; o < e; o++)
    t[s[o]]++;
  let d = 0;
  for (let o = 0; o < 256; o++) d += o * t[o];
  let a = 0, u = 0, n = 0, c = 0, m = 128;
  for (let o = 0; o < 256; o++) {
    if (u += t[o], u === 0) continue;
    if (n = e - u, n === 0) break;
    a += o * t[o];
    const i = a / u, h = (d - a) / n, r = u * n * (i - h) * (i - h);
    r > c && (c = r, m = o);
  }
  return m;
}
function z(s, t, e, d = 0.08, a = 0.15, u = !1) {
  const n = t * e, c = new Float64Array(n);
  for (let h = 0; h < e; h++) {
    let r = 0;
    const l = h * t;
    for (let x = 0; x < t; x++)
      r += s[l + x], h === 0 ? c[l + x] = r : c[l + x] = c[(h - 1) * t + x] + r;
  }
  const m = new Uint8Array(n), o = Math.max(3, Math.round(t * d)), i = Math.floor(o / 2);
  for (let h = 0; h < e; h++) {
    const r = Math.max(0, h - i), l = Math.min(e - 1, h + i), x = h * t;
    for (let b = 0; b < t; b++) {
      const A = Math.max(0, b - i), M = Math.min(t - 1, b + i), f = (M - A + 1) * (l - r + 1), w = r > 0 && A > 0 ? c[(r - 1) * t + (A - 1)] : 0, v = r > 0 ? c[(r - 1) * t + M] : 0, D = A > 0 ? c[l * t + (A - 1)] : 0, B = c[l * t + M] - v - D + w, R = s[x + b] * f <= B * (1 - a);
      m[x + b] = u ? R ? 0 : 1 : R ? 1 : 0;
    }
  }
  return m;
}
function P(s, t, e, d) {
  if (t < 30 || e < 15) return null;
  const a = Math.max(2, Math.floor(e / 140));
  let u = null, n = -1;
  for (let c = 4; c < e - 4; c += a) {
    const m = c * t, o = [];
    let i = !1, h = 0;
    for (let r = 0; r < t; r++) {
      const l = s[m + r] === 1;
      if (l && !i)
        i = !0, h = r;
      else if (!l && i) {
        i = !1;
        const x = r - h;
        x >= 1 && x <= 40 && o.push({ xStart: h, xEnd: r - 1, width: x, centerX: Math.round((h + r - 1) / 2) });
      }
    }
    if (i) {
      const r = t - h;
      r >= 1 && r <= 40 && o.push({ xStart: h, xEnd: t - 1, width: r, centerX: Math.round((h + t - 1) / 2) });
    }
    if (!(o.length < 24))
      for (let r = 0; r <= o.length - 28; r++)
        for (let l = 28; l <= 96 && r + l <= o.length; l += 4) {
          const x = o.slice(r, r + l), b = [];
          for (let g = 1; g < x.length; g++)
            b.push(x[g].centerX - x[g - 1].centerX);
          const A = b.reduce((g, F) => g + F, 0) / b.length;
          if (A < 2 || A > 60) continue;
          let M = 0;
          for (const g of b)
            M += Math.abs(g - A);
          if (M /= b.length, M / A > 0.45) continue;
          const f = [];
          let w = e, v = 0;
          for (const g of x) {
            const F = g.centerX;
            let C = c;
            for (; C > 0 && s[C * t + F] === 1; )
              C--;
            let p = c;
            for (; p < e - 1 && s[p * t + F] === 1; )
              p++;
            const I = p - C;
            w = Math.min(w, C), v = Math.max(v, p), f.push({
              x: g.xStart,
              y: C,
              width: g.width,
              height: I,
              topHeight: c - C,
              bottomHeight: p - c,
              trackerHeight: 0,
              state: "T"
            });
          }
          const D = v - w;
          if (D < 6) continue;
          const y = f.map((g) => g.topHeight).sort((g, F) => g - F), B = f.map((g) => g.bottomHeight).sort((g, F) => g - F), L = y[Math.floor(y.length * 0.25)], R = y[Math.floor(y.length * 0.85)], S = (L + R) / 2, H = B[Math.floor(B.length * 0.25)], O = B[Math.floor(B.length * 0.85)], j = (H + O) / 2, k = [];
          let E = 0;
          for (let g = 0; g < f.length; g++) {
            const F = f[g], C = F.topHeight > S && R - L >= 2, p = F.bottomHeight > j && O - H >= 2;
            let I = "T";
            C && p ? I = "F" : C ? I = "A" : p ? I = "D" : I = "T", F.state = I, k.push(I);
          }
          for (let g = 0; g < k.length; g += 4) {
            const F = k.slice(g, g + 4).join("");
            K[F] && E++;
          }
          const q = f.length / 4, T = E / q, W = T * 120 + q * 2 - M / A * 20;
          if (W > n && T >= 0.5 && (n = W, u = {
            bars: f,
            boundingBox: {
              x: x[0].xStart,
              y: w,
              width: x[x.length - 1].xEnd - x[0].xStart,
              height: D
            },
            rotation: 0,
            thresholdMethod: d
          }, T >= 0.95 && q >= 7))
            return u;
        }
  }
  return u;
}
function X(s) {
  const t = [], e = [];
  let d = "", a = 0;
  const u = s.map((n) => n.state).join("");
  for (let n = 0; n < s.length; n += 4) {
    const c = Math.floor(n / 4), m = s.slice(n, n + 4), o = m.map((r) => r.state).join(""), i = K[o] || "?";
    i !== "?" && a++, d += i;
    const h = [n, n + 1, n + 2, n + 3];
    t.push({
      char: i,
      daft: o,
      barIndices: h
    });
    for (let r = 0; r < m.length; r++) {
      const l = m[r];
      e.push({
        index: n + r,
        x: l.x,
        y: l.y,
        width: l.width,
        height: l.height,
        state: l.state,
        confidence: i !== "?" ? 0.95 : 0.4,
        charIndex: c
      });
    }
  }
  return { text: d, daftSequence: u, characters: t, detectedBars: e, validCount: a };
}
function N(s) {
  return [...s].reverse().map((t) => {
    let e = t.state;
    return e === "A" ? e = "D" : e === "D" && (e = "A"), { ...t, state: e };
  });
}
async function J(s, t = {}) {
  const e = performance.now();
  let d, a = 1;
  if (s instanceof HTMLCanvasElement)
    d = s;
  else {
    const o = _(s);
    d = o.canvas, a = o.scale;
  }
  if (t.roi && t.roi.width > 20 && t.roi.height > 10) {
    const o = document.createElement("canvas");
    o.width = t.roi.width, o.height = t.roi.height;
    const i = o.getContext("2d");
    i && (i.drawImage(
      d,
      t.roi.x,
      t.roi.y,
      t.roi.width,
      t.roi.height,
      0,
      0,
      t.roi.width,
      t.roi.height
    ), d = o);
  }
  let u = [0, 180, 90, 270];
  typeof t.deskewAngle == "number" && t.deskewAngle !== 0 && (u = [t.deskewAngle, 0, 180, 90, 270]);
  let n = null, c = -1;
  for (const o of u) {
    const i = Y(d, o), h = i.getContext("2d", { willReadFrequently: !0 });
    if (!h) continue;
    const r = i.width, l = i.height, x = h.getImageData(0, 0, r, l), b = U(x, t.enhanceContrast ?? !0), A = [];
    if (t.manualThreshold !== void 0 && t.manualThreshold >= 0) {
      const M = new Uint8Array(r * l);
      for (let f = 0; f < b.length; f++)
        M[f] = b[f] < t.manualThreshold ? 1 : 0;
      A.push({ binary: M, method: `Manual Threshold (${t.manualThreshold})` });
    } else {
      const M = z(b, r, l, 0.08, 0.14, t.invertColors ?? !1);
      A.push({ binary: M, method: "Local Adaptive (Shadow-Resistant)" });
      const f = G(b), w = new Uint8Array(r * l);
      for (let v = 0; v < b.length; v++)
        w[v] = b[v] < f ? 1 : 0;
      A.push({ binary: w, method: `Global Otsu (${f})` });
    }
    for (const { binary: M, method: f } of A) {
      const w = P(M, r, l, f);
      if (!w) continue;
      const v = X(w.bars), D = v.characters.length;
      if (D < 5) continue;
      const y = v.validCount / D, L = y * 100 + D * 2 + 0;
      if (L > c && y >= 0.5) {
        c = L;
        const k = Math.min(1, y * 1), E = {
          x: Math.round(w.boundingBox.x / a),
          y: Math.round(w.boundingBox.y / a),
          width: Math.round(w.boundingBox.width / a),
          height: Math.round(w.boundingBox.height / a)
        }, q = v.detectedBars.map((T) => ({
          ...T,
          x: Math.round(T.x / a),
          y: Math.round(T.y / a),
          width: Math.max(1, Math.round(T.width / a)),
          height: Math.max(1, Math.round(T.height / a))
        }));
        if (n = {
          success: y >= 0.75,
          rawText: v.text,
          daftSequence: v.daftSequence,
          bars: q,
          characters: v.characters,
          boundingBox: E,
          confidence: k,
          rotation: o,
          latencyMs: Math.round(performance.now() - e),
          engine: "client-cv",
          debugInfo: {
            totalBarsFound: w.bars.length,
            validBarTuples: v.validCount,
            thresholdMethod: `${f} (${o}°)`
          }
        }, y >= 0.95)
          return n;
      }
      const R = N(w.bars), S = X(R), H = S.validCount / D, j = H * 100 + D * 2 + 0;
      if (j > c && H >= 0.5) {
        c = j;
        const k = Math.min(1, H * 1), E = {
          x: Math.round(w.boundingBox.x / a),
          y: Math.round(w.boundingBox.y / a),
          width: Math.round(w.boundingBox.width / a),
          height: Math.round(w.boundingBox.height / a)
        }, q = S.detectedBars.map((T) => ({
          ...T,
          x: Math.round(T.x / a),
          y: Math.round(T.y / a),
          width: Math.max(1, Math.round(T.width / a)),
          height: Math.max(1, Math.round(T.height / a))
        }));
        if (n = {
          success: H >= 0.75,
          rawText: S.text,
          daftSequence: S.daftSequence,
          bars: q,
          characters: S.characters,
          boundingBox: E,
          confidence: k,
          rotation: (o + 180) % 360,
          latencyMs: Math.round(performance.now() - e),
          engine: "client-cv",
          debugInfo: {
            totalBarsFound: w.bars.length,
            validBarTuples: S.validCount,
            thresholdMethod: `${f} (Inverted ${o}°)`
          }
        }, H >= 0.95)
          return n;
      }
    }
  }
  if (!n || !n.success) {
    const o = [-12, -9, -6, -3, 3, 6, 9, 12];
    for (const i of o) {
      const h = Y(d, i), r = h.getContext("2d", { willReadFrequently: !0 });
      if (!r) continue;
      const l = h.width, x = h.height, b = U(r.getImageData(0, 0, l, x), !0), A = z(b, l, x, 0.08, 0.14, t.invertColors ?? !1), M = P(A, l, x, `Fine Deskew (${i}°)`);
      if (!M) continue;
      const f = X(M.bars), w = f.characters.length;
      if (w < 5) continue;
      const v = f.validCount / w;
      if (v >= 0.75) {
        const D = {
          x: Math.round(M.boundingBox.x / a),
          y: Math.round(M.boundingBox.y / a),
          width: Math.round(M.boundingBox.width / a),
          height: Math.round(M.boundingBox.height / a)
        }, y = f.detectedBars.map((B) => ({
          ...B,
          x: Math.round(B.x / a),
          y: Math.round(B.y / a),
          width: Math.max(1, Math.round(B.width / a)),
          height: Math.max(1, Math.round(B.height / a))
        }));
        return {
          success: !0,
          rawText: f.text,
          daftSequence: f.daftSequence,
          bars: y,
          characters: f.characters,
          boundingBox: D,
          confidence: v,
          //* (address.isValidPostNL ? 1.0 : 0.88),
          rotation: i,
          latencyMs: Math.round(performance.now() - e),
          engine: "client-cv",
          debugInfo: {
            totalBarsFound: M.bars.length,
            validBarTuples: f.validCount,
            thresholdMethod: `Deskewed ${i}° Adaptive`
          }
        };
      }
    }
  }
  const m = Math.round(performance.now() - e);
  return n && n.success ? n : n ? {
    ...n,
    latencyMs: m,
    error: `Detected potential KIX barcode (${n.rawText}), but some bars had noise or low contrast.`
  } : {
    success: !1,
    rawText: "",
    daftSequence: "",
    bars: [],
    characters: [],
    confidence: 0,
    rotation: 0,
    latencyMs: m,
    engine: "client-cv",
    error: "No 4-state KIX barcode detected on this device. Try fine-tuning contrast or angle in Local Controls."
  };
}
class $ {
  constructor(t, e) {
    this.guessedLetter = t, this.confidence = e;
  }
  hasFailed(t) {
    return this.guessedLetter == t ? !1 : this.confidence < 0.9;
  }
  isCorrect(t) {
    return this.guessedLetter === t ? !0 : this.confidence >= 0.9 && this.guessedLetter === t;
  }
  getResult() {
    return this.guessedLetter;
  }
}
class Q {
  constructor(t) {
    this.word = t, this.model = null, this.modelReady = !1;
  }
  async init(t) {
    this.canvas = document.getElementById("canvas"), this.ctx = this.canvas.getContext("2d"), this.ctx, this.drawImage, console.log(this.ctx), this.w = window.innerWidth;
    let e = document.body, d = document.documentElement;
    this.h = Math.max(e.scrollHeight, e.offsetHeight, d.clientHeight, d.scrollHeight, d.offsetHeight), this.w < this.h ? (this.canvas.setAttribute("width", this.w * 0.7), this.canvas.setAttribute("height", this.w * 0.7), this.cw = this.w * 0.7, this.ch = this.w * 0.7) : (this.canvas.setAttribute("width", this.h * 0.7), this.canvas.setAttribute("height", this.h * 0.7), this.cw = this.h * 0.7, this.ch = this.h * 0.7), this.photo = !1, this.backcam = void 0, this.onrecognized = t;
  }
  initCamera() {
    var t = this;
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia ? navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
    }).then(function(e) {
      t.videostream = e, video.srcObject = e, video.play(), setInterval(t.draw, 20, video, 0, 0, t.cw, t.ch, t.ctx);
    }).catch(function(e) {
      console.error(e);
    }) : alert("function not supported");
  }
  async recognize() {
    console.log("Finding barcodes"), this.photo = !0;
    try {
      let t = await J(this.canvas);
      t && t.success ? this.onrecognized(new $(this.extractLetterFromPostcode(t.rawText), 1)) : this.onrecognized(new $("", -1));
    } catch (t) {
      console.error("Recognition failed:", t), this.onrecognized(new $("", -1));
    } finally {
      this.photo = !1;
    }
  }
  extractLetterFromPostcode(t) {
    return console.log(t), t.charAt(4).toLowerCase();
  }
  draw(t, e, d, a, u, n) {
    if (this.photo || !t.videoWidth || !t.videoHeight)
      return;
    const c = Math.min(t.videoWidth, t.videoHeight), m = (t.videoWidth - c) / 2, o = (t.videoHeight - c) / 2;
    n.drawImage(
      t,
      m,
      o,
      c,
      c,
      e,
      d,
      a,
      u
    );
  }
}
export {
  Q as OCR,
  $ as OCRResult
};
//# sourceMappingURL=ocr-bundle.js.map
