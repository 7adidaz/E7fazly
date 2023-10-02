import {
    addTagToBookmarkAuthorizor,
    removeTagFromBookmarkAuthorizor,
    updateTagNameAuthorizor
} from "../../authorization/tag";

import { AuthorizationError } from "../../util/error";
import prisma from "../../util/prisma";


describe('check bookmark authorization', () => {
    const response = {
        redirect: jest.fn(),
        json: jest.fn()
    };
    const next = jest.fn();

    test('user can access his own bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 1 }
        }

        await addTagToBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with edit rights can access bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 2 }
        }

        await addTagToBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with view rights can access bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 3 }
        }

        await addTagToBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
    })

    test('user with no rights can not access bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 4 }
        }

        await addTagToBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
    })

    // ----- get tags for bookmark -----

    test('user can access his own bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 1 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with edits can access a bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 2 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with view can access a bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 3 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    test('user with no views can access a bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 4 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    // ----- remove tag from bookmark -----
    test('user can access his own bookmark', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 1 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with edit removes a tag', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 2 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with view removes a tag', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 3 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    test('user with not rights remove a tag', async () => {
        const request = {
            body: { value: { bookmarkId: 1 } },
            user: { id: 4 }
        }

        await removeTagFromBookmarkAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
    })

    // ----- update tag name -----
    test('user can update his own tag', async () => {
        const request = {
            body: { value: { tagId: 1 } },
            user: { id: 1 }
        }

        await updateTagNameAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).not.toBeInstanceOf(Error)
    })

    test('user with edit rights updates another user tag', async () => {
        const request = {
            body: { value: { tagId: 1 } },
            user: { id: 2 }
        }

        await updateTagNameAuthorizor(request, response, next);
        expect(next.mock.calls[0][0]).toBeInstanceOf(AuthorizationError)
    })



    beforeEach(async () => {
        await prisma.user.createMany({
            data: [{
                id: 1,
                email: "abdooo@gmail.com",
                password: "123456789",
                name: "abdo",
                is_verified: true,
                verification_code: 123456,
                base_directory_id: null,
            }, {
                id: 2,
                email: "abdooooo@gmail.com",
                password: "123456789",
                name: "abdo",
                is_verified: true,
                verification_code: 123456,
                base_directory_id: null,
            }, {
                id: 3,
                email: "abdoooo@gmail.com",
                password: "123456789",
                name: "abdo",
                is_verified: true,
                verification_code: 123456,
                base_directory_id: null,
            }, {
                id: 4,
                email: "abdoooooo@gmail.com",
                password: "123456789",
                name: "abdo",
                is_verified: true,
                verification_code: 123456,
                base_directory_id: null,
            }]
        })

        //create two base directories
        await prisma.directory.createMany({
            data: [{
                id: 1,
                name: "base1",
                icon: "icon",
                parent_id: null,
                owner_id: 1,
            }, {
                id: 2,
                name: "base2",
                icon: "icon",
                parent_id: null,
                owner_id: 2,
            }]
        })

        // update the base directory id for the two users
        await prisma.user.update({ where: { id: 1 }, data: { base_directory_id: { set: 1 } } })
        await prisma.user.update({ where: { id: 2 }, data: { base_directory_id: { set: 2 } } })

        //create two directories
        await prisma.directory.createMany({
            data: [{
                id: 3,
                name: "dir1",
                icon: "icon",
                parent_id: 1,
                owner_id: 1,
            }, {
                id: 4,
                name: "dir2",
                icon: "icon",
                parent_id: 2,
                owner_id: 1,
            }]
        })

        // create bookmark under directory 4
        await prisma.bookmark.createMany({
            data: [{
                directory_id: 3,
                id: 1,
                link: "link",
                owner_id: 2,
                favorite: false,
                type: "img",
            }]
        })

        // create a tag 
        await prisma.tag.createMany({
            data: [{
                id: 1,
                name: "tag1",
                owner_id: 1,
            }]
        })

        // create a tag bookmark relation
        await prisma.bookmark_tag.createMany({
            data: [{
                bookmark_id: 1,
                tag_id: 1,
            }]
        })


        // give access for user 1 to access directory 4
        await prisma.user_directory_access.createMany({
            data: [{
                user_id: 2,
                directory_id: 3,
                user_rights: 'edit'
            }]
        })

        // give access view for user 3 to access directory 4
        await prisma.user_directory_access.createMany({
            data: [{
                user_id: 3,
                directory_id: 3,
                user_rights: 'view'
            }]
        })

        next.mockClear()
    })

    afterEach(async () => {
        await prisma.user.deleteMany({ where: { id: { in: [1, 2, 3, 4] } } })
    })
})