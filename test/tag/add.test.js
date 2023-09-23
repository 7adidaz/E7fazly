import prisma from "../../util/prisma.js";
import { addTagForBookmark } from "../../controllers/tag.js";

/**
 * //TODO: tests for users with access rights. 
 */

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
            message: "ADDED",
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
            message: "ADDED",
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