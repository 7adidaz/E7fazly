import prisma from "../../util/prismaclient.js";
import { updateTagName } from "../../controllers/tag.js";

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

    test('update a tag name', async () => {
        const request = {
            body: {
                value: {
                    tagId: tag.id,
                    name: 'newName' //TODO: add regex when implementing validator
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