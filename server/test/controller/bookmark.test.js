import { createBookmark, updateBookmarks, deleteBookmarks, getAllBookmarks, getBookmarkById, getBookmarksByTag } from "../../controllers/bookmark.js";
import prisma from "../../util/prisma.js";
import {redis as cache} from "../../app";

describe('creating a bookmark', () => {
    let user, dirId, anotherDirId;
    const email = "aaaa@aa.com";
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeEach(async () => {
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        const zero = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        dirId = zero.id;

        const another = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default 1',
                ownerId: user.id
            }
        });
        anotherDirId = another.id;
    })

    test('creating a simple bookmark', async () => {
        const request = {
            body: {
                value: {
                    link: 'someLink.com',
                    // ownerId: user.id,
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
                directoryId: dirId,
                type: 'img',
                favorite: true,
                ownerId: user.id,
            }
        }))
    })

    test('creating multiple bookmarks', async () => {
        for (let i = 0; i < 10; i++) {
            const request = {
                body: {
                    value: {
                        link: 'someLink.com',
                        // ownerId: user.id,
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
                directoryId: dirId
            }
        })

        const dir2Content = await prisma.bookmark.findMany({
            where: {
                directoryId: anotherDirId
            }
        })

        expect(dir1Content.length).toEqual(5)
        expect(dir2Content.length).toEqual(5)
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
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
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        const zero = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default 1',
                ownerId: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: anotherDir.id,
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
            message: "SUCCESS",
        }))

        const items = await prisma.bookmark.findMany({
            where: { ownerId: user.id }
        })

        expect(items.length).toEqual(1);
        expect(items[0].id).toEqual(bkmrk2.id);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
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
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        const zero = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default 1',
                ownerId: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })

        tag = await prisma.tag.create({
            data: {
                name: 'cs',
                ownerId: user.id,
            }
        });

        const bookmarkTagEntry = await prisma.bookmark_tag.create({
            data: {
                bookmarkId: bkmrk1.id,
                tagId: tag.id
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
                message: "SUCCESS",
                bookmark: expect.objectContaining({
                    id: bkmrk1.id,
                    ownerId: user.id,
                    link: expect.any(String),
                    favorite: expect.any(Boolean),
                    type: expect.any(String),
                    directoryId: dir.id
                })
            })
        )
    })

    test('get all bookmarks', async () => {
        const request = { user: { id: user.id } }

        await getAllBookmarks(request, response, next);
        expect(next).not.toBeCalled()

        const expected = [
            {
                id: bkmrk1.id,
                ownerId: user.id,
                link: expect.any(String),
                favorite: expect.any(Boolean),
                type: expect.any(String),
                directoryId: dir.id
            }, {
                id: bkmrk2.id,
                ownerId: user.id,
                link: expect.any(String),
                favorite: expect.any(Boolean),
                type: expect.any(String),
                directoryId: anotherDir.id
            }]

        expect(response.json).toBeCalledWith(
            expect.objectContaining({
                message: "SUCCESS",
                bookmarks: expect.arrayContaining(expected)
            }))
    })

    test('get bookmarks under some tag', async () => {
        const request = { body: { value: { tagId: tag.id } } }

        await getBookmarksByTag(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(
            expect.objectContaining({
                message: "SUCCESS",
                bookmarks: expect.arrayContaining([{
                    id: bkmrk1.id,
                    ownerId: user.id,
                    link: expect.any(String),
                    favorite: expect.any(Boolean),
                    type: expect.any(String),
                    directoryId: dir.id

                }])
            }))
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
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
        await cache.connect();
        await cache.flushAll();
        user = await prisma.user.create({
            data: {
                name: "abdo",
                email: email,
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        const zero = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default 1',
                ownerId: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })

        tag = await prisma.tag.create({
            data: {
                name: 'cs',
                ownerId: user.id,
            }
        });

        await prisma.bookmark_tag.create({
            data: {
                bookmarkId: bkmrk1.id,
                tagId: tag.id
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
                        directoryId: anotherDir.id,
                        link: "updated link",
                        favorite: false,
                    }]
                }
            }
        }

        await updateBookmarks(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            bookmarks: expect.arrayContaining([{
                id: bkmrk1.id,
                ownerId: user.id,
                link: "updated link",
                favorite: false,
                type: expect.any(String),
                directoryId: anotherDir.id
            }])
        }));

        const bookmarksUnderTheFirstDir = await prisma.bookmark.findMany({
            where: {
                directoryId: dir.id
            }
        })
        expect(bookmarksUnderTheFirstDir.length).toEqual(0);

        const bookmarksUnderTheSecondDir = await prisma.bookmark.findMany({
            where: {
                directoryId: anotherDir.id
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
                        directoryId: anotherDir.id,
                        link: "updated link",
                        favorite: false,
                    }, {
                        id: bkmrk2.id,
                        directoryId: dir.id,
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
                directoryId: dir.id
            }
        })
        expect(bookmarksUnderTheFirstDir.length).toEqual(1);

        const bookmarksUnderTheSecondDir = await prisma.bookmark.findMany({
            where: {
                directoryId: anotherDir.id
            }
        })
        expect(bookmarksUnderTheSecondDir.length).toEqual(1);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})
