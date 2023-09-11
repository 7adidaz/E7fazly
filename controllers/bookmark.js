import { isNumber } from "../util/error.js";
import prismaclient from "../util/prismaclient.js";
import { bookmarkValidation } from "../validators/bookmark.js";
//TODO: status codes for all of this. 
/** 
model bookmark {
    id           Int            @id @default(autoincrement()) 
    link         String
    owner_id     Int
    directory_id Int
    type         bookmark_type
    favorite     Boolean
    directory    directory      @relation(fields: [directory_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
    user         user           @relation(fields: [owner_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
    bookmark_tag bookmark_tag[] 
}
 */

async function validAccess(userId, directoryId) {
    /**
     * for a bookmark to be inserted, one of these cases 
     *     - it's the user's directory 
     *     - the user have access_right = "edit" to the directory 
     */

    // first i check for the existance of the user and Directory
    try {
        const user = await prismaclient.user.findFirst({
            where: {
                id: userId
            }
        });

        const directory = await prismaclient.directory.findFirst({
            where: {
                id: directoryId
            }
        });

        if (!user || !directory) {
            return false;
        }

        if (directory.owner_id === user.id) {
            return true;
        }

        // does it has the right access rights? 
        const accessRight = await prismaclient.user_directory_access.findFirst({
            where: {
                //TODO: this is gonna fail somehow. MAKE IT WORK
                user_id: userId,
                directory_id: directoryId
            }
        });

        if (!accessRight || accessRight.user_rights !== "edit") {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}

//AuthN
export async function createBookmark(req, reply, next) {
    try {
        const { error, value } = bookmarkValidation.validate(req.body, { abortEarly: false })
        if (error) {
            throw new ValidationError(
                new ErrorObject(
                    "the data provided don't pass the validation requirement",
                    error.details.map(err => err.message)
                ).toObject());
        }

        const link = req.body.link;
        const owner_id = req.body.owner_id;
        const directory_id = req.body.directory_id;
        const type = req.body.type;
        const favorite = req.body.favorite;


        if (validAccess(owner_id, directory_id)) {
            const bookmark = await prismaclient.bookmark.create({
                data: {
                    link: link,
                    owner_id: owner_id,
                    directory_id: directory_id,
                    type: type,
                    favorite: favorite
                }
            })

            if (!bookmark) {
                throw new APIError(
                    new ErrorObject(
                        "Somthing went wrong saving the bookmark to the database",
                        {}
                    ).toObject());
            }


        } else {
            throw new AuthorizationError(
                new ErrorObject(
                    "unauthorized access to resource",
                    {}
                ).toObject());
        }
        return reply
            .status(HTTPStatusCode.CREATED)
            .json({
                message: "SUCCESS"
            });
    } catch (err) {
        return next(err); // so many things can go wrong at this point, need to handle non-operational errors.
    }
}

//AuthZ
export async function getBookmarkById(req, reply, next) {
    try {
        const id = Number(req.params.id);

        if (!isNumber(id)) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain an ID as a number",
                    {}
                ).toObject())
        }

        const bookmark = await prismaclient.bookmark.findFirst({
            where: {
                id: id
            }
        });

        if (!bookmark) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong getting the bookmark or it's not present!",
                    {}
                ).toObject());
        }

        return reply.json(bookmark);
    } catch (err) {
        return next(err);
    }
}

//AuthZ
export async function getAllBookmarks(req, reply, next) {
    // this "I THINK" should NOT include the one user's have access to thier folders. 
    try {
        const userId = req.user.id;

        if (!userId) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain an ID as a number",
                    {}
                ).toObject())
        };

        const bookmarks = await prismaclient.bookmark.findMany({
            where: {
                owner_id: userId
            }
        });

        if (!bookmarks) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong getting the bookmark or it's not present!",
                    {}
                ).toObject());
        }

        return reply.json(bookmarks);
    } catch (err) {
        return next(err);
    }
}

//AuthZ
export async function getBookmarksByTag(req, reply, next) {
    try {
        /**
         * aaaaaaaaaaaaaa, i think i should make sure 
         * that the requester is requesting tags that is HIS, not other's. 
         */
        const tagId = Number(req.params.tag_id);

        if (!tagId) {
            throw new ValidationError(
                new ErrorObject(
                    "Request must contain an ID as a number",
                    {}
                ).toObject())
        };

        const bookmarks = await prismaclient.bookmark_tag.findMany({
            where: {
                tag_id: tagId
            }
        })

        if (!bookmarks) {
            throw new APIError(
                new ErrorObject(
                    "Somthing went wrong getting the tag or it's not present!",
                    {}
                ).toObject());
        }

        return reply.json(bookmarks);
    } catch (err) {
        return next(err)
    }
}


export async function updateBookmarks(req, reply, next) {
    try {
        // an array of id's and data
        const updateList = req.body.update_list;
        updateList.forEach(element => {
            const { error, value } = bookmarkValidation.validate(element, { abortEarly: false })
            if (error) {
                throw new ValidationError(
                    new ErrorObject(
                        "some of the data provided don't pass the validation requirement",
                        error.details.map(err => err.message)
                    ).toObject());
            }
        });

        // does the user has the right of update this? 
        // does this should be transactional?! 

        await updateList.forEach(async element => {
            if (validAccess(element.owner_id, element.directory_id)) { //TODO: optimize this. 
                const updatedBookmark = await prismaclient.bookmark.update({
                    where: {
                        id: element.id
                    },
                    data: {
                        link: element.link,
                        owner_id: element.owner_id,
                        directory_id: element.directory_id,
                        favorite: element.favorite,
                        //TODO: should type stay the same? 
                    }
                })

                if (!updateBookmarks) {
                    throw new APIError(
                        new ErrorObject(
                            "Somthing went wrong saving the bookmark to the database",
                            {}
                        ).toObject());
                }
            } else {
                throw new AuthorizationError(
                    new ErrorObject(
                        "unauthorized access to resource",
                        {}
                    ).toObject());
            }
        })

        return reply
            .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "Directories DELETED"
            })
    } catch (err) {
        return next(err);
    }
}

export async function deleteBookmarks(req, reply, next) {
    //TODO
}
