// calc/engineering/structural.js
// ════════════════════════════════════════════════════════════
//  STRUCTURAL ENGINEERING MODULE
//  Covers: beam reactions/moments/deflections (all load types),
//          stress/strain/elasticity, section properties,
//          column buckling, Mohr's circle, fatigue, welds
// ════════════════════════════════════════════════════════════
'use strict';

const Structural = (() => {

  // ── Material Properties helper ────────────────────────────
  const MATERIALS = {
    steel:    { E: 200e9, G: 77e9,  nu: 0.30, Fy: 250e6,  Fu: 400e6,  rho: 7850 },
    aluminium:{ E: 69e9,  G: 26e9,  nu: 0.33, Fy: 270e6,  Fu: 310e6,  rho: 2700 },
    concrete: { E: 25e9,  G: 10e9,  nu: 0.20, Fy: 30e6,   Fu: 30e6,   rho: 2400 },
    wood:     { E: 12e9,  G: 0.75e9,nu: 0.35, Fy: 30e6,   Fu: 50e6,   rho: 600  },
    titanium: { E: 114e9, G: 44e9,  nu: 0.34, Fy: 880e6,  Fu: 950e6,  rho: 4507 },
    copper:   { E: 120e9, G: 45e9,  nu: 0.34, Fy: 70e6,   Fu: 220e6,  rho: 8960 },
  };

  // ── Section Properties ────────────────────────────────────
  const Section = {
    // Rectangular section: b×h
    rectangle(b, h) {
      return {
        A: b*h, Ix: b*h**3/12, Iy: h*b**3/12,
        Sx: b*h**2/6, Sy: h*b**2/6,
        rx: h/Math.sqrt(12), ry: b/Math.sqrt(12),
        J: (b*h**3 + h*b**3)/12,   // approx
        Zx: b*h**2/4,               // plastic modulus
      };
    },
    // Solid circular
    circle(d) {
      const r=d/2;
      return {
        A: Math.PI*r**2, Ix: Math.PI*d**4/64, Iy: Math.PI*d**4/64,
        Sx: Math.PI*d**3/32, Sy: Math.PI*d**3/32,
        rx: d/4, ry: d/4,
        J: Math.PI*d**4/32, Zx: d**3/6,
      };
    },
    // Hollow circular
    hollowCircle(do_, di) {
      const A = Math.PI*(do_**2 - di**2)/4;
      const I = Math.PI*(do_**4 - di**4)/64;
      const J = Math.PI*(do_**4 - di**4)/32;
      return {
        A, Ix: I, Iy: I,
        Sx: I/(do_/2), Sy: I/(do_/2),
        rx: Math.sqrt(I/A), ry: Math.sqrt(I/A),
        J, t: (do_-di)/2,
      };
    },
    // I-section (wide flange)
    iSection(bf, tf, hw, tw) {
      const h = hw + 2*tf;
      const A = 2*bf*tf + hw*tw;
      const Ix = (bf*h**3 - (bf-tw)*hw**3)/12;
      const Iy = (2*tf*bf**3 + hw*tw**3)/12;
      return {
        A, Ix, Iy,
        Sx: Ix/(h/2), Sy: Iy/(bf/2),
        rx: Math.sqrt(Ix/A), ry: Math.sqrt(Iy/A),
        Zx: bf*tf*(hw+tf)/2 + tw*hw**2/8,
      };
    },
    // T-section
    tSection(bf, tf, hw, tw) {
      const A = bf*tf + hw*tw;
      const ybar = (bf*tf*(tf/2) + hw*tw*(tf + hw/2)) / A;
      const Ix = bf*tf**3/12 + bf*tf*(ybar-tf/2)**2
               + tw*hw**3/12 + tw*hw*(tf+hw/2-ybar)**2;
      return { A, ybar, Ix, Sx_bot: Ix/(tf+hw-ybar), Sx_top: Ix/ybar };
    },
    // Angle section (L)
    angle(b, h, t) {
      const A = t*(b+h-t);
      const xbar = (b*t*t/2 + (h-t)*t*b) / A;
      const ybar = (h*t*t/2 + (b-t)*t*h) / A;
      const Ix = t*h**3/3 - (b-t)*(h-t)**3/3 - A*ybar**2;
      const Iy = t*b**3/3 - (h-t)*(b-t)**3/3 - A*xbar**2;
      return { A, xbar, ybar, Ix, Iy };
    },
  };

  // ── Beam Formulas ─────────────────────────────────────────
  // Simply supported beam
  const SS = {
    // Point load at midspan
    midPoint(P, L, E, I) {
      return {
        Rmax: P/2, Mmax: P*L/4,
        deflMax: P*L**3/(48*E*I),
        deflAt: (x) => (P*x*(3*L**2-4*x**2))/(48*E*I),    // x ≤ L/2
        momentAt: (x) => x <= L/2 ? P*x/2 : P*(L-x)/2,
        shearAt: (x) => x < L/2 ? P/2 : -P/2,
      };
    },
    // Point load at arbitrary location 'a'
    pointLoad(P, L, a, E, I) {
      const b = L - a;
      const Ra = P*b/L, Rb = P*a/L;
      const xmax = Math.sqrt(a*(L+b)/3);
      return {
        Ra, Rb, a, b,
        Mmax: Ra*a,
        deflMax: P*a*b*Math.sqrt(a*b*3)/(9*Math.sqrt(3)*L*E*I),
        deflAtA: P*a**2*b**2/(3*E*I*L),    // under load
        deflAt: (x) => x <= a
          ? Ra*x*(L**2-a**2-x**2)*b/(6*L*E*I)
          : Rb*(L-x)*((2*L-a)*(L-x)-(L-x)**2-b**2)/(6*L*E*I),
        momentAt: (x) => x <= a ? Ra*x : Ra*x - P*(x-a),
      };
    },
    // Uniform load (UDL) over full span
    udl(w, L, E, I) {
      return {
        Rmax: w*L/2, Mmax: w*L**2/8,
        deflMax: 5*w*L**4/(384*E*I),
        deflAt: (x) => w*x*(L**3-2*L*x**2+x**3)/(24*E*I),
        momentAt: (x) => w*x*(L-x)/2,
        shearAt: (x) => w*(L/2-x),
      };
    },
    // UDL on part of span (a to b)
    partialUDL(w, L, a, b, E, I) {
      const c = b - a;
      const Ra = w*c*(2*L - 2*a - c)/(2*L);
      const Rb = w*c*(2*a + c)/(2*L);
      return { Ra, Rb, Mmax: Ra*(Ra/w + a) };
    },
    // Triangular load (0 to wmax at end)
    triangularLoad(wmax, L, E, I) {
      return {
        Ra: wmax*L/6, Rb: wmax*L/3,
        Mmax: wmax*L**2*Math.sqrt(3)/27,
        xMmax: L/Math.sqrt(3),
        deflMax: 0.01304*wmax*L**4/(E*I),
      };
    },
  };

  // Cantilever beam
  const Cantilever = {
    pointLoadEnd(P, L, E, I) {
      return {
        Rwall: P, Mwall: P*L,
        deflTip: P*L**3/(3*E*I),
        deflAt: (x) => P*x**2*(3*L-x)/(6*E*I),
        momentAt: (x) => P*(L-x),
        shearAt: (_) => P,
        slopeTip: P*L**2/(2*E*I),
      };
    },
    udl(w, L, E, I) {
      return {
        Rwall: w*L, Mwall: w*L**2/2,
        deflTip: w*L**4/(8*E*I),
        deflAt: (x) => w*x**2*(6*L**2-4*L*x+x**2)/(24*E*I),
        momentAt: (x) => w*(L-x)**2/2,
        shearAt: (x) => w*(L-x),
      };
    },
    pointLoadAny(P, L, a, E, I) {
      return {
        Rwall: P, Mwall: P*a,
        deflTip: P*a**2*(3*L-a)/(6*E*I),
        deflAt: (x) => x<=a ? P*x**2*(3*a-x)/(6*E*I) : P*a**2*(3*x-a)/(6*E*I),
      };
    },
  };

  // Fixed-fixed beam
  const FixedFixed = {
    midPoint(P, L, E, I) {
      return {
        Mend: P*L/8, Mmid: P*L/8,
        Rmax: P/2,
        deflMax: P*L**3/(192*E*I),
      };
    },
    udl(w, L, E, I) {
      return {
        Mend: w*L**2/12, Mmid: w*L**2/24,
        Rmax: w*L/2,
        deflMax: w*L**4/(384*E*I),
      };
    },
  };

  // Propped cantilever
  const ProppedCantilever = {
    udl(w, L, E, I) {
      return {
        Rwall: 5*w*L/8, Rprop: 3*w*L/8,
        Mwall: w*L**2/8,
        Mmax_pos: 9*w*L**2/128, xMmax: 5*L/8,
        deflMax: w*L**4*0.005415/(E*I),
      };
    },
  };

  // ── Stress & Strain ───────────────────────────────────────
  function normalStress(P, A)          { return P/A; }
  function shearStress(V, A)           { return V/A; }
  function bendingStress(M, y, I)      { return M*y/I; }
  function torsionalStress(T, r, J)    { return T*r/J; }
  function bearingStress(P, A)         { return P/A; }
  function hoop(p, r, t)               { return p*r/t; }         // thin cylinder hoop
  function longitudinal(p, r, t)       { return p*r/(2*t); }     // thin cylinder long
  function vonMises(sx, sy, txy)       {
    return Math.sqrt(sx**2 - sx*sy + sy**2 + 3*txy**2);
  }
  function vonMises3D(s1, s2, s3)      {
    return Math.sqrt(0.5*((s1-s2)**2+(s2-s3)**2+(s3-s1)**2));
  }
  function tresca(s1, s3)              { return Math.abs(s1-s3)/2; }  // max shear stress

  function strain(delta, L)            { return delta/L; }
  function strainFromStress(sigma, E)  { return sigma/E; }
  function lateralStrain(axialStrain, nu) { return -nu*axialStrain; }
  function volumetricStrain(ex, ey, ez){ return ex+ey+ez; }
  function shearStrain(tau, G)         { return tau/G; }
  function thermalStrain(alpha, dT)    { return alpha*dT; }
  function thermalStress(E, alpha, dT) { return -E*alpha*dT; }

  function modulusOfRigidity(E, nu)    { return E/(2*(1+nu)); }
  function bulkModulus(E, nu)          { return E/(3*(1-2*nu)); }

  // ── Mohr's Circle (2D) ────────────────────────────────────
  function mohrsCircle2D(sx, sy, txy) {
    const C = (sx+sy)/2;
    const R = Math.sqrt(((sx-sy)/2)**2 + txy**2);
    const s1 = C + R, s2 = C - R;
    const theta_p = 0.5*Math.atan2(2*txy, sx-sy)*180/Math.PI;
    return { C, R, s1, s2, tauMax: R, theta_p, sx: C+R, sy: C-R };
  }
  function mohrsCircle3D(s1, s2, s3) {
    return {
      tmax12: Math.abs(s1-s2)/2, tmax23: Math.abs(s2-s3)/2,
      tmax13: Math.abs(s1-s3)/2,
      tauMax: Math.max(Math.abs(s1-s2),Math.abs(s2-s3),Math.abs(s1-s3))/2,
      sHydro: (s1+s2+s3)/3,
    };
  }

  // ── Column Buckling ───────────────────────────────────────
  function eulerLoad(E, I, Leff) { return Math.PI**2*E*I/Leff**2; }
  function eulerStress(E, r, Leff) { return Math.PI**2*E/(Leff/r)**2; }
  function slendernessRatio(Leff, r) { return Leff/r; }

  // Effective length factor K
  const K_factors = {
    'pin-pin': 1.0, 'fixed-free': 2.0,
    'fixed-pin': 0.7, 'fixed-fixed': 0.5,
  };

  function leff(L, endCondition) { return (K_factors[endCondition]??1)*L; }

  // Johnson parabola (for intermediate columns)
  function johnsonLoad(A, Fy, E, r, L) {
    return A*Fy*(1 - Fy*(L/r)**2/(4*Math.PI**2*E));
  }

  // ── Fatigue ───────────────────────────────────────────────
  // S-N Curve: N*Smax^b = C
  function fatigueCycles(Smax, Su, b = 0.085) {
    const Se = 0.5*Su;  // endurance limit approx
    const C = Math.pow(0.9*Su, 2)/Se;
    return Math.pow(C/Smax**2, 1/b);
  }
  function goodmanFatigue(sigma_a, sigma_m, Su, Se) {
    return sigma_a/Se + sigma_m/Su;  // <1 = safe
  }
  function gerberFatigue(sigma_a, sigma_m, Su, Se) {
    return sigma_a/Se + (sigma_m/Su)**2;
  }
  function soderbergFatigue(sigma_a, sigma_m, Sy, Se) {
    return sigma_a/Se + sigma_m/Sy;
  }
  function stressConcentration(K, sigma_nominal) { return K*sigma_nominal; }

  // ── Welds ─────────────────────────────────────────────────
  function weldThroat(legSize)         { return 0.707*legSize; }
  function weldArea(legSize, length)   { return weldThroat(legSize)*length; }
  function weldStrength(legSize, length, Fw) { return Fw*weldArea(legSize, length); }

  // ── Springs ───────────────────────────────────────────────
  function springRate(G, d, D, n) { return G*d**4/(8*D**3*n); }  // coil spring
  function springDeflection(F, k) { return F/k; }
  function springEnergy(k, delta)  { return 0.5*k*delta**2; }
  function springWahl(C)           { return (4*C-1)/(4*C-4) + 0.615/C; }  // Wahl factor

  // ── Public API ────────────────────────────────────────────
  return {
    MATERIALS, Section,
    SS, Cantilever, FixedFixed, ProppedCantilever,
    normalStress, shearStress, bendingStress, torsionalStress,
    bearingStress, hoop, longitudinal,
    vonMises, vonMises3D, tresca,
    strain, strainFromStress, lateralStrain, volumetricStrain,
    shearStrain, thermalStrain, thermalStress,
    modulusOfRigidity, bulkModulus,
    mohrsCircle2D, mohrsCircle3D,
    eulerLoad, eulerStress, slendernessRatio, K_factors, leff, johnsonLoad,
    fatigueCycles, goodmanFatigue, gerberFatigue, soderbergFatigue, stressConcentration,
    weldThroat, weldArea, weldStrength,
    springRate, springDeflection, springEnergy, springWahl,
  };

})();

if (typeof module !== 'undefined') module.exports = Structural;
else window.Structural = Structural;
