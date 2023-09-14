import { deleteUser, updateUser } from "../../controllers/user"
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

        await deleteUser(request, response, next);

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


        expect(resJSON).toBeUndefined();
        expect(resRoute).toEqual('/signup');
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
