import { contentByParent, getAllDirectories } from "../../controllers/directory.js";
import prisma from "../../util/prisma.js";

describe('directory getters', () => {

    let user, startId, lastdId;
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

        // dir with 2 dir nested inside of them + a bookmark

        const zero = await prisma.directory.create({
            data: {
                parent_id: null,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });

        startId = zero.id;

        const one1 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });

        const one2 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });

        lastdId = one2.id;
        const bookmark1 = await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: zero.id,
                type: 'link',
                favorite: true
            }
        });

        response.json.mockClear()
        response.redirect.mockClear()
    })

    test('get the content of a directory', async () => {
        const request = { body: { value: { id: startId } } }

        await contentByParent(request, response, next);

        expect(next).not.toBeCalled();
        const value = response.json.mock.calls[0][0];

        expect(value.directories).toEqual(expect.any(Array))
        expect(value.directories.length).toEqual(2)

        expect(value.bookmarks).toEqual(expect.any(Array))
        expect(value.bookmarks.length).toEqual(1)
    })

    test('get all of the directories', async () => {
        const request = { body: { value: { id: user.id} } }

        await getAllDirectories(request, response, next);

        expect(next).not.toBeCalled();
        const value = response.json.mock.calls[0][0];

        expect(value.directories).toEqual(expect.any(Array))
        expect(value.directories.length).toEqual(3)
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})