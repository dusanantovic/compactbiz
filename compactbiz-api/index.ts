import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";
import { useExpressServer } from "routing-controllers";
import { DBConnection } from "./dbConnection";
import * as controllers from "./src/controllers";
import { HttpErrorHandler } from "./middlewares";
import { setContext } from "./context";
import { authorizationRoleChecker } from "./auth";
import { requestLogger } from "./requestLogger";

const app = express();

app
    .use((req: Request, res: Response, next: NextFunction) => {
        requestLogger(req, res, next);
    })
    .use(helmet())
    .use(cors({
        allowedHeaders: [
            "content-type", "content-range", "accept", "authorization", "append", "delete",
            "entries", "foreach", "get", "has", "keys", "set", "values", "origin"
        ],
        exposedHeaders: ["content-range"],
        origin: "*"
    }))
    .use(bodyParser.json({
        limit: "2mb"
    }))
    .use(async (req: Request, res: Response, next: NextFunction) => {
        await setContext(req, res, next);
    });

useExpressServer(app, {
    routePrefix: "/api",
    controllers: Object.values(controllers),
    classTransformer: true,
    validation: true,
    defaultErrorHandler: false,
    middlewares: [HttpErrorHandler],
    authorizationChecker: authorizationRoleChecker
});

const port = process.env.PORT;

if (port) {
    console.log("Running API...");
    app.listen(port, async () => {
        console.log("Environment:", process.env.ENVIRONMENT);
        await DBConnection.setConnection();
        console.log(`Server is running on port:`, port);
    });
} else {
    console.error("PORT is missing");
}