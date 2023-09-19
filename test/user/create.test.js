import { createUser } from '../../controllers/user.js'
import prismaclient from '../../util/prismaclient.js'

const email = 'abdallah_elhdad@gmail.com';
async function deleteEmail() {
    await prismaclient.user.deleteMany({
        where: {
            email: email
        }
    })
}

describe('create user', () => {
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
        await createUser(request, response, next);

        expect(response.redirect).toBeCalledWith('/login');
        expect(next).not.toBeCalled();

        const isUserinDB = await prismaclient.user.findFirst({
            where: {
                email: email
            }
        })

        expect(isUserinDB).not.toBeNull();
        expect(isUserinDB).not.toBeUndefined();
        expect(isUserinDB.base_directory_id).not.toBeNull();

        const directory = await prismaclient.directory.findFirst({
            where: { id: isUserinDB.base_directory_id }
        })

        expect(directory).not.toBeNull();
        expect(directory.owner_id).toEqual(isUserinDB.id);
    });

    afterAll(async () => {
        deleteEmail()
    });
})