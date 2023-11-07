import prisma from "../util/prisma.js";
import { APIError } from "../util/error.js";

export async function addTagForBookmark(req, reply, next) {
    try {
        const value = req.body.value;

        const tagName = value.name.toLowerCase();
        const bookmarkId = value.bookmarkId;

        const bookmarkInstance = await prisma.bookmark.findFirst({ where: { id: bookmarkId } });
        if (!bookmarkInstance) throw new APIError();

        const ownerId = bookmarkInstance.ownerId;

        let tagInstance = await prisma.tag.findFirst({
            where: {
                AND: [
                    { name: tagName },
                    { ownerId: ownerId }
                ]
            }
        });

        if (!tagInstance) {
            tagInstance = await prisma.tag.create({
                data: {
                    name: tagName,
                    ownerId: ownerId
                }
            })
            if (!tagInstance) throw new APIError();
        }

        const link = await prisma.bookmark_tag.create({
            data: {
                bookmarkId: bookmarkId,
                tagId: tagInstance.id
            }
        })
        if (!link) throw new APIError();

        return reply.json({
            message: "SUCCESS",
            tag: tagInstance
        })
    } catch (err) {
        return next(err);
    }
}

export async function removeTagFromBookmark(req, reply, next) {
    try {
        const value = req.body.value;

        const bookmarkId = value.bookmarkId;
        const tagId = value.tagId;

        const tagInstanceCount = await prisma.bookmark_tag.findMany({
            where: {
                tagId: tagId
            }
        })
        if (!tagInstanceCount) throw APIError()

        if (tagInstanceCount.length === 1) {
            const deleted = await prisma.tag.deleteMany({
                where: {
                    id: tagId
                }
            })
            if (!deleted) throw APIError();
        } else {
            const deleted = await prisma.bookmark_tag.deleteMany({
                where: {
                    AND: [
                        { tagId: tagId },
                        { bookmarkId: bookmarkId }
                    ]
                }
            })
            if (!deleted) throw APIError();
        }
        return reply.json({ message: "SUCCESS" })
    } catch (err) {
        return next(err);
    }
}

export async function updateTagName(req, reply, next) {
    try {
        const value = req.body.value;

        const newName = value.newName;
        const tagId = value.tagId;

        const updated = await prisma.tag.update({
            where: {
                id: tagId
            },
            data: {
                name: newName
            }
        })
        if (!updated) throw new APIError();

        return reply.json({ message: "SUCCESS", })
    } catch (err) {
        return next(err);
    }
}

export async function getTagsForBookmark(req, reply, next) {
    try {
        const value = req.body.value;
        const bookmarkId = value.bookmarkId;

        const tags = await prisma.tag.findMany({
            where: {
                bookmark_tag: {
                    some: {
                        bookmarkId: bookmarkId
                    }
                }
            }
        })

        return reply.json({
            message: "SUCCESS",
            tags: tags
        })
    } catch (err) {
        return next(err);
    }
}

export async function getTagsForUser(req, reply, next) {
    try {
        const userId = req.user.id;

        const tags = await prisma.tag.findMany({
            where: {
                ownerId: userId
            }
        })
        if (!tags) throw new APIError();

        return reply.json({
            message: "SUCCESS",
            tags: tags
        })
    } catch (err) {
        return next(err);
    }
}
