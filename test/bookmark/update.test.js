import { updateBookmarks } from "../../controllers/bookmark.js";
import prisma from "../../util/prismaclient.js";

describe('update bookmark', () => {
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

    test('update a bookmark', async () => {
        const request = {
            body: {
                value: {
                    list: [{
                        id: bkmrk1.id,
                        directory_id: anotherDir.id,
                        link: "updated link",
                        favorite: false,
                    }]
                }
            }
        }

        await updateBookmarks(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "UPDATED",
            bookmarks: expect.arrayContaining([{
                id: bkmrk1.id,
                owner_id: user.id,
                link: "updated link",
                favorite: false,
                type: expect.any(String),
                directory_id: anotherDir.id
            }])
        }));

        const bookmarksUnderTheFirstDir = await prisma.bookmark.findMany({
            where: {
                directory_id: dir.id
            }
        })
        expect(bookmarksUnderTheFirstDir.length).toEqual(0);

        const bookmarksUnderTheSecondDir = await prisma.bookmark.findMany({
            where: {
                directory_id: anotherDir.id
            }
        })
        expect(bookmarksUnderTheSecondDir.length).toEqual(2);
    })

    test('update multiple bookmarks', async () => {
        const request = {
            body: {
                value: {
                    list: [{
                        id: bkmrk1.id,
                        directory_id: anotherDir.id,
                        link: "updated link",
                        favorite: false,
                    }, {
                        id: bkmrk2.id,
                        directory_id: dir.id,
                        link: "updated link",
                        favorite: false,
                    }]
                }
            }
        }

        await updateBookmarks(request, response, next);
        expect(next).not.toBeCalled();

        const bookmarksUnderTheFirstDir = await prisma.bookmark.findMany({
            where: {
                directory_id: dir.id
            }
        })
        expect(bookmarksUnderTheFirstDir.length).toEqual(1);

        const bookmarksUnderTheSecondDir = await prisma.bookmark.findMany({
            where: {
                directory_id: anotherDir.id
            }
        })
        expect(bookmarksUnderTheSecondDir.length).toEqual(1);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})