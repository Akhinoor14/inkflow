// Engineering Mode — Foylx Calculator
// Provides quick-calc panels for Electrical, Fluid, Structural, Thermodynamics
import React, { useState } from 'react'

// ── Electrical ────────────────────────────────────────────────
function ElectricalPanel() {
  const [V, setV] = useState(''); const [I, setI] = useState('');
  const [R, setR] = useState(''); const [P, setP] = useState('');
  const [res, setRes] = useState('')

  const solve = () => {
    const nV=parseFloat(V),nI=parseFloat(I),nR=parseFloat(R),nP=parseFloat(P)
    const k={V:nV,I:nI,R:nR,P:nP}
    const ok=v=>!isNaN(v)&&v!==undefined&&String(v).trim()!==''
    try {
      if(ok(nV)&&ok(nI))  { k.R=nV/nI; k.P=nV*nI }
      else if(ok(nV)&&ok(nR)) { k.I=nV/nR; k.P=nV*nV/nR }
      else if(ok(nV)&&ok(nP)) { k.I=nP/nV; k.R=nV*nV/nP }
      else if(ok(nI)&&ok(nR)) { k.V=nI*nR; k.P=nI*nI*nR }
      else if(ok(nI)&&ok(nP)) { k.V=nP/nI; k.R=nP/(nI*nI) }
      else if(ok(nR)&&ok(nP)) { k.V=Math.sqrt(nP*nR); k.I=Math.sqrt(nP/nR) }
      else { setRes('Enter 2 values'); return }
      const fmt=v=>isNaN(v)?'?':parseFloat(v.toPrecision(6))
      setRes(`V=${fmt(k.V)}V  I=${fmt(k.I)}A  R=${fmt(k.R)}Ω  P=${fmt(k.P)}W`)
    } catch(e) { setRes('Error') }
  }
  const fi=(label,val,set)=>(
    <div className="eng-formula-row">
      <span className="eng-label">{label}</span>
      <input className="eng-field" value={val} onChange={e=>set(e.target.value)} placeholder="?" type="number"/>
    </div>
  )
  return (
    <div>
      <div className="mode-header">OHM'S LAW</div>
      {fi('V (Volt):',V,setV)}
      {fi('I (Amp):',I,setI)}
      {fi('R (Ohm):',R,setR)}
      {fi('P (Watt):',P,setP)}
      <div style={{display:'flex',gap:4,marginTop:3}}>
        <button className="eng-btn" onClick={solve}>CALC</button>
        <button className="eng-btn" onClick={()=>{setV('');setI('');setR('');setP('');setRes('')}}>CLR</button>
      </div>
      {res&&<div className="eng-result">{res}</div>}
    </div>
  )
}

