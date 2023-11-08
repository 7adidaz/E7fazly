import jwt from "jsonwebtoken";
import { APIError, AuthenticationError, ErrorObject, ConflictError, HTTPStatusCode } from '../util/error.js';
import prisma from '../util/prisma.js'
import { generateEmailVerificationLink } from "../util/auth.js";

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

        if (found) throw new ConflictError(
            new ErrorObject(
                "User already exists",
                { email: "Email is already registered" }
            )
        );

        const userCreationTransaction =
            await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        name: name,
                        email: email,
                        password: password,
                        isVerified: true,
                        verificationCode: 0,
                        baseDirectoryId: null
                    }
                });
                if (!newUser) throw new APIError();

                const base_directory = await tx.directory.create({
                    data: {
                        parentId: null,
                        name: "ROOT",
                        icon: "DEFAULT",
                        ownerId: newUser.id,
                    }
                });
                if (!base_directory) throw new APIError();

                const updatedUser = await tx.user.update({
                    where: {
                        id: newUser.id
                    },
                    data: {
                        baseDirectoryId: base_directory.id
                    }
                });
                if (!updatedUser) throw new APIError();

                if (process.env.NODE_ENV !== "test"){
                    await generateEmailVerificationLink(newUser.id, newUser.email);
                }

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
            throw new AuthenticationError(
                new ErrorObject(
                    "Could not authenticate user",
                    { email: "Email is not registered" }
                )
            )


        if (user.password !== password)
            throw new AuthenticationError(
                new ErrorObject(
                    "Could not authenticate user",
                    { password: "Password is incorrect" }
                )
            )

        const token = jwt.sign({ issuerId: user.id }, process.env.TOKEN_SECRET, { expiresIn: 86400 })
        reply.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 999999999999,
            path: '/'
        })

        if (!user.isVerified) return reply.status(HTTPStatusCode.UNAUTHORIZED).json({ message: "VERIFY" })
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
        const value = req.params.code;

        const decoded = jwt.verify(value, process.env.TOKEN_SECRET);
        const id = decoded.id;

        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                isVerified: true
            }
        })

        reply.json({ message: "SUCCESS" })
    } catch (err) {
        return next(err)
    }
}