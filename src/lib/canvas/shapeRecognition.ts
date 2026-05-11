// src/lib/canvas/shapeRecognition.ts
// Improved $1 Unistroke Recognizer — handles line, circle, rect, triangle, arrow
// Also: geometry-based classifier runs first for straight lines + near-circles

import type { Point, ShapeType, ShapeRecognitionResult, BoundingBox } from '@/types';

// ─── Helpers ───────────────────────────────────────────────────────────────

function deg2rad(d: number) { return d * (Math.PI / 180); }
function dist(a: Point, b: Point) { return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); }
function centroid(pts: Point[]): Point {
  let x=0,y=0; for(const p of pts){x+=p.x;y+=p.y;}
  return {x:x/pts.length,y:y/pts.length};
}
function pathLen(pts: Point[]): number {
  let d=0; for(let i=1;i<pts.length;i++) d+=dist(pts[i-1],pts[i]); return d;
}

// ─── Geometry-based classifiers (run BEFORE $1 recognizer) ─────────────────

/** Straightness: ratio of direct distance to path length. 1.0 = perfectly straight */
function straightness(pts: Point[]): number {
  if(pts.length<2) return 1;
  return dist(pts[0],pts[pts.length-1]) / (pathLen(pts)||1);
}

/** Circularity: how close points are to a best-fit circle */
function circularity(pts: Point[]): number {
  const c = centroid(pts);
  const radii = pts.map(p=>dist(p,c));
  const meanR = radii.reduce((a,b)=>a+b,0)/radii.length;
  if(meanR<5) return 0;
  const variance = radii.reduce((a,b)=>a+(b-meanR)**2,0)/radii.length;
  const cv = Math.sqrt(variance)/meanR; // coefficient of variation
  return Math.max(0, 1 - cv*3);
}

/** Check if stroke closes on itself (start ≈ end) */
function isClosed(pts: Point[]): boolean {
  if(pts.length<6) return false;
  return dist(pts[0], pts[pts.length-1]) < pathLen(pts)*0.25;
}

/** Count direction reversals — corners imply shapes */
function countCorners(pts: Point[], angleThreshold=45): number {
  if(pts.length<3) return 0;
  let corners=0;
  for(let i=1;i<pts.length-1;i++){
    const dx1=pts[i].x-pts[i-1].x, dy1=pts[i].y-pts[i-1].y;
    const dx2=pts[i+1].x-pts[i].x, dy2=pts[i+1].y-pts[i].y;
    const angle=Math.abs(Math.atan2(dy2,dx2)-Math.atan2(dy1,dx1))*180/Math.PI;
    const a=angle>180?360-angle:angle;
    if(a>angleThreshold) corners++;
  }
  return corners;
}

/** Check if stroke looks like an arrow (line with V at end) */
function arrowScore(pts: Point[]): number {
  // Arrow: mostly straight, but has a fork/hook at the end
  const s = straightness(pts);
  if(s>0.85) return 0; // too straight = line
  const mainLen = pathLen(pts);
  // Check if last 20% of stroke diverges (arrowhead)
  const splitIdx = Math.floor(pts.length*0.75);
  const shaftStraight = straightness(pts.slice(0, splitIdx));
  if(shaftStraight>0.8) return 0.5+shaftStraight*0.4;
  return 0;
}

// ─── Resample + $1 core ────────────────────────────────────────────────────

const NUM_POINTS = 64;
const SQUARE_SIZE = 250;
const ORIGIN: Point = {x:0,y:0};
const HALF_DIAGONAL = 0.5*Math.sqrt(2)*SQUARE_SIZE;
const ANGLE_RANGE = deg2rad(45);
const ANGLE_PRECISION = deg2rad(2);
const PHI = 0.5*(-1+Math.sqrt(5));

function resample(pts: Point[], n: number): Point[] {
  let I = pathLen(pts)/(n-1);
  if(I===0) return pts;
  let D=0;
  const out: Point[]=[pts[0]];
  for(let i=1;i<pts.length;i++){
    const d=dist(pts[i-1],pts[i]);
    if(D+d>=I){
      const qx=pts[i-1].x+((I-D)/d)*(pts[i].x-pts[i-1].x);
      const qy=pts[i-1].y+((I-D)/d)*(pts[i].y-pts[i-1].y);
      const q:Point={x:qx,y:qy};
      out.push(q);
      pts=[q,...pts.slice(i)]; i=0; D=0;
    } else { D+=d; }
  }
  while(out.length<n) out.push(pts[pts.length-1]);
  return out;
}

