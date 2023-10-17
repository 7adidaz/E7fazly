import jwt from "jsonwebtoken";
import { APIError, AuthorizationError } from "./error.js";
import prisma from "../util/prisma.js";

export default async function authenticateToken(req, reply, next) {
    try {
        let token = req.headers['authorization']
        if (!token) throw new AuthorizationError();

        token = jwt.verify(token, process.env.TOKEN_SECRET)
        if (!token.issuerId) throw new AuthorizationError();

        const user = await prisma.user.findFirst({
            where: {
                id: token.issuerId
            }
        });
        if (!user) throw new APIError();
        if (!user.is_verified) return reply.redirect('/verify');

        req.user = user;

        next()
    } catch (err) {
        return next(err)
    }
}
