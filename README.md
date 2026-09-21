# Salve o Corinthians — V13 RC

Release candidate local-first do jogo de sobrevivência no Brasileirão 2026.

## Teste antes do deploy

Abra a pasta com um servidor local (por exemplo `python -m http.server 8000`) e teste o fluxo completo: pré-jogo → 1º tempo → intervalo → substituições → 2º tempo → fim → resultados → próxima rodada → R38 → Hall.

## Áudio

Coloque os MP3 em `assets/audio/` com os nomes definidos no projeto. A interface do jogador não expõe detalhes internos de arquivos.

## Release candidate

Esta versão congela novas funcionalidades para priorizar testes, balanceamento e correções antes do deploy público.


## V13 — ajuste de gols
- Frequência de criação de chances aumentada.
- Conversão recalibrada para partidas mais movimentadas.
- Jogos paralelos usam a mesma filosofia de maior volume ofensivo.
- Mantida a ponderação de artilheiros por posição, reduzindo gols excessivos de zagueiros.
- Resultado continua determinístico pela seed: recarregar não rerrola a partida.


## V13 — calibração ofensiva
- Frequência de ataques perigosos aumentada.
- Conversão de chances aumentada para produzir partidas e rodadas com mais gols.
- A mesma calibração é aplicada aos nove jogos paralelos.
- A seleção ponderada de artilheiros por posição permanece ativa.


## V13 scoring
High-scoring calibration requested after V11 remained too conservative. Target is intentionally around 4.8–5.4 goals per match over large samples, with deterministic RNG and late-match attacking boosts.
