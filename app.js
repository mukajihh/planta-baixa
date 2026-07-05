const PALETTE = [
  {name:"Recepção / Espera", c:"#6c8ebf"},
  {name:"Área de Serviço",   c:"#b8c7a6"},
  {name:"Cabine de Pintura", c:"#7fb0e0"},
  {name:"Preparação / Lixamento", c:"#d7b98e"},
  {name:"Estoque de Materiais", c:"#c0a6c7"},
  {name:"Área Técnica / Compressor", c:"#adb5b8"},
  {name:"Escritório", c:"#e0b0a0"},
  {name:"Banheiro", c:"#9fd0c7"},
];
const COLORS = ["#6c8ebf","#b8c7a6","#7fb0e0","#d7b98e","#c0a6c7","#adb5b8","#e0b0a0","#9fd0c7","#e8b04b","#8fbf9f"];

// estado inicial sugerido (x,y,w,h em metros) para um galpão 10x15
let galpao = {w:10, l:15};
let rooms = [
  {id:1, name:"Recepção / Espera", c:"#6c8ebf", x:0.3, y:0.3, w:4.2, h:3.2},
  {id:2, name:"Escritório",        c:"#e0b0a0", x:5.0, y:0.3, w:4.4, h:3.2},
  {id:3, name:"Banheiro",          c:"#9fd0c7", x:0.3, y:3.9, w:2.4, h:2.4},
  {id:4, name:"Área de Serviço",   c:"#b8c7a6", x:3.1, y:3.9, w:6.3, h:5.4},
  {id:5, name:"Preparação / Lixamento", c:"#d7b98e", x:0.3, y:6.6, w:2.4, h:2.7},
  {id:6, name:"Cabine de Pintura", c:"#7fb0e0", x:0.3, y:9.9, w:5.6, h:4.4},
  {id:7, name:"Estoque de Materiais", c:"#c0a6c7", x:6.2, y:9.9, w:3.2, h:2.6},
  {id:8, name:"Área Técnica / Compressor", c:"#adb5b8", x:6.2, y:12.7, w:3.2, h:1.6},
];
let nextId = 9;
let selId = null;
let pxPerM = 40;
let snap = true;

const stage=document.getElementById('stage'), wrap=document.getElementById('wrap'),
      paper=document.getElementById('paper'), aside=document.getElementById('aside');
const gWEl=document.getElementById('gW'), gLEl=document.getElementById('gL');
const projectNameEl=document.getElementById('projectName');
let projectName = projectNameEl.textContent.trim() || 'Planta sem nome';
const DEFAULT_STATE = JSON.parse(JSON.stringify({name:projectName, galpao, rooms, nextId}));

// ---- desfazer (Ctrl+Z / Cmd+Z), até 5 alterações ----
const UNDO_LIMIT = 5;
let undoStack = [];
function snapshotState(){
  return JSON.parse(JSON.stringify({name:projectName, galpao, rooms, nextId}));
}
function pushUndo(snap){
  undoStack.push(snap || snapshotState());
  if(undoStack.length>UNDO_LIMIT) undoStack.shift();
}
function applyState(s){
  s=JSON.parse(JSON.stringify(s));
  galpao=s.galpao; rooms=s.rooms; selId=null;
  nextId=s.nextId||(Math.max(0,...rooms.map(r=>r.id))+1);
  gWEl.value=galpao.w; gLEl.value=galpao.l;
  setProjectName(s.name);
  render();
}
function undo(){
  if(!undoStack.length) return;
  applyState(undoStack.pop());
}

function setProjectName(name){
  projectName = (name||'').trim() || 'Planta sem nome';
  projectNameEl.textContent = projectName;
}
function safeFileName(name){
  let s=(name||'planta').trim().replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim().replace(/[. ]+$/,'');
  return s || 'planta';
}
let projectNameUndoSnap=null;
projectNameEl.addEventListener('focus',()=>{ projectNameUndoSnap=snapshotState(); });
projectNameEl.addEventListener('input',()=>{ projectName = projectNameEl.textContent.trim() || 'Planta sem nome'; });
projectNameEl.addEventListener('blur',()=>{
  setProjectName(projectNameEl.textContent);
  if(projectNameUndoSnap && projectNameUndoSnap.name!==projectName) pushUndo(projectNameUndoSnap);
  projectNameUndoSnap=null;
});
projectNameEl.addEventListener('keydown',e=>{
  if(e.key==='Enter'){ e.preventDefault(); projectNameEl.blur(); }
});