// ── Fluid ────────────────────────────────────────────────────
function FluidPanel() {
  const [rho,setRho]=useState('998'); const [v,setVel]=useState('')
  const [L,setL]=useState(''); const [mu,setMu]=useState('0.001002')
  const [res,setRes]=useState('')

  const reynolds = () => {
    const r=parseFloat(rho),vel=parseFloat(v),l=parseFloat(L),m=parseFloat(mu)
    if([r,vel,l,m].some(isNaN)){setRes('Fill all fields');return}
    const Re=r*vel*l/m
    const regime=Re<2300?'Laminar':Re<4000?'Transitional':'Turbulent'
    setRes(`Re = ${Re.toPrecision(4)} — ${regime}`)
  }

  const [Q,setQ]=useState(''); const [A,setA]=useState(''); const [resB,setResB]=useState('')
  const bernoulli=()=>{
    const q=parseFloat(Q),a=parseFloat(A)
    if(isNaN(q)||isNaN(a)){setResB('Need Q and A');return}
    const vel=q/a; setResB(`v = ${vel.toPrecision(4)} m/s`)
  }

  return (
    <div>
      <div className="mode-header">FLUID MECHANICS</div>
      <div style={{fontSize:'8px',opacity:0.7,marginBottom:3}}>REYNOLDS NUMBER</div>
      <div className="eng-formula-row"><span className="eng-label">ρ (kg/m³):</span><input className="eng-field" value={rho} onChange={e=>setRho(e.target.value)} type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">v (m/s):</span><input className="eng-field" value={v} onChange={e=>setVel(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">L (m):</span><input className="eng-field" value={L} onChange={e=>setL(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">μ (Pa·s):</span><input className="eng-field" value={mu} onChange={e=>setMu(e.target.value)} type="number"/></div>
      <button className="eng-btn" onClick={reynolds}>REYNOLDS</button>
      {res&&<div className="eng-result">{res}</div>}
      <div style={{fontSize:'8px',opacity:0.7,marginTop:5,marginBottom:3}}>CONTINUITY  v=Q/A</div>
      <div className="eng-formula-row"><span className="eng-label">Q (m³/s):</span><input className="eng-field" value={Q} onChange={e=>setQ(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">A (m²):</span><input className="eng-field" value={A} onChange={e=>setA(e.target.value)} placeholder="?" type="number"/></div>
      <button className="eng-btn" onClick={bernoulli}>CALC v</button>
      {resB&&<div className="eng-result">{resB}</div>}
    </div>
  )
}

// ── Structural ────────────────────────────────────────────────
function StructuralPanel() {
  // Simply supported beam, central point load
  const [P,setP]=useState(''); const [L,setL]=useState('');
  const [E,setE]=useState('200e9'); const [I,setI]=useState('')
  const [res,setRes]=useState('')

  const calcBeam = () => {
    const p=parseFloat(P),l=parseFloat(L),e=parseFloat(E),ii=parseFloat(I)
    if(isNaN(p)||isNaN(l)){setRes('Need P and L');return}
    const R=p/2
    const Mmax=p*l/4
    let parts=`R = ${R.toPrecision(4)} N  |  M_max = ${Mmax.toPrecision(4)} N·m`
    if(!isNaN(e)&&!isNaN(ii)&&ii>0){
      const d=p*l**3/(48*e*ii)
      parts+=`  |  δ_max = ${d.toPrecision(4)} m`
    }
    setRes(parts)
  }

  // Stress calc
  const [F,setF]=useState(''); const [A,setA]=useState(''); const [resS,setResS]=useState('')
  const calcStress=()=>{
    const f=parseFloat(F),a=parseFloat(A)
    if(isNaN(f)||isNaN(a)||a===0){setResS('Need F and A');return}
    setResS(`σ = ${(f/a).toPrecision(4)} Pa`)
  }

  return (
    <div>
      <div className="mode-header">STRUCTURAL</div>
      <div style={{fontSize:'8px',opacity:0.7,marginBottom:3}}>SS BEAM — CENTRAL LOAD</div>
      <div className="eng-formula-row"><span className="eng-label">P (N):</span><input className="eng-field" value={P} onChange={e=>setP(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">L (m):</span><input className="eng-field" value={L} onChange={e=>setL(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">E (Pa):</span><input className="eng-field" value={E} onChange={e=>setE(e.target.value)} type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">I (m⁴):</span><input className="eng-field" value={I} onChange={e=>setI(e.target.value)} placeholder="opt" type="number"/></div>
      <button className="eng-btn" onClick={calcBeam}>BEAM CALC</button>
      {res&&<div className="eng-result">{res}</div>}
      <div style={{fontSize:'8px',opacity:0.7,marginTop:5,marginBottom:3}}>DIRECT STRESS  σ=F/A</div>
      <div className="eng-formula-row"><span className="eng-label">F (N):</span><input className="eng-field" value={F} onChange={e=>setF(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">A (m²):</span><input className="eng-field" value={A} onChange={e=>setA(e.target.value)} placeholder="?" type="number"/></div>
      <button className="eng-btn" onClick={calcStress}>CALC σ</button>
      {resS&&<div className="eng-result">{resS}</div>}
    </div>
  )
}

// ── Thermodynamics ────────────────────────────────────────────
function ThermoPanel() {
  // Ideal gas
  const [Pv,setPv]=useState(''); const [Vv,setVv]=useState('');
  const [nv,setNv]=useState(''); const [Tv,setTv]=useState('');
  const [resG,setResG]=useState('')
  const R=8.314462618

  const idealGas=()=>{
    const P=parseFloat(Pv),V=parseFloat(Vv),n=parseFloat(nv),T=parseFloat(Tv)
    const ok=v=>!isNaN(v)
    const k={P,V,n,T}
    if(ok(P)&&ok(V)&&ok(n)) k.T=P*V/(n*R)
    else if(ok(P)&&ok(V)&&ok(T)) k.n=P*V/(R*T)
    else if(ok(P)&&ok(n)&&ok(T)) k.V=n*R*k.T/P
    else if(ok(V)&&ok(n)&&ok(T)) k.P=n*R*T/V
    else{setResG('Enter 3 values');return}
    const fmt=v=>isNaN(v)?'?':parseFloat(v.toPrecision(5))
    setResG(`P=${fmt(k.P)}Pa  V=${fmt(k.V)}m³  n=${fmt(k.n)}mol  T=${fmt(k.T)}K`)
  }

  // Carnot efficiency
  const [TH,setTH]=useState(''); const [TC,setTC]=useState(''); const [resC,setResC]=useState('')
  const carnot=()=>{
    const th=parseFloat(TH),tc=parseFloat(TC)
    if(isNaN(th)||isNaN(tc)){setResC('Need TH and TC (K)');return}
    const eta=(1-tc/th)*100
    setResC(`η_Carnot = ${eta.toPrecision(4)} %`)
  }

  return (
    <div>
      <div className="mode-header">THERMODYNAMICS</div>
      <div style={{fontSize:'8px',opacity:0.7,marginBottom:3}}>IDEAL GAS  PV=nRT</div>
      <div className="eng-formula-row"><span className="eng-label">P (Pa):</span><input className="eng-field" value={Pv} onChange={e=>setPv(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">V (m³):</span><input className="eng-field" value={Vv} onChange={e=>setVv(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">n (mol):</span><input className="eng-field" value={nv} onChange={e=>setNv(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">T (K):</span><input className="eng-field" value={Tv} onChange={e=>setTv(e.target.value)} placeholder="?" type="number"/></div>
      <button className="eng-btn" onClick={idealGas}>SOLVE</button>
      {resG&&<div className="eng-result">{resG}</div>}
      <div style={{fontSize:'8px',opacity:0.7,marginTop:5,marginBottom:3}}>CARNOT EFFICIENCY</div>
      <div className="eng-formula-row"><span className="eng-label">T_H (K):</span><input className="eng-field" value={TH} onChange={e=>setTH(e.target.value)} placeholder="?" type="number"/></div>
      <div className="eng-formula-row"><span className="eng-label">T_C (K):</span><input className="eng-field" value={TC} onChange={e=>setTC(e.target.value)} placeholder="?" type="number"/></div>
      <button className="eng-btn" onClick={carnot}>CARNOT η</button>
      {resC&&<div className="eng-result">{resC}</div>}
    </div>
  )
}

// ── Main Engineering Mode screen ──────────────────────────────
const TABS = ['ELEC','FLUID','STRUCT','THERMO']

export default function EngineeringMode() {
  const [tab, setTab] = useState('ELEC')
  return (
    <div className="eng-screen">
      <div className="eng-tab-row">
        {TABS.map(t=>(
          <button key={t} className={`eng-tab-btn${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}</button>
        ))}
      </div>
      {tab==='ELEC'   && <ElectricalPanel/>}
      {tab==='FLUID'  && <FluidPanel/>}
      {tab==='STRUCT' && <StructuralPanel/>}
      {tab==='THERMO' && <ThermoPanel/>}
    </div>
  )
}
