const dependenciesList = {
    bcrypt: "^5.1.0",
    cors: "^2.8.5",
    dotenv: "^16.0.3",
    express: "^4.18.2",
    jsonwebtoken: "^9.0.0",
    mongoose: "^6.10.0",
    nodemon: "^2.0.20",
    path: "^0.12.7",
};

const defaultDependencies = [
    "bcrypt",
    "cors",
    "dotenv",
    "express",
    "jsonwebtoken",
    "mongoose",
    "nodemon",
    "path",
]

export const getpackageJson = (projectName, dependencies = defaultDependencies) => {
    let file = `{
    "name": "${projectName ?? ""}",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "type": "module",
    "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "dependencies": {\n`;

    let first = true;
    for (const dep of dependencies) {
        if (typeof dependenciesList[dep] !== "undefined") {
            if (!first) file += `,\n`
            file += `\t    "${dep}": "${dependenciesList[dep]}"`;
            first = false;
        }
    }
    file += `\n\t}
}`;

    return file;
};

function formatJson(jsonString) {
    const obj = JSON.parse(jsonString);

    let result = "";

    for (const [key, value] of Object.entries(obj)) {
        result += `\t${key}: {\n`;

        for (const [prop, val] of Object.entries(value)) {
            result += `\t\t${prop}: ${val},\n`;
        }

        result += `\t},\n`;
    }

    return `{\n${result}}`;
}

export const getSchemaModel = (data) => {
    let file = `import mongoose from "mongoose";

export const ${data?.collectionName}Schema = new mongoose.Schema(${formatJson(
        data?.collectionJsonString
    )});
    
export default mongoose.model.${data?.collectionName} || mongoose.model("${
        data?.collectionName
    }", ${data?.collectionName}Schema);
`;
    return file;
};

export const getDbConnection = () => {
    let file = `import mongoose from "mongoose";

async function connect(){

    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(process.env.MONGO_ATLAS_URI);
    console.log("Database Connected")
    return db;
}

export default connect;`;

    return file;
};

export const getRouter = (colName , apis) => {

    let file = `import { Router } from "express";
const ${colName}Router = Router();
    
/** import all controllers */
import * as ${colName}Controller from "../controllers/${colName}Controller.js";
import Auth from "../middleware/auth.js";
    
/** API Routes Methods */\n`

    for (const data of apis) {
        if (data.exportIncluded){
            const middleware = data.type === "private" ? "Auth, " : "";
            const templateString = `${colName}Router.route("${data.apiEndUrl}").${data.apiMethod.toLowerCase()}(${middleware}${colName}Controller.${data.name.charAt(0).toLowerCase() + data.name.slice(1)});\n`;
            file += templateString;
         }
      }
    file += `
export default ${colName}Router;
    `
    return file;
}

export const getEnvFile = (configs = []) => {
    let isPortExist = false;
    let file = `# Default Config which is required to run application #\n
# MONGO_ATLAS_URI = ""\n
# JWT_SECRET = ""\n
# PORT = "8080"\n
`;
    for (const config of configs) {
        if (config.key === 'PORT') isPortExist = true;
        file += `${config.key} = "${config.value}"\n`;
    }

    if (!isPortExist) file += `PORT = "8080"\n`;

    return file;
};


export const getAuthMid = () => {
    let file = `import jwt from 'jsonwebtoken';

    /** auth middleware */
    export default async function Auth(req, res, next){
        try {
            
            // access authorize header to validate request
            const token = req.headers.token.split(" ")[1];
    
            // retrive the user details fo the logged in user
            const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    
            req.user = decodedToken;
    
            next()
    
        } catch (error) {
            res.status(401).json({ error : "Authentication Failed!"})
        }
    }
    
    
    export function localVariables(req, res, next){
        req.app.locals = {
            OTP : null,
            resetSession : false
        }
        next()
    }
    `
    return file;
}

