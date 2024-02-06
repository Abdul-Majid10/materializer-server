import mongoose from "mongoose";

export const PagesSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username must required"],
    },
    project: { type: String, required: true },
    database: { type: String, default: "demo" },
    url: { type: String, default: "/" },
    pageName: { type: String, required: [true, "Undefined Page name not allowed"] },
    pageContent: [{ componentName: String, componentContent: String }],
});

export default mongoose.model.Pages || mongoose.model("Pages", PagesSchema);
