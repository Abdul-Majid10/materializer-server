import ComponentModel from "../model/Components.model.js";

export async function create(req, res) {
    try {
        const Component = new ComponentModel(req.body);
        Component.save()
            .then((page) => {
                res.status(201).send({ msg: "Component Created Successfully.", page });
            })
            .catch((error) => {
                res.status(500).json({ error: error });
            });
    } catch (error) {
        return res.status(500).send({ error: "Internal server error" });
    }
}

export async function getComponent(req, res) {
    const { query } = req.query;

    try {
        ComponentModel.find(
            {
                $or: [
                    { name: { $regex: new RegExp(".*" + query + ".*", "i") } },
                    { section: { $regex: new RegExp(".*" + query + ".*", "i") } },
                    { uiName: { $regex: new RegExp(".*" + query + ".*", "i") } },
                ],
            },
            function (err, data) {
                if (err) return res.status(500).send({ err });
                if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });
                return res.status(200).send(data);
            }
        );
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

export async function getAll(req, res) {
    try {
        ComponentModel.find({}, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}
