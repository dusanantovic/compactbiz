import { round } from "./models/src/util";
import { NextFunction, Request, Response } from "express";
import { performance } from "perf_hooks";

export const requestLogger = (request: Request, response: Response, next: NextFunction): void => {
    const startTime = performance.now();
    console.log(`<--- ${request.method} ${request.url}`);
    next();
    response.on("finish", () => {
        const endTime = performance.now();
        console.log(`---> ${request.method} ${request.url} ${response.statusCode} - ${round(endTime - startTime)} ms`);
    });
};