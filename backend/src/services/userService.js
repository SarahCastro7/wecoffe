
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository.js";

export const userService = {
    async login({ email, senha } = {}) {
        if (typeof email !== "string" || typeof senha !== "string") {
            return null;
        }

        const user = await userRepository.findByEmail(email.trim());
        if (!user) return null;

        // Aceita senhas antigas em texto puro e as converte em hash no primeiro login.
        const senhaAntiga = !user.senha_usuario.startsWith("$2");
        const senhaValida = senhaAntiga
            ? senha === user.senha_usuario
            : await bcrypt.compare(senha, user.senha_usuario);

        if (!senhaValida) return null;

        if (senhaAntiga) {
            const hash = await bcrypt.hash(senha, 10);
            await userRepository.updateSenha(user.id_usuario, hash);
        }

        const token = jwt.sign(
            {
                id: user.id_usuario,
                funcao: user.funcao_usuario || "usuario"
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        const { senha_usuario, ...dadosPublicos } = user;
        return { usuario: dadosPublicos, token };
    },

    async updatePerfil(id, dados) {
        const { nome, email } = dados ?? {};
        if (
            typeof nome !== "string" || !nome.trim() ||
            typeof email !== "string" ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) return null;

        return userRepository.updatePerfil(id, nome.trim(), email.trim());
    },

    async updateSenha(id, senhaAtual, senhaNova) {
        if (typeof senhaNova !== "string" || senhaNova.length < 6) {
            throw new Error("A nova senha precisa ter pelo menos 6 caracteres.");
        }

        const user = await userRepository.findById(id);
        const completo = await userRepository.findByEmail(user.email_usuario);
        const hashAntigo = completo.senha_usuario;
        const valida = hashAntigo.startsWith("$2")
            ? await bcrypt.compare(senhaAtual, hashAntigo)
            : senhaAtual === hashAntigo;

        if (!valida) throw new Error("A senha atual está incorreta.");

        await userRepository.updateSenha(id, await bcrypt.hash(senhaNova, 10));
    },

    async updateFoto(id, foto) {
        if (
            typeof foto !== "string" ||
            !/^data:image\/(jpeg|png|webp|gif);base64,/.test(foto)
        ) return null;

        return userRepository.updateFoto(id, foto);
    }
};
