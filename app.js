(function(){
'use strict';

/* Scout · pallavolo. Due lati: L = attaccano loro, N = attacchiamo noi. */

/* ---------- costanti ---------- */
const KEY='scout-pallavolo-v3', KEY2='scout-pallavolo-v2', KEY1='scout-pallavolo-v1';
const $=(s,r)=>(r||document).querySelector(s);
const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mq=q=>{ try{ return !!(window.matchMedia&&window.matchMedia(q).matches); }catch(e){ return false; } };
const reduced=mq('(prefers-reduced-motion: reduce)');
const GH=!!document.querySelector('link[rel="manifest"]');   // versione installabile (GitHub Pages)
const isStandalone=()=>mq('(display-mode: standalone)')||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let installEvt=null;

const ZS=['4','3','2','P','1'], DS=['D','L','T','1','5','6'], OS=['K','D','B','E'];
// colpi per zona: banda e opposto diagonale/parallela/pallonetto; centrale verso 1/5 o pallonetto; seconda linea (pipe e da 1) verso zona 1/6/5
const ZD={'4':['D','L','T'],'3':['1','5','T'],'2':['D','L','T'],'P':['1','6','5'],'1':['1','6','5']};
const LEGACY=new Set(['3D','3L','PD','PL','PT']);   // colpi delle versioni precedenti: restano leggibili
const isC=d=>d==='1'||d==='5'||d==='6';
const isBack=z=>z==='P'||z==='1';
const DN={D:'diagonale',L:'parallela',T:'pallonetto','1':'verso zona 1','5':'verso zona 5','6':'verso zona 6'};
// esiti: stesse quattro lettere, significato visto dal lato che attacca. Colore = com'è andata per noi.
const OUT={
  L:{K:{l:'Punto loro',s:'Punto',q:'loro',c:'var(--red)'},D:{l:'Difesa nostra',s:'Difesa',q:'nostra',c:'var(--green)'},B:{l:'Murata nostra',s:'Murata',q:'nostra',c:'var(--gold)',dk:1},E:{l:'Errore loro',s:'Errore',q:'loro',c:'var(--slate)'}},
  N:{K:{l:'Punto nostro',s:'Punto',q:'nostro',c:'var(--green)'},D:{l:'Difesa loro',s:'Difesa',q:'loro',c:'var(--steel)'},B:{l:'Murata subita',s:'Murata',q:'subita',c:'var(--gold)',dk:1},E:{l:'Errore nostro',s:'Errore',q:'nostro',c:'var(--slate)'}}
};
const OKEY={K:'P',D:'D',B:'M',E:'E'};
const KEYOUT={p:'K',d:'D',m:'B',e:'E'};
const ROLE_KEYS=['','P','O','B','C','L'];
const ROLES={P:'Palleggiatrice',O:'Opposto',B:'Schiacciatrice',C:'Centrale',L:'Libero'};

const svgI=d=>'<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="'+d+'"/></svg>';
const IC={
  check:svgI('M3 8.5l3.2 3L13 4.5'),
  list:svgI('M6 4h7.5M6 8h7.5M6 12h7.5M2.6 4h.1M2.6 8h.1M2.6 12h.1'),
  x:svgI('M4 4l8 8M12 4l-8 8'),
  trash:svgI('M3 4.5h10M6.5 4.5V3h3v1.5M4.6 4.5l.7 8.5h5.4l.7-8.5'),
  copy:svgI('M5.5 5.5h7v7h-7zM3.5 10.5v-7h7'),
  share:svgI('M8 2.5v8M5 5.5l3-3 3 3M3.5 9v4.5h9V9'),
  plus:svgI('M8 3v10M3 8h10'),
  undo:svgI('M5.5 3.5L2.5 6.5l3 3M3 6.5h6.5a3.5 3.5 0 010 7H7.5'),
  shield:svgI('M8 2.3l4.8 1.9v3.9c0 3-2.2 5-4.8 5.7C5.4 13.1 3.2 11.1 3.2 8.1V4.2z'),
  swap:svgI('M3 5.5h9.5M10 3l2.5 2.5L10 8M13 10.5H3.5M6 8l-2.5 2.5L6 13'),
  tip:svgI('M2.5 13C3.5 5.5 10 4 13 10.5M13.7 6.8L13 10.5 9.7 8.6'),
  alert:svgI('M8 2.5l6 10.5H2zM8 6.8v2.8M8 11.3h.01'),
  star:svgI('M8 2.2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.4l-3.6 1.9.7-4L2.2 6.5l4-.6z'),
  ban:svgI('M8 13.5a5.5 5.5 0 100-11 5.5 5.5 0 000 11zM4.1 4.1l7.8 7.8'),
  qr:svgI('M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h1.5M13.5 9.5v1.5M9.5 13.5h4M12 12h.01'),
  cam:svgI('M2.5 5.5h2.2L6 3.8h4l1.3 1.7h2.2v7h-11zM8 11a2 2 0 100-4 2 2 0 000 4z'),
  code:svgI('M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5'),
  table:svgI('M2.5 3.5h11v9h-11zM2.5 6.5h11M2.5 9.5h11M6.5 3.5v9'),
  home:svgI('M2.5 7.5L8 3l5.5 4.5M4 6.5v6.5h8V6.5'),
  merge:svgI('M4 2.5v3.5c0 2 1.5 3 4 3s4 1 4 3v1.5M12 2.5v3.5c0 1.2-.5 2-1.5 2.5M4 13.5v-1'),
  doc:svgI('M4 2.5h5.5l2.5 2.5v8.5H4zM6 7.5h4M6 10h4')
};
const OIC={
  K:'<svg class="oi" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 10.8a2.8 2.8 0 100-5.6 2.8 2.8 0 000 5.6zM8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"/></svg>',
  D:'<svg class="oi" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.3l4.8 1.9v3.9c0 3-2.2 5-4.8 5.7C5.4 13.1 3.2 11.1 3.2 8.1V4.2z"/></svg>',
  B:'<svg class="oi" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13.5V7M6.3 13.5V4.5M9.7 13.5V4.5M13 13.5V7M2 13.5h12"/></svg>',
  E:'<svg class="oi" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>'
};
const BALL='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.6" fill="#FFC72C" stroke="#1F5FB0" stroke-width="1.6"/><g fill="none" stroke="#1F5FB0" stroke-width="1.6" stroke-linecap="round"><path d="M12 12C12.6 7.6 11 4 7.4 1.9"/><path d="M12 12C15.6 14.6 19.6 15 22.4 13.3"/><path d="M12 12C8 13.8 5.8 17.4 5.9 20.7"/></g></svg>';
const SHOT_IC={
  L:'M8 13.5V2.8M3.8 7L8 2.8 12.2 7',
  UL:'M11 13.5L6.2 3M4.3 6.9L6.2 3l3.7 2.1',
  D4:'M3 13L12.6 3.4M6.6 3.2h6.2v6.2',
  D2:'M13 13L3.4 3.4M9.4 3.2H3.2v6.2',
  DC:'M8 14L3 4M2.4 8L3 4l3.5 1.9M8 14l5-10M13.6 8L13 4l-3.5 1.9',
  T:'M2.5 13C3.5 5.5 10 4 13 10.5M13.7 6.8L13 10.5 9.7 8.6'
};
const SHIRT='<svg class="shirt" viewBox="0 0 64 56" aria-hidden="true"><path d="M22 5Q32 13 42 5L53 9L62 20L53 27L49 24V51Q49 53 47 53H17Q15 53 15 51V24L11 27L2 20L11 9Z"/></svg>';

/* ---------- utilità ---------- */
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):'';
const pct=x=>Math.round((x||0)*100)+'%';
const spct=x=>{ const v=Math.round((x||0)*100); return (v>0?'+':v<0?'−':'')+Math.abs(v)+'%'; };
const plural=(n,one,many)=>n===1?one:many;
const att=n=>n+' '+plural(n,'attacco','attacchi');
const pts=n=>n+' '+plural(n,'punto','punti');
const norm=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
const numSort=(a,b)=>(parseInt(a,10)-parseInt(b,10))||String(a).localeCompare(String(b));
const slug=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30);
function shotName(z,d){ if(isC(d)){ if(z==='P') return 'pipe '+DN[d]; if(z==='1') return "l'opposto da 1 "+DN[d]; return 'da 3 verso zona '+d; } if(z==='P') return d==='T'?'pallonetto in pipe':'pipe in '+DN[d]; return d==='T'?'pallonetto da '+z:'da '+z+' in '+DN[d]; }
function shortShot(z,d){ if(isC(d)){ if(z==='P') return 'Pipe verso '+d; if(z==='1') return 'Da 1 verso '+d; return z+' verso '+d; } const w={D:'diag.',L:'para',T:'pallon.'}[d]; return (z==='P'?'Pipe':z)+' '+w; }
function joinIt(a){ return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' e '+a[a.length-1]; }
function newId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,5).padEnd(3,'0'); }
function todayISO(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function fmtDate(iso){ const p=String(iso||'').split('-'); if(p.length!==3) return ''; return p[2]+'/'+p[1]+(+p[0]!==new Date().getFullYear()?'/'+p[0].slice(2):''); }
function fmtDateFull(iso){ const p=String(iso||'').split('-'); return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:''; }
function normNum(n){ n=String(n==null?'':n).trim(); if(n==='?') return '?'; if(!/^\d{1,3}$/.test(n)||parseInt(n,10)>100) return null; return String(parseInt(n,10)); }
function buzz(ms){ try{ if(typeof prefs!=='undefined'&&prefs.haptics===false) return; if(navigator.vibrate) navigator.vibrate(ms||12); }catch(e){} }
const NB=' ';

/* ---------- dati ---------- */
let storageOK=true;
try{ localStorage.setItem('__scout_probe','1'); localStorage.removeItem('__scout_probe'); }catch(e){ storageOK=false; }

function cleanEvent(e){
  if(!e||typeof e!=='object') return null;
  const n=normNum(e.n); if(n===null) return null;
  if(!ZS.includes(e.z)||!DS.includes(e.d)||!OS.includes(e.o)) return null;
  if(!ZD[e.z].includes(e.d)&&!LEGACY.has(e.z+e.d)) return null;
  const s=Math.min(5,Math.max(1,parseInt(e.s,10)||1));
  const t=Number(e.t)>0?Number(e.t):Date.now();
  const id=String(e.id||'').replace(/[^0-9a-z]/gi,'').slice(0,24)||newId();
  return {id,t,n,z:e.z,d:e.d,o:e.o,s,p:e.p==='N'?'N':'L'};
}
function cleanMatch(m){
  if(!m||typeof m!=='object') return null;
  const out={
    id:String(m.id||'').replace(/[^0-9a-z]/gi,'').slice(0,32)||('m'+newId()),
    opp:String(m.opp||'').slice(0,40),
    date:/^\d{4}-\d{2}-\d{2}$/.test(m.date||'')?m.date:todayISO(),
    set:Math.min(5,Math.max(1,parseInt(m.set,10)||1)),
    roster:[],ev:[],alias:[],gone:[],
    created:Number(m.created)>0?Number(m.created):Date.now()
  };
  if(Array.isArray(m.gone)) out.gone=[...new Set(m.gone.map(g=>String(g).replace(/[^0-9a-z]/gi,'')).filter(Boolean))].slice(-1000);
  const seen=new Set(out.gone);
  (Array.isArray(m.ev)?m.ev:[]).forEach(x=>{ const e=cleanEvent(x); if(e&&!seen.has(e.id)){ seen.add(e.id); out.ev.push(e); } });
  out.ev.sort((a,b)=>a.t-b.t);
  const r=new Set();
  (Array.isArray(m.roster)?m.roster:[]).forEach(x=>{ const n=normNum(x); if(n&&n!=='?') r.add(n); });
  out.roster=[...r].sort(numSort);
  if(Array.isArray(m.alias)) out.alias=m.alias.map(a=>String(a).replace(/[^0-9a-z]/gi,'')).filter(Boolean).slice(0,20);
  return out;
}
const newMatch=opp=>cleanMatch({id:'m'+newId(),opp:opp||'',date:todayISO(),created:Date.now()});

// la mia squadra: un registro per numero, vince la modifica più recente (anche tra telefoni)
function cleanTeam(t){
  const out={name:'',at:0,pl:[]};
  if(!t||typeof t!=='object') return out;
  out.name=String(t.name||'').replace(/\s+/g,' ').slice(0,40);
  out.at=Number(t.at)>0?Number(t.at):0;
  const seen=new Map();
  (Array.isArray(t.pl)?t.pl:[]).forEach(x=>{
    if(!x||typeof x!=='object') return;
    const n=normNum(x.n); if(!n||n==='?') return;
    const p={n,nm:String(x.nm||'').replace(/\s+/g,' ').trim().slice(0,24),r:ROLE_KEYS.includes(x.r)?x.r:'',at:Number(x.at)>0?Number(x.at):0};
    if(x.x) p.x=1;
    const o=seen.get(n); if(!o||p.at>=o.at) seen.set(n,p);
  });
  out.pl=[...seen.values()].sort((a,b)=>numSort(a.n,b.n));
  return out;
}
function mergeTeam(t,inc){
  if(!inc) return false;
  let ch=false;
  if((inc.at>t.at&&inc.name!==t.name)||(!t.name&&!t.at&&inc.name)){ t.name=inc.name; t.at=Math.max(t.at,inc.at); ch=true; }
  inc.pl.forEach(p=>{
    const i=t.pl.findIndex(x=>x.n===p.n);
    if(i<0){ t.pl.push(Object.assign({},p)); ch=true; return; }
    const l=t.pl[i];
    if(p.at>l.at&&JSON.stringify(p)!==JSON.stringify(l)){ t.pl[i]=Object.assign({},p); ch=true; }
    else if(!p.at&&!l.x){ // da un codice (senza data): completa solo i campi vuoti
      if(!l.nm&&p.nm){ l.nm=p.nm; ch=true; }
      if(!l.r&&p.r){ l.r=p.r; ch=true; }
    }
  });
  if(ch) t.pl.sort((a,b)=>numSort(a.n,b.n));
  return ch;
}

function readKey(k){ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }
function load(){
  const out={v:3,cur:null,matches:{},deleted:[],team:cleanTeam(null),side:'L'};
  let raw=readKey(KEY), v3=true;
  if(!raw||!raw.matches){ raw=readKey(KEY2); v3=false; }      // prima apertura dopo l'aggiornamento: copio i dati della v2, che restano intatti
  if(raw&&raw.matches&&typeof raw.matches==='object'){
    Object.values(raw.matches).forEach(x=>{ const m=cleanMatch(x); if(m) out.matches[m.id]=m; });
    out.cur=raw.cur;
    if(Array.isArray(raw.deleted)) out.deleted=raw.deleted.map(x=>String(x).replace(/[^0-9a-z]/gi,'')).filter(Boolean).slice(-200);
    out.deleted.forEach(id=>{ delete out.matches[id]; });
    if(v3){ out.team=cleanTeam(raw.team); out.side=raw.side==='N'?'N':'L'; }
  }else{
    const old=readKey(KEY1);
    if(old&&Array.isArray(old.ev)&&(old.ev.length||(old.roster||[]).length)){
      const m=cleanMatch({id:'m'+newId(),opp:old.opp,roster:old.roster,ev:old.ev,set:old.set});
      if(m){ out.matches[m.id]=m; out.cur=m.id; }
    }
  }
  if(!out.cur||!out.matches[out.cur]){
    const list=Object.values(out.matches).sort((a,b)=>b.created-a.created);
    if(list.length) out.cur=list[0].id;
    else{ const m=newMatch(''); out.matches[m.id]=m; out.cur=m.id; }
  }
  return out;
}
let db=load();
const cur=()=>db.matches[db.cur];
function save(){ try{ localStorage.setItem(KEY,JSON.stringify(db)); }catch(e){ storageOK=false; } scheduleSync(); }
const isPristine=m=>!m.ev.length&&!m.roster.length&&!m.opp.trim()&&!m.gone.length;
function markDeleted(id){ db.deleted=db.deleted.filter(x=>x!==id).concat(id).slice(-200); }
function unmarkDeleted(id){ db.deleted=db.deleted.filter(x=>x!==id); }

/* squadra: accesso */
const livePl=()=>db.team.pl.filter(p=>!p.x);
const plOf=n=>db.team.pl.find(p=>p.n===n&&!p.x)||null;
const teamLabel=()=>db.team.name.trim()||'Noi';
const oppLabel=m=>(m||cur()).opp.trim()||'Loro';
function who(n,side){ if(n==='?') return 'n° non visto'; if(side==='N'){ const p=plOf(n); if(p&&p.nm) return '#'+n+' '+p.nm; } return '#'+n; }
const oLab=(side,o)=>OUT[side][o].l;
const evText=e=>who(e.n,e.p)+' '+shotName(e.z,e.d)+', '+oLab(e.p,e.o).toLowerCase();
function setPlayer(n,patch){
  const i=db.team.pl.findIndex(p=>p.n===n);
  const base=i>=0?db.team.pl[i]:{n,nm:'',r:'',at:0};
  const p=Object.assign({},base,patch,{at:Date.now()});
  if(!patch.x) delete p.x;
  if(i>=0) db.team.pl[i]=p; else{ db.team.pl.push(p); db.team.pl.sort((a,b)=>numSort(a.n,b.n)); }
  save();
}

/* ---------- salvataggio nel tuo account Claude (solo se aperta dentro Claude) ---------- */
const cloud={state:'off',base:null,col:null,pushed:{},drop:new Set(),metaSig:'',busy:false,again:false,fail:0,lastPull:0,quotaWarned:false};
let syncT=0;
function scheduleSync(){ if(cloud.state!=='on') return; clearTimeout(syncT); syncT=setTimeout(syncNow,500); }
function toCloud(m){ const o=packMatch(m); o.v=3; o.a=m.alias.join(','); o.c=m.created; o.g=m.gone.join(','); return o; }
const metaOf=()=>({deleted:db.deleted.slice(-200),team:db.team});
function applyCloud(docs,meta){
  let changed=false;
  const delCloud=meta&&Array.isArray(meta.deleted)?meta.deleted.map(String):[];
  const teamCloud=cleanTeam(meta&&meta.team);
  cloud.metaSig=meta?JSON.stringify({deleted:delCloud.slice(-200),team:teamCloud}):'';
  delCloud.forEach(id=>{ if(!db.deleted.includes(id)){ markDeleted(id); changed=true; } });
  db.deleted.forEach(id=>{ if(db.matches[id]){ delete db.matches[id]; changed=true; } });
  if(mergeTeam(db.team,teamCloud)) changed=true;
  const pristineCur=db.matches[db.cur]&&isPristine(db.matches[db.cur])?db.cur:null;
  docs.forEach(d=>{
    const inc=unpackMatch(d.data()); if(!inc) return;
    cloud.pushed[d.id]=JSON.stringify(d.data());
    if(db.deleted.includes(inc.id)) return;
    const local=findLocal(inc.id);
    if(local){
      const before=JSON.stringify(toCloud(local));
      mergeInto(local,inc);
      if(JSON.stringify(toCloud(local))!==before) changed=true;
      if(local.id!==inc.id) cloud.drop.add(inc.id);
    }else{ db.matches[inc.id]=inc; changed=true; }
  });
  if(!db.matches[db.cur]||(pristineCur&&Object.keys(db.matches).length>1)){
    if(pristineCur&&db.matches[pristineCur]&&isPristine(db.matches[pristineCur])) delete db.matches[pristineCur];
    const list=Object.values(db.matches).sort((a,b)=>b.created-a.created);
    if(list.length) db.cur=list[0].id; else{ const n=newMatch(''); db.matches[n.id]=n; db.cur=n.id; }
    changed=true;
  }
  return changed;
}
async function pull(first){
  if(!cloud.col) return;
  cloud.lastPull=Date.now();
  const [meta,qs]=await Promise.all([cloud.base.get(),cloud.col.get()]);
  const before=Object.values(db.matches).reduce((a,m)=>a+m.ev.length,0);
  const changed=applyCloud(qs.docs,meta.exists?meta.data():null);
  if(changed){
    try{ localStorage.setItem(KEY,JSON.stringify(db)); }catch(e){}
    resetSel(); flash=null; renderAll();
    const after=Object.values(db.matches).reduce((a,m)=>a+m.ev.length,0);
    if(first&&after>before) toast(`Dati recuperati dal tuo account: ${att(after)}.`);
  }
}
async function initCloud(){
  try{
    const c=window.claude; if(!c||typeof c.use!=='function') return;
    const [dbx,ux]=await Promise.all([c.use('db'),c.use('user')]);
    if(!dbx||!ux) return;
    const uid=await ux.id(); if(!uid) return;
    cloud.base=dbx.doc('data/users/'+uid+'/scout');
    cloud.col=cloud.base.collection('matches');
    cloud.state='loading'; renderCloudBits();
    await pull(true);
    cloud.state='on'; renderCloudBits();
    scheduleSync();
  }catch(e){
    const code=e&&e.code;
    cloud.state=(code==='unavailable'||code==='resource_exhausted')?'error':'off';
    renderCloudBits();
    if(cloud.state==='error') setTimeout(initCloud,8000);
  }
}
async function syncNow(){
  if(cloud.state!=='on') return;
  if(cloud.busy){ cloud.again=true; return; }
  cloud.busy=true;
  try{
    for(const m of Object.values(db.matches)){
      if(isPristine(m)) continue;
      const body=toCloud(m), sig=JSON.stringify(body);
      if(cloud.pushed[m.id]===sig) continue;
      await cloud.col.doc(m.id).set(body);
      cloud.pushed[m.id]=sig;
    }
    for(const id of db.deleted.concat([...cloud.drop])){
      if(cloud.pushed[id]===undefined&&!cloud.drop.has(id)) continue;
      await cloud.col.doc(id).delete();
      delete cloud.pushed[id]; cloud.drop.delete(id);
    }
    const meta=metaOf(), ms=JSON.stringify(meta);
    const hasMeta=db.deleted.length||db.team.pl.length||db.team.name;
    if(ms!==cloud.metaSig&&(hasMeta||cloud.metaSig)){ await cloud.base.set(JSON.parse(ms)); cloud.metaSig=ms; }
    if(cloud.fail){ cloud.fail=0; renderCloudBits(); }
  }catch(e){
    const code=e&&e.code;
    if(['revoked','not_granted','capability_disabled','capability_removed'].includes(code)){ cloud.state='off'; }
    else if(code==='quota_exceeded'){ if(!cloud.quotaWarned){ cloud.quotaWarned=true; toast('Spazio online pieno: elimina qualche partita vecchia. I dati restano su questo dispositivo.'); } }
    else{ cloud.fail++; setTimeout(scheduleSync,Math.min(30000,2000*cloud.fail)); }
    renderCloudBits();
  }finally{
    cloud.busy=false;
    if(cloud.again){ cloud.again=false; scheduleSync(); }
  }
}
document.addEventListener('visibilitychange',()=>{
  if(cloud.state!=='on') return;
  if(document.visibilityState==='hidden'){ clearTimeout(syncT); syncNow(); }
  else if(Date.now()-cloud.lastPull>15000&&!cloud.busy){ pull(false).catch(()=>{}); }
});
function cloudLine(){
  if(cloud.state==='on') return cloud.fail?'Salvataggio online in pausa: riprovo da solo. Intanto i dati restano su questo dispositivo.':'Salvato nel tuo account Claude: se chiudi la pagina o cambi telefono ritrovi tutto.';
  if(cloud.state==='loading') return 'Recupero i dati dal tuo account…';
  if(cloud.state==='error') return 'Non riesco a collegarmi al tuo account: riprovo da solo. Intanto i dati restano su questo dispositivo.';
  if(GH) return isStandalone()?'Salvato su questo dispositivo: chiudi e riapri quando vuoi, i dati restano.':'Salvato in questo browser. Per non perdere mai niente installala sulla schermata Home.';
  return 'I dati restano solo in questo browser: a fine partita salva il codice o mostra il QR.';
}
function cloudOK(){ return (cloud.state==='on'&&!cloud.fail)||(GH&&isStandalone()); }

/* ---------- statistiche ---------- */
function aggregate(evs){
  const P={}, T={};
  const mk=x=>Object.assign({t:0,K:0,D:0,B:0,E:0},x);
  const bump=(o,e)=>{ o.t++; o[e.o]++; };
  evs.forEach(e=>{
    const p=P[e.n]||(P[e.n]=mk({n:e.n,sh:{}}));
    bump(p,e);
    const k=e.z+e.d;
    bump(p.sh[k]||(p.sh[k]=mk({z:e.z,d:e.d})),e);
    bump(T[k]||(T[k]=mk({z:e.z,d:e.d})),e);
  });
  const players=Object.values(P).map(p=>Object.assign(p,{kp:p.K/p.t,eff:(p.K-p.E-p.B)/p.t,dp:p.D/p.t}));
  return {players,team:T};
}
const totals=evs=>evs.reduce((a,e)=>(a.t++,a[e.o]++,a),{t:0,K:0,D:0,B:0,E:0});
const byUse=(a,b)=>b.t-a.t||b.K-a.K;
const byKill=(a,b)=>b.K-a.K||(b.K/b.t)-(a.K/a.t)||b.t-a.t;
const topShot=p=>Object.values(p.sh).sort(byUse)[0]||null;
const topKill=p=>Object.values(p.sh).filter(s=>s.K>0).sort(byKill)[0]||null;
const tipCount=p=>Object.values(p.sh).filter(s=>s.d==='T').reduce((a,s)=>a+s.t,0);
const lossOf=s=>s.E+s.B;
const worstShot=p=>Object.values(p.sh).filter(s=>s.t>=2&&lossOf(s)>=2).sort((a,b)=>lossOf(b)/b.t-lossOf(a)/a.t||b.t-a.t)[0]||null;

function defense(z,d){
  if(isC(d)) return z==='3'?'zona '+d+' pronta sul primo tempo':'zona '+d+' pronta sull’attacco da dietro';
  if(d==='T') return 'una giocatrice corta dietro il muro';
  if(z==='4') return d==='D'?'zona 5 pronta sulla diagonale':'zona 1 pronta sulla parallela';
  if(z==='2') return d==='D'?'zona 1 pronta sulla diagonale':'zona 5 pronta sulla parallela';
  return d==='L'?'zona 6 pronta in fondo al centro':'zone 1 e 5 pronte sulle diagonali';
}
function blockTip(z,d){ if(isC(d)) return z==='3'?'il nostro centrale chiuda verso zona '+d:z==='P'?'il centrale segua la pipe e chiuda verso zona '+d:'chiudete verso zona '+d; if(d==='T'||z==='3'||z==='P') return ''; return d==='D'?'toglietele la diagonale':'chiudete la parallela'; }

/* dove cade la palla nel campo di chi difende: corta (C) o zone 1/6/5 */
function landing(z,d){
  if(d==='T') return [['C',1]];
  if(isC(d)) return [[d,1]];
  if(z==='4') return [[d==='D'?'5':'1',1]];
  if(z==='2') return [[d==='D'?'1':'5',1]];
  if(d==='L') return [['6',1]];
  return [['1',.5],['5',.5]];   // diagonale da 3 o pipe in diagonale (versioni vecchie)
}
const CELLS=['C','1','6','5'];
const cellName=c=>c==='C'?'corta dietro il muro':'zona '+c;
function heat(evs){
  const H={}; CELLS.forEach(c=>{ H[c]={c,t:0,K:0}; });
  evs.forEach(e=>{ landing(e.z,e.d).forEach(([c,w])=>{ H[c].t+=w; if(e.o==='K') H[c].K+=w; }); });
  return H;
}
const rnd=v=>Math.round(v*10)/10;
const fmtN=v=>String(rnd(v)).replace('.',',');

function insightsL(evs){
  const A=aggregate(evs);
  const named=A.players.filter(p=>p.n!=='?');
  const threats=named.filter(p=>p.t>=3&&p.K>=1).sort((a,b)=>b.K-a.K||b.kp-a.kp||b.t-a.t).slice(0,3);
  const tset=new Set(threats.map(p=>p.n));
  const notes=[];
  named.filter(p=>p.t>=4&&!tset.has(p.n)).forEach(p=>{
    const s=topShot(p), tips=tipCount(p);
    const weak=p.eff<=0, pred=!!(s&&s.t/p.t>=.45), tipHeavy=tips>=2&&tips/p.t>=.25;
    if(!weak&&!pred&&!tipHeavy) return;
    const parts=[];
    if(weak) parts.push(`Efficienza ${spct(p.eff)}: ${pts(p.K)} e ${p.E+p.B} tra errori e murate su ${att(p.t)}.`);
    if(pred) parts.push(`${s.t} attacchi su ${p.t} sono ${shotName(s.z,s.d)}. Difesa: ${defense(s.z,s.d)}.`);
    if(tipHeavy&&!(pred&&s.d==='T')) parts.push(`${tips} pallonetti su ${p.t}: serve una giocatrice corta dietro il muro.`);
    if(weak) parts.push('Si può tenerla con il muro a uno e aiutare sulle altre.');
    const kind=weak?'weak':tipHeavy?'tip':'pred';
    notes.push({kind,n:p.n,head:weak?'Rende poco':tipHeavy?'Usa molto il pallonetto':'Prevedibile',text:parts.join(' ')});
  });
  const ord={pred:0,tip:1,weak:2};
  notes.sort((a,b)=>ord[a.kind]-ord[b.kind]);
  const costly=Object.values(A.team).filter(s=>s.K>0).sort(byKill).slice(0,3);
  return {A,threats,notes,costly};
}
function threatFacts(p){
  const f=[], k=topKill(p), u=topShot(p), tips=tipCount(p);
  if(k){
    f.push(['Dove fa punto',`${shotName(k.z,k.d)} (${k.K}${NB}su${NB}${k.t})`]);
    f.push(['Difesa',defense(k.z,k.d)]);
    const b=blockTip(k.z,k.d); if(b) f.push(['Muro',b]);
  }
  if(u&&(!k||u.z!==k.z||u.d!==k.d)) f.push(['Colpo più usato',`${shotName(u.z,u.d)} (${u.t}${NB}${plural(u.t,'volta','volte')})`]);
  if(tips>=2&&tips/p.t>=.25&&!(k&&k.d==='T')) f.push(['Pallonetto',`${tips} su ${p.t}: serve una giocatrice corta dietro il muro`]);
  if(p.K&&p.kp<.35) f.push(['Nota',`fa punti per quantità, va a segno il ${pct(p.kp)} delle volte`]);
  return f;
}
function insightsN(evs){
  const A=aggregate(evs);
  const named=A.players.filter(p=>p.n!=='?');
  const best=named.filter(p=>p.t>=3&&p.K>=1).sort((a,b)=>b.K-a.K||b.kp-a.kp||b.t-a.t).slice(0,3);
  const shots=Object.values(A.team);
  const work=shots.filter(s=>s.t>=3&&s.K/s.t>=.4).sort((a,b)=>b.K/b.t-a.K/a.t||b.t-a.t).slice(0,3);
  const avoid=shots.filter(s=>s.t>=3&&lossOf(s)/s.t>=.4).sort((a,b)=>lossOf(b)/b.t-lossOf(a)/a.t||b.t-a.t).slice(0,3);
  const struggling=named.filter(p=>p.t>=4&&p.eff<0).sort((a,b)=>a.eff-b.eff).slice(0,3);
  return {A,best,work,avoid,struggling};
}
function usFacts(p){
  const f=[], k=topKill(p), w=worstShot(p), u=topShot(p);
  if(k){ f.push(['Funziona',`${shotName(k.z,k.d)} (${k.K}${NB}su${NB}${k.t})`]); f.push(['Cade in',cellName(landing(k.z,k.d)[0][0])]); }
  if(u&&(!k||u.z!==k.z||u.d!==k.d)) f.push(['Colpo più usato',`${shotName(u.z,u.d)} (${u.t}${NB}${plural(u.t,'volta','volte')})`]);
  if(w) f.push(['Da rivedere',`${shotName(w.z,w.d)}: ${lossOf(w)} tra errori e murate su ${w.t}`]);
  if(p.t>=5&&p.eff<0) f.push(['Nota','in questo momento ci costa più di quanto rende']);
  return f;
}
/* il buco: la zona dove chi attacca fa più punto (minimo 3 palloni) */
function hole(H){ return CELLS.map(c=>H[c]).filter(h=>h.t>=3&&h.K>0).sort((a,b)=>b.K/b.t-a.K/a.t||b.K-a.K)[0]||null; }

function briefPending(m){
  if(m.ev.some(e=>e.s===m.set)) return null;
  if(m.set===5&&sideEv(m.ev,'L').length>=8) return 'tb';
  const prev=m.ev.filter(e=>e.s<m.set).reduce((a,e)=>Math.max(a,e.s),0);
  return prev&&m.ev.filter(e=>e.s===prev).length>=4?prev:null;
}
function removeEvent(mid,id){ const m=db.matches[mid]; if(!m) return false; const i=m.ev.findIndex(x=>x.id===id); if(i<0) return false; const q=qids(m.ev).get(m.ev[i]); m.ev.splice(i,1); m.gone=m.gone.filter(g=>g!==id&&g!==q).concat(id===q?[id]:[id,q]).slice(-1000); save(); return true; }
function restoreEvent(mid,e){ const m=db.matches[mid]; if(!m||m.ev.some(x=>x.id===e.id)) return false; const q=qids(m.ev.concat([e])).get(e); m.gone=m.gone.filter(g=>g!==e.id&&g!==q); m.ev.push(e); m.ev.sort((a,b)=>a.t-b.t); save(); return true; }
function reportText(scope){
  const m=cur(), evs=fEvents(scope), Lv=sideEv(evs,'L'), Nv=sideEv(evs,'N'), I=insightsL(Lv), L=[];
  L.push(`*Scout${m.opp.trim()?' vs '+m.opp.trim():''}*`);
  L.push(`${scopeLabel(scope)}: ${att(Lv.length)} loro${Nv.length?', '+att(Nv.length)+' nostri':''}`);
  if(I.threats.length){
    L.push('','*Le più pericolose*');
    I.threats.forEach((p,i)=>{
      if(i) L.push('');
      L.push(`*#${p.n}*: ${pts(p.K)} su ${att(p.t)} (${pct(p.kp)})`);
      threatFacts(p).forEach(f=>L.push(f[0]+': '+f[1]));
    });
  }
  if(I.notes.length){ L.push('',"*Da tenere d'occhio*"); I.notes.forEach(n=>L.push(`- #${n.n}, ${n.head.toLowerCase()}: ${n.text}`)); }
  if(I.costly.length){ L.push('','*Colpi che ci costano di più*'); I.costly.forEach(s=>L.push(`- ${cap(shotName(s.z,s.d))}: ${pts(s.K)} su ${s.t}. Difesa: ${defense(s.z,s.d)}`)); }
  const all=I.A.players.slice().sort((a,b)=>b.K-a.K||b.t-a.t);
  if(all.length){
    L.push('','*Tutte le avversarie*');
    all.forEach(p=>L.push(`${p.n==='?'?'N° non visto':'#'+p.n}: ${att(p.t)}, ${pts(p.K)}, eff. ${spct(p.eff)}`));
  }
  if(Nv.length){
    const U=insightsN(Nv), tn=totals(Nv), hl=hole(heat(Nv));
    L.push('',`*${teamLabel()} in attacco*`,`${pts(tn.K)} su ${att(tn.t)} (${pct(tn.K/tn.t)}), efficienza ${spct((tn.K-tn.E-tn.B)/tn.t)}`);
    if(U.work.length) L.push('Funziona: '+U.work.map(w=>`${shotName(w.z,w.d)} (${w.K}/${w.t})`).join(', '));
    if(hl) L.push(`Il loro buco: ${cellName(hl.c)} (${fmtN(hl.K)}/${fmtN(hl.t)})`);
    if(U.avoid.length) L.push('Da evitare: '+U.avoid.map(a=>`${shotName(a.z,a.d)} (${lossOf(a)} persi su ${a.t})`).join(', '));
    U.A.players.slice().sort((a,b)=>b.K-a.K||b.t-a.t).forEach(p=>L.push(`${who(p.n,'N')}: ${att(p.t)}, ${pts(p.K)}, eff. ${spct(p.eff)}`));
  }
  if(all.length||Nv.length) L.push('','_Efficienza = (punti − errori − murate) / attacchi_');
  return L.join('\n');
}

/* ---------- SQUADRA ---------- */
function seasonStats(){
  const S={};
  Object.values(db.matches).forEach(m=>m.ev.forEach(e=>{ if(e.p!=='N') return; const s=S[e.n]||(S[e.n]={t:0,K:0,E:0,B:0}); s.t++; if(e.o==='K') s.K++; if(e.o==='E') s.E++; if(e.o==='B') s.B++; }));
  return S;
}
/* ---------- copia e condivisione ---------- */
let shareBlocked=false, readBlocked=false;
function copyText(text){
  let ok=false;
  const span=document.createElement('span');
  span.textContent=text;
  span.setAttribute('aria-hidden','true');
  span.style.cssText='position:fixed;top:0;left:0;clip:rect(0,0,0,0);white-space:pre;-webkit-user-select:text;user-select:text;';
  span.addEventListener('copy',ev=>{ ev.stopPropagation(); if(ev.clipboardData){ ev.preventDefault(); try{ ev.clipboardData.clearData(); ev.clipboardData.setData('text/plain',text); }catch(_){} } });
  document.body.appendChild(span);
  const s=window.getSelection();
  try{ const r=document.createRange(); r.selectNodeContents(span); s.removeAllRanges(); s.addRange(r); ok=document.execCommand('copy'); }catch(err){ ok=false; }
  try{ s.removeAllRanges(); }catch(err){}
  span.remove();
  if(ok) return Promise.resolve(true);
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return Promise.race([navigator.clipboard.writeText(text).then(()=>true,()=>false),new Promise(r=>setTimeout(()=>r(false),1500))]);
  }
  return Promise.resolve(false);
}
function selectAll(el){ try{ const r=document.createRange(); r.selectNodeContents(el); const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); }catch(e){} }
/* ---------- codici per passare i dati ---------- */
function b64dec(b64){ const bin=atob(b64); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i); return new TextDecoder().decode(bytes); }
const evStr=e=>[e.id,e.n,e.z+e.d+e.o+e.s,e.t.toString(36)].join('.');
function packMatch(m){
  const L=m.ev.filter(e=>e.p!=='N'), N=m.ev.filter(e=>e.p==='N');
  const o={i:m.id,o:m.opp,d:m.date,s:m.set,r:m.roster.join(','),e:L.map(evStr).join(',')};
  if(N.length) o.u=N.map(evStr).join(',');   // i nostri attacchi in un campo a parte: le versioni vecchie li ignorano senza confonderli
  if(m.gone.length) o.g=m.gone.join(',');
  return o;
}
function unpackMatch(p){
  if(!p||typeof p!=='object') return null;
  const parse=(str,side)=>String(str||'').split(',').filter(Boolean).map(x=>{ const a=x.split('.'), c=a[2]||''; return {id:a[0],n:a[1],z:c[0],d:c[1],o:c[2],s:parseInt(c.slice(3),10),t:parseInt(a[3],36),p:side}; });
  const list=v=>String(v||'').split(',').filter(Boolean);
  return cleanMatch({id:p.i,opp:p.o,date:p.d,set:p.s,roster:list(p.r),ev:parse(p.e,'L').concat(parse(p.u,'N')),alias:list(p.a),gone:list(p.g),created:p.c});
}
/* codice corto: PV3 (solo avversarie, compatibile con le versioni vecchie) o PV4 (anche la tua squadra). PV1 e PV2 si leggono ancora. */
const ZI=['4','3','2','P','1'], DI=['D','L','T','1','5','6'], OI=['K','D','B','E'];
const TU=4000;   // gli orari viaggiano arrotondati a 4 secondi
const zdo=e=>ZI.indexOf(e.z)*24+DI.indexOf(e.d)*4+OI.indexOf(e.o)+(e.p==='N'?120:0);
function qids(evs){ const cnt={}, out=new Map(); evs.slice().sort((a,b)=>a.t-b.t).forEach(e=>{ const b=qid(e), k=cnt[b]||0; cnt[b]=k+1; out.set(e,k?b+'r'+k:b); }); return out; }
function qid(e){ return 'q'+Math.round(e.t/TU).toString(36)+zdo(e).toString(36).padStart(2,'0')+e.s+(e.n==='?'?'x':e.n); }
function vput(a,v){ v=Math.max(0,Math.floor(v)||0); while(v>=128){ a.push((v%128)+128); v=Math.floor(v/128); } a.push(v); }
function sput(a,str){ const b=new TextEncoder().encode(String(str||'')); vput(a,b.length); b.forEach(x=>a.push(x)); }
const B64U=s=>s.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function bytesToB64u(a){ let bin=''; for(let i=0;i<a.length;i+=0x8000) bin+=String.fromCharCode.apply(null,a.slice(i,i+0x8000)); return B64U(btoa(bin)); }
function b64uToBytes(s){ s=s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; const bin=atob(s); const a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
const DAY0=Date.UTC(2020,0,1);
const teamHasData=t=>!!(t&&(t.name.trim()||t.pl.some(p=>!p.x)));
function encode(ms,withTeam){
  const hasN=ms.some(m=>m.ev.some(e=>e.p==='N'));
  const v4=hasN||(withTeam&&teamHasData(db.team));
  const a=[v4?4:3]; vput(a,ms.length);
  ms.forEach(m=>{
    sput(a,m.id); sput(a,m.opp);
    const p=m.date.split('-'); vput(a,Math.round((Date.UTC(+p[0],+p[1]-1,+p[2])-DAY0)/864e5));
    vput(a,m.set);
    const r=m.roster.map(n=>+n).filter(n=>n>=0&&n<=254); vput(a,r.length); r.forEach(n=>a.push(n));
    sput(a,m.alias.join(','));
    sput(a,m.gone.filter(g=>g.charAt(0)==='q').slice(-200).join(','));
    const ev=m.ev.filter(e=>ZI.includes(e.z)&&DI.includes(e.d)&&(v4||e.p!=='N')).slice().sort((x,y)=>x.t-y.t);
    const u0=ev.length?Math.round(ev[0].t/TU):Math.round(m.created/TU);
    vput(a,u0); vput(a,Math.max(0,u0-Math.round(m.created/TU)));
    vput(a,ev.length);
    let pu=u0;
    ev.forEach(e=>{ const u=Math.max(pu,Math.round(e.t/TU)); a.push(e.n==='?'?255:Math.min(254,+e.n)); a.push(zdo(e)); vput(a,(u-pu)*5+(e.s-1)); pu=u; });
  });
  if(v4){
    const live=db.team.pl.filter(p=>!p.x);
    sput(a,db.team.name); vput(a,live.length);
    live.forEach(p=>{ a.push(Math.min(254,+p.n)); sput(a,p.nm); a.push(Math.max(0,ROLE_KEYS.indexOf(p.r))); });
  }
  return (v4?'PV4:':'PV3:')+bytesToB64u(a);
}
function decode(str){
  const a=b64uToBytes(str); let i=0;
  const byte=()=>{ if(i>=a.length) throw new Error('short'); return a[i++]; };
  const vget=()=>{ let v=0,mul=1,b,k=0; do{ b=byte(); v+=(b%128)*mul; mul*=128; if(++k>8) throw new Error('bad'); }while(b>=128); return v; };
  const sget=()=>{ const n=vget(); if(i+n>a.length) throw new Error('short'); const s=new TextDecoder().decode(a.subarray(i,i+n)); i+=n; return s; };
  const ver=byte(); if(ver!==3&&ver!==4) throw new Error('ver');
  const out=[], nm=vget();
  if(nm>500) throw new Error('bad');
  for(let k=0;k<nm;k++){
    const id=sget(), opp=sget(), d=new Date(DAY0+vget()*864e5), set=vget();
    const rl=vget(), roster=[]; for(let j=0;j<rl;j++) roster.push(String(byte()));
    const alias=sget().split(',').filter(Boolean), gone=sget().split(',').filter(Boolean);
    const u0=vget(), back=vget(), n=vget(), ev=[];
    if(n>20000) throw new Error('bad');
    let u=u0;
    for(let j=0;j<n;j++){
      const nb=byte(); let c=byte(); const v=vget(); u+=Math.floor(v/5);
      let p='L'; if(ver===4&&c>=120){ c-=120; p='N'; }
      if(c>=120) throw new Error('bad');
      ev.push({t:u*TU,n:nb===255?'?':String(nb),z:ZI[Math.floor(c/24)],d:DI[Math.floor(c%24/4)],o:OI[c%4],s:v%5+1,p});
    }
    const qm=qids(ev); ev.forEach(e=>{ e.id=qm.get(e); });
    const date=d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
    const m=cleanMatch({id,opp,date,set,roster,ev,alias,gone,created:(u0-back)*TU});
    if(m) out.push(m);
  }
  let team=null;
  if(ver===4&&i<a.length){
    const name=sget(), k=vget(), pl=[];
    for(let j=0;j<k;j++){ const n=byte(), pn=sget(), r=byte(); pl.push({n:String(n),nm:pn,r:ROLE_KEYS[r]||''}); }
    team=cleanTeam({name,pl});
  }
  return {ms:out,team};
}
function parseCode(raw){
  const s=String(raw||'');
  const tryDecode=(body,fn)=>{ const full=body.replace(/\s+/g,''), first=body.trim().split(/\s+/)[0]; for(const c of [full,first]){ try{ return fn(JSON.parse(b64dec(c))); }catch(e){} } throw new Error('bad'); };
  const m3=s.match(/PV[34]:\s*([A-Za-z0-9_\-\s]+)/);
  if(m3){ const body=m3[1], full=body.replace(/\s+/g,''), first=body.trim().split(/\s+/)[0]; for(const c of [full,first]){ try{ return decode(c); }catch(e){} } throw new Error('bad'); }
  let mm=s.match(/PV2:([A-Za-z0-9+/=\s]+)/);
  if(mm) return {ms:tryDecode(mm[1],o=>{ if(!o||!Array.isArray(o.m)) throw new Error('bad'); return o.m.map(unpackMatch).filter(Boolean); }),team:null};
  mm=s.match(/PV1:([A-Za-z0-9+/=\s]+)/);
  if(mm) return {ms:tryDecode(mm[1],o=>{
    const ev=(Array.isArray(o.ev)?o.ev:[]).map(a=>Array.isArray(a)?{id:a[0],t:a[1],n:a[2],z:a[3],d:a[4],o:a[5],s:a[6]}:a);
    const first=ev[0]&&String(ev[0].id||'').replace(/[^0-9a-z]/gi,'');
    const m=cleanMatch({id:'mv1'+(first||newId()),opp:o.opp,roster:o.roster,ev});
    return m?[m]:[];
  }),team:null};
  throw new Error('bad');
}
function saveMessage(m){ return `Scout ${m.opp.trim()?'vs '+m.opp.trim()+', ':''}${fmtDate(m.date)}, ${att(m.ev.length)}\n`+encode([m],false); }
function backupMessage(ms){ const n=ms.reduce((a,m)=>a+m.ev.length,0); return `Backup scout: ${ms.length} ${plural(ms.length,'partita','partite')}, ${att(n)}\n`+encode(ms,true); }
function mergeInto(t,inc){
  const gone=new Set(t.gone.concat(inc.gone||[]));
  t.gone=[...gone].slice(-1000);
  const q0=qids(t.ev);
  t.ev=t.ev.filter(e=>!gone.has(e.id)&&!gone.has(q0.get(e)));
  const have=new Set(); t.ev.forEach(e=>{ have.add(e.id); have.add(q0.get(e)); }); let added=0;
  const qi=qids(inc.ev);
  inc.ev.forEach(e=>{ const q=qi.get(e); if(!have.has(e.id)&&!have.has(q)&&!gone.has(e.id)&&!gone.has(q)){ t.ev.push(Object.assign({},e)); have.add(e.id); have.add(q); added++; } });
  t.ev.sort((a,b)=>a.t-b.t);
  t.roster=[...new Set(t.roster.concat(inc.roster))].sort(numSort);
  if(!t.opp.trim()&&inc.opp.trim()) t.opp=inc.opp;
  [inc.id].concat(inc.alias||[]).forEach(a=>{ if(a&&a!==t.id&&!t.alias.includes(a)) t.alias.push(a); });
  return added;
}
const findLocal=id=>db.matches[id]||Object.values(db.matches).find(m=>m.alias.includes(id))||null;
function afterImport(mid,msg){
  if(mid) db.cur=mid;
  resetTipsUI(); resetSel(); flash=null;
  const box=$('#importBox'); if(box) box.value='';
  renderAll(); toast(msg);
}
function doImport(raw){
  if(!String(raw||'').trim()){ toast('Incolla prima il messaggio con il codice.'); return false; }
  let res;
  try{ res=parseCode(raw); }catch(e){ toast("Codice non leggibile: copia tutto il messaggio, dall'inizio alla fine."); return false; }
  const list=res.ms;
  const teamCh=res.team?mergeTeam(db.team,res.team):false;
  if(!list.length){ if(teamCh){ save(); renderAll(); toast('Squadra aggiornata.'); return true; } toast('Nel codice non ci sono partite.'); return false; }
  list.forEach(inc=>unmarkDeleted(inc.id));
  if(list.length>1){
    let created=0, added=0;
    list.forEach(inc=>{ const local=findLocal(inc.id); if(local) added+=mergeInto(local,inc); else{ db.matches[inc.id]=inc; created++; } });
    save(); afterImport(null,`Backup importato: ${created} ${plural(created,'partita nuova','partite nuove')}, ${added} ${plural(added,'attacco aggiunto','attacchi aggiunti')}.`);
    return true;
  }
  const inc=list[0], local=findLocal(inc.id);
  if(local){ const n=mergeInto(local,inc); save(); afterImport(local.id,n?`Aggiunti ${att(n)} alla partita ${mDesc(local)}.`:`La partita ${mDesc(local)} è già aggiornata.`); return true; }
  const m=cur();
  if(isPristine(m)){
    delete db.matches[m.id]; db.matches[inc.id]=inc; db.cur=inc.id; save();
    afterImport(inc.id,`Importata la partita ${mDesc(inc)}: ${att(inc.ev.length)}.`); return true;
  }
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Dove li metto?</h2>${closeBtn()}</div><p class="sub" style="margin-bottom:12px">Il codice contiene la partita ${esc(mDesc(inc))}, ${att(inc.ev.length)}.</p><button class="btn primary block" id="imMerge">Unisci alla partita ${esc(mDesc(m))}</button><p class="tiny" style="margin:6px 2px 14px">Scegli questa se avete scoutato la stessa partita su due telefoni.</p><button class="btn ghost block" id="imNew">Tienila come partita separata</button>`);
  $('#imMerge').onclick=()=>{ const n=mergeInto(m,inc); save(); closeSheet(); afterImport(m.id,`Aggiunti ${att(n)} alla partita ${mDesc(m)}.`); };
  $('#imNew').onclick=()=>{ db.matches[inc.id]=inc; save(); closeSheet(); afterImport(inc.id,`Importata la partita ${mDesc(inc)}: ${att(inc.ev.length)}.`); };
  return true;
}
const mDesc=m=>m.opp.trim()?'contro '+m.opp.trim():'del '+fmtDate(m.date);
/* ---------- QR: mostrare e leggere ---------- */
const libs={};
function loadLib(src,name){
  if(window[name]) return Promise.resolve(window[name]);
  if(libs[src]) return libs[src];
  libs[src]=new Promise((res,rej)=>{
    const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=()=>window[name]?res(window[name]):rej(new Error('lib'));
    s.onerror=()=>{ delete libs[src]; s.remove(); rej(new Error('lib')); };
    document.head.appendChild(s);
  });
  return libs[src];
}
const QR_ONE=640, QR_PART=420;   // caratteri: oltre QR_ONE il codice va in più QR che scorrono
function qrFrames(code){
  if(code.length<=QR_ONE) return [code];
  const sid=Math.random().toString(36).slice(2,6), n=Math.ceil(code.length/QR_PART), out=[];
  for(let i=0;i<n;i++) out.push(`SQ:${sid}:${i+1}:${n}:`+code.slice(i*QR_PART,(i+1)*QR_PART));
  return out;
}
function qrSvg(text){
  const q=window.qrcode(0,'M'); q.addData(text,'Byte'); q.make();
  const n=q.getModuleCount(); let d='';
  for(let r=0;r<n;r++) for(let c=0;c<n;c++) if(q.isDark(r,c)) d+=`M${c} ${r}h1v1h-1z`;
  return `<svg viewBox="-2 -2 ${n+4} ${n+4}" shape-rendering="crispEdges" role="img" aria-label="Codice QR"><rect x="-2" y="-2" width="${n+4}" height="${n+4}" fill="#fff"/><path d="${d}" fill="#0D1B2E"/></svg>`;
}
let qrTimer=0;
function showQR(title,code,meta){
  clearInterval(qrTimer);
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">${esc(title)}</h2>${closeBtn()}</div><div class="qrbox"><div class="qrframe" id="qrF"><p class="sub" style="text-align:center;padding-top:40%">Preparo il QR…</p></div><div class="qrdots" id="qrD"></div><p class="qrmeta" id="qrM">${esc(meta)}</p></div><p class="tiny">Sull’altro telefono apri Scout e tocca “Scansiona QR” in Impostazioni (nella versione precedente è in Dati). Tieni lo schermo luminoso e fermo.</p>`,()=>clearInterval(qrTimer));
  loadLib('qr.js','qrcode').then(()=>{
    const frames=qrFrames(code), F=$('#qrF'); if(!F) return;
    let svgs;
    try{ svgs=frames.map(qrSvg); }catch(e){ F.innerHTML='<p class="sub" style="text-align:center;padding-top:35%">Troppi dati per il QR: usa il codice testuale.</p>'; return; }
    let i=0;
    const draw=()=>{ const f=$('#qrF'), d=$('#qrD'); if(!f){ clearInterval(qrTimer); return; } f.innerHTML=svgs[i]; if(d) d.innerHTML=svgs.length>1?svgs.map((_,j)=>`<i class="${j===i?'on':''}"></i>`).join(''):''; i=(i+1)%svgs.length; };
    draw();
    if(svgs.length>1){ $('#qrM').textContent=`${meta}. ${svgs.length} QR che scorrono da soli: inquadrali finché la barra non si riempie.`; qrTimer=setInterval(draw,reduced?1600:850); }
  }).catch(()=>{ const F=$('#qrF'); if(F) F.innerHTML='<p class="sub" style="text-align:center;padding-top:35%">Non riesco a preparare il QR senza rete la prima volta. Riprova con la rete, poi funziona anche offline.</p>'; });
}
let scan=null;
function stopScan(){
  if(!scan) return;
  scan.alive=false; cancelAnimationFrame(scan.raf); clearTimeout(scan.to);
  try{ scan.stream&&scan.stream.getTracks().forEach(t=>t.stop()); }catch(e){}
  scan=null;
}
function openScanner(){
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){ toast('Qui la fotocamera non è disponibile: usa il codice testuale.'); return; }
  stopScan();
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Scansiona QR</h2>${closeBtn()}</div><div class="cam"><video id="camV" playsinline muted autoplay></video><div class="aim" aria-hidden="true"></div><p class="camtxt" id="camT">Avvio la fotocamera…</p></div><div class="qprog" id="qP" hidden></div><p class="tiny">Inquadra il QR sull’altro telefono. Se sono più QR che scorrono, tieni ferma l’inquadratura finché la barra non è piena.</p>`,stopScan);
  const S=scan={alive:true,parts:{},sid:null,n:0,raf:0,to:0,stream:null,det:null,canvas:document.createElement('canvas')};
  const say=t=>{ const el=$('#camT'); if(el) el.textContent=t; };
  const prog=()=>{ const p=$('#qP'); if(!p||!S.n) return; p.hidden=false; p.innerHTML=Array.from({length:S.n},(_,j)=>`<i class="${S.parts[j+1]?'on':''}"></i>`).join(''); };
  const finish=code=>{ if(!S.alive) return; buzz(); stopScan(); closeSheet(); setTimeout(()=>doImport(code),reduced?0:240); };
  const got=txt=>{
    if(!txt) return;
    const m=/^SQ:([a-z0-9]{2,8}):(\d+):(\d+):(.*)$/s.exec(txt);
    if(!m){ if(/PV[1-4]:/.test(txt)) finish(txt); else say('Questo QR non è un codice di Scout.'); return; }
    const [ ,sid,iS,nS,body]=m, i=+iS, n=+nS;
    if(!(n>=1&&n<=60&&i>=1&&i<=n)) return;
    if(S.sid!==sid){ S.sid=sid; S.n=n; S.parts={}; }
    if(!S.parts[i]){ S.parts[i]=body; buzz(); }
    const have=Object.keys(S.parts).length; prog();
    say(have<n?`Letti ${have} di ${n}: tieni ferma l’inquadratura.`:'Fatto.');
    if(have===n){ let code=''; for(let j=1;j<=n;j++) code+=S.parts[j]; finish(code); }
  };
  const start=async()=>{
    try{
      S.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:1280}},audio:false});
    }catch(e){ if(S.alive) say(e&&e.name==='NotAllowedError'?'Permesso negato: consenti la fotocamera nelle impostazioni del browser.':'Fotocamera non disponibile su questo dispositivo.'); return; }
    if(!S.alive){ S.stream.getTracks().forEach(t=>t.stop()); return; }
    const v=$('#camV'); if(!v){ stopScan(); return; }
    v.srcObject=S.stream; try{ await v.play(); }catch(e){}
    try{ if('BarcodeDetector' in window){ const f=await window.BarcodeDetector.getSupportedFormats(); if(f.includes('qr_code')) S.det=new window.BarcodeDetector({formats:['qr_code']}); } }catch(e){ S.det=null; }
    if(!S.det){ try{ await loadLib('jsqr.js','jsQR'); }catch(e){ say('Non riesco a caricare il lettore senza rete la prima volta. Riprova con la rete.'); return; } }
    say('Inquadra il QR');
    const ctx=S.canvas.getContext('2d',{willReadFrequently:true});
    let busy=false;
    const tick=async()=>{
      if(!S.alive) return;
      if(!busy&&v.readyState>=2&&v.videoWidth){
        busy=true;
        try{
          if(S.det){ const r=await S.det.detect(v); r.forEach(x=>got(x.rawValue)); }
          else{
            const k=Math.min(1,720/Math.max(v.videoWidth,v.videoHeight)), w=Math.round(v.videoWidth*k), h=Math.round(v.videoHeight*k);
            S.canvas.width=w; S.canvas.height=h; ctx.drawImage(v,0,0,w,h);
            const img=ctx.getImageData(0,0,w,h), r=window.jsQR(img.data,w,h,{inversionAttempts:'dontInvert'});
            if(r&&r.data) got(r.data);
          }
        }catch(e){}
        busy=false;
      }
      if(S.alive) S.to=setTimeout(()=>{ S.raf=requestAnimationFrame(tick); },90);
    };
    tick();
  };
  start();
}

/* ---------- excel ---------- */
let downloads=null;
try{ const c=window.claude; if(c&&typeof c.use==='function'){ c.use('downloads').then(d=>{ downloads=d||null; },()=>{}); } }catch(e){}
function csvRows(ms){
  const rows=[['Partita','Data','Set','Chi attacca','Numero','Nome','Zona','Colpo','Esito','Ora']];
  ms.forEach(m=>m.ev.forEach(e=>{ const pl=e.p==='N'?plOf(e.n):null; rows.push([m.opp.trim()||'Senza nome',fmtDateFull(m.date),e.s,e.p==='N'?teamLabel():'Avversarie',e.n==='?'?'non visto':e.n,pl&&pl.nm?pl.nm:'',e.z==='P'?'Pipe':e.z,cap(DN[e.d]),oLab(e.p,e.o),new Date(e.t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})]); }));
  return rows;
}
const toCSV=rows=>'﻿'+rows.map(r=>r.map(v=>{ const s=String(v); return /[;"\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s; }).join(';')).join('\r\n');
const toTSV=rows=>rows.map(r=>r.map(v=>String(v).replace(/[\t\r\n]+/g,' ')).join('\t')).join('\n');
function exportCsv(){
  const m=cur();
  if(!m.ev.length){ toast('Questa partita non ha ancora attacchi.'); return; }
  const rows=csvRows([m]), name=`scout-${slug(m.opp)||'partita'}-${m.date}.csv`;
  const sheet=()=>textSheet('Tabella per Excel',toTSV(rows),'Copiala e incollala in Excel o Google Fogli: ogni valore finisce nella sua cella.');
  if(downloads){
    downloads.save({filename:name,data:toCSV(rows)}).then(()=>toast('File CSV pronto.')).catch(err=>{
      const c=err&&err.code; if(c==='declined') return;
      if(c==='rate_limited'){ toast("C'è già un salvataggio in corso."); return; }
      downloads=null; sheet();
    });
    return;
  }
  // fuori da Claude: scarico il file direttamente, se il browser lo permette
  try{
    if(!GH||(isIOS()&&isStandalone())) throw new Error('nodl');   // fuori dal sito o nell'app installata su iPhone il download non funziona bene: meglio la tabella da copiare
    const blob=new Blob([toCSV(rows)],{type:'text/csv;charset=utf-8'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),4000);
    toast('File CSV scaricato.');
  }catch(e){ sheet(); }
}

/* ---------- DATI ---------- */
function doInstall(){
  if(!installEvt){ openInstallHow(); return; }
  const e=installEvt; installEvt=null;
  try{ e.prompt(); Promise.resolve(e.userChoice).finally(()=>{ if(view==='settings') renderSettings(); }); }catch(err){ openInstallHow(); }
}
function openInstallHow(){
  const steps=isIOS()
    ?'<li>Apri questa pagina con Safari.</li><li>Tocca il tasto Condividi, il quadrato con la freccia verso l’alto.</li><li>Scegli <b>Aggiungi alla schermata Home</b>, poi <b>Aggiungi</b>.</li><li>Da ora aprila sempre dall’icona sulla Home.</li>'
    :'<li>Apri il menu del browser, i tre puntini in alto a destra.</li><li>Scegli <b>Installa app</b> oppure <b>Aggiungi a schermata Home</b>.</li><li>Da ora aprila sempre dall’icona.</li>';
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Installa l’app</h2>${closeBtn()}</div><ol class="steps">${steps}</ol>${isIOS()?'<p class="caveat">Su iPhone i dati di Safari e quelli dell’app sulla Home sono separati. Se hai già segnato qualcosa in Safari, prima mostra il QR o copia il codice, poi recuperalo nell’app installata.</p>':''}<button class="btn primary block" data-close style="margin-top:14px">Ho capito</button>`);
}

