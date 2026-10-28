
import { Router } from "express";
import { userController } from "../controller/userController.js";
import { autenticar } from "../middleware/authMiddleware.js";

const userRouter = Router();

userRouter.post("/user/login", userController.login);
userRouter.put("/user/perfil", autenticar, userController.perfil);
userRouter.put("/user/senha", autenticar, userController.senha);
userRouter.put("/user/foto", autenticar, userController.foto);

export default userRouter;
