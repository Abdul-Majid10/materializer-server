import { generateHash } from "random-hash";
import cloudinary from "../cloudinary.config.js";
import fs from "fs";
import MediaModel from "../model/Media.model.js";

function genrateRandomHash() {
    return generateHash({ length: 10 });
}

export async function upload(req, res) {
    try {
        const { username } = req.user;
        const { project = "demo" } = req.body;
        let data = [];
        let body = req.body;
        if (req.files.length) {
            for (const file of req.files) {
                const response = await cloudinary.uploader.upload(file.path, {
                    public_id: `photo_${genrateRandomHash()}_${file.filename}`,
                    folder: `${username}_${project}_media`,
                });
                if (response) {
                    unlinkFile(file.path);
                    let newData = {
                        username: username,
                        title: response.original_filename,
                        image: { publicId: response.public_id, secureUrl: response.secure_url },
                    };
                    if (body.project) newData.project = body.project;
                    data.push(newData);
                }
            }
        }

        if (data.length) {
            MediaModel.insertMany(data)
                .then((result) => {
                    return res.status(200).send({ msg: "Media Uploaded sucessfully" });
                })
                .catch((err) => {
                    return res.status(500).send({ error: err.message });
                });
        } else {
            return res.status(500).send({ error: "Unable to upload files." });
        }
    } catch (error) {
        return res.status(500).send(error);
    }
}

const unlinkFile = (path) => {
    fs.unlink(path, (err) => {
        if (err) {
            console.log("Tempfile not deleted");
        }
    });
};

export async function deleteMedia(req, res) {
    const { id } = req.params;
    const { username } = req.user;

    try {
        if (!id) return res.status(400).send({ error: "Invalid id" });
        const media = await MediaModel.findById(id);
        const imgId = media.image.publicId;
        deleteMediaFromStorageServer(imgId);

        const response = await MediaModel.findOneAndDelete({ _id: id, username });
        if (!response) return res.status(400).send({ error: "Unable to delete media" });

        return res.status(204).send({ msg: "Media deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete Media" });
    }
}

function deleteMediaFromStorageServer(publicId) {
    cloudinary.uploader.destroy(publicId);
}

export async function getMedia(req, res) {
    const { id } = req.params;

    try {
        MediaModel.findById(id, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Media Data" });
    }
}

export async function getSearchedMedia(req, res) {
    const { username } = req.user;
    const { project, query } = req.params;
    let queryArr = project ? [project] : ["demo"];

    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });

        MediaModel.find(
            {
                username,
                project: { $in: queryArr },
                image: { title: { $regex: "/" + query + "/gi" } },
            },
            function (err, data) {
                if (err) return res.status(500).send({ err });
                if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

                return res.status(200).send(data);
            }
        );
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Media Data" });
    }
}

export async function getAllMedia(req, res) {
    const { username } = req.user;
    const { project } = req.query;

    let queryArr = project ? [project] : ["demo"];

    try {
        if (!username) return res.status(400).send({ error: "Invalid Username" });

        MediaModel.find({ username, project: { $in: queryArr } }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Media Data" });
    }
}
