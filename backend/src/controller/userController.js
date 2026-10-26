
import { userService } from "../services/userService.js";

export const userController = {
    async login(req, res) {
        try {
            const resultado = await userService.login(req.body);
            if (!resultado) {
                return res.status(401).json({ erro: "E-mail ou senha incorretos." });
            }
            res.json(resultado);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    },

    async perfil(req, res) {
        try {
            const user = await userService.updatePerfil(
                req.usuario.id, req.body
            );
            if (!user) {
                return res.status(400).json({ erro: "Confira o nome e o e-mail." });
            }
            res.json(user);
        } catch (error) {
            const status = error.code === "23505" ? 409 : 500;
            res.status(status).json({
                erro: status === 409 ? "Esse e-mail já está em uso." : error.message
            });
        }
    },

    async senha(req, res) {
        try {
            await userService.updateSenha(
                req.usuario.id,
                req.body.senhaAtual,
                req.body.senhaNova
            );
            res.json({ mensagem: "Senha alterada com sucesso." });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    },

    async foto(req, res) {
        try {
            const user = await userService.updateFoto(req.usuario.id, req.body.foto);
            if (!user) {
                return res.status(400).json({ erro: "Envie uma imagem válida." });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ erro: error.message });
        }
    }
};
