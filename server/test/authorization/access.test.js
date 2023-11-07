import { getAccessAuthorizor, grantAccessAuthorizor, revokeAccessAuthorizor} from "../../authorization/access";
import { AuthorizationError } from "../../util/error";
import prisma from "../../util/prisma";
import { redis as cache } from "../../app";


describe('check bookmark authorization', () => {
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn();

    test('grant access by the owner', async () => {
        const request = {
            user: { id: 1 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                    userRights: 'edit'
                }
            }
        }

        await grantAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('grant access by the user with edit rights', async () => {
        const request = {
            user: { id: 2 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                    userRights: 'edit'
                }
            }
        }

        await grantAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('grant access by the user with view rights', async () => {
        const request = {
            user: { id: 3 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                    userRights: 'edit'
                }
            }
        }

        await grantAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
    })

    test('grant access by the user with no rights', async () => {
        const request = {
            user: { id: 4 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                    userRights: 'edit'
                }
            }
        }

        await grantAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
    })

    //---- revoke access ----

    test('revoke access by the owner', async () => {
        const request = {
            user: { id: 1 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                }
            }
        }

        await revokeAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('revoke access by the user with edit rights', async () => {
        const request = {
            user: { id: 2 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                }
            }
        }

        await revokeAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('revoke access by the user with view rights', async () => {
        const request = {
            user: { id: 3 },
            body: {
                value: {
                    directoryId: 3,
                    userId: 4,
                }
            }
        }

        await revokeAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
    })


    // ---- get access ----
    test('get access by the owner', async () => {
        const request = {
            user: { id: 1 },
            params: {
                directoryId: 3,
            }
        }

        await getAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('get access by the user with view rights', async () => {
        const request = {
            user: { id: 3 },
            params: {
                directoryId: 3,
            }
        }

        await getAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('get access by the user with not rights', async () => {
        const request = {
            user: { id: 4 },
            params: {
                directoryId: 3,
            }
        }

        await getAccessAuthorizor(request, response, next)
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
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
