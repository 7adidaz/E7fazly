import {
    createBookmarkAuthorization,
    deleteBookmarksAuthorization,
    getBookmarkByIdAuthorization,
    getBookmarksByTagAuthorization,
    updateBookmarksAuthorization
} from "../../authorization/bookmark";

import { AuthorizationError } from "../../util/error";
import prisma from "../../util/prisma";
import { redis as cache } from "../../app";


describe('check bookmark authorization', () => {
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn();

    test('create bookmark for the owner user', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { directoryId: 3 } }
        }

        await createBookmarkAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('create bookmark for user with authorization', async () => {
        const request = {
            user: { id: 2 },
            body: { value: { directoryId: 3 } }
        }

        await createBookmarkAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('create bookmark for user with view access', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { directoryId: 3 } }
        }

        await createBookmarkAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })

    test('create bookmark for user without authorization at all', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { directoryId: 3 } }
        }

        await createBookmarkAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })

    //----- get bookmark by id authorization
    test('get bookmark by id for the owner', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { bookmarkId: 1 } }
        }

        await getBookmarkByIdAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('get bookmark by id for user with authorization', async () => {
        const request = {
            user: { id: 2 },
            body: { value: { bookmarkId: 1 } }
        }

        await getBookmarkByIdAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('get bookmark by id for user with view access', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { bookmarkId: 1 } }
        }

        await getBookmarkByIdAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('get bookmark by id for user without authorization at all', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { bookmarkId: 1 } }
        }

        await getBookmarkByIdAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })


    //----- get bookmarks by tag authorization
    test('get bookmarks by tag for the owner', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { tagId: 1 } }
        }

        await getBookmarksByTagAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('get bookmarks by tag for user with edit access', async () => {
        const request = {
            user: { id: 2 },
            body: { value: { tagId: 1 } }
        }

        await getBookmarksByTagAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })

    test('get bookmarks by tag for user with view access', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { tagId: 1 } }
        }

        await getBookmarksByTagAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })

    test('get bookmarks by tag for user without authorization at all', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { tagId: 1 } }
        }

        await getBookmarksByTagAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })


    // ----- update bookmarks authorization
    test('update bookmarks for the owner', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { changes: [{ id: 1, directoryId: 3 }] } }
        }

        await updateBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('update bookmarks for the owner to another folder he cant access', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { changes: [{ id: 1, directoryId: 2 }] } }
        }

        await updateBookmarksAuthorization(request, response, next);
        // expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })


    test('update bookmarks for user with authorization to his folder', async () => {
        const request = {
            user: { id: 2 },
            body: { value: { changes: [{ id: 1, directoryId: 2 }] } }
        }

        await updateBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('update bookmarks for user with authorization to a folder he doesn\'t have access to ', async () => {
        const request = {
            user: { id: 2 },
            body: { value: { changes: [{ id: 1, directoryId: 4 }] } }
        }

        await updateBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })


    test('update bookmarks for user with view access', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { changes: [{ id: 1, directoryId: 3 }] } }
        }

        await updateBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })

    test('update bookmarks for user without authorization at all', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { changes: [{ id: 1, directoryId: 3 }] } }
        }

        await updateBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })


    //----- delete bookmarks authorization
    test('delete bookmarks for the owner', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { ids: [1] } }
        }

        await deleteBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('delete bookmarks for user with authorization', async () => {
        const request = {
            user: { id: 2 },
            body: { value: { ids: [1] } }
        }

        await deleteBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error);
    })

    test('delete bookmarks for user with view access', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { ids: [1] } }
        }

        await deleteBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })

    test('delete bookmarks for user without authorization at all', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { ids: [1] } }
        }

        await deleteBookmarksAuthorization(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    })


    beforeEach(async () => {
        await cache.connect();
        await cache.flushAll();
        await prisma.user.createMany({
            data: [{
                id: 1,
                email: "abdooo@gmail.com",
                password: "123456789",
                name: "abdo",
                isVerified: true,
                verificationCode: 123456,
                baseDirectoryId: null,
            }, {
                id: 2,
                email: "abdooooo@gmail.com",
                password: "123456789",
                name: "abdo",
                isVerified: true,
                verificationCode: 123456,
                baseDirectoryId: null,
            }, {
                id: 3,
                email: "abdoooo@gmail.com",
                password: "123456789",
                name: "abdo",
                isVerified: true,
                verificationCode: 123456,
                baseDirectoryId: null,
            }, {
                id: 4,
                email: "abdoooooo@gmail.com",
                password: "123456789",
                name: "abdo",
                isVerified: true,
                verificationCode: 123456,
                baseDirectoryId: null,
            }]
        })

        //create two base directories
        await prisma.directory.createMany({
            data: [{
                id: 1,
                name: "base1",
                icon: "icon",
                parentId: null,
                ownerId: 1,
            }, {
                id: 2,
                name: "base2",
                icon: "icon",
                parentId: null,
                ownerId: 2,
            }]
        })

        // update the base directory id for the two users
        await prisma.user.update({ where: { id: 1 }, data: { baseDirectoryId: { set: 1 } } })
        await prisma.user.update({ where: { id: 2 }, data: { baseDirectoryId: { set: 2 } } })

        //create two directories
        await prisma.directory.createMany({
            data: [{
                id: 3,
                name: "dir1",
                icon: "icon",
                parentId: 1,
                ownerId: 1,
            }, {
                id: 4,
                name: "dir2",
                icon: "icon",
                parentId: 2,
                ownerId: 1,
            }]
        })

        // create bookmark under directory 4
        await prisma.bookmark.createMany({
            data: [{
                directoryId: 3,
                id: 1,
                link: "link",
                ownerId: 2,
                favorite: false,
                type: "img",
            }]
        })

        // create a tag 
        await prisma.tag.createMany({
            data: [{
                id: 1,
                name: "tag1",
                ownerId: 1,
            }]
        })

        // create a tag bookmark relation
        await prisma.bookmark_tag.createMany({
            data: [{
                bookmarkId: 1,
                tagId: 1,
            }]
        })


        // give access for user 1 to access directory 4
        await prisma.user_directory_access.createMany({
            data: [{
                userId: 2,
                directoryId: 3,
                userRights: 'edit'
            }]
        })

        // give access view for user 3 to access directory 4
        await prisma.user_directory_access.createMany({
            data: [{
                userId: 3,
                directoryId: 3,
                userRights: 'view'
            }]
        })

        next.mockClear()
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [1, 2, 3, 4] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})
