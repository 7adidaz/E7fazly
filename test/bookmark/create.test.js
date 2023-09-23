import { createBookmark } from "../../controllers/bookmark.js";
import prisma from "../../util/prisma.js";

describe('creating a bookmark', () => {

    let user, dirId, anotherDirId;
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

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        dirId = zero.id;

        const another = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default 1',
                owner_id: user.id
            }
        });
        anotherDirId = another.id;
    })

    test('creating a simple bookmark', async () => {
        const request = {
            body: {
                value: {
                    link: 'someLink.com',
                    owner_id: user.id,
                    directory_id: dirId,
                    type: 'img',
                    favorite: true
                }
            }
        }

        await createBookmark(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            bookmark: {
                id: expect.any(Number),
                ...request.body.value
            }
        }))
    })

    test('creating multiple bookmarks', async () => {
        for (let i = 0; i < 10; i++) {
            const request = {
                body: {
                    value: {
                        link: 'someLink.com',
                        owner_id: user.id,
                        directory_id: i % 2 === 0 ? dirId : anotherDirId,
                        type: 'img',
                        favorite: true
                    }
                }
            }

            await createBookmark(request, response, next);
            expect(next).not.toBeCalled();
        }

        const dir1Content = await prisma.bookmark.findMany({
            where: {
                directory_id: dirId
            }
        })

        const dir2Content = await prisma.bookmark.findMany({
            where: {
                directory_id: anotherDirId
            }
        })

        expect(dir1Content.length).toEqual(5)
        expect(dir2Content.length).toEqual(5)
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})