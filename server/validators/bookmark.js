import Joi from "joi";
import { objectValidator, singleValidator } from "./basic_validators.js";
import { ValidationError } from "../util/error.js";

const createBookmarkValidation = Joi.object({
    link: Joi.string().required().custom(validateUrl, 'url validation'),
    // ownerId: Joi.number().required(),
    directoryId: Joi.number().required(),
    type: Joi.string().valid('img', 'link', 'etc').required(),
    favorite: Joi.boolean().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    tags: Joi.array().items(Joi.string().optional()).required()
})

const updateBookmarkValidation = Joi.object({
    id: Joi.number().required(),
    link: Joi.string().required().custom(validateUrl, 'url validation'),
    directoryId: Joi.number().required(),
    type: Joi.string().valid('img', 'link', 'etc').required(),
    favorite: Joi.boolean().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
})

function validateUrl(value, helpers) {
    try {
        new URL(value); // Attempt to create a URL object
        return value;    // URL is valid
    } catch (error) {
        return helpers.error('string.uri', { value }); // URL is invalid
    }
};

const idValidation = Joi.number().required();
const urlValidation = Joi.string().required().custom(validateUrl, 'url validation');

export function createBookmarkDataValidator(req, reply, next) {
    try {
        const value = objectValidator(createBookmarkValidation, req.body);

        req.body = { value: value }
        next()
    } catch (err) {
        return next(err);
    }
}

export function metaDataScraperValidation(req, reply, next) {
    try {
        const link = req.params[0];
        const value = singleValidator(urlValidation, link);

        req.body = { value: { link: value } }
        next()
    } catch (err) {
        return next(err);
    }
}

export function bookmarkIdValidator(req, reply, next) {
    try {
        const id = req.params.id;
        const value = singleValidator(idValidation, id);

        req.body = { value: { bookmarkId: value } }
        next()
    } catch (err) {
        return next(err);
    }
}

export function tagIdValidator(req, reply, next) {
    try {
        const id = req.params.tagId;
        const value = singleValidator(idValidation, id);

        req.body = { value: { tagId: value } }
        next()
    } catch (err) {
        return next(err);
    }
}

export function updateBookmarkDataValidator(req, reply, next) {
    try {
        const changesList = req.body.changes;
        if (!changesList) throw new ValidationError();

        changesList.forEach(change => {
            objectValidator(updateBookmarkValidation, change);
        });

        req.body = { value: { changes: changesList } }
        next()
    } catch (err) {
        return next(err);
    }
}

export function deleteBookmarkDataValidator(req, reply, next) {
    try {
        let updateList = req.query.ids;
        if (!updateList) throw new ValidationError();

        updateList = JSON.parse(updateList);
        if (!Array.isArray(updateList)) throw new ValidationError();

        const idList = [];
        updateList.forEach(id => {
            const value = singleValidator(idValidation, id);
            idList.push(value);
        })

        req.body = { value: { ids: idList } }
        next()
    } catch (err) {
        return next(err);
    }
}
