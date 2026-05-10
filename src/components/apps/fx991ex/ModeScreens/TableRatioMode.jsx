import React, { useState } from 'react'

export function TableMode() {
  const [expr, setExpr] = useState('x^2')
  const [start, setStart] = useState('0')
  const [end, setEnd] = useState('5')
  const [step, setStep] = useState('1')
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  const generate = () => {
    try {
      const s=parseFloat(start), e=parseFloat(end), st=parseFloat(step)
      if (isNaN(s)||isNaN(e)||isNaN(st)||st<=0) throw new Error('Range Error')
      const data = []
      for (let x=s; x<=e+1e-10; x=Math.round((x+st)*1e10)/1e10) {
        let y
        try {
          // Safe eval of expression with x
          const fn = new Function('x', `"use strict"; return (${expr.replace(/\^/g,'**')})`)
          y = fn(x)
        } catch { y = 'Error' }
        data.push({ x, y: typeof y==='number'?parseFloat(y.toPrecision(8)):y })
        if (data.length > 45) break
      }
      setRows(data); setError('')
    } catch(e) { setError(e.message); setRows(null) }
  }

  const inp = (label, val, set) => (
    <div style={{display:'inline-flex',gap:'2px',alignItems:'center',marginRight:'5px',fontSize:'8px'}}>
      <span>{label}</span>
      <input value={val} onChange={e=>set(e.target.value)}
        style={{width:'40px',background:'transparent',border:'none',
                borderBottom:'1px solid rgba(26,42,26,0.5)',fontFamily:'var(--font-display)',
                fontSize:'8px',color:'var(--lcd-dark)',outline:'none'}} />
    </div>
  )

  return (
    <div className="mode-screen">
      <div className="mode-header">TABLE f(x)</div>
      <div style={{fontSize:'8px',marginBottom:'4px',display:'flex',alignItems:'center',gap:'4px'}}>
        f(x)=<input value={expr} onChange={e=>setExpr(e.target.value)}
          style={{flex:1,background:'transparent',border:'none',
                  borderBottom:'1px solid rgba(26,42,26,0.5)',fontFamily:'var(--font-display)',
                  fontSize:'9px',color:'var(--lcd-dark)',outline:'none'}} />
      </div>
      <div style={{marginBottom:'4px'}}>
        {inp('Start:',start,setStart)}
        {inp('End:',end,setEnd)}
        {inp('Step:',step,setStep)}
      </div>
      <button onClick={generate}
        style={{fontSize:'7px',padding:'2px 8px',background:'rgba(26,42,26,0.2)',
                border:'1px solid rgba(26,42,26,0.5)',borderRadius:'2px',
                fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer',
                fontWeight:'bold',marginBottom:'4px'}}>
        GENERATE
      </button>
      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {rows && (
        <div style={{maxHeight:'40px',overflowY:'auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',fontSize:'8px'}}>
            <div style={{fontWeight:'bold',opacity:0.7}}>x</div>
            <div style={{fontWeight:'bold',opacity:0.7,textAlign:'right'}}>f(x)</div>
            {rows.map((r,i)=>(
              <React.Fragment key={i}>
                <div>{r.x}</div>
                <div style={{textAlign:'right'}}>{r.y}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function RatioMode() {
  const [vals, setVals] = useState({a:'1',b:'2',c:'3',d:''})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const solve = () => {
    try {
      const entries = Object.entries(vals).map(([k,v])=>[k,v===''?null:parseFloat(v)])
      const unknowns = entries.filter(([,v])=>v===null)
      if (unknowns.length !== 1) throw new Error('Exactly 1 unknown required')
      const known = Object.fromEntries(entries.filter(([,v])=>v!==null))
      const [uk] = unknowns[0]
      let r
      // a:b = c:d  =>  ad = bc
      if (uk==='a') r = known.b*known.c/known.d
      if (uk==='b') r = known.a*known.d/known.c
      if (uk==='c') r = known.a*known.d/known.b
      if (uk==='d') r = known.b*known.c/known.a
      setResult(`${uk} = ${parseFloat(r.toPrecision(10))}`); setError('')
    } catch(e) { setError(e.message); setResult(null) }
  }

  const inp = (label, field) => (
    <div style={{display:'inline-flex',gap:'2px',alignItems:'center',marginRight:'6px',fontSize:'8px'}}>
      <span>{label}:</span>
      <input value={vals[field]} onChange={e=>setVals({...vals,[field]:e.target.value})}
        placeholder="?"
        style={{width:'35px',background:'transparent',border:'none',
                borderBottom:'1px solid rgba(26,42,26,0.5)',fontFamily:'var(--font-display)',
                fontSize:'9px',color:'var(--lcd-dark)',outline:'none',textAlign:'center'}} />
    </div>
  )

  return (
    <div className="mode-screen">
      <div className="mode-header">RATIO  a:b = c:d</div>
      <div style={{marginBottom:'6px'}}>{inp('a','a')}{inp('b','b')} = {inp('c','c')}{inp('d','d')}</div>
      <div style={{fontSize:'8px',opacity:0.6,marginBottom:'5px'}}>Leave 1 field empty (unknown)</div>
      <button onClick={solve}
        style={{fontSize:'7px',padding:'2px 10px',background:'rgba(26,42,26,0.2)',
                border:'1px solid rgba(26,42,26,0.5)',borderRadius:'2px',
                fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer',fontWeight:'bold'}}>
        SOLVE
      </button>
      {error && <div style={{color:'#8a1a00',fontSize:'8px',marginTop:'4px'}}>{error}</div>}
      {result && <div style={{fontSize:'14px',fontWeight:'bold',textAlign:'right',marginTop:'4px'}}>{result}</div>}
    </div>
  )
}