function indicativeAngle(pts: Point[]): Point[] {
  const c=centroid(pts);
  const r=Math.atan2(c.y-pts[0].y,c.x-pts[0].x);
  return rotateBy(pts,-r);
}
function rotateBy(pts:Point[],rad:number):Point[]{
  const c=centroid(pts),cos=Math.cos(rad),sin=Math.sin(rad);
  return pts.map(p=>({
    x:(p.x-c.x)*cos-(p.y-c.y)*sin+c.x,
    y:(p.x-c.x)*sin+(p.y-c.y)*cos+c.y,
  }));
}
function scaleTo(pts:Point[],size:number):Point[]{
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const p of pts){if(p.x<minX)minX=p.x;if(p.x>maxX)maxX=p.x;if(p.y<minY)minY=p.y;if(p.y>maxY)maxY=p.y;}
  const sc=size/Math.max(maxX-minX,maxY-minY,0.001);
  return pts.map(p=>({x:p.x*sc,y:p.y*sc}));
}
function translateTo(pts:Point[],pt:Point):Point[]{
  const c=centroid(pts);
  return pts.map(p=>({x:p.x+pt.x-c.x,y:p.y+pt.y-c.y}));
}
function pathDistance(a:Point[],b:Point[]):number{
  let d=0; for(let i=0;i<a.length;i++) d+=dist(a[i],b[i]); return d/a.length;
}
function distanceAtBestAngle(pts:Point[],T:Point[],a:number,b:number,thr:number):number{
  let x1=PHI*a+(1-PHI)*b, f1=pathDistance(rotateBy(pts,x1),T);
  let x2=(1-PHI)*a+PHI*b, f2=pathDistance(rotateBy(pts,x2),T);
  while(Math.abs(b-a)>thr){
    if(f1<f2){b=x2;x2=x1;f2=f1;x1=PHI*a+(1-PHI)*b;f1=pathDistance(rotateBy(pts,x1),T);}
    else{a=x1;x1=x2;f1=f2;x2=(1-PHI)*a+PHI*b;f2=pathDistance(rotateBy(pts,x2),T);}
  }
  return Math.min(f1,f2);
}

// ─── Templates ─────────────────────────────────────────────────────────────

function buildRect():Point[]{
  const p:Point[]=[];
  for(let x=0;x<=250;x+=5)p.push({x,y:0});
  for(let y=0;y<=250;y+=5)p.push({x:250,y});
  for(let x=250;x>=0;x-=5)p.push({x,y:250});
  for(let y=250;y>=0;y-=5)p.push({x:0,y});
  return p;
}
function buildCircle():Point[]{
  const p:Point[]=[];
  for(let i=0;i<=64;i++){const a=(i/64)*2*Math.PI;p.push({x:125+100*Math.cos(a),y:125+100*Math.sin(a)});}
  return p;
}
function buildTriangle():Point[]{
  const p:Point[]=[];
  // top → bottom-right → bottom-left → top (with interpolated points)
  const corners=[{x:125,y:0},{x:250,y:250},{x:0,y:250},{x:125,y:0}];
  for(let i=0;i<corners.length-1;i++){
    const a=corners[i],b=corners[i+1];
    for(let t=0;t<=1;t+=0.05)p.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  }
  return p;
}
function buildArrow():Point[]{
  const p:Point[]=[];
  // shaft
  for(let x=0;x<=180;x+=5)p.push({x,y:125});
  // arrowhead top
  for(let t=0;t<=1;t+=0.1)p.push({x:180+t*70,y:125-t*65});
  p.push({x:250,y:125});
  // arrowhead bottom
  for(let t=0;t<=1;t+=0.1)p.push({x:250-t*70,y:125+t*65});
  return p;
}
function buildLine():Point[]{
  const p:Point[]=[];
  for(let x=0;x<=250;x+=5)p.push({x,y:125});
  return p;
}

const TEMPLATES: {name:ShapeType; points:Point[]}[] = [
  {name:'rect',     points: buildRect()},
  {name:'circle',   points: buildCircle()},
  {name:'triangle', points: buildTriangle()},
  {name:'arrow',    points: buildArrow()},
  {name:'line',     points: buildLine()},
];

const processedTemplates = TEMPLATES.map(t=>{
  const r=resample(t.points, NUM_POINTS);
  const ang=indicativeAngle(r);
  const sc=scaleTo(ang, SQUARE_SIZE);
  const tr=translateTo(sc, ORIGIN);
  return {name:t.name, points:tr};
});

function dollarRecognize(pts:Point[]):{name:ShapeType;score:number}|null{
  const r=resample(pts,NUM_POINTS);
  const ang=indicativeAngle(r);
  const sc=scaleTo(ang,SQUARE_SIZE);
  const tr=translateTo(sc,ORIGIN);
  let best=-Infinity, bestName:ShapeType|null=null;
  for(const t of processedTemplates){
    const d=distanceAtBestAngle(tr,t.points,-ANGLE_RANGE,ANGLE_RANGE,ANGLE_PRECISION);
    const score=1-d/HALF_DIAGONAL;
    if(score>best){best=score;bestName=t.name;}
  }
  return bestName?{name:bestName,score:best}:null;
}

