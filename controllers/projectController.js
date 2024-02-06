import ProjectModel from "../model/Project.model.js";

export async function create(req, res) {
    try {
        const { username } = req.user;
        const { name } = req.body;

        // Check if a project with the same name already exists for the same username
        const existingProject = await ProjectModel.findOne({
            username,
            name,
        });
        if (existingProject) {
            return res.status(400).json({
                error: "Project with the same name already exists",
            });
        }

        const newProject = new ProjectModel({
            username,
            name,
        });

        newProject
            .save()
            .then((project) => {
                res.status(201).send({ msg: "Project Created Successfully.", project });
            })
            .catch((error) => {
                res.status(500).json({ error: error?.message ?? "Internal server error" });
            });
    } catch (error) {
        return res.status(500).send({ error: error?.message ?? "Internal server error" });
    }
}

export async function deleteProject(req, res, next) {
    const { id } = req.body;
    const { username } = req.user;

    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });
        const project = await ProjectModel.findOne({ _id: id, username });
        const response = await ProjectModel.findOneAndDelete({ _id: id, username });
        if (!response) return res.status(404).send({ error: "Unable to delete Project" });
        req.params.project = project.name;
        next();

    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Project" });
    }
}

export async function configs(req, res) {
    const { username } = req.user;
    const { name } = req.query;

    try {
        ProjectModel.findOne({ username, name }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Preoject Data" });
    }
}

export async function isProjectExist(req, res) {
    const { username } = req.user;
    const { name } = req.query;

    try {
        ProjectModel.findOne({ username, name }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(200).send({ exist: false });

            return res.status(200).send({ exist: true });
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Project Data" });
    }
}

export async function getById(req, res) {
    const { username } = req.user;
    const { id } = req.params;

    try {
        ProjectModel.findById(id, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(400).send({ error: "Couldn't Find the Data" });

            if (data.username === username) {
                return res.status(200).send(data);
            } else {
                return res.status(400).send({ error: "You are not Authorized for this project." });
            }
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Project Data" });
    }
}

export async function getAll(req, res) {
    const { username } = req.user;

    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });

        ProjectModel.find({ username }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find project Data" });
    }
}

export async function update(req, res) {
    try {
        const { username } = req.user;
        const { id, projectConfigsStrings, project } = req.body;
        const data = projectConfigsStrings ? JSON.parse(projectConfigsStrings) : null;

        ProjectModel.findOneAndUpdate({ _id: id, username, name: project }, {configs: data },function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Unable to update data" });

            return res.status(201).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error });
    }
}
