import prisma from "../util/prisma.js";
import { APIError } from "../util/error.js";

export async function createBookmark(req, reply, next) {
    try {
        const value = req.body.value;

        const link = value.link;
        const directoryId = value.directoryId;
        const type = value.type;
        const favorite = value.favorite;

        const directory = await prisma.directory.findFirst({ where: { id: directoryId, } });
        if (!directory) throw new APIError();

        const ownerId = directory.ownerId;

        const bookmark = await prisma.bookmark.create({
            data: {
                link: link,
                ownerId: ownerId,
                directoryId: directoryId,
                type: type,
                favorite: favorite
            }
        })
        if (!bookmark) throw new APIError();

        return reply
            // .status(HTTPStatusCode.CREATED)
            .json({
                message: "SUCCESS",
                bookmark: bookmark
            });
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
                    favorite: element.favorite
                }
            })
            updateList.push(tx);
        })

        const updateTransation = await prisma.$transaction(updateList);
        if (!updateTransation) throw new APIError()

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
