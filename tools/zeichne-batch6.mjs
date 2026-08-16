#!/usr/bin/env node
/**
 * Reproduzierbare Batch-6-Lieferung nach assets/AUFTRAG-TILESET.md.
 * Direkt im Zielraster, nur Projektpalette, ausschliesslich Alpha 0/255.
 * Unterkunftsblaetter: Spalten = Stufe 1..3; Zeile 1 = leer,
 * Zeile 2 = bewohnt.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const OUT = join(process.cwd(), "assets", "tilesets", "fellgrund-batch1");
mkdirSync(OUT, { recursive: true });
const C = Object.fromEntries(Object.entries({
  ink:"181016", deep:"0F2417", forest:"1F4028", moss:"284833",
  grass:"487646", grass2:"5D9153", grassHi:"79AC63", leaf:"4E9455", leafHi:"77BE6D",
  leaf2:"357045", leaf3:"265232", path:"B5A177", path2:"9A8862", earth:"8A6942",
  earth2:"6B4F33", earth3:"453017", woodHi:"D2A468", wood:"BC8F55",
  wood2:"96693C", wood3:"5E4227", roof:"C9765A", roof2:"A85440", roof3:"7A3A2B",
  stoneHi:"B7BCA7", stone:"98A08B", stone2:"66705A", stone3:"333B2E",
  waterHi:"93CFE0", water:"4E93A8", water2:"31708C", water3:"204C60",
  glow:"FFDC96", gold:"FFD05C", shine:"FFF2C0", berry:"F0885E",
}).map(([k,v])=>[k,[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4),16),255]]));

const img=(w,h)=>new PNG({width:w,height:h,colorType:6});
const put=(p,x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=p.width||y>=p.height)return;const i=(y*p.width+x)*4;p.data[i]=c[0];p.data[i+1]=c[1];p.data[i+2]=c[2];p.data[i+3]=c[3];};
const rect=(p,x,y,w,h,c)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(p,xx,yy,c);};
const line=(p,x0,y0,x1,y1,c,t=1)=>{x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1,e=dx+dy;for(;;){rect(p,x0-Math.floor(t/2),y0-Math.floor(t/2),t,t,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}};
const ellipse=(p,cx,cy,rx,ry,c)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if((x*x)/(rx*rx)+(y*y)/(ry*ry)<=1)put(p,cx+x,cy+y,c);};
const ring=(p,cx,cy,rx,ry,t,c)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const q=(x*x)/(rx*rx)+(y*y)/(ry*ry),irx=Math.max(1,rx-t),iry=Math.max(1,ry-t),qi=(x*x)/(irx*irx)+(y*y)/(iry*iry);if(q<=1&&qi>=1)put(p,cx+x,cy+y,c)}};
const poly=(p,points,c)=>{const ys=points.map(q=>q[1]),minY=Math.floor(Math.min(...ys)),maxY=Math.ceil(Math.max(...ys));for(let y=minY;y<=maxY;y++){const xs=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;i+=2)for(let x=Math.ceil(xs[i]);x<=Math.floor(xs[i+1]??xs[i]);x++)put(p,x,y,c);}};
const blit=(dst,src,dx,dy,sx=0,sy=0,w=src.width,h=src.height,flip=false)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const xx=flip?w-1-x:x,si=((sy+y)*src.width+(sx+xx))*4;if(src.data[si+3]===0)continue;put(dst,dx+x,dy+y,[src.data[si],src.data[si+1],src.data[si+2],255]);}};
const save=(name,p)=>writeFileSync(join(OUT,name),PNG.sync.write(p,{colorType:6,inputColorType:6}));
const load=(name)=>PNG.sync.read(readFileSync(join(OUT,name)));
const shadow=(p,cx,cy,rx,ry)=>ellipse(p,cx,cy,rx,ry,C.deep);
const sparkle=(p,x,y)=>{put(p,x,y,C.shine);put(p,x-1,y,C.gold);put(p,x+1,y,C.gold);put(p,x,y-1,C.gold);put(p,x,y+1,C.gold);};
const plank=(p,x,y,w,h=5)=>{rect(p,x,y,w,h,C.ink);rect(p,x+1,y+1,w-2,h-2,C.wood2);line(p,x+2,y+1,x+w-3,y+1,C.woodHi);};
const stick=(p,x0,y0,x1,y1)=>{line(p,x0,y0,x1,y1,C.ink,4);line(p,x0,y0-1,x1,y1-1,C.wood2,2);put(p,x0,y0-1,C.woodHi);};
const jar=(p,x,y,full=true)=>{rect(p,x+2,y,8,2,C.ink);rect(p,x+1,y+2,10,12,C.ink);rect(p,x+2,y+3,8,10,full?C.berry:C.waterHi);rect(p,x+3,y+3,2,2,C.shine);rect(p,x+2,y+10,8,3,full?C.roof2:C.water2);};

function lodge(stage,occupied){
  const p=img(96,80);
  for(let y=55;y<78;y++)for(let x=2;x<94;x++)put(p,x,y,(x+y)%11===0?C.waterHi:(y%7===0?C.water2:C.water));
  line(p,3,55,92,55,C.water3,2);shadow(p,49,73,43,4);
  ellipse(p,48,51,34+stage*3,20+stage,C.ink);ellipse(p,48,49,32+stage*3,18+stage,C.earth3);ellipse(p,49,47,28+stage*3,15+stage,C.earth2);
  const twigs=[[17,48,78,31],[19,57,76,38],[23,36,73,58],[29,29,68,62],[12,53,81,47],[24,63,71,28],[33,26,78,54]];
  for(let i=0;i<4+stage;i++)stick(p,...twigs[i]);
  for(let x=22;x<79;x+=9){ellipse(p,x,32+(x%3)*7,4,3,C.leaf3);put(p,x-1,31+(x%3)*7,C.leaf);}
  if(stage>=2){
    ellipse(p,48,52,12,14,C.ink);rect(p,36,52,25,15,C.ink);ellipse(p,48,54,8,11,C.deep);rect(p,40,54,17,14,C.deep);
    poly(p,[[39,62],[58,62],[66,76],[31,76]],C.ink);poly(p,[[41,63],[56,63],[62,73],[35,73]],C.wood2);
    for(let y=64;y<74;y+=3)line(p,35+(y-64)/2,y,61-(y-64)/2,y,C.wood3);line(p,41,63,56,63,C.woodHi);
  }
  if(stage>=3){
    rect(p,70,16,10,25,C.ink);rect(p,72,18,6,21,C.stone2);rect(p,69,15,13,5,C.ink);rect(p,71,16,9,3,C.stoneHi);
    ring(p,24,48,7,7,2,C.ink);ellipse(p,24,48,4,4,occupied?C.glow:C.water3);if(occupied)put(p,22,46,C.shine);
    for(let x=32;x<67;x+=7)ellipse(p,x,25+(x%4),5,3,C.moss);
  }
  if(occupied){
    if(stage>=3){ellipse(p,77,10,5,3,C.stone2);ellipse(p,82,6,4,3,C.stoneHi);}
    line(p,12,31,31,33,C.woodHi);rect(p,16,32,4,6,C.roof);rect(p,24,33,5,5,C.glow);
    if(stage>=2){rect(p,43,55,10,7,C.glow);put(p,45,56,C.shine);}else{ellipse(p,47,54,6,4,C.ink);ellipse(p,47,54,3,2,C.glow);put(p,46,53,C.shine);}
    for(let x=73;x<89;x+=5){put(p,x,69,C.grassHi);put(p,x+1,68,C.gold);}
  }
  return p;
}
function threeByTwo(name,w,h,draw){const s=img(w*3,h*2);for(let row=0;row<2;row++)for(let stage=1;stage<=3;stage++)blit(s,draw(stage,row===1),(stage-1)*w,row*h);save(name,s);}
threeByTwo("bau_biber_96x80.png",96,80,lodge);

function kobel(stage,occupied){
  const p=img(64,96);shadow(p,32,92,27,3);
  poly(p,[[23,94],[25,50],[13,40],[18,34],[29,43],[30,9],[38,9],[38,43],[54,31],[58,37],[43,52],[44,94]],C.ink);
  poly(p,[[27,92],[29,51],[18,40],[20,37],[32,47],[33,12],[36,12],[35,49],[53,35],[55,37],[40,53],[41,92]],C.wood3);
  line(p,31,18,31,85,C.wood2,2);line(p,39,55,39,88,C.wood2);line(p,28,68,37,62,C.woodHi);
  ellipse(p,32,43,20,14,C.ink);ellipse(p,32,42,18,12,C.earth2);
  for(let i=0;i<7;i++)stick(p,15+i*5,44+(i%2)*3,45-i*2,36+(i%3)*3);
  ellipse(p,32,45,8,7,C.deep);
  if(stage>=2){poly(p,[[10,35],[32,20],[55,35],[51,40],[32,28],[14,40]],C.ink);poly(p,[[14,34],[32,23],[51,34],[48,37],[32,29],[17,37]],C.roof2);for(let x=18;x<50;x+=7)line(p,x,34,x+8,28,C.roof3,2);}
  if(stage>=3){
    line(p,15,53,10,91,C.ink,3);line(p,22,54,18,91,C.ink,3);line(p,16,54,11,90,C.woodHi);line(p,21,55,17,90,C.wood2);for(let y=59;y<89;y+=7)line(p,13,y,20,y+1,C.woodHi,2);
    rect(p,42,39,10,11,C.ink);rect(p,44,41,6,7,occupied?C.glow:C.wood3);line(p,44,44,49,44,C.woodHi);
  }
  if(occupied){rect(p,27,41,10,8,C.glow);put(p,29,42,C.shine);line(p,9,30,24,34,C.woodHi);for(let x=12;x<24;x+=5)ellipse(p,x,33+(x%2),2,2,C.gold);ellipse(p,50,84,7,5,C.ink);ellipse(p,50,83,5,3,C.wood);for(let x=47;x<54;x+=3)put(p,x,81,C.gold);}
  return p;
}
threeByTwo("kobel_eichhorn_64x96.png",64,96,kobel);

function owlShelter(stage,occupied){
  const p=img(64,96);shadow(p,33,92,27,3);
  poly(p,[[12,91],[17,17],[27,6],[43,7],[50,20],[47,73],[61,82],[58,90],[39,81],[37,93]],C.ink);
  poly(p,[[16,89],[20,19],[29,10],[40,11],[46,22],[43,77],[58,84],[56,87],[38,79],[34,91]],C.wood3);
  line(p,23,18,21,84,C.wood2,2);line(p,40,18,38,78,C.wood2,2);line(p,20,55,39,30,C.woodHi);
  ellipse(p,31,42,13,18,C.ink);ellipse(p,31,43,9,14,C.deep);if(occupied){ellipse(p,31,50,6,4,C.glow);ellipse(p,31,49,3,2,C.woodHi);put(p,29,49,C.shine);}
  plank(p,5,77,55,7);line(p,12,83,52,83,C.woodHi,2);
  if(stage>=2){poly(p,[[5,26],[18,14],[18,67],[6,73]],C.ink);poly(p,[[8,28],[15,20],[15,64],[9,68]],C.path2);for(let y=28;y<67;y+=6)line(p,9,y,15,y-3,C.woodHi);}
  if(stage>=3){
    rect(p,40,50,20,22,C.ink);rect(p,42,52,16,18,C.wood2);rect(p,44,55,12,3,C.glow);line(p,44,61,55,61,C.woodHi);line(p,44,65,55,65,C.woodHi);
    line(p,49,14,49,34,C.ink,2);rect(p,44,28,11,15,C.ink);rect(p,46,30,7,10,occupied?C.glow:C.stone3);if(occupied)put(p,47,31,C.shine);
  }
  if(occupied){rect(p,49,55,5,4,C.shine);put(p,50,56,C.ink);for(let x=8;x<18;x+=4){put(p,x,86,C.leaf);put(p,x+1,85,C.gold);}if(stage<3){line(p,44,14,44,31,C.ink);rect(p,40,27,9,12,C.ink);rect(p,42,29,5,7,C.glow);}}
  return p;
}
threeByTwo("sitzstange_eule_64x96.png",64,96,owlShelter);

function fire(p,x,y,large=false){ellipse(p,x,y+5,large?10:7,3,C.ink);for(let i=-2;i<=2;i++)line(p,x-8,y+5+i,x+8,y+5-i,C.wood3,2);poly(p,[[x-5,y+3],[x,y-(large?13:9)],[x+6,y+3]],C.roof2);poly(p,[[x-2,y+2],[x,y-(large?8:5)],[x+3,y+2]],C.gold);put(p,x,y-1,C.shine);}
function pot(p,x,y,big=false){const w=big?24:19,h=big?14:12;rect(p,x-Math.floor(w/2)-2,y,w+4,4,C.ink);rect(p,x-Math.floor(w/2),y+3,w,h,C.ink);ellipse(p,x,y+h+2,Math.floor(w/2),Math.floor(h/2),C.ink);rect(p,x-Math.floor(w/2)+2,y+4,w-4,h-3,C.stone3);ellipse(p,x,y+h,Math.floor(w/2)-2,Math.floor(h/2)-2,C.stone2);line(p,x-Math.floor(w/2),y-2,x+Math.floor(w/2),y-2,C.stoneHi,2);}
function kitchen(stage){
  const p=img(96,80);shadow(p,48,76,43,3);
  rect(p,5,23,86,51,C.ink);rect(p,8,25,80,47,C.earth3);plank(p,9,27,77);plank(p,9,45,77);for(let x=15;x<83;x+=13)line(p,x,28,x,44,C.wood3);
  fire(p,43,61,stage===3);pot(p,43,46,stage===3);ellipse(p,75,63,10,7,C.ink);ellipse(p,75,61,8,5,C.wood);for(let x=70;x<82;x+=4)ellipse(p,x,58+(x%3),2,2,C.berry);
  jar(p,14,31,true);jar(p,27,31,true);rect(p,65,31,15,10,C.ink);rect(p,67,33,11,6,C.path);put(p,70,34,C.gold);
  if(stage>=2){poly(p,[[27,23],[34,7],[55,7],[62,23]],C.ink);poly(p,[[31,22],[37,10],[52,10],[58,22]],C.stone2);line(p,37,10,52,10,C.stoneHi);rect(p,41,0,9,10,C.ink);rect(p,43,0,5,9,C.stone3);jar(p,54,31,true);}
  if(stage>=3){poly(p,[[2,24],[10,13],[86,13],[94,24]],C.ink);poly(p,[[7,22],[13,16],[83,16],[89,22]],C.roof2);for(let x=13;x<85;x+=10)line(p,x,16,x+6,22,C.roof3);fire(p,70,65,true);pot(p,70,48,true);rect(p,7,55,16,17,C.ink);rect(p,9,57,12,13,C.wood2);line(p,9,61,20,61,C.woodHi);}
  return p;
}
{
  const s=img(96*3,80);for(let stage=1;stage<=3;stage++)blit(s,kitchen(stage),(stage-1)*96,0);save("kueche_96x80.png",s);
}

function jamCell(state){
  const p=img(32,32);shadow(p,16,28,13,2);
  if(state===0)jar(p,10,9,true);
  if(state===1){jar(p,3,11,true);jar(p,12,7,true);jar(p,21,11,true);}
  if(state===2){plank(p,1,6,30,5);plank(p,1,25,30,5);for(let x=2;x<27;x+=9)jar(p,x,10,true);for(let x=7;x<24;x+=9)jar(p,x,12,true);}
  sparkle(p,27,5+state*2);return p;
}
{
  const s=img(96,32);for(let i=0;i<3;i++)blit(s,jamCell(i),i*32,0);save("marmeladenglas_32.png",s);
}

function villageClutter(kind){
  const p=img(32,32);shadow(p,16,29,13,2);
  if(kind===0){
    line(p,4,7,4,28,C.wood3,2);line(p,27,7,27,28,C.wood3,2);line(p,4,9,27,11,C.woodHi);rect(p,7,10,6,9,C.roof);rect(p,17,11,7,8,C.glow);
  } else if(kind===1){
    for(let a=0;a<8;a++){const q=a*Math.PI/4;ellipse(p,16+Math.round(Math.cos(q)*10),23+Math.round(Math.sin(q)*4),3,2,C.stone);}fire(p,16,20,true);
  } else if(kind===2){
    plank(p,3,11,26,6);plank(p,2,20,28,6);line(p,7,24,5,30,C.ink,3);line(p,25,24,27,30,C.ink,3);line(p,7,13,7,21,C.woodHi);line(p,24,13,24,21,C.woodHi);
  } else if(kind===3){
    ring(p,16,22,12,7,3,C.ink);ring(p,16,21,9,5,3,C.stone);ellipse(p,16,21,6,3,C.water2);line(p,5,7,5,22,C.wood3,3);line(p,27,7,27,22,C.wood3,3);poly(p,[[3,8],[16,1],[29,8],[27,12],[16,6],[5,12]],C.roof2);
  } else if(kind===4){
    rect(p,3,17,26,12,C.ink);rect(p,5,19,22,8,C.wood2);line(p,5,19,27,19,C.woodHi);for(let x=7;x<27;x+=5){line(p,x,18,x,11,C.leaf);ellipse(p,x,10,2,2,(x%2)?C.berry:C.gold);}
  } else if(kind===5){
    ellipse(p,7,26,5,5,C.ink);ellipse(p,7,26,2,2,C.stone);poly(p,[[8,12],[25,13],[21,24],[9,22]],C.ink);poly(p,[[11,14],[22,15],[19,21],[10,20]],C.wood2);line(p,22,20,30,27,C.woodHi,2);
  } else if(kind===6){
    ellipse(p,16,8,9,4,C.ink);rect(p,7,8,18,18,C.ink);ellipse(p,16,26,9,4,C.ink);rect(p,9,9,14,16,C.wood2);ellipse(p,16,9,7,3,C.wood);ellipse(p,16,25,7,3,C.wood3);line(p,8,13,24,13,C.stone);line(p,8,22,24,22,C.stone);line(p,16,10,16,24,C.woodHi);
  } else {
    line(p,16,4,16,30,C.ink,4);line(p,16,5,16,29,C.wood2,2);poly(p,[[4,7],[26,7],[30,12],[26,17],[4,17]],C.ink);poly(p,[[7,9],[25,9],[27,12],[24,15],[7,15]],C.wood);line(p,9,10,23,10,C.woodHi);put(p,25,12,C.gold);
  }
  return p;
}
{
  const s=img(32*8,32);for(let i=0;i<8;i++)blit(s,villageClutter(i),i*32,0);save("dorfkram_32.png",s);
}

function preview(){
  const p=img(640,360);rect(p,0,0,640,360,C.grass);for(let y=0;y<360;y+=11)for(let x=(y%22);x<640;x+=23)put(p,x,y,C.grass2);
  for(let x=50;x<600;x++)for(let y=172-12*Math.sin(x/75);y<198-12*Math.sin(x/75);y++)put(p,x,y,((x+y)|0)%13===0?C.path2:C.path);
  ellipse(p,92,95,78,54,C.water3);ellipse(p,92,92,74,49,C.water);for(let x=25;x<155;x+=14)line(p,x,82+(x%3)*7,x+8,82+(x%3)*7,C.waterHi);
  const lodgeSheet=load("bau_biber_96x80.png"),kobelSheet=load("kobel_eichhorn_64x96.png"),owlSheet=load("sitzstange_eule_64x96.png"),kitchenSheet=load("kueche_96x80.png"),clutter=load("dorfkram_32.png");
  blit(p,lodgeSheet,44,55,96*2,80,96,80);blit(p,kobelSheet,224,34,64*2,96,64,96);blit(p,owlSheet,355,36,64*2,96,64,96);blit(p,kitchenSheet,486,55,96*2,0,96,80);
  for(let i=0;i<8;i++)blit(p,clutter,80+i*65,246+(i%2)*16,i*32,0,32,32);
  blit(p,jamCell(2),300,208);for(let x=0;x<640;x+=32){ellipse(p,x+8,335,18,16,C.forest);ellipse(p,x+21,342,20,18,C.deep);}save("batch6-vorschau.png",p);
}
preview();

const expected={
  "bau_biber_96x80.png":[288,160],"kobel_eichhorn_64x96.png":[192,192],
  "sitzstange_eule_64x96.png":[192,192],"kueche_96x80.png":[288,80],
  "marmeladenglas_32.png":[96,32],"dorfkram_32.png":[256,32],"batch6-vorschau.png":[640,360],
};
for(const [name,[w,h]] of Object.entries(expected)){
  const p=load(name);if(p.width!==w||p.height!==h)throw new Error(`${name}: ${p.width}x${p.height} statt ${w}x${h}`);
  let half=0;for(let i=3;i<p.data.length;i+=4)if(p.data[i]!==0&&p.data[i]!==255)half++;if(half)throw new Error(`${name}: ${half} halbtransparente Pixel`);
}
console.log(`Batch 6 gezeichnet: ${OUT}`);
console.log("Unterkuenfte: 3 Stufen x leer/bewohnt; Kueche, Marmelade und 8 Dorfdetails fertig.");
