const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map(), app={innerHTML:''};
const ctx={window:{addEventListener:()=>{}},document:{getElementById:()=>app,body:{className:''},querySelectorAll:()=>[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval:()=>1,clearInterval:()=>{},setTimeout:()=>{},console,Date,Math,Audio:function(){this.play=()=>Promise.resolve();this.pause=()=>{};this.addEventListener=()=>{}},alert:()=>{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);
const code=fs.readFileSync('app.js','utf8');
vm.runInContext(code,ctx);
vm.runInContext(`
 S=fresh();home();
 if(S.round!==32||pos()!==16||team('Corinthians').pts!==33)throw Error('Starting scenario');
 if(fixture()[0]!=='Vasco')throw Error('Next fixture');
 S.players[0].stamina=80;trainWeek('recovery');
 if(S.players[0].stamina!==88)throw Error('Recovery');
 trainWeek('morale');if(S.players[0].stamina!==88)throw Error('Repeated training');
 save();
`,ctx);
const reload=vm.createContext({...ctx,window:ctx.window});
vm.runInContext(code,reload);
vm.runInContext(`if(!S||S.round!==32||S.trainingRound!==32)throw Error('Reload persisted state');`,reload);
vm.runInContext(`
 if(!S||S.round!==32||S.trainingRound!==32)throw Error('Reload');
 S.round=33;trainWeek('morale');if(S.players[0].stamina!==84||S.players[0].morale!==3)throw Error('Next week');
 survivalReport();
`,ctx);
for(const t of ctx.window.GAME_DATA.standings){assert.equal(t.pts,t.w*3+t.d);assert.equal(t.pj,t.w+t.d+t.l);}
assert.match(app.innerHTML,/RAIO-X/);
console.log('PASS: season, fixtures, standings, training, reload, survival report');

