import request from "supertest"
import jwt from "jsonwebtoken"

import { server as app, redis as cache } from "../../app.js"
import prisma from "../../util/prisma.js"
import { HTTPStatusCode } from "../../util/error.js"

describe('bookmark ', () => {
    let user, token;

    test('create a bookmark', async () => {
        const response = await request(app)
            .post('/api/v1/bkmrk/create')
            .set('Cookie', `token=${token};`)
            .send({
                link: "https://www.google.com",
                directoryId: 2,
                type: "link",
                favorite: false
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.bookmark).not.toBeNull()
    })

    test('create a bookmark to a dir with no access to', async () => {
        const response = await request(app)
            .post('/api/v1/bkmrk/create')
            .set('Cookie', `token=${token};`)
            .send({
                link: "https://www.google.com",
                directoryId: 100,
                type: "link",
                favorite: false
            })

        expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('get bookmark by id', async () => {
        const response = await request(app)
            .get('/api/v1/bkmrk/1')
            .set('Cookie', `token=${token};`)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.bookmark.link).toBe("https://www.google.com")
    })

    test('get all bookmarks', async () => {
        const response = await request(app)
            .get('/api/v1/bkmrk/all')
            .set('Cookie', `token=${token};`)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.bookmarks.length).toBe(1)
    })

    test('get all bookmarks by tag', async () => {
        const response = await request(app)
            .get('/api/v1/bkmrk/tag/1')
            .set('Cookie', `token=${token};`)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.bookmarks.length).toBe(0)
    })

    test('patch a list of bookmarks', async () => {
        const response = await request(app)
            .patch('/api/v1/bkmrk')
            .set('Cookie', `token=${token};`)
            .send({
                changes: [
                    {
                        id: 1,
                        link: "https://www.fb.com",
                        directoryId: 2,
                        type: "link",
                        favorite: false
                    }
                ]
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.bookmarks.length).toBe(1)
    })

    test('delete a list of bookmarks', async () => {
        const response = await request(app)
            .delete('/api/v1/bkmrk')
            .set('Cookie', `token=${token};`)
            .query({ ids: '[1]' })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmarks = await prisma.bookmark.findMany({ where: { owner_id: 1 } })
        expect(bookmarks.length).toBe(0)
    })


    beforeEach(async () => {
        await cache.connect();
        await cache.flushAll();
        await prisma.user.deleteMany({ where: { email: { in: ["a@gmail.com", "b@gmail.com"] } } })
        user = await prisma.user.create({
            data: {
                id: 1,
                email: "a@gmail.com",
                password: "11111",
                name: "a",
                is_verified: true,
                verification_code: 1,
                base_directory_id: null,
            }
        })
        token = jwt.sign({ issuerId: user.id }, process.env.TOKEN_SECRET, { expiresIn: 86400 })

        await prisma.directory.create({
            data: {
                id: 1,
                icon: "default",
                name: "root",
                owner_id: user.id,
                parent_id: null
            }
        })

        user = await prisma.user.update({
            where: { id: 1 },
            data: { base_directory_id: 1 }
        })

        // ---- create a dir under the base dir
        await prisma.directory.create({
            data: {
                id: 2,
                icon: "default",
                name: "dir",
                owner_id: user.id,
                parent_id: 1
            }
        })

        // create a dir and bkrmk under the dir
        await prisma.directory.create({
            data: {
                id: 3,
                icon: "default",
                name: "dir",
                owner_id: user.id,
                parent_id: 2
            }
        })

        await prisma.bookmark.create({
            data: {
                id: 1,
                link: "https://www.google.com",
                favorite: false,
                type: "link",
                owner_id: user.id,
                directory_id: 2
            }
        })
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [1] } } })
        await cache.disconnect();
    })
})