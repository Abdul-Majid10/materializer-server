import mongoose from "mongoose";

export const CssClassesSchema = new mongoose.Schema({
    name : {type : String,
        required: [true, "Please provide unique class List name"],
        unique: [true, "Class List With same name exist"],
    },
    classes: [String],
});

export default mongoose.model.CssClasses || mongoose.model("CssClasses", CssClassesSchema);