import mongoose from "mongoose";

export const SystemComponentsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name must required"],
    },
    type: { type: String, enum: ["public", "private", "protected"], default: "public" },
    section: { type: String, default: "demo" },
    url: String,
    content: {
        type: Function,
        required: [true, "Compoment Content must required"],
    },
});

export default mongoose.model.SystemComponents ||
    mongoose.model("SystemComponents", SystemComponentsSchema);
