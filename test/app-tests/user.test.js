import request from "supertest"
import app from "../../app.js"
import prisma from "../../util/prisma.js"
import { HTTPStatusCode } from "../../util/error.js"

describe('create a user and login', () => {

    beforeAll(async () => {
        await prisma.user.deleteMany({ where: { email: "a@gmail.com" } })
    })

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: "a@gmail.com" } })
    })
})