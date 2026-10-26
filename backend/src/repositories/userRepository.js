
import { query } from "../config/db.js";

export const userRepository = {
    async findById(id) {
        const res = await query(
            `SELECT id_usuario, nome_usuario, email_usuario,
                    foto_usuario, funcao_usuario
             FROM usuarios WHERE id_usuario = $1`,
            [id]
        );
        return res.rows[0] ?? null;
    },

    async findByEmail(email) {
        const res = await query(
            `SELECT id_usuario, nome_usuario, email_usuario,
                    senha_usuario, foto_usuario, funcao_usuario
             FROM usuarios WHERE email_usuario = $1`,
            [email]
        );
        return res.rows[0] ?? null;
    },

    async updatePerfil(id, nome, email) {
        const res = await query(
            `UPDATE usuarios
             SET nome_usuario = $1, email_usuario = $2
             WHERE id_usuario = $3
             RETURNING id_usuario, nome_usuario, email_usuario,
                       foto_usuario, funcao_usuario`,
            [nome, email, id]
        );
        return res.rows[0] ?? null;
    },

    async updateSenha(id, senhaHash) {
        await query(
            "UPDATE usuarios SET senha_usuario = $1 WHERE id_usuario = $2",
            [senhaHash, id]
        );
    },

    async updateFoto(id, foto) {
        const res = await query(
            `UPDATE usuarios SET foto_usuario = $1
             WHERE id_usuario = $2
             RETURNING id_usuario, nome_usuario, email_usuario,
                       foto_usuario, funcao_usuario`,
            [foto, id]
        );
        return res.rows[0] ?? null;
    }
};
