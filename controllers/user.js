import bcrypt from 'bcrypt';
import prisma from '../util/prismaclient.js'
import { emailValidation, userDataValidation } from '../validators/user.js';

//TODO: hash the passwords

export async function createUser(req, reply, next) {
    try {
        const validationResult = userDataValidation.validate(req.body, { abortEarly: false })
        if (validationResult) {
            const error = new ValidationError({
                description: "the data provided don't pass the validation requirement",
                data: validationResult.error.details.map(err => err.message)
            })
            throw error;
        }

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const found = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (found) {
            const error = new ConflictError({
                description: "Email already used",
                data: {}
            })
            throw error;
        }

        /**
         * Email verification 
         * then redirection the /login
         */

        return reply.redirect('/login')
    } catch (err) {
        return next(err);
    }
}

//TODO: this should be authN 
export async function getUser(req, reply, next) {
    try {
        const id = req.body.id;

        if (!id && typeof (id) === typeof (0)) {
            const error = new ValidationError({
                description: "Request must contain an ID as a number",
                data: validationResult.error.details.map(err => err.message)
            })
            throw error;
        }

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) {
            const error = new ValidationError({
                description: "ID Not found in the DB",
                data: {}
            })
            throw error;
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
        const email = req.body.email;

        const validationResult = emailValidation.validate(email);
        if (validationResult) {
            const error = new ValidationError({
                description: "Request must contain a valid email",
                data: validationResult.error.details.map(err => err.message)
            })
            throw error;
        }

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (!user) {
            const error = new ValidationError({
                description: "Email Not found in the DB",
                data: {}
            })
            throw error;
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
        const validationResult = userDataValidation.validate(req.body, { abortEarly: false })
        if (validationResult) {
            const error = new ValidationError({
                description: "the data provided don't pass the validation requirement",
                data: validationResult.error.details.map(err => err.message)
            })
            throw error;
        }

        if (!id && typeof (id) === typeof (0)) {
            const error = new ValidationError({
                description: "Request must contain an ID as a number",
                data: validationResult.error.details.map(err => err.message)
            })
            throw error;
        }

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        const id = req.body.id;
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if (!user) {
            throw new ValidationError({
                description: "ID Not found in the DB",
                data: {}
            })
        }

        //TODO, make sure if's an email change that 
        // it's not used already! 

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
            //TODO: Make every error like this! 
            throw new APIError({
                description: "Somthing went wrong saving the use to the database",
                data: {}
            })
        }

        return reply.status(HTTPStatusCode.OK);
    } catch (err) {
        return next(err)
    }
}

export async function deleteUser(req, reply, next) {
    const id = req.body.id;
}
