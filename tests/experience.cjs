const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=['data.js','app.js','experience.js'].map(f=>fs.readFileSync(f,'utf8'));
function boot(storage=new Map()){
 const app={innerHTML:'',remove(){},querySelector:()=>null},ctx={window:{addEventListener(){}},document:{getElementById:()=>app,body:{className:''},documentElement:{classList:{toggle(){}}},querySelectorAll:()=>[]},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setInterval:()=>1,clearInterval(){},setTimeout(){},console,Date,Math,Audio:function(){this.play=()=>Promise.resolve();this.pause=()=>{}},alert(){},confirm:()=>true};
 vm.createContext(ctx);source.forEach(code=>vm.runInContext(code,ctx));return {ctx,app,storage,run:s=>vm.runInContext(s,ctx)};
}
const b=boot();
b.run(`S=fresh();initExperience();S.players[0].injury=2;autoLineup(false);if(S.xi.includes(0)||new Set([...S.xi,...S.bench]).size!==22)throw Error('Auto lineup');S.players[0].injury=0;autoLineup(false);S.speed=99;kickoff();if(S.match.engine!==15||S.match.minute===0)throw Error('Instant kickoff');`);
b.run(`simulateToEnd();if(!S.match.done)throw Error('Simulation unfinished');if(S.match.hg>S.match.stats.onH||S.match.ag>S.match.stats.onA)throw Error('Shots vs goals');finishMatch();if(S.round!==33||S.reports.length!==1)throw Error('Result report');finishMatch();if(S.round!==33)throw Error('Duplicate finish');storeSlot();`);
assert.equal(JSON.parse(b.storage.get('soc_slots_v15')).length,1);
const reloaded=boot(b.storage);reloaded.run(`if(!S||S.round!==33||S.reports.length!==1)throw Error('Reload');loadSlot(0);if(S.round!==33)throw Error('Load slot');`);
b.run(`S=fresh();initExperience();S.seed=123456;S.speed=1;kickoff();for(let i=0;i<21;i++)tick();save();`);
const cloneStorage=new Map(b.storage),c=boot(cloneStorage);
const summary=`JSON.stringify({scores:Object.values(S.match.live).map(g=>[g.hg,g.ag]),seed:S.match.seed,players:S.players.map(p=>[p.goals,p.assists,p.yc,p.suspended,p.injury])})`;
b.run('simulateToEnd()');c.run('simulateToEnd()');assert.equal(b.run(summary),c.run(summary),'Reload must preserve deterministic match');
b.run(`finishMatch();let guard=0;while(!S.finished&&guard++<8){autoLineup(false);S.speed=99;kickoff();simulateToEnd();finishMatch()}if(!S.finished||S.round!==39||S.reports.length!==7)throw Error('Full season');for(const t of S.table){if(t.pts!==3*t.w+t.d||t.pj!==t.w+t.d+t.l)throw Error('Table consistency')}validateSave(clone(S));`);
// Distribution check using actual per-minute engine; no imposed minimum score.
const dist=boot();
const stats=dist.run(`(()=>{S=fresh();initExperience();let goals=0,scoreless=0,games=0;for(let n=0;n<500;n++){const m={seed:n+321,minute:0,display:'',otherEvents:[]},g={home:'Flamengo',away:'Palmeiras',hg:0,ag:0,events:[]};for(let minute=1;minute<=94;minute++){m.minute=minute;simulateModern(g,m)}games++;goals+=g.hg+g.ag;if(g.hg+g.ag===0)scoreless++}return {mean:goals/games,scoreless}})()`);
assert(stats.mean>2&&stats.mean<3.5,JSON.stringify(stats));assert(stats.scoreless>0,'0–0 must be possible');
const features=boot();
features.run(`
 S=fresh();initExperience();
 trainWeek('attack');if(S.training.kind!=='attack'||S.players[0].stamina!==94)throw Error('Attack training');
 trainWeek('defense');if(S.training.kind!=='attack'||S.players[0].stamina!==94)throw Error('Training limit');
 interview('calm');const morale=S.players[0].morale;interview('calm');if(S.players[0].morale!==morale)throw Error('Interview limit');
 prepare();const preg=JSON.stringify(S.pregame);prepare();if(JSON.stringify(S.pregame)!==preg)throw Error('Pregame repeat');
 S.pregame=null;S.players[0].suspended=1;S.players[1].injury=2;autoLineup(false);S.speed=1;kickoff();
 if(S.xi.includes(0)||S.xi.includes(1))throw Error('Unavailable starter');
 const injured=S.xi[1];S.players[injured].injury=2;S.match.newInjuries.push(injured);
 simulateToEnd();finishMatch();if(S.players[0].suspended!==0||S.players[1].injury!==1||S.players[injured].injury!==2)throw Error('Medical recovery');
 const valid=clone(S);validateSave(valid);let rejected=false;try{const bad=clone(S);bad.xi[0]=bad.xi[1];validateSave(bad)}catch{rejected=true}if(!rejected)throw Error('Invalid save accepted');
 const corrupt=clone(S);corrupt.news[0].title='<img src=x onerror=alert(1)>';activateSave(corrupt);if(S.news[0].title.includes('<'))throw Error('Untrusted save markup');
 const savedRound=S.round;storeSlot();S.round++;loadSlot(0);if(S.round!==savedRound)throw Error('Slot failed');restoreBackup();if(S.round!==savedRound+1)throw Error('Backup failed');
 `);
console.log('PASS: automatic lineup, instant kickoff, results once, reports, save slots, reload determinism, full season, standings, 500-game distribution',stats);
console.log('PASS: training and interview limits, pregame persistence, injuries and suspensions, import validation, save backups');
const fieldTest=boot();fieldTest.run('S=fresh();initExperience();S.speed=1;kickoff()');
const ball={style:{}},caption={textContent:''},toggles=[],reinserted=[];
const field={dataset:{round:'32'},classList:{toggle:(...args)=>toggles.push(args)},querySelector:s=>s==='.arenaBall'?ball:caption};
fieldTest.app.querySelector=s=>s==='.liveArena'?field:s==='.matchFeedTabs'?{before:node=>reinserted.push(node)}:null;
fieldTest.run('S.match.minute=10;S.match.lastAttack="H";matchView();S.match.minute=11;matchView();S.match.paused=true;matchView()');
assert.equal(reinserted.length,3);assert(reinserted.every(node=>node===field),'Field node must survive ticks');
assert.equal(caption.textContent,'RELÓGIO PARADO • CAMPO ILUSTRATIVO');assert.deepEqual(toggles.at(-1),['isPaused',true]);
assert.equal(fieldTest.run('(livePitchHTML(S.match).match(/class="arenaPlayer /g)||[]).length'),22);
fieldTest.run('S.match.done=true;matchView()');assert.match(caption.textContent,/PARTIDA ENCERRADA/);
console.log('PASS: persistent field node, 22 players, ball coordinates, pause and full-time caption');
