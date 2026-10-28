import { productRepository } from "../repositories/productRepository.js";

const TIPOS_VALIDOS = ["cafe", "comida", "bebida"];

function validarProduto(dados) {
    const {
        nome,
        descricao,
        tipo,
        preco,
        quantidade,
        foto
    } = dados ?? {};

    const valor = Number(preco);
    const qtd = Number(quantidade || 1);

    if (
        typeof nome !== "string" ||
        !nome.trim() ||
        nome.trim().length > 80
    ) {
        return null;
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
        return null;
    }

    if (
        preco === "" ||
        preco === undefined ||
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        return null;
    }

    if (!Number.isInteger(qtd) || qtd < 1) {
        return null;
    }

    if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== "string"
    ) {
        return null;
    }

    if (
        foto !== undefined &&
        foto !== null &&
        foto !== "" &&
        (
            typeof foto !== "string" ||
            !/^data:image\/(jpeg|png|webp|gif);base64,/.test(foto)
        )
    ) {
        return null;
    }

    return {
        nome: nome.trim(),
        descricao: typeof descricao === "string" ? descricao.trim() : "",
        tipo,
        preco: valor,
        quantidade: qtd,
        foto: foto || null
    };
}

export const productService = {
    async getAll() {
        return productRepository.findAll();
    },

    async create(dados) {
        const produto = validarProduto(dados);

        if (!produto) {
            return null;
        }

        return productRepository.create(produto);
    },

    async update(id, dados) {
        const idProduto = Number(id);

        if (!Number.isInteger(idProduto) || idProduto < 1) {
            return null;
        }

        const existente = await productRepository.findById(idProduto);

        if (!existente) {
            return null;
        }

        const dadosValidados = validarProduto(dados);

        if (!dadosValidados) {
            return null;
        }

        // Se nenhuma foto nova foi enviada, mantém a foto atual.
        if (!dadosValidados.foto) {
            dadosValidados.foto = existente.foto_produto;
        }

        return productRepository.update(idProduto, dadosValidados);
    }
};