import prisma from "../util/prisma.js";
import { APIError } from "../util/error.js";
import getMetaData from "metadata-scraper";

export async function createBookmark(req, reply, next) {
    try {
        const value = req.body.value;

        const link = value.link;
        const directoryId = value.directoryId;
        const type = value.type;
        const favorite = value.favorite;
        const title = value.title;
        const description = value.description;
        const tags = value.tags;

        const directory = await prisma.directory.findFirst({ where: { id: directoryId, } });
        if (!directory) throw new APIError();

        const ownerId = directory.ownerId;

        // transaction
        const bookmarkTransaction =
            await prisma.$transaction(async (tx) => {

                console.log('Starting transaction...');
                const bookmark = await tx.bookmark.create({
                    data: {
                        link: link,
                        ownerId: ownerId,
                        directoryId: directoryId,
                        type: type,
                        favorite: favorite,
                        title: title,
                        description: description,
                        creationDate: new Date(),
                    }
                })
                if (!bookmark) throw new APIError();
                console.log('Bookmark created successfully.');

                for (let i = 0; i < tags.length; i++) {
                    const tagName = tags[i].toLowerCase();
                    let tagInstance = await tx.tag.findFirst({
                        where: {
                            AND: [
                                { name: tagName },
                                { ownerId: ownerId }
                            ]
                        }
                    });

                    if (!tagInstance) {
                        tagInstance = await tx.tag.create({
                            data: {
                                name: tagName,
                                ownerId: ownerId
                            }
                        })
                        if (!tagInstance) throw new APIError();
                    }

                    const link = await tx.bookmark_tag.create({
                        data: {
                            bookmarkId: bookmark.id,
                            tagId: tagInstance.id
                        }
                    })
                    if (!link) throw new APIError();
                }

                console.log('Tags processed successfully.');
                let bookmarkTags = await tx.bookmark_tag.findMany({
                    where: { bookmarkId: bookmark.id },
                    select: {
                        tag: {
                            select: {
                                name: true,
                                id: true,
                            }
                        }
                    }
                });
                bookmarkTags = bookmarkTags.map(tag => tag.tag);
                bookmark.image = `${process.env.SERVER_URL}/img/${bookmark.link}`
                bookmark.tags = bookmarkTags;
                console.log('Transaction completed successfully.');
                return bookmark;
            })
        if (!bookmarkTransaction) throw new APIError();

        return reply
            // .status(HTTPStatusCode.CREATED)
            .json({
                message: "SUCCESS",
                bookmark: bookmarkTransaction
            });
    } catch (err) {
        return next(err);
    }
}

export async function metadataScraper(req, reply, next) {
    try {
        const value = req.body.value;
        const link = value.link;
        const data = await getMetaData(link)

        if (!data.image) {
            // take screenshot & save to images folder.

        }

        //TODO: save image to images folder.

        return reply.json({
            message: "SUCCESS",
            data: {
                title: data.title,
                description: data.description,
                image: data.image,
                url: data.url,
                icon: data.icon,
            }
        })
    } catch (err) {
        return next(err);
    }
}

export async function getBookmarkById(req, reply, next) {
    try {
        const value = req.body.value;
        const id = value.bookmarkId;

        const bookmark = await prisma.bookmark.findFirst({ where: { id: id } });
        if (!bookmark) throw new APIError();

        // get tags
        let tags = await prisma.bookmark_tag.findMany({
            where: { bookmarkId: bookmark.id },
            select: {
                tag: {
                    select: {
                        name: true,
                        id: true,
                    }
                }
            }
        });

        tags = tags.map(tag => tag.tag);
        bookmark.image = `${process.env.SERVER_URL}/img/${bookmark.link}`
        bookmark.tags = tags;
        return reply.json({
            message: "SUCCESS",
            bookmark: bookmark
        });
    } catch (err) {
        return next(err);
    }
}

export async function getAllBookmarks(req, reply, next) {
    try {
        const userId = req.user.id;
        const bookmarks = await prisma.bookmark.findMany({ where: { ownerId: userId } });
        if (!bookmarks) throw new APIError();

        for (let i = 0; i < bookmarks.length; i++) {
            const bookmark = bookmarks[i];
            let tags = await prisma.bookmark_tag.findMany({
                where: { bookmarkId: bookmark.id },
                select: {
                    tag: {
                        select: {
                            name: true,
                            id: true,
                        }
                    }
                }
            });
            tags = tags.map(tag => tag.tag);
            bookmark.image = `${process.env.SERVER_URL}/img/${bookmark.link}`
            bookmark.tags = tags;
        }

        return reply.json({
            message: "SUCCESS",
            bookmarks: bookmarks
        });
    } catch (err) {
        return next(err);
    }
}

export async function getBookmarksByTag(req, reply, next) {
    try {
        const value = req.body.value;
        const tagId = value.tagId;

        const bookmarks = await prisma.bookmark.findMany({
            where: { bookmark_tag: { some: { tagId: tagId } } }
        })
        if (!bookmarks) throw new APIError();

        bookmarks.forEach(bookmark => {
            bookmark.image = `${process.env.SERVER_URL}/img/${bookmark.link}`
        })

        return reply.json({
            message: "SUCCESS",
            bookmarks: bookmarks
        });
    } catch (err) {
        return next(err)
    }
}


export async function updateBookmarks(req, reply, next) {
    try {
        const value = req.body.value;
        const updateList = [];

        value.changes.forEach(async element => {
            const tx = prisma.bookmark.update({
                where: {
                    id: element.id
                },
                data: {
                    link: element.link,
                    directoryId: element.directoryId,
                    favorite: element.favorite,
                    title: element.title,
                    description: element.description,
                }
            })
            updateList.push(tx);
        })

        const updateTransation = await prisma.$transaction(updateList);
        if (!updateTransation) throw new APIError()

        updateTransation.forEach(bookmark => {
            bookmark.image = `${process.env.SERVER_URL}/img/${bookmark.link}`
        })

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "SUCCESS",
                bookmarks: updateTransation
            })
    } catch (err) {
        return next(err);
    }
}

export async function deleteBookmarks(req, reply, next) {
    try {
        const value = req.body.value;

        const deleted = await prisma.bookmark.deleteMany({ where: { id: { in: value.ids } } })
        if (!deleted) throw new APIError()

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({ message: "SUCCESS", })
    } catch (err) {
        return next(err);
    }
}
