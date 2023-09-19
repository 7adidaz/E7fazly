import { deleteUser } from "../../controllers/user"
import prisma from "../../util/prismaclient.js";

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
