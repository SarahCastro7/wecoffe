# Wecoffee - Guia de desenvolvimento

Este README serve como um guia para quem continuar o desenvolvimento do
Wecoffee, explicando o que precisa ser implementado e onde cada parte
deve ficar.

## 1. Usuários e permissões

O sistema terá dois tipos de usuário:

-   **Comum:** poderá visualizar e pesquisar produtos, adicionar itens
    ao carrinho e realizar compras.
-   **Chefe:** haverá dois usuários com esse perfil, responsáveis por
    cadastrar, editar e excluir produtos.

As permissões dos chefes devem ser verificadas no backend, e não apenas
escondendo opções no frontend.

## 2. Banco de dados

Atualizar o script `backend/src/database/wecoffee.sql` para incluir as
estruturas necessárias:

-   **Usuários:** armazenar os dados de acesso e o tipo de usuário
    (`comum` ou `chefe`).
-   **Cardápio:** conter seu identificador, o usuário relacionado e o
    chefe responsável. Deve organizar os produtos em categorias, como
    cafés, salgados e sobremesas.
-   **Produtos:** armazenar nome, quantidade disponível, preço,
    descrição, imagem, cardápio e categoria.
-   **Carrinho:** relacionar cada usuário aos produtos escolhidos e suas
    quantidades.

Os produtos cadastrados pelos chefes devem ser salvos no banco de dados.
As senhas devem ser armazenadas de forma segura, nunca em texto puro.

## 3. Backend

O backend já existe na pasta `backend/`. Manter a organização atual:

  -----------------------------------------------------------------------
  Arquivo/pasta                       Responsabilidade
  ----------------------------------- -----------------------------------
  `src/config/db.js`                  Conexão com o banco de dados.

  `src/database/wecoffee.sql`         Criação e atualização das tabelas.

  `src/routes/`                       Definição das rotas HTTP.

  `src/controller/`                   Recebimento das requisições e envio
                                      das respostas.

  `src/services/`                     Regras de negócio e validações.

  `src/repositories/`                 Consultas ao banco de dados.

  `src/app.js` e `server.js`          Configuração e inicialização do
                                      servidor.
  -----------------------------------------------------------------------

Criar os arquivos necessários para produtos, cardápio e carrinho,
seguindo o padrão já usado para usuários.

Usar os métodos HTTP conforme a operação: `GET` para consultar, `POST`
para criar, `PUT/PATCH` para atualizar e `DELETE` para excluir. Usuários
comuns podem consultar produtos, mas somente chefes autenticados podem
criar, editar ou excluir produtos. O backend também deve validar os
dados recebidos e tratar erros.

## 4. Frontend

O frontend fica na pasta `frontend/`:

  -----------------------------------------------------------------------
  Arquivo/pasta                       Responsabilidade
  ----------------------------------- -----------------------------------
  `Pages/index.html`                  Página principal e listagem de
                                      produtos.

  `Pages/makeItem.html`               Formulário de cadastro de produtos
                                      para os chefes.

  `script.js`                         Interações, eventos, animações e
                                      chamadas à API.

  `public/CSS/style.css`              Estilos gerais.

  `public/CSS/makeItem.css`           Estilos da página de cadastro.

  `public/imgs/`                      Imagens da interface.
  -----------------------------------------------------------------------

O login, a validação das credenciais e o salvamento dos produtos devem
ser tratados pelo backend. O `script.js` fica responsável pelas
interações da interface e por enviar as requisições necessárias à API.

### Botão "Ver mais"

Na página principal, a grade de produtos deve manter **quatro colunas**.
O botão "Ver mais" deve expandir a seção para baixo e mostrar os cards
que ficaram escondidos. Se não houver mais produtos, deverá exibir uma
mensagem informando isso, sem recarregar a página.

## 5. Ordem sugerida

-   [ ] Atualizar o banco de dados e seus relacionamentos.
-   [ ] Configurar e testar a conexão com o banco.
-   [ ] Implementar autenticação e permissões dos usuários.
-   [ ] Criar as rotas e funções de produtos, cardápio e carrinho.
-   [ ] Conectar o cadastro de produtos à API.
-   [ ] Implementar o botão "Ver mais" e testar as funcionalidades.

**Observação:** antes de alterar arquivos existentes, conferir o código
atual para preservar o que já funciona e manter o padrão de organização
do projeto.
