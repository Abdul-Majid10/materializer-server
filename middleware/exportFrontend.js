import prettier from "prettier/standalone.js";
import parserHtml from "prettier/parser-html.js";
import parserBabel from "prettier/parser-babel.js";

const dependenciesList = {
    "@emotion/react": "^11.10.6",
    "@mui/icons-material": "^5.11.11",
    "@mui/lab": "^5.0.0-alpha.122",
    "@mui/material": "^5.11.10",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.3.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.2",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4",
};

const defaultDependencies = [
    "@mui/icons-material",
    "@mui/lab",
    "@mui/material",
    "@testing-library/jest-dom",
    "@testing-library/react",
    "@testing-library/user-event",
    "axios",
    "react",
    "react-dom",
    "react-router-dom",
    "react-scripts",
    "web-vitals",
];

export const getpackageJson = (dependencies = defaultDependencies) => {
    let file = `
{
    "name": "client",
    "version": "0.1.0",
    "private": true,
    "dependencies": {\n`;

    let first = true;
    for (const dep of dependencies) {
        if (typeof dependenciesList[dep] !== "undefined") {
            if (!first) file += `,\n`;
            file += `\t    "${dep}": "${dependenciesList[dep]}"`;
            first = false;
        }
    }
    file += `\n\t},\n`;

    file += `"scripts": {
      "start": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    "proxy": "http://localhost:8080",
    "eslintConfig": {
      "extends": [
        "react-app",
        "react-app/jest"
      ]
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    },
    "devDependencies": {
      "tailwindcss": "^3.2.7"
    }
}`;
    return file;
};

export const getTailwindConfigFile = () => {
    let file = `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
    extend: {},
    },
    plugins: [],
}`;

    return file;
};

export const getTailwindStyleFile = () => {
    let file = `@import url("https://fonts.googleapis.com/css2?family=Poppins&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

* > * {
    font-family: "Poppins", sans-serif;
}
`;

    return file;
};

export const getPublicIndexFile = (projectName = "React") => {
    let file = `<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
        name="description"
        content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />   
    <title>${projectName} App</title>
    </head>
    <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    </body>
</html>    
`;
    return formatHTML(file);
};

export const getRootIndexFile = () => {
    let file = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "./tailwind_style.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
    <App />
    </React.StrictMode>
);    
`;
    return formatBabel(file);
};

export const getfrontendGitIgnoreFile = () => {
    let file = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
    return file;
};

export const getPageContents = (pageObj) => {
    const components = {};

    pageObj.pageContent.forEach((component) => {
        const formattedContent = formatHTML(component.componentContent);

        if (components.hasOwnProperty(component.componentName)) {
            let postfix = "";

            if (components[component.componentName] === formattedContent) {
                postfix = "-skip";
                //While genrating code if component name have skip[\d] then don;t create file for that component just add Name with out postfix in file content like <Test/>
            }

            let i = 1;
            let newName = `${component.componentName}${postfix}${i}`;

            while (components.hasOwnProperty(newName)) {
                i++;
                newName = `${component.componentName}${postfix}${i}`;
            }

            components[newName] = formattedContent;
        } else {
            components[component.componentName] = formattedContent;
        }
    });

    return components;
};

function formatHTML(htmlString) {
    // Replace "class" with "className"
    const replacedHTML = htmlString.replace(/class="/g, 'className="');

    // Format the HTML string
    const formattedHTML = prettier.format(replacedHTML, {
        parser: "html",
        plugins: [parserHtml],
    });

    return formattedHTML;
}
function formatBabel(htmlString) {
    // Replace "class" with "className"
    const replacedHTML = htmlString.replace(/class="/g, 'className="');

    // Format the HTML string
    const formattedHTML = prettier.format(replacedHTML, {
        parser: "babel",
        plugins: [parserBabel],
    });

    return formattedHTML;
}

export const getPageFile = (pageName, componentsPath, componentList) => {
    let file = `import React from "react";\n`;
    Object.entries(componentList).forEach(([key, component]) => {
        file += `import ${removeSkipSuffix(key)} from "${
            componentsPath + "/" + removeSkipSuffix(key)
        }";\n`;
    });

    file += `function ${pageName}() {
    return (
        <>\n`;

    Object.entries(componentList).forEach(([key, component]) => {
        file += `\t <${removeSkipSuffix(key)} />\n`;
    });

    file += `
        </>
    );
}

export default ${pageName};\n`;

    return formatBabel(file);
};

function removeSkipSuffix(str) {
    const regex = /(-skip\d*)$/;
    const match = regex.exec(str);

    if (match) {
        return str.slice(0, -match[0].length);
    }

    return str;
}

export const getComponentFile = (componentName, componentContent) => {
    let file = `import React from "react";
function ${componentName}() {
    return (
        <>
            ${componentContent}
        </>
    );
}

export default ${componentName};\n`;

    return formatBabel(file);
};

export const getAppJsFile = (pages) => {
    let file = `
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/** import all pages */\n`;

    pages.forEach((page) => {
        file += `import ${page?.pageName} from "./Pages/${page?.pageName}";\n`;
    });

    /** root routes */
    file += `const router = createBrowserRouter([\n`;

    pages.forEach((page) => {
        file += `{
        path: "${page.url ?? "/"}",
        element: <${page.pageName} />,
    },`;
    });
    file += `
]);

function App() {
    return (
        <main>
            <RouterProvider router={router}></RouterProvider>
        </main>
    );
}
export default App;
`;

    return formatBabel(file);
};
