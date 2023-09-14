import { getUser } from "../../controllers/user"
import prisma from "../../util/prismaclient.js";

describe('get me', () => {

    let user;
    beforeAll(async () => {
        user = await prisma.user.create({
            data: { //TODO: update this after update.
                name: "abdo",
                email: "admin@admin.com",
                password: "12345",
            }
        })
    })

    test('Get an email', async () => {

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

    afterAll(async () => {
        await prisma.user.delete({
            where: {
                id: user.id
            }
        })
    })
})
