import prisma from './prisma.js';

export async function doesUserHaveAccessToDirectory(userId, directoryId) {
    try {
        if (!directoryId) return false;

        const haveAccessPromise = prisma.user_directory_access.findFirst({
            where: { AND: [ { directory_id: directoryId }, { user_id: userId } ] } });

        const directoryPromise = prisma.directory.findFirst({ where: { id: directoryId } });

        const [haveAccess, directory] = await Promise.all([haveAccessPromise, directoryPromise]);
        if ((haveAccess && haveAccess.user_rights === 'edit') ||
            (directory && directory.owner_id === userId)) return true;

        return false || doesUserHaveAccessToDirectory(userId, directory? directory.parent_id : null);
    } catch (err) {
        return false;
    }
}
