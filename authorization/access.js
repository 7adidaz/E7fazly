import { AuthorizationError } from "../util/error";
import doesUserHaveAccessToDirectory from "../util/haveTheRights";

export async function grantAccessAuthorizor(req, res, next) {
    try {
        const directoryId = req.body.value.directoryId;
        const issuerId = req.user.id;

        if (!await doesUserHaveAccessToDirectory(issuerId, directoryId, 'edit')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function getAccessAuthorizor(req, res, next) {
    try {
        const directoryId = req.params.directoryId;
        const issuerId = req.user.id;

        if (!await doesUserHaveAccessToDirectory(issuerId, directoryId, 'view')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}

export async function revokeAccessAuthorizor(req, res, next) {
    try {
        const directoryId = req.body.value.directoryId;
        const issuerId = req.user.id;

        if (!await doesUserHaveAccessToDirectory(issuerId, directoryId, 'edit')) throw new AuthorizationError();

        next();
    } catch (err) {
        return next(err);
    }
}