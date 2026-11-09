const {app,BrowserWindow,dialog,shell,Menu}=require('electron');const path=require('node:path');const fs=require('node:fs');const {createServer}=require('../server/index.cjs');let service,main;
// A folder distribution opts into carrying both project data and the desktop profile.
const distributionDir=process.env.PORTABLE_EXECUTABLE_DIR||path.dirname(process.execPath);
if(app.isPackaged&&fs.existsSync(path.join(distributionDir,'portable-mode.json'))){
 try{const portableData=path.join(distributionDir,'用户数据');fs.mkdirSync(portableData,{recursive:true});app.setPath('userData',portableData);}
 catch(e){dialog.showErrorBox('无法写入便携数据目录','请将整个软件文件夹复制到可写的位置后再运行。\n'+e.message);app.exit(1);}
}
if(!app.requestSingleInstanceLock()){app.quit();}else{
 app.on('second-instance',()=>{if(main){if(main.isMinimized())main.restore();main.focus();}});
 app.whenReady().then(async()=>{
  try{let port=9860;const dataDir=process.env.RACECAST_DATA_DIR||path.join(app.getPath('userData'),'projects');for(let i=0;i<10;i++){try{service=await createServer({port:port+i,dataDir});break;}catch(e){if(e.code!=='EADDRINUSE')throw e;}}if(!service)throw Error('9860–9869 端口全部被占用');
   const origin=`http://127.0.0.1:${service.port}`;
   main=new BrowserWindow({width:1680,height:1060,minWidth:1180,minHeight:760,backgroundColor:'#0b0f15',title:'RaceCast 赛车字幕播出系统',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});Menu.setApplicationMenu(null);
   main.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith(origin+'/output')||url.startsWith(origin+'/preview')){const win=new BrowserWindow({width:1280,height:760,title:'RaceCast · HTML5 输出',backgroundColor:'#11151d',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});win.loadURL(url);win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',(e,to)=>{if(!to.startsWith(origin+'/'))e.preventDefault();});}return {action:'deny'};});
   main.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith(origin+'/'))e.preventDefault();});
   await main.loadURL(origin);main.on('closed',()=>main=null);
  }catch(e){dialog.showErrorBox('RaceCast 启动失败',e.message);app.quit();}
 });
 app.on('window-all-closed',()=>app.quit());let quitting=false;app.on('before-quit',e=>{if(service&&!quitting){e.preventDefault();quitting=true;service.close().finally(()=>app.quit());}});
}
