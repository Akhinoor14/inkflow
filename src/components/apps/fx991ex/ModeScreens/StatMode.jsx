import React, { useState } from 'react'
import { stat1Var, stat2Var } from '../../engine/modes/statistics.js'

export default function StatMode() {
  const [mode, setMode] = useState('1VAR')
  const [xData, setXData] = useState('1,2,3,4,5')
  const [yData, setYData] = useState('2,4,6,8,10')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const parseData = s => s.split(',').map(v=>{const n=parseFloat(v.trim());if(isNaN(n))throw new Error('Data Error');return n})

  const calculate = () => {
    try {
      const xs = parseData(xData)
      if (mode === '1VAR') {
        setResult({ type:'1VAR', data: stat1Var(xs) })
      } else {
        const ys = parseData(yData)
        if (xs.length !== ys.length) throw new Error('Data length mismatch')
        const s1 = stat1Var(xs), s2 = stat1Var(ys), s2v = stat2Var(xs,ys)
        setResult({ type:'2VAR', x:s1, y:s2, reg:s2v })
      }
      setError('')
    } catch(e) { setError(e.message); setResult(null) }
  }

  const fmtN = v => typeof v === 'number' ? parseFloat(v.toPrecision(8)).toString() : String(v)

  return (
    <div className="mode-screen">
      <div className="mode-header">STATISTICS</div>
      <div style={{display:'flex',gap:'6px',marginBottom:'4px'}}>
        {['1VAR','2VAR'].map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{fontSize:'7px',padding:'2px 6px',
                    background:mode===m?'rgba(26,42,26,0.25)':'transparent',
                    border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {m}
          </button>
        ))}
      </div>
      <div style={{fontSize:'8px',marginBottom:'3px'}}>
        X (comma-sep): <input value={xData} onChange={e=>setXData(e.target.value)}
          style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(26,42,26,0.5)',
                  fontFamily:'var(--font-display)',fontSize:'8px',color:'var(--lcd-dark)',
                  width:'120px',outline:'none'}} />
      </div>
      {mode==='2VAR' && (
        <div style={{fontSize:'8px',marginBottom:'3px'}}>
          Y (comma-sep): <input value={yData} onChange={e=>setYData(e.target.value)}
            style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(26,42,26,0.5)',
                    fontFamily:'var(--font-display)',fontSize:'8px',color:'var(--lcd-dark)',
                    width:'120px',outline:'none'}} />
        </div>
      )}
      <button onClick={calculate}
        style={{fontSize:'7px',padding:'2px 8px',background:'rgba(26,42,26,0.2)',
                border:'1px solid rgba(26,42,26,0.5)',borderRadius:'2px',
                fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer',
                fontWeight:'bold',marginBottom:'5px'}}>
        CALCULATE
      </button>
      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {result && result.type==='1VAR' && (
        <div className="stat-table">
          {[['n', result.data.n],['Σx', result.data.sum],['Σx²', result.data.sumSq],
            ['x̄', fmtN(result.data.mean)],['σx', fmtN(result.data.σx)],
            ['sx', fmtN(result.data.sx)],['min', result.data.min],
            ['Q1', result.data.Q1],['Med', fmtN(result.data.median)],
            ['Q3', result.data.Q3],['max', result.data.max]].map(([k,v])=>(
            <div key={k} className="stat-row"><span>{k}</span><span>{v}</span></div>
          ))}
        </div>
      )}
      {result && result.type==='2VAR' && (
        <div className="stat-table">
          {[['n', result.reg.n],['x̄', fmtN(result.reg.meanX)],['ȳ', fmtN(result.reg.meanY)],
            ['a (intercept)', fmtN(result.reg.a)],['b (slope)', fmtN(result.reg.b)],
            ['r', fmtN(result.reg.r)],['r²', fmtN(result.reg.r2)]].map(([k,v])=>(
            <div key={k} className="stat-row"><span>{k}</span><span>{v}</span></div>
          ))}
        </div>
      )}
    </div>
  )
}
