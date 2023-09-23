import prisma from "../../util/prisma.js";
import { login } from "../../controllers/auth.js";

describe('add a tag', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2, tag;
    const email = "aaaa@aa.com";
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeEach(async () => {
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

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('correct token', async () => {
        const request = {
            body: {
                value: {
                    email: email,
                    password: "12345"
                }
            }
        }

        await login(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            token: expect.any(String)
        }))
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})