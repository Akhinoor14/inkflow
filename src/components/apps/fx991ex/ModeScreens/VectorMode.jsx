import React, { useState } from 'react'
import { vAdd, vSub, vDot, vCross, vMag, vUnit, vAngle, vScale, fmtVec } from '../engine/modes/vector.js'

export default function VectorMode() {
  const [a, setA] = useState(['1','2','3'])
  const [b, setB] = useState(['4','5','6'])
  const [scalar, setScalar] = useState('2')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const pv = v => v.map(x=>{const n=parseFloat(x);if(isNaN(n))throw new Error('Input Error');return n})

  const apply = (op) => {
    try {
      const A = pv(a), B = pv(b)
      let R
      if (op==='add')    R = fmtVec(vAdd(A,B))
      else if (op==='sub')    R = fmtVec(vSub(A,B))
      else if (op==='dot')    R = 'A·B = '+vDot(A,B).toPrecision(10)
      else if (op==='cross')  R = fmtVec(vCross(A,B))
      else if (op==='magA')   R = '|A| = '+vMag(A).toPrecision(10)
      else if (op==='magB')   R = '|B| = '+vMag(B).toPrecision(10)
      else if (op==='unitA')  R = 'Â = '+fmtVec(vUnit(A))
      else if (op==='angle')  R = 'θ = '+vAngle(A,B).toPrecision(8)+'°'
      else if (op==='scaleA') R = fmtVec(vScale(A,parseFloat(scalar)))
      setResult(R); setError('')
    } catch(e) { setError(e.message); setResult('') }
  }

  const VecInput = ({v, setV, label}) => (
    <div style={{display:'flex',gap:'3px',alignItems:'center',marginBottom:'3px',fontSize:'8px'}}>
      <span>{label}:</span>
      {v.map((val,i)=>(
        <input key={i} value={val} onChange={e=>{const nv=[...v];nv[i]=e.target.value;setV(nv)}}
          style={{width:'30px',background:'transparent',border:'none',
                  borderBottom:'1px solid rgba(26,42,26,0.5)',fontFamily:'var(--font-display)',
                  fontSize:'9px',color:'var(--lcd-dark)',textAlign:'center',outline:'none'}} />
      ))}
    </div>
  )

  return (
    <div className="mode-screen">
      <div className="mode-header">VECTOR 3D</div>
      <VecInput v={a} setV={setA} label="A" />
      <VecInput v={b} setV={setB} label="B" />
      <div style={{fontSize:'8px',marginBottom:'5px',display:'flex',alignItems:'center',gap:'4px'}}>
        k: <input value={scalar} onChange={e=>setScalar(e.target.value)}
          style={{width:'30px',background:'transparent',border:'none',
                  borderBottom:'1px solid rgba(26,42,26,0.5)',fontFamily:'var(--font-display)',
                  fontSize:'9px',color:'var(--lcd-dark)',textAlign:'center',outline:'none'}} />
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginBottom:'5px'}}>
        {[['add','A+B'],['sub','A-B'],['dot','A·B'],['cross','A×B'],
          ['magA','|A|'],['magB','|B|'],['unitA','Â'],['angle','θ(A,B)'],['scaleA','k·A']].map(([op,lbl])=>(
          <button key={op} onClick={()=>apply(op)}
            style={{fontSize:'7px',padding:'2px 4px',background:'rgba(26,42,26,0.12)',
                    border:'1px solid rgba(26,42,26,0.35)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {lbl}
          </button>
        ))}
      </div>
      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {result && <div style={{fontSize:'11px',fontWeight:'bold',textAlign:'right'}}>{result}</div>}
    </div>
  )
}
