import { PrismaClient } from '@prisma/client'
import cache from './cache.js'

/**
 * cacheing strategy: 
 * 
 *      //TOOD: fix the schema 
 * 
 *      database table: {
 *          user_id: {
 *              query1: result1
 *              query2: result2 
 *          }  
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

                // console.log(`lvl1 ${level1key} .. lvl2 ${level2key}`)
                const cached = await cache.hGet(level1key, `${model}:${operation}:${level2key}`);

                if (cached) {
                    // console.log('hit')
                    return JSON.parse(cached);
                }

                // console.log('miss')
                const result = await query(args);
                // console.log(`lvl1 ${level1key} .. lvl2 ${level2key} .. res ${JSON.stringify(result)}`)
                cache.hSet(level1key, `${model}:${operation}:${level2key}`, JSON.stringify(result));

                return result;
            }

            if (operation === 'update' ||
                operation === 'upsert' ||
                operation === 'delete' ||
                operation === 'create' ||
                operation === 'updateMany' ||
                operation === 'deleteMany'

            ) {
                // console.log('flush')
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
