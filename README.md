# Radar TI Jobs

Vamos modificar o plano inicial, e iniciar o 3.1

ase 3 — Arquitetura do módulo de coleta (dividir)

Essa é a maior divisão necessária.

3.1 Criar estrutura de coleta

Criar:

scrapers/
 ├── base/
 │    ├── scraper.interface.ts
 │
 ├── pci/
 ├── acheConcursos/
 ├── jcConcursos/
 └── ...

Implementar:

 interface padrão;

 serviço gerenciador de scrapers;

 sistema de plugins;

 tratamento de erros;

 logs.

Ainda sem coletar nenhum site.

3.2 Implementar primeiro scraper

Escolher apenas:

 PCI Concursos

Criar:

 coleta;

 normalização dos dados;

 gravação no banco.

Validar funcionamento.

3.3 Adicionar demais scrapers

Adicionar:

 Ache Concursos;

 JC Concursos;

 Estratégia Concursos;

 Gran Concursos;

 Direção Concursos;

 Concurso em Foco;

 Folha Dirigida/QConcursos.

Um por vez.

Motivo: tentar criar 8 scrapers em uma única fase provavelmente fará o Lovable gerar código incompleto ou genérico.

Fase 4 — Sistema de filtros (dividir)

4.1 Motor de filtragem

Implementar:

 localização;

 cargos;

 palavras-chave;

 exclusões.

4.2 Configuração do usuário

Criar tela para:

 cidade;

 estado;

 palavras permitidas;

 palavras bloqueadas;

 preferências.

4.3 Validação automática

Implementar regras:

Excluir:

 CNH obrigatória;

 pós-graduação obrigatória;

 fora de TI.

Motivo: filtro de backend e tela de configuração são coisas diferentes.

Fase 5 — Relatório inicial (dividir)

5.1 Primeira busca histórica

Implementar:

 busca últimos 6 meses;

 processamento;

 armazenamento.

5.2 Gerador de relatório

Criar:

 relatório estruturado;

 resumo;

 links;

 informações completas.

5.3 Controle de envio

Criar:

 concursos enviados;

 controle de duplicidade.

Fase 6 — Notificações (dividir)

6.1 Sistema de notificações abstrato

Criar:

notifications/
 ├── email/
 ├── whatsapp/
 └── providers/

Com interface:

NotificationProvider

6.2 Integração e-mail

Implementar:

 SMTP;

 Resend;

 SendGrid.

6.3 Integração WhatsApp

Implementar:

 Meta Cloud API;

 Evolution API.

Fase 7 — Automação diária (dividir)

7.1 Scheduler

Criar:

 cron;

 execução diária 09:00;

 controle de falhas.

7.2 Pipeline completo

Fluxo:

Cron
 ↓
Scrapers
 ↓
Banco
 ↓
Filtros
 ↓
Relatório
 ↓
Notificações

7.3 Otimizações

Adicionar:

 cache;

 retry;

 rate limit;

 logs;

 métricas.

Nova estrutura recomendada para o Lovable

FASE 1
Fundação

FASE 2
Banco

FASE 3
Arquitetura de coleta

FASE 4
Primeiro scraper

FASE 5
Demais scrapers

FASE 6
Motor de filtros

FASE 7
Configuração de filtros do usuário

FASE 8
Busca histórica

FASE 9
Relatórios

FASE 10
Sistema de notificações

FASE 11
Automação diária

FASE 12
Otimização e testes
