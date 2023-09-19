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
    })

    //TODO: Complete this. 

})