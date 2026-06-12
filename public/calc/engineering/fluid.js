// calc/engineering/fluid.js
// ════════════════════════════════════════════════════════════
//  FLUID MECHANICS MODULE
//  Covers: Reynolds number, Bernoulli, pipe/duct flow,
//          Darcy-Weisbach, pump/fan, open channel,
//          compressible flow, drag, buoyancy, hydraulics
// ════════════════════════════════════════════════════════════
'use strict';

const Fluid = (() => {

  // ── Fluid Properties (water at 20°C, air at STP) ─────────
  const FLUIDS = {
    water:   { rho: 998.2, mu: 1.002e-3, nu: 1.004e-6, k: 0.598,  Pr: 7.01, beta: 2.1e-4 },
    air:     { rho: 1.204, mu: 1.81e-5,  nu: 1.51e-5,  k: 0.0257, Pr: 0.707,beta: 3.41e-3 },
    oil_hyd: { rho: 870,   mu: 0.046,    nu: 5.3e-5,   k: 0.14,   Pr: 600  },
    seawater:{ rho: 1025,  mu: 1.08e-3,  nu: 1.05e-6,  k: 0.596,  Pr: 7.2  },
    mercury: { rho: 13546, mu: 1.526e-3, nu: 1.13e-7,  k: 8.5,    Pr: 0.025},
    glycerol:{ rho: 1261,  mu: 1.49,     nu: 1.18e-3,  k: 0.285,  Pr: 15500},
  };

  // ── Dimensionless Numbers ─────────────────────────────────
  function reynolds(rho, v, L, mu)    { return rho*v*L/mu; }
  function reynoldsKinematic(v, L, nu){ return v*L/nu; }
  function froude(v, L, g=9.80665)   { return v/Math.sqrt(g*L); }
  function mach(v, a=343)             { return v/a; }
  function weber(rho, v, L, sigma)    { return rho*v**2*L/sigma; }
  function prandtl(mu, cp, k)         { return mu*cp/k; }
  function nusselt(h, L, k)           { return h*L/k; }
  function stanton(h, rho, v, cp)     { return h/(rho*v*cp); }
  function grashof(g, beta, dT, L, nu){ return g*beta*dT*L**3/nu**2; }
  function rayleigh(Gr, Pr)           { return Gr*Pr; }
  function eckert(v, cp, dT)          { return v**2/(cp*dT); }
  function strouhal(f, L, v)          { return f*L/v; }
  function cauchy(rho, v, E)          { return rho*v**2/E; }
  function euler_num(dP, rho, v)      { return dP/(0.5*rho*v**2); }  // pressure coeff

  // Flow regime
  function flowRegime(Re) {
    if (Re < 2300) return 'laminar';
    if (Re < 4000) return 'transitional';
    return 'turbulent';
  }

  // ── Continuity Equation ───────────────────────────────────
  function continuity(A1, v1, A2) { return A1*v1/A2; }  // v2
  function continuityRho(rho1, A1, v1, rho2, A2) { return rho1*A1*v1/(rho2*A2); }
  function volumeFlowRate(A, v) { return A*v; }
  function massFlowRate(rho, A, v) { return rho*A*v; }

  // ── Bernoulli ─────────────────────────────────────────────
  // P1 + ½ρv1² + ρgz1 = P2 + ½ρv2² + ρgz2
  function bernoulli({ P1, v1, z1=0, P2, v2, z2=0, rho, g=9.80665 }) {
    const known = { P1, v1, z1, P2, v2, z2, rho };
    if (P1!=null && v1!=null && z1!=null && v2!=null && z2!=null)
      known.P2 = P1 + 0.5*rho*(v1**2-v2**2) + rho*g*(z1-z2);
    else if (P1!=null && v1!=null && P2!=null && z1!=null && z2!=null)
      known.v2 = Math.sqrt(v1**2 + 2*(P1-P2)/rho + 2*g*(z1-z2));
    return known;
  }
  function torricelli(H, g=9.80665)  { return Math.sqrt(2*g*H); }        // discharge velocity
  function pitotVelocity(dP, rho)    { return Math.sqrt(2*dP/rho); }
  function dynamicPressure(rho, v)   { return 0.5*rho*v**2; }
  function totalPressure(P, rho, v)  { return P + 0.5*rho*v**2; }

  // ── Pipe Flow (Darcy-Weisbach) ────────────────────────────
  // Friction factor — Moody diagram correlations
  function frictionLaminar(Re)       { return 64/Re; }
  function frictionChurchillColebrook(Re, eps_D) {
    // Churchill (1977) — works for all regimes
    const A = (-2.457*Math.log((7/Re)**0.9 + 0.27*eps_D))**16;
    const B = (37530/Re)**16;
    return 8*((8/Re)**12 + (A+B)**(-1.5))**(1/12);
  }
  function frictionSwamee(Re, eps_D) {
    // Swamee-Jain explicit approximation
    if (Re < 2000) return 64/Re;
    return 0.25/(Math.log10(eps_D/3.7 + 5.74/Re**0.9))**2;
  }
  function frictionColebrook(Re, eps_D) {
    // Colebrook-White (iterative)
    let f = frictionSwamee(Re, eps_D);
    for (let i=0;i<20;i++) {
      const fn = -2*Math.log10(eps_D/3.7 + 2.51/(Re*Math.sqrt(f)));
      f = 1/(fn**2);
    }
    return f;
  }

  function headLossDarcy(f, L, D, v, g=9.80665) { return f*(L/D)*v**2/(2*g); }
  function pressureLossDarcy(f, L, D, rho, v)   { return f*(L/D)*0.5*rho*v**2; }

  // Minor losses (fittings)
  function headLossMinor(K, v, g=9.80665)        { return K*v**2/(2*g); }
  const LOSS_K = {
    'gate valve (open)': 0.1, 'gate valve (half)': 5.6,
    'globe valve': 10, 'ball valve (open)': 0.05,
    'check valve': 2.5, 'elbow 90°': 0.9, 'elbow 45°': 0.4,
    'tee (flow through)': 0.6, 'tee (branch)': 1.8,
    'entry sharp': 0.5, 'entry rounded': 0.1,
    'exit': 1.0, 'sudden expansion': null,  // use Borda-Carnot
  };
  function suddenExpansionLoss(v1, v2, g=9.80665) { return (v1-v2)**2/(2*g); }

  // Pipe velocity from flow rate
  function pipeVelocity(Q, D) { return Q/(Math.PI*(D/2)**2); }
  function pipeFlow(v, D)     { return v*Math.PI*(D/2)**2; }

  // ── Pumps / Fans ──────────────────────────────────────────
  function pumpHead(P, rho, g=9.80665)     { return P/(rho*g); }
  function pumpPower(rho, g, Q, H, eta=1)  { return rho*g*Q*H/eta; }
  function pumpSpecificSpeed(N, Q, H) {
    return N*Math.sqrt(Q)/H**(3/4);  // Ns (rpm, m³/s, m)
  }
  function fanLaw_Q(Q1, N1, N2)   { return Q1*(N2/N1); }
  function fanLaw_P(P1, N1, N2)   { return P1*(N2/N1)**2; }
  function fanLaw_W(W1, N1, N2)   { return W1*(N2/N1)**3; }
  function systemCurve(K, Q)      { return K*Q**2; }   // H = KQ²

  // ── Open Channel Flow ────────────────────────────────────
  function hydraulicRadius(A, P) { return A/P; }
  function manningVelocity(n, Rh, S) { return (1/n)*Rh**(2/3)*Math.sqrt(S); }
  function manningFlow(n, A, Rh, S)  { return A*manningVelocity(n, Rh, S); }
  // Manning's n for common surfaces
  const MANNING_N = {
    'concrete (finished)': 0.012, 'concrete (rough)': 0.016,
    'cast iron': 0.013, 'steel (riveted)': 0.017,
    'natural channel (clean)': 0.025, 'gravel': 0.030,
    'earth (clean)': 0.022, 'weedy channel': 0.050,
  };
  // Critical depth (rectangular channel)
  function criticalDepth(Q, b, g=9.80665) { return Math.cbrt(Q**2/(g*b**2)); }
  function criticalVelocity(yc, g=9.80665){ return Math.sqrt(g*yc); }
  // Weir flow (sharp-crested rectangular)
  function weirFlow(Cd, L, H, g=9.80665) { return (2/3)*Cd*L*Math.sqrt(2*g)*H**(3/2); }

  // ── Compressible Flow ─────────────────────────────────────
  // Isentropic relations (ideal gas, ratio P/P0, T/T0, rho/rho0)
  function isentropicP(M, gamma=1.4) { return Math.pow(1 + (gamma-1)/2*M**2, -gamma/(gamma-1)); }
  function isentropicT(M, gamma=1.4) { return 1/(1 + (gamma-1)/2*M**2); }
  function isentropicRho(M,gamma=1.4){ return Math.pow(1 + (gamma-1)/2*M**2, -1/(gamma-1)); }
  // Speed of sound
  function speedOfSound(gamma, R, T) { return Math.sqrt(gamma*R*T); }
  function speedOfSoundAir(T_K)      { return 331.3*Math.sqrt(T_K/273.15); }
  // Normal shock
  function normalShock(M1, gamma=1.4) {
    const M2 = Math.sqrt((M1**2*(gamma-1)+2)/(2*gamma*M1**2-(gamma-1)));
    const P2_P1 = (2*gamma*M1**2-(gamma-1))/(gamma+1);
    const T2_T1 = P2_P1*(2+(gamma-1)*M1**2)/((gamma+1)*M1**2);
    const rho2_rho1 = (gamma+1)*M1**2/(2+(gamma-1)*M1**2);
    return { M2, P2_P1, T2_T1, rho2_rho1 };
  }
  // Choked flow
  function chokedFlowRate(A, P0, T0, gamma=1.4, R=287) {
    return A*P0*Math.sqrt(gamma/R/T0)*Math.pow(2/(gamma+1),(gamma+1)/(2*(gamma-1)));
  }

  // ── Drag & Lift ───────────────────────────────────────────
  function dragForce(Cd, rho, v, A)  { return Cd*0.5*rho*v**2*A; }
  function liftForce(Cl, rho, v, A)  { return Cl*0.5*rho*v**2*A; }
  function terminalVelocity(m, Cd, rho, A, g=9.80665) {
    return Math.sqrt(2*m*g/(rho*Cd*A));
  }
  // Stokes drag (creeping flow, Re<<1)
  function stokesDrag(mu, r, v)      { return 6*Math.PI*mu*r*v; }
  function stokesSediment(rho_p, rho_f, r, mu, g=9.80665) {
    return 2*(rho_p-rho_f)*g*r**2/(9*mu);
  }

  // CD for common shapes
  const CD_SHAPES = {
    'sphere (Re≈1e5)': 0.47, 'cylinder (long)': 1.0,
    'flat plate (normal)': 1.28, 'streamlined body': 0.04,
    'cube': 1.05, 'person (standing)': 1.0,
    'car (typical)': 0.3, 'bicycle+rider': 0.9,
  };

  // ── Buoyancy ──────────────────────────────────────────────
  function buoyancyForce(rho_fluid, V, g=9.80665) { return rho_fluid*V*g; }
  function netBuoyancy(rho_fluid, rho_obj, V, g=9.80665) {
    return (rho_fluid - rho_obj)*V*g;
  }
  function metacentricHeight(I_waterplane, V, BG) { return I_waterplane/V - BG; }

  // ── Hydraulic Jump ────────────────────────────────────────
  function hydraulicJump(y1, Fr1, g=9.80665) {
    const y2 = y1/2*(Math.sqrt(1+8*Fr1**2)-1);
    const Fr2 = Fr1*y1**2/(y2**2*Math.sqrt(y1/y2));
    const headLoss = (y2-y1)**3/(4*y1*y2);
    return { y2, Fr2, headLoss, ratio: y2/y1 };
  }

  // ── Public API ────────────────────────────────────────────
  return {
    FLUIDS, LOSS_K, MANNING_N, CD_SHAPES,
    reynolds, reynoldsKinematic, froude, mach, weber, prandtl,
    nusselt, stanton, grashof, rayleigh, eckert, strouhal, cauchy, euler_num,
    flowRegime,
    continuity, continuityRho, volumeFlowRate, massFlowRate,
    bernoulli, torricelli, pitotVelocity, dynamicPressure, totalPressure,
    frictionLaminar, frictionColebrook, frictionSwamee, frictionChurchillColebrook,
    headLossDarcy, pressureLossDarcy, headLossMinor, suddenExpansionLoss,
    pipeVelocity, pipeFlow,
    pumpHead, pumpPower, pumpSpecificSpeed,
    fanLaw_Q, fanLaw_P, fanLaw_W, systemCurve,
    hydraulicRadius, manningVelocity, manningFlow,
    criticalDepth, criticalVelocity, weirFlow,
    isentropicP, isentropicT, isentropicRho,
    speedOfSound, speedOfSoundAir, normalShock, chokedFlowRate,
    dragForce, liftForce, terminalVelocity, stokesDrag, stokesSediment,
    buoyancyForce, netBuoyancy, metacentricHeight,
    hydraulicJump,
  };

})();

if (typeof module !== 'undefined') module.exports = Fluid;
else window.Fluid = Fluid;
