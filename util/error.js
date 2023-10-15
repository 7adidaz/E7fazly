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
    constructor() {
        super("Data conflict error", HTTPStatusCode.CONFLICT, {}, true)
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

export const HTTPStatusCode = {
    OK: 200,
    ACCEPTED_UPDATE_DELETED: 202,
    CREATED: 201,
    REDIRECT: 302,
    INTERNAL_SERVER: 500,
    NOT_FOUND: 404,
    VALIDATION: 422,
    CONFLICT: 409,
    UNAUTHORIZED: 401
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
    if (err instanceof BaseError) {
        if (err instanceof AuthorizationError) {
            return reply
                .status(err.statusCode)
                .json({ message: "You are not authorized to perform this action." });
        }

        if (err instanceof ValidationError) {
            return reply
                .status(err.statusCode)
                .json({
                    message: "Error Validating the request data",
                    error: err.errorObject
                });
        }

        if (err instanceof APIError) {
            return reply
                .status(err.statusCode)
                .json({ message: "Something went wrong with the database." });
        }

        if (err instanceof ConflictError) {
            return reply
                .status(err.statusCode)
                .json({ message: "Data Conflict Error." });
        }

        if (err instanceof NotFoundError) {
            return reply
                .status(err.statusCode)
                .json({ message: "Record/s Not Found." });
        }
    } else {
        console.log( 'err', err)
        return reply.json({ message: "Something went wrong." });
    }
}
