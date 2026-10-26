import express from "express";
import cors from "cors";
import userRouter from "./src/routes/userRoutes.js";
import productRouter from "./src/routes/productRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "3mb" }));

app.use(userRouter);
app.use(productRouter);

app.get("/", (req, res) => {
    res.send("API WeCoffe funcionando!");
});

export default app;