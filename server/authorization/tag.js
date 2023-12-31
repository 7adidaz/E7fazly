import { AuthorizationError } from "../util/error.js";
import doesUserHaveAccessToDirectory from "../util/haveTheRights.js";
import prisma from "../util/prisma.js";

export async function addTagToBookmarkAuthorizor(req, res, next) {
    try {
        const bookmarkId = req.body.value.bookmarkId;
        const issuerId = req.user.id;

        const bookmark = await prisma.bookmark.findFirst({ where: { id: bookmarkId } })
        if(!bookmark) throw new AuthorizationError();
        const parentId = bookmark.directoryId;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'edit')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function removeTagFromBookmarkAuthorizor(req, res, next) {
    try {
        const bookmarkId = req.body.value.bookmarkId;
        const issuerId = req.user.id;

        const bookmark = await prisma.bookmark.findFirst({ where: { id: bookmarkId } })
        if(!bookmark) throw new AuthorizationError();
        const parentId = bookmark.directoryId;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'edit')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function updateTagNameAuthorizor(req, res, next) {
    try {
        const tagId = req.body.value.tagId;
        const issuerId = req.user.id;

        const tag = await prisma.tag.findFirst({ where: { id: tagId } })
        if (tag && (tag.ownerId !== issuerId)) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function getTagsForBookmarkAuthorizor(req, res, next) {
    try {
        const bookmarkId = req.body.value.bookmarkId;
        const issuerId = req.user.id;

        const bookmark = await prisma.bookmark.findFirst({ where: { id: bookmarkId } })
        if(!bookmark) throw new AuthorizationError();
        const parentId = bookmark.directoryId;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'view')) throw new AuthorizationError();

        next();
    }
    catch (err) {
        return next(err);
    }
}  
