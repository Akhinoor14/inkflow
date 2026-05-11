// src/components/apps/fx991ex/Calculator.jsx
// fx-991EX ClassWiz — Main Component (adapted for InkFlow Studio)
// Original paths updated to work within InkFlow's directory structure

import React, { useState, useEffect, useCallback, useReducer } from 'react'
import './styles/calculator.css'
import './styles/global.css'

import Keyboard from './Keyboard.jsx'
import MenuScreen from './MenuScreen.jsx'
import ComplexMode from './ModeScreens/ComplexMode.jsx'
import BaseNMode from './ModeScreens/BaseNMode.jsx'
import MatrixMode from './ModeScreens/MatrixMode.jsx'
import VectorMode from './ModeScreens/VectorMode.jsx'
import StatMode from './ModeScreens/StatMode.jsx'
import DistributionMode from './ModeScreens/DistributionMode.jsx'
import EquationMode from './ModeScreens/EquationMode.jsx'
import SpreadsheetMode from './ModeScreens/SpreadsheetMode.jsx'
import { TableMode, RatioMode } from './ModeScreens/TableRatioMode.jsx'
import EngineerConverter from './ExtraConversion/EngineerConvert.jsx'
import ConstantsPanel from './ExtraConversion/ConstantsPanel.jsx'

import {
  evaluate, formatResult, toFraction,
  setAns, getAns, getPreAns,
  setAngleMode as engineSetAngleMode,
  mPlus, mMinus, mRecall, mClear,
  ranNum, ranInt, factorize,
  integrate, derivative, summation
} from './engine/calculator.js'

const VARS = ['A','B','C','D','E','F','M','x','y']
const initVars = () => Object.fromEntries(VARS.map(v=>[v,0]))

const initialState = {
  input:'', result:'', error:'', fracVal:null, fracMode:false, justEvaled:false,
  history:[], vars:initVars(), hasM:false,
  isShift:false, isAlpha:false, isHyp:false,
  angleMode:'DEG', dispFormat:'NORM',
  mode:'CALC', showMenu:false,
  showConv:false, showConst:false, showSto:false, showRcl:false,
  showSolve:false, showIntegral:false, showDeriv:false, showSigma:false, showSetup:false,
}

function reducer(state, action) {
  switch(action.type) {
    case 'APPEND': {
      const fresh = state.justEvaled && /^[\d.]/.test(action.v)
      return {...state,
        input: fresh ? action.v : state.input + action.v,
        result: fresh ? '' : state.result,
        error:'', justEvaled:false}
    }
    case 'SET_INPUT':  return {...state, input:action.v, error:'', justEvaled:false}
    case 'DEL':        return {...state, input:state.input.slice(0,-1), error:'', justEvaled:false}
    case 'CLR':        return {...state, input:'', result:'', error:'', fracVal:null, fracMode:false, justEvaled:false}
    case 'CLR_ALL':    return {...state, input:'', result:'', error:'', fracVal:null, fracMode:false,
                                justEvaled:false, history:[], hasM:false, vars:initVars()}
    case 'SET_RESULT': return {...state, result:action.v, error:'', fracVal:action.frac||null,
                                fracMode:false, justEvaled:true,
                                history:[...state.history.slice(-49), {expr:action.expr||state.input, result:action.v}]}
    case 'SET_ERROR':  return {...state, error:action.v, result:'', justEvaled:false}
    case 'FRAC_TOGGLE':return {...state, fracMode:!state.fracMode}
    case 'SET_SHIFT':  return {...state, isShift:action.v, isAlpha:false}
    case 'SET_ALPHA':  return {...state, isAlpha:action.v, isShift:false}
    case 'SET_HYP':    return {...state, isHyp:action.v}
    case 'CLR_MODS':   return {...state, isShift:false, isAlpha:false}
    case 'SET_ANGLE':  return {...state, angleMode:action.v}
    case 'SET_FORMAT': return {...state, dispFormat:action.v}
    case 'SET_MODE':   return {...state, mode:action.v, showMenu:false, input:'', result:'', error:'', fracVal:null}
    case 'SET_VAR':    return {...state, vars:{...state.vars,[action.name]:action.val},
                                hasM: action.name==='M' ? true : state.hasM}
    case 'SET_HAS_M':  return {...state, hasM:action.v}
    case 'TOGGLE':     return {...state, [action.key]:!state[action.key]}
    case 'SET':        return {...state, [action.key]:action.val}
    default:           return state
  }
}

