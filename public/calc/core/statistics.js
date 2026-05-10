// calc/core/statistics.js
// ════════════════════════════════════════════════════════════
//  STATISTICS MODULE
//  Covers: descriptive stats, probability distributions,
//          regression (linear, polynomial, exp, power),
//          hypothesis testing, correlation, ANOVA basics,
//          confidence intervals, sampling
// ════════════════════════════════════════════════════════════
'use strict';

const Statistics = (() => {

  // ── Descriptive Statistics ────────────────────────────────
  function mean(data) { return data.reduce((s, v) => s + v, 0) / data.length; }

  function weightedMean(data, weights) {
    const sw = weights.reduce((s, w) => s + w, 0);
    return data.reduce((s, v, i) => s + v * weights[i], 0) / sw;
  }

  function median(data) {
    const s = [...data].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid-1] + s[mid]) / 2;
  }

  function mode(data) {
    const freq = {};
    data.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const maxF = Math.max(...Object.values(freq));
    return Object.entries(freq).filter(([, f]) => f === maxF).map(([v]) => parseFloat(v));
  }

  function variance(data, population = false) {
    const m = mean(data);
    const n = population ? data.length : data.length - 1;
    if (n <= 0) return NaN;
    return data.reduce((s, v) => s + (v - m) ** 2, 0) / n;
  }

  function stdDev(data, population = false) { return Math.sqrt(variance(data, population)); }

  function sem(data) { return stdDev(data) / Math.sqrt(data.length); }

  function range(data) { return Math.max(...data) - Math.min(...data); }

  function iqr(data) {
    const s = [...data].sort((a, b) => a - b);
    const q1 = percentile(s, 25), q3 = percentile(s, 75);
    return { q1, q3, iqr: q3 - q1 };
  }

  function percentile(data, p) {
    const s = [...data].sort((a, b) => a - b);
    const idx = (p / 100) * (s.length - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return s[lo] + (s[hi] - s[lo]) * (idx - lo);
  }

  function skewness(data) {
    const m = mean(data), s = stdDev(data), n = data.length;
    if (s === 0) return 0;
    return data.reduce((sum, v) => sum + ((v - m) / s) ** 3, 0) * n / ((n-1)*(n-2));
  }

  function kurtosis(data) {
    const m = mean(data), s = stdDev(data), n = data.length;
    if (s === 0) return 0;
    const k4 = data.reduce((sum, v) => sum + ((v-m)/s)**4, 0);
    return n*(n+1)/((n-1)*(n-2)*(n-3)) * k4 - 3*(n-1)**2/((n-2)*(n-3));
  }

  function summary(data) {
    const s = [...data].sort((a, b) => a - b);
    const { q1, q3, iqr: iqrVal } = iqr(data);
    return {
      n: data.length, min: s[0], max: s[s.length-1],
      mean: mean(data), median: median(data), mode: mode(data),
      q1, q3, iqr: iqrVal,
      variance: variance(data), stdDev: stdDev(data),
      sem: sem(data), range: range(data),
      skewness: skewness(data), kurtosis: kurtosis(data),
    };
  }

  // ── Correlation ───────────────────────────────────────────
  function pearson(x, y) {
    const mx = mean(x), my = mean(y);
    const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const den = Math.sqrt(
      x.reduce((s, xi) => s + (xi - mx)**2, 0) *
      y.reduce((s, yi) => s + (yi - my)**2, 0)
    );
    return den === 0 ? NaN : num / den;
  }

  function spearman(x, y) {
    const rank = arr => {
      const sorted = [...arr].sort((a,b)=>a-b);
      return arr.map(v => sorted.indexOf(v) + 1);
    };
    const rx = rank(x), ry = rank(y), n = x.length;
    const d2 = rx.reduce((s, r, i) => s + (r - ry[i])**2, 0);
    return 1 - (6 * d2) / (n * (n*n - 1));
  }

  function covariance(x, y, population = false) {
    const mx = mean(x), my = mean(y);
    const n = population ? x.length : x.length - 1;
    return x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / n;
  }

  // ── Regression ───────────────────────────────────────────
  function linearRegression(x, y) {
    const n = x.length;
    const mx = mean(x), my = mean(y);
    const Sxx = x.reduce((s, xi) => s + (xi - mx)**2, 0);
    const Sxy = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
    const slope = Sxy / Sxx;
    const intercept = my - slope * mx;
    const r = pearson(x, y);
    const yPred = x.map(xi => slope * xi + intercept);
    const sse = y.reduce((s, yi, i) => s + (yi - yPred[i])**2, 0);
    const sst = y.reduce((s, yi) => s + (yi - my)**2, 0);
    return {
      slope, intercept, r, r2: r**2,
      equation: `y = ${slope.toFixed(6)}x + ${intercept.toFixed(6)}`,
      predict: x => slope * x + intercept,
      sse, rmse: Math.sqrt(sse / n),
    };
  }

  function polynomialRegression(x, y, degree) {
    // Vandermonde matrix approach
    const n = x.length, d = degree + 1;
    const V = x.map(xi => Array.from({length: d}, (_, k) => xi ** (d-1-k)));
    const VT = V[0].map((_, ci) => V.map(r => r[ci]));
    // A = VᵀV, b = VᵀY — use Gaussian elimination from Algebra
    const A = VT.map(row => VT[0].map((_, ci) => row.reduce((s, _, ri) => s + VT[ci][ri] * row[ri], 0)));
    const B_vec = VT.map(row => row.reduce((s, v, i) => s + v * y[i], 0));
    // Simple LU for small systems
    const coeffs = solveSmallLinear(A, B_vec);
    const predict = xv => coeffs.reduce((s, c, i) => s + c * xv**(d-1-i), 0);
    return { coeffs, predict, degree };
  }

  function exponentialRegression(x, y) {
    // y = a·eᵇˣ → ln(y) = ln(a) + bx
    const lnY = y.map(v => Math.log(Math.abs(v)));
    const lr = linearRegression(x, lnY);
    return {
      a: Math.exp(lr.intercept), b: lr.slope, r2: lr.r2,
      equation: `y = ${Math.exp(lr.intercept).toFixed(4)}·e^(${lr.slope.toFixed(4)}x)`,
      predict: xv => Math.exp(lr.intercept) * Math.exp(lr.slope * xv),
    };
  }

  function powerRegression(x, y) {
    // y = a·xᵇ → log(y) = log(a) + b·log(x)
    const lx = x.map(v => Math.log(v)), ly = y.map(v => Math.log(v));
    const lr = linearRegression(lx, ly);
    return {
      a: Math.exp(lr.intercept), b: lr.slope, r2: lr.r2,
      equation: `y = ${Math.exp(lr.intercept).toFixed(4)}·x^${lr.slope.toFixed(4)}`,
      predict: xv => Math.exp(lr.intercept) * xv**lr.slope,
    };
  }

  // ── Probability Distributions ─────────────────────────────
  const Distributions = {

    // Normal distribution
    normal: {
      pdf: (x, mu = 0, sigma = 1) =>
        Math.exp(-0.5 * ((x - mu)/sigma)**2) / (sigma * Math.sqrt(2 * Math.PI)),
      cdf: (x, mu = 0, sigma = 1) =>
        0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2))),
      inv: (p, mu = 0, sigma = 1) => mu + sigma * normInv(p),
      mean: (mu) => mu,
      variance: (sigma) => sigma**2,
    },

    // t-distribution
    t: {
      pdf: (t, df) => {
        const log = -((df+1)/2)*Math.log(1 + t*t/df) +
          logGamma((df+1)/2) - logGamma(df/2) - 0.5*Math.log(Math.PI*df);
        return Math.exp(log);
      },
      cdf: (t, df) => 1 - 0.5 * incompleteBeta(df/(df + t*t), df/2, 0.5),
    },

    // Chi-squared
    chi2: {
      pdf: (x, k) => {
        if (x <= 0) return 0;
        return Math.exp((k/2-1)*Math.log(x) - x/2 - (k/2)*Math.log(2) - logGamma(k/2));
      },
      cdf: (x, k) => incompleteGammaReg(k/2, x/2),
    },

    // F-distribution
    f: {
      pdf: (x, d1, d2) => {
        if (x <= 0) return 0;
        const num = Math.pow(d1*x, d1) * Math.pow(d2, d2);
        const den = Math.pow(d1*x + d2, d1+d2);
        return Math.sqrt(num/den) / (x * beta(d1/2, d2/2));
      },
    },

    // Binomial
    binomial: {
      pmf: (k, n, p) => nCr_s(n, k) * p**k * (1-p)**(n-k),
      cdf: (k, n, p) => {
        let sum = 0;
        for (let i = 0; i <= k; i++) sum += nCr_s(n, i) * p**i * (1-p)**(n-i);
        return sum;
      },
      mean: (n, p) => n * p,
      variance: (n, p) => n * p * (1 - p),
    },

    // Poisson
    poisson: {
      pmf: (k, lambda) => Math.exp(-lambda) * lambda**k / factorials(k),
      cdf: (k, lambda) => {
        let sum = 0;
        for (let i = 0; i <= k; i++) sum += Math.exp(-lambda) * lambda**i / factorials(i);
        return sum;
      },
      mean: (lambda) => lambda,
      variance: (lambda) => lambda,
    },

    // Exponential
    exponential: {
      pdf: (x, lambda) => x < 0 ? 0 : lambda * Math.exp(-lambda * x),
      cdf: (x, lambda) => x < 0 ? 0 : 1 - Math.exp(-lambda * x),
      mean: (lambda) => 1 / lambda,
    },

    // Uniform
    uniform: {
      pdf: (x, a, b) => (x >= a && x <= b) ? 1/(b-a) : 0,
      cdf: (x, a, b) => x < a ? 0 : x > b ? 1 : (x-a)/(b-a),
      mean: (a, b) => (a+b)/2,
      variance: (a, b) => (b-a)**2/12,
    },

    // Log-normal
    lognormal: {
      pdf: (x, mu, sigma) => x <= 0 ? 0 :
        Math.exp(-((Math.log(x)-mu)**2)/(2*sigma**2)) / (x*sigma*Math.sqrt(2*Math.PI)),
      cdf: (x, mu, sigma) => x <= 0 ? 0 :
        0.5 * (1 + erf((Math.log(x)-mu)/(sigma*Math.SQRT2))),
      mean: (mu, sigma) => Math.exp(mu + sigma**2/2),
    },

    // Weibull
    weibull: {
      pdf: (x, k, lambda) => x < 0 ? 0 :
        (k/lambda) * (x/lambda)**(k-1) * Math.exp(-(x/lambda)**k),
      cdf: (x, k, lambda) => x < 0 ? 0 : 1 - Math.exp(-(x/lambda)**k),
      mean: (k, lambda) => lambda * gamma_fn(1 + 1/k),
    },
  };

  // ── Hypothesis Testing ────────────────────────────────────
  function tTestOneSample(data, mu0) {
    const n = data.length;
    const m = mean(data), s = stdDev(data);
    const t = (m - mu0) / (s / Math.sqrt(n));
    const df = n - 1;
    return { t, df, mean: m, stdDev: s, n };
  }

  function tTestTwoSample(data1, data2, { equalVar = false } = {}) {
    const n1 = data1.length, n2 = data2.length;
    const m1 = mean(data1), m2 = mean(data2);
    const s1 = variance(data1), s2 = variance(data2);

    let t, df;
    if (equalVar) {
      const sp = Math.sqrt(((n1-1)*s1 + (n2-1)*s2) / (n1+n2-2));
      t = (m1 - m2) / (sp * Math.sqrt(1/n1 + 1/n2));
      df = n1 + n2 - 2;
    } else {
      // Welch's t-test
      const se = Math.sqrt(s1/n1 + s2/n2);
      t = (m1 - m2) / se;
      df = (s1/n1 + s2/n2)**2 / ((s1/n1)**2/(n1-1) + (s2/n2)**2/(n2-1));
    }
    return { t, df, mean1: m1, mean2: m2, diff: m1-m2 };
  }

  function confidenceInterval(data, confidence = 0.95) {
    const n = data.length, m = mean(data), s = sem(data);
    const z = normInv((1 + confidence) / 2);
    const margin = z * s;
    return { mean: m, lower: m - margin, upper: m + margin, margin };
  }

  // ── Helper math functions ─────────────────────────────────
  function erf(x) {
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const p = t*(0.254829592 + t*(-0.284496736 + t*(1.421413741 + t*(-1.453152027 + t*1.061405429))));
    return Math.sign(x) * (1 - p * Math.exp(-x*x));
  }

  function normInv(p) {
    // Beasley-Springer-Moro algorithm
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02,
      -2.759285104469687e+02, 1.383577518672690e+02,
      -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02,
      -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01,
      -2.400758277161838e+00, -2.549732539343734e+00,
       4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01,
      2.445134137142996e+00, 3.754408661907416e+00];
    const plow = 0.02425, phigh = 1 - plow;
    let x;
    if (p < plow) {
      const q = Math.sqrt(-2*Math.log(p));
      x = (((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) /
          ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
    } else if (p <= phigh) {
      const q = p - 0.5, r = q*q;
      x = (((((a[1]*r+a[2])*r+a[3])*r+a[4])*r+a[5])*r+a[6])*q /
          (((((b[1]*r+b[2])*r+b[3])*r+b[4])*r+b[5])*r+1);
    } else {
      const q = Math.sqrt(-2*Math.log(1-p));
      x = -(((((c[1]*q+c[2])*q+c[3])*q+c[4])*q+c[5])*q+c[6]) /
           ((((d[1]*q+d[2])*q+d[3])*q+d[4])*q+1);
    }
    return x;
  }

  function logGamma(z) {
    const c = [76.18009172947146,-86.50532032941677,24.01409824083091,
      -1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
    let x = z, y = z, tmp = x + 5.5;
    tmp -= (x+0.5)*Math.log(tmp);
    let ser = 1.000000000190015;
    for (const ci of c) { y++; ser += ci/y; }
    return -tmp + Math.log(2.5066282746310005*ser/x);
  }

  function gamma_fn(z) { return Math.exp(logGamma(z)); }
  function beta(a, b) { return Math.exp(logGamma(a) + logGamma(b) - logGamma(a+b)); }
  function incompleteGammaReg(a, x) {
    // Series expansion for regularised incomplete gamma
    if (x < 0) return 0;
    let sum = 1/a, term = 1/a;
    for (let n = 1; n < 200; n++) { term *= x/(a+n); sum += term; if (term < sum*1e-12) break; }
    return Math.exp(-x + a*Math.log(x) - logGamma(a)) * sum;
  }
  function incompleteBeta(x, a, b) {
    // Continued fraction approximation
    if (x === 0) return 0; if (x === 1) return 1;
    const lbeta = Math.log(x)*a + Math.log(1-x)*b - Math.log(beta(a, b));
    let f = 1, c = 1, d = 1 - (a+b)*x/(a+1);
    if (Math.abs(d) < 1e-30) d = 1e-30; d = 1/d; f = d;
    for (let m = 1; m <= 100; m++) {
      let aa = m*(b-m)*x/((a+2*m-1)*(a+2*m));
      d = 1 + aa*d; if(Math.abs(d)<1e-30)d=1e-30; c=1+aa/c; if(Math.abs(c)<1e-30)c=1e-30;
      d=1/d; f*=d*c;
      aa = -(a+m)*(a+b+m)*x/((a+2*m)*(a+2*m+1));
      d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;
      d=1/d; const delta=d*c; f*=delta;
      if(Math.abs(delta-1)<1e-12)break;
    }
    return Math.exp(lbeta)*f/a;
  }
  function nCr_s(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    let r = 1;
    for (let i = 0; i < Math.min(k, n-k); i++) { r *= (n-i); r /= (i+1); }
    return r;
  }
  function factorials(n) {
    n = Math.round(n); let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
  function solveSmallLinear(A, b) {
    const n = b.length;
    const M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < n; c++) {
      let max = c;
      for (let r = c+1; r < n; r++) if(Math.abs(M[r][c])>Math.abs(M[max][c]))max=r;
      [M[c],M[max]]=[M[max],M[c]];
      for (let r = c+1; r < n; r++) {
        const f = M[r][c]/M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f*M[c][k];
      }
    }
    const x = Array(n).fill(0);
    for (let i = n-1; i >= 0; i--) {
      x[i] = M[i][n];
      for (let j = i+1; j < n; j++) x[i] -= M[i][j]*x[j];
      x[i] /= M[i][i];
    }
    return x;
  }

  // ── Public API ────────────────────────────────────────────
  return {
    mean, weightedMean, median, mode, variance, stdDev, sem, range,
    iqr, percentile, skewness, kurtosis, summary,
    pearson, spearman, covariance,
    linearRegression, polynomialRegression, exponentialRegression, powerRegression,
    Distributions,
    tTestOneSample, tTestTwoSample, confidenceInterval,
    erf, normInv, logGamma, gamma_fn, beta,
  };

})();

if (typeof module !== 'undefined') module.exports = Statistics;
else window.Statistics = Statistics;
