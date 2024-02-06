import mongoose from "mongoose";
import ProjectModel from "./Project.model.js";

export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide unique Username"],
        unique: [true, "Username Exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        unique: false,
    },
    email: {
        type: String,
        required: [true, "Please provide a unique email"],
        unique: true,
    },
    approved: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false }, // other user Type can be 'user' or 'admin'
    gender: String,
    firstName: String,
    lastName: String,
    mobile: Number,
    address: String,
    profile: {
        secureUrl : String,
        publicId : String,
    },
});

UserSchema.pre("save", async function (next) {
    const user = this;
    try {
        const defaultDemoProject = {
            username: user.username,
            name: "demo",
        };

        let projectDocExist = await ProjectModel.findOne(defaultDemoProject);

        if (projectDocExist) {
            next();
        }

        let projectDoc = await new ProjectModel(defaultDemoProject);
        await projectDoc.save();
        next();
    } catch (error) {
        next();
    }
});

export default mongoose.model.Users || mongoose.model("User", UserSchema);
