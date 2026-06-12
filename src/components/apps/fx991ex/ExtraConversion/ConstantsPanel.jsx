import React, { useState } from 'react'
import { CONSTANTS } from '../engine/constants.js'

export default function ConstantsPanel({ onSelect, onClose }) {
  const [search, setSearch] = useState('')
  const cats = [...new Set(CONSTANTS.map(c=>c.category))]
  const [cat, setCat] = useState('All')

  const filtered = CONSTANTS.filter(c =>
    (cat==='All' || c.category===cat) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.symbol.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="conv-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="conv-modal">
        <div className="conv-title">⚛ PHYSICAL CONSTANTS (47)</div>
        <input placeholder="Search..."  value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{width:'100%',background:'#2a2a2e',border:'1px solid #3a3a3c',
                  borderRadius:'4px',color:'#e0e0e0',fontFamily:'var(--font-display)',
                  fontSize:'10px',padding:'4px 8px',outline:'none',marginBottom:'6px'}} />
        <div style={{display:'flex',flexWrap:'wrap',gap:'3px',marginBottom:'8px'}}>
          {['All',...cats].map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{fontSize:'7px',padding:'2px 4px',background:cat===c?'#d4640a':'#2a2a2e',
                      color:cat===c?'white':'#c0c0c0',border:'1px solid '+(cat===c?'#d4640a':'#3a3a3c'),
                      borderRadius:'3px',cursor:'pointer',fontFamily:'var(--font-label)'}}>
              {c}
            </button>
          ))}
        </div>
        <div style={{maxHeight:'280px',overflowY:'auto'}}>
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{ onSelect(c.value); onClose() }}
              style={{display:'flex',justifyContent:'space-between',padding:'5px 6px',
                      borderBottom:'1px solid #2a2a2e',cursor:'pointer',borderRadius:'3px'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(90,143,208,0.1)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div>
                <div style={{fontFamily:'var(--font-label)',fontSize:'10px',color:'#e0e0e0'}}>{c.name}</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:'9px',color:'#888'}}>{c.symbol} [{c.unit}]</div>
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'10px',color:'#5adf5a',
                           textAlign:'right',alignSelf:'center'}}>
                {c.value.toExponential ? c.value.toString() : c.value}
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="conv-close">✕ CLOSE</button>
      </div>
    </div>
  )
}
