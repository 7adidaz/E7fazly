import { APIError } from "../util/error.js";
import prisma from "../util/prisma.js";

export async function grantAccess(req, reply, next) {
    try {
        const value = req.body.value;

        const directoryId = value.directoryId;
        const userToHaveAccess = value.userId;
        const accessRight = value.accessRight;

        const givenAccess = await prisma.user_directory_access.upsert({
            where: {
                user_id_directory_id: {
                    directory_id: directoryId,
                    user_id: userToHaveAccess
                }
            },
            create: {
                directory_id: directoryId,
                user_id: userToHaveAccess,
                user_rights: accessRight
            },
            update: {
                user_rights: accessRight
            }
        })
        if (!givenAccess) throw new APIError()

        return reply.json({
            message: "GRANTED"
        })
    } catch (err) {
        return next(err)
    }
}


export async function revokeAccess(req, reply, next) {
    try {
        const value = req.body.value;

        const directoryId = value.directoryId;
        const userId = value.userId;

        await prisma.user_directory_access.delete({
            where: {
                user_id_directory_id: {
                    directory_id: directoryId,
                    user_id: userId
                }

            }
        })

        return reply.json({
            message: "REVOKED"
        })
    } catch (err) {
        return next(err)
    }
}