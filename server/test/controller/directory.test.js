import { createDirectory, updateDirectoriesByIds, getAllDirectories, deleteDirectoriesByIds, contentByParent } from "../../controllers/directory.js";
import prisma from "../../util/prisma.js";
import { redis as cache } from "../../app.js";

describe('creating directory', () => {
    let user, dir;
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

        dir = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });



        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('creating a simple dir', async () => {
        const request = {
            body: {
                value: {
                    name: "to_delete",
                    parentId: dir.id
                }
            }
        };

        const dirInDB = await prisma.directory.findMany();

        await createDirectory(request, response, next);

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            directory: expect.objectContaining({
                icon: "default",
                id: expect.any(Number),
                name: "to_delete",
                ownerId: expect.any(Number),
                parentId: dir.id
            })
        }));

        const directoryInDB =
            await prisma
                .directory
                .findMany({
                    where: {
                        ownerId: user.id
                    }
                })

        expect(directoryInDB[0]).not.toBeNull();
        expect(directoryInDB[0].parentId).toBeNull();
    })

    test('creating multiple directories under one directory', async () => {
        for (let i = 0; i < 10; i++) {
            const parentId = i === 0 ? dir.id : response.json.mock.calls[0][0].directory.id;
            const request = {
                body: {
                    value: {
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
                    ownerId: user.id,
                    parentId: parentId
                })
            }));
        }

        const directories = await prisma.directory.findMany({
            where: {
                ownerId: user.id
            }
        })

        expect(directories.length).toEqual(11);

        const dirInLevel1 = await prisma.directory.findMany({
            where: {
                parentId: response.json.mock.calls[0][0].directory.id
            }
        })

        expect(dirInLevel1.length).toEqual(9);
        expect(dirInLevel1[0].ownerId).toEqual(user.id);
    })

    test('create 50 nested directories', async () => {

        let startValue = 0;
        for (let i = 0; i < 50; i++) {
            const parentId = i === 0 ? dir.id: response.json.mock.calls[i - 1][0].directory.id;
            let request = {
                body: {
                    value: {
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
                    ownerId: expect.any(Number),
                    parentId: parentId
                })
            }));
        }

        const directoriesInDB = await prisma.directory.findMany({
            where: {
                ownerId: user.id
            }
        })
        expect(directoriesInDB.length).toEqual(51);

        // for (let i = startValue; i < startValue + 50 - 1; i++) {
        //     const dir = await prisma.directory.findMany({
        //         where: {
        //             parentId: i
        //         }
        //     })

        //     expect(dir.length).toEqual(1);
        // }
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})

describe('directory delete', () => {
    let user, firstId, secondId;
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

        const one1 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        firstId = one1.id;
        const one2 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        secondId = one2.id;

        await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: one2.id,
                type: 'link',
                favorite: true
            }
        })
        await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: one1.id,
                type: 'link',
                favorite: true
            }
        })
    })
    test('delete a list of directories', async () => {

        const request = {
            body: {
                value: {
                    ids: [firstId, secondId]
                }
            }
        };

        await deleteDirectoriesByIds(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS"
        }))

        const dir = await prisma.directory.findMany({
            where: {
                ownerId: user.id
            }
        })
        expect(dir.length).toEqual(1); // rootone 

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                ownerId: user.id
            }
        })
        expect(bookmarks.length).toEqual(0);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})

describe('directory getters', () => {
    let user, startId, lastdId;
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

        // dir with 2 dir nested inside of them + a bookmark

        const zero = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });

        user = await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                baseDirectoryId: zero.id
            }
        })

        startId = zero.id;
        const one1 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });

        const one2 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });

        lastdId = one2.id;
        const bookmark1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: zero.id,
                type: 'link',
                favorite: true
            }
        });

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('get the content of a directory', async () => {
        const request = { body: { value: { parentId: startId } } }

        await contentByParent(request, response, next);

        expect(next).not.toBeCalled();
        const value = response.json.mock.calls[0][0];

        expect(value.directories).toEqual(expect.any(Array))
        expect(value.directories.length).toEqual(2)

        expect(value.bookmarks).toEqual(expect.any(Array))
        expect(value.bookmarks.length).toEqual(1)
    })

    test('get all of the directories', async () => {
        const request = {
            user: {
                id: user.id,
                baseDirectoryId: startId
            }
        }

        await getAllDirectories(request, response, next);
        expect(next).not.toBeCalled();

        const value = response.json.mock.calls[0][0];
        expect(value.directories).toEqual(expect.any(Array))
        expect(value.directories.length).toEqual(3)
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})

describe('directory update', () => {
    let user, firstId, secondId, thirdId, lastdId;
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

        // dir with 3 dir nested inside of them + a bookmark

        const zero = await prisma.directory.create({
            data: {
                parentId: null,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        firstId = zero.id;

        const one1 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        secondId = one1.id;

        const one2 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        thirdId = one2.id;

        const one3 = await prisma.directory.create({
            data: {
                parentId: zero.id,
                name: '0',
                icon: 'default',
                ownerId: user.id
            }
        });
        lastdId = one3.id;

        const bookmark1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                ownerId: user.id,
                directoryId: zero.id,
                type: 'link',
                favorite: true
            }
        })
    })

    test('move directories inside another', async () => {
        const expected = [
            {
                id: secondId,
                name: 'updated',
                parentId: firstId,
                icon: 'updated',
                // ownerId: expect.any(Number),
            },
            {
                id: thirdId,
                name: 'updated',
                parentId: secondId,
                icon: 'updated'
            },
            {
                id: lastdId,
                name: 'updated',
                parentId: thirdId,
                icon: 'updated'
            }
        ];
        const request = {
            body: {
                value: {
                    changes: expected
                }
            }
        }
        await updateDirectoriesByIds(request, response, next);

        expect(next).not.toBeCalled();

        const expectedArray = expected.map((i) => ({
            ...i,
            ownerId: user.id,
        }))

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            directories: expect.arrayContaining(expectedArray)
        }))

        for (let i = firstId; i <= lastdId; i++) {
            const dir = await prisma.directory.findMany({
                where: {
                    id: i
                }
            })
            expect(dir.length).toEqual(1);
        }
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [user.id] } } })
        await cache.flushAll();
        await cache.disconnect();
    })
})
