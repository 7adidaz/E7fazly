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

        const ownerId = directory.owner_id;

        const bookmark = await prisma.bookmark.create({
            data: {
                link: link,
                owner_id: ownerId,
                directory_id: directoryId,
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

        return reply.json(bookmark);
    } catch (err) {
        return next(err);
    }
}

export async function getAllBookmarks(req, reply, next) {
    try {
        const userId = req.user.id;
        const bookmarks = await prisma.bookmark.findMany({ where: { owner_id: userId } });
        if (!bookmarks) throw new APIError();

        return reply.json(bookmarks);
    } catch (err) {
        return next(err);
    }
}

export async function getBookmarksByTag(req, reply, next) {
    try {
        const value = req.body.value;
        const tagId = value.tagId;

        const bookmarks = await prisma.bookmark.findMany({
            where: { bookmark_tag: { some: { tag_id: tagId } } }
        })
        if (!bookmarks) throw new APIError();

        return reply.json(bookmarks);
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
                    directory_id: element.directory_id,
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
                message: "UPDATED",
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
            .json({
                message: "DELETED",
            })
    } catch (err) {
        return next(err);
    }
}