/* campo intero per il confronto */
const f1=v=>Math.round(v*10)/10;
/* campo intero per il confronto: sopra il loro campo (dove facciamo punto noi), sotto il nostro (dove fanno punto loro) */
function heatCourt(HN,HL){
  const X0=10, W=160, Y0=10, H=320, NET=Y0+H/2, third=W/3, m3=H/2/3;
  const cell=(x,y,w,h,c,data,good)=>{
    const t=data.t, r=t?data.K/t:0, base=good?'var(--green)':'var(--red)';
    const mix=t?Math.round(14+72*r):0;
    const fill=t?`color-mix(in srgb, ${base} ${mix}%, var(--surface-2))`:'var(--surface-2)';
    const ink=mix>=48?'#fff':'var(--ink)', sub=mix>=48?'rgba(255,255,255,.85)':'var(--muted)';
    const cx=x+w/2, cy=y+h/2;
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" style="fill:${fill}"/>`
      +`<text class="hz" x="${f1(cx)}" y="${f1(cy-(t?13:2))}" style="fill:${sub}">${c==='C'?'corta':'zona '+c}</text>`
      +(t?`<text class="hk" x="${f1(cx)}" y="${f1(cy+4)}" style="fill:${ink}">${fmtN(data.K)}/${fmtN(t)}</text><text class="hp" x="${f1(cx)}" y="${f1(cy+15)}" style="fill:${sub}">${pct(r)}</text>`:`<text class="hp" x="${f1(cx)}" y="${f1(cy+10)}" style="fill:${sub}">nessuno</text>`);
  };
  let g='';
  // loro campo, visto dalla nostra panchina: fondo in alto 1-6-5, corta vicino alla rete
  const topBackH=H/2-m3, bottomBackY=NET+m3;
  [['1',0],['6',1],['5',2]].forEach(([c,i])=>{ g+=cell(X0+i*third,Y0,third,topBackH,c,HN[c],true); });
  g+=cell(X0,Y0+topBackH,W,m3,'C',HN.C,true);
  // il nostro campo: corta vicino alla rete, fondo in basso 5-6-1
  g+=cell(X0,NET,W,m3,'C',HL.C,false);
  [['5',0],['6',1],['1',2]].forEach(([c,i])=>{ g+=cell(X0+i*third,bottomBackY,third,H/2-m3,c,HL[c],false); });
  const lines=`<rect x="${X0}" y="${Y0}" width="${W}" height="${H}" style="fill:none;stroke:var(--line-2);stroke-width:1.5"/>`
    +`<line x1="${X0}" y1="${f1(Y0+topBackH)}" x2="${X0+W}" y2="${f1(Y0+topBackH)}" style="stroke:var(--surface);stroke-width:1.5"/>`
    +`<line x1="${X0}" y1="${f1(bottomBackY)}" x2="${X0+W}" y2="${f1(bottomBackY)}" style="stroke:var(--surface);stroke-width:1.5"/>`
    +[1,2].map(i=>`<line x1="${f1(X0+i*third)}" y1="${Y0}" x2="${f1(X0+i*third)}" y2="${f1(Y0+topBackH)}" style="stroke:var(--surface);stroke-width:1.5"/><line x1="${f1(X0+i*third)}" y1="${f1(bottomBackY)}" x2="${f1(X0+i*third)}" y2="${Y0+H}" style="stroke:var(--surface);stroke-width:1.5"/>`).join('')
    +`<line x1="2" y1="${NET}" x2="178" y2="${NET}" style="stroke:var(--d-net);stroke-width:3;stroke-linecap:round"/>`;
  return `<svg class="heat" viewBox="0 0 180 340" role="img" aria-label="Campo: in alto dove facciamo punto nel loro campo, in basso dove fanno punto nel nostro">${g}${lines}</svg>`;
}