function applyFormat(val, fmt) {
  if (typeof val !== 'number') return String(val)
  if (!isFinite(val)) return val > 0 ? '∞' : '-∞'
  if (isNaN(val)) return 'Math Error'
  if (fmt.startsWith('FIX')) return val.toFixed(parseInt(fmt.split(' ')[1])||2)
  if (fmt.startsWith('SCI')) return val.toExponential(parseInt(fmt.split(' ')[1])||2)
  return formatResult(val)
}

function Overlay({ children, onClose }) {
  return (
    <div className="conv-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:'#1c1c1e',border:'1px solid #3a3a3c',borderRadius:'10px',
                   padding:'16px',width:'280px',maxHeight:'80vh',overflowY:'auto',
                   boxShadow:'0 0 50px rgba(0,0,0,0.95)'}}>
        {children}
      </div>
    </div>
  )
}

const dlgTitle = (text, color='#a0a8c0') => (
  <div style={{fontFamily:'var(--font-brand)',fontSize:'11px',color,
               textAlign:'center',marginBottom:'12px',letterSpacing:'2px'}}>{text}</div>
)

const dlgRow = (label, val, set, opts={}) => (
  <div style={{display:'flex',gap:'6px',alignItems:'center',marginBottom:'6px'}}>
    <span style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'#b0b0b0',
                  minWidth:opts.labelW||'65px'}}>{label}</span>
    <input value={val} onChange={e=>set(e.target.value)}
      style={{flex:1,background:'#2a2a2e',border:'1px solid #3a3a3c',borderRadius:'4px',
              color:'#e0e0e0',fontFamily:'var(--font-display)',fontSize:'11px',
              padding:'4px 6px',outline:'none'}} />
  </div>
)

function ResultBox({ label, value, color='#5adf5a' }) {
  return (
    <div style={{background:`rgba(${color==='#5adf5a'?'90,223,90':'90,143,208'},0.08)`,
                 border:`1px solid rgba(${color==='#5adf5a'?'90,223,90':'90,143,208'},0.3)`,
                 borderRadius:'4px',padding:'8px 12px',textAlign:'right',marginTop:'6px'}}>
      {label && <div style={{fontFamily:'var(--font-display)',fontSize:'9px',color:'#777',marginBottom:'2px'}}>{label}</div>}
      <div style={{fontFamily:'var(--font-display)',fontSize:'20px',color,fontWeight:'bold'}}>{value}</div>
    </div>
  )
}

function StoDialog({ currentValue, vars, onStore, onClose }) {
  return (
    <Overlay onClose={onClose}>
      {dlgTitle('STO → Variable', '#f0c030')}
      <div style={{fontFamily:'var(--font-display)',fontSize:'10px',color:'#777',
                   textAlign:'center',marginBottom:'12px'}}>Value: {currentValue}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
        {VARS.map(v=>(
          <button key={v} onClick={()=>onStore(v)}
            style={{padding:'8px',background:'#2a2a2e',color:'#e0e0e0',
                    border:'1px solid #3a3a3c',borderRadius:'6px',cursor:'pointer',
                    fontFamily:'var(--font-brand)',fontSize:'13px'}}>
            {v}
            <div style={{fontSize:'8px',color:'#888',marginTop:'2px',fontFamily:'var(--font-display)'}}>
              ={String(vars[v]).slice(0,7)}
            </div>
          </button>
        ))}
      </div>
      <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CANCEL</button>
    </Overlay>
  )
}

function RclDialog({ vars, onRecall, onClose }) {
  return (
    <Overlay onClose={onClose}>
      {dlgTitle('RCL — Recall Variable', '#e03030')}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
        {VARS.map(v=>(
          <button key={v} onClick={()=>onRecall(v)}
            style={{padding:'8px',background:'#2a2a2e',color:'#e0e0e0',
                    border:'1px solid #3a3a3c',borderRadius:'6px',cursor:'pointer',
                    fontFamily:'var(--font-brand)',fontSize:'13px'}}>
            {v}
            <div style={{fontSize:'8px',color:'#5adf5a',marginTop:'2px',fontFamily:'var(--font-display)'}}>
              ={parseFloat(String(vars[v]||0)).toPrecision(5)}
            </div>
          </button>
        ))}
      </div>
      <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CANCEL</button>
    </Overlay>
  )
}

