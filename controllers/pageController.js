import PagesModel from "../model/Pages.model.js";

export async function create(req, res) {
    try {
        const { username  } = req.user;
        const { pageName, project} = req.body;

        const existPage = new Promise((resolve, reject) => {
            PagesModel.findOne({  username, project, pageName }, function (err, page) {
                if (err) reject(new Error(err));
                if (page) reject({ error: "Page Name Already exist" });

                resolve();
            });
        });

        Promise.all([existPage])
        .then(() => {

        const newPage = new PagesModel(Object.assign({username}, req.body));
        newPage
            .save()
            .then((page) => {
                res.status(201).send({ msg: "Page Created Successfully.", page });
            })
            .catch((error) => {
                res.status(500).json({ error: error});
            });
        })
        .catch((error) => {
            return res.status(404).send({ error });
        });
    } catch (error) {
        return res.status(500).send({error: "Internal server error" });
    }
}

export async function deletePage(req, res) {
    const { id } = req.params;
    const { username } = req.user;
    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });

        const response = await PagesModel.findOneAndDelete({ _id: id, username });
        if (!response) return res.status(400).send({ error: "Unable to delete Page" });

        return res.status(204).send({ msg: "Page deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Page" });
    }
}

export async function deletePagesByProject(req, res) {
    const { username } = req.user;
    const { project } = req.params;

    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });

        const response = await PagesModel.deleteMany({ username, project });
        if (!response) return res.status(400).send({ error: "Unable to delete Pages" });

        return res.status(204).send({ msg: "Pages deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Pages" });
    }
}

export async function isPageExist(req, res) {
    const { username  } = req.user;
    const { pageName, project} = req.query;
    
    try {
        PagesModel.findOne({ username, project, pageName }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(200).send({ exist: false });

            return res.status(200).send( {exist: true});
        });
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

export async function getPage(req, res) {
    const { id } = req.params;

    try {
        PagesModel.findById(id, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

export async function getAll(req, res) {
    
    const { username } = req.user;
    const { project } = req.query;

    try {
        PagesModel.find({username, project}, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Internal Server Error" });
    }
}

export async function update(req, res) {
    try {
        const { id } = req.params;
        const obj = Object.assign({}, req.body);

        if (!obj) return res.status(401).send({ error: "Nothing to update, Already Saved" });

        const updatedPage = await PagesModel.findByIdAndUpdate(id, obj);

        res.status(200).json({ msg: "Page updated Successfully.", updatedPage });
    } catch (error) {
        return res.status(500).send({ error : 'could not update the page.' });
    }
}
