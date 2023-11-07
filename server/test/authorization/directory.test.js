import {
    createDirectoryAuthorizer,
    deleteDirectoriesByIdsAuthorizer,
    getParentContentAuthorizer,
    updateDirectoriesByIdsAuthorizer
} from "../../authorization/directory.js"

import { AuthorizationError } from "../../util/error.js";
import { redis as cache } from "../../app";
import prisma from "../../util/prisma.js"

describe('check directory authorization', () => {
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn();

    test('create directory for user with authorization', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { parentId: 4, } }
        }

        await createDirectoryAuthorizer(request, request, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('create directory for user without authorization at all', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { parentId: 4, } }
        }

        await createDirectoryAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    test('create directory with user with view access', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { parentId: 4, } }
        }
        await createDirectoryAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    //--- get parent content authorization
    test('get parent content for user with authorization', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { parentId: 4, } }
        }

        await getParentContentAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('get parent content for user with view rights', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { parentId: 4, } }
        }

        await getParentContentAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('get parent content for user without any authorization at all', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { parentId: 4, } }
        }

        await getParentContentAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    //----- update 
    test('update directory for user with authorization', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { changes: [{ id: 4 }] } }
        }

        await updateDirectoriesByIdsAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('update directory for user with view rights', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { changes: [{ id: 4 }] } }
        }

        await updateDirectoriesByIdsAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    test('update directory for user without any authorization at all', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { changes: [{ id: 4 }] } }
        }

        await updateDirectoriesByIdsAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    //----- delete
    test('delete directory for user with authorization', async () => {
        const request = {
            user: { id: 1 },
            body: { value: { ids: [4] } }
        }

        await deleteDirectoriesByIdsAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('delete directory for user with view rights', async () => {
        const request = {
            user: { id: 4 },
            body: { value: { ids: [4] } }
        }

        await deleteDirectoriesByIdsAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    test('delete directory for user with no rights', async () => {
        const request = {
            user: { id: 3 },
            body: { value: { ids: [4] } }
        }

        await deleteDirectoriesByIdsAuthorizer(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
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
                ownerId: 2,
            }]
        })

        // create bookmark under directory 4
        await prisma.bookmark.createMany({
            data: [{
                id: 1,
                link: "link",
                directoryId: 4,
                ownerId: 2,
                favorite: false,
                type: "img",
            }]
        })


        // give access for user 1 to access directory 4
        await prisma.user_directory_access.createMany({
            data: [{
                directoryId: 4,
                userId: 1,
                userRights: 'edit'
            }]
        })

        // give access view for user 3 to access directory 4
        await prisma.user_directory_access.createMany({
            data: [{
                directoryId: 4,
                userId: 4,
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
