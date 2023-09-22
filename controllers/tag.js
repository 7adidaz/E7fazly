import prismaclient from "../util/prismaclient.js";
import { APIError } from "../util/error.js";

export async function addTagForBookmark(req, reply, next) {
    try {
        const value = req.body.value;

        const tagName = value.name.toLowerCase();
        const bookmarkId = value.bookmarkId;
        const ownerId = value.ownerId; //TODO: may fix this to extract the id from the user.

        let tagInstance = await prismaclient.tag.findFirst({
            where: {
                AND: [
                    { name: tagName },
                    { owner_id: ownerId }
                ]
            }
        });

        if (!tagInstance) {
            tagInstance = await prismaclient.tag.create({
                data: {
                    name: tagName,
                    owner_id: ownerId
                }
            })
            if (!tagInstance) throw new APIError();
        }

        const link = await prismaclient.bookmark_tag.create({
            data: {
                bookmark_id: bookmarkId,
                tag_id: tagInstance.id
            }
        })
        if (!link) throw new APIError();

        return reply.json({
            message: "ADDED",
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

        const tagInstanceCount = await prismaclient.bookmark_tag.findMany({
            where: {
                tag_id: tagId
            }
        })
        if (!tagInstanceCount) throw APIError()

        if (tagInstanceCount.length === 1) {
            const deleted = await prismaclient.tag.deleteMany({
                where: {
                    id: tagId
                }
            })
            if (!deleted) throw APIError();
        } else {
            const deleted = await prismaclient.bookmark_tag.deleteMany({
                where: {
                    AND: [
                        { tag_id: tagId },
                        { bookmark_id: bookmarkId }
                    ]
                }
            })
            if (!deleted) throw APIError();
        }
        return reply.json({ message: "DELETED" })
    } catch (err) {
        return next(err);
    }
}

export async function updateTagName(req, reply, next) {
    try {
        const value = req.body.value;

        const newName = value.name;
        const tagId = value.tagId;

        const updated = await prismaclient.tag.update({
            where: {
                id: tagId
            },
            data: {
                name: newName
            }
        })
        if (!updated) throw new APIError();

        return reply.json({
            message: "UPDATED"
        })
    } catch (err) {
        return next(err);
    }
}