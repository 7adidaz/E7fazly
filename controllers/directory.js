import { directoryDataValidation } from "../validators/directory.js"
import prisma from '../util/prismaclient.js'
import { AuthorizationError, ErrorObject, ValidationError,  HTTPStatusCode, NotFoundError, isNumber } from "../util/error.js";

//TODO:  make sure that controllers match the API from postman.

//TODO: authz
export async function createDirectory(req, reply, next) {
    try {
        const { error, value } = directoryDataValidation.validate(req.body, { abortEarly: false });
        if (error) {
            throw new ValidationError(
                new ErrorObject(
                    "the data provided don't pass the validation requirement",
                    error.details.map(err => err.message)
                )
            );
        }

        const userId = value.ownerId;
        const directoryName = value.name;
        const directoryParentId = value.parentId;
        const icon = "default";

        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) { // user is not in DB 

            //TODO: i think this should be handled 
            // more carefully! 
            // iirc this if the user try to create 
            // a folder for a user not in the system.

            throw new AuthorizationError(
                new ErrorObject(
                    "unauthorized access to resource",
                    {}
                ).toObject()
            )
        }

        const newDirectory = await prisma.directory.create({
            data: {
                parent_id: directoryParentId, 
                name: directoryName,
                icon: icon,
                owner_id: userId
            }
        });

        if (!newDirectory) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong creating directory in database",
                    {}
                ).toObject());
        }

        return reply
        .status(HTTPStatusCode.CREATED)
        .json({
            message: "SUCCESS"
        });
    } catch (err) {
        return next(err);
    }
}

//TODO: AuthZ 
export async function contentByParent(req, reply, next) {
    try {
        const parentId = Number(req.params.parent_id);

        console.log(parentId, typeof(parentId))
        if (!isNumber(parentId)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain a parent_id as a number",
                    {}
                ).toObject());
        }

        let parent_dir = await prisma.directory.findFirst({
            where: {
                id: parentId
            }
        });

        if (!parent_dir) {
            throw new NotFoundError(
                new ErrorObject(
                    "Trying to get the content of a non-valid directory",
                    {}
                )
            )
        }

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

//TODO: AuthZ
export async function getAllDirectories(req, reply, next) {
    try {
        const userId = Number(req.params.userId)

        if (!isNumber(userId)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain a userId as a number",
                    {}
                ).toObject());
        }
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (!user) {
            throw new AuthorizationError(
                new ErrorObject(
                    "unauthorized access to resource",
                    {}
                ).toObject()
            )
        }

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

//TODO: AuthZ
export async function updateDirectory(req, reply, next) {
    try {
        const { error, value } = directoryDataValidation.validate(req.body, { abortEarly: false });
        if (error) {
            throw new ValidationError({
                description: "the data provided don't pass the validation requirement",
                data: error.details.map(err => err.message)
            });
        }

        const id = Number(req.params.id);
        const directoryName = req.body.name;
        const owner_id= req.body.ownerId;
        const parentId = req.body.parentId;
        const icon= req.body.icon;

        if (!isNumber(id)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain a id as a number",
                    {}
                ).toObject());
        }

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

        if (!updated) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong updating the directory in the database",
                    {}
                ).toObject());
        }

        return reply
        .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
        .json({
            message: "UPDATE SUCCESS"
        });
    } catch (err) {
        return next(err);
    } }

//TODO: AuthZ
export async function deleteDirectoriesByIds(req, reply, next) {
    try {

        const idList = [];

        req.query.ids
        .split('')
        .forEach(id => {
            console.log('id: ', id)
            if(isNumber(Number(id))){
                idList.push(Number(id));
            }
        })
        console.log('ids: ', idList);

        const deleteResult = await prisma.directory.deleteMany({
            where: {
                id: {
                    in: idList
                }
            }
        })

        if (!deleteResult) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong deleting the directory from the database",
                    {}
                ).toObject());
        }

        return reply
        .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
        .json({
            message: "Directories DELETED"
        })
    } catch (err) {
        return next(err);
    }
}