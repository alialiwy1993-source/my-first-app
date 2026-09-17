const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const XLSX = require('xlsx');

let dbPath = '';
let currentUserId = null;

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}
function uid(){ return crypto.randomUUID(); }
function now(){ return new Date().toISOString(); }
function defaultDB(){
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    version: 2,
    users:[{id:uid(),username:'admin',name:'مدير النظام',role:'admin',active:true,salt,passwordHash:hashPassword('admin123',salt),createdAt:now()}],
    loans:[], deleted:[], settings:{defaultLoanAmount:0}
  };
}
function loadDB(){
  try{
    if(!fs.existsSync(dbPath)){ const d=defaultDB(); saveDB(d); return d; }
    const d=JSON.parse(fs.readFileSync(dbPath,'utf8'));
    d.users ||= []; d.loans ||= []; d.deleted ||= []; d.settings ||= {defaultLoanAmount:0};
    if(!d.users.length){ const fresh=defaultDB(); d.users=fresh.users; }
    return d;
  }catch{ const d=defaultDB(); saveDB(d); return d; }
}
function saveDB(d){ const tmp=dbPath+'.tmp'; fs.writeFileSync(tmp,JSON.stringify(d,null,2),'utf8'); fs.renameSync(tmp,dbPath); }
function publicUser(u){ return {id:u.id,username:u.username,name:u.name,role:u.role,active:u.active,createdAt:u.createdAt}; }
function requireUser(db){ const u=db.users.find(x=>x.id===currentUserId&&x.active); if(!u) throw new Error('غير مصرح'); return u; }

