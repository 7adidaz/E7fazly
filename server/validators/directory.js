import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators.js';
import { ValidationError } from '../util/error.js';

const createDirectoryDataValidation = Joi.object({
    name: Joi.string().max(255).required(),
    parentId: Joi.number().required(),
    // ownerId: Joi.number().required()
})

const updateDirectoryDataValidation = Joi.object({
    id: Joi.number().required(),
    icon: Joi.string().required(),
    name: Joi.string().max(255).required(),
    parentId: Joi.number().required(),
})

const idValidation = Joi.number().required();


export function createDirectoryDataValidator(req, reply, next) {
    try {
        const value = objectValidator(createDirectoryDataValidation, req.body);

        req.body = { value: value }
        next()
    } catch (err) {
        return next(err);
    }
}

export async function parentIdValidator(req, reply, next) {
    try {
        const id = req.params.parentId;
        const value = singleValidator(idValidation, id)

        req.body = { value: { parentId: value } }
        next()
    } catch (err) {
        return next(err)
    }
}

export async function updateDirectoryDataValidator(req, reply, next) {
    try {
        const changeslist = req.body.changes;
        if (!changeslist) throw new ValidationError();


        changeslist.forEach(change => {
            objectValidator(updateDirectoryDataValidation, change);
        })

        req.body = { value: { changes: changeslist } }
        next()
    } catch (err) {
        return next(err);
    }
}

export async function deleteDirectoryDataValidator(req, reply, next) {
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