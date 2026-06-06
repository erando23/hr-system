"use client";
// src/components/ui/index.js
// Semua UI primitif yang dipakai di seluruh aplikasi

export const T = {
  bg:"#0A0E17",bg1:"#0F1420",bg2:"#141B2D",bg3:"#1A2340",
  line:"#1E2D4A",lineL:"#253557",
  t0:"#E8F0FF",t1:"#8FA5CC",t2:"#4A5E82",
  em:"#00D4AA",emD:"#00251D",
  blue:"#3B82F6",blueD:"#0D1F3C",
  amber:"#F59E0B",amberD:"#1F1500",
  red:"#EF4444",redD:"#2A0808",
  purple:"#A855F7",purpleD:"#1A0A2E",
  fS:"var(--font-jakarta,'Plus Jakarta Sans',sans-serif)",
  fM:"var(--font-mono,'JetBrains Mono',monospace)",
};

export const SHIFTS = {
  P:{label:"Pagi", start:"07:00",end:"15:00",color:T.em,    bg:T.emD    },
  S:{label:"Siang",start:"11:00",end:"19:00",color:T.amber, bg:T.amberD },
  M:{label:"Malam",start:"15:00",end:"23:00",color:T.purple,bg:T.purpleD},
  L:{label:"Libur",start:null,   end:null,   color:T.t2,    bg:T.bg3    },
};

export const DAYS_ID = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];
export const DAYS_S  = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
export const MONTHS  = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export const formatRp = n => "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(Math.abs(n||0)));
export const formatMins = m => !m?"—":m<60?`${m} mnt`:`${Math.floor(m/60)}j ${m%60}m`;
export const initials = name => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
export function getDayAndWeek(date=new Date()){
  const jsDay=date.getDay();
  const dayIdx=jsDay===0?6:jsDay-1;
  const weekIdx=Math.min(Math.floor((date.getDate()-1)/7),3);
  return {dayIdx,weekIdx};
}
export function calcDist(lat1,lng1,lat2,lng2){
  const R=6371000,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export function Pill({color,bg,children,small}){
  return <span style={{display:"inline-flex",alignItems:"center",padding:small?"1px 7px":"3px 10px",borderRadius:20,fontSize:small?8:10,fontFamily:T.fM,fontWeight:500,letterSpacing:.5,color:color||T.t1,background:bg||T.bg3,border:"1px solid transparent"}}>{children}</span>;
}

export function Avatar({name,color="#00D4AA",bg="#00251D",size=32}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,border:`1.5px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontFamily:T.fM,fontWeight:700,color,flexShrink:0}}>{initials(name)}</div>;
}

export function Card({children,style={},p="20px 22px"}){
  return <div style={{background:T.bg2,border:`1px solid ${T.line}`,borderRadius:14,padding:p,...style}}>{children}</div>;
}

export function SBtn({children,onClick,variant="primary",size="md",style={},disabled=false}){
  const sizes={sm:{padding:"6px 14px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:14}};
  const variants={primary:{background:T.em,color:"#001A14"},secondary:{background:T.bg3,color:T.t1},danger:{background:T.red,color:"#fff"},ghost:{background:"transparent",color:T.t1,border:`1px solid ${T.line}`},amber:{background:T.amber,color:"#1a0e00"}};
  return <button onClick={onClick} disabled={disabled} style={{border:"none",borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontFamily:T.fS,fontWeight:600,transition:"all .15s",display:"inline-flex",alignItems:"center",gap:6,...sizes[size],...variants[variant],opacity:disabled?.5:1,...style}}>{children}</button>;
}

export function HInput({label,value,onChange,type="text",placeholder,style={}}){
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:10,fontFamily:T.fM,letterSpacing:1.5,color:T.t2,marginBottom:6,textTransform:"uppercase"}}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",boxSizing:"border-box",background:T.bg3,border:`1px solid ${T.lineL}`,borderRadius:8,padding:"10px 13px",color:T.t0,fontFamily:T.fS,fontSize:13,outline:"none",...style}}/>
    </div>
  );
}

export function HSelect({label,value,onChange,options,style={}}){
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:10,fontFamily:T.fM,letterSpacing:1.5,color:T.t2,marginBottom:6,textTransform:"uppercase"}}>{label}</div>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:"100%",background:T.bg3,border:`1px solid ${T.lineL}`,borderRadius:8,padding:"10px 13px",color:T.t0,fontFamily:T.fS,fontSize:13,outline:"none",...style}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Modal({open,onClose,title,children,width=480}){
  if(!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"#00000088",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:T.bg2,border:`1px solid ${T.lineL}`,borderRadius:16,padding:"24px 26px",width,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 80px #000"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700,color:T.t0,fontFamily:T.fS}}>{title}</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:T.t2,cursor:"pointer",fontSize:18}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageTitle({children,sub,action}){
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
      <div>
        <h2 style={{margin:0,fontSize:22,fontFamily:T.fS,fontWeight:800,color:T.t0,letterSpacing:-.5}}>{children}</h2>
        {sub&&<p style={{margin:"4px 0 0",fontSize:13,color:T.t2}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({label,value,sub,color=T.em,icon}){
  return (
    <Card p="18px 20px" style={{position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:14,right:16,fontSize:22,opacity:.08}}>{icon}</div>
      <div style={{fontSize:9,fontFamily:T.fM,letterSpacing:2,color:T.t2,marginBottom:8,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontSize:26,fontFamily:T.fM,fontWeight:700,color,letterSpacing:-1,lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:T.t2,marginTop:4}}>{sub}</div>}
    </Card>
  );
}

export function Th({children,right}){
  return <th style={{padding:"9px 13px",textAlign:right?"right":"left",fontSize:9,fontFamily:T.fM,letterSpacing:1.5,color:T.t2,fontWeight:500,background:T.bg1,borderBottom:`1px solid ${T.line}`,whiteSpace:"nowrap"}}>{children}</th>;
}
export function Td({children,right,mono,bold,color}){
  return <td style={{padding:"11px 13px",textAlign:right?"right":"left",fontSize:13,fontFamily:mono?T.fM:T.fS,borderBottom:`1px solid ${T.line}`,color:color||T.t1,fontWeight:bold?700:400}}>{children}</td>;
}

export function ShiftBadge({sk}){
  const s=SHIFTS[sk]||SHIFTS.L;
  return <Pill color={s.color} bg={s.bg}>{s.label}</Pill>;
}

export function StatusBadge({status}){
  const m={hadir:{c:T.em,b:T.emD},libur:{c:T.t2,b:T.bg3},belum:{c:T.blue,b:T.blueD},terlambat:{c:T.amber,b:T.amberD},izin:{c:T.purple,b:T.purpleD},alpa:{c:T.red,b:T.redD}};
  const x=m[status]||m.belum;
  return <Pill color={x.c} bg={x.b}>{status}</Pill>;
}
