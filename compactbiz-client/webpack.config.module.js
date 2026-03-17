var config = require("./webpack.config");

config.module.rules = [
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
            loader: "babel-loader",
            options: {
                cacheDirectory: true,
                presets: [
                    ["@babel/preset-env", { targets: { node: "8" } }],
                    ["@babel/preset-react"],
                    [
                        "@babel/preset-typescript",
                        { isTSX: true, allExtensions: true }
                    ]
                ],
                plugins: [["@babel/plugin-proposal-decorators", { legacy: true }]]
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
    }
];
config.stats = {
    preset: "summary",
    timings: true,
};

module.exports = config;