/* =========================================================
   Interfaccia
   ========================================================= */
let view='scout';
let sel={n:null,z:null,d:null,o:null};
let flash=null, flashT=0, lastCommit=0, hintT=0;
const sessionSaved=[];
const resetSel=()=>{ sel={n:null,z:null,d:null,o:null}; };
const side=()=>db.side;
let filter='match';
let tipsUI={scope:null,tab:'brief'};
const PKEY='scout-prefs';
let prefs=(()=>{ const d={haptics:true,wipe:true,sideHint:true,names:true,big:false}; try{ return Object.assign(d,JSON.parse(localStorage.getItem(PKEY)||'{}')); }catch(e){ return d; } })();
function savePrefs(){ try{ localStorage.setItem(PKEY,JSON.stringify(prefs)); }catch(e){} applyPrefs(); if(view==='scout') renderScout(); }
function applyPrefs(){ $('#app').classList.toggle('big',!!prefs.big); }
function resetTipsUI(){ tipsUI={scope:null,tab:'brief'}; filter='match'; }
const closeBtn=()=>`<button class="iconbtn" data-close aria-label="Chiudi">${IC.x}</button>`;
const setsWithData=(m,min)=>[...new Set(m.ev.map(e=>e.s))].sort((a,b)=>a-b).filter(s=>m.ev.filter(e=>e.s===s).length>=(min||4));

/* ---------- fondo: colore di chi attacca ---------- */
const GROUND_COL={L:'#123E78',N:'#B54E19',G:'#0F2A4D'};
let wipeFin=null;
function setGround(g,origin){
  const app=$('#app');
  if(wipeFin) wipeFin();            // un cambio ancora in corso si chiude subito: il colore resta sempre quello giusto
  if(app.dataset.ground===g) return;
  const tc=$('#themeColor'); if(tc) tc.setAttribute('content',GROUND_COL[g]);
  const gr=$('.ground');
  if(origin&&prefs.wipe&&!reduced&&document.body.animate){
    try{
      const x=origin.x, y=origin.y, r=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+20;
      const w=document.createElement('div'); w.className='wipe';
      w.style.backgroundImage=getComputedStyle($('.ground .g'+g)).backgroundImage;
      document.body.insertBefore(w,app);
      const a=w.animate([{clipPath:`circle(0px at ${x}px ${y}px)`},{clipPath:`circle(${r}px at ${x}px ${y}px)`}],{duration:520,easing:'cubic-bezier(.65,0,.35,1)'});
      let fin=false;
      const done=()=>{ if(fin) return; fin=true; if(wipeFin===done) wipeFin=null; gr.classList.add('snap'); app.dataset.ground=g; w.remove(); requestAnimationFrame(()=>requestAnimationFrame(()=>gr.classList.remove('snap'))); };
      wipeFin=done; a.onfinish=done; a.oncancel=done;
      setTimeout(done,900);
      return;
    }catch(e){}
  }
  app.dataset.ground=g;
}
const groundFor=()=>view==='scout'?side():'G';

