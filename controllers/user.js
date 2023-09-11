import bcrypt from 'bcrypt';
import prisma from '../util/prismaclient.js'
import { emailValidation, userDataValidation } from '../validators/user.js';
import { ValidationError, APIError, ConflictError, HTTPStatusCode, ErrorObject, isNumber } from '../util/error.js';

//TODO: hash the passwords

export async function createUser(req, reply, next) {
    try {
        const { error, value } = userDataValidation.validate(req.body, { abortEarly: false })
        if (error) {
            throw new ValidationError(
                new ErrorObject(
                    "the data provided don't pass the validation requirement",
                    error.details.map(err => err.message)
                ).toObject());
        }

        //TODO: must extract the data from the 'value' returned by the validation step 
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const found = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (found) {
            throw new ConflictError(
                new ErrorObject(
                    "Email already used",
                    {}
                ).toObject())
        }

        /**
         * //TODO: 
         * Email verification 
         * then redirection the /login
         */

        const newUser = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: password
            }
        });

        if (!newUser) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong saving the user to the database",
                    {}
                ).toObject())
        }

        return reply.redirect('/login');
    } catch (err) {
        return next(err);
    }
}

//TODO: this should be authN 
export async function getUser(req, reply, next) {
    try {
        const id = req.body.id;

        if (!isNumber(id)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain an ID as a number",
                    {}
                ).toObject())
        }

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new ValidationError(
                new ErrorObject(
                    "ID Not found in the DB",
                    {}
                ).toObject())
        }

        return reply.json({
            user: user
        });
    } catch (err) {
        next(err)
    }
}

//TODO: this should be authN 
export async function getByEmail(req, reply, next) {
    try {
        const email = req.params.email;

        const { error, value } = emailValidation.validate(email);
        if (error) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain a valid email",
                    error.details.map(err => err.message)
                ).toObject())
        }

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (!user) {
            throw new ValidationError(
                new ErrorObject(
                    "Email Not found in the DB",
                    {}
                ).toObject())
        }

        return reply.json({
            user: user
        });
    } catch (err) {
        next(err)
    }
}

//TODO: this should be authN 
export async function updateUser(req, reply, next) {
    try {
        const { error, value } = userDataValidation.validate(req.body, { abortEarly: false })
        if (error) {
            throw new ValidationError(
                new ErrorObject(
                    "the data provided don't pass the validation requirement",
                    error.details.map(err => err.message)
                ).toObject())
        }

        const id = req.body.id;
        if (!isNumber(id)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain an ID as a number",
                    {}
                ).toObject())
        }

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new ValidationError(
                new ErrorObject(
                    "ID Not found in the DB",
                    {}
                ).toObject())
        }

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const emailChecker = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (emailChecker && emailChecker.id !== id) {
            throw new ConflictError(
                new ErrorObject(
                    "Email already used",
                    {}
                ).toObject())
        }

        const newUser = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                name: name,
                email: email,
                password: password
            }
        });

        if (!newUser) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong saving the user to the database",
                    {}
                ).toObject())
        }

        return reply
        .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
        .json({
            user: newUser
        });  
    } catch (err) {
        return next(err)
    }
}

//TODO: this should be authZ
export async function deleteUser(req, reply, next) {
    try {
        const id = req.body.id;
        if (!isNumber(id)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain an ID as a number",
                    validationResult.error.details.map(err => err.message)
                ).toObject())
        }

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            throw new ValidationError(
                new ErrorObject(
                    "ID Not found in the DB",
                    {}
                ).toObject())
        }

        const userDeletionResult = await prisma.user.delete({ // this will cascade to the dir, bkmrk, tags, access_rights,, EVERYTHING! 
            where: {
                id: id
            }
        });

        if (!userDeletionResult) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong deleting the user!",
                    {}
                ).toObject())
        }

        return reply.redirect('/signup');
    } catch (err) {
        return next(err);
    }
}
