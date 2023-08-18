import Joi from 'joi';

export const userDataValidation = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(5).max(20).required(),
    name: Joi.string().pattern(/^[a-zA-Z\s]+$/).required()
})