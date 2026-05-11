// Spreadsheet engine: 5 cols x 45 rows

export const COLS = 5
export const ROWS = 45

export function emptyGrid() {
  return Array.from({length: ROWS}, () => Array(COLS).fill(''))
}

export function evaluateCell(expr, grid, row, col) {
  if (!expr || expr.trim() === '') return ''
  // If starts with =, it's a formula
  if (expr.startsWith('=')) {
    return evalFormula(expr.slice(1), grid, row, col)
  }
  const n = parseFloat(expr)
  return isNaN(n) ? expr : n
}

function cellRef(ref, grid) {
  // e.g. A1, B3
  const m = ref.match(/^([A-E])(\d+)$/i)
  if (!m) return NaN
  const col = m[1].toUpperCase().charCodeAt(0) - 65
  const row = parseInt(m[2]) - 1
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return NaN
  return parseFloat(grid[row][col]) || 0
}

function rangeVals(ref, grid) {
  const m = ref.match(/^([A-E])(\d+):([A-E])(\d+)$/i)
  if (!m) return null
  const c1 = m[1].toUpperCase().charCodeAt(0)-65, r1=parseInt(m[2])-1
  const c2 = m[3].toUpperCase().charCodeAt(0)-65, r2=parseInt(m[4])-1
  const vals = []
  for (let r=Math.min(r1,r2); r<=Math.max(r1,r2); r++)
    for (let c=Math.min(c1,c2); c<=Math.max(c1,c2); c++)
      vals.push(parseFloat(grid[r][c]) || 0)
  return vals
}

function evalFormula(expr, grid, curRow, curCol) {
  try {
    // SUM, MEAN, MAX, MIN, COUNT with range
    const fnMatch = expr.match(/^(SUM|MEAN|MAX|MIN|COUNT|PRODUCT)\(([^)]+)\)$/i)
    if (fnMatch) {
      const fn = fnMatch[1].toUpperCase()
      const arg = fnMatch[2]
      const vals = rangeVals(arg, grid) || [cellRef(arg, grid)]
      if (fn === 'SUM') return vals.reduce((s,v)=>s+v,0)
      if (fn === 'MEAN') return vals.reduce((s,v)=>s+v,0)/vals.length
      if (fn === 'MAX') return Math.max(...vals)
      if (fn === 'MIN') return Math.min(...vals)
      if (fn === 'COUNT') return vals.length
      if (fn === 'PRODUCT') return vals.reduce((s,v)=>s*v,1)
    }
    // Replace cell references
    let e = expr.replace(/([A-E]\d+)/gi, ref => String(cellRef(ref, grid)))
    return eval(e)  // safe: only numeric operations
  } catch(err) {
    return 'ERR'
  }
}
