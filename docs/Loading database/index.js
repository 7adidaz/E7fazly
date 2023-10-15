import { prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new prisma()

async function random_users_data(count) {
    for (let i = 0; i < count; i++) {
        let name = faker.person.fullName()
        let email = faker.internet.email();
        let password = faker.internet.password();

        const user = await prisma.user.create({
            data: {
                email: email,
                password: password,
                name: name
            }
        })
    };

    console.log(`inserted ${count} users`);
}

async function random_users_directory(count) {
    for (let i = 0; i < count; i++) {
        let name = faker.animal.bird();
        let icon = faker.internet.domainName();

        const user_id = 1 + Math.floor(Math.random() * 10000);

        const directory = await prisma.directory.create({
            data: {
                parent_id: null,
                name: name,
                icon: icon,
                owner_id: user_id,
            }
        })

    };

    console.log(`inserted ${count} directories`);
}

async function random_bookmarks(count) {

    // first get a random user
    // then get thier directory, 
    // insert in a random directory of them. 

    let total = 0;
    for (let i = 0; i < count; i++) {
        const user_id = 1 + Math.floor(Math.random() * 10000);
        const userDirectories = await prisma.directory.findMany({
            where: {
                owner_id: user_id
            }
        })
        const subset = Math.floor(Math.random() * userDirectories.length);

        for (let j = 0; j < subset; j++) {
            let link = faker.internet.domainName();

            const type_index = Math.floor(Math.random() * 3);
            const fav = Math.round(Math.random());
            const bookmark_type = ['link', 'img', 'etc'];

            await prisma.bookmark.create({
                data: {
                    link: link,
                    owner_id: user_id,
                    directory_id: userDirectories[j].id,
                    type: bookmark_type[type_index],
                    favorite: fav ? true : false
                }
            });
        }
        total += subset;
    }
    console.log(`inserted ${total} bookmarks`);
}

async function random_tags(count) {
    const bookmarkCount = await prisma.bookmark.count();

    for (let i = 0; i < count; i++) {
        const bookmark_id = Math.floor(Math.random() * bookmarkCount);
        const tagWord = faker.lorem.word({ length: { max: 7, min: 2 } });

        const tag = await prisma.tag.create({
            data: {
                name: tagWord
            }
        });

        await prisma.bookmark_tag.create({
            data: {
                tag_id: tag.id,
                bookmark_id: bookmark_id
            }
        })
    }
    console.log(`inserted ${count} tags`)
}

async function random_access_rights(count) {
    const generateDistinctRandomNumbers = (max) => {
        if (max < 2) {
            throw new Error("Range must allow for distinct numbers");
        }

        let num1 = Math.floor(Math.random() * max);

        let num2;
        do {
            num2 = Math.floor(Math.random() * max);
        } while (num2 === num1);

        return [num1, num2];
    }

    let total = 0;
    for (let i = 0; i < count; i++) {

        const usersCount = await prisma.user.count();
        const [user1, user2] = generateDistinctRandomNumbers(usersCount);

        // fetch a random number of directories from user1 
        const userDirectories = await prisma.directory.findMany({
            where: {
                owner_id: user1
            }
        });

        const subset = Math.floor(Math.random() * userDirectories.length);
        const user_rights = ['edit', 'view'];

        for (let j = 0; j < subset; j++) {
            const right_index = Math.round(Math.random());
            await prisma.user_directory_access.create({
                data: {
                    directory_id: userDirectories[j].id,
                    user_id: user2,
                    user_rights: user_rights[right_index]
                }
            });
            total += subset;
        }
    }
    console.log(`inserted ${total} user access rights`);
}

async function getAllDirectoriesBookmarksAndTags(user_id) {
    const directories = await prisma.bookmark.findMany({
        where: {
            owner_id: user_id
        }
    });

    const bookmarks = await prisma.bookmark.findMany({
        where: {
            owner_id: user_id
        }
    });

    const tags = await prisma.tag.findMany({
        where: {
            owner_id: user_id
        }
    })
}

async function updateTagUserid() {
    const set = new Set();
    const tag = await prisma.tag.findMany({
        include: {
            bookmark_tag: {
                include: {
                    bookmark: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });


    for (let i = 0; i < tag.length; i++) {
        const new_tag = await prisma.tag.update({
            where: { id: tag[i].id },
            data: {
                owner_id: parseInt(tag[i].bookmark_tag[0].bookmark.user.id)
            }
        });
        set.add(tag[i].bookmark_tag[0].bookmark.user.id);
    }
    console.log(`updated ${tag.length} for ${set.size} users`);
}

async function main() {
    // random_users_data();
    // random_users_directory();
    // random_bookmarks();
    // random_tags();
    // random_access_rights();
    // updateTagUserid() // -> this is for the a change in the schema  
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (err) => {
        console.log('err: ', err);
        await prisma.$disconnect()
        process.exit(1)
    })
