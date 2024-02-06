import { Router } from "express";
const ProjectRouter = Router();

/** import all controllers */
import * as projectController from "../controllers/projectController.js";
import * as collectionController from "../controllers/collectionController.js";
import * as exportController from "../controllers/exportController.js";
import Auth from "../middleware/auth.js";

/** POST Methods */
ProjectRouter.route("/create").post(Auth, projectController.create); // create new project

ProjectRouter.route("/delete").post(
    Auth,
    projectController.deleteProject,
    collectionController.deleteByProject
); // delete project by project id

/** GET Methods */
ProjectRouter.route("/getById/:id").get(Auth, projectController.getById); // return signle record
ProjectRouter.route("/get/all").get(Auth, projectController.getAll); // return signle record
ProjectRouter.route("/configs").get(Auth, projectController.configs); // return configs
ProjectRouter.route("/exist").get(Auth, projectController.isProjectExist); // return signle record
ProjectRouter.route("/export/:project/:client/:server").get(Auth, exportController.exportProject); // Export project

/** PUT Methods */
ProjectRouter.route("/update").put(Auth, projectController.update); // Update single collection(record)

export default ProjectRouter;
