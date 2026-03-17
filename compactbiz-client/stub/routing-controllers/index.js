export default {};

export class ForbiddenError { constructor(msg) { console.error(msg); } }
export class NotFoundError { constructor(msg) { console.error(msg); } }
export class BadRequestError { constructor(msg) { console.error(msg); } }
export class UnauthorizedError { constructor(msg) { console.error(msg); } }
export class HttpError { constructor(code, msg) { console.error(code, msg); } }
