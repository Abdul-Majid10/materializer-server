import  classes  from "../assets/Tailwind/classes.js";
import CSSClassesModel from "../model/CssClasses.model.js";

function PushTailwindClasses() {
    let name = "TailwindClasses";
    try {
        const newCSSClasses = new CSSClassesModel({ name, classes: classes });
        newCSSClasses
            .save()
            .then(() => {
                console.log("Tailwind Classes Pushed");
            })
            .catch((err) => {
                console.log(err);
            });
    } catch (error) {
        console.log("Error 1 on Pushing Tailwind Classes");
    }
}

PushTailwindClasses();
