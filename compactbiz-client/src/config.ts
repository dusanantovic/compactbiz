import numeral from "numeral";

interface Config {
    apiUrl: string;
}

const local: Config = {
    apiUrl: `http://localhost:3001/api`
};

const prod: Config = {
    apiUrl: `https://compactbiz-api-37a2282e72f2.herokuapp.com/api`
};

let configEnv: Config = local;

if (process.env.ENVIRONMENT === "prod") {
    configEnv = prod;
}

numeral.defaultFormat("$0.00");

export const config: Config = configEnv;
