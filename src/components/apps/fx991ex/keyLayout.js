// fx-991EX ClassWiz — Complete 60-key layout
// action      = primary key action
// shiftAction = SHIFT + key action
// alphaAction = ALPHA + key action

export const KEY_ROWS = [
  // ── Row 0: SHIFT, ALPHA, ◄►▲▼, MENU, ON ──────────────────────────────────
  [
    { id:'SHIFT', label:'SHIFT', color:'shift',    action:'SHIFT', width:1.05 },
    { id:'ALPHA', label:'ALPHA', color:'alpha-key',action:'ALPHA', width:1.05 },
    { id:'LEFT',  label:'◄',    color:'nav',       action:'LEFT',  width:0.85 },
    { id:'RIGHT', label:'►',    color:'nav',       action:'RIGHT', width:0.85 },
    { id:'UP',    label:'▲',    color:'nav',       action:'UP',    width:0.85 },
    { id:'DOWN',  label:'▼',    color:'nav',       action:'DOWN',  width:0.85 },
    { id:'MENU',  label:'MENU', color:'blue',      action:'MENU',
      shiftLabel:'SETUP', shiftAction:'SETUP', width:1.05 },
    { id:'ON',    label:'ON',   color:'red',       action:'ON',    width:1.05 },
  ],

  // ── Row 1: CALC, ∫dx, ↑, ↓, x⁻¹, logₐx ──────────────────────────────────
  [
    { id:'CALC',  label:'CALC',   color:'gray', action:'CALC',
      shiftLabel:'SOLVE',  shiftAction:'SOLVE',
      alphaLabel:'',       subLabel:'SOLVE =' },
    { id:'INT',   label:'∫dx',   color:'gray', action:'INTEGRAL',
      shiftLabel:'d/dx',   shiftAction:'DERIV',
      alphaLabel:':' },
    { id:'SUMU',  label:'↑',     color:'gray', action:'UP2',
      shiftLabel:'Σ',      shiftAction:'SIGMA' },
    { id:'SUMD',  label:'↓',     color:'gray', action:'DOWN2' },
    { id:'RECIP', label:'x⁻¹',  color:'gray', action:'RECIP',
      shiftLabel:'x!',     shiftAction:'FACT',
      subLabel:'Σ  Π' },
    { id:'LOGAX', label:'logₐx', color:'gray', action:'LOGAX',
      shiftLabel:'10ˣ',    shiftAction:'10X',
      alphaLabel:'t' },
  ],

  // ── Row 2: a b/c, √x, x², xʸ, log, ln ───────────────────────────────────
  [
    { id:'FRAC',  label:'a b/c', color:'gray', action:'FRAC',
      shiftLabel:'a→b/c',  shiftAction:'IMPROPER',
      subLabel:'÷R' },
    { id:'SQRT',  label:'√x',   color:'gray', action:'SQRT',
      shiftLabel:'³√x',    shiftAction:'CBRT',
      subLabel:'mod' },
    { id:'SQ',    label:'x²',   color:'gray', action:'SQ',
      shiftLabel:'x³',     shiftAction:'CUBE',
      subLabel:'Abs',      alphaLabel:'i' },
    { id:'POW',   label:'xʸ',   color:'gray', action:'POW',
      shiftLabel:'ʸ√x',    shiftAction:'YPOW',
      alphaLabel:'c' },
    { id:'LOG',   label:'log',  color:'gray', action:'LOG',
      shiftLabel:'10ˣ',    shiftAction:'10X2',
      alphaLabel:'d' },
    { id:'LN',    label:'ln',   color:'gray', action:'LN',
      shiftLabel:'eˣ',     shiftAction:'EXP',
      alphaLabel:'e' },
  ],

  // ── Row 3: (-), °'", hyp, sin, cos, tan ──────────────────────────────────
  [
    { id:'NEG',  label:'(-)',   color:'gray', action:'NEG',
      alphaLabel:'A' },
    { id:'DMS',  label:'°\'"',  color:'gray', action:'DMS',
      alphaLabel:'',  subLabel:'°‴' },
    { id:'HYP',  label:'hyp',  color:'gray', action:'HYP',
      shiftLabel:'FACT', shiftAction:'FACTOR' },
    { id:'SIN',  label:'sin',  color:'gray', action:'SIN',
      shiftLabel:'sin⁻¹', shiftAction:'ASIN',
      alphaLabel:'B',     subLabel:'Sin⁻¹' },
    { id:'COS',  label:'cos',  color:'gray', action:'COS',
      shiftLabel:'cos⁻¹', shiftAction:'ACOS',
      alphaLabel:'C',     subLabel:'Cos⁻¹' },
    { id:'TAN',  label:'tan',  color:'gray', action:'TAN',
      shiftLabel:'tan⁻¹', shiftAction:'ATAN',
      alphaLabel:'D',     subLabel:'Tan⁻¹' },
  ],

  // ── Row 4: RCL, ENG, (, ), S⇔D, M+ ─────────────────────────────────────
  [
    { id:'RCL',   label:'RCL',  color:'gray', action:'RCL',
      shiftLabel:'STO', shiftAction:'STO',
      subLabel:'CLRv' },
    { id:'ENG',   label:'ENG',  color:'gray', action:'ENG',
      shiftLabel:'CONST', shiftAction:'CONST',
      subLabel:'Cot %' },
    { id:'LPAR',  label:'(',    color:'gray', action:'LPAR',
      shiftLabel:'Lim', shiftAction:'LIM',
      subLabel:'CONST CONV' },
    { id:'RPAR',  label:')',    color:'gray', action:'RPAR',
      subLabel:'∞' },
    { id:'SD',    label:'S⇔D', color:'blue', action:'SD',
      shiftLabel:'Pol',  shiftAction:'POL',
      alphaLabel:'x',    subLabel:'Rec' },
    { id:'MPLUS', label:'M+',  color:'gray', action:'MPLUS',
      shiftLabel:'M−',   shiftAction:'MMINUS',
      alphaLabel:'m',    subLabel:'M−  m' },
  ],

  // ── Row 5: 7, 8, 9, DEL, CLR ─────────────────────────────────────────────
  [
    { id:'7',   label:'7', color:'white', action:'7',
      shiftLabel:'MATRIX', shiftAction:'MODE_MATRIX',
      subLabel:'MATRIX' },
    { id:'8',   label:'8', color:'white', action:'8',
      shiftLabel:'VECTOR', shiftAction:'MODE_VECTOR',
      subLabel:'VECTOR' },
    { id:'9',   label:'9', color:'white', action:'9',
      shiftLabel:'FUNC',   shiftAction:'FUNC',
      subLabel:'nPr GCD' },
    { id:'DEL', label:'DEL', color:'orange', action:'DEL',
      shiftLabel:'INS',    shiftAction:'INS',
      width:1.15 },
    { id:'CLR', label:'CLR', color:'orange', action:'CLR',
      shiftLabel:'CLR All',shiftAction:'CLRALL',
      width:1.15 },
  ],

  // ── Row 6: 4, 5, 6, ×, ÷ ─────────────────────────────────────────────────
  [
    { id:'4',   label:'4', color:'white', action:'4',
      shiftLabel:'STAT',  shiftAction:'MODE_STAT' },
    { id:'5',   label:'5', color:'white', action:'5',
      shiftLabel:'CMPLX', shiftAction:'MODE_CMPLX' },
    { id:'6',   label:'6', color:'white', action:'6',
      shiftLabel:'DISTR', shiftAction:'MODE_DIST',
      subLabel:'nCr LCM' },
    { id:'MUL', label:'×', color:'dark-gray', action:'×',
      subLabel:'Pol Ceil', width:1.15 },
    { id:'DIV', label:'÷', color:'dark-gray', action:'÷',
      subLabel:'Rec Floor',width:1.15 },
  ],

  // ── Row 7: 1, 2, 3, +, − ─────────────────────────────────────────────────
  [
    { id:'1',     label:'1', color:'white', action:'1', alphaLabel:'F' },
    { id:'2',     label:'2', color:'white', action:'2' },
    { id:'3',     label:'3', color:'white', action:'3' },
    { id:'PLUS',  label:'+', color:'dark-gray', action:'+',
      shiftLabel:'PreAns', shiftAction:'PREANS', width:1.15 },
    { id:'MINUS', label:'−', color:'dark-gray', action:'−',
      shiftLabel:'History',shiftAction:'HISTORY', width:1.15 },
  ],

  // ── Row 8: 0, ., Exp, Ans, = ─────────────────────────────────────────────
  [
    { id:'0',   label:'0',   color:'white',  action:'0',
      shiftLabel:'Ran#',   shiftAction:'RAN' },
    { id:'DOT', label:'.',   color:'white',  action:'.',
      shiftLabel:'RanInt', shiftAction:'RANINT' },
    { id:'EXP', label:'Exp', color:'white',  action:'EXP10',
      shiftLabel:'π',      shiftAction:'PI',
      alphaLabel:'e',      alphaAction:'EULER' },
    { id:'ANS', label:'Ans', color:'orange', action:'ANS',
      subLabel:'PreAns',   width:1.2 },
    { id:'EQ',  label:'=',   color:'equals', action:'=',
      width:1.2 },
  ],
]

// Extra engineering converter button (outside Casio layout)
export const EXTRA_CONV_KEY = {
  id:'CONVPLUS', label:'CONV+', subLabel:'Engineering Converter',
  color:'blue', action:'CONVPLUS', width:3.5
}
