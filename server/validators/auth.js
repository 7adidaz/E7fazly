import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators.js';

const signupDataValidation = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).required()
})

const loginDataValidation = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
})

const codeValidation = Joi.number().required();

export async function signupDataValidator(req, reply, next) {
    try {
        const value = objectValidator(signupDataValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function loginDataValidator(req, reply, next) {
    try {
        const value = objectValidator(loginDataValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function  verificationDataValidator(req, reply, next) {
    try {
        const value = singleValidator(codeValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}