/* ---------- barra ---------- */
function renderHeader(){
  const m=cur(), o=m.opp.trim();
  $('#matchName').textContent=o||'Nuova partita';
  $('#mbKick').textContent=o?fmtDay(m.date)+', contro':'Partita del '+fmtDate(m.date);
  renderSetControl();
  document.title=o?'Scout vs '+o:'Scout';
  $('#swL').textContent=o||'Attaccano loro';
  $('#swN').textContent=db.team.name.trim()||'Attacchiamo noi';
  $('#sideSw button[data-side="L"]').setAttribute('aria-label','Attacca '+(o||'la squadra avversaria'));
  $('#sideSw button[data-side="N"]').setAttribute('aria-label','Attacca '+(db.team.name.trim()||'la nostra squadra'));
  tabDot();
}
function fmtDay(iso){
  const p=String(iso||'').split('-'); if(p.length!==3) return '';
  const d=new Date(+p[0],+p[1]-1,+p[2]), t=new Date(); t.setHours(0,0,0,0);
  const diff=Math.round((t-d)/864e5);
  if(diff===0) return 'Oggi'; if(diff===1) return 'Ieri';
  const wd=['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'][d.getDay()];
  return diff>0&&diff<7?wd+' '+fmtDate(iso):fmtDate(iso);
}
function moveInd(){
  const t=$(`.tabs button[data-v="${view}"]`), n=$('.tabs'); if(!t||!t.offsetWidth) return;
  n.style.setProperty('--tw',t.offsetWidth+'px'); n.style.setProperty('--tx',t.offsetLeft+'px');
}
function tabDot(){
  const t=$('#t-tips'); if(!t) return;
  const on=view!=='tips'&&!!briefPending(cur());
  let d=$('.dot',t); if(on&&!d){ d=document.createElement('i'); d.className='dot'; d.setAttribute('aria-hidden','true'); t.appendChild(d); } else if(!on&&d) d.remove();
  t.setAttribute('aria-label',on?'Indicazioni, pronte per il set finito':'Indicazioni');
}
window.addEventListener('resize',()=>{ moveInd(); moveSetPill(); });
try{ if(document.fonts) document.fonts.ready.then(()=>{ moveInd(); moveSetPill(); }); }catch(e){}

/* tasto indietro del telefono: prima chiude ciò che è aperto, poi torna allo scout */
const nav={depth:0,busy:false,q:false};
const sheetOpen=()=>$('#scrim').classList.contains('open');
const presentOpen=()=>$('#present').classList.contains('open');
const navWant=()=>(view!=='scout'?1:0)+(sheetOpen()||presentOpen()?1:0);
function navSync(){ if(nav.q) return; nav.q=true; queueMicrotask(navApply); }
function navApply(){
  nav.q=false; if(nav.busy) return;
  const w=navWant();
  try{
    while(nav.depth<w){ nav.depth++; history.pushState({scoutNav:nav.depth},''); }
    if(nav.depth>w){ const d=nav.depth-w; nav.depth=w; nav.busy=true; history.go(-d); }
  }catch(e){ nav.busy=false; }
}
window.addEventListener('popstate',e=>{
  const lvl=(e.state&&e.state.scoutNav)||0;
  if(nav.busy){ nav.busy=false; nav.depth=lvl; navApply(); return; }
  if(lvl>=nav.depth){ nav.depth=lvl; navApply(); return; }   // avanti: rimetto le cose come sono
  nav.depth=lvl;
  for(let guard=0;navWant()>nav.depth&&guard<3;guard++){
    if(presentOpen()) closeShow(); else if(sheetOpen()) closeSheet(); else if(view!=='scout') show('scout');
  }
});
let installHint=false;
function show(v,opts){
  if(!['scout','tips','team','settings'].includes(v)) v='scout';
  const changed=v!==view;
  view=v;
  $$('.tabs button').forEach(b=>{ const on=b.dataset.v===v; b.setAttribute('aria-selected',String(on)); b.tabIndex=on?0:-1; });
  $$('.view').forEach(s=>{ s.hidden=s.id!=='v-'+v; });
  const sec=$('#v-'+v);
  if(changed&&!reduced){ sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter'); }
  $('#main').scrollTop=0;
  moveInd(); tabDot();
  setGround(groundFor(),opts&&opts.origin);
  renderView();
  navSync();
  if(installHint&&(v==='settings'||v==='team')) scheduleInstallHint(0);
}
// il suggerimento non copre mai un altro avviso (per esempio un “Rimetti”) e compare solo in Squadra o Impostazioni
function scheduleInstallHint(tries){
  setTimeout(()=>{
    if(!installHint) return;
    if(view!=='settings'&&view!=='team') return;
    if($('#toast').classList.contains('is-on')||sheetOpen()){ if(tries<6) scheduleInstallHint(tries+1); return; }
    installHint=false; try{ localStorage.setItem('scout-install-hint','1'); }catch(e){}
    toast('Installala sulla schermata Home: così non perdi mai i dati.','Come',doInstall);
  },tries?2500:900);
}
function renderView(){
  if(view==='scout') renderScout();
  else if(view==='tips') renderTips();
  else if(view==='team') renderTeam();
  else renderSettings();
}
function renderAll(){ renderHeader(); renderView(); }

$('#sets').addEventListener('click',e=>{ const b=e.target.closest('button[data-set]'); if(b) changeSet(+b.dataset.set,true); });
$('#setBtn').addEventListener('click',openSetSheet);
$('#matchBtn').addEventListener('click',()=>openMatches());
$('.tabs').addEventListener('click',e=>{ const b=e.target.closest('button[data-v]'); if(!b) return; const r=b.getBoundingClientRect(); show(b.dataset.v,{origin:{x:r.left+r.width/2,y:r.top+r.height/2}}); });
$('.tabs').addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft') return;
  e.preventDefault();
  const tabs=$$('.tabs button'); const i=tabs.findIndex(b=>b.dataset.v===view);
  const j=(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
  show(tabs[j].dataset.v); tabs[j].focus();
});

/* ---------- SCOUT ---------- */
function renderScout(){
  const sc=$('#v-scout'); sc.dataset.side=side();
  $$('#sideSw button').forEach(b=>{ const on=b.dataset.side===side(); b.setAttribute('aria-checked',String(on)); b.tabIndex=on?0:-1; });
  renderOuts(); renderJerseys(); renderCourtState(); renderDock(); renderFeed();
}
function setSide(s,origin){
  if(s!=='L'&&s!=='N'||s===db.side) return;
  db.side=s; resetSel(); flash=null; save(); buzz();
  $$('#sideSw button').forEach(b=>b.classList.remove('hint'));
  clearTimeout(hintT);
  if(view==='scout'){
    if(!origin){ const b=$(`#sideSw button[data-side="${s}"]`); if(b){ const r=b.getBoundingClientRect(); origin={x:r.left+r.width/2,y:r.top+r.height/2}; } }
    setGround(s,origin);
  }
  renderScout();
}
$('#sideSw').addEventListener('click',e=>{ const b=e.target.closest('button[data-side]'); if(!b) return; const r=b.getBoundingClientRect(); setSide(b.dataset.side,e.clientX||e.clientY?{x:e.clientX,y:e.clientY}:{x:r.left+r.width/2,y:r.top+r.height/2}); });
$('#sideSw').addEventListener('keydown',e=>{ if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){ e.preventDefault(); setSide(side()==='L'?'N':'L'); const b=$(`#sideSw button[data-side="${side()}"]`); if(b) b.focus(); } });

/* maglie */
function jerseyNums(){
  const m=cur(), s=side(), nums=new Set();
  if(s==='L') m.roster.forEach(n=>nums.add(n));
  else livePl().filter(p=>p.r!=='L').forEach(p=>nums.add(p.n));
  m.ev.forEach(e=>{ if(e.p===s&&e.n!=='?') nums.add(e.n); });
  return [...nums].sort(numSort);
}
function jerseyBtn(n,c,k,s){
  const hot=c>=3&&k/c>=.5;
  const p=s==='N'&&n!=='?'?plOf(n):null, nm=p&&p.nm&&prefs.names?p.nm:'';
  const label=(n==='?'?'Numero non visto':'Numero '+n+(nm?', '+nm:''))+(c?', '+att(c)+(k?', '+pts(k):''):'');
  return `<button class="jersey${n==='?'?' unknown':''}" data-n="${esc(n)}" aria-pressed="${sel.n===n}" aria-label="${esc(label)}"><span class="jn" aria-hidden="true">${esc(n)}</span>${nm?`<span class="nm" aria-hidden="true">${esc(nm)}</span>`:''}${c?`<span class="cnt${hot?' hot':''}" aria-hidden="true">${c}</span>`:''}</button>`;
}
function renderJerseys(bumpN){
  const m=cur(), s=side(), cnt={}, kil={};
  m.ev.forEach(e=>{ if(e.p!==s) return; cnt[e.n]=(cnt[e.n]||0)+1; if(e.o==='K') kil[e.n]=(kil[e.n]||0)+1; });
  const list=jerseyNums();
  const box=$('#jerseys');
  box.classList.toggle('named',s==='N'&&prefs.names&&livePl().some(p=>p.nm));
  box.innerHTML=list.map(n=>jerseyBtn(n,cnt[n]||0,kil[n]||0,s)).join('')+jerseyBtn('?',cnt['?']||0,kil['?']||0,s)+`<button class="jersey unknown" data-roster aria-label="${s==='N'?'Modifica la squadra':'Modifica la rosa avversaria'}"><svg class="i" viewBox="0 0 16 16" aria-hidden="true" style="width:22px;height:22px"><path d="M8 3v10M3 8h10"/></svg></button>`;
  const st=$('#starter');
  st.hidden=list.length>0;
  if(!list.length){
    $('#stTitle').textContent=s==='N'?'Chi sono le tue attaccanti?':'Chi attacca di là?';
    $('#stText').textContent=s==='N'?'Tocca i numeri della tua squadra: nomi e ruoli li aggiungi in Squadra.':'Tocca i numeri delle avversarie: poi basta un tocco per segnarle.';
  }
  if(bumpN&&!reduced){ const c=$(`#jerseys .jersey[data-n="${CSS.escape(bumpN)}"] .cnt`); if(c){ c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
}
function updateJerseySel(){ $$('#jerseys .jersey[data-n]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.n===sel.n))); }
function openRosterForSide(){ if(side()==='N') openTeamQuick(); else openRoster(false); }
$('#jerseys').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.hasAttribute('data-roster')){ openRosterForSide(); return; }
  pickNum(b.dataset.n);
});
function pickNum(n){ sel.n=sel.n===n&&!sel.z&&!sel.o?null:n; flash=null; updateJerseySel(); renderCourtState(); if(sel.n) buzz(6); tryCommit(); }
$('#starterBtn').addEventListener('click',openRosterForSide);

/* campo */
function shotBtn(z,d){
  if(isBack(z)){
    const ic={P:{'1':'D2','6':'L','5':'D4'},'1':{'1':'D2','6':'UL','5':'L'}}[z][d], nm=z==='P'?'Pipe':'Opposto da zona 1';
    return `<button class="shot bk" data-z="${z}" data-d="${d}" aria-pressed="false" aria-label="${nm}, verso zona ${d}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${SHOT_IC[ic]}"/></svg><span class="lab">${d}</span><span class="tally" aria-hidden="true"></span></button>`;
  }
  const ic=d==='1'?'D2':d==='5'?'D4':d==='D'?(z==='4'?'D4':z==='2'?'D2':'DC'):d;
  const L1={D:'Diagonale',L:'Parallela',T:'Pallonetto','1':'Verso 1','5':'Verso 5'}[d], L2={D:'Diag.',L:'Para.',T:'Pallon.','1':'Zona 1','5':'Zona 5'}[d];
  return `<button class="shot" data-z="${z}" data-d="${d}" aria-pressed="false" aria-label="Da ${z}, ${L1.toLowerCase()}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="${SHOT_IC[ic]}"/></svg><span class="lab"><span class="l1">${L1}</span><span class="l2">${L2}</span></span><span class="tally" aria-hidden="true"></span></button>`;
}
function buildCourt(){
  const front=[0,1,2].map(r=>['4','3','2'].map(z=>shotBtn(z,ZD[z][r])).join('')).join('');
  $('#court').innerHTML=`<p class="zh f"><b>4</b><span>banda</span></p><p class="zh f"><b>3</b><span>centro</span></p><p class="zh f"><b>2</b><span>opposto</span></p>`
    +front
    +`<div class="bk-line" aria-hidden="true"></div><p class="zh bh"><b>Pipe</b><span>verso zona</span></p><p class="zh bh"><b>Da 1</b><span>verso zona</span></p>`
    +ZD.P.map(d=>shotBtn('P',d)).join('')+ZD['1'].map(d=>shotBtn('1',d)).join('');
}
function renderCourtState(){
  const m=cur(), s=side(); let tal=null;
  if(sel.n){ tal={}; m.ev.forEach(e=>{ if(e.p!==s||e.n!==sel.n) return; const k=e.z+e.d; const t=tal[k]||(tal[k]={t:0,K:0}); t.t++; if(e.o==='K') t.K++; }); }
  $$('#court .shot').forEach(b=>{
    const k=b.dataset.z+b.dataset.d, v=tal&&tal[k], tl=b.querySelector('.tally');
    b.setAttribute('aria-pressed',String(sel.z===b.dataset.z&&sel.d===b.dataset.d));
    tl.textContent=v?String(v.t):'';
    tl.classList.toggle('hot',!!(v&&v.t>=2&&v.K/v.t>=.5));
  });
}
$('#court').addEventListener('click',e=>{
  const b=e.target.closest('.shot'); if(!b) return;
  if(sel.z===b.dataset.z&&sel.d===b.dataset.d&&!sel.n&&!sel.o){ sel.z=null; sel.d=null; }
  else{ sel.z=b.dataset.z; sel.d=b.dataset.d; buzz(6); }
  flash=null; renderCourtState(); tryCommit();
});

/* esiti */
function renderOuts(){
  const s=side();
  $('#outs').innerHTML=OS.map(o=>{ const x=OUT[s][o]; return `<button class="out${x.dk?' dk':''}" data-o="${o}" aria-pressed="${sel.o===o}" style="--oc:${x.c}" aria-keyshortcuts="${OKEY[o]}" aria-label="${x.l}"><b>${x.s}</b><small>${x.q}</small><span class="oc" aria-hidden="true"></span><span class="kb" aria-hidden="true">${OKEY[o]}</span></button>`; }).join('');
}
$('#outs').addEventListener('click',e=>{ const b=e.target.closest('.out'); if(b) pickOut(b.dataset.o,b,e); });
function pickOut(o,btn,ev){
  if(Date.now()-lastCommit<600) return;   // niente doppio tocco sullo stesso esito
  if(btn&&ev&&!reduced) ripple(btn,ev);
  sel.o=sel.o===o&&!(sel.n&&sel.z)?null:o; flash=null; tryCommit();
}
function ripple(el,ev){
  try{
    const r=el.getBoundingClientRect(), s=Math.max(r.width,r.height)*2.2, x=(ev.clientX||r.left+r.width/2)-r.left-s/2, y=(ev.clientY||r.top+r.height/2)-r.top-s/2;
    const i=document.createElement('span'); i.className='ripple'; i.style.cssText=`width:${s}px;height:${s}px;left:${x}px;top:${y}px`;
    el.appendChild(i); setTimeout(()=>i.remove(),600);
  }catch(e){}
}
function tryCommit(){
  if(!(sel.n&&sel.z&&sel.d&&sel.o)){ renderDock(); return; }
  const m=cur(), s=side();
  const e={id:newId(),t:Date.now(),n:sel.n,z:sel.z,d:sel.d,o:sel.o,s:m.set,p:s};
  const sb=$(`#court .shot[data-z="${e.z}"][data-d="${e.d}"]`);
  m.ev.push(e); save(); lastCommit=Date.now();
  sessionSaved.push({mid:m.id,id:e.id}); if(sessionSaved.length>200) sessionSaved.shift();
  flyBall(sb,e);
  resetSel(); buzz(14);
  renderJerseys(e.n); renderCourtState(); renderFeed(); renderHeader();
  setFlash('saved',e,m.id,true);
  const ob=$(`#outs .out[data-o="${e.o}"]`);
  if(ob){ ob.classList.remove('fired'); void ob.offsetWidth; ob.classList.add('fired'); }
  // dopo una difesa la palla passa di là: suggerisco il cambio di lato, senza farlo da solo
  $$('#sideSw button').forEach(b=>b.classList.remove('hint'));
  clearTimeout(hintT);
  if(e.o==='D'&&prefs.sideHint){ const ob2=$(`#sideSw button[data-side="${s==='L'?'N':'L'}"]`); if(ob2){ void ob2.offsetWidth; ob2.classList.add('hint'); hintT=setTimeout(()=>ob2.classList.remove('hint'),3600); } }
}
function flyBall(btn,e){
  if(reduced||!btn||!btn.animate) return;
  try{
    const r=btn.getBoundingClientRect(), c=$('#court').getBoundingClientRect(); if(!r.width) return;
    const x0=r.left+r.width/2, y0=r.top+r.height/2;
    const dir=isC(e.d)?(e.d==='1'?-1:e.d==='5'?1:(e.z==='1'?-.4:0)):e.d==='D'?(e.z==='4'?1:e.z==='2'?-1:0):0;
    const x1=Math.min(c.right-16,Math.max(c.left+16,x0+dir*Math.min(130,c.width*.32))), y1=c.top-30;
    const tip=e.d==='T', mx=(x0+x1)/2, my=Math.min(y0,y1)-(tip?54:18);
    const el=document.createElement('div'); el.className='fly'; el.innerHTML=BALL; el.style.setProperty('--c',OUT[e.p][e.o].c);
    document.body.appendChild(el);
    const T=(x,y,sc,rt)=>`translate(${x-13}px,${y-13}px) scale(${sc}) rotate(${rt}deg)`;
    el.animate([{transform:T(x0,y0,.5,0),opacity:.2},{transform:T(mx,my,1.12,220),opacity:1,offset:.55},{transform:T(x1,y1,.7,420),opacity:0}],{duration:tip?680:500,easing:'cubic-bezier(.3,.7,.3,1)'}).onfinish=()=>el.remove();
    setTimeout(()=>{ if(el.isConnected) el.remove(); },1300);
  }catch(err){}
}
function setFlash(kind,ev,mid,pop,ms){
  ms=ms||6000;
  flash={kind,ev,mid,until:Date.now()+ms};
  renderDock();
  const st=$('#status');
  if(pop&&!reduced){ st.classList.remove('pop'); void st.offsetWidth; st.classList.add('pop'); }
  clearTimeout(flashT);
  flashT=setTimeout(()=>{ if(view==='scout') renderDock(); },ms+50);
}
function insightLine(m){
  const s=side();
  const A=aggregate(sideEv(m.ev,s));
  const top=A.players.filter(p=>p.n!=='?'&&p.t>=3&&p.K>=2).sort((a,b)=>b.K-a.K||b.kp-a.kp)[0];
  if(!top) return '';
  const k=topKill(top);
  return `<span><span class="mut">${s==='N'?'In serata:':'Più pericolosa:'}</span> <b>${esc(who(top.n,s))}, ${top.K} su ${top.t}</b></span><span class="mut">${k?'fa punto '+esc(punchy(k.z,k.d)):'tienila d’occhio'}</span>`;
}
function renderDock(){
  const m=cur(), s=side(), st=$('#status');
  let txt='', act='', tint='transparent';
  const partial=!!(sel.n||sel.z||sel.o);
  if(partial){
    const nx=!sel.n?'n':!sel.z?'z':'o';
    const step=(k,ok,lab,val)=>`<span class="step${ok?' done':''}${nx===k?' nx':''}"><span>${ok?esc(val):lab}</span></span>`;
    txt=`<div class="prog">${step('n',sel.n,'Numero',sel.n&&(sel.n==='?'?'N° ?':'#'+sel.n))}${step('z',sel.z,'Colpo',sel.z&&shortShot(sel.z,sel.d))}${step('o',sel.o,'Esito',sel.o&&OUT[s][sel.o].s)}</div>`;
    act=`<button class="act clr" data-act="clear" aria-label="Azzera la scelta">${IC.x}</button>`;
  }else if(flash&&Date.now()<flash.until){
    const e=flash.ev;
    if(flash.kind==='set'){
      txt=`<span><b>${setName(e.s)}</b></span><span class="mut">I nuovi attacchi vanno qui</span>`;
      tint='#FFFFFF';
    }else if(flash.kind==='saved'){
      txt=`<span><span class="ok">${IC.check}</span><b>${esc(who(e.n,e.p))} ${esc(shotName(e.z,e.d))}</b></span><span class="mut">${esc(oLab(e.p,e.o))}, set ${e.s}</span>`;
      act=`<button class="act" data-act="undo">${IC.undo}<span>Annulla</span></button>`;
      tint=OUT[e.p][e.o].c;
    }else{
      txt=`<span class="mut">Tolto dallo scout</span><span>${esc(evText(e))}</span>`;
      act='<button class="act" data-act="restore">Rimetti</button>';
    }
  }else{
    const bs=briefPending(m), mp=maxPlayed(m);
    if(m.set<mp){ txt=`<span><b>Stai segnando ${setNameIn(m.set)}</b></span><span class="mut">${mp===5?'Il tie-break':'Il set '+mp} ha già attacchi</span>`; act=`<button class="act go" data-act="toset" data-s="${mp}">${mp===5?'Vai al tie-break':'Vai al set '+mp}</button>`; tint='var(--warn)'; }
    else if(bs==='tb'){ txt='<span><b>Tie-break</b></span><span class="mut">Le priorità sono pronte</span>'; act='<button class="act go" data-act="brief" data-b="tb">Indicazioni</button>'; tint='var(--ball)'; }
    else if(bs){ txt=`<span><b>Set ${bs} finito</b></span><span class="mut">Cosa dire alle giocatrici</span>`; act=`<button class="act go" data-act="brief" data-b="${bs}">Indicazioni</button>`; tint='var(--ball)'; }
    else txt=(cloud.state==='loading'&&!m.ev.length)?'<span class="mut">Recupero i dati dal tuo account…</span>':(insightLine(m)||'<span><b>Numero, colpo, esito</b></span><span class="mut">In qualsiasi ordine: si salva da solo</span>');
  }
  const hist=m.ev.length&&!partial?`<button class="act hist" data-act="hist" aria-label="Cronologia, ${att(m.ev.length)}">${IC.list}<span>${m.ev.length}</span></button>`:'';
  st.innerHTML=`<div class="txt">${txt}</div>${act}${hist}`;
  st.classList.toggle('building',partial);
  st.style.setProperty('--tint',tint);
  const nx=!partial?'':!sel.n?'n':!sel.z?'z':'o';
  $('#jerseys').classList.toggle('next',nx==='n'); $('#court').classList.toggle('next',nx==='z'); $('#outs').classList.toggle('next',nx==='o');
  const oc={K:0,D:0,B:0,E:0}; m.ev.forEach(e=>{ if(e.s===m.set&&e.p===s) oc[e.o]++; });
  $$('#outs .out').forEach(b=>{ b.setAttribute('aria-pressed',String(sel.o===b.dataset.o)); const c=b.querySelector('.oc'); if(c) c.textContent=oc[b.dataset.o]||''; });
}
function renderFeed(){
  const m=cur(), box=$('#feed'); if(!box) return;
  const last=m.ev.slice(-8).reverse();
  if(!last.length){ box.innerHTML=''; box.hidden=true; return; }
  box.hidden=false;
  box.innerHTML=`<h3>Ultime azioni</h3><ul class="flist">${last.map(e=>`<li><span class="sd" style="background:${e.p==='N'?'var(--N1)':'var(--L1)'};box-shadow:0 0 0 1px rgba(255,255,255,.5)"></span><span class="fw">${e.n==='?'?'?':'#'+esc(e.n)}</span><span class="ft">${esc(cap(shotName(e.z,e.d)))}<small>${esc(oLab(e.p,e.o))}, set ${e.s}</small></span><button class="iconbtn" data-fdel="${e.id}" aria-label="Elimina: ${esc(evText(e))}">${IC.trash}</button></li>`).join('')}</ul>`;
}
$('#feed').addEventListener('click',e=>{
  const b=e.target.closest('[data-fdel]'); if(!b) return;
  const m=cur(), ev=m.ev.find(x=>x.id===b.dataset.fdel); if(!ev) return;
  if(removeEvent(m.id,ev.id)){ renderJerseys(); renderCourtState(); renderFeed(); renderHeader(); setFlash('removed',ev,m.id,false); }
});
function clearSel(){ resetSel(); updateJerseySel(); renderCourtState(); renderDock(); }
function undoLast(){
  while(sessionSaved.length){
    const x=sessionSaved.pop(), m=db.matches[x.mid]; if(!m) continue;
    const ev=m.ev.find(e=>e.id===x.id); if(!ev) continue;
    if(m.id!==db.cur) continue;
    if(removeEvent(m.id,ev.id)){ renderJerseys(); renderCourtState(); renderFeed(); renderHeader(); setFlash('removed',ev,m.id,false); }
    return;
  }
  toast('Niente da annullare in questa sessione.');
}
$('#status').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]'); if(!b) return;
  const a=b.dataset.act;
  if(a==='clear') clearSel();
  else if(a==='undo'&&flash){ const f=flash; if(removeEvent(f.mid,f.ev.id)){ renderJerseys(); renderCourtState(); renderFeed(); renderHeader(); setFlash('removed',f.ev,f.mid,false); } }
  else if(a==='restore'&&flash){ const f=flash; if(restoreEvent(f.mid,f.ev)){ renderJerseys(f.ev.n); renderCourtState(); renderFeed(); renderHeader(); setFlash('saved',f.ev,f.mid,false); } }
  else if(a==='hist') openHistory();
  else if(a==='toset') changeSet(+b.dataset.s,true);
  else if(a==='brief'){ const v=b.dataset.b; tipsUI={scope:v==='tb'?'tb':'set'+v,tab:'brief'}; const r=b.getBoundingClientRect(); show('tips',{origin:{x:r.left+r.width/2,y:r.top+r.height/2}}); }
});

