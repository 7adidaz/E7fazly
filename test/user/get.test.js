import { getByEmail, getUser } from "../../controllers/user"
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
        /**
         * the user's object/data should be 
         * extracted from the authorization 
         * middleware, which then can be used. 
         * 
         * here i'm assumming i already authorized the user.
         */

        const request = {
            body: {
                value: {
                    id: user.id //TODO: look how to pass arg here. 
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


        await getUser(request, response, next);

        expect(resJSON).toHaveProperty('user')
        expect(resJSON.user).toHaveProperty('name', 'abdo')
        expect(error).toBeUndefined();
    })

    test('Get by Email', async () => {
        const request = {
            body: {
                value: {
                    id: user.id //TODO: look how to pass arg here. 
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

        await getByEmail(request, response, next);

        expect(resJSON).toHaveProperty('user')
        expect(resJSON.user).toHaveProperty('name', 'abdo')
        expect(error).toBeUndefined();
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
