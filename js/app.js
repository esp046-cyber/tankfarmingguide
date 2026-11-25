(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)}
function copy(txt){(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast('Copied'),()=>{const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('Copied')}catch(e){toast('Copy failed')}a.remove()})}
function download(name,txt,type){const u=URL.createObjectURL(new Blob([txt],{type}));const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);toast('Exported '+name)}
const fmt=(n,d=2)=>isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d}):'-';

/* routing + theme */
const routes=['overview','phases','architecture','calculators','reference'];
function route(){const r=routes.includes(location.hash.slice(1))?location.hash.slice(1):'overview';routes.forEach(x=>{$('#'+x).hidden=x!==r});$$('.nav a').forEach(a=>{const on=a.dataset.r===r;a.setAttribute('aria-selected',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});window.scrollTo(0,0)}
addEventListener('hashchange',route);
const themes=['auto','dark','day'];let th=store.get('theme','auto');
function applyTheme(){document.documentElement.dataset.theme=th;$('#themeBtn').textContent='Theme: '+th;const c=th==='day'?'#ffffff':'#D9531E';}
$('#themeBtn').onclick=()=>{th=themes[(themes.indexOf(th)+1)%3];store.set('theme',th);applyTheme()};

/* phases */
const PH=[
{t:'Phase 1: FEED verification, P&ID freeze and approvals',m:'Fujairah authority compliance',k:['Verify FEED against P&IDs and tank data sheets','Confirm Port of Fujairah / FOIZ / Civil Defence submission requirements','Freeze hazardous area classification and Ex-ia / Ex-d instrument selection','Issue Cause & Effect matrices for overfill, ESD and jetty interlocks','Freeze the I/O list and signal types','Agree document register and review cycle']},
{t:'Phase 2: Hardware engineering and panel manufacturing',m:'S7-410H, Remote I/O, fiber panels',k:['Design S7-410-H redundancy with separately routed sync links','Draw Remote I/O wiring with barriers and isolators for Ex-i loops','Design dual-ring fiber patch panels and SCALANCE layout','Calculate panel heat dissipation for UAE ambient temperatures','Issue panel GA, wiring and power budget drawings','Prepare FAT procedures and test sheets']},
{t:'Phase 3: PCS 7 and SCADA software engineering',m:'APL, faceplates, routing, alarms',k:['Build project from APL library blocks and tank farm faceplates','Engineer automated tank-to-tank and tank-to-jetty routing logic','Integrate API MPMS volume and mass calculations','Rationalize alarms per ISA-18.2 and document priorities','Configure OS redundancy, Historian and reporting','Configure SINEMA NMS and SNMP monitoring']},
{t:'Phase 4: FAT and integrated FAT',m:'Redundancy and network proof',k:['Test CPU and sync link switchover with no process upset','Break fiber ring and confirm recovery within 200 ms','Verify NMS SNMP traps for link down and device loss','Run simulated ATG and MOV loop checks','Test OS server failover and client reconnect','Record punch list and obtain FAT sign-off']},
{t:'Phase 5: Site installation, loop checks and cold commissioning',m:'Field verification',k:['Install and terminate fiber across tank dykes','Run OTDR and loss tests on every fiber and file results','Complete loop folders for each instrument and valve','Prove overfill and ESD trips end to end','Repeat server and client failover tests on site','Verify time sync, backup and access rights']},
{t:'Phase 6: Hot commissioning, SAT and handover',m:'Live product and closeout',k:['Run live hydrocarbon transfer trials','Reconcile custody transfer quantities','Complete SAT and clear the punch list','Issue as-built documentation and software backups','Train operators and maintenance staff','Sign handover and start the warranty period']}];
let done=store.get('done',{});const open=store.get('open',{0:true});
function stats(){let n=0,d=0;PH.forEach((p,i)=>p.k.forEach((_,j)=>{n++;if(done[i+'_'+j])d++}));return{n,d,p:n?Math.round(d/n*100):0}}
function renderPh(){$('#phList').innerHTML=PH.map((p,i)=>{const c=p.k.filter((_,j)=>done[i+'_'+j]).length,o=open[i]!==false&&open[i];return`<div class="ph" data-open="${!!o}"><button aria-expanded="${!!o}" data-i="${i}"><span>${p.t}<span class="meta">${p.m}</span></span><span class="badge ${c===p.k.length?'ok':''}">${c===p.k.length?'&#10003; Done':c+'/'+p.k.length}</span></button><ul>${p.k.map((k,j)=>`<li><label><input type="checkbox" data-k="${i}_${j}" ${done[i+'_'+j]?'checked':''}><span>${k}</span></label></li>`).join('')}</ul></div>`}).join('');upd()}
function upd(){const s=stats();[['#phBar','#phTxt'],['#ovBar','#ovTxt']].forEach(([b,t])=>{$(b+' i').style.width=s.p+'%';$(b).setAttribute('aria-valuenow',s.p);$(t).textContent=s.p+'% complete ('+s.d+' of '+s.n+' tasks)'})}
$('#phList').addEventListener('click',e=>{const b=e.target.closest('.ph>button');if(b){const i=b.dataset.i;open[i]=!open[i];store.set('open',open);const p=b.parentElement;p.dataset.open=!!open[i];b.setAttribute('aria-expanded',!!open[i])}});
$('#phList').addEventListener('change',e=>{if(e.target.dataset.k){done[e.target.dataset.k]=e.target.checked;if(!e.target.checked)delete done[e.target.dataset.k];store.set('done',done);upd();const[i]=e.target.dataset.k.split('_');const p=e.target.closest('.ph'),c=PH[i].k.filter((_,j)=>done[i+'_'+j]).length,bd=$('.badge',p);bd.className='badge'+(c===PH[i].k.length?' ok':'');bd.innerHTML=c===PH[i].k.length?'&#10003; Done':c+'/'+PH[i].k.length;toast('Saved')}});
const rows=()=>PH.flatMap((p,i)=>p.k.map((k,j)=>({phase:p.t,task:k,done:!!done[i+'_'+j]})));
$('#expJson').onclick=()=>download('fujairah-phases.json',JSON.stringify({exported:new Date().toISOString(),progress:stats().p,tasks:rows()},null,2),'application/json');
$('#expCsv').onclick=()=>download('fujairah-phases.csv','Phase,Task,Done\n'+rows().map(r=>[r.phase,r.task,r.done?'Yes':'No'].map(v=>'"'+v.replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv');
$('#resetPh').onclick=()=>{if(confirm('Clear all checked tasks?')){done={};store.set('done',done);renderPh();toast('Progress reset')}};

/* architecture */
const N=[
{id:'osa',n:'OS Server A',x:20,y:30,s:'Redundant OS server',sp:'PCS 7 OS single station server, mirrored project with Server B. Archives and alarms via redundancy link.',f:'If A fails, B becomes master and clients reconnect automatically. Archive gaps are filled from the partner on recovery.',p:'Terminal bus (PN/IE), redundancy link'},
{id:'osb',n:'OS Server B',x:160,y:30,s:'Redundant OS server',sp:'Partner of Server A. Keep identical project version, time sync and licences.',f:'Takes over when A fails. Keep patch level equal to A.',p:'Terminal bus (PN/IE), redundancy link'},
{id:'es',n:'Engineering Station',x:300,y:30,s:'PCS 7 ES',sp:'Holds the master project: CFC, SFC, hardware config, OS and Historian. Use version control.',f:'Not needed for runtime. Plant keeps running if ES is off.',p:'Plant bus / terminal bus'},
{id:'cli',n:'OS Clients',x:440,y:30,s:'Operator stations',sp:'Multi-client operator stations connected to the active OS server. Control room and jetty office.',f:'Switch to the standby server automatically on loss of the active one.',p:'Terminal bus'},
{id:'nms',n:'SINEMA NMS',x:580,y:30,s:'Network monitoring',sp:'SINEMA Server polls SCALANCE switches via SNMP, receives traps and shows topology.',f:'Monitoring only. Network keeps running without it.',p:'SNMP v3 recommended, traps UDP 162'},
{id:'pa',n:'S7-410H CPU A',x:60,y:318,s:'Redundant AS',sp:'SIMATIC S7-410-H, fault-tolerant. Two CPUs in sync over fiber sync modules, same program and data.',f:'If A fails, B continues bumplessly. Replace and resync A while plant runs.',p:'PROFINET, PROFIBUS DP to Remote I/O'},
{id:'pb',n:'S7-410H CPU B',x:230,y:318,s:'Redundant AS',sp:'Second CPU of the redundant pair. Route sync links separately from each other.',f:'Becomes master when A stops. Runs solo until A is back.',p:'PROFINET, PROFIBUS DP'},
{id:'r1',n:'Remote I/O 1',x:400,y:318,s:'ET 200SP HA',sp:'Remote I/O with redundant interface modules for tank AI/DI/DO. Ex-i barriers for hazardous loops.',f:'Redundant IM keeps I/O live if one module or link fails.',p:'PROFINET (MRP client)'},
{id:'r2',n:'Remote I/O 2',x:570,y:318,s:'ET 200M / jetty',sp:'Marshalling and MOV interface panel at jetty or manifold. ATG and MOV through gateways.',f:'Valves go to configured fail-safe position on loss of comms.',p:'PROFINET, Modbus RTU/TCP gateways'}];
const st={brk:false,srv:false,cpu:false};let sel=null;
function drawArch(){const bad={osa:st.srv,pa:st.cpu},lab={osa:st.srv?'FAILED':'MASTER',osb:st.srv?'ACTIVE (took over)':'STANDBY',pa:st.cpu?'FAILED':'MASTER',pb:st.cpu?'MASTER (solo)':'STANDBY'};
let h=`<rect class="ring${st.brk?' cut':''}" x="60" y="170" width="640" height="170" rx="18"/><text class="lbl" x="380" y="196" text-anchor="middle">Dual fiber ring A (MRP, mirrored by ring B)</text>`;
if(st.brk)h+=`<text class="x" x="690" y="262">&#10005;</text>`;
[['osa',80],['osb',220],['es',360],['cli',500],['nms',640]].forEach(([i,cx])=>h+=`<line class="lk" x1="${cx}" y1="74" x2="${cx}" y2="170"/>`);
h+=N.map(n=>{const b=bad[n.id],t=lab[n.id]||'OK';return`<g class="n${b?' bad':''}${sel===n.id?' sel':''}" tabindex="0" role="button" data-id="${n.id}" aria-label="${n.n}, ${b?'failed':t}"><rect x="${n.x}" y="${n.y}" width="130" height="44" rx="8"/><text x="${n.x+65}" y="${n.y+19}" text-anchor="middle">${n.n}</text><text class="st" x="${n.x+65}" y="${n.y+35}" text-anchor="middle">${b?'\u26A0 ':'\u2714 '}${t}</text></g>`}).join('');
$('#arch').innerHTML=h;
const m=$('#simMsg');const msgs=[];if(st.brk)msgs.push('Ring break: MRP reconfigures in 200 ms or less, all nodes stay reachable.');if(st.srv)msgs.push('Server A down: Server B is master, clients reconnect.');if(st.cpu)msgs.push('CPU A down: CPU B runs solo, no process upset.');
m.className='badge '+(msgs.length?'bad':'ok');m.textContent=msgs.length?'\u26A0 '+msgs.join(' '):'\u2714 All systems normal';}
function info(id){sel=id;const n=N.find(x=>x.id===id);$('#nodeInfo').innerHTML=`<h2>${n.n}</h2><dl><dt>Role</dt><dd>${n.sp}</dd><dt>Failover behaviour</dt><dd>${n.f}</dd><dt>Protocol and wiring</dt><dd class="mono">${n.p}</dd></dl>`;drawArch()}
$('#arch').addEventListener('click',e=>{const g=e.target.closest('.n');if(g)info(g.dataset.id)});
$('#arch').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const g=e.target.closest('.n');if(g){e.preventDefault();info(g.dataset.id);$('.n.sel')&&$('.n.sel').focus()}}});
[['fBrk','brk'],['fSrv','srv'],['fCpu','cpu']].forEach(([i,k])=>$('#'+i).onchange=e=>{st[k]=e.target.checked;drawArch()});

/* calculators */
function bind(id,fn){const f=$(id),o=$('output',f);const run=()=>{const v={};new FormData(f).forEach((x,k)=>v[k]=x===''?NaN:parseFloat(x));o.textContent=fn(v,f)};f.addEventListener('input',run);run();$('[data-copy]',f).onclick=()=>copy(o.textContent)}
bind('#cTank',v=>{if([v.d,v.h,v.l,v.hh].some(x=>!isFinite(x)||x<0))return'Enter positive numbers.';if(v.l>v.h)return'Level cannot exceed shell height.';const a=Math.PI*v.d*v.d/4,hl=v.h*v.hh/100;return`Area: ${fmt(a)} m2\nVolume now: ${fmt(a*v.l)} m3\nUllage: ${fmt(a*(v.h-v.l))} m3\nHH level: ${fmt(hl)} m\nVolume at HH: ${fmt(a*hl)} m3\nHeadroom to HH: ${fmt(a*(hl-v.l))} m3${v.l>=hl?'\n\u26A0 Level is at or above HH':''}\nNominal values only. Use the strapping table for custody transfer.`});
bind('#cMa',v=>{const sp=v.hi-v.lo;if(!isFinite(sp)||sp===0)return'Range high and low must differ.';let ma=v.ma,pv=v.pv;if(isFinite(pv))ma=4+16*(pv-v.lo)/sp;else pv=v.lo+(ma-4)/16*sp;let s=`Current: ${fmt(ma,3)} mA\nValue: ${fmt(pv,3)} EU\nPercent of span: ${fmt((ma-4)/16*100,2)} %`;if(ma<3.6)s+='\n\u26A0 Below 3.6 mA: NAMUR NE43 failure (low)';else if(ma>21)s+='\n\u26A0 Above 21 mA: NAMUR NE43 failure (high)';else if(ma<3.8||ma>20.5)s+='\n\u26A0 Outside 3.8-20.5 mA valid range (over/underrange)';else s+='\n\u2714 Within valid range';return s});
bind('#cIo',v=>{if([v.io,v.sp,v.ch,v.ms,v.nd].some(x=>!isFinite(x)||x<0)||v.ch<1||v.ms<1)return'Enter valid numbers.';const tot=Math.ceil(v.io*(1+v.sp/100)),mod=Math.ceil(tot/v.ch),stn=Math.ceil(mod/v.ms),rings=Math.max(1,Math.ceil(v.nd/50));return`Points incl. spare: ${tot}\nI/O modules: ${mod}\nRemote stations: ${stn}\nMRP rings needed (50 devices max each): ${rings}\n${v.nd>50?'\u26A0 Split devices across '+rings+' rings':'\u2714 Fits one MRP ring'}`});

/* reference */
const REF=[
['PCS 7','APL blocks','APL library: MotL (motor), VlvL (valve), MonAnL (analog monitor), MonDiL (digital monitor), PIDConL (controller). Use for tank pumps, MOVs and level signals.'],
['PCS 7','S7-410H stuck in RUN-Solo','Check sync module fiber and connectors, both CPUs same firmware and program, and no link-up fault in diagnostic buffer. Resync with STOP of standby then restart.'],
['PCS 7','OS server redundancy lost','Check redundancy link, equal project versions, time sync and licences on both servers. Check Windows firewall rules.'],
['PCS 7','Alarm rate targets','EEMUA 191: about 1 alarm per 10 min is very likely acceptable, 2 per 10 min is the maximum manageable, and no more than 10 in a 10 min burst.'],
['Protocol','PROFIBUS','DP up to 12 Mbit/s. PA runs at 31.25 kbit/s and is used for field instruments. Check terminators and shield grounding.'],
['Protocol','PROFINET','IO on Ethernet. Media redundancy with MRP: one manager per ring, recovery 200 ms or less.'],
['Protocol','PRP and HSR','IEC 62439-3. Zero recovery time using two parallel networks (PRP) or a ring (HSR).'],
['Protocol','Modbus registers','Function 03 read holding, 04 read input, 06 write single, 16 write multiple. Address 40001 equals offset 0. Check word and byte order for float values.'],
['SNMP','Common OIDs','sysUpTime 1.3.6.1.2.1.1.3.0, ifOperStatus 1.3.6.1.2.1.2.2.1.8, ifInErrors 1.3.6.1.2.1.2.2.1.14.'],
['SNMP','Link traps','linkDown 1.3.6.1.6.3.1.1.5.3 and linkUp 1.3.6.1.6.3.1.1.5.4. Verify the NMS receives both during FAT.'],
['Instrument','4-20 mA and HART','NAMUR NE43: valid 3.8-20.5 mA, failure below 3.6 or above 21 mA. HART rides on the loop, check 250 ohm loop resistance.'],
['Instrument','Overfill protection','Independent of BPCS. IEC 61511 for SIL design and API 2350 for overfill practice. Test the full trip chain including final element.'],
['Instrument','Hazardous areas','IEC 60079 zones 0, 1, 2. Ex ia is intrinsically safe for zone 0 loops, Ex d is flameproof enclosure. Check certificates and barrier entity parameters.'],
['Commissioning','Fiber OTDR checks','Record loss per fiber at 1310 and 1550 nm for single-mode, compare with link budget and file traces in the loop folder.'],
['Commissioning','Custody transfer','Reconcile ATG volumes with strapping tables. API MPMS Ch.3 gauging, Ch.11.1 correction factors, Ch.12.1 quantity calculation.'],
['Commissioning','Ring break test','Pull one fiber, time recovery, confirm SNMP trap and no loss of ATG or MOV data. Repeat for each ring segment.']];
function renderRef(){const q=$('#q').value.trim().toLowerCase();const r=REF.filter(x=>x.join(' ').toLowerCase().includes(q));$('#cnt').textContent=r.length+' of '+REF.length+' entries';$('#refList').innerHTML=r.length?r.map((x,i)=>`<article class="card rf"><h2><span>${x[1]}</span><span class="tag">${x[0]}</span></h2><p>${x[2]}</p><button class="btn ghost" data-t="${encodeURIComponent(x[1]+': '+x[2])}">Copy</button></article>`).join(''):'<div class="empty"><strong>No match for "'+q.replace(/</g,'&lt;')+'"</strong><p>Try a protocol name, an OID or a phase keyword.</p></div>'}
$('#q').addEventListener('input',renderRef);$('#refList').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b)copy(decodeURIComponent(b.dataset.t))});

/* install */
let dp=null;const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)&&!navigator.standalone;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#installBtn').hidden=false});
addEventListener('appinstalled',()=>{$('#installBtn').hidden=true;toast('App installed')});
if(ios){$('#installBtn').hidden=false}
$('#installBtn').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;$('#installBtn').hidden=true}else if(ios){$('#iosDlg').showModal?$('#iosDlg').showModal():alert('Tap Share, then Add to Home Screen')}};
$('#iosClose').onclick=()=>$('#iosDlg').close();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

applyTheme();renderPh();drawArch();renderRef();route();
})();