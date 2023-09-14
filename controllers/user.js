import bcrypt from 'bcrypt';
import prisma from '../util/prismaclient.js'
// import { emailValidation, userDataValidation } from '../validators/user.js';
import { ValidationError, APIError, ConflictError, HTTPStatusCode, ErrorObject, isNumber } from '../util/error.js';

//TODO: hash the passwords
//TODO: authenticate & authorize stuff here. 

export async function createUser(req, reply, next) {
    try {
        const value = req.body.value; // from the validation middleware 

        const name = value.name;
        const email = value.email;
        const password = value.password;

        const found = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (found) throw new ConflictError();

        /**
         * //TODO: 
         * Email verification 
         * then redirection the /login
         * maybe a new middleware. 
         */

        const userCreationTransaction =
            await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        name: name,
                        email: email,
                        password: password,
                        is_verified: false,
                        verification_code: 0,
                        base_directory_id: null
                    }
                });
                if(!newUser) throw new APIError();

                const base_directory = await tx.directory.create({
                    data: {
                        parent_id: null,
                        name: "ROOT",
                        icon: "DEFAULT",
                        owner_id: newUser.id,
                    }
                });
                if(!base_directory) throw new APIError();

                const updatedUser = await tx.user.update({
                    where: {
                        id: newUser.id
                    },
                    data: {
                        base_directory_id: base_directory.id
                    }
                });
                if(!updatedUser) throw new APIError();
                
                return true;
            });

        if (!userCreationTransaction) throw new APIError();

        return reply.redirect('/login');
    } catch (err) {
        return next(err);
    }
}

export async function getUser(req, reply, next) {
    try {

        const value = req.body.value;
        const id = value.id;

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) throw new ValidationError()

        return reply.json({
            user: user
        });
    } catch (err) {
        next(err)
    }
}

export async function getByEmail(req, reply, next) {
    try {
        const value = req.body.value; // from the validation middleware 
        const email = value.email;

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (!user) throw new ValidationError()

        return reply.json({
            user: user
        });
    } catch (err) {
        next(err)
    }
}

export async function updateUser(req, reply, next) {
    try {
        const value = req.body.value;
        const id = value.id;

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) throw new ValidationError()

        const name = value.name;
        const email = value.email;
        const password = value.password;

        const emailChecker = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (emailChecker && emailChecker.id !== id) throw new ConflictError();

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

        if (!newUser) throw new APIError();

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                user: newUser
            });
    } catch (err) {
        return next(err)
    }
}

export async function deleteUser(req, reply, next) {
    try {
        const value = req.body.value;
        const id = value.id;

        const user = await prisma.user.findFirst({
            where: {
                id: id
            }
        });

        if (!user) throw new ValidationError();


        const userDeletionResult = await prisma.user.delete({ // this will cascade to the dir, bkmrk, tags, access_rights,, EVERYTHING! 
            where: {
                id: id
            }
        });

        if (!userDeletionResult) throw new APIError();

        return reply.redirect('/signup');
    } catch (err) {
        return next(err);
    }
}
