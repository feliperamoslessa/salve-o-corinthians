# Salve o Corinthians — V15

## Novidades da V15

- Motor de chances minuto a minuto, sem placar mínimo, com tática, condição física e treino influenciando a partida. Partidas antigas em andamento continuam no motor anterior.
- Escalação automática por compatibilidade, condição e disponibilidade; ajuste de táticas durante a partida.
- Perfis táticos simulados dos adversários e recomendações de preparação.
- Cinco treinos: recuperação, entrosamento, finalização, defesa e bola parada. Uma sessão por rodada.
- Lesões, recuperação, amarelos acumulados, suspensões e expulsões; jogadores indisponíveis não iniciam partidas.
- Relatórios com notas, destaque, assistências, posse e xG estimado pelo motor.
- Coletivas, pedidos de oportunidade e promessas com consequências na moral.
- Sete conquistas, incluindo clássicos, viradas e permanência na última rodada.
- Seis slots locais, importação de JSON entre partidas e backup antes de carregar ou começar outra carreira.
- Campo ilustrativo animado, luzes, transições, melhor adaptação ao celular e opção para reduzir animações.

## Testar a versão local

Execute `python -m http.server 8080 --bind 127.0.0.1` nesta pasta e abra http://127.0.0.1:8080/. Mantenha o processo do servidor aberto. Também é possível executar `iniciar-jogo.ps1` pelo PowerShell para iniciar e abrir a página.

Saves pertencem ao endereço usado: `localhost`, `127.0.0.1` e portas diferentes têm armazenamentos separados. Para levar uma carreira entre endereços, exporte e importe o JSON entre partidas.

Validação: `node tests/season.cjs` e `node tests/experience.cjs`. A suíte cobre uma temporada completa, persistência determinística, treinos, lesões, suspensões, slots e importação. O teste de distribuição usa 500 partidas simuladas; não representa previsão de resultados reais.

O código novo está em `experience.js` e `experience.css`. O `app.js` mantém os recursos anteriores e o motor necessário para concluir partidas de saves antigos.

Atualização de 20/10/2026: novas carreiras começam na **R32**, com o Corinthians em **16º e 33 pontos**, após a R31. São sete rodadas para buscar a permanência. Saves existentes conservam sua linha do tempo.

Novidades: treino semanal (recuperação ou moral, uma vez por rodada) e raio-x da permanência, acessíveis na tela inicial. A meta de 45 pontos é apenas uma referência.

Fonte da tabela: https://www.sofutebol.com.br/classificacao-brasileirao (20/10/2026). A artilharia mantém a base da R28, indicada na interface. Jogos atrasados de Vasco e Chapecoense não são simulados; o elenco mantém a base original do jogo. Os resultados a partir da R32 são fictícios.

Verificação automatizada: `node tests/season.cjs`.

A browser-based football management game where you take control of Corinthians for the final seven rounds of Brasileirão 2026 and fight to avoid relegation.

## Play now

**Live game:** https://salveocorinthians-two.vercel.app/

## About the game

New careers start after Round 31 of Brasileirão 2026. Rounds 32–38 become the player's alternate timeline.

You manage Corinthians through the final stretch of the championship, making tactical decisions, choosing formations, managing the squad and playing matches while the other league fixtures are simulated simultaneously.

## Main features

- Final seven rounds of Brasileirão 2026
- Minute-by-minute Corinthians matches
- Simultaneous simulation of the other league matches
- Live table and relegation battle
- 13 tactical formations
- Squad, stamina and morale management
- Match events, scorers and assists
- Career saves and Hall of Fame
- Deterministic match simulation
- Desktop and mobile support
- Local-first browser saves

## Run locally

No build step is required.

Start a local server from the project directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Deployment

The project is a static HTML/CSS/JavaScript application and can be deployed directly to Vercel.

## Version

Local build: **V15**. Publishing this update is a separate step.

## Disclaimer

This is an independent fan-made project. It is not an official product of Sport Club Corinthians Paulista, CBF, Brasileirão, Konami, EA Sports, or any other football organization or publisher.

## Author

Made by [@felipelessa03](https://github.com/feliperamoslessa).
