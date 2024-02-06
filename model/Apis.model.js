import mongoose from "mongoose";

export const ApisSchema = new mongoose.Schema({
    name: String,
    collectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
    },
    apiMethod: {
        type: String,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        required: true,
    },
    apiBaseUrl: {
        type: String,
        required: [
            true,
            "base Url Must required for Api path , i.e for user api base path is /user/",
        ],
    },
    apiEndUrl: { type: String, required: [true, "Url Must required for Api path"] },
    type: {
        type: String,
        enum: ["public", "private", "protected"],
        default: "public",
    },
    exportIncluded: { type: Boolean, default: true },
});

export default mongoose.model.Apis || mongoose.model("Apis", ApisSchema);
