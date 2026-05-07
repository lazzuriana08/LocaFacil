# Entregável — Modelagem de Processo TO-BE e Requisitos

> **Disciplina:** CC7540  
> **Sistema:** LocaFácil — Plataforma de Locação de Veículos e Equipamentos Eletrônicos  
> **Processo de negócio modelado:** Processo de Locação de Produto (TO-BE)

---

## Sumário

1. [Processo de Negócio Selecionado](#1-processo-de-negócio-selecionado)
2. [Diagrama BPMN TO-BE](#2-diagrama-bpmn-to-be)
3. [Descrição das Atividades do Processo](#3-descrição-das-atividades-do-processo)
4. [Regras de Negócio](#4-regras-de-negócio)
5. [Diagrama de Casos de Uso](#5-diagrama-de-casos-de-uso)
6. [Requisitos Não Funcionais](#6-requisitos-não-funcionais)

---

## 1. Processo de Negócio Selecionado

**Nome do processo:** Processo de Locação de Produto  
**Escopo:** Cobre desde a busca de um produto pelo cliente até o encerramento do contrato após a devolução.

### Justificativa

O processo de locação foi selecionado por reunir todas as características solicitadas:

| Característica | Como aparece no processo |
|---|---|
| Várias etapas | Busca → Seleção → Verificação → Período → Seguro → Cálculo → Confirmação → Pagamento → Devolução → Encerramento |
| Decisões | Produto disponível? / Deseja seguro? / Cliente confirma? / Pagamento aprovado? / Item danificado? |
| Manipulação de dados | Cria/atualiza registros de locação, produto, seguro, pagamento e usuário no banco |
| Regras de negócio | Período mínimo, cálculo de total, idempotência de pagamento, cobrança de dano etc. |
| Integrações externas | Gateway de pagamento externo via mensageria |

---

## 2. Diagrama BPMN TO-BE

> **Arquivo:** `docs/processo_negocio_tobe.bpmn`  
> O diagrama foi modelado em BPMN 2.0 e pode ser aberto em ferramentas como **Camunda Modeler**, **draw.io** (modo BPMN) ou **bpmn.io**.

### Estrutura do diagrama

```
Pool: LocaFácil — Processo de Locação
├── Lane: Cliente
└── Lane: Sistema LocaFácil

Pool participante: Gateway de Pagamento Externo
```

### Visão textual do fluxo principal

```
[Início]
   │
   ▼
[T01] Buscar produtos disponíveis  (Cliente)
   │
   ▼
[T02] Selecionar produto e visualizar detalhes  (Cliente)
   │
   ▼
[T03] Verificar disponibilidade em tempo real  (Sistema)
   │
   ▼
[GW1] Produto disponível?
   ├── Não → [T03b] Notificar indisponibilidade → [Fim: produto indisponível]
   └── Sim ↓
[T04] Informar data de início e data de devolução  (Cliente)
   │
   ▼
[GW2] Deseja contratar seguro?
   ├── Sim → [T05] Selecionar plano de seguro → [T06]
   └── Não ──────────────────────────────────→ [T06]
[T06] Calcular valor total da locação  (Sistema)
   │
   ▼
[T07] Revisar resumo e confirmar locação  (Cliente)
   │
   ▼
[GW3] Cliente confirma?
   ├── Não → [Fim: locação cancelada pelo cliente]
   └── Sim ↓
[T08] Registrar locação no banco (status: pendente_pagamento)  (Sistema)
   │
   ▼
[T09] Informar dados de pagamento  (Cliente)
   │
   ▼
[T10] Enviar solicitação ao gateway de pagamento  (Sistema)
   │  ←─ mensagem de retorno do Gateway Externo ─→
   ▼
[T11] Aguardar retorno do gateway
   │
   ▼
[GW4] Pagamento aprovado?
   ├── Não → [Fim: locação cancelada — pagamento recusado]
   └── Sim ↓
[T12] Confirmar locação (status: ativa)  (Sistema)
   │
   ▼
[T13] Enviar comprovante de locação por e-mail  (Sistema)
   │
   ▼
[Evento de tempo: fim do período contratado]
   │
   ▼
[T14] Cliente devolve o item
   │
   ▼
[T15] Inspecionar estado do item devolvido  (Sistema / Atendente)
   │
   ▼
[GW5] Item apresenta danos?
   ├── Sim → [T16] Calcular e cobrar taxa de dano → [T17]
   └── Não ──────────────────────────────────────→ [T17]
[T17] Atualizar disponibilidade do produto no catálogo  (Sistema)
   │
   ▼
[T18] Encerrar contrato de locação (status: concluída)  (Sistema)
   │
   ▼
[Fim: Locação concluída com sucesso]
```

---

## 3. Descrição das Atividades do Processo

| ID | Nome da Atividade | Responsável | Descrição Detalhada |
|---|---|---|---|
| T01 | Buscar produtos disponíveis | Cliente | O cliente acessa o catálogo e filtra itens por tipo (veículo ou eletrônico), categoria, faixa de preço e disponibilidade. O sistema retorna apenas produtos com status `disponível`. |
| T02 | Selecionar produto e visualizar detalhes | Cliente | O cliente escolhe o produto desejado. O sistema exibe descrição completa, especificações técnicas, preço diário, fotos e avaliações. |
| T03 | Verificar disponibilidade em tempo real | Sistema | O sistema consulta o banco de dados e confirma que o produto não possui reservas sobrepostas no período solicitado. |
| T03b | Notificar indisponibilidade ao cliente | Sistema | Caso o produto esteja indisponível, o sistema exibe mensagem explicativa e sugere produtos similares disponíveis. |
| T04 | Informar data de início e data de devolução | Cliente | O cliente define o período de locação. O sistema valida que a data inicial é igual ou posterior à data atual e que o período mínimo (RN03) é respeitado. |
| T05 | Selecionar plano de seguro | Cliente | O sistema lista as apólices disponíveis com descrição de cobertura e valor. O cliente escolhe um plano. Esta etapa é opcional (RN08 recomenda seguro para locações acima de 7 dias). |
| T06 | Calcular valor total da locação | Sistema | Aplica a fórmula: `total = (preço_diário × número_de_dias) + valor_seguro`. O seguro é somado apenas se contratado (RN04). |
| T07 | Revisar resumo e confirmar locação | Cliente | O sistema exibe o resumo completo: produto, período, seguro (se houver) e valor total. O cliente decide se confirma ou cancela. |
| T08 | Registrar locação no banco de dados | Sistema | Cria o registro de locação com status `pendente_pagamento`, bloqueia o produto para evitar reservas duplicadas (RN08) e gera identificador único de contrato. |
| T09 | Informar dados de pagamento | Cliente | O cliente fornece dados do cartão de crédito/débito ou seleciona outro método aceito pelo sistema. |
| T10 | Enviar solicitação ao gateway de pagamento | Sistema | O sistema encaminha os dados ao gateway externo via HTTPS/TLS. Dados de cartão não são armazenados localmente (RNF02). |
| T11 | Aguardar retorno do gateway de pagamento | Sistema | Evento de mensagem intermediário: o sistema aguarda a resposta de aprovação ou recusa enviada pelo gateway externo via mensageria assíncrona. |
| T12 | Confirmar locação (status: ativa) | Sistema | Atualiza o status para `ativa`, vincula o seguro contratado e emite o número do contrato. Satisfaz RN05. |
| T13 | Enviar comprovante de locação por e-mail | Sistema | Envia ao cliente um e-mail com número do contrato, produto, período, valor total e instruções de retirada. |
| T14 | Cliente devolve o item | Cliente | Ao fim do período contratado, o cliente devolve o item ao ponto de entrega. |
| T15 | Inspecionar estado do item devolvido | Sistema / Atendente | O atendente registra a devolução e verifica visualmente e via sistema se o item apresenta danos ou avarias não previstas. |
| T16 | Calcular e cobrar taxa de dano | Sistema | Calcula a taxa de dano conforme tabela de depreciação e aciona cobrança adicional (RN09). |
| T17 | Atualizar disponibilidade do produto no catálogo | Sistema | Altera o status do produto para `disponível`, tornando-o elegível para novas locações (RN07). |
| T18 | Encerrar contrato de locação | Sistema | Atualiza o status da locação para `concluída` e persiste o registro no histórico do cliente. |

---

## 4. Regras de Negócio

| ID | Regra de Negócio | Atividade relacionada |
|---|---|---|
| **RN01** | O cliente deve possuir cadastro ativo e estar autenticado no sistema para realizar uma locação. | T07, T08 |
| **RN02** | A disponibilidade do produto é verificada em tempo real no momento da seleção; dois clientes não podem reservar o mesmo produto simultaneamente para períodos sobrepostos. | T03, T08 |
| **RN03** | O período mínimo de locação é de **1 (um) dia**. Datas de início e devolução no mesmo dia não são permitidas. | T04 |
| **RN04** | O valor total da locação é calculado pela fórmula: `total = (preço_diário × número_de_dias) + valor_seguro`. O seguro só é somado se contratado pelo cliente. | T06 |
| **RN05** | A locação somente é confirmada (status `ativa`) após a aprovação do pagamento pelo gateway externo. | T12 |
| **RN06** | Caso o pagamento seja recusado pelo gateway, a locação é automaticamente cancelada e o produto retorna ao status `disponível`. | GW4, T10 |
| **RN07** | O produto só retorna ao catálogo como `disponível` após a devolução registrada e a conclusão da inspeção, independentemente do resultado. | T17 |
| **RN08** | O sistema não permite a criação de duas locações ativas para o mesmo produto com períodos sobrepostos. Ao registrar uma locação, o produto é bloqueado para o período contratado. | T08 |
| **RN09** | Em caso de dano ao item devolvido, uma taxa adicional é calculada conforme tabela de depreciação vigente e cobrada do cliente responsável. | T16 |
| **RN10** | A contratação de seguro é recomendada (mas não obrigatória) para locações com duração superior a 7 (sete) dias. O sistema deve exibir alerta informativo nesse caso. | T05 |

---

## 5. Diagrama de Casos de Uso

> **Arquivo:** `docs/casos_de_uso.puml`  
> O diagrama está em notação UML e pode ser renderizado com **PlantUML** (plugin de IDE, servidor online em plantuml.com ou CLI).

### Atores

| Ator | Tipo | Descrição |
|---|---|---|
| **Cliente** | Primário | Usuário final que realiza locações, efetua pagamentos e devolve itens. |
| **Administrador** | Primário | Usuário interno que gerencia o catálogo de produtos, usuários, seguros e acompanha relatórios. |
| **Gateway de Pagamento** | Secundário (sistema externo) | Sistema externo que processa e autoriza transações financeiras. |

### Lista de Casos de Uso

| UC | Nome | Ator(es) | Relacionamentos |
|---|---|---|---|
| UC01 | Registrar-se no sistema | Cliente | — |
| UC02 | Fazer login | Cliente, Administrador | — |
| UC03 | Recuperar senha | Cliente | — |
| UC04 | Visualizar catálogo de produtos | Cliente | — |
| UC05 | Filtrar produtos disponíveis | Cliente | — |
| UC06 | Visualizar detalhes do produto | Cliente | — |
| UC07 | Iniciar locação | Cliente | `<<include>>` UC08, UC09, UC11 |
| UC08 | Verificar disponibilidade | Sistema (interno) | Incluso em UC07 |
| UC09 | Selecionar período de locação | Cliente | Incluso em UC07 |
| UC10 | Contratar seguro opcional | Cliente | `<<extend>>` UC11 |
| UC11 | Calcular valor total | Sistema (interno) | Incluso em UC07; estendido por UC10 |
| UC12 | Confirmar locação | Cliente | `<<include>>` UC14 |
| UC13 | Cancelar locação | Cliente | Incluso em UC16 |
| UC14 | Processar pagamento | Cliente, Gateway | `<<include>>` UC15; `<<extend>>` UC26 |
| UC15 | Confirmar pagamento | Gateway de Pagamento | Incluso em UC14 |
| UC16 | Cancelar por pagamento recusado | Gateway de Pagamento | `<<include>>` UC13 |
| UC17 | Consultar histórico de locações | Cliente | — |
| UC18 | Registrar devolução do item | Cliente | `<<include>>` UC19, UC21 |
| UC19 | Inspecionar item devolvido | Administrador | Incluso em UC18; estendido por UC20 |
| UC20 | Cobrar taxa por dano | Administrador | `<<extend>>` UC19 |
| UC21 | Atualizar disponibilidade | Sistema (interno) | Incluso em UC18 |
| UC22 | Gerenciar produtos (CRUD) | Administrador | — |
| UC23 | Gerenciar usuários | Administrador | — |
| UC24 | Gerenciar seguros | Administrador | — |
| UC25 | Visualizar relatórios de locação | Administrador | — |
| UC26 | Enviar comprovante por e-mail | Sistema (interno) | `<<extend>>` UC14 |

---

## 6. Requisitos Não Funcionais

| ID | Categoria | Descrição |
|---|---|---|
| **RNF01** | **Desempenho** | As requisições às rotas principais da API (listagem de produtos, criação de locação e consulta de histórico) devem retornar resposta em no máximo **2 segundos** sob carga normal de até 200 usuários simultâneos, medida em condições de rede estável. |
| **RNF02** | **Segurança** | Todas as comunicações entre o sistema e o gateway de pagamento externo devem ser realizadas exclusivamente via **HTTPS com TLS 1.2 ou superior**. Dados sensíveis de cartão de crédito não devem ser armazenados no banco de dados do sistema (conformidade com PCI-DSS). As senhas de usuários devem ser armazenadas com algoritmo de hash seguro (bcrypt, custo ≥ 10). |
| **RNF03** | **Disponibilidade** | O sistema deve estar disponível para os usuários por, no mínimo, **99,5% do tempo** em janela mensal, equivalente a menos de 3,65 horas de indisponibilidade por mês. Manutenções programadas devem ser comunicadas com antecedência mínima de 24 horas. |
| **RNF04** | **Escalabilidade** | A arquitetura do sistema deve suportar escalabilidade horizontal, permitindo adicionar novas instâncias do servidor sem reconfiguração da aplicação, de modo a atender picos de até **500 usuários simultâneos** sem degradação perceptível de desempenho. |
| **RNF05** | **Rastreabilidade e Auditoria** | Todas as operações de criação, confirmação e cancelamento de locações, bem como todas as transações de pagamento, devem ser registradas em log imutável com data/hora (timestamp UTC), identificador do usuário e status da operação, permitindo auditoria completa do ciclo de vida de cada contrato. |

---

## Arquivos do Repositório

| Arquivo | Descrição |
|---|---|
| `docs/processo_negocio_tobe.bpmn` | Diagrama BPMN 2.0 TO-BE (abrir em Camunda Modeler ou draw.io) |
| `docs/casos_de_uso.puml` | Diagrama de casos de uso em notação UML (PlantUML) |
| `docs/entregavel_lab5.md` | Este documento — entregável completo |