/* tastiera (PC) */
let kbuf='', kbufT=0;
function typedNumber(k){
  const nums=jerseyNums();
  kbuf=(kbuf+k).slice(-3);
  let cands=nums.filter(n=>n.startsWith(kbuf));
  if(!cands.length){ kbuf=k; cands=nums.filter(n=>n.startsWith(kbuf)); }
  clearTimeout(kbufT);
  if(!cands.length){ kbuf=''; toast(`Il numero ${k} non è in ${side()==='N'?'squadra':'rosa'}.`); return; }
  const exact=cands.includes(kbuf);
  if(exact&&cands.length===1){ sel.n=null; pickNum(kbuf); kbuf=''; return; }
  const pending=kbuf;   // c'è un numero più lungo che inizia così (1 e 12): aspetto un attimo
  kbufT=setTimeout(()=>{ if(exact&&jerseyNums().includes(pending)){ sel.n=null; pickNum(pending); } kbuf=''; },650);
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(!$('#present').hidden){ closeShow(); return; }
    if(!$('#scrim').hidden){ closeSheet(); return; }
    if(view==='scout'&&(sel.n||sel.z||sel.o)) clearSel();
    return;
  }
  if(!$('#present').hidden){ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); showStep(e.key==='ArrowRight'?1:-1); } return; }
  if(!$('#scrim').hidden) return;
  const t=e.target; if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  if(e.ctrlKey||e.metaKey||e.altKey||e.repeat){ if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&!e.repeat&&e.key.toLowerCase()==='z'&&view==='scout'){ e.preventDefault(); undoLast(); } return; }
  const k=e.key, lk=k.toLowerCase();
  if(lk==='i'&&view==='scout'){ e.preventDefault(); show('tips'); return; }
  if(lk==='s'&&view!=='scout'){ e.preventDefault(); show('scout'); return; }
  if(view!=='scout') return;
  if(/^\d$/.test(k)){ e.preventDefault(); typedNumber(k); return; }
  if(k==='?'){ e.preventDefault(); sel.n=null; pickNum('?'); return; }
  if(KEYOUT[lk]){ e.preventDefault(); pickOut(KEYOUT[lk]); return; }
  if(lk==='l'||lk==='n'){ e.preventDefault(); setSide(lk==='l'?'L':'N'); return; }
  if(k==='+'||k==='='){ e.preventDefault(); const m=cur(); if(m.set<5) changeSet(m.set+1,true); }
});

/* =========================================================
   INDICAZIONI
   ========================================================= */
function punchy(z,d){
  if(d==='T') return 'con il pallonetto'+(z==='P'?' in pipe':' da '+z);
  if(z==='P') return isC(d)?'con la pipe verso zona '+d:'con la pipe in '+DN[d];
  if(z==='1') return 'da 1 '+DN[d];
  if(isC(d)) return 'da 3 verso zona '+d;
  return 'da '+z+' in '+DN[d];
}
function sameOpp(m){ const k=norm(m.opp); if(!k) return []; return Object.values(db.matches).filter(x=>x.id!==m.id&&norm(x.opp)===k); }
function fEvents(scope){
  const f=scope||filter, m=cur();
  if(f==='opp') return [m].concat(sameOpp(m)).flatMap(x=>x.ev);
  if(f.indexOf('set')===0){ const s=+f.slice(3); return m.ev.filter(e=>e.s===s); }
  return m.ev;
}
const sideEv=(evs,s)=>evs.filter(e=>e.p===s);
function scopeLabel(scope){
  const f=scope||filter, m=cur();
  if(f==='opp') return 'Tutte le partite contro '+m.opp.trim();
  if(f==='tb') return 'Tie-break, tutta la partita del '+fmtDate(m.date);
  if(f.indexOf('set')===0) return 'Set '+f.slice(3)+', partita del '+fmtDate(m.date);
  return 'Partita del '+fmtDate(m.date);
}
function scopeOpts(){
  const m=cur(), o=setsWithData(m).map(s=>({k:'set'+s,l:'Set '+s}));
  o.push({k:'match',l:'Tutta la partita'});
  if(sideEv(m.ev,'L').length>=8&&(m.set>=4||setsWithData(m).length>=3)) o.push({k:'tb',l:'Tie-break'});
  const others=sameOpp(m); if(others.length) o.push({k:'opp',l:`Tutte contro ${m.opp.trim()} (${others.length+1})`});
  return o;
}
function autoScope(){
  const m=cur();
  if(m.set===5&&sideEv(m.ev,'L').length>=8) return 'tb';
  if(m.ev.filter(e=>e.s===m.set).length>=4) return 'set'+m.set;
  const prev=setsWithData(m).filter(s=>s<m.set).pop();
  return prev?'set'+prev:'match';
}
function curScope(){ const opts=scopeOpts().map(o=>o.k); let s=tipsUI.scope||autoScope(); if(!opts.includes(s)) s='match'; return s; }

/* =========================================================
   Il motore delle indicazioni
   Non elenca numeri: li legge. Ogni indicazione è un comando
   da dire in campo, con il perché e quanto è affidabile.
   ========================================================= */
const conf=n=>n>=8?{k:'hi',l:'Dato solido'}:n>=5?{k:'mid',l:'Probabile'}:{k:'lo',l:'Da confermare'};
const nmN=n=>{ const p=plOf(n); return p&&p.nm?p.nm:'la #'+n; };
const NmN=n=>{ const p=plOf(n); return p&&p.nm?p.nm:'La #'+n; };
function cmdThreat(z,d,n){
  const t='#'+n;
  if(d==='T') return `Corta dietro il muro sulla ${t}`;
  if(z==='P') return `Fermate la pipe della ${t}`;
  if(z==='1') return `Aspettate la ${t} da zona 1`;
  if(z==='3') return `Chiudete il primo tempo della ${t}`;
  return d==='D'?`Togliete la diagonale alla ${t}`:`Togliete la parallela alla ${t}`;
}
function cmdShot(z,d){
  if(d==='T') return 'Una giocatrice corta dietro il muro';
  if(z==='P') return 'Fermate la loro pipe';
  if(z==='1') return 'Coprite il loro attacco da 1';
  if(z==='3') return 'Chiudete il loro primo tempo';
  return `Coprite la ${DN[d]} da ${z}`;
}
const zoneName=z=>({'4':'la loro banda','3':'il centro','2':'il loro opposto','P':'la pipe','1':'l’attacco da 1'}[z]);
const kRate=a=>a.length?a.filter(e=>e.o==='K').length/a.length:0;

/* stessa avversaria in altre partite: il colpo che fa male si ripete? */
function pastConfirm(n,z,d){
  const m=cur(), others=sameOpp(m).filter(x=>x.ev.some(e=>e.p==='L'&&e.n===n));
  const hits=others.filter(x=>{ const A=aggregate(x.ev.filter(e=>e.p==='L'&&e.n===n)); const p=A.players[0]; const k=p&&topKill(p); return k&&k.z===z&&k.d===d; });
  if(!hits.length) return '';
  const last=hits.sort((a,b)=>b.created-a.created)[0];
  return hits.length>1?`Lo fa da ${hits.length+1} partite.`:`Lo faceva già il ${fmtDate(last.date)}.`;
}

function buildBrief(scope){
  const m=cur(), evs=fEvents(scope), L=sideEv(evs,'L'), N=sideEv(evs,'N');
  const B={scope,L,N,tL:totals(L),tN:totals(N),items:[],good:[],keys:[]};
  // confronto: il set prima, oppure (tie-break) gli ultimi due set contro i precedenti
  let rL=null, oL=null, rN=null, oN=null, plab='';
  if(scope.indexOf('set')===0){
    const s=+scope.slice(3), prev=setsWithData(m).filter(x=>x<s).pop();
    if(prev){ const pe=m.ev.filter(e=>e.s===prev); rL=L; oL=sideEv(pe,'L'); rN=N; oN=sideEv(pe,'N'); plab='nel set '+prev; }
  }else if(scope==='tb'){
    const sets=[...new Set(evs.map(e=>e.s))].sort((a,b)=>a-b);
    if(sets.length>=3){ const rs=sets.slice(-2); rL=L.filter(e=>rs.includes(e.s)); oL=L.filter(e=>!rs.includes(e.s)); rN=N.filter(e=>rs.includes(e.s)); oN=N.filter(e=>!rs.includes(e.s)); plab='prima degli ultimi due set'; }
  }
  const dir=(r,o)=>r&&o&&r.length>=6&&o.length>=6?kRate(r)-kRate(o):0;
  B.dL=dir(rL,oL); B.dN=dir(rN,oN); B.oL=oL; B.oN=oN; B.plab=plab;

  /* ---------------- difesa: loro in attacco ---------------- */
  if(L.length>=4){
    const A=aggregate(L), Ao=oL&&oL.length?aggregate(oL):null, Ar=rL&&rL.length?aggregate(rL):null, T=L.length, tot=B.tL;
    const trend=n=>{ if(!Ao||!Ar) return 0; const r=Ar.players.find(p=>p.n===n), o=Ao.players.find(p=>p.n===n); return (r&&o&&r.t>=3&&o.t>=3)?r.kp-o.kp:0; };
    const covered=new Set(), used=new Set();
    A.players.filter(p=>p.n!=='?'&&p.t>=3&&p.K>=2).forEach(p=>{
      const k=topKill(p); if(!k) return;
      const tr=trend(p.n), b=blockTip(k.z,k.d), tips=tipCount(p), extra=[];
      covered.add(k.z+k.d); used.add(p.n);
      if(Ao&&scope.indexOf('set')===0){ const q=Ao.players.find(x=>x.n===p.n), a=topShot(p), bb=q&&q.t>=3?topShot(q):null; if(a&&bb&&(a.z+a.d)!==(bb.z+bb.d)&&a.t/p.t>=.4&&bb.t/q.t>=.4) extra.push(`Ha cambiato colpo: ${plab} andava ${shotName(bb.z,bb.d)}.`); }
      if(tips>=2&&tips/p.t>=.25&&k.d!=='T') extra.push(`Occhio anche al pallonetto: ${tips} su ${p.t}.`);
      if(tr>=.2) extra.push('Sta segnando più di prima.');
      const pc=scope==='opp'?'':pastConfirm(p.n,k.z,k.d); if(pc) extra.push(pc);
      B.items.push({side:'def',kind:'threat',tag:'#'+p.n,head:cmdThreat(k.z,k.d,p.n),why:`Fa punto ${punchy(k.z,k.d)}: ${k.K} su ${k.t}`+(p.K>k.K?`, ${pts(p.K)} in tutto`:''),n:k.t,
        text:cap(defense(k.z,k.d))+'.'+(b?' Muro: '+b+'.':'')+(extra.length?' '+extra.join(' '):''),
        board:{att:'L',shots:[{z:k.z,d:k.d}],num:p.n,block:!!b,defend:true},score:p.K*(.6+p.kp)+(tr>=.2?2:0)+(pc?1:0)});
    });
    Object.values(A.team).filter(s=>s.K>=2&&s.K/s.t>=.4&&!covered.has(s.z+s.d)).forEach(s=>{
      const by=A.players.filter(p=>p.sh[s.z+s.d]&&p.sh[s.z+s.d].K).map(p=>who(p.n,'L')), b=blockTip(s.z,s.d);
      covered.add(s.z+s.d);
      B.items.push({side:'def',kind:'shot',tag:'Colpo',head:cmdShot(s.z,s.d),why:`${cap(shotName(s.z,s.d))}: ${pts(s.K)} su ${s.t}`,n:s.t,text:`Punti di ${joinIt(by)}. ${cap(defense(s.z,s.d))}.`+(b?' Muro: '+b+'.':''),board:{att:'L',shots:[{z:s.z,d:s.d}],block:!!b,defend:true},score:s.K*(.4+s.K/s.t)});
    });
    const tipT=Object.values(A.team).filter(s=>s.d==='T'), tK=tipT.reduce((a,s)=>a+s.K,0), tT=tipT.reduce((a,s)=>a+s.t,0);
    if(tK>=2&&tK/tT>=.35&&!B.items.some(x=>x.board.shots[0]&&x.board.shots[0].d==='T')){
      const z=tipT.slice().sort(byUse)[0].z;
      B.items.push({side:'def',kind:'tip',tag:'Pallonetti',head:'Una giocatrice corta dietro il muro',why:`${pts(tK)} su ${tT} pallonetti`,n:tT,text:'Chi non salta a muro resta corta, pronta a entrare. Non restate piantate in fondo.',board:{att:'L',shots:[{z,d:'T'}],defend:true},score:tK*.9});
    }
    const hl=hole(heat(L));
    if(hl){
      const lit=new Set(B.items.flatMap(x=>x.board.shots.flatMap(s=>landing(s.z,s.d).map(c=>c[0]))));
      if(!lit.has(hl.c)) B.items.push({side:'def',kind:'hole',tag:'Zona',head:'Coprite '+cellName(hl.c),why:`Lì cadono ${fmtN(hl.K)} loro punti su ${fmtN(hl.t)} palloni`,n:Math.round(hl.t),text:'È il punto del nostro campo dove ci fanno più male: spostate lì la difesa.',board:{att:'L',shots:[],hi:[hl.c]},score:hl.K*(.4+hl.K/hl.t)});
    }
    // da dove parte il loro gioco: il muro si sposta prima che arrivi la palla
    if(T>=10){
      const zc={}; L.forEach(e=>{ zc[e.z]=(zc[e.z]||0)+1; });
      const [zt,zn]=Object.entries(zc).sort((a,b)=>b[1]-a[1])[0], share=zn/T;
      const thr={'4':.5,'2':.45,'3':.35,'P':.3,'1':.3}[zt];
      if(share>=thr&&!B.items.some(x=>x.kind==='threat'&&x.board.shots[0].z===zt&&x.score>4)){
        const zs={}; L.filter(e=>e.z===zt).forEach(e=>{ const k=e.z+e.d; zs[k]=zs[k]||{z:e.z,d:e.d,t:0,K:0}; zs[k].t++; if(e.o==='K') zs[k].K++; });
        const head=zt==='4'?'Muro spostato sulla loro banda':zt==='2'?'Muro spostato sul loro opposto':zt==='3'?'Centrale pronto sul primo tempo':'Attenti alla seconda linea';
        B.items.push({side:'def',kind:'dist',tag:'Gioco',head,why:`Il ${pct(share)} dei loro attacchi parte da ${zt==='P'?'pipe':'zona '+zt}`,n:zn,text:`Il loro palleggio cerca ${zoneName(zt)}: anticipate il muro prima che arrivi la palla.`,board:{att:'L',shots:Object.values(zs).map(x=>({z:x.z,d:x.d,w:1.8+3.6*x.t/zn}))},score:share*6});
      }
    }
    A.players.filter(p=>p.n!=='?'&&p.t>=4&&!used.has(p.n)).forEach(p=>{
      const s=topShot(p); if(!s||s.t<3||s.t/p.t<.5||covered.has(s.z+s.d)) return;
      B.items.push({side:'def',kind:'pred',tag:'#'+p.n,head:`La #${p.n} va sempre ${punchy(s.z,s.d)}`,why:`${s.t} attacchi su ${p.t}: è prevedibile`,n:p.t,text:cap(defense(s.z,s.d))+'.',board:{att:'L',shots:[{z:s.z,d:s.d}],num:p.n,defend:true},score:1.2+s.t/p.t});
    });
    // cosa va bene
    A.players.filter(p=>p.n!=='?'&&p.t>=4&&p.eff<=0).sort((a,b)=>a.eff-b.eff).slice(0,2).forEach(p=>B.good.push({head:`La #${p.n} la teniamo`,text:`${pts(p.K)} su ${att(p.t)}. Muro a uno su di lei e aiuti sulle altre.`,score:p.t*(.5-p.eff)}));
    if(Ar&&Ao) A.players.filter(p=>p.n!=='?'&&trend(p.n)<=-.2).slice(0,1).forEach(p=>{ const r=Ar.players.find(x=>x.n===p.n); B.good.push({head:`La #${p.n} è in calo`,text:`${r.K} su ${r.t} ${scope==='tb'?'negli ultimi due set':'in questo set'}, meno di prima.`,score:3}); });
    if(T>=8&&tot.D/T>=.3) B.good.push({head:`Difendiamo il ${pct(tot.D/T)} dei loro attacchi`,text:`${tot.D} ${plural(tot.D,'difesa','difese')} su ${att(T)}: la difesa tiene.`,score:tot.D/T*8});
    if(tot.B>=2){ const bl=A.players.filter(p=>p.B).sort((a,b)=>b.B-a.B).slice(0,2).map(p=>who(p.n,'L')); B.good.push({head:`${tot.B} murate`,text:`Il muro c’è, soprattutto su ${joinIt(bl)}.`,score:tot.B*1.2}); }
    if(tot.E>=3&&tot.E/T>=.12) B.good.push({head:`Sbagliano ${tot.E} attacchi`,text:`Il ${pct(tot.E/T)}: palla in gioco e pazienza, i punti ce li regalano.`,score:tot.E});
    Object.values(A.team).filter(s=>s.t>=4&&s.K===0).sort(byUse).slice(0,1).forEach(s=>B.good.push({head:`${cap(shotName(s.z,s.d))}: 0 su ${s.t}`,text:'Lì le leggiamo bene.',score:s.t*.5}));
  }
  /* ---------------- attacco: noi ---------------- */
  if(N.length>=4){
    const I=insightsN(N), hl=hole(heat(N)), T=N.length;
    const w=I.work[0];
    if(w){ const by=I.A.players.filter(p=>p.sh[w.z+w.d]&&p.sh[w.z+w.d].K).map(p=>who(p.n,'N')); B.items.push({side:'att',kind:'work',tag:'Noi',head:'Insistete '+punchy(w.z,w.d),why:`${w.K} punti su ${w.t}: lì non ci leggono`,n:w.t,text:by.length?`Punti di ${joinIt(by)}.`:'Continuate a cercarlo.',board:{att:'N',shots:[{z:w.z,d:w.d}]},score:w.K*(.5+w.K/w.t)+.5}); }
    if(hl&&!(w&&landing(w.z,w.d).some(c=>c[0]===hl.c))) B.items.push({side:'att',kind:'target',tag:'Noi',head:'Attaccate verso '+cellName(hl.c),why:`${fmtN(hl.K)} punti su ${fmtN(hl.t)} palloni`,n:Math.round(hl.t),text:'È il loro buco: lì non arrivano.',board:{att:'N',shots:[],hi:[hl.c]},score:hl.K*(.4+hl.K/hl.t)});
    // a chi dare la palla: chi rende e ne riceve poca, chi ne riceve tanta e rende poco
    const named=I.A.players.filter(p=>p.n!=='?');
    const under=T>=10?named.filter(p=>p.t>=3&&p.kp>=.5&&p.t/T<=.2).sort((a,b)=>b.kp-a.kp)[0]:null;
    const uk=under&&topKill(under), wItem=B.items.find(x=>x.kind==='work');
    if(under&&uk&&w&&uk.z===w.z&&uk.d===w.d&&wItem){ wItem.text+=` ${NmN(under.n)} riceve solo il ${pct(under.t/T)} dei palloni: cercatela di più.`; wItem.score+=1.5; }
    else if(under) B.items.push({side:'att',kind:'feed',tag:who(under.n,'N'),head:'Più palloni a '+nmN(under.n),why:`${under.K} punti su ${under.t}, ma riceve solo il ${pct(under.t/T)} dei palloni`,n:under.t,text:`Quando può, il palleggio la cerchi: rende più delle altre.${topKill(under)?' Il suo colpo: '+shotName(topKill(under).z,topKill(under).d)+'.':''}`,board:{att:'N',shots:topKill(under)?[{z:topKill(under).z,d:topKill(under).d}]:[],num:under.n},score:under.K*.9+2});
    const over=T>=10?named.filter(p=>p.t>=5&&p.t/T>=.3&&p.eff<0).sort((a,b)=>a.eff-b.eff)[0]:null;
    if(over) B.items.push({side:'att',kind:'unload',tag:who(over.n,'N'),head:'Alleggerite '+nmN(over.n),why:`Prende il ${pct(over.t/T)} dei palloni, efficienza ${spct(over.eff)}`,n:over.t,text:`${over.E} errori e ${over.B} murate. Distribuite di più: le altre stanno rendendo meglio.`,board:{att:'N',shots:worstShot(over)?[{z:worstShot(over).z,d:worstShot(over).d,bad:1}]:[],num:over.n},score:(over.E+over.B)*.8+1});
    const b=I.best[0], bk=b&&topKill(b);
    if(b&&b.K>=2&&!(under&&under.n===b.n)&&!(w&&bk&&bk.z===w.z&&bk.d===w.d)) B.items.push({side:'att',kind:'best',tag:who(b.n,'N'),head:NmN(b.n)+' è in serata',why:`${pts(b.K)} su ${att(b.t)}, ${pct(b.kp)} a segno`,n:b.t,text:bk?`Il suo colpo: ${shotName(bk.z,bk.d)} (${bk.K} su ${bk.t}). Nei punti importanti, palla a lei.`:'Nei punti importanti, palla a lei.',board:{att:'N',shots:bk?[{z:bk.z,d:bk.d}]:[],num:b.n},score:b.K*(.55+b.kp)});
    const a=I.avoid[0];
    if(a&&!(over&&worstShot(over)&&worstShot(over).z===a.z&&worstShot(over).d===a.d)) B.items.push({side:'att',kind:'avoid',tag:'Noi',head:'Evitate '+shotName(a.z,a.d),why:`${lossOf(a)} palloni persi su ${a.t}`,n:a.t,text:'Tra errori e murate ci costa troppo: cercate un’altra soluzione.',board:{att:'N',shots:[{z:a.z,d:a.d,bad:1}]},score:lossOf(a)*.8});
  }
  // ordine: le tre cose da dire adesso, almeno una per lato quando c’è
  const def=B.items.filter(x=>x.side==='def').sort((a,b)=>b.score-a.score), atk=B.items.filter(x=>x.side==='att').sort((a,b)=>b.score-a.score);
  const top=[];
  if(def[0]) top.push(def.shift());
  if(atk[0]) top.push(atk.shift());
  const rest=def.concat(atk).sort((a,b)=>b.score-a.score);
  while(top.length<3&&rest.length) top.push(rest.shift());
  top.sort((a,b)=>(a.side==='def'?0:1)-(b.side==='def'?0:1)||b.score-a.score);
  B.now=top; B.more=rest.slice(0,scope==='tb'?5:4);
  B.good.sort((a,b)=>b.score-a.score); B.good=B.good.slice(0,3);
  B.keys=keyInsights(B);
  return B;
}

