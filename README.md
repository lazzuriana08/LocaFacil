# CC7540 — LocaFácil API

> **Laboratório 4 — Componentes, Interfaces e Injeção de Dependência**  
> Disciplina: CC7540 | Node.js + PostgreSQL + Express

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Arquitetura Implementada](#2-arquitetura-implementada)
3. [Componentes Implementados](#3-componentes-implementados)
4. [Interfaces Fornecidas e Requeridas](#4-interfaces-fornecidas-e-requeridas)
5. [Como a Comunicação Ocorre entre os Componentes](#5-como-a-comunicação-ocorre-entre-os-componentes)
6. [Como o Acoplamento Direto Foi Evitado](#6-como-o-acoplamento-direto-foi-evitado)
7. [Estrutura de Pastas](#7-estrutura-de-pastas)
8. [Instruções para Execução](#8-instruções-para-execução)
9. [Como Testar a Aplicação](#9-como-testar-a-aplicação)
10. [Endpoints da API](#10-endpoints-da-api)

---

## 1. Visão Geral do Projeto

A **LocaFácil API** é uma plataforma de locação de veículos e equipamentos eletrônicos. O backend é construído em **Node.js + Express** com banco de dados **PostgreSQL**.

A arquitetura segue o princípio de **comunicação exclusivamente por interfaces**: nenhum componente conhece a implementação concreta de outro — apenas o contrato definido pela interface.

---

## 2. Arquitetura Implementada

O sistema é dividido em três camadas:

```
┌─────────────────────────────────────────────────────┐
│                   CAMADA DE ROTAS                   │
│  (clientes das interfaces — não conhecem a impl.)   │
│  vehicles.js  electronics.js  insurance.js          │
│  rentals.js                                         │
└────────────────────┬────────────────────────────────┘
                     │ usa apenas a interface
┌────────────────────▼────────────────────────────────┐
│                CAMADA DE COMPONENTES                │
│           (implementações concretas)                │
│  ProdutoComponent   SeguroComponent                 │
│  LocacaoComponent   PagamentoComponent              │
└────────────────────┬────────────────────────────────┘
                     │ implementam / extends
┌────────────────────▼────────────────────────────────┐
│                CAMADA DE INTERFACES                 │
│            (contratos abstratos — <<interface>>)    │
│  ProdutoService   SeguroService                     │
│  LocacaoService   PagamentoService                  │
└─────────────────────────────────────────────────────┘
```

### Diagrama de Dependência entre Componentes

```
                 ┌─────────────────┐
                 │ ProdutoComponent│──── fornece ──▶ ProdutoService
                 └────────┬────────┘
                          │ injetado via require
                 ┌────────▼────────┐
                 │ SeguroComponent │──── fornece ──▶ SeguroService
                 └────────┬────────┘
                          │ injetado via require
                 ┌────────▼────────┐
                 │LocacaoComponent │──── fornece ──▶ LocacaoService
                 │                 │◀─── requer  ─── ProdutoService
                 │                 │◀─── requer  ─── SeguroService
                 └────────┬────────┘
                          │ injetado via require
                 ┌────────▼──────────┐
                 │PagamentoComponent │── fornece ──▶ PagamentoService
                 │                   │◀─ requer  ─── LocacaoService
                 └───────────────────┘
```

---

## 3. Componentes Implementados

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

## 4. Interfaces Fornecidas e Requeridas

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

## 5. Como a Comunicação Ocorre entre os Componentes

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

## 6. Como o Acoplamento Direto Foi Evitado

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

## 7. Estrutura de Pastas

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

## 8. Instruções para Execução

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior

### Observação sobre conexão com banco

O arquivo `src/config/database.js` utiliza conexão PostgreSQL com SSL habilitado. Isso funciona bem em bancos hospedados em nuvem. Se o teste for feito com PostgreSQL local e a instância não aceitar SSL, a conexão pode falhar. Nesse cenário, será necessário ajustar a configuração de conexão antes de executar a aplicação.

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
DATABASE_URL=postgresql://usuario:senha@host:5432/locafacil
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
- `003_admin_user.sql` — cria registro de usuário administrador padrão

Observação: o arquivo `003_admin_user.sql` contém um hash placeholder para a senha do administrador. Portanto, após rodar as migrations, o fluxo mais confiável de teste é registrar um usuário novo via API. As rotas administrativas só ficam totalmente testáveis depois que existir um usuário com `is_admin = true` e senha válida no banco.

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

## 9. Como Testar a Aplicação

### 1. Verificar o health check

Requisição:

```http
GET /health
```

Resposta esperada:

```json
{ "status": "API LocaFácil is running" }
```

### 2. Registrar um usuário

Requisição:

```http
POST /api/auth/register
Content-Type: application/json
```

Exemplo de body:

```json
{
        "name": "Teste Usuario",
        "email": "teste@locafacil.com",
        "password": "123456",
        "phone": "11999999999",
        "cpf": "12345678900"
}
```

### 3. Fazer login para obter token JWT

Requisição:

```http
POST /api/auth/login
Content-Type: application/json
```

Exemplo de body:

```json
{
        "email": "teste@locafacil.com",
        "password": "123456"
}
```

O token retornado deve ser enviado nas rotas protegidas no header:

```http
Authorization: Bearer SEU_TOKEN
```

### 4. Testar as rotas públicas

- `GET /api/vehicles`
- `GET /api/vehicles/available`
- `GET /api/electronics`
- `GET /api/electronics/available`
- `GET /api/insurance`

Essas rotas não exigem autenticação e permitem validar o catálogo inicial inserido nas migrations.

### 5. Testar o fluxo principal do laboratório

O fluxo principal que demonstra comunicação por interfaces é:

1. Consultar produtos disponíveis
2. Criar uma locação
3. Consultar o histórico de locações do usuário
4. Processar o pagamento da locação

Exemplo de criação de locação com veículo:

```http
POST /api/rentals
Authorization: Bearer SEU_TOKEN
Content-Type: application/json
```

```json
{
        "vehicle_id": 1,
        "start_date": "2026-03-20",
        "end_date": "2026-03-22",
        "insurance_selected": true,
        "insurance_price": 25
}
```

Exemplo de criação de locação com eletrônico:

```json
{
        "electronic_id": 1,
        "start_date": "2026-03-20",
        "end_date": "2026-03-22",
        "insurance_selected": false,
        "insurance_price": 0
}
```

Depois disso, testar:

- `GET /api/rentals/user/my-rentals`
- `GET /api/rentals/:id`
- `POST /api/rentals/:id/payment`
- `POST /api/rentals/:id/cancel`

### 6. Testar perfil do usuário autenticado

Requisição:

```http
GET /api/auth/profile
Authorization: Bearer SEU_TOKEN
```

### 7. Testar rotas administrativas

As rotas administrativas exigem um usuário com `is_admin = true`.

Rotas administrativas disponíveis:

- `POST /api/vehicles`
- `PUT /api/vehicles/:id`
- `DELETE /api/vehicles/:id`
- `POST /api/electronics`
- `PUT /api/electronics/:id`
- `DELETE /api/electronics/:id`
- `POST /api/insurance`
- `PUT /api/insurance/:id`
- `GET /api/rentals`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users/:userId/make-admin`
- `DELETE /api/users/:userId/deactivate`

Observação: como o seed do admin usa senha placeholder, essas rotas podem exigir ajuste manual no banco ou criação de um usuário com privilégios administrativos para teste completo.

---

## 10. Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastrar novo usuário |
| POST | `/api/auth/login` | Fazer login e obter token JWT |
| GET | `/api/auth/profile` | Retornar perfil do usuário autenticado |

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

### Usuários
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/api/users` | Listar usuários | Admin |
| GET | `/api/users/:id` | Buscar usuário por ID | Admin |
| POST | `/api/users/:userId/make-admin` | Promover usuário para administrador | Admin |
| DELETE | `/api/users/:userId/deactivate` | Desativar usuário | Admin |
| PUT | `/api/users/profile` | Atualizar perfil do usuário autenticado | Usuário |

