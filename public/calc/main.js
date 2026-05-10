// calc/main.js
// ════════════════════════════════════════════════════════════
//  INKFLOW CALCULATOR — MASTER ENGINE
//  Connects all modules into a single unified expression parser
//  Supports: standard math, engineering functions, unit conversion,
//            constants, matrix/complex/stats/financial shortcuts
// ════════════════════════════════════════════════════════════
'use strict';

const CalcEngine = (() => {

  // ── State ─────────────────────────────────────────────────
  let angleMode = 'DEG';    // 'DEG' | 'RAD' | 'GRAD'
  let ans = 0;
  let preAns = 0;
  let memory = 0;
  const vars = { A:0, B:0, C:0, D:0, E_:0, F:0, M:0, x:0, y:0, z:0 };
  // Note: E_ used internally to avoid conflict with Math.E

  // ── Angle helpers (shared) ────────────────────────────────
  function toRad(v) {
    if (angleMode === 'RAD')  return v;
    if (angleMode === 'GRAD') return v * Math.PI / 200;
    return v * Math.PI / 180;
  }
  function fromRad(v) {
    if (angleMode === 'RAD')  return v;
    if (angleMode === 'GRAD') return v * 200 / Math.PI;
    return v * 180 / Math.PI;
  }

  // ── All math functions available in expressions ───────────
  const FN = {
    // ── Trig ──────────────────────────────────────────────
    sin:   x => Math.sin(toRad(x)),
    cos:   x => Math.cos(toRad(x)),
    tan:   x => { const c = Math.cos(toRad(x)); if (Math.abs(c)<1e-14) return Infinity; return Math.sin(toRad(x))/c; },
    cot:   x => { const s = Math.sin(toRad(x)); if (Math.abs(s)<1e-14) return Infinity; return Math.cos(toRad(x))/s; },
    sec:   x => { const c = Math.cos(toRad(x)); return c===0?Infinity:1/c; },
    csc:   x => { const s = Math.sin(toRad(x)); return s===0?Infinity:1/s; },
    asin:  x => fromRad(Math.asin(x)),
    acos:  x => fromRad(Math.acos(x)),
    atan:  x => fromRad(Math.atan(x)),
    atan2: (y,x) => fromRad(Math.atan2(y,x)),
    acot:  x => fromRad(Math.PI/2 - Math.atan(x)),
    // Hyperbolic
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    coth: x => 1/Math.tanh(x),
    sech: x => 1/Math.cosh(x),
    csch: x => 1/Math.sinh(x),
    asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
    // Inverse hyp aliases
    arcsinh: Math.asinh, arccosh: Math.acosh, arctanh: Math.atanh,

    // ── Log / Exp ─────────────────────────────────────────
    log:   x => Math.log10(x),
    log10: x => Math.log10(x),
    log2:  x => Math.log2(x),
    ln:    x => Math.log(x),
    exp:   x => Math.exp(x),
    pow10: x => Math.pow(10, x),
    pow2:  x => Math.pow(2, x),
    logn:  (b, x) => Math.log(x)/Math.log(b),   // logn(base, value)

    // ── Power / Root ──────────────────────────────────────
    sqrt:  x => x < 0 ? NaN : Math.sqrt(x),
    cbrt:  Math.cbrt,
    nrt:   (n, x) => Math.sign(x) * Math.pow(Math.abs(x), 1/n),
    sq:    x => x*x,
    cube:  x => x*x*x,
    recip: x => x===0?Infinity:1/x,
    hyp:   (a,b) => Math.sqrt(a*a+b*b),   // hypotenuse
    hyp3:  (a,b,c) => Math.sqrt(a*a+b*b+c*c),

    // ── Rounding ──────────────────────────────────────────
    abs:   Math.abs,
    ceil:  Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc,
    sign:  Math.sign,
    frac:  x => x - Math.trunc(x),   // fractional part
    roundn: (x,n) => { const f=Math.pow(10,n); return Math.round(x*f)/f; },

    // ── Number theory ─────────────────────────────────────
    fact:  n => { n=Math.round(n); if(n<0||n>170)return NaN; let r=1; for(let i=2;i<=n;i++)r*=i; return r; },
    nCr:   (n,r) => { if(r>n||r<0)return 0; let res=1; for(let i=0;i<Math.min(r,n-r);i++){res*=(n-i);res/=(i+1);} return res; },
    nPr:   (n,r) => { if(r>n||r<0)return 0; let res=1; for(let i=0;i<r;i++)res*=(n-i); return res; },
    gcd:   (a,b) => { a=Math.abs(Math.round(a)); b=Math.abs(Math.round(b)); while(b){let t=b;b=a%b;a=t;} return a; },
    lcm:   (a,b) => { const g=Math.abs(Math.round(a)); const h=Math.abs(Math.round(b)); const gv=FN.gcd(g,h); return gv===0?0:g*h/gv; },
    isPrime: n => { n=Math.abs(Math.round(n)); if(n<2)return 0; if(n===2)return 1; if(n%2===0)return 0; for(let i=3;i<=Math.sqrt(n);i+=2)if(n%i===0)return 0; return 1; },
    mod:   (a,b) => ((a%b)+b)%b,     // always positive
    rem:   (a,b) => a%b,             // JS remainder

    // ── Statistics ────────────────────────────────────────
    // These take comma-separated args: mean(1,2,3,4,5)
    mean:   (...a) => a.reduce((s,v)=>s+v,0)/a.length,
    sum:    (...a) => a.reduce((s,v)=>s+v,0),
    prod:   (...a) => a.reduce((p,v)=>p*v,1),
    max:    Math.max,
    min:    Math.min,
    range:  (...a) => Math.max(...a)-Math.min(...a),
    median: (...a) => { const s=[...a].sort((x,y)=>x-y); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; },
    stddev: (...a) => { const m=FN.mean(...a); return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length); },
    variance: (...a) => { const m=FN.mean(...a); return a.reduce((s,v)=>s+(v-m)**2,0)/a.length; },

    // ── Calculus helpers ──────────────────────────────────
    deriv: (expr_str, x_val) => {
      const h = 1e-7;
      const f = v => evalRaw(expr_str.replace(/\bx\b/g, `(${v})`));
      return (f(x_val+h) - f(x_val-h))/(2*h);
    },
    integrate: (expr_str, a, b, n=1000) => {
      if (n%2!==0) n++;
      const h=(b-a)/n;
      const f = v => evalRaw(expr_str.replace(/\bx\b/g,`(${v})`));
      let s = f(a)+f(b);
      for(let i=1;i<n;i++) s+=f(a+i*h)*(i%2===0?2:4);
      return s*h/3;
    },
    sigma: (expr_str, from, to) => {
      let s=0; from=Math.round(from); to=Math.round(to);
      if(Math.abs(to-from)>100000) return NaN;
      for(let k=from;k<=to;k++) s+=evalRaw(expr_str.replace(/\bk\b/g,`(${k})`));
      return s;
    },

    // ── Engineering shortcuts ─────────────────────────────
    // Ohm's Law
    V: (I,R) => I*R,
    I_ohm: (V,R) => V/R,
    R_ohm: (V,I) => V/I,
    P_elec: (V,I) => V*I,

    // Frequency / wavelength
    freq: (lambda, v=3e8) => v/lambda,
    lambda: (f, v=3e8) => v/f,
    Xc: (f,C) => 1/(2*Math.PI*f*C),
    Xl: (f,L) => 2*Math.PI*f*L,
    fc: (R,C) => 1/(2*Math.PI*R*C),

    // dB
    dB: (v,ref=1) => 20*Math.log10(v/ref),
    dBp: (p,ref=1) => 10*Math.log10(p/ref),
    undB: (dB,ref=1) => ref*Math.pow(10,dB/20),
    undBp: (dB,ref=1) => ref*Math.pow(10,dB/10),

    // Reynolds number
    Re: (rho,v,L,mu) => rho*v*L/mu,

    // Beam — max moment shortcuts
    Mss: (w,L) => w*L*L/8,      // simply supported UDL
    Mcan: (w,L) => w*L*L/2,     // cantilever UDL
    Mpt: (P,L) => P*L/4,        // SS point load at mid

    // Stress shortcuts
    sigma_b: (M,y,I) => M*y/I,
    sigma_a: (P,A) => P/A,
    tau_t: (T,r,J) => T*r/J,
    vonmises: (sx,sy,txy) => Math.sqrt(sx**2-sx*sy+sy**2+3*txy**2),

    // Gas law
    PV: (n,R_,T) => n*R_*T,     // P for ideal gas (R_ = 8.314 or specific)

    // Heat transfer
    Q_cond: (k,A,dT,L) => k*A*dT/L,
    Q_conv: (h,A,dT) => h*A*dT,
    Q_rad: (eps,A,T1,T2) => eps*5.670374419e-8*A*(T1**4-T2**4),

    // Fluid
    Re_pipe: (rho,v,D,mu) => rho*v*D/mu,
    Fr: (v,d,g=9.80665) => v/Math.sqrt(g*d),

    // Financial
    FV_fn: (r,n,pmt,pv=0) => -(pv*Math.pow(1+r,n)+pmt*(Math.pow(1+r,n)-1)/r),
    PV_fn: (r,n,pmt,fv=0) => -(fv/Math.pow(1+r,n)+pmt*(1-Math.pow(1+r,-n))/r),
    PMT_fn: (r,n,pv,fv=0) => -r*(pv*Math.pow(1+r,n)+fv)/((Math.pow(1+r,n)-1)),
    NPV_fn: (...args) => { const [r,...cfs]=args; return cfs.reduce((s,cf,t)=>s+cf/Math.pow(1+r,t+1),0); },
    IRR_fn: (...cfs) => {
      let r=0.1;
      for(let i=0;i<200;i++){
        const f=cfs.reduce((s,cf,t)=>s+cf/Math.pow(1+r,t),0);
        const df=cfs.reduce((s,cf,t)=>s-t*cf/Math.pow(1+r,t+1),0);
        if(Math.abs(df)<1e-15)break;
        const nr=r-f/df; if(Math.abs(nr-r)<1e-10){r=nr;break;} r=nr;
      }
      return r;
    },

    // Unit conversion inline: convert(value, 'from', 'to', 'CAT')
    // e.g. convert(100, 'km', 'm', 'LENGTH')
    convert: (val, from, to, cat) => {
      if (typeof Units !== 'undefined') return Units.convert(val, from, to, cat);
      return NaN;
    },
  };

  // ── Constants available in expressions ───────────────────
  const CONSTS = {
    pi: Math.PI, PI: Math.PI,
    e: Math.E,
    phi: 1.6180339887498949,      // golden ratio
    sqrt2: Math.SQRT2,
    sqrt3: Math.sqrt(3),
    ln2: Math.LN2,
    ln10: Math.LN10,
    // Physical
    c_light: 299792458,
    h_planck: 6.62607015e-34,
    hbar: 1.054571817e-34,
    G_grav: 6.67430e-11,
    k_B: 1.380649e-23,
    N_A: 6.02214076e23,
    e_charge: 1.602176634e-19,
    R_gas: 8.314462618,
    sigma_SB: 5.670374419e-8,
    g: 9.80665,
    atm: 101325,
    m_e: 9.1093837015e-31,
    m_p: 1.67262192369e-27,
    // Math
    inf: Infinity,
    Inf: Infinity,
    nan: NaN,
    // Ans
    Ans: () => ans,
    ans: () => ans,
    Mem: () => memory,
  };

  // ── Pre-processing: transform expression string ───────────
  function preprocess(expr) {
    return expr
      // Operators
      .replace(/×/g, '*').replace(/÷/g, '/')
      .replace(/−/g, '-').replace(/–/g, '-')
      .replace(/\^/g, '**')
      // Factorial: n! → fact(n)
      .replace(/(\d+(?:\.\d+)?|\))\s*!/g, 'fact($1)')
      // % as /100 when at end or before operator
      .replace(/(\d+(?:\.\d+)?)\s*%(?!\s*\d)/g, '($1/100)')
      // Degree symbol
      .replace(/°/g, '*'+Math.PI+'/180')
      // Implicit multiply: 2π → 2*pi, 2e → 2*e, 3(x) → 3*(x)
      .replace(/(\d)([a-zA-Z_])/g, '$1*$2')
      .replace(/(\d)\s*\(/g, '$1*(')
      .replace(/\)\s*\(/g, ')*(')
      .replace(/\)\s*(\d)/g, ')*$1')
      // pi → Math.PI, e → Math.E inside expressions
      .replace(/\bpi\b/gi, '(Math.PI)')
      .replace(/\bπ\b/g, '(Math.PI)')
      .replace(/\bphi\b/g, '(1.6180339887498949)')
      .replace(/\bφ\b/g, '(1.6180339887498949)')
      // Protect Math.E: standalone 'e' not followed by (+/digit → still Euler's number)
      .replace(/\be\b(?!\^|\*\*|\d)/g, '(Math.E)')
      // mod keyword
      .replace(/\bmod\b/g, '%')
      // Ans and ans
      .replace(/\bAns\b|\bans\b/g, '(' + ans + ')')
      .replace(/\bMem\b|\bmem\b/g, '(' + memory + ')');
  }

  // ── Core eval (low-level, used by calculus helpers) ───────
  function evalRaw(expr) {
    try {
      const processed = preprocess(expr);
      // Inject all variables
      const varEntries = Object.entries(vars).map(([k,v]) => `const ${k==='E_'?'_E_':k} = ${v};`).join('');
      const code = `"use strict"; ${varEntries}
        ${Object.entries(FN).map(([k,v]) => `const ${k} = ${v};`).join('\n')}
        const Math_PI = Math.PI;
        return (${processed});`;
      return Function(...Object.keys(FN), 'Math', code)(...Object.values(FN), Math);
    } catch {
      return NaN;
    }
  }

  // ── Main eval (full, returns result object) ───────────────
  function evaluate(expr) {
    expr = expr.trim();
    if (!expr) return { value: null, display: '', error: null };

    // ── Special commands ────────────────────────────────────
    // Matrix: mat([[1,2],[3,4]])
    if (/^mat\s*\[/.test(expr)) return evalMatrix(expr);
    // Complex: cplx(3,4) or (3+4i)
    if (/\bi\b/.test(expr) || /^cplx/.test(expr)) return evalComplex(expr);
    // Solve: solve(expr, x, guess)
    if (/^solve\s*\(/.test(expr)) return evalSolve(expr);
    // Quadratic: quad(a,b,c)
    if (/^quad\s*\(/.test(expr)) return evalQuadratic(expr);
    // Stats: stats(1,2,3,4,5)
    if (/^stats\s*\(/.test(expr)) return evalStats(expr);
    // Convert: km to m 100, or 100 km to m
    const convMatch = expr.match(/^(.+?)\s+(\w+)\s+to\s+(\w+)$/) ||
                      expr.match(/^convert\s+(.+?)\s+from\s+(\S+)\s+to\s+(\S+)$/i);
    if (convMatch) return evalConversion(convMatch);

    // ── Normal expression ───────────────────────────────────
    try {
      const processed = preprocess(expr);
      // Build function body with all named functions injected
      const fnKeys = Object.keys(FN);
      const fnVals = Object.values(FN);
      const varCode = Object.entries(vars)
        .map(([k,v]) => `const ${k === 'E_' ? '_E_var' : k} = ${v};`).join('\n');

      const code = `"use strict";
        ${varCode}
        return (${processed});`;

      const result = new Function(...fnKeys, 'Math', code)(...fnVals, Math);

      if (result === null || result === undefined) return { value: null, display: 'null', error: null };
      if (Array.isArray(result))    return { value: result, display: formatArray(result), error: null };
      if (typeof result === 'object') return { value: result, display: JSON.stringify(result, null, 2), error: null };
      if (typeof result !== 'number') return { value: result, display: String(result), error: null };
      if (isNaN(result))             return { value: NaN,    display: 'Math Error',      error: 'Math Error' };
      if (!isFinite(result))         return { value: result, display: result > 0 ? '∞' : '-∞', error: null };

      preAns = ans;
      ans = result;

      return {
        value: result,
        display: formatNumber(result),
        fraction: toFraction(result),
        sci: result.toExponential(6),
        eng: toEngineering(result),
        error: null,
      };
    } catch (err) {
      return { value: null, display: '', error: err.message ?? 'Syntax Error' };
    }
  }

  // ── Special evaluators ────────────────────────────────────

  function evalMatrix(expr) {
    try {
      const inner = expr.replace(/^mat\s*/,'');
      const M = JSON.parse(inner);
      if (typeof Matrix !== 'undefined') {
        const d = Matrix.det(M);
        const inv = (() => { try { return Matrix.inverse(M); } catch { return null; } })();
        const tr = Matrix.trace(M);
        const { eigenvalues } = Matrix.eigenPower(M);
        return {
          value: M, display: Matrix.toString(M),
          det: d, trace: tr, inverse: inv,
          eigenvalues,
          error: null,
        };
      }
      return { value: M, display: JSON.stringify(M), error: null };
    } catch (e) {
      return { value: null, display: '', error: 'Matrix parse error: ' + e.message };
    }
  }

  function evalComplex(expr) {
    try {
      // Parse: a+bi, a-bi, bi, a
      const s = expr.replace(/\s/g,'').replace(/j/gi,'i');
      let re = 0, im = 0;
      const fullMatch = s.match(/^([+-]?\d*\.?\d+)([+-]\d*\.?\d*)i$/);
      const pureIm   = s.match(/^([+-]?\d*\.?\d*)i$/);
      const pureRe   = s.match(/^([+-]?\d*\.?\d+)$/);
      if (fullMatch)  { re = parseFloat(fullMatch[1]); im = parseFloat(fullMatch[2]||'1'); }
      else if (pureIm){ im = parseFloat(pureIm[1]||'1'); }
      else if (pureRe){ re = parseFloat(pureRe[1]); }
      else { const v = evalRaw(expr); re = isNaN(v)?0:v; }

      if (typeof Complex !== 'undefined') {
        const z = Complex.c(re, im);
        return {
          value: z,
          display: Complex.toString(z),
          modulus: Complex.modulus(z),
          argument: Complex.argument(z) * 180/Math.PI,
          polar: `${Complex.modulus(z).toFixed(6)} ∠ ${(Complex.argument(z)*180/Math.PI).toFixed(4)}°`,
          error: null,
        };
      }
      return { value: {re, im}, display: `${re} + ${im}i`, error: null };
    } catch (e) {
      return { value: null, display: '', error: 'Complex parse error' };
    }
  }

  function evalSolve(expr) {
    // solve(x^2-4, x, 1)  or  solve(x^2-4)
    const inner = expr.match(/^solve\s*\((.+)\)$/)?.[1] ?? '';
    const parts = inner.split(',').map(s=>s.trim());
    const exprStr = parts[0];
    const varName = parts[1] ?? 'x';
    const guess   = parseFloat(parts[2] ?? '1');

    let x = isNaN(guess) ? 1 : guess;
    const fn = v => evalRaw(exprStr.replace(new RegExp(`\\b${varName}\\b`,'g'), `(${v})`));
    let converged = false;

    for (let i=0; i<500; i++) {
      const fv  = fn(x);
      const h   = Math.max(1e-8*Math.abs(x), 1e-10);
      const dfv = (fn(x+h)-fn(x-h))/(2*h);
      if (Math.abs(dfv) < 1e-15) break;
      const nx = x - fv/dfv;
      if (Math.abs(nx-x) < 1e-11 && Math.abs(fv) < 1e-8) { x=nx; converged=true; break; }
      x = nx;
      if (!isFinite(x)) { x = NaN; break; }
    }

    if (!converged) return { value: NaN, display: 'No solution found', error: 'No convergence' };
    ans = x;
    return { value: x, display: `${varName} = ${formatNumber(x)}`, error: null };
  }

  function evalQuadratic(expr) {
    // quad(a, b, c)
    const inner = expr.match(/^quad\s*\((.+)\)$/)?.[1] ?? '';
    const [a,b,c] = inner.split(',').map(s=>parseFloat(s.trim()));
    if ([a,b,c].some(isNaN)) return { value: null, display: '', error: 'Invalid coefficients' };

    if (typeof Algebra !== 'undefined') {
      const res = Algebra.quadratic(a, b, c);
      const roots = res.roots.map(r => r.im === 0 ? formatNumber(r.re) : `${formatNumber(r.re)} ± ${formatNumber(Math.abs(r.im))}i`);
      return { value: res.roots, display: 'x = ' + roots.join('  ,  '), disc: res.disc, error: null };
    }
    return { value: null, display: '', error: 'Algebra module not loaded' };
  }

  function evalStats(expr) {
    const inner = expr.match(/^stats\s*\((.+)\)$/)?.[1] ?? '';
    const data = inner.split(',').map(s=>parseFloat(s.trim())).filter(v=>!isNaN(v));
    if (data.length === 0) return { value: null, display: '', error: 'No data' };

    if (typeof Statistics !== 'undefined') {
      const s = Statistics.summary(data);
      const lines = [
        `n = ${s.n}`,
        `mean = ${formatNumber(s.mean)}`,
        `median = ${formatNumber(s.median)}`,
        `SD = ${formatNumber(s.stdDev)}`,
        `variance = ${formatNumber(s.variance)}`,
        `min = ${s.min}  max = ${s.max}`,
        `Q1 = ${formatNumber(s.q1)}  Q3 = ${formatNumber(s.q3)}`,
        `skewness = ${formatNumber(s.skewness)}`,
      ];
      return { value: s, display: lines.join('\n'), error: null };
    }
    return { value: null, display: '', error: 'Statistics module not loaded' };
  }

  function evalConversion(match) {
    // "100 km to m" or "100 from km to m"
    let val, from, to;
    if (match[0].includes('from')) { val=parseFloat(match[1]); from=match[2]; to=match[3]; }
    else { val=parseFloat(match[1]); from=match[2]; to=match[3]; }

    if (typeof Units !== 'undefined') {
      const cat = Units.findCategory(from);
      if (!cat) return { value: null, display: '', error: `Unknown unit: ${from}` };
      try {
        const result = Units.convert(val, from, to, cat);
        return { value: result, display: `${formatNumber(result)} ${to}`, error: null };
      } catch (e) {
        return { value: null, display: '', error: e.message };
      }
    }
    return { value: null, display: '', error: 'Units module not loaded' };
  }

  // ── Number formatting ─────────────────────────────────────
  function formatNumber(v) {
    if (!isFinite(v)) return v > 0 ? '∞' : '-∞';
    if (isNaN(v)) return 'Math Error';
    if (v === 0) return '0';
    const abs = Math.abs(v);
    if (Number.isInteger(v) && abs < 1e15) return String(v);
    if (abs >= 1e14 || (abs < 1e-6 && abs > 0)) {
      return v.toExponential(8)
        .replace(/\.?0+(e)/, '$1')
        .replace('e+', '×10^')
        .replace('e-', '×10^−');
    }
    return String(parseFloat(v.toPrecision(12)));
  }

  function toEngineering(v) {
    if (!isFinite(v) || v === 0) return String(v);
    const exp3 = Math.floor(Math.log10(Math.abs(v))/3)*3;
    const clamp = Math.max(-18, Math.min(18, exp3));
    const prefixes = { 18:'E',15:'P',12:'T',9:'G',6:'M',3:'k',0:'','-3':'m','-6':'μ','-9':'n','-12':'p','-15':'f','-18':'a' };
    const mant = v / Math.pow(10, clamp);
    return `${parseFloat(mant.toPrecision(6))} ${prefixes[String(clamp)] ?? `×10^${clamp}`}`;
  }

  function toFraction(v) {
    if (!isFinite(v) || isNaN(v)) return null;
    if (Number.isInteger(v)) return null;
    for (let d=1; d<=10000; d++) {
      const n = Math.round(v*d);
      if (Math.abs(n/d - v) < 1e-10) {
        const g = gcdSimple(Math.abs(n), d);
        return { n: n/g, d: d/g, str: `${n/g}/${d/g}` };
      }
    }
    return null;
  }

  function gcdSimple(a,b) { while(b){const t=b;b=a%b;a=t;} return a; }
  function formatArray(a) { return '[' + a.map(v=>typeof v==='number'?formatNumber(v):v).join(', ') + ']'; }

  // ── State management ──────────────────────────────────────
  function setAngleMode(m) {
    angleMode = m.toUpperCase();
    if (typeof Trigonometry !== 'undefined') Trigonometry.setMode(angleMode);
  }
  function getAngleMode()    { return angleMode; }
  function setVar(name, val) { vars[name] = val; }
  function getVar(name)      { return vars[name] ?? 0; }
  function getAns()          { return ans; }
  function getPreAns()       { return preAns; }
  function setAns(v)         { preAns = ans; ans = v; }
  function mPlus(v)          { memory += v; }
  function mMinus(v)         { memory -= v; }
  function mRecall()         { return memory; }
  function mClear()          { memory = 0; }
  function getAllVars()       { return { ...vars }; }

  // ── Public API ────────────────────────────────────────────
  return {
    evaluate, evalRaw,
    setAngleMode, getAngleMode,
    setVar, getVar, getAllVars,
    getAns, getPreAns, setAns,
    mPlus, mMinus, mRecall, mClear,
    formatNumber, toFraction, toEngineering,
    FN, CONSTS,
  };

})();

if (typeof module !== 'undefined') module.exports = CalcEngine;
else window.CalcEngine = CalcEngine;
