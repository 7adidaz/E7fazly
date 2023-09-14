import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators';

const createUserDataValidation = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).required()
})

const updateUserDataValidation = Joi.object({
    id: Joi.number().required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).required()
})

const emailValidation = Joi.string().trim().email().required();
const idValidation = Joi.number().required();

export async function createUserDataValidator(req, reply, next) {
    try {
        const value = objectValidator(createUserDataValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function updateUserDataValidator(req, reply, next) {
    try {
        const value = objectValidator(updateUserDataValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}
// after the extraction of the id from JWT. 
export async function idValidator(req, reply, next) {
    try {
        const id = req.params.id; //TODO: update this when auth
        const value = singleValidator(idValidation, id);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function emailValidator(req, reply, next) {
    try {
        const email = req.params.email; //TODO: update this when auth
        const value = singleValidator(emailValidation, email);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err)
    }
}