import React, { useState, useCallback } from 'react'

export default function Key({ keyDef, isShift, isAlpha, onPress }) {
  const [pressed, setPressed] = useState(false)

  const {
    label, subLabel,
    shiftLabel, shiftAction,
    alphaLabel, alphaAction,
    color = 'gray',
    width = 1,
    action, id,
  } = keyDef

  const handlePress = useCallback(() => {
    setPressed(true)
    let act = action
    if (isShift && shiftAction) act = shiftAction
    else if (isAlpha && alphaAction) act = alphaAction
    else if (isAlpha && alphaLabel && alphaLabel.length === 1) act = alphaLabel
    onPress(act, keyDef)
    setTimeout(() => setPressed(false), 120)
  }, [isShift, isAlpha, action, shiftAction, alphaAction, alphaLabel, keyDef, onPress])

  const handleDown = useCallback(e => {
    e.preventDefault()
    handlePress()
  }, [handlePress])

  // Determine which label to highlight on key face when modifier active
  const shiftActive = isShift && shiftLabel
  const alphaActive = isAlpha && (alphaLabel || alphaAction)

  // Key face glow for special keys
  const isShiftKey = id === 'SHIFT'
  const isAlphaKey = id === 'ALPHA'

  const faceStyle = {}
  if (isShiftKey && isShift) {
    faceStyle.boxShadow = '0 0 10px rgba(240,192,48,0.85), 0 3px 0 rgba(0,0,0,0.6)'
  }
  if (isAlphaKey && isAlpha) {
    faceStyle.boxShadow = '0 0 10px rgba(220,48,48,0.85), 0 3px 0 rgba(0,0,0,0.6)'
  }

  const keyWidth = `${Math.round(width * 52)}px`

  return (
    <div
      className={`key${pressed ? ' pressed' : ''}`}
      style={{ width: keyWidth }}
      onMouseDown={handleDown}
      onTouchStart={handleDown}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top labels row: shift (yellow) left, alpha (red) right */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', minHeight: '10px',
        paddingLeft: '1px', paddingRight: '1px', marginBottom: '1px',
      }}>
        <span className="key-shift-label" style={{
          opacity: shiftActive ? 1 : (shiftLabel ? 0.55 : 0),
          fontWeight: shiftActive ? 800 : 600,
        }}>
          {shiftLabel || ''}
        </span>
        <span className="key-alpha-label" style={{
          opacity: alphaActive ? 1 : (alphaLabel ? 0.55 : 0),
          fontWeight: alphaActive ? 800 : 600,
        }}>
          {alphaLabel || ''}
        </span>
      </div>

      {/* Main key face */}
      <div
        className={`key-face ${color}`}
        style={{ width: `${Math.round(width * 52) - 2}px`, ...faceStyle }}
      >
        <div className="key-main-label"
          style={{ opacity: (shiftActive || alphaActive) ? 0.55 : 1 }}>
          {label}
        </div>
        {subLabel && (
          <div className="key-sub-label">{subLabel}</div>
        )}
      </div>
    </div>
  )
}
