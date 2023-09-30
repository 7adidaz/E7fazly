import prisma from '../../util/prisma.js';
import { doesUserHaveAccessToDirectory } from '../../util/haveTheRights.js';

describe('doesUserHaveAccessToDirectory', () => {
    let user1, user2, base, dir1, dir2, dir3, dir1User2, dir2User2;

    it('should return true if the user has access to the directory', async () => {
        /**
         *  -/base (user1 is the owner)
         *      -/dir1 
         *          -/dir2
         *              -/dir3
         * 
         *  user2 has access to dir1
         * 
         *  -/dir1user2 (user2 is the owner)
         *      -/dir2user2
         */

        expect(await doesUserHaveAccessToDirectory(user2.id, dir3.id)).toEqual(true);
        expect(await doesUserHaveAccessToDirectory(user2.id, dir2.id)).toEqual(true);
        expect(await doesUserHaveAccessToDirectory(user2.id, dir1.id)).toEqual(true);

        expect(await doesUserHaveAccessToDirectory(user1.id, dir3.id)).toEqual(true);
    });

    it('should return false if the user does not have access to the directory', async () => {
        expect(await doesUserHaveAccessToDirectory(user2.id, base.id)).toEqual(false);
        expect(await doesUserHaveAccessToDirectory(user2.id, base.parent_id)).toEqual(false); // access to null. 

        // does not have access to dir1User2
        expect(await doesUserHaveAccessToDirectory(user1.id, dir1User2.id)).toEqual(false);
        expect(await doesUserHaveAccessToDirectory(user1.id, dir2User2.id)).toEqual(false);
    })

    beforeAll(async () => {
        user1 = await prisma.user.create({
            data:
            {
                password: "password1",
                email: "email1",
                name: "name1",
                is_verified: true,
                verification_code: 111,
                base_directory_id: null,
            }
        });
        user2 = await prisma.user.create({
            data: {
                password: "password2",
                email: "email2",
                name: "name2",
                is_verified: true,
                verification_code: 111,
                base_directory_id: null,
            }
        });

        base = await prisma.directory.create({
            data:
            {
                parent_id: null,
                name: "dir1",
                icon: "default",
                owner_id: user1.id
            },
        })

        dir1 = await prisma.directory.create({
            data:
            {
                parent_id: base.id,
                name: "dir1",
                icon: "default",
                owner_id: user1.id
            },
        })
        dir2 = await prisma.directory.create({
            data:
            {
                parent_id: dir1.id,
                name: "dir1",
                icon: "default",
                owner_id: user1.id
            },
        })
        dir3 = await prisma.directory.create({
            data:
            {
                parent_id: dir2.id,
                name: "dir1",
                icon: "default",
                owner_id: user1.id
            },
        })

        await prisma.user_directory_access.create({
            data: {
                directory_id: dir1.id,
                user_id: user2.id,
                user_rights: 'edit'
            }
        });


        //----------------------//
        dir1User2 = await prisma.directory.create({
            data: {
                parent_id: null,
                name: "dir1",
                icon: "default",
                owner_id: user2.id
            }
        });

        dir2User2 = await prisma.directory.create({
            data: {
                parent_id: dir1User2.id,
                name: "dir2",
                icon: "default",
                owner_id: user2.id
            }
        });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: [user1.id, user2.id]
                }
            }
        });
    })
});
