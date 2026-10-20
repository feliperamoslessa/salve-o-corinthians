/* V15: match simulation and club management. No external dependencies. */
function initExperience(){
 if(!S)return;
 S.training=S.training||{};S.achievements=S.achievements||[];S.reports=S.reports||[];
 S.promises=S.promises||[];S.interviews=S.interviews||{};
 S.players.forEach(p=>{p.yc=p.yc||0;p.suspended=p.suspended||0;p.injury=p.injury||0});
 S.version=15;
}
function available(p){return p&&!p.injury&&!p.suspended}
function htmlText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function notify(text){S.news.unshift({tag:'CLUBE',title:text,body:`Semana da rodada ${S.round}.`})}
const baseFresh15=fresh;
fresh=function(){const state=baseFresh15();state.version=15;return state};
newCareer=function(){
 if(S?.match){matchView();return}stopTimer();
 layout('',`<section class=scoutHero><div class=eyebrow>NOVA CARREIRA • SETE JOGOS, UMA MISSÃO</div><h1>Seu nome no comando.</h1><p>Corinthians • 16º • 33 pontos • rodada 32</p></section><form class=card onsubmit="createCareer15(event)"><label>Nome do treinador<input class=careerInput id=coachName name=coach maxlength=40 value="Felipe" required></label><label>Nome da carreira<input class=careerInput id=careerName name=career maxlength=50 value="Operação Permanência" required></label><p class=muted>${S?'Sua carreira atual será guardada no backup antes de iniciar.':'Os resultados a partir da rodada 32 serão a sua história.'}</p><div class=hubActions><button class=primaryBig type=submit>ASSUMIR O CORINTHIANS →</button><button class="btn alt" type=button onclick=menu()>VOLTAR</button></div></form>`);
};
function createCareer15(event){event.preventDefault();const coach=safeText(document.getElementById('coachName').value,40),career=safeText(document.getElementById('careerName').value,50);if(S)localStorage.setItem('soc_backup_v15',JSON.stringify(S));S=fresh();S.coach=coach;S.career=career;initExperience();save();home()}
const baseHome15=home;
home=function(){initExperience();baseHome15()};
const baseMenu15=menu;
menu=function(){baseMenu15();app.querySelector?.('.heroActions')?.insertAdjacentHTML('beforeend','<button class="ghostBig" onclick="saveHub()">MEUS SAVES</button>');};
weeklyPanel=function(){
 initExperience();const trained=S.trainingRound===S.round;
 return `<section class="card s12 clubHub"><div class=rowBetween><div><div class=eyebrow>OPERAÇÃO PERMANÊNCIA • V15</div><h3>A semana começa no CT.</h3></div><span class=badge>${Math.max(0,39-S.round)} JOGOS PARA REAGIR</span></div><div class=hubActions><button class=btn onclick="autoLineup()">⚡ MELHOR ESCALAÇÃO</button><button class="btn alt" onclick="clubCenter('training')">◎ TREINOS ${trained?'✓':''}</button><button class="btn alt" onclick="clubCenter('medical')">✚ MÉDICO / CARTÕES</button><button class="btn alt" onclick="clubCenter('scout')">◉ ADVERSÁRIO</button><button class="btn alt" onclick="clubCenter('dressing')">♟ VESTIÁRIO</button><button class="btn alt" onclick="clubCenter('achievements')">★ CONQUISTAS</button><button class="btn alt" onclick="saveHub()">▣ SAVES</button><button class="btn alt" onclick="survivalReport()">↗ PERMANÊNCIA</button>${S.reports.length?'<button class="btn alt" onclick="reportView()">▤ ÚLTIMO RELATÓRIO</button>':''}</div><p class=muted>${trained?'Treino concluído nesta rodada.':'Escolha um treino antes de entrar em campo.'} Base da tabela: ${D.season.updatedAt} • meta de referência: 45 pontos.</p></section>`;
};
function autoLineup(render=true){
 if(!S||S.match||S.finished)return;initExperience();
 const roles=D.formations[S.formation],pool=S.players.filter(available),xi=Array(11).fill(null),used=new Set();
 // Fill scarce roles first, then improve the complete assignment by pair swaps.
 const order=roles.map((role,i)=>({role,i,n:pool.filter(p=>rolePenalty(p,role)===0).length})).sort((a,b)=>a.n-b.n);
 for(const {role,i} of order){const p=pool.filter(p=>!used.has(p.id)).sort((a,b)=>lineupScore(b,role)-lineupScore(a,role))[0];if(!p)return false;xi[i]=p.id;used.add(p.id)}
 for(let pass=0;pass<3;pass++)for(let i=0;i<11;i++)for(let j=i+1;j<11;j++)if(lineupScore(S.players[xi[j]],roles[i])+lineupScore(S.players[xi[i]],roles[j])>lineupScore(S.players[xi[i]],roles[i])+lineupScore(S.players[xi[j]],roles[j]))[xi[i],xi[j]]=[xi[j],xi[i]];
 S.xi=xi;S.bench=pool.filter(p=>!used.has(p.id)).sort((a,b)=>(b.pos==='GOL')-(a.pos==='GOL')||b.ovr-a.ovr).slice(0,11).map(p=>p.id);selected=null;save();if(render)formation();return true;
}
function lineupScore(p,role){return eff(p,role)-(100-p.stamina)*.14-rolePenalty(p,role)*.6}
const baseFormation15=formation;
formation=function(){baseFormation15();app.querySelector?.('.tacticBar')?.insertAdjacentHTML('beforebegin','<div class="row utilityRow"><button class=btn onclick="autoLineup()">⚡ ESCALAR MELHORES DISPONÍVEIS</button><button class="btn alt" onclick="clubCenter(\'medical\')">VER DESFALQUES</button></div>')};
function opponentPlan(){
 const f=fixture(),name=f.find(n=>n!=='Corinthians'),t=team(name),idx=D.standings.findIndex(x=>x.name===name),style=['Posse e aproximação','Pressão e intensidade','Transição rápida','Bloco baixo e contra-ataque'][idx%4];
 return {name,t,style,tip:idx%4===0?'Passe direto pode explorar espaço após a perda da bola.':idx%4===1?'Passe curto ajuda a sair da pressão, mas exige um meio-campo descansado.':idx%4===2?'Linha normal ou baixa reduz o espaço para contra-ataques.':'Ritmo alto cria mais chances, com maior desgaste.',index:idx%4};
}
function clubCenter(tab='training'){
 if(!S||S.match)return;stopTimer();initExperience();let body='';
 if(tab==='training')body=`<h2>Preparar. Ajustar. Reagir.</h2><p class=muted>Uma sessão por rodada. Bônus táticos valem somente para a próxima partida.</p><div class=trainingGrid>${[['recovery','Recuperação','+8 físico para os disponíveis.'],['morale','Entrosamento','+1 moral, −4 físico.'],['attack','Finalização','+12% na conversão de chances, −6 físico.'],['defense','Organização defensiva','−12% na conversão rival, −5 físico.'],['setpiece','Bola parada','+8% na conversão de chances, −3 físico.']].map(([key,name,desc])=>`<article class=card><span class=eyebrow>CT JOAQUIM GRAVA</span><h3>${name}</h3><p>${desc}</p><button class=btn onclick="trainWeek('${key}')" ${S.trainingRound===S.round?'disabled':''}>${S.trainingRound===S.round?'SESSÃO CONCLUÍDA':'ESCOLHER TREINO'}</button></article>`).join('')}</div>`;
 else if(tab==='medical')body=`<h2>Prontos para jogar?</h2><p class=muted>Lesões e suspensões são medidas em partidas. Três amarelos acumulados geram um jogo de suspensão.</p><div class=medicalList>${S.players.map(p=>`<div class=medicalRow><span class=miniovr>${p.ovr}</span><div><b>${htmlText(p.name)}</b><small>${p.pos} • ${Math.round(p.stamina)}% físico</small></div><span class="badge ${available(p)?'good':'bad'}">${p.injury?`Lesão: ${p.injury} jogo(s)`:p.suspended?`Suspenso: ${p.suspended} jogo(s)`:p.yc===2?'Pendurado':`${p.yc}/3 amarelos`}</span></div>`).join('')}</div>`;
 else if(tab==='scout'){const o=opponentPlan();body=`<div class=scoutHero><div class=eyebrow>ANÁLISE TÁTICA • PERFIL SIMULADO</div><h2>${o.name}</h2><div class=kpi>${o.t.ovr} OVR</div><p>${o.style}</p></div><div class=card><h3>Como enfrentar</h3><p>${o.tip}</p><p class=muted>O estilo é uma característica do jogo, não uma análise factual do clube. A condição e a compatibilidade dos seus jogadores também pesam no resultado.</p><button class=btn onclick="formation()">MONTAR PLANO</button></div>`}
 else if(tab==='dressing')body=dressingHTML();
 else if(tab==='achievements')body=`<h2>Histórias que ficam.</h2><div class=trainingGrid>${achievementCatalog().map(([id,title,desc])=>`<article class="card achievement ${S.achievements.includes(id)?'unlocked':''}"><div class=achievementIcon>${S.achievements.includes(id)?'★':'☆'}</div><h3>${title}</h3><p>${desc}</p><span class=badge>${S.achievements.includes(id)?'CONQUISTADA':'EM BUSCA'}</span></article>`).join('')}</div>`;
 layout('Mais',`<div class=rowBetween><div class=eyebrow>CENTRAL DO CLUBE</div><button class="btn alt" onclick=home()>← VOLTAR</button></div><div class="tabs clubTabs">${[['training','Treinos'],['medical','Médico'],['scout','Adversário'],['dressing','Vestiário'],['achievements','Conquistas']].map(([k,n])=>`<button class="btn ${tab===k?'':'alt'}" onclick="clubCenter('${k}')">${n}</button>`).join('')}</div>${body}`);
}
trainWeek=function(kind){
 if(!S||S.finished||S.match||S.pregame||S.trainingRound===S.round||!['recovery','morale','attack','defense','setpiece'].includes(kind))return;initExperience();
 const cost={recovery:-8,morale:4,attack:6,defense:5,setpiece:3}[kind];
 S.players.filter(available).forEach(p=>{p.stamina=Math.max(0,Math.min(100,p.stamina-cost));if(kind==='morale')p.morale=Math.min(4,p.morale+1)});
 S.training={kind,round:S.round};S.trainingRound=S.round;notify('Treino concluído: '+{recovery:'recuperação',morale:'entrosamento',attack:'finalização',defense:'defesa',setpiece:'bola parada'}[kind]);save();home();
};
function dressingHTML(){
 const reserve=S.players.filter(p=>available(p)&&!S.xi.includes(p.id)&&!S.promises.some(x=>x.round===S.round&&x.id===p.id)).sort((a,b)=>b.ovr-a.ovr)[0];
 return `<h2>Onze em campo. Um elenco inteiro.</h2><div class=grid><div class="card s6"><div class=eyebrow>COLETIVA DA SEMANA</div><h3>Como o time vai reagir?</h3><p>A postura pública afeta torcida, diretoria e moral.</p><div class=hubActions>${[['confidence','Vamos buscar a vitória'],['calm','Um jogo de cada vez'],['accountability','Eu assumo a responsabilidade']].map(([k,n])=>`<button class="btn alt" onclick="interview('${k}')" ${S.interviews[S.round]?'disabled':''}>${n}</button>`).join('')}</div>${S.interviews[S.round]?'<p class=good>Coletiva realizada.</p>':''}</div><div class="card s6"><div class=eyebrow>CONVERSA NO CT</div>${reserve?`<h3>${htmlText(reserve.name)} quer uma chance</h3><p>Prometer uma vaga entre os titulares aumenta a moral. Descumprir custa dois níveis de moral após a partida.</p><button class=btn onclick="promiseStart(${reserve.id})">PROMETER TITULARIDADE</button>`:'<p>Nenhum pedido pendente nesta semana.</p>'}</div><div class="card s12"><h3>Compromissos assumidos</h3>${S.promises.slice(-5).map(p=>`<p>${htmlText(S.players[p.id].name)} • R${p.round} • ${p.resolved?(p.fulfilled?'cumprido ✓':'descumprido'):'aguardando partida'}</p>`).join('')||'<p class=muted>Nenhuma promessa.</p>'}</div></div>`;
}
function interview(kind){if(!S||S.match||S.interviews?.[S.round]||!['confidence','calm','accountability'].includes(kind))return;initExperience();S.interviews[S.round]=kind;if(kind==='confidence')S.fan=Math.min(100,S.fan+3);if(kind==='calm')S.players.forEach(p=>p.morale=Math.min(4,p.morale+1));if(kind==='accountability')S.board=Math.min(100,S.board+3);notify('Coletiva: '+{confidence:'confiança na vitória',calm:'foco em um jogo de cada vez',accountability:'treinador assume a responsabilidade'}[kind]);save();clubCenter('dressing')}
function promiseStart(id){if(!S||S.match||!S.players[id]||S.promises.some(x=>x.id===id&&x.round===S.round))return;S.promises.push({id,round:S.round,resolved:false});S.players[id].morale=Math.min(4,S.players[id].morale+1);save();clubCenter('dressing')}
function achievementCatalog(){return [['first','Primeira reação','Vença uma partida.'],['derby','Respeita o Timão','Vença São Paulo, Palmeiras ou Santos.'],['clean','Muralha alvinegra','Termine uma partida sem sofrer gols.'],['streak','Embalou','Vença três jogos seguidos.'],['comeback','Até o fim','Vença depois de sair atrás no placar.'],['survival','Missão cumprida','Conclua a temporada fora do Z4.'],['lastday','Coração forte','Saia do Z4 na rodada final e permaneça na Série A.']]}
function unlock(id){if(!S.achievements.includes(id)){S.achievements.push(id);notify('Conquista: '+achievementCatalog().find(x=>x[0]===id)[1])}}
function matchRandom(m){let r;[r,m.seed]=rng(m.seed);return r}
function activeIds(m){return S.xi.filter(id=>!m.sentOff?.includes(id)&&!S.players[id].injury)}
const baseKick15=kickoff;
kickoff=function(){
 if(S.match||S.finished)return;initExperience();
 if(S.xi.some(id=>!available(S.players[id]))){if(!autoLineup(false)){alert('Não há onze jogadores disponíveis.');return}notify('Escalação ajustada aos desfalques.')}
 // Legacy kickoff starts the clock itself; initialize modern state before any tick.
 const clock=startClock;startClock=function(){};
 try{baseKick15()}finally{startClock=clock}
 const m=S.match;m.engine=15;m.startedXI=clone(S.xi);m.participants=clone(S.xi);m.ratings={};m.matchGoals={};m.matchAssists={};m.playerShots={};m.playerOnTarget={};m.keeperSaves={};m.yellowCounts={};m.sentOff=[];m.newSuspensions=[];m.newInjuries=[];m.minutesPlayed={};m.chances=0;m.possessionTicks=0;m.ticks=0;m.xgH=0;m.xgA=0;m.lastSimKey=null;m.wasBehind=false;
 S.xi.forEach(id=>S.players[id].apps++);
 Object.values(m.live).forEach(g=>{delete g.goalSchedule;delete g.goalCursor});S.version=15;save();matchView();startClock();
};
function chanceParameters(g,m){
 const isCor=g.home==='Corinthians'||g.away==='Corinthians';let strength=(team(g.home).ovr-team(g.away).ovr)/65,share=.54+strength,pace=1,conversion=.115;
 if(isCor){const home=g.home==='Corinthians',ids=activeIds(m),roles=D.formations[S.formation],quality=ids.reduce((sum,id)=>sum+eff(S.players[id],roles[S.xi.indexOf(id)]),0)/11,delta=(quality-team(home?g.away:g.home).ovr)/65;
 const o=opponentPlan(),mental=S.mentality==='Ofensiva'?.055:S.mentality==='Defensiva'?-.045:0;
 let corShare=.5+delta+(home?.045:-.035)+mental+(S.press==='Alta'?.018:S.press==='Baixa'?-.012:0);
 if(o.index===2&&S.line==='Alta')corShare-=.035;if(o.index===1&&S.passing==='Curto')corShare+=.018;if(o.index===0&&S.passing==='Direto')corShare+=.018;
 share=home?corShare:1-corShare;pace=(S.tempo==='Alto'?1.18:S.tempo==='Baixo'?.85:1)*(S.mentality==='Ofensiva'?1.14:S.mentality==='Defensiva'?.86:1);
 }
 return {share:Math.max(.15,Math.min(.85,share)),pace,conversion,isCor};
}
function simulateModern(g,m){
 const p=chanceParameters(g,m),r=matchRandom(m);if(r>=.245*p.pace)return;
 const homeChance=matchRandom(m)<p.share,club=homeChance?g.home:g.away,isCorGoal=club==='Corinthians';let conversion=p.conversion;
 if(p.isCor&&S.training?.round===m.round){if(isCorGoal&&S.training.kind==='attack')conversion*=1.12;if(!isCorGoal&&S.training.kind==='defense')conversion*=.88;if(isCorGoal&&S.training.kind==='setpiece')conversion*=1.08}
 const onTarget=matchRandom(m)<.37,goalRoll=matchRandom(m),goal=goalRoll<conversion;
 let shooterId;
 if(p.isCor&&isCorGoal){[shooterId,m.seed]=corinthiansScorer(m.seed);m.playerShots=m.playerShots||{};m.playerOnTarget=m.playerOnTarget||{};m.playerShots[shooterId]=(m.playerShots[shooterId]||0)+1;if(onTarget||goal)m.playerOnTarget[shooterId]=(m.playerOnTarget[shooterId]||0)+1}
 if(p.isCor&&!isCorGoal&&onTarget&&!goal){const keeper=activeIds(m).find(id=>S.players[id].pos==='GOL');if(keeper!=null){m.keeperSaves=m.keeperSaves||{};m.keeperSaves[keeper]=(m.keeperSaves[keeper]||0)+1}}
 if(p.isCor){m.stats[homeChance?'shotsH':'shotsA']++;m[homeChance?'xgH':'xgA']+=conversion;if(onTarget||goal)m.stats[homeChance?'onH':'onA']++;m.chances++;m.lastAttack=homeChance?'H':'A';}
 if(!goal){if(p.isCor)m.events.push({text:`${m.display} • ${club} ${onTarget?'finaliza e exige defesa do goleiro.':'chega ao ataque, mas manda para fora.'}`});return}
 let scorer,id;
 if(isCorGoal){id=shooterId;scorer=S.players[id].name;S.players[id].goals++;m.matchGoals[id]=(m.matchGoals[id]||0)+1;const helpers=activeIds(m).filter(x=>x!==id&&S.players[x].pos!=='GOL');if(helpers.length&&matchRandom(m)<.7){const aid=helpers[Math.floor(matchRandom(m)*helpers.length)];S.players[aid].assists++;m.matchAssists[aid]=(m.matchAssists[aid]||0)+1}}
 else [scorer,m.seed]=scorerFor(club,m.seed);
 addScorer(scorer,club);g[homeChance?'hg':'ag']++;
 if(p.isCor){m.events.push({text:`⚽ ${m.display} • GOOOL! ${scorer} marca para ${club}!`,special:true});ledger('goal',{club,scorer,score:[g.hg,g.ag]});AudioFX.play(isCorGoal?'gol_corinthians':'gol_adversario');m.lastGoalMinute=m.minute;}
 else{g.events.push({minute:m.minute,scorer,club});m.otherEvents.push({text:`⚽ ${m.display} • ${g.home} ${g.hg}–${g.ag} ${g.away} • ${scorer}`})}
}
const legacyScorer15=corinthiansScorer;
corinthiansScorer=function(seed){if(S.match?.engine!==15)return legacyScorer15(seed);const old=S.xi;S.xi=activeIds(S.match);const result=legacyScorer15(seed);S.xi=old;return result};
simulateAllMinute=function(){
 const m=S.match;if(m.engine!==15){Object.values(m.live).forEach(g=>simulateGameMinuteV13(g,m));const cg=Object.values(m.live).find(g=>g.home===m.home&&g.away===m.away);m.hg=cg.hg;m.ag=cg.ag;return}
 // Stoppage time in the first half must not replay minutes 46–47 in the second half.
 const key=`${m.phase}:${m.minute}`;if(m.lastSimKey===key)return;m.lastSimKey=key;
 m.ticks++;const corGame=Object.values(m.live).find(g=>g.home===m.home&&g.away===m.away);
 m.possessionTicks+=chanceParameters(corGame,m).share;
 Object.values(m.live).forEach(g=>simulateModern(g,m));m.hg=corGame.hg;m.ag=corGame.ag;
 if((m.home==='Corinthians'?m.hg-m.ag:m.ag-m.hg)<0)m.wasBehind=true;
 activeIds(m).forEach(id=>{m.minutesPlayed[id]=(m.minutesPlayed[id]||0)+1});
 disciplineMinute(m);
};
function disciplineMinute(m){
 const ids=activeIds(m);if(!ids.length)return;let r=matchRandom(m);
 if(r<(S.press==='Alta'?.023:.015)){
 const id=ids[Math.floor(matchRandom(m)*ids.length)],p=S.players[id];p.yc++;m.yellowCounts[id]=(m.yellowCounts[id]||0)+1;m.stats[m.home==='Corinthians'?'cardsH':'cardsA']++;
 if(p.yc>=3){p.yc=0;p.suspended=Math.max(1,p.suspended);if(!m.newSuspensions.includes(id))m.newSuspensions.push(id)}
 const red=m.yellowCounts[id]>=2||matchRandom(m)<.035;
 if(red){m.sentOff.push(id);p.reds++;p.suspended=Math.max(1,p.suspended);if(!m.newSuspensions.includes(id))m.newSuspensions.push(id)}
 m.events.push({text:`${red?'🟥':'🟨'} ${m.display} • ${p.name}: ${red?'expulso! Corinthians com um a menos.':'cartão amarelo.'}`,special:true});ledger(red?'red':'yellow',{id});if(red&&S.autoPause)m.paused=true;
 }
 r=matchRandom(m);if(r<.0013){const id=ids[Math.floor(matchRandom(m)*ids.length)],p=S.players[id],fatigue=(100-p.stamina)/100;if(matchRandom(m)<.35+fatigue){p.injury=1+Math.floor(matchRandom(m)*3);m.newInjuries.push(id);m.events.push({text:`✚ ${m.display} • ${p.name} se machuca e precisa sair.`,special:true});ledger('injury',{id});if(S.autoPause)m.paused=true;}}
}
const basePrepare15=prepare;
prepare=function(){if(S.match||S.finished)return;initExperience();if(S.pregame){pregame();return}if(S.xi.some(id=>!available(S.players[id])))autoLineup(false);basePrepare15()};
const basePregame15=pregame;
pregame=function(){basePregame15();const o=opponentPlan();app.querySelector?.('.pregameLaunch')?.insertAdjacentHTML('beforebegin',`<div class="card s12"><div class=eyebrow>LEITURA DO JOGO</div><h3>${o.style}</h3><p>${o.tip}</p><small>Perfil tático simulado • Treino: ${S.training?.round===S.round?({attack:'finalização',defense:'defesa',setpiece:'bola parada',recovery:'recuperação',morale:'entrosamento'}[S.training.kind]||'concluído'):'nenhum nesta semana'}</small></div>`)};
const baseDecision15=decision;
decision=function(answer){const event=S.pregame?.events[S.pregame.idx];if(event?.type==='random'&&answer==='a'){initExperience();const id=S.bench[0];if(id!=null&&!S.promises.some(p=>p.id===id&&p.round===S.round))S.promises.push({id,round:S.round,resolved:false,mode:'appearance'})}baseDecision15(answer)};
const baseSub15=confirmMatchManagerSub;
confirmMatchManagerSub=function(){const m=S.match;if(!m||matchSubIn==null)return;const id=matchSubIn;if(!available(S.players[id])||m.sentOff?.includes(S.xi[matchSubOut])||m.participants?.includes(id)){alert('Este jogador não pode entrar ou já participou da partida.');return}const before=m.subs||0;baseSub15();if((m.subs||0)>before&&m.engine===15){m.participants.push(id);S.players[id].apps++;save()}};
const baseStrength15=xiStrength;
xiStrength=function(){if(S.match?.engine!==15)return baseStrength15();return activeIds(S.match).reduce((a,id)=>a+eff(S.players[id],D.formations[S.formation][S.xi.indexOf(id)]),0)/11};
function reportFor(m){const gf=m.home==='Corinthians'?m.hg:m.ag,ga=m.home==='Corinthians'?m.ag:m.hg;const list=(m.participants||m.startedXI||S.xi).map(id=>{const p=S.players[id],goals=m.matchGoals?.[id]||0,assists=m.matchAssists?.[id]||0,mins=m.minutesPlayed?.[id]||0;let rating=6+(gf>ga?.6:gf<ga?-.5:.1)+goals*.9+assists*.5-(m.yellowCounts?.[id]||0)*.2-(m.sentOff?.includes(id)?1.5:0);rating+=(m.playerOnTarget?.[id]||0)*.09+(m.keeperSaves?.[id]||0)*.12;if(['GOL','ZAG','LD','LE'].includes(p.pos))rating+=ga===0?.6:-ga*.12;return {id,name:p.name,minutes:mins,goals,assists,rating:+Math.max(3,Math.min(10,rating)).toFixed(1)}}).sort((a,b)=>b.rating-a.rating||b.goals-a.goals);
 return {round:m.round,home:m.home,away:m.away,hg:m.hg,ag:m.ag,stats:clone(m.stats),xgH:+(m.xgH||0).toFixed(2),xgA:+(m.xgA||0).toFixed(2),players:list,possession:m.ticks?Math.round(m.possessionTicks/m.ticks*100):50,wasBehind:m.wasBehind};
}
const baseFinish15=finishMatch;
finishMatch=function(){const m=S.match;if(!m||!m.done||m.processed)return;initExperience();
 if(m.engine===15){const report=reportFor(m);S.reports.push(report);S.promises.filter(p=>!p.resolved&&p.round===m.round).forEach(p=>{p.resolved=true;p.fulfilled=(p.mode==='appearance'?m.participants:m.startedXI).includes(p.id);if(!p.fulfilled)S.players[p.id].morale=Math.max(0,S.players[p.id].morale-2)});
 S.players.forEach(p=>{if(p.suspended&&!m.newSuspensions.includes(p.id))p.suspended--;if(p.injury&&!m.newInjuries.includes(p.id))p.injury--});
 const gf=m.home==='Corinthians'?m.hg:m.ag,ga=m.home==='Corinthians'?m.ag:m.hg,opp=m.home==='Corinthians'?m.away:m.home,oldPos=pos();
 if(gf>ga){unlock('first');if(['Palmeiras','São Paulo','Santos'].includes(opp))unlock('derby');if(S.streak>=2)unlock('streak');if(m.wasBehind)unlock('comeback')}if(ga===0)unlock('clean');
 baseFinish15();if(S.finished&&pos()<=16&&!String(S.reason).startsWith('Demitido')){unlock('survival');if(oldPos>=17&&m.round===38)unlock('lastday')}save();if(!S.finished)reportView();
 }else baseFinish15();
};
function reportView(index){initExperience();const r=S.reports[index??S.reports.length-1];if(!r)return home();layout('Brasileirão',`<div class=eyebrow>RELATÓRIO • R${r.round}</div><section class=reportHero><span>FIM DE JOGO</span><h2>${r.home} <b>${r.hg} × ${r.ag}</b> ${r.away}</h2><p>Destaque do Corinthians: <b>${htmlText(r.players[0]?.name||'—')}</b></p></section><div class=statline><span>Posse H / A <b>${r.possession}% / ${100-r.possession}%</b></span><span>xG H / A <b>${r.xgH} / ${r.xgA}</b></span><span>Chutes <b>${r.stats.shotsH} / ${r.stats.shotsA}</b></span></div><div class=card><h3>Notas do Corinthians</h3><p class=muted>Notas calculadas por resultado, gols, assistências, disciplina, finalizações no alvo, defesas e desempenho defensivo.</p>${r.players.map(p=>`<div class=medicalRow><strong class=rating>${p.rating.toFixed(1)}</strong><div><b>${htmlText(p.name)}</b><small>${Math.min(90,p.minutes)} min • ${p.goals} gol(s) • ${p.assists} assistência(s)</small></div></div>`).join('')}</div><div class="row utilityRow"><button class=btn onclick=home()>CONTINUAR</button><button class="btn alt" onclick="results(${r.round})">RESULTADOS DA RODADA</button><button class="btn alt" onclick="clubCenter('achievements')">CONQUISTAS</button></div>`)}
function arenaPosition(m){
 const minute=Number.isFinite(m.minute)?m.minute:0,phase=(minute*7)%30;
 return {x:m.lastAttack==='H'?52+phase:m.lastAttack==='A'?48-phase:50,y:35+(minute*3)%30};
}
function arenaCaption(m){return `${m.done?'PARTIDA ENCERRADA':m.ht?'INTERVALO':m.paused?'RELÓGIO PARADO':'● AO VIVO'} • CAMPO ILUSTRATIVO`}
function livePitchHTML(m){
 const ball=arenaPosition(m),spots=[[6,50],[22,18],[20,39],[20,61],[22,82],[36,24],[36,50],[36,76],[45,20],[45,80],[47,50]];
 return `<section class="liveArena ${m.paused||m.done?'isPaused':''}" aria-label="Campo ilustrativo animado"><div class=arenaLines></div><div class=arenaCircle></div><div class="arenaBox homeBox"></div><div class="arenaBox awayBox"></div>${['H','A'].map(side=>spots.map(([x,y],i)=>`<i class="arenaPlayer ${side==='H'?'homeDot':'awayDot'}" style="--x:${side==='H'?x:100-x}%;--y:${y}%;--delay:${i*-.35}s"></i>`).join('')).join('')}<i class=arenaBall style="left:${ball.x}%;top:${ball.y}%"></i><span class=arenaCaption>${arenaCaption(m)}</span></section>`;
}
const baseMatchView15=matchView;
matchView=function(){
 // Keep the actual field node alive: replacing it every tick restarts CSS animations
 // and prevents the ball's position transition from ever completing.
 const arena=app.querySelector?.('.liveArena'),previousRound=arena?.dataset.round;
 baseMatchView15();const m=S.match;if(!m)return;
 const tabs=app.querySelector?.('.matchFeedTabs');
 if(arena&&previousRound===String(m.round)){
  tabs?.before(arena);arena.classList.toggle('isPaused',!!(m.paused||m.done));
  const ball=arena.querySelector('.arenaBall'),position=arenaPosition(m);
  ball.style.left=position.x+'%';ball.style.top=position.y+'%';
  arena.querySelector('.arenaCaption').textContent=arenaCaption(m);
 }else{tabs?.insertAdjacentHTML('beforebegin',livePitchHTML(m));const created=app.querySelector?.('.liveArena');if(created)created.dataset.round=String(m.round)}
 if(m.engine===15)app.querySelector?.('.statline')?.insertAdjacentHTML('beforeend',`<span>xG <b>${(m.xgH||0).toFixed(2)}–${(m.xgA||0).toFixed(2)}</b></span>`);
};
const baseMore15=more;
more=function(){baseMore15();app.querySelector?.('.grid')?.insertAdjacentHTML('afterbegin',`<div class="card s12"><h3>Seu jogo, seu ritmo.</h3><div class=hubActions><button class=btn onclick="saveHub()">GERENCIAR SAVES</button><button class="btn alt" onclick="clubCenter()">CENTRAL DO CLUBE</button><button class="btn alt" onclick="toggleMotion()">${S.preferences?.reduceMotion?'ATIVAR':'REDUZIR'} ANIMAÇÕES</button></div></div>`)};
function toggleMotion(){S.preferences=S.preferences||{};S.preferences.reduceMotion=!S.preferences.reduceMotion;save();document.documentElement?.classList.toggle('reduceMotion',S.preferences.reduceMotion);more()}
const baseFinal15=finalScreen;
finalScreen=function(){baseFinal15();if(!S)return;const earned=achievementCatalog().filter(([id])=>S.achievements?.includes(id));app.querySelector?.('.finalActions')?.insertAdjacentHTML('beforebegin',`<section class="card utilityRow"><div class=eyebrow>SEU LEGADO</div><h3>${earned.length} conquistas nesta carreira</h3><div class=hubActions>${earned.map(([,title])=>`<span class=badge>★ ${title}</span>`).join('')}</div>${S.reports?.length?'<button class="btn alt utilityRow" onclick="reportView()">VER ÚLTIMO RELATÓRIO</button>':''}</section>`)};
const baseManager15=renderMatchManager;
renderMatchManager=function(){baseManager15();if(!S.match)return;const status=(S.match.sentOff||[]).map(id=>`${htmlText(S.players[id].name)} expulso`).concat((S.match.newInjuries||[]).map(id=>`${htmlText(S.players[id].name)} lesionado`));app.querySelector?.('.rowBetween')?.insertAdjacentHTML('afterend',`<div class=tacticBar>${[['Mentalidade','mentality',['Defensiva','Equilibrada','Ofensiva']],['Pressão','press',['Baixa','Média','Alta']],['Linha','line',['Baixa','Normal','Alta']],['Passe','passing',['Curto','Misto','Direto']],['Ritmo','tempo',['Baixo','Normal','Alto']]].map(([label,key,choices])=>`<label>${label}<select onchange="S.${key}=this.value;save()">${opts(choices,S[key])}</select></label>`).join('')}</div>${status.length?`<p class=bad>${status.join(' • ')}</p>`:''}`)};
function saveSlots(){try{return JSON.parse(localStorage.getItem('soc_slots_v15')||'[]')}catch{return []}}
function saveHub(message=''){
 if(S?.match){matchView();return}stopTimer();const slots=saveSlots();
 layout('Mais',`<div class=rowBetween><div><div class=eyebrow>CARREIRAS LOCAIS</div><h2>Uma história por save.</h2></div><button class="btn alt" onclick="${S?'home()':'menu()'}">VOLTAR</button></div><p class=muted>Até seis slots neste navegador. Carregar um slot guarda a carreira ativa em um backup recuperável.</p>${message?`<p role=status class=good>${htmlText(message)}</p>`:''}<div class=hubActions>${S?'<button class=btn onclick="storeSlot()">SALVAR CARREIRA EM UM SLOT</button><button class="btn alt" onclick="exportSave()">EXPORTAR JSON</button>':''}<label class="btn alt">IMPORTAR JSON<input type=file accept=".json,application/json" onchange="importSaveFile(this.files[0])" hidden></label>${localStorage.getItem('soc_backup_v15')?'<button class="btn alt" onclick="restoreBackup()">RESTAURAR BACKUP ANTERIOR</button>':''}</div><div class="trainingGrid utilityRow">${slots.map((slot,i)=>`<article class=card><div class=eyebrow>SLOT ${i+1}</div><h3>${htmlText(slot.state.career)}</h3><p>${htmlText(slot.state.coach)} • R${slot.state.round}<br>${new Date(slot.date).toLocaleString('pt-BR')}</p><button class=btn onclick="loadSlot(${i})">CARREGAR</button><button class="btn alt" onclick="storeSlot(${i})" ${S?'':'disabled'}>ATUALIZAR</button></article>`).join('')||'<div class=card>Nenhum slot salvo ainda.</div>'}</div>`);
}
function storeSlot(index){if(!S||S.match)return;const slots=saveSlots();if(index==null&&slots.length>=6)return saveHub('Seis slots ocupados. Atualize um deles.');const item={date:Date.now(),state:clone(S)};if(index==null)slots.push(item);else if(slots[index])slots[index]=item;localStorage.setItem('soc_slots_v15',JSON.stringify(slots));saveHub('Carreira salva no slot.')}
function validateSave(state){
 if(!state||typeof state!=='object'||!Number.isInteger(state.round)||state.round<29||state.round>39||!Number.isFinite(state.seed)||!D.formations[state.formation]||!Array.isArray(state.table)||state.table.length!==20||!Array.isArray(state.players)||state.players.length!==D.players.length)throw Error('Estrutura de save inválida.');
 if(![...D.standings].every(t=>state.table.filter(x=>x.name===t.name).length===1))throw Error('Clubes inválidos.');
 state.table.forEach(t=>{for(const k of ['pts','pj','w','d','l','gf','ga','ovr'])if(!Number.isFinite(t[k])||t[k]<0)throw Error('Tabela inválida.')});
 state.players.forEach((p,i)=>{if(p.id!==i||p.name!==D.players[i].name||!Array.isArray(p.compat))throw Error('Elenco inválido.');for(const k of ['stamina','morale','ovr','goals','assists','yc','suspended','injury'])if(!Number.isFinite(p[k])||p[k]<0)throw Error('Jogador inválido.');if(p.stamina>100||p.morale>4)throw Error('Condição inválida.')});
 for(const key of ['xi','bench'])if(!Array.isArray(state[key])||state[key].some(id=>!Number.isInteger(id)||!state.players[id]))throw Error('Escalação inválida.');
 if(state.xi.length!==11||new Set([...state.xi,...state.bench]).size!==state.xi.length+state.bench.length)throw Error('Escalação duplicada.');
 if(!['history','news','timeline','scorers','achievements'].every(k=>Array.isArray(state[k]))||!state.results||typeof state.results!=='object')throw Error('Histórico inválido.');
 if(state.match)throw Error('Importe um save entre partidas. Partidas ativas continuam disponíveis pelo autosave.');
 if(!Number.isFinite(state.fan)||state.fan<0||state.fan>100||!Number.isFinite(state.board)||state.board<0||state.board>100||![1,2,4,99].includes(state.speed))throw Error('Estado da carreira inválido.');
 if(!state.news.every(n=>n&&['tag','title','body'].every(k=>typeof n[k]==='string'))||!state.timeline.every(n=>n&&Number.isInteger(n.round)&&typeof n.title==='string'&&typeof n.body==='string')||!state.history.every(h=>h&&Number.isInteger(h.round)&&typeof h.opp==='string'&&['V','E','D'].includes(h.res)&&Number.isFinite(h.gf)&&Number.isFinite(h.ga))||!state.scorers.every(s=>s&&typeof s.name==='string'&&typeof s.club==='string'&&Number.isFinite(s.goals)))throw Error('Conteúdo do histórico inválido.');
 if(state.reports&&!Array.isArray(state.reports)||state.promises&&!Array.isArray(state.promises))throw Error('Relatórios inválidos.');
 if(state.promises?.some(p=>!p||!Number.isInteger(p.id)||!state.players[p.id]||!Number.isInteger(p.round)))throw Error('Promessas inválidas.');
 if(state.reports?.some(r=>!r||!Array.isArray(r.players)||!r.players.every(p=>p&&Number.isFinite(p.rating)&&typeof p.name==='string')||!r.stats||!Number.isFinite(r.possession)||!Number.isFinite(r.xgH)||!Number.isFinite(r.xgA)))throw Error('Relatório de partida inválido.');
 if(!state.achievements.every(id=>achievementCatalog().some(a=>a[0]===id)))throw Error('Conquistas inválidas.');
 state.coach=safeText(state.coach||'Treinador',40);state.career=safeText(state.career||'Carreira',50);return state;
}
function cleanImported(value,depth=0){if(depth>30)throw Error('Arquivo muito complexo.');if(typeof value==='string')return value.replace(/[<>"'`]/g,'').replace(/[\u0000-\u001f]/g,' ');if(Array.isArray(value))return value.map(x=>cleanImported(x,depth+1));if(value&&typeof value==='object'){const obj={};for(const [key,item] of Object.entries(value))if(!['__proto__','constructor','prototype'].includes(key))obj[key]=cleanImported(item,depth+1);return obj}return value}
function activateSave(state){const incoming=cleanImported(clone(state));validateSave(incoming);if(S)localStorage.setItem('soc_backup_v15',JSON.stringify(S));S=incoming;initExperience();save();home()}
function loadSlot(index){try{const slot=saveSlots()[index];if(slot)activateSave(slot.state)}catch(e){saveHub(e.message)}}
async function importSaveFile(file){if(!file)return;try{if(file.size>2000000)throw Error('Arquivo maior que 2 MB.');activateSave(JSON.parse(await file.text()))}catch(e){saveHub('Não foi possível importar: '+e.message)}}
function restoreBackup(){try{const old=JSON.parse(localStorage.getItem('soc_backup_v15'));if(old)activateSave(old)}catch(e){saveHub(e.message)}}
initExperience();
if(S){document.documentElement?.classList.toggle('reduceMotion',!!S.preferences?.reduceMotion);if(!S.match)S.finished?finalScreen():home();else{matchView();if(!S.match.paused&&!S.match.done)startClock()}save()}else menu();
