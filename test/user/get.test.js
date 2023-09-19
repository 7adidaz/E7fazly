import { getByEmail, getUser } from "../../controllers/user"
import prisma from "../../util/prismaclient.js";

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

    /**
     * the user's object/data should be 
     * extracted from the authorization 
     * middleware, which then can be used. 
     * 
     * here i'm assumming i already authorized the user.
     */

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
