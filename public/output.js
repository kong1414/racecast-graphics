const stage=document.getElementById('stage'),params=new URLSearchParams(location.search),channel=location.pathname==='/preview'?'preview':'program';let state,offset=0,last=0;
function resize(){const scale=Math.min(innerWidth/1920,innerHeight/1080);stage.style.transform=`scale(${scale})`;stage.style.left=(innerWidth-1920*scale)/2+'px';stage.style.top=(innerHeight-1080*scale)/2+'px';}addEventListener('resize',resize);resize();
if(params.get('background')==='black')document.body.style.background='#05070a';if(params.get('background')==='green')document.body.style.background='#00ff00';
function connect(){const es=new EventSource('/events?channel='+channel);es.onmessage=e=>{state=JSON.parse(e.data);offset=state.serverNow-Date.now();last=Date.now();draw();};es.onerror=()=>{};}
function draw(){if(!state)return;Graphics.draw(stage,state,channel,Date.now()+offset,{only:params.get('layer'),guides:params.has('guides')});}
connect();setInterval(draw,100);
