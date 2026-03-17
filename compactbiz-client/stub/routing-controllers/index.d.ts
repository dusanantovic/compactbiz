export declare class ForbiddenError {
    name: string;
    constructor(message?: string);
 }
export declare class NotFoundError {
    name: string;
    constructor(message?: string);
 }
export declare class BadRequestError { 
    name: string;
    constructor(message?: string);
}
export declare class UnauthorizedError {
    httpCode: number;
    constructor(httpCode: number, message?: string);
}
export declare class HttpError extends Error {
    httpCode: number;
    constructor(httpCode: number, message?: string);
}
