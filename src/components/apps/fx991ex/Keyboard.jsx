import React from 'react'
import Key from './Key.jsx'
import { KEY_ROWS, EXTRA_CONV_KEY } from './keyLayout.js'

export default function Keyboard({ isShift, isAlpha, onPress, angleMode, onAngleMode }) {
  return (
    <div className="keyboard-section">
      {/* Angle / mode strip */}
      <div className="mode-strip">
        {['DEG','RAD','GRAD'].map(m => (
          <button
            key={m}
            className={`mode-strip-btn${angleMode===m?' active':''}`}
            onClick={() => onAngleMode(m)}
          >{m}</button>
        ))}
      </div>

      {/* All key rows */}
      {KEY_ROWS.map((row, ri) => (
        <div className="key-row" key={ri}>
          {row.map(keyDef => (
            <Key
              key={keyDef.id}
              keyDef={keyDef}
              isShift={isShift}
              isAlpha={isAlpha}
              onPress={onPress}
            />
          ))}
        </div>
      ))}

      {/* Extra engineering converter button */}
      <div className="key-row" style={{marginTop:'6px', borderTop:'1px solid #2a2a2e', paddingTop:'6px'}}>
        <Key
          keyDef={{...EXTRA_CONV_KEY, width:3}}
          isShift={false}
          isAlpha={false}
          onPress={onPress}
        />
      </div>
    </div>
  )
}