function SolveDialog({ expr, vars, onResult, onClose }) {
  const [varName, setVarName] = useState('x')
  const [guess,   setGuess]   = useState('0')
  const [res,     setRes]     = useState(null)
  const [err,     setErr]     = useState('')

  const solve = () => {
    try {
      let x = parseFloat(guess) || 0
      const fn = xv => {
        let s = expr
        Object.entries(vars).forEach(([k,v]) => {
          if (k !== varName) s = s.replace(new RegExp(`(?<![a-zA-Z])${k}(?![a-zA-Z(])`, 'g'), `(${v})`)
        })
        s = s.replace(new RegExp(`(?<![a-zA-Z])${varName}(?![a-zA-Z(])`, 'g'), `(${xv})`)
        return evaluate(s)
      }
      let converged = false
      for (let i = 0; i < 300; i++) {
        const fv = fn(x)
        const h = Math.max(1e-7 * Math.abs(x), 1e-9)
        const dfv = (fn(x+h) - fn(x-h)) / (2*h)
        if (Math.abs(dfv) < 1e-14) break
        const nx = x - fv/dfv
        if (Math.abs(nx-x) < 1e-11 && Math.abs(fv) < 1e-8) { x = nx; converged = true; break }
        x = nx
        if (!isFinite(x)) throw new Error('Diverged')
      }
      if (!converged && Math.abs(fn(x)) > 1e-5) throw new Error('No solution near guess')
      const val = parseFloat(x.toPrecision(10))
      setRes(val); setErr(''); onResult(val, varName)
    } catch(e) { setErr(e.message); setRes(null) }
  }

  return (
    <Overlay onClose={onClose}>
      {dlgTitle('SOLVE  f(x) = 0', '#f0c030')}
      <div style={{fontFamily:'var(--font-display)',fontSize:'9px',color:'#666',
                   textAlign:'center',marginBottom:'10px',wordBreak:'break-all'}}>{expr}</div>
      <div style={{fontSize:'10px',color:'#888',fontFamily:'var(--font-label)',marginBottom:'6px'}}>Solve for variable:</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginBottom:'10px'}}>
        {VARS.map(v=>(
          <button key={v} onClick={()=>setVarName(v)}
            style={{padding:'4px 8px',background:varName===v?'#d4640a':'#2a2a2e',
                    color:varName===v?'white':'#c0c0c0',
                    border:'1px solid '+(varName===v?'#d4640a':'#3a3a3c'),
                    borderRadius:'4px',cursor:'pointer',fontFamily:'var(--font-brand)',fontSize:'12px'}}>
            {v}
          </button>
        ))}
      </div>
      {dlgRow('Initial guess:', guess, setGuess)}
      <button onClick={solve}
        style={{width:'100%',padding:'8px',background:'#d4640a',color:'white',border:'none',
                borderRadius:'6px',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:'700',
                cursor:'pointer',marginTop:'4px',marginBottom:'8px',letterSpacing:'1px'}}>
        SOLVE
      </button>
      {err && <div style={{color:'#e05050',fontSize:'9px',fontFamily:'var(--font-display)',marginBottom:'6px'}}>{err}</div>}
      {res !== null && <ResultBox label={`${varName} =`} value={res} />}
      <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CLOSE</button>
    </Overlay>
  )
}

function IntegralDialog({ onResult, onClose }) {
  const [expr, setExpr] = useState('x^2')
  const [varN, setVarN] = useState('x')
  const [a, setA] = useState('0')
  const [b, setB] = useState('1')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      const fn = v => { const s = expr.replace(new RegExp(`(?<![a-zA-Z])${varN}(?![a-zA-Z(])`, 'g'), `(${v})`); return evaluate(s) }
      const r = integrate(fn, parseFloat(a), parseFloat(b))
      if (!isFinite(r)) throw new Error('Math Error')
      setRes(parseFloat(r.toPrecision(10))); setErr(''); onResult(parseFloat(r.toPrecision(10)))
    } catch(e) { setErr(e.message); setRes(null) }
  }

  return (
    <Overlay onClose={onClose}>
      {dlgTitle('∫  NUMERICAL INTEGRAL', '#5a8fd0')}
      {dlgRow('f(x) =', expr, setExpr)}
      {dlgRow('Variable:', varN, setVarN)}
      {dlgRow('Lower a =', a, setA)}
      {dlgRow('Upper b =', b, setB)}
      <button onClick={calc} style={{width:'100%',padding:'8px',background:'#1a4a8a',color:'white',border:'none',borderRadius:'6px',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:'700',cursor:'pointer',marginTop:'4px',marginBottom:'8px',letterSpacing:'1px'}}>INTEGRATE</button>
      {err && <div style={{color:'#e05050',fontSize:'9px',fontFamily:'var(--font-display)',marginBottom:'6px'}}>{err}</div>}
      {res !== null && <ResultBox label={`∫${a}^${b} (${expr}) d${varN} =`} value={res} color='#5a8fd0' />}
      <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CLOSE</button>
    </Overlay>
  )
}

