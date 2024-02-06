import mongoose from "mongoose";

export const ProjectSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username must required"],
    },
    name: String,
    collections: { type: Number, default: 0 },
    apis: { type: Number, default: 0 },
    configs: [
        {
            key: String,
            value: String,
        },
    ],
});

export default mongoose.model.Project || mongoose.model("Project", ProjectSchema);
