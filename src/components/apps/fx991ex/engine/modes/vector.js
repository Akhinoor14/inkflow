// Vector operations (3D)
export function vAdd(a, b) { return a.map((v,i)=>v+b[i]) }
export function vSub(a, b) { return a.map((v,i)=>v-b[i]) }
export function vScale(a, s) { return a.map(v=>v*s) }
export function vDot(a, b) { return a.reduce((s,v,i)=>s+v*b[i],0) }
export function vCross(a, b) {
  if (a.length!==3||b.length!==3) throw new Error('3D only')
  return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
}
export function vMag(a) { return Math.sqrt(a.reduce((s,v)=>s+v*v,0)) }
export function vUnit(a) { const m=vMag(a); if(m<1e-12) throw new Error('Zero vector'); return a.map(v=>v/m) }
export function vAngle(a, b) {
  const d = vDot(a,b) / (vMag(a)*vMag(b))
  return Math.acos(Math.max(-1,Math.min(1,d))) * 180 / Math.PI
}
export function fmtVec(v) {
  return '['+v.map(x=>parseFloat(x.toPrecision(8))).join(', ')+']'
}
