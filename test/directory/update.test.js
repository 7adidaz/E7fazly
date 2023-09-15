import { updateDirectory } from "../../controllers/directory.js";
import prisma from "../../util/prismaclient.js";

describe('directory getters', () => {

    let user, firstId, secondId, lastdId;
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

        // dir with 2 dir nested inside of them + a bookmark

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });

        firstId = zero.id;

        const one1 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        secondId = one1.id;

        const one2 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        lastdId = one2.id;

        const bookmark1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: zero.id,
                type: 'link',
                favorite: true
            }
        })
    })

    test('move one directory inside another', async () => {
        const request = {
            body: {
                value: {
                    id: lastdId,
                    name: 'updated',
                    parentId: secondId,
                    icon: 'updated'
                }
            }
        }

        await updateDirectory(request, response, next);

        expect(next).not.toBeCalled()
        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "UPDATE SUCCESS",
            directory: expect.objectContaining({
                icon: "updated",
                id: expect.any(Number),
                name: "updated",
                owner_id: expect.any(Number),
                parent_id: secondId,
            })
        }));

        for (let i = firstId; i < firstId + 2; i++) {
            const rootDir = await prisma.directory.findMany({
                where: {
                    parent_id: i
                }
            })

            expect(rootDir.length).toEqual(1);
        }
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})