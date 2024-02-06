import mongoose from "mongoose";
import ApisModel from "./Apis.model.js";

export const CollectionSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username must required"],
    },
    project: { type: String, required: true },
    database: { type: String, default: "demo" },
    collectionName: { type: String, required: [true, "Undefined Collection name not allowed"] },
    collectionJsonString: {
        type: String,
        required: [true, "Collection Json String must required"],
    },
    apis: [
        {
            apiId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Apis",
            },
        },
    ],
});

// Add the middleware to the CollectionSchema
CollectionSchema.pre("save", async function (next) {
    const collection = this;
    const defaultApis = [
        {
            name: "Get" + collection.collectionName,
            apiMethod: "GET",
            apiBaseUrl: `/${collection.collectionName.toLowerCase()}`,
            apiEndUrl: "/get/:id",
            type: "public",
        },
        {
            name: "GetAll" + collection.collectionName,
            apiMethod: "GET",
            apiBaseUrl: `/${collection.collectionName.toLowerCase()}`,
            apiEndUrl: "/all",
            type: "public",
        },
        {
            name: "Create" + collection.collectionName,
            apiMethod: "POST",
            apiBaseUrl: `/${collection.collectionName.toLowerCase()}`,
            apiEndUrl: "/create",
            type: "private",
        },
        {
            name: "Delete" + collection.collectionName,
            apiMethod: "DELETE",
            apiBaseUrl: `/${collection.collectionName.toLowerCase()}`,
            apiEndUrl: "/delete/:id",
            type: "private",
        },
        {
            name: "Update" + collection.collectionName,
            apiMethod: "PUT",
            apiBaseUrl: `/${collection.collectionName.toLowerCase()}`,
            apiEndUrl: "/update/:id",
            type: "private",
        },
    ];

    let apisIDs = await defaultApis.map(async (api) => {
        let apiDoc = await new ApisModel({ ...api, collectionId: collection._id });
        await apiDoc.save();
        return { apiId: apiDoc._id };
    });

    await Promise.all(apisIDs)
        .then((values) => {
            collection.apis = values;
            next();
        })
        .catch((err) => next(err));
});

CollectionSchema.pre("remove",{ document: true }, async function (next) {
    try {
        // Find all Apis documents associated with this Collection document and delete them
        await ApisModel.deleteMany({ collectionId: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model.Collection || mongoose.model("Collection", CollectionSchema);
