import { getUser } from "../../controllers/user"

describe('get me', () => {


    test('Creating a user with a unique Email', async () => {

        /**
         * the user's object/data should be 
         * extracted from a authorization 
         * middleware, which then can be used. 
         * 
         * here i'm assumming i already authorized the user.
         */

        const email = "admin@admin.com";
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


        await getUser(request, response, next);

        //TODO: complete this test
    })
})