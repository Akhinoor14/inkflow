import React, { useState } from 'react'
import { CONV_CATEGORIES, convert } from '../engine/conversions.js'

export default function EngineerConverter({ onClose }) {
  const [catIdx, setCatIdx] = useState(0)
  const [fromUnit, setFromUnit] = useState('')
  const [toUnit, setToUnit] = useState('')
  const [value, setValue] = useState('1')
  const [result, setResult] = useState(null)
  const [search, setSearch] = useState('')

  const filteredCats = CONV_CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const cat = filteredCats[catIdx] || CONV_CATEGORIES[0]

  const from = fromUnit || cat.units[0].label
  const to   = toUnit   || (cat.units[1]?.label || cat.units[0].label)

  const doConvert = () => {
    try {
      const v = parseFloat(value)
      if (isNaN(v)) { setResult('Input Error'); return }
      const r = convert(v, from, to, cat)
      if (!isFinite(r)) { setResult('Math Error'); return }
      setResult(parseFloat(r.toPrecision(10)).toString())
    } catch(e) { setResult('Error') }
  }

  const selStyle = {
    width:'100%',background:'#2a2a2e',border:'1px solid #3a3a3c',
    borderRadius:'4px',color:'#e0e0e0',fontFamily:'var(--font-display)',
    fontSize:'11px',padding:'4px',outline:'none'
  }

  return (
    <div className="conv-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="conv-modal">
        <div className="conv-title">⚙ ENGINEERING CONVERTER</div>

        {/* Search */}
        <input
          placeholder="Search category..."
          value={search}
          onChange={e=>{setSearch(e.target.value);setCatIdx(0);setFromUnit('');setToUnit('');setResult(null)}}
          style={{...selStyle,marginBottom:'8px',padding:'5px 8px',fontSize:'10px'}}
        />

        {/* Category list */}
        <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginBottom:'10px',maxHeight:'80px',overflowY:'auto'}}>
          {filteredCats.map((c,i)=>(
            <button key={c.name} onClick={()=>{setCatIdx(i);setFromUnit('');setToUnit('');setResult(null)}}
              style={{fontSize:'8px',padding:'2px 5px',
                      background:catIdx===i?'#d4640a':'#2a2a2e',
                      color:catIdx===i?'white':'#c0c0c0',
                      border:'1px solid '+(catIdx===i?'#d4640a':'#3a3a3c'),
                      borderRadius:'3px',cursor:'pointer',fontFamily:'var(--font-label)'}}>
              {c.name}
            </button>
          ))}
        </div>

        <div style={{fontFamily:'var(--font-label)',fontSize:'11px',color:'#d4640a',
                     marginBottom:'8px',fontWeight:'700',letterSpacing:'1px'}}>
          {cat.name} → Base: {cat.base}
        </div>

        {/* Value input */}
        <input
          type="number" value={value} onChange={e=>setValue(e.target.value)}
          className="conv-input"
          style={{width:'100%',marginBottom:'6px',padding:'6px 8px',fontSize:'13px'}}
        />

        {/* From / To selects */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 24px 1fr',gap:'6px',
                     alignItems:'center',marginBottom:'10px'}}>
          <select style={selStyle} value={from}
            onChange={e=>{setFromUnit(e.target.value);setResult(null)}}>
            {cat.units.map(u=>(
              <option key={u.label} value={u.label}>{u.label}</option>
            ))}
          </select>
          <div style={{textAlign:'center',color:'#5a8fd0',fontSize:'14px'}}>→</div>
          <select style={selStyle} value={to}
            onChange={e=>{setToUnit(e.target.value);setResult(null)}}>
            {cat.units.map(u=>(
              <option key={u.label} value={u.label}>{u.label}</option>
            ))}
          </select>
        </div>

        {/* Convert button */}
        <button onClick={doConvert}
          style={{width:'100%',padding:'8px',background:'#1a4a8a',color:'white',
                  border:'none',borderRadius:'6px',fontFamily:'var(--font-label)',
                  fontSize:'12px',fontWeight:'700',cursor:'pointer',marginBottom:'8px',
                  letterSpacing:'1px'}}>
          CONVERT
        </button>

        {/* Result */}
        {result !== null && (
          <div style={{background:'rgba(90,223,90,0.08)',border:'1px solid rgba(90,223,90,0.3)',
                       borderRadius:'4px',padding:'8px 12px',textAlign:'right'}}>
            <div style={{fontFamily:'var(--font-display)',fontSize:'10px',color:'#888',marginBottom:'2px'}}>
              {value} {from} =
            </div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'18px',color:'#5adf5a',fontWeight:'bold'}}>
              {result} {to}
            </div>
          </div>
        )}

        <button onClick={onClose} className="conv-close">✕ CLOSE</button>
      </div>
    </div>
  )
}
