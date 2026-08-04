# Fase 3 — Arquitetura do módulo de coleta (sem coletar nenhum site)

Nova numeração de fases adotada a partir de agora:

```text
FASE 1  Fundação            (concluída)
FASE 2  Banco               (concluída)
FASE 3  Arquitetura de coleta   <-- esta entrega
FASE 4  Primeiro scraper (PCI Concursos)
FASE 5  Demais scrapers (um por vez)
FASE 6  Motor de filtros
FASE 7  Tela de configuração de filtros
FASE 8  Busca histórica (6 meses)
FASE 9  Relatórios
FASE 10 Notificações (e-mail / WhatsApp)
FASE 11 Automação diária (cron 09:00)
FASE 12 Otimização e testes
```

## O que será construído agora

Toda a "espinha dorsal" da coleta: um padrão único que qualquer site futuro
deverá seguir, um gerenciador que executa os scrapers registrados, tratamento
de erros isolado por site e logs estruturados de cada execução. Nenhum site
real é acessado nesta fase.

### Estrutura de pastas

```text
src/lib/scrapers/
├── base/
│   ├── scraper.interface.ts   contrato ContestScraper + tipos
│   ├── base-scraper.ts        classe abstrata (http + retry + rate limit + cache)
│   ├── errors.ts              ScraperError, tipos de falha
│   └── result.ts              formato padrão do resultado da execução
├── manager.ts                 serviço gerenciador (executa todos / um)
├── registry.ts                sistema de plugins (registrar/listar/obter)
├── pci/            (vazio, placeholder — Fase 4)
├── acheConcursos/  (vazio, placeholder)
├── jcConcursos/    (vazio, placeholder)
└── ...             demais pastas previstas
```

### Interface padrão

Cada scraper declara: identificador estável, nome de exibição, URL base,
intervalo mínimo entre requisições e os métodos de coleta (`fetchList`,
`parseDetail` opcional). A classe base já entrega HTTP com retry exponencial,
rate limit por site e cache TTL, para que cada novo site escreva apenas o
parsing.

### Gerenciador de scrapers

Executa os scrapers registrados em sequência controlada, com timeout por site,
e devolve um relatório: itens coletados, duração, erros por site. Uma falha em
um site nunca interrompe os demais. Suporta executar todos ou apenas um.

### Tratamento de erros e logs

Erros classificados (rede, parsing, bloqueio/HTTP, timeout) com o site e a URL
no contexto. Cada execução gera logs estruturados em JSON e um resumo pronto
para ser gravado em `execution_logs` na Fase 4.

### Verificação nesta fase

- Página protegida `/coleta`: lista os sites previstos, quais já têm scraper
  registrado e um botão "Executar coleta" que roda o gerenciador (com zero
  scrapers, retorna um relatório vazio e válido).
- Testes unitários (Vitest) com scrapers falsos: sucesso, falha isolada,
  timeout, ordem de execução, retry e formato do relatório.

## Detalhes técnicos

- A execução acontece em `createServerFn` (`src/lib/scrapers/scrapers.functions.ts`),
  nunca no navegador; o registry e o manager são módulos puros e testáveis.
- Reaproveita `core/http.ts` (retry + rate limit), `core/cache.ts` e
  `core/logger.ts` já existentes.
- `registry.ts` atual é ampliado (mantendo `PLANNED_SOURCES` e os testes que já
  passam) para suportar registro por plugin e reset em testes.
- Nenhuma alteração de banco nesta fase; a gravação entra na Fase 4 junto do
  primeiro scraper.
