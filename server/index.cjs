const http=require('node:http');const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const R=require('../public/shared.js');const {reduce,validateProject}=require('./model.cjs');
async function createServer({port=9860,dataDir=path.join(__dirname,'../data'),host='127.0.0.1'}={}){
 fs.mkdirSync(dataDir,{recursive:true});const file=path.join(dataDir,'autosave.json');let state=R.initial(),warning='';
 for(const p of [file,file+'.bak']){if(!fs.existsSync(p))continue;try{const raw=JSON.parse(fs.readFileSync(p,'utf8'));state=validateProject(raw);state.timer.value=R.clock(raw);state.program.layers.forEach(l=>l.enabled=false);warning=p.endsWith('.bak')?'主工程损坏，已从备份恢复。':'';break;}catch(e){warning='自动保存文件无法读取，已使用演示工程；原文件已保留。';}}
 const token=crypto.randomBytes(32).toString('hex');const clients=new Map();let saveTask,closed=false,saveError='',dirty=false;
 const view=()=>({...state,serverNow:Date.now(),warning:saveError||warning,clients:[...clients.values()].filter(x=>x==='program').length});
 function persist(){if(!dirty)return;const previousError=saveError;try{const snapshot=R.clone(state);snapshot.timer.value=R.clock(state);snapshot.timer.running=false;fs.writeFileSync(file+'.tmp',JSON.stringify(snapshot,null,2));if(fs.existsSync(file))fs.copyFileSync(file,file+'.bak');fs.renameSync(file+'.tmp',file);dirty=false;saveError='';}catch(e){saveError='保存失败：'+e.message;}if(saveError!==previousError)broadcast();}
 function broadcast(){const payload=`data: ${JSON.stringify(view())}\n\n`;for(const res of clients.keys())res.write(payload);}
 function change(a){const next=reduce(state,a);state=next;dirty=true;clearTimeout(saveTask);saveTask=setTimeout(persist,350);broadcast();return view();}
 function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
 const publicDir=path.join(__dirname,'../public');const server=http.createServer(async(req,res)=>{
  const origin=`http://${req.headers.host}`;let url;try{url=new URL(req.url,origin);}catch{return json(res,400,{error:'无效 URL'});}
  if(!/^((127\.0\.0\.1)|(localhost)):\d+$/.test(req.headers.host||''))return json(res,403,{error:'仅接受本机连接'});
  if(req.headers.origin&&req.headers.origin!==origin)return json(res,403,{error:'来源不允许'});
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'");
  if(req.method==='GET'&&url.pathname==='/api/bootstrap')return json(res,200,{token,state:view(),dataDir});
  if(req.method==='GET'&&url.pathname==='/api/state')return json(res,200,view());
  if(req.method==='GET'&&url.pathname==='/api/project'){const snapshot=R.clone(state);snapshot.timer.value=R.clock(state);snapshot.timer.running=false;return json(res,200,snapshot);}
  if(req.method==='GET'&&url.pathname==='/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});clients.set(res,url.searchParams.get('channel')||'control');res.write(`data: ${JSON.stringify(view())}\n\n`);req.on('close',()=>clients.delete(res));return;}
  if(req.method==='POST'&&['/api/action','/api/timing'].includes(url.pathname)){
   if(req.headers['x-apex-token']!==token)return json(res,403,{error:'控制令牌无效，请刷新控制台'});
   if(!String(req.headers['content-type']).startsWith('application/json'))return json(res,415,{error:'请使用 application/json'});
   let size=0,parts=[];try{for await(const chunk of req){size+=chunk.length;if(size>30*1024*1024){json(res,413,{error:'工程超过 30 MB'});req.resume();return;}parts.push(chunk);}const data=JSON.parse(Buffer.concat(parts).toString('utf8'));if(data.expectedRevision!==undefined&&data.expectedRevision!==state.revision)return json(res,409,{error:'工程已被更新，请刷新后重试'});const a=url.pathname==='/api/timing'?{type:'feed',rows:data.rows,source:data.source}:data;return json(res,200,change(a));}catch(e){return json(res,400,{error:e.message});}
  }
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'不支持的方法'});
  const routes={'/':'index.html','/output':'output.html','/preview':'output.html'};const name=routes[url.pathname]||url.pathname.slice(1);if(!/^[a-zA-Z0-9_./-]+$/.test(name))return json(res,404,{error:'页面不存在'});const resolved=path.resolve(publicDir,name);if(!resolved.startsWith(publicDir+path.sep))return json(res,404,{error:'页面不存在'});
  try{const body=fs.readFileSync(resolved);const ext=path.extname(resolved);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'})[ext]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);}catch{return json(res,404,{error:'页面不存在'});}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,host,resolve);});
 const tick=setInterval(()=>{if(state.demo)change({type:'tick'});},2500);
 const heartbeat=setInterval(()=>{for(const res of clients.keys())res.write(': heartbeat\n\n');},10000);
 const expiry=setInterval(()=>{let changed=false;const now=Date.now();for(const l of state.program.layers)if(l.enabled&&l.expiresAt&&l.expiresAt<=now){l.enabled=false;changed=true;}if(state.timer.running&&state.timer.mode==='down'&&R.clock(state,now)===0){state.timer.running=false;state.timer.value=0;changed=true;}if(changed){state.revision++;dirty=true;persist();broadcast();}},200);
 return {server,port:server.address().port,token,getState:()=>R.clone(state),change,close:async()=>{if(closed)return;closed=true;clearInterval(tick);clearInterval(heartbeat);clearInterval(expiry);clearTimeout(saveTask);dirty=true;persist();for(const c of clients.keys())c.end();await new Promise(resolve=>server.close(resolve));}};
}
if(require.main===module){createServer({port:Number(process.env.PORT)||9860,dataDir:process.env.APEX_DATA_DIR||path.join(__dirname,'../data')}).then(app=>{console.log(`APEX ready: http://127.0.0.1:${app.port}`);for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>app.close().then(()=>process.exit()));}).catch(e=>{console.error(e);process.exit(1);});}
module.exports={createServer};
