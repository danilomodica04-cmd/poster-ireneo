// Motore di Startype Caleido, estratto da startype_caleido.html senza modifiche alle regole:
// analisi della registrazione (volume, 16 bande, timbro, attacchi, intensita') e costruzione del simbolo.
(function (global) {
"use strict";
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const WEIGHTS = ["Thin", "ExtraLight", "Light", "Regular", "Medium", "SemiBold", "Bold", "ExtraBold", "Black", "Pieno"];
const DEG = Math.PI / 180;
const GLYPH_SVG = ["M17.97,29.82l14.15-4.59.77,1.91-14.53,4.59s-.38.38,0,.38l8.79,12.23-1.53,1.15-8.79-12.23h-.77l-8.79,12.23-1.53-1.15,8.79-12.23c.38,0,0-.38,0-.38L0,27.15l.77-1.91,14.15,4.59c.38,0,.77,0,.77-.38v-14.91h1.91v14.91q0,.38.38.38Z",
  "M248.5,29.06l13.38-4.59.77,3.06-13.38,4.21c-.38.38-.76.77-.38,1.15l8.41,11.47-2.68,1.91-8.03-11.47c-.38-.38-1.15-.38-1.53,0l-8.03,11.47-2.68-1.91,8.41-11.47c.38-.38,0-.77-.38-1.15l-13.38-4.21.77-3.06,13.38,4.59c.77,0,1.53-.38,1.53-.77v-14.15h2.68v14.15c0,.38.38.77,1.15.77Z",
  "M478.64,27.91l12.62-3.82,1.53,3.82-13,4.2c-.77,0-1.15,1.15-.38,1.53l7.65,10.7-3.06,2.3-8.03-10.71c-.38-.76-1.15-.76-1.53,0l-8.03,10.71-3.06-2.3,7.65-10.7c.77-.38.38-1.53-.38-1.53l-13-4.2,1.53-3.82,12.62,3.82c.76.38,1.53,0,1.53-.77v-13.38h4.21v13.38c0,.77.38,1.15,1.15.77Z",
  "M709.17,27.15l11.85-3.82,1.53,4.97-11.85,3.82c-1.15.38-1.53,1.53-.77,2.3l7.27,9.94-4.21,3.06-7.26-9.94c-.38-1.15-1.91-1.15-2.29,0l-7.27,9.94-4.21-3.06,7.27-9.94c.76-.77.38-1.91-.77-2.3l-11.85-3.82,1.53-4.97,11.85,3.82c1.15.38,2.29-.38,2.29-1.15v-12.62h4.97v12.62c0,.77.76,1.53,1.91,1.15Z",
  "M940.46,26.38l10.32-3.44,1.53,5.35-10.32,3.44c-1.91.77-2.29,2.68-1.15,4.2l6.12,8.8-4.59,3.06-6.12-8.41c-1.15-1.91-3.44-1.91-4.59,0l-6.12,8.41-4.59-3.06,6.12-8.8c1.15-1.53.77-3.44-1.15-4.2l-10.32-3.44,1.53-5.35,10.32,3.44c1.91.38,3.82-.77,3.82-2.29v-11.09h5.74v11.09c0,1.53,1.53,2.68,3.44,2.29Z",
  "M1171.36,25.23l8.79-2.68,2.29,6.12-8.79,2.67c-2.68.77-3.82,3.83-2.29,5.74l5.73,7.65-5.35,3.82-5.35-7.65c-1.53-1.91-4.59-1.91-6.12,0l-5.35,7.65-5.35-3.82,5.73-7.65c1.53-1.91.38-4.97-2.29-5.74l-8.79-2.67,2.29-6.12,8.79,2.68c2.29,1.15,4.97-.77,4.97-3.44v-9.17h6.12v9.17c0,2.68,2.68,4.59,4.97,3.44Z",
  "M1402.65,24.47l7.27-2.29,2.29,6.5-7.27,2.29c-3.44,1.15-4.59,4.97-2.68,7.65l4.59,6.5-5.73,3.82-4.21-6.12c-2.29-2.68-6.12-2.68-8.41,0l-4.21,6.12-5.73-3.82,4.59-6.5c1.91-2.68.76-6.5-2.68-7.65l-7.26-2.29,2.29-6.5,7.26,2.29c3.06,1.15,6.5-1.15,6.5-4.59v-7.65h6.88v7.65c0,3.44,3.44,5.73,6.5,4.59Z",
  "M1635.09,22.94l4.59-1.53,2.68,7.27-4.59,1.53c-4.59,1.53-6.5,6.88-3.82,11.09l3.06,3.82-6.5,4.21-2.68-3.83c-2.68-3.82-8.41-3.82-11.47,0l-2.68,3.83-6.12-4.21,2.68-3.82c2.68-4.2,1.15-9.56-3.44-11.09l-4.59-1.53,2.29-7.27,4.59,1.53c4.59,1.53,9.17-1.91,9.17-6.5v-4.97h7.65v4.97c0,4.58,4.97,8.03,9.18,6.5Z",
  "M1867.53,21.79l1.91-.77,2.68,8.03-1.91.77c-5.73,1.91-8.03,8.79-4.59,14.15l1.15,1.15-6.88,4.97-1.15-1.53c-3.44-4.97-11.09-4.97-14.53,0l-1.15,1.53-6.88-4.97,1.15-1.15c3.44-5.35,1.15-12.23-4.59-14.15l-1.91-.77,2.68-8.03,1.91.77c5.73,1.91,11.85-2.68,11.85-8.79v-1.91h8.41v1.91c0,6.12,6.12,10.7,11.85,8.79Z",
  "M2051.79,21.03l16.06-5.73,1.15-.38.77-.77,10.32-13.76.38-.38,1.15.38,10.32,13.76.76.77,1.15.38,16.06,5.73,1.15,1.53-10.32,13.77-.38,1.53-.38,1.15v16.82l-.38.77-.77.77-16.82-5.73h-2.29l-16.82,5.73-.77-.77-.38-.77v-16.82l-.38-1.15-.38-1.53-10.32-13.77,1.15-1.53Z"];
function parsePath(d) {
  const t = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [];
  let i = 0, cmd = "", x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null;
  const out = [], num = () => parseFloat(t[i++]), isN = () => i < t.length && !/[a-zA-Z]/.test(t[i]);
  while (i < t.length) {
    if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
    do {
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      if (C === "Z") { out.push({ c: "Z" }); x = sx; y = sy; lc = lq = null; break; }
      if (C === "M") { let a = num(), b = num(); if (rel) { a += x; b += y; } x = sx = a; y = sy = b; out.push({ c: "M", p: [x, y] }); cmd = rel ? "l" : "L"; lc = lq = null; }
      else if (C === "L") { let a = num(), b = num(); if (rel) { a += x; b += y; } x = a; y = b; out.push({ c: "L", p: [x, y] }); lc = lq = null; }
      else if (C === "H") { let a = num(); if (rel) a += x; x = a; out.push({ c: "L", p: [x, y] }); lc = lq = null; }
      else if (C === "V") { let b = num(); if (rel) b += y; y = b; out.push({ c: "L", p: [x, y] }); lc = lq = null; }
      else if (C === "C") { const a = [num(), num(), num(), num(), num(), num()]; if (rel) for (let k = 0; k < 6; k += 2) { a[k] += x; a[k + 1] += y; } out.push({ c: "C", p: a }); lc = [a[2], a[3]]; x = a[4]; y = a[5]; lq = null; }
      else if (C === "S") { const a = [num(), num(), num(), num()]; if (rel) for (let k = 0; k < 4; k += 2) { a[k] += x; a[k + 1] += y; } const c1 = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y]; out.push({ c: "C", p: [c1[0], c1[1], a[0], a[1], a[2], a[3]] }); lc = [a[0], a[1]]; x = a[2]; y = a[3]; lq = null; }
      else if (C === "Q") { const a = [num(), num(), num(), num()]; if (rel) for (let k = 0; k < 4; k += 2) { a[k] += x; a[k + 1] += y; } out.push({ c: "Q", p: a }); lq = [a[0], a[1]]; x = a[2]; y = a[3]; lc = null; }
      else if (C === "T") { let a = num(), b = num(); if (rel) { a += x; b += y; } const q = lq ? [2 * x - lq[0], 2 * y - lq[1]] : [x, y]; out.push({ c: "Q", p: [q[0], q[1], a, b] }); lq = q; x = a; y = b; lc = null; }
      else if (C === "A") { const a = [num(), num(), num(), num(), num(), num(), num()]; let ex = a[5], ey = a[6]; if (rel) { ex += x; ey += y; } x = ex; y = ey; out.push({ c: "L", p: [x, y] }); lc = lq = null; }
      else { i++; break; }
    } while (isN());
  }
  return out;
}
function normGlyph(d) {
  const segs = parsePath(d);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const g of segs) if (g.p) { const px = g.p[g.p.length - 2], py = g.p[g.p.length - 1]; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
  // stella regolare a cinque punte: punta in alto, gambe a cos(36) del raggio sotto il centro
  const Rr = (y1 - y0) / (1 + Math.cos(36 * DEG)), cx = (x0 + x1) / 2, cy = y0 + Rr, k = 1 / Rr;
  const f = v => (Math.round(v * 10000) / 10000).toString(), P = (px, py) => f((px - cx) * k) + " " + f((py - cy) * k);
  let o = "";
  for (const g of segs) {
    const q = g.p;
    if (g.c === "Z") o += "Z";
    else if (g.c === "C") o += "C" + P(q[0], q[1]) + " " + P(q[2], q[3]) + " " + P(q[4], q[5]);
    else if (g.c === "Q") o += "Q" + P(q[0], q[1]) + " " + P(q[2], q[3]);
    else o += g.c + P(q[0], q[1]);
  }
  return { d: o, x0 };
}
let GLY = [];
function setGlyphs(list) {
  const g = list.map(normGlyph).sort((a, b) => a.x0 - b.x0);
  GLY = g.map((o, i) => ({ d: o.d, p: new Path2D(o.d), k: "g" + i }));
}
setGlyphs(GLYPH_SVG);
const shape = w => GLY[Math.round(clamp(w) * (GLY.length - 1))];
let F = null; // {hop, n, dur, rms, bands(Float32Array n*NB), cen, onset(Uint8Array)}
const NB = 16;
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k, b = a + len / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
function pct(arr, p) { const s = Float32Array.from(arr).sort(); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; }
async function analyse(buf, onProgress) {
  const sr = buf.sampleRate, ch = buf.numberOfChannels, len = buf.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < ch; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) mono[i] += d[i] / ch; }
  const hop = Math.round(sr * 0.02), N = 1024, n = Math.max(1, Math.floor(len / hop));
  const rms = new Float32Array(n), cen = new Float32Array(n), flux = new Float32Array(n), bands = new Float32Array(n * NB);
  const win = new Float32Array(N); for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1));
  const edges = []; const fLo = 70, fHi = Math.min(8000, sr / 2 - 1);
  for (let b = 0; b <= NB; b++) edges.push(Math.max(1, Math.round(fLo * Math.pow(fHi / fLo, b / NB) / sr * N)));
  const re = new Float32Array(N), im = new Float32Array(N); let prev = new Float32Array(N / 2), mag = new Float32Array(N / 2);
  for (let f = 0; f < n; f++) {
    const s0 = f * hop; let sum = 0;
    for (let i = 0; i < N; i++) { const v = mono[s0 + i - (N >> 1)] || 0; re[i] = v * win[i]; im[i] = 0; sum += v * v; }
    rms[f] = Math.sqrt(sum / N);
    fft(re, im);
    let fl = 0, ws = 0, ms = 0;
    for (let k = 1; k < N / 2; k++) { const m = Math.hypot(re[k], im[k]); mag[k] = m; const dlt = m - prev[k]; if (dlt > 0) fl += dlt; ws += k * m; ms += m; }
    flux[f] = fl; cen[f] = ms > 0 ? ws / ms / (N / 2) : 0;
    for (let b = 0; b < NB; b++) { let s = 0; for (let k = edges[b]; k < Math.max(edges[b] + 1, edges[b + 1]); k++) s += mag[k] || 0; bands[f * NB + b] = s / Math.max(1, edges[b + 1] - edges[b]); }
    const t = prev; prev = mag; mag = t;
    if (f % 1500 === 0) { onProgress && onProgress(f / n); await new Promise(r => setTimeout(r, 0)); }
  }
  return finish({ hop: hop / sr, n, dur: len / sr, rms, cen, flux, bands });
}
// normalizza: il fruscio del nastro (percentile basso) va a zero, la voce forte (percentile alto) a uno
function finish(o) {
  const lo = pct(o.rms, 0.12), hi = Math.max(lo + 1e-6, pct(o.rms, 0.97));
  for (let i = 0; i < o.n; i++) o.rms[i] = clamp((o.rms[i] - lo) / (hi - lo), 0, 1.4);
  for (let b = 0; b < NB; b++) {
    const col = new Float32Array(o.n); for (let i = 0; i < o.n; i++) col[i] = o.bands[i * NB + b];
    const bl = pct(col, 0.15), bh = Math.max(bl + 1e-9, pct(col, 0.97));
    for (let i = 0; i < o.n; i++) o.bands[i * NB + b] = clamp((o.bands[i * NB + b] - bl) / (bh - bl), 0, 1.4);
  }
  const cl = pct(o.cen, 0.1), ch = Math.max(cl + 1e-6, pct(o.cen, 0.9));
  for (let i = 0; i < o.n; i++) o.cen[i] = clamp((o.cen[i] - cl) / (ch - cl));
  const fh = Math.max(1e-9, pct(o.flux, 0.97)); o.onset = new Uint8Array(o.n);
  let last = -99;
  for (let i = 2; i < o.n - 1; i++) {
    const v = o.flux[i] / fh; let m = 0; for (let k = Math.max(0, i - 8); k < i; k++) m += o.flux[k] / fh; m /= 8;
    if (v > 0.35 && v > m * 1.6 && v >= o.flux[i - 1] / fh && v >= o.flux[i + 1] / fh && o.rms[i] > 0.08 && (i - last) * o.hop > 0.12) { o.onset[i] = 1; last = i; }
  }
  o.int = intensityOf(o);
  return o;
}
// Intensità: quanto la musica «spinge». Volume medio su ~1,2 s, piu' una spinta quando il suono sta salendo
// (crescendo). Normalizzata sulla traccia: le parti tranquille vanno verso 0 (Thin), le piu' piene verso 1 (Pieno).
function intensityOf(o) {
  const n = o.n, hw = Math.max(1, Math.round(0.6 / o.hop)), back = Math.max(1, Math.round(1.5 / o.hop));
  const cs = new Float64Array(n + 1); for (let i = 0; i < n; i++) cs[i + 1] = cs[i] + o.rms[i];
  const loud = new Float32Array(n);
  for (let i = 0; i < n; i++) { const a = Math.max(0, i - hw), b = Math.min(n, i + hw + 1); loud[i] = (cs[b] - cs[a]) / (b - a); }
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) raw[i] = loud[i] + 0.9 * Math.max(0, loud[i] - loud[Math.max(0, i - back)]);
  const lo = pct(raw, 0.06), hi = Math.max(lo + 1e-6, pct(raw, 0.96)), out = new Float32Array(n);
  for (let i = 0; i < n; i++) { const u = clamp((raw[i] - lo) / (hi - lo)); out[i] = u * u * (3 - 2 * u); }
  return out;
}
const S = { sides: 8, signs: 3, size: 1.0, weight: 6 / 9, voice: 0.7, deform: 0.55, motion: 0.4, outline: "libero", bg: "nero", trail: 0.2, glow: 0.08, wmode: "musica", echo: 0, gain: 1.1, gate: 0.12, smooth: 0.6, aspect: 1 };
const COL = () => S.bg === "nero" ? { bg: "#000000", fg: "#ffffff" } : { bg: "#ffffff", fg: "#000000" };
let PLAYING = true;
const idx = t => F ? clamp(Math.floor(t / F.hop), 0, F.n - 1) : 0;
const level = v => { v = v * S.gain; return v <= S.gate ? 0 : clamp((v - S.gate) / (1 - S.gate)); };
function avg(arr, t, span, stride = 1, off = 0) { const a = idx(t - span / 2), b = Math.max(a + 1, idx(t + span / 2)); let s = 0; for (let i = a; i < b; i++) s += arr[i * stride + off]; return s / (b - a); }
let env = 0, cenS = 0.5, rotAcc = 0, phase = 0, inten = 0.3, wStep = 3;
// Il caleidoscopio: i glifi stanno su anelli dentro uno spicchio (da 0 a 180/n gradi) e vengono riflessi tutto intorno.
// Ogni anello ascolta una fascia della voce; gli anelli si alternano tra glifi pesanti e leggeri, e girano in versi opposti.
function build(W, H, t, dt) {
  const live = F ? level(F.rms[idx(t)]) : 0, k = 1 - S.smooth * 0.92;
  env += (live - env) * (live > env ? Math.min(1, k * 2.2) : k * 0.6);
  cenS += ((F ? F.cen[idx(t)] : 0.5) - cenS) * 0.08;
  // intensita': sale in fretta (0,25 s), scende piano (0,8 s); il peso cambia a scatti di un glifo, con isteresi
  const it0 = F && F.int ? F.int[idx(t)] : 0.3;
  inten += (it0 - inten) * Math.min(1, dt / (it0 > inten ? 0.25 : 0.8));
  const auto = S.wmode !== "fisso", NW = GLY.length - 1;
  if (auto) { const tgt = clamp(inten * 1.1) * NW; if (Math.abs(tgt - wStep) > 0.7) wStep = Math.round(tgt); }
  const wAll = auto ? wStep / NW : S.weight, I = auto ? inten : 0.6;
  // nelle parti tranquille tutto rallenta e si calma; quando la musica sale i segni si allargano e si muovono
  const calm = 0.25 + 0.75 * I, def = S.deform * calm;
  if (PLAYING) { rotAcc += (cenS - 0.45) * dt * 0.6 * S.motion * calm; phase += dt * S.motion * (0.1 + 1.1 * env) * calm; }
  const n = S.sides, sl = Math.PI / n, M = S.signs, vk = S.voice;
  const R = S.outline === "schermo" ? Math.hypot(W, H) / 2 : Math.min(W, H) / 2 * 0.9;
  const vl = F ? level(avg(F.bands, t, 0.12, NB, 2)) : 0, vh = F ? level(avg(F.bands, t, 0.12, NB, 11)) : 0;
  const sx = Math.max(0.4, 1 + def * (vl * 1.3 - 0.35)), sy = Math.max(0.4, 1 + def * (vh * 1.3 - 0.35));
  const items = [];
  for (let j = 0; j < M; j++) {
    const f = (j + 0.5) / M, b = Math.min(NB - 1, Math.floor(f * NB)), tt = t - f * 0.35;
    const v = F && tt >= 0 ? level(avg(F.bands, tt, 0.3, NB, b)) : 0, drive = lerp(0.55, lerp(I, v, 0.35), vk);
    const rho = R * (0.12 + 0.72 * f) * (1 + 0.25 * S.motion * Math.sin(phase * 0.7 + j * 1.9)) * (1 + 0.22 * vk * (v - 0.4));
    // i glifi stanno vicino ai bordi dello spicchio: si fondono con il proprio riflesso e fanno forme nuove
    const c = 1 + (j % 2), el = 1 + 0.9 * def * (j % 2 ? 1 : 0.45);
    for (let i = 0; i < c; i++) {
      const sway = Math.sin(phase * 0.9 + j * 2.1 + i * 1.3);
      const phi = c === 1 ? sl * (0.5 + 0.5 * def * sway) : sl * (0.12 + 0.76 * i + 0.25 * def * sway);
      const r = R * (0.34 - 0.13 * f) * S.size * (0.3 + 0.7 * drive) * (c > 1 ? 0.8 : 1) * (auto ? 1.1 - 0.5 * I : 1);
      if (r < 0.5) continue;
      items.push({ x: Math.cos(phi) * rho, y: Math.sin(phi) * rho, r, a: phi + Math.PI / 2 + phase * 0.5 * (j % 2 ? 1 : -1) + rotAcc + i * 36 * DEG, w: auto ? wAll : clamp((j % 2 ? wAll * 0.6 : wAll) * (1 - 0.5 * vk) + 0.5 * vk * drive * 1.3), sx: sx / Math.sqrt(el), sy: sy * el, k: def * 0.7 * (cenS - 0.5) * (j % 2 ? 1 : -1) });
    }
  }
  const dc = lerp(0.6, clamp(env), vk);
  items.push({ x: 0, y: 0, r: R * 0.16 * S.size * (0.3 + 0.7 * dc) * (auto ? 1.1 - 0.5 * I : 1), a: rotAcc - phase * 0.3, w: auto ? wAll : clamp(S.weight * (1 - 0.5 * vk) + 0.5 * vk * dc * 1.4), sx, sy, k: 0 });
  return { W, H, R, n, outline: S.outline, echo: S.echo, ...COL(), items };
}
function slicePts(sc, sl, big) {
  const o = sc.W * 0.0025, A = [-o * (1 + Math.cos(sl)) / Math.sin(sl), -o];
  if (sc.outline === "poligono") {
    const V = [sc.R, 0], E = [sc.R * Math.cos(sl) * Math.cos(sl), sc.R * Math.cos(sl) * Math.sin(sl)], dx = E[0] - V[0], dy = E[1] - V[1];
    return { poly: [A, [V[0] - dx * 0.02, V[1] - dy * 0.02], [E[0] + dx * 0.02, E[1] + dy * 0.02]] };
  }
  const r = sc.outline === "cerchio" ? sc.R : big;
  return { A, arc: r, d: o / r };
}
const sliceRot = (s, sl) => -Math.PI / 2 + (s % 2 ? (s + 1) * sl : s * sl);
function draw(ctx, sc, scale = 1, bgAlpha = 1) {
  ctx.save(); ctx.scale(scale, scale);
  ctx.globalAlpha = bgAlpha; ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, sc.W, sc.H); ctx.globalAlpha = 1;
  const elw = Math.min(sc.W, sc.H) * 0.004; ctx.strokeStyle = sc.fg; ctx.lineJoin = "round";
  const sl = Math.PI / sc.n, big = Math.hypot(sc.W, sc.H), sp = slicePts(sc, sl, big);
  ctx.fillStyle = sc.fg;
  for (let s = 0; s < 2 * sc.n; s++) {
    ctx.save(); ctx.translate(sc.W / 2, sc.H / 2); ctx.rotate(sliceRot(s, sl)); if (s % 2) ctx.scale(1, -1);
    ctx.beginPath();
    if (sp.poly) { ctx.moveTo(...sp.poly[0]); ctx.lineTo(...sp.poly[1]); ctx.lineTo(...sp.poly[2]); }
    else { ctx.moveTo(...sp.A); ctx.arc(0, 0, sp.arc, -sp.d, sl + sp.d); }
    ctx.closePath(); ctx.clip();
    for (const it of sc.items) {
      const sh = shape(it.w), ds = (it.sx + it.sy) / 2;
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.a); ctx.transform(it.sx, 0, it.k, it.sy, 0, 0);
      ctx.save(); ctx.scale(it.r, it.r); ctx.fill(sh.p); ctx.restore();
      for (let e = 1; e <= (sc.echo || 0); e++) { const rr = it.r * (1 + 0.2 * e); ctx.save(); ctx.scale(rr, rr); ctx.lineWidth = elw / (rr * ds); ctx.stroke(sh.p); ctx.restore(); }
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}
global.Caleido = {
  S, WEIGHTS, NB, analyse, draw,
  setFeatures(f) { F = f; }, features() { return F; },
  reset() { env = 0; cenS = 0.5; rotAcc = 0; phase = 0; inten = 0.3; wStep = 3; },
  state() { return { env, inten, wStep, phase, rotAcc }; },
  build(W, H, t, dt, playing) { PLAYING = playing !== false; return build(W, H, t, dt); },
};
})(typeof window !== "undefined" ? window : globalThis);
