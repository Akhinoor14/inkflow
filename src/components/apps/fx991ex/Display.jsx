import React from 'react'

export default function Display({ state }) {
  const {
    input, result, error, mode, angleMode,
    isShift, isAlpha, dispFormat, hasM, showFrac, fracVal, historyItems
  } = state

  const resultDisplay = error
    ? error
    : showFrac && fracVal
      ? `${fracVal.n}/${fracVal.d}`
      : result

  const resultClass = `display-result${error ? ' error' : ''}${(resultDisplay||'').length > 14 ? ' small' : ''}`
  const inputClass = `display-input${input.length > 22 ? ' small' : ''} has-cursor`

  return (
    <div className="display-outer">
      <div className="display-inner">
        {/* Status bar */}
        <div className="display-status">
          <div className="status-left">
            <span className={`status-icon${isShift ? ' shift-active' : ''}`}>S</span>
            <span className={`status-icon${isAlpha ? ' alpha-active' : ''}`}>A</span>
            {hasM && <span className="status-icon active">M</span>}
          </div>
          <div className="status-right">
            <span className={`status-icon${mode !== 'CALC' ? ' active' : ''}`}>{mode}</span>
            <span className="status-icon active">{angleMode}</span>
            {dispFormat !== 'NORM' && <span className="status-icon active">{dispFormat}</span>}
          </div>
        </div>

        {/* Expression input */}
        <div className={inputClass}>
          {input || '0'}
        </div>

        {/* Result */}
        {resultDisplay !== '' && resultDisplay !== null && (
          <div className={resultClass}>
            {resultDisplay}
          </div>
        )}

        {/* Recent history at bottom */}
        {historyItems?.length > 0 && !result && (
          <div className="history-panel">
            {historyItems.slice(-3).reverse().map((h, i) => (
              <div className="history-item" key={i}>
                <span>{h.expr}</span>
                <span>{h.result}</span>
              </div>
            ))}
          </div>
        )}

        <div className="display-mode-tag">{mode !== 'CALC' ? mode : ''}</div>
      </div>
    </div>
  )
}
