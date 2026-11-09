(function(root, factory) { const api = factory(); if(typeof module === 'object') module.exports=api; else root.Race=api; })(typeof globalThis!=='undefined'?globalThis:this, function(){
  const templates = [
    ['tower','实时排行榜','TIMING TOWER','timing',72,180,420], ['driver','车手介绍','DRIVER PROFILE','lower',540,825,1240],
    ['battle','双车对比','HEAD TO HEAD','lower',540,810,1240], ['pit','进站计时','PIT LANE','right',1420,190,420],
    ['grid','发车格','STARTING GRID','full',480,200,1320], ['results','最终成绩','CLASSIFICATION','full',480,200,1320],
    ['top3','前三名','TOP THREE','lower',540,820,1240], ['fastest','最快圈','FASTEST LAP','lower',540,860,1240],
    ['flag','赛道旗号','RACE CONTROL','flag',600,135,740], ['penalty','处罚 / 调查','STEWARDS','lower',540,850,1240],
    ['track','赛道信息','CIRCUIT INFO','full',530,220,1180], ['weather','天气信息','WEATHER','lower',540,800,1240],
    ['entries','车手名单','ENTRY LIST','full',480,200,1320], ['team','车队介绍','TEAM PROFILE','lower',540,800,1240],
    ['clock','比赛时钟','SESSION CLOCK','clock',830,65,300], ['topbar','比赛顶栏','SESSION STRIP','top',72,65,680],
    ['logo','赛事角标','EVENT BUG','logo',1590,65,250], ['corner','直播角标','LIVE BUG','corner',1590,128,250],
    ['replay','回放','REPLAY','badge',1510,200,330], ['startReplay','起步回放','STARTING REPLAY','badge',1400,200,440],
    ['formation','暖胎圈','FORMATION LAP','badge',1390,200,450], ['highlights','精彩集锦','HIGHLIGHTS','badge',1420,200,420],
    ['subtitle','自定义字幕','LOWER THIRD','lower',540,850,1240], ['ticker','滚动公告','NEWS TICKER','ticker',72,1010,1776],
    ['sectors','分段圈速','SECTOR TIMES','lower',540,810,1240], ['stint','轮胎 / 驾驶时长','STINT INFO','lower',540,820,1240],
    ['championship','积分榜','CHAMPIONSHIP','full',480,200,1320], ['schedule','赛事日程','WEEKEND SCHEDULE','full',530,220,1180]
  ].map(([id,name,en,group,x,y,w])=>({id,name,en,group,x,y,w}));
  const flags={GREEN:['绿旗 · 正常比赛','#37d6a1','GREEN FLAG'],YELLOW:['黄旗 · 注意危险','#ffc857','YELLOW FLAG'],DOUBLE_YELLOW:['双黄旗 · 准备停车','#ffc857','DOUBLE YELLOW'],RED:['红旗 · 比赛暂停','#ff4f66','RED FLAG'],SC:['安全车','#ffc857','SAFETY CAR'],VSC:['虚拟安全车','#ffc857','VIRTUAL SAFETY CAR'],FCY:['全场黄旗','#ffc857','FULL COURSE YELLOW'],BLUE:['蓝旗 · 注意后车','#4198ff','BLUE FLAG'],WHITE:['白旗 · 前方慢车','#e9edf2','WHITE FLAG'],CHEQUERED:['方格旗 · 比赛结束','#e9edf2','CHEQUERED FLAG']};
  const statuses=['RUN','PIT','OUT','DNF','DNS','DSQ'];
  const clone=v=>JSON.parse(JSON.stringify(v));
  const lap=ms=>!Number.isFinite(+ms)||+ms<=0?'—':`${Math.floor(ms/60000)}:${String(Math.floor(ms%60000/1000)).padStart(2,'0')}.${String(Math.floor(ms%1000)).padStart(3,'0')}`;
  const parseLap=v=>{if(v===''||v==null||v==='—')return 0; if(typeof v==='number')return v; const p=String(v).trim().split(':'); return Math.round((p.length===2?(Number(p[0])*60+Number(p[1])):Number(p[0]))*1000);};
  const duration=ms=>{const s=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  function session(s){return s.sessions.find(x=>x.id===s.activeSessionId)||s.sessions[0];}
  function clock(s,now=Date.now()){const t=s.timer; const elapsed=t.running?Math.max(0,now-t.anchor):0; return Math.max(0,t.value+(t.mode==='down'?-elapsed:elapsed));}
  function ranked(s,category='ALL',mode){const ss=session(s), rows=s.drivers.map(d=>({...d,...(ss.timing[d.id]||{})})); const type=mode||ss.type;
    rows.sort((a,b)=>{if(type==='grid')return (a.grid||999)-(b.grid||999);if(type==='points')return (b.points||0)-(a.points||0);if(type==='practice'||type==='qualifying')return (a.bestMs||Infinity)-(b.bestMs||Infinity); return (a.position||999)-(b.position||999);});
    return rows.map((d,i)=>({...d,overall:i+1})).filter(d=>category==='ALL'||!category||d.category===category).map((d,i)=>({...d,rank:i+1}));}
  function scene(){return {theme:{accent:'#46e2ce',bg:'#101723',text:'#f4f7fa',opacity:94,nameMode:'full',fontSize:26},layers:templates.map(t=>({id:t.id,enabled:['tower','topbar','clock','logo'].includes(t.id),x:t.x,y:t.y,w:t.w,scale:1,title:'',text:'',driverId:'d1',secondId:'d2',category:'ALL',page:1,rows:t.id==='tower'?12:8,showPhoto:true,showNation:true,showPitTime:true,showTeam:true,metric:'gap',autoPage:false,pageSeconds:8,hold:0}))};}
  function initial(){const teams=[['Demo Racing A','#46e2ce'],['Demo Racing B','#ff6758'],['Demo Racing C','#a58bff'],['Demo Racing D','#469cff'],['Demo Racing E','#fcba53'],['Demo Racing F','#ef76bb']];const names=[['Demo Driver 01','DEMO DRIVER 01','D01','GBR'],['Demo Driver 02','DEMO DRIVER 02','D02','ITA'],['Demo Driver 03','DEMO DRIVER 03','D03','FRA'],['Demo Driver 04','DEMO DRIVER 04','D04','DEU'],['Demo Driver 05','DEMO DRIVER 05','D05','NLD'],['Demo Driver 06','DEMO DRIVER 06','D06','BEL'],['Demo Driver 07','DEMO DRIVER 07','D07','ESP'],['Demo Driver 08','DEMO DRIVER 08','D08','PRT'],['Demo Driver 09','DEMO DRIVER 09','D09','AUT'],['Demo Driver 10','DEMO DRIVER 10','D10','CHE'],['Demo Driver 11','DEMO DRIVER 11','D11','DNK'],['Demo Driver 12','DEMO DRIVER 12','D12','SWE']];
    const drivers=names.map((n,i)=>({id:`d${i+1}`,number:String([7,22,51,88,16,63,33,12,90,18,66,27][i]),name:n[0],english:n[1],short:n[2],nation:n[3],team:teams[Math.floor(i/2)][0],color:teams[Math.floor(i/2)][1],category:i<8?'PRO':'AM',car:'GT3',photo:'',points:[128,116,103,99,84,76,63,58,51,46,38,22][i],grid:i+1}));
    const timing=Object.fromEntries(drivers.map((d,i)=>[d.id,{position:i+1,laps:18,bestMs:104326+i*173,lastMs:105410+i*214,gap:i?`+${(i*1.864).toFixed(3)}`:'LEADER',interval:i?'+1.864':'—',status:'RUN',s1:32100+i*30,s2:38700+i*50,s3:33526+i*93,pitCount:0,pitEnteredAt:0,pitElapsed:0,tyre:i%3===0?'HARD':'MEDIUM',stintStartedAt:0,penalty:''}]));
    const pv=scene();return {schemaVersion:1,revision:0,projectName:'GT 国际耐力挑战赛 · 银石站演示',event:{name:'GT INTERNATIONAL CHALLENGE',subtitle:'国际耐力挑战赛 · 银石站',round:'ROUND 04',circuit:'银石赛道',location:'SILVERSTONE · UNITED KINGDOM',length:'5.891 km',turns:'18',air:'19',track:'24',humidity:'68',wind:'10 km/h SW',weather:'多云 / CLOUDY',logo:'',notice:'虚构演示数据 · WELCOME TO THE GT INTERNATIONAL CHALLENGE'},drivers,sessions:[{id:'practice',name:'自由练习 1',type:'practice',laps:0,totalLaps:0,flag:'GREEN',timing:clone(timing),scheduled:'09:00'},{id:'qualifying',name:'排位赛',type:'qualifying',laps:0,totalLaps:0,flag:'GREEN',timing:clone(timing),scheduled:'11:30'},{id:'race',name:'正赛',type:'race',laps:18,totalLaps:56,flag:'GREEN',timing:clone(timing),scheduled:'14:00'}],activeSessionId:'race',preview:pv,program:{...clone(pv),layers:pv.layers.map(l=>({...l,enabled:false}))},previousProgram:null,presets:[],timer:{mode:'down',value:3600000,running:false,anchor:0},outputEnabled:true,demo:false,dataSource:'示例数据 · 未接入官方计时',lastTimingAt:0,logs:[],resultsConfirmed:false};}
  return {templates,flags,statuses,clone,lap,parseLap,duration,session,clock,ranked,scene,initial};
});
