import prisma from '../util/prisma.js'
import { ValidationError, APIError, ConflictError } from '../util/error.js';

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
            message: "SUCCESS",
            user: user
        });
    } catch (err) {
        next(err)
    }
}

export async function getByEmail(req, reply, next) {
    try {
        const value = req.body.value; // from the validation middleware 
        const email = value.email.toLowerCase();

        const user = await prisma.user.findMany({
            where: {
                email: email
            }
        });

        if (!user) throw new ValidationError()

        return reply.json({
            message: "SUCCESS",
            user: user[0]
        });
    } catch (err) {
        next(err)
    }
}

export async function updateUser(req, reply, next) {
    try {
        const value = req.body.value;
        const id = req.user.id;

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
                message: "SUCCESS",
                user: newUser
            });
    } catch (err) {
        return next(err)
    }
}

export async function deleteUser(req, reply, next) {
    try {
        const id = req.user.id;
        const userDeletionResult = await prisma.user.delete({
            where: {
                id: id
            }
        });

        if (!userDeletionResult) throw new APIError();

        return reply.json({ message: "SUCCESS"})
    } catch (err) {
        return next(err);
    }
}
