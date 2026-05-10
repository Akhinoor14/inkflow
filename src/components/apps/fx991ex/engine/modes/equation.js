// ===== Polynomial solvers =====

// Quadratic: ax² + bx + c = 0
export function solveQuadratic(a, b, c) {
  if (a === 0) return b !== 0 ? [{ re: -c/b, im: 0 }] : []
  const D = b*b - 4*a*c
  if (D >= 0) return [
    { re: (-b+Math.sqrt(D))/(2*a), im: 0 },
    { re: (-b-Math.sqrt(D))/(2*a), im: 0 }
  ]
  return [
    { re: -b/(2*a), im:  Math.sqrt(-D)/(2*a) },
    { re: -b/(2*a), im: -Math.sqrt(-D)/(2*a) }
  ]
}

// Cubic: ax³ + bx² + cx + d = 0 (Cardano's method)
export function solveCubic(a, b, c, d) {
  if (a === 0) return solveQuadratic(b, c, d)
  b/=a; c/=a; d/=a
  const p = c - b*b/3
  const q = 2*b*b*b/27 - b*c/3 + d
  const D = q*q/4 + p*p*p/27

  const shift = -b/3
  if (D > 0) {
    const sq = Math.sqrt(D)
    const u = Math.cbrt(-q/2+sq), v = Math.cbrt(-q/2-sq)
    const r1 = { re: u+v+shift, im: 0 }
    const re = -(u+v)/2+shift, im = (u-v)*Math.sqrt(3)/2
    return [r1, { re, im }, { re, im: -im }]
  } else if (D === 0) {
    const u = Math.cbrt(-q/2)
    return [{ re: 2*u+shift, im:0 }, { re: -u+shift, im:0 }, { re: -u+shift, im:0 }]
  } else {
    const r = Math.sqrt(-p*p*p/27)
    const theta = Math.acos(-q/(2*r))
    const mag = 2*Math.cbrt(r)
    return [0,1,2].map(k=>({ re: mag*Math.cos((theta+2*Math.PI*k)/3)+shift, im:0 }))
  }
}

// Quartic: ax⁴+bx³+cx²+dx+e=0 (numeric Newton's method)
export function solveQuartic(a, b, c, d, e) {
  if (a === 0) return solveCubic(b, c, d, e)
  b/=a; c/=a; d/=a; e/=a
  const f = x => x**4+b*x**3+c*x**2+d*x+e
  const df = x => 4*x**3+3*b*x**2+2*c*x+d
  const roots = []
  const starts = [-5,-2,-0.5,0.5,2,5]
  for (const s of starts) {
    let x = s
    for (let i = 0; i < 100; i++) {
      const dfv = df(x); if (Math.abs(dfv)<1e-14) break
      const dx = -f(x)/dfv; x+=dx; if(Math.abs(dx)<1e-12)break
    }
    if (Math.abs(f(x))<1e-8) {
      if (!roots.find(r=>Math.abs(r.re-x)<1e-6)) roots.push({re:parseFloat(x.toPrecision(10)),im:0})
    }
  }
  return roots
}

// ===== Linear system solver (Gaussian elimination) =====
// Coefficients matrix + RHS vector
export function solveLinear(coeffs, rhs) {
  const n = rhs.length
  const aug = coeffs.map((row,i)=>[...row, rhs[i]])
  for (let col=0; col<n; col++) {
    let maxRow=col
    for (let r=col+1; r<n; r++) if(Math.abs(aug[r][col])>Math.abs(aug[maxRow][col]))maxRow=r
    ;[aug[col],aug[maxRow]]=[aug[maxRow],aug[col]]
    const p=aug[col][col]
    if(Math.abs(p)<1e-12) throw new Error('No unique solution')
    aug[col]=aug[col].map(v=>v/p)
    for(let r=0;r<n;r++){
      if(r===col)continue
      const f=aug[r][col]
      aug[r]=aug[r].map((v,k)=>v-f*aug[col][k])
    }
  }
  return aug.map(row=>parseFloat(row[n].toPrecision(10)))
}

// ===== Inequality solvers =====
// Quadratic: ax²+bx+c > 0 (or <, >=, <=)
export function solveInequalityQuad(a, b, c, op) {
  const roots = solveQuadratic(a, b, c).filter(r=>Math.abs(r.im)<1e-10).map(r=>r.re).sort((a,b)=>a-b)
  if (roots.length < 2) {
    const above = a > 0
    if (op.includes('>')) return above ? '(-∞, +∞)' : 'No solution'
    return above ? 'No solution' : '(-∞, +∞)'
  }
  const [r1, r2] = roots
  const eq = op.includes('=')
  if (op.startsWith('>')) return a>0
    ? `${eq?'[':'('}${fmtN(r1)}, ${fmtN(r2)}${eq?']':')'} — OUTSIDE: (-∞,${fmtN(r1)}) ∪ (${fmtN(r2)},+∞)`
    : `(-∞, ${fmtN(r1)}${eq?']':')'} ∪ ${eq?'[':'('}${fmtN(r2)}, +∞)`
  return a>0
    ? `${eq?'[':'('}${fmtN(r1)}, ${fmtN(r2)}${eq?']':')'}`
    : `(-∞, ${fmtN(r1)}${eq?']':')'} ∪ ${eq?'[':'('}${fmtN(r2)}, +∞)`
}

function fmtN(v) { return parseFloat(v.toPrecision(8)).toString() }
