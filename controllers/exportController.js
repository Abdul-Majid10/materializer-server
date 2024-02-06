import { rm, writeFile } from "node:fs/promises";
import { existsSync, rmSync, mkdirSync, createWriteStream } from "node:fs";
import archiver from "archiver";
import {
    getpackageJson,
    getSchemaModel,
    getDbConnection,
    getAuthMid,
    getIndexFile,
    getController,
    getRouter,
    getEnvFile,
} from "../middleware/export.js";
import {
    getpackageJson as getClientPackageJsonFile,
    getTailwindConfigFile,
    getTailwindStyleFile,
    getRootIndexFile,
    getPublicIndexFile,
    getPageContents,
    getPageFile,
    getComponentFile,
    getAppJsFile,
} from "../middleware/exportFrontend.js";
import CollectionModel from "../model/Collection.model.js";
import PagesModel from "../model/Pages.model.js";
import path from "node:path";
import ApisModel from "../model/Apis.model.js";
import ProjectModel from "../model/Project.model.js";

export async function exportProject(req, res) {
    const { userId, username } = req.user;
    const { project, client, server } = req.params;

    let allPromises = [];

    const directoryName = path.join("server", "public", "users", username);
    if (existsSync(directoryName)) {
        rmSync(directoryName, { recursive: true, force: true });
    }
    mkdirSync(directoryName, { recursive: true });

    if (parseInt(client)) {
        const clientDirectoryName = path.join("server", "public", "users", username, "client");
        if (existsSync(clientDirectoryName)) {
            rmSync(clientDirectoryName, { recursive: true, force: true });
        }
        mkdirSync(clientDirectoryName, { recursive: true });

        //for client create required folders
        checkAndCreeatePath(path.join(clientDirectoryName, "public"));
        checkAndCreeatePath(path.join(clientDirectoryName, "src"));
        checkAndCreeatePath(path.join(clientDirectoryName, "src", "assets"));
        checkAndCreeatePath(path.join(clientDirectoryName, "src", "Components"));
        checkAndCreeatePath(path.join(clientDirectoryName, "src", "Hooks"));
        checkAndCreeatePath(path.join(clientDirectoryName, "src", "Pages"));

        let clientPackageJsonFile = getClientPackageJsonFile();
        let tailwindConfig = getTailwindConfigFile();
        let tailwindStyle = getTailwindStyleFile();

        let clientPackageFile = writeFile(
            path.join(clientDirectoryName, "package.json"),
            clientPackageJsonFile
        );
        let tailwindConfigFile = writeFile(
            path.join(clientDirectoryName, "tailwind.config.js"),
            tailwindConfig
        );
        let tailwindStyleFile = writeFile(
            path.join(clientDirectoryName, "src", "tailwind_style.css"),
            tailwindStyle
        );

        let rootIndexFile = getRootIndexFile();
        let publicIndexFile = getPublicIndexFile(project);
        let rootIndexFileProm = writeFile(
            path.join(clientDirectoryName, "src", "index.js"),
            rootIndexFile
        );
        let publicIndexFileProm = writeFile(
            path.join(clientDirectoryName, "public", "index.html"),
            publicIndexFile
        );

        let pagesPromise = [];
        let componentsPromise = [];

        let pages = await PagesModel.find({ username, project });

        let appJsFile = getAppJsFile(pages);
        let appJsFileProm = writeFile(
            path.join(clientDirectoryName, "src", "App.js"),
            appJsFile
        );

        if (pages) {
            await Promise.all(
                pages.map(async (page) => {
                    let pageComponentsContents = getPageContents(page);
                    checkAndCreeatePath(
                        path.join(clientDirectoryName, "src", "Components", page.pageName)
                    );

                    Object.entries(pageComponentsContents).forEach(([key, component]) => {
                        const regex = /(-skip\d*)$/;
                        const match = regex.test(key);
                        if (!match) {
                            let componentFileContent = getComponentFile(key, component);

                            let ComponentFile = writeFile(
                                path.join(
                                    clientDirectoryName,
                                    "src",
                                    "Components",
                                    page.pageName,
                                    key + ".js"
                                ),
                                componentFileContent
                            );
                            componentsPromise.push(ComponentFile);
                        }
                    });

                    let pageFileContent = getPageFile(
                        page.pageName,
                        path.join("..", "Components", page.pageName),
                        pageComponentsContents
                    );

                    let pageFile = writeFile(
                        path.join(clientDirectoryName, "src", "Pages", page.pageName + ".js"),
                        pageFileContent
                    );
                    pagesPromise.push(pageFile);
                })
            );
        }

        allPromises = [
            clientPackageFile,
            tailwindStyleFile,
            tailwindConfigFile,
            rootIndexFileProm,
            publicIndexFileProm,
            appJsFileProm,
            ...pagesPromise,
            ...componentsPromise,
        ];
    }
    if (parseInt(server)) {
        const serverDirectoryName = path.join("server", "public", "users", username, "server");
        if (existsSync(serverDirectoryName)) {
            rmSync(serverDirectoryName, { recursive: true, force: true });
        }
        mkdirSync(serverDirectoryName, { recursive: true });

        //for server create required folders
        checkAndCreeatePath(path.join(serverDirectoryName, "database"));
        checkAndCreeatePath(path.join(serverDirectoryName, "controllers"));
        checkAndCreeatePath(path.join(serverDirectoryName, "router"));
        checkAndCreeatePath(path.join(serverDirectoryName, "middleware"));
        checkAndCreeatePath(path.join(serverDirectoryName, "model"));

        let packageJsonFile = getpackageJson(project);
        let packageFile = writeFile(
            path.join(serverDirectoryName, "package.json"),
            packageJsonFile
        );

        let connFile = getDbConnection();
        let dbConnFile = writeFile(path.join(serverDirectoryName, "database", "conn.js"), connFile);

        let authMiddleware = getAuthMid();
        let authMiddlewareFile = writeFile(
            path.join(serverDirectoryName, "middleware", "auth.js"),
            authMiddleware
        );

        let projectDoc = await ProjectModel.findOne({ username, name: project });

        let envFileContent = "";
        if (projectDoc) {
            envFileContent = getEnvFile(projectDoc.configs);
        }

        let envFilePromise = writeFile(path.join(serverDirectoryName, ".env"), envFileContent);

        let modelPromises = [];
        let routePromices = [];
        let controllerPromices = [];
        let indexFilePromise = [];

        let collections = await CollectionModel.find({ username, project });
        if (collections) {
            await Promise.all(
                collections.map(async (collection) => {
                    let collectionModelSchema = getSchemaModel(collection);

                    let modelFile = writeFile(
                        path.join(
                            serverDirectoryName,
                            "model",
                            collection.collectionName + ".model.js"
                        ),
                        collectionModelSchema
                    );
                    modelPromises.push(modelFile);

                    let apiIds = [];

                    await collection.apis.map((api) => apiIds.push(api.apiId));

                    let apis = await ApisModel.find({ _id: { $in: apiIds } });

                    if (apis) {
                        let controllersFile = getController(collection.collectionName, apis);
                        let routerFile = getRouter(collection.collectionName, apis);

                        let ControllerFile = writeFile(
                            path.join(
                                serverDirectoryName,
                                "controllers",
                                collection.collectionName + "Controller.js"
                            ),
                            controllersFile
                        );
                        controllerPromices.push(ControllerFile);

                        let routeFile = writeFile(
                            path.join(
                                serverDirectoryName,
                                "router",
                                collection.collectionName + "Router.js"
                            ),
                            routerFile
                        );
                        routePromices.push(routeFile);
                    }
                })
            );
            let indexFile = getIndexFile(collections);
            let indexFileRes = writeFile(path.join(serverDirectoryName, "index.js"), indexFile);
            indexFilePromise.push(indexFileRes);

            allPromises = [
                ...allPromises,
                packageFile,
                dbConnFile,
                authMiddlewareFile,
                envFilePromise,
                ...modelPromises,
                ...routePromices,
                ...controllerPromices,
                ...indexFilePromise,
            ];
        }
    }
    const zipFileLocation = path.join("server", "public", "users", "downloads", userId + username);
    if (existsSync(zipFileLocation)) {
        rmSync(zipFileLocation, { recursive: true, force: true });
    }
    mkdirSync(zipFileLocation, { recursive: true });

    Promise.all(allPromises).then(() => {
        createZip(project, directoryName, zipFileLocation)
            .then(() => {
                res.setHeader("Content-Type", "blob");
                res.setHeader("Content-Disposition", `attachment; filename=${project}.zip`);

                res.download(path.join(zipFileLocation, `${project}.zip`), (err) => {
                    if (err) {
                        console.error(err);
                        res.status(504).send({ err });
                    } else {
                        rmSync(directoryName, { recursive: true, force: true });
                        rm(zipFileLocation, { recursive: true, force: true });
                    }
                });
            })
            .catch((error) => res.status(504).send({ error }));
    });
}

function checkAndCreeatePath(path) {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
    }
}

function createZip(project, directoryName, zipFileLocation) {
    return new Promise((resolve, reject) => {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const output = createWriteStream(`${zipFileLocation}/${project}.zip`);

        archive.pipe(output);
        archive.directory(directoryName, false);
        archive.finalize();

        output.on("close", () => {
            console.log(`File ${project}.zip has been created`);
            resolve();
        });

        output.on("end", () => {
            reject(new Error("ZIP creation failed"));
        });

        archive.on("error", (error) => {
            reject(error);
        });
    });
}
