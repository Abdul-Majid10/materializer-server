import { Router } from "express";
const ApiRouter = Router();

/** import all controllers */
import * as ApiController from "../controllers/apiController.js";
import Auth from "../middleware/auth.js";

/** POST Methods */
ApiRouter.route("/create").post(Auth, ApiController.create);

/** DELETE Methods */
ApiRouter.route("/deleteByCollection/:collectionId").delete( Auth, ApiController.deleteApiByCollection);
ApiRouter.route("/delete/:id").delete(Auth, ApiController.deleteApi);

/** GET Methods */
ApiRouter.route("/get/:id").get(Auth, ApiController.getApi);

/** PUT Methods */
ApiRouter.route("/update/:id").put(Auth, ApiController.update);

export default ApiRouter;
