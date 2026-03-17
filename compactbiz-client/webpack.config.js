/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { DefinePlugin, IgnorePlugin } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
    mode: isDevelopment ? "development" : "production",
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name]-[fullhash].js",
        chunkFilename: "[name]-[chunkhash].js",
    },
    devtool: "source-map",
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
    context: __dirname, // to automatically find tsconfig.json
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader",
                    options: {
                        projectReferences: true,
                    },
                },
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: "asset/resource"
            },
        ],
    },
    resolve: {
        modules: ["node_modules", path.resolve(__dirname)],
        extensions: [".js", ".ts", ".tsx"],
        plugins: [new TsconfigPathsPlugin({})],
        alias: {
            "typeorm": path.resolve(__dirname, "./stub/typeorm/"),
            "routing-controllers": path.resolve(__dirname, "./stub/routing-controllers/"),
            "jsonwebtoken": path.resolve(__dirname, "./stub/jsonwebtoken/")
        },
        fallback: {
            "path": require.resolve("path-browserify"),
            "crypto": false,
            "util": require.resolve("util/"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/")
        }
    },
    plugins: [
        new HtmlWebpackPlugin({ template: "index.html" }),
        new DefinePlugin({
            process: {
                env: {
                    ENVIRONMENT: JSON.stringify(process.env.ENVIRONMENT)
                }
            }
        }),
        new IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ })
    ].filter(Boolean),
    devServer: {
        historyApiFallback: false,
        allowedHosts: "all",
        open: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
            },
        },
    },
};