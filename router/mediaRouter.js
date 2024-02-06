import { Router } from "express";
const MediaRouter = Router();

/** import all controllers */
import * as mediaController from '../controllers/mediaController.js';
import Auth from '../middleware/auth.js';

import multer from "multer";

const storage = multer.diskStorage({
    filename: (req, file, callBack) => {
      callBack(null, `${file.originalname.split(" ").join("-")}`);
    },
  });

let upload = multer({ storage, dest: 'public/images/uploads' });

/** POST Methods */
MediaRouter.route('/upload').post(Auth, upload.any(), mediaController.upload); // upload media
MediaRouter.route('/delete/:id').post(Auth,mediaController.deleteMedia); // delete media

/** GET Methods */
MediaRouter.route('/getById/:id/').get(Auth, mediaController.getMedia) // get one media
MediaRouter.route('/search').get(Auth, mediaController.getSearchedMedia) // search media
MediaRouter.route('/all').get(Auth , mediaController.getAllMedia) // get all media of that user

export default MediaRouter;
