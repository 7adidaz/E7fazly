import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators.js';

const updateUserDataValidation = Joi.object({ //TODO: should this be optional?
    // id: Joi.number().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).required()
})

const emailValidation = Joi.string().trim().email().required();
const idValidation = Joi.number().required();

export async function updateUserDataValidator(req, reply, next) {
    try {
        const value = objectValidator(updateUserDataValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function idValidator(req, reply, next) {
    try {
        const value = singleValidator(idValidation, req.user.id);

        req.body = { value: { id: value } }
        next()
    } catch (err) {
        return next(err)
    }
}

export async function emailValidator(req, reply, next) {
    try {
        const value = singleValidator(emailValidation, req.params.email);

        req.body = { value: { email: value } }
        next()
    } catch (err) {
        return next(err)
    }
}