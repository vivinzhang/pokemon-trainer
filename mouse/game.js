'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const game=new Training(),whack=new WhackTraining(),soundtrack=new TrainingAudio();
const boardNames={standard:'标准六宫',irregular:'不规则六宫'};
const names={find:'寻找宝可梦',energy:'送出数字能量',challenge:'训练家挑战',whack:'宝可梦打地鼠'};
const titles={find:'找到藏在格子里的皮卡丘',energy:'把数字能量送给皮卡丘',challenge:'训练家，来一场速度挑战吧',whack:'宝可梦出没！快来点一点'};
let mode='energy',sound=true,last=performance.now(),storageOK=true,history=[];
try{const data=JSON.parse(localStorage.getItem('pokemon-mouse-v1')||'[]');if(Array.isArray(data))history=data.filter(x=>x&&names[x.mode]&&Number.isFinite(x.correct)&&Number.isFinite(x.mistakes)&&Number.isFinite(x.elapsed)&&typeof x.date==='string').slice(0,30);}catch{storageOK=false;}
const cells=[],numberButtons=[],holes=[];
const current=()=>mode==='whack'?whack:game;
const isLive=()=>['running','paused'].includes(current().status);
for(let i=0;i<6;i++){const c=document.createElement('span');c.textContent=i+1;$('.column-labels').append(c);$('.row-labels').append(c.cloneNode(true));}
for(let i=0;i<36;i++){const b=document.createElement('button');b.className='cell';b.type='button';b.dataset.index=i;b.onclick=()=>{syncClock();handle(game.select(i));};$('#board').append(b);cells.push(b);}
for(let n=1;n<=6;n++){const b=document.createElement('button');b.className='number';b.textContent=n;b.type='button';b.dataset.number=n;b.setAttribute('aria-label',`填入数字 ${n}`);b.onclick=()=>{syncClock();handle(game.input(n));};$('#keypad').append(b);numberButtons.push(b);}
for(let i=0;i<12;i++){
 const b=document.createElement('button');b.className='hole';b.type='button';b.innerHTML='<span class="hole-shadow" aria-hidden="true"></span><span class="critter" hidden><img alt="" draggable="false"><span class="critter-points" aria-hidden="true"></span></span><span class="life-track" aria-hidden="true"><span></span></span>';
 b.onclick=()=>{
  syncClock();const r=whack.hit(i);if(r.type==='inactive')return;
  if(r.type==='hit'){beep();const tag=document.createElement('span');tag.className='hit-reward';tag.textContent='+'+r.pokemon.points;tag.setAttribute('aria-hidden','true');b.append(tag);setTimeout(()=>tag.remove(),600);feedback(r.levelUp?`升级啦！现在是 ${whack.level} 级，宝可梦更灵活了！`:`点中${r.pokemon.name}，+${r.pokemon.points} 分！`);$('#cheer').textContent=r.levelUp?'小手越来越灵活啦！':'瞄准再单击，保持自己的节奏！';}
  else if(r.type==='bomb'){soundtrack.bomb();feedback('碰到炸弹，扣 20 分！等待 3 秒，让烟雾散去。',true);}else feedback('这只已经溜走啦，瞄准出现的宝可梦再点哦。',true);draw();
 };$('#whack-field').append(b);holes.push(b);
}
for(const p of WhackTraining.pokemon){const card=document.createElement('div');card.className='score-card';card.innerHTML=`<img src="assets/${p.asset}.png" alt="${p.name}"><strong>${p.name}</strong><span>+${p.points} 分</span>`;$('#whack-legend').append(card);}
const bombCard=document.createElement('div');bombCard.id='bomb-card';bombCard.className='score-card bomb-card';bombCard.innerHTML='<img src="assets/bomb.svg" alt="炸弹"><strong>炸弹</strong><span>−20 分</span>';$('#whack-legend').append(bombCard);
function time(n){return `${Math.floor(n/60).toString().padStart(2,'0')}:${Math.floor(n%60).toString().padStart(2,'0')}`;}
function beep(){soundtrack.hit();}
function feedback(text,error=false){$('#feedback').textContent=text;$('#feedback').classList.toggle('error',error);}
function instruction(html){if($('#instruction').innerHTML!==html)$('#instruction').innerHTML=html;}
function drawSudoku(){
 const active=game.status==='running',live=active||game.status==='paused';
 cells.forEach((b,i)=>{
  const region=game.regions[i];b.dataset.region=region;b.style.setProperty('--region-color',['#f0f6e9','#fffdf4','#eaf4ed','#f7f2e6','#eef3f7','#f6edf0'][region]);b.style.borderRight=i%6===5?'0':game.regions[i+1]!==region?'3px solid #42745d':'1px solid #d2dfd2';b.style.borderBottom=i>=30?'0':game.regions[i+6]!==region?'3px solid #42745d':'1px solid #d2dfd2';
  const target=i===game.target&&live,selected=i===game.selected&&live;b.className='cell'+(game.given[i]?' given':'')+(game.values[i]&&!game.given[i]?' done':'')+(target&&mode!=='challenge'?' target':'')+(selected?' selected':'');b.replaceChildren();
  if(target&&mode==='find'){const img=document.createElement('img');img.src='assets/pikachu.png';img.alt='皮卡丘';b.append(img);}else b.textContent=game.values[i]||'';
  b.setAttribute('aria-label',`第${Math.floor(i/6)+1}行第${i%6+1}列${game.given[i]?'，已给数字':game.values[i]?'，已填入':'，空格'}${game.values[i]||''}${target&&mode!=='challenge'?'，目标格':''}`);b.setAttribute('aria-pressed',String(selected));b.disabled=!active;
 });numberButtons.forEach(b=>b.disabled=!active||mode==='find');
 if(live){const r=Math.floor(game.target/6)+1,c=game.target%6+1;$('#step').textContent=game.status==='paused'?'已暂停':mode==='find'?'单击目标格':game.selected===game.target?'第 2 步 · 填入数字':'第 1 步 · 选中格子';$('#instruction').innerHTML=game.status==='paused'?'休息一下，皮卡丘等你回来。':mode==='find'?'找到皮卡丘，<strong>单击</strong>它所在的格子！':`在第 <strong>${r}</strong> 行、第 <strong>${c}</strong> 列填入 <strong>${game.number}</strong>`;}
}
function drawWhack(){
 const active=whack.status==='running',live=isLive(),hard=whack.variant==='hard',recovering=live&&whack.recovery>0;
 $('#whack-field').classList.toggle('hard',hard);$('#whack-field').setAttribute('aria-label',hard?'宝可梦和炸弹出没的十二个洞口':'宝可梦出没的九个洞口');$('#bomb-count-wrap').hidden=!hard;$('#bomb-card').hidden=!hard;$('#whack-legend').classList.toggle('hard',hard);$('#whack-rule').textContent=hard?'小心炸弹！点中 −20 分':'瞄准宝可梦，单击得分';
 holes.forEach((b,i)=>{
  b.hidden=i>=whack.targets.length;const t=live?whack.targets[i]:null;b.querySelector('.critter').hidden=!t;b.disabled=!active||recovering;b.classList.toggle('occupied',Boolean(t));b.classList.toggle('bomb',Boolean(t&&t.bomb));
  if(t){const p=t.bomb?{name:'炸弹',asset:'bomb',points:-20}:WhackTraining.pokemon[t.kind];if(b.dataset.target!==String(t.id)){b.dataset.target=t.id;b.querySelector('img').src='assets/'+p.asset+(t.bomb?'.svg':'.png');b.querySelector('.critter-points').textContent=(t.bomb?'−':'+')+Math.abs(p.points);}b.setAttribute('aria-label','第 '+(i+1)+' 个洞口，'+p.name+'，'+(t.bomb?'扣 20 分':p.points+' 分'));b.style.setProperty('--life',Math.max(0,(t.expires-whack.elapsed)/(t.expires-t.created))*100+'%');}
  else{b.dataset.target='';b.setAttribute('aria-label','第 '+(i+1)+' 个洞口，暂时没有宝可梦');}
 });
 $('#whack-level').textContent=whack.level;$('#whack-hits').textContent=whack.correct;$('#whack-missed').textContent=whack.missed;$('#whack-bombs').textContent=whack.bombHits;
 $('#smoke-overlay').hidden=!recovering;$('#whack-map').classList.toggle('smoky',recovering);$('#whack-map').classList.toggle('paused',!active);$('#whack-map').style.setProperty('--smoke-opacity',String(.6+.4*whack.recovery/3));
 const count=active?String(Math.ceil(whack.recovery)):'暂停';if($('#smoke-count').textContent!==count)$('#smoke-count').textContent=count;
 if(live){$('#step').textContent=!active?'已暂停':recovering?'烟雾恢复中 · 计时暂停':'第 '+whack.level+' 级 · 同时最多 '+whack.difficulty.capacity+' 个';instruction(!active?'休息一下，宝可梦也会等你回来。':recovering?'烟雾散去中，<strong>'+Math.ceil(whack.recovery)+'</strong> 秒后继续！':hard?'点击宝可梦得分，<strong>避开炸弹</strong>！':'瞄准出现的宝可梦，<strong>单击</strong>收集能量！');}
}
function draw(){
 const hunt=mode==='whack',s=current(),live=isLive();
 $('.board-types').hidden=hunt;$('.board-wrap').hidden=hunt;$('.board-bottom').hidden=hunt;$('#whack-area').hidden=!hunt;$('#keypad').hidden=hunt;$('#whack-legend').hidden=!hunt;$('.number-heading label').hidden=hunt;
 $('#station-title').textContent=hunt?'宝可梦得分图鉴':'数字能量站';$('#board-tag').textContent=hunt?'瞄准 · 单击':'6 × 6';$('#mouse-only').disabled=live;
 $('.stats>div:first-child small').textContent=hunt?'收集得分':'正确完成';$('.stats>div:nth-child(2) small').textContent=hunt?'点空次数':'点错次数';$('#correct').innerHTML=`${hunt?whack.score:s.correct}<em> ${hunt?'分':'题'}</em>`;$('#mistakes').innerHTML=`${s.mistakes}<em> 次</em>`;
 $('#start').innerHTML=live?'结束本局 <span>■</span>':s.status==='finished'?'再练一局 <span>▶</span>':'开始练习 <span>▶</span>';$('#pause').disabled=!live;$('#pause').textContent=s.status==='paused'?'继续':'暂停';$('#mode-title').textContent=titles[mode];if(hunt)drawWhack();else drawSudoku();renderClock();soundtrack.setPlaying(hunt&&s.status==='running');$('#music').dataset.playing=String(Boolean(soundtrack.context&&soundtrack.context.state==='running'&&soundtrack.playing&&soundtrack.music));
}
function renderClock(){
 const s=current(),hunt=mode==='whack',timed=hunt||mode==='challenge';$('#timer').textContent=time(timed?Math.max(0,Math.ceil(120-s.elapsed)):s.elapsed);$('.stats>div:last-child small').textContent=timed?'剩余时间':'练习时间';
 $('#progress').style.width=`${hunt?(s.level===8?100:Math.max(0,Math.min(80,s.score-(s.level-1)*80))/80*100):timed?s.elapsed/120*100:Math.min(100,s.correct/12*100)}%`;$('#progress-label').textContent=hunt?(s.level===8?'最高等级！':'下一等级'):s.status==='idle'?'准备出发':timed?'两分钟挑战':'能量收集';$('#progress-count').textContent=hunt?(s.level===8?'Lv.8':`${s.score} / ${s.level*80} 分`):timed?`${s.correct} 题`:`${s.correct} / 12`;
}
function syncClock(){const now=performance.now(),s=current();s.tick((now-last)/1000);last=now;if(s.status==='finished'&&!s.saved)finish();}
function handle(r){
 if(r==='inactive')return;if(r==='correct'||r==='finished'){beep();feedback(['太棒了！继续找下一个格子。','点得真准！皮卡丘收到能量啦。','做得好，保持自己的节奏！'][game.correct%3]);$('#cheer').textContent=game.correct>=6?'越来越熟练啦，继续加油！':'点得真准！我收到你的能量啦。';if(r==='finished'){if(!game.saved)finish();return;}}
 else if(r==='wrong-cell')feedback('再看一下目标位置，慢慢移过去就好。',true);else if(r==='select-first')feedback('先选中任务里的格子，再点数字哦。',true);else if(r==='wrong-number')feedback(`格子选对了！这次要送数字 ${game.number}，再试一次。`,true);else feedback($('#mouse-only').checked?'格子选好了！点击右下方的数字。':'格子选好了！点击数字，或按键盘数字键。');draw();
}
function show(content,action='知道了',callback=null){$('#dialog-content').innerHTML=content;$('#dialog-action').textContent=action;$('#dialog-action').onclick=()=>{$('#dialog').close();if(callback)callback();};if(!$('#dialog').open)$('#dialog').showModal();}
function saveResult(r){history.unshift({...r,date:new Date().toISOString()});history=history.slice(0,30);try{localStorage.setItem('pokemon-mouse-v1',JSON.stringify(history));}catch{storageOK=false;}}
function finish(){
 const s=current();if(s.saved)return;s.status='finished';s.saved=true;const r=s.result();saveResult(r);draw();$('#step').textContent='本局完成';$('#instruction').textContent='辛苦啦！休息一下，再开始下一次冒险。';feedback('每一次练习，都会让小手更灵活。');
 const storage=storageOK?'练习记录已保存在这台电脑的浏览器里。':'当前浏览器无法保存记录，本局仍可正常练习。';
 if(mode==='whack'){show(`<img class="reward" src="assets/${r.level>=4?'gengar':'pikachu'}.png" alt="宝可梦伙伴"><h2>收集了 ${r.score} 分能量！</h2><p>${r.variant==='hard'?'困难模式 · ':'普通模式 · '}到达第 ${r.level} 级，点中了 ${r.correct} 只宝可梦。${r.level===8?'已经到达最高等级，真棒！':'下次再试试，看看能不能更熟练！'}</p><div class="result-grid"><div><strong>${r.score}</strong><small>收集得分</small></div><div><strong>${r.mistakes}</strong><small>点空次数</small></div><div><strong>${r.missed}</strong><small>溜走数量</small></div></div><p class="muted">练习用时 ${time(r.elapsed)} · 误点炸弹 ${r.bombHits||0} 次<br>${storage}</p>`,'再练一局',start);return;}
 const accuracy=r.correct+r.mistakes?Math.round(100*r.correct/(r.correct+r.mistakes)):0;
 show(`<img class="reward" src="assets/${r.correct>=12?'charmander':'pikachu'}.png" alt="宝可梦伙伴"><h2>${r.correct>=12?'获得一枚能量徽章！':'完成一次训练！'}</h2><p>你和皮卡丘一起完成了 ${r.correct} 题。${r.mistakes===0&&r.correct?'全程点得很准，真棒！':'认真练习，就是进步。'}</p><div class="result-grid"><div><strong>${r.correct}</strong><small>正确题数</small></div><div><strong>${r.mistakes}</strong><small>点错次数</small></div><div><strong>${r.average===null?'—':r.average.toFixed(1)+'s'}</strong><small>平均每题</small></div></div><p class="muted">练习用时 ${time(r.elapsed)} · 任务准确率 ${accuracy}%<br>${storage}</p>`,'再练一局',start);
}
function start(){
 soundtrack.unlock();if(mode==='whack'){whack.start();holes.forEach(b=>b.querySelectorAll('.hit-reward').forEach(t=>t.remove()));}else{game.start(mode);game.keyOrder.forEach(n=>$('#keypad').append(numberButtons[n-1]));}
 current().saved=false;last=performance.now();feedback(mode==='whack'?(whack.variant==='hard'?'困难模式：点中炸弹 −20 分，烟雾恢复 3 秒后继续。':'每 80 分升一级，点空和溜走都不扣分。'):mode==='find'?'找到格子里的皮卡丘，单击就好。':'数字位置已经打乱，先点目标格，再找对应数字。');draw();
}
$('#start').onclick=()=>{if(isLive()){syncClock();if(!current().saved)finish();}else start();};
$('#pause').onclick=()=>{soundtrack.unlock();syncClock();if(current().status==='finished')return;current().pause();last=performance.now();draw();};
function resetView(){game.status='idle';game.saved=false;game.values.fill(0);game.given.fill(false);game.correct=0;game.mistakes=0;game.elapsed=0;whack.status='idle';whack.targets.fill(null);whack.score=0;whack.correct=0;whack.mistakes=0;whack.missed=0;whack.elapsed=0;whack.level=1;whack.recovery=0;whack.bombHits=0;whack.saved=false;holes.forEach(b=>b.querySelectorAll('.hit-reward').forEach(t=>t.remove()));$('#step').textContent='准备好了就出发';last=performance.now();}
$$('.mode').forEach(b=>b.onclick=()=>{if(b.dataset.mode===mode)return;mode=b.dataset.mode;resetView();game.mode=mode;$$('.mode').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#instruction').textContent=mode==='whack'?'宝可梦会从洞口探出头，单击它们，收集不同分值的能量！':mode==='find'?'在棋盘上找找皮卡丘，练习移动鼠标和单击。':mode==='challenge'?'两分钟内，看行列提示选格，再填入数字。':'点「开始练习」，和皮卡丘一起收集数字能量！';feedback(mode==='whack'?'两分钟一局 · 得分升级 · 最高 8 级':'每次开局重新打乱数字，本局内数字位置保持不变。');draw();});
document.addEventListener('keydown',e=>{if(mode==='whack'||$('#dialog').open||e.ctrlKey||e.metaKey||e.altKey||e.repeat||game.status!=='running')return;if(/^[1-6]$/.test(e.key)){e.preventDefault();if($('#mouse-only').checked){feedback('现在是鼠标训练：请点击右下角的数字。');return;}syncClock();handle(game.input(Number(e.key)));}});
$$('.board-type').forEach(b=>b.onclick=()=>{if(b.dataset.kind===game.boardKind)return;game.setBoardKind(b.dataset.kind);game.saved=false;$$('.board-type').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#region-note').textContent=game.boardKind==='standard'?'每宫 2 行 × 3 列':'每宫 6 格 · 沿粗线看边界';$('#step').textContent='准备好了就出发';$('#instruction').textContent='已切换到'+boardNames[game.boardKind]+'，点击开始练习。';feedback('每行、每列、每个粗线宫内都是数字 1–6。');draw();});
$('#sound').onclick=()=>{soundtrack.unlock();sound=!sound;soundtrack.setEffects(sound);$('#sound').textContent='♪ 音效：'+(sound?'开':'关');$('#sound').setAttribute('aria-pressed',String(sound));if(sound)beep();};
$('#music').onclick=()=>{soundtrack.unlock();soundtrack.setMusic(!soundtrack.music);$('#music').textContent='♫ 音乐：'+(soundtrack.music?'开':'关');$('#music').setAttribute('aria-pressed',String(soundtrack.music));draw();};
$$('.whack-type').forEach(b=>b.onclick=()=>{if(b.dataset.variant===whack.variant)return;resetView();whack.variant=b.dataset.variant;whack.targets=Array(whack.variant==='hard'?12:9).fill(null);$$('.whack-type').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});$('#instruction').textContent=whack.variant==='hard'?'困难模式：每行 4 个洞，共 3 行，注意分辨宝可梦和炸弹！':'普通模式：九个洞口，瞄准宝可梦，单击得分。';feedback('选好难度后，点击开始练习。');draw();});

function pauseForDialog(){syncClock();if(current().status==='running'){current().pause();draw();}}
$('#help').onclick=()=>{pauseForDialog();show('<h2>训练家，准备出发！</h2><p>① <b>寻找宝可梦：</b>单击皮卡丘所在的格子，完成 12 次。</p><p>② <b>送出数字能量：</b>先选黄色目标格，再点击右下角的数字，完成 12 题。</p><p>③ <b>训练家挑战：</b>按行列坐标找到空格，填入指定数字，挑战 120 秒。</p><p>④ <b>宝可梦打地鼠：</b>普通模式为 3 行 × 3 列；困难模式为 3 行 × 4 列，并混入炸弹。点击炸弹扣 20 分（可为负分），烟雾覆盖地图，3 秒倒计时后恢复。烟雾期间地图和计时冻结，可以暂停。背景音乐与命中音效默认开启，可分别关闭。两分钟内单击冒出的宝可梦。皮卡丘 10 分、小火龙 20 分、耿鬼 30 分。每 80 分升一级，最高 8 级；出现时间逐渐缩短，普通模式 3 级开始最多同时两只，6 级开始最多三只；困难模式每级多一个目标。点空和溜走不扣分。</p><p>前三种训练每次开局都会重新打乱右侧的 1–6，本局内位置保持固定。取消「只练鼠标」可使用键盘数字键。</p><p class="muted">六宫格为 6 行 6 列，使用数字 1–6。标准宫为 2 行 × 3 列，不规则宫为 6 个相连格子。粗线圈出每一宫。切换模式或宫型会重新开始；切换窗口自动暂停。</p>');};
$('#records').onclick=()=>{pauseForDialog();const total=history.filter(r=>r.mode!=='whack').reduce((s,r)=>s+r.correct,0),best=history.filter(r=>r.mode==='whack').reduce((s,r)=>Math.max(s,r.score||0),0);show(`<h2>我的训练家徽章</h2><p>最近 30 局数独操作完成 <b>${total}</b> 题。<br>宝可梦打地鼠最高 <b>${best}</b> 分。</p><div class="badges">${[['pikachu','初出茅庐',12],['charmander','灵巧小手',36],['gengar','操作达人',72]].map(([pic,label,n])=>`<div class="badge ${total<n?'locked':''}"><img src="assets/${pic}.png" alt="${label}"><div>${label}</div><small>${n} 题</small></div>`).join('')}</div><p class="muted">按最近 30 局的数独操作题数点亮徽章</p>${history.length?history.slice(0,5).map(r=>`<div class="history-row"><span>${new Date(r.date).toLocaleDateString('zh-CN')} · ${r.mode==='whack'?names.whack+(r.variant==='hard'?' · 困难':' · 普通'):(r.boardKind?boardNames[r.boardKind]:'旧版九宫')+' · '+names[r.mode]}</span><span>${r.mode==='whack'?`${r.score||0} 分 / ${r.level||1} 级`:`${r.correct} 题 / 点错 ${r.mistakes} 次`}</span></div>`).join(''):'<p>还没有记录，完成第一局就会出现在这里。</p>'}`);};
$('#close-dialog').onclick=()=>$('#dialog').close();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&current().status==='running'){syncClock();if(current().status==='running'){current().pause();draw();feedback('已为你暂停，回来后点击「继续」。');}}last=performance.now();});
setInterval(()=>{if(current().status==='running'){syncClock();if(mode==='whack')draw();else renderClock();}},80);
draw();
