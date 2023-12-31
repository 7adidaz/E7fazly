import prisma from '../util/prisma.js'
import { AuthorizationError, NotFoundError, APIError } from "../util/error.js";

export async function createDirectory(req, reply, next) {
    try {
        const value = req.body.value;

        const directoryName = value.name;
        const directoryParentId = value.parentId;

        const parentDirectory = await prisma.directory.findFirst({
            where: {
                id: directoryParentId,
            }
        });
        if (!parentDirectory) throw new NotFoundError();

        const newDirectory = await prisma.directory.create({
            data: {
                parentId: directoryParentId,
                name: directoryName,
                icon: "default",
                ownerId: parentDirectory.ownerId
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
        const parentId = value.parentId;

        let parent_dir = await prisma.directory.findFirst({
            where: {
                id: parentId
            }
        });
        if (!parent_dir) throw new NotFoundError()

        const response = {
            messafe: "SUCCESS",
            // directories: [],
            // bookmarks: []
        };

        const nestedDirectories = await prisma.directory.findMany({
            where: {
                parentId: parentId
            }
        });
        response.directories = nestedDirectories ? nestedDirectories : [];

        const bookmarks = await prisma.bookmark.findMany({
            where: {
                directoryId: parentId
            }
        });

        bookmarks.forEach(bookmark => {
            bookmark.image = `${process.env.SERVER_URL}/img/${bookmark.link}`
        })

        response.bookmarks = bookmarks ? bookmarks : [];

        return reply.json({
            message: "SUCCESS",
            directories: response.directories,
            bookmarks: response.bookmarks
        });
    } catch (err) {
        return next(err);
    }
}

export async function getAllDirectories(req, reply, next) {
    try {
        const userId = req.user.id;

        const directories = await prisma.directory.findMany({
            where: {
                ownerId: userId
            }
        });
        if (!directories) throw new APIError();

        return reply.json({
            message: "SUCCESS",
            directories: directories
        });
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
                    parentId: parentId,
                    icon: icon
                }
            });

            updatedDirectories.push(tx);
        })

        const updatedDirectoriesTransaction = //update all or nothing
            await prisma.$transaction(updatedDirectories)

        if (!updatedDirectoriesTransaction) throw new APIError()

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "SUCCESS",
                directories: updatedDirectoriesTransaction
            });
    } catch (err) {
        return next(err);
    }
}

export async function deleteDirectoriesByIds(req, reply, next) {
    try {
        const idList = req.body.value.ids;

        const deleted = await prisma.directory.deleteMany({
            where: { id: { in: idList } }
        })
        if (!deleted) throw new APIError();

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({ message: "SUCCESS" })
    } catch (err) {
        return next(err);
    }
}