/* la chiave: una frase che legge la partita, oltre i numeri */
function keyInsights(B){
  const out=[], L=B.L, N=B.N, tL=B.tL, tN=B.tN;
  if(L.length>=6&&tL.K>=4){
    const A=aggregate(L), top=A.players.filter(p=>p.n!=='?').sort((a,b)=>b.K-a.K)[0];
    const scorers=A.players.filter(p=>p.K>0).length;
    if(top&&top.K/tL.K>=.4) out.push({s:top.K/tL.K*10,side:'L',title:`Il loro gioco passa dalla #${top.n}`,text:`Fa ${top.K} dei loro ${tL.K} punti. Fermata lei, il loro attacco si spegne.`});
    else if(scorers>=4) out.push({s:3,side:'L',title:'Fanno punto con tutte',text:`${scorers} giocatrici diverse a segno: non c’è una da marcare, serve ordine in difesa.`});
    if(tL.E+tL.B>=tL.K&&L.length>=8) out.push({s:4.5,side:'L',title:'Si battono da sole',text:`Tra errori e murate perdono ${tL.E+tL.B} palloni e ne chiudono ${tL.K}: palla in gioco e pazienza.`});
  }
  if(L.length>=8&&N.length>=8){
    const rl=tL.K/L.length, rn=tN.K/N.length, d=rn-rl;
    if(Math.abs(d)>=.1) out.push({s:Math.abs(d)*25,side:d>0?'N':'L',title:d>0?'In attacco siamo più forti':'Attaccano meglio di noi',text:d>0?`${pct(rn)} a punto contro ${pct(rl)}. Il set lo perde solo chi sbaglia: tenete la palla in gioco.`:`${pct(rl)} a punto contro il nostro ${pct(rn)}. La differenza è lì: palla a chi sta segnando e difesa sui loro colpi preferiti.`});
  }
  if(N.length>=6&&tN.K>=4){
    const A=aggregate(N), top=A.players.filter(p=>p.n!=='?').sort((a,b)=>b.K-a.K)[0];
    if(top&&top.K/tN.K>=.45) out.push({s:top.K/tN.K*7,side:'N',title:`Il nostro attacco è ${nmN(top.n)}`,text:`${top.K} dei nostri ${tN.K} punti sono suoi. Funziona, ma prima o poi la marcheranno: preparate una seconda soluzione.`});
  }
  // il ritmo: gli ultimi palloni contro i precedenti
  if(L.length>=14){ const last=L.slice(-7), before=L.slice(0,-7), d=kRate(last)-kRate(before); if(Math.abs(d)>=.25) out.push({s:Math.abs(d)*14,side:'L',title:d>0?'Stanno prendendo ritmo':'Li stiamo spegnendo',text:d>0?`Negli ultimi 7 attacchi ne hanno chiusi ${last.filter(e=>e.o==='K').length}: ora serve un cambio, anche solo un time-out.`:`Negli ultimi 7 attacchi ne hanno chiusi ${last.filter(e=>e.o==='K').length}: continuate così, la difesa sta leggendo.`}); }
  if(B.dL>=.12&&B.oL) out.push({s:B.dL*20,side:'L',title:'Stanno crescendo',text:`Ora chiudono il ${pct(kRate(L))} degli attacchi, ${B.plab} erano al ${pct(kRate(B.oL))}.`});
  if(B.dL<=-.12&&B.oL) out.push({s:-B.dL*16,side:'N',title:'Li stiamo frenando',text:`Ora chiudono il ${pct(kRate(L))} degli attacchi, ${B.plab} erano al ${pct(kRate(B.oL))}.`});
  out.sort((a,b)=>b.s-a.s);
  return out.slice(0,2);
}
function briefTitle(scope){ return scope==='tb'?'Tie-break':scope.indexOf('set')===0?'Set '+scope.slice(3):scope==='opp'?'Tutte le partite':'Partita'; }
function briefText(B){
  const m=cur(), out=[];
  out.push(`*${briefTitle(B.scope)}${m.opp.trim()?' vs '+m.opp.trim():''}: cosa fare*`);
  const h=[]; if(B.L.length) h.push(`loro ${pct(B.tL.K/B.L.length)} a punto (${B.tL.K}/${B.L.length})`); if(B.N.length) h.push(`noi ${pct(B.tN.K/B.N.length)} (${B.tN.K}/${B.N.length})`);
  if(h.length) out.push(cap(h.join(', '))+'.');
  if(B.keys.length){ out.push(''); B.keys.forEach(k=>out.push(`*${k.title}.* ${k.text}`)); }
  if(B.now.length){ out.push('','*Le cose da dire adesso*'); B.now.forEach((x,i)=>out.push(`${i+1}. ${x.head}. ${x.why}. ${x.text}`)); }
  if(B.more.length){ out.push('','*Poi*'); B.more.forEach(x=>out.push(`- ${x.head}. ${x.why}.`)); }
  if(B.good.length){ out.push('','*Cosa va bene*'); B.good.forEach(g=>out.push(`- ${g.head}. ${g.text}`)); }
  return out.join('\n');
}

/* lavagna: il campo disegnato. Il nostro campo è sempre sotto, come dalla panchina */
const ORG={L:{'4':[230,94],'3':[150,94],'2':[70,94],'P':[150,56],'1':[70,56]},N:{'4':[70,122],'3':[150,122],'2':[230,122],'P':[150,166],'1':[230,166]}};
const CELLR={bot:{C:[30,110,240,31],'5':[30,141,80,61],'6':[110,141,80,61],'1':[190,141,80,61]},top:{C:[30,77,240,31],'1':[30,14,80,63],'6':[110,14,80,63],'5':[190,14,80,63]}};
function tgt(att,c,ox){
  if(att==='L') return c==='C'?[Math.min(236,Math.max(64,ox)),127]:{'5':[70,176],'6':[150,180],'1':[230,176]}[c];
  return c==='C'?[Math.min(236,Math.max(64,ox)),90]:{'1':[70,40],'6':[150,36],'5':[230,40]}[c];
}
const r1=v=>Math.round(v*10)/10;
function bArrow(x1,y1,x2,y2,w,col,pad){
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L;
  const sx=x1+ux*(pad||0), sy=y1+uy*(pad||0);
  const hl=7+w*1.3, hw=4.2+w*1.05, bx=x2-ux*hl, by=y2-uy*hl, px=-uy, py=ux;
  return `<line x1="${r1(sx)}" y1="${r1(sy)}" x2="${r1(bx)}" y2="${r1(by)}" stroke="${col}" stroke-width="${r1(w)}" stroke-linecap="round"/><polygon points="${r1(x2)},${r1(y2)} ${r1(bx+px*hw)},${r1(by+py*hw)} ${r1(bx-px*hw)},${r1(by-py*hw)}" fill="${col}"/>`;
}
function board(o){
  const att=o.att, defHalf=att==='L'?'bot':'top';
  const hi=new Set(o.hi||[]);
  const shots=o.shots||[];
  if(o.defend||att==='N') shots.forEach(s=>{ if(!s.bad) landing(s.z,s.d).forEach(c=>hi.add(c[0])); });
  let g=`<rect x="0" y="0" width="300" height="216" rx="14" fill="#F2F5F9"/>`;
  hi.forEach(c=>{ const r=CELLR[defHalf][c]; if(r) g+=`<rect x="${r[0]+1}" y="${r[1]+1}" width="${r[2]-2}" height="${r[3]-2}" fill="${att==='L'?'#FFD23F':'#FFC08F'}" opacity=".55"/>`; });
  g+=`<rect x="30" y="14" width="240" height="94" fill="none" stroke="#2C5AA0" stroke-width="2"/><rect x="30" y="110" width="240" height="92" fill="none" stroke="#2C5AA0" stroke-width="2"/>`
    +`<line x1="30" y1="77" x2="270" y2="77" stroke="#9AB2D6" stroke-width="1.4" stroke-dasharray="5 4"/><line x1="30" y1="141" x2="270" y2="141" stroke="#9AB2D6" stroke-width="1.4" stroke-dasharray="5 4"/>`
    +`<text x="14" y="62" transform="rotate(-90 14 62)" text-anchor="middle" style="font:700 10px Archivo,sans-serif;fill:#4D5E7C">loro</text><text x="14" y="156" transform="rotate(-90 14 156)" text-anchor="middle" style="font:700 10px Archivo,sans-serif;fill:#4D5E7C">noi</text>`;
  hi.forEach(c=>{ const r=CELLR[defHalf][c]; if(r&&c!=='C') g+=`<text x="${r[0]+r[2]/2}" y="${defHalf==='bot'?r[1]+r[3]-8:r[1]+14}" text-anchor="middle" style="font:700 11px Archivo,sans-serif;fill:#5C4500">zona ${c}</text>`; else if(r) g+=`<text x="${att==='L'?44:44}" y="${r[1]+(defHalf==='bot'?20:13)}" style="font:700 10.5px Archivo,sans-serif;fill:#5C4500">corta</text>`; });
  const blockX=[];
  shots.forEach(s=>{
    const org=ORG[att][s.z]; if(!org) return;
    const cells=landing(s.z,s.d), col=s.col||(s.bad?'#7C889B':att==='L'?'#C8303B':'#13774A'), w=s.w||4.2;
    cells.forEach(([c,wt])=>{
      const t=tgt(att,c,org[0]); if(!t) return;
      if(s.d==='T'){ const tx=r1(org[0]+(150-org[0])*.38), ty=t[1], cx=(org[0]+tx)/2+(org[0]>150?-20:20), cy=(org[1]+ty)/2;
        g+=`<path d="M${org[0]} ${org[1]}Q${r1(cx)} ${r1(cy)} ${tx} ${ty}" stroke="${col}" stroke-width="${r1(w*.85)}" fill="none" stroke-dasharray="5 5" stroke-linecap="round"/><circle cx="${tx}" cy="${ty}" r="${r1(3.5+w*.6)}" fill="${col}"/>`; }
      else g+=bArrow(org[0],org[1],t[0],t[1],w*(wt<1?.8:1),col,o.num!=null?13:7);
    });
    if(o.block&&blockX.indexOf(org[0])<0) blockX.push(org[0]);
  });
  blockX.forEach(x=>{ g+=`<rect x="${x-26}" y="112" width="52" height="8" rx="4" fill="#E2621B"/><text x="${x}" y="133" text-anchor="middle" style="font:700 10.5px Archivo,sans-serif;fill:#A84510">muro</text>`; });
  g+=`<line x1="20" y1="109" x2="280" y2="109" stroke="#0F2747" stroke-width="4" stroke-linecap="round"/><rect x="28" y="101" width="3" height="16" fill="#E8333F"/><rect x="269" y="101" width="3" height="16" fill="#E8333F"/>`;
  if(o.defend&&att==='L'){ const c=[...hi][0], r=CELLR.bot[c]; if(r){ const x=r[0]+r[2]/2+(c==='C'?0:0), y=r[1]+r[3]/2-(c==='C'?0:4); g+=`<circle cx="${x}" cy="${y}" r="11" fill="#E2621B" stroke="#fff" stroke-width="3"/>`; } }
  if(shots.length===1||o.num!=null){ const s=shots[0]; if(s){ const p=ORG[att][s.z]; g+=`<circle cx="${p[0]}" cy="${p[1]}" r="${o.num!=null?13:7}" fill="${att==='L'?'#1F5FB0':'#E2621B'}" stroke="#fff" stroke-width="2"/>`+(o.num!=null?`<text x="${p[0]}" y="${p[1]+5.5}" text-anchor="middle" style="font:800 15px 'Big Shoulders Display',Archivo,sans-serif;fill:#fff">${esc(o.num)}</text>`:''); } }
  return `<svg class="board" viewBox="0 0 300 216" role="img" aria-label="${esc(o.label||'Lavagna del campo')}">${g}</svg>`;
}
/* campo con tutti i colpi di una giocatrice o della squadra */
function shotsBoard(shotMap,s,label){
  const list=Object.values(shotMap||{}).filter(x=>x.t>0).sort((a,b)=>a.t-b.t);
  const max=list.reduce((a,x)=>Math.max(a,x.t),1);
  const col=x=>{ const r=x.K/x.t; if(s==='N') return r>=.5?'#13774A':r>=.25?'#D9820F':'#8995A8'; return r>=.5?'#C8303B':r>=.25?'#D9820F':'#6F8FC4'; };
  return board({att:s,shots:list.map(x=>({z:x.z,d:x.d,w:1.6+4.4*x.t/max,col:col(x)})),label,hi:[]});
}
function arrowLegend(s){ return `<div class="legend"><span><i style="background:${s==='N'?'#13774A':'#C8303B'}"></i>fa punto spesso</span><span><i style="background:#D9820F"></i>a volte</span><span><i style="background:${s==='N'?'#8995A8':'#6F8FC4'}"></i>raramente</span><span>più spessa = più usata</span></div>`; }

const sideChip=x=>`<span class="sidechip ${x.side}">${x.side==='def'?'Difesa':'Attacco'}</span>`;
const confChip=n=>{ const c=conf(n); return `<span class="conf ${c.k}" title="Basato su ${n} palloni"><i></i>${c.l}</span>`; };
function tipCard(x,i){
  return `<article class="tip ${x.side}"><div class="tip-top"><span class="rk" aria-label="Priorità ${i}">${i}</span>${sideChip(x)}${x.kind==='threat'||x.kind==='pred'||x.kind==='feed'||x.kind==='unload'||x.kind==='best'?`<span class="who">${esc(x.tag)}</span>`:''}</div><h3>${esc(x.head)}</h3><p class="why">${esc(x.why)}</p><div class="bd">${board(Object.assign({label:x.head},x.board))}</div><p class="tx">${esc(x.text)}</p><p class="meta">${confChip(x.n)}</p></article>`;
}
function moreRow(x){
  return `<details class="more ${x.side}"><summary><span class="dot" aria-hidden="true"></span><span class="mt"><b>${esc(x.head)}</b><small>${esc(x.why)}</small></span><svg class="i chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.5L8 10.5l4-4"/></svg></summary><div class="more-body"><p class="tx">${esc(x.text)}</p><div class="bd">${board(Object.assign({label:x.head},x.board))}</div><p class="meta">${confChip(x.n)}</p></div></details>`;
}
function keyCard(B){
  if(!B.keys.length) return '';
  const [k,k2]=B.keys;
  return `<section class="key ${k.side}" aria-label="La chiave"><p class="key-l">La chiave</p><h2>${esc(k.title)}</h2><p class="key-t">${esc(k.text)}</p>${k2?`<p class="key-2"><b>${esc(k2.title)}.</b> ${esc(k2.text)}</p>`:''}</section>`;
}
function emptyState(title,text,btn,go){ return `<div class="empty"><div class="ill">${board({att:'L',shots:[{z:'4',d:'D'}],defend:true,label:''})}</div><h3>${esc(title)}</h3><p>${esc(text)}</p><button class="btn ball" data-go="${go||'scout'}">${esc(btn||'Vai allo scout')}</button></div>`; }
function sitrep(B){
  const m=cur();
  const card=(lab,c,arr,d,old,plab)=>{ const T=totals(arr); if(!arr.length) return `<div class="sit"><p class="k"><i style="--c:${c}"></i>${esc(lab)}</p><div class="v"><b>–</b><span>nessun attacco</span></div></div>`;
    const tr=d>=.08?`<em class="up">in crescita</em>, ${esc(plab)} ${pct(kRate(old))}`:d<=-.08?`<em class="down">in calo</em>, ${esc(plab)} ${pct(kRate(old))}`:'';
    return `<div class="sit"><p class="k"><i style="--c:${c}"></i>${esc(lab)}</p><div class="v"><b>${pct(T.K/arr.length)}</b><span>${T.K} su ${arr.length} a punto</span></div>${tr?`<p class="tr">${tr}</p>`:''}</div>`; };
  return `<div class="sitrep">${card(oppLabel(m),'var(--L1)',B.L,B.dL,B.oL,B.plab)}${card(teamLabel(),'var(--N1)',B.N,B.dN,B.oN,B.plab)}</div>`;
}
function renderTips(){
  const box=$('#v-tips'), m=cur();
  const scope=curScope(), opts=scopeOpts();
  const chips=`<div class="chips" role="group" aria-label="Quali attacchi">${opts.map(o=>`<button class="chip" data-scope="${o.k}" aria-pressed="${scope===o.k}">${esc(o.l)}</button>`).join('')}</div>`;
  const tabs=[['brief','Cosa dire'],['L','Avversarie'],['N','Noi'],['X','Campo']];
  const seg=`<div class="seg" role="group" aria-label="Cosa vedere">${tabs.map(([k,l])=>`<button data-tt="${k}" aria-pressed="${tipsUI.tab===k}">${l}</button>`).join('')}</div>`;
  const evs=fEvents(scope);
  let body='';
  if(!m.ev.length) body=emptyState('Ancora niente da dire','Segna qualche attacco: qui trovi cosa dire alle giocatrici, già in ordine di importanza.');
  else if(tipsUI.tab==='brief') body=briefHTML(scope);
  else if(tipsUI.tab==='L') body=playersHTML(sideEv(evs,'L'),'L');
  else if(tipsUI.tab==='N') body=playersHTML(sideEv(evs,'N'),'N');
  else body=campoHTML(evs);
  box.innerHTML=`<div class="ind-top">${seg}${chips}</div>${body}`;
}
function briefHTML(scope){
  const B=buildBrief(scope);
  if(B.L.length<4&&B.N.length<4) return sitrep(B)+emptyState('Servono più attacchi',`Le indicazioni arrivano dal quarto attacco segnato. ${scope.indexOf('set')===0?'In questo set':'Per ora'}: ${att(B.L.length+B.N.length)}.`);
  let h=sitrep(B)+keyCard(B);
  if(B.now.length) h+=`<div class="sec-h"><h2>Da dire adesso</h2><small>${esc(briefTitle(scope))}</small></div><div class="tips">${B.now.map((x,i)=>tipCard(x,i+1)).join('')}</div>`;
  else h+=`<p class="on-tiny" style="margin:16px 2px">Ancora niente di netto: nessuna giocatrice o colpo fa la differenza con regolarità.</p>`;
  if(B.more.length) h+=`<div class="sec-h"><h2>Poi</h2><small>Tocca per aprire</small></div><div class="mores">${B.more.map(moreRow).join('')}</div>`;
  if(B.good.length) h+=`<div class="sec-h"><h2>Cosa va bene</h2></div><ul class="goods">${B.good.map(g=>`<li><span class="ck">${IC.check}</span><div><b>${esc(g.head)}</b><p>${esc(g.text)}</p></div></li>`).join('')}</ul>`;
  h+=`<p class="on-tiny" style="margin:16px 2px 0">${esc(scopeLabel(scope))}. ${scope==='tb'?'Gli ultimi due set vengono confrontati con i precedenti. ':''}Sotto i 3 attacchi una giocatrice non entra nelle indicazioni.</p>`;
  if(B.now.length||B.more.length||B.good.length||B.keys.length) h+=`<div class="ind-acts"><button class="btn ball" data-show>${svgI('M3 6.5V3h3.5M9.5 3H13v3.5M13 9.5V13H9.5M6.5 13H3V9.5')}<span>Mostra alle giocatrici</span></button><button class="btn glass" data-send aria-label="Manda il testo">${IC.share}<span>Manda</span></button></div>`;
  return h;
}

