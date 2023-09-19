import prismaclient from "../util/prismaclient.js";
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

//AuthN
export async function createBookmark(req, reply, next) {
    try {

        const value = req.body.value;

        const link = value.link;
        const ownerId = value.owner_id;
        const directoryId = value.directory_id;
        const type = value.type;
        const favorite = value.favorite;


        const bookmark = await prismaclient.bookmark.create({
            data: {
                link: link,
                owner_id: ownerId,
                directory_id: directoryId,
                type: type,
                favorite: favorite
            }
        })

        if (!bookmark) throw new APIError();
        return reply
            // .status(HTTPStatusCode.CREATED)
            .json({
                message: "SUCCESS",
                bookmark: bookmark
            });
    } catch (err) {
        return next(err);
    }
}

//AuthZ
export async function getBookmarkById(req, reply, next) {
    try {
        const value = req.body.value;
        const id = value.id;

        const bookmark = await prismaclient.bookmark.findFirst({
            where: {
                id: id
            }
        });
        if (!bookmark) throw new APIError();

        return reply.json(bookmark);
    } catch (err) {
        return next(err);
    }
}

//AuthZ
export async function getAllBookmarks(req, reply, next) {
    // this "I THINK" should NOT include the one user's have access to thier folders. 
    try {
        const value = req.body.value;
        const userId = value.id;

        const bookmarks = await prismaclient.bookmark.findMany({
            where: {
                owner_id: userId
            }
        });
        if (!bookmarks) throw new APIError();

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
        const value = req.body.value;
        const tagId = value.tagId;

        const bookmarks = await prismaclient.bookmark.findMany({
            where: {
                bookmark_tag: {
                    some: {
                        tag_id: tagId
                    }
                }
            }
        })

        if (!bookmarks) throw new APIError();

        return reply.json(bookmarks);
    } catch (err) {
        return next(err)
    }
}


export async function updateBookmarks(req, reply, next) {
    try {
        const value = req.body.value;
        const updateList = [];

        value.list.forEach(async element => {
            const tx = prismaclient.bookmark.update({
                where: {
                    id: element.id
                },
                data: {
                    link: element.link,
                    directory_id: element.directory_id,
                    favorite: element.favorite
                }
            })

            updateList.push(tx);
        })

        const updateTransation = await prismaclient.$transaction(updateList);
        if (!updateTransation) throw new APIError()

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "UPDATED",
                bookmarks: updateTransation
            })
    } catch (err) {
        return next(err);
    }
}

export async function deleteBookmarks(req, reply, next) {
    try {
        const value = req.body.value;
        const deleteList = [];

        value.list.forEach(async id => {
            const tx = prismaclient.bookmark.delete({
                where: { id: id }
            })
            deleteList.push(tx);
        })
        const deleteTransation = await prismaclient.$transaction(deleteList);
        if (!deleteTransation) throw new APIError()

        return reply
            // .status(HTTPStatusCode.ACCEPTED_UPDATE_DELETED)
            .json({
                message: "DELETED",
            })
    } catch (err) {
        return next(err);
    }
}
