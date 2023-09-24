import { getByEmail, getUser, updateUser, deleteUser } from "../../controllers/user"
import prisma from "../../util/prisma.js";

describe('user getters', () => {
    let user;
    const email = "aaaa@aa.com";

    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeAll(async () => {
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                is_verified: false,
                verification_code: 0,
                base_directory_id: null
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
                    password: user.password,
                    is_verified: false,
                    verification_code: 0,
                    base_directory_id: null,
                })
            }));
        expect(next).not.toBeCalled();
    })

    test('Get by Email', async () => {
        const request = { body: { value: { id: user.id } } };

        await getByEmail(request, response, next);

        expect(response.json)
            .toBeCalledWith(expect.objectContaining({
                user: expect.objectContaining({
                    id: user.id,
                    name: user.name,
                    email: email,
                    password: user.password,
                    is_verified: false,
                    verification_code: 0,
                    base_directory_id: null,
                })
            }));
        expect(next).not.toBeCalled();
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
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
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                is_verified: false,
                verification_code: 0,
                base_directory_id: null
            }
        })
    })

    test('delete user', async () => {
        const request = { body: { value: { id: user.id, } } }

        await deleteUser(request, response, next);

        expect(response.redirect).toBeCalledWith('/signup');

        const userInDB = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        const baseDirectory = await prisma.directory.findFirst({
            where: {
                owner_id: user.id
            }
        })

        expect(userInDB).toBeNull();
        expect(baseDirectory).toBeNull();
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
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
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                is_verified: false,
                verification_code: 0,
                base_directory_id: null
            }
        })
    })

    test('update user basic information', async () => {
        const request = {
            body: {
                value: {
                    id: user.id,
                    name: "updated",
                    email: "updated@updated.com",
                    password: "updated"
                }
            }
        }

        await updateUser(request, response, next);

        expect(response.json)
            .toBeCalledWith(expect.objectContaining({
                user: expect.objectContaining({
                    id: user.id,
                    name: "updated",
                    email: "updated@updated.com",
                    password: "updated",
                    is_verified: false,
                    verification_code: 0,
                    base_directory_id: null,
                })
            }));
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})
