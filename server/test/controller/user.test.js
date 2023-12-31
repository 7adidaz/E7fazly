import { getByEmail, getUser, updateUser, deleteUser } from "../../controllers/user"
import prisma from "../../util/prisma.js";
import { redis as cache } from "../../app.js";

describe('user getters', () => {
    let user;
    const email = "aaaa@aa.com";

    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeAll(async () => {
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })
    })

    test('Get by id', async () => {
        const request = { body: { value: { id: user.id } } }

        await getUser(request, response, next);

        expect(response.json)
            .toBeCalledWith(expect.objectContaining({
                user: expect.objectContaining({
                    id: user.id,
                    name: user.name,
                    email: email,
                    baseDirectoryId: null,
                })
            }));
        expect(next).not.toBeCalled();
    })

    test('Get by Email', async () => {
        const request = { body: { value: { email: email} } };

        await getByEmail(request, response, next);

        expect(response.json)
            .toBeCalledWith(expect.objectContaining({
                user: expect.objectContaining({
                    id: user.id,
                    name: user.name,
                    email: email,
                    baseDirectoryId: null,
                })
            }));
        expect(next).not.toBeCalled();
    })

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})

describe('delete user', () => {
    let user;
    const email = "aaaa@aa.com";
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeAll(async () => {
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: true,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })
    })

    test('delete user', async () => {
        const request = { user: { id: user.id } }

        await deleteUser(request, response, next);

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS"
        }));

        const userInDB = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        const baseDirectory = await prisma.directory.findFirst({
            where: {
                ownerId: user.id
            }
        })

        expect(userInDB).toBeNull();
        expect(baseDirectory).toBeNull();
    })

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})


describe('update user', () => {
    let user;
    const email = "aaaa@aa.com";
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeAll(async () => {
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })
    })

    test('update user basic information', async () => {
        const request = {
            body: {
                value: {
                    name: "updated",
                    email: "updated@updated.com",
                    password: "updated"
                }
            },
            user: { id: user.id }
        }

        await updateUser(request, response, next);

        expect(response.json)
            .toBeCalledWith(expect.objectContaining({
                user: expect.objectContaining({
                    id: user.id,
                    name: "updated",
                    email: "updated@updated.com",
                    password: "updated",
                    isVerified: false,
                    verificationCode: 0,
                    baseDirectoryId: null,
                })
            }));
    })

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})
