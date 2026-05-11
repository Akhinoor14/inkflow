import React, { useState } from 'react'
import { parseComplex, formatComplex, cAdd, cSub, cMul, cDiv, cAbs, cArg, cConj, cPow, cSqrt } from '../engine/modes/complex.js'

export default function ComplexMode() {
  const [a, setA] = useState('3+4i')
  const [b, setB] = useState('1-2i')
  const [polar, setPolar] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const calc = (op) => {
    try {
      const ca = parseComplex(a), cb = parseComplex(b)
      if (!ca) throw new Error('Input A error')
      let r
      if (op === 'add') r = cAdd(ca, cb)
      else if (op === 'sub') r = cSub(ca, cb)
      else if (op === 'mul') r = cMul(ca, cb)
      else if (op === 'div') r = cDiv(ca, cb)
      else if (op === 'abs') r = { re: cAbs(ca), im: 0, _scalar: true }
      else if (op === 'arg') r = { re: cArg(ca), im: 0, _scalar: true }
      else if (op === 'conj') r = cConj(ca)
      else if (op === 'sqrt') r = cSqrt(ca)
      setResult(r)
      setError('')
    } catch(e) { setError(e.message) }
  }

  const fmt = r => {
    if (!r) return ''
    if (r._scalar) return String(parseFloat(r.re.toPrecision(10)))
    return formatComplex(r, polar)
  }

  return (
    <div className="mode-screen">
      <div className="mode-header">COMPLEX</div>
      <div style={{fontSize:'8px',marginBottom:'4px'}}>
        A: <input value={a} onChange={e=>setA(e.target.value)}
          style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(26,42,26,0.5)',
                  fontFamily:'var(--font-display)',fontSize:'9px',color:'var(--lcd-dark)',width:'80px',outline:'none'}} />
      </div>
      <div style={{fontSize:'8px',marginBottom:'6px'}}>
        B: <input value={b} onChange={e=>setB(e.target.value)}
          style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(26,42,26,0.5)',
                  fontFamily:'var(--font-display)',fontSize:'9px',color:'var(--lcd-dark)',width:'80px',outline:'none'}} />
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginBottom:'6px'}}>
        {[['add','A+B'],['sub','A-B'],['mul','A×B'],['div','A÷B'],
          ['abs','|A|'],['arg','arg(A)'],['conj','conj(A)'],['sqrt','√A']].map(([op,lbl])=>(
          <button key={op} onClick={()=>calc(op)}
            style={{fontSize:'7px',padding:'2px 4px',background:'rgba(26,42,26,0.15)',
                    border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {lbl}
          </button>
        ))}
      </div>
      <label style={{fontSize:'7px',display:'flex',gap:'4px',alignItems:'center',cursor:'pointer'}}>
        <input type="checkbox" checked={polar} onChange={e=>setPolar(e.target.checked)} />
        Polar form (r∠θ°)
      </label>
      {error && <div style={{color:'#8a1a00',fontSize:'8px',marginTop:'4px'}}>{error}</div>}
      {result && <div style={{fontSize:'12px',textAlign:'right',fontWeight:'bold',marginTop:'4px'}}>
        = {fmt(result)}
      </div>}
    </div>
  )
}
