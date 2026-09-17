const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let dbPath = '';

function uid(){ return crypto.randomUUID(); }
function now(){ return new Date().toISOString(); }
function hashPassword(password, salt){ return crypto.scryptSync(password, salt, 32).toString('hex'); }
function tokenHash(token){ return crypto.createHash('sha256').update(token).digest('hex'); }
function cleanStatus(v){ return ['waiting','monthly','paid','excluded'].includes(String(v)) ? String(v) : 'waiting'; }
function publicUser(u){ return { id:u.id, username:u.username, name:u.name, role:u.role, active:u.active, createdAt:u.createdAt }; }

function defaultDB(){
  const salt = crypto.randomBytes(16).toString('hex');
  return {
    version: 3,
    users: [{ id:uid(), username:'admin', name:'مدير النظام', role:'admin', active:true, salt, passwordHash:hashPassword('admin123', salt), createdAt:now() }],
    sessions: [],
    loans: [],
    deleted: [],
    settings: { defaultLoanAmount: 0 }
  };
}

function saveDB(db){
  const tmp = dbPath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, dbPath);
}
function loadDB(){
  try{
    if(!fs.existsSync(dbPath)){ const d=defaultDB(); saveDB(d); return d; }
    const d=JSON.parse(fs.readFileSync(dbPath,'utf8'));
    d.users ||= []; d.sessions ||= []; d.loans ||= []; d.deleted ||= []; d.settings ||= {defaultLoanAmount:0};
    if(!d.users.length){ const f=defaultDB(); d.users=f.users; }
    return d;
  }catch{
    const d=defaultDB(); saveDB(d); return d;
  }
}

function getSession(db, data){
  const sessionId=String(data.sessionId||'');
  const token=String(data.token||'');
  if(!sessionId || !token) return null;
  const s=db.sessions.find(x=>x.id===sessionId && x.tokenHash===tokenHash(token) && new Date(x.expiresAt).getTime()>Date.now());
  if(!s) return null;
  const u=db.users.find(x=>x.id===s.userId && x.active);
  return u ? {session:s,user:u} : null;
}

function err(message, status=400){ return { error:message, status }; }

