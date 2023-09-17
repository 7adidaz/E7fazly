import prismaclient from "../util/prismaclient.js";
import { validAccess } from "../util/valid_access.js";
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
        const owner_id = value.owner_id;
        const directory_id = value.directory_id;
        const type = value.type;
        const favorite = value.favorite;


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

            if (!bookmark) throw new APIError();

        } else {
            throw new AuthorizationError();
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

        const bookmarks = await prismaclient.bookmark_tag.findMany({
            where: {
                tag_id: tagId
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
        const updateList = value.list;

        // does the user has the right of update this? 
        // TODO: does this should be transactional?! 

        await updateList.forEach(async element => {
            if (validAccess(element.owner_id, element.directory_id)) { 
                const updatedBookmark = await prismaclient.bookmark.update({
                    where: {
                        id: element.id
                    },
                    data: {
                        link: element.link,
                        directory_id: element.directory_id,
                        favorite: element.favorite,
                        //TODO: should type stay the same?  - i think yes
                    }
                })

                if (!updateBookmarks) throw new APIError();

            } else {
                throw new AuthorizationError();
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
