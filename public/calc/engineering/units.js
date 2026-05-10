// calc/engineering/units.js
// ════════════════════════════════════════════════════════════
//  UNIT CONVERSION DATABASE
//  25+ categories covering all engineering domains
//  Each unit stored as its SI base value (multiply to convert TO base)
//  Special conversions (temperature, fuel) handled separately
// ════════════════════════════════════════════════════════════
'use strict';

const Units = (() => {

  // ── Conversion Database ───────────────────────────────────
  const DB = {

    LENGTH: {
      label: '📏 Length', base: 'm',
      units: {
        'm': 1, 'km': 1e3, 'cm': 0.01, 'mm': 1e-3, 'μm': 1e-6,
        'nm': 1e-9, 'pm': 1e-12, 'Å': 1e-10,
        'mile': 1609.344, 'yard': 0.9144, 'foot': 0.3048,
        'inch': 0.0254, 'thou (mil)': 2.54e-5,
        'nautical mile': 1852, 'fathom': 1.8288,
        'furlong': 201.168, 'chain': 20.1168,
        'light-year': 9.4607304725808e15, 'AU': 1.495978707e11,
        'parsec': 3.085677581e16, 'light-second': 299792458,
        'league': 4828.032,
      },
    },

    MASS: {
      label: '⚖️ Mass', base: 'kg',
      units: {
        'kg': 1, 'g': 1e-3, 'mg': 1e-6, 'μg': 1e-9, 'ng': 1e-12,
        'tonne': 1000, 'lb': 0.45359237, 'oz': 0.028349523125,
        'stone': 6.35029318, 'ton (US)': 907.18474,
        'ton (UK)': 1016.0469088, 'carat': 2e-4,
        'grain': 6.479891e-5, 'slug': 14.593903,
        'drachm': 1.7718452e-3, 'scruple': 1.2959782e-3,
        'atomic mass unit': 1.66053906660e-27,
        'electron mass': 9.1093837015e-31,
        'solar mass': 1.989e30,
      },
    },

    TEMPERATURE: {
      label: '🌡️ Temperature', base: 'K', special: true,
      units: { '°C': 0, '°F': 1, 'K': 2, '°R': 3 },
      convert: (v, from, to) => {
        // to Kelvin
        const toK = { '°C': v=>v+273.15, '°F': v=>(v+459.67)*5/9, 'K': v=>v, '°R': v=>v*5/9 };
        // from Kelvin
        const fromK = { '°C': v=>v-273.15, '°F': v=>v*9/5-459.67, 'K': v=>v, '°R': v=>v*9/5 };
        return fromK[to](toK[from](v));
      },
    },

    AREA: {
      label: '⬜ Area', base: 'm²',
      units: {
        'm²': 1, 'km²': 1e6, 'cm²': 1e-4, 'mm²': 1e-6, 'μm²': 1e-12,
        'hectare': 1e4, 'acre': 4046.8564224,
        'mile²': 2.58998811e6, 'yard²': 0.83612736,
        'ft²': 0.09290304, 'in²': 6.4516e-4,
        'barn': 1e-28, 'are': 100,
        'township': 9.3239571e7,
      },
    },

    VOLUME: {
      label: '🧊 Volume', base: 'm³',
      units: {
        'm³': 1, 'L': 1e-3, 'mL': 1e-6, 'cm³': 1e-6, 'mm³': 1e-9,
        'μL': 1e-9, 'nL': 1e-12,
        'gallon (US)': 3.785411784e-3, 'gallon (UK)': 4.54609e-3,
        'quart (US)': 9.46352946e-4, 'pint (US)': 4.73176473e-4,
        'cup (US)': 2.365882365e-4, 'fl oz (US)': 2.95735296e-5,
        'tablespoon': 1.47867648e-5, 'teaspoon': 4.92892159e-6,
        'ft³': 0.028316846592, 'in³': 1.6387064e-5, 'yard³': 0.764554858,
        'barrel (oil)': 0.158987295, 'barrel (US beer)': 0.117347765,
        'cord (wood)': 3.624556, 'bushel (US)': 3.523907e-2,
      },
    },

    TIME: {
      label: '⏱️ Time', base: 's',
      units: {
        's': 1, 'ms': 1e-3, 'μs': 1e-6, 'ns': 1e-9, 'ps': 1e-12, 'fs': 1e-15,
        'min': 60, 'hr': 3600, 'day': 86400, 'week': 604800,
        'fortnight': 1209600, 'month (avg)': 2629800,
        'year': 31557600, 'decade': 3.15576e8, 'century': 3.15576e9,
        'millennium': 3.15576e10,
        'Planck time': 5.391247e-44,
      },
    },

    SPEED: {
      label: '🚀 Speed', base: 'm/s',
      units: {
        'm/s': 1, 'km/h': 1/3.6, 'cm/s': 0.01,
        'mph': 0.44704, 'ft/s': 0.3048, 'in/s': 0.0254,
        'knot': 0.514444, 'Mach (air, 20°C)': 343,
        'c (light)': 299792458,
        'km/min': 1000/60, 'mile/min': 26.8224,
        'ft/min': 0.00508*100,
      },
    },

    ACCELERATION: {
      label: '⬆️ Acceleration', base: 'm/s²',
      units: {
        'm/s²': 1, 'cm/s²': 0.01, 'ft/s²': 0.3048, 'in/s²': 0.0254,
        'g (standard)': 9.80665, 'Gal': 0.01, 'mGal': 1e-5,
        'km/h/s': 1/3.6, 'mph/s': 0.44704,
      },
    },

    FORCE: {
      label: '💪 Force', base: 'N',
      units: {
        'N': 1, 'kN': 1e3, 'MN': 1e6, 'GN': 1e9, 'mN': 1e-3, 'μN': 1e-6,
        'lbf': 4.4482216153, 'kip': 4448.2216,
        'kgf': 9.80665, 'ton-force (metric)': 9806.65,
        'ton-force (US)': 8896.443, 'dyne': 1e-5,
        'poundal': 0.138254954376, 'ozf': 0.27801385,
        'sthène': 1000,
      },
    },

    PRESSURE: {
      label: '🔵 Pressure', base: 'Pa',
      units: {
        'Pa': 1, 'kPa': 1e3, 'MPa': 1e6, 'GPa': 1e9, 'mPa': 1e-3, 'μPa': 1e-6,
        'bar': 1e5, 'mbar': 100, 'μbar': 0.1,
        'atm': 101325, 'Torr': 133.322368, 'mmHg': 133.322368,
        'cmHg': 1333.22368, 'inHg': 3386.389,
        'psi': 6894.757, 'ksi': 6894757, 'psf': 47.88026,
        'kgf/cm²': 98066.5, 'kgf/m²': 9.80665,
        'mmH₂O': 9.80665, 'inH₂O (4°C)': 249.089,
        'ftH₂O': 2989.067,
      },
    },

    ENERGY: {
      label: '⚡ Energy', base: 'J',
      units: {
        'J': 1, 'kJ': 1e3, 'MJ': 1e6, 'GJ': 1e9, 'TJ': 1e12,
        'mJ': 1e-3, 'μJ': 1e-6, 'nJ': 1e-9,
        'cal': 4.184, 'kcal': 4184, 'Cal (food)': 4184,
        'Wh': 3600, 'kWh': 3.6e6, 'MWh': 3.6e9, 'GWh': 3.6e12,
        'BTU': 1055.0559, 'BTU (IT)': 1055.05585,
        'therm': 1.05480400e8,
        'eV': 1.602176634e-19, 'keV': 1.602176634e-16, 'MeV': 1.602176634e-13,
        'erg': 1e-7, 'ft·lbf': 1.3558179, 'in·lbf': 0.11298483,
        'ton of TNT': 4.184e9, 'kt TNT': 4.184e12,
        'Hartree': 4.3597447222071e-18,
        'Rydberg': 2.1798723611035e-18,
      },
    },

    POWER: {
      label: '⚡ Power', base: 'W',
      units: {
        'W': 1, 'kW': 1e3, 'MW': 1e6, 'GW': 1e9, 'TW': 1e12,
        'mW': 1e-3, 'μW': 1e-6, 'nW': 1e-9,
        'hp (mech)': 745.69987, 'hp (metric)': 735.49875,
        'hp (elec)': 746, 'hp (boiler)': 9809.5,
        'BTU/hr': 0.29307107, 'BTU/min': 17.584264,
        'BTU/s': 1055.0559, 'ft·lbf/s': 1.3558179,
        'ft·lbf/min': 0.022596966, 'kcal/hr': 1.163,
        'cal/s': 4.184, 'erg/s': 1e-7, 'ton of refrig': 3516.8528,
      },
    },

    TORQUE: {
      label: '🔧 Torque / Moment', base: 'N·m',
      units: {
        'N·m': 1, 'kN·m': 1e3, 'MN·m': 1e6, 'N·cm': 0.01, 'N·mm': 1e-3,
        'lbf·ft': 1.3558179, 'lbf·in': 0.11298483,
        'kip·ft': 1355.8179, 'kip·in': 112.98483,
        'kgf·m': 9.80665, 'kgf·cm': 0.0980665,
        'ozf·in': 0.007061552, 'dyne·cm': 1e-7,
      },
    },

    FREQUENCY: {
      label: '〜 Frequency', base: 'Hz',
      units: {
        'Hz': 1, 'kHz': 1e3, 'MHz': 1e6, 'GHz': 1e9, 'THz': 1e12,
        'mHz': 1e-3, 'μHz': 1e-6, 'rpm': 1/60, 'rps': 1,
        'rad/s': 1/(2*Math.PI), 'deg/s': 1/360,
        'cycles/min': 1/60, 'cycles/hr': 1/3600,
      },
    },

    ANGLE: {
      label: '📐 Angle', base: 'rad',
      units: {
        'rad': 1, 'mrad': 1e-3, 'μrad': 1e-6,
        'deg': Math.PI/180, 'arcmin': Math.PI/10800,
        'arcsec': Math.PI/648000, 'grad': Math.PI/200,
        'turn': 2*Math.PI, 'rev': 2*Math.PI,
        'quadrant': Math.PI/2, 'sextant': Math.PI/3,
        'point (compass)': Math.PI/16,
      },
    },

    DIGITAL: {
      label: '💾 Data Storage', base: 'bit',
      units: {
        'bit': 1, 'byte': 8, 'kilobit': 1e3, 'megabit': 1e6,
        'gigabit': 1e9, 'terabit': 1e12,
        'KB': 8e3, 'MB': 8e6, 'GB': 8e9, 'TB': 8e12, 'PB': 8e15,
        'KiB': 8*1024, 'MiB': 8*1048576, 'GiB': 8*1073741824,
        'TiB': 8*1099511627776, 'PiB': 8*1125899906842624,
        'nibble': 4, 'word (16-bit)': 16, 'dword (32-bit)': 32,
        'qword (64-bit)': 64,
      },
    },

    LUMINANCE: {
      label: '💡 Illuminance', base: 'lux',
      units: {
        'lux': 1, 'klux': 1e3, 'foot-candle': 10.763910417,
        'phot': 10000, 'nox': 1e-3,
      },
    },

    LUMINOUS_INTENSITY: {
      label: '🕯️ Luminous Flux', base: 'lm',
      units: {
        'lm': 1, 'klm': 1000, 'candela·sr': 1,
        'foot-lambert': 3.426259, 'lambert': 3183.099,
      },
    },

    VISCOSITY_DYN: {
      label: '💧 Dynamic Viscosity', base: 'Pa·s',
      units: {
        'Pa·s': 1, 'mPa·s': 1e-3, 'μPa·s': 1e-6,
        'cP (centipoise)': 1e-3, 'P (poise)': 0.1,
        'lbf·s/ft²': 47.880259, 'lbm/(ft·s)': 1.488164,
        'slug/(ft·s)': 47.880259,
      },
    },

    VISCOSITY_KIN: {
      label: '🌊 Kinematic Viscosity', base: 'm²/s',
      units: {
        'm²/s': 1, 'cm²/s (St)': 1e-4, 'mm²/s (cSt)': 1e-6,
        'ft²/s': 0.09290304, 'in²/s': 6.4516e-4,
      },
    },

    HEAT_TRANSFER: {
      label: '🔥 Heat Transfer Coeff', base: 'W/m²·K',
      units: {
        'W/m²·K': 1, 'kW/m²·K': 1e3, 'W/cm²·K': 1e4,
        'BTU/hr·ft²·°F': 5.678263,
        'kcal/hr·m²·°C': 1.163,
        'cal/s·cm²·°C': 41840,
      },
    },

    THERMAL_CONDUCTIVITY: {
      label: '♨️ Thermal Conductivity', base: 'W/m·K',
      units: {
        'W/m·K': 1, 'kW/m·K': 1e3, 'W/cm·K': 100,
        'BTU/hr·ft·°F': 1.730735,
        'BTU·in/hr·ft²·°F': 0.144228, 'cal/s·cm·°C': 418.4,
        'kcal/hr·m·°C': 1.163,
      },
    },

    SPECIFIC_HEAT: {
      label: '🌡️ Specific Heat', base: 'J/kg·K',
      units: {
        'J/kg·K': 1, 'kJ/kg·K': 1e3, 'J/g·K': 1e3,
        'BTU/lb·°F': 4186.8, 'cal/g·°C': 4184,
        'kcal/kg·°C': 4184,
      },
    },

    ELECTRICAL: {
      label: '⚡ Electrical', base: 'V',
      units: {
        'V': 1, 'kV': 1e3, 'MV': 1e6, 'mV': 1e-3, 'μV': 1e-6, 'nV': 1e-9,
      },
    },

    CURRENT: {
      label: '🔌 Current', base: 'A',
      units: {
        'A': 1, 'kA': 1e3, 'mA': 1e-3, 'μA': 1e-6, 'nA': 1e-9, 'pA': 1e-12,
      },
    },

    RESISTANCE: {
      label: '🔋 Resistance', base: 'Ω',
      units: {
        'Ω': 1, 'kΩ': 1e3, 'MΩ': 1e6, 'GΩ': 1e9, 'mΩ': 1e-3, 'μΩ': 1e-6,
      },
    },

    CHARGE: {
      label: '⚡ Electric Charge', base: 'C',
      units: {
        'C': 1, 'mC': 1e-3, 'μC': 1e-6, 'nC': 1e-9, 'pC': 1e-12,
        'Ah': 3600, 'mAh': 3.6, 'μAh': 3.6e-3,
        'faraday': 96485.33212,
        'elementary charge': 1.602176634e-19,
      },
    },

    MAGNETIC_FIELD: {
      label: '🧲 Magnetic Field', base: 'T',
      units: {
        'T': 1, 'mT': 1e-3, 'μT': 1e-6, 'nT': 1e-9, 'pT': 1e-12,
        'kT': 1e3, 'Gauss': 1e-4, 'mGauss': 1e-7,
      },
    },

    RADIOACTIVITY: {
      label: '☢️ Radioactivity', base: 'Bq',
      units: {
        'Bq': 1, 'kBq': 1e3, 'MBq': 1e6, 'GBq': 1e9, 'TBq': 1e12,
        'Ci': 3.7e10, 'mCi': 3.7e7, 'μCi': 3.7e4, 'nCi': 37,
        'pCi': 0.037, 'Rd': 1e6, 'dpm': 1/60,
      },
    },

    RADIATION_DOSE: {
      label: '☢️ Radiation Dose', base: 'Gy',
      units: {
        'Gy': 1, 'mGy': 1e-3, 'μGy': 1e-6, 'kGy': 1e3,
        'Sv': 1, 'mSv': 1e-3, 'μSv': 1e-6,
        'rad': 0.01, 'rem': 0.01,
        'R (Röntgen)': 0.00877,
      },
    },

    CONCENTRATION: {
      label: '🧪 Concentration', base: 'mol/m³',
      units: {
        'mol/m³': 1, 'mmol/m³': 1e-3, 'mol/L (M)': 1000,
        'mmol/L (mM)': 1, 'μmol/L (μM)': 1e-3,
        'nmol/L (nM)': 1e-6, 'pmol/L (pM)': 1e-9,
        'mol/mL': 1e6, 'μmol/mL': 1,
      },
    },

    FUEL_CONSUMPTION: {
      label: '⛽ Fuel Economy', base: 'L/100km', special: 'fuel',
      units: { 'L/100km': 0, 'km/L': 1, 'mpg (US)': 2, 'mpg (UK)': 3, 'km/gal (US)': 4 },
      convert: (v, from, to) => {
        // Convert to L/100km first
        const toBase = {
          'L/100km': v => v,
          'km/L': v => 100/v,
          'mpg (US)': v => 235.214583/v,
          'mpg (UK)': v => 282.480936/v,
          'km/gal (US)': v => 100*3.785411784/v,
        };
        const fromBase = {
          'L/100km': v => v,
          'km/L': v => 100/v,
          'mpg (US)': v => 235.214583/v,
          'mpg (UK)': v => 282.480936/v,
          'km/gal (US)': v => 100*3.785411784/v,
        };
        return fromBase[to](toBase[from](v));
      },
    },

    FLOW_RATE: {
      label: '🌊 Flow Rate (Vol)', base: 'm³/s',
      units: {
        'm³/s': 1, 'L/s': 1e-3, 'L/min': 1/60000, 'L/hr': 1/3600000,
        'mL/s': 1e-6, 'mL/min': 1e-6/60,
        'ft³/s (CFS)': 0.028316847, 'ft³/min (CFM)': 4.7194745e-4,
        'gallon (US)/min (GPM)': 6.30902e-5, 'gallon (US)/hr': 1.04984e-6,
        'barrel (oil)/day': 1.84013e-6, 'acre·ft/day': 0.014276,
      },
    },

    MASS_FLOW: {
      label: '💨 Flow Rate (Mass)', base: 'kg/s',
      units: {
        'kg/s': 1, 'g/s': 1e-3, 'mg/s': 1e-6, 'kg/min': 1/60, 'kg/hr': 1/3600,
        'tonne/hr': 1/3.6, 'lb/s': 0.453592, 'lb/min': 0.453592/60,
        'lb/hr': 0.453592/3600, 'ton (US)/hr': 0.251995,
      },
    },

    DENSITY: {
      label: '🏋️ Density', base: 'kg/m³',
      units: {
        'kg/m³': 1, 'g/m³': 1e-3, 'kg/L': 1000, 'g/L': 1, 'mg/L': 1e-3,
        'g/cm³': 1000, 'g/mL': 1000, 'mg/mL': 1,
        'lb/ft³': 16.018463, 'lb/in³': 27679.905, 'lb/gal (US)': 119.826,
        'oz/in³': 1729.994, 'slug/ft³': 515.379,
      },
    },
  };

  // ── Core conversion function ──────────────────────────────
  function convert(value, from, to, category) {
    const cat = DB[category];
    if (!cat) throw new Error(`Unknown category: ${category}`);

    if (cat.special === true && cat.convert) {
      return cat.convert(value, from, to);
    }
    if (cat.special === 'fuel' && cat.convert) {
      return cat.convert(value, from, to);
    }

    const fromFactor = cat.units[from];
    const toFactor   = cat.units[to];
    if (fromFactor === undefined) throw new Error(`Unknown unit: ${from}`);
    if (toFactor   === undefined) throw new Error(`Unknown unit: ${to}`);

    return (value * fromFactor) / toFactor;
  }

  // ── Convert to all units in category ─────────────────────
  function convertAll(value, from, category) {
    const cat = DB[category];
    if (!cat) return [];
    return Object.keys(cat.units).map(to => {
      try {
        return { unit: to, value: convert(value, from, to, category) };
      } catch {
        return { unit: to, value: NaN };
      }
    });
  }

  // ── Find unit's category ──────────────────────────────────
  function findCategory(unit) {
    for (const [key, cat] of Object.entries(DB)) {
      if (cat.units[unit] !== undefined) return key;
    }
    return null;
  }

  // ── Search units ──────────────────────────────────────────
  function search(query) {
    const q = query.toLowerCase();
    const results = [];
    for (const [catKey, cat] of Object.entries(DB)) {
      if (cat.label.toLowerCase().includes(q)) {
        results.push({ category: catKey, label: cat.label });
        continue;
      }
      for (const unit of Object.keys(cat.units)) {
        if (unit.toLowerCase().includes(q)) {
          results.push({ category: catKey, label: cat.label, unit });
        }
      }
    }
    return results;
  }

  // ── Get all categories ────────────────────────────────────
  function categories() {
    return Object.entries(DB).map(([key, cat]) => ({
      key, label: cat.label, base: cat.base,
      unitCount: Object.keys(cat.units).length,
    }));
  }

  // ── Get units for category ────────────────────────────────
  function unitsFor(category) {
    return Object.keys(DB[category]?.units ?? {});
  }

  // ── Public API ────────────────────────────────────────────
  return { DB, convert, convertAll, findCategory, search, categories, unitsFor };

})();

if (typeof module !== 'undefined') module.exports = Units;
else window.Units = Units;