function computeScale(){
  const availW = stage.clientWidth - 90;
  const availH = stage.clientHeight - 90;
  pxPerM = Math.max(14, Math.min(availW/galpao.w, availH/galpao.l));
}
function snapV(v){ return snap ? Math.round(v/0.5)*0.5 : Math.round(v*100)/100; }

function render(){
  computeScale();
  const W = galpao.w*pxPerM, L = galpao.l*pxPerM;
  paper.style.width=W+'px'; paper.style.height=L+'px';
  const minor=0.5*pxPerM, major=1*pxPerM;
  paper.style.backgroundSize=
    `${minor}px ${minor}px, ${minor}px ${minor}px, ${major}px ${major}px, ${major}px ${major}px`;

  paper.querySelectorAll('.room').forEach(e=>e.remove());
  rooms.forEach(r=>{
    const el=document.createElement('div');
    el.className='room'+(r.id===selId?' sel':'');
    el.dataset.id=r.id;
    el.style.left=(r.x*pxPerM)+'px'; el.style.top=(r.y*pxPerM)+'px';
    el.style.width=(r.w*pxPerM)+'px'; el.style.height=(r.h*pxPerM)+'px';
    el.style.background=r.c;
    el.innerHTML=`<div class="r-name">${escapeHtml(r.name)}</div>
      <div class="r-dim">${r.w.toFixed(1)}×${r.h.toFixed(1)}m · ${(r.w*r.h).toFixed(1)}m²</div>
      <div class="handle"></div>`;
    paper.appendChild(el);
    attachDrag(el,r);
  });

  // scale bar = 1m
  document.getElementById('scaleBar').style.width=pxPerM+'px';
  updatePanel(); updateTotals(); updateLegend();
}

function escapeHtml(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

function attachDrag(el,r){
  const handle=el.querySelector('.handle');
  // mover
  el.addEventListener('pointerdown',e=>{
    if(e.target===handle) return;
    e.preventDefault(); select(r.id);
    el.setPointerCapture(e.pointerId); el.classList.add('dragging');
    const sx=e.clientX, sy=e.clientY, ox=r.x, oy=r.y;
    const preSnap=snapshotState(); let moved=false;
    const move=ev=>{
      let nx=ox+(ev.clientX-sx)/pxPerM, ny=oy+(ev.clientY-sy)/pxPerM;
      nx=snapV(nx); ny=snapV(ny);
      nx=Math.max(0,Math.min(nx,galpao.w-r.w));
      ny=Math.max(0,Math.min(ny,galpao.l-r.h));
      if(nx!==ox||ny!==oy) moved=true;
      r.x=nx; r.y=ny;
      el.style.left=(nx*pxPerM)+'px'; el.style.top=(ny*pxPerM)+'px';
    };
    const up=ev=>{el.classList.remove('dragging');el.releasePointerCapture(e.pointerId);
      el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);
      if(moved) pushUndo(preSnap);
      syncDim(el,r);updatePanel();updateTotals();};
    el.addEventListener('pointermove',move); el.addEventListener('pointerup',up);
  });
  // redimensionar
  handle.addEventListener('pointerdown',e=>{
    e.preventDefault();e.stopPropagation();select(r.id);
    handle.setPointerCapture(e.pointerId);
    const sx=e.clientX, sy=e.clientY, ow=r.w, oh=r.h;
    const preSnap=snapshotState(); let resized=false;
    const move=ev=>{
      let nw=snapV(ow+(ev.clientX-sx)/pxPerM), nh=snapV(oh+(ev.clientY-sy)/pxPerM);
      nw=Math.max(0.5,Math.min(nw,galpao.w-r.x)); nh=Math.max(0.5,Math.min(nh,galpao.l-r.y));
      if(nw!==ow||nh!==oh) resized=true;
      r.w=nw; r.h=nh;
      el.style.width=(nw*pxPerM)+'px'; el.style.height=(nh*pxPerM)+'px';
      syncDim(el,r);
    };
    const up=ev=>{handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);
      if(resized) pushUndo(preSnap);
      updatePanel();updateTotals();};
    handle.addEventListener('pointermove',move); handle.addEventListener('pointerup',up);
  });
}
function syncDim(el,r){
  el.querySelector('.r-dim').textContent=`${r.w.toFixed(1)}×${r.h.toFixed(1)}m · ${(r.w*r.h).toFixed(1)}m²`;
}