function DerivDialog({ onResult, onClose }) {
  const [expr, setExpr] = useState('x^2')
  const [varN, setVarN] = useState('x')
  const [at, setAt] = useState('1')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      const fn = v => { const s = expr.replace(new RegExp(`(?<![a-zA-Z])${varN}(?![a-zA-Z(])`, 'g'), `(${v})`); return evaluate(s) }
      const r = derivative(fn, parseFloat(at))
      if (!isFinite(r)) throw new Error('Math Error')
      setRes(parseFloat(r.toPrecision(10))); setErr(''); onResult(parseFloat(r.toPrecision(10)))
    } catch(e) { setErr(e.message); setRes(null) }
  }

  return (
    <Overlay onClose={onClose}>
      {dlgTitle('d/dx  DERIVATIVE', '#5ad0a0')}
      {dlgRow('f(x) =', expr, setExpr)}
      {dlgRow('Variable:', varN, setVarN)}
      {dlgRow('At x =', at, setAt)}
      <button onClick={calc} style={{width:'100%',padding:'8px',background:'#1a6a4a',color:'white',border:'none',borderRadius:'6px',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:'700',cursor:'pointer',marginTop:'4px',marginBottom:'8px',letterSpacing:'1px'}}>DIFFERENTIATE</button>
      {err && <div style={{color:'#e05050',fontSize:'9px',fontFamily:'var(--font-display)',marginBottom:'6px'}}>{err}</div>}
      {res !== null && <ResultBox label={`d/d${varN}(${expr}) at ${varN}=${at} =`} value={res} color='#5ad0a0' />}
      <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CLOSE</button>
    </Overlay>
  )
}

function SigmaDialog({ onResult, onClose }) {
  const [expr, setExpr] = useState('k^2')
  const [varN, setVarN] = useState('k')
  const [from, setFrom] = useState('1')
  const [to, setTo] = useState('10')
  const [res, setRes] = useState(null)
  const [err, setErr] = useState('')

  const calc = () => {
    try {
      const fn = v => { const s = expr.replace(new RegExp(`(?<![a-zA-Z])${varN}(?![a-zA-Z(])`, 'g'), `(${v})`); return evaluate(s) }
      const start = parseInt(from), end = parseInt(to)
      if (isNaN(start)||isNaN(end)) throw new Error('Range Error')
      if (end - start > 10000) throw new Error('Max range is 10000')
      const r = summation(fn, start, end)
      if (!isFinite(r)) throw new Error('Math Error')
      setRes(parseFloat(r.toPrecision(10))); setErr(''); onResult(parseFloat(r.toPrecision(10)))
    } catch(e) { setErr(e.message); setRes(null) }
  }

  return (
    <Overlay onClose={onClose}>
      {dlgTitle('Σ  SUMMATION', '#d0a05a')}
      {dlgRow('f(k) =', expr, setExpr)}
      {dlgRow('Variable:', varN, setVarN)}
      {dlgRow('From k =', from, setFrom)}
      {dlgRow('To k =', to, setTo)}
      <button onClick={calc} style={{width:'100%',padding:'8px',background:'#6a4a1a',color:'white',border:'none',borderRadius:'6px',fontFamily:'var(--font-label)',fontSize:'12px',fontWeight:'700',cursor:'pointer',marginTop:'4px',marginBottom:'8px',letterSpacing:'1px'}}>CALCULATE Σ</button>
      {err && <div style={{color:'#e05050',fontSize:'9px',fontFamily:'var(--font-display)',marginBottom:'6px'}}>{err}</div>}
      {res !== null && <ResultBox label={`Σ(${from}→${to}) ${expr} =`} value={res} color='#d0a05a' />}
      <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CLOSE</button>
    </Overlay>
  )
}

