import prisma from './prisma.js';

export default async function doesUserHaveAccessToDirectory(userId, directoryId, accessType) {
    try {
        if (!directoryId) return false;
        if (accessType !== 'view' && accessType !== 'edit') return false;

        const haveAccessPromise = prisma.user_directory_access.findFirst({
            where: { AND: [{ directory_id: directoryId }, { user_id: userId }] }
        });
        const directoryPromise = prisma.directory.findFirst({ where: { id: directoryId } });
        const [haveAccess, directory] = await Promise.all([haveAccessPromise, directoryPromise]);

        if ((haveAccess &&
            ((accessType === 'edit' ?
                haveAccess.user_rights === 'edit' :
                (haveAccess.user_rights === 'view' || haveAccess.user_rights === 'edit')))) || 
            (directory && directory.owner_id === userId)) return true;

        return false || doesUserHaveAccessToDirectory(userId, directory ? directory.parent_id : null, accessType);
    } catch (err) {
        return false;
    }
}
