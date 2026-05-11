import React from 'react'

const APPS = [
  { num:1,  name:'Calculate', icon:'🔢', mode:'CALC' },
  { num:2,  name:'Complex',   icon:'ℂ',  mode:'CMPLX' },
  { num:3,  name:'Base-N',    icon:'🔀', mode:'BASEN' },
  { num:4,  name:'Matrix',    icon:'⬛', mode:'MATRIX' },
  { num:5,  name:'Vector',    icon:'→',  mode:'VECTOR' },
  { num:6,  name:'Statistics',icon:'📊', mode:'STAT' },
  { num:7,  name:'Distribtn', icon:'📈', mode:'DIST' },
  { num:8,  name:'Spreadsh',  icon:'📋', mode:'SHEET' },
  { num:9,  name:'Table',     icon:'📑', mode:'TABLE' },
  { num:10, name:'Equation',  icon:'⚖',  mode:'EQN' },
  { num:11, name:'Inequalty', icon:'≠',  mode:'INEQ' },
  { num:12, name:'Ratio',     icon:'∷',  mode:'RATIO' },
]

export default function MenuScreen({ onSelect, currentMode }) {
  return (
    <div className="menu-screen">
      <div className="menu-title">— MENU —</div>
      <div className="menu-grid">
        {APPS.map(app => (
          <div
            key={app.num}
            className={`menu-item${currentMode===app.mode?' selected':''}`}
            onClick={() => onSelect(app.mode)}
          >
            <div className="menu-num">{app.num}</div>
            <div className="menu-icon">{app.icon}</div>
            <div className="menu-name">{app.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
