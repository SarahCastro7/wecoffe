
import jwt from "jsonwebtoken";

export function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization;
    const token = cabecalho?.startsWith("Bearer ")
        ? cabecalho.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ erro: "Faça login para continuar." });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ erro: "Sessão inválida ou expirada." });
    }
}

export function somenteAdmin(req, res, next) {
    if (req.usuario?.funcao !== "admin") {
        return res.status(403).json({ erro: "Acesso permitido apenas a administradores." });
    }

    next();
}
