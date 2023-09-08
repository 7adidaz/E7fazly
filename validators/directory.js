import Joi from 'joi';

export const directoryDataValidation = Joi.object({
    id: Joi.number().optional(),
    icon: Joi.string().optional(),
    name: Joi.string().max(255).required(),
    parentId: Joi.number().required(),
    ownerId: Joi.number().required()
})