const getControllerFunction = (colName, api) => {

    let Model = colName + "Model"
    let functionBody = `` ;
    if (api.exportIncluded) {
        switch (api.name) {
            case "Get" + colName:
                functionBody += `
export async function ${api.name.charAt(0).toLowerCase() + api.name.slice(1)}(req, res) {
    const { id } = req.params;
    try {
        if(id === undefined) res.status(404).send({ error: "ID must required. Make sure your endUrl ends with /:id" });
        ${Model}.findById(id, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Server Error" });
    }
}\n`;
                break;
            case "GetAll" + colName:
                functionBody += `
export async function ${api.name.charAt(0).toLowerCase() + api.name.slice(1)}(req, res) {
    try {
        ${Model}.find({}, function (err, data) {
            if (err) return res.status(500).send({ err });
            if (!data) return res.status(404).send({ error: "Couldn't Find the Data" });
            return res.status(200).send(data);
        });
    } catch (error) {
        return res.status(500).send({ error: "Server Error" });
    }
}\n`;
                break;

            case "Create" + colName:
                functionBody += `            
export async function ${api.name.charAt(0).toLowerCase() + api.name.slice(1)}(req, res) {
    try {
        const new${colName} = new ${Model}(req.body);
        new${colName}
            .save()
            .then((data) => {
                res.status(201).send({ msg: "${colName} Created Successfully.", data });
            })
            .catch((error) => {
                res.status(500).json({ error: "Internal server error" });
            });
    } catch (error) {
        return res.status(500).send(error);
    }
}\n`;
                break;
            case "Delete" + colName:
                functionBody += `
export async function ${api.name.charAt(0).toLowerCase() + api.name.slice(1)}(req, res) {
    const { id } = req.params;

    try {
        if (!id) return res.status(400).send({ error: "ID must required. Make sure your endUrl ends with /:id" });

        const response = await ${Model}.findByIdAndDelete(id);
        if (!response) return res.status(404).send({ error: "Unable to delete document"});

        return res.status(204).send({ msg: "Document deleted sucessfully" });
    } catch (error) {
        return res.status(500).send({ error: "Unable to delete document"});
    }
}\n`;
                break;
            case "Update" + colName:
                functionBody += `

export async function ${api.name.charAt(0).toLowerCase() + api.name.slice(1)}(req, res) {
    try {
        const { id } = req.params;
        const obj = Object.assign({}, req.body);

        if (!obj) return res.status(401).send({ error: "Nothing to update" });

        const updatedDoc = await ${Model}.findByIdAndUpdate(id, obj);

        res.status(200).json({ msg: "Document updated Successfully.", updatedDoc });
    } catch (error) {
        return res.status(500).send({ error });
    }
}\n`;
                break;
            default:
                functionBody += ``;
                break;
        }
    }

    return functionBody;

}

export const getController = (colName, apis) => {

    let Model = colName+"Model"
    let file = `import ${Model} from "../model/${colName}.model.js";\n`
    for (const api of apis) {
        file += getControllerFunction(colName, api)
    }

    return file;
}


export const getIndexFile = (collections) => {
    let file = `
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect from "./database/conn.js";

/** CollectionsRouter Imports */\n`

for (const collection of collections) {
    file += `import ${collection.collectionName}Router from "./router/${collection.collectionName}Router.js";\n`
}
file += `
dotenv.config();
const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

const port = process.env.PORT || 8080;

/** HTTP GET Request */
app.get("/", (req, res) => {
    res.status(200).json("Home Route");
});
/** api routes */\n`

for (const collection of collections) {
    file += `app.use("/${collection.collectionName.toLowerCase()}", ${collection.collectionName}Router);\n`
}
file +=`
/** start server only when we have valid connection */
connect()
    .then(() => {
        try {
            app.listen(port, () => {
                console.log("Server connected.");
            });
        } catch (error) {
            console.log("Cannot connect to the server");
        }
    })
    .catch((error) => {
        console.log("Invalid database connection...!");
    });
    `
    return file;
}