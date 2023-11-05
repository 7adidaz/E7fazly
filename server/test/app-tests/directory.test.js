import request from "supertest"
import jwt from "jsonwebtoken"

import { server as app, redis as cache } from "../../app.js"
import prisma from "../../util/prisma.js"
import { HTTPStatusCode } from "../../util/error.js"

describe('directory routes', () => {
    let user, token;

    test('create a directory', async () => {
        const response = await request(app)
            .post('/api/v1/dir/create')
            .set('Cookie', `token=${token};`)
            .send({
                name: "dir",
                parentId: user.base_directory_id
            })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.directory.name).toBe('dir')
        expect(response.body.directory.parent_id).toBe(user.base_directory_id)
    })

    test('create a directory to a dir with no access to', async () => {
        const response = await request(app)
            .post('/api/v1/dir/create')
            .set('Cookie', `token=${token};`)
            .send({
                name: "dir",
                parentId: 100
            })

        expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('get content by parent', async () => {
        const response = await request(app)
            .get('/api/v1/dir/content/2')
            .set('Cookie', `token=${token};`)
        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.directories.length).toBe(1)
        expect(response.body.bookmarks.length).toBe(1)
    })

    test('get content by parent with no access to', async () => {
        const response = await request(app)
            .get('/api/v1/dir/content/100')
            .set('Cookie', `token=${token};`)
        expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('get all directories', async () => {
        const response = await request(app)
            .get('/api/v1/dir/all')
            .set('Cookie', `token=${token};`)
        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.directories.length).toBe(2)
    })

    test('patch a list of directories', async () => {
        const response = await request(app)
            .patch('/api/v1/dir')
            .set('Cookie', `token=${token};`)
            .send({
                changes: [
                    {
                        id: 3,
                        icon: "default",
                        name: "dir",
                        parentId: 1
                    }
                ]
            })
        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        expect(response.body.directories.length).toBe(1)
        expect(response.body.directories[0].name).toBe("dir")
    })

    test('patch a list of directories with mixed directories one have access to and don\'t', async () => {
        const response = await request(app)
            .patch('/api/v1/dir')
            .set('Cookie', `token=${token};`)
            .send({
                changes: [
                    {
                        id: 3,
                        icon: "default",
                        name: "dir",
                        parentId: 1
                    },
                    {
                        id: 100,
                        icon: "default",
                        name: "dir",
                        parentId: 1
                    }
                ]
            })
        expect(response.statusCode).toBe(HTTPStatusCode.UNAUTHORIZED)
    })

    test('delete a list of directories', async () => {
        const response = await request(app)
            .delete('/api/v1/dir')
            .set('Cookie', `token=${token};`)
            .query({ ids: '[3]' })

        expect(response.statusCode).toBe(HTTPStatusCode.OK)
        const dir = await prisma.directory.findMany({
            where: {
                owner_id: user.id
            }
        })
        expect(dir.length).toBe(2)
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
