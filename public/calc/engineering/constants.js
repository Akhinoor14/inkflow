// calc/engineering/constants.js
// ════════════════════════════════════════════════════════════
//  PHYSICAL & ENGINEERING CONSTANTS
//  80+ constants from NIST CODATA 2018 + engineering standards
//  Organized by category with symbol, name, value, unit, uncertainty
// ════════════════════════════════════════════════════════════
'use strict';

const Constants = (() => {

  const DB = [
    // ── Universal Constants ──────────────────────────────────
    { sym:'c',      name:'Speed of Light (vacuum)',     val:299792458,          unit:'m/s',        unc:'exact',   cat:'Universal',  desc:'Defines the metre via SI' },
    { sym:'h',      name:'Planck Constant',             val:6.62607015e-34,     unit:'J·s',        unc:'exact',   cat:'Universal',  desc:'Quantum of action' },
    { sym:'ħ',      name:'Reduced Planck (h/2π)',       val:1.054571817e-34,    unit:'J·s',        unc:'exact',   cat:'Universal',  desc:'h-bar' },
    { sym:'G',      name:'Gravitational Constant',      val:6.67430e-11,        unit:'m³/kg·s²',   unc:'22 ppm',  cat:'Universal',  desc:'Newton\'s gravitational constant' },
    { sym:'μ₀',     name:'Vacuum Magnetic Permeability',val:1.25663706212e-6,   unit:'N/A²',       unc:'1.5e-10', cat:'Universal',  desc:'Permeability of free space' },
    { sym:'ε₀',     name:'Vacuum Electric Permittivity',val:8.8541878128e-12,   unit:'F/m',        unc:'1.5e-10', cat:'Universal',  desc:'Permittivity of free space' },
    { sym:'Z₀',     name:'Impedance of Free Space',     val:376.730313668,      unit:'Ω',          unc:'exact',   cat:'Universal',  desc:'μ₀c' },

    // ── Electromagnetic ──────────────────────────────────────
    { sym:'e',      name:'Elementary Charge',           val:1.602176634e-19,    unit:'C',          unc:'exact',   cat:'EM',         desc:'Charge of a proton' },
    { sym:'F',      name:'Faraday Constant',            val:96485.33212,        unit:'C/mol',      unc:'exact',   cat:'EM',         desc:'Nₐ·e' },
    { sym:'Φ₀',     name:'Magnetic Flux Quantum',       val:2.067833848e-15,    unit:'Wb',         unc:'exact',   cat:'EM',         desc:'h/2e' },
    { sym:'KJ',     name:'Josephson Constant',          val:483597.8484e9,      unit:'Hz/V',       unc:'exact',   cat:'EM',         desc:'2e/h' },
    { sym:'RK',     name:'von Klitzing Constant',       val:25812.80745,        unit:'Ω',          unc:'exact',   cat:'EM',         desc:'h/e²' },
    { sym:'μB',     name:'Bohr Magneton',               val:9.2740100783e-24,   unit:'J/T',        unc:'3e-10',   cat:'EM',         desc:'e·ħ/2mₑ' },
    { sym:'μN',     name:'Nuclear Magneton',            val:5.0507837461e-27,   unit:'J/T',        unc:'3e-10',   cat:'EM',         desc:'e·ħ/2mₚ' },

    // ── Atomic & Nuclear ─────────────────────────────────────
    { sym:'Nₐ',     name:'Avogadro Number',             val:6.02214076e23,      unit:'mol⁻¹',      unc:'exact',   cat:'Atomic',     desc:'Particles per mole' },
    { sym:'mₑ',     name:'Electron Mass',               val:9.1093837015e-31,   unit:'kg',         unc:'3e-10',   cat:'Atomic',     desc:'Rest mass of electron' },
    { sym:'mₚ',     name:'Proton Mass',                 val:1.67262192369e-27,  unit:'kg',         unc:'3.1e-10', cat:'Atomic',     desc:'Rest mass of proton' },
    { sym:'mₙ',     name:'Neutron Mass',                val:1.67492749804e-27,  unit:'kg',         unc:'5.7e-10', cat:'Atomic',     desc:'Rest mass of neutron' },
    { sym:'mμ',     name:'Muon Mass',                   val:1.883531627e-28,    unit:'kg',         unc:'2.5e-8',  cat:'Atomic',     desc:'Rest mass of muon' },
    { sym:'mₐ',     name:'Atomic Mass Unit (u)',        val:1.66053906660e-27,  unit:'kg',         unc:'3e-10',   cat:'Atomic',     desc:'1/12 of ¹²C mass' },
    { sym:'α',      name:'Fine Structure Constant',     val:7.2973525693e-3,    unit:'',           unc:'1.5e-10', cat:'Atomic',     desc:'e²/4πε₀ħc ≈ 1/137' },
    { sym:'aₒ',     name:'Bohr Radius',                 val:5.29177210903e-11,  unit:'m',          unc:'1.5e-10', cat:'Atomic',     desc:'Most probable e⁻ radius in H' },
    { sym:'rₑ',     name:'Classical Electron Radius',   val:2.8179403227e-15,   unit:'m',          unc:'4.5e-10', cat:'Atomic',     desc:'e²/4πε₀mₑc²' },
    { sym:'λC',     name:'Compton Wavelength',          val:2.42631023867e-12,  unit:'m',          unc:'1.5e-10', cat:'Atomic',     desc:'h/mₑc' },
    { sym:'Eh',     name:'Hartree Energy',              val:4.3597447222071e-18,unit:'J',          unc:'1.5e-10', cat:'Atomic',     desc:'α²mₑc²' },
    { sym:'Ry',     name:'Rydberg Energy',              val:2.1798723611035e-18,unit:'J',          unc:'1.5e-10', cat:'Atomic',     desc:'Eh/2' },
    { sym:'R∞',     name:'Rydberg Constant',            val:10973731.568160,    unit:'m⁻¹',        unc:'1.9e-12', cat:'Atomic',     desc:'α²mₑc/2h' },
    { sym:'σ_T',    name:'Thomson Cross Section',       val:6.6524587321e-29,   unit:'m²',         unc:'9e-10',   cat:'Atomic',     desc:'8π/3 · rₑ²' },
    { sym:'mp/me',  name:'Proton-Electron Mass Ratio',  val:1836.15267343,      unit:'',           unc:'6.2e-11', cat:'Atomic',     desc:'mₚ/mₑ' },

    // ── Thermodynamics ───────────────────────────────────────
    { sym:'k',      name:'Boltzmann Constant',          val:1.380649e-23,       unit:'J/K',        unc:'exact',   cat:'Thermo',     desc:'Relates temperature to energy' },
    { sym:'R',      name:'Gas Constant (Molar)',        val:8.314462618,        unit:'J/mol·K',    unc:'exact',   cat:'Thermo',     desc:'Nₐ·k' },
    { sym:'σ',      name:'Stefan-Boltzmann Constant',  val:5.670374419e-8,     unit:'W/m²·K⁴',    unc:'exact',   cat:'Thermo',     desc:'2π⁵k⁴/15h³c²' },
    { sym:'c₁',     name:'First Radiation Constant',   val:3.741771852e-16,    unit:'W·m²',       unc:'exact',   cat:'Thermo',     desc:'2πhc²' },
    { sym:'c₂',     name:'Second Radiation Constant',  val:1.438776877e-2,     unit:'m·K',        unc:'exact',   cat:'Thermo',     desc:'hc/k' },
    { sym:'b',      name:'Wien Displacement Constant', val:2.897771955e-3,     unit:'m·K',        unc:'exact',   cat:'Thermo',     desc:'λ_peak · T = b' },
    { sym:'Vm',     name:'Molar Volume (STP, 0°C)',     val:0.022413969545,     unit:'m³/mol',     unc:'exact',   cat:'Thermo',     desc:'At 0°C, 101325 Pa' },
    { sym:'Vm25',   name:'Molar Volume (25°C, 1 bar)',  val:0.024789568,        unit:'m³/mol',     unc:'exact',   cat:'Thermo',     desc:'At 25°C, 100000 Pa' },

    // ── Mechanics / Geophysical ───────────────────────────────
    { sym:'g',      name:'Standard Gravity',            val:9.80665,            unit:'m/s²',       unc:'exact',   cat:'Mechanics',  desc:'Standard gravitational acceleration' },
    { sym:'atm',    name:'Standard Atmosphere',         val:101325,             unit:'Pa',         unc:'exact',   cat:'Mechanics',  desc:'Defines the bar and atm' },
    { sym:'R_Earth',name:'Earth Mean Radius',           val:6.3781e6,           unit:'m',          unc:'-',       cat:'Mechanics',  desc:'Mean volumetric radius' },
    { sym:'M_Earth',name:'Earth Mass',                  val:5.9722e24,          unit:'kg',         unc:'-',       cat:'Mechanics',  desc:'Geocentric gravitational constant/G' },
    { sym:'M_Sun',  name:'Solar Mass',                  val:1.989e30,           unit:'kg',         unc:'-',       cat:'Mechanics',  desc:'GM☉/G' },
    { sym:'AU',     name:'Astronomical Unit',           val:1.495978707e11,     unit:'m',          unc:'exact',   cat:'Mechanics',  desc:'Mean Earth-Sun distance' },
    { sym:'ly',     name:'Light-Year',                  val:9.4607304725808e15, unit:'m',          unc:'exact',   cat:'Mechanics',  desc:'Distance light travels in 1 year' },
    { sym:'pc',     name:'Parsec',                      val:3.085677581e16,     unit:'m',          unc:'-',       cat:'Mechanics',  desc:'Parallax of one arcsecond' },

    // ── Mathematical Constants ────────────────────────────────
    { sym:'π',      name:'Pi',                          val:Math.PI,            unit:'',           unc:'exact',   cat:'Math',       desc:'Ratio of circumference to diameter' },
    { sym:'e',      name:"Euler's Number",              val:Math.E,             unit:'',           unc:'exact',   cat:'Math',       desc:'Base of natural logarithm' },
    { sym:'φ',      name:'Golden Ratio',                val:1.6180339887498949, unit:'',           unc:'exact',   cat:'Math',       desc:'(1+√5)/2 = 1 + 1/φ' },
    { sym:'√2',     name:'Square Root of 2',            val:Math.SQRT2,         unit:'',           unc:'exact',   cat:'Math',       desc:'Pythagoras constant' },
    { sym:'√3',     name:'Square Root of 3',            val:Math.sqrt(3),       unit:'',           unc:'exact',   cat:'Math',       desc:'Theodorus constant' },
    { sym:'ln2',    name:'Natural Log of 2',            val:Math.LN2,           unit:'',           unc:'exact',   cat:'Math',       desc:'ln(2) = log₂(e)⁻¹' },
    { sym:'γ',      name:'Euler-Mascheroni Constant',   val:0.5772156649015329, unit:'',           unc:'exact',   cat:'Math',       desc:'Limiting diff of harmonic series and ln' },
    { sym:'ζ(3)',   name:'Apéry\'s Constant',           val:1.2020569031595943, unit:'',           unc:'exact',   cat:'Math',       desc:'Riemann ζ(3)' },
    { sym:'K',      name:'Catalan\'s Constant',         val:0.9159655941772190, unit:'',           unc:'exact',   cat:'Math',       desc:'Σ (-1)ⁿ/(2n+1)²' },

    // ── Material Properties (Standard values) ─────────────────
    { sym:'ρ_w',    name:'Water Density (4°C)',         val:999.9720,           unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Maximum density of water' },
    { sym:'ρ_air',  name:'Air Density (STP, dry)',      val:1.2922,             unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'At 0°C, 101325 Pa' },
    { sym:'ρ_al',   name:'Aluminium Density',           val:2700,               unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Pure aluminium at 20°C' },
    { sym:'ρ_st',   name:'Steel Density (structural)', val:7850,               unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Typical structural steel' },
    { sym:'ρ_cu',   name:'Copper Density',              val:8960,               unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Pure copper at 20°C' },
    { sym:'ρ_fe',   name:'Iron Density',                val:7874,               unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Pure iron at 20°C' },
    { sym:'ρ_pb',   name:'Lead Density',                val:11340,              unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Pure lead at 20°C' },
    { sym:'ρ_ti',   name:'Titanium Density',            val:4507,               unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Pure titanium at 20°C' },
    { sym:'ρ_ni',   name:'Nickel Density',              val:8908,               unit:'kg/m³',      unc:'-',       cat:'Materials',  desc:'Pure nickel at 20°C' },
    { sym:'E_st',   name:'Steel Elastic Modulus',       val:200e9,              unit:'Pa',         unc:'-',       cat:'Materials',  desc:'Young\'s modulus of steel' },
    { sym:'E_al',   name:'Aluminium Elastic Modulus',   val:69e9,               unit:'Pa',         unc:'-',       cat:'Materials',  desc:'Young\'s modulus of Al' },
    { sym:'E_cu',   name:'Copper Elastic Modulus',      val:120e9,              unit:'Pa',         unc:'-',       cat:'Materials',  desc:'Young\'s modulus of copper' },
    { sym:'ν_st',   name:'Steel Poisson\'s Ratio',      val:0.30,               unit:'',           unc:'-',       cat:'Materials',  desc:'Typical value' },
    { sym:'ν_al',   name:'Aluminium Poisson\'s Ratio',  val:0.33,               unit:'',           unc:'-',       cat:'Materials',  desc:'Typical value' },
    { sym:'α_al',   name:'Al Thermal Expansion',        val:23.1e-6,            unit:'K⁻¹',        unc:'-',       cat:'Materials',  desc:'Linear CTE at 25°C' },
    { sym:'α_st',   name:'Steel Thermal Expansion',     val:12e-6,              unit:'K⁻¹',        unc:'-',       cat:'Materials',  desc:'Linear CTE at 25°C' },
    { sym:'cₚ_w',   name:'Water Specific Heat (15°C)',  val:4186,               unit:'J/kg·K',     unc:'-',       cat:'Materials',  desc:'At 15°C, 101325 Pa' },
    { sym:'cₚ_a',   name:'Air Specific Heat (const P)', val:1005,               unit:'J/kg·K',     unc:'-',       cat:'Materials',  desc:'At 25°C' },
    { sym:'cₚ_st',  name:'Steel Specific Heat',         val:490,                unit:'J/kg·K',     unc:'-',       cat:'Materials',  desc:'Carbon steel, typical' },
    { sym:'k_w',    name:'Water Thermal Conductivity',  val:0.598,              unit:'W/m·K',      unc:'-',       cat:'Materials',  desc:'At 20°C' },
    { sym:'k_al',   name:'Al Thermal Conductivity',     val:205,                unit:'W/m·K',      unc:'-',       cat:'Materials',  desc:'At 20°C' },
    { sym:'k_cu',   name:'Copper Thermal Conductivity', val:385,                unit:'W/m·K',      unc:'-',       cat:'Materials',  desc:'At 20°C' },
    { sym:'μ_w',    name:'Water Dynamic Viscosity',     val:1.002e-3,           unit:'Pa·s',       unc:'-',       cat:'Materials',  desc:'At 20°C' },
    { sym:'μ_air',  name:'Air Dynamic Viscosity',       val:1.81e-5,            unit:'Pa·s',       unc:'-',       cat:'Materials',  desc:'At 20°C' },

    // ── Electrical / Electronics ──────────────────────────────
    { sym:'ρ_cu_e', name:'Copper Resistivity',          val:1.72e-8,            unit:'Ω·m',        unc:'-',       cat:'Electrical', desc:'At 20°C (annealed)' },
    { sym:'ρ_al_e', name:'Aluminium Resistivity',       val:2.82e-8,            unit:'Ω·m',        unc:'-',       cat:'Electrical', desc:'At 20°C' },
    { sym:'ρ_si',   name:'Silicon Resistivity',         val:640,                unit:'Ω·m',        unc:'-',       cat:'Electrical', desc:'Intrinsic Si at 300K' },
    { sym:'k_B/e',  name:'Thermal Voltage (300K)',      val:0.025852,           unit:'V',          unc:'-',       cat:'Electrical', desc:'kT/e at T=300K' },

    // ── Fluid Mechanics ───────────────────────────────────────
    { sym:'ρ_Hg',   name:'Mercury Density (20°C)',      val:13546,              unit:'kg/m³',      unc:'-',       cat:'Fluid',      desc:'At 20°C, 1 atm' },
    { sym:'γ_w',    name:'Water Specific Weight',       val:9810,               unit:'N/m³',       unc:'-',       cat:'Fluid',      desc:'At 4°C: ρg' },
    { sym:'σ_w',    name:'Water Surface Tension (20°C)',val:0.0728,             unit:'N/m',        unc:'-',       cat:'Fluid',      desc:'Water-air interface at 20°C' },
    { sym:'p_v_w',  name:'Water Vapour Pressure (20°C)',val:2338,               unit:'Pa',         unc:'-',       cat:'Fluid',      desc:'Saturation pressure at 20°C' },
    { sym:'Pr_air', name:'Air Prandtl Number (20°C)',   val:0.7073,             unit:'',           unc:'-',       cat:'Fluid',      desc:'μcₚ/k at 20°C' },
    { sym:'Pr_w',   name:'Water Prandtl Number (20°C)', val:6.99,               unit:'',           unc:'-',       cat:'Fluid',      desc:'μcₚ/k at 20°C' },
  ];

  // ── Category list ─────────────────────────────────────────
  const CATEGORIES = [...new Set(DB.map(c => c.cat))];

  // ── Lookup functions ──────────────────────────────────────
  function getAll()                { return DB; }
  function getByCategory(cat)      { return DB.filter(c => c.cat === cat); }
  function search(query) {
    const q = query.toLowerCase();
    return DB.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.sym.toLowerCase().includes(q) ||
      c.cat.toLowerCase().includes(q) ||
      c.unit.toLowerCase().includes(q) ||
      (c.desc && c.desc.toLowerCase().includes(q))
    );
  }
  function getBySym(sym) { return DB.find(c => c.sym === sym); }
  function categories()  { return CATEGORIES; }

  // ── Format value for display ──────────────────────────────
  function formatVal(val) {
    if (val === 0) return '0';
    const abs = Math.abs(val);
    if (abs >= 1e15 || (abs < 1e-4 && abs > 0)) {
      return val.toExponential(6)
        .replace('e+', '×10^').replace('e-', '×10^−');
    }
    return String(parseFloat(val.toPrecision(10)));
  }

  // ── Public API ────────────────────────────────────────────
  return { DB, getAll, getByCategory, search, getBySym, categories, formatVal };

})();

if (typeof module !== 'undefined') module.exports = Constants;
else window.Constants = Constants;
