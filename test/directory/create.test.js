import { createDirectory } from "../../controllers/directory.js";
import prisma from "../../util/prismaclient.js";

describe('creating directory', () => {

    let user;
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

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('creating a simple dir', async () => {
        const request = {
            body: {
                value: {
                    ownerId: user.id,
                    name: "to_delete",
                    parentId: null
                }
            }
        };

        await createDirectory(request, response, next);

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            directory: expect.objectContaining({
                icon: "default",
                id: expect.any(Number),
                name: "to_delete",
                owner_id: expect.any(Number),
                parent_id: null
            })
        }));

        const directoryInDB =
            await prisma
                .directory
                .findMany({
                    where: {
                        owner_id: user.id
                    }
                })

        expect(directoryInDB.length).toEqual(1);
        expect(directoryInDB[0]).not.toBeNull();
        expect(directoryInDB[0].parent_id).toBeNull();
    })

    test('creating multiple directories under one directory', async () => {
        for (let i = 0; i < 10; i++) {
            const parentId = i === 0 ? null : response.json.mock.calls[0][0].directory.id;
            const request = {
                body: {
                    value: {
                        ownerId: user.id,
                        name: "to_delete",
                        parentId: parentId
                    }
                }
            }

            await createDirectory(request, response, next);

            expect(response.json).toBeCalledWith(expect.objectContaining({
                message: "SUCCESS",
                directory: expect.objectContaining({
                    icon: "default",
                    id: expect.any(Number),
                    name: expect.any(String),
                    owner_id: expect.any(Number),
                    parent_id: parentId
                })
            }));
        }

        const directories = await prisma.directory.findMany({
            where: {
                owner_id: user.id
            }
        })

        expect(directories.length).toEqual(10);

        const dirInLevel1 = await prisma.directory.findMany({
            where: {
                parent_id: response.json.mock.calls[0][0].directory.id
            }
        })

        expect(dirInLevel1.length).toEqual(9);
        expect(dirInLevel1[0].owner_id).toEqual(user.id);
    })

    test('create 50 nested directories', async () => {

        let startValue = 0;
        for (let i = 0; i < 50; i++) {
            const parentId = i === 0 ? null : response.json.mock.calls[i - 1][0].directory.id;
            let request = {
                body: {
                    value: {
                        ownerId: user.id,
                        name: "to_delete",
                        parentId: parentId
                    }
                }
            }

            await createDirectory(request, response, next);

            startValue = i === 0 ? response.json.mock.calls[0][0].directory.id : startValue;

            expect(response.json).toBeCalledWith(expect.objectContaining({
                message: "SUCCESS",
                directory: expect.objectContaining({
                    icon: "default",
                    id: expect.any(Number),
                    name: expect.any(String),
                    owner_id: expect.any(Number),
                    parent_id: parentId
                })
            }));
        }

        const directoriesInDB = await prisma.directory.findMany({
            where: {
                owner_id: user.id
            }
        })
        expect(directoriesInDB.length).toEqual(50);

        for (let i = startValue; i < startValue + 50 - 1; i++) {
            const dir = await prisma.directory.findMany({
                where: {
                    parent_id: i
                }
            })

            expect(dir.length).toEqual(1);
        }
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})
