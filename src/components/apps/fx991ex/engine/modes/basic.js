import { evaluate, formatResult, toFraction, setAns, getAns, mPlus, mMinus, mRecall } from '../calculator.js'

export function calcEvaluate(expr, options = {}) {
  try {
    const val = evaluate(expr)
    setAns(val)
    return {
      value: val,
      display: formatResult(val),
      fraction: toFraction(val),
      error: null
    }
  } catch (e) {
    return { value: null, display: '', fraction: null, error: e.message }
  }
}

// Process M+ key
export function handleMPlus(expr) {
  try { const v = evaluate(expr); mPlus(v); return v } catch(e) { return null }
}

// Process M- key
export function handleMMinus(expr) {
  try { const v = evaluate(expr); mMinus(v); return v } catch(e) { return null }
}
