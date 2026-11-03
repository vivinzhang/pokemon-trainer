/* Pure training state, shared by the browser and the Node tests. */
(function(root){
const STANDARD=[0,0,0,1,1,1,0,0,0,1,1,1,2,2,2,3,3,3,2,2,2,3,3,3,4,4,4,5,5,5,4,4,4,5,5,5];
const BASE=[1,2,3,4,5,6,4,5,6,1,2,3,2,3,4,5,6,1,5,6,1,2,3,4,3,4,5,6,1,2,6,1,2,3,4,5];
const JIGSAWS=[[1,0,0,0,0,0,1,3,3,0,5,5,1,3,3,5,5,5,1,1,3,3,4,5,1,2,2,4,4,4,2,2,2,2,4,4],[1,0,0,0,0,0,1,1,1,0,5,5,1,1,5,5,5,5,3,3,3,3,4,4,3,3,2,4,4,4,2,2,2,2,2,4],[2,2,2,3,0,0,1,2,2,3,3,0,1,4,2,3,3,0,1,4,4,5,3,0,1,4,4,5,5,0,1,1,4,5,5,5],[4,4,4,3,0,0,5,4,4,3,3,0,5,5,4,3,3,0,1,5,5,2,3,0,1,1,5,2,2,0,1,1,1,2,2,2]];
class Training {
 constructor(random=Math.random){this.random=random;this.mode='energy';this.status='idle';this.correct=0;this.mistakes=0;this.elapsed=0;this.selected=-1;this.target=-1;this.boardKind='standard';this.regions=[...STANDARD];this.values=Array(36).fill(0);this.given=Array(36).fill(false);this.keyOrder=[1,2,3,4,5,6];}
 shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 newBoard(){const digits=this.shuffle([1,2,3,4,5,6]);
 if(this.boardKind==='irregular'){this.regions=[...JIGSAWS[Math.floor(this.random()*JIGSAWS.length)]];this.solution=BASE.map(n=>digits[n-1]);const turns=Math.floor(this.random()*4),mirror=this.random()<.5;for(let t=0;t<turns;t++){this.solution=this.rotate(this.solution);this.regions=this.rotate(this.regions);}if(mirror){this.solution=this.mirror(this.solution);this.regions=this.mirror(this.regions);}}
 else{this.regions=[...STANDARD];const rows=this.shuffle([0,1,2]).flatMap(g=>this.shuffle([0,1]).map(i=>2*g+i)),cols=this.shuffle([0,1]).flatMap(g=>this.shuffle([0,1,2]).map(i=>3*g+i));this.solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/2)+c)%6]));}
 const clues=new Set(this.shuffle([...Array(36).keys()]).slice(0,this.mode==='find'?0:10));this.given=Array.from({length:36},(_,i)=>clues.has(i));this.values=this.solution.map((n,i)=>this.given[i]?n:0);this.queue=this.shuffle([...Array(36).keys()].filter(i=>!this.given[i]));}
 rotate(a){return Array.from({length:36},(_,i)=>a[(5-i%6)*6+Math.floor(i/6)]);}
 mirror(a){return Array.from({length:36},(_,i)=>a[Math.floor(i/6)*6+5-i%6]);}
 setBoardKind(kind){this.boardKind=kind==='irregular'?'irregular':'standard';this.newBoard();this.values.fill(0);this.given.fill(false);this.status='idle';this.correct=0;this.mistakes=0;this.elapsed=0;this.selected=-1;this.target=-1;}
 start(mode,kind=this.boardKind){this.mode=mode;this.boardKind=kind;this.status='running';this.correct=0;this.mistakes=0;this.elapsed=0;const order=this.shuffle([1,2,3,4,5,6]);if(order.every((n,i)=>n===this.keyOrder[i]))order.push(order.shift());this.keyOrder=order;this.newBoard();this.next();}
 next(){if(!this.queue.length)this.newBoard();this.target=this.queue.pop();this.selected=-1;this.number=this.solution[this.target];}
 select(i){if(this.status!=='running')return 'inactive';if(i!==this.target){this.mistakes++;this.selected=this.given[i]?-1:i;return 'wrong-cell';}this.selected=i;if(this.mode==='find')return this.success();return 'selected';}
 input(n){if(this.status!=='running'||this.mode==='find')return 'inactive';if(this.selected!==this.target){this.mistakes++;return 'select-first';}if(n!==this.number){this.mistakes++;return 'wrong-number';}return this.success();}
 success(){this.values[this.target]=this.number;this.correct++;if(this.mode!=='challenge'&&this.correct>=12){this.status='finished';return 'finished';}this.next();return 'correct';}
 tick(seconds){if(this.status!=='running')return;this.elapsed+=Math.max(0,seconds);if(this.mode==='challenge'&&this.elapsed>=120){this.elapsed=120;this.status='finished';}}
 pause(){if(this.status==='running')this.status='paused';else if(this.status==='paused')this.status='running';}
 result(){return {mode:this.mode,boardKind:this.boardKind,correct:this.correct,mistakes:this.mistakes,elapsed:this.elapsed,average:this.correct?this.elapsed/this.correct:null};}
}
if(typeof module!=='undefined'&&module.exports)module.exports=Training;else root.Training=Training;
})(globalThis);
