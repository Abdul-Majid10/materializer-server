import ApisModel from "../model/Apis.model.js";

export async function create(req, res) {
    try {
        const newApi = new ApisModel(req.body);
        newApi
            .save()
            .then((api) => {
                res.status(201).send({ msg: "Api Created Successfully.", api });
            })
            .catch((error) => {
                res.status(500).json({ error: "Internal server error" });
            });
    } catch (error) {
        return res.status(500).send(error);
    }
}

export async function deleteApi(req, res) {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });

        const response = await ApisModel.findOneAndDelete({ _id: id });
        if (!response) return res.status(400).send({ error: "Unable to delete API" });

        return res.status(204).send({ msg: "API deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete API" });
    }
}

export async function deleteApiByCollection(req, res) {
    const { collectionId } = req.params;

    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });

        const response = await ApisModel.deleteMany({ collectionId });
        if (!response) return res.status(400).send({ error: "Unable to delete APIs" });

        return res.status(204).send({ msg: "APIs deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete APIs" });
    }
}

export async function getApi(req, res) {
    const { id } = req.params;

    try {
        ApisModel.findById(id, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find API Data" });
    }
}

export async function update(req, res) {
    try {
        const { id } = req.params;
        const obj = Object.assign({}, req.body);

        if (!obj) return res.status(401).send({ error: "Nothing to update" });

        const updatedApi = await ApisModel.findByIdAndUpdate(id, obj);

        res.status(200).json({ msg: "Api updated Successfully.", updatedApi });
    } catch (error) {
        return res.status(500).send({ error });
    }
}
