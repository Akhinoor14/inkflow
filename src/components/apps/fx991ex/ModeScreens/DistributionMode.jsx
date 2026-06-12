import React, { useState } from 'react'
import { normCDF, normPDF, normInvCDF, tCDF, chi2CDF, binomialPMF, binomialCDF, poissonPMF, poissonCDF, geometricPMF, geometricCDF, hypergeoPMF } from '../engine/modes/statistics.js'

const DISTS = ['Normal','t-Dist','Chi²','Binomial','Poisson','Geometric','Hypergeometric']

export default function DistributionMode() {
  const [dist, setDist] = useState('Normal')
  const [params, setParams] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const p = (key, def='0') => parseFloat(params[key] ?? def)

  const calculate = () => {
    try {
      let r = {}
      if (dist==='Normal') {
        const x=p('x'), mu=p('mu'), sigma=p('sigma','1')
        r.PDF = normPDF(x,mu,sigma)
        r.CDF = normCDF((x-mu)/sigma)
        r['Inv(p)'] = normInvCDF(p('prob','0.95'),mu,sigma)
      } else if (dist==='t-Dist') {
        r.CDF = tCDF(p('t'), p('df','10'))
      } else if (dist==='Chi²') {
        r.CDF = chi2CDF(p('x'), p('df','5'))
      } else if (dist==='Binomial') {
        r.PMF = binomialPMF(p('k'), p('n','10'), p('p','0.5'))
        r.CDF = binomialCDF(p('k'), p('n','10'), p('p','0.5'))
      } else if (dist==='Poisson') {
        r.PMF = poissonPMF(p('k'), p('lambda','3'))
        r.CDF = poissonCDF(p('k'), p('lambda','3'))
      } else if (dist==='Geometric') {
        r.PMF = geometricPMF(p('k','3'), p('p','0.3'))
        r.CDF = geometricCDF(p('k','3'), p('p','0.3'))
      } else if (dist==='Hypergeometric') {
        r.PMF = hypergeoPMF(p('k','2'), p('N','20'), p('K','8'), p('n','5'))
      }
      setResult(r); setError('')
    } catch(e) { setError(e.message); setResult(null) }
  }

  const PARAM_DEFS = {
    Normal:['x','mu','sigma','prob'],
    't-Dist':['t','df'],
    'Chi²':['x','df'],
    Binomial:['k','n','p'],
    Poisson:['k','lambda'],
    Geometric:['k','p'],
    Hypergeometric:['k','N','K','n']
  }

  return (
    <div className="mode-screen">
      <div className="mode-header">DISTRIBUTION</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'2px',marginBottom:'5px'}}>
        {DISTS.map(d=>(
          <button key={d} onClick={()=>setDist(d)}
            style={{fontSize:'6px',padding:'2px 3px',
                    background:dist===d?'rgba(26,42,26,0.25)':'transparent',
                    border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',
                    fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer'}}>
            {d}
          </button>
        ))}
      </div>
      {(PARAM_DEFS[dist]||[]).map(key=>(
        <div key={key} style={{fontSize:'8px',marginBottom:'3px',display:'flex',gap:'4px',alignItems:'center'}}>
          <span style={{minWidth:'45px'}}>{key}:</span>
          <input value={params[key]??''} onChange={e=>setParams({...params,[key]:e.target.value})}
            style={{width:'60px',background:'transparent',border:'none',
                    borderBottom:'1px solid rgba(26,42,26,0.5)',fontFamily:'var(--font-display)',
                    fontSize:'9px',color:'var(--lcd-dark)',outline:'none'}} />
        </div>
      ))}
      <button onClick={calculate}
        style={{fontSize:'7px',padding:'2px 8px',background:'rgba(26,42,26,0.2)',
                border:'1px solid rgba(26,42,26,0.5)',borderRadius:'2px',
                fontFamily:'var(--font-display)',color:'var(--lcd-dark)',cursor:'pointer',
                fontWeight:'bold',marginTop:'2px',marginBottom:'5px'}}>
        CALCULATE
      </button>
      {error && <div style={{color:'#8a1a00',fontSize:'8px'}}>{error}</div>}
      {result && Object.entries(result).map(([k,v])=>(
        <div key={k} className="stat-row">
          <span>{k}</span>
          <span>{typeof v==='number'?parseFloat(v.toPrecision(10)).toString():String(v)}</span>
        </div>
      ))}
    </div>
  )
}
