import mongoose from "mongoose";

export const ComponentsSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Undefined Page Component not allowed"] },
    section: { type: String, default: "Default" },
    uiName: String,
    content: { type: String, required: [true, "Undefined Page Component is not allowed"] },
});

export default mongoose.model.Components || mongoose.model("Components", ComponentsSchema);
