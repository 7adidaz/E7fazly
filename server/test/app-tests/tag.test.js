import request from "supertest"
import jwt from "jsonwebtoken"

import { server as app, redis as cache } from "../../app.js"
import prisma from "../../util/prisma.js"
import { HTTPStatusCode } from "../../util/error.js"

describe('tag routes', () => {
    let user, token;

    test('add a new tag to a bookmark', async () => {
        const response = await request(app)
            .post('/api/v1/tag/create')
            .set('Cookie', `token=${token};`)
            .send({
                bookmarkId: 1,
                name: "cs"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmark_tag = await prisma.bookmark_tag.findMany({ where: { bookmarkId: 1 } })
        expect(bookmark_tag.length).toBe(2)
    })

    test('add a tag that already exists to a bookmark', async () => {
        const response = await request(app)
            .post('/api/v1/tag/create')
            .set('Cookie', `token=${token};`)
            .send({
                bookmarkId: 1,
                name: "tag"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmark_tag = await prisma.bookmark_tag.findMany({ where: { bookmarkId: 1 } })
        expect(bookmark_tag.length).toBe(1)
    })

    test('add a new tag to a bookmark with no access to', async () => {
        const response = await request(app)
            .post('/api/v1/tag/create')
            .set('Cookie', `token=${token};`)
            .send({
                bookmarkId: 100,
                name: "cs"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('get all tags for a bookmark', async () => {
        const response = await request(app)
            .get('/api/v1/tag/bkmrk/1')
            .set('Cookie', `token=${token};`)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.tags.length).toBe(1)
    })

    test('get all tags for a user ', async () => {
        const response = await request(app)
            .get('/api/v1/tag/all')
            .set('Cookie', `token=${token};`)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.tags.length).toBe(1)
    })

    test('update a tag name', async () => {
        const response = await request(app)
            .patch('/api/v1/tag')
            .set('Cookie', `token=${token};`)
            .send({
                tagId: 1,
                newName: "newName"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const tag = await prisma.tag.findFirst({ where: { id: 1 } })
        expect(tag.name).toBe("newName")
    })

    test('delete a tag from a bookmark', async () => {
        const response = await request(app)
            .delete('/api/v1/tag')
            .set('Cookie', `token=${token};`)
            .send({
                bookmarkId: 1,
                tagId: 1
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmark_tag = await prisma.bookmark_tag.findMany({ where: { bookmarkId: 1 } })
        expect(bookmark_tag.length).toBe(0)
        
        const tag = await prisma.tag.findFirst({ where: { id: 1 } })
        expect(tag).toBe(null)
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
                isVerified: true,
                verificationCode: 1,
                baseDirectoryId: null,
            }
        })
        token = jwt.sign({ issuerId: user.id }, process.env.TOKEN_SECRET, { expiresIn: 86400 })

        await prisma.directory.create({
            data: {
                id: 1,
                icon: "default",
                name: "root",
                ownerId: user.id,
                parentId: null
            }
        })

        user = await prisma.user.update({
            where: { id: 1 },
            data: { baseDirectoryId: 1 }
        })

        // ---- create a dir under the base dir
        await prisma.directory.create({
            data: {
                id: 2,
                icon: "default",
                name: "dir",
                ownerId: user.id,
                parentId: 1
            }
        })

        // create a dir and bkrmk under the dir
        await prisma.directory.create({
            data: {
                id: 3,
                icon: "default",
                name: "dir",
                ownerId: user.id,
                parentId: 2
            }
        })

        await prisma.bookmark.create({
            data: {
                id: 1,
                link: "https://www.google.com",
                favorite: false,
                type: "link",
                ownerId: user.id,
                directoryId: 2
            }
        })

        await prisma.tag.create({
            data: {
                id: 1,
                name: "tag",
                ownerId: user.id
            }
        })

        await prisma.bookmark_tag.create({
            data: {
                bookmarkId: 1,
                tagId: 1
            }
        })
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [1] } } })
        await cache.disconnect();
    })
})