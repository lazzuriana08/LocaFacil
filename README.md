# CC7540 — LocaFácil API

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Componentes Implementados](#3-componentes-implementados)
3. [Interfaces Fornecidas e Requeridas](#4-interfaces-fornecidas-e-requeridas)
4. [Como a Comunicação Ocorre entre os Componentes](#5-como-a-comunicação-ocorre-entre-os-componentes)
5. [Como o Acoplamento Direto Foi Evitado](#6-como-o-acoplamento-direto-foi-evitado)
6. [Estrutura de Pastas](#7-estrutura-de-pastas)
7. [Instruções para Execução](#8-instruções-para-execução)
8. [Endpoints da API](#9-endpoints-da-api)

---

## 1. Visão Geral do Projeto

A **LocaFácil API** é uma plataforma de locação de veículos e equipamentos eletrônicos. O backend é construído em **Node.js + Express** com banco de dados **PostgreSQL**.

A arquitetura segue o princípio de **comunicação exclusivamente por interfaces**: nenhum componente conhece a implementação concreta de outro — apenas o contrato definido pela interface.

---


## 2. Componentes Implementados

### Componente 1 — `LocacaoComponent`

**Arquivo:** `src/components/LocacaoComponent.js`

Responsável pelo ciclo de vida completo do contrato de aluguel. Orquestra a verificação de disponibilidade do produto, cálculo de preços e criação do registro de locação no banco de dados.

| | |
|---|---|
| **Interface fornecida** | `LocacaoService` |
| **Interfaces requeridas** | `ProdutoService`, `SeguroService` |
| **Métodos do contrato** | `iniciarLocacao()`, `registrarLocacao()`, `consultarHistorico()` |

**Responsabilidades:**
- Verificar disponibilidade do produto via `ProdutoService`
- Calcular o total de dias e preço final (incluindo seguro opcional)
- Registrar o contrato de locação no banco
- Consultar o histórico de locações de um usuário

---

### Componente 2 — `PagamentoComponent`

**Arquivo:** `src/components/PagamentoComponent.js`

Responsável pelo processamento financeiro das locações. Simula a comunicação com um gateway de pagamento externo, validando o estado da locação antes de confirmar o pagamento.

| | |
|---|---|
| **Interface fornecida** | `PagamentoService` |
| **Interfaces requeridas** | `LocacaoService` |
| **Métodos do contrato** | `processarPagamento()`, `confirmarPagamento()` |

**Responsabilidades:**
- Validar que a locação existe e não está cancelada
- Verificar que o pagamento não foi confirmado anteriormente (idempotência)
- Simular o processamento no gateway de pagamento
- Atualizar o status de pagamento da locação via `LocacaoService`

---

### Componente 3 — `ProdutoComponent`

**Arquivo:** `src/components/ProdutoComponent.js`

Gerencia o catálogo unificado de itens disponíveis para locação (veículos e eletrônicos).

| | |
|---|---|
| **Interface fornecida** | `ProdutoService` |
| **Interfaces requeridas** | nenhuma |
| **Métodos do contrato** | `visualizarProdutos()`, `obterDetalhesProduto()`, `verificarDisponibilidade()` |

---

### Componente 4 — `SeguroComponent`

**Arquivo:** `src/components/SeguroComponent.js`

Gerencia as apólices de seguro disponíveis para associação a uma locação.

| | |
|---|---|
| **Interface fornecida** | `SeguroService` |
| **Interfaces requeridas** | nenhuma |
| **Métodos do contrato** | `listarOpcoesSeguro()`, `vincularSeguro()` |

---

## 3. Interfaces Fornecidas e Requeridas

### Interfaces Fornecidas (o que cada componente expõe)

#### `ProdutoService` — `src/interfaces/ProdutoService.js`
```js
visualizarProdutos()                        // lista todos os produtos disponíveis
obterDetalhesProduto(idProduto, tipo)       // retorna detalhes de um produto
verificarDisponibilidade(idProduto, tipo)   // verifica se o produto está disponível
```

#### `SeguroService` — `src/interfaces/SeguroService.js`
```js
listarOpcoesSeguro()                    // lista apólices disponíveis
vincularSeguro(idLocacao, idSeguro)     // valida e associa um seguro a uma locação
```

#### `LocacaoService` — `src/interfaces/LocacaoService.js`
```js
iniciarLocacao(idUsuario, idProduto, prazo)   // cria e registra a locação
registrarLocacao(dadosLocacao)               // persiste o contrato no banco
consultarHistorico(idUsuario)               // retorna as locações de um usuário
```

#### `PagamentoService` — `src/interfaces/PagamentoService.js`
```js
processarPagamento(idLocacao, dadosPagamento)   // valida e processa o pagamento
confirmarPagamento(idTransacao)                // confirma o status no banco
```

---

### Interfaces Requeridas por componente

| Componente | Requer |
|---|---|
| `ProdutoComponent` | — (nenhuma) |
| `SeguroComponent` | — (nenhuma) |
| `LocacaoComponent` | `ProdutoService`, `SeguroService` |
| `PagamentoComponent` | `LocacaoService` |

---

## 4. Como a Comunicação Ocorre entre os Componentes

A comunicação entre componentes **nunca ocorre diretamente** — sempre passa pela interface.

### Exemplo: `LocacaoComponent` solicitando verificação de disponibilidade

```
Rota POST /api/rentals
        │
        ▼
locacaoService.iniciarLocacao(idUsuario, idProduto, prazo)
        │
        │  LocacaoComponent chama apenas métodos de ProdutoService:
        ▼
produtoService.verificarDisponibilidade(idProduto, tipo)
produtoService.obterDetalhesProduto(idProduto, tipo)
        │
        ▼
   ProdutoComponent executa a lógica concreta
   (acessa Vehicle ou Electronic model conforme o tipo)
```

### Exemplo: `PagamentoComponent` confirmando pagamento

```
Rota POST /api/rentals/:id/payment
        │
        ▼
pagamentoService.processarPagamento(idLocacao, dados)
        │
        │  PagamentoComponent chama apenas métodos de LocacaoService:
        ▼
locacaoService.buscarLocacao(idLocacao)      ← valida existência
locacaoService.atualizarPagamento(id, status) ← confirma pagamento
        │
        ▼
   LocacaoComponent executa a lógica concreta
   (acessa RentalModel no banco)
```

### Mecanismo de Injeção de Dependência

A injeção ocorre via `require` de módulos singleton. Cada componente exporta `new Component()` (uma única instância), e os componentes dependentes a recebem no momento do carregamento do módulo:

```js
// LocacaoComponent.js — recebe as dependências injetadas
const produtoService = require('./ProdutoComponent');  // ← injeção de ProdutoService
const seguroService  = require('./SeguroComponent');   // ← injeção de SeguroService

class LocacaoComponent extends LocacaoService {
  async iniciarLocacao(idUsuario, idProduto, prazo) {
    // usa apenas a interface — não sabe que é um "ProdutoComponent"
    const disponivel = await produtoService.verificarDisponibilidade(idProduto, prazo.tipo);
    const produto    = await produtoService.obterDetalhesProduto(idProduto, prazo.tipo);
    ...
  }
}
```

```js
// PagamentoComponent.js — recebe LocacaoService injetado
const locacaoService = require('./LocacaoComponent');  // ← injeção de LocacaoService

class PagamentoComponent extends PagamentoService {
  async processarPagamento(idLocacao, dadosPagamento) {
    // usa apenas métodos do contrato LocacaoService
    const locacao = await locacaoService.buscarLocacao(idLocacao);
    ...
  }
}
```

---

## 5. Como o Acoplamento Direto Foi Evitado

### Problema do acoplamento direto

Sem interfaces, um componente precisaria conhecer a classe concreta da qual depende:

```js
// ❌ acoplamento direto — proibido nesta arquitetura
const ProdutoComponent = require('./ProdutoComponent');
const comp = new ProdutoComponent(); // LocacaoComponent conhece a implementação
```

### Solução adotada

Cada componente depende **apenas do contrato** (interface), não da implementação:

```js
// ✅ comunicação via interface — a classe concreta é injetada externamente
const produtoService = require('./ProdutoComponent'); // recebe um objeto já instanciado
// LocacaoComponent só enxerga os métodos de ProdutoService
```

O `LocacaoComponent` nunca instancia `ProdutoComponent` diretamente — ele recebe uma instância pronta via `require`, e chama apenas os métodos definidos na interface `ProdutoService`. Se amanhã `ProdutoComponent` for substituído por outra implementação que respeite os mesmos métodos, `LocacaoComponent` **não precisa mudar nada**.

### Benefícios obtidos

| Princípio | Aplicação no projeto |
|---|---|
| **Baixo acoplamento** | Componentes dependem de interfaces, não de classes concretas |
| **Alta coesão** | Cada componente tem uma responsabilidade clara e isolada |
| **Substituibilidade** | Qualquer implementação pode ser trocada sem alterar os clientes |
| **Testabilidade** | É possível injetar mocks das interfaces nos testes |

---

## 6. Estrutura de Pastas

```
src/
├── interfaces/               ← contratos abstratos (<<interface>>)
│   ├── ProdutoService.js       fornecida por ProdutoComponent
│   ├── SeguroService.js        fornecida por SeguroComponent
│   ├── LocacaoService.js       fornecida por LocacaoComponent
│   └── PagamentoService.js     fornecida por PagamentoComponent
│
├── components/               ← implementações concretas
│   ├── ProdutoComponent.js     extends ProdutoService | requer: nenhuma
│   ├── SeguroComponent.js      extends SeguroService  | requer: nenhuma
│   ├── LocacaoComponent.js     extends LocacaoService | requer: ProdutoService, SeguroService
│   └── PagamentoComponent.js   extends PagamentoService | requer: LocacaoService
│
├── models/                   ← acesso ao banco de dados (PostgreSQL)
│   ├── Vehicle.js
│   ├── Electronic.js
│   ├── Insurance.js
│   ├── Rental.js
│   └── User.js
│
├── routes/                   ← clientes das interfaces (Express Router)
│   ├── vehicles.js             cliente de ProdutoService
│   ├── electronics.js          cliente de ProdutoService
│   ├── insurance.js            cliente de SeguroService
│   ├── rentals.js              cliente de LocacaoService + PagamentoService
│   ├── auth.js
│   └── users.js
│
├── middlewares/
│   └── auth.js               ← autenticação JWT
│
├── config/
│   └── database.js           ← conexão com PostgreSQL
│
├── database/
│   ├── migrate.js
│   └── migrations/
│       ├── 001_create_tables.sql
│       ├── 002_seed_data.sql
│       └── 003_admin_user.sql
│
└── index.js                  ← ponto de entrada da aplicação
```

---

## 7. Instruções para Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd CC7540-LocaFacil_API_MAIN
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/locafacil
JWT_SECRET=sua_chave_secreta_aqui
PORT=5000
NODE_ENV=development
```

### 4. Criar e popular o banco de dados

```bash
npm run migrate
```

Este comando executa os scripts em `src/database/migrations/` na ordem:
- `001_create_tables.sql` — cria as tabelas
- `002_seed_data.sql` — insere dados de exemplo
- `003_admin_user.sql` — cria usuário administrador padrão

### 5. Iniciar o servidor

```bash
# Produção
npm start

# Desenvolvimento (com hot reload)
npm run dev
```

O servidor estará disponível em: `http://localhost:5000`

Verificar se está rodando: `GET http://localhost:5000/health`

---

## 8. Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastrar novo usuário |
| POST | `/api/auth/login` | Fazer login e obter token JWT |

### Produtos — Veículos (`ProdutoService`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/vehicles` | Listar todos os veículos | — |
| GET | `/api/vehicles/available` | Listar veículos disponíveis | — |
| GET | `/api/vehicles/:id` | Detalhes de um veículo | — |
| POST | `/api/vehicles` | Criar veículo | Admin |
| PUT | `/api/vehicles/:id` | Atualizar veículo | Admin |
| DELETE | `/api/vehicles/:id` | Remover veículo | Admin |

### Produtos — Eletrônicos (`ProdutoService`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/electronics` | Listar todos os eletrônicos | — |
| GET | `/api/electronics/available` | Listar disponíveis | — |
| GET | `/api/electronics/:id` | Detalhes de um eletrônico | — |
| POST | `/api/electronics` | Criar eletrônico | Admin |
| PUT | `/api/electronics/:id` | Atualizar eletrônico | Admin |
| DELETE | `/api/electronics/:id` | Remover eletrônico | Admin |

### Seguros (`SeguroService`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/insurance` | Listar opções de seguro | — |
| GET | `/api/insurance/:id` | Detalhes de um seguro | — |
| POST | `/api/insurance` | Criar seguro | Admin |
| PUT | `/api/insurance/:id` | Atualizar seguro | Admin |

### Locações (`LocacaoService` + `PagamentoService`)
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/api/rentals` | Criar nova locação | Usuário |
| GET | `/api/rentals/user/my-rentals` | Histórico do usuário | Usuário |
| GET | `/api/rentals/:id` | Detalhes de uma locação | Usuário/Admin |
| POST | `/api/rentals/:id/payment` | Processar pagamento | Usuário |
| POST | `/api/rentals/:id/cancel` | Cancelar locação | Usuário |
| GET | `/api/rentals` | Listar todas as locações | Admin |

