// Full Engineering Unit Conversions
// All values are conversion factors TO the base SI unit

export const CONV_CATEGORIES = [
  {
    name: "Length",
    base: "m",
    units: [
      { label: "m",      factor: 1 },
      { label: "km",     factor: 1e3 },
      { label: "cm",     factor: 1e-2 },
      { label: "mm",     factor: 1e-3 },
      { label: "μm",     factor: 1e-6 },
      { label: "nm",     factor: 1e-9 },
      { label: "inch",   factor: 0.0254 },
      { label: "ft",     factor: 0.3048 },
      { label: "yard",   factor: 0.9144 },
      { label: "mile",   factor: 1609.344 },
      { label: "nmi",    factor: 1852 },
      { label: "AU",     factor: 1.495978707e11 },
      { label: "ly",     factor: 9.4607304725808e15 },
      { label: "pc",     factor: 3.085677581e16 },
    ]
  },
  {
    name: "Area",
    base: "m²",
    units: [
      { label: "m²",     factor: 1 },
      { label: "km²",    factor: 1e6 },
      { label: "cm²",    factor: 1e-4 },
      { label: "mm²",    factor: 1e-6 },
      { label: "in²",    factor: 6.4516e-4 },
      { label: "ft²",    factor: 0.09290304 },
      { label: "yd²",    factor: 0.83612736 },
      { label: "acre",   factor: 4046.8564224 },
      { label: "ha",     factor: 1e4 },
      { label: "mi²",    factor: 2.589988110336e6 },
    ]
  },
  {
    name: "Volume",
    base: "m³",
    units: [
      { label: "m³",     factor: 1 },
      { label: "L",      factor: 1e-3 },
      { label: "mL",     factor: 1e-6 },
      { label: "cm³",    factor: 1e-6 },
      { label: "ft³",    factor: 0.028316846592 },
      { label: "in³",    factor: 1.6387064e-5 },
      { label: "gal(US)",factor: 3.785411784e-3 },
      { label: "gal(UK)",factor: 4.54609e-3 },
      { label: "qt(US)", factor: 9.46352946e-4 },
      { label: "pt(US)", factor: 4.73176473e-4 },
      { label: "fl oz",  factor: 2.95735296e-5 },
      { label: "bbl",    factor: 0.158987294928 },
    ]
  },
  {
    name: "Mass",
    base: "kg",
    units: [
      { label: "kg",     factor: 1 },
      { label: "g",      factor: 1e-3 },
      { label: "mg",     factor: 1e-6 },
      { label: "μg",     factor: 1e-9 },
      { label: "tonne",  factor: 1e3 },
      { label: "lb",     factor: 0.45359237 },
      { label: "oz",     factor: 0.028349523125 },
      { label: "slug",   factor: 14.593903 },
      { label: "troy oz",factor: 0.0311034768 },
      { label: "ton(US)",factor: 907.18474 },
      { label: "ton(UK)",factor: 1016.0469088 },
    ]
  },
  {
    name: "Force",
    base: "N",
    units: [
      { label: "N",      factor: 1 },
      { label: "kN",     factor: 1e3 },
      { label: "MN",     factor: 1e6 },
      { label: "lbf",    factor: 4.4482216152605 },
      { label: "kgf",    factor: 9.80665 },
      { label: "dyne",   factor: 1e-5 },
      { label: "pdl",    factor: 0.138254954376 },
      { label: "kip",    factor: 4448.2216152605 },
      { label: "tf(m)",  factor: 9806.65 },
    ]
  },
  {
    name: "Pressure",
    base: "Pa",
    units: [
      { label: "Pa",     factor: 1 },
      { label: "kPa",    factor: 1e3 },
      { label: "MPa",    factor: 1e6 },
      { label: "GPa",    factor: 1e9 },
      { label: "bar",    factor: 1e5 },
      { label: "mbar",   factor: 100 },
      { label: "atm",    factor: 101325 },
      { label: "psi",    factor: 6894.757293168 },
      { label: "ksi",    factor: 6894757.293168 },
      { label: "mmHg",   factor: 133.322387415 },
      { label: "inHg",   factor: 3386.388640341 },
      { label: "torr",   factor: 133.3223684211 },
    ]
  },
  {
    name: "Energy",
    base: "J",
    units: [
      { label: "J",      factor: 1 },
      { label: "kJ",     factor: 1e3 },
      { label: "MJ",     factor: 1e6 },
      { label: "GJ",     factor: 1e9 },
      { label: "cal",    factor: 4.184 },
      { label: "kcal",   factor: 4184 },
      { label: "Wh",     factor: 3600 },
      { label: "kWh",    factor: 3.6e6 },
      { label: "MWh",    factor: 3.6e9 },
      { label: "BTU",    factor: 1055.05585262 },
      { label: "eV",     factor: 1.602176634e-19 },
      { label: "ft·lbf", factor: 1.3558179483314 },
      { label: "erg",    factor: 1e-7 },
      { label: "therm",  factor: 1.05480400e8 },
    ]
  },
  {
    name: "Power",
    base: "W",
    units: [
      { label: "W",       factor: 1 },
      { label: "kW",      factor: 1e3 },
      { label: "MW",      factor: 1e6 },
      { label: "GW",      factor: 1e9 },
      { label: "hp(met)", factor: 735.49875 },
      { label: "hp(imp)", factor: 745.69987158227 },
      { label: "BTU/hr",  factor: 0.29307107017 },
      { label: "cal/s",   factor: 4.184 },
      { label: "kcal/hr", factor: 1.163 },
      { label: "ft·lbf/s",factor: 1.3558179483314 },
    ]
  },
  {
    name: "Temperature",
    base: "K",
    units: [
      { label: "K",  toBase: v => v,           fromBase: v => v },
      { label: "°C", toBase: v => v + 273.15,  fromBase: v => v - 273.15 },
      { label: "°F", toBase: v => (v - 32) * 5/9 + 273.15, fromBase: v => (v - 273.15) * 9/5 + 32 },
      { label: "°R", toBase: v => v * 5/9,     fromBase: v => v * 9/5 },
    ],
    isSpecial: true
  },
  {
    name: "Speed",
    base: "m/s",
    units: [
      { label: "m/s",   factor: 1 },
      { label: "km/h",  factor: 1/3.6 },
      { label: "mph",   factor: 0.44704 },
      { label: "ft/s",  factor: 0.3048 },
      { label: "knot",  factor: 0.514444444 },
      { label: "Mach",  factor: 340.29 },
      { label: "km/s",  factor: 1e3 },
    ]
  },
  {
    name: "Frequency",
    base: "Hz",
    units: [
      { label: "Hz",    factor: 1 },
      { label: "kHz",   factor: 1e3 },
      { label: "MHz",   factor: 1e6 },
      { label: "GHz",   factor: 1e9 },
      { label: "rad/s", factor: 1 / (2 * Math.PI) },
      { label: "rpm",   factor: 1/60 },
      { label: "rps",   factor: 1 },
    ]
  },
  {
    name: "Torque",
    base: "N·m",
    units: [
      { label: "N·m",    factor: 1 },
      { label: "kN·m",   factor: 1e3 },
      { label: "N·cm",   factor: 0.01 },
      { label: "lbf·ft", factor: 1.3558179483314 },
      { label: "lbf·in", factor: 0.1129848290276 },
      { label: "kgf·m",  factor: 9.80665 },
      { label: "ozf·in", factor: 0.0070615518333 },
    ]
  },
  {
    name: "Stress/Modulus",
    base: "Pa",
    units: [
      { label: "Pa",    factor: 1 },
      { label: "kPa",   factor: 1e3 },
      { label: "MPa",   factor: 1e6 },
      { label: "GPa",   factor: 1e9 },
      { label: "psi",   factor: 6894.757293168 },
      { label: "ksi",   factor: 6894757.293168 },
      { label: "kgf/m²",factor: 9.80665 },
      { label: "bar",   factor: 1e5 },
    ]
  },
  {
    name: "Dynamic Viscosity",
    base: "Pa·s",
    units: [
      { label: "Pa·s",  factor: 1 },
      { label: "mPa·s", factor: 1e-3 },
      { label: "cP",    factor: 1e-3 },
      { label: "P",     factor: 0.1 },
      { label: "kg/(m·s)",factor: 1 },
      { label: "lbf·s/ft²",factor: 47.880259 },
    ]
  },
  {
    name: "Kinematic Viscosity",
    base: "m²/s",
    units: [
      { label: "m²/s",  factor: 1 },
      { label: "cm²/s", factor: 1e-4 },
      { label: "cSt",   factor: 1e-6 },
      { label: "St",    factor: 1e-4 },
      { label: "ft²/s", factor: 0.09290304 },
    ]
  },
  {
    name: "Angle",
    base: "rad",
    units: [
      { label: "rad",    factor: 1 },
      { label: "deg",    factor: Math.PI / 180 },
      { label: "grad",   factor: Math.PI / 200 },
      { label: "arcmin", factor: Math.PI / 10800 },
      { label: "arcsec", factor: Math.PI / 648000 },
      { label: "turn",   factor: 2 * Math.PI },
    ]
  },
  {
    name: "Data Size",
    base: "bit",
    units: [
      { label: "bit",   factor: 1 },
      { label: "byte",  factor: 8 },
      { label: "KB",    factor: 8192 },
      { label: "MB",    factor: 8388608 },
      { label: "GB",    factor: 8589934592 },
      { label: "TB",    factor: 8796093022208 },
      { label: "PB",    factor: 9007199254740992 },
      { label: "KiB",   factor: 8192 },
      { label: "MiB",   factor: 8388608 },
      { label: "GiB",   factor: 8589934592 },
    ]
  },
  {
    name: "Electrical: Voltage",
    base: "V",
    units: [
      { label: "V",   factor: 1 },
      { label: "mV",  factor: 1e-3 },
      { label: "μV",  factor: 1e-6 },
      { label: "kV",  factor: 1e3 },
      { label: "MV",  factor: 1e6 },
    ]
  },
  {
    name: "Electrical: Current",
    base: "A",
    units: [
      { label: "A",   factor: 1 },
      { label: "mA",  factor: 1e-3 },
      { label: "μA",  factor: 1e-6 },
      { label: "kA",  factor: 1e3 },
    ]
  },
  {
    name: "Electrical: Resistance",
    base: "Ω",
    units: [
      { label: "Ω",   factor: 1 },
      { label: "mΩ",  factor: 1e-3 },
      { label: "kΩ",  factor: 1e3 },
      { label: "MΩ",  factor: 1e6 },
      { label: "GΩ",  factor: 1e9 },
    ]
  },
  {
    name: "Electrical: Capacitance",
    base: "F",
    units: [
      { label: "F",   factor: 1 },
      { label: "mF",  factor: 1e-3 },
      { label: "μF",  factor: 1e-6 },
      { label: "nF",  factor: 1e-9 },
      { label: "pF",  factor: 1e-12 },
    ]
  },
  {
    name: "Electrical: Inductance",
    base: "H",
    units: [
      { label: "H",   factor: 1 },
      { label: "mH",  factor: 1e-3 },
      { label: "μH",  factor: 1e-6 },
      { label: "nH",  factor: 1e-9 },
    ]
  },
  {
    name: "Magnetic Flux Density",
    base: "T",
    units: [
      { label: "T",   factor: 1 },
      { label: "mT",  factor: 1e-3 },
      { label: "μT",  factor: 1e-6 },
      { label: "nT",  factor: 1e-9 },
      { label: "G",   factor: 1e-4 },
      { label: "Oe",  factor: 79.5774715 },
    ]
  },
]

export function convert(value, fromUnit, toUnit, category) {
  if (category.isSpecial) {
    const from = category.units.find(u => u.label === fromUnit)
    const to   = category.units.find(u => u.label === toUnit)
    if (!from || !to) return NaN
    const baseVal = from.toBase(value)
    return to.fromBase(baseVal)
  }
  const from = category.units.find(u => u.label === fromUnit)
  const to   = category.units.find(u => u.label === toUnit)
  if (!from || !to) return NaN
  const baseVal = value * from.factor
  return baseVal / to.factor
}