function select(id){ selId=id; paper.querySelectorAll('.room').forEach(e=>e.classList.toggle('sel',+e.dataset.id===id)); updatePanel(); }

function updatePanel(){
  const r=rooms.find(x=>x.id===selId);
  document.getElementById('noSel').style.display=r?'none':'block';
  document.getElementById('propForm').style.display=r?'block':'none';
  if(!r) return;
  document.getElementById('pName').value=r.name;
  document.getElementById('pW').value=r.w.toFixed(1);
  document.getElementById('pH').value=r.h.toFixed(1);
  const sw=document.getElementById('swatches'); sw.innerHTML='';
  COLORS.forEach(c=>{
    const d=document.createElement('div'); d.className='sw'+(c===r.c?' on':'');
    d.style.background=c; d.onclick=()=>{ if(c!==r.c){ pushUndo(); r.c=c; } render(); }; sw.appendChild(d);
  });
}
function updateTotals(){
  const gA=galpao.w*galpao.l;
  const occ=rooms.reduce((s,r)=>s+r.w*r.h,0);
  document.getElementById('tGalpao').textContent=gA.toFixed(1)+' m²';
  document.getElementById('tOcupada').textContent=occ.toFixed(1)+' m²';
  document.getElementById('tLivre').textContent=Math.max(0,gA-occ).toFixed(1)+' m²';
}
function updateLegend(){
  const l=document.getElementById('legend'); l.innerHTML='';
  rooms.forEach(r=>{
    const d=document.createElement('div'); d.className='li';
    d.innerHTML=`<span class="dot" style="background:${r.c}"></span>${escapeHtml(r.name)}`;
    d.style.cursor='pointer'; d.onclick=()=>select(r.id);
    l.appendChild(d);
  });
}

// ---- controls ----
let pNameUndoSnap=null;
document.getElementById('pName').addEventListener('focus',()=>{ pNameUndoSnap=snapshotState(); });
document.getElementById('pName').addEventListener('blur',()=>{
  if(pNameUndoSnap){
    const r=rooms.find(x=>x.id===selId);
    const before=pNameUndoSnap.rooms.find(x=>x.id===selId);
    if(r && before && before.name!==r.name) pushUndo(pNameUndoSnap);
  }
  pNameUndoSnap=null;
});
document.getElementById('pName').addEventListener('input',e=>{
  const r=rooms.find(x=>x.id===selId); if(r){r.name=e.target.value; render(); document.getElementById('pName').focus();}
});
function bindDim(idEl,dim){
  document.getElementById(idEl).addEventListener('change',e=>{
    const r=rooms.find(x=>x.id===selId); if(!r) return;
    let v=parseFloat(e.target.value)||0.5; v=Math.max(0.5,v);
    if(dim==='w') v=Math.min(v,galpao.w-r.x); else v=Math.min(v,galpao.l-r.y);
    v=Math.round(v*100)/100;
    if(v!==r[dim]) pushUndo();
    r[dim]=v; render();
  });
}
bindDim('pW','w'); bindDim('pH','h');

document.getElementById('rotBtn').onclick=()=>{
  const r=rooms.find(x=>x.id===selId); if(!r) return;
  const nw=r.h, nh=r.w;
  if(r.x+nw<=galpao.w && r.y+nh<=galpao.l){ pushUndo(); r.w=nw;r.h=nh;render(); }
};
function deleteSelected(){
  if(selId==null) return;
  pushUndo();
  rooms=rooms.filter(x=>x.id!==selId); selId=null; render();
}
document.getElementById('delBtn').onclick=deleteSelected;

