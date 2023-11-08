import jwt from "jsonwebtoken";
import { APIError, AuthorizationError } from "./error.js";
import prisma from "../util/prisma.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        if (!user.isVerified) return reply.redirect('/verify');

        req.user = user;

        next()
    } catch (err) {
        return next(err)
    }
}


export async function generateEmailVerificationLink(userId, userEmail) {
    try {
        if (!userEmail) throw APIError();
        const cypher = jwt.sign({ id: userId }, process.env.TOKEN_SECRET, { expiresIn: 86400 })
        const data= await resend.emails.send({
            from: 'E7fazly_noreply@hazemmahdyd.net',
            to: [userEmail],
            subject: 'Verify your email',
            html: `<a href="${process.env.CLIENT_URL}/verify/${cypher}">Click here to verify your email</a>`
        })

        if (data.error) throw APIError();

        // console.log(data);
    } catch (err) {
        throw APIError();
    }
}
