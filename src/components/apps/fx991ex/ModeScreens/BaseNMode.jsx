import React, { useState } from 'react'
import { convertAll, fromBase, logicAnd, logicOr, logicXor, logicXnor, logicNot } from '../engine/modes/baseN.js'

export default function BaseNMode() {
  const [inputBase, setInputBase] = useState('DEC')
  const [valA, setValA] = useState('255')
  const [valB, setValB] = useState('170')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const baseMap = { DEC:10, BIN:2, OCT:8, HEX:16 }

  const convert = () => {
    try {
      const n = fromBase(valA, baseMap[inputBase])
      setResult(convertAll(n))
      setError('')
    } catch(e) { setError(e.message) }
  }

  const logic = (op) => {
    try {
      const a = fromBase(valA, baseMap[inputBase])
      const b = fromBase(valB, baseMap[inputBase])
      let r
      if (op==='AND')  r = logicAnd(a,b)
      if (op==='OR')   r = logicOr(a,b)
      if (op==='XOR')  r = logicXor(a,b)
      if (op==='XNOR') r = logicXnor(a,b)
      if (op==='NOT')  r = logicNot(a)
      setResult(convertAll(r))
      setError('')
    } catch(e) { setError(e.message) }
  }

  return (
    <div className="mode-screen">
      <div className="mode-header">BASE-N</div>
      <div style={{display:'flex',gap:'4px',marginBottom:'4px'}}>
        {['DEC','BIN','OCT','HEX'].map(b=>(
          <button key={b} onClick={()=>setInputBase(b)}
            style={{fontSize:'7px',padding:'2px 4px',
                    background:inputBase===b?'rgba(26,42,26,0.3)':'rgba(26,42,26,0.08)',
                    border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {b}
          </button>
        ))}
      </div>
      <div style={{fontSize:'8px',marginBottom:'3px'}}>
        A: <input value={valA} onChange={e=>setValA(e.target.value)}
          style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(26,42,26,0.5)',
                  fontFamily:'var(--font-display)',fontSize:'9px',color:'var(--lcd-dark)',width:'90px',outline:'none'}} />
      </div>
      <div style={{fontSize:'8px',marginBottom:'5px'}}>
        B: <input value={valB} onChange={e=>setValB(e.target.value)}
          style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(26,42,26,0.5)',
                  fontFamily:'var(--font-display)',fontSize:'9px',color:'var(--lcd-dark)',width:'90px',outline:'none'}} />
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginBottom:'5px'}}>
        <button onClick={convert}
          style={{fontSize:'7px',padding:'2px 6px',background:'rgba(26,42,26,0.2)',
                  border:'1px solid rgba(26,42,26,0.5)',borderRadius:'2px',
                  fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer',fontWeight:'bold'}}>
          CONVERT A
        </button>
        {['AND','OR','XOR','XNOR','NOT'].map(op=>(
          <button key={op} onClick={()=>logic(op)}
            style={{fontSize:'7px',padding:'2px 4px',background:'rgba(26,42,26,0.1)',
                    border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {op}
          </button>
        ))}
      </div>
      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {result && (
        <div style={{fontSize:'9px'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><span>DEC</span><span>{result.dec}</span></div>
          <div style={{display:'flex',justifyContent:'space-between'}}><span>BIN</span><span style={{fontSize:'7px'}}>{result.bin}</span></div>
          <div style={{display:'flex',justifyContent:'space-between'}}><span>OCT</span><span>{result.oct}</span></div>
          <div style={{display:'flex',justifyContent:'space-between'}}><span>HEX</span><span>{result.hex}</span></div>
        </div>
      )}
    </div>
  )
}