// ---- copiar / colar ambiente ----
let clipboardRoom=null;
function copySelected(){
  const r=rooms.find(x=>x.id===selId); if(!r) return;
  clipboardRoom={name:r.name, c:r.c, w:r.w, h:r.h};
  document.getElementById('pasteBtn').disabled=false;
  const label=document.getElementById('copyBtnLabel');
  const prev=label.textContent;
  label.textContent='Copiado!';
  setTimeout(()=>{label.textContent=prev;},1200);
}
function pasteClipboard(){
  if(!clipboardRoom) return;
  pushUndo();
  const r={
    id:nextId++,
    name:clipboardRoom.name+' - cópia',
    c:clipboardRoom.c,
    x:0, y:0,
    w:Math.min(clipboardRoom.w,galpao.w),
    h:Math.min(clipboardRoom.h,galpao.l),
  };
  rooms.push(r); select(r.id); render();
}
document.getElementById('copyBtn').onclick=copySelected;
document.getElementById('pasteBtn').onclick=pasteClipboard;

document.addEventListener('keydown',e=>{
  const active=document.activeElement;
  const isEditable=active && (active.tagName==='INPUT' || active.tagName==='TEXTAREA' || active.isContentEditable);
  const isUndoCombo=(e.metaKey||e.ctrlKey) && !e.shiftKey && (e.key==='z'||e.key==='Z');
  const isCopyCombo=(e.metaKey||e.ctrlKey) && !e.shiftKey && (e.key==='c'||e.key==='C');
  const isPasteCombo=(e.metaKey||e.ctrlKey) && !e.shiftKey && (e.key==='v'||e.key==='V');
  if(isUndoCombo && !isEditable){ e.preventDefault(); undo(); return; }
  if(isCopyCombo && !isEditable && selId!=null){ e.preventDefault(); copySelected(); return; }
  if(isPasteCombo && !isEditable && clipboardRoom){ e.preventDefault(); pasteClipboard(); return; }
  if(e.key!=='Delete' && e.key!=='Backspace') return;
  if(isEditable) return;
  e.preventDefault();
  deleteSelected();
});
document.getElementById('addBtn').onclick=()=>{
  pushUndo();
  const c=COLORS[rooms.length%COLORS.length];
  const r={id:nextId++,name:"Novo ambiente",c,x:0.5,y:0.5,w:3,h:3};
  r.w=Math.min(r.w,galpao.w-1); r.h=Math.min(r.h,galpao.l-1);
  rooms.push(r); select(r.id); render();
};
function setGalpao(){
  pushUndo();
  galpao.w=Math.max(1,parseFloat(gWEl.value)||10);
  galpao.l=Math.max(1,parseFloat(gLEl.value)||15);
  rooms.forEach(r=>{ r.x=Math.min(r.x,Math.max(0,galpao.w-r.w)); r.y=Math.min(r.y,Math.max(0,galpao.l-r.h));
    r.w=Math.min(r.w,galpao.w); r.h=Math.min(r.h,galpao.l); });
  render();
}
gWEl.addEventListener('change',setGalpao); gLEl.addEventListener('change',setGalpao);
document.getElementById('snap').addEventListener('change',e=>snap=e.target.checked);

stage.addEventListener('pointerdown',e=>{ if(e.target===stage||e.target===wrap||e.target===paper){selId=null;render();} });

document.getElementById('mPanel').onclick=()=>document.body.classList.toggle('panel-open');

// ---- salvar (localStorage) / baixar (arquivo) / abrir ----
const STORAGE_KEY='plantaBaixa:autosave';

function getStateObject(){
  return snapshotState();
}
function saveToLocalStorage(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(getStateObject())); return true; }
  catch(err){ return false; }
}
function loadFromLocalStorage(){
  let raw;
  try{ raw=localStorage.getItem(STORAGE_KEY); }catch(err){ return false; }
  if(!raw) return false;
  try{
    const d=JSON.parse(raw);
    if(!d||!d.galpao||!d.rooms) return false;
    applyState(d);
    return true;
  }catch(err){ return false; }
}

