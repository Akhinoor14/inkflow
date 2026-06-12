// Matrix operations up to 4x4

function det2(m) { return m[0][0]*m[1][1] - m[0][1]*m[1][0] }

function det3(m) {
  return m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
       - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
       + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0])
}

function det4(m) {
  let d = 0
  for (let c = 0; c < 4; c++) {
    const sub = m.filter((_,r)=>r!==0).map(row=>row.filter((_,cc)=>cc!==c))
    d += (c%2===0?1:-1) * m[0][c] * det3(sub)
  }
  return d
}

export function matDet(m) {
  const n = m.length
  if (n===2) return det2(m)
  if (n===3) return det3(m)
  if (n===4) return det4(m)
  throw new Error('Size Error')
}

export function matAdd(a, b) {
  return a.map((row,i)=>row.map((v,j)=>v+b[i][j]))
}

export function matSub(a, b) {
  return a.map((row,i)=>row.map((v,j)=>v-b[i][j]))
}

export function matMul(a, b) {
  const rows=a.length, cols=b[0].length, inner=b.length
  return Array.from({length:rows},(_,i)=>
    Array.from({length:cols},(_,j)=>
      Array.from({length:inner},(_,k)=>a[i][k]*b[k][j]).reduce((s,v)=>s+v,0)
    )
  )
}

export function matScale(m, s) {
  return m.map(row=>row.map(v=>v*s))
}

export function matTranspose(m) {
  return m[0].map((_,j)=>m.map(row=>row[j]))
}

export function matInverse(m) {
  const n = m.length
  // Augmented matrix [m | I]
  const aug = m.map((row,i)=>[...row,...Array.from({length:n},(_,j)=>i===j?1:0)])
  for (let col=0; col<n; col++) {
    let maxRow = col
    for (let r=col+1; r<n; r++) if (Math.abs(aug[r][col])>Math.abs(aug[maxRow][col])) maxRow=r;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]]
    const pivot = aug[col][col]
    if (Math.abs(pivot) < 1e-12) throw new Error('Singular Matrix')
    aug[col] = aug[col].map(v=>v/pivot)
    for (let r=0; r<n; r++) {
      if (r===col) continue
      const f = aug[r][col]
      aug[r] = aug[r].map((v,k)=>v-f*aug[col][k])
    }
  }
  return aug.map(row=>row.slice(n))
}

export function matPow(m, p) {
  if (p===0) return m.map((_,i)=>m[0].map((_,j)=>i===j?1:0))
  let result = m
  for (let i=1; i<p; i++) result = matMul(result, m)
  return result
}

export function matRef(m) {
  // Row echelon form
  const a = m.map(row=>[...row])
  const rows=a.length, cols=a[0].length
  let lead=0
  for (let r=0; r<rows; r++) {
    if (lead>=cols) break
    let i=r
    while (i<rows && Math.abs(a[i][lead])<1e-12) i++
    if (i===rows) { lead++; r--; continue }
    ;[a[r],a[i]]=[a[i],a[r]]
    const lv=a[r][lead]
    a[r]=a[r].map(v=>v/lv)
    for (let j=r+1; j<rows; j++) {
      const f=a[j][lead]
      a[j]=a[j].map((v,k)=>v-f*a[r][k])
    }
    lead++
  }
  return a.map(row=>row.map(v=>Math.abs(v)<1e-10?0:v))
}

export function matRref(m) {
  const a = matRef(m)
  const rows=a.length, cols=a[0].length
  for (let r=rows-1; r>=0; r--) {
    const lead=a[r].findIndex(v=>Math.abs(v)>1e-12)
    if (lead<0) continue
    for (let i=0; i<r; i++) {
      const f=a[i][lead]
      a[i]=a[i].map((v,k)=>v-f*a[r][k])
    }
  }
  return a.map(row=>row.map(v=>Math.abs(v)<1e-10?0:v))
}

export function fmtMatrix(m) {
  return m.map(row=>'['+row.map(v=>parseFloat(v.toPrecision(8))).join('  ')+']').join('\n')
}
