const fs=require('node:fs');const path=require('node:path');const R=require('../public/shared.js');const {validateProject}=require('../server/model.cjs');
const root=path.resolve(__dirname,'..');const source=path.join(root,'delivery-build','win-unpacked');const destination=path.join(root,'交付包','RaceCast 赛车字幕播出系统_拷贝此文件夹');
if(!fs.existsSync(path.join(source,'resources','app.asar')))throw Error('请先构建完整文件夹运行包');
if(fs.existsSync(destination))throw Error('交付文件夹已经存在，为保护其数据，不自动覆盖');
function copyTree(from,to){fs.mkdirSync(to,{recursive:true});for(const item of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,item.name),b=path.join(to,item.name);if(item.isDirectory())copyTree(a,b);else fs.copyFileSync(a,b,fs.constants.COPYFILE_EXCL);}}
copyTree(source,destination);
fs.writeFileSync(path.join(destination,'portable-mode.json'),JSON.stringify({portable:true,description:'Keep this file to store desktop profile and race projects beside the executable.'},null,2));
fs.copyFileSync(path.join(root,'docs','文件夹版说明.txt'),path.join(destination,'先读我_如何运行和拷贝.txt'));
copyTree(path.join(root,'examples'),path.join(destination,'示例与模板'));
const documents=path.join(destination,'使用文档');fs.mkdirSync(documents,{recursive:true});
for(const name of ['API.md','功能分析.md','USER_GUIDE.md'])fs.copyFileSync(path.join(root,'docs',name),path.join(documents,name));
const project=validateProject(R.initial()),dataSource='内置演示工程';
const projectDir=path.join(destination,'用户数据','projects'),backupDir=path.join(destination,'工程备份');fs.mkdirSync(projectDir,{recursive:true});fs.mkdirSync(backupDir,{recursive:true});
const json=JSON.stringify(project,null,2);fs.writeFileSync(path.join(projectDir,'autosave.json'),json);fs.writeFileSync(path.join(backupDir,'内置演示工程.racecast.json'),json);
fs.writeFileSync(path.join(documents,'打包信息.json'),JSON.stringify({createdAt:new Date().toISOString(),platform:'Windows x64',version:'1.0.0-folder',sourceProject:dataSource,projectName:project.projectName},null,2));
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(dir,x.name)):[path.join(dir,x.name)]);}
const all=files(destination);console.log(JSON.stringify({folder:destination,exe:path.join(destination,'RaceCast 赛车字幕播出系统.exe'),fileCount:all.length,bytes:all.reduce((n,p)=>n+fs.statSync(p).size,0),projectSource:dataSource},null,2));
