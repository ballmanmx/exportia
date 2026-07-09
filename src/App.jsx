import { useState, useEffect } from "react";

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#080B10", surface: "#0F1420", surfaceHigh: "#161C2D",
  border: "#1E2535", borderMid: "#28334A",
  green: "#22C55E", greenDim: "#22C55E18", greenBorder: "#22C55E35",
  amber: "#F59E0B", amberDim: "#F59E0B18", amberBorder: "#F59E0B35",
  blue: "#3B82F6", blueDim: "#3B82F618", blueBorder: "#3B82F635",
  red: "#EF4444", redDim: "#EF444418",
  tx1: "#F0F4FF", tx2: "#8B95B0", tx3: "#454E65",
};

const KEY_USER   = "exportia:user";
const KEY_PRICES = "exportia:prices";

// Storage sync — directo a localStorage, sin async
function lsGet(key) {
  try { const v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch { return null; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key,JSON.stringify(value)); } catch {}
}
function lsDel(key) {
  try { localStorage.removeItem(key); } catch {}
}

// Mantener compatibilidad con llamadas async existentes
async function storageGet(key) { return lsGet(key); }
async function storageSet(key, value) { lsSet(key,value); return true; }

const SEED_PRICES = [
  { id:1,  user:"David G.",        role:"productor", region:"Ciudad Guzmán, Jalisco", pais:"México", precio:3.50, tipo:"campo", ts:Date.now()-1000*60*18,  kg:2352, confiabilidad:96, reportes:18 },
  { id:2,  user:"Ramón H.",        role:"productor", region:"Tancítaro, Michoacán",   pais:"México", precio:4.10, tipo:"campo", ts:Date.now()-1000*60*45,  kg:5000, confiabilidad:88, reportes:9  },
  { id:3,  user:"Freshela LLC",    role:"minorista", region:"Dubai, EAU",             pais:"EAU",    precio:5.50, tipo:"venta", ts:Date.now()-1000*60*90,  kg:1200, confiabilidad:91, reportes:22 },
  { id:4,  user:"Al Aweer Market", role:"minorista", region:"Dubai, EAU",             pais:"EAU",    precio:5.20, tipo:"venta", ts:Date.now()-1000*60*130, kg:800,  confiabilidad:85, reportes:7  },
  { id:5,  user:"Carlos M.",       role:"productor", region:"Zapotlán, Jalisco",      pais:"México", precio:3.30, tipo:"campo", ts:Date.now()-1000*60*200, kg:3000, confiabilidad:79, reportes:5  },
  { id:6,  user:"Hamid K.",        role:"minorista", region:"Dubai, EAU",             pais:"EAU",    precio:5.80, tipo:"venta", ts:Date.now()-1000*60*260, kg:900,  confiabilidad:83, reportes:4  },
  { id:7,  user:"Pedro A.",        role:"productor", region:"Uruapan, Michoacán",     pais:"México", precio:4.30, tipo:"campo", ts:Date.now()-1000*60*320, kg:7000, confiabilidad:82, reportes:11 },
  { id:8,  user:"Gulf Fresh",      role:"minorista", region:"Abu Dhabi, EAU",         pais:"EAU",    precio:5.00, tipo:"venta", ts:Date.now()-1000*60*400, kg:600,  confiabilidad:87, reportes:6  },
  { id:9,  user:"Jorge L.",        role:"productor", region:"Zapotiltic, Jalisco",    pais:"México", precio:3.45, tipo:"campo", ts:Date.now()-1000*60*500, kg:1800, confiabilidad:75, reportes:3  },
  { id:10, user:"Green Souq",      role:"minorista", region:"Dubai, EAU",             pais:"EAU",    precio:5.40, tipo:"venta", ts:Date.now()-1000*60*600, kg:500,  confiabilidad:80, reportes:5  },
];

const MERCADOS = [
  { id:"mex", nombre:"México",  pais:"México", bandera:"🇲🇽", precioHoy:3.64, tendencia:[2.1,2.0,1.9,2.1,2.3,2.5,2.8,2.6,2.7,3.0,3.2,3.5,3.4,3.64], flete:0,    ruta:"Campo",   competencia:"—",           temporada:"⚠ Escasez jun–sep", tipo:"campo" },
  { id:"usa", nombre:"USA",     pais:"USA",    bandera:"🇺🇸", precioHoy:4.20, tendencia:[3.5,3.4,3.3,3.5,3.7,3.9,4.1,3.9,4.0,4.1,4.2,4.3,4.2,4.20], flete:0.35, ruta:"GDL→LAX", competencia:"Perú, Chile", temporada:"🟢 Todo el año",    tipo:"fob"   },
  { id:"dxb", nombre:"Dubai",   pais:"EAU",    bandera:"🇦🇪", precioHoy:5.35, tendencia:[4.2,4.0,3.9,4.1,4.3,4.5,4.8,4.6,4.7,5.0,5.2,5.5,5.3,5.35], flete:1.72, ruta:"GDL→DXB", competencia:"Kenia, Perú", temporada:"⚠ Evaluar jun–sep", tipo:"venta" },
];

const ESTACIONAL = [
  {mes:"E",precio:2.4,escasez:false},{mes:"F",precio:2.8,escasez:false},
  {mes:"M",precio:3.2,escasez:false},{mes:"A",precio:4.1,escasez:true},
  {mes:"M",precio:4.5,escasez:true}, {mes:"J",precio:4.8,escasez:true},
  {mes:"J",precio:3.9,escasez:false},{mes:"A",precio:2.9,escasez:false},
  {mes:"S",precio:2.3,escasez:false},{mes:"O",precio:1.9,escasez:false},
  {mes:"N",precio:2.0,escasez:false},{mes:"D",precio:2.2,escasez:false},
];

