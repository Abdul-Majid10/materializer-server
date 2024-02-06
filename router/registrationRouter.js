import { Router } from "express";
const RegistrationRouter = Router();

/** import all controllers */
import * as regController from '../controllers/registrationController.js';
import { registerMail } from '../controllers/mailer.js'
import Auth, { localVariables } from '../middleware/auth.js';

import multer from "multer";

const storage = multer.diskStorage({
    filename: (req, file, callBack) => {
      callBack(null, `${Date.now() + file.originalname.split(" ").join("-")}`);
    },
  });

let upload = multer({ storage, dest: 'public/images/users' });


/** POST Methods */
RegistrationRouter.route('/register').post(regController.register); // register user
RegistrationRouter.route('/registerMail').post(registerMail); // send the email
RegistrationRouter.route('/authenticate').post(regController.verifyUser, (req, res) => res.end()); // authenticate user
RegistrationRouter.route('/login').post(regController.verifyUser,regController.login); // login in app
RegistrationRouter.route('/deleteAccount').post(Auth,regController.deleteAccount); // delete user account

/** GET Methods */
RegistrationRouter.route('/user/:username').get(regController.getUser) // user with username
RegistrationRouter.route('/generateOTP').get(regController.verifyUser, localVariables, regController.generateOTP) // generate random OTP
RegistrationRouter.route('/verifyOTP').get(regController.verifyUser, regController.verifyOTP) // verify generated OTP
RegistrationRouter.route('/createResetSession').get(regController.createResetSession) // reset all the variables


/** PUT Methods */
RegistrationRouter.route('/updateuser').put( Auth, upload.single("profile"), regController.updateUser); // is use to update the user profile
RegistrationRouter.route('/resetPassword').put(regController.verifyUser, regController.resetPassword); // use to reset password

export default RegistrationRouter;
