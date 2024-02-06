import { Router } from "express";
const CollectionRouter = Router();

/** import all controllers */
import * as collectionController from '../controllers/collectionController.js';
import Auth from '../middleware/auth.js';

/** POST Methods */
CollectionRouter.route('/create').post(Auth, collectionController.create); // create new collection

/** DELETE Methods */
CollectionRouter.route('/deleteByProject/:project').delete(Auth, collectionController.deleteByProject); // delete by project id and username
CollectionRouter.route('/delete/:id').delete(Auth, collectionController.deleteCollection); // delete sigle collection record by collection id

/** GET Methods */
CollectionRouter.route('/getProjectCollection').get(Auth, collectionController.getCollectionByProject) // return all collections for a project.
CollectionRouter.route('/get/:id').get(Auth, collectionController.getCollection) // return signle record
CollectionRouter.route('/getCollectionByName').get(Auth, collectionController.getCollectionByName) // return signle record
CollectionRouter.route('/isCollectionExist').get(Auth, collectionController.isCollectionExist) // return signle record

/** PUT Methods */
CollectionRouter.route('/update/:id').put( Auth,collectionController.update); // Update single collection(record) by id

export default CollectionRouter;

