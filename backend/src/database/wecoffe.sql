-- WeCoffee - esquema do banco de dados
-- PostgreSQL
-- Contém estrutura e dados de teste.
-- Execute conectado ao banco "wecoffe".

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(50) NOT NULL,
    email_usuario VARCHAR(50) NOT NULL UNIQUE,
    senha_usuario VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    funcao_usuario VARCHAR(20) NOT NULL DEFAULT 'usuario',
    foto_usuario TEXT,
    CONSTRAINT usuarios_funcao_check
        CHECK (funcao_usuario IN ('admin', 'usuario'))
);

CREATE TABLE IF NOT EXISTS produtos (
    id_produto SERIAL PRIMARY KEY,
    nome_produto VARCHAR(80) NOT NULL,
    descricao_produto TEXT,
    tipo_produto VARCHAR(20) NOT NULL
        CHECK (tipo_produto IN ('cafe', 'comida', 'bebida')),
    preco_produto NUMERIC(10,2) NOT NULL
        CHECK (preco_produto >= 0),
    quantidade_produto INTEGER NOT NULL DEFAULT 1
        CHECK (quantidade_produto >= 1),
    foto_produto TEXT
);

-- Usuário comum para testes.
-- A senha em texto puro existe apenas para compatibilidade com o
-- login legado: o backend atual deve convertê-la em hash bcrypt
-- no primeiro login.
INSERT INTO usuarios (nome_usuario, email_usuario, senha_usuario, funcao_usuario)
VALUES ('Teste', 'teste@email.com', '123456', 'usuario')
ON CONFLICT (email_usuario) DO NOTHING;

-- Administrador de teste. Altere a senha após o primeiro acesso.
INSERT INTO usuarios (nome_usuario, email_usuario, senha_usuario, funcao_usuario)
VALUES ('Teste Admin', 'testeadmin@email.com', 'Admin123!', 'admin')
ON CONFLICT (email_usuario) DO NOTHING;

-- Para promover uma conta já existente, ajuste o e-mail e execute:
-- UPDATE usuarios
-- SET funcao_usuario = 'admin'
-- WHERE email_usuario = 'testeadmin@email.com';

-- Consultas de conferência (opcionais; não são necessárias para criar
-- as tabelas) podem ser executadas separadamente:
-- SELECT id_usuario, nome_usuario, email_usuario, funcao_usuario
-- FROM usuarios
-- ORDER BY id_usuario;
--
-- SELECT id_produto, nome_produto, tipo_produto, preco_produto,
--        quantidade_produto, (foto_produto IS NOT NULL) AS tem_foto
-- FROM produtos
-- ORDER BY id_produto DESC;
