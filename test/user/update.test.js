import { updateUser } from "../../controllers/user"
import prisma from "../../util/prisma.js";

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
