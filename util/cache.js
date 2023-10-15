import { createClient } from 'redis'


const cache = createClient({ url: 'redis://127.0.0.1:6379' });

cache.on('error', (err) => {
    console.log('Redis error: ', err);
});

export default cache;
