import { ValidationError, ErrorObject } from "../util/error.js";

export function singleValidator(validator, variable) {
    const { error, value } = validator.validate(variable);

    if (error) throw new ValidationError(
        new ErrorObject(
            "Request must contain a valid data",
            error.details.map(err => err.message)
        ).toObject())

    return value;
}

export function objectValidator(validator, variable) {
    const { error, value } = validator.validate(variable, { abortEarly: false });

    if (error) throw new ValidationError(
        new ErrorObject(
            "The data provided didn't pass the validation requirement",
            error.details.map(err => err.message)
        ).toObject())

    return value;
}
