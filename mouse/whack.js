/* Event-based timing keeps expiry, pause and scoring independent of frame rate. */
(function(root){
const pokemon=[
 {name:'皮卡丘',asset:'pikachu',points:10},
 {name:'小火龙',asset:'charmander',points:20},
 {name:'耿鬼',asset:'gengar',points:30}
];
class WhackTraining {
 constructor(random=Math.random){this.random=random;this.variant='normal';this.status='idle';this.duration=120;this.elapsed=0;this.score=0;this.correct=0;this.mistakes=0;this.missed=0;this.level=1;this.targets=Array(9).fill(null);this.sequence=0;this.lastHole=-1;this.recovery=0;this.bombHits=0;}
 static get pokemon(){return pokemon;}
 get difficulty(){const hard=this.variant==='hard';return {lifetime:Math.max(.85,(hard?1.9:2.3)-(this.level-1)*.2),interval:Math.max(.48,(hard?1:1.25)-(this.level-1)*.11),capacity:(this.level>=6?3:this.level>=3?2:1)+(hard?1:0)};}
 start(variant=this.variant){this.variant=variant==='hard'?'hard':'normal';this.status='running';this.elapsed=0;this.score=0;this.correct=0;this.mistakes=0;this.missed=0;this.level=1;this.recovery=0;this.bombHits=0;this.targets=Array(this.variant==='hard'?12:9).fill(null);this.lastHole=-1;this.spawn();this.nextSpawn=this.difficulty.interval;}
 spawn(){if(this.targets.filter(Boolean).length>=this.difficulty.capacity)return;let empty=this.targets.flatMap((t,i)=>t?[]:[i]);if(empty.length>1)empty=empty.filter(i=>i!==this.lastHole);const hole=empty[Math.floor(this.random()*empty.length)];let roll=this.random();const bomb=this.variant==='hard'&&roll>=.78;if(this.variant==='hard')roll/=.78;const kind=bomb?-1:roll<.5?0:roll<.82?1:2;this.targets[hole]={id:++this.sequence,kind,bomb,created:this.elapsed,expires:this.elapsed+this.difficulty.lifetime};this.lastHole=hole;}
 tick(seconds){if(this.status!=='running'||!Number.isFinite(seconds)||seconds<=0)return;if(this.recovery>0){const wait=Math.min(this.recovery,seconds);this.recovery=Math.max(0,this.recovery-wait);seconds-=wait;if(seconds<=0)return;}const end=Math.min(this.duration,this.elapsed+seconds);while(this.elapsed<end){const expiry=Math.min(...this.targets.filter(Boolean).map(t=>t.expires),Infinity);this.elapsed=Math.min(end,this.nextSpawn,expiry);for(let i=0;i<this.targets.length;i++)if(this.targets[i]&&this.targets[i].expires<=this.elapsed){if(!this.targets[i].bomb)this.missed++;this.targets[i]=null;}if(this.elapsed>=this.duration){this.status='finished';this.targets.fill(null);break;}if(this.nextSpawn<=this.elapsed){this.spawn();this.nextSpawn=this.elapsed+this.difficulty.interval;}}}
 hit(i){if(this.status!=='running'||this.recovery>0)return {type:'inactive'};const target=this.targets[i];if(!target){this.mistakes++;return {type:'miss'};}this.targets[i]=null;if(target.bomb){this.score-=20;this.bombHits++;this.recovery=3;return {type:'bomb'};}const p=pokemon[target.kind];this.score+=p.points;this.correct++;const old=this.level;this.level=Math.max(old,Math.min(8,1+Math.floor(this.score/80)));return {type:'hit',pokemon:p,levelUp:this.level>old};}
 pause(){if(this.status==='running')this.status='paused';else if(this.status==='paused')this.status='running';}
 result(){return {mode:'whack',variant:this.variant,bombHits:this.bombHits,correct:this.correct,mistakes:this.mistakes,missed:this.missed,score:this.score,level:this.level,elapsed:this.elapsed,average:this.correct?this.elapsed/this.correct:null};}
}
if(typeof module!=='undefined'&&module.exports)module.exports=WhackTraining;else root.WhackTraining=WhackTraining;
})(globalThis);
