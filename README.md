# ☕ WeCoffee

<p align="center">
  **Sistema de gerenciamento de cafeteria**
  
  Uma aplicação web para gerenciar produtos, usuários e operações de uma cafeteria, com autenticação e controle de acesso para administradores.
</p>

---

## 📌 Sobre o projeto

O **WeCoffee** é um sistema desenvolvido para facilitar o gerenciamento de uma cafeteria. A aplicação possui uma interface web integrada a uma API, com banco de dados PostgreSQL para armazenar as informações.

### ✨ Funcionalidades

- 🔐 **Autenticação:** login com validação de credenciais e uso de JWT.
- 👤 **Gerenciamento de usuários:** cadastro e atualização de informações.
- ☕ **Gerenciamento de produtos:** consulta e cadastro de produtos.
- 🛡️ **Controle de permissões:** funcionalidades administrativas restritas a usuários autorizados.
- 🗄️ **Banco de dados:** armazenamento persistente das informações em PostgreSQL.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Finalidade |
|:--|:--|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e layout |
| JavaScript | Interatividade e comunicação com a API |
| Node.js | Ambiente de execução do backend |
| Express | Criação das rotas e da API |
| PostgreSQL | Banco de dados relacional |
| JWT | Autenticação e autorização |

---

## 📂 Estrutura do projeto

```text
WeCoffee/
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
│
├── database/
│   └── wecoffee.sql
│
├── .env.example
├── .gitignore
└── README.md
```

> **Observação:** a estrutura acima é ilustrativa. Ajuste os nomes das pastas e dos arquivos para corresponder exatamente à estrutura atual do repositório.

---

## ⚙️ Instalação e configuração

### 1. Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 2. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
cd WeCoffee
```

Substitua `URL_DO_REPOSITORIO` pelo endereço do repositório do projeto.

### 3. Configure o banco de dados

Crie o banco de dados no PostgreSQL e importe o arquivo SQL disponibilizado no projeto.

```sql
CREATE DATABASE wecoffe;
```

Depois, execute o arquivo `wecoffee.sql` no banco criado, utilizando o pgAdmin ou o terminal do PostgreSQL.

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta do backend, seguindo o modelo abaixo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wecoffe
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=defina_uma_chave_secreta
PORT=3000
```

> 🔒 **Importante:** substitua os valores de exemplo pelos dados do seu ambiente. Não publique senhas ou chaves secretas no GitHub.

### 5. Instale as dependências

No terminal, entre na pasta do backend:

```bash
cd backend
npm install
```

### 6. Inicie o servidor

```bash
npm start
```

O comando de inicialização pode variar conforme os scripts definidos no `package.json`.

---

## 🧪 Testes

Após iniciar o backend, verifique se a API está funcionando acessando a rota inicial configurada no servidor.

```text
http://localhost:3000
```

Para testar as demais funcionalidades, utilize o frontend ou uma ferramenta de requisições HTTP, como o [Postman](https://www.postman.com/).

---

## 🔐 Segurança

- Senhas e credenciais devem ser mantidas fora do código-fonte.
- Rotas administrativas devem exigir autenticação e autorização.
- O token JWT deve ser validado nas rotas protegidas.
- O arquivo `.env` não deve ser enviado ao repositório público.

---

## 👨‍💻 Desenvolvimento

O projeto foi desenvolvido com o objetivo de praticar conceitos de desenvolvimento web full stack, incluindo integração entre frontend e backend, operações CRUD, autenticação de usuários e persistência de dados relacionais.

---

## Contas utilizadas

as contas utilizadas para os testes estão aqui!

```text
Conta	E-mail	Senha	Função
👑 Teste Admin:
testeadmin@email.com
senha:
 Admin123!
 	
👤 Teste:	
teste@email.com	 
senha:
 Teste123!
```



<p align="center">
  ☕ **WeCoffee** — tecnologia e café em um só lugar.
</p>
