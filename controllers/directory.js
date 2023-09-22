import prisma from '../util/prismaclient.js'
import { AuthorizationError, ValidationError, NotFoundError, APIError } from "../util/error.js";

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


        return reply // .status(HTTPStatusCode.CREATED)
            .json({
                message: "SUCCESS",
                directory: newDirectory
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
                directory_id: parentId
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

export async function updateDirectoriesByIds(req, reply, next) {
    try {
        const value = req.body.value; // a collection of objects
        const updatedDirectories = [];

        value.changes.forEach(async change => {
            const id = change.id;
            const directoryName = change.name
            const parentId = change.parentId
            const icon = change.icon;

            const tx = prisma.directory.update({
                where: {
                    id: id
                },
                data: {
                    name: directoryName,
                    parent_id: parentId,
                    icon: icon
                }
            });

            updatedDirectories.push(tx);
        })

        const updatedDirectoriesTransaction = //update all or nothing
            await prisma.$transaction(updatedDirectories)

        if (!updatedDirectoriesTransaction) throw new APIError()
        updatedDirectoriesTransaction.forEach(e => {
            e.parentId = e.parent_id
            delete e.parent_id
        })

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "UPDATE SUCCESS",
                directories: updatedDirectoriesTransaction
            });
    } catch (err) {
        return next(err);
    }
}

export async function deleteDirectoriesByIds(req, reply, next) {
    try {
        const idList = req.body.value.ids;
        const deleteList = [];

        idList.forEach(id => {
            const tx = prisma.directory.delete({
                where: {
                    id: id
                }
            })
            deleteList.push(tx);
        })

        const result = await prisma.$transaction(deleteList);
        if (!result) throw new APIError();

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "DELETED"
            })
    } catch (err) {
        return next(err);
    }
}