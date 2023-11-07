import request from "supertest"
import jwt from "jsonwebtoken"

import { server as app, redis as cache } from "../../app.js"
import prisma from "../../util/prisma.js"
import { HTTPStatusCode } from "../../util/error.js"

describe('user routes', () => {
    let user, token;

    test('get me', async () => {
        const response = await request(app)
            .get('/api/v1/user/me')
            .set('Cookie', `token=${token};`)
            
            expect(response.statusCode).toBe(HTTPStatusCode.OK)
    })

    test('get me without token', async () => {
        const response = await request(app)
            .get('/api/v1/user/me')
            
            expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('find by email', async () => {
        const response = await request(app)
            .get('/api/v1/user/find/b@gmail.com')
            .set('Cookie', `token=${token};`)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.user.email).toBe('b@gmail.com')
    })

    test('patch a user', async () => {
        const response = await request(app)
            .patch('/api/v1/user')
            .set('Cookie', `token=${token};`)
            .send({
                name: "ax", 
                email : "c@gmail.com",
                password: "123456"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.user.name).toBe('ax')
        expect(response.body.user.email).toBe('c@gmail.com')
        expect(response.body.user.password).toBe('123456')
    })

    test('patch a user with invalid data', async () => {
        const response = await request(app)
            .patch('/api/v1/user')
            .set('Cookie', `token=${token};`)
            .send({
                name: "ax", 
                email : "a", 
                password: "123456" 
            })

        expect(response.statusCode).toBe(HTTPStatusCode.VALIDATION)
        expect(response.body.error.data.length).toBe(1)
    })

    test('delete a user', async () => {
        const response = await request(app)
            .delete('/api/v1/user')
            .set('Cookie', `token=${token};`)

        expect(response.body).toEqual({ message: "SUCCESS" })
        const user  = await prisma.user.findFirst({ where: { email: {equals: "a@gmail.com"} } })
        expect(user).toBeNull()
    })


    beforeEach(async () => {
        await cache.connect();
        await cache.flushAll();
        await prisma.user.deleteMany({ where: { email: { in: ["a@gmail.com", "b@gmail.com","c@gmail.com"] } } })
        user = await prisma.user.create({
            data: {
                id: 1,
                email: "a@gmail.com",
                password: "11111",
                name: "a",
                isVerified: true,
                verificationCode: 1,
                baseDirectoryId: null,
            }
        })

        token = jwt.sign({ issuerId: user.id }, process.env.TOKEN_SECRET, { expiresIn: 86400 })

        await prisma.user.create({
            data: {
                id: 2,
                email: "b@gmail.com",
                password: "11111",
                name: "a",
                isVerified: true,
                verificationCode: 1,
                baseDirectoryId: null,
            }
        })
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: {in: [1,2 ]}} })
        await cache.disconnect();
    })
})
