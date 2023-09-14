class BaseError extends Error {

    constructor(name, httpCode, errorObject, isOperational) {
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

        this.httpCode = httpCode;
        this.errorObject = errorObject;
        this.isOperational = isOperational;
    }
}

export class APIError extends BaseError {
    constructor() {
        super("API ERROR", HTTPStatusCode.INTERNAL_SERVER, {}, true)
    }
}

export class ValidationError extends BaseError {
    constructor(errorObject) {
        super("Validation ERROR", HTTPStatusCode.VALIDATION, errorObject, true)
    }
}
export class ConflictError extends BaseError {
    constructor() {
        super("Data conflict ERROR", HTTPStatusCode.CONFLICT, {}, true)
    }
}

export class NotFoundError extends BaseError {
    constructor() {
        super("Record/s Not Found", HTTPStatusCode.NOT_FOUND, {}, true)
    }
}

export class AuthorizationError extends BaseError {
    constructor() {
        //TODO: better status code
        super("AuthZ Error", HTTPStatusCode.NOT_FOUND, {}, true)
    }
}

export const HTTPStatusCode = {
    ACCEPTED_UPDATE_DELETED: 202,
    CREATED: 201,
    INTERNAL_SERVER: 500,
    NOT_FOUND: 404,
    VALIDATION: 422,
    CONFLICT: 409
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

export function isNumber(x) {
    if (x == null || typeof (x) !== typeof (0) || isNaN(x)) {
        return false;
    }
    return true;
}