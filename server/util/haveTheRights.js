import prisma from './prisma.js';

export default async function doesUserHaveAccessToDirectory(userId, directoryId, accessType) {
    try {
        if (!directoryId) return false;
        if (accessType !== 'view' && accessType !== 'edit') return false;

        const haveAccessPromise = prisma.user_directory_access.findFirst({
            where: { AND: [{ directoryId: directoryId }, { userId: userId }] }
        });
        const directoryPromise = prisma.directory.findFirst({ where: { id: directoryId } });
        const [haveAccess, directory] = await Promise.all([haveAccessPromise, directoryPromise]);

        if ((haveAccess &&
            ((accessType === 'edit' ?
                haveAccess.userRights === 'edit' :
                (haveAccess.userRights === 'view' || haveAccess.userRights === 'edit')))) || 
            (directory && directory.ownerId === userId)) return true;

        return false || doesUserHaveAccessToDirectory(userId, directory ? directory.parentId : null, accessType);
    } catch (err) {
        return false;
    }
}
