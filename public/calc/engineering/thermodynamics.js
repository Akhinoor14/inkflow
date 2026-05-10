// calc/engineering/thermodynamics.js
// ════════════════════════════════════════════════════════════
//  THERMODYNAMICS MODULE
//  Covers: ideal/real gas, heat transfer (conduction/convection/radiation),
//          thermodynamic cycles (Carnot, Rankine, Brayton, Otto, Diesel),
//          psychrometrics, steam tables approx, heat exchangers
// ════════════════════════════════════════════════════════════
'use strict';

const Thermo = (() => {

  const R_universal = 8.314462618;  // J/mol·K
  const sigma = 5.670374419e-8;     // Stefan-Boltzmann

  // ── Ideal Gas Law: PV = nRT ───────────────────────────────
  function idealGas({ P, V, n, T, m, M }) {
    const k = { P, V, n, T };
    if (m && M) k.n = m/M;
    if (k.P && k.V && k.n) k.T = k.P*k.V/(k.n*R_universal);
    else if (k.P && k.V && k.T) k.n = k.P*k.V/(R_universal*k.T);
    else if (k.P && k.n && k.T) k.V = k.n*R_universal*k.T/k.P;
    else if (k.V && k.n && k.T) k.P = k.n*R_universal*k.T/k.V;
    if (M && k.n) k.m = k.n*M;
    k.R_specific = M ? R_universal/M : null;
    return k;
  }

  // Specific gas constant
  function Rspecific(M) { return R_universal/M; }

  // Combined gas law: P1V1/T1 = P2V2/T2
  function combinedGas(P1, V1, T1, P2, V2, T2) {
    const known = { P1, V1, T1, P2, V2, T2 };
    const lhs = (P1??0)*(V1??1)/(T1??1);
    if (P2==null) known.P2 = lhs*T2/V2;
    else if (V2==null) known.V2 = lhs*T2/P2;
    else if (T2==null) known.T2 = P2*V2/lhs;
    return known;
  }

  // Van der Waals (real gas): (P + a/V²)(V - b) = RT
  function vanDerWaals(n, T, V, a, b) {
    const Vm = V/n;
    return (R_universal*T/(Vm - b)) - a/(Vm**2);
  }

  // Boyle, Charles, Gay-Lussac, Avogadro special cases
  function boyle(P1, V1, P2)   { return P1!=null&&V1!=null ? P1*V1/P2 : P1*V1/P2; }
  function charles(V1, T1, T2) { return V1*T2/T1; }
  function gayLussac(P1, T1, T2){ return P1*T2/T1; }

  // ── Heat Transfer ─────────────────────────────────────────
  // Conduction: Q = kA(T1-T2)/L (Fourier's law)
  function conduction(k, A, T1, T2, L)     { return k*A*(T1-T2)/L; }
  function conductionCyl(k, L, T1, T2, r1, r2) {
    return 2*Math.PI*k*L*(T1-T2)/Math.log(r2/r1);
  }
  function conductionSphere(k, T1, T2, r1, r2) {
    return 4*Math.PI*k*r1*r2*(T1-T2)/(r2-r1);
  }
  function thermalResistance(L, k, A) { return L/(k*A); }
  function thermalResistanceCyl(r1, r2, k, L) { return Math.log(r2/r1)/(2*Math.PI*k*L); }
  function seriesR_thermal(...R) { return R.reduce((s,r)=>s+r,0); }
  function parallelR_thermal(...R) { return 1/R.reduce((s,r)=>s+1/r,0); }

  // Convection: Q = hA(Ts - T∞)  (Newton's law)
  function convection(h, A, Ts, Tinf)    { return h*A*(Ts-Tinf); }
  function convectionR(h, A)             { return 1/(h*A); }

  // Radiation: Q = εσA(T1⁴ - T2⁴)
  function radiation(eps, A, T1, T2)    { return eps*sigma*A*(T1**4 - T2**4); }
  function radiationBlackbody(A, T)     { return sigma*A*T**4; }
  function viewFactor_parallel_coaxial(r, d) {
    // Two coaxial parallel discs
    const R = r/d, S = 1 + (1+R**2)/R**2;
    return 0.5*(S - Math.sqrt(S**2 - 4*(r/d)**2));
  }

  // Overall heat transfer coefficient (composite wall)
  function overallU(R_total, A) { return 1/(R_total*A); }
  function overallR(hi, A, walls, ho) {
    const Ri = 1/(hi*A);
    const Ro = 1/(ho*A);
    const Rw = walls.reduce((s,w)=>s+w.L/(w.k*A),0);
    return Ri + Rw + Ro;
  }

  // Lumped system (Bi < 0.1): T(t) = T∞ + (Ti-T∞)exp(-t/τ)
  function lumpedCooling(Ti, Tinf, t, h, A, rho, V, cp) {
    const tau = rho*V*cp/(h*A);
    return Tinf + (Ti-Tinf)*Math.exp(-t/tau);
  }
  function biotNumber(h, Lc, k) { return h*Lc/k; }
  function fourierNumber(alpha, t, Lc) { return alpha*t/Lc**2; }

  // Fins
  function finEfficiency_straightRect(m, L) {
    return Math.tanh(m*L)/(m*L);
  }
  function finM(h, P, k, A) { return Math.sqrt(h*P/(k*A)); }  // fin parameter

  // ── Convection Correlations ───────────────────────────────
  // Flat plate — laminar: Nu = 0.664·Re^0.5·Pr^(1/3)
  function nuFlatPlateLaminar(Re, Pr) { return 0.664*Re**0.5*Pr**(1/3); }
  // Flat plate — turbulent: Nu = 0.037·Re^0.8·Pr^(1/3)
  function nuFlatPlateTurb(Re, Pr)    { return 0.037*Re**0.8*Pr**(1/3); }
  // Cylinder cross-flow (Churchill-Bernstein)
  function nuCylinder(Re, Pr) {
    return 0.3 + 0.62*Re**0.5*Pr**(1/3)/
      (1+(0.4/Pr)**(2/3))**0.25 *
      (1+(Re/282000)**(5/8))**0.8;
  }
  // Internal pipe flow — Dittus-Boelter (turbulent)
  function nuDittusBoelter(Re, Pr, heating=true) {
    return 0.023*Re**0.8*Pr**(heating?0.4:0.3);
  }
  // Gnielinski (more accurate, 3000<Re<5e6)
  function nuGnielinski(Re, Pr, f) {
    return (f/8)*(Re-1000)*Pr/(1+12.7*Math.sqrt(f/8)*(Pr**(2/3)-1));
  }
  // Natural convection (vertical plate, Churchill-Chu)
  function nuNatConv(Ra, Pr) {
    return (0.825 + 0.387*Ra**(1/6)/(1+(0.492/Pr)**(9/16))**(8/27))**2;
  }

  // ── Heat Exchangers ───────────────────────────────────────
  function lmtd(T_hi, T_ho, T_ci, T_co) {
    const dT1 = T_hi - T_co, dT2 = T_ho - T_ci;
    if (Math.abs(dT1-dT2) < 1e-6) return dT1;
    return (dT1-dT2)/Math.log(dT1/dT2);
  }
  function lmtd_counter(T_hi, T_ho, T_ci, T_co) {
    const dT1 = T_hi - T_co, dT2 = T_ho - T_ci;
    if (Math.abs(dT1-dT2) < 1e-6) return dT1;
    return (dT1-dT2)/Math.log(dT1/dT2);
  }
  function hxEffectiveness(Q, Qmax) { return Q/Qmax; }
  function Cmin(mc_hot, mc_cold) { return Math.min(mc_hot, mc_cold); }
  function NTU(UA, Cmin_val) { return UA/Cmin_val; }
  // Counterflow effectiveness
  function effectivenessNTU_counter(NTU_val, Cr) {
    if (Cr >= 1) return NTU_val/(1+NTU_val);
    return (1-Math.exp(-NTU_val*(1-Cr)))/(1-Cr*Math.exp(-NTU_val*(1-Cr)));
  }

  // ── Thermodynamic Cycles ──────────────────────────────────
  // Carnot
  function carnotEff(TH, TC)     { return 1 - TC/TH; }
  function carnotCOP_refrig(TH,TC){ return TC/(TH-TC); }
  function carnotCOP_hp(TH, TC)  { return TH/(TH-TC); }
  function carnotWork(Q_H, eta)  { return Q_H*eta; }

  // Otto cycle (gasoline engine)
  function ottoEff(r, gamma=1.4)  { return 1 - 1/r**(gamma-1); }
  function ottoMEP(r, gamma, P1, T1, T3) {
    const T2 = T1*r**(gamma-1);
    const T4 = T3/r**(gamma-1);
    const Qin = (T3-T2);
    const Wnet = Qin - (T4-T1);
    return Wnet*P1*(r-1)/(r-1) * 1000;  // rough MEP
  }

  // Diesel cycle
  function dieselEff(r, rc, gamma=1.4) {
    return 1 - (rc**gamma-1)/(gamma*r**(gamma-1)*(rc-1));
  }

  // Brayton cycle (gas turbine)
  function braytonEff(r_p, gamma=1.4) { return 1 - 1/r_p**((gamma-1)/gamma); }
  function braytonBackWork(T1, T2, T3, T4) { return (T2-T1)/(T3-T4); }

  // Rankine cycle (steam power)
  function rankineEff(W_turb, W_pump, Q_boiler) {
    return (W_turb - W_pump)/Q_boiler;
  }
  function rankineBWR(W_pump, W_turb) { return W_pump/W_turb; }

  // Refrigeration / Heat Pump
  function COP_refrig(Q_L, W_net) { return Q_L/W_net; }
  function COP_hp(Q_H, W_net)     { return Q_H/W_net; }
  function EER(Q_L_BTUh, W_watts) { return Q_L_BTUh/W_watts; }
  function SEER_to_COP(SEER)      { return SEER/3.412; }

  // ── Psychrometrics ────────────────────────────────────────
  function saturationPressure(T_C) {
    // Antoine equation (water)
    const T = T_C + 273.15;
    return 1e5*Math.exp(16.3872 - 3885.7/(T-42.98));  // rough
  }
  function relativeHumidity(Pv, Psat)  { return Pv/Psat; }
  function humidityRatio(Pv, P_total)  { return 0.622*Pv/(P_total-Pv); }
  function dewPoint(RH, T_C)           { return T_C - (100-RH*100)/5; }  // Magnus approx
  function wetBulbApprox(T_C, RH)      { return T_C*Math.atan(0.151977*Math.sqrt(RH+8.313659))
                                               + Math.atan(T_C+RH) - Math.atan(RH-1.676331)
                                               + 0.00391838*RH**1.5*Math.atan(0.023101*RH) - 4.686035; }
  function enthalpyMoistAir(T_C, w)    { return 1.006*T_C + w*(2501+1.86*T_C); }  // kJ/kg
  function specificVolume(T_C, w, P)   { return (0.287*(T_C+273.15)/P)*(1+w/0.622); }

  // ── Entropy & Exergy ──────────────────────────────────────
  function entropy_heat(Q, T)         { return Q/T; }
  function entropy_generation(Q, TH, TC){ return -Q/TH + Q/TC; }
  function exergy_heat(Q, T, T0)      { return Q*(1 - T0/T); }
  function exergy_flow(h, h0, T0, s, s0) { return (h-h0) - T0*(s-s0); }
  function secondLawEff(W_actual, W_reversible) { return W_actual/W_reversible; }

  // ── Steam Properties (approximate Antoine-based) ──────────
  // Very rough — for actual use see IAPWS-IF97 steam tables
  function satTempFromPressure(P_kPa) {
    return (3885.7/( 16.3872 - Math.log(P_kPa/100))) - 273.15 + 42.98;
  }
  function latentHeat(T_C) {
    // Watson correlation: hfg ≈ 2501 - 2.361*T (kJ/kg)
    return 2501 - 2.361*T_C;
  }
  function clausius_clapeyron(hfg, T, vfg) { return hfg/(T*vfg); }  // dP/dT

  // ── Public API ────────────────────────────────────────────
  return {
    R_universal, sigma,
    idealGas, Rspecific, combinedGas, vanDerWaals,
    boyle, charles, gayLussac,
    conduction, conductionCyl, conductionSphere,
    thermalResistance, thermalResistanceCyl, seriesR_thermal, parallelR_thermal,
    convection, convectionR, radiation, radiationBlackbody,
    viewFactor_parallel_coaxial, overallU, overallR,
    lumpedCooling, biotNumber, fourierNumber,
    finEfficiency_straightRect, finM,
    nuFlatPlateLaminar, nuFlatPlateTurb, nuCylinder,
    nuDittusBoelter, nuGnielinski, nuNatConv,
    lmtd, lmtd_counter, hxEffectiveness, Cmin, NTU, effectivenessNTU_counter,
    carnotEff, carnotCOP_refrig, carnotCOP_hp, carnotWork,
    ottoEff, dieselEff, braytonEff, braytonBackWork,
    rankineEff, rankineBWR,
    COP_refrig, COP_hp, EER, SEER_to_COP,
    saturationPressure, relativeHumidity, humidityRatio,
    dewPoint, wetBulbApprox, enthalpyMoistAir, specificVolume,
    entropy_heat, entropy_generation, exergy_heat, exergy_flow, secondLawEff,
    satTempFromPressure, latentHeat, clausius_clapeyron,
  };

})();

if (typeof module !== 'undefined') module.exports = Thermo;
else window.Thermo = Thermo;
