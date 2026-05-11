// Base-N conversion: BIN, OCT, DEC, HEX + logic ops

export function toBin(n) { return (n >>> 0).toString(2) }
export function toOct(n) { return (n >>> 0).toString(8) }
export function toDec(n) { return (n >>> 0).toString(10) }
export function toHex(n) { return (n >>> 0).toString(16).toUpperCase() }

export function fromBase(str, base) {
  const v = parseInt(str.replace(/\s/g,''), base)
  if (isNaN(v)) throw new Error('Input Error')
  return v
}

export function logicAnd(a, b)  { return (a & b) >>> 0 }
export function logicOr(a, b)   { return (a | b) >>> 0 }
export function logicXor(a, b)  { return (a ^ b) >>> 0 }
export function logicXnor(a, b) { return (~(a ^ b)) >>> 0 }
export function logicNot(a)     { return (~a) >>> 0 }

export function convertAll(n) {
  const u = n >>> 0
  return { dec: toDec(u), bin: toBin(u), oct: toOct(u), hex: toHex(u) }
}
