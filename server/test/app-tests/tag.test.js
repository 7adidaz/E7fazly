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
            .set('Authorization', token)
            .send({
                bookmarkId: 1,
                name: "cs"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmark_tag = await prisma.bookmark_tag.findMany({ where: { bookmark_id: 1 } })
        expect(bookmark_tag.length).toBe(2)
    })

    test('add a tag that already exists to a bookmark', async () => {
        const response = await request(app)
            .post('/api/v1/tag/create')
            .set('Authorization', token)
            .send({
                bookmarkId: 1,
                name: "tag"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmark_tag = await prisma.bookmark_tag.findMany({ where: { bookmark_id: 1 } })
        expect(bookmark_tag.length).toBe(1)
    })

    test('add a new tag to a bookmark with no access to', async () => {
        const response = await request(app)
            .post('/api/v1/tag/create')
            .set('Authorization', token)
            .send({
                bookmarkId: 100,
                name: "cs"
            })

        expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('get all tags for a bookmark', async () => {
        const response = await request(app)
            .get('/api/v1/tag/bkmrk/1')
            .set('Authorization', token)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.tags.length).toBe(1)
    })

    test('get all tags for a user ', async () => {
        const response = await request(app)
            .get('/api/v1/tag/all')
            .set('Authorization', token)

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.tags.length).toBe(1)
    })

    test('update a tag name', async () => {
        const response = await request(app)
            .patch('/api/v1/tag')
            .set('Authorization', token)
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
            .set('Authorization', token)
            .send({
                bookmarkId: 1,
                tagId: 1
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)

        const bookmark_tag = await prisma.bookmark_tag.findMany({ where: { bookmark_id: 1 } })
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

        await prisma.tag.create({
            data: {
                id: 1,
                name: "tag",
                owner_id: user.id
            }
        })

        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: 1,
                tag_id: 1
            }
        })
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [1] } } })
        await cache.disconnect();
    })
})