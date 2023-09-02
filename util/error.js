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
        super(name)

        this.name = name;
        this.httpCode = httpCode;
        this.errorObject = errorObject;
        this.isOperational = isOperational;
    }
}

class APIError extends BaseError {
    constructor(errorObject) {
        super("API ERROR", HTTPStatusCode.INTERNAL_SERVER, errorObject, true)
    }
}

class ValidationError extends BaseError {
    constructor(errorObject) {
        super("Validation ERROR", HTTPStatusCode.VALIDATION, errorObject, true)
    }
}
class ConflictError extends BaseError {
    constructor(errorObject) {
        super("Data conflict ERROR", HTTPStatusCode.CONFLICT, errorObject, true)
    }
}

class NotFoundError extends BaseError {
    constructor(errorObject) {
        super("Record/s Not Found", HTTPStatusCode.NOT_FOUND, errorObject, true)
    }
}

const HTTPStatusCode = {
    INTERNAL_SERVER: 500,
    NOT_FOUND: 404,
    VALIDATION: 422,
    CONFLICT: 409
}