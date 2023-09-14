import Joi from "joi";
import { objectValidator, singleValidator } from "./basic_validators";

const createBookmarkValidation = Joi.object({
    link: Joi.string().uri().required(), //TODO: is URI is like URL? 
    owner_id: Joi.number().required(),
    directory_id: Joi.number().required(),
    type: Joi.string().required(), //TODO:  has to be in the enum. 
    favorite: Joi.boolean().required()
})

const updateBookmarkValidation = Joi.object({
    id: Joi.number().required(),
    link: Joi.string().uri().required(), //TODO: is URI is like URL? 
    directory_id: Joi.number().required(),
    type: Joi.string().required(), //TODO:  has to be in the enum. 
    favorite: Joi.boolean().required()
})

const idValidation = Joi.number().required();

export function createBookmarkDataValidator(req, reply, next) {
    try {
        const value = objectValidator(createBookmarkValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err);
    }
}

export function userIdValidator(req, reply, next) {
    try {
        const id = req.body.userId; // this is extracted after auth. 
        const value = singleValidator(idValidation, id);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err);
    }
}

export function bookmarkIdValidator(req, reply, next) {
    try {
        const id = req.params.id;
        const value = singleValidator(idValidation, id);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err);
    }
}

export function tagIdValidator(req, reply, next) {
    try {
        const id = req.params.tagId;
        const value = singleValidator(idValidation, id);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err);
    }
}

export function updateBookmarkDataValidator(req, reply, next) {
    try {
        const updateList = req.params.ids;

        const list = [];
        updateList.forEach(element => {
            const value = singleValidator(updateBookmarkValidation, element);
            list.push(value);
        });

        req.body.value = list;
        next()
    } catch (err) {
        return next(err);
    }
}

export function deleteBookmarkDataValidator(req, reply, next) {
    try {
        const updateList = req.params.ids;

        const list = [];
        updateList.forEach(id => {
            const value = singleValidator(idValidation, id);
            list.push(value);
        });

        req.body.value = list;
        next()
    } catch (err) {
        return next(err);
    }
}
