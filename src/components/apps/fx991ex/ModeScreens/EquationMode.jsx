import React, { useState } from 'react'
import { solveQuadratic, solveCubic, solveQuartic, solveLinear, solveInequalityQuad } from '../../engine/modes/equation.js'

export default function EquationMode() {
  const [type, setType] = useState('QUAD')
  const [coeffs, setCoeffs] = useState({a:'1',b:'-3',c:'2',d:'0',e:'0'})
  const [linRows, setLinRows] = useState([['1','2','3'],['4','5','6'],['1','0','1']])
  const [linSize, setLinSize] = useState(2)
  const [ineqOp, setIneqOp] = useState('>')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const p = k => parseFloat(coeffs[k]||'0')

  const fmtRoot = r => {
    if (Math.abs(r.im) < 1e-10) return parseFloat(r.re.toPrecision(8)).toString()
    const re = parseFloat(r.re.toPrecision(6))
    const im = parseFloat(Math.abs(r.im).toPrecision(6))
    return `${re}${r.im<0?'-':'+'}${im}i`
  }

  const solve = () => {
    try {
      let roots
      if (type==='QUAD')  roots = solveQuadratic(p('a'),p('b'),p('c'))
      if (type==='CUBIC') roots = solveCubic(p('a'),p('b'),p('c'),p('d'))
      if (type==='QUART') roots = solveQuartic(p('a'),p('b'),p('c'),p('d'),p('e'))
      if (type==='LIN') {
        const n = linSize
        const mat = linRows.slice(0,n).map(row=>row.slice(0,n).map(Number))
        const rhs = linRows.slice(0,n).map(row=>Number(row[n]))
        const sol = solveLinear(mat,rhs)
        setResult(['LIN', sol])
        setError(''); return
      }
      if (type==='INEQ') {
        const r = solveInequalityQuad(p('a'),p('b'),p('c'),ineqOp)
        setResult(['INEQ', r])
        setError(''); return
      }
      setResult(['POLY', roots])
      setError('')
    } catch(e) { setError(e.message); setResult(null) }
  }

  const CoeffInput = ({label, field}) => (
    <div style={{display:'inline-flex',gap:'2px',alignItems:'center',marginRight:'5px'}}>
      <span style={{fontSize:'8px'}}>{label}</span>
      <input value={coeffs[field]||''} onChange={e=>setCoeffs({...coeffs,[field]:e.target.value})}
        className="eq-field" style={{width:'32px'}} />
    </div>
  )

  return (
    <div className="mode-screen">
      <div className="mode-header">EQUATION / INEQUALITY</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'2px',marginBottom:'5px'}}>
        {[['QUAD','Quadratic'],['CUBIC','Cubic'],['QUART','Quartic'],['LIN','Linear Sys'],['INEQ','Inequality']].map(([t,l])=>(
          <button key={t} onClick={()=>setType(t)}
            style={{fontSize:'6px',padding:'2px 4px',
                    background:type===t?'rgba(26,42,26,0.25)':'transparent',
                    border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {l}
          </button>
        ))}
      </div>

      {(type==='QUAD'||type==='INEQ') && <div style={{fontSize:'8px',marginBottom:'4px'}}>
        <CoeffInput label="a:" field="a"/><CoeffInput label="b:" field="b"/><CoeffInput label="c:" field="c"/>
        <span style={{fontSize:'7px',opacity:0.7}}>ax²+bx+c {type==='INEQ'?ineqOp:''}0</span>
        {type==='INEQ' && (
          <div style={{marginTop:'3px'}}>
            {['>','<','>=','<='].map(op=>(
              <button key={op} onClick={()=>setIneqOp(op)}
                style={{fontSize:'7px',padding:'1px 4px',marginRight:'3px',
                        background:ineqOp===op?'rgba(26,42,26,0.25)':'transparent',
                        border:'1px solid rgba(26,42,26,0.3)',borderRadius:'2px',
                        fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
                {op} 0
              </button>
            ))}
          </div>
        )}
      </div>}

      {type==='CUBIC' && <div style={{fontSize:'8px',marginBottom:'4px'}}>
        <CoeffInput label="a:" field="a"/><CoeffInput label="b:" field="b"/>
        <CoeffInput label="c:" field="c"/><CoeffInput label="d:" field="d"/>
        <span style={{fontSize:'7px',opacity:0.7}}>ax³+bx²+cx+d=0</span>
      </div>}

      {type==='QUART' && <div style={{fontSize:'8px',marginBottom:'4px'}}>
        <CoeffInput label="a:" field="a"/><CoeffInput label="b:" field="b"/>
        <CoeffInput label="c:" field="c"/><CoeffInput label="d:" field="d"/>
        <CoeffInput label="e:" field="e"/>
        <span style={{fontSize:'7px',opacity:0.7}}>ax⁴+bx³+cx²+dx+e=0</span>
      </div>}

      {type==='LIN' && (
        <div style={{marginBottom:'4px'}}>
          <div style={{display:'flex',gap:'4px',marginBottom:'3px'}}>
            {[2,3,4].map(n=>(
              <button key={n} onClick={()=>setLinSize(n)}
                style={{fontSize:'7px',padding:'1px 4px',
                        background:linSize===n?'rgba(26,42,26,0.25)':'transparent',
                        border:'1px solid rgba(26,42,26,0.3)',borderRadius:'2px',
                        fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
                {n}×{n}
              </button>
            ))}
          </div>
          {linRows.slice(0,linSize).map((row,r)=>(
            <div key={r} style={{display:'flex',gap:'3px',marginBottom:'2px',alignItems:'center',fontSize:'8px'}}>
              {row.slice(0,linSize).map((v,c)=>(
                <input key={c} value={v}
                  onChange={e=>{const nr=linRows.map(rr=>[...rr]);nr[r][c]=e.target.value;setLinRows(nr)}}
                  className="eq-field" />
              ))}
              <span>|</span>
              <input value={row[linSize]}
                onChange={e=>{const nr=linRows.map(rr=>[...rr]);nr[r][linSize]=e.target.value;setLinRows(nr)}}
                className="eq-field" />
            </div>
          ))}
        </div>
      )}

      <button onClick={solve}
        style={{fontSize:'7px',padding:'2px 10px',background:'rgba(26,42,26,0.2)',
                border:'1px solid rgba(26,42,26,0.5)',borderRadius:'2px',
                fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer',
                fontWeight:'bold',marginBottom:'5px'}}>
        SOLVE
      </button>

      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {result && result[0]==='POLY' && result[1].map((r,i)=>(
        <div key={i} className="stat-row">
          <span>x{i+1}</span><span>{fmtRoot(r)}</span>
        </div>
      ))}
      {result && result[0]==='LIN' && result[1].map((v,i)=>(
        <div key={i} className="stat-row">
          <span>x{i+1}</span><span>{v}</span>
        </div>
      ))}
      {result && result[0]==='INEQ' && (
        <div style={{fontSize:'8px',marginTop:'4px'}}>{result[1]}</div>
      )}
    </div>
  )
}
