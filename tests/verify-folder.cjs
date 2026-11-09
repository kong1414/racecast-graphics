const {_electron,expect}=require('@playwright/test');
const fs=require('node:fs');const path=require('node:path');
// Launch the actual folder distribution, without an environment data-path override.
(async()=>{
 const folder=path.resolve(process.argv[2]);let desktop;
 const env={...process.env};delete env.APEX_DATA_DIR;delete env.PORTABLE_EXECUTABLE_DIR;
 try{
  desktop=await _electron.launch({executablePath:path.join(folder,'APEX赛车字幕.exe'),env,timeout:60000});
  const page=await desktop.firstWindow();await expect(page.locator('#connection')).toContainText('已连接');
  await page.locator('[data-tab="settings"]').click();
  await expect(page.locator('#dataPath')).toContainText(path.join(folder,'用户数据','projects'));
  const boot=await page.evaluate(async()=>await(await fetch('/api/bootstrap')).json());
  if(path.resolve(boot.dataDir)!==path.join(folder,'用户数据','projects'))throw Error('便携数据路径错误');
  await expect(page.locator('#projectName')).toHaveValue(boot.state.projectName);
  console.log(JSON.stringify({exe:path.join(folder,'APEX赛车字幕.exe'),dataDir:boot.dataDir,projectName:boot.state.projectName,drivers:boot.state.drivers.length,result:'Folder EXE and adjacent project storage verified.'}));
 }finally{if(desktop)await desktop.close();}
 const saved=path.join(folder,'用户数据','projects','autosave.json');
 if(!fs.existsSync(saved))throw Error('退出后缺少本地自动保存');
 JSON.parse(fs.readFileSync(saved,'utf8'));
})().catch(e=>{console.error(e);process.exit(1);});