ipcMain.handle('loan-api', async (_event, action, payload={}) => {
  const db=loadDB();
  if(action==='login'){
    const u=db.users.find(x=>x.username===String(payload.username||'').trim());
    if(!u||!u.active||u.passwordHash!==hashPassword(String(payload.password||''),u.salt)) return {ok:false,error:'اسم المستخدم أو كلمة المرور غير صحيحة'};
    currentUserId=u.id; return {ok:true,user:publicUser(u)};
  }
  if(action==='logout'){ currentUserId=null; return {ok:true}; }
  const user=requireUser(db);
  if(action==='me') return {ok:true,user:publicUser(user)};
  if(action==='dashboard'){
    const limit=[25,50,100].includes(Number(payload.limit))?Number(payload.limit):25;
    const sorted=[...db.loans].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const stats={total:db.loans.length,waiting:0,monthly:0,paid:0,excluded:0,deleted:db.deleted.length};
    db.loans.forEach(x=>stats[x.status]=(stats[x.status]||0)+1);
    return {ok:true,stats,settings:db.settings,waiting:sorted.filter(x=>x.status==='waiting').slice(0,limit),monthly:sorted.filter(x=>x.status==='monthly').slice(0,limit)};
  }
  if(action==='loan_create'){
    const name=String(payload.name||'').trim(); if(!name) return {ok:false,error:'الاسم مطلوب'};
    const t=now(); const loan={id:uid(),name,phone:String(payload.phone||''),nationalId:String(payload.nationalId||''),amount:Number(payload.amount||0),notes:String(payload.notes||''),status:['waiting','monthly','paid','excluded'].includes(payload.status)?payload.status:'waiting',createdAt:t,updatedAt:t,registeredBy:user.id,registeredByName:user.name};
    db.loans.unshift(loan); saveDB(db); return {ok:true,loan};
  }
  if(action==='loan_update'){
    const i=db.loans.findIndex(x=>x.id===payload.id); if(i<0) return {ok:false,error:'الطلب غير موجود'};
    db.loans[i]={...db.loans[i],name:String(payload.name||'').trim()||db.loans[i].name,phone:String(payload.phone||''),nationalId:String(payload.nationalId||''),amount:Number(payload.amount||0),notes:String(payload.notes||''),status:['waiting','monthly','paid','excluded'].includes(payload.status)?payload.status:db.loans[i].status,updatedAt:now()};
    saveDB(db); return {ok:true,loan:db.loans[i]};
  }
  if(action==='loan_get'){ const x=db.loans.find(v=>v.id===payload.id); return x?{ok:true,loan:x}:{ok:false,error:'الطلب غير موجود'}; }
  if(action==='loans_list'){
    let rows=[...db.loans].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    if(payload.status) rows=rows.filter(x=>x.status===payload.status);
    const q=String(payload.search||'').trim().toLowerCase(); if(q) rows=rows.filter(x=>[x.name,x.phone,x.nationalId,x.notes].join(' ').toLowerCase().includes(q));
    const size=[25,50,100].includes(Number(payload.pageSize))?Number(payload.pageSize):25, page=Math.max(0,Number(payload.page||0));
    return {ok:true,items:rows.slice(page*size,page*size+size),total:rows.length,page};
  }
  if(action==='loan_delete'){
    const reason=String(payload.reason||'').trim(); if(!reason) return {ok:false,error:'سبب الحذف مطلوب'};
    const i=db.loans.findIndex(x=>x.id===payload.id); if(i<0) return {ok:false,error:'الطلب غير موجود'};
    const x=db.loans.splice(i,1)[0]; db.deleted.unshift({...x,deletionReason:reason,deletedAt:now(),deletedBy:user.id,deletedByName:user.name}); saveDB(db); return {ok:true};
  }
  if(action==='deleted_list'){
    const size=[25,50,100].includes(Number(payload.pageSize))?Number(payload.pageSize):25,page=Math.max(0,Number(payload.page||0));
    const rows=[...db.deleted].sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt)); return {ok:true,items:rows.slice(page*size,page*size+size),total:rows.length,page};
  }
  if(action==='deleted_restore'){
    if(user.role!=='admin') return {ok:false,error:'هذه العملية للمسؤول فقط'};
    const i=db.deleted.findIndex(x=>x.id===payload.id); if(i<0) return {ok:false,error:'السجل غير موجود'};
    const x=db.deleted.splice(i,1)[0]; delete x.deletionReason; delete x.deletedAt; delete x.deletedBy; delete x.deletedByName; x.updatedAt=now(); db.loans.unshift(x); saveDB(db); return {ok:true};
  }
  if(action==='settings_get') return {ok:true,settings:db.settings};
  if(action==='settings_save'){
    if(user.role!=='admin') return {ok:false,error:'هذه العملية للمسؤول فقط'}; db.settings.defaultLoanAmount=Math.max(0,Number(payload.defaultLoanAmount||0)); saveDB(db); return {ok:true,settings:db.settings};
  }
  if(action==='users_list'){
    if(user.role!=='admin') return {ok:false,error:'هذه العملية للمسؤول فقط'}; return {ok:true,users:db.users.map(publicUser)};
  }
  if(action==='user_create'){
    if(user.role!=='admin') return {ok:false,error:'هذه العملية للمسؤول فقط'};
    const username=String(payload.username||'').trim(),name=String(payload.name||'').trim(),password=String(payload.password||'');
    if(!username||!name||password.length<4) return {ok:false,error:'أكمل بيانات المستخدم وكلمة مرور 4 أحرف على الأقل'};
    if(db.users.some(x=>x.username.toLowerCase()===username.toLowerCase())) return {ok:false,error:'اسم المستخدم موجود مسبقاً'};
    const salt=crypto.randomBytes(16).toString('hex'); db.users.push({id:uid(),username,name,role:payload.role==='admin'?'admin':'employee',active:true,salt,passwordHash:hashPassword(password,salt),createdAt:now()}); saveDB(db); return {ok:true};
  }
  if(action==='user_toggle'){
    if(user.role!=='admin') return {ok:false,error:'هذه العملية للمسؤول فقط'}; const x=db.users.find(v=>v.id===payload.id); if(!x)return{ok:false,error:'المستخدم غير موجود'}; if(x.id===user.id&&!payload.active)return{ok:false,error:'لا يمكن إيقاف حسابك الحالي'}; x.active=!!payload.active; saveDB(db); return{ok:true};
  }
  if(action==='user_reset_password'){
    if(user.role!=='admin') return {ok:false,error:'هذه العملية للمسؤول فقط'}; const x=db.users.find(v=>v.id===payload.id),p=String(payload.password||''); if(!x||p.length<4)return{ok:false,error:'بيانات غير صحيحة'}; x.salt=crypto.randomBytes(16).toString('hex'); x.passwordHash=hashPassword(p,x.salt); saveDB(db); return{ok:true};
  }
  if(action==='account_password'){
    const old=String(payload.oldPassword||''),nw=String(payload.newPassword||''); if(nw.length<4)return{ok:false,error:'كلمة المرور الجديدة قصيرة'}; if(user.passwordHash!==hashPassword(old,user.salt))return{ok:false,error:'كلمة المرور الحالية غير صحيحة'}; user.salt=crypto.randomBytes(16).toString('hex'); user.passwordHash=hashPassword(nw,user.salt); saveDB(db); return{ok:true};
  }
  if(action==='import_excel'){
    const pick=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'Excel',extensions:['xlsx','xls','csv']}]}); if(pick.canceled||!pick.filePaths[0])return{ok:false,canceled:true};
    const wb=XLSX.readFile(pick.filePaths[0]); const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:''});
    const get=(r,keys)=>{for(const k of Object.keys(r)){if(keys.includes(String(k).trim().toLowerCase()))return r[k]}return''};
    let count=0; for(const r of rows){const first=Object.values(r)[0],name=String(get(r,['الاسم','اسم','name','full name'])||first||'').trim(); if(!name)continue; const t=now(); db.loans.unshift({id:uid(),name,phone:String(get(r,['الهاتف','رقم الهاتف','phone','mobile'])||''),nationalId:String(get(r,['الرقم','الرقم الوطني','الرقم الوظيفي','id'])||''),amount:Number(get(r,['المبلغ','مبلغ السلفة','amount'])||db.settings.defaultLoanAmount||0),notes:String(get(r,['الملاحظات','ملاحظات','notes'])||''),status:'waiting',createdAt:t,updatedAt:t,registeredBy:user.id,registeredByName:user.name}); count++; }
    saveDB(db); return{ok:true,imported:count};
  }
  if(action==='backup'){
    const p=await dialog.showSaveDialog({defaultPath:`loan-backup-${new Date().toISOString().slice(0,10)}.json`,filters:[{name:'JSON',extensions:['json']}]}); if(p.canceled||!p.filePath)return{ok:false,canceled:true}; fs.copyFileSync(dbPath,p.filePath); return{ok:true};
  }
  if(action==='restore_backup'){
    if(user.role!=='admin')return{ok:false,error:'هذه العملية للمسؤول فقط'}; const p=await dialog.showOpenDialog({properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]}); if(p.canceled||!p.filePaths[0])return{ok:false,canceled:true}; const imported=JSON.parse(fs.readFileSync(p.filePaths[0],'utf8')); if(!imported.users||!imported.loans) return{ok:false,error:'ملف النسخة غير صالح'}; saveDB(imported); currentUserId=null; return{ok:true,relogin:true};
  }
  return {ok:false,error:'أمر غير معروف'};
});

function createWindow(){
  const win=new BrowserWindow({width:1380,height:880,minWidth:900,minHeight:620,show:false,autoHideMenuBar:true,backgroundColor:'#f6f8fc',webPreferences:{preload:path.join(__dirname,'preload.js'),nodeIntegration:false,contextIsolation:true,sandbox:false}});
  Menu.setApplicationMenu(null); win.once('ready-to-show',()=>win.show()); win.loadFile('offline.html');
}
app.whenReady().then(()=>{dbPath=path.join(app.getPath('userData'),'loan-booking-db.json');createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});