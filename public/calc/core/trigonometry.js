// calc/core/trigonometry.js
// ════════════════════════════════════════════════════════════
//  TRIGONOMETRY MODULE
//  Covers: sin/cos/tan, inverses, hyperbolic, all angle modes,
//          angle conversions, triangle solvers, vector ops,
//          polar↔cartesian, DMS conversion
// ════════════════════════════════════════════════════════════
'use strict';

const Trigonometry = (() => {

  // ── Angle mode conversion ─────────────────────────────────
  let _mode = 'DEG'; // 'DEG' | 'RAD' | 'GRAD'

  function setMode(mode) { _mode = mode.toUpperCase(); }
  function getMode() { return _mode; }

  function toRad(v) {
    if (_mode === 'RAD')  return v;
    if (_mode === 'GRAD') return v * Math.PI / 200;
    return v * Math.PI / 180;           // DEG
  }
  function fromRad(v) {
    if (_mode === 'RAD')  return v;
    if (_mode === 'GRAD') return v * 200 / Math.PI;
    return v * 180 / Math.PI;
  }

  // Direct angle unit converters (mode-independent)
  function degToRad(d) { return d * Math.PI / 180; }
  function radToDeg(r) { return r * 180 / Math.PI; }
  function gradToDeg(g) { return g * 0.9; }
  function degToGrad(d) { return d / 0.9; }
  function radToGrad(r) { return r * 200 / Math.PI; }
  function gradToRad(g) { return g * Math.PI / 200; }

  // ── DMS ↔ Decimal ─────────────────────────────────────────
  function dmsToDecimal(deg, min, sec) {
    return deg + min / 60 + sec / 3600;
  }
  function decimalToDMS(decimal) {
    const neg = decimal < 0;
    decimal = Math.abs(decimal);
    const d = Math.floor(decimal);
    const mf = (decimal - d) * 60;
    const m  = Math.floor(mf);
    const s  = parseFloat(((mf - m) * 60).toFixed(6));
    return { deg: neg ? -d : d, min: m, sec: s,
             str: `${neg?'-':''}${d}° ${m}' ${s}"` };
  }

  // ── Primary trig functions ────────────────────────────────
  function sin(v)  { return clampTiny(Math.sin(toRad(v))); }
  function cos(v)  { return clampTiny(Math.cos(toRad(v))); }
  function tan(v)  {
    const r = toRad(v);
    // Check for undefined (90°, 270°, …)
    const c = Math.cos(r);
    if (Math.abs(c) < 1e-14) return v >= 0 ? Infinity : -Infinity;
    return clampTiny(Math.sin(r) / c);
  }
  function cot(v)  {
    const s = Math.sin(toRad(v));
    if (Math.abs(s) < 1e-14) return v >= 0 ? Infinity : -Infinity;
    return clampTiny(Math.cos(toRad(v)) / s);
  }
  function sec(v)  {
    const c = cos(v);
    return c === 0 ? Infinity : 1 / c;
  }
  function csc(v)  {
    const s = sin(v);
    return s === 0 ? Infinity : 1 / s;
  }

  // ── Inverse trig ─────────────────────────────────────────
  function asin(v) {
    if (v < -1 || v > 1) return NaN;
    return fromRad(Math.asin(v));
  }
  function acos(v) {
    if (v < -1 || v > 1) return NaN;
    return fromRad(Math.acos(v));
  }
  function atan(v)      { return fromRad(Math.atan(v)); }
  function atan2(y, x)  { return fromRad(Math.atan2(y, x)); }
  function acot(v)      { return fromRad(Math.PI / 2 - Math.atan(v)); }

  // ── Hyperbolic ────────────────────────────────────────────
  function sinh(v)  { return Math.sinh(v); }
  function cosh(v)  { return Math.cosh(v); }
  function tanh(v)  { return Math.tanh(v); }
  function coth(v)  {
    const t = Math.tanh(v);
    return t === 0 ? Infinity : 1 / t;
  }
  function sech(v)  { return 1 / Math.cosh(v); }
  function csch(v)  { return v === 0 ? Infinity : 1 / Math.sinh(v); }

  // ── Inverse hyperbolic ────────────────────────────────────
  function asinh(v) { return Math.asinh(v); }
  function acosh(v) { return v < 1 ? NaN : Math.acosh(v); }
  function atanh(v) { return Math.abs(v) >= 1 ? NaN : Math.atanh(v); }

  // ── Sinc / Versine / Haversine ────────────────────────────
  function sinc(v) {
    if (v === 0) return 1;
    const pv = Math.PI * v;
    return Math.sin(pv) / pv;
  }
  function versin(v)   { return 1 - cos(v); }
  function coversin(v) { return 1 - sin(v); }
  function haversin(v) { return (1 - cos(v)) / 2; }

  // ── Triangle solver ───────────────────────────────────────
  // Given any 3 known values (sides a,b,c, angles A,B,C in current mode)
  // Angle naming: A opposite to a, etc.
  function solveTriangle({ a, b, c, A, B, C }) {
    const known = { a, b, c, A, B, C };
    const get = k => known[k];
    const set = (k, v) => { known[k] = v; };

    // Ensure angles in DEG for internal calc, convert at end
    const toDeg = v => _mode === 'DEG' ? v : fromRad(v * Math.PI / 180);

    // Try all laws of sines / cosines
    let attempts = 0;
    while (attempts++ < 10) {
      // Law of sines: a/sin(A) = b/sin(B) = c/sin(C)
      const pairs = [['a','A'],['b','B'],['c','C']];
      for (const [side, angle] of pairs) {
        if (get(side) !== undefined && get(angle) !== undefined) {
          const ratio = get(side) / Math.sin(toRad(get(angle)));
          for (const [s2, a2] of pairs) {
            if (s2 !== side && get(s2) !== undefined && get(a2) === undefined)
              set(a2, fromRad(Math.asin(get(s2) / ratio)));
            if (a2 !== angle && get(a2) !== undefined && get(s2) === undefined)
              set(s2, Math.sin(toRad(get(a2))) * ratio);
          }
        }
      }

      // Angle sum: A + B + C = 180
      const angles = [get('A'), get('B'), get('C')];
      const knownAngles = angles.filter(v => v !== undefined);
      if (knownAngles.length === 2) {
        const sum = knownAngles.reduce((a, b) => a + b, 0);
        const missing = ['A','B','C'].find(k => get(k) === undefined);
        if (missing) set(missing, 180 - sum);
      }

      // Law of cosines: c² = a² + b² - 2ab·cos(C)
      const cosLaw = [['c','a','b','C'],['a','b','c','A'],['b','a','c','B']];
      for (const [c0, a0, b0, C0] of cosLaw) {
        const cv = get(c0), av = get(a0), bv = get(b0), Cv = get(C0);
        if (av !== undefined && bv !== undefined && Cv !== undefined && cv === undefined)
          set(c0, Math.sqrt(av*av + bv*bv - 2*av*bv*cos(Cv)));
        if (av !== undefined && bv !== undefined && cv !== undefined && Cv === undefined)
          set(C0, fromRad(Math.acos((av*av + bv*bv - cv*cv) / (2*av*bv))));
      }

      if (Object.values(known).every(v => v !== undefined)) break;
    }

    // Area and perimeter
    if (known.a !== undefined && known.b !== undefined && known.c !== undefined) {
      const s = (known.a + known.b + known.c) / 2;
      known.area = Math.sqrt(s * (s-known.a) * (s-known.b) * (s-known.c));
      known.perimeter = known.a + known.b + known.c;
      known.circumradius = known.a !== undefined && known.A !== undefined
        ? known.a / (2 * Math.sin(toRad(known.A))) : undefined;
      known.inradius = known.area !== undefined ? known.area / s : undefined;
    }

    return known;
  }

  // ── Great-circle distance (Haversine formula) ─────────────
  function haversineDistance(lat1, lon1, lat2, lon2, R = 6371000) {
    // inputs in degrees, output in meters
    const φ1 = degToRad(lat1), φ2 = degToRad(lat2);
    const Δφ = degToRad(lat2 - lat1);
    const Δλ = degToRad(lon2 - lon1);
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  // ── Polar ↔ Cartesian ─────────────────────────────────────
  function polarToCartesian(r, theta) {
    return { x: r * cos(theta), y: r * sin(theta) };
  }
  function cartesianToPolar(x, y) {
    return { r: Math.sqrt(x*x + y*y), theta: atan2(y, x) };
  }
  // Spherical ↔ Cartesian
  function sphericalToCartesian(r, theta, phi) {
    return {
      x: r * sin(phi) * cos(theta),
      y: r * sin(phi) * sin(theta),
      z: r * cos(phi),
    };
  }
  function cartesianToSpherical(x, y, z) {
    const r = Math.sqrt(x*x + y*y + z*z);
    return { r, theta: atan2(y, x), phi: r === 0 ? 0 : fromRad(Math.acos(z / r)) };
  }

  // ── Fourier helpers ───────────────────────────────────────
  function dft(signal) {
    const N = signal.length;
    const re = [], im = [];
    for (let k = 0; k < N; k++) {
      let sumRe = 0, sumIm = 0;
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        sumRe += signal[n] * Math.cos(angle);
        sumIm -= signal[n] * Math.sin(angle);
      }
      re.push(sumRe / N);
      im.push(sumIm / N);
    }
    return { re, im, magnitude: re.map((r, i) => Math.sqrt(r*r + im[i]*im[i])) };
  }

  // ── Utility ───────────────────────────────────────────────
  function clampTiny(v) {
    return Math.abs(v) < 1e-14 ? 0 : v;
  }
  function normalizeAngle(v) {
    // bring angle into [0, 360) for DEG, [0, 2π) for RAD, [0, 400) for GRAD
    const full = _mode === 'RAD' ? 2*Math.PI : _mode === 'GRAD' ? 400 : 360;
    return ((v % full) + full) % full;
  }

  // ── Public API ────────────────────────────────────────────
  return {
    setMode, getMode,
    toRad, fromRad,
    degToRad, radToDeg, gradToDeg, degToGrad, radToGrad, gradToRad,
    dmsToDecimal, decimalToDMS,
    sin, cos, tan, cot, sec, csc,
    asin, acos, atan, atan2, acot,
    sinh, cosh, tanh, coth, sech, csch,
    asinh, acosh, atanh,
    sinc, versin, coversin, haversin,
    solveTriangle,
    haversineDistance,
    polarToCartesian, cartesianToPolar,
    sphericalToCartesian, cartesianToSpherical,
    dft,
    normalizeAngle,
  };

})();

if (typeof module !== 'undefined') module.exports = Trigonometry;
else window.Trigonometry = Trigonometry;
