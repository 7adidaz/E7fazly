import { createBookmark, updateBookmarks, deleteBookmarks, getAllBookmarks, getBookmarkById, getBookmarksByTag } from "../../controllers/bookmark.js";
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
                    // owner_id: user.id,
                    directoryId: dirId,
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
                link: 'someLink.com',
                directory_id: dirId,
                type: 'img',
                favorite: true,
                owner_id: user.id,
            }
        }))
    })

    test('creating multiple bookmarks', async () => {
        for (let i = 0; i < 10; i++) {
            const request = {
                body: {
                    value: {
                        link: 'someLink.com',
                        // owner_id: user.id,
                        directoryId: i % 2 === 0 ? dirId : anotherDirId,
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
                    ids: [bkmrk1.id]
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
        const request = { body: { value: { bookmarkId: bkmrk1.id } } }

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
        const request = { user: { id: user.id } }

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

        await prisma.bookmark_tag.create({
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
                    changes: [{
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
                    changes: [{
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
