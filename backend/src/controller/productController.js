import { productService } from "../services/productService.js";

export const productController = {
    async getAll(req, res) {
        try {
            const products = await productService.getAll();
            return res.status(200).json(products);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "Não foi possível carregar os produtos."
            });
        }
    },

    async create(req, res) {
        try {
            const product = await productService.create(req.body);

            if (!product) {
                return res.status(400).json({
                    erro: "Confira nome, tipo, preço e quantidade do produto."
                });
            }

            return res.status(201).json(product);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "Não foi possível salvar o produto."
            });
        }
    },

    async update(req, res) {
        try {
            const product = await productService.update(
                req.params.id,
                req.body
            );

            if (!product) {
                return res.status(400).json({
                    erro: "Produto inexistente ou dados inválidos."
                });
            }

            return res.status(200).json(product);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "Não foi possível atualizar o produto."
            });
        }
    }
};