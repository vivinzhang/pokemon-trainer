/* Pure training state, shared by the browser and the Node tests. */
(function(root){
class Training {
 constructor(random=Math.random){this.random=random;this.mode='energy';this.status='idle';this.correct=0;this.mistakes=0;this.elapsed=0;this.selected=-1;this.target=-1;this.values=Array(81).fill(0);this.given=Array(81).fill(false);}
 shuffle(items){return items.map(x=>({x,r:this.random()})).sort((a,b)=>a.r-b.r).map(x=>x.x);}
 newBoard(){const digits=this.shuffle([1,2,3,4,5,6,7,8,9]);const groups=()=>this.shuffle([0,1,2]).flatMap(g=>this.shuffle([0,1,2]).map(i=>3*g+i));const rows=groups(),cols=groups();this.solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/3)+c)%9]));const clues=new Set(this.shuffle([...Array(81).keys()]).slice(0,this.mode==='find'?0:23));this.given=Array.from({length:81},(_,i)=>clues.has(i));this.values=this.solution.map((n,i)=>this.given[i]?n:0);this.queue=this.shuffle([...Array(81).keys()].filter(i=>!this.given[i]));}
 start(mode){this.mode=mode;this.status='running';this.correct=0;this.mistakes=0;this.elapsed=0;this.newBoard();this.next();}
 next(){if(!this.queue.length)this.newBoard();this.target=this.queue.pop();this.selected=-1;this.number=this.solution[this.target];}
 select(i){if(this.status!=='running')return 'inactive';if(i!==this.target){this.mistakes++;this.selected=this.given[i]?-1:i;return 'wrong-cell';}this.selected=i;if(this.mode==='find')return this.success();return 'selected';}
 input(n){if(this.status!=='running'||this.mode==='find')return 'inactive';if(this.selected!==this.target){this.mistakes++;return 'select-first';}if(n!==this.number){this.mistakes++;return 'wrong-number';}return this.success();}
 success(){this.values[this.target]=this.number;this.correct++;if(this.mode!=='challenge'&&this.correct>=12){this.status='finished';return 'finished';}this.next();return 'correct';}
 tick(seconds){if(this.status!=='running')return;this.elapsed+=Math.max(0,seconds);if(this.mode==='challenge'&&this.elapsed>=120){this.elapsed=120;this.status='finished';}}
 pause(){if(this.status==='running')this.status='paused';else if(this.status==='paused')this.status='running';}
 result(){return {mode:this.mode,correct:this.correct,mistakes:this.mistakes,elapsed:this.elapsed,average:this.correct?this.elapsed/this.correct:null};}
}
if(typeof module!=='undefined'&&module.exports)module.exports=Training;else root.Training=Training;
})(globalThis);
