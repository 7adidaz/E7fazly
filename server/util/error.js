export class BaseError extends Error {

    constructor(name, statusCode, errorObject, isOperational) {
        /**
         * the error object should be like this: 
         * {
         *      description:    "",
         *      data:{
         *          // detailed objects.     
         *      } 
         * }
         */
        super(name);

        this.statusCode = statusCode;
        this.errorObject = errorObject;
        this.isOperational = isOperational;
    }
}

export class APIError extends BaseError {
    constructor() {
        super("API error", HTTPStatusCode.INTERNAL_SERVER, {}, true)
    }
}

export class ValidationError extends BaseError {
    constructor(errorObject) {
        super("Validation error", HTTPStatusCode.VALIDATION, errorObject, true)
    }
}
export class ConflictError extends BaseError {
    constructor(errorObject) {
        super("Data conflict error", HTTPStatusCode.CONFLICT, errorObject, true)
    }
}

export class NotFoundError extends BaseError {
    constructor() {
        super("Record/s Not Found", HTTPStatusCode.NOT_FOUND, {}, true)
    }
}

export class AuthorizationError extends BaseError {
    constructor() {
        super("AuthZ Error", HTTPStatusCode.UNAUTHORIZED, {}, true)
    }
}

export class AuthenticationError extends BaseError {
    constructor(errorObject) {
        super("AuthN Error", HTTPStatusCode.UNAUTHENTICATED, errorObject, true)
    }
}

export const HTTPStatusCode = {
    OK: 200,
    ACCEPTED_UPDATE_DELETED: 202,
    CREATED: 201,
    REDIRECT: 302,
    INTERNAL_SERVER: 500,
    NOT_FOUND: 404,
    VALIDATION: 422,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
    UNAUTHENTICATED: 403,
}

export class ErrorObject {
    constructor(description, data) {
        this.description = description;
        this.data = data;
    }

    toObject() {
        return {
            description: this.description,
            data: this.data
        }
    }
}


export function ErrorHandling(err, req, reply, next) {
    // console.log(err);
    if (err instanceof BaseError) {
        if (err instanceof AuthorizationError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "FAILED", 
                    error: {
                        description: "Authorization error",
                        data: {}
                    }
                });
        }

        if (err instanceof ValidationError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "FAILED",
                    error: err.errorObject
                });
        }

        if (err instanceof APIError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "FAILED",
                    error: {
                        description: "API error",
                        data: {}
                    }
                });
        }

        if (err instanceof ConflictError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "FAILED",
                    error: err.errorObject
                });
        }

        if (err instanceof NotFoundError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "FAILED",
                    error: {
                        description: "Record/s Not Found",
                        data: {}
                    }
                });
        }

        if (err instanceof AuthenticationError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "FAILED",
                    error: err.errorObject
                });
        }
    } else {
        return reply.json({ message: "Something went wrong." });
    }
}
