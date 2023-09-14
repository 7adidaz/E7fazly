import prismaclient from "./prismaclient";

export async function validAccess(userId, directoryId) {
    /**
     * for a bookmark to be inserted, one of these cases 
     *     - it's the user's directory 
     *     - the user have access_right = "edit" to the directory 
     *     - user has access to upper directory 
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