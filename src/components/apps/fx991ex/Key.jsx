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
    setTimeout(() => setPressed(false), 100)
  }, [isShift, isAlpha, action, shiftAction, alphaAction, alphaLabel, keyDef, onPress])

  const handleDown = useCallback(e => {
    e.preventDefault()
    handlePress()
  }, [handlePress])

  const shiftActive = isShift && shiftLabel
  const alphaActive = isAlpha && (alphaLabel || alphaAction)
  const isShiftKey = id === 'SHIFT'
  const isAlphaKey = id === 'ALPHA'

  const faceStyle = {}
  if (isShiftKey && isShift)
    faceStyle.boxShadow = '0 0 8px rgba(212,160,16,0.75), 0 3px 0 rgba(0,0,0,0.3)'
  if (isAlphaKey && isAlpha)
    faceStyle.boxShadow = '0 0 8px rgba(200,56,56,0.75), 0 3px 0 rgba(0,0,0,0.3)'

  // Use CSS variable for key unit; computed via style
  const keyWidthStyle = {
    width: `calc(var(--key-unit) * ${width} + var(--key-gap) * ${width - 1})`,
  }

  return (
    <div
      className={`key${pressed ? ' pressed' : ''}`}
      style={keyWidthStyle}
      onMouseDown={handleDown}
      onTouchStart={handleDown}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top row: shift label left, alpha label right */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', minHeight: '9px',
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

      {/* Key face */}
      <div
        className={`key-face ${color}`}
        style={{ width: '100%', ...faceStyle }}
      >
        <div className="key-main-label"
          style={{ opacity: (shiftActive || alphaActive) ? 0.5 : 1 }}>
          {label}
        </div>
        {subLabel && <div className="key-sub-label">{subLabel}</div>}
      </div>
    </div>
  )
}
