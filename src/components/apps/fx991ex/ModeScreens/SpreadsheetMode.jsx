import React, { useState, useCallback } from 'react'
import { emptyGrid, evaluateCell, COLS, ROWS } from '../../engine/modes/spreadsheet.js'

const COL_LABELS = ['A','B','C','D','E']
const VISIBLE_ROWS = 6

export default function SpreadsheetMode() {
  const [grid, setGrid] = useState(emptyGrid)
  const [rawGrid, setRawGrid] = useState(emptyGrid)
  const [offset, setOffset] = useState(0)
  const [selected, setSelected] = useState([0,0])
  const [formula, setFormula] = useState('')

  const updateCell = (r, c, val) => {
    const ng = rawGrid.map(row=>[...row])
    ng[r][c] = val
    setRawGrid(ng)
    // Re-evaluate all
    const eg = ng.map((row,ri)=>row.map((v,ci)=>{
      try { return evaluateCell(v, ng, ri, ci) } catch { return 'ERR' }
    }))
    setGrid(eg)
  }

  const selectCell = (r, c) => {
    setSelected([r,c])
    setFormula(rawGrid[r][c])
  }

  const dispRows = Array.from({length:VISIBLE_ROWS},(_,i)=>i+offset)

  return (
    <div className="mode-screen" style={{padding:'4px 6px'}}>
      <div className="mode-header">SPREADSHEET 5×45</div>
      {/* Formula bar */}
      <div style={{display:'flex',gap:'4px',alignItems:'center',marginBottom:'3px',fontSize:'7px'}}>
        <span>{COL_LABELS[selected[1]]}{selected[0]+1}:</span>
        <input value={formula}
          onChange={e=>setFormula(e.target.value)}
          onBlur={()=>updateCell(selected[0],selected[1],formula)}
          onKeyDown={e=>{if(e.key==='Enter'){updateCell(selected[0],selected[1],formula)}}}
          style={{flex:1,background:'rgba(26,42,26,0.08)',border:'1px solid rgba(26,42,26,0.4)',
                  borderRadius:'2px',fontFamily:'var(--font-display)',fontSize:'8px',
                  color:'var(--lcd-dark)',padding:'1px 3px',outline:'none'}} />
      </div>
      {/* Grid */}
      <div className="ss-grid" style={{gridTemplateColumns:`18px repeat(${COLS},1fr)`}}>
        {/* Header row */}
        <div className="ss-cell header"/>
        {COL_LABELS.map(l=>(
          <div key={l} className="ss-cell header" style={{textAlign:'center',fontSize:'7px'}}>{l}</div>
        ))}
        {/* Data rows */}
        {dispRows.map(r=>(
          <React.Fragment key={r}>
            <div className="ss-cell header" style={{fontSize:'6px'}}>{r+1}</div>
            {Array.from({length:COLS},(_,c)=>(
              <div key={c} className="ss-cell"
                style={{background:selected[0]===r&&selected[1]===c?'rgba(26,42,26,0.15)':'transparent'}}
                onClick={()=>selectCell(r,c)}>
                <div style={{fontSize:'7px',overflow:'hidden',maxWidth:'100%',textOverflow:'ellipsis',
                              whiteSpace:'nowrap',textAlign:'right'}}>
                  {grid[r][c]!==''?String(grid[r][c]).substring(0,6):''}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
      {/* Scroll */}
      <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'3px'}}>
        <button onClick={()=>setOffset(Math.max(0,offset-1))}
          style={btnStyle}>▲</button>
        <span style={{fontSize:'7px',color:'var(--lcd-dark)'}}>Row {offset+1}–{Math.min(offset+VISIBLE_ROWS,ROWS)}</span>
        <button onClick={()=>setOffset(Math.min(ROWS-VISIBLE_ROWS,offset+1))}
          style={btnStyle}>▼</button>
      </div>
    </div>
  )
}

const btnStyle = {
  fontSize:'8px',padding:'1px 5px',background:'rgba(26,42,26,0.15)',
  border:'1px solid rgba(26,42,26,0.4)',borderRadius:'2px',cursor:'pointer',
  fontFamily:'var(--font-display)',color:'var(--lcd-dark)'
}
