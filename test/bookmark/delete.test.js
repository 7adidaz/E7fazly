import { deleteBookmarks } from "../../controllers/bookmark.js";
import prisma from "../../util/prisma.js";

describe('delete bookmark', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2;
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
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default 1',
                owner_id: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })
        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('delete bookmarks', async () => {
        const request = {
            body: {
                value: {
                    list: [bkmrk1.id]
                }
            }
        }

        await deleteBookmarks(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "DELETED"
        }))

        const items = await prisma.bookmark.findMany({
            where: { owner_id: user.id }
        })

        expect(items.length).toEqual(1);
        expect(items[0].id).toEqual(bkmrk2.id);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})