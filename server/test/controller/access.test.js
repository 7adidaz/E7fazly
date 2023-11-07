import prisma from "../../util/prisma.js";
import { revokeAccess, grantAccess} from "../../controllers/access.js";
import { redis as cache } from "../../app.js";

describe('grant access to a user', () => {
    let priv, norm, dir, anotherDir, anotherAnotherDir;
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    test('revoke access rights from a dir without recursive', async () => {
        const request = {
            body: {
                value: {
                    userId: priv.id,
                    directoryId: dir.id,
                    recursive: false
                }
            }
        }

        await revokeAccess(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS"
        }))

        const accessRights = await prisma.user_directory_access.findMany({
            where: {
                userId: priv.id
            }
        })

        expect(accessRights.length).toEqual(1);
    })

    test('revoke access rights from a dir with recursive', async () => {
        const request = {
            body: {
                value: {
                    userId: priv.id,
                    directoryId: dir.id,
                }
            }
        }

        await revokeAccess(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS"
        }))

        const accessRights = await prisma.user_directory_access.findMany({
            where: {
                userId: priv.id
            }
        })

        expect(accessRights.length).toEqual(1);
    })

    beforeEach(async () => {
        await cache.connect();
        await cache.flushAll();
        priv = await prisma.user.create({
            data: {
                name: "priv",
                email: 'priv@user.com',
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        norm = await prisma.user.create({
            data: {
                name: "norm",
                email: 'norm@user.com',
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        dir = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: norm.id
            }
        });

        anotherDir = await prisma.directory.create({
            data: {
                parentId: dir.id,
                name: '0',
                icon: 'default 1',
                ownerId: norm.id
            }
        });

        anotherAnotherDir = await prisma.directory.create({
            data: {
                parentId: anotherDir.id,
                name: '0',
                icon: 'default 1',
                ownerId: norm.id
            }
        });

        await prisma.user_directory_access.create({
            data: {
                userId: priv.id,
                directoryId: dir.id,
                userRights: 'edit'
            }
        })
        await prisma.user_directory_access.create({
            data: {
                userId: priv.id,
                directoryId: anotherDir.id,
                userRights: 'edit'
            }
        })
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [priv.id, norm.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})

describe('grant access to a user', () => {
    let priv, norm, dir, anotherDir, anotherAnotherDir;
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    test('grant access to dir for a user', async () => {
        const request = {
            body: {
                value: {
                    userId: priv.id,
                    directoryId: dir.id,
                    accessRight: 'edit'
                }
            }
        }

        await grantAccess(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS"
        }))

        const access_rights = await prisma.user_directory_access.findMany({
            where: {
                userId: priv.id
            }
        })

        expect(access_rights.length).toEqual(1);
        expect(access_rights).toEqual(expect.arrayContaining([{
            userId: priv.id,
            directoryId: dir.id,
            userRights: 'edit'
        } ]))
    })

    beforeEach(async () => {
        await cache.connect();
        await cache.flushAll();
        priv = await prisma.user.create({
            data: {
                name: "priv",
                email: 'priv@user.com',
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        norm = await prisma.user.create({
            data: {
                name: "norm",
                email: 'norm@user.com',
                password: "12345",
                isVerified: false,
                verificationCode: 0,
                baseDirectoryId: null
            }
        })

        dir = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: norm.id
            }
        });

        anotherDir = await prisma.directory.create({
            data: {
                parentId: dir.id,
                name: '0',
                icon: 'default 1',
                ownerId: norm.id
            }
        });

        anotherAnotherDir = await prisma.directory.create({
            data: {
                parentId: anotherDir.id,
                name: '0',
                icon: 'default 1',
                ownerId: norm.id
            }
        });
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [priv.id, norm.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})