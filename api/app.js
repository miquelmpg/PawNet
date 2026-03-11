import express from "express";
import morgan from "morgan";

import "./config/db.config.js";

import router from "./config/routes.config.js";

import { errorHandler } from "./middlewares/errors.middleware.js";
import { clearBody } from "./middlewares/clearbody.middleware.js";
import { checkAuth } from "./middlewares/auth.middleware.js";
import { cors } from "./middlewares/cors.middleware.js";

const app = express();

const PORT = process.env.PORT || 3000;


app.use(morgan("dev"));
app.use(cors);
app.use(express.json());
app.use(clearBody);
app.use(checkAuth);

app.use("/api", router);

app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;