// ─── Main recognizer with geometry pre-pass ─────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.65;

export function recognizeShape(
  rawPoints: Array<[number,number,number]>
): ShapeRecognitionResult {
  const pts: Point[] = rawPoints.map(([x,y])=>({x,y}));
  if(pts.length<4) return {shape:null,confidence:0,boundingBox:getBounds(pts)};

  // Smooth points slightly before analysis
  const smoothed = smoothPoints(pts);

  const straight = straightness(smoothed);
  const circular = circularity(smoothed);
  const closed = isClosed(smoothed);
  const corners = countCorners(smoothed, 35);

  // ── Geometry-first classification ──────────────────────────────────────
  // 1. Straight line: very high straightness
  if(straight>0.92){
    return {shape:'line', confidence:straight, boundingBox:getBounds(pts)};
  }

  // 2. Circle/Ellipse: closed + high circularity
  if(closed && circular>0.78){
    const bb=getBounds(pts);
    const aspectRatio=Math.max(bb.width,bb.height)/Math.max(Math.min(bb.width,bb.height),1);
    const shape: ShapeType = aspectRatio>1.4?'ellipse':'circle';
    return {shape, confidence:circular, boundingBox:bb};
  }

  // 3. Rectangle: closed + ~4 corners
  if(closed && corners>=3 && corners<=6 && straight<0.92){
    const $1=dollarRecognize(smoothed);
    if($1?.name==='rect'&&$1.score>0.55){
      return {shape:'rect',confidence:Math.max($1.score,0.8),boundingBox:getBounds(pts)};
    }
    if(corners>=3)
      return {shape:'rect',confidence:0.75,boundingBox:getBounds(pts)};
  }

  // 4. Triangle: closed + ~3 corners
  if(closed && corners>=2 && corners<=4){
    return {shape:'triangle',confidence:0.78,boundingBox:getBounds(pts)};
  }

  // 5. Arrow: line-like shaft with hook at end
  const aScore=arrowScore(smoothed);
  if(aScore>0.7){
    return {shape:'arrow',confidence:aScore,boundingBox:getBounds(pts)};
  }

  // ── Fallback: $1 Recognizer ─────────────────────────────────────────────
  const result=dollarRecognize(smoothed);
  if(!result||result.score<CONFIDENCE_THRESHOLD){
    return {shape:null,confidence:result?.score??0,boundingBox:getBounds(pts)};
  }
  return {shape:result.name,confidence:result.score,boundingBox:getBounds(pts)};
}

/** Light moving-average smoothing before recognition */
function smoothPoints(pts: Point[], w=2): Point[] {
  if(pts.length<=w*2) return pts;
  return pts.map((p,i)=>{
    if(i<w||i>=pts.length-w) return p;
    let sx=0,sy=0;
    for(let j=-w;j<=w;j++){sx+=pts[i+j].x;sy+=pts[i+j].y;}
    return {x:sx/(w*2+1),y:sy/(w*2+1)};
  });
}

function getBounds(pts:Point[]): BoundingBox {
  if(!pts.length) return {x:0,y:0,width:10,height:10};
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const p of pts){
    if(p.x<minX)minX=p.x;if(p.y<minY)minY=p.y;
    if(p.x>maxX)maxX=p.x;if(p.y>maxY)maxY=p.y;
  }
  return {x:minX,y:minY,width:Math.max(maxX-minX,10),height:Math.max(maxY-minY,10)};
}

// Azure Ink Recognizer (optional cloud fallback)
export async function recognizeShapeCloud(
  strokes: Array<{points:Array<[number,number]>}>
): Promise<ShapeRecognitionResult|null> {
  const apiKey=process.env.NEXT_PUBLIC_AZURE_INK_KEY;
  if(!apiKey) return null;
  try{
    const res=await fetch('https://api.cognitive.microsoft.com/inkrecognizer/v1.0-preview/recognize',{
      method:'PUT',
      headers:{'Ocp-Apim-Subscription-Key':apiKey,'Content-Type':'application/json'},
      body:JSON.stringify({applicationType:'drawing',strokes:strokes.map((s,i)=>({id:i,points:s.points.map(([x,y])=>({x,y}))}))}),
    });
    if(!res.ok) return null;
    const data=await res.json();
    const drawing=data.recognitionUnits?.find((u:any)=>u.category==='inkDrawing');
    if(!drawing) return null;
    const shapeMap:Record<string,ShapeType>={rectangle:'rect',circle:'circle',ellipse:'ellipse',triangle:'triangle',drawing:'arrow'};
    const shape=shapeMap[drawing.recognizedShape?.toLowerCase()]??null;
    return shape?{shape,confidence:drawing.confidence??0.9,boundingBox:getBounds([])}:null;
  }catch{return null;}
}