function playerCard(p,s,rank){
  const facts=s==='N'?usFacts(p):threatFacts(p);
  const pl=s==='N'&&p.n!=='?'?plOf(p.n):null;
  const title=p.n==='?'?'Numero non visto':(pl&&pl.nm?pl.nm:'Numero '+p.n);
  const subt=[p.n!=='?'&&pl&&pl.nm?'#'+p.n:'',pl&&pl.r?ROLES[pl.r]:''].filter(Boolean).join(', ');
  const rkTxt=rank?(s==='N'?['La più efficace','Seconda per punti','Terza per punti']:['La più pericolosa','Seconda minaccia','Terza minaccia'])[rank-1]:'';
  const rkCol=s==='N'?'#13774A':'#C8303B';
  const ob=OS.map(k=>p[k]?`<span style="flex:${p[k]};background:${OUT[s][k].c}" title="${esc(oLab(s,k))} ${p[k]}"></span>`:'').join('');
  return `<article class="pcard" style="--rk:${rkCol}"><div class="pc-head"><span class="puck ${s}${p.n==='?'?' unk':''}" aria-hidden="true">${esc(p.n)}</span><div class="pc-id">${rank?`<p class="rk">${rkTxt}</p>`:''}<h3>${esc(title)}</h3>${subt?`<p>${esc(subt)}</p>`:''}</div></div>`
    +`<div class="pc-k"><div><b>${p.t}</b><span>${plural(p.t,'attacco','attacchi')}</span></div><div><b style="color:${rkCol}">${p.K}</b><span>${plural(p.K,'punto','punti')}, ${pct(p.kp)}</span></div><div><b>${spct(p.eff)}</b><span>efficienza</span></div></div>`
    +`<div class="obar" role="img" aria-label="${esc(OS.filter(k=>p[k]).map(k=>oLab(s,k)+' '+p[k]).join(', '))}">${ob}</div>`
    +`<div class="pc-board">${shotsBoard(p.sh,s,'Colpi di '+who(p.n,s))}</div>`
    +(facts.length?`<dl class="facts">${facts.map(f=>`<div><dt>${esc(f[0])}</dt><dd>${esc(cap(f[1]))}</dd></div>`).join('')}</dl>`:'')
    +(p.t<5?`<p class="caveat">Solo ${att(p.t)}: aspetta altri dati prima di decidere.</p>`:'')+`</article>`;
}
function playersHTML(evs,s){
  if(!evs.length) return s==='N'?emptyState('Nessun attacco vostro','Nello scout tocca “Attacchiamo noi” e segna i vostri attacchi come fai con le avversarie.','Segna i nostri attacchi','scoutN'):emptyState('Nessun loro attacco','Segna gli attacchi avversari: qui vedi chi è pericolosa e dove tira.');
  const I=s==='N'?insightsN(evs):insightsL(evs), top=s==='N'?I.best:I.threats;
  const rank=new Map(top.map((p,i)=>[p.n,i+1]));
  const ps=I.A.players.slice().sort((a,b)=>(rank.get(a.n)||9)-(rank.get(b.n)||9)||(a.n==='?')-(b.n==='?')||b.t-a.t||b.K-a.K);
  const T=totals(evs);
  let h=`<div class="sitrep"><div class="sit"><p class="k">Attacchi ${s==='N'?'nostri':'loro'}</p><div class="v"><b>${T.t}</b><span>${pts(T.K)}, ${pct(T.K/T.t)}</span></div></div><div class="sit"><p class="k">Efficienza</p><div class="v"><b>${spct((T.K-T.E-T.B)/T.t)}</b><span>${T.E+T.B} tra errori e murate</span></div></div></div>`;
  h+=`<div class="sec-h"><h2>${s==='N'?'Le nostre attaccanti':'Le avversarie'}</h2><small>${s==='N'?'Dalla più efficace':'Dalla più pericolosa'}</small></div>${arrowLegend(s)}<div class="pgrid">${ps.map(p=>playerCard(p,s,rank.get(p.n))).join('')}</div>`;
  const all=I.A.players.slice().sort((a,b)=>b.K-a.K||b.kp-a.kp||b.t-a.t), kc=s==='N'?'#13774A':'#C8303B';
  h+=`<div class="sec-h"><h2>Tutte in tabella</h2></div><div class="tablewrap" style="--kc:${kc}"><table><thead><tr><th>N°</th><th>Attacchi</th><th>Punti</th><th>Eff.</th><th>${s==='N'?'Err. e murate':'Difese nostre'}</th></tr></thead><tbody>${all.map(p=>{ const pl=s==='N'?plOf(p.n):null; return `<tr><td><span class="jn">${p.n==='?'?'?':esc(p.n)}</span>${pl&&pl.nm?`<span class="pn">${esc(pl.nm)}</span>`:''}</td><td class="tnum">${p.t}</td><td class="tnum${p.t>=3&&p.kp>=.5?' hot':''}">${p.K}<small>${pct(p.kp)}</small></td><td class="tnum">${spct(p.eff)}</td><td class="tnum">${s==='N'?(p.E+p.B):pct(p.dp)}</td></tr>`; }).join('')}</tbody></table></div><p class="on-tiny" style="margin:8px 2px 0">Efficienza = (punti − errori − murate) ÷ attacchi.</p>`;
  h+=`<div class="ind-acts static"><button class="btn glass" data-report style="grid-column:1/-1">${IC.share}<span>Manda il report completo</span></button></div>`;
  return h;
}
function campoHTML(evs){
  const L=sideEv(evs,'L'), N=sideEv(evs,'N');
  if(!L.length||!N.length) return emptyState('Servono entrambi i lati','Il campo mette a confronto i loro attacchi e i vostri: segna qualche attacco per parte.');
  const HN=heat(N), HL=heat(L), tL=totals(L), tN=totals(N);
  const sets=[...new Set(evs.map(e=>e.s))].sort((a,b)=>a-b);
  const row=s=>{ const l=totals(L.filter(e=>e.s===s)), n=totals(N.filter(e=>e.s===s)); const bar=(x,c)=>`<div class="cbar"><span style="width:${Math.round((x.t?x.K/x.t:0)*90)}px;--bc:${c}"></span><em class="tnum">${x.t?pct(x.K/x.t)+', '+x.K+'/'+x.t:'nessuno'}</em></div>`; return `<tr><td>Set ${s}</td><td>${bar(l,'#C8303B')}</td><td>${bar(n,'#13774A')}</td></tr>`; };
  return `<div class="vs"><div class="card heatwrap sx"><p class="heatcap" style="--hc:#13774A"><i></i>Il loro campo: dove facciamo punto<small>${att(tN.t)}</small></p>${heatCourt(HN,HL)}<p class="heatcap" style="--hc:#C8303B"><i></i>Il nostro campo: dove fanno punto loro<small>${att(tL.t)}</small></p></div>`
    +`<div>${sets.length?`<div class="sec-h"><h2>Set per set</h2><small>Attacchi chiusi a punto</small></div><div class="tablewrap"><table><thead><tr><th>Set</th><th>Loro</th><th>Noi</th></tr></thead><tbody>${sets.map(row).join('')}</tbody></table></div>`:''}`
    +`<p class="on-tiny" style="margin:10px 2px 0">La zona d’arrivo si ricava dal colpo: diagonale da 4 cade in zona 5, parallela in zona 1, pallonetto corto dietro il muro.</p></div></div>`;
}
$('#v-tips').addEventListener('click',e=>{
  const c=e.target.closest('[data-scope]'); if(c){ tipsUI.scope=c.dataset.scope; filter=c.dataset.scope==='tb'?'match':c.dataset.scope; renderTips(); return; }
  const t=e.target.closest('[data-tt]'); if(t){ tipsUI.tab=t.dataset.tt; renderTips(); return; }
  if(e.target.closest('[data-show]')){ openShow(buildBrief(curScope())); return; }
  if(e.target.closest('[data-send]')){ const B=buildBrief(curScope()); textSheet('Da mandare alle giocatrici',briefText(B),'Pronto per WhatsApp: i titoli in grassetto appaiono già formattati.'); return; }
  if(e.target.closest('[data-report]')){ const sc=curScope(); textSheet('Report completo',reportText(sc==='tb'?'match':sc),'Pronto per WhatsApp.'); return; }
  const g=e.target.closest('[data-go]'); if(g){ if(g.dataset.go==='scoutN') db.side='N',save(); show('scout'); }
});

/* presentazione a tutto schermo: una priorità per pagina */
let showIdx=0;
function openShow(B){
  const items=B.now.concat(B.more);
  if(!items.length&&!B.good.length&&!B.keys.length){ toast('Ancora niente da mostrare: servono più attacchi.'); return; }
  const m=cur();
  const pages=[];
  if(B.keys.length){ const k=B.keys[0]; pages.push(`<section class="page keyp" aria-label="La chiave"><p class="key-l">La chiave</p><h2>${esc(k.title)}</h2><p class="tx">${esc(k.text)}</p>${B.keys[1]?`<p class="tx dim"><b>${esc(B.keys[1].title)}.</b> ${esc(B.keys[1].text)}</p>`:''}</section>`); }
  items.forEach((x,i)=>pages.push(`<section class="page ${x.side}" aria-label="Indicazione ${i+1} di ${items.length}"><div class="rk"><b>${i+1}</b>${sideChip(x)}</div><h2>${esc(x.head)}</h2><p class="st">${esc(x.why)}</p><div class="bdw">${board(Object.assign({label:x.head},x.board))}</div><p class="tx">${esc(x.text)}</p></section>`));
  if(B.good.length) pages.push(`<section class="page" aria-label="Cosa va bene"><div class="rk"><b class="okb">${svgI('M3 8.5l3.2 3L13 4.5')}</b></div><h2>Cosa va bene</h2><ul class="goods">${B.good.map(g=>`<li><span class="ck">${IC.check}</span><div><b>${esc(g.head)}</b><p>${esc(g.text)}</p></div></li>`).join('')}</ul></section>`);
  const sh=$('#present');
  sh.innerHTML=`<div class="pr-top"><b>${esc(briefTitle(B.scope))}${m.opp.trim()?' vs '+esc(m.opp.trim()):''}</b><button class="iconbtn" data-sclose aria-label="Chiudi">${IC.x}</button></div><div class="pages" id="pages">${pages.join('')}</div><div class="pr-foot"><button class="iconbtn" data-sstep="-1" aria-label="Indietro">${svgI('M10 3.5L5.5 8l4.5 4.5')}</button><div class="pdots" id="pdots">${pages.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div><button class="iconbtn" data-sstep="1" aria-label="Avanti">${svgI('M6 3.5L10.5 8 6 12.5')}</button></div>`;
  sh.hidden=false; void sh.offsetWidth; sh.classList.add('open'); $('#app').inert=true; navSync();
  showIdx=0;
  const pg=$('#pages');
  let raf=0;
  pg.addEventListener('scroll',()=>{ cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{ const i=Math.round(pg.scrollLeft/pg.clientWidth); if(i!==showIdx){ showIdx=i; $$('#pdots i').forEach((d,j)=>d.classList.toggle('on',j===i)); buzz(5); } }); },{passive:true});
  try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(l=>{ sh._wl=l; }).catch(()=>{}); }catch(e){}
  setTimeout(()=>{ const b=$('[data-sclose]',sh); if(b) b.focus({preventScroll:true}); },50);
}
function showStep(d){ const pg=$('#pages'); if(!pg) return; const n=pg.children.length; const i=Math.max(0,Math.min(n-1,showIdx+d)); pg.scrollTo({left:i*pg.clientWidth,behavior:reduced?'auto':'smooth'}); }
function closeShow(){
  const sh=$('#present'); if(sh.hidden) return;
  sh.classList.remove('open'); if(!sheetOpen()) $('#app').inert=false; navSync();
  try{ if(sh._wl){ sh._wl.release(); sh._wl=null; } }catch(e){}
  setTimeout(()=>{ sh.hidden=true; sh.innerHTML=''; },reduced?0:260);
}
window.addEventListener('resize',()=>{ const pg=$('#pages'); if(pg&&presentOpen()) pg.scrollLeft=showIdx*pg.clientWidth; });
$('#present').addEventListener('click',e=>{ if(e.target.closest('[data-sclose]')) closeShow(); const s=e.target.closest('[data-sstep]'); if(s) showStep(+s.dataset.sstep); });

/* =========================================================
   SQUADRA
   ========================================================= */
function roleOpts(r){ return `<option value=""${!r?' selected':''}>Ruolo</option>`+Object.keys(ROLES).map(k=>`<option value="${k}"${r===k?' selected':''}>${ROLES[k]}</option>`).join(''); }
function renderTeam(focusNew){
  const box=$('#v-team'), list=livePl(), S=seasonStats();
  const nm=Object.values(db.matches).length;
  box.innerHTML=`<div class="stack">
<section class="card"><h2>La tua squadra</h2><p class="sub">Il nome appare nello scout, nelle indicazioni e nei report.</p><label class="field"><span>Nome della squadra</span><input class="input" id="tmName" type="text" maxlength="40" placeholder="Es. Pallavolo Rossi Under 16" value="${esc(db.team.name)}" autocomplete="off" autocapitalize="words" enterkeyhint="done"></label></section>
<section class="card"><h2>Giocatrici${list.length?` (${list.length})`:''}</h2><p class="sub">Chi ha il ruolo Libero non compare tra chi attacca. Accanto, la stagione intera${nm>1?` (${nm} partite)`:''}.</p>
${list.length?`<ul class="tlist">${list.map(p=>{ const s=S[p.n]; return `<li class="trow${focusNew===p.n?' new':''}" data-n="${esc(p.n)}"><span class="puck N" aria-hidden="true">${esc(p.n)}</span><input class="input tname" value="${esc(p.nm)}" placeholder="Nome" maxlength="24" aria-label="Nome della numero ${esc(p.n)}" autocomplete="off" autocapitalize="words" enterkeyhint="done"><span class="tmeta"><select class="input trole" aria-label="Ruolo della numero ${esc(p.n)}">${roleOpts(p.r)}</select><span class="tstat">${s?`${att(s.t)}, ${pct(s.K/s.t)} a punto`:'nessun attacco'}</span></span><button class="iconbtn" data-tdel="${esc(p.n)}" aria-label="Togli la numero ${esc(p.n)}">${IC.trash}</button></li>`; }).join('')}</ul>`:'<p class="sub" style="padding:6px 0 2px">Ancora nessuna giocatrice: aggiungile qui sotto, bastano numero e nome.</p>'}
<form class="addf" id="tmAdd" autocomplete="off"><input class="input" id="tmNum" inputmode="numeric" pattern="[0-9]*" maxlength="3" placeholder="N°" aria-label="Numero di maglia" style="font:800 22px var(--disp)"><input class="input" id="tmNm" maxlength="24" placeholder="Nome" aria-label="Nome" autocapitalize="words"><select class="input role" id="tmRole" aria-label="Ruolo">${roleOpts('')}</select><button class="btn primary" type="submit">${IC.plus}<span>Aggiungi</span></button></form>
</section></div>`;
  $('#tmName').addEventListener('input',e=>{ db.team.name=e.target.value.replace(/\s+/g,' ').slice(0,40); db.team.at=Date.now(); save(); renderHeader(); });
  $('#tmName').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
  $$('.trow',box).forEach(row=>{
    const n=row.dataset.n;
    $('.tname',row).addEventListener('change',e=>{ setPlayer(n,{nm:e.target.value.replace(/\s+/g,' ').trim().slice(0,24)}); });
    $('.tname',row).addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
    $('.trole',row).addEventListener('change',e=>{ setPlayer(n,{r:e.target.value}); });
  });
  $('#tmAdd').addEventListener('submit',e=>{
    e.preventDefault();
    const n=normNum($('#tmNum').value);
    if(!n||n==='?'){ toast('Scrivi un numero di maglia da 0 a 100.'); $('#tmNum').focus(); return; }
    if(plOf(n)){ toast(`La numero ${n} c’è già.`); $('#tmNum').focus(); return; }
    setPlayer(n,{nm:$('#tmNm').value.replace(/\s+/g,' ').trim().slice(0,24),r:$('#tmRole').value,x:0});
    buzz(); renderTeam(n); renderHeader();
    const f=$('#tmNum'); if(f) f.focus();
  });
}
$('#v-team').addEventListener('click',e=>{
  const b=e.target.closest('[data-tdel]'); if(!b) return;
  const n=b.dataset.tdel, before=Object.assign({},plOf(n));
  setPlayer(n,{x:1}); renderTeam();
  toast(`Tolta la numero ${n}.`,'Rimetti',()=>{ setPlayer(n,{nm:before.nm,r:before.r,x:0}); renderTeam(n); });
});

/* =========================================================
   IMPOSTAZIONI
   ========================================================= */
function renderCloudBits(){
  const el=$('#cloudLine'); if(el){ el.textContent=cloudLine(); el.closest('.row').classList.toggle('ok',cloudOK()); }
  if(view==='scout'&&!(sel.n||sel.z||sel.o)&&!(flash&&Date.now()<flash.until)) renderDock();
}
const chev='<svg class="i chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5"/></svg>';
const sw=(k,t,s)=>`<div class="row"><div class="rl"><b id="pl-${k}">${t}</b><small>${s}</small></div><button class="switch" role="switch" aria-checked="${!!prefs[k]}" aria-labelledby="pl-${k}" data-pref="${k}"><i></i></button></div>`;
const tile=(id,ic,t,s,cls)=>`<button class="tile${cls?' '+cls:''}" id="${id}"><span class="ti">${ic}</span><b>${t}</b><small>${s}</small></button>`;
function renderSettings(){
  const m=cur(), all=Object.values(db.matches), total=all.reduce((a,x)=>a+x.ev.length,0);
  const showInstall=GH&&!isStandalone();
  const canCam=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
  const fine=mq('(pointer: fine)');
  $('#v-settings').innerHTML=`${(storageOK||cloud.state==='on')?'':'<div class="warnbox"><b>Attenzione:</b> questo browser non riesce a salvare i dati. Prima di chiudere mostra il QR o copia il backup.</div>'}
<div class="settings">
<section class="sgroup"><h2 class="sg-h">Partita aperta</h2><div class="list">
  <label class="row"><div class="rl"><b>Avversaria</b><small>Appare nello scout e nei messaggi</small></div><input class="input inl" id="stOpp" type="text" maxlength="40" value="${esc(m.opp)}" placeholder="Nome squadra" autocomplete="off" autocapitalize="words" enterkeyhint="done"></label>
  <label class="row"><div class="rl"><b>Data</b><small>Serve a ritrovarla tra le partite</small></div><input class="input inl" id="stDate" type="date" value="${esc(m.date)}"></label>
  <button class="row link" id="stRoster"><div class="rl"><b>Rosa avversaria</b><small>I numeri di chi attacca di là</small></div><span class="rv">${m.roster.length?m.roster.length+' '+plural(m.roster.length,'numero','numeri'):'da fare'}</span>${chev}</button>
  <button class="row link" id="stMatches"><div class="rl"><b>Le tue partite</b><small>Apri, crea o elimina</small></div><span class="rv">${all.length}</span>${chev}</button>
</div></section>

<section class="sgroup"><h2 class="sg-h">Passa i dati</h2><p class="sg-s">Tra due telefoni, in una chat o in Excel. Legge anche i codici della versione precedente.</p><div class="tiles">
  ${tile('qrShow',IC.qr,'Mostra QR','L’altro telefono lo inquadra','primary')}
  ${canCam?tile('qrScan',IC.cam,'Scansiona QR','Unisce i dati senza doppioni'):''}
  ${tile('shCode',IC.code,'Salva come testo','Un codice da mandarti su WhatsApp')}
  ${tile('stRecover',IC.merge,'Recupera da un codice','Incolla un messaggio salvato')}
  ${tile('stBackup',IC.doc,'Backup completo',`${all.length} ${plural(all.length,'partita','partite')}, ${att(total)} e la squadra`)}
  ${tile('csvBtn',IC.table,'Tabella per Excel','Un attacco per riga')}
</div></section>

<section class="sgroup"><h2 class="sg-h">In partita</h2><div class="list">
  ${sw('haptics','Vibrazione','Una piccola vibrazione a ogni tocco e a ogni attacco salvato')}
  ${sw('wipe','Cambio colore animato','Lo schermo si colora partendo dal tasto quando cambi chi attacca')}
  ${sw('sideHint','Suggerisci il cambio lato','Dopo una difesa il tasto dell’altra squadra lampeggia')}
  ${sw('names','Nomi sulle maglie','Sotto i numeri della tua squadra')}
  ${sw('big','Tasti più alti','Per tablet o per chi segna con il telefono in mano mentre guarda il campo')}
</div></section>

<section class="sgroup"><h2 class="sg-h">App</h2><div class="list">
  <div class="row save"><div class="rl"><b>Salvataggio</b><small id="cloudLine"></small></div></div>
  ${showInstall?`<button class="row link" id="shInstall"><div class="rl"><b>Installa sulla schermata Home</b><small>Si apre come un’app, funziona senza rete e il telefono non le cancella i dati</small></div>${chev}</button>`:''}
  ${fine?`<button class="row link" id="stKeys"><div class="rl"><b>Scorciatoie da tastiera</b><small>Per segnare da PC senza mouse</small></div>${chev}</button>`:''}
  ${GH?`<a class="row link" href="legacy/"><div class="rl"><b>Versione precedente</b><small>Resta qui, con gli stessi dati di questo dispositivo</small></div>${chev}</a>`:''}
  <div class="row"><div class="rl"><b>Scout</b><small>Funziona senza rete. Ogni dispositivo tiene i propri dati: per darla a qualcuno basta mandare il link.</small></div></div>
</div></section>
</div>`;
  renderCloudBits();
  $('#stOpp').addEventListener('input',e=>{ m.opp=e.target.value.slice(0,40); save(); renderHeader(); });
  $('#stOpp').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
  $('#stDate').addEventListener('change',e=>{ if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)){ m.date=e.target.value; save(); renderHeader(); } });
  $('#stRoster').onclick=()=>openRoster(false);
  $('#stMatches').onclick=openMatches;
  const ib=$('#shInstall'); if(ib) ib.onclick=doInstall;
  const kb=$('#stKeys'); if(kb) kb.onclick=openShortcuts;
  $('#qrShow').onclick=()=>{ if(!m.ev.length&&!m.roster.length){ toast('Segna prima qualche attacco.'); return; } showQR(m.opp.trim()?'Partita contro '+m.opp.trim():'Partita del '+fmtDate(m.date),encode([m],false),att(m.ev.length)); };
  const qs=$('#qrScan'); if(qs) qs.onclick=openScanner;
  $('#shCode').onclick=()=>{ if(!m.ev.length){ toast('Segna prima qualche attacco.'); return; } textSheet('Salva la partita',saveMessage(m),'Per ritrovarla incolla questo testo in Impostazioni, Recupera da un codice, su qualsiasi telefono con Scout.',true); };
  $('#stRecover').onclick=openRecover;
  $('#stBackup').onclick=openBackup;
  $('#csvBtn').onclick=exportCsv;
}
$('#v-settings').addEventListener('click',e=>{
  const s=e.target.closest('[data-pref]'); if(!s) return;
  const k=s.dataset.pref; prefs[k]=!prefs[k]; s.setAttribute('aria-checked',String(prefs[k])); savePrefs(); if(prefs.haptics) buzz(8);
});
function openRecover(){
  const canRead=!!(navigator.clipboard&&navigator.clipboard.readText)&&!readBlocked;
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Recupera da un codice</h2>${closeBtn()}</div><p class="sub" style="margin-bottom:12px">Incolla il messaggio con il codice, anche della versione precedente di Scout. Se la partita c’è già aggiungo solo gli attacchi nuovi.</p><textarea class="paste" id="importBox" placeholder="Incolla qui il messaggio con il codice" autocomplete="off" autocapitalize="off" spellcheck="false" data-autofocus></textarea><div class="btnrow" style="margin-top:4px">${canRead?'<button class="btn ghost" id="pasteBtn">Incolla</button>':''}<button class="btn primary" id="importBtn">Recupera</button></div>`);
  const go=t=>{ if(doImport(t)&&!$('#scrim').hidden&&$('#importBox')) closeSheet(); };
  $('#importBtn').onclick=()=>go($('#importBox').value);
  const pb=$('#pasteBtn');
  if(pb) pb.onclick=()=>{
    navigator.clipboard.readText().then(t=>{ $('#importBox').value=t||''; if(t&&t.trim()) go(t); else toast('Negli appunti non c’è testo.'); })
      .catch(()=>{ readBlocked=true; pb.remove(); $('#importBox').focus(); toast('Tieni premuto nel riquadro e scegli Incolla.'); });
  };
}
function openBackup(){
  const list=Object.values(db.matches).filter(x=>x.ev.length||x.roster.length||x.opp.trim());
  if(!list.length&&!teamHasData(db.team)){ toast('Non c’è ancora niente da salvare.'); return; }
  const n=list.reduce((a,x)=>a+x.ev.length,0);
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Backup completo</h2>${closeBtn()}</div><p class="sub">${list.length} ${plural(list.length,'partita','partite')}, ${att(n)} e la tua squadra in un solo codice. Fallo prima di cambiare telefono.</p><div class="btnrow"><button class="btn primary" id="bkQR">${IC.qr}<span>Come QR</span></button><button class="btn ghost" id="bkTxt">${IC.copy}<span>Come testo</span></button></div>`);
  $('#bkQR').onclick=()=>showQR('Backup completo',encode(list,true),`${list.length} ${plural(list.length,'partita','partite')}, ${att(n)}`);
  $('#bkTxt').onclick=()=>textSheet('Backup completo',backupMessage(list),'Salvalo in una chat o nelle note. Per ripristinarlo incollalo in Recupera da un codice.',true);
}

