import { Router } from "express";
const ClassesRouter = Router();

/** import all controllers */
import * as cssClassesController from '../controllers/cssClassesController.js';

/** POST Methods */
ClassesRouter.route('/pushtwclasses').post(cssClassesController.PushTailwindClasses);

/** GET Methods */
ClassesRouter.route('/getAllclasses/:name').get( cssClassesController.getClasses)


export default ClassesRouter;
