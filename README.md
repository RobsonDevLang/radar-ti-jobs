# Radar TI Jobs

Quero desenvolver uma aplicação web chamada Radar Concursos TI.

O objetivo da aplicação é monitorar automaticamente concursos públicos voltados para profissionais de Tecnologia da Informação, enviando notificações por e-mail e WhatsApp quando forem encontrados novos concursos compatíveis com os filtros definidos pelo usuário.

Importante

Quero que o projeto seja desenvolvido em fases, concluindo e validando cada etapa antes de iniciar a próxima.

Antes de gerar qualquer código, apresente:

arquitetura do sistema;

estrutura das pastas;

modelagem do banco de dados;

fluxo completo da aplicação;

APIs necessárias;

cronograma das fases de desenvolvimento.

Após minha aprovação, implemente apenas uma fase por vez.

Não avance para a próxima fase sem minha confirmação.

Fase 1

Criar a estrutura completa do projeto.

Utilizar:

React

TypeScript

Tailwind CSS

Node.js

PostgreSQL (Supabase)

Prisma ORM

API REST

Docker

JWT para autenticação

Nesta fase criar apenas:

estrutura do frontend;

estrutura do backend;

configuração do banco;

autenticação;

cadastro de usuários;

login;

recuperação de senha;

configuração do ambiente.

Nenhum scraper deve ser implementado nesta fase.

Fase 2

Implementar o banco de dados.

Criar as tabelas para:

usuários;

concursos;

histórico de consultas;

histórico de notificações;

filtros dos usuários;

logs de execução.

Evitar registros duplicados.

Utilizar Prisma ORM.

Fase 3

Criar o módulo de coleta de concursos.

A arquitetura deve permitir adicionar novos sites facilmente.

Cada site deve possuir um scraper independente.

Inicialmente pesquisar os seguintes sites:

PCI Concursos;

Ache Concursos;

JC Concursos;

Estratégia Concursos;

Gran Concursos;

Direção Concursos;

Concurso em Foco;

Folha Dirigida / QConcursos.

Caso algum site possua API oficial, utilizá-la. Caso contrário, implementar scraping respeitando os termos de uso e limites de acesso.

Salvar todas as informações encontradas no banco.

Fase 4

Criar o mecanismo de filtros.

A aplicação deve localizar apenas concursos em:

Porto Alegre

A estrutura deve permitir adicionar outras cidades futuramente.

Os cargos aceitos são:

Analista de Sistemas

Desenvolvedor de Software

Desenvolvedor Backend

Desenvolvedor Full Stack

Programador

Engenheiro de Software

Analista de Desenvolvimento

Analista de TI

Analista de Tecnologia da Informação

Administrador de Banco de Dados

DBA

Cientista de Dados

Analista de Dados

Descartar automaticamente concursos que:

exijam CNH como requisito obrigatório;

exijam pós-graduação obrigatória;

não sejam da área de Tecnologia da Informação.

Fase 5

Implementar a primeira execução.

Ao executar pela primeira vez, pesquisar concursos publicados nos últimos 6 meses.

Gerar um relatório contendo:

órgão;

cargo;

salário;

quantidade de vagas;

cadastro reserva;

escolaridade;

requisitos;

cidade;

estado;

banca organizadora;

data de publicação;

data final das inscrições;

situação do concurso;

link oficial do edital;

link da notícia.

Salvar quais concursos já foram enviados ao usuário.

Fase 6

Criar o sistema de notificações.

Enviar o relatório por:

e-mail;

WhatsApp.

Permitir integração com:

E-mail:

SMTP;

Resend;

SendGrid.

WhatsApp:

Meta WhatsApp Cloud API;

Evolution API.

A implementação deve permitir trocar facilmente o provedor.

Fase 7

Criar o monitoramento automático.

Todos os dias às 09:00 da manhã, executar automaticamente:

consultar todos os sites;

identificar apenas concursos novos;

ignorar concursos já enviados anteriormente;

enviar apenas as novidades.

Caso não exista nenhum concurso novo, não enviar mensagem.

Cadastro do usuário

Cada usuário poderá configurar:

e-mail;

número de WhatsApp;

cidade;

estado;

palavras-chave desejadas;

palavras-chave bloqueadas;

horário de envio;

receber relatório diário ou apenas novidades.

Requisitos técnicos

Código limpo.

Arquitetura em camadas.

Componentes reutilizáveis.

Serviços desacoplados.

Testes unitários.

Tratamento de erros.

Retry automático em falhas temporárias.

Cache para evitar consultas repetidas.

Rate limiting para não sobrecarregar os sites.

Logs estruturados.

Toda a arquitetura deve ser preparada para facilitar a inclusão de novos sites de concursos no futuro.

Sempre explique o que será desenvolvido em cada fase antes de gerar código. Aguarde minha aprovação antes de prosseguir para a próxima etapa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/261daa32-0c50-4e32-b29f-539d0534ab5e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
