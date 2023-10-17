import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators.js';

const addTagValidation = Joi.object({
    name: Joi.string().required(),
    bookmarkId: Joi.number().required()
});

const removeTagValidation = Joi.object({
    bookmarkId: Joi.number().required(),
    tagId: Joi.number().required()
});

const updateTagNameValidation = Joi.object({
    tagId: Joi.number().required(),
    newName: Joi.string().required()
});

const idValidation = Joi.number().required();

export function addTagValidator(req, reply, next) {
    try {
        const value = objectValidator(addTagValidation, req.body);

        req.body = { value: value }
        next()
    } catch (err) {
        return next(err);
    }
}

export function removeTagValidator(req, reply, next) {
    try {
        const value = objectValidator(removeTagValidation, req.body);

        req.body = { value: value }
        next()
    } catch (err) {
        return next(err);
    }
}

export function bookmarkIdValidator(req, reply, next) {
    try {
        const id = req.params.bookmarkId;
        const value = singleValidator(idValidation, id);

        req.body = { value: { bookmarkId: value } }
        next()
    } catch (err) {
        return next(err);
    }
}

export function updateTagNameValidator(req, reply, next) {
    try {
        const value = objectValidator(updateTagNameValidation, req.body);

        req.body = { value: value }
        next()
    } catch (err) {
        return next(err);
    }
}
