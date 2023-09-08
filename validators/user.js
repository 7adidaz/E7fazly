import Joi from 'joi';

export const userDataValidation = Joi.object({
    id: Joi.number().optional(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).required()
})

export const emailValidation = Joi.string().trim().email().required();