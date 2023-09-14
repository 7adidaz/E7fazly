import { updateUser } from "../../controllers/user"
import prisma from "../../util/prismaclient.js";

describe('get\'s users', () => {

    let user;
    const email = "aaaa@aa.com";
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
            error = err;
            console.log('next is called with err: ', err);
        }

        await updateUser(request, response, next);

        expect(resJSON).toHaveProperty('user');

        const updatedUser = resJSON.user;

        expect(updatedUser).toHaveProperty('name', 'updated')
        expect(updatedUser).toHaveProperty('password', 'updated')
        expect(updatedUser).toHaveProperty('email', 'updated@updated.com')
    })

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in:
                        [user.id]
                }
            }
        })
    })
})
