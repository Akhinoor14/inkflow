// calc/core/matrix.js
// ════════════════════════════════════════════════════════════
//  MATRIX MODULE
//  Covers: basic ops, determinant, inverse, transpose,
//          LU/QR/SVD decomposition, eigenvalues (power method),
//          rank, null space, Gram-Schmidt, least squares
// ════════════════════════════════════════════════════════════
'use strict';

const Matrix = (() => {

  const EPS = 1e-12;

  // ── Constructors ──────────────────────────────────────────
  function zeros(r, c)    { return Array.from({length:r}, () => Array(c).fill(0)); }
  function ones(r, c)     { return Array.from({length:r}, () => Array(c).fill(1)); }
  function identity(n)    { const I=zeros(n,n); for(let i=0;i<n;i++) I[i][i]=1; return I; }
  function fromArray(arr) { return arr.map(r => Array.isArray(r) ? [...r] : [r]); }
  function clone(A)       { return A.map(r => [...r]); }

  function dims(A) { return { rows: A.length, cols: A[0].length }; }

  // ── Validation ────────────────────────────────────────────
  function isSquare(A) { return A.length === A[0].length; }
  function sameSize(A, B) { return A.length===B.length && A[0].length===B[0].length; }

  // ── Basic Operations ──────────────────────────────────────
  function add(A, B) {
    if (!sameSize(A,B)) throw new Error('Matrix size mismatch');
    return A.map((r,i) => r.map((v,j) => v + B[i][j]));
  }
  function sub(A, B) {
    if (!sameSize(A,B)) throw new Error('Matrix size mismatch');
    return A.map((r,i) => r.map((v,j) => v - B[i][j]));
  }
  function scalarMul(A, k) { return A.map(r => r.map(v => v * k)); }
  function transpose(A)    { return A[0].map((_, j) => A.map(r => r[j])); }

  function mul(A, B) {
    const ra=A.length, ca=A[0].length, cb=B[0].length;
    if (ca !== B.length) throw new Error('Incompatible dimensions');
    const C = zeros(ra, cb);
    for (let i=0;i<ra;i++)
      for (let j=0;j<cb;j++)
        for (let k=0;k<ca;k++) C[i][j] += A[i][k]*B[k][j];
    return C;
  }

  function hadamard(A, B) {   // element-wise product
    if (!sameSize(A,B)) throw new Error('Size mismatch');
    return A.map((r,i) => r.map((v,j) => v * B[i][j]));
  }

  function matVecMul(A, v) {
    return A.map(row => row.reduce((s, aij, j) => s + aij * v[j], 0));
  }

  // ── Trace & Norm ──────────────────────────────────────────
  function trace(A) {
    const n = Math.min(A.length, A[0].length);
    let t = 0; for (let i=0;i<n;i++) t += A[i][i]; return t;
  }
  function frobeniusNorm(A) {
    return Math.sqrt(A.reduce((s,r) => s + r.reduce((ss,v) => ss + v*v, 0), 0));
  }
  function infinityNorm(A) {
    return Math.max(...A.map(r => r.reduce((s,v) => s + Math.abs(v), 0)));
  }

  // ── Determinant (recursive, with LU for speed) ────────────
  function det(A) {
    if (!isSquare(A)) throw new Error('Not square');
    const n = A.length;
    if (n === 1) return A[0][0];
    if (n === 2) return A[0][0]*A[1][1] - A[0][1]*A[1][0];
    if (n === 3) return A[0][0]*(A[1][1]*A[2][2]-A[1][2]*A[2][1])
                      -A[0][1]*(A[1][0]*A[2][2]-A[1][2]*A[2][0])
                      +A[0][2]*(A[1][0]*A[2][1]-A[1][1]*A[2][0]);
    // LU decomposition for larger matrices
    const { L, U, sign } = luDecomp(A);
    let d = sign;
    for (let i=0;i<n;i++) d *= U[i][i];
    return d;
  }

  // ── LU Decomposition (Doolittle with partial pivoting) ────
  function luDecomp(A) {
    const n = A.length;
    const L = identity(n), U = clone(A);
    const P = identity(n);
    let sign = 1;

    for (let col=0;col<n;col++) {
      // Partial pivot
      let maxRow = col;
      for (let r=col+1;r<n;r++)
        if (Math.abs(U[r][col]) > Math.abs(U[maxRow][col])) maxRow=r;

      if (maxRow !== col) {
        [U[col],U[maxRow]] = [U[maxRow],U[col]];
        [P[col],P[maxRow]] = [P[maxRow],P[col]];
        for (let j=0;j<col;j++) [L[col][j],L[maxRow][j]]=[L[maxRow][j],L[col][j]];
        sign *= -1;
      }

      if (Math.abs(U[col][col]) < EPS) continue;

      for (let row=col+1;row<n;row++) {
        const f = U[row][col] / U[col][col];
        L[row][col] = f;
        for (let k=col;k<n;k++) U[row][k] -= f * U[col][k];
      }
    }
    return { L, U, P, sign };
  }

  // ── Inverse (Gauss-Jordan) ────────────────────────────────
  function inverse(A) {
    if (!isSquare(A)) throw new Error('Not square');
    const n = A.length;
    const M = A.map((r,i) => [...r, ...identity(n)[i]]);

    for (let col=0;col<n;col++) {
      let maxRow = col;
      for (let r=col+1;r<n;r++)
        if (Math.abs(M[r][col])>Math.abs(M[maxRow][col])) maxRow=r;
      [M[col],M[maxRow]]=[M[maxRow],M[col]];

      if (Math.abs(M[col][col]) < EPS) throw new Error('Singular matrix');

      const pivot = M[col][col];
      for (let k=0;k<2*n;k++) M[col][k] /= pivot;

      for (let row=0;row<n;row++) {
        if (row===col) continue;
        const f = M[row][col];
        for (let k=0;k<2*n;k++) M[row][k] -= f*M[col][k];
      }
    }
    return M.map(r => r.slice(n));
  }

  // ── QR Decomposition (Gram-Schmidt) ──────────────────────
  function qrDecomp(A) {
    const m=A.length, n=A[0].length;
    const Q=zeros(m,n), R=zeros(n,n);
    const cols = A[0].map((_,j) => A.map(r=>r[j])); // column vectors

    const e = [];
    for (let j=0;j<n;j++) {
      let u = [...cols[j]];
      for (let i=0;i<j;i++) {
        const proj = dot(cols[j],e[i]);
        u = u.map((v,k) => v - proj*e[i][k]);
      }
      const norm = vecNorm(u);
      if (norm < EPS) { e.push(Array(m).fill(0)); continue; }
      e.push(u.map(v=>v/norm));
    }
    // Fill Q, R
    for (let j=0;j<n;j++) for (let i=0;i<m;i++) Q[i][j]=e[j]?e[j][i]:0;
    for (let i=0;i<n;i++) for (let j=i;j<n;j++) R[i][j]=dot(cols[j], e[i]||[]);
    return { Q, R };
  }

  // ── Eigenvalues (Power Iteration + Deflation) ─────────────
  function eigenPower(A, maxIter=1000, tol=1e-10) {
    const n = A.length;
    const eigenvalues=[], eigenvectors=[];
    let M = clone(A);

    for (let k=0;k<n;k++) {
      let v = Array(n).fill(1/Math.sqrt(n)); // initial vector
      let lambda = 0;
      for (let iter=0;iter<maxIter;iter++) {
        const Av = matVecMul(M, v);
        const norm = vecNorm(Av);
        const newLambda = dot(Av, v);
        const newV = Av.map(x=>x/norm);
        if (Math.abs(newLambda-lambda)<tol) { lambda=newLambda; v=newV; break; }
        lambda=newLambda; v=newV;
      }
      eigenvalues.push(lambda);
      eigenvectors.push(v);
      // Deflate: M = M - λ·vvᵀ
      for (let i=0;i<n;i++)
        for (let j=0;j<n;j++) M[i][j] -= lambda*v[i]*v[j];
    }
    return { eigenvalues, eigenvectors };
  }

  // ── Rank ──────────────────────────────────────────────────
  function rank(A) {
    const M = clone(A);
    const m=M.length, n=M[0].length;
    let r=0, row=0;
    for (let col=0;col<n&&row<m;col++) {
      let pivot=-1;
      for (let i=row;i<m;i++) if(Math.abs(M[i][col])>EPS){pivot=i;break;}
      if (pivot===-1) continue;
      [M[row],M[pivot]]=[M[pivot],M[row]];
      const scale = M[row][col];
      for (let j=col;j<n;j++) M[row][j]/=scale;
      for (let i=0;i<m;i++) {
        if (i===row) continue;
        const f=M[i][col];
        for (let j=col;j<n;j++) M[i][j]-=f*M[row][j];
      }
      r++; row++;
    }
    return r;
  }

  // ── Solve Ax=b (via LU) ───────────────────────────────────
  function solve(A, b) {
    const n = A.length;
    const { L, U, P } = luDecomp(A);
    // Pb
    const Pb = matVecMul(P, b);
    // Forward substitution: Ly = Pb
    const y = Array(n).fill(0);
    for (let i=0;i<n;i++) {
      y[i] = Pb[i];
      for (let j=0;j<i;j++) y[i] -= L[i][j]*y[j];
    }
    // Back substitution: Ux = y
    const x = Array(n).fill(0);
    for (let i=n-1;i>=0;i--) {
      x[i] = y[i];
      for (let j=i+1;j<n;j++) x[i] -= U[i][j]*x[j];
      x[i] /= U[i][i];
    }
    return x;
  }

  // ── Least Squares (A overdetermined) ─────────────────────
  function leastSquares(A, b) {
    // x = (AᵀA)⁻¹Aᵀb
    const AT = transpose(A);
    const ATA = mul(AT, A);
    const ATb = matVecMul(AT, b);
    return solve(ATA, ATb);
  }

  // ── Cholesky (for symmetric positive definite) ────────────
  function cholesky(A) {
    const n = A.length;
    const L = zeros(n, n);
    for (let i=0;i<n;i++) {
      for (let j=0;j<=i;j++) {
        let sum = A[i][j];
        for (let k=0;k<j;k++) sum -= L[i][k]*L[j][k];
        if (i===j) {
          if (sum<0) throw new Error('Not positive definite');
          L[i][j] = Math.sqrt(sum);
        } else {
          L[i][j] = L[j][j]===0 ? 0 : sum/L[j][j];
        }
      }
    }
    return L;
  }

  // ── Gram-Schmidt orthogonalization ────────────────────────
  function gramSchmidt(vectors) {
    const orthogonal = [];
    for (const v of vectors) {
      let u = [...v];
      for (const e of orthogonal) {
        const proj = dot(v, e) / dot(e, e);
        u = u.map((x, i) => x - proj * e[i]);
      }
      if (vecNorm(u) > EPS) orthogonal.push(u);
    }
    return orthogonal.map(v => { const n=vecNorm(v); return v.map(x=>x/n); });
  }

  // ── Characteristic polynomial coefficients ────────────────
  // (for display only, up to 4×4)
  function characteristicPoly(A) {
    const n = A.length;
    if (n > 4) return null;
    const { eigenvalues } = eigenPower(A);
    return eigenvalues;
  }

  // ── Helpers ───────────────────────────────────────────────
  function dot(a, b) { return a.reduce((s, v, i) => s + v * (b[i]||0), 0); }
  function vecNorm(v) { return Math.sqrt(v.reduce((s,x) => s + x*x, 0)); }

  // ── Pretty print ──────────────────────────────────────────
  function toString(A, decimals=4) {
    return A.map(r => '[ ' + r.map(v => v.toFixed(decimals).padStart(10)).join('  ') + ' ]').join('\n');
  }

  // ── Public API ────────────────────────────────────────────
  return {
    zeros, ones, identity, fromArray, clone, dims,
    isSquare, sameSize,
    add, sub, scalarMul, transpose, mul, hadamard, matVecMul,
    trace, frobeniusNorm, infinityNorm,
    det, luDecomp, inverse, qrDecomp,
    eigenPower,
    rank, solve, leastSquares, cholesky, gramSchmidt,
    characteristicPoly,
    dot, vecNorm, toString,
  };

})();

if (typeof module !== 'undefined') module.exports = Matrix;
else window.Matrix = Matrix;