/* =========================================================
   SET: chiaro e immediato
   ========================================================= */
const setName=s=>s===5?'Tie-break':'Set '+s;
const setNameIn=s=>s===5?'nel tie-break':'nel set '+s;
const maxPlayed=m=>m.ev.reduce((a,e)=>Math.max(a,e.s),0);
function setStats(m){ const c={1:0,2:0,3:0,4:0,5:0}; m.ev.forEach(e=>{ c[e.s]=(c[e.s]||0)+1; }); return c; }
function renderSetControl(){
  const m=cur(), c=setStats(m);
  $('#setNum').textContent=m.set===5?'TB':String(m.set);
  $('#setBtn').setAttribute('aria-label',`${setName(m.set)} in corso. Cambia set`);
  $('#setBar').innerHTML=[1,2,3,4,5].map(s=>`<i class="${s===m.set?'cur':c[s]?'done':''}"></i>`).join('');
  $$('#sets button').forEach(b=>{ const s=+b.dataset.set; b.setAttribute('aria-pressed',String(s===m.set)); const k=b.querySelector('small'); if(k) k.textContent=c[s]?c[s]+' att.':s===m.set?'ora':''; b.setAttribute('aria-label',setName(s)+(c[s]?', '+att(c[s]):'')+(s===m.set?', in corso':'')); });
  const behind=m.set<maxPlayed(m);
  $('#setBtn').classList.toggle('behind',behind); $('#sets').classList.toggle('behind',behind);
  moveSetPill();
}
function moveSetPill(){ const b=$('#sets button[aria-pressed="true"]'), p=$('#sets .pill'); if(b&&p&&b.offsetWidth){ p.style.width=b.offsetWidth+'px'; $('#sets').style.setProperty('--sx',(b.offsetLeft-4)+'px'); } }
function changeSet(s,announce){
  const m=cur(), prev=m.set; if(s===prev) return;
  m.set=s; save(); buzz(10);
  renderHeader();
  const sb=$('#setBtn'); if(sb&&!reduced){ sb.classList.remove('pop'); void sb.offsetWidth; sb.classList.add('pop'); }
  if(view==='scout'){ if(announce) setFlash('set',{s},m.id,true,2600); else renderDock(); }
  else{
    if(view==='tips'){ tipsUI.scope=null; renderTips(); }
    if(announce) toast(`Ora segni ${setNameIn(s)}.`);
  }
}
function openSetSheet(){
  const m=cur(), c=setStats(m), mp=maxPlayed(m);
  const back=m.set<mp, nx=back?mp:(m.set<5?m.set+1:null);
  const primary=nx?`<button class="btn ${back?'primary':'ball'} block" id="nextSet">${svgI(back?'M8 13V3M3.5 7.5L8 3l4.5 4.5':'M6 3.5L10.5 8 6 12.5')}<span>${back?'Torna '+setNameIn(nx).replace('nel ','al ').replace('nel tie-break','al tie-break'):'Inizia '+(nx===5?'il tie-break':'il set '+nx)}</span></button>`:'';
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Che set si gioca?</h2>${closeBtn()}</div>${back?`<p class="setwarn">Stai segnando ${setNameIn(m.set)}, ma ci sono già attacchi ${setNameIn(mp)}.</p>`:''}${primary}<div class="setgrid">${[1,2,3,4,5].map(s=>`<button class="settile${s===5?' tb':''}" data-set="${s}" aria-pressed="${s===m.set}"><b>${s===5?'TB':s}</b><span>${setName(s)}</span><small>${s===m.set?'ora':c[s]?att(c[s]):'da giocare'}</small></button>`).join('')}</div><p class="tiny" style="margin-top:12px">Ogni attacco va nel set scelto. Puoi tornare a un set già giocato per aggiungere o correggere, poi torna al set in corso.</p>`);
  const nb=$('#nextSet'); if(nb) nb.onclick=()=>{ closeSheet(); changeSet(nx,true); };
  $('.setgrid').addEventListener('click',e=>{ const b=e.target.closest('[data-set]'); if(!b) return; const s=+b.dataset.set; closeSheet(); if(s!==m.set) changeSet(s,true); });
}

/* =========================================================
   FOGLI
   ========================================================= */
function textSheet(title,text,note,isCode){
  const canShare=!!navigator.share&&!shareBlocked;
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">${esc(title)}</h2>${closeBtn()}</div>${note?`<p class="sub" style="margin-bottom:10px">${esc(note)}</p>`:''}<div class="preview${isCode?' code':''}" id="pv" tabindex="0">${esc(text)}</div><div class="btnrow">${canShare?`<button class="btn primary" id="doShare">${IC.share}<span>Condividi</span></button>`:''}<button class="btn ${canShare?'ghost':'primary'}" id="doCopy">${IC.copy}<span>Copia</span></button></div><p class="tiny" id="copyHelp" style="margin-top:8px" hidden>Qui la copia automatica è bloccata: il testo è già selezionato, tienilo premuto e scegli Copia.</p>`);
  $('#doCopy').onclick=()=>{
    copyText(text).then(ok=>{
      const b=$('#doCopy'); if(!b) return;
      if(ok){ b.innerHTML=IC.check+'<span>Copiato</span>'; buzz(); toast('Copiato: ora incollalo dove vuoi.'); }
      else{ selectAll($('#pv')); $('#copyHelp').hidden=false; }
    });
  };
  const sb=$('#doShare');
  if(sb) sb.onclick=()=>{
    let p; try{ p=navigator.share({text}); }catch(err){ p=Promise.reject(err); }
    Promise.resolve(p).catch(err=>{ if(err&&err.name==='AbortError') return; shareBlocked=true; sb.remove(); toast('Qui la condivisione non è disponibile: usa Copia.'); });
  };
  $('#pv').addEventListener('click',()=>selectAll($('#pv')));
}
let sheetOnClose=null, sheetTimer=0, lastFocus=null;
function openSheet(html,onClose){
  clearTimeout(sheetTimer);
  const prev=sheetOnClose; sheetOnClose=null; if(prev) prev();
  const scrim=$('#scrim'), sh=$('#sheet');
  sh.innerHTML='<div class="grab" aria-hidden="true"></div>'+html;
  sh.style.transform='';
  sheetOnClose=onClose||null;
  if(scrim.hidden){ lastFocus=document.activeElement; scrim.hidden=false; void scrim.offsetWidth; }
  scrim.classList.add('open'); $('#app').inert=true;
  sh.scrollTop=0; navSync();
  const af=sh.querySelector('[data-autofocus]');
  setTimeout(()=>{ try{ (af||sh).focus({preventScroll:true}); }catch(e){} },reduced?0:80);
}
function closeSheet(){
  const scrim=$('#scrim');
  if(scrim.hidden||!scrim.classList.contains('open')) return;
  scrim.classList.remove('open'); if(!presentOpen()) $('#app').inert=false;
  $('#sheet').style.transform='';
  const cb=sheetOnClose; sheetOnClose=null;
  clearTimeout(sheetTimer);
  sheetTimer=setTimeout(()=>{ scrim.hidden=true; $('#sheet').innerHTML=''; },reduced?0:300);
  if(cb) cb();
  if(lastFocus&&lastFocus.tagName==='BUTTON'&&document.contains(lastFocus)){ try{ lastFocus.focus({preventScroll:true}); }catch(e){} }
  navSync();
}
$('#scrim').addEventListener('click',e=>{ if(e.target.id==='scrim') closeSheet(); });
$('#sheet').addEventListener('click',e=>{ if(e.target.closest('[data-close]')) closeSheet(); });
$('#sheet').addEventListener('keydown',e=>{
  if(e.key!=='Tab') return;
  const f=$$('button,input,textarea,select,a[href],[tabindex="0"]',$('#sheet')).filter(x=>!x.disabled&&x.offsetParent!==null);
  if(!f.length) return;
  const a=f[0], z=f[f.length-1];
  if(e.shiftKey&&(document.activeElement===a||document.activeElement===$('#sheet'))){ e.preventDefault(); z.focus(); }
  else if(!e.shiftKey&&document.activeElement===z){ e.preventDefault(); a.focus(); }
});
// trascina giù dalla testa del foglio per chiuderlo
(function(){
  const sh=$('#sheet'); let y0=null, dy=0, t0=0;
  sh.addEventListener('touchstart',e=>{ if(mq('(min-width:720px)')) return; const h=e.target.closest('.grab,.sh-head'); if(!h||e.target.closest('button,input')||sh.scrollTop>0) return; y0=e.touches[0].clientY; dy=0; t0=Date.now(); sh.classList.add('drag'); },{passive:true});
  sh.addEventListener('touchmove',e=>{ if(y0==null) return; dy=Math.max(0,e.touches[0].clientY-y0); sh.style.transform=`translateY(${dy}px)`; },{passive:true});
  const end=()=>{ if(y0==null) return; sh.classList.remove('drag'); const v=dy/Math.max(1,Date.now()-t0); if(dy>120||v>.6) closeSheet(); else sh.style.transform=''; y0=null; };
  sh.addEventListener('touchend',end); sh.addEventListener('touchcancel',end);
})();
function confirmSheet(o){
  return new Promise(res=>{
    let done=false; const fin=v=>{ if(!done){ done=true; res(v); } };
    openSheet(`<div class="sh-head"><h2 id="sheetTitle">${esc(o.title)}</h2></div><p class="sub">${esc(o.text)}</p><div class="btnrow"><button class="btn ghost" id="cfNo">Annulla</button><button class="btn ${o.danger?'danger':'primary'}" id="cfYes">${esc(o.ok)}</button></div>`,()=>fin(false));
    $('#cfNo').onclick=()=>closeSheet();
    $('#cfYes').onclick=()=>{ fin(true); closeSheet(); };
  });
}
function openShortcuts(){
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Scorciatoie da tastiera</h2>${closeBtn()}</div><ul class="klist">
<li><b><kbd>0</kbd>–<kbd>9</kbd></b>Numero di maglia; per due cifre scrivile di seguito</li>
<li><b><kbd>?</kbd></b>Numero non visto</li>
<li><b><kbd>P</kbd> <kbd>D</kbd> <kbd>M</kbd> <kbd>E</kbd></b>Punto, difesa, murata, errore</li>
<li><b><kbd>L</kbd> <kbd>N</kbd></b>Attaccano loro, attacchiamo noi</li>
<li><b><kbd>Esc</kbd></b>Azzera la scelta in corso</li>
<li><b><kbd>Ctrl</kbd>+<kbd>Z</kbd></b>Annulla l’ultimo attacco</li>
<li><b><kbd>+</kbd></b>Inizia il set successivo</li>
<li><b><kbd>I</kbd> <kbd>S</kbd></b>Indicazioni, torna allo scout</li></ul>`);
}

/* rosa avversaria e squadra veloce */
function numGridSheet(o){
  openSheet(o.head+`<div id="rSuggest"></div><div class="numhead"><p class="sub">${esc(o.prompt)}</p><span class="numcount" id="numCount"></span></div><div class="numgrid" id="numGrid"></div>${o.foot||''}<button class="btn primary block" data-close style="margin-top:16px">Fatto</button>`,o.onClose);
  const drawGrid=()=>{
    const sel_=o.get(), base=[]; for(let i=1;i<=99;i++) base.push(String(i));
    const nums=base.concat(sel_.filter(n=>!base.includes(n))).sort(numSort);
    $('#numGrid').innerHTML=nums.map(n=>`<button class="nb${o.side==='N'?' N':''}" data-n="${n}" aria-pressed="${sel_.includes(n)}">${n}</button>`).join('');
    countR();
  };
  const countR=()=>{ const c=$('#numCount'), k=o.get().length; if(c) c.textContent=k?k+' '+plural(k,'scelta','scelte'):''; };
  drawGrid();
  $('#numGrid').addEventListener('click',e=>{
    const b=e.target.closest('.nb'); if(!b) return;
    const n=b.dataset.n, on=!o.get().includes(n);
    o.toggle(n,on); b.setAttribute('aria-pressed',String(on)); buzz(5); countR(); if(o.after) o.after();
  });
  return {drawGrid};
}
function openRoster(isNew){
  const m=cur();
  const focusName=isNew&&!m.opp.trim();
  const g=numGridSheet({
    head:`<div class="sh-head"><h2 id="sheetTitle">${isNew?'Nuova partita':'Rosa avversaria'}</h2>${closeBtn()}</div><label class="field"><span>Squadra avversaria</span><input class="input" id="oppIn" type="text" value="${esc(m.opp)}" placeholder="Es. Volley Asti" maxlength="40" autocomplete="off" autocapitalize="words" enterkeyhint="done"${focusName?' data-autofocus':''}></label>`,
    prompt:'Tocca i numeri di chi attacca',side:'L',
    get:()=>m.roster,
    toggle:(n,on)=>{ const i=m.roster.indexOf(n); if(on&&i<0){ m.roster.push(n); m.roster.sort(numSort); } else if(!on&&i>=0) m.roster.splice(i,1); save(); },
    after:()=>drawSuggest(),
    onClose:()=>{ renderHeader(); renderView(); }
  });
  const drawSuggest=()=>{
    const box=$('#rSuggest'); if(!box) return;
    const src=m.roster.length?null:sameOpp(m).filter(x=>x.roster.length).sort((a,b)=>b.created-a.created)[0];
    box.innerHTML=src?`<button class="suggest" id="useSrc">${IC.plus}<span>Usa la rosa della partita del ${fmtDate(src.date)}: ${src.roster.map(n=>'#'+n).join(' ')}</span></button>`:'';
    if(src) $('#useSrc').onclick=()=>{ m.roster=src.roster.slice(); save(); g.drawGrid(); drawSuggest(); };
  };
  drawSuggest();
  $('#oppIn').addEventListener('input',e=>{ m.opp=e.target.value.slice(0,40); save(); renderHeader(); drawSuggest(); });
  $('#oppIn').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
}
function openTeamQuick(){
  numGridSheet({
    head:`<div class="sh-head"><h2 id="sheetTitle">La tua squadra</h2>${closeBtn()}</div>`,
    prompt:'Tocca i numeri delle tue giocatrici',side:'N',
    foot:`<button class="linkbtn" id="goTeam" style="margin-top:10px">Nomi e ruoli in Squadra</button>`,
    get:()=>livePl().map(p=>p.n),
    toggle:(n,on)=>setPlayer(n,{x:on?0:1}),
    onClose:()=>{ renderHeader(); renderView(); }
  });
  $('#goTeam').onclick=()=>{ closeSheet(); show('team'); };
}

/* partite */
function openMatches(){
  const list=Object.values(db.matches).sort((a,b)=>b.created-a.created);
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Le tue partite</h2>${closeBtn()}</div><button class="btn ball block" id="newMatch">${IC.plus}<span>Nuova partita</span></button><ul class="mlist">${list.map(m=>{ const nL=sideEv(m.ev,'L').length, nN=m.ev.length-nL; return `<li><button class="mrow" data-open="${m.id}"${m.id===db.cur?' aria-current="true"':''}><span class="mt">${esc(m.opp.trim()||'Senza nome')}</span><span class="mm">${fmtDate(m.date)}, ${att(nL)} loro${nN?`, ${nN} nostri`:''}${m.id===db.cur?', <span class="open">aperta ora</span>':''}</span></button><button class="iconbtn" data-delm="${m.id}" aria-label="Elimina la partita ${esc(m.opp.trim()||'senza nome')}">${IC.trash}</button></li>`; }).join('')}</ul><button class="linkbtn" id="kbLink" style="margin-top:8px">Scorciatoie da tastiera</button>`);
  $('#kbLink').onclick=openShortcuts;
  $('#newMatch').onclick=()=>{ const m=newMatch(''); db.matches[m.id]=m; db.cur=m.id; resetTipsUI(); resetSel(); flash=null; save(); renderAll(); openRoster(true); };
  $('.mlist').addEventListener('click',e=>{
    const o=e.target.closest('[data-open]'), d=e.target.closest('[data-delm]');
    if(o){ db.cur=o.dataset.open; resetTipsUI(); resetSel(); flash=null; save(); closeSheet(); renderAll(); return; }
    if(!d) return;
    const m=db.matches[d.dataset.delm]; if(!m) return;
    const undo=()=>{ db.matches[m.id]=m; unmarkDeleted(m.id); save(); renderAll(); if(!$('#scrim').hidden) openMatches(); };
    if(!m.ev.length){ deleteMatch(m.id); openMatches(); toast('Partita eliminata.','Rimetti',undo); return; }
    confirmSheet({title:'Eliminare la partita?',text:`${m.opp.trim()?'Contro '+m.opp.trim():'Senza nome'}, ${att(m.ev.length)}. Se ti serve ancora, fai prima il backup da Impostazioni.`,ok:'Elimina',danger:true}).then(ok=>{
      if(!ok){ openMatches(); return; }
      deleteMatch(m.id); openMatches();
      toast('Partita eliminata.','Rimetti',undo);
    });
  });
}
function deleteMatch(id){
  delete db.matches[id]; markDeleted(id);
  if(db.cur===id){
    const rest=Object.values(db.matches).sort((a,b)=>b.created-a.created);
    if(rest.length) db.cur=rest[0].id; else{ const n=newMatch(''); db.matches[n.id]=n; db.cur=n.id; }
    resetTipsUI(); resetSel(); flash=null;
  }
  save(); renderAll();
}

/* cronologia */
function openHistory(){
  const m=cur();
  const draw=()=>{
    const box=$('#histBody'); if(!box) return;
    if(!m.ev.length){ box.innerHTML='<p class="sub">Nessun attacco in questa partita.</p>'; return; }
    const bySet={}; m.ev.forEach(e=>{ (bySet[e.s]=bySet[e.s]||[]).push(e); });
    box.innerHTML=Object.keys(bySet).sort((a,b)=>b-a).map(s=>`<h3 class="hist-set">Set ${s}, ${att(bySet[s].length)}</h3><ul class="hlist">${bySet[s].slice().reverse().map(e=>`<li><span class="sd" style="background:${e.p==='N'?'var(--puck-N)':'var(--puck-L)'}"></span><span class="hn">${e.n==='?'?'?':'#'+esc(e.n)}</span><span class="ht">${esc(cap(shotName(e.z,e.d)))}<small>${e.p==='N'?esc(teamLabel()):esc(oppLabel(m))}: ${esc(oLab(e.p,e.o).toLowerCase())}</small></span><span class="dot" style="background:${OUT[e.p][e.o].c}" aria-hidden="true"></span><button class="iconbtn" data-del="${e.id}" aria-label="Elimina: ${esc(evText(e))}">${IC.trash}</button></li>`).join('')}</ul>`).join('');
  };
  openSheet(`<div class="sh-head"><h2 id="sheetTitle">Cronologia</h2>${closeBtn()}</div><div id="histBody"></div>`,()=>{ renderAll(); });
  draw();
  $('#histBody').addEventListener('click',e=>{
    const b=e.target.closest('[data-del]'); if(!b) return;
    const ev=m.ev.find(x=>x.id===b.dataset.del); if(!ev) return;
    removeEvent(m.id,ev.id); draw();
    toast('Eliminato: '+evText(ev),'Rimetti',()=>{ restoreEvent(m.id,ev); draw(); renderAll(); });
  });
}

/* avvisi */
let toastT=0;
function toast(msg,actLabel,actFn){
  const t=$('#toast'), b=$('#toastAct');
  $('#toastMsg').textContent=msg;
  if(actLabel){ b.hidden=false; b.textContent=actLabel; b.onclick=()=>{ hideToast(); actFn(); }; }
  else{ b.hidden=true; b.onclick=null; }
  t.classList.toggle('top',view==='scout'&&!sheetOpen());
  const ia=view==='tips'&&!sheetOpen()?$('#v-tips .ind-acts:not(.static)'):null;
  t.classList.toggle('lift',!!(ia&&getComputedStyle(ia).position==='sticky'));
  t.classList.add('is-on');
  clearTimeout(toastT); toastT=setTimeout(hideToast,actLabel?5200:3200);
}
function hideToast(){ $('#toast').classList.remove('is-on'); }

/* ---------- avvio ---------- */
applyPrefs();
buildCourt();
save();
renderHeader();
show('scout');
requestAnimationFrame(()=>{ moveInd(); moveSetPill(); });
if(GH){
  try{ if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{}); }catch(e){}
  try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist().catch(()=>{}); }catch(e){}
  window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); installEvt=e; if(view==='settings') renderSettings(); });
  window.addEventListener('appinstalled',()=>{ installEvt=null; if(view==='settings') renderSettings(); toast('App installata: da ora aprila dall’icona.'); });
  let hinted=false; try{ hinted=!!localStorage.getItem('scout-install-hint'); }catch(e){}
  installHint=!isStandalone()&&!hinted&&mq('(pointer: coarse)');
}
initCloud().finally(()=>{ if(!storageOK&&cloud.state!=='on') toast('Qui i dati non vengono salvati: prima di chiudere copia il backup da Impostazioni.'); });

// solo per i test automatici
if(/[?&]scouttest=1/.test(location.search)) window.__scout={get db(){ return db; },encode,decode,parseCode,mergeInto,mergeTeam,cleanTeam,qids,heat,landing,doImport,qrFrames,buildBrief,briefText,reload:()=>{ db=load(); renderAll(); }};
})();
