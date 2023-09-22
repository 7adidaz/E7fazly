import prisma from "../../util/prismaclient.js";
import { grantAccess } from "../../controllers/access.js";

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
            message: "GRANTED"
        }))

        const access_rights = await prisma.user_directory_access.findMany({
            where: {
                user_id: priv.id
            }
        })

        expect(access_rights.length).toEqual(1);
        expect(access_rights).toEqual(expect.arrayContaining([{
            user_id: priv.id,
            directory_id: dir.id,
            user_rights: 'edit'
        } ]))
    })

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
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [priv.id, norm.id] } }
        })
    })
})