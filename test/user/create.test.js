import { createUser } from '../../controllers/user.js'
// import request from 'supertest'
import server from '../../app.js'
import prismaclient from '../../util/prismaclient.js'
import { HTTPStatusCode } from '../../util/error.js';

describe('create user', () => {

    let resRoute;
    let resJSON;
    const response = {
        redirect: (route) => {
            resRoute = route;
        },

        json: (route) => {
            resJSON = route;
        }
    };
    function next(err) {
        console.log('next is called with err: ', err);
    }

    const email = 'abdallah_elhdad@gmail.com';
    beforeAll(async () => {
        await prismaclient.user.deleteMany({
            where: {
                email: email
            }
        })
    });

    test('Creating a user with a unique Email', async () => {
        const request = {
            body: {
                name: "abdallah elhdad",
                email: email,
                password: "12345"
            }
        }

        let resRoute;
        const response = {
            redirect: (route) => {
                resRoute = route;
            }
        };
        function next(err) {
            console.log('next is called with err: ', err);
        }

        await createUser(request, response, next);

        const isUserinDB = await prismaclient.user.findFirst({
            where: {
                email: email
            }
        })

        expect(isUserinDB).not.toBeNull();
        expect(isUserinDB).not.toBeUndefined();
        expect(resRoute).toEqual('/login');
    })

    test('creating a user with missing data', async () => {
        const request = {
            body: {
                name: "abdallah elhdad",
                // email: email,
                password: "12345"
            }
        }

        await createUser(request, response, next);

        //TODO: this will fail due to the BeforeAll above. FIX IT.
        const isUserinDB = await prismaclient.user.findFirst({
            where: {
                email: email
            }
        })

        expect(isUserinDB).toBeNull();
        expect(isUserinDB).toBeUndefined();
        expect(resJSON).toHaveProperty('errorObject');
        expect(resJSON.errorObject.data.length).toEqual(1);
        expect(resJSON.httpCode).toEqual(HTTPStatusCode.VALIDATION);
    })

    test('creating a user with a used email', async () => {
        const request = {
            body: {
                name: "abdallah elhdad",
                email: email,
                password: "12345"
            }
        }

        let resRoute;
        let resJSON;
        const response = {
            redirect: (route) => {
                resRoute = route;
            },

            json: (route) => {
                resJSON = route;
            }
        };
        function next(err) {
            console.log('next is called with err: ', err);
        }

        await createUser(request, response, next());

        const isUserinDB = await prismaclient.user.findMany({
            where: {
                email: email
            }
        })

        expect(isUserinDB.length).toEqual(1);
        expect(resJSON).toHaveProperty('errorObject');
        expect(resJSON.httpCode).toEqual(HTTPStatusCode.CONFLICT);
    })

    afterAll(async () => {
        await prismaclient.user.deleteMany({
            where: {
                email: email
            }
        })
    });
})