import React, { useState } from 'react'
import { matAdd, matSub, matMul, matScale, matTranspose, matInverse, matDet, matRef, matRref, matPow, fmtMatrix } from '../../engine/modes/matrix.js'

function emptyMatrix(r,c) { return Array.from({length:r},()=>Array(c).fill('0')) }

export default function MatrixMode() {
  const [sizeA, setSizeA] = useState([2,2])
  const [sizeB, setSizeB] = useState([2,2])
  const [matA, setMatA] = useState(emptyMatrix(2,2))
  const [matB, setMatB] = useState(emptyMatrix(2,2))
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const parseMatrix = (m) => m.map(row=>row.map(v=>{
    const n=parseFloat(v); if(isNaN(n)) throw new Error('Input Error'); return n
  }))

  const apply = (op) => {
    try {
      const A = parseMatrix(matA)
      let R
      if (op==='det')   R = 'det(A) = ' + matDet(A).toPrecision(10)
      else if (op==='inv')   R = fmtMatrix(matInverse(A))
      else if (op==='trans') R = fmtMatrix(matTranspose(A))
      else if (op==='ref')   R = fmtMatrix(matRef(A))
      else if (op==='rref')  R = fmtMatrix(matRref(A))
      else if (op==='sq')    R = fmtMatrix(matPow(A,2))
      else if (op==='add'||op==='sub'||op==='mul') {
        const B = parseMatrix(matB)
        if (op==='add') R = fmtMatrix(matAdd(A,B))
        if (op==='sub') R = fmtMatrix(matSub(A,B))
        if (op==='mul') R = fmtMatrix(matMul(A,B))
      }
      setResult(R)
      setError('')
    } catch(e) { setError(e.message); setResult(null) }
  }

  const updateCell = (mat, setMat, r, c, v) => {
    const m = mat.map(row=>[...row]); m[r][c]=v; setMat(m)
  }

  const resizeMatrix = (which, rows, cols) => {
    if (which==='A') { setSizeA([rows,cols]); setMatA(emptyMatrix(rows,cols)) }
    else             { setSizeB([rows,cols]); setMatB(emptyMatrix(rows,cols)) }
  }

  const MatrixInput = ({mat, setMat, size, label}) => (
    <div style={{marginBottom:'5px'}}>
      <div style={{fontSize:'8px',marginBottom:'2px',display:'flex',gap:'4px',alignItems:'center'}}>
        <span>{label}</span>
        {[2,3,4].map(r=>[2,3,4].map(c=>(
          <button key={`${r}x${c}`} onClick={()=>resizeMatrix(label,r,c)}
            style={{fontSize:'6px',padding:'1px 2px',background:size[0]===r&&size[1]===c?'rgba(26,42,26,0.3)':'transparent',
                    border:'1px solid rgba(26,42,26,0.3)',borderRadius:'1px',cursor:'pointer',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)'}}>
            {r}×{c}
          </button>
        )))}
      </div>
      <div className="matrix-grid" style={{gridTemplateColumns:`repeat(${size[1]},1fr)`}}>
        {mat.map((row,r)=>row.map((v,c)=>(
          <input key={`${r}-${c}`} className="matrix-cell" value={v}
            onChange={e=>updateCell(mat,setMat,r,c,e.target.value)} />
        )))}
      </div>
    </div>
  )

  return (
    <div className="mode-screen">
      <div className="mode-header">MATRIX</div>
      <MatrixInput mat={matA} setMat={setMatA} size={sizeA} label="A" />
      <MatrixInput mat={matB} setMat={setMatB} size={sizeB} label="B" />
      <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginBottom:'5px'}}>
        {[['det','det(A)'],['inv','A⁻¹'],['trans','Aᵀ'],['ref','Ref'],['rref','Rref'],
          ['sq','A²'],['add','A+B'],['sub','A-B'],['mul','A×B']].map(([op,lbl])=>(
          <button key={op} onClick={()=>apply(op)}
            style={{fontSize:'7px',padding:'2px 4px',background:'rgba(26,42,26,0.12)',
                    border:'1px solid rgba(26,42,26,0.35)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {lbl}
          </button>
        ))}
      </div>
      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {result && <pre style={{fontSize:'8px',lineHeight:'1.4',whiteSpace:'pre-wrap'}}>{result}</pre>}
    </div>
  )
}