function relTime(ts){ const m=Math.floor((Date.now()-ts)/60000); if(m<1)return"ahora"; if(m<60)return`hace ${m}m`; const h=Math.floor(m/60); if(h<24)return`hace ${h}h`; return`hace ${Math.floor(h/24)}d`; }
function avg(arr){ return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0; }
function isActive(ts){ return(Date.now()-ts)<7*24*60*60*1000; }
function priceLabel(ts){ return isActive(ts)?"Hoy":"Referencia"; }

function Chip({color="blue",children}){
  const m={green:[C.greenDim,C.greenBorder,C.green],amber:[C.amberDim,C.amberBorder,C.amber],blue:[C.blueDim,C.blueBorder,C.blue],red:[C.redDim,"#EF444435",C.red]};
  const[bg,bd,tx]=m[color]||m.blue;
  return<span style={{background:bg,border:`1px solid ${bd}`,color:tx,borderRadius:5,padding:"2px 7px",fontSize:10.5,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>;
}
function Card({children,style,onClick}){ return<div onClick={onClick} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,cursor:onClick?"pointer":"default",...style}}>{children}</div>; }
function Lbl({children}){ return<div style={{fontSize:10,color:C.tx3,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{children}</div>; }
function Val({children,color,size=20}){ return<div style={{fontSize:size,fontWeight:800,color:color||C.tx1,lineHeight:1.15}}>{children}</div>; }
function Hr(){ return<div style={{height:1,background:C.border,margin:"14px 0"}}/>; }
function Avatar({name,role}){
  const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const color=role==="productor"?C.green:C.blue;
  return<div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:role==="productor"?C.greenDim:C.blueDim,border:`1.5px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color}}>{initials}</div>;
}
function BackBtn({onBack}){ return<button onClick={onBack} style={{background:"none",border:"none",color:C.tx2,cursor:"pointer",fontSize:13,padding:0,marginBottom:18}}>← Atrás</button>; }
function Spinner(){ return<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><div style={{fontSize:32}}>🥑</div><div style={{fontSize:13,color:C.tx3}}>Cargando...</div></div>; }

function Sparkline({data,color=C.green,height=60,blur=false}){
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1,w=200,h=height;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*(h-8)-4}`).join(" ");
  const ly=h-((data[data.length-1]-min)/range)*(h-8)-4;
  return<div style={{position:"relative"}}><svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height,filter:blur?"blur(4px)":"none"}} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/><circle cx={w} cy={ly} r="3.5" fill={color}/></svg>{blur&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:18}}>🔒</span></div>}</div>;
}

function BarChart({data,height=90,labelKey="mes",valueKey="precio",colorFn}){
  const max=Math.max(...data.map(d=>d[valueKey]));
  return<div style={{display:"flex",alignItems:"flex-end",gap:4,height,padding:"0 2px"}}>{data.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}><div style={{width:"100%",height:`${(d[valueKey]/max)*88+6}%`,borderRadius:"3px 3px 0 0",background:colorFn?colorFn(d,i):C.border}}/><div style={{fontSize:7,color:C.tx3,marginTop:3}}>{d[labelKey]}</div></div>)}</div>;
}

function PaywallBanner({onPublish}){
  return<div style={{margin:"0 0 14px",padding:"12px 16px",background:"linear-gradient(135deg,#22C55E18,#3B82F618)",border:`1px solid ${C.greenBorder}`,borderRadius:12,display:"flex",alignItems:"center",gap:12}}><div style={{fontSize:24,flexShrink:0}}>🔒</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:800,color:C.tx1,marginBottom:2}}>Publica tu precio para ver el mercado</div><div style={{fontSize:11,color:C.tx2}}>Los precios están ocultos hasta que contribuyas.</div></div><button onClick={onPublish} style={{flexShrink:0,padding:"8px 14px",borderRadius:9,background:C.green,color:C.bg,fontSize:12,fontWeight:800,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>Publicar →</button></div>;
}

function BottomNav({screen,setScreen}){
  const items=[{id:"feed",label:"Mercado",icon:"◈"},{id:"registrar",label:"Publicar",icon:"＋",special:true},{id:"dashboard",label:"Mi perfil",icon:"◉"}];
  return<div style={{display:"flex",background:C.surface,borderTop:`1px solid ${C.border}`,position:"sticky",bottom:0,zIndex:10}}>{items.map(i=><button key={i.id} onClick={()=>setScreen(i.id)} style={{flex:1,padding:i.special?"10px 4px 8px":"12px 4px 10px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:`2px solid ${screen===i.id?(i.special?C.green:C.blue):"transparent"}`}}>{i.special?<div style={{width:36,height:36,borderRadius:10,marginTop:-18,background:screen==="registrar"?C.green:C.greenDim,border:`1.5px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:screen==="registrar"?C.bg:C.green,boxShadow:"0 4px 16px #22C55E44"}}>+</div>:<span style={{fontSize:17,color:screen===i.id?C.blue:C.tx3}}>{i.icon}</span>}<span style={{fontSize:10,fontWeight:700,color:screen===i.id?(i.special?C.green:C.blue):C.tx3}}>{i.label}</span></button>)}</div>;
}

function Onboarding({onComplete}){
  const [step,setStep]=useState(0);
  const [role,setRole]=useState(null);
  const [pais,setPais]=useState("México");
  const [region,setRegion]=useState("");
  const [nombre,setNombre]=useState("");
  const [saving,setSaving]=useState(false);
  const regiones={"México":["Ciudad Guzmán, Jalisco","Zapotlán, Jalisco","Zapotiltic, Jalisco","Uruapan, Michoacán","Tancítaro, Michoacán","Otra región (México)"],"EAU":["Dubai, UAE","Abu Dhabi, UAE","Sharjah, UAE"],"USA":["Los Angeles, CA","Miami, FL","Chicago, IL","Nueva York, NY"],"Otro":["Otra región"]};
  function finish(){ if(!nombre||!region)return; setSaving(true); const u={nombre,role,region,pais}; onComplete(u); }
  if(step===0)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{width:64,height:64,borderRadius:18,background:C.greenDim,border:`1.5px solid ${C.greenBorder}`,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🥑</div>
        <div style={{fontSize:26,fontWeight:900,color:C.tx1}}>Export<span style={{color:C.green}}>IA</span></div>
        <div style={{fontSize:13,color:C.tx2,marginTop:6}}>Inteligencia de precios · Aguacate Hass</div>
        <div style={{marginTop:16,padding:"10px 16px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:10,fontSize:12,color:C.amber}}>🔒 Publica tu precio para acceder al mercado</div>
      </div>
      <div style={{fontSize:18,fontWeight:800,color:C.tx1,textAlign:"center",marginBottom:6}}>¿Cuál es tu rol?</div>
      <div style={{fontSize:13,color:C.tx2,textAlign:"center",marginBottom:24}}>Define qué publicas y qué ves</div>
      {[{id:"productor",icon:"🌱",title:"Soy Productor",sub:"Precio de campo · México",dim:C.greenDim,bd:C.greenBorder},{id:"minorista",icon:"🏪",title:"Soy Minorista / Importador",sub:"Precio de venta · Dubai / USA",dim:C.blueDim,bd:C.blueBorder}].map(r=>(
        <button key={r.id} onClick={()=>{setRole(r.id);setStep(1);}} style={{width:"100%",marginBottom:12,padding:"20px",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:16,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16}} onMouseEnter={e=>{e.currentTarget.style.borderColor=r.bd;e.currentTarget.style.background=r.dim;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
          <div style={{fontSize:32}}>{r.icon}</div>
          <div><div style={{fontSize:16,fontWeight:800,color:C.tx1}}>{r.title}</div><div style={{fontSize:12,color:C.tx2,marginTop:3}}>{r.sub}</div></div>
        </button>
      ))}
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:C.bg,padding:24,paddingTop:48}}>
      <BackBtn onBack={()=>setStep(0)}/>
      <div style={{fontSize:20,fontWeight:800,color:C.tx1,marginBottom:4}}>Tu perfil</div>
      <div style={{fontSize:13,color:C.tx2,marginBottom:24}}>Así te verán otros en el mercado</div>
      <div style={{marginBottom:16}}><Lbl>Nombre o empresa</Lbl><input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. David García / Gulf Fresh LLC" style={{width:"100%",background:C.surfaceHigh,border:`1px solid ${C.borderMid}`,borderRadius:10,color:C.tx1,fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/></div>
      <div style={{marginBottom:16}}><Lbl>País</Lbl><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{Object.keys(regiones).map(p=><button key={p} onClick={()=>{setPais(p);setRegion("");}} style={{padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",background:pais===p?C.blueDim:C.surface,border:`1.5px solid ${pais===p?C.blue:C.border}`,color:pais===p?C.blue:C.tx2}}>{p}</button>)}</div></div>
      <div style={{marginBottom:28}}><Lbl>Región</Lbl><div style={{display:"flex",flexDirection:"column",gap:8}}>{regiones[pais].map(r=><button key={r} onClick={()=>setRegion(r)} style={{padding:"11px 14px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",background:region===r?C.greenDim:C.surface,border:`1.5px solid ${region===r?C.green:C.border}`,color:region===r?C.green:C.tx2}}>{r}</button>)}</div></div>
      <button onClick={finish} disabled={!nombre||!region||saving} style={{width:"100%",padding:"16px 0",borderRadius:12,fontSize:15,fontWeight:800,background:nombre&&region?C.green:C.border,color:nombre&&region?C.bg:C.tx3,border:"none",cursor:nombre&&region?"pointer":"default",boxShadow:nombre&&region?"0 4px 20px #22C55E33":"none"}}>
        {saving?"Guardando...":"Continuar → Publicar mi precio"}
      </button>
    </div>
  );
}

function PerfilPublico({entry,onBack,allPrices,unlocked}){
  const susPrices=allPrices.filter(p=>p.user===entry.user).sort((a,b)=>b.ts-a.ts);
  const isP=entry.role==="productor";
  const avgM=avg(allPrices.filter(p=>p.role===entry.role).map(p=>p.precio));
  const diff=entry.precio-avgM;
  return(
    <div style={{padding:"16px 16px 0"}}>
      <BackBtn onBack={onBack}/>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,textAlign:"center"}}>
        <div style={{width:64,height:64,borderRadius:20,background:isP?C.greenDim:C.blueDim,border:`2px solid ${isP?C.greenBorder:C.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:isP?C.green:C.blue,marginBottom:12}}>{entry.user.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
        <Val size={20}>{entry.user}</Val>
        <div style={{fontSize:12,color:C.tx2,marginTop:4}}>{entry.region}</div>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}><Chip color={isP?"green":"blue"}>{isP?"Productor":"Minorista"}</Chip><span style={{fontSize:12,color:C.tx3}}>🔥 {entry.reportes} reportes</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <Card style={{padding:12}}><Lbl>Precio hoy</Lbl>{unlocked?<Val size={17} color={isP?C.green:C.blue}>${entry.precio.toFixed(2)}/kg</Val>:<div style={{fontSize:17,fontWeight:800,color:C.tx3,filter:"blur(5px)"}}>$-.--/kg</div>}</Card>
        <Card style={{padding:12}}><Lbl>Confiabilidad</Lbl><Val size={17} color={entry.confiabilidad>=90?C.green:C.amber}>{entry.confiabilidad}%</Val></Card>
        <Card style={{padding:12}}><Lbl>vs promedio</Lbl>{unlocked?<Val size={17} color={diff>0?C.amber:C.green}>{diff>=0?"+":""}{diff.toFixed(2)} USD</Val>:<div style={{fontSize:17,fontWeight:800,color:C.tx3,filter:"blur(5px)"}}>+-.--</div>}</Card>
        <Card style={{padding:12}}><Lbl>Volumen</Lbl><Val size={17}>{(entry.kg/1000).toFixed(1)}t</Val></Card>
      </div>
      <Card style={{marginBottom:14}}>
        <Lbl>Últimos precios</Lbl>
        <div style={{marginTop:10}}>{susPrices.slice(0,5).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?`1px solid ${C.border}`:"none",alignItems:"center"}}><div><span style={{fontSize:12,color:C.tx2}}>{relTime(p.ts)}</span><span style={{marginLeft:8,fontSize:10,color:isActive(p.ts)?C.green:C.tx3}}>{priceLabel(p.ts)}</span></div>{unlocked?<span style={{fontSize:14,fontWeight:800,color:isP?C.green:C.blue}}>${p.precio.toFixed(2)}/kg</span>:<span style={{fontSize:14,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>$-.--</span>}</div>)}</div>
        {!unlocked&&<div style={{marginTop:12,padding:"10px 12px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:8,fontSize:12,color:C.amber,textAlign:"center"}}>🔒 Publica tu precio para ver los números</div>}
      </Card>
      <Card style={{marginBottom:16,borderColor:isP?C.greenBorder:C.blueBorder,background:isP?C.greenDim:C.blueDim}}>
        <div style={{fontSize:13,color:C.tx1,fontWeight:700,marginBottom:4}}>{isP?"¿Te interesa este productor?":"¿Quieres vender aquí?"}</div>
        <div style={{fontSize:12,color:C.tx2}}>{isP?`${entry.user} tiene ${(entry.kg/1000).toFixed(1)}t en ${entry.region}.`:`${entry.user} compra en ${entry.region}.`}</div>
      </Card>
    </div>
  );
}

function AnaliticasMercado({mercado,onBack,campoAvg,unlocked,onPublish}){
  const [tab,setTab]=useState("tendencia");
  const spread=mercado.precioHoy-campoAvg;
  const margen=campoAvg>0?((mercado.precioHoy-campoAvg-mercado.flete)/mercado.precioHoy*100):null;
  const trend=mercado.tendencia;
  const pctChange=((trend[trend.length-1]-trend[0])/trend[0]*100);
  return(
    <div style={{padding:"16px 16px 0"}}>
      <BackBtn onBack={onBack}/>
      {!unlocked&&<PaywallBanner onPublish={onPublish}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><div style={{fontSize:11,color:C.tx3,marginBottom:4}}>{mercado.bandera} {mercado.pais} · {mercado.ruta}</div><Val size={22}>{mercado.nombre}</Val><div style={{fontSize:12,color:C.tx2,marginTop:4}}>{mercado.competencia!=="—"?mercado.competencia:"Mercado local"}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:26,fontWeight:900,color:mercado.tipo==="campo"?C.green:C.blue,lineHeight:1.15}}>{unlocked?`$${mercado.precioHoy.toFixed(2)}`:<span style={{filter:"blur(6px)"}}>$-.--</span>}</div><div style={{fontSize:11,color:pctChange>=0?C.green:C.red,fontWeight:700}}>{pctChange>=0?"↑":"↓"}{Math.abs(pctChange).toFixed(1)}% vs 14 sem.</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"Campo avg",val:campoAvg>0?`$${campoAvg.toFixed(2)}`:"—",color:C.green,lock:false},{label:"Flete",val:`$${mercado.flete.toFixed(2)}`,color:C.amber,lock:false},{label:"Margen est.",val:margen!==null?`${margen.toFixed(1)}%`:"—",color:margen&&margen>=20?C.green:margen&&margen>=10?C.amber:C.red,lock:!unlocked}].map(s=><Card key={s.label} style={{padding:10}}><Lbl>{s.label}</Lbl>{s.lock?<div style={{fontSize:15,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>--.-%</div>:<Val size={15} color={s.color}>{s.val}</Val>}</Card>)}
      </div>
      <div style={{marginBottom:14,padding:"10px 14px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:10,fontSize:12,color:C.amber,fontWeight:600}}>{mercado.temporada}</div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>{[{id:"tendencia",label:"Tendencia"},{id:"estacional",label:"Estacional"},{id:"comparativo",label:"vs campo"}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:tab===t.id?C.surfaceHigh:"transparent",border:`1px solid ${tab===t.id?C.borderMid:"transparent"}`,color:tab===t.id?C.tx1:C.tx3}}>{t.label}</button>)}</div>
      {tab==="tendencia"&&<Card style={{marginBottom:14}}><Lbl>Precio · últimas 14 semanas</Lbl><div style={{marginTop:10}}><Sparkline data={trend} color={mercado.tipo==="campo"?C.green:C.blue} height={80} blur={!unlocked}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:10,color:C.tx3}}>hace 14 sem.</span><span style={{fontSize:10,color:C.tx3}}>hoy</span></div><Hr/><div style={{display:"flex",justifyContent:"space-between"}}><div><Lbl>Mínimo</Lbl><div style={{fontSize:14,fontWeight:800,color:C.red}}>{unlocked?`$${Math.min(...trend).toFixed(2)}`:<span style={{filter:"blur(4px)"}}>$-.--</span>}</div></div><div><Lbl>Máximo</Lbl><div style={{fontSize:14,fontWeight:800,color:C.green}}>{unlocked?`$${Math.max(...trend).toFixed(2)}`:<span style={{filter:"blur(4px)"}}>$-.--</span>}</div></div><div><Lbl>Hoy</Lbl><div style={{fontSize:14,fontWeight:800,color:C.blue}}>{unlocked?`$${trend[trend.length-1].toFixed(2)}`:<span style={{filter:"blur(4px)"}}>$-.--</span>}</div></div></div></Card>}
      {tab==="estacional"&&<Card style={{marginBottom:14}}><Lbl>Patrón precio campo · 12 meses</Lbl><div style={{marginTop:12}}><BarChart data={ESTACIONAL} labelKey="mes" valueKey="precio" height={90} colorFn={d=>d.escasez?C.amber:C.border}/></div><div style={{marginTop:10,display:"flex",gap:14}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:C.amber}}/><span style={{fontSize:11,color:C.tx2}}>Escasez</span></div><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:C.border}}/><span style={{fontSize:11,color:C.tx2}}>Normal</span></div></div><Hr/><div style={{fontSize:12,color:C.tx2}}>Ventana óptima para <strong style={{color:C.tx1}}>{mercado.nombre}</strong>: {mercado.temporada.replace(/[🟢⚠🟡]/g,"").trim()}</div></Card>}
      {tab==="comparativo"&&<Card style={{marginBottom:14}}><Lbl>Desglose campo → {mercado.nombre}</Lbl><div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>{[{label:"Precio campo (avg)",val:campoAvg,color:C.green,lock:false},{label:`Flete ${mercado.ruta}`,val:mercado.flete,color:C.amber,lock:false},{label:"Spread / margen",val:Math.max(0,spread-mercado.flete),color:C.blue,lock:!unlocked}].map(row=><div key={row.label}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:C.tx2}}>{row.label}</span>{row.lock?<span style={{fontSize:13,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>$-.--/kg</span>:<span style={{fontSize:13,fontWeight:800,color:row.color}}>${row.val.toFixed(2)}/kg</span>}</div><div style={{height:6,background:C.border,borderRadius:3}}><div style={{height:"100%",width:row.lock?"30%":`${(row.val/mercado.precioHoy)*100}%`,background:row.lock?"#454E65":row.color+"99",borderRadius:3}}/></div></div>)}<Hr/><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:C.tx2,fontWeight:700}}>Total destino</span><span style={{fontSize:14,fontWeight:900,color:C.blue}}>{unlocked?`$${mercado.precioHoy.toFixed(2)}/kg`:<span style={{filter:"blur(4px)"}}>$-.--/kg</span>}</span></div></div></Card>}
      <Card style={{marginBottom:16}}><Lbl>México · USA · Dubai</Lbl><div style={{marginTop:10}}>{MERCADOS.map(m=>{const isThis=m.id===mercado.id;const mg=campoAvg>0?((m.precioHoy-campoAvg-m.flete)/m.precioHoy*100):null;return<div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:isThis?"8px 10px":"8px 0",borderBottom:`1px solid ${C.border}`,background:isThis?C.blueDim:"transparent",borderRadius:isThis?8:0,margin:isThis?"2px 0":0}}><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{m.bandera}</span><div><div style={{fontSize:13,fontWeight:isThis?800:600,color:isThis?C.blue:C.tx1}}>{m.nombre}</div><div style={{fontSize:10,color:C.tx3}}>{m.ruta}</div></div></div><div style={{textAlign:"right"}}>{unlocked?<><div style={{fontSize:14,fontWeight:800,color:isThis?C.blue:C.tx1}}>${m.precioHoy.toFixed(2)}</div>{mg!==null&&<div style={{fontSize:11,color:mg>=20?C.green:mg>=10?C.amber:C.red,fontWeight:700}}>{mg.toFixed(1)}% mg</div>}</>:<div style={{fontSize:14,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>$-.--</div>}</div></div>})}</div></Card>
    </div>
  );
}

function Feed({prices,user,unlocked,onUserTap,onMercadoTap,onPublish}){
  const [filter,setFilter]=useState("todos");
  const activePrices=prices.filter(p=>isActive(p.ts));
  const filtered=filter==="todos"?prices:prices.filter(p=>p.role===filter);
  const avgCampo=avg(activePrices.filter(p=>p.role==="productor").map(p=>p.precio));
  const avgVenta=avg(activePrices.filter(p=>p.role==="minorista").map(p=>p.precio));
  return(
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div><div style={{fontSize:11,color:C.green,fontWeight:800,letterSpacing:"0.1em",marginBottom:3}}>EXPORTIA · MERCADO</div><div style={{fontSize:19,fontWeight:900,color:C.tx1}}>Aguacate Hass</div><div style={{fontSize:12,color:C.tx2}}>{prices.length} reportes · {new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</div></div>
        <Chip color={user.role==="productor"?"green":"blue"}>{user.role}</Chip>
      </div>
      {!unlocked&&<PaywallBanner onPublish={onPublish}/>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[{label:"Campo avg",val:avgCampo>0?`$${avgCampo.toFixed(2)}`:"—",color:C.green},{label:"Dubai avg",val:avgVenta>0?`$${avgVenta.toFixed(2)}`:"—",color:C.blue},{label:"Spread",val:avgCampo>0&&avgVenta>0?`$${(avgVenta-avgCampo).toFixed(2)}`:"—",color:C.amber}].map(s=><Card key={s.label} style={{padding:"10px 10px"}}><Lbl>{s.label}</Lbl>{unlocked?<Val size={15} color={s.color}>{s.val}</Val>:<div style={{fontSize:15,fontWeight:800,color:C.tx3,filter:"blur(5px)"}}>$-.--</div>}<div style={{fontSize:9,color:C.tx3,marginTop:2}}>activos</div></Card>)}
      </div>
      <div style={{marginBottom:14}}><div style={{fontSize:11,color:C.tx3,fontWeight:700,letterSpacing:"0.06em",marginBottom:8}}>MERCADOS · TOCA PARA ANALÍTICAS</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{MERCADOS.map(m=>{const mg=campoAvg>0?((m.precioHoy-campoAvg-m.flete)/m.precioHoy*100):null;return<div key={m.id} onClick={()=>onMercadoTap(m)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 10px",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:22,marginBottom:4}}>{m.bandera}</div><div style={{fontSize:12,fontWeight:700,color:C.tx1,marginBottom:4}}>{m.nombre}</div>{unlocked?<><div style={{fontSize:16,fontWeight:900,color:m.tipo==="campo"?C.green:C.blue}}>${m.precioHoy.toFixed(2)}</div>{mg!==null&&<div style={{fontSize:10,color:mg>=20?C.green:mg>=10?C.amber:C.red,fontWeight:700,marginTop:2}}>{mg.toFixed(1)}% mg</div>}</>:<div style={{fontSize:16,fontWeight:900,color:C.tx3,filter:"blur(5px)"}}>$-.--</div>}</div>})}</div></div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>{[{id:"todos",label:"Todos"},{id:"productor",label:"🌱 Campo"},{id:"minorista",label:"🏪 Destino"}].map(f=><button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:"7px 10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:filter===f.id?C.surfaceHigh:"transparent",border:`1px solid ${filter===f.id?C.borderMid:"transparent"}`,color:filter===f.id?C.tx1:C.tx3}}>{f.label}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:16}}>{filtered.map(p=>{const active=isActive(p.ts);return<Card key={p.id} onClick={()=>onUserTap(p)} style={{padding:14,opacity:active?1:0.65}}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><Avatar name={p.user} role={p.role}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div style={{fontSize:13,fontWeight:700,color:C.tx1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"55%"}}>{p.user}</div>{unlocked?<div style={{fontSize:22,fontWeight:900,color:p.role==="productor"?C.green:C.blue}}>${p.precio.toFixed(2)}<span style={{fontSize:11,color:C.tx3}}>/kg</span></div>:<div style={{fontSize:22,fontWeight:900,color:C.tx3,filter:"blur(5px)"}}>$-.--<span style={{fontSize:11}}>/kg</span></div>}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11,color:C.tx2}}>{p.region}</div><div style={{fontSize:10,color:C.tx3,marginTop:1}}>{p.kg.toLocaleString()}kg · {relTime(p.ts)}</div></div><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:10,color:C.tx3}}>🔥{p.reportes}</span><Chip color={active?"green":"amber"}>{priceLabel(p.ts)}</Chip></div></div></div></div></Card>})}</div>
    </div>
  );
}

function Registrar({user,onSubmit,isFirstTime}){
  const [precio,setPrecio]=useState("");
  const [volumen,setVolumen]=useState("");
  const [nota,setNota]=useState("");
  const [done,setDone]=useState(false);
  const [saving,setSaving]=useState(false);
  function handleSubmit(){ if(!precio)return; setSaving(true); onSubmit({user:user.nombre,role:user.role,region:user.region,pais:user.pais,precio:parseFloat(precio),tipo:user.role==="productor"?"campo":"venta",ts:Date.now(),kg:parseInt(volumen)||0,confiabilidad:80,reportes:1,nota}); setSaving(false); }
  if(done)return<div style={{minHeight:"60vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}><div style={{width:72,height:72,borderRadius:"50%",background:C.greenDim,border:`2px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:20,boxShadow:"0 0 40px #22C55E33"}}>✓</div><Val size={20}>¡Precio publicado!</Val><div style={{fontSize:13,color:C.tx2,textAlign:"center",marginTop:8}}><span style={{color:C.green,fontWeight:800}}>${parseFloat(precio).toFixed(2)} USD/kg</span> visible en el mercado</div><div style={{fontSize:12,color:C.green,marginTop:6,fontWeight:700}}>🔓 Ahora tienes acceso completo</div><button onClick={()=>{setDone(false);setPrecio("");setVolumen("");setNota("");}} style={{marginTop:24,padding:"12px 24px",borderRadius:10,background:C.surfaceHigh,border:`1px solid ${C.border}`,color:C.tx2,fontSize:13,fontWeight:700,cursor:"pointer"}}>Publicar otro precio</button></div>;
  return(
    <div style={{padding:"20px 16px 0"}}>
      {isFirstTime&&<div style={{marginBottom:20,padding:"14px 16px",background:C.greenDim,border:`1px solid ${C.greenBorder}`,borderRadius:12}}><div style={{fontSize:13,fontWeight:800,color:C.green,marginBottom:4}}>🔓 Un precio = acceso completo</div><div style={{fontSize:12,color:C.tx2}}>Publica tu precio y desbloquea todos los precios del mercado.</div></div>}
      <Val size={19}>Publicar precio</Val>
      <div style={{fontSize:12,color:C.tx2,marginBottom:24,marginTop:4}}>{user.role==="productor"?"🌱":"🏪"} Aguacate Hass · {user.region}</div>
      <Card style={{marginBottom:18,padding:"12px 16px",borderColor:C.borderMid}}><div style={{display:"flex",alignItems:"center",gap:14}}><div style={{fontSize:28}}>🥑</div><div><div style={{fontSize:14,fontWeight:800,color:C.tx1}}>Aguacate Hass</div><div style={{fontSize:12,color:C.tx2}}>HS 0804.40.01 · {user.role==="productor"?"precio de campo":"precio de venta"}</div></div></div></Card>
      <div style={{marginBottom:18}}><Lbl>{user.role==="productor"?"Precio de campo hoy (USD/kg)":"Precio de venta al consumidor (USD/kg)"}</Lbl><div style={{display:"flex",alignItems:"center",background:C.surfaceHigh,border:`1.5px solid ${C.borderMid}`,borderRadius:14,overflow:"hidden"}}><div style={{padding:"0 16px",fontSize:22,color:C.tx3}}>$</div><input type="number" value={precio} step="0.05" placeholder="0.00" onChange={e=>setPrecio(e.target.value)} style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.tx1,fontSize:32,fontWeight:900,padding:"16px 0"}}/><div style={{padding:"0 14px",fontSize:13,color:C.tx3}}>USD/kg</div></div>{precio&&<div style={{marginTop:6,fontSize:12,color:C.tx2}}>= <strong style={{color:C.tx1}}>${(parseFloat(precio)*10.5).toFixed(2)}</strong> por caja 10.5 kg</div>}</div>
      <div style={{marginBottom:16}}><Lbl>Volumen disponible (kg) — opcional</Lbl><input type="number" value={volumen} placeholder="Ej. 5000" onChange={e=>setVolumen(e.target.value)} style={{width:"100%",background:C.surfaceHigh,border:`1px solid ${C.border}`,borderRadius:12,color:C.tx1,fontSize:16,fontWeight:600,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/></div>
      <div style={{marginBottom:20}}><Lbl>Nota — opcional</Lbl><textarea value={nota} placeholder="Ej. Calibre 48, calidad A, disponible esta semana..." onChange={e=>setNota(e.target.value)} rows={2} style={{width:"100%",background:C.surfaceHigh,border:`1px solid ${C.border}`,borderRadius:12,color:C.tx1,fontSize:14,padding:"12px 14px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit"}}/></div>
      <div style={{marginBottom:22,padding:"10px 14px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:10}}><div style={{fontSize:11,color:C.amber,fontWeight:700,marginBottom:2}}>⏱ VALIDEZ 7 DÍAS</div><div style={{fontSize:12,color:C.tx2}}>Después de 7 días necesitas publicar un precio nuevo para mantener acceso al mercado.</div></div>
      <button onClick={handleSubmit} disabled={!precio||saving} style={{width:"100%",padding:"16px 0",borderRadius:13,fontSize:16,fontWeight:900,background:precio?C.green:C.border,color:precio?C.bg:C.tx3,border:"none",cursor:precio?"pointer":"default",boxShadow:precio?"0 6px 24px #22C55E33":"none"}}>{saving?"Guardando...":"🔓 Publicar y desbloquear mercado"}</button>
    </div>
  );
}

function Dashboard({user,prices,unlocked,onLogout}){
  const myPrices=prices.filter(p=>p.user===user.nombre).sort((a,b)=>b.ts-a.ts);
  const activePrices=prices.filter(p=>isActive(p.ts));
  const avgCampo=avg(activePrices.filter(p=>p.role==="productor").map(p=>p.precio));
  const avgVenta=avg(activePrices.filter(p=>p.role==="minorista").map(p=>p.precio));
  const myLast=myPrices[0];
  const mejorMercado=MERCADOS.filter(m=>m.id!=="mex").sort((a,b)=>b.precioHoy-a.precioHoy)[0];
  const margenMejor=avgCampo>0?((mejorMercado.precioHoy-avgCampo-mejorMercado.flete)/mejorMercado.precioHoy*100):null;
  const diasRestantes=myLast?Math.max(0,7-Math.floor((Date.now()-myLast.ts)/(1000*60*60*24))):null;
  return(
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:16,background:user.role==="productor"?C.greenDim:C.blueDim,border:`2px solid ${user.role==="productor"?C.greenBorder:C.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:user.role==="productor"?C.green:C.blue}}>{user.nombre.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
          <div><Val size={17}>{user.nombre}</Val><div style={{fontSize:12,color:C.tx2}}>{user.region}</div><div style={{marginTop:4}}><Chip color={user.role==="productor"?"green":"blue"}>{user.role}</Chip></div></div>
        </div>
        <button onClick={onLogout} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.tx3,fontSize:11,padding:"6px 10px",cursor:"pointer"}}>Salir</button>
      </div>
      <div style={{marginBottom:14,padding:"12px 16px",background:unlocked?C.greenDim:C.amberDim,border:`1px solid ${unlocked?C.greenBorder:C.amberBorder}`,borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:20}}>{unlocked?"🔓":"🔒"}</div>
        <div><div style={{fontSize:13,fontWeight:800,color:unlocked?C.green:C.amber}}>{unlocked?"Acceso completo al mercado":"Sin acceso al mercado"}</div><div style={{fontSize:11,color:C.tx2}}>{unlocked&&diasRestantes!==null?`Tu precio expira en ${diasRestantes} días`:"Publica tu precio para desbloquear"}</div></div>
      </div>
      {myLast?<Card style={{marginBottom:12,borderColor:user.role==="productor"?C.greenBorder:C.blueBorder}}><Lbl>Tu último precio publicado</Lbl><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:6}}><div><Val size={28} color={user.role==="productor"?C.green:C.blue}>${myLast.precio.toFixed(2)}</Val><div style={{fontSize:12,color:C.tx2,marginTop:2}}>USD/kg · {relTime(myLast.ts)}</div></div><Chip color={isActive(myLast.ts)?"green":"amber"}>{priceLabel(myLast.ts)}</Chip></div>{diasRestantes!==null&&diasRestantes<=3&&<div style={{marginTop:10,padding:"8px 12px",background:C.amberDim,borderRadius:8,fontSize:11,color:C.amber}}>⚠ Tu precio expira en {diasRestantes} {diasRestantes===1?"día":"días"} — actualízalo para mantener acceso</div>}</Card>:<Card style={{marginBottom:12,borderStyle:"dashed"}}><div style={{textAlign:"center",padding:"14px 0"}}><div style={{fontSize:13,color:C.tx2}}>Aún no has publicado ningún precio</div><div style={{fontSize:11,color:C.tx3,marginTop:3}}>Publica para desbloquear el mercado completo</div></div></Card>}
      {unlocked&&<Card style={{marginBottom:12}}><Lbl>Mejor oportunidad hoy</Lbl><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}><div><div style={{fontSize:15,fontWeight:800,color:C.tx1}}>{mejorMercado.bandera} {mejorMercado.nombre}</div><div style={{fontSize:11,color:C.tx2}}>{mejorMercado.ruta}</div></div><div style={{textAlign:"right"}}><Val size={20} color={C.blue}>${mejorMercado.precioHoy.toFixed(2)}</Val>{margenMejor!==null&&<div style={{fontSize:11,color:margenMejor>=20?C.green:C.amber,fontWeight:700}}>{margenMejor.toFixed(1)}% margen</div>}</div></div></Card>}
      {unlocked&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>{[{label:"Campo avg",val:avgCampo>0?`$${avgCampo.toFixed(2)}/kg`:"—",color:C.green},{label:"Venta avg",val:avgVenta>0?`$${avgVenta.toFixed(2)}/kg`:"—",color:C.blue}].map(s=><Card key={s.label} style={{padding:12}}><Lbl>{s.label}</Lbl><Val size={15} color={s.color}>{s.val}</Val></Card>)}</div>}
      <Card style={{marginBottom:12,borderColor:C.amberBorder}}><Lbl>Temporada actual · Jalisco</Lbl><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}><div><div style={{fontSize:13,fontWeight:700,color:C.amber}}>⚠ Marceña / Loca</div><div style={{fontSize:11,color:C.tx2,marginTop:2}}>Jun–Sep · escasez activa</div></div><Chip color="amber">Evaluar</Chip></div></Card>
      {myPrices.length>0&&<Card style={{marginBottom:16}}><Lbl>Mi historial ({myPrices.length} reportes)</Lbl><div style={{marginTop:10}}>{myPrices.slice(0,8).map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<Math.min(myPrices.length,8)-1?`1px solid ${C.border}`:"none"}}><div><span style={{fontSize:12,color:C.tx2}}>{relTime(p.ts)}</span><span style={{marginLeft:8,fontSize:10,color:isActive(p.ts)?C.green:C.tx3}}>{priceLabel(p.ts)}</span></div><span style={{fontSize:14,fontWeight:800,color:user.role==="productor"?C.green:C.blue}}>${p.precio.toFixed(2)}/kg</span></div>)}</div></Card>}
    </div>
  );
}

export default function ExportIA(){
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("feed");
  const [prices,setPrices]=useState(SEED_PRICES);
  const [subScreen,setSubScreen]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    // Carga síncrona — sin async, sin posibilidad de quedar colgado
    try {
      const savedUser = lsGet(KEY_USER);
      const savedPrices = lsGet(KEY_PRICES);
      if(savedUser) setUser(savedUser);
      if(savedPrices&&savedPrices.length>0){
        const ids=new Set(savedPrices.map(p=>p.id));
        const merged=[...savedPrices,...SEED_PRICES.filter(p=>!ids.has(p.id))];
        setPrices(merged.sort((a,b)=>b.ts-a.ts));
      }
    } catch(e){ console.warn("Storage load:",e); }
    // Siempre termina loading, pase lo que pase
    setLoading(false);
  },[]);

  function handleNewPrice(entry){
    const newEntry={...entry,id:Date.now()};
    const updated=[newEntry,...prices];
    setPrices(updated);
    lsSet(KEY_PRICES,updated);
    setScreen("feed");
    setSubScreen(null);
  }

  function handleLogout(){
    lsDel(KEY_USER);
    setUser(null);setScreen("feed");setSubScreen(null);
  }

  if(loading)return<Spinner/>;
  if(!user)return<div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif"}}><Onboarding onComplete={u=>{ lsSet(KEY_USER,u); setUser(u); setScreen("registrar"); }}/></div>;

  const unlocked=prices.some(p=>p.user===user.nombre&&isActive(p.ts));
  const avgCampo=avg(prices.filter(p=>p.role==="productor"&&isActive(p.ts)).map(p=>p.precio));
  const isFirstTime=!prices.some(p=>p.user===user.nombre);

  if(subScreen?.type==="perfil")return<div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',system-ui,sans-serif",color:C.tx1}}><div style={{overflowY:"auto",paddingBottom:8}}><PerfilPublico entry={subScreen.data} onBack={()=>setSubScreen(null)} allPrices={prices} unlocked={unlocked}/></div></div>;
  if(subScreen?.type==="mercado")return<div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',system-ui,sans-serif",color:C.tx1}}><div style={{overflowY:"auto",paddingBottom:8}}><AnaliticasMercado mercado={subScreen.data} onBack={()=>setSubScreen(null)} campoAvg={avgCampo} unlocked={unlocked} onPublish={()=>{setSubScreen(null);setScreen("registrar");}}/></div></div>;

  const screens={
    feed:<Feed prices={prices} user={user} unlocked={unlocked} onUserTap={p=>setSubScreen({type:"perfil",data:p})} onMercadoTap={m=>setSubScreen({type:"mercado",data:m})} onPublish={()=>setScreen("registrar")}/>,
    registrar:<Registrar user={user} onSubmit={handleNewPrice} isFirstTime={isFirstTime}/>,
    dashboard:<Dashboard user={user} prices={prices} unlocked={unlocked} onLogout={handleLogout}/>,
  };

  return<div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",fontFamily:"'Inter',system-ui,sans-serif",color:C.tx1}}><div style={{flex:1,overflowY:"auto",paddingBottom:8}}>{screens[screen]}</div><BottomNav screen={screen} setScreen={s=>{setScreen(s);setSubScreen(null);}}/></div>;
}