function SetupPanel({ dispFormat, onFormat, onClose }) {
  return (
    <Overlay onClose={onClose}>
      {dlgTitle('⚙  SETUP', '#a0a0c0')}
      <div style={{fontFamily:'var(--font-label)',fontSize:'10px',color:'#777',marginBottom:'8px'}}>Display Format:</div>
      {[['NORM','Normal (auto)'],['FIX 2','Fixed 2 decimal'],['FIX 4','Fixed 4 decimal'],['SCI 2','Scientific ×10²'],['SCI 4','Scientific ×10⁴']].map(([k,label])=>(
        <button key={k} onClick={()=>onFormat(k)}
          style={{display:'block',width:'100%',padding:'7px 12px',marginBottom:'4px',textAlign:'left',
                  background:dispFormat===k?'#1a4a8a':'#2a2a2e',color:dispFormat===k?'white':'#c0c0c0',
                  border:'1px solid '+(dispFormat===k?'#2a6ad0':'#3a3a3c'),borderRadius:'5px',cursor:'pointer',
                  fontFamily:'var(--font-label)',fontSize:'11px'}}>
          {label}
        </button>
      ))}
      <button onClick={onClose} className="conv-close" style={{marginTop:'8px'}}>✕ CLOSE</button>
    </Overlay>
  )
}

function HistoryPanel({ history, onSelect, onClose }) {
  return (
    <div className="conv-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:'#1c1c1e',border:'1px solid #3a3a3c',borderRadius:'10px',padding:'16px',width:'300px',maxHeight:'65vh',display:'flex',flexDirection:'column',boxShadow:'0 0 50px rgba(0,0,0,0.95)'}}>
        {dlgTitle('⟳  HISTORY', '#a0c0a0')}
        <div style={{overflowY:'auto',flex:1}}>
          {history.length === 0
            ? <div style={{fontFamily:'var(--font-display)',fontSize:'10px',color:'#444',textAlign:'center',padding:'24px'}}>No history yet</div>
            : [...history].reverse().map((h,i)=>(
              <div key={i} onClick={()=>{ onSelect(h.expr, h.result); onClose() }}
                style={{padding:'8px 10px',borderBottom:'1px solid #252525',cursor:'pointer',borderRadius:'4px'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{fontFamily:'var(--font-display)',fontSize:'10px',color:'#b0b0b0',wordBreak:'break-all'}}>{h.expr}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'14px',color:'#5adf5a',textAlign:'right',marginTop:'2px'}}>{h.result}</div>
              </div>
            ))
          }
        </div>
        <button onClick={onClose} className="conv-close" style={{marginTop:'10px'}}>✕ CLOSE</button>
      </div>
    </div>
  )
}

