export const TYPES={electric:{name:'电',color:'#f8cc52',symbol:'ϟ'},fire:{name:'火',color:'#ff8b6b',symbol:'♨'},water:{name:'水',color:'#77ccf0',symbol:'◈'},grass:{name:'草',color:'#8fdbb5',symbol:'❧'}};
export const PARTNERS=[
{id:25,name:'皮卡丘',type:'electric',chain:[25,25,26],forms:['皮卡丘','皮卡丘','雷丘'],mega:25,megaName:'超级皮卡丘',moves:['电击','十万伏特'],note:'把每一份好奇，都变成闪亮的力量。'},
{id:4,name:'小火龙',type:'fire',chain:[4,5,6],forms:['小火龙','火恐龙','喷火龙'],mega:10034,megaName:'超级喷火龙',moves:['喷射火焰','爆炸燃烧'],note:'尾巴上的火焰，为勇敢的你而燃。'},
{id:7,name:'杰尼龟',type:'water',chain:[7,8,9],forms:['杰尼龟','卡米龟','水箭龟'],mega:10036,megaName:'超级水箭龟',moves:['水枪','水炮'],note:'稳稳向前，每一步都是新的进步。'},
{id:1,name:'妙蛙种子',type:'grass',chain:[1,2,3],forms:['妙蛙种子','妙蛙草','妙蛙花'],mega:10033,megaName:'超级妙蛙花',moves:['藤鞭','疯狂植物'],note:'知识的小种子，会长成很大的勇气。'},
{id:656,name:'呱呱泡蛙',type:'water',chain:[656,657,658],forms:['呱呱泡蛙','呱头蛙','甲贺忍蛙'],moves:['水波动','水炮'],note:'保持专注，一起成为敏捷的小忍者。'},
{id:653,name:'火狐狸',type:'fire',chain:[653,654,655],forms:['火狐狸','长尾火狐','妖火红狐'],mega:655,megaName:'超级妖火红狐',moves:['喷射火焰','魔法火焰'],note:'下一次奇妙发现，就藏在前方。'},
{id:650,name:'哈利君',type:'grass',chain:[650,651,652],forms:['哈利君','胖胖哈力','布里卡隆'],mega:652,megaName:'超级布里卡隆',moves:['藤鞭','飞弹针'],note:'不怕小小挑战，守护大大的梦想。'},
{id:179,name:'咩利羊',type:'electric',chain:[179,180,181],forms:['咩利羊','茸茸羊','电龙'],moves:['电击','雷电之尾'],note:'慢慢积蓄能量，也能照亮整片夜空。'}];
export const BOSSES=[{id:135,name:'雷伊布',type:'electric',hp:30},{id:134,name:'水伊布',type:'water',hp:30},{id:136,name:'火伊布',type:'fire',hp:40}];
export const STAGES=[{name:'伙伴出发',tag:'初见 · 星光草地',goal:6,kind:'collect'},{name:'能量森林',tag:'探索 · 古树遗迹',goal:2,kind:'device'},{name:'守护营地',tag:'勇气 · 蘑菇山谷',goal:8,kind:'collect'},{name:'首领挑战',tag:'对决 · 月光祭坛',kind:'boss'},{name:'补给探险',tag:'休憩 · 晨曦湖畔',goal:2,kind:'supply'},{name:'最终挑战',tag:'终章 · 天空圣域',kind:'boss'}];
export const LIMITS={multiply:[15,8],arithmetic:[20,12],poem:[20,10],sort:[45,25],idiom:[20,10],word:[20,10],sentence:[20,10],vocab:[20,12],dialogue:[25,15]};
export const SUBJECTS={math:'数学',chinese:'语文',english:'英语'};
export const CATEGORY={multiply:'乘法口算',arithmetic:'100以内加减法',poem:'古诗补句',sort:'诗句排序',idiom:'成语填空',word:'易错字词',sentence:'句子填空',vocab:'词义配对',dialogue:'情景对话'};
export const art=id=>`assets/pokemon/${id}.webp`;
export const sprite=id=>`assets/sprites/${id}.gif`;
export function partner(id){return PARTNERS.find(p=>p.id===Number(id))||PARTNERS[0]}
export function stageOf(growth){return growth>=70?2:growth>=25?1:0}
export function appearance(p,record){const xp=record?.xp||0;return xp>=220&&p.mega?record?.mega||p.mega:p.chain[stageOf(xp)]}
export function formName(p,record){return (record?.xp||0)>=220&&p.mega?p.megaName+(p.id===4?(record.mega===10035?' Y':' X'):''):p.forms[stageOf(record?.xp||0)]}
export function stats(record,boost={}){const stage=stageOf(record?.xp||0),lv=(record?.xp||0)>=220?2:1;return {lv,attack:1+stage*.25+(boost.attack||0)*.25,skill:(lv===2?6:3+stage)+(boost.skill||0),cost:lv===2?5:3,cooldown:lv===2?3:4,magnet:1+(boost.magnet||0)*.15}}
