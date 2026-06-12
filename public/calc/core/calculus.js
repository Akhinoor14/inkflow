// calc/core/calculus.js
// ════════════════════════════════════════════════════════════
//  CALCULUS MODULE
//  Covers: numerical differentiation (multiple methods),
//          numerical integration (multiple rules),
//          summation / product, limits,
//          Taylor series, ODE solvers (Euler, RK4),
//          gradient / Hessian for multivariable
// ════════════════════════════════════════════════════════════
'use strict';

const Calculus = (() => {

  // ── Numerical Differentiation ─────────────────────────────

  // Forward difference — O(h)
  function derivForward(fn, x, h = 1e-6) {
    return (fn(x + h) - fn(x)) / h;
  }
  // Central difference — O(h²) — most accurate for smooth functions
  function deriv(fn, x, h = 1e-7) {
    return (fn(x + h) - fn(x - h)) / (2 * h);
  }
  // 5-point stencil — O(h⁴) — best accuracy
  function deriv5pt(fn, x, h = 1e-5) {
    return (-fn(x + 2*h) + 8*fn(x + h) - 8*fn(x - h) + fn(x - 2*h)) / (12 * h);
  }
  // Second derivative
  function deriv2(fn, x, h = 1e-5) {
    return (fn(x + h) - 2*fn(x) + fn(x - h)) / (h * h);
  }
  // Third derivative
  function deriv3(fn, x, h = 1e-4) {
    return (fn(x + 2*h) - 2*fn(x + h) + 2*fn(x - h) - fn(x - 2*h)) / (2 * h*h*h);
  }
  // nth derivative via Richardson extrapolation
  function derivN(fn, x, n = 1, h = 1e-4) {
    if (n === 0) return fn(x);
    if (n === 1) return deriv(fn, x, h);
    if (n === 2) return deriv2(fn, x, h);
    const g = xv => derivN(fn, xv, n-1, h);
    return deriv(g, x, h);
  }

  // ── Numerical Integration ─────────────────────────────────

  // Rectangle (midpoint) rule
  function integrateMidpoint(fn, a, b, n = 1000) {
    const h = (b - a) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) sum += fn(a + (i + 0.5) * h);
    return sum * h;
  }

  // Trapezoidal rule — O(h²)
  function integrateTrapezoid(fn, a, b, n = 1000) {
    const h = (b - a) / n;
    let sum = (fn(a) + fn(b)) / 2;
    for (let i = 1; i < n; i++) sum += fn(a + i * h);
    return sum * h;
  }

  // Simpson's 1/3 rule — O(h⁴) — default and best general-purpose
  function integrate(fn, a, b, n = 1000) {
    if (n % 2 !== 0) n++;
    const h = (b - a) / n;
    let sum = fn(a) + fn(b);
    for (let i = 1; i < n; i++) sum += fn(a + i * h) * (i % 2 === 0 ? 2 : 4);
    return (sum * h) / 3;
  }

  // Simpson's 3/8 rule
  function integrateSimp38(fn, a, b, n = 999) {
    n = Math.ceil(n / 3) * 3;
    const h = (b - a) / n;
    let sum = fn(a) + fn(b);
    for (let i = 1; i < n; i++) {
      sum += fn(a + i * h) * (i % 3 === 0 ? 2 : 3);
    }
    return (sum * h * 3) / 8;
  }

  // Gauss-Legendre 5-point quadrature (very accurate for smooth functions)
  function integrateGauss5(fn, a, b) {
    const nodes = [-0.9061798459,-0.5384693101, 0, 0.5384693101, 0.9061798459];
    const weights = [0.2369268851, 0.4786286705, 0.5688888889, 0.4786286705, 0.2369268851];
    const mid = (a + b) / 2, half = (b - a) / 2;
    return half * nodes.reduce((sum, xi, i) => sum + weights[i] * fn(mid + half * xi), 0);
  }

  // Adaptive Simpson's (automatic precision)
  function integrateAdaptive(fn, a, b, tol = 1e-8, depth = 0) {
    const mid = (a + b) / 2;
    const whole = integrateGauss5(fn, a, b);
    const left  = integrateGauss5(fn, a, mid);
    const right = integrateGauss5(fn, mid, b);
    if (depth > 20) return left + right;
    if (Math.abs(left + right - whole) < 15 * tol) return left + right;
    return integrateAdaptive(fn, a, mid, tol/2, depth+1) +
           integrateAdaptive(fn, mid, b, tol/2, depth+1);
  }

  // ── Summation & Product ───────────────────────────────────
  function summation(fn, from, to, step = 1) {
    if (Math.abs(to - from) > 1e6) return NaN; // safety
    let sum = 0;
    for (let k = from; k <= to; k += step) sum += fn(k);
    return sum;
  }
  function product(fn, from, to, step = 1) {
    if (Math.abs(to - from) > 1000) return NaN;
    let prod = 1;
    for (let k = from; k <= to; k += step) prod *= fn(k);
    return prod;
  }

  // ── Limits (numerical) ────────────────────────────────────
  function limitRight(fn, x, h = 1e-8) {
    const v1 = fn(x + h), v2 = fn(x + h/10);
    if (!isFinite(v1) || !isFinite(v2)) return v1;
    return v2 + (v2 - v1) * (h/10) / (h - h/10); // Richardson
  }
  function limitLeft(fn, x, h = 1e-8) {
    const v1 = fn(x - h), v2 = fn(x - h/10);
    if (!isFinite(v1) || !isFinite(v2)) return v1;
    return v2 + (v2 - v1) * (h/10) / (h - h/10);
  }
  function limit(fn, x, h = 1e-8) {
    const L = limitLeft(fn, x, h), R = limitRight(fn, x, h);
    if (Math.abs(L - R) < 1e-6) return (L + R) / 2;
    return NaN; // limit doesn't exist
  }

  // ── Taylor / Maclaurin Series ─────────────────────────────
  function taylorCoeffs(fn, a, terms = 8, h = 1e-5) {
    const coeffs = [];
    let factorial = 1;
    for (let n = 0; n < terms; n++) {
      if (n > 0) factorial *= n;
      const dn = derivN(fn, a, n, h);
      coeffs.push({ n, coeff: dn / factorial, term: `${(dn/factorial).toFixed(6)}(x${a!==0?'-'+a:''})^${n}` });
    }
    return coeffs;
  }
  function taylorEval(fn, a, x, terms = 8) {
    const coeffs = taylorCoeffs(fn, a, terms);
    let sum = 0;
    for (const { n, coeff } of coeffs) {
      sum += coeff * Math.pow(x - a, n);
    }
    return sum;
  }

  // ── ODE Solvers ───────────────────────────────────────────
  // dy/dx = f(x, y),  y(x0) = y0

  // Euler method (first-order)
  function odeEuler(fn, x0, y0, xEnd, n = 1000) {
    const h = (xEnd - x0) / n;
    const xs = [x0], ys = [y0];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
      y += h * fn(x, y);
      x += h;
      xs.push(x); ys.push(y);
    }
    return { x: xs, y: ys, final: y };
  }

  // Runge-Kutta 4 (RK4) — most used by engineers
  function odeRK4(fn, x0, y0, xEnd, n = 1000) {
    const h = (xEnd - x0) / n;
    const xs = [x0], ys = [y0];
    let x = x0, y = y0;
    for (let i = 0; i < n; i++) {
      const k1 = fn(x,         y);
      const k2 = fn(x + h/2,   y + h*k1/2);
      const k3 = fn(x + h/2,   y + h*k2/2);
      const k4 = fn(x + h,     y + h*k3);
      y += (h / 6) * (k1 + 2*k2 + 2*k3 + k4);
      x += h;
      xs.push(parseFloat(x.toFixed(10)));
      ys.push(y);
    }
    return { x: xs, y: ys, final: y };
  }

  // RK45 adaptive step (Dormand-Prince)
  function odeRK45(fn, x0, y0, xEnd, { tol = 1e-6, maxSteps = 10000 } = {}) {
    const a = [0, 1/4, 3/8, 12/13, 1, 1/2];
    const b = [
      [], [1/4], [3/32,9/32], [1932/2197,-7200/2197,7296/2197],
      [439/216,-8,3680/513,-845/4104],
      [-8/27,2,-3544/2565,1859/4104,-11/40],
    ];
    const c  = [16/135, 0, 6656/12825, 28561/56430, -9/50, 2/55];
    const dc = [1/360, 0, -128/4275, -2197/75240, 1/50, 2/55];

    let x = x0, y = y0, h = (xEnd - x0) / 100;
    const xs = [x0], ys = [y0];
    for (let step = 0; step < maxSteps && x < xEnd; step++) {
      if (x + h > xEnd) h = xEnd - x;
      const k = [fn(x, y)];
      for (let i = 1; i < 6; i++) {
        let yi = y;
        for (let j = 0; j < i; j++) yi += h * b[i][j] * k[j];
        k.push(fn(x + a[i]*h, yi));
      }
      const err = Math.abs(h * dc.reduce((s, d, i) => s + d * k[i], 0));
      if (err < tol || h < 1e-12) {
        y += h * c.reduce((s, ci, i) => s + ci * k[i], 0);
        x += h;
        xs.push(x); ys.push(y);
      }
      h *= Math.min(2, Math.max(0.1, 0.9 * Math.pow(tol / (err + 1e-15), 0.2)));
    }
    return { x: xs, y: ys, final: y };
  }

  // ── Multivariable ─────────────────────────────────────────
  // Partial derivative ∂f/∂xᵢ at point p = [x1, x2, ...]
  function partialDeriv(fn, p, i, h = 1e-7) {
    const p1 = [...p], p2 = [...p];
    p1[i] += h; p2[i] -= h;
    return (fn(p1) - fn(p2)) / (2 * h);
  }
  // Gradient vector ∇f at point p
  function gradient(fn, p, h = 1e-7) {
    return p.map((_, i) => partialDeriv(fn, p, i, h));
  }
  // Hessian matrix (matrix of second partial derivatives)
  function hessian(fn, p, h = 1e-5) {
    const n = p.length;
    const H = Array.from({length: n}, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const pi1 = [...p], pi2 = [...p], pj1 = [...p], pj2 = [...p];
        pi1[i] += h; pi2[i] -= h;
        if (i === j) {
          H[i][j] = (fn(pi1) - 2*fn(p) + fn(pi2)) / (h*h);
        } else {
          pi1[j] += h; pi2[j] += h; pj1[i] += h; pj1[j] -= h; pj2[i] -= h; pj2[j] += h;
          const pp = [...p]; pp[i] += h; pp[j] += h;
          const pm = [...p]; pm[i] += h; pm[j] -= h;
          const mp = [...p]; mp[i] -= h; mp[j] += h;
          const mm = [...p]; mm[i] -= h; mm[j] -= h;
          H[i][j] = H[j][i] = (fn(pp) - fn(pm) - fn(mp) + fn(mm)) / (4*h*h);
        }
      }
    }
    return H;
  }
  // Divergence of vector field F = [Fx, Fy, Fz] at point p
  function divergence(F, p, h = 1e-7) {
    return F.reduce((sum, fi, i) => sum + partialDeriv(fi, p, i, h), 0);
  }
  // Curl of vector field F = [Fx, Fy, Fz] at point p = [x, y, z]
  function curl(F, p, h = 1e-7) {
    const [Fx, Fy, Fz] = F;
    return [
      partialDeriv(Fz, p, 1, h) - partialDeriv(Fy, p, 2, h),
      partialDeriv(Fx, p, 2, h) - partialDeriv(Fz, p, 0, h),
      partialDeriv(Fy, p, 0, h) - partialDeriv(Fx, p, 1, h),
    ];
  }
  // Laplacian ∇²f at point p
  function laplacian(fn, p, h = 1e-5) {
    return p.reduce((sum, _, i) => sum + (
      fn(p.map((v, j) => j===i ? v+h : v)) - 2*fn(p) +
      fn(p.map((v, j) => j===i ? v-h : v))
    ) / (h*h), 0);
  }

  // ── Arc length ────────────────────────────────────────────
  function arcLength(fn, a, b, n = 1000) {
    return integrate(x => Math.sqrt(1 + deriv(fn, x)**2), a, b, n);
  }
  // Surface of revolution around x-axis
  function surfaceRevX(fn, a, b, n = 1000) {
    return 2 * Math.PI * integrate(x => fn(x) * Math.sqrt(1 + deriv(fn, x)**2), a, b, n);
  }
  // Volume of revolution (disk method)
  function volumeRevX(fn, a, b, n = 1000) {
    return Math.PI * integrate(x => fn(x)**2, a, b, n);
  }

  // ── Public API ────────────────────────────────────────────
  return {
    // Derivatives
    derivForward, deriv, deriv5pt, deriv2, deriv3, derivN,
    // Integration
    integrateMidpoint, integrateTrapezoid, integrate,
    integrateSimp38, integrateGauss5, integrateAdaptive,
    // Series / sums
    summation, product,
    // Limits
    limitLeft, limitRight, limit,
    // Taylor
    taylorCoeffs, taylorEval,
    // ODEs
    odeEuler, odeRK4, odeRK45,
    // Multivariable
    partialDeriv, gradient, hessian, divergence, curl, laplacian,
    // Geometry
    arcLength, surfaceRevX, volumeRevX,
  };

})();

if (typeof module !== 'undefined') module.exports = Calculus;
else window.Calculus = Calculus;
