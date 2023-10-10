import prisma from "../../util/prisma.js";
import { addTagForBookmark, getTagsForBookmark, getTagsForUser, removeTagFromBookmark, updateTagName } from "../../controllers/tag.js";

describe('add a tag', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2, tag;
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

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default 1',
                owner_id: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })
        tag = await prisma.tag.create({
            data: {
                name: 'cs',
                owner_id: user.id,
            }
        });

        // add the tag to the first dir
        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk2.id,
                tag_id: tag.id
            }
        });

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('add a unique tag to a bookmark', async () => {
        const request = {
            body: {
                value: {
                    name: 'notCS',
                    ownerId: user.id,
                    bookmarkId: bkmrk1.id
                }
            }
        }

        await addTagForBookmark(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            tag: expect.objectContaining({
                id: expect.any(Number),
                name: 'notcs',
                owner_id: user.id
            })
        }))

        const tagCount = await prisma.tag.findMany({
            where: {
                owner_id: user.id
            }
        })
        expect(tagCount.length).toEqual(2);

        const bookmarkTagEntry = await prisma.bookmark_tag.findMany();
        expect(bookmarkTagEntry.length).toEqual(2);
    })

    test('add a tag with already exists name to a bookmark', async () => {
        const request = {
            body: {
                value: {
                    name: 'CS',
                    ownerId: user.id,
                    bookmarkId: bkmrk1.id
                }
            }
        }

        await addTagForBookmark(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "SUCCESS",
            tag: expect.objectContaining({
                id: expect.any(Number),
                name: 'cs',
                owner_id: user.id
            })
        }))

        const tagCount = await prisma.tag.findMany({
            where: {
                owner_id: user.id
            }
        })
        expect(tagCount.length).toEqual(1);

        const bookmarkTagEntry = await prisma.bookmark_tag.findMany();
        expect(bookmarkTagEntry.length).toEqual(2);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})

describe('remove a tag', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2, tag;
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

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default 1',
                owner_id: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })
        tag = await prisma.tag.create({
            data: {
                name: 'cs',
                owner_id: user.id,
            }
        });
        // add the tag to the first dir
        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk1.id,
                tag_id: tag.id
            }
        });

        tag = await prisma.tag.create({
            data: {
                name: 'css',
                owner_id: user.id,
            }
        });

        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk2.id,
                tag_id: tag.id
            }
        });

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('getTagsForBookmark', async () => {
        const request = {
            body: {
                value: {
                    bookmarkId: bkmrk2.id
                }
            }
        }

        await getTagsForBookmark(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith({
            message: "SUCCESS",
            tags: expect.arrayContaining([
                expect.objectContaining({
                    id: tag.id,
                    name: tag.name,
                    owner_id: tag.owner_id
                })
            ])
        })
    })

    test('getTagsForUser', async () => {
        const request = { user: { id: user.id } }

        await getTagsForUser(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith({
            message: "SUCCESS",
            tags: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: 'css',
                    owner_id: user.id
                }),
                expect.objectContaining({
                    id: expect.any(Number),
                    name: 'cs',
                    owner_id: user.id
                })
            ])
        })
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})

describe('remove a tag', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2, tag;
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

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default 1',
                owner_id: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })
        tag = await prisma.tag.create({
            data: {
                name: 'cs',
                owner_id: user.id,
            }
        });

        // add the tag to the first dir
        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk1.id,
                tag_id: tag.id
            }
        });

        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk2.id,
                tag_id: tag.id
            }
        });

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('remove a tag that is already exists for other bookmarks', async () => {
        const request = {
            body: {
                value: {
                    tagId: tag.id,
                    bookmarkId: bkmrk1.id
                }
            }
        }

        await removeTagFromBookmark(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "DELETED"
        }))

        const bookmarkTagEntry = await prisma.bookmark_tag.findMany({
            where: {
                tag_id: tag.id
            }
        })
        expect(bookmarkTagEntry.length).toEqual(1);

        const tagEntry = await prisma.tag.findFirst({
            where: {
                owner_id: user.id
            }
        })
        expect(tagEntry).not.toBeNull();
    })

    test('remove a tag from its last bookmark owner', async () => {
        const request = {
            body: {
                value: {
                    tag_id: tag.id,
                    bookmark_id: bkmrk1.id
                }
            }
        }

        await prisma.bookmark_tag.deleteMany({
            where: {
                AND: [
                    { bookmark_id: bkmrk2.id },
                    {tag_id: tag.id}
                ]
            }
        })

        await removeTagFromBookmark(request, response, next); // last entry
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "DELETED"
        }))

        const tagEntry = await prisma.tag.findFirst({
            where: {
                owner_id: user.id
            }
        });
        expect(tagEntry).toBeNull();
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})

describe('update a tag', () => {
    let user, dir, anotherDir, bkmrk1, bkmrk2, tag;
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

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        dir = zero;

        const another = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default 1',
                owner_id: user.id
            }
        });
        anotherDir = another;

        bkmrk1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: dir.id,
                type: 'link',
                favorite: true
            }
        })
        bkmrk2 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: anotherDir.id,
                type: 'link',
                favorite: true
            }
        })
        tag = await prisma.tag.create({
            data: {
                name: 'xxxxxx_12345',
                owner_id: user.id,
            }
        });

        // add the tag to the first dir
        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk1.id,
                tag_id: tag.id
            }
        });

        await prisma.bookmark_tag.create({
            data: {
                bookmark_id: bkmrk2.id,
                tag_id: tag.id
            }
        });

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('update a tag name', async () => {
        const request = {
            body: {
                value: {
                    tagId: tag.id,
                    newName: 'newName' //TODO: add regex when implementing validator
                }
            }
        }

        await updateTagName(request, response, next);
        expect(next).not.toBeCalled();

        const updatedTag = await  prisma.tag.findFirst({
            where: {
                id: tag.id
            }
        })

        expect(updatedTag.name).toEqual('newName');
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})
