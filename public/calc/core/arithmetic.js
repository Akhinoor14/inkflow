// calc/core/arithmetic.js
// ════════════════════════════════════════════════════════════
//  ARITHMETIC MODULE
//  Covers: basic ops, integer division, modulo, percentage,
//          rounding modes, significant figures, scientific notation
// ════════════════════════════════════════════════════════════
'use strict';

const Arithmetic = (() => {

  // ── Basic safe operations ─────────────────────────────────
  function add(a, b) { return a + b; }
  function sub(a, b) { return a - b; }
  function mul(a, b) { return a * b; }
  function div(a, b) {
    if (b === 0) return a === 0 ? NaN : (a > 0 ? Infinity : -Infinity);
    return a / b;
  }
  function mod(a, b) {
    if (b === 0) return NaN;
    return ((a % b) + b) % b; // always positive modulo
  }
  function intDiv(a, b) {
    if (b === 0) return NaN;
    return Math.trunc(a / b);
  }
  function pow(base, exp) {
    if (base < 0 && !Number.isInteger(exp)) return NaN;
    return Math.pow(base, exp);
  }
  function percent(a, b) {
    // a% of b, or just a/100 if b not given
    return b !== undefined ? (a / 100) * b : a / 100;
  }
  function percentChange(from, to) {
    if (from === 0) return NaN;
    return ((to - from) / Math.abs(from)) * 100;
  }

  // ── Rounding ──────────────────────────────────────────────
  function roundTo(v, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round(v * f) / f;
  }
  function roundSigFigs(v, sig) {
    if (v === 0) return 0;
    const d = Math.ceil(Math.log10(Math.abs(v)));
    const f = Math.pow(10, sig - d);
    return Math.round(v * f) / f;
  }
  function floorTo(v, decimals) {
    const f = Math.pow(10, decimals);
    return Math.floor(v * f) / f;
  }
  function ceilTo(v, decimals) {
    const f = Math.pow(10, decimals);
    return Math.ceil(v * f) / f;
  }
  // Engineer's rounding (round half to even)
  function bankersRound(v, decimals = 0) {
    const f = Math.pow(10, decimals);
    const n = v * f;
    const fl = Math.floor(n);
    const diff = n - fl;
    if (diff < 0.5) return fl / f;
    if (diff > 0.5) return (fl + 1) / f;
    return (fl % 2 === 0 ? fl : fl + 1) / f;
  }

  // ── Number formatting ─────────────────────────────────────
  function toSciNotation(v, sig = 6) {
    if (!isFinite(v)) return String(v);
    return v.toExponential(sig - 1);
  }
  function toEngNotation(v, sig = 4) {
    // Engineering notation: exponent is multiple of 3
    if (v === 0) return '0';
    const exp = Math.floor(Math.log10(Math.abs(v)));
    const engExp = Math.floor(exp / 3) * 3;
    const mant = v / Math.pow(10, engExp);
    return `${roundSigFigs(mant, sig)}×10^${engExp}`;
  }
  const ENG_PREFIXES = {
    24:'Y', 21:'Z', 18:'E', 15:'P', 12:'T', 9:'G', 6:'M', 3:'k',
    0:'', '-3':'m', '-6':'μ', '-9':'n', '-12':'p', '-15':'f', '-18':'a',
  };
  function toSIPrefix(v, unit = '') {
    if (v === 0) return `0 ${unit}`;
    const exp = Math.floor(Math.log10(Math.abs(v)));
    const engExp = Math.floor(exp / 3) * 3;
    const clampedExp = Math.max(-18, Math.min(24, engExp));
    const prefix = ENG_PREFIXES[String(clampedExp)] ?? '';
    const mant = v / Math.pow(10, clampedExp);
    return `${roundSigFigs(mant, 4)} ${prefix}${unit}`;
  }

  // ── Integer operations ────────────────────────────────────
  function sign(v) { return Math.sign(v); }
  function abs(v)  { return Math.abs(v); }
  function reciprocal(v) { return v === 0 ? NaN : 1 / v; }

  // ── Number theory basics ──────────────────────────────────
  function isPrime(n) {
    n = Math.abs(Math.round(n));
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false;
    return true;
  }
  function nextPrime(n) {
    n = Math.ceil(n) + 1;
    while (!isPrime(n)) n++;
    return n;
  }
  function primeFactors(n) {
    n = Math.abs(Math.round(n));
    const factors = [];
    for (let d = 2; d * d <= n; d++) {
      while (n % d === 0) { factors.push(d); n = Math.trunc(n / d); }
    }
    if (n > 1) factors.push(n);
    return factors;
  }
  function gcd(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    while (b) { const t = b; b = a % b; a = t; }
    return a;
  }
  function lcm(a, b) {
    const g = gcd(a, b);
    return g === 0 ? 0 : Math.abs(a * b) / g;
  }

  // ── Fraction operations ───────────────────────────────────
  function toFraction(v, maxDenom = 10000) {
    if (!isFinite(v) || isNaN(v)) return null;
    if (Number.isInteger(v)) return { n: v, d: 1, str: String(v) };
    const neg = v < 0;
    v = Math.abs(v);
    let bestN = 0, bestD = 1, bestErr = Infinity;
    for (let d = 1; d <= maxDenom; d++) {
      const n = Math.round(v * d);
      const err = Math.abs(n / d - v);
      if (err < bestErr) { bestErr = err; bestN = n; bestD = d; }
      if (err < 1e-12) break;
    }
    const g = gcd(bestN, bestD);
    bestN /= g; bestD /= g;
    if (neg) bestN = -bestN;
    return { n: bestN, d: bestD, str: bestD === 1 ? String(bestN) : `${bestN}/${bestD}` };
  }
  function addFrac(n1, d1, n2, d2) {
    const d = lcm(d1, d2);
    return { n: n1 * (d / d1) + n2 * (d / d2), d };
  }
  function mulFrac(n1, d1, n2, d2) {
    const n = n1 * n2, d = d1 * d2, g = gcd(Math.abs(n), d);
    return { n: n / g, d: d / g };
  }

  // ── Ratio & Proportion ────────────────────────────────────
  function solveRatio(a, b, c) {
    // a:b = c:? → returns d
    if (b === 0) return NaN;
    return (c * b) / a;
  }
  function scaleValue(val, fromRange, toRange) {
    const [fMin, fMax] = fromRange;
    const [tMin, tMax] = toRange;
    return tMin + ((val - fMin) / (fMax - fMin)) * (tMax - tMin);
  }

  // ── Interpolation ─────────────────────────────────────────
  function linearInterp(x0, y0, x1, y1, x) {
    if (x1 === x0) return y0;
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  }

  // ── Public API ────────────────────────────────────────────
  return {
    add, sub, mul, div, mod, intDiv, pow, percent, percentChange,
    roundTo, roundSigFigs, floorTo, ceilTo, bankersRound,
    toSciNotation, toEngNotation, toSIPrefix,
    sign, abs, reciprocal,
    isPrime, nextPrime, primeFactors, gcd, lcm,
    toFraction, addFrac, mulFrac,
    solveRatio, scaleValue, linearInterp,
  };

})();

// Export for browser (global) and module systems
if (typeof module !== 'undefined') module.exports = Arithmetic;
else window.Arithmetic = Arithmetic;
