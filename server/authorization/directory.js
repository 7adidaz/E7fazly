import { AuthorizationError} from '../util/error.js';
import  doesUserHaveAccessToDirectory from '../util/haveTheRights.js';

export async function createDirectoryAuthorizer(req, res, next) {
    try {
        const parentId = req.body.value.parentId;
        const issuerId = req.user.id;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'edit')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function getParentContentAuthorizer(req, res, next) {
    try {
        const parentId = req.body.value.parentId;
        const issuerId = req.user.id;

        if (!await doesUserHaveAccessToDirectory(issuerId, parentId, 'view')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function updateDirectoriesByIdsAuthorizer(req, res, next) {
    try {
        const changeslist = req.body.value.changes;
        const issuerId = req.user.id;

        for (let i = 0; i < changeslist.length; i++) {
            const change = changeslist[i];
            const id = change.id;

            if (!await doesUserHaveAccessToDirectory(issuerId, id, 'edit')) throw new AuthorizationError();
        }

        next();
    } catch (err) {
        return next(err);
    }
}

export async function deleteDirectoriesByIdsAuthorizer(req, res, next) { 
    try {
        const ids = req.body.value.ids;
        const issuerId = req.user.id;

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];

            if (!await doesUserHaveAccessToDirectory(issuerId, id, 'edit')) throw new AuthorizationError();
        }

        next();
    } catch (err) {
        return next(err);
    }
}
