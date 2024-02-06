import { Router } from "express";
const ComponentRouter = Router();

/** import all controllers */
import * as ComponentController from "../controllers/componentController.js";

/** POST Methods */
ComponentRouter.route("/new/31d6c8a").post(ComponentController.create);


// /** GET Methods */
ComponentRouter.route("/get/query").get(ComponentController.getComponent);
ComponentRouter.route("/all").get(ComponentController.getAll);


export default ComponentRouter;
