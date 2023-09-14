import { directoryDataValidation } from "../validators/directory.js"
import prisma from '../util/prismaclient.js'
import { AuthorizationError, ErrorObject, ValidationError, HTTPStatusCode, NotFoundError, isNumber } from "../util/error.js";

//TODO:  make sure that controllers match the API from postman.
//TODO: authN and authZ

export async function createDirectory(req, reply, next) {
    try {

        const value = req.body.value;

        const userId = value.ownerId;
        const directoryName = value.name;
        const directoryParentId = value.parentId;
        const icon = "default";

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) throw new ValidationError()

        const newDirectory = await prisma.directory.create({
            data: {
                parent_id: directoryParentId,
                name: directoryName,
                icon: icon,
                owner_id: userId
            }
        });

        if (!newDirectory) throw new APIError();


        return reply
            .status(HTTPStatusCode.CREATED)
            .json({
                message: "SUCCESS"
            });
    } catch (err) {
        return next(err);
    }
}

export async function contentByParent(req, reply, next) {
    try {

        const value = req.body.value;
        const parentId = value.id;

        let parent_dir = await prisma.directory.findFirst({
            where: {
                id: parentId
            }
        });

        if (!parent_dir) throw new NotFoundError()


        const response = {
            // directories: [],
            // bookmarks: []
        };

        const nestedDirectories = await prisma.directory.findMany({
            where: {
                parent_id: parentId
            }
        });
        response.directories = nestedDirectories ? nestedDirectories : [];

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                owner_id: parentId
            }
        });

        response.bookmarks = bookmarks ? bookmarks : [];

        return reply.json(response);
    } catch (err) {
        return next(err);
    }
}

export async function getAllDirectories(req, reply, next) {
    try {
        const value = req.body.value;
        const userId = value.id;

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) throw new AuthorizationError()


        const directories = await prisma.directory.findMany({
            where: {
                owner_id: userId
            }
        });

        const response = {};
        response.directories = directories ? directories : [];

        return reply.json(response);
    } catch (err) {
        return next(err);
    }
}

export async function updateDirectory(req, reply, next) {
    try {
        const value = req.body.value;

        const id = value.id;
        const directoryName = value.name;
        const parentId = value.parentId;
        const icon = value.icon;

        const updated = await prisma.directory.update({
            where: {
                id: id
            },
            data: {
                name: directoryName,
                parent_id: parentId,
                icon: icon
            }
        });

        if (!updated) throw new APIError()


        return reply
            .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "UPDATE SUCCESS"
            });
    } catch (err) {
        return next(err);
    }
}

export async function deleteDirectoriesByIds(req, reply, next) {
    try {
        const idList = req.body.value.idList;

        const deleteResult = await prisma.directory.deleteMany({
            where: {
                id: {
                    in: idList
                }
            }
        })

        if (!deleteResult) throw new APIError()


        return reply
            .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "Directories DELETED"
            })
    } catch (err) {
        return next(err);
    }
}