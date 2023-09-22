import prisma from "../../util/prismaclient.js";
import { revokeAccess } from "../../controllers/access.js";

describe('grant access to a user', () => {
    let priv, norm, dir, anotherDir, anotherAnotherDir;
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn()

    beforeEach(async () => {
        priv = await prisma.user.create({
            data: {
                name: "priv",
                email: 'priv@user.com',
                password: "12345",
                is_verified: false,
                verification_code: 0,
                base_directory_id: null
            }
        })

        norm = await prisma.user.create({
            data: {
                name: "norm",
                email: 'norm@user.com',
                password: "12345",
                is_verified: false,
                verification_code: 0,
                base_directory_id: null
            }
        })

        dir = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: norm.id
            }
        });

        anotherDir = await prisma.directory.create({
            data: {
                parent_id: dir.id,
                name: '0',
                icon: 'default 1',
                owner_id: norm.id
            }
        });

        anotherAnotherDir = await prisma.directory.create({
            data: {
                parent_id: anotherDir.id,
                name: '0',
                icon: 'default 1',
                owner_id: norm.id
            }
        });

        await prisma.user_directory_access.create({
            data: {
                user_id: priv.id,
                directory_id: dir.id,
                user_rights: 'edit'
            }
        })
        await prisma.user_directory_access.create({
            data: {
                user_id: priv.id,
                directory_id: anotherDir.id,
                user_rights: 'edit'
            }
        })
    })

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
            message: "REVOKED"
        }))

        const accessRights = await prisma.user_directory_access.findMany({
            where: {
                user_id: priv.id
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
                    recursive: true
                }
            }
        }

        await revokeAccess(request, response, next);
        expect(next).not.toBeCalled()

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "REVOKED"
        }))

        const accessRights = await prisma.user_directory_access.findMany({
            where: {
                user_id: priv.id
            }
        })

        expect(accessRights.length).toEqual(0);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [priv.id, norm.id] } }
        })
    })
})
