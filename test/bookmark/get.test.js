import { getAllBookmarks, getBookmarkById, getBookmarksByTag } from "../../controllers/bookmark.js";
import prisma from "../../util/prisma.js";

describe('bookmark getters', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2, tag;
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

        tag = await prisma.tag.create({
            data: {
                name: 'cs',
                owner_id: user.id,
            }
        });

        const bookmarkTagEntry = await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk1.id,
                tag_id: tag.id
            }
        })

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('get a bookmark by ID', async () => {
        const request = { body: { value: { id: bkmrk1.id } } }

        await getBookmarkById(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(
            expect.objectContaining({
                id: bkmrk1.id,
                owner_id: user.id,
                link: expect.any(String),
                favorite: expect.any(Boolean),
                type: expect.any(String),
                directory_id: dir.id
            }));
    })

    test('get all bookmarks', async () => {
        const request = { body: { value: { id: user.id } } }

        await getAllBookmarks(request, response, next);
        expect(next).not.toBeCalled()

        const expected = [
            {
                id: bkmrk1.id,
                owner_id: user.id,
                link: expect.any(String),
                favorite: expect.any(Boolean),
                type: expect.any(String),
                directory_id: dir.id
            }, {
                id: bkmrk2.id,
                owner_id: user.id,
                link: expect.any(String),
                favorite: expect.any(Boolean),
                type: expect.any(String),
                directory_id: anotherDir.id
            }]

        expect(response.json).toBeCalledWith(
            expect.arrayContaining(expected));
    })

    test('get bookmarks under some tag', async () => {
        const request = { body: { value: { tagId: tag.id } } }

        await getBookmarksByTag(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(expect.arrayContaining([{
            id: bkmrk1.id,
            owner_id: user.id,
            link: expect.any(String),
            favorite: expect.any(Boolean),
            type: expect.any(String),
            directory_id: dir.id
        }]));
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
}) 