document.getElementById('saveBtn').onclick=()=>{
  const ok=saveToLocalStorage();
  const label=document.getElementById('saveBtnLabel');
  const prev=label.textContent;
  label.textContent = ok ? 'Salvo!' : 'Erro ao salvar';
  setTimeout(()=>{label.textContent=prev;},1500);
};
setInterval(saveToLocalStorage, 2*60*1000);

document.getElementById('downloadBtn').onclick=()=>{
  const data=JSON.stringify(getStateObject(),null,2);
  const b=new Blob([data],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(b);
  a.download=safeFileName(projectName)+'.json'; a.click();
};
document.getElementById('loadBtn').onclick=()=>document.getElementById('fileIn').click();
document.getElementById('fileIn').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(rd.result);
    if(d.galpao&&d.rooms){
      pushUndo();
      galpao=d.galpao;rooms=d.rooms;nextId=d.nextId||(Math.max(0,...rooms.map(r=>r.id))+1);
      gWEl.value=galpao.w;gLEl.value=galpao.l;selId=null;
      setProjectName(f.name.replace(/\.json$/i,''));
      render();}
  }catch(err){alert('Arquivo inválido.');}};
  rd.readAsText(f); e.target.value='';
});
document.getElementById('clearBtn').onclick=()=>{
  if(!confirm('Isso vai apagar os dados salvos neste navegador e restaurar o exemplo padrão. Deseja continuar?')) return;
  pushUndo();
  try{ localStorage.removeItem(STORAGE_KEY); }catch(err){}
  applyState(DEFAULT_STATE);
};

// ---- exportar PNG ----
document.getElementById('pngBtn').onclick=()=>{
  const scale=2, W=galpao.w*pxPerM, L=galpao.l*pxPerM, pad=40;
  const cv=document.createElement('canvas'); cv.width=(W+pad*2)*scale; cv.height=(L+pad*2)*scale;
  const x=cv.getContext('2d'); x.scale(scale,scale);
  x.fillStyle='#ffffff'; x.fillRect(0,0,W+pad*2,L+pad*2);
  x.translate(pad,pad);
  // grade
  x.strokeStyle='#d3dee0'; x.lineWidth=1;
  for(let m=0;m<=galpao.w;m+=0.5){x.beginPath();x.moveTo(m*pxPerM,0);x.lineTo(m*pxPerM,L);x.stroke();}
  for(let m=0;m<=galpao.l;m+=0.5){x.beginPath();x.moveTo(0,m*pxPerM);x.lineTo(W,m*pxPerM);x.stroke();}
  x.strokeStyle='#a7bcc0';
  for(let m=0;m<=galpao.w;m+=1){x.beginPath();x.moveTo(m*pxPerM,0);x.lineTo(m*pxPerM,L);x.stroke();}
  for(let m=0;m<=galpao.l;m+=1){x.beginPath();x.moveTo(0,m*pxPerM);x.lineTo(W,m*pxPerM);x.stroke();}
  // ambientes
  rooms.forEach(r=>{
    x.fillStyle=r.c; x.strokeStyle='rgba(0,0,0,.45)'; x.lineWidth=1.5;
    x.fillRect(r.x*pxPerM,r.y*pxPerM,r.w*pxPerM,r.h*pxPerM);
    x.strokeRect(r.x*pxPerM,r.y*pxPerM,r.w*pxPerM,r.h*pxPerM);
    x.fillStyle='#1a2830'; x.textAlign='center';
    x.font='600 13px system-ui,sans-serif';
    const cx=(r.x+r.w/2)*pxPerM, cy=(r.y+r.h/2)*pxPerM;
    x.fillText(r.name,cx,cy-2);
    x.font='11px monospace'; x.fillStyle='#31434c';
    x.fillText(`${r.w.toFixed(1)}×${r.h.toFixed(1)}m · ${(r.w*r.h).toFixed(1)}m²`,cx,cy+14);
  });
  // moldura
  x.strokeStyle='#16232b'; x.lineWidth=2.5; x.strokeRect(0,0,W,L);
  const a=document.createElement('a'); a.href=cv.toDataURL('image/png');
  a.download=safeFileName(projectName)+'.png'; a.click();
};

loadFromLocalStorage();
window.addEventListener('resize',render);
render();