ipcMain.handle('loan-api-post', async (_event, route, data={}) => {
  const db=loadDB();

  if(route==='/api/login'){
    const username=String(data.username||'').trim();
    const password=String(data.password||'');
    const u=db.users.find(x=>x.username.toLowerCase()===username.toLowerCase());
    if(!u || !u.active || u.passwordHash!==hashPassword(password,u.salt)) return err('Invalid credentials',401);
    const token=crypto.randomBytes(32).toString('hex');
    const session={ id:uid(), tokenHash:tokenHash(token), userId:u.id, username:u.username, name:u.name, role:u.role, expiresAt:new Date(Date.now()+14*24*60*60*1000).toISOString() };
    db.sessions=db.sessions.filter(x=>x.userId!==u.id);
    db.sessions.push(session);
    saveDB(db);
    return { sessionId:session.id, token, user:publicUser(u) };
  }

  const auth=getSession(db,data);
  if(!auth) return err('Unauthorized',401);
  const user=auth.user;

  if(route==='/api/logout'){
    db.sessions=db.sessions.filter(x=>x.id!==auth.session.id);
    saveDB(db);
    return {ok:true};
  }

  if(route==='/api/dashboard'){
    const limit=[25,50,100].includes(Number(data.limit)) ? Number(data.limit) : 25;
    const sorted=[...db.loans].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const stats={total:db.loans.length,waiting:0,monthly:0,paid:0,excluded:0,deleted:db.deleted.length};
    db.loans.forEach(x=>{ stats[x.status]=(stats[x.status]||0)+1; });
    return {
      stats,
      settings:db.settings,
      waiting:sorted.filter(x=>x.status==='waiting').slice(0,limit),
      monthly:sorted.filter(x=>x.status==='monthly').slice(0,limit)
    };
  }

  if(route==='/api/settings/get') return { defaultLoanAmount:Number(db.settings.defaultLoanAmount||0) };
  if(route==='/api/settings/save'){
    if(user.role!=='admin') return err('Forbidden',403);
    db.settings.defaultLoanAmount=Math.max(0,Number(data.defaultLoanAmount||0)); saveDB(db);
    return {defaultLoanAmount:db.settings.defaultLoanAmount};
  }

  if(route==='/api/loans/create'){
    const name=String(data.name||'').trim();
    if(!name) return err('Name required',400);
    const t=now();
    const loan={id:uid(),name,phone:String(data.phone||''),nationalId:String(data.nationalId||''),amount:Math.max(0,Number(data.amount||0)),notes:String(data.notes||''),status:cleanStatus(data.status),createdAt:t,updatedAt:t,registeredBy:user.id,registeredByName:user.name};
    db.loans.unshift(loan); saveDB(db); return {loan};
  }

  if(route==='/api/loans/get'){
    const loan=db.loans.find(x=>x.id===String(data.id||''));
    return loan ? {loan} : err('Not found',404);
  }

  if(route==='/api/loans/update'){
    const i=db.loans.findIndex(x=>x.id===String(data.id||''));
    if(i<0) return err('Not found',404);
    db.loans[i]={...db.loans[i],name:String(data.name||'').trim()||db.loans[i].name,phone:String(data.phone||''),nationalId:String(data.nationalId||''),amount:Math.max(0,Number(data.amount||0)),notes:String(data.notes||''),status:cleanStatus(data.status),updatedAt:now()};
    saveDB(db); return {loan:db.loans[i]};
  }

  if(route==='/api/loans/list'){
    const pageSize=[25,50,100].includes(Number(data.pageSize)) ? Number(data.pageSize) : 25;
    const offset=Math.max(0,parseInt(String(data.nextToken||'0'),10)||0);
    let rows=[...db.loans].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const status=String(data.status||''); if(status) rows=rows.filter(x=>x.status===status);
    const items=rows.slice(offset,offset+pageSize);
    return {items,...(items.length===pageSize?{nextToken:String(offset+pageSize)}:{})};
  }

  if(route==='/api/loans/delete'){
    const reason=String(data.reason||'').trim();
    if(!reason) return err('Deletion reason required',400);
    const i=db.loans.findIndex(x=>x.id===String(data.id||''));
    if(i<0) return err('Not found',404);
    const x=db.loans.splice(i,1)[0];
    const archived={...x,originalId:x.id,deletionReason:reason,deletedAt:now(),deletedBy:user.id,deletedByName:user.name};
    db.deleted.unshift(archived); saveDB(db);
    return {ok:true,archiveId:archived.id};
  }

  if(route==='/api/deleted/list'){
    const pageSize=[25,50,100].includes(Number(data.pageSize)) ? Number(data.pageSize) : 25;
    const offset=Math.max(0,parseInt(String(data.nextToken||'0'),10)||0);
    const rows=[...db.deleted].sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt));
    const items=rows.slice(offset,offset+pageSize);
    return {items,...(items.length===pageSize?{nextToken:String(offset+pageSize)}:{})};
  }

  if(route==='/api/deleted/restore'){
    if(user.role!=='admin') return err('Forbidden',403);
    const i=db.deleted.findIndex(x=>x.id===String(data.id||''));
    if(i<0) return err('Not found',404);
    const x=db.deleted.splice(i,1)[0];
    const restored={id:x.id,name:x.name,phone:x.phone,nationalId:x.nationalId,amount:x.amount,notes:x.notes,status:x.status,createdAt:x.createdAt,updatedAt:now(),registeredBy:x.registeredBy,registeredByName:x.registeredByName};
    db.loans.unshift(restored); saveDB(db); return {ok:true,id:restored.id};
  }

  if(route==='/api/import'){
    const rows=Array.isArray(data.rows)?data.rows.slice(0,200):[];
    let imported=0;
    for(const r of rows){
      const name=String(r.name||'').trim(); if(!name) continue;
      const t=now();
      db.loans.unshift({id:uid(),name,phone:String(r.phone||''),nationalId:String(r.nationalId||''),amount:Math.max(0,Number(r.amount||0)),notes:String(r.notes||''),status:cleanStatus(r.status),createdAt:t,updatedAt:t,registeredBy:user.id,registeredByName:user.name});
      imported++;
    }
    saveDB(db); return {imported};
  }

  if(route==='/api/users/list'){
    if(user.role!=='admin') return err('Forbidden',403);
    return {users:db.users.map(publicUser)};
  }

  if(route==='/api/users/create'){
    if(user.role!=='admin') return err('Forbidden',403);
    const username=String(data.username||'').trim(),name=String(data.name||'').trim(),password=String(data.password||''),role=String(data.role)==='admin'?'admin':'employee';
    if(!username||!name||password.length<4) return err('Invalid user data',400);
    if(db.users.some(x=>x.username.toLowerCase()===username.toLowerCase())) return err('Username exists',409);
    const salt=crypto.randomBytes(16).toString('hex');
    const u={id:uid(),username,name,role,active:true,salt,passwordHash:hashPassword(password,salt),createdAt:now()};
    db.users.push(u); saveDB(db); return {id:u.id};
  }

  if(route==='/api/users/toggle'){
    if(user.role!=='admin') return err('Forbidden',403);
    const u=db.users.find(x=>x.id===String(data.id||''));
    if(!u) return err('Not found',404);
    if(u.id===user.id && !Boolean(data.active)) return err('Cannot disable current user',400);
    u.active=Boolean(data.active); saveDB(db); return {ok:true};
  }

  if(route==='/api/users/reset-password'){
    if(user.role!=='admin') return err('Forbidden',403);
    const u=db.users.find(x=>x.id===String(data.id||'')); const password=String(data.password||'');
    if(!u) return err('Not found',404); if(password.length<4) return err('Password too short',400);
    u.salt=crypto.randomBytes(16).toString('hex'); u.passwordHash=hashPassword(password,u.salt); saveDB(db); return {ok:true};
  }

  if(route==='/api/account/password'){
    const oldPassword=String(data.oldPassword||''),newPassword=String(data.newPassword||'');
    if(newPassword.length<4) return err('Password too short',400);
    if(user.passwordHash!==hashPassword(oldPassword,user.salt)) return err('Current password incorrect',400);
    user.salt=crypto.randomBytes(16).toString('hex'); user.passwordHash=hashPassword(newPassword,user.salt); saveDB(db); return {ok:true};
  }

  return err('Unknown path',404);
});

function createWindow(){
  const win=new BrowserWindow({
    width:1380,height:880,minWidth:900,minHeight:620,show:false,autoHideMenuBar:true,backgroundColor:'#f6f8fc',
    webPreferences:{preload:path.join(__dirname,'preload.js'),nodeIntegration:false,contextIsolation:true,sandbox:false}
  });
  Menu.setApplicationMenu(null);
  win.once('ready-to-show',()=>win.show());
  win.loadFile(path.join(__dirname,'dist','index.html'));
}

app.whenReady().then(()=>{
  dbPath=path.join(app.getPath('userData'),'loan-booking-exact-v1-db.json');
  createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
