import { PrismaClient } from '@prisma/client'
import cache from './cache.js'

/**
 * cacheing strategy: 
 * 
 * 
 *      owner_id: {
 *          model:operation:query_agruments: result1
 *          model:operation:query_agruments2: result2
 *      }
 */

const prisma = new PrismaClient().$extends({
    query: {
        async $allOperations({ model, operation, args, query }) {
            if (operation === 'findMany') {
                const level1key = String(
                    args.where ?
                        args.where.owner_id ? args.where.owner_id : ' '
                        : ' ' || ' ');
                const level2key = JSON.stringify(args);

                const cached = await cache.hGet(level1key, `${model}:${operation}:${level2key}`);

                if (cached) { return JSON.parse(cached); }

                const result = await query(args);
                cache.hSet(level1key, `${model}:${operation}:${level2key}`, JSON.stringify(result));

                return result;
            }

            if (operation === 'update' ||
                operation === 'upsert' ||
                operation === 'delete' ||
                operation === 'create' ||
                operation === 'updateMany' ||
                operation === 'deleteMany') {

                const level1key = String(args.where ?
                    args.where.owner_id ?
                        args.where.owner_id : ' ' : ' ');

                await cache.del(level1key);
            }

            return query(args);
        }
    }
})

export default prisma