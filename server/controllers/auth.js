import jwt from "jsonwebtoken";
import { APIError, ConflictError } from '../util/error.js';
import prisma from '../util/prisma.js'

export async function signup(req, reply, next) {
    try {
        const value = req.body.value; // from the validation middleware 

        const name = value.name;
        const email = value.email.toLowerCase();
        const password = value.password;

        const found = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        if (found) throw new ConflictError();

        const userCreationTransaction =
            await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        name: name,
                        email: email,
                        password: password,
                        is_verified: true,
                        verification_code: 0,
                        base_directory_id: null
                    }
                });
                if (!newUser) throw new APIError();

                const base_directory = await tx.directory.create({
                    data: {
                        parent_id: null,
                        name: "ROOT",
                        icon: "DEFAULT",
                        owner_id: newUser.id,
                    }
                });
                if (!base_directory) throw new APIError();

                const updatedUser = await tx.user.update({
                    where: {
                        id: newUser.id
                    },
                    data: {
                        base_directory_id: base_directory.id
                    }
                });
                if (!updatedUser) throw new APIError();

                return true;
            });

        if (!userCreationTransaction) throw new APIError();

        reply.json({ message: "SUCCESS" })
    } catch (err) {
        // console.log('err', err instanceof ConflictError, next)
        next(err);
    }
}

export async function login(req, reply, next) {
    try {
        const value = req.body.value;

        const email = value.email.toLowerCase();
        const password = value.password;

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (!user)
            return reply.json({
                message: "FAILED",
                info: "Email is not in database."
            })

        if (user.password !== password)
            return reply.json({
                message: "FAILED",
                info: "Email or Password is not valid."
            })

        if (!user.is_verified) return reply.json({ message: "VERIFY" })

        const token = jwt.sign({ issuerId: user.id }, process.env.TOKEN_SECRET, { expiresIn: 86400 })

        reply.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 86400,
            path: '/'
        })

        return reply.json({
            message: "SUCCESS",
            token: token
        })
    } catch (err) {
        return next(err)
    }
}

export async function verify(req, reply, next) {
    try {
        const value = req.body.value;

        const code = value.verificationCode;
        const userId = req.user.id;

        const user = await prisma.user.findFirst({
            where: userId
        })
        if (!user || user.is_verified) throw new APIError()

        if (code === user.verification_code) {
            await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    is_verified: true
                }
            })
            return reply.json({ message: "SUCCESS" })
        }
        throw new APIError()
    } catch (err) {
        return next(err)
    }
}