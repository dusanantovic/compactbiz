const path = require("path");

module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        "plugin:react/recommended",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended"
    ],
    overrides: [],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
        tsconfigRootDir: path.join(__dirname, "..", ".."),
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: [
        "eslint-plugin-import",
        "eslint-plugin-jsdoc",
        "eslint-plugin-react",
        "eslint-plugin-react-hooks",
        "@typescript-eslint"
    ],
    settings: {
        react: {
            version: "18.2.0"
        }
    },
    rules: {
        "@typescript-eslint/ban-types": 1,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-empty-function": 1,
        "@typescript-eslint/no-unused-vars": 1,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-var-requires": 1,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/no-floating-promises": [
            "error",
            {
                ignoreVoid: true
            }
        ],
        "react/jsx-key": 1,
        "react/display-name": 0,
        "no-useless-escape": 0,
        "no-unescaped-entities": 0,
        "no-prototype-builtins": 0,
        "react/no-unescaped-entities": 1,
        "react/prop-types": 1,
        "no-multiple-empty-lines": [
            "warn",
            {
                max: 1,
                maxEOF: 0
            }
        ],
        "quotes": [
            1,
            "double",
            {
                avoidEscape: true,
                allowTemplateLiterals: true
            }
        ],
        "jsx-quotes": [
            1,
            "prefer-double"
        ],
        "semi": 1
    }
};