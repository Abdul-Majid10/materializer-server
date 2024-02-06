import path from "path";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import connect from "./database/conn.js";
import RegistrationRouter from "./router/registrationRouter.js";
import dotenv from "dotenv";
import MediaRouter from "./router/mediaRouter.js";
import CollectionRouter from "./router/collectionRouter.js";
import ProjectRouter from "./router/projectRouter.js";
import ApiRouter from "./router/ApiRouter.js";
import ClassesRouter from "./router/cssClassesRouter.js";
import PageRouter from "./router/pageRouter.js";
import ComponentRouter from "./router/ComponentRouter.js";

dotenv.config();
const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by"); // less hackers know about our stack

const port = process.env.PORT || 8080;

/** HTTP GET Request */
app.get("/", (req, res) => {
    res.status(200).json("Home Route");
});

/** api routes */
app.use("/api/registration", RegistrationRouter);
app.use("/api/media", MediaRouter);
app.use("/api/collection", CollectionRouter);
app.use("/api/project", ProjectRouter);
app.use("/api/backendApis", ApiRouter);
app.use("/api/pages", PageRouter);
app.use("/api/admin/component", ComponentRouter);
app.use("/api/classes", ClassesRouter);

/** start server only when we have valid connection */
connect()
    .then(() => {
        try {
            app.listen(port, () => {
                console.log(`Server connected to http://localhost:${port}`);
            });
        } catch (error) {
            console.log("Cannot connect to the server");
        }
    })
    .catch((error) => {
        console.log("Invalid database connection...!");
    });
