// Complex number operations
export function parseComplex(str) {
  str = str.trim().replace(/\s/g, '')
  // Forms: a+bi, a-bi, bi, a, i
  const match = str.match(/^([+-]?\d*\.?\d+)?([+-]\d*\.?\d*)?i$/)
  if (match) {
    const re = parseFloat(match[1] || '0')
    let imStr = match[2]
    let im = 0
    if (imStr === undefined) { im = 0 }
    else if (imStr === '+' || imStr === '') im = 1
    else if (imStr === '-') im = -1
    else im = parseFloat(imStr)
    return { re, im }
  }
  // Pure imaginary
  if (str === 'i') return { re: 0, im: 1 }
  if (str === '-i') return { re: 0, im: -1 }
  // Pure real
  const n = parseFloat(str)
  if (!isNaN(n)) return { re: n, im: 0 }
  return null
}

export function formatComplex(c, polar = false) {
  if (polar) {
    const r = Math.sqrt(c.re**2 + c.im**2)
    const theta = Math.atan2(c.im, c.re) * 180 / Math.PI
    return `${fmtN(r)}∠${fmtN(theta)}°`
  }
  const re = fmtN(c.re)
  const im = fmtN(Math.abs(c.im))
  if (c.im === 0) return re
  if (c.re === 0) return `${c.im < 0 ? '-' : ''}${im}i`
  return `${re}${c.im < 0 ? '-' : '+'}${im}i`
}

function fmtN(v) {
  if (Number.isInteger(v)) return String(v)
  return parseFloat(v.toPrecision(10)).toString()
}

export function cAdd(a, b) { return { re: a.re+b.re, im: a.im+b.im } }
export function cSub(a, b) { return { re: a.re-b.re, im: a.im-b.im } }
export function cMul(a, b) { return { re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re } }
export function cDiv(a, b) {
  const d = b.re**2 + b.im**2
  if (d === 0) throw new Error('Division by zero')
  return { re: (a.re*b.re + a.im*b.im)/d, im: (a.im*b.re - a.re*b.im)/d }
}
export function cAbs(c) { return Math.sqrt(c.re**2 + c.im**2) }
export function cArg(c) { return Math.atan2(c.im, c.re) * 180 / Math.PI }
export function cConj(c) { return { re: c.re, im: -c.im } }
export function cPow(c, n) {
  const r = Math.pow(cAbs(c), n)
  const theta = Math.atan2(c.im, c.re) * n
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) }
}
export function cSqrt(c) {
  const r = Math.sqrt(cAbs(c))
  const theta = Math.atan2(c.im, c.re) / 2
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) }
}
