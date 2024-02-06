import CollectionModel from "../model/Collection.model.js";

export async function create(req, res) {
    try {
        const {username} = req.user;
        const {
            project = "demo",
            database = "demo",
            collectionName,
            collectionJsonString,
        } = req.body;

        // Check if a collection with the same name already exists for the same username and project
        const existingCollection = await CollectionModel.findOne({
            username,
            project,
            collectionName,
        });
        if (existingCollection) {
            return res.status(400).json({
                error: "A collection with the same name already exists for this user and project",
            });
        }

        const newCollection = new CollectionModel({
            username,
            project,
            database,
            collectionName,
            collectionJsonString,
        });

        newCollection
            .save()
            .then((collection) => {
                res.status(201).send({msg: "Collection Created Successfully." ,collection});
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: "Internal server error" });
            });
    } catch (error) {
        return res.status(500).send(error);
    }
}

export async function deleteCollection(req, res) {
    const { id } = req.params;
    const { username } = req.user;

    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });

        const response = await CollectionModel.findOneAndDelete({ _id: id, username });
        if (!response) return res.status(400).send({ error: "Unable to delete Collection" });

        response.remove();
        return res.status(204).send({ msg: "Collection deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Collection" });
    }
}

export async function deleteByProject(req, res) {
    const { username } = req.user;
    const { project } = req.params;

    try {
        if (!project) return res.status(500).send({ error: "Invalid project name" });
        if (!username) return res.status(500).send({ error: "Invalid username" });

        const docsToDelete = await CollectionModel.find({ username, project });

        const result = await CollectionModel.deleteMany({ username, project }, { returnDocument: "deleted" });
        if (!result.acknowledged) return res.status(400).send({ error: "Unable to delete Collections" });

        for (const obj of docsToDelete) {
            obj.remove();
        }
        return res.status(204).send({ msg: `Collections for ${project} deleted sucessfully` });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Collections for project" });
    }
}

export async function getCollectionByName(req, res) {
    const { username  } = req.user;
    const { collectionName, project} = req.query;

    try {
        CollectionModel.findOne({ username, project, collectionName }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Collection Data" });
    }
}

export async function isCollectionExist(req, res) {
    const { username  } = req.user;
    const { collectionName, project} = req.query;

    try {
        CollectionModel.findOne({ username, project, collectionName }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(200).send({ exist: false });

            return res.status(200).send( {exist: true});
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Collection Data" });
    }
}

export async function getCollection(req, res) {
    const user = req.user;
    const { id } = req.params;

    try {
        CollectionModel.findById( id , function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });

            if(data.username === user.username){
                return res.status(200).send(data);
            }else{
                return res.status(400).send({ error: "You are not Authorized for this collection." });
            }

        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Collection Data" });
    }
}

export async function getCollectionByProject(req, res) {
    const { username } = req.user;
    const { project } = req.query;

    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });
        if (!project) return res.status(400).send({ error: "Invalid PROJECT" });

        CollectionModel.find({ username, project }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Collection Data" });
    }
}

export async function update(req, res) {
    try {
        const { username } = req.user;
        const { id } = req.params;
        const { project, collectionName, collectionJsonString } = req.body;

        // Check if a collection with the same name already exists for the same username and project
        const existingCollection = await CollectionModel.findOne({
            username,
            project,
            collectionName,
        });
        if (existingCollection) {
            return res.status(400).json({
                error: "A collection with the same name already exists for this user and project",
            });
        }

        const obj = null;

        if (collectionName && collectionJsonString) {
            obj = { collectionName, collectionJsonString };
        } else {
            obj = collectionName ? { collectionName } : { collectionJsonString };
        }

        if (!obj) return res.status(401).send({ error: "Nothing to update" });

        const updatedCollection = await CollectionModel.findByIdAndUpdate(id, obj);

        res.status(200).json({msg: "Collection updated Successfully." ,updatedCollection});
    } catch (error) {
        return res.status(500).send({ error });
    }
}
