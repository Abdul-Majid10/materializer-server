import mongoose from "mongoose";

export const MediaSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username must required"],
    },
    project: {type: String, default: 'demo'},
    title: String,
    public: {type: Boolean, default: false},
    image: {
        secureUrl :{
            type: String,
            required: [true, "File Url missing"],
        },
        publicId : String,
    },
});

export default mongoose.model.Media || mongoose.model("Media", MediaSchema);
