import { NextFunction, Request, Response } from "express";
import { Middleware, ExpressErrorMiddlewareInterface, HttpError } from "routing-controllers";

@Middleware({ type: "after" })
export class HttpErrorHandler implements ExpressErrorMiddlewareInterface {

    public constructor() {
        // Empty
    }

    public error(error: any, request: Request, response: Response, next: NextFunction): void {
        if (error instanceof HttpError) {
            response.status(error.httpCode).json({ message: error.message });
        } else {
            response.status(500).json({ message: "Internal server error" });
        }
    }

}