export default function Calculator() {
  const [st, dispatch] = useReducer(reducer, initialState)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => { engineSetAngleMode(st.angleMode) }, [st.angleMode])

  const doEval = useCallback(() => {
    const expr = st.input.trim()
    if (!expr) return
    let subbed = expr
    VARS.forEach(name => {
      const val = st.vars[name]
      if (val !== 0) {
        subbed = subbed.replace(new RegExp(`(?<![a-zA-Z\\d])${name}(?![a-zA-Z(\\d])`, 'g'), `(${val})`)
      }
    })
    try {
      const val = evaluate(subbed)
      setAns(val)
      const display = applyFormat(val, st.dispFormat)
      const frac    = toFraction(val)
      dispatch({ type:'SET_RESULT', v:display, frac, expr })
    } catch(e) {
      dispatch({ type:'SET_ERROR', v:e.message })
    }
  }, [st.input, st.vars, st.dispFormat])

  useEffect(() => {
    const anyOverlay = st.showMenu||st.showConv||st.showConst||st.showSto||st.showRcl||
                       st.showSolve||st.showIntegral||st.showDeriv||st.showSigma||st.showSetup||showHistory
    if (anyOverlay || st.mode !== 'CALC') return
    const h = e => {
      const k = e.key
      if (/^[0-9]$/.test(k))       { dispatch({type:'APPEND',v:k}); return }
      if (k==='.')                  { dispatch({type:'APPEND',v:'.'}); return }
      if (k==='+')                  { dispatch({type:'APPEND',v:'+'}); return }
      if (k==='-')                  { dispatch({type:'APPEND',v:'−'}); return }
      if (k==='*')                  { dispatch({type:'APPEND',v:'×'}); return }
      if (k==='/')                  { e.preventDefault(); dispatch({type:'APPEND',v:'÷'}); return }
      if (k==='(')                  { dispatch({type:'APPEND',v:'('}); return }
      if (k===')')                  { dispatch({type:'APPEND',v:')'}); return }
      if (k==='^')                  { dispatch({type:'APPEND',v:'^'}); return }
      if (k==='%')                  { dispatch({type:'APPEND',v:'%'}); return }
      if (k==='Enter'||k==='=')     { doEval(); return }
      if (k==='Backspace')          { dispatch({type:'DEL'}); return }
      if (k==='Escape')             { dispatch({type:'CLR'}); return }
      const shorts = {s:'sin(',c:'cos(',t:'tan(',l:'ln(',q:'sqrt('}
      if (shorts[k])                { dispatch({type:'APPEND',v:shorts[k]}); return }
      if (k==='p')                  { dispatch({type:'APPEND',v:'π'}); return }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [doEval, st, showHistory])

  const handleKeyPress = useCallback((action, keyDef) => {
    const { isShift:shift, isAlpha:alpha, isHyp:hyp } = st
    const app = v => dispatch({type:'APPEND', v})

    if (action==='SHIFT') { dispatch({type:'SET_SHIFT', v:!shift}); return }
    if (action==='ALPHA') { dispatch({type:'SET_ALPHA', v:!alpha}); return }
    if (action==='HYP')   { dispatch({type:'SET_HYP',   v:!hyp});  dispatch({type:'CLR_MODS'}); return }

    dispatch({type:'CLR_MODS'})

    if (action==='ON')     { dispatch({type:'CLR'}); dispatch({type:'SET',key:'mode',val:'CALC'}); dispatch({type:'SET',key:'showMenu',val:false}); return }
    if (action==='MENU')   { dispatch({type:'SET',key:'showMenu',val:true}); return }
    if (action==='SETUP')  { dispatch({type:'SET',key:'showSetup',val:true}); return }
    if (action==='CONVPLUS') { dispatch({type:'SET',key:'showConv',val:true}); return }
    if (action==='CONST')  { dispatch({type:'SET',key:'showConst',val:true}); return }
    if (action==='HISTORY'){ setShowHistory(true); return }
    if (action.startsWith('MODE_')) { dispatch({type:'SET_MODE', v:action.replace('MODE_','')}); return }

    if (st.mode !== 'CALC' && !st.showMenu) {
      if (action==='DEL') { dispatch({type:'DEL'}); return }
      if (action==='CLR') { dispatch({type:'CLR'}); return }
      return
    }

    if (action==='DEL')    { dispatch({type:'DEL'}); return }
    if (action==='CLR')    { dispatch({type:'CLR'}); return }
    if (action==='CLRALL') { dispatch({type:'CLR_ALL'}); return }

    if (/^\d$/.test(action)) { app(action); return }
    if (action==='.')  { app('.'); return }
    if (action==='+')  { app('+'); return }
    if (action==='−')  { app('−'); return }
    if (action==='×')  { app('×'); return }
    if (action==='÷')  { app('÷'); return }
    if (action==='LPAR') { app('('); return }
    if (action==='RPAR') { app(')'); return }
    if (action==='NEG')  { if (/[\d)]$/.test(st.input)) app('×(-1)'); else app('(-'); return }
    if (action==='=') { doEval(); return }
    if (action==='CALC' || action==='SOLVE') { if (shift || action==='SOLVE') dispatch({type:'SET',key:'showSolve',val:true}); else doEval(); return }
    if (action==='ANS')    { app(String(getAns())); return }
    if (action==='PREANS') { app(String(getPreAns())); return }
    if (action==='SIN')  { app(hyp ? 'sinh(' : 'sin(');   return }
    if (action==='COS')  { app(hyp ? 'cosh(' : 'cos(');   return }
    if (action==='TAN')  { app(hyp ? 'tanh(' : 'tan(');   return }
    if (action==='ASIN') { app(hyp ? 'asinh(' : 'asin('); return }
    if (action==='ACOS') { app(hyp ? 'acosh(' : 'acos('); return }
    if (action==='ATAN') { app(hyp ? 'atanh(' : 'atan('); return }
    if (action==='SQ')    { app('^2');    return }
    if (action==='CUBE')  { app('^3');    return }
    if (action==='POW')   { app('^');     return }
    if (action==='RECIP') { app('^(-1)'); return }
    if (action==='SQRT')  { app('sqrt('); return }
    if (action==='CBRT')  { app('cbrt('); return }
    if (action==='YPOW')  { app('^(1/'); return }
    if (action==='LOG')   { app('log(');  return }
    if (action==='LN')    { app('ln(');   return }
    if (action==='10X'||action==='10X2') { app('10^('); return }
    if (action==='EXP')   { app('e^(');   return }
    if (action==='PI')    { app('π');    return }
    if (action==='EULER') { app('e');    return }
    if (action==='EXP10') { app('×10^'); return }
    if (action==='FACT')  { app('!');  return }
    if (action==='NPR')   { app('P');  return }
    if (action==='NCR')   { app('C');  return }
    if (action==='ABS')   { app('abs('); return }
    if (action==='FRAC')  { app('('); return }
    if (action==='SD') { if (st.fracVal) dispatch({type:'FRAC_TOGGLE'}); return }
    if (action==='MPLUS') {
      try { let s=st.input; VARS.forEach(n=>{if(st.vars[n]!==0)s=s.replace(new RegExp(`\\b${n}\\b`,'g'),`(${st.vars[n]})`)}); const v=evaluate(s); mPlus(v); dispatch({type:'SET_VAR',name:'M',val:mRecall()}) } catch {}
      return
    }
    if (action==='MMINUS') {
      try { let s=st.input; VARS.forEach(n=>{if(st.vars[n]!==0)s=s.replace(new RegExp(`\\b${n}\\b`,'g'),`(${st.vars[n]})`)}); const v=evaluate(s); mMinus(v); dispatch({type:'SET_VAR',name:'M',val:mRecall()}); dispatch({type:'SET_HAS_M',v:true}) } catch {}
      return
    }
    if (action==='STO') { dispatch({type:'SET',key:'showSto',val:true}); return }
    if (action==='RCL') { dispatch({type:'SET',key:'showRcl',val:true}); return }
    if (action==='INT'||action==='INTEGRAL') { dispatch({type:'SET',key:'showIntegral',val:true}); return }
    if (action==='DERIV')  { dispatch({type:'SET',key:'showDeriv',val:true}); return }
    if (action==='SIGMA')  { dispatch({type:'SET',key:'showSigma',val:true}); return }
    if (action==='FACTOR') {
      try { const v=evaluate(st.input); dispatch({type:'SET_RESULT',v:factorize(v).join('×'),frac:null,expr:st.input}) } catch { dispatch({type:'SET_ERROR',v:'Math Error'}) }
      return
    }
    if (action==='RAN')    { app(ranNum().toFixed(3)); return }
    if (action==='ENG')    { app('×10^'); return }
    if (action==='DMS')    { app('°'); return }
    if (action==='GCD')    { app('gcd('); return }
    if (action==='LCM')    { app('lcm('); return }
    if (alpha && keyDef?.alphaLabel && VARS.includes(keyDef.alphaLabel)) { app(keyDef.alphaLabel); return }
  }, [st, doEval])

  const handleSto = varName => {
    try { const raw = st.result !== '' ? parseFloat(st.result) : evaluate(st.input); if (isFinite(raw)) { dispatch({type:'SET_VAR',name:varName,val:raw}); if (varName==='M') dispatch({type:'SET_HAS_M',v:true}) } } catch {}
    dispatch({type:'SET',key:'showSto',val:false})
  }
  const handleRcl = varName => { dispatch({type:'APPEND',v:String(st.vars[varName])}); dispatch({type:'SET',key:'showRcl',val:false}) }

  const renderModeScreen = () => {
    if (st.showMenu) return <MenuScreen currentMode={st.mode} onSelect={m=>dispatch({type:'SET_MODE',v:m})} />
    switch(st.mode) {
      case 'CMPLX':  return <ComplexMode />
      case 'BASEN':  return <BaseNMode />
      case 'MATRIX': return <MatrixMode />
      case 'VECTOR': return <VectorMode />
      case 'STAT':   return <StatMode />
      case 'DIST':   return <DistributionMode />
      case 'EQN':    return <EquationMode />
      case 'SHEET':  return <SpreadsheetMode />
      case 'TABLE':  return <TableMode />
      case 'RATIO':  return <RatioMode />
      default:       return null
    }
  }

  const modeScreen = renderModeScreen()
  const showFracResult = st.fracMode && st.fracVal

  return (
    <>
      <div className="calculator">
        <div className="calc-header">
          <div>
            <div className="calc-brand">CASIO</div>
            <div className="calc-classwiz">ClassWiz</div>
          </div>
          <div className="calc-model">fx-991EX</div>
        </div>
        <div className="solar-cell" />
        <div className="display-outer">
          <div className="display-inner">
            {modeScreen ? modeScreen : (
              <>
                <div className="display-status">
                  <div className="status-left">
                    <span className={`status-icon${st.isShift?' shift-active':''}`}>S</span>
                    <span className={`status-icon${st.isAlpha?' alpha-active':''}`}>A</span>
                    {st.isHyp && <span className="status-icon active" style={{color:'#4a8a4a'}}>H</span>}
                    {st.hasM  && <span className="status-icon active">M</span>}
                  </div>
                  <div className="status-right">
                    <span className="status-icon active">{st.angleMode}</span>
                    {st.dispFormat!=='NORM' && <span className="status-icon active">{st.dispFormat}</span>}
                    {showFracResult && <span className="status-icon active">a/b</span>}
                  </div>
                </div>
                <div className={`display-input${st.input.length>22?' small':''} has-cursor`}>{st.input||'0'}</div>
                {(st.result||st.error) && (
                  <div className={['display-result',st.error?' error':'',((st.result||st.error).length>14)?' small':''].join('')}>
                    {st.error ? st.error : showFracResult ? `${st.fracVal.n}/${st.fracVal.d}` : st.result}
                  </div>
                )}
                {!st.result && !st.error && st.history.length>0 && (
                  <div className="history-panel">
                    {[...st.history].reverse().slice(0,3).map((h,i)=>(
                      <div className="history-item" key={i}><span>{h.expr.substring(0,18)}</span><span>{h.result}</span></div>
                    ))}
                  </div>
                )}
                {Object.entries(st.vars).some(([,v])=>v!==0) && (
                  <div style={{position:'absolute',bottom:4,right:6,display:'flex',gap:4,flexWrap:'wrap',opacity:0.5,maxWidth:'90%'}}>
                    {Object.entries(st.vars).filter(([,v])=>v!==0).map(([k,v])=>(
                      <span key={k} style={{fontFamily:'var(--font-display)',fontSize:'7px',color:'var(--lcd-dark)'}}>{k}={parseFloat(String(v)).toPrecision(4)}</span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <Keyboard isShift={st.isShift} isAlpha={st.isAlpha} angleMode={st.angleMode}
          onAngleMode={m=>{dispatch({type:'SET_ANGLE',v:m}); engineSetAngleMode(m)}}
          onPress={handleKeyPress} />
      </div>

      {st.showConv && <EngineerConverter onClose={()=>dispatch({type:'SET',key:'showConv',val:false})} />}
      {st.showConst && <ConstantsPanel onSelect={v=>{dispatch({type:'APPEND',v:String(v)}); dispatch({type:'SET',key:'showConst',val:false})}} onClose={()=>dispatch({type:'SET',key:'showConst',val:false})} />}
      {st.showSto && <StoDialog currentValue={st.result||st.input} vars={st.vars} onStore={handleSto} onClose={()=>dispatch({type:'SET',key:'showSto',val:false})} />}
      {st.showRcl && <RclDialog vars={st.vars} onRecall={handleRcl} onClose={()=>dispatch({type:'SET',key:'showRcl',val:false})} />}
      {st.showSolve && <SolveDialog expr={st.input||'x^2-4'} vars={st.vars} onResult={(val,vname)=>{dispatch({type:'SET_RESULT',v:String(val),frac:toFraction(val),expr:`SOLVE(${st.input})`}); dispatch({type:'SET_VAR',name:vname,val})}} onClose={()=>dispatch({type:'SET',key:'showSolve',val:false})} />}
      {st.showIntegral && <IntegralDialog onResult={v=>dispatch({type:'SET_RESULT',v:String(v),frac:toFraction(v),expr:'∫ result'})} onClose={()=>dispatch({type:'SET',key:'showIntegral',val:false})} />}
      {st.showDeriv && <DerivDialog onResult={v=>dispatch({type:'SET_RESULT',v:String(v),frac:toFraction(v),expr:'d/dx result'})} onClose={()=>dispatch({type:'SET',key:'showDeriv',val:false})} />}
      {st.showSigma && <SigmaDialog onResult={v=>dispatch({type:'SET_RESULT',v:String(v),frac:toFraction(v),expr:'Σ result'})} onClose={()=>dispatch({type:'SET',key:'showSigma',val:false})} />}
      {st.showSetup && <SetupPanel dispFormat={st.dispFormat} onFormat={f=>{dispatch({type:'SET_FORMAT',v:f}); dispatch({type:'SET',key:'showSetup',val:false})}} onClose={()=>dispatch({type:'SET',key:'showSetup',val:false})} />}
      {showHistory && <HistoryPanel history={st.history} onSelect={(expr,result)=>{dispatch({type:'SET_INPUT',v:expr}); dispatch({type:'SET_RESULT',v:result,frac:null,expr})}} onClose={()=>setShowHistory(false)} />}
    </>
  )
}
