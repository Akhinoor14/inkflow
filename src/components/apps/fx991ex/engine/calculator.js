// fx-991EX ClassWiz — Core Math Engine
import { create, all } from 'mathjs'

const math = create(all)
math.config({ number: 'number', precision: 14 })

// ── Angle mode ────────────────────────────────────────────────────────────────
let _angleMode = 'DEG'
export const setAngleMode = m => { _angleMode = m }
export const getAngleMode = ()  => _angleMode

function toRad(v) {
  if (_angleMode === 'RAD')  return v
  if (_angleMode === 'GRAD') return v * Math.PI / 200
  return v * Math.PI / 180
}
function fromRad(v) {
  if (_angleMode === 'RAD')  return v
  if (_angleMode === 'GRAD') return v * 200 / Math.PI
  return v * 180 / Math.PI
}

// ── Answer memory ─────────────────────────────────────────────────────────────
let _ans    = 0
let _preAns = 0
export const setAns    = v  => { _preAns = _ans; _ans = v }
export const getAns    = () => _ans
export const getPreAns = () => _preAns

// ── Variable memory ───────────────────────────────────────────────────────────
const _vars = { A:0,B:0,C:0,D:0,E:0,F:0,M:0,x:0,y:0 }
export const setVar = (n,v) => { _vars[n] = v }
export const getVar = n     => _vars[n]

// ── M memory ──────────────────────────────────────────────────────────────────
export const mPlus   = v => { _vars.M += v }
export const mMinus  = v => { _vars.M -= v }
export const mRecall = () => _vars.M
export const mClear  = () => { _vars.M = 0 }

// ── Math scope (functions available in expressions) ───────────────────────────
const SCOPE = {
  // Trig — angle-mode aware
  sin:  v => Math.sin(toRad(v)),
  cos:  v => Math.cos(toRad(v)),
  tan:  v => {
    const r = toRad(v)
    if (Math.abs(Math.cos(r)) < 1e-13) throw new Error('Math Error')
    return Math.tan(r)
  },
  asin: v => { if (v<-1||v>1) throw new Error('Domain Error'); return fromRad(Math.asin(v)) },
  acos: v => { if (v<-1||v>1) throw new Error('Domain Error'); return fromRad(Math.acos(v)) },
  atan: v => fromRad(Math.atan(v)),
  atan2: (y,x) => fromRad(Math.atan2(y,x)),

  // Hyperbolic
  sinh:  v => Math.sinh(v),
  cosh:  v => Math.cosh(v),
  tanh:  v => Math.tanh(v),
  asinh: v => Math.asinh(v),
  acosh: v => { if (v<1) throw new Error('Domain Error'); return Math.acosh(v) },
  atanh: v => { if (Math.abs(v)>=1) throw new Error('Domain Error'); return Math.atanh(v) },

  // Logarithms
  log:   v => { if (v<=0) throw new Error('Domain Error'); return Math.log(v) },
  log10: v => { if (v<=0) throw new Error('Domain Error'); return Math.log10(v) },
  log2:  v => { if (v<=0) throw new Error('Domain Error'); return Math.log2(v) },
  logb:  (v,b) => { if (v<=0||b<=0||b===1) throw new Error('Domain Error'); return Math.log(v)/Math.log(b) },

  // Roots & powers
  sqrt:  v => { if (v<0) throw new Error('Domain Error'); return Math.sqrt(v) },
  cbrt:  v => Math.cbrt(v),
  abs:   v => Math.abs(v),
  exp:   v => Math.exp(v),

  // Combinatorics
  factorial: v => {
    v = Math.round(v)
    if (v<0||v>69) throw new Error('Math Error')
    let r=1; for(let i=2;i<=v;i++) r*=i; return r
  },
  nPr: (n,r) => {
    n=Math.round(n); r=Math.round(r)
    if(r>n||r<0||n<0) throw new Error('Math Error')
    let res=1; for(let i=n;i>n-r;i--) res*=i; return res
  },
  nCr: (n,r) => {
    n=Math.round(n); r=Math.round(r)
    if(r>n||r<0||n<0) throw new Error('Math Error')
    r=Math.min(r,n-r)
    let num=1,den=1
    for(let i=0;i<r;i++){num*=(n-i);den*=(i+1)}
    return Math.round(num/den)
  },

  // Number theory
  gcd: (a,b) => {
    a=Math.abs(Math.round(a)); b=Math.abs(Math.round(b))
    while(b){[a,b]=[b,a%b]} return a
  },
  lcm: (a,b) => {
    const g = SCOPE.gcd(a,b); return g===0?0:Math.abs(Math.round(a)*Math.round(b))/g
  },
  mod: (a,b) => ((a%b)+b)%b,

  // Polar / Rectangular
  Pol: (x,y) => { const r=Math.sqrt(x*x+y*y); const t=fromRad(Math.atan2(y,x)); return r }, // returns r
  Rec: (r,t) => r * Math.cos(toRad(t)), // returns x

  // Misc
  floor: Math.floor,
  ceil:  Math.ceil,
  round: Math.round,
  sign:  Math.sign,
  max:   (...a) => Math.max(...a),
  min:   (...a) => Math.min(...a),

  // Constants
  pi:  Math.PI,
  π:   Math.PI,
  e:   Math.E,
  Inf: Infinity,
}

