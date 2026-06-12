// calc/core/financial.js
// ════════════════════════════════════════════════════════════
//  FINANCIAL / ENGINEERING ECONOMICS MODULE
//  Covers: TVM (PV,FV,PMT,NPER,RATE), NPV, IRR, MIRR,
//          depreciation (SL/DB/SOYD/MACRS), bond pricing,
//          amortization, inflation, loan analysis,
//          break-even, payback period
// ════════════════════════════════════════════════════════════
'use strict';

const Financial = (() => {

  // ── Time Value of Money ───────────────────────────────────

  // Future Value: FV = PV(1+r)^n + PMT·[(1+r)^n - 1]/r
  function FV(r, n, pmt, pv = 0, type = 0) {
    if (Math.abs(r) < 1e-12) return -pv - pmt * n;
    const f = Math.pow(1 + r, n);
    return -(pv * f + pmt * (1 + r * type) * (f - 1) / r);
  }

  // Present Value: PV = FV/(1+r)^n - PMT·[(1-(1+r)^-n)/r]
  function PV(r, n, pmt, fv = 0, type = 0) {
    if (Math.abs(r) < 1e-12) return -fv - pmt * n;
    const f = Math.pow(1 + r, n);
    return -(fv / f + pmt * (1 + r * type) * (1 - 1/f) / r);
  }

  // Payment amount
  function PMT(r, n, pv, fv = 0, type = 0) {
    if (Math.abs(r) < 1e-12) return -(pv + fv) / n;
    const f = Math.pow(1 + r, n);
    return -r * (pv * f + fv) / ((1 + r * type) * (f - 1));
  }

  // Number of periods
  function NPER(r, pmt, pv, fv = 0, type = 0) {
    if (Math.abs(r) < 1e-12) return -(pv + fv) / pmt;
    const f = (pmt * (1 + r * type) / r - fv) / (pv + pmt * (1 + r * type) / r);
    return Math.log(f) / Math.log(1 + r);
  }

  // Interest rate (Newton-Raphson)
  function RATE(n, pmt, pv, fv = 0, type = 0, guess = 0.1) {
    let r = guess;
    for (let i = 0; i < 200; i++) {
      const f = FV(r, n, pmt, pv, type) + fv;
      const df = (FV(r + 1e-6, n, pmt, pv, type) - FV(r - 1e-6, n, pmt, pv, type)) / 2e-6;
      if (Math.abs(df) < 1e-15) break;
      const nr = r - f / df;
      if (Math.abs(nr - r) < 1e-12) { r = nr; break; }
      r = nr;
      if (!isFinite(r)) return NaN;
    }
    return r;
  }

  // ── Net Present Value ─────────────────────────────────────
  function NPV(r, cashflows) {
    return cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t + 1), 0);
  }

  // NPV including initial investment at t=0
  function NPVwithInitial(r, initial, cashflows) {
    return -initial + NPV(r, cashflows);
  }

  // ── Internal Rate of Return (Newton-Raphson on NPV) ───────
  function IRR(cashflows, guess = 0.1) {
    let r = guess;
    for (let i = 0; i < 500; i++) {
      const npv = cashflows.reduce((s, cf, t) => s + cf / Math.pow(1+r, t), 0);
      const dnpv = cashflows.reduce((s, cf, t) =>
        s - t * cf / Math.pow(1+r, t+1), 0);
      if (Math.abs(dnpv) < 1e-15) break;
      const nr = r - npv / dnpv;
      if (Math.abs(nr - r) < 1e-10) { r = nr; break; }
      r = nr;
      if (!isFinite(r)) return NaN;
    }
    return r;
  }

  // Modified IRR
  function MIRR(cashflows, financeRate, reinvestRate) {
    const n = cashflows.length;
    const neg = cashflows.filter(cf => cf < 0);
    const pos = cashflows.filter((cf, t) => cf > 0 ?
      Math.pow(1 + reinvestRate, n - 1 - t) * cf : 0);
    const pv_neg = neg.reduce((s, cf, t) => s + cf / Math.pow(1 + financeRate, t), 0);
    const fv_pos = cashflows.reduce((s, cf, t) =>
      cf > 0 ? s + cf * Math.pow(1 + reinvestRate, n - 1 - t) : s, 0);
    return Math.pow(-fv_pos / pv_neg, 1 / (n - 1)) - 1;
  }

  // ── Profitability Index ───────────────────────────────────
  function PI(r, initial, cashflows) {
    return (initial + NPVwithInitial(r, initial, cashflows)) / initial;
  }

  // ── Depreciation ─────────────────────────────────────────

  // Straight-Line
  function deprecSL(cost, salvage, life) {
    const d = (cost - salvage) / life;
    return Array.from({length: life}, (_, yr) => ({
      year: yr + 1,
      depreciation: d,
      bookValue: cost - d * (yr + 1),
    }));
  }

  // Double Declining Balance
  function deprecDDB(cost, salvage, life, factor = 2) {
    const rate = factor / life;
    let bookValue = cost;
    return Array.from({length: life}, (_, yr) => {
      const d = Math.min(bookValue * rate, bookValue - salvage);
      const dep = Math.max(d, 0);
      bookValue -= dep;
      return { year: yr + 1, depreciation: dep, bookValue };
    });
  }

  // Sum of Years' Digits
  function deprecSOYD(cost, salvage, life) {
    const soyd = life * (life + 1) / 2;
    let bookValue = cost;
    return Array.from({length: life}, (_, yr) => {
      const d = (life - yr) / soyd * (cost - salvage);
      bookValue -= d;
      return { year: yr + 1, depreciation: d, bookValue };
    });
  }

  // Units of Production
  function deprecUnits(cost, salvage, totalUnits, unitsPerYear) {
    const ratePerUnit = (cost - salvage) / totalUnits;
    let bookValue = cost;
    return unitsPerYear.map((units, yr) => {
      const d = units * ratePerUnit;
      bookValue -= d;
      return { year: yr + 1, units, depreciation: d, bookValue };
    });
  }

  // ── Amortization Schedule ─────────────────────────────────
  function amortize(principal, annualRate, periods, type = 'monthly') {
    const r = type === 'monthly' ? annualRate / 12 : annualRate;
    const pmt = PMT(r, periods, principal);
    let balance = principal;
    const schedule = [];
    let totalInterest = 0, totalPrincipal = 0;

    for (let i = 1; i <= periods; i++) {
      const interest  = balance * r;
      const principal_payment = -(pmt + interest);
      balance -= principal_payment;
      totalInterest  += interest;
      totalPrincipal += principal_payment;
      schedule.push({
        period: i,
        payment: -pmt,
        interest: parseFloat(interest.toFixed(6)),
        principal: parseFloat(principal_payment.toFixed(6)),
        balance: parseFloat(Math.max(0, balance).toFixed(6)),
      });
    }
    return {
      schedule,
      payment: -pmt,
      totalInterest,
      totalCost: principal + totalInterest,
    };
  }

  // ── Bond Pricing ──────────────────────────────────────────
  function bondPrice(faceValue, couponRate, ytm, periods) {
    const coupon = faceValue * couponRate;
    const pv_coupons = coupon * (1 - Math.pow(1+ytm, -periods)) / ytm;
    const pv_face   = faceValue / Math.pow(1+ytm, periods);
    return pv_coupons + pv_face;
  }

  function bondYTM(faceValue, couponRate, price, periods, guess = 0.05) {
    const fn = r => bondPrice(faceValue, couponRate, r, periods) - price;
    let r = guess;
    for (let i = 0; i < 200; i++) {
      const f = fn(r);
      const df = (fn(r+1e-6) - fn(r-1e-6)) / 2e-6;
      if (Math.abs(df) < 1e-15) break;
      const nr = r - f/df;
      if (Math.abs(nr-r) < 1e-10) { r = nr; break; }
      r = nr;
    }
    return r;
  }

  function bondDuration(faceValue, couponRate, ytm, periods) {
    const coupon = faceValue * couponRate;
    const price = bondPrice(faceValue, couponRate, ytm, periods);
    let dur = 0;
    for (let t = 1; t <= periods; t++) {
      const cf = t < periods ? coupon : coupon + faceValue;
      dur += t * cf / Math.pow(1+ytm, t);
    }
    return dur / price;
  }

  // Modified duration
  function bondModDuration(faceValue, couponRate, ytm, periods) {
    return bondDuration(faceValue, couponRate, ytm, periods) / (1 + ytm);
  }

  // ── Inflation ─────────────────────────────────────────────
  function realRate(nominalRate, inflationRate) {
    return (1 + nominalRate) / (1 + inflationRate) - 1; // Fisher equation
  }
  function nominalRate(realRate_v, inflationRate) {
    return (1 + realRate_v) * (1 + inflationRate) - 1;
  }
  function realValue(nominalValue, inflationRate, years) {
    return nominalValue / Math.pow(1 + inflationRate, years);
  }
  function CAGR(startVal, endVal, years) {
    return Math.pow(endVal / startVal, 1/years) - 1;
  }

  // ── Break-even Analysis ───────────────────────────────────
  function breakEven(fixedCosts, pricePerUnit, variableCostPerUnit) {
    const contribution = pricePerUnit - variableCostPerUnit;
    if (contribution <= 0) return { units: Infinity, revenue: Infinity };
    const units = fixedCosts / contribution;
    return { units, revenue: units * pricePerUnit, contributionMargin: contribution };
  }

  // ── Payback Period ────────────────────────────────────────
  function paybackPeriod(initial, cashflows) {
    let cumulative = -initial, period = 0;
    for (let t = 0; t < cashflows.length; t++) {
      if (cumulative >= 0) break;
      const prev = cumulative;
      cumulative += cashflows[t];
      if (cumulative >= 0) {
        period = t + (-prev / cashflows[t]);
        return { period, paybackYear: t + 1 };
      }
    }
    return { period: Infinity, paybackYear: null };
  }

  // Discounted payback period
  function discountedPayback(initial, cashflows, r) {
    const discounted = cashflows.map((cf, t) => cf / Math.pow(1+r, t+1));
    return paybackPeriod(initial, discounted);
  }

  // ── Currency / Unit conversions ───────────────────────────
  function effectiveAnnualRate(nominalRate_v, n) {
    // Compounding n times per year
    return Math.pow(1 + nominalRate_v/n, n) - 1;
  }
  function continuousRate(nominalRate_v) {
    return Math.exp(nominalRate_v) - 1;
  }

  // ── Return on Investment ──────────────────────────────────
  function ROI(gain, cost) { return (gain - cost) / cost; }
  function ROE(netIncome, equity) { return netIncome / equity; }
  function grossMargin(revenue, cogs) { return (revenue - cogs) / revenue; }
  function netMargin(netIncome, revenue) { return netIncome / revenue; }

  // ── Public API ────────────────────────────────────────────
  return {
    FV, PV, PMT, NPER, RATE,
    NPV, NPVwithInitial, IRR, MIRR, PI,
    deprecSL, deprecDDB, deprecSOYD, deprecUnits,
    amortize,
    bondPrice, bondYTM, bondDuration, bondModDuration,
    realRate, nominalRate, realValue, CAGR,
    breakEven, paybackPeriod, discountedPayback,
    effectiveAnnualRate, continuousRate,
    ROI, ROE, grossMargin, netMargin,
  };

})();

if (typeof module !== 'undefined') module.exports = Financial;
else window.Financial = Financial;
