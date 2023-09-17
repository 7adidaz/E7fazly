import { updateDirectory } from "../../controllers/directory.js";
import prisma from "../../util/prismaclient.js";

describe('directory update', () => {

    let user, firstId, secondId, thirdId, lastdId;
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

        // dir with 3 dir nested inside of them + a bookmark

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
        thirdId = one2.id;

        const one3 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        lastdId = one3.id;

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

    test('move directories inside another', async () => {
        const expected = [
            {
                id: secondId,
                name: 'updated',
                parentId: firstId,
                icon: 'updated',
                // owner_id: expect.any(Number),
            },
            {
                id: thirdId,
                name: 'updated',
                parentId: secondId,
                icon: 'updated'
            },
            {
                id: lastdId,
                name: 'updated',
                parentId: thirdId,
                icon: 'updated'
            }
        ];
        const request = {
            body: {
                value: {
                    changes: expected
                }
            }
        }
        await updateDirectory(request, response, next);

        expect(next).not.toBeCalled();

        const expectedArray = expected.map((i) => ({
            ...i, 
            owner_id: user.id,
        }))

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "UPDATE SUCCESS",
            directories : expect.arrayContaining(expectedArray)
        }))

        for(let i = firstId; i <= lastdId; i ++){
            const dir = await prisma.directory.findMany({
                where: {
                    id: i
                }
            })
            expect(dir.length).toEqual(1);
        }
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})