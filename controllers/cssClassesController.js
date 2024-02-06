import CssClassesModel from "../model/CssClasses.model.js";
import classes from "../assets/Tailwind/classes.js";

export async function PushTailwindClasses(req, res) {
    let name = "TailwindClasses";
    try {
        const newCSSClasses = new CssClassesModel({ name, classes: classes });
        newCSSClasses
            .save()
            .then(() => {
                res.status(200).send({ msg: "Tailwind Classes Pushed" });
            })
            .catch((err) => {
                res.status(500).send({ error: err });
            });
    } catch (error) {
        res.status(500).send({ error: err });
    }
}


export async function getClasses(req, res) {
    const { name } = req.params;

    try {
        if (!name) name = 'TailwindClasses'

        CssClassesModel.findOne({ name }, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });

            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Cannot Find Classes Data" });
    }
}
