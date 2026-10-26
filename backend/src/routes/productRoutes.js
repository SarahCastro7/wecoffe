import { Router } from "express";
import { productController } from "../controller/productController.js";
import {
    autenticar,
    somenteAdmin
} from "../middleware/authMiddleware.js";

const productRouter = Router();

productRouter.get("/products", productController.getAll);

productRouter.post(
    "/products",
    autenticar,
    somenteAdmin,
    productController.create
);

productRouter.put(
    "/products/:id",
    autenticar,
    somenteAdmin,
    productController.update
);

export default productRouter;