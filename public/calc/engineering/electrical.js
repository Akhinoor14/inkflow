// calc/engineering/electrical.js
// ════════════════════════════════════════════════════════════
//  ELECTRICAL ENGINEERING MODULE
//  Covers: Ohm's law, power, AC circuits (impedance, phasors),
//          RC/RL/RLC transients, filters, dB conversions,
//          transformer, motors, 3-phase, PCB trace, wire gauge
// ════════════════════════════════════════════════════════════
'use strict';

const Electrical = (() => {

  // ── DC Fundamentals ───────────────────────────────────────
  // Ohm's Law — provide any 2, get the other 2
  function ohmsLaw({ V, I, R, P } = {}) {
    const known = { V, I, R, P };
    if (V != null && I != null) { known.R = V/I; known.P = V*I; }
    else if (V != null && R != null) { known.I = V/R; known.P = V*V/R; }
    else if (V != null && P != null) { known.I = P/V; known.R = V*V/P; }
    else if (I != null && R != null) { known.V = I*R; known.P = I*I*R; }
    else if (I != null && P != null) { known.V = P/I; known.R = P/(I*I); }
    else if (R != null && P != null) { known.V = Math.sqrt(P*R); known.I = Math.sqrt(P/R); }
    return known;
  }

  // Series / Parallel resistors
  function seriesR(...R)   { return R.reduce((s, r) => s + r, 0); }
  function parallelR(...R) {
    const inv = R.reduce((s, r) => s + 1/r, 0);
    return inv === 0 ? Infinity : 1/inv;
  }
  function parallelR2(R1, R2) { return (R1*R2)/(R1+R2); }

  // Series / Parallel capacitors
  function seriesC(...C)   { const inv = C.reduce((s,c)=>s+1/c,0); return inv===0?Infinity:1/inv; }
  function parallelC(...C) { return C.reduce((s,c)=>s+c,0); }

  // Series / Parallel inductors (no coupling)
  function seriesL(...L)   { return L.reduce((s,l)=>s+l,0); }
  function parallelL(...L) { const inv=L.reduce((s,l)=>s+1/l,0); return inv===0?Infinity:1/inv; }

  // Voltage divider
  function voltageDivider(Vin, R1, R2) { return Vin * R2 / (R1 + R2); }

  // Current divider
  function currentDivider(Iin, R1, R2) { return Iin * R1 / (R1 + R2); }

  // Wheatstone bridge (find unknown R4)
  function wheatstone(R1, R2, R3) { return R2 * R3 / R1; }

  // ── AC Circuits ───────────────────────────────────────────
  // Reactances
  function Xc(f, C) { return 1 / (2*Math.PI*f*C); }   // Capacitive reactance
  function Xl(f, L) { return 2*Math.PI*f*L; }           // Inductive reactance

  // Resonant frequency
  function resonantFreq(L, C) { return 1 / (2*Math.PI*Math.sqrt(L*C)); }
  function resonantOmega(L, C) { return 1 / Math.sqrt(L*C); }

  // Q factor
  function Qfactor(f0, BW)      { return f0 / BW; }
  function QfactorRLC(R, L, C)  { return (1/R) * Math.sqrt(L/C); }
  function QfactorSeries(R,L,C) { return Math.sqrt(L/C)/R; }

  // Impedance
  function impedanceRC(R, Xc)  { const Z = Math.sqrt(R*R + Xc*Xc); return { Z, phase: -Math.atan(Xc/R)*180/Math.PI }; }
  function impedanceRL(R, Xl)  { const Z = Math.sqrt(R*R + Xl*Xl); return { Z, phase:  Math.atan(Xl/R)*180/Math.PI }; }
  function impedanceRLC(R, Xl, Xc) {
    const X = Xl - Xc;
    const Z = Math.sqrt(R*R + X*X);
    return { Z, X, phase: Math.atan(X/R)*180/Math.PI, powerFactor: Math.cos(Math.atan(X/R)) };
  }

  // Power
  function acPower(V, I, pf)      { return { P: V*I*pf, Q: V*I*Math.sin(Math.acos(pf)), S: V*I }; }
  function powerFactor(P, S)      { return P/S; }
  function apparentPower(P, Q)    { return Math.sqrt(P*P + Q*Q); }
  function reactivePower(S, P)    { return Math.sqrt(S*S - P*P); }

  // RMS
  function rmsFromPeak(Vpeak)     { return Vpeak / Math.SQRT2; }
  function peakFromRMS(Vrms)      { return Vrms * Math.SQRT2; }
  function rmsFromPP(Vpp)         { return Vpp / (2*Math.SQRT2); }
  function averageFromPeak(Vpeak) { return 2*Vpeak/Math.PI; }   // full-wave rectified

  // ── RC Transients ─────────────────────────────────────────
  function rcTimeConstant(R, C) { return R*C; }
  // Charging: V(t) = Vf*(1 - e^(-t/τ))
  function rcCharge(Vf, R, C, t) { const tau=R*C; return Vf*(1 - Math.exp(-t/tau)); }
  // Discharging: V(t) = V0*e^(-t/τ)
  function rcDischarge(V0, R, C, t) { return V0*Math.exp(-t/(R*C)); }
  // Time to reach voltage
  function rcTimeToV(V0, Vf, Vtarget, R, C) {
    return -R*C*Math.log((Vf-Vtarget)/(Vf-V0));
  }

  // ── RL Transients ─────────────────────────────────────────
  function rlTimeConstant(R, L) { return L/R; }
  function rlCurrentRise(Ifinal, R, L, t) { return Ifinal*(1 - Math.exp(-t*R/L)); }
  function rlCurrentFall(I0, R, L, t)     { return I0*Math.exp(-t*R/L); }

  // ── RLC Transients ────────────────────────────────────────
  function rlcDamping(R, L, C) {
    const alpha = R/(2*L);
    const omega0 = 1/Math.sqrt(L*C);
    const omegad = Math.sqrt(Math.max(0, omega0*omega0 - alpha*alpha));
    const type = alpha < omega0 ? 'underdamped'
               : alpha === omega0 ? 'critically_damped'
               : 'overdamped';
    return { alpha, omega0, omegad, dampingRatio: alpha/omega0, type };
  }

  // ── Filters ───────────────────────────────────────────────
  // Cutoff frequency
  function fcRC(R, C) { return 1/(2*Math.PI*R*C); }
  function fcRL(R, L) { return R/(2*Math.PI*L); }

  // Low-pass RC gain at frequency f
  function lprcGain(R, C, f) {
    const fc = fcRC(R, C);
    return 1 / Math.sqrt(1 + (f/fc)**2);
  }
  // High-pass RC gain
  function hprcGain(R, C, f) {
    const fc = fcRC(R, C);
    return (f/fc) / Math.sqrt(1 + (f/fc)**2);
  }
  // Band-pass bandwidth
  function bpBandwidth(f0, Q) { return f0/Q; }

  // ── dB Conversions ────────────────────────────────────────
  function voltageTodB(V, Vref = 1)  { return 20*Math.log10(V/Vref); }
  function currentTodB(I, Iref = 1)  { return 20*Math.log10(I/Iref); }
  function powerTodB(P, Pref = 1)    { return 10*Math.log10(P/Pref); }
  function dBtoVoltage(dB, Vref = 1) { return Vref*Math.pow(10, dB/20); }
  function dBtoPower(dB, Pref = 1)   { return Pref*Math.pow(10, dB/10); }
  function dBm(P_mW)                 { return 10*Math.log10(P_mW); }    // dBm from mW
  function dBmToMW(dBm_val)          { return Math.pow(10, dBm_val/10); }
  function dBuV(V)                   { return 20*Math.log10(V/1e-6); }   // dBμV
  function dBToNepers(dB)            { return dB * Math.log(10)/20; }
  function nepers_To_dB(np)          { return np * 20/Math.log(10); }

  // ── Signal / Wave ─────────────────────────────────────────
  function wavelength(f, v = 3e8)    { return v/f; }       // λ = v/f
  function frequency(lambda, v = 3e8){ return v/lambda; }
  function propagationDelay(length, v){ return length/v; }
  function skinDepth(f, rho, mu_r = 1) {
    return Math.sqrt(rho/(Math.PI*f*4e-7*Math.PI*mu_r));
  }

  // Noise / SNR
  function snrDB(signal, noise)         { return 10*Math.log10(signal/noise); }
  function thermalNoise(R, T, BW)        { return 4*1.380649e-23*T*R*BW; }  // V²
  function thermalNoiseV(R, T, BW)       { return Math.sqrt(4*1.380649e-23*T*R*BW); }

  // ── Transformers ─────────────────────────────────────────
  function transformerTurns(V1, V2)     { return V1/V2; }
  function transformerCurrent(I1, n)    { return I1/n; }        // I2 = I1/n if n = N1/N2
  function transformerImpedance(Z2, n)  { return Z2*(n*n); }    // Reflected impedance

  // ── 3-Phase Power ─────────────────────────────────────────
  function threePhaseP(VL, IL, pf)      { return Math.sqrt(3)*VL*IL*pf; }
  function threePhaseS(VL, IL)          { return Math.sqrt(3)*VL*IL; }
  function lineToPhaseV(Vline)          { return Vline/Math.sqrt(3); }
  function phaseToLineV(Vphase)         { return Vphase*Math.sqrt(3); }
  function threePhasePF(P, S)           { return P/S; }

  // ── Motor ─────────────────────────────────────────────────
  function motorTorque(P, rpm)          { return P/(2*Math.PI*rpm/60); }   // N·m
  function motorRPM(P, T)              { return 60*P/(2*Math.PI*T); }
  function motorEfficiency(Pout, Pin)  { return Pout/Pin; }
  function motorSlip(Ns, N)            { return (Ns-N)/Ns; }  // Ns=sync speed, N=actual
  function synchronousSpeed(f, poles)  { return 120*f/poles; }  // RPM

  // ── Wire / Trace ──────────────────────────────────────────
  // AWG to diameter (mm)
  function awgToDiameter(awg) {
    return 0.127 * Math.pow(92, (36-awg)/39);
  }
  function awgToArea(awg) {
    const d = awgToDiameter(awg)/1000;
    return Math.PI*(d/2)**2;
  }
  function awgResistance(awg, length, T=20) {
    const A = awgToArea(awg);
    const rho = 1.72e-8 * (1 + 0.00393*(T-20));
    return rho*length/A;
  }
  function awgCurrentCapacity(awg) {
    // Approximate (NEC table 310)
    const table = {0:195,1:165,2:130,4:95,6:75,8:55,10:35,12:25,14:20,16:13,18:10};
    const v = table[awg];
    if (v) return v;
    return Math.round(14.4/Math.pow(awg,0.5)); // rough estimate
  }

  // PCB trace resistance
  function pcbTraceR(length_mm, width_mm, thickness_oz, T=25) {
    const thickness_m = thickness_oz * 35e-6;
    const width_m = width_mm/1000, length_m = length_mm/1000;
    const rho = 1.72e-8*(1+0.00393*(T-20));
    return rho*length_m/(width_m*thickness_m);
  }
  function pcbTraceCurrentCapacity(width_mm, thickness_oz, dT=10) {
    // IPC-2221 formula (external trace)
    const A_mil2 = (width_mm/0.0254)*(thickness_oz*1.378);
    return 0.048 * Math.pow(dT, 0.44) * Math.pow(A_mil2, 0.725);
  }

  // ── Battery / Energy Storage ──────────────────────────────
  function batteryEnergy(V, Ah)         { return V*Ah*3600; }  // Joules
  function batteryRuntime(Ah, I)        { return Ah/I; }        // hours
  function chargingTime(Ah, I, eff=0.9) { return Ah/(I*eff); }

  // ── Public API ────────────────────────────────────────────
  return {
    ohmsLaw, seriesR, parallelR, parallelR2,
    seriesC, parallelC, seriesL, parallelL,
    voltageDivider, currentDivider, wheatstone,
    Xc, Xl, resonantFreq, resonantOmega,
    Qfactor, QfactorRLC, QfactorSeries,
    impedanceRC, impedanceRL, impedanceRLC,
    acPower, powerFactor, apparentPower, reactivePower,
    rmsFromPeak, peakFromRMS, rmsFromPP, averageFromPeak,
    rcTimeConstant, rcCharge, rcDischarge, rcTimeToV,
    rlTimeConstant, rlCurrentRise, rlCurrentFall,
    rlcDamping,
    fcRC, fcRL, lprcGain, hprcGain, bpBandwidth,
    voltageTodB, currentTodB, powerTodB,
    dBtoVoltage, dBtoPower, dBm, dBmToMW, dBuV,
    dBToNepers, nepers_To_dB,
    wavelength, frequency, propagationDelay, skinDepth,
    snrDB, thermalNoise, thermalNoiseV,
    transformerTurns, transformerCurrent, transformerImpedance,
    threePhaseP, threePhaseS, lineToPhaseV, phaseToLineV, threePhasePF,
    motorTorque, motorRPM, motorEfficiency, motorSlip, synchronousSpeed,
    awgToDiameter, awgToArea, awgResistance, awgCurrentCapacity,
    pcbTraceR, pcbTraceCurrentCapacity,
    batteryEnergy, batteryRuntime, chargingTime,
  };

})();

if (typeof module !== 'undefined') module.exports = Electrical;
else window.Electrical = Electrical;
