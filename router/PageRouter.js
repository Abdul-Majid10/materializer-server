import { Router } from "express";
const PageRouter = Router();

/** import all controllers */
import * as PageController from "../controllers/pageController.js";
import Auth from "../middleware/auth.js";

/** POST Methods */
PageRouter.route("/new").post(Auth, PageController.create);

// /** DELETE Methods */
PageRouter.route("/delete/:id").delete(Auth, PageController.deletePage);
PageRouter.route("/deleteByProject/:project").delete(Auth, PageController.deletePage);

// /** GET Methods */
PageRouter.route("/get/:id").get(Auth, PageController.getPage);
PageRouter.route("/allPages").get(Auth, PageController.getAll);
PageRouter.route('/isPageExist').get(Auth, PageController.isPageExist)

// /** PUT Methods */
PageRouter.route("/update/:id").put(Auth, PageController.update);

export default PageRouter;
