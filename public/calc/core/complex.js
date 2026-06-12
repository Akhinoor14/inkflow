// calc/core/complex.js
// ════════════════════════════════════════════════════════════
//  COMPLEX NUMBER MODULE
//  Covers: arithmetic, powers, roots, trig/hyp functions,
//          polar form, Euler's formula, complex polynomials,
//          Möbius transform
// ════════════════════════════════════════════════════════════
'use strict';

const Complex = (() => {

  const EPS = 1e-14;

  // ── Constructor ───────────────────────────────────────────
  function c(re, im = 0) { return { re, im }; }
  function fromPolar(r, theta) { return { re: r*Math.cos(theta), im: r*Math.sin(theta) }; }
  function fromAngle(theta) { return fromPolar(1, theta); } // unit circle

  // ── Properties ────────────────────────────────────────────
  function modulus(z)   { return Math.sqrt(z.re*z.re + z.im*z.im); }
  function argument(z)  { return Math.atan2(z.im, z.re); }
  function conjugate(z) { return c(z.re, -z.im); }
  function toPolar(z)   { return { r: modulus(z), theta: argument(z) }; }

  // ── Arithmetic ────────────────────────────────────────────
  function add(a, b) { return c(a.re+b.re, a.im+b.im); }
  function sub(a, b) { return c(a.re-b.re, a.im-b.im); }
  function mul(a, b) { return c(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re); }
  function div(a, b) {
    const denom = b.re*b.re + b.im*b.im;
    if (denom < EPS) return c(Infinity, Infinity);
    return c((a.re*b.re + a.im*b.im)/denom, (a.im*b.re - a.re*b.im)/denom);
  }
  function neg(z) { return c(-z.re, -z.im); }
  function recip(z) { return div(c(1), z); }
  function scalarMul(z, k) { return c(z.re*k, z.im*k); }

  // ── Powers & Roots ────────────────────────────────────────
  function pow(z, n) {
    // z^n = r^n · e^(inθ)
    const r = modulus(z), theta = argument(z);
    const rn = Math.pow(r, n);
    return fromPolar(rn, n * theta);
  }
  function sqrt(z) {
    const r = modulus(z);
    const sign = z.im < 0 ? -1 : 1;
    return c(Math.sqrt((r + z.re)/2), sign * Math.sqrt((r - z.re)/2));
  }
  function cbrt(z) { return pow(z, 1/3); }

  // n-th roots of z: returns array of n complex numbers
  function nthRoots(z, n) {
    const { r, theta } = toPolar(z);
    const rootR = Math.pow(r, 1/n);
    return Array.from({length: n}, (_, k) =>
      fromPolar(rootR, (theta + 2*Math.PI*k) / n)
    );
  }

  // ── Exponential & Logarithm ───────────────────────────────
  function exp(z) {
    // e^(a+bi) = e^a · (cos(b) + i·sin(b))
    return fromPolar(Math.exp(z.re), z.im);
  }
  function log(z) {
    // ln(z) = ln|z| + i·arg(z)
    return c(Math.log(modulus(z)), argument(z));
  }
  function log10(z) { return div(log(z), c(Math.log(10))); }
  function log2(z)  { return div(log(z), c(Math.log(2))); }
  function logBase(base, z) { return div(log(z), c(Math.log(base))); }

  // ── Trigonometric ─────────────────────────────────────────
  function sin(z) {
    // sin(a+bi) = sin(a)cosh(b) + i·cos(a)sinh(b)
    return c(Math.sin(z.re)*Math.cosh(z.im), Math.cos(z.re)*Math.sinh(z.im));
  }
  function cos(z) {
    return c(Math.cos(z.re)*Math.cosh(z.im), -Math.sin(z.re)*Math.sinh(z.im));
  }
  function tan(z) { return div(sin(z), cos(z)); }
  function cot(z) { return div(cos(z), sin(z)); }
  function sec(z) { return recip(cos(z)); }
  function csc(z) { return recip(sin(z)); }

  // Inverse trig
  function asin(z) {
    // asin(z) = -i·ln(iz + sqrt(1-z²))
    const iz = mul(c(0,1), z);
    const sq = sqrt(sub(c(1), mul(z, z)));
    return mul(c(0,-1), log(add(iz, sq)));
  }
  function acos(z) {
    // acos(z) = -i·ln(z + i·sqrt(1-z²))
    const sq = mul(c(0,1), sqrt(sub(c(1), mul(z, z))));
    return mul(c(0,-1), log(add(z, sq)));
  }
  function atan(z) {
    // atan(z) = i/2·ln((1-iz)/(1+iz))
    const iz = mul(c(0,1), z);
    return mul(c(0,0.5), log(div(sub(c(1), iz), add(c(1), iz))));
  }

  // ── Hyperbolic ────────────────────────────────────────────
  function sinh(z) {
    return c(Math.sinh(z.re)*Math.cos(z.im), Math.cosh(z.re)*Math.sin(z.im));
  }
  function cosh(z) {
    return c(Math.cosh(z.re)*Math.cos(z.im), Math.sinh(z.re)*Math.sin(z.im));
  }
  function tanh(z) { return div(sinh(z), cosh(z)); }
  function asinh(z) { return log(add(z, sqrt(add(mul(z,z), c(1))))); }
  function acosh(z) { return log(add(z, sqrt(sub(mul(z,z), c(1))))); }
  function atanh(z) { return scalarMul(log(div(add(c(1),z), sub(c(1),z))), 0.5); }

  // ── Euler's formula ───────────────────────────────────────
  function euler(theta) { return fromPolar(1, theta); }  // e^(iθ) = cos(θ)+i·sin(θ)

  // ── Comparison ────────────────────────────────────────────
  function equals(a, b, tol = 1e-10) {
    return Math.abs(a.re - b.re) < tol && Math.abs(a.im - b.im) < tol;
  }
  function isReal(z, tol = 1e-12)    { return Math.abs(z.im) < tol; }
  function isImag(z, tol = 1e-12)    { return Math.abs(z.re) < tol; }
  function isZero(z, tol = 1e-12)    { return modulus(z) < tol; }
  function isInfinite(z)             { return !isFinite(z.re) || !isFinite(z.im); }

  // ── Formatting ────────────────────────────────────────────
  function toString(z, decimals = 6) {
    const re = parseFloat(z.re.toPrecision(decimals));
    const im = parseFloat(Math.abs(z.im).toPrecision(decimals));
    if (Math.abs(z.im) < EPS) return String(re);
    if (Math.abs(z.re) < EPS) return `${im === 1 ? '' : im}i`;
    const sign = z.im < 0 ? ' - ' : ' + ';
    return `${re}${sign}${im === 1 ? '' : im}i`;
  }

  // ── Complex arithmetic on polar form ─────────────────────
  function mulPolar(r1, t1, r2, t2) { return { r: r1*r2, theta: t1+t2 }; }
  function divPolar(r1, t1, r2, t2) { return { r: r2===0?Infinity:r1/r2, theta: t1-t2 }; }
  function powPolar(r, t, n)        { return { r: Math.pow(r,n), theta: t*n }; }

  // ── Roots of complex polynomial ───────────────────────────
  // Uses Durand-Kerner method
  function polyRoots(coeffs) {
    const n = coeffs.length - 1; // degree
    if (n === 0) return [];
    // Normalize
    const a = coeffs[0];
    const p = coeffs.map(c_coef => c(c_coef / a, 0));

    // Initial guesses: equally spaced on circle of radius 1
    let roots = Array.from({length: n}, (_, k) =>
      fromPolar(1, 2*Math.PI*k/n + 0.1)
    );

    const evalPoly = (z) => p.reduce((acc, coef) => add(mul(acc, z), coef), c(0));

    for (let iter = 0; iter < 500; iter++) {
      const newRoots = roots.map((zi, i) => {
        const num = evalPoly(zi);
        const den = roots.reduce((prod, zj, j) => {
          return i === j ? prod : mul(prod, sub(zi, zj));
        }, c(1));
        return sub(zi, div(num, den));
      });
      const maxChange = Math.max(...newRoots.map((z, i) => modulus(sub(z, roots[i]))));
      roots = newRoots;
      if (maxChange < 1e-12) break;
    }
    return roots;
  }

  // ── Möbius Transform: f(z) = (az+b)/(cz+d) ──────────────
  function mobius(z, a, b, cc, d) {
    const num = add(mul(a, z), b);
    const den = add(mul(cc, z), d);
    return div(num, den);
  }

  // ── Public API ────────────────────────────────────────────
  return {
    c, fromPolar, fromAngle,
    modulus, argument, conjugate, toPolar,
    add, sub, mul, div, neg, recip, scalarMul,
    pow, sqrt, cbrt, nthRoots,
    exp, log, log10, log2, logBase,
    sin, cos, tan, cot, sec, csc,
    asin, acos, atan,
    sinh, cosh, tanh, asinh, acosh, atanh,
    euler,
    equals, isReal, isImag, isZero, isInfinite,
    toString,
    mulPolar, divPolar, powPolar,
    polyRoots,
    mobius,
  };

})();

if (typeof module !== 'undefined') module.exports = Complex;
else window.Complex = Complex;
