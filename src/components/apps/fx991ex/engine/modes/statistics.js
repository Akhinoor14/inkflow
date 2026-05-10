// ===== Statistics engine =====

export function stat1Var(data) {
  const n = data.length
  if (n === 0) return null
  const mean = data.reduce((s,v)=>s+v,0) / n
  const variance = data.reduce((s,v)=>s+(v-mean)**2,0) / n
  const sVariance = n>1 ? data.reduce((s,v)=>s+(v-mean)**2,0)/(n-1) : 0
  const sorted = [...data].sort((a,b)=>a-b)
  return {
    n, sum: data.reduce((s,v)=>s+v,0),
    sumSq: data.reduce((s,v)=>s+v*v,0),
    mean, min: sorted[0], max: sorted[n-1],
    median: n%2===0?(sorted[n/2-1]+sorted[n/2])/2:sorted[Math.floor(n/2)],
    σx: Math.sqrt(variance), sx: Math.sqrt(sVariance),
    Q1: sorted[Math.floor(n/4)], Q3: sorted[Math.floor(3*n/4)]
  }
}

export function stat2Var(xData, yData) {
  const n = xData.length
  const sx = stat1Var(xData), sy = stat1Var(yData)
  const sumXY = xData.reduce((s,v,i)=>s+v*yData[i],0)
  const Sxy = sumXY - n*sx.mean*sy.mean
  const Sxx = xData.reduce((s,v)=>s+(v-sx.mean)**2,0)
  // Linear regression y = a + bx
  const b = Sxx!==0 ? Sxy/Sxx : 0
  const a = sy.mean - b*sx.mean
  const r = Sxx!==0 && sy.sx!==0 ? Sxy/Math.sqrt(Sxx*yData.reduce((s,v)=>s+(v-sy.mean)**2,0)) : 0
  return { n, meanX: sx.mean, meanY: sy.mean, a, b, r, r2: r*r }
}

// ===== Probability distributions =====

// Normal CDF (Abramowitz & Stegun approximation)
export function normCDF(z) {
  const t = 1/(1+0.2316419*Math.abs(z))
  const poly = t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))))
  const cdf = 1 - (1/Math.sqrt(2*Math.PI))*Math.exp(-z*z/2)*poly
  return z >= 0 ? cdf : 1-cdf
}

export function normPDF(x, mu=0, sigma=1) {
  return Math.exp(-0.5*((x-mu)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI))
}

export function normInvCDF(p, mu=0, sigma=1) {
  // Rational approximation
  if (p<=0||p>=1) throw new Error('Domain Error')
  const a=[2.50662823884,-18.61500062529,41.39119773534,-25.44106049637]
  const b=[-8.47351093090,23.08336743743,-21.06224101826,3.13082909833]
  const c=[0.3374754822726147,0.9761690190917186,0.1607979714918209,0.0276438810333863,
           0.0038405729373609,0.0003951896511349,0.0000321767881768,0.0000002888167364,0.0000003960315187]
  let z
  if (p < 0.02425) {
    const q = Math.sqrt(-2*Math.log(p))
    z = (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
        ((((c[6]*q+c[7])*q+c[8])*q+1))
    z = -z
  } else if (p <= 1-0.02425) {
    const q=p-0.5, r=q*q
    z = (((a[0]*r+a[1])*r+a[2])*r+a[3])*q / ((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+1)
  } else {
    const q=Math.sqrt(-2*Math.log(1-p))
    z = -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
         ((((c[6]*q+c[7])*q+c[8])*q+1))
  }
  return mu + sigma*z
}

// t-distribution CDF (using regularized incomplete beta)
function betaI(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1
  const lbeta = lgamma(a)+lgamma(b)-lgamma(a+b)
  if (x < (a+1)/(a+b+2)) return Math.exp(a*Math.log(x)+b*Math.log(1-x)-lbeta)*betaCF(x,a,b)/a
  return 1-Math.exp(b*Math.log(1-x)+a*Math.log(x)-lbeta)*betaCF(1-x,b,a)/b
}

function betaCF(x, a, b) {
  let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap; if(Math.abs(d)<1e-30)d=1e-30; d=1/d; let h=d
  for(let m=1;m<=100;m++){
    let m2=2*m,aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d; if(Math.abs(d)<1e-30)d=1e-30
    c=1+aa/c; if(Math.abs(c)<1e-30)c=1e-30; d=1/d; h*=d*c
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d; if(Math.abs(d)<1e-30)d=1e-30
    c=1+aa/c; if(Math.abs(c)<1e-30)c=1e-30; d=1/d; const del=d*c; h*=del
    if(Math.abs(del-1)<1e-12)break
  }
  return h
}

function lgamma(x) {
  const g=[0.99999999999999709182,57.156235665862923517,-59.597960355475491248,14.136097974741747174,-0.49191381609762019978,3.399464998481188e-5,4.651620073793672e-5,-9.834265684979730e-5,1.580887032249125e-4,-2.1026444172410611e-4,2.1743961811521264e-4,-1.6431810653676389e-4,8.441822398385275e-5,-2.6190838401581408e-5,3.6899182659531625e-6]
  if(x<0.5)return Math.log(Math.PI/Math.sin(Math.PI*x))-lgamma(1-x)
  x-=1; let a=g[0]; const t=x+14.5
  for(let i=1;i<15;i++)a+=g[i]/(x+i)
  return 0.5*Math.log(2*Math.PI)+(x+0.5)*Math.log(t)-t+Math.log(a)
}

export function tCDF(t, df) {
  const x = df/(df+t*t)
  const p = betaI(x, df/2, 0.5)
  return t >= 0 ? 1-p/2 : p/2
}

export function chi2CDF(x, df) {
  if (x < 0) return 0
  return betaI(x/2, df/2, 0.5) // regularized gamma
}

// Binomial PMF
export function binomialPMF(k, n, p) {
  if (k < 0 || k > n) return 0
  const logC = lgamma(n+1)-lgamma(k+1)-lgamma(n-k+1)
  return Math.exp(logC + k*Math.log(p) + (n-k)*Math.log(1-p))
}

export function binomialCDF(k, n, p) {
  let s = 0
  for (let i = 0; i <= k; i++) s += binomialPMF(i, n, p)
  return s
}

// Poisson PMF
export function poissonPMF(k, lambda) {
  if (k < 0) return 0
  return Math.exp(k*Math.log(lambda) - lambda - lgamma(k+1))
}

export function poissonCDF(k, lambda) {
  let s = 0
  for (let i = 0; i <= k; i++) s += poissonPMF(i, lambda)
  return s
}

// Geometric PMF
export function geometricPMF(k, p) { return Math.pow(1-p, k-1)*p }
export function geometricCDF(k, p) { return 1-Math.pow(1-p, k) }

// Hypergeometric PMF
export function hypergeoPMF(k, N, K, n) {
  function combo(a, b) { return Math.exp(lgamma(a+1)-lgamma(b+1)-lgamma(a-b+1)) }
  return combo(K,k)*combo(N-K,n-k)/combo(N,n)
}
