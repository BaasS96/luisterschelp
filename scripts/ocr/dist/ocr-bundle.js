const _ = {
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
}, W = Object.entries(_).reduce(
  (c, [t, e]) => (c[e] = t, c),
  {}
);
function G(c, t = 1600) {
  let { naturalWidth: e, naturalHeight: r } = c, n = 1;
  (e > t || r > t) && (e >= r ? (n = t / e, e = t, r = Math.round(c.naturalHeight * n)) : (n = t / r, r = t, e = Math.round(c.naturalWidth * n)));
  const d = document.createElement("canvas");
  d.width = Math.max(e, 1), d.height = Math.max(r, 1);
  const a = d.getContext("2d", { willReadFrequently: !0 });
  if (!a) throw new Error("Failed to get 2D canvas context");
  return a.drawImage(c, 0, 0, e, r), { canvas: d, ctx: a, scale: n };
}
function P(c, t) {
  if (t === 0) return c;
  const e = document.createElement("canvas"), r = t * Math.PI / 180, n = Math.abs(Math.sin(r)), d = Math.abs(Math.cos(r));
  e.width = Math.round(c.width * d + c.height * n), e.height = Math.round(c.height * d + c.width * n);
  const a = e.getContext("2d");
  return a ? (a.fillStyle = "#ffffff", a.fillRect(0, 0, e.width, e.height), a.translate(e.width / 2, e.height / 2), a.rotate(r), a.drawImage(c, -c.width / 2, -c.height / 2), e) : c;
}
function Y(c, t = !0) {
  const { data: e, width: r, height: n } = c, d = r * n, a = new Uint8Array(d);
  let l = 255, b = 0;
  for (let o = 0, i = 0; o < e.length; o += 4, i++) {
    const h = Math.round(0.299 * e[o] + 0.587 * e[o + 1] + 0.114 * e[o + 2]);
    a[i] = h, h < l && (l = h), h > b && (b = h);
  }
  if (t && b > l && (l > 20 || b < 235)) {
    const o = b - l;
    for (let i = 0; i < d; i++)
      a[i] = Math.round((a[i] - l) / o * 255);
  }
  return a;
}
function N(c) {
  const t = new Int32Array(256), e = c.length;
  for (let o = 0; o < e; o++)
    t[c[o]]++;
  let r = 0;
  for (let o = 0; o < 256; o++) r += o * t[o];
  let n = 0, d = 0, a = 0, l = 0, b = 128;
  for (let o = 0; o < 256; o++) {
    if (d += t[o], d === 0) continue;
    if (a = e - d, a === 0) break;
    n += o * t[o];
    const i = n / d, h = (r - n) / a, s = d * a * (i - h) * (i - h);
    s > l && (l = s, b = o);
  }
  return b;
}
function V(c, t, e, r = 0.08, n = 0.15, d = !1) {
  const a = t * e, l = new Float64Array(a);
  for (let h = 0; h < e; h++) {
    let s = 0;
    const u = h * t;
    for (let w = 0; w < t; w++)
      s += c[u + w], h === 0 ? l[u + w] = s : l[u + w] = l[(h - 1) * t + w] + s;
  }
  const b = new Uint8Array(a), o = Math.max(3, Math.round(t * r)), i = Math.floor(o / 2);
  for (let h = 0; h < e; h++) {
    const s = Math.max(0, h - i), u = Math.min(e - 1, h + i), w = h * t;
    for (let M = 0; M < t; M++) {
      const A = Math.max(0, M - i), m = Math.min(t - 1, M + i), f = (m - A + 1) * (u - s + 1), x = s > 0 && A > 0 ? l[(s - 1) * t + (A - 1)] : 0, v = s > 0 ? l[(s - 1) * t + m] : 0, B = A > 0 ? l[u * t + (A - 1)] : 0, F = l[u * t + m] - v - B + x, H = c[w + M] * f <= F * (1 - n);
      b[w + M] = d ? H ? 0 : 1 : H ? 1 : 0;
    }
  }
  return b;
}
function z(c, t, e, r) {
  if (t < 30 || e < 15) return null;
  const n = Math.max(2, Math.floor(e / 140));
  let d = null, a = -1;
  for (let l = 4; l < e - 4; l += n) {
    const b = l * t, o = [];
    let i = !1, h = 0;
    for (let s = 0; s < t; s++) {
      const u = c[b + s] === 1;
      if (u && !i)
        i = !0, h = s;
      else if (!u && i) {
        i = !1;
        const w = s - h;
        w >= 1 && w <= 40 && o.push({ xStart: h, xEnd: s - 1, width: w, centerX: Math.round((h + s - 1) / 2) });
      }
    }
    if (i) {
      const s = t - h;
      s >= 1 && s <= 40 && o.push({ xStart: h, xEnd: t - 1, width: s, centerX: Math.round((h + t - 1) / 2) });
    }
    if (!(o.length < 24))
      for (let s = 0; s <= o.length - 28; s++)
        for (let u = 28; u <= 96 && s + u <= o.length; u += 4) {
          const w = o.slice(s, s + u), M = [];
          for (let g = 1; g < w.length; g++)
            M.push(w[g].centerX - w[g - 1].centerX);
          const A = M.reduce((g, y) => g + y, 0) / M.length;
          if (A < 2 || A > 60) continue;
          let m = 0;
          for (const g of M)
            m += Math.abs(g - A);
          if (m /= M.length, m / A > 0.45) continue;
          const f = [];
          let x = e, v = 0;
          for (const g of w) {
            const y = g.centerX;
            let C = l;
            for (; C > 0 && c[C * t + y] === 1; )
              C--;
            let p = l;
            for (; p < e - 1 && c[p * t + y] === 1; )
              p++;
            const R = p - C;
            x = Math.min(x, C), v = Math.max(v, p), f.push({
              x: g.xStart,
              y: C,
              width: g.width,
              height: R,
              topHeight: l - C,
              bottomHeight: p - l,
              trackerHeight: 0,
              state: "T"
            });
          }
          const B = v - x;
          if (B < 6) continue;
          const D = f.map((g) => g.topHeight).sort((g, y) => g - y), F = f.map((g) => g.bottomHeight).sort((g, y) => g - y), E = D[Math.floor(D.length * 0.25)], H = D[Math.floor(D.length * 0.85)], I = (E + H) / 2, S = F[Math.floor(F.length * 0.25)], O = F[Math.floor(F.length * 0.85)], j = (S + O) / 2, k = [];
          let q = 0;
          for (let g = 0; g < f.length; g++) {
            const y = f[g], C = y.topHeight > I && H - E >= 2, p = y.bottomHeight > j && O - S >= 2;
            let R = "T";
            C && p ? R = "F" : C ? R = "A" : p ? R = "D" : R = "T", y.state = R, k.push(R);
          }
          for (let g = 0; g < k.length; g += 4) {
            const y = k.slice(g, g + 4).join("");
            W[y] && q++;
          }
          const L = f.length / 4, T = q / L, X = T * 120 + L * 2 - m / A * 20;
          if (X > a && T >= 0.5 && (a = X, d = {
            bars: f,
            boundingBox: {
              x: w[0].xStart,
              y: x,
              width: w[w.length - 1].xEnd - w[0].xStart,
              height: B
            },
            rotation: 0,
            thresholdMethod: r
          }, T >= 0.95 && L >= 7))
            return d;
        }
  }
  return d;
}
function $(c) {
  const t = [], e = [];
  let r = "", n = 0;
  const d = c.map((a) => a.state).join("");
  for (let a = 0; a < c.length; a += 4) {
    const l = Math.floor(a / 4), b = c.slice(a, a + 4), o = b.map((s) => s.state).join(""), i = W[o] || "?";
    i !== "?" && n++, r += i;
    const h = [a, a + 1, a + 2, a + 3];
    t.push({
      char: i,
      daft: o,
      barIndices: h
    });
    for (let s = 0; s < b.length; s++) {
      const u = b[s];
      e.push({
        index: a + s,
        x: u.x,
        y: u.y,
        width: u.width,
        height: u.height,
        state: u.state,
        confidence: i !== "?" ? 0.95 : 0.4,
        charIndex: l
      });
    }
  }
  return { text: r, daftSequence: d, characters: t, detectedBars: e, validCount: n };
}
function J(c) {
  return [...c].reverse().map((t) => {
    let e = t.state;
    return e === "A" ? e = "D" : e === "D" && (e = "A"), { ...t, state: e };
  });
}
async function Q(c, t = {}) {
  const e = performance.now();
  let r, n = 1;
  if (c instanceof HTMLCanvasElement)
    r = c;
  else {
    const o = G(c);
    r = o.canvas, n = o.scale;
  }
  if (t.roi && t.roi.width > 20 && t.roi.height > 10) {
    const o = document.createElement("canvas");
    o.width = t.roi.width, o.height = t.roi.height;
    const i = o.getContext("2d");
    i && (i.drawImage(
      r,
      t.roi.x,
      t.roi.y,
      t.roi.width,
      t.roi.height,
      0,
      0,
      t.roi.width,
      t.roi.height
    ), r = o);
  }
  let d = [0, 180, 90, 270];
  typeof t.deskewAngle == "number" && t.deskewAngle !== 0 && (d = [t.deskewAngle, 0, 180, 90, 270]);
  let a = null, l = -1;
  for (const o of d) {
    const i = P(r, o), h = i.getContext("2d", { willReadFrequently: !0 });
    if (!h) continue;
    const s = i.width, u = i.height, w = h.getImageData(0, 0, s, u), M = Y(w, t.enhanceContrast ?? !0), A = [];
    if (t.manualThreshold !== void 0 && t.manualThreshold >= 0) {
      const m = new Uint8Array(s * u);
      for (let f = 0; f < M.length; f++)
        m[f] = M[f] < t.manualThreshold ? 1 : 0;
      A.push({ binary: m, method: `Manual Threshold (${t.manualThreshold})` });
    } else {
      const m = V(M, s, u, 0.08, 0.14, t.invertColors ?? !1);
      A.push({ binary: m, method: "Local Adaptive (Shadow-Resistant)" });
      const f = N(M), x = new Uint8Array(s * u);
      for (let v = 0; v < M.length; v++)
        x[v] = M[v] < f ? 1 : 0;
      A.push({ binary: x, method: `Global Otsu (${f})` });
    }
    for (const { binary: m, method: f } of A) {
      const x = z(m, s, u, f);
      if (!x) continue;
      const v = $(x.bars), B = v.characters.length;
      if (B < 5) continue;
      const D = v.validCount / B, E = D * 100 + B * 2 + 0;
      if (E > l && D >= 0.5) {
        l = E;
        const k = Math.min(1, D * 1), q = {
          x: Math.round(x.boundingBox.x / n),
          y: Math.round(x.boundingBox.y / n),
          width: Math.round(x.boundingBox.width / n),
          height: Math.round(x.boundingBox.height / n)
        }, L = v.detectedBars.map((T) => ({
          ...T,
          x: Math.round(T.x / n),
          y: Math.round(T.y / n),
          width: Math.max(1, Math.round(T.width / n)),
          height: Math.max(1, Math.round(T.height / n))
        }));
        if (a = {
          success: D >= 0.75,
          rawText: v.text,
          daftSequence: v.daftSequence,
          bars: L,
          characters: v.characters,
          boundingBox: q,
          addressInfo: null,
          confidence: k,
          rotation: o,
          latencyMs: Math.round(performance.now() - e),
          engine: "client-cv",
          debugInfo: {
            totalBarsFound: x.bars.length,
            validBarTuples: v.validCount,
            thresholdMethod: `${f} (${o}°)`
          }
        }, D >= 0.95)
          return a;
      }
      const H = J(x.bars), I = $(H), S = I.validCount / B, j = S * 100 + B * 2 + 0;
      if (j > l && S >= 0.5) {
        l = j;
        const k = Math.min(1, S * 1), q = {
          x: Math.round(x.boundingBox.x / n),
          y: Math.round(x.boundingBox.y / n),
          width: Math.round(x.boundingBox.width / n),
          height: Math.round(x.boundingBox.height / n)
        }, L = I.detectedBars.map((T) => ({
          ...T,
          x: Math.round(T.x / n),
          y: Math.round(T.y / n),
          width: Math.max(1, Math.round(T.width / n)),
          height: Math.max(1, Math.round(T.height / n))
        }));
        if (a = {
          success: S >= 0.75,
          rawText: I.text,
          daftSequence: I.daftSequence,
          bars: L,
          characters: I.characters,
          boundingBox: q,
          addressInfo: null,
          confidence: k,
          rotation: (o + 180) % 360,
          latencyMs: Math.round(performance.now() - e),
          engine: "client-cv",
          debugInfo: {
            totalBarsFound: x.bars.length,
            validBarTuples: I.validCount,
            thresholdMethod: `${f} (Inverted ${o}°)`
          }
        }, S >= 0.95)
          return a;
      }
    }
  }
  if (!a || !a.success) {
    const o = [-12, -9, -6, -3, 3, 6, 9, 12];
    for (const i of o) {
      const h = P(r, i), s = h.getContext("2d", { willReadFrequently: !0 });
      if (!s) continue;
      const u = h.width, w = h.height, M = Y(s.getImageData(0, 0, u, w), !0), A = V(M, u, w, 0.08, 0.14, t.invertColors ?? !1), m = z(A, u, w, `Fine Deskew (${i}°)`);
      if (!m) continue;
      const f = $(m.bars), x = f.characters.length;
      if (x < 5) continue;
      const v = f.validCount / x;
      if (v >= 0.75) {
        const B = {
          x: Math.round(m.boundingBox.x / n),
          y: Math.round(m.boundingBox.y / n),
          width: Math.round(m.boundingBox.width / n),
          height: Math.round(m.boundingBox.height / n)
        }, D = f.detectedBars.map((F) => ({
          ...F,
          x: Math.round(F.x / n),
          y: Math.round(F.y / n),
          width: Math.max(1, Math.round(F.width / n)),
          height: Math.max(1, Math.round(F.height / n))
        }));
        return {
          success: !0,
          rawText: f.text,
          daftSequence: f.daftSequence,
          bars: D,
          characters: f.characters,
          boundingBox: B,
          addressInfo: null,
          confidence: v,
          //* (address.isValidPostNL ? 1.0 : 0.88),
          rotation: i,
          latencyMs: Math.round(performance.now() - e),
          engine: "client-cv",
          debugInfo: {
            totalBarsFound: m.bars.length,
            validBarTuples: f.validCount,
            thresholdMethod: `Deskewed ${i}° Adaptive`
          }
        };
      }
    }
  }
  const b = Math.round(performance.now() - e);
  return a && a.success ? a : a ? {
    ...a,
    latencyMs: b,
    error: `Detected potential KIX barcode (${a.rawText}), but some bars had noise or low contrast.`
  } : {
    success: !1,
    rawText: "",
    daftSequence: "",
    bars: [],
    characters: [],
    addressInfo: { isValidPostNL: !1 },
    confidence: 0,
    rotation: 0,
    latencyMs: b,
    engine: "client-cv",
    error: "No 4-state KIX barcode detected on this device. Try fine-tuning contrast or angle in Local Controls."
  };
}
var K;
class U {
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
class Z {
  constructor(t) {
    this.word = t, this.model = null, this.modelReady = !1;
  }
  async init(t) {
    this.canvas = document.getElementById("canvas"), this.ctx = this.canvas.getContext("2d"), K = this.ctx, this.drawImage, console.log(this.ctx), this.w = window.innerWidth;
    let e = document.body, r = document.documentElement;
    this.h = Math.max(e.scrollHeight, e.offsetHeight, r.clientHeight, r.scrollHeight, r.offsetHeight), this.w < this.h ? (this.canvas.setAttribute("width", this.w * 0.7), this.canvas.setAttribute("height", this.w * 0.7), this.cw = this.w * 0.7, this.ch = this.w * 0.7) : (this.canvas.setAttribute("width", this.h * 0.7), this.canvas.setAttribute("height", this.h * 0.7), this.cw = this.h * 0.7, this.ch = this.h * 0.7), this.photo = !1, this.backcam = void 0, this.onrecognized = t;
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
      const t = this.ctx.getImageData(0, 0, this.cw, this.ch), e = this.canvas.toDataURL(), r = document.createElement("canvas");
      r.width = 256, r.height = 256;
      const n = document.createElement("canvas");
      n.width = t.width, n.height = t.height, n.getContext("2d").putImageData(t, 0, 0), r.getContext("2d").drawImage(
        n,
        0,
        0,
        r.width,
        r.height
      ), document.body.appendChild(r);
      let d = await Q(this.canvas);
      d && d.success ? this.onrecognized(new U(this.extractLetterFromPostcode(d.rawText), 1)) : this.onrecognized(new U("", -1));
    } catch (t) {
      console.error("Recognition failed:", t), this.onrecognized(new U("", -1));
    } finally {
    }
  }
  extractLetterFromPostcode(t) {
    return console.log(t), t.charAt(4).toLowerCase();
  }
  draw(t, e, r, n, d, a) {
    this.photo || K.drawImage(t, e, r, n, d);
  }
}
export {
  Z as OCR,
  U as OCRResult
};
//# sourceMappingURL=ocr-bundle.js.map
