import { createUser } from '../../controllers/user.js'
import server from '../../app.js'
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
        const request = {
            body: {
                value: {
                    name: "abdallah elhdad",
                    email: email,
                    password: "12345"
                }
            }
        }

        let resRoute, resJSON, error;

        const response = {
            redirect: (route) => {
                resRoute = route;
            },
            json: (route) => {
                resJSON = route;
            }
        };

        function next(err) {
            console.log('err: ', err)
            error = err;
        }

        await createUser(request, response, next);

        const isUserinDB = await prismaclient.user.findFirst({
            where: {
                email: email
            }
        })

        expect(isUserinDB).not.toBeNull();
        expect(isUserinDB).not.toBeUndefined();
        expect(isUserinDB.base_directory_id).not.toBeNull();
        expect(resRoute).toEqual('/login');
        expect(error).toBeUndefined();

        const directory = await prismaclient.directory.findFirst({
            where: {
                id: isUserinDB.base_directory_id
            }
        })

        expect(directory).not.toBeNull();
        expect(directory.owner_id).toEqual(isUserinDB.id);

        deleteEmail()
    });

    

    afterAll(async () => {
        deleteEmail()
    });
})