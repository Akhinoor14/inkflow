// calc/core/algebra.js
// ════════════════════════════════════════════════════════════
//  ALGEBRA MODULE
//  Covers: quadratic/cubic/quartic solvers, polynomial ops,
//          linear systems (Gaussian elimination, Cramer's rule),
//          Newton-Raphson for arbitrary equations,
//          roots of unity, partial fractions hint
// ════════════════════════════════════════════════════════════
'use strict';

const Algebra = (() => {

  const EPS = 1e-12;

  // ── Quadratic: ax² + bx + c = 0 ──────────────────────────
  function quadratic(a, b, c) {
    if (Math.abs(a) < EPS) {
      // Linear
      if (Math.abs(b) < EPS) return { type: 'degenerate', roots: [] };
      return { type: 'linear', roots: [{ re: -c/b, im: 0 }] };
    }
    const disc = b*b - 4*a*c;
    if (disc > EPS) {
      const sd = Math.sqrt(disc);
      return {
        type: 'real_distinct', disc,
        roots: [
          { re: (-b + sd) / (2*a), im: 0 },
          { re: (-b - sd) / (2*a), im: 0 },
        ],
      };
    }
    if (Math.abs(disc) <= EPS) {
      return {
        type: 'real_repeated', disc: 0,
        roots: [{ re: -b / (2*a), im: 0 }],
      };
    }
    // Complex
    const sd = Math.sqrt(-disc);
    return {
      type: 'complex', disc,
      roots: [
        { re: -b / (2*a), im:  sd / (2*a) },
        { re: -b / (2*a), im: -sd / (2*a) },
      ],
    };
  }

  // ── Cubic: ax³ + bx² + cx + d = 0 (Cardano's method) ─────
  function cubic(a, b, c, d) {
    if (Math.abs(a) < EPS) return quadratic(b, c, d);

    // Normalise to x³ + px + q = 0 via substitution x = t - b/(3a)
    const A = b / a, B = c / a, C = d / a;
    const p = B - A*A/3;
    const q = 2*A*A*A/27 - A*B/3 + C;
    const shift = -A / 3;
    const disc = -(4*p*p*p + 27*q*q);
    const roots = [];

    if (disc > EPS) {
      // 3 distinct real roots (trigonometric method)
      const m = 2 * Math.sqrt(-p/3);
      for (let k = 0; k < 3; k++) {
        const t = m * Math.cos((1/3) * Math.acos((3*q) / (p*m)) - (2*Math.PI*k)/3);
        roots.push({ re: t + shift, im: 0 });
      }
    } else if (Math.abs(disc) <= EPS) {
      // Double root
      const t1 = 3*q/p, t2 = -3*q/(2*p);
      roots.push({ re: t1 + shift, im: 0 }, { re: t2 + shift, im: 0 });
    } else {
      // 1 real + 2 complex conjugate roots
      const sqrtDisc = Math.sqrt(-(disc/108));
      const Q = q/2;
      const cbrtA = Math.cbrt(-Q + sqrtDisc);
      const cbrtB = Math.cbrt(-Q - sqrtDisc);
      const real = cbrtA + cbrtB + shift;
      const imag = (Math.sqrt(3)/2) * Math.abs(cbrtA - cbrtB);
      roots.push(
        { re: real, im: 0 },
        { re: -(cbrtA+cbrtB)/2 + shift, im:  imag },
        { re: -(cbrtA+cbrtB)/2 + shift, im: -imag },
      );
    }
    return { type: 'cubic', disc, roots };
  }

  // ── Quartic: ax⁴ + bx³ + cx² + dx + e = 0 (Ferrari) ──────
  function quartic(a, b, c, d, e) {
    if (Math.abs(a) < EPS) return cubic(b, c, d, e);

    // Reduce to depressed quartic, then use resolvent cubic
    const A = b/a, B = c/a, C = d/a, D = e/a;
    const p = B - 3*A*A/8;
    const q = A*A*A/8 - A*B/2 + C;
    const r = -3*A*A*A*A/256 + A*A*B/16 - A*C/4 + D;
    const shift = -A/4;

    if (Math.abs(q) < EPS) {
      // Biquadratic
      const q1 = quadratic(1, p, r);
      const roots = [];
      for (const root of q1.roots) {
        if (Math.abs(root.im) < EPS && root.re >= 0) {
          const sq = Math.sqrt(root.re);
          roots.push({ re: sq + shift, im: 0 }, { re: -sq + shift, im: 0 });
        } else if (Math.abs(root.im) < EPS && root.re < 0) {
          const sq = Math.sqrt(-root.re);
          roots.push({ re: shift, im: sq }, { re: shift, im: -sq });
        }
      }
      return { type: 'quartic_biquad', roots };
    }

    // Resolvent cubic
    const cubicRes = cubic(1, -p/2, -(4*r - p*p)/4, q*q/8);
    const m2 = cubicRes.roots.find(r => Math.abs(r.im) < EPS && r.re > 0);
    if (!m2) return { type: 'quartic', roots: [] };
    const m = Math.sqrt(m2.re);

    const roots = [];
    const sub1 = quadratic(1,  m, p/2 + m*m - q/(2*m));
    const sub2 = quadratic(1, -m, p/2 + m*m + q/(2*m));
    for (const r of [...sub1.roots, ...sub2.roots]) {
      roots.push({ re: r.re + shift, im: r.im });
    }
    return { type: 'quartic', roots };
  }

  // ── Newton-Raphson (arbitrary function) ───────────────────
  function newtonRaphson(fn, x0, { tol = 1e-11, maxIter = 500, h = 1e-8 } = {}) {
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
      const fx = fn(x);
      const dfx = (fn(x + h) - fn(x - h)) / (2*h);
      if (Math.abs(dfx) < 1e-15) return { root: x, converged: false, iter: i };
      const nx = x - fx / dfx;
      if (Math.abs(nx - x) < tol && Math.abs(fx) < tol * 10) {
        return { root: nx, converged: true, iter: i, residual: Math.abs(fn(nx)) };
      }
      x = nx;
      if (!isFinite(x)) return { root: NaN, converged: false, iter: i };
    }
    return { root: x, converged: Math.abs(fn(x)) < 1e-6, iter: maxIter };
  }

  // ── Bisection (guaranteed convergence on [a,b]) ────────────
  function bisection(fn, a, b, { tol = 1e-11, maxIter = 100 } = {}) {
    if (fn(a) * fn(b) > 0) return { root: NaN, converged: false, error: 'No sign change' };
    let mid = a;
    for (let i = 0; i < maxIter; i++) {
      mid = (a + b) / 2;
      if (Math.abs(b - a) < tol) return { root: mid, converged: true, iter: i };
      if (fn(a) * fn(mid) < 0) b = mid; else a = mid;
    }
    return { root: mid, converged: true, iter: maxIter };
  }

  // ── Secant method ─────────────────────────────────────────
  function secant(fn, x0, x1, { tol = 1e-11, maxIter = 100 } = {}) {
    for (let i = 0; i < maxIter; i++) {
      const f0 = fn(x0), f1 = fn(x1);
      if (Math.abs(f1 - f0) < 1e-15) break;
      const x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
      if (Math.abs(x2 - x1) < tol) return { root: x2, converged: true, iter: i };
      x0 = x1; x1 = x2;
    }
    return { root: x1, converged: Math.abs(fn(x1)) < 1e-6, iter: maxIter };
  }

  // ── Polynomial evaluation ─────────────────────────────────
  // coeffs: [a_n, a_{n-1}, ..., a_1, a_0]  (highest degree first)
  function polyEval(coeffs, x) {
    // Horner's method
    return coeffs.reduce((acc, c) => acc * x + c, 0);
  }
  function polyDerive(coeffs) {
    const n = coeffs.length - 1;
    return coeffs.slice(0, -1).map((c, i) => c * (n - i));
  }
  function polyIntegrate(coeffs, C = 0) {
    const n = coeffs.length;
    const result = coeffs.map((c, i) => c / (n - i));
    result.push(C);
    return result;
  }
  function polyAdd(a, b) {
    const len = Math.max(a.length, b.length);
    const pa = [...Array(len - a.length).fill(0), ...a];
    const pb = [...Array(len - b.length).fill(0), ...b];
    return pa.map((v, i) => v + pb[i]);
  }
  function polyMul(a, b) {
    const result = Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < b.length; j++)
        result[i + j] += a[i] * b[j];
    return result;
  }

  // ── Linear system: Ax = b (Gaussian elimination) ──────────
  function solveLinear(A, b) {
    const n = b.length;
    const M = A.map((row, i) => [...row, b[i]]);

    for (let col = 0; col < n; col++) {
      // Pivot
      let maxRow = col;
      for (let row = col+1; row < n; row++)
        if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
      [M[col], M[maxRow]] = [M[maxRow], M[col]];

      if (Math.abs(M[col][col]) < EPS) return { solution: null, error: 'Singular matrix' };

      for (let row = col+1; row < n; row++) {
        const f = M[row][col] / M[col][col];
        for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k];
      }
    }

    // Back-substitution
    const x = Array(n).fill(0);
    for (let i = n-1; i >= 0; i--) {
      x[i] = M[i][n];
      for (let j = i+1; j < n; j++) x[i] -= M[i][j] * x[j];
      x[i] /= M[i][i];
    }
    return { solution: x };
  }

  // ── Cramer's Rule (2x2, 3x3) ─────────────────────────────
  function det2(a) { return a[0][0]*a[1][1] - a[0][1]*a[1][0]; }
  function det3(a) {
    return a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])
          -a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])
          +a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
  }
  function cramer2(A, b) {
    const D = det2(A);
    if (Math.abs(D) < EPS) return { solution: null, error: 'No unique solution' };
    return {
      solution: [
        det2([[b[0],A[0][1]],[b[1],A[1][1]]]) / D,
        det2([[A[0][0],b[0]],[A[1][0],b[1]]]) / D,
      ],
    };
  }
  function cramer3(A, b) {
    const D = det3(A);
    if (Math.abs(D) < EPS) return { solution: null, error: 'No unique solution' };
    return {
      solution: [
        det3([[b[0],A[0][1],A[0][2]],[b[1],A[1][1],A[1][2]],[b[2],A[2][1],A[2][2]]]) / D,
        det3([[A[0][0],b[0],A[0][2]],[A[1][0],b[1],A[1][2]],[A[2][0],b[2],A[2][2]]]) / D,
        det3([[A[0][0],A[0][1],b[0]],[A[1][0],A[1][1],b[1]],[A[2][0],A[2][1],b[2]]]) / D,
      ],
    };
  }

  // ── Logarithms & exponentials ─────────────────────────────
  function logBase(base, x) {
    if (x <= 0 || base <= 0 || base === 1) return NaN;
    return Math.log(x) / Math.log(base);
  }

  // ── Combinatorics ─────────────────────────────────────────
  function factorial(n) {
    n = Math.round(n);
    if (n < 0 || n > 170) return NaN;
    if (n <= 1) return 1;
    // Memoised
    if (!factorial._cache) factorial._cache = [1, 1];
    if (factorial._cache[n] !== undefined) return factorial._cache[n];
    for (let i = factorial._cache.length; i <= n; i++)
      factorial._cache[i] = factorial._cache[i-1] * i;
    return factorial._cache[n];
  }
  function nPr(n, r) {
    if (r > n || r < 0) return 0;
    return factorial(n) / factorial(n - r);
  }
  function nCr(n, r) {
    if (r > n || r < 0) return 0;
    r = Math.min(r, n - r);
    return factorial(n) / (factorial(r) * factorial(n - r));
  }
  // Stirling's approx for large factorials
  function logFactorial(n) {
    if (n <= 170) return Math.log(factorial(n));
    return 0.5*Math.log(2*Math.PI*n) + n*Math.log(n/Math.E);
  }

  // ── Partial fraction decomposition hint ───────────────────
  // For pedagogical display — returns string
  function partialFractionHint(numCoeffs, denRoots) {
    return denRoots.map((r, i) => `A${i+1}/(x - ${r})`).join(' + ');
  }

  // ── Public API ────────────────────────────────────────────
  return {
    quadratic, cubic, quartic,
    newtonRaphson, bisection, secant,
    polyEval, polyDerive, polyIntegrate, polyAdd, polyMul,
    solveLinear, cramer2, cramer3,
    det2, det3,
    logBase,
    factorial, nPr, nCr, logFactorial,
    partialFractionHint,
  };

})();

if (typeof module !== 'undefined') module.exports = Algebra;
else window.Algebra = Algebra;