// ── Expression preprocessor ───────────────────────────────────────────────────
function preprocess(expr) {
  let e = expr.trim()

  // Display symbols → ASCII
  e = e.replace(/×/g, '*')
  e = e.replace(/÷/g, '/')
  e = e.replace(/−/g, '-')       // Unicode minus → hyphen-minus
  e = e.replace(/π/g, 'pi')

  // Ans / PreAns substitution
  e = e.replace(/\bAns\b/g,    String(_ans))
  e = e.replace(/\bPreAns\b/g, String(_preAns))

  // Implicit multiplication: 2π → 2*pi,  3sin → 3*sin,  )(  →  )*(
  e = e.replace(/(\d)(pi|e\b)/g,  '$1*$2')
  e = e.replace(/(\d)([a-zA-Z(])/g, '$1*$2')
  e = e.replace(/\)(\d)/g, ')*$1')
  e = e.replace(/\)\(/g, ')*(')

  // Exponent notation  ×10^ or ×10^  (already replaced × above)  e.g. 1.5*10^3
  // (handled naturally after × → * above)

  // Degree symbol → convert to just the number (already in current angle mode)
  // °  in expressions like 90°: strip the symbol, value stays
  e = e.replace(/°/g, '')

  // nPr / nCr  e.g.  5P3 → nPr(5,3)
  e = e.replace(/(\d+(?:\.\d+)?)P(\d+(?:\.\d+)?)/g, 'nPr($1,$2)')
  e = e.replace(/(\d+(?:\.\d+)?)C(\d+(?:\.\d+)?)/g, 'nCr($1,$2)')

  // Factorial  5! → factorial(5)
  e = e.replace(/(\d+)!/g, 'factorial($1)')

  // log(x) without base → log10
  // log(a,b) → logb(a,b)  keep as-is (handled in scope via math.js)
  e = e.replace(/\blog\(/g, 'log10(')
  e = e.replace(/\bln\(/g,  'log(')

  // logₐ notation (fallback)
  e = e.replace(/log_(\w+)\(/, 'logb(')

  // mod keyword
  e = e.replace(/\bmod\b/g, '%')

  // lim( → just evaluate (no symbolic limit — remove keyword)
  e = e.replace(/\blim\s*\(/g, '(')

  return e
}

// ── Main evaluator ────────────────────────────────────────────────────────────
export function evaluate(expr) {
  try {
    const processed = preprocess(expr)
    // Use mathjs evaluate with our custom scope
    const result = math.evaluate(processed, SCOPE)
    if (typeof result === 'number') {
      if (isNaN(result)) throw new Error('Math Error')
      return result
    }
    // mathjs returned a complex or matrix
    if (result && typeof result.toNumber === 'function') return result.toNumber()
    if (result !== undefined) return Number(result)
    throw new Error('Syntax Error')
  } catch(err) {
    const msg = err.message || 'Error'
    if (msg.includes('Math Error')||msg.includes('Domain Error')) throw err
    if (msg.includes('Unexpected')||msg.includes('syntax')||msg.includes('parse')) throw new Error('Syntax Error')
    if (msg.includes('Undefined symbol')) {
      const sym = msg.match(/Undefined symbol (\w+)/)?.[1]
      throw new Error(sym ? `Unknown: ${sym}` : 'Syntax Error')
    }
    throw new Error(msg)
  }
}

// ── Number formatting ─────────────────────────────────────────────────────────
export function formatResult(val) {
  if (typeof val !== 'number') return String(val)
  if (!isFinite(val)) return val > 0 ? '∞' : '-∞'
  if (isNaN(val)) return 'Math Error'
  const abs = Math.abs(val)
  // Scientific for very large/small
  if (abs !== 0 && (abs >= 1e10 || abs < 1e-9)) {
    return val.toExponential(9)
      .replace(/\.?0+e/, 'e')
      .replace('e+', '×10^')
      .replace('e-', '×10^-')
      .replace('e', '×10^')
  }
  if (Number.isInteger(val) && abs < 1e12) return String(val)
  // Up to 10 significant figures
  let s = parseFloat(val.toPrecision(10)).toString()
  return s
}

// ── Fraction detection ────────────────────────────────────────────────────────
function gcd(a, b) { a=Math.abs(a); b=Math.abs(b); while(b){[a,b]=[b,a%b]} return a }

export function toFraction(val) {
  if (!Number.isFinite(val)) return null
  if (Number.isInteger(val)) return null
  for (let d = 2; d <= 999; d++) {
    const n = Math.round(val * d)
    if (Math.abs(n/d - val) < 1e-10) {
      const g = gcd(Math.abs(n), d)
      const nd = n/g, dd = d/g
      if (dd === 1) return null
      if (Math.abs(nd) > 9999 || dd > 9999) return null
      return { n: nd, d: dd }
    }
  }
  return null
}

// ── Numerical integration (15-point Gauss-Kronrod) ───────────────────────────
export function integrate(fn, a, b, tol=1e-8) {
  // Adaptive Gauss-Kronrod G7K15
  const nodes15 = [
    0, 0.2077849550078985, 0.4058451513773972, 0.5860872354676911,
    0.7415311855993945, 0.8648644233597691, 0.9491079123427585, 0.9914553711208126
  ]
  const wK15 = [
    0.2094821410847278, 0.2044329400752989, 0.1903505780647854, 0.1690047266392679,
    0.1406532597155259, 0.1047900103222502, 0.0630920926299786, 0.0229353220105292
  ]

  function gk15(a, b) {
    const m = (a+b)/2, h = (b-a)/2
    let s = wK15[0] * fn(m)
    for (let i=1; i<8; i++) {
      s += wK15[i] * (fn(m+h*nodes15[i]) + fn(m-h*nodes15[i]))
    }
    return h * s
  }

  // Adaptive recursion
  function adapt(a, b, depth=0) {
    const whole = gk15(a, b)
    if (depth > 20) return whole
    const m = (a+b)/2
    const left  = gk15(a, m)
    const right = gk15(m, b)
    if (Math.abs(left+right-whole) < tol) return left+right
    return adapt(a, m, depth+1) + adapt(m, b, depth+1)
  }

  return adapt(a, b)
}

// ── Numerical derivative (5-point central difference) ────────────────────────
export function derivative(fn, x) {
  const h = Math.max(Math.abs(x) * 1e-5, 1e-7)
  return (-fn(x+2*h) + 8*fn(x+h) - 8*fn(x-h) + fn(x-2*h)) / (12*h)
}

// ── Summation ─────────────────────────────────────────────────────────────────
export function summation(fn, start, end) {
  let sum = 0
  for (let i = start; i <= end; i++) sum += fn(i)
  return sum
}

// ── Polar / Rectangular ───────────────────────────────────────────────────────
export function polToRec(r, theta) {
  const rad = toRad(theta)
  return { x: r*Math.cos(rad), y: r*Math.sin(rad) }
}
export function recToPol(x, y) {
  return { r: Math.sqrt(x*x+y*y), theta: fromRad(Math.atan2(y,x)) }
}

// ── Random ────────────────────────────────────────────────────────────────────
export function ranNum()    { return Math.floor(Math.random()*1000)/1000 }
export function ranInt(a,b) { return Math.floor(Math.random()*(b-a+1))+a }

// ── Number theory ─────────────────────────────────────────────────────────────
export function gcdCalc(a,b) { return SCOPE.gcd(a,b) }
export function lcmCalc(a,b) { return SCOPE.lcm(a,b) }

export function factorize(n) {
  n = Math.abs(Math.round(n))
  if (n<2) return [n]
  const f=[]; let d=2
  while(d*d<=n){ while(n%d===0){f.push(d);n/=d} d++ }
  if(n>1) f.push(n)
  return f
}
