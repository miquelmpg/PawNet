import express from "express";
import morgan from "morgan";

import "./config/db.config.js";

import router from "./config/routes.config.js";

import { errorHandler } from "./middlewares/errors.middleware.js";
import { clearBody } from "./middlewares/clearbody.middleware.js";
import { checkAuth } from "./middlewares/auth.middleware.js";
import { cors } from "./middlewares/cors.middleware.js";

const app = express();

app.use(morgan("dev"));
app.use(express.static(`./web/build`));
app.use(cors);
app.use(express.json());
app.use(clearBody);
app.use(checkAuth);

app.use("/api", router);

app.use(errorHandler);

export default app;