import UserModel from "../model/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import cloudinary from "../cloudinary.config.js";
import fs from "fs";

/** middleware for verify user */
export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method == "GET" ? req.query : req.body;

        // check the user existance
        let exist = await UserModel.findOne({ $or: [ { email: username }, { username: username } ]});
        if (!exist) return res.status(404).send({ error: "Can't find User!" });
        next();
    } catch (error) {
        return res.status(404).send({ error: "Authentication Error" });
    }
}

/** POST: http://localhost:8080/api/registration/register 
 * @param : {
  "username" : "admin",
  "password" : "admin123",
  "email": "example@gmail.com"
}
*/
export async function register(req, res) {
    try {
        const { username, password, email } = req.body;

        // check the existing user
        const existUsername = new Promise((resolve, reject) => {
            UserModel.findOne({ username }, function (err, user) {
                if (err) reject(new Error(err));
                if (user) reject({ error: "Please use unique username" });

                resolve();
            });
        });

        // check for existing email
        const existEmail = new Promise((resolve, reject) => {
            UserModel.findOne({ email }, function (err, userObj) {
                if (err) reject(new Error(err));
                if (userObj) reject({ error: "Please use unique Email" });

                resolve();
            });
        });

        Promise.all([existUsername, existEmail])
            .then(() => {
                if (password) {
                    bcrypt
                        .hash(password, 10)
                        .then((hashedPassword) => {
                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                email,
                            });

                            // return save result as a response
                            user.save()
                                .then((result) =>
                                    res.status(201).send({ msg: "User Register Successfully" })
                                )
                                .catch((error) => res.status(500).send({ error }));
                        })
                        .catch((error) => {
                            return res.status(500).send({
                                error: "Enable to hashed password",
                            });
                        });
                }
            })
            .catch((error) => {
                return res.status(500).send({ error });
            });
    } catch (error) {
        return res.status(500).send(error);
    }
}

/** POST: http://localhost:8080/api/registration/login 
 * @param: {
  "username" : "admin",
  "password" : "admin123"
}
*/
export async function login(req, res) {
    const { username, password } = req.body;

    try {
        UserModel.findOne({ $or: [ { email: username }, { username: username } ]})
            .then((user) => {
                bcrypt
                    .compare(password, user.password)
                    .then((passwordCheck) => {
                        if (!passwordCheck)
                            return res.status(400).send({ error: "Password does not Match" });

                        // create jwt token
                        const token = jwt.sign(
                            {
                                userId: user._id,
                                username: user.username,
                            },
                            process.env.JWT_SECRET,
                            // { expiresIn: "7d" }
                        );

                        return res.status(200).send({
                            msg: "Login Successful...!",
                            username: user?.username,
                            firstName: user?.firstName,
                            lastName: user?.lastName,
                            email: user?.email,
                            profile: user?.profile,
                            token,
                        });
                    })
                    .catch((error) => {
                        return res.status(400).send({ error: "Error While checking Password" });
                    });
            })
            .catch((error) => {
                return res.status(404).send({ error: "Username not Found" });
            });
    } catch (error) {
        return res.status(500).send({ error });
    }
}

/** GET: http://localhost:8080/api/registration/user/admin */
export async function getUser(req, res) {
    const { username } = req.params;

    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });

        UserModel.findOne({ $or: [ { email: username }, { username: username } ]}, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(400).send({ error: "Couldn't Find the User" });

            /** remove password from user */
            // mongoose return unnecessary data with object so convert it into json
            const { password, ...rest } = Object.assign({}, user.toJSON());

            return res.status(201).send(rest);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find User Data" });
    }
}

export async function deleteAccount(req, res) {
    const { username } = req.body;

    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });

        UserModel.deleteOne({ username }, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(400).send({ error: "Unable to delete Account" });

            return res.status(204).send({ msg: "Account deleted sucessfully" });
        });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Account" });
    }
}

/** PUT: http://localhost:8080/api/registration/updateuser 
 * @param: {
  "header" : "<token>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateUser(req, res) {
    try {
        // const id = req.query.id;
        const { userId } = req.user;

        if (userId) {
            const body = req.body;
            if (req.file) {
                const res = await cloudinary.uploader.upload(req.file.path, {
                    public_id: `${userId}_profile`,
                    folder: 'users'
                });
                if (res){
                    body.profile= { publicId: res.public_id, secureUrl: res.secure_url}
                }
            }
            // update the data
            UserModel.findOneAndUpdate({ _id: userId }, body, { returnOriginal: false }, function (err, data) {
                if (err) throw err;

                if(req.file) unlinkFile(req.file.path);

                const { password, ...rest } = Object.assign({}, data.toJSON())
                return res.status(201).send({ msg: "Record Updated...!", ...rest });
            });
        } else {
            if(req.file) unlinkFile(req.file.path);
            return res.status(401).send({ error: "User Not Found...!" });
        }
    } catch (error) {
        if(req.file) unlinkFile(req.file.path);
        return res.status(500).send({ error });
    }
}

const unlinkFile = (path) =>{
    fs.unlink(path, (err) => {
        if (err) {
            console.log("Tempfile not deleted");
        }
    });
}

/** GET: http://localhost:8080/api/registration/generateOTP?username=admin */
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpGenerator.generate(4, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
    res.status(201).send({ code: req.app.locals.OTP });
}

/** GET: http://localhost:8080/api/registration/verifyOTP?username=admin&code=898999 */
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // reset the OTP value
        req.app.locals.resetSession = true; // start session for reset password
        return res.status(201).send({ msg: "Verify Successsfully!" });
    }
    return res.status(400).send({ error: "Invalid OTP" });
}

// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/registration/createResetSession */
export async function createResetSession(req, res) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ flag: req.app.locals.resetSession });
    }
    return res.status(440).send({ error: "Session expired!" });
}

// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */
export async function resetPassword(req, res) {
    try {
        if (!req.app.locals.resetSession)
            return res.status(440).send({ error: "Session expired!" });

        const { username, password } = req.body;

        try {
            UserModel.findOne({ $or: [ { email: username }, { username: username } ]})
                .then((user) => {
                    bcrypt
                        .hash(password, 10)
                        .then((hashedPassword) => {
                            UserModel.updateOne(
                                { username: user.username },
                                { password: hashedPassword },
                                function (err, data) {
                                    if (err) throw err;
                                    req.app.locals.resetSession = false; // reset session
                                    return res.status(201).send({ msg: "Record Updated...!" });
                                }
                            );
                        })
                        .catch((e) => {
                            return res.status(500).send({
                                error: "Enable to hashed password",
                            });
                        });
                })
                .catch((error) => {
                    return res.status(404).send({ error: "Username not Found" });
                });
        } catch (error) {
            return res.status(500).send({ error });
        }
    } catch (error) {
        return res.status(500).send({ error });
    }
}
