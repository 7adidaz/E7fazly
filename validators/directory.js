import Joi from 'joi';
import { objectValidator, singleValidator } from './basic_validators';
import e from 'express';

const createDirectoryDataValidation = Joi.object({
    name: Joi.string().max(255).required(),
    parentId: Joi.number().required(),
    ownerId: Joi.number().required()
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

        req.body.value = value;
        next()
    } catch (err) {
        return next(err);
    }
}

export async function parentIdValidator(req, reply, next) {
    try {
        const id = req.params.parentId; //TODO: update this when auth
        const value = singleValidator(idValidation, id)

        req.body.value.parentId = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function userIdValidator(req, reply, next) {
    try {
        const id = req.params.userId; //TODO: update this when auth
        const value = singleValidator(idValidation, id)

        req.body.value.userId = value;
        next()
    } catch (err) {
        return next(err)
    }
}

export async function updateDirectoryDataValidator(req, reply, next) {
    try {
        const value = objectValidator(updateDirectoryDataValidation, req.body);

        req.body.value = value;
        next()
    } catch (err) {
        return next(err);
    }
}

export async function deleteIdsValidator(req, reply, next) {
    try {
        const initalIdsList = req.query.ids;

        const idList = [];
        initalIdsList
            .split('')
            .forEach(id => {
                const value = singleValidator(idValidation, id);

                idList.push(value);
            })

        req.body.value.idList = idList;
    } catch (err) {
        return next(err);
    }
}