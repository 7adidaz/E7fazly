import { signup, login } from '../../controllers/auth.js'
import prisma from '../../util/prisma.js'

const email = 'abdallah_elhdad@gmail.com';
async function deleteEmail() {
    await prisma.user.deleteMany({
        where: {
            email: email
        }
    })
}

describe('signup', () => {
    beforeAll(async () => {
        deleteEmail()
    });

    test('Creating a user with a unique Email', async () => {
        const request = { body: { value: { name: "abdallah elhdad", email: email, password: "12345" } } }

        const response = {
            redirect: jest.fn(),
            json: jest.fn()
        };

        const next = jest.fn();
        await signup(request, response, next);

        expect(response.redirect).toBeCalledWith('/login');
        expect(next).not.toBeCalled();

        const isUserinDB = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        expect(isUserinDB).not.toBeNull();
        expect(isUserinDB).not.toBeUndefined();
        expect(isUserinDB.base_directory_id).not.toBeNull();

        const directory = await prisma.directory.findFirst({
            where: { id: isUserinDB.base_directory_id }
        })

        expect(directory).not.toBeNull();
        expect(directory.owner_id).toEqual(isUserinDB.id);
    });

    afterAll(async () => {
        deleteEmail()
    });
})

describe('login', () => {
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
