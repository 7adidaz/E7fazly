import request from "supertest"
import { server as app, redis as cache } from "../../app.js"
import prisma from "../../util/prisma.js"
import { HTTPStatusCode } from "../../util/error.js"

describe('create a user and login', () => {
    test('signing up with a new email', async () => {
        const response = await request(app)
            .post('/api/v1/signup')
            .send({
                email: "a@gmail.com",
                password: "123456",
                name: "a"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.REDIRECT)
        expect(response.headers['location']).toBe('/login')
    })

    test('signing up with a used email', async () => {
        const response = await request(app)
            .post('/api/v1/signup')
            .send({
                email: "abody@abody.com",
                password: "123565",
                name: "a"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.CONFLICT)
    })

    test('signing up with data that are missing', async () => {
        const response = await request(app)
            .post('/api/v1/signup')
            .send({
                email: "a",
                password: "1",
                name: "a_"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.VALIDATION)
        expect(response.body.error.data.length).toEqual(3)
    })

    test('login with correct data but the email is not verified', async () => {
        const response = await request(app)
            .post('/api/v1/login')
            .send({
                email: "a@gmail.com",
                password: "123456",
            })

        expect(response.statusCode).toBe(HTTPStatusCode.REDIRECT)
        expect(response.headers['location']).toBe('/verify')
    })

    test('login with correct data and the email is verified', async () => {
        const user = await prisma.user.findFirst({
            where: { email: { equals: "a@gmail.com" }, },
        })

        await prisma.user.update({
            where: { id: user.id },
            data: { is_verified: true }
        })

        const response = await request(app)
            .post('/api/v1/login')
            .send({
                email: "a@gmail.com",
                password: "123456",
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body).toEqual(expect.objectContaining({
            message: "SUCCESS",
            token: expect.any(String)
        }))
    })

    beforeAll(async () => {
        await cache.connect();
        await cache.flushAll();
        await prisma.user.deleteMany({ where: { email: "a@gmail.com" } })
        await prisma.user.create({
            data: {
                id: 1, 
                email: "abody@abody.com",
                password: "123565",
                name: "a",
                base_directory_id: null, 
                is_verified: true, 
                verification_code: 1
            }
        })
    })

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: "a@gmail.com" } })
        await prisma.user.deleteMany({ where: { id: { in : [1]} } })
        await cache.disconnect();
    })
})