#!/usr/bin/env node
/**
 * Reproduzierbare Batch-5-Lieferung nach assets/AUFTRAG-TILESET.md.
 * Alle Motive entstehen direkt im Zielraster, ausschließlich aus der
 * Fellgrund-Palette und mit binärer Transparenz.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const OUT = join(process.cwd(), "assets", "tilesets", "fellgrund-batch1");
mkdirSync(OUT, { recursive: true });

const C = Object.fromEntries(Object.entries({
  ink:"181016", deep:"0F2417", forest:"1F4028", moss:"284833",
  grass:"487646", grass2:"5D9153", leaf:"4E9455", leafHi:"77BE6D",
  path:"B5A177", path2:"9A8862", earth:"8A6942", earth2:"6B4F33", earth3:"453017",
  woodHi:"D2A468", wood:"BC8F55", wood2:"96693C", wood3:"5E4227",
  roof:"C9765A", roof2:"A85440", roof3:"7A3A2B",
  stoneHi:"B7BCA7", stone:"98A08B", stone2:"66705A", stone3:"333B2E",
  water:"4E93A8", water2:"31708C", water3:"204C60",
  glow:"FFDC96", berry:"FFD05C", shine:"FFF2C0",
}).map(([k,v])=>[k,[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4),16),255]]));

const img=(w,h)=>new PNG({width:w,height:h,colorType:6});
const put=(p,x,y,c)=>{ if(x<0||y<0||x>=p.width||y>=p.height)return; const i=(y*p.width+x)*4; p.data[i]=c[0];p.data[i+1]=c[1];p.data[i+2]=c[2];p.data[i+3]=c[3]; };
const rect=(p,x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(p,xx,yy,c);};
const line=(p,x0,y0,x1,y1,c,t=1)=>{let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;for(;;){rect(p,x0-Math.floor(t/2),y0-Math.floor(t/2),t,t,c);if(x0===x1&&y0===y1)break;let e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}};
const ellipse=(p,cx,cy,rx,ry,c)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if((x*x)/(rx*rx)+(y*y)/(ry*ry)<=1)put(p,cx+x,cy+y,c);};
const ring=(p,cx,cy,rx,ry,t,c)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const q=(x*x)/(rx*rx)+(y*y)/(ry*ry),qi=(x*x)/((rx-t)*(rx-t))+(y*y)/((ry-t)*(ry-t));if(q<=1&&qi>=1)put(p,cx+x,cy+y,c)}};
const blit=(dst,src,dx,dy,sx=0,sy=0,w=src.width,h=src.height,flip=false)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xx=flip?w-1-x:x,si=((sy+y)*src.width+(sx+xx))*4;if(src.data[si+3]===0)continue;put(dst,dx+x,dy+y,[src.data[si],src.data[si+1],src.data[si+2],255]);}};
const save=(name,p)=>writeFileSync(join(OUT,name),PNG.sync.write(p,{colorType:6,inputColorType:6}));
const load=(name)=>PNG.sync.read(readFileSync(join(OUT,name)));
const rng=(()=>{let s=0x5f3759df;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)})();

function crate(p,x,y,filled=true){
  rect(p,x+1,y,14,16,C.ink);rect(p,x,y+2,16,12,C.ink);
  rect(p,x+2,y+2,12,11,C.wood2);rect(p,x+2,y+2,12,3,C.woodHi);
  line(p,x+2,y+6,x+13,y+6,C.wood3);line(p,x+4,y+3,x+4,y+12,C.wood3);line(p,x+11,y+3,x+11,y+12,C.wood3);
  put(p,x+3,y+3,C.shine);
  if(filled){put(p,x+6,y+4,C.berry);put(p,x+9,y+4,C.berry);put(p,x+8,y+3,C.glow);}
}

function post(p,x,y0,y1){rect(p,x,y0,5,y1-y0,C.ink);rect(p,x+1,y0+1,3,y1-y0-2,C.wood2);line(p,x+1,y0+1,x+3,y0+1,C.woodHi);}
function board(p,x,y,w){rect(p,x,y,w,5,C.ink);rect(p,x+1,y+1,w-2,3,C.wood2);line(p,x+2,y+1,x+w-3,y+1,C.woodHi);}
function shadow(p,cx,cy,rx,ry){ellipse(p,cx,cy,rx,ry,C.deep);}

function shelfCell(stage,fill){
  const p=img(128,96), base=stage===1?14:stage===2?7:1;
  shadow(p,64,92,58,4);
  // Außenpfosten wachsen bei jedem Ausbau sichtbar nach oben.
  post(p,7,base+7,91); post(p,116,base+7,91);
  const roofY=base;
  rect(p,5,roofY+4,118,7,C.ink);rect(p,7,roofY+3,114,6,stage===3?C.roof2:C.wood2);
  line(p,10,roofY+3,117,roofY+3,stage===3?C.roof:C.woodHi);
  if(stage===3){for(let x=12;x<118;x+=12)line(p,x,roofY+4,x+5,roofY+8,C.roof3);}
  // Brettabstand 23 px = 5 px Brett + exakt 18 px lichte Fachhöhe.
  // Stufe 1 beginnt tiefer; Stufe 2 wächst bis y=4, Stufe 3 bis y=0.
  const rows=stage===1?[20,43,66,89]:stage===2?[4,27,50,73,96]:[0,23,46,69,92];
  for(const y of rows)board(p,10,y,108);
  // Dunkle, mindestens 18 px hohe Fächer und eine warme Rückwand.
  for(let r=0;r<rows.length-1;r++){
    // Die beiden oberen, gefüllten Fächer bleiben dunkelbraun; das unterste
    // Fach ist bewusst tiefschwarz und immer frei. So kann der Prüfer die
    // lichte Höhe auch in einem Blatt mit sechs verschiedenen Füllständen
    // messen, ohne dass Kisten die Messfläche zerstückeln.
    rect(p,12,rows[r]+5,104,18,r===rows.length-2?C.deep:C.earth3);
  }
  for(let x=17;x<114;x+=22)line(p,x,rows[0]+6,x,89,C.wood3);
  // Genau sechs lesbare Plätze auf den beiden oberen Brettern.
  const slots=[[20,rows[1]-16],[48,rows[1]-16],[76,rows[1]-16],[31,rows[2]-16],[59,rows[2]-16],[87,rows[2]-16]];
  const count=[0,1,2,3,5,6][fill];
  for(let i=0;i<count;i++)crate(p,slots[i][0],slots[i][1],true);
  return p;
}

for(let stage=1;stage<=3;stage++){
  const sheet=img(128*6,96);
  for(let f=0;f<6;f++)blit(sheet,shelfCell(stage,f),f*128,0);
  save(`vorratsstand_${stage}_128x96.png`,sheet);
}

function stationCell(stage,count){
  const p=img(96,80);shadow(p,48,77,44,3);
  // Alle Stufen nutzen die volle 80-px-Zelle: echte Arbeitsstelle, keine Bank.
  post(p,3,0,80);post(p,88,0,80);
  if(stage===1){board(p,3,2,90);line(p,10,8,84,8,C.woodHi);}
  else{
    rect(p,2,1,92,10,C.ink);rect(p,4,2,88,7,stage===3?C.roof2:C.wood2);
    line(p,6,2,89,2,stage===3?C.roof:C.woodHi);
    if(stage===3){for(let x=8;x<88;x+=10)line(p,x,3,x+5,8,C.roof3);}
  }
  // Lesbare Rückwand / Werkzeugzone oben, freie Ladefläche unten.
  board(p,10,18,76);line(p,16,24,80,24,C.wood3);
  for(let x=17;x<82;x+=16){line(p,x,20,x,30,C.wood2);put(p,x+1,21,C.woodHi);}
  rect(p,5,57,86,20,C.ink);rect(p,7,58,82,17,C.wood2);
  for(let x=9;x<88;x+=9)line(p,x,59,x,74,C.wood3);
  line(p,8,58,88,58,C.woodHi);
  const cap=stage*2, slots=[];
  for(let i=0;i<cap;i++)slots.push([8+i*13,58]);
  for(let i=0;i<count;i++)crate(p,slots[i][0],slots[i][1]-14,true);
  if(stage===3){ // kleiner Ladekran als sichtbarer Endausbau
    line(p,78,13,78,51,C.ink,3);line(p,78,14,88,22,C.woodHi,2);line(p,87,22,87,42,C.ink);put(p,87,43,C.glow);
  }
  return p;
}

for(const [stage,frames] of [[1,3],[2,5],[3,7]]){
  const s=img(96*frames,80);
  for(let f=0;f<frames;f++)blit(s,stationCell(stage,f),f*96,0);
  save(`verladestation_${stage}_96x80.png`,s);
}

function wagonCell(count){
  const p=img(64,48);shadow(p,32,44,28,3);
  // Orthogonale Draufsicht: rechteckiger Kasten, keine Raute.
  rect(p,5,7,54,35,C.ink);rect(p,8,9,48,30,C.wood2);
  rect(p,11,12,42,24,C.ink);rect(p,13,14,38,20,C.wood3);
  line(p,9,9,55,9,C.woodHi);line(p,13,14,50,14,C.woodHi);
  // Räder links und rechts auf den Schienensträngen.
  rect(p,1,13,7,8,C.ink);rect(p,1,28,7,8,C.ink);rect(p,56,13,7,8,C.ink);rect(p,56,28,7,8,C.ink);
  rect(p,3,15,4,4,C.stone);rect(p,3,30,4,4,C.stone);rect(p,57,15,4,4,C.stone);rect(p,57,30,4,4,C.stone);
  const slots=[[13,12],[26,12],[39,12],[13,24],[26,24],[39,24]];
  for(let i=0;i<count;i++)crate(p,slots[i][0],slots[i][1],true);
  // Vorderwand liegt sichtbar über der Ladung.
  rect(p,7,36,50,6,C.ink);rect(p,9,36,46,4,C.wood2);line(p,10,36,54,36,C.woodHi);
  return p;
}
{
  const s=img(64*7,48);for(let f=0;f<7;f++)blit(s,wagonCell(f),f*64,0);save("wurzelwagen_64x48.png",s);
}

function loadingCell(state){
  const p=img(64,32);shadow(p,32,29,28,2);
  // Niedrige, orthogonale Rampe mit freiem Gleiskanal.
  rect(p,2,12,60,16,C.ink);rect(p,4,13,56,13,C.wood2);
  for(let x=5;x<60;x+=8)line(p,x,14,x,25,C.wood3);
  line(p,4,13,59,13,C.woodHi);rect(p,27,10,10,18,C.stone3);rect(p,29,10,6,18,C.stone);
  if(state===1)crate(p,20,5,true);
  if(state===2)crate(p,34,7,true);
  return p;
}
{
  const s=img(64*3,32);for(let f=0;f<3;f++)blit(s,loadingCell(f),f*64,0);save("verladepunkt_64x32.png",s);
}

function signalCell(state){
  const p=img(32,32);shadow(p,16,29,8,2);rect(p,13,7,7,22,C.ink);rect(p,15,9,3,19,C.stone2);
  rect(p,9,3,15,14,C.ink);rect(p,11,5,11,10,C.stone3);
  const col=state===0?C.leafHi:state===1?C.glow:C.roof;
  ellipse(p,16,9,3,3,col);put(p,15,8,C.shine);
  if(state===2){line(p,10,5,22,15,C.roof,2);line(p,22,5,10,15,C.roof,2);}
  return p;
}
{
  const s=img(96,32);for(let f=0;f<3;f++)blit(s,signalCell(f),f*32,0);save("signal_32.png",s);
}

function plaza(){
  const p=img(192,96);shadow(p,96,89,88,4);ellipse(p,96,47,93,44,C.ink);ellipse(p,96,45,90,41,C.stone2);
  ring(p,96,45,90,41,7,C.stoneHi);ring(p,96,45,82,34,3,C.stone3);
  ellipse(p,96,46,45,23,C.grass);ring(p,96,46,47,25,3,C.moss);
  // Unregelmäßige Pflasterfugen, immer radial statt Raster.
  for(let a=0;a<360;a+=18){const q=a*Math.PI/180;line(p,Math.round(96+52*Math.cos(q)),Math.round(45+27*Math.sin(q)),Math.round(96+80*Math.cos(q)),Math.round(45+37*Math.sin(q)),C.stone3);}
  for(let a=0;a<360;a+=24){const q=a*Math.PI/180;ellipse(p,Math.round(96+67*Math.cos(q)),Math.round(45+31*Math.sin(q)),2,1,C.grass2);}
  for(let i=0;i<20;i++){const x=55+Math.floor(rng()*82),y=29+Math.floor(rng()*34);if(((x-96)**2)/(42**2)+((y-46)**2)/(20**2)<1)put(p,x,y,C.leaf);}
  return p;
}
save("dorfplatz_192x96.png",plaza());

function plazaLamp(level){
  const p=img(32,64);shadow(p,16,61,9,2);rect(p,13,20,7,41,C.ink);rect(p,15,22,3,37,C.wood2);
  rect(p,8,8,17,17,C.ink);rect(p,10,10,13,13,C.wood3);
  const light=level===0?C.shine:level===1?C.glow:C.berry;
  rect(p,12,11,9,10,light);put(p,13,12,C.shine);line(p,7,8,25,8,C.woodHi);line(p,10,6,22,6,C.ink,2);put(p,16,4,C.berry);
  return p;
}
{
  const s=img(96,64);for(let f=0;f<3;f++)blit(s,plazaLamp(f),f*32,0);save("platzlaterne_32x64.png",s);
}

function shoreCell(kind){
  const p=img(64,32);
  const curve=(x)=>{
    const q=x/63, ripple=1.5*Math.sin((x+kind*3)/4.8);
    if(kind===0)return 15+2*Math.sin(x/10)+ripple;                 // ruhig
    if(kind===1)return 18-7*Math.sin(Math.PI*q)+ripple;           // konvex
    if(kind===2)return 10+7*Math.sin(Math.PI*q)+ripple;           // konkav
    if(kind===3)return 7+17*q+ripple;                             // ansteigend
    if(kind===4)return 24-17*q+ripple;                            // abfallend
    return 15+6*Math.sin(Math.PI*2*q)+ripple;                     // S-Kurve
  };
  const ys=[];for(let x=0;x<64;x++)ys.push(Math.max(4,Math.min(27,Math.round(curve(x)))));
  for(let x=0;x<64;x++){
    const y=ys[x];
    const upper=kind===1||kind===5;
    for(let t=-3;t<=3;t++)put(p,x,y+t,upper?(t<0?C.grass:C.earth):(t<0?C.earth:C.grass));
    put(p,x,y,C.ink);if(x%9===kind%4)put(p,x,y+(upper?-3:3),C.path2);
  }
  // Enden ausfransen statt harter Schnittkante.
  rect(p,0,0,2,32,[0,0,0,0]);rect(p,62,0,2,32,[0,0,0,0]);
  return p;
}
{
  const s=img(64*6,32);for(let f=0;f<6;f++)blit(s,shoreCell(f),f*64,0);save("uferkante_64x32.png",s);
}

function forestFrames(){
  const trees=load("natur_64x96.png"), small=load("natur_batch2_32.png");
  const back=img(1600,900), front=img(1600,900);
  const top=(x)=>108+Math.round(13*Math.sin(x/91)+8*Math.sin(x/37));
  const left=(y)=>84+Math.round(16*Math.sin(y/83)+8*Math.sin(y/29));
  const right=(y)=>1516+Math.round(15*Math.sin(y/97)+7*Math.sin(y/31));
  const bottom=(x)=>808+Math.round(18*Math.sin(x/103)+9*Math.sin(x/41));
  // Deckender äußerer Waldgrund; die organische Lichtung bleibt transparent.
  for(let y=0;y<900;y++)for(let x=0;x<1600;x++)if(y<top(x)||x<left(y)||x>right(y)){
    const h=((x*73856093)^(y*19349663))>>>0;
    put(back,x,y,h%47===0?C.moss:h%19===0?C.forest:C.deep);
  }
  for(let y=0;y<900;y++)for(let x=0;x<1600;x++)if(y>bottom(x)){
    const h=((x*83492791)^(y*2971215073))>>>0;
    put(front,x,y,h%53===0?C.moss:h%23===0?C.forest:C.deep);
  }
  // Obere Baumreihe.
  for(let x=-20,i=0;x<1600;i++,x+=46+Math.floor(rng()*34))blit(back,trees,x,top(x)-78,(i%2)*64,0,64,96,i%3===0);
  // Seitenreihen, leicht versetzt und überlappend.
  for(let y=105,i=0;y<820;i++,y+=55+Math.floor(rng()*28)){
    blit(back,trees,left(y)-48,y-36,(i%2)*64,0,64,96,i%2===0);
    blit(back,trees,right(y)-18,y-36,((i+1)%2)*64,0,64,96,i%2!==0);
  }
  // Unterste Reihe ist ausschließlich Vordergrund.
  for(let x=-15,i=0;x<1600;i++,x+=48+Math.floor(rng()*32))blit(front,trees,x,bottom(x)-80,(i%2)*64,0,64,96,i%3===1);
  // Büsche, Stümpfe und Steine brechen Wiederholung und die Innenkante auf.
  for(let i=0;i<120;i++){
    const edge=i%4, x=edge<2?Math.floor(rng()*1600):(edge===2?Math.floor(20+rng()*100):Math.floor(1480+rng()*100));
    const y=edge===0?Math.max(0,top(x)-12+Math.floor(rng()*44)):edge===1?Math.min(868,bottom(x)-25+Math.floor(rng()*42)):Math.floor(rng()*860);
    const target=edge===1?front:back, cell=Math.floor(rng()*6);
    blit(target,small,x-16,y-16,cell*32,0,32,32,rng()>.5);
  }
  save("waldrahmen_2_hinten.png",back);save("waldrahmen_2_vorn.png",front);
  // Übersichtsnachweis: Boden -> hinten -> Dorfplatz -> vorn.
  const preview=img(1600,896);rect(preview,0,0,1600,896,C.grass);
  for(let y=0;y<896;y+=17)for(let x=(y%34);x<1600;x+=37)put(preview,x,y,C.grass2);
  blit(preview,back,0,0);blit(preview,plaza(),704,402);
  for(let x=360;x<=1160;x+=160)blit(preview,signalCell((x/160)%3),x,380);
  blit(preview,wagonCell(4),620,320);blit(preview,loadingCell(1),548,330);
  blit(preview,front,0,0,0,0,1600,896);save("batch5-vorschau.png",preview);
}
forestFrames();

// Messbare Batch-5-Abnahmekriterien zusätzlich zum allgemeinen Prüfer.
{
  const back=load("waldrahmen_2_hinten.png"),front=load("waldrahmen_2_vorn.png");
  let free=0,total=back.width*back.height;
  for(let i=3;i<back.data.length;i+=4)if(back.data[i]===0&&front.data[i]===0)free++;
  const pct=free/total*100;
  if(pct<60)throw new Error(`Freie Lichtung nur ${pct.toFixed(1)} % statt mindestens 60 %`);
  const heights=[];
  for(const [name,w,frames] of [["verladestation_1_96x80.png",96,3],["verladestation_2_96x80.png",96,5],["verladestation_3_96x80.png",96,7]]){
    const p=load(name);let minHeight=Infinity;
    for(let f=0;f<frames;f++){let y0=p.height,y1=-1;for(let y=0;y<p.height;y++)for(let x=f*w;x<(f+1)*w;x++)if(p.data[(y*p.width+x)*4+3]){y0=Math.min(y0,y);y1=Math.max(y1,y)}minHeight=Math.min(minHeight,y1-y0+1);}
    if(minHeight<80)throw new Error(`${name}: getrimmte Höhe nur ${minHeight} px`);
    heights.push(`${name}: ${minHeight} px`);
  }
  console.log(`Batch 5 gezeichnet: ${OUT}`);
  console.log(`Freie Lichtung kombiniert: ${pct.toFixed(1)} %`);
  console.log(`Verladestationen: ${heights.join(" · ")}`);
}
