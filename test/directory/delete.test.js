import { deleteDirectoriesByIds} from "../../controllers/directory.js";
import prisma from "../../util/prisma.js";

describe('directory delete', () => {

    let user, firstId , secondId;
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

        const one1 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        firstId = one1.id;
        const one2 = await prisma.directory.create({
            data: {
                parent_id: zero.id,
                name: '0',
                icon: 'default',
                owner_id: user.id
            }
        });
        secondId = one2.id;

        await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: one2.id,
                type: 'link',
                favorite: true
            }
        })
        await prisma.bookmark.create({
            data: {
                link: 'link',
                owner_id: user.id,
                directory_id: one1.id,
                type: 'link',
                favorite: true
            }
        })
    })
    test('delete a list of directories',async  () => {

        const request =  {
            body: {
                value: {
                    ids: [firstId, secondId]
                }
            }
        };

        await deleteDirectoriesByIds(request, response, next);
        expect(next).not.toBeCalled();

        expect(response.json).toBeCalledWith(expect.objectContaining({
            message: "DELETED"
        }))

        const dir = await prisma.directory.findMany({
            where: {
                owner_id: user.id
            }
        })
        expect(dir.length).toEqual(1); // rootone 
        
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                owner_id: user.id
            }
        })
        expect(bookmarks.length).toEqual(0);
    })

    afterEach(async () => {
        await prisma.user.deleteMany({
            where: { id: { in: [user.id] } }
        })
    })
})