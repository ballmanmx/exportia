import { useState, useEffect } from "react";

const C = {
  bg:"#080B10",surface:"#0F1420",surfaceHigh:"#161C2D",
  border:"#1E2535",borderMid:"#28334A",
  green:"#22C55E",greenDim:"#22C55E18",greenBorder:"#22C55E35",
  amber:"#F59E0B",amberDim:"#F59E0B18",amberBorder:"#F59E0B35",
  blue:"#3B82F6",blueDim:"#3B82F618",blueBorder:"#3B82F635",
  red:"#EF4444",redDim:"#EF444418",
  tx1:"#F0F4FF",tx2:"#8B95B0",tx3:"#454E65",
};

const mem = {};
function lsGet(key){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):null; }catch{ return mem[key]||null; } }
function lsSet(key,val){ mem[key]=val; try{ localStorage.setItem(key,JSON.stringify(val)); }catch{} }
function lsDel(key){ delete mem[key]; try{ localStorage.removeItem(key); }catch{} }

const SEED = [
  {id:1,user:"David G.",role:"productor",region:"Ciudad Guzmán, Jalisco",pais:"México",precio:3.50,tipo:"campo",ts:Date.now()-1000*60*18,kg:2352,confiabilidad:96,reportes:18,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 48 · Primera · Clase A"},
  {id:2,user:"Ramón H.",role:"productor",region:"Tancítaro, Michoacán",pais:"México",precio:4.10,tipo:"campo",ts:Date.now()-1000*60*45,kg:5000,confiabilidad:88,reportes:9,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 60 · Primera B · Clase A"},
  {id:3,user:"Freshela LLC",role:"minorista",region:"Dubai, EAU",pais:"EAU",precio:5.50,tipo:"venta",ts:Date.now()-1000*60*90,kg:1200,confiabilidad:91,reportes:22,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 48 · Primera · Clase A"},
  {id:4,user:"Al Aweer Market",role:"minorista",region:"Dubai, EAU",pais:"EAU",precio:5.20,tipo:"venta",ts:Date.now()-1000*60*130,kg:800,confiabilidad:85,reportes:7,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 48 · Primera · Clase B"},
  {id:5,user:"Carlos M.",role:"productor",region:"Zapotlán, Jalisco",pais:"México",precio:3.30,tipo:"campo",ts:Date.now()-1000*60*200,kg:3000,confiabilidad:79,reportes:5,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 48 · Primera · Convencional"},
  {id:6,user:"Hamid K.",role:"minorista",region:"Dubai, EAU",pais:"EAU",precio:5.80,tipo:"venta",ts:Date.now()-1000*60*260,kg:900,confiabilidad:83,reportes:4,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 32/36 · Superextra · Clase A"},
  {id:7,user:"Pedro A.",role:"productor",region:"Uruapan, Michoacán",pais:"México",precio:4.30,tipo:"campo",ts:Date.now()-1000*60*320,kg:7000,confiabilidad:82,reportes:11,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 48 · Primera · Orgánico"},
  {id:8,user:"Gulf Fresh",role:"minorista",region:"Abu Dhabi, EAU",pais:"EAU",precio:5.00,tipo:"venta",ts:Date.now()-1000*60*400,kg:600,confiabilidad:87,reportes:6,producto:"Aguacate Hass",productoId:"hass",productoEmoji:"🥑",atributosLabel:"Cal. 60 · Primera B · Clase A"},
];

const MERCADOS = [
  // Fuente: SNIIM/APEAM/Profeco · Central Abasto GDL · Cal.48 (Primera) · Jul 2026
  // Serie: Nov25=$2.48 May26=$2.59 Jun26=$2.47 Jul26=$1.61 (escasez Loca)
  {id:"mex",nombre:"México",pais:"México",bandera:"🇲🇽",precioHoy:1.61,
   tendencia:[1.55,1.48,1.40,1.32,1.25,1.20,1.18,1.15,1.12,1.15,1.20,1.28,1.35,1.61],
   flete:0,ruta:"Central Abasto GDL",competencia:"—",
   temporada:"⚠ Temporada Loca · Escasez jun–sep · Precio sube",tipo:"campo"},
  // Fuente: USDA Market News · Cal.48 · Jun-Jul 2026 · FOB Texas/California
  // Incluye arancel 25% vigente desde 2025 · Jun26=$4.06/kg · Jul26 baja por escasez
  {id:"usa",nombre:"USA",pais:"USA",bandera:"🇺🇸",precioHoy:3.88,
   tendencia:[4.10,3.98,3.85,3.70,3.58,3.48,3.42,3.50,3.60,3.72,3.85,3.98,4.08,3.88],
   flete:0.35,ruta:"GDL→LAX/TX",competencia:"Perú, Chile, Colombia",
   temporada:"⚠ Arancel 25% vigente · Reduce margen vs Dubai",tipo:"fob"},
  // Fuente: OC-001 real confirmado + mercado DXB Jul 2026
  // Margen neto real: $5.35 - $1.61 campo - $1.72 flete = $2.02/kg = 37.8%
  {id:"dxb",nombre:"Dubai",pais:"EAU",bandera:"🇦🇪",precioHoy:5.35,
   tendencia:[4.80,4.90,5.00,5.10,5.15,5.20,5.25,5.20,5.25,5.30,5.35,5.35,5.40,5.35],
   flete:1.72,ruta:"GDL→DXB",competencia:"Kenia, Perú",
   temporada:"⚠ Evaluar jun–sep · Kenia en temporada alta",tipo:"venta"},
];

const ESTACIONAL = [
  {mes:"E",precio:2.4,escasez:false},{mes:"F",precio:2.8,escasez:false},
  {mes:"M",precio:3.2,escasez:false},{mes:"A",precio:4.1,escasez:true},
  {mes:"M",precio:4.5,escasez:true},{mes:"J",precio:4.8,escasez:true},
  {mes:"J",precio:3.9,escasez:false},{mes:"A",precio:2.9,escasez:false},
  {mes:"S",precio:2.3,escasez:false},{mes:"O",precio:1.9,escasez:false},
  {mes:"N",precio:2.0,escasez:false},{mes:"D",precio:2.2,escasez:false},
];

function relTime(ts){const m=Math.floor((Date.now()-ts)/60000);if(m<1)return"ahora";if(m<60)return`hace ${m}m`;const h=Math.floor(m/60);if(h<24)return`hace ${h}h`;return`hace ${Math.floor(h/24)}d`;}
function avg(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;}
function isActive(ts){return(Date.now()-ts)<7*24*60*60*1000;}

function Chip({color="blue",children}){
  const m={green:[C.greenDim,C.greenBorder,C.green],amber:[C.amberDim,C.amberBorder,C.amber],blue:[C.blueDim,C.blueBorder,C.blue],red:[C.redDim,"#EF444435",C.red]};
  const[bg,bd,tx]=m[color]||m.blue;
  return <span style={{background:bg,border:`1px solid ${bd}`,color:tx,borderRadius:5,padding:"2px 7px",fontSize:10.5,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{children}</span>;
}
function Card({children,style,onClick}){return <div onClick={onClick} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:16,cursor:onClick?"pointer":"default",...style}}>{children}</div>;}
function Lbl({children}){return <div style={{fontSize:10,color:C.tx3,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{children}</div>;}
function Val({children,color,size=20}){return <div style={{fontSize:size,fontWeight:800,color:color||C.tx1,lineHeight:1.15}}>{children}</div>;}
function Hr(){return <div style={{height:1,background:C.border,margin:"14px 0"}}/>;}
function Avatar({name,role,emoji}){
  const i=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const c=role==="productor"?C.green:C.blue;
  // Si hay emoji de producto, mostrarlo prominentemente sobre fondo del rol
  if(emoji) return(
    <div style={{width:42,height:42,borderRadius:12,flexShrink:0,background:role==="productor"?C.greenDim:C.blueDim,border:`1.5px solid ${c}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,position:"relative"}}>
      {emoji}
      <div style={{position:"absolute",bottom:-4,right:-4,width:16,height:16,borderRadius:"50%",background:role==="productor"?C.green:C.blue,border:"2px solid "+C.surface,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:C.bg}}>
        {role==="productor"?"P":"M"}
      </div>
    </div>
  );
  return <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,background:role==="productor"?C.greenDim:C.blueDim,border:`1.5px solid ${c}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:c}}>{i}</div>;
}
function BackBtn({onBack}){return <button onClick={onBack} style={{background:"none",border:"none",color:C.tx2,cursor:"pointer",fontSize:14,padding:"0 0 18px 0",display:"block"}}>← Atrás</button>;}

function Sparkline({data,color=C.green,height=70,blur=false}){
  const min=Math.min(...data),max=Math.max(...data),range=max-min||1,w=200,h=height;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*(h-8)-4}`).join(" ");
  const ly=h-((data[data.length-1]-min)/range)*(h-8)-4;
  return(
    <div style={{position:"relative"}}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height,filter:blur?"blur(4px)":"none"}} preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx={w} cy={ly} r="4" fill={color}/>
      </svg>
      {blur&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🔒</div>}
    </div>
  );
}

function BarChart({data,height=90,labelKey="mes",valueKey="precio",colorFn}){
  const max=Math.max(...data.map(d=>d[valueKey]));
  return(
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height,padding:"0 2px"}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
          <div style={{width:"100%",height:`${(d[valueKey]/max)*88+6}%`,borderRadius:"3px 3px 0 0",background:colorFn?colorFn(d):C.border}}/>
          <div style={{fontSize:7,color:C.tx3,marginTop:3}}>{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
}

function PaywallBanner({onPublish}){
  return(
    <div style={{marginBottom:14,padding:"12px 16px",background:`linear-gradient(135deg,${C.greenDim},${C.blueDim})`,border:`1px solid ${C.greenBorder}`,borderRadius:12,display:"flex",alignItems:"center",gap:12}}>
      <div style={{fontSize:24,flexShrink:0}}>🔒</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:800,color:C.tx1,marginBottom:2}}>Publica tu precio para ver el mercado</div>
        <div style={{fontSize:11,color:C.tx2}}>Los precios están ocultos hasta que contribuyas.</div>
      </div>
      <button onClick={onPublish} style={{flexShrink:0,padding:"8px 14px",borderRadius:9,background:C.green,color:C.bg,fontSize:12,fontWeight:800,border:"none",cursor:"pointer",whiteSpace:"nowrap"}}>Publicar →</button>
    </div>
  );
}

function BottomNav({screen,setScreen}){
  const items=[{id:"feed",label:"Mercado",icon:"◈"},{id:"registrar",label:"Publicar",icon:"＋",special:true},{id:"dashboard",label:"Mi perfil",icon:"◉"}];
  return(
    <div style={{display:"flex",background:C.surface,borderTop:`1px solid ${C.border}`,position:"sticky",bottom:0,zIndex:10}}>
      {items.map(i=>(
        <button key={i.id} onClick={()=>setScreen(i.id)} style={{flex:1,padding:i.special?"10px 4px 8px":"12px 4px 10px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,borderTop:`2px solid ${screen===i.id?(i.special?C.green:C.blue):"transparent"}`}}>
          {i.special
            ?<div style={{width:36,height:36,borderRadius:10,marginTop:-18,background:screen==="registrar"?C.green:C.greenDim,border:`1.5px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:screen==="registrar"?C.bg:C.green,boxShadow:"0 4px 16px #22C55E44"}}>+</div>
            :<span style={{fontSize:17,color:screen===i.id?C.blue:C.tx3}}>{i.icon}</span>
          }
          <span style={{fontSize:10,fontWeight:700,color:screen===i.id?(i.special?C.green:C.blue):C.tx3}}>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({onComplete}){
  const [step,setStep]=useState(0);
  const [role,setRole]=useState(null);
  const [pais,setPais]=useState("México");
  const [region,setRegion]=useState("");
  const [nombre,setNombre]=useState("");
  const regiones={
    "México":["Ciudad Guzmán, Jalisco","Zapotlán, Jalisco","Uruapan, Michoacán","Tancítaro, Michoacán","Otra (México)"],
    "EAU":["Dubai, UAE","Abu Dhabi, UAE","Sharjah, UAE"],
    "USA":["Los Angeles, CA","Miami, FL","Nueva York, NY"],
    "Otro":["Otra región"],
  };
  if(step===0) return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{width:64,height:64,borderRadius:18,background:C.greenDim,border:`1.5px solid ${C.greenBorder}`,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>🥑</div>
        <div style={{fontSize:26,fontWeight:900,color:C.tx1}}>Export<span style={{color:C.green}}>IA</span></div>
        <div style={{fontSize:13,color:C.tx2,marginTop:6}}>Inteligencia de precios · Aguacate Hass</div>
        <div style={{marginTop:16,padding:"10px 16px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:10,fontSize:12,color:C.amber}}>🔒 Publica tu precio para acceder al mercado</div>
      </div>
      <div style={{fontSize:18,fontWeight:800,color:C.tx1,textAlign:"center",marginBottom:6}}>¿Cuál es tu rol?</div>
      <div style={{fontSize:13,color:C.tx2,textAlign:"center",marginBottom:24}}>Define qué publicas y qué ves</div>
      {[
        {id:"productor",icon:"🌱",title:"Soy Productor",sub:"Precio de campo · México"},
        {id:"minorista",icon:"🏪",title:"Soy Minorista / Importador",sub:"Precio de venta · Dubai / USA"},
      ].map(r=>(
        <button key={r.id} onClick={()=>{setRole(r.id);setStep(1);}} style={{width:"100%",marginBottom:12,padding:"20px",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:16,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:16}}>
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
      <div style={{marginBottom:16}}>
        <Lbl>Nombre o empresa</Lbl>
        <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. David García / Gulf Fresh LLC"
          style={{width:"100%",background:C.surfaceHigh,border:`1px solid ${C.borderMid}`,borderRadius:10,color:C.tx1,fontSize:15,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{marginBottom:16}}>
        <Lbl>País</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.keys(regiones).map(p=>(
            <button key={p} onClick={()=>{setPais(p);setRegion("");}} style={{padding:"10px 0",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",background:pais===p?C.blueDim:C.surface,border:`1.5px solid ${pais===p?C.blue:C.border}`,color:pais===p?C.blue:C.tx2}}>{p}</button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:28}}>
        <Lbl>Región</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {regiones[pais].map(r=>(
            <button key={r} onClick={()=>setRegion(r)} style={{padding:"11px 14px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",background:region===r?C.greenDim:C.surface,border:`1.5px solid ${region===r?C.green:C.border}`,color:region===r?C.green:C.tx2}}>{r}</button>
          ))}
        </div>
      </div>
      <button onClick={()=>{if(nombre&&region)onComplete({nombre,role,region,pais});}} disabled={!nombre||!region}
        style={{width:"100%",padding:"16px 0",borderRadius:12,fontSize:15,fontWeight:800,background:nombre&&region?C.green:C.border,color:nombre&&region?C.bg:C.tx3,border:"none",cursor:nombre&&region?"pointer":"default",boxShadow:nombre&&region?"0 4px 20px #22C55E33":"none"}}>
        Continuar → Publicar mi precio
      </button>
    </div>
  );
}

// ─── PERFIL PÚBLICO ───────────────────────────────────────────────────────────
function PerfilPublico({entry,onBack,allPrices,unlocked}){
  const susPrices=allPrices.filter(p=>p.user===entry.user).sort((a,b)=>b.ts-a.ts);
  const isP=entry.role==="productor";
  const avgMercado=avg(allPrices.filter(p=>p.role===entry.role&&isActive(p.ts)).map(p=>p.precio));
  const diff=entry.precio-avgMercado;

  return(
    <div style={{padding:"16px 16px 0",paddingBottom:32}}>
      <BackBtn onBack={onBack}/>

      {/* Avatar + info */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,textAlign:"center"}}>
        <div style={{width:68,height:68,borderRadius:20,background:isP?C.greenDim:C.blueDim,border:"2px solid "+(isP?C.greenBorder:C.blueBorder),display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:900,color:isP?C.green:C.blue,marginBottom:12}}>
          {entry.user.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <Val size={20}>{entry.user}</Val>
        <div style={{fontSize:12,color:C.tx2,marginTop:4}}>{entry.region}</div>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
          <Chip color={isP?"green":"blue"}>{isP?"Productor":"Minorista"}</Chip>
          <span style={{fontSize:12,color:C.tx3}}>🔥 {entry.reportes} reportes</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        <Card style={{padding:12}}>
          <Lbl>Precio hoy</Lbl>
          {unlocked
            ?<Val size={18} color={isP?C.green:C.blue}>${entry.precio.toFixed(2)}/kg</Val>
            :<div style={{fontSize:18,fontWeight:800,color:C.tx3,filter:"blur(5px)"}}>$-.--/kg</div>
          }
        </Card>
        <Card style={{padding:12}}>
          <Lbl>Confiabilidad</Lbl>
          <Val size={18} color={entry.confiabilidad>=90?C.green:C.amber}>{entry.confiabilidad}%</Val>
        </Card>
        <Card style={{padding:12}}>
          <Lbl>vs promedio</Lbl>
          {unlocked
            ?<Val size={18} color={diff>0?C.amber:C.green}>{diff>=0?"+":""}{diff.toFixed(2)} USD</Val>
            :<div style={{fontSize:18,fontWeight:800,color:C.tx3,filter:"blur(5px)"}}>+-.--</div>
          }
        </Card>
        <Card style={{padding:12}}>
          <Lbl>Volumen</Lbl>
          <Val size={18}>{entry.kg>0?(entry.kg/1000).toFixed(1)+"t":"—"}</Val>
        </Card>
      </div>

      {/* Último reporte con detalle */}
      {entry.calibre&&(
        <Card style={{marginBottom:14}}>
          <Lbl>Detalle del último reporte</Lbl>
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:C.tx2}}>Producto</span>
              <span style={{fontSize:12,color:C.tx1,fontWeight:600}}>Aguacate Hass</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:C.tx2}}>Calibre</span>
              <span style={{fontSize:12,color:C.tx1,fontWeight:600}}>{entry.calibre}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:C.tx2}}>Calidad</span>
              <span style={{fontSize:12,color:C.tx1,fontWeight:600}}>{entry.calidad}</span>
            </div>
            {entry.nota&&(
              <div style={{marginTop:4,padding:"8px 10px",background:C.bg,borderRadius:8,fontSize:12,color:C.tx2,lineHeight:1.5}}>
                "{entry.nota}"
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Historial de precios */}
      <Card style={{marginBottom:14}}>
        <Lbl>Historial de precios ({susPrices.length} reportes)</Lbl>
        <div style={{marginTop:10}}>
          {susPrices.length>0?susPrices.slice(0,6).map((p,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<Math.min(susPrices.length,6)-1?"1px solid "+C.border:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:p.calibre?4:0}}>
                <div>
                  <span style={{fontSize:12,color:C.tx2}}>{new Date(p.ts).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</span>
                  <span style={{marginLeft:8,fontSize:10,color:isActive(p.ts)?C.green:C.tx3}}>{isActive(p.ts)?"Hoy":"Ref."}</span>
                </div>
                {unlocked
                  ?<span style={{fontSize:15,fontWeight:800,color:isP?C.green:C.blue}}>${p.precio.toFixed(2)}/kg</span>
                  :<span style={{fontSize:15,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>$-.--</span>
                }
              </div>
              {p.calibre&&<div style={{fontSize:11,color:C.tx3}}>{p.calibre} · {p.calidad}</div>}
            </div>
          )):(
            <div style={{fontSize:12,color:C.tx3,padding:"8px 0"}}>Solo 1 reporte disponible</div>
          )}
        </div>
        {!unlocked&&(
          <div style={{marginTop:12,padding:"10px 12px",background:C.amberDim,border:"1px solid "+C.amberBorder,borderRadius:8,fontSize:12,color:C.amber,textAlign:"center"}}>
            🔒 Publica tu precio para ver los números
          </div>
        )}
      </Card>

      {/* CTA */}
      <Card style={{marginBottom:16,borderColor:isP?C.greenBorder:C.blueBorder,background:isP?C.greenDim:C.blueDim}}>
        <div style={{fontSize:13,color:C.tx1,fontWeight:700,marginBottom:4}}>
          {isP?"Quieres comprarle a este productor?":"Quieres vender en este mercado?"}
        </div>
        <div style={{fontSize:12,color:C.tx2}}>
          {isP
            ?`${entry.user} tiene ${entry.kg>0?(entry.kg/1000).toFixed(1)+"t":"producto"} disponible en ${entry.region}.`
            :`${entry.user} compra en ${entry.region} a $${unlocked?entry.precio.toFixed(2):"-.--"}/kg.`
          }
        </div>
      </Card>
    </div>
  );
}

// ─── ANALÍTICAS DE MERCADO ────────────────────────────────────────────────────
function AnaliticasMercado({mercado,onBack,campoAvg,unlocked,onPublish}){
  const [tab,setTab]=useState("tendencia");
  const spread=mercado.precioHoy-campoAvg;
  const margen=campoAvg>0?((mercado.precioHoy-campoAvg-mercado.flete)/mercado.precioHoy*100):null;
  const trend=mercado.tendencia;
  const pctChange=((trend[trend.length-1]-trend[0])/trend[0]*100);
  const color=mercado.tipo==="campo"?C.green:mercado.tipo==="fob"?C.amber:C.blue;

  return(
    <div style={{padding:"16px 16px 0"}}>
      <BackBtn onBack={onBack}/>
      {!unlocked&&<PaywallBanner onPublish={onPublish}/>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontSize:11,color:C.tx3,marginBottom:4}}>{mercado.bandera} {mercado.pais} · {mercado.ruta}</div>
          <Val size={24}>{mercado.nombre}</Val>
          <div style={{fontSize:12,color:C.tx2,marginTop:4}}>{mercado.competencia!=="—"?`Compite con: ${mercado.competencia}`:""}</div>
        </div>
        <div style={{textAlign:"right"}}>
          {unlocked
            ?<Val size={28} color={color}>${mercado.precioHoy.toFixed(2)}</Val>
            :<div style={{fontSize:28,fontWeight:900,color:C.tx3,filter:"blur(6px)"}}>$-.--</div>
          }
          <div style={{fontSize:11,color:pctChange>=0?C.green:C.red,fontWeight:700,marginTop:2}}>{pctChange>=0?"↑":"↓"}{Math.abs(pctChange).toFixed(1)}% vs 14 sem.</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {label:"Campo avg",val:campoAvg>0?`$${campoAvg.toFixed(2)}`:"—",color:C.green,lock:false},
          {label:"Flete",val:`$${mercado.flete.toFixed(2)}`,color:C.amber,lock:false},
          {label:"Margen est.",val:margen!==null?`${margen.toFixed(1)}%`:"—",color:margen&&margen>=20?C.green:margen&&margen>=10?C.amber:C.red,lock:!unlocked},
        ].map(s=>(
          <Card key={s.label} style={{padding:10}}>
            <Lbl>{s.label}</Lbl>
            {s.lock
              ?<div style={{fontSize:15,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>---%</div>
              :<Val size={15} color={s.color}>{s.val}</Val>
            }
          </Card>
        ))}
      </div>

      <div style={{marginBottom:14,padding:"10px 14px",background:C.amberDim,border:`1px solid ${C.amberBorder}`,borderRadius:10,fontSize:12,color:C.amber,fontWeight:600}}>
        {mercado.temporada}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"tendencia",label:"Tendencia"},{id:"estacional",label:"Estacional"},{id:"comparativo",label:"vs Campo"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 0",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:tab===t.id?C.surfaceHigh:"transparent",border:`1px solid ${tab===t.id?C.borderMid:"transparent"}`,color:tab===t.id?C.tx1:C.tx3}}>{t.label}</button>
        ))}
      </div>

      {tab==="tendencia"&&(
        <Card style={{marginBottom:14}}>
          <Lbl>Precio · últimas 14 semanas</Lbl>
          <div style={{marginTop:10}}>
            <Sparkline data={trend} color={color} height={80} blur={!unlocked}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            <span style={{fontSize:10,color:C.tx3}}>hace 14 sem.</span>
            <span style={{fontSize:10,color:C.tx3}}>hoy</span>
          </div>
          <Hr/>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <div><Lbl>Mínimo</Lbl>{unlocked?<Val size={14} color={C.red}>${Math.min(...trend).toFixed(2)}</Val>:<div style={{fontSize:14,fontWeight:800,filter:"blur(4px)",color:C.tx3}}>$-.--</div>}</div>
            <div><Lbl>Máximo</Lbl>{unlocked?<Val size={14} color={C.green}>${Math.max(...trend).toFixed(2)}</Val>:<div style={{fontSize:14,fontWeight:800,filter:"blur(4px)",color:C.tx3}}>$-.--</div>}</div>
            <div><Lbl>Hoy</Lbl>{unlocked?<Val size={14} color={color}>${trend[trend.length-1].toFixed(2)}</Val>:<div style={{fontSize:14,fontWeight:800,filter:"blur(4px)",color:C.tx3}}>$-.--</div>}</div>
          </div>
        </Card>
      )}

      {tab==="estacional"&&(
        <Card style={{marginBottom:14}}>
          <Lbl>Patrón precio campo · 12 meses</Lbl>
          <div style={{marginTop:12}}>
            <BarChart data={ESTACIONAL} labelKey="mes" valueKey="precio" height={90} colorFn={d=>d.escasez?C.amber:C.border}/>
          </div>
          <div style={{marginTop:10,display:"flex",gap:14}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:C.amber}}/><span style={{fontSize:11,color:C.tx2}}>Escasez activa</span></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:C.border}}/><span style={{fontSize:11,color:C.tx2}}>Temporada normal</span></div>
          </div>
          <Hr/>
          <div style={{fontSize:12,color:C.tx2}}>Ventana óptima para <strong style={{color:C.tx1}}>{mercado.nombre}</strong>: {mercado.temporada.replace(/[🟢⚠🟡]/g,"").trim()}</div>
        </Card>
      )}

      {tab==="comparativo"&&(
        <Card style={{marginBottom:14}}>
          <Lbl>Desglose campo → {mercado.nombre}</Lbl>
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:12}}>
            {[
              {label:"Precio campo (avg)",val:campoAvg,color:C.green,lock:false},
              {label:`Flete ${mercado.ruta}`,val:mercado.flete,color:C.amber,lock:false},
              {label:"Spread / margen",val:Math.max(0,spread-mercado.flete),color:C.blue,lock:!unlocked},
            ].map(row=>(
              <div key={row.label}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,color:C.tx2}}>{row.label}</span>
                  {row.lock
                    ?<span style={{fontSize:13,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>$-.--/kg</span>
                    :<span style={{fontSize:13,fontWeight:800,color:row.color}}>${row.val.toFixed(2)}/kg</span>
                  }
                </div>
                <div style={{height:6,background:C.border,borderRadius:3}}>
                  <div style={{height:"100%",width:row.lock?"25%":`${(row.val/mercado.precioHoy)*100}%`,background:row.lock?C.tx3:row.color+"99",borderRadius:3}}/>
                </div>
              </div>
            ))}
            <Hr/>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:C.tx2,fontWeight:700}}>Total destino</span>
              {unlocked
                ?<span style={{fontSize:14,fontWeight:900,color:color}}>${mercado.precioHoy.toFixed(2)}/kg</span>
                :<span style={{fontSize:14,fontWeight:900,color:C.tx3,filter:"blur(4px)"}}>$-.--/kg</span>
              }
            </div>
          </div>
        </Card>
      )}

      <Card style={{marginBottom:16}}>
        <Lbl>México · USA · Dubai</Lbl>
        <div style={{marginTop:10}}>
          {MERCADOS.map(m=>{
            const isThis=m.id===mercado.id;
            const mg=campoAvg>0?((m.precioHoy-campoAvg-m.flete)/m.precioHoy*100):null;
            return(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:isThis?"8px 10px":"8px 0",borderBottom:`1px solid ${C.border}`,background:isThis?C.blueDim:"transparent",borderRadius:isThis?8:0,margin:isThis?"2px 0":0}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>{m.bandera}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:isThis?800:600,color:isThis?C.blue:C.tx1}}>{m.nombre}</div>
                    <div style={{fontSize:10,color:C.tx3}}>{m.ruta}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  {unlocked
                    ?<><div style={{fontSize:14,fontWeight:800,color:isThis?C.blue:C.tx1}}>${m.precioHoy.toFixed(2)}</div>{mg!==null&&<div style={{fontSize:11,color:mg>=20?C.green:mg>=10?C.amber:C.red,fontWeight:700}}>{mg.toFixed(1)}% mg</div>}</>
                    :<div style={{fontSize:14,fontWeight:800,color:C.tx3,filter:"blur(4px)"}}>$-.--</div>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── REGISTRAR ────────────────────────────────────────────────────────────────
// ─── CATÁLOGO DE PRODUCTOS — arquitectura dinámica por producto ──────────────
// Agregar nuevo producto = agregar un objeto aquí. La UI se genera automáticamente.
const PRODUCTOS = {
  hass: {
    id:"hass", nombre:"Aguacate Hass", emoji:"🥑",
    hs_code:"0804.40.01", caja_kg:10.5,
    atributos:[
      { id:"calibre", label:"Calibre", requerido:true, colorActivo:"green",
        opciones:[
          {id:"32", label:"Cal. 32/36 · Superextra (>280g)"},
          {id:"48", label:"Cal. 48 · Primera (205–265g) ★", default:true},
          {id:"60", label:"Cal. 60 · Primera B (170–205g)"},
          {id:"70", label:"Cal. 70 · Mediano (155–170g)"},
          {id:"84", label:"Cal. 84+ · Comercial (<155g)"},
        ]
      },
      { id:"tipo", label:"Tipo", requerido:true, colorActivo:"purple",
        opciones:[
          {id:"conv", label:"Convencional", default:true},
          {id:"org",  label:"Orgánico certificado (+20–30%)"},
        ]
      },
      { id:"calidad", label:"Calidad", requerido:true, colorActivo:"blue",
        opciones:[
          {id:"A", label:"Clase A · Premium exportación", default:true},
          {id:"B", label:"Clase B · Estándar"},
          {id:"C", label:"Clase C · Industrial / proceso"},
        ]
      },
      { id:"nota", label:"Notas del producto", requerido:false, tipo:"texto",
        placeholder:"Ej. Alto contenido de aceite, GlobalG.A.P. vigente, disponible esta semana..."
      },
    ]
  },
  tomate: {
    id:"tomate", nombre:"Tomate Saladette", emoji:"🍅",
    hs_code:"0702.00.01", caja_kg:12.0,
    atributos:[
      { id:"calidad", label:"Calidad", requerido:true, colorActivo:"green",
        opciones:[
          {id:"extra",   label:"Extra · Sin defectos exportación", default:true},
          {id:"primera", label:"Primera · Defectos mínimos"},
          {id:"segunda", label:"Segunda · Para proceso"},
        ]
      },
      { id:"presentacion", label:"Presentación", requerido:true, colorActivo:"blue",
        opciones:[
          {id:"caja",     label:"Caja estándar 12 kg", default:true},
          {id:"granel",   label:"Granel"},
          {id:"clamshell",label:"Clamshell (exportación premium)"},
        ]
      },
      { id:"nota", label:"Notas", requerido:false, tipo:"texto",
        placeholder:"Ej. Sinaloa, punto de madurez 3, disponible lunes..."
      },
    ]
  },
  limon: {
    id:"limon", nombre:"Limón Persa", emoji:"🍋",
    hs_code:"0805.50.01", caja_kg:18.0,
    atributos:[
      { id:"calibre", label:"Calibre", requerido:true, colorActivo:"green",
        opciones:[
          {id:"110", label:"Cal. 110 · Extra grande"},
          {id:"140", label:"Cal. 140 · Grande", default:true},
          {id:"175", label:"Cal. 175 · Mediano"},
          {id:"200", label:"Cal. 200+ · Chico"},
        ]
      },
      { id:"calidad", label:"Calidad", requerido:true, colorActivo:"blue",
        opciones:[
          {id:"A", label:"Clase A · Exportación", default:true},
          {id:"B", label:"Clase B · Nacional"},
        ]
      },
      { id:"nota", label:"Notas", requerido:false, tipo:"texto",
        placeholder:"Ej. Veracruz, sin cera, GlobalG.A.P...."
      },
    ]
  },
  pitaya: {
    id:"pitaya", nombre:"Pitaya Roja", emoji:"🐉",
    hs_code:"0810.90.99", caja_kg:5.0,
    atributos:[
      { id:"calibre", label:"Tamaño", requerido:true, colorActivo:"green",
        opciones:[
          {id:"jumbo",   label:"Jumbo · >500g/pieza"},
          {id:"extra",   label:"Extra · 350–500g", default:true},
          {id:"primera", label:"Primera · 250–350g"},
          {id:"segunda", label:"Segunda · <250g"},
        ]
      },
      { id:"variedad", label:"Variedad", requerido:true, colorActivo:"purple",
        opciones:[
          {id:"roja",    label:"Roja (Hylocereus costaricensis)", default:true},
          {id:"blanca",  label:"Blanca (H. undatus)"},
          {id:"amarilla",label:"Amarilla — precio premium"},
        ]
      },
      { id:"nota", label:"Notas", requerido:false, tipo:"texto",
        placeholder:"Ej. Jalisco, cosecha esta semana, sin daños..."
      },
    ]
  },
};

// Colores por atributo
const ATTR_COLORS = {
  green:  {bg:C.greenDim,  border:C.greenBorder,  tx:C.green},
  blue:   {bg:C.blueDim,   border:C.blueBorder,   tx:C.blue},
  amber:  {bg:C.amberDim,  border:C.amberBorder,  tx:C.amber},
  purple: {bg:"#A78BFA18", border:"#A78BFA35",    tx:"#A78BFA"},
};

// ─── SELECTOR DE PRODUCTO ─────────────────────────────────────────────────────
function SelectorProducto({onSelect}){
  return(
    <div style={{padding:"20px 16px 0"}}>
      <Val size={19}>¿Qué producto publicas?</Val>
      <div style={{fontSize:12,color:C.tx2,marginBottom:24,marginTop:4}}>Selecciona el producto para ver sus atributos específicos</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {Object.values(PRODUCTOS).map(p=>(
          <button key={p.id} onClick={()=>onSelect(p.id)}
            style={{width:"100%",padding:"16px 18px",background:C.surface,border:"1.5px solid "+C.border,borderRadius:14,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.greenBorder;e.currentTarget.style.background=C.greenDim;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
            <div style={{fontSize:32,flexShrink:0}}>{p.emoji}</div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.tx1}}>{p.nombre}</div>
              <div style={{fontSize:11,color:C.tx2,marginTop:2}}>HS {p.hs_code} · caja {p.caja_kg} kg</div>
            </div>
            <div style={{marginLeft:"auto",fontSize:18,color:C.tx3}}>›</div>
          </button>
        ))}
      </div>
      <div style={{marginTop:16,padding:"10px 14px",background:C.surfaceHigh,borderRadius:10,fontSize:11,color:C.tx3,textAlign:"center"}}>
        Más productos próximamente · pitaya, mango, fresa, espárrago
      </div>
    </div>
  );
}

// ─── REGISTRAR — dinámico por producto ───────────────────────────────────────
function Registrar({user,onSubmit}){
  const [productoId,setProductoId]=useState(null);
  const [precio,setPrecio]=useState("");
  const [volumen,setVolumen]=useState("");
  const [attrs,setAttrs]=useState({});  // {calibre:"48", tipo:"conv", calidad:"A", nota:""}

  // Al seleccionar producto, inicializar atributos con defaults
  function selectProducto(pid){
    const p=PRODUCTOS[pid];
    const defaults={};
    p.atributos.forEach(attr=>{
      if(attr.tipo==="texto") defaults[attr.id]="";
      else {
        const def=attr.opciones.find(o=>o.default);
        defaults[attr.id]=def?def.id:attr.opciones[0].id;
      }
    });
    setAttrs(defaults);
    setProductoId(pid);
    setPrecio("");
    setVolumen("");
  }

  function setAttr(id,val){ setAttrs(prev=>({...prev,[id]:val})); }

  function handleSubmit(){
    if(!precio||!productoId)return;
    const p=PRODUCTOS[productoId];
    // Construir label legible de atributos
    const attrsLabel = p.atributos
      .filter(a=>a.tipo!=="texto"&&attrs[a.id])
      .map(a=>{ const op=a.opciones.find(o=>o.id===attrs[a.id]); return op?op.label.split("·")[0].trim():""; })
      .filter(Boolean).join(" · ");
    onSubmit({
      user:user.nombre, role:user.role, region:user.region, pais:user.pais,
      precio:parseFloat(precio), tipo:user.role==="productor"?"campo":"venta",
      ts:Date.now(), kg:parseInt(volumen)||0,
      producto:p.nombre, productoId:p.id, productoEmoji:p.emoji,
      caja_kg:p.caja_kg, hs_code:p.hs_code,
      atributos:attrs, atributosLabel:attrsLabel,
      nota:attrs.nota||"",
      // Para compatibilidad con feed existente
      calibre:attrsLabel, calidad:attrs.calidad||"",
      confiabilidad:80, reportes:1,
    });
  }

  // Step 1 — seleccionar producto
  if(!productoId) return <SelectorProducto onSelect={selectProducto}/>;

  const producto=PRODUCTOS[productoId];

  return(
    <div style={{padding:"20px 16px 0",paddingBottom:32}}>
      {/* Header con producto seleccionado */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
        <button onClick={()=>setProductoId(null)} style={{background:"none",border:"none",color:C.tx2,cursor:"pointer",fontSize:13,padding:0}}>← Cambiar</button>
      </div>

      <Val size={19}>Publicar precio</Val>
      <div style={{fontSize:12,color:C.tx2,marginBottom:16,marginTop:4}}>
        {user.role==="productor"?"🌱":"🏪"} {user.region}
      </div>

      <div style={{marginBottom:16,padding:"12px 16px",background:C.greenDim,border:"1px solid "+C.greenBorder,borderRadius:12}}>
        <div style={{fontSize:13,fontWeight:800,color:C.green,marginBottom:2}}>🔓 Desbloquea el mercado</div>
        <div style={{fontSize:12,color:C.tx2}}>Publica tu precio y ve todos los precios del mercado.</div>
      </div>

      {/* Badge producto */}
      <Card style={{marginBottom:20,padding:"12px 16px",borderColor:C.borderMid}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:30}}>{producto.emoji}</div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.tx1}}>{producto.nombre}</div>
            <div style={{fontSize:11,color:C.tx2}}>HS {producto.hs_code} · caja {producto.caja_kg} kg · {user.role==="productor"?"precio de campo":"precio de venta"}</div>
          </div>
        </div>
      </Card>

      {/* Atributos dinámicos por producto */}
      {producto.atributos.map(attr=>{
        if(attr.tipo==="texto") return(
          <div key={attr.id} style={{marginBottom:16}}>
            <Lbl>{attr.label}{!attr.requerido?" — opcional":""}</Lbl>
            <textarea value={attrs[attr.id]||""} onChange={e=>setAttr(attr.id,e.target.value)} rows={2}
              placeholder={attr.placeholder}
              style={{width:"100%",background:C.surfaceHigh,border:"1px solid "+C.border,borderRadius:12,color:C.tx1,fontSize:13,padding:"12px 14px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5}}/>
          </div>
        );
        const clr=ATTR_COLORS[attr.colorActivo]||ATTR_COLORS.blue;
        return(
          <div key={attr.id} style={{marginBottom:16}}>
            <Lbl>{attr.label}</Lbl>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {attr.opciones.map(op=>{
                const sel=attrs[attr.id]===op.id;
                return(
                  <button key={op.id} onClick={()=>setAttr(attr.id,op.id)}
                    style={{padding:"10px 14px",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer",textAlign:"left",
                      background:sel?clr.bg:C.surface,
                      border:"1.5px solid "+(sel?clr.border:C.border),
                      color:sel?clr.tx:C.tx2}}>
                    {op.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Precio */}
      <div style={{marginBottom:16,marginTop:4}}>
        <Lbl>{user.role==="productor"?"Precio de campo (USD/kg)":"Precio de venta (USD/kg)"}</Lbl>
        <div style={{display:"flex",alignItems:"center",background:C.surfaceHigh,border:"1.5px solid "+C.borderMid,borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"0 16px",fontSize:22,color:C.tx3}}>$</div>
          <input type="number" value={precio} step="0.05" placeholder="0.00" onChange={e=>setPrecio(e.target.value)}
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.tx1,fontSize:32,fontWeight:900,padding:"16px 0"}}/>
          <div style={{padding:"0 14px",fontSize:13,color:C.tx3}}>USD/kg</div>
        </div>
        {precio&&<div style={{marginTop:6,fontSize:12,color:C.tx2}}>= <strong style={{color:C.tx1}}>${(parseFloat(precio)*producto.caja_kg).toFixed(2)}</strong> por caja de {producto.caja_kg} kg</div>}
      </div>

      {/* Volumen */}
      <div style={{marginBottom:22}}>
        <Lbl>Volumen disponible (kg) — opcional</Lbl>
        <input type="number" value={volumen} placeholder="Ej. 5000" onChange={e=>setVolumen(e.target.value)}
          style={{width:"100%",background:C.surfaceHigh,border:"1px solid "+C.border,borderRadius:12,color:C.tx1,fontSize:16,fontWeight:600,padding:"12px 14px",outline:"none",boxSizing:"border-box"}}/>
      </div>

      <div style={{marginBottom:22,padding:"10px 14px",background:C.amberDim,border:"1px solid "+C.amberBorder,borderRadius:10}}>
        <div style={{fontSize:11,color:C.amber,fontWeight:700,marginBottom:2}}>⏱ VALIDEZ 7 DÍAS</div>
        <div style={{fontSize:12,color:C.tx2}}>Después de 7 días necesitas publicar un precio nuevo para mantener acceso.</div>
      </div>

      <button onClick={handleSubmit} disabled={!precio}
        style={{width:"100%",padding:"16px 0",borderRadius:13,fontSize:16,fontWeight:900,
          background:precio?C.green:C.border,color:precio?C.bg:C.tx3,
          border:"none",cursor:precio?"pointer":"default",
          boxShadow:precio?"0 6px 24px #22C55E33":"none"}}>
        🔓 Publicar y desbloquear mercado
      </button>
    </div>
  );
}


// ─── FEED ─────────────────────────────────────────────────────────────────────
function Feed({prices,user,unlocked,onUserTap,onMercadoTap,onPublish}){
  const [filter,setFilter]=useState("todos");
  const active=prices.filter(p=>isActive(p.ts));
  const filtered=filter==="todos"?prices:prices.filter(p=>p.role===filter);
  const avgC=avg(active.filter(p=>p.role==="productor").map(p=>p.precio));
  const avgV=avg(active.filter(p=>p.role==="minorista").map(p=>p.precio));

  return(
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div>
          <div style={{fontSize:11,color:C.green,fontWeight:800,letterSpacing:"0.1em",marginBottom:3}}>EXPORTIA · MERCADO</div>
          <div style={{fontSize:19,fontWeight:900,color:C.tx1}}>Aguacate Hass</div>
          <div style={{fontSize:12,color:C.tx2}}>{prices.length} reportes · {new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</div>
        </div>
        <Chip color={user.role==="productor"?"green":"blue"}>{user.role}</Chip>
      </div>

      {!unlocked&&<PaywallBanner onPublish={onPublish}/>}
      {unlocked&&<div style={{marginBottom:14,padding:"10px 14px",background:C.greenDim,border:`1px solid ${C.greenBorder}`,borderRadius:10,fontSize:12,color:C.green,fontWeight:700}}>🔓 Acceso completo · precios visibles</div>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {label:"Campo avg",val:avgC>0?`$${avgC.toFixed(2)}`:"—",color:C.green},
          {label:"Venta avg",val:avgV>0?`$${avgV.toFixed(2)}`:"—",color:C.blue},
          {label:"Spread",val:avgC>0&&avgV>0?`$${(avgV-avgC).toFixed(2)}`:"—",color:C.amber},
        ].map(s=>(
          <Card key={s.label} style={{padding:"10px 10px"}}>
            <Lbl>{s.label}</Lbl>
            {unlocked?<Val size={15} color={s.color}>{s.val}</Val>:<div style={{fontSize:15,fontWeight:800,color:C.tx3,filter:"blur(5px)"}}>$-.--</div>}
          </Card>
        ))}
      </div>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:C.tx3,fontWeight:700,letterSpacing:"0.06em",marginBottom:8}}>MERCADOS · TOCA PARA VER ANALÍTICAS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {MERCADOS.map(m=>{
            const mg=avgC>0?((m.precioHoy-avgC-m.flete)/m.precioHoy*100):null;
            return(
              <div key={m.id} onClick={()=>onMercadoTap(m)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 10px",cursor:"pointer",textAlign:"center",userSelect:"none"}}>
                <div style={{fontSize:22,marginBottom:4}}>{m.bandera}</div>
                <div style={{fontSize:12,fontWeight:700,color:C.tx1,marginBottom:4}}>{m.nombre}</div>
                {unlocked
                  ?<><div style={{fontSize:16,fontWeight:900,color:m.tipo==="campo"?C.green:m.tipo==="fob"?C.amber:C.blue}}>${m.precioHoy.toFixed(2)}</div>{mg!==null&&<div style={{fontSize:10,color:mg>=20?C.green:mg>=10?C.amber:C.red,fontWeight:700,marginTop:2}}>{mg.toFixed(1)}% mg</div>}</>
                  :<div style={{fontSize:16,fontWeight:900,color:C.tx3,filter:"blur(5px)"}}>$-.--</div>
                }
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[{id:"todos",label:"Todos"},{id:"productor",label:"🌱 Campo"},{id:"minorista",label:"🏪 Venta"}].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:"7px 10px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:filter===f.id?C.surfaceHigh:"transparent",border:`1px solid ${filter===f.id?C.borderMid:"transparent"}`,color:filter===f.id?C.tx1:C.tx3}}>{f.label}</button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10,paddingBottom:16}}>
        {filtered.map(p=>(
          <Card key={p.id} onClick={()=>onUserTap(p)} style={{padding:14,opacity:isActive(p.ts)?1:0.65}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <Avatar name={p.user} role={p.role} emoji={p.productoEmoji||"🥑"}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.tx1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"55%"}}>{p.user}</div>
                  {unlocked
                    ?<div style={{fontSize:22,fontWeight:900,color:p.role==="productor"?C.green:C.blue}}>${p.precio.toFixed(2)}<span style={{fontSize:11,color:C.tx3}}>/kg</span></div>
                    :<div style={{fontSize:22,fontWeight:900,color:C.tx3,filter:"blur(5px)"}}>$-.--</div>
                  }
                </div>
                {/* Producto badge */}
                <div style={{fontSize:11,color:p.role==="productor"?C.green:C.blue,fontWeight:700,marginBottom:4}}>
                  {p.producto||"Aguacate Hass"}{p.atributosLabel?" · "+p.atributosLabel:""}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:11,color:C.tx2}}>{p.region}</div>
                    <div style={{fontSize:10,color:C.tx3,marginTop:1}}>{p.kg.toLocaleString()}kg · {relTime(p.ts)}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:C.tx3}}>🔥{p.reportes}</span>
                    <Chip color={isActive(p.ts)?"green":"amber"}>{isActive(p.ts)?"Hoy":"Ref."}</Chip>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD PERSONAL ───────────────────────────────────────────────────────
function Dashboard({user,prices,unlocked,onLogout,onResetOnboarding}){
  const myPrices=prices.filter(p=>p.user===user.nombre).sort((a,b)=>b.ts-a.ts);
  const myLast=myPrices[0];
  const diasRestantes=myLast?Math.max(0,7-Math.floor((Date.now()-myLast.ts)/(1000*60*60*24))):null;
  const best=MERCADOS.filter(m=>m.id!=="mex").sort((a,b)=>b.precioHoy-a.precioHoy)[0];

  return(
    <div style={{padding:"16px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:16,background:user.role==="productor"?C.greenDim:C.blueDim,border:`2px solid ${user.role==="productor"?C.greenBorder:C.blueBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:user.role==="productor"?C.green:C.blue}}>
            {user.nombre.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
          </div>
          <div>
            <Val size={17}>{user.nombre}</Val>
            <div style={{fontSize:12,color:C.tx2}}>{user.region}</div>
            <div style={{marginTop:4}}><Chip color={user.role==="productor"?"green":"blue"}>{user.role}</Chip></div>
          </div>
        </div>
        <button onClick={onLogout} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,color:C.tx3,fontSize:11,padding:"6px 10px",cursor:"pointer"}}>Salir</button>
      </div>

      <div style={{marginBottom:14,padding:"12px 16px",background:unlocked?C.greenDim:C.amberDim,border:`1px solid ${unlocked?C.greenBorder:C.amberBorder}`,borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:20}}>{unlocked?"🔓":"🔒"}</div>
        <div>
          <div style={{fontSize:13,fontWeight:800,color:unlocked?C.green:C.amber}}>{unlocked?"Acceso completo al mercado":"Sin acceso al mercado"}</div>
          <div style={{fontSize:11,color:C.tx2}}>{unlocked&&diasRestantes!==null?`Tu precio expira en ${diasRestantes} días`:"Publica tu precio para desbloquear"}</div>
        </div>
      </div>

      {myLast?(
        <Card style={{marginBottom:12,borderColor:user.role==="productor"?C.greenBorder:C.blueBorder}}>
          <Lbl>Tu último precio</Lbl>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:6}}>
            <div>
              <Val size={28} color={user.role==="productor"?C.green:C.blue}>${myLast.precio.toFixed(2)}</Val>
              <div style={{fontSize:12,color:C.tx2,marginTop:2}}>USD/kg · {relTime(myLast.ts)}</div>
            </div>
            <Chip color={isActive(myLast.ts)?"green":"amber"}>{isActive(myLast.ts)?"Activo":"Expirado"}</Chip>
          </div>
          {diasRestantes!==null&&diasRestantes<=2&&<div style={{marginTop:10,padding:"8px 12px",background:C.amberDim,borderRadius:8,fontSize:11,color:C.amber}}>⚠ Expira en {diasRestantes} {diasRestantes===1?"día":"días"} — actualiza para mantener acceso</div>}
        </Card>
      ):(
        <Card style={{marginBottom:12,borderStyle:"dashed"}}>
          <div style={{textAlign:"center",padding:"14px 0"}}>
            <div style={{fontSize:13,color:C.tx2}}>Aún no has publicado ningún precio</div>
          </div>
        </Card>
      )}

      <Card style={{marginBottom:12}}>
        <Lbl>Mejor destino hoy</Lbl>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <div><div style={{fontSize:15,fontWeight:800,color:C.tx1}}>{best.bandera} {best.nombre}</div><div style={{fontSize:11,color:C.tx2}}>{best.ruta}</div></div>
          <Val size={20} color={C.blue}>${best.precioHoy.toFixed(2)}</Val>
        </div>
      </Card>

      <Card style={{marginBottom:12,borderColor:C.amberBorder}}>
        <Lbl>Temporada actual · Jalisco</Lbl>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
          <div><div style={{fontSize:13,fontWeight:700,color:C.amber}}>⚠ Marceña / Loca</div><div style={{fontSize:11,color:C.tx2,marginTop:2}}>Jun–Sep · escasez activa</div></div>
          <Chip color="amber">Evaluar</Chip>
        </div>
      </Card>

      {myPrices.length>0&&(
        <Card style={{marginBottom:12}}>
          <Lbl>Mi historial</Lbl>
          <div style={{marginTop:10}}>
            {myPrices.slice(0,8).map((p,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<Math.min(myPrices.length,8)-1?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:12,color:C.tx2}}>{relTime(p.ts)}</span>
                <span style={{fontSize:14,fontWeight:800,color:user.role==="productor"?C.green:C.blue}}>${p.precio.toFixed(2)}/kg</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Botón para ver onboarding de nuevo — útil para demo */}
      <button onClick={onResetOnboarding} style={{width:"100%",marginBottom:16,padding:"12px 0",borderRadius:10,background:"transparent",border:`1px dashed ${C.border}`,color:C.tx3,fontSize:12,cursor:"pointer"}}>
        Ver pantalla de bienvenida de nuevo
      </button>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function ExportIA(){
  const [user,setUser]=useState(null);
  const [screen,setScreen]=useState("feed");
  const [prices,setPrices]=useState(SEED);
  const [subScreen,setSubScreen]=useState(null);
  const [showOnboarding,setShowOnboarding]=useState(false);

  useEffect(()=>{
    const savedUser=lsGet("exportia:user");
    const savedPrices=lsGet("exportia:prices");
    if(savedUser) setUser(savedUser);
    if(savedPrices&&savedPrices.length>0){
      const ids=new Set(savedPrices.map(p=>p.id));
      const merged=[...savedPrices,...SEED.filter(p=>!ids.has(p.id))];
      setPrices(merged.sort((a,b)=>b.ts-a.ts));
    }
  },[]);

  function handleComplete(u){
    lsSet("exportia:user",u);
    setUser(u);
    setShowOnboarding(false);
    setScreen("registrar");
  }

  function handleNewPrice(entry){
    const newEntry={...entry,id:Date.now()};
    const updated=[newEntry,...prices];
    setPrices(updated);
    lsSet("exportia:prices",updated);
    setScreen("feed");
  }

  function handleLogout(){
    lsDel("exportia:user");
    lsDel("exportia:prices");
    setUser(null);
    setPrices(SEED);
    setScreen("feed");
    setSubScreen(null);
  }

  // Mostrar onboarding si no hay usuario O si se pidió ver de nuevo
  if(!user||showOnboarding) return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <Onboarding onComplete={handleComplete}/>
    </div>
  );

  const unlocked=prices.some(p=>p.user===user.nombre&&isActive(p.ts));
  const avgCampo=avg(prices.filter(p=>p.role==="productor"&&isActive(p.ts)).map(p=>p.precio));

  // Pantalla de mercado — drill down
  if(subScreen?.type==="mercado") return(
    <div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',system-ui,sans-serif",color:C.tx1,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
        <AnaliticasMercado
          mercado={subScreen.data}
          onBack={()=>setSubScreen(null)}
          campoAvg={avgCampo}
          unlocked={unlocked}
          onPublish={()=>{setSubScreen(null);setScreen("registrar");}}
        />
      </div>
    </div>
  );

  if(subScreen?.type==="perfil") return(
    <div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",fontFamily:"'Inter',system-ui,sans-serif",color:C.tx1,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
        <PerfilPublico
          entry={subScreen.data}
          onBack={()=>setSubScreen(null)}
          allPrices={prices}
          unlocked={unlocked}
        />
      </div>
    </div>
  );

  const screens={
    feed:<Feed prices={prices} user={user} unlocked={unlocked}
      onUserTap={p=>setSubScreen({type:"perfil",data:p})}
      onMercadoTap={m=>setSubScreen({type:"mercado",data:m})}
      onPublish={()=>setScreen("registrar")}/>,
    registrar:<Registrar user={user} onSubmit={handleNewPrice}/>,
    dashboard:<Dashboard user={user} prices={prices} unlocked={unlocked}
      onLogout={handleLogout}
      onResetOnboarding={()=>setShowOnboarding(true)}/>,
  };

  return(
    <div style={{background:C.bg,minHeight:"100vh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",fontFamily:"'Inter',system-ui,sans-serif",color:C.tx1}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
        {screens[screen]}
      </div>
      <BottomNav screen={screen} setScreen={s=>{setScreen(s);setSubScreen(null);}}/>
    </div>
  );
}
