import { query } from "../config/db.js";

export const productRepository = {
    async findAll() {
        const res = await query(
            `SELECT id_produto, nome_produto, descricao_produto,
                    tipo_produto, preco_produto, quantidade_produto,
                    foto_produto
             FROM produtos
             ORDER BY id_produto DESC`
        );

        return res.rows;
    },

    async findById(id) {
        const res = await query(
            `SELECT id_produto, nome_produto, descricao_produto,
                    tipo_produto, preco_produto, quantidade_produto,
                    foto_produto
             FROM produtos
             WHERE id_produto = $1`,
            [id]
        );

        return res.rows[0] ?? null;
    },

    async create(produto) {
        const {
            nome,
            descricao,
            tipo,
            preco,
            quantidade,
            foto
        } = produto;

        const res = await query(
            `INSERT INTO produtos
                (nome_produto, descricao_produto, tipo_produto,
                 preco_produto, quantidade_produto, foto_produto)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                nome,
                descricao || null,
                tipo,
                preco,
                quantidade || 1,
                foto || null
            ]
        );

        return res.rows[0];
    },

    async update(id, produto) {
        const {
            nome,
            descricao,
            tipo,
            preco,
            quantidade,
            foto
        } = produto;

        const res = await query(
            `UPDATE produtos
             SET nome_produto = $1,
                 descricao_produto = $2,
                 tipo_produto = $3,
                 preco_produto = $4,
                 quantidade_produto = $5,
                 foto_produto = $6
             WHERE id_produto = $7
             RETURNING *`,
            [
                nome,
                descricao || null,
                tipo,
                preco,
                quantidade,
                foto || null,
                id
            ]
        );

        return res.rows[0] ?? null;
    }
};