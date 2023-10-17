import { createClient } from 'redis'


const cache = createClient({ url: process.env.CACHE_URL});

cache.on('error', (err) => {
    console.log('Redis error: ', err);
});

export default cache;
