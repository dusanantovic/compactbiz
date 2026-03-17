/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { DefinePlugin } = require("webpack");
const dotenv = require("dotenv");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

if (!process.env.ENVIRONMENT) { // In case of running locally
    dotenv.config({ path: path.join(__dirname, ".env") });
}

const envVars = {};
Object.keys(process.env).forEach(key => {
    if (typeof process.env[key] === "string") {
        envVars[`process.env.${key}`] = JSON.stringify(process.env[key]);
    }
});

module.exports = {
    target: "node",
    mode: "development",
    entry: "./index.ts",
    devtool: "source-map",
    context: __dirname, // to automatically find tsconfig.json
    output: {
        filename: "index.js",
        path: path.join(__dirname, "dist"),
        libraryTarget: "commonjs"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: false,
                        projectReferences: true
                    }
                }
            },
            {
                test: /\.html$/i,
                loader: "html-loader"
            }
        ],
    },
    resolve: {
        modules: ["node_modules", path.resolve(__dirname)],
        extensions: [".js", ".ts", ".tsx", ".d.ts"],
        plugins: [new TsconfigPathsPlugin({})]
    },
    plugins: [
        new DefinePlugin(envVars)
    ].filter(Boolean)
};