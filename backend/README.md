# Fluxo

## 1. Cadastro de Usuário

```
Usuário → Preenche formulário → Cria conta em "users"
```

O usuário cria uma conta com dados básicos: nome, e-mail, telefone e senha.
É criado um registro na tabela `users` com:

* status inicial `ativo`
* `email_verificado` e `telefone_verificado` definidos como `FALSE`

O usuário pode navegar no sistema, mas ainda não possui uma loja vinculada.

---

## 2. Criação da Loja

```
Usuário (ex: João) → Acessa painel → Cria loja
```

O usuário cria uma loja informando dados como:

* nome comercial
* descrição
* logotipo
* endereço comercial
* categoria principal

É criado um registro na tabela `lojas` com:

* `proprietario_id` referenciando `users.id`
* `status = 'pendente'`

A loja não aparece no marketplace até aprovação do administrador.

---

## 3. Aprovação da Loja

```
Administrador → Revisa lojas pendentes → Aprova ou Rejeita
```

O administrador avalia as informações enviadas.

* Se aprovada: `status = 'ativa'`
* Se rejeitada: `status = 'rejeitada'`

Somente lojas com status `ativa` podem cadastrar produtos e vender.

---

## 4. Cadastro de Produtos

```
Loja ativa → Proprietário cadastra produtos → Tabela "produtos"
```

O vendedor cadastra produtos com informações como:

* título, descrição, categoria, preço, estoque
* dimensões físicas (`altura_cm`, `largura_cm`, `profundidade_cm`, `peso_kg`)
* identificadores de controle (`sku`, `codigo_barras`)

**Sobre o SKU:**
SKU (Stock Keeping Unit) é um identificador único para controle interno de estoque.
Permite distinguir produtos semelhantes, por exemplo:

* Camisa Vermelha M
* Camisa Azul G

Cada produto pertence a um vendedor (`vendedor_id` → `users.id`) e pode ter uma ou várias variações.

---

## 5. Variações de Produtos

```
Produto → Pode ter múltiplas variações → "produto_variacoes"
```

Cada variação representa uma opção do mesmo produto (exemplo: cor ou tamanho).
Campos principais:

* `sku` próprio
* `preco_adicional`
* `quantidade_estoque`
* `atributos` armazenados como JSONB

Isso permite reutilizar um mesmo produto base com diferentes combinações.

---

## 6. Adição ao Carrinho

```
Cliente → Adiciona produto ao carrinho → "carrinho_itens"
```

Cada item no carrinho contém:

* `user_id` (comprador)
* `produto_id` e `variacao_id`
* `quantidade`

Se o produto já estiver no carrinho, a quantidade é atualizada.
O carrinho é persistido por usuário.

---

## 7. Criação do Pedido

```
Cliente → Finaliza compra → Cria pedido em "pedidos"
```

O pedido contém:

* `comprador_id` e `vendedor_id`
* valores: `subtotal`, `frete`, `desconto`, `total`
* `status_pagamento` e `status` de entrega
* `endereco_entrega` (armazenado como JSONB)
* `metodo_pagamento_id` (referência à tabela `metodos_pagamento`)

**Sobre o fluxo do pedido:**
O pedido passa por estados controlados:

```
pendente → confirmado → preparando → enviado → entregue
```

Pagamentos e entregas atualizam os timestamps correspondentes:
`confirmado_em`, `pago_em`, `enviado_em`, `entregue_em`.

---

## 8. Pagamento

```
Sistema → Usa tabela "metodos_pagamento" → Registra pagamento
```

A tabela `metodos_pagamento` define todas as formas de pagamento disponíveis (cartão, transferência, etc).
Cada pedido referencia o método utilizado.
O status muda de:

```
pendente → pago → enviado → entregue
```

---

## 9. Pós-Venda e Administração

```
Administrador → Monitora lojas, produtos, pedidos e pagamentos
Usuário → Pode suspender loja ou conta
```

Controles principais:

* `users.status` → define se o usuário pode acessar o sistema
* `lojas.status` → define se a loja pode operar (ativa, suspensa, pendente, rejeitada)
* auditoria e métricas podem ser implementadas via triggers ou views

---

## 10. Resumo do Fluxo

```
Usuário → Cria conta → Cria loja → Loja pendente
→ Administrador aprova → Loja ativa → Cadastra produtos
→ Cliente adiciona ao carrinho → Cria pedido
→ Paga → Pedido entregue
```
