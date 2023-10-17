import { AuthorizationError } from '../util/error.js';
import doesUserHaveAccessToDirectory from '../util/haveTheRights.js';
import prisma from '../util/prisma.js';

export async function createBookmarkAuthorization(req, res, next) {
    try {
        const parentId = req.body.value.directoryId;
        const issuerId = req.user.id;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'edit')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function getBookmarkByIdAuthorization(req, res, next) {
    try {
        const bookmarkId = req.body.value.bookmarkId;
        const issuerId = req.user.id;

        const bookmark = await prisma.bookmark.findFirst({ where: { id: bookmarkId } })
        const parentId = bookmark.directory_id;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'view')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function getBookmarksByTagAuthorization(req, res, next) {
    try {
        const tagId = req.body.value.tagId;
        const issuerId = req.user.id;

        const tag = await prisma.tag.findFirst({ where: { id: tagId } })
        if (tag && (tag.owner_id !== issuerId)) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function updateBookmarksAuthorization(req, res, next) {
    // i have first to check if the user has access to the directory of the bookmark
    // then i have to check if the user has access to the new directory of the bookmark
    try {
        const changeslist = req.body.value.changes;
        const issuerId = req.user.id;

        for (const change of changeslist) {
            const id = change.id;

            const bookmark = await prisma.bookmark.findFirst({ where: { id: id } })
            const parentId = bookmark.directory_id;

            if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'edit')) throw new AuthorizationError();

            // check if the user has access to the new directory of the bookmark
            const newParentId = change.directoryId;
            if (newParentId!== parentId) {
                if (!await doesUserHaveAccessToDirectory(issuerId, newParentId, 'edit')) throw new AuthorizationError();
            }
        }
        next();
    } catch (err) {
        return next(err);
    }
}

export async function deleteBookmarksAuthorization(req, res, next) {
    try {
        const ids = req.body.value.ids;
        const issuerId = req.user.id;

        for (const id of ids) {
            const bookmark = await prisma.bookmark.findFirst({ where: { id: id } })
            const parentId = bookmark.directory_id;

            if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'edit')) throw new AuthorizationError();
        }

        next();
    } catch (err) {
        return next(err);
    }
}
