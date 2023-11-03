import jwt from "jsonwebtoken";
import { APIError, AuthorizationError } from "./error.js";
import prisma from "../util/prisma.js";

export async function authenticateToken(req, reply, next) {
    try {
        let token = req.cookies.token;
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


export async function generateEmailVerificationLink(userId) {
    //TODO:  something to generate a token + a random uuid 
    // add this to the database 
    // send the link to the user's email
}
