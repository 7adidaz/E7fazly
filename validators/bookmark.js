import Joi from "joi";

export const bookmarkValidation = Joi.object({
    id: Joi.number().optional(),
    link: Joi.string().uri().required(), //TODO: is URI is like URL? 
    owner_id: Joi.number().required(),
    directory_id: Joi.number().required(),
    type: Joi.string().required(), //TODO:  has to be in the enum. 
    favorite: Joi.boolean().required()
})