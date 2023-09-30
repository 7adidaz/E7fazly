import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators.js';

const grantAccessValidation = Joi.object({
    directoryId: Joi.number().required(),
    userId: Joi.number().required(),
    accessRight: Joi.string().valid('view', 'edit').required()
})

const revokeAccessValidation = Joi.object({
    directoryId: Joi.number().required(),
    userId: Joi.number().required()
})

const idValidation = Joi.number().required();

export function grantAccessValidator(req, reply, next) {
    try {
        const value = objectValidator(grantAccessValidation, req.body);
        req.body = {
            value: value
        }
        next();
    } catch (err) {
        next(err);
    }
}

export function revokeAccessValidator(req, reply, next) {
    try {
        const value = objectValidator(revokeAccessValidation, req.body);
        req.body = {
            value: value
        };
        next();
    } catch (err) {
        next(err);
    }
}

export function getAccessValidator(req, reply, next) {
    try {
        const value = singleValidator(idValidation, req.params.directoryId);
        req.body = {
            value: {
                directoryId: value
            }
        };
        next();
    } catch (err) {
        next(err);
    }
}
