const redis = require('redis');
const { promisify } = require('util');

const redisEndpoint = 'backspace-lab-redis.qihdrs.0001.use1.cache.amazonaws.com:6379';
const PORT = redisEndpoint.slice(-4);
const HOST = redisEndpoint.slice(0,-5);

const client = redis.createClient(PORT, HOST);

const setAsync = promisify(client.set).bind(client);
const expireAsync = promisify(client.expire).bind(client);
const getAsync = promisify(client.get).bind(client);
const setObjAsync = promisify(client.hmset).bind(client);
const readObjAsync = promisify(client.hgetall).bind(client);

(async function() {
    try {
        client.on('connect', () => {
            console.log(`Connected to Redis node: ${redisEndpoint}`);
        });
        let key = "myHighScore";
        await writeRedisKey(key, "1000");
        await expireRedisKey(key, 30);
        await readRedisKey(key);
        
        const objInfo = {
            info1: "This is info 1",
            info2: "This is info 2",
            info3: "This is info 3",
            info4: "This is info 4"
        }
        await writeRedisObject("myInfo", objInfo);
        await readRedisObject("myInfo");
        
    } catch (err) {
        console.log(err, err.stack);
    }
})();


async function writeRedisKey(keyRedis, value) {
    try {
        const response = await setAsync(keyRedis, value);
        console.log(`Write response: ${response}`);
    } catch (err) {
        console.log(err, err.stack);
    }
}

async function expireRedisKey(keyRedis, value) {
    try {
        const response = await expireAsync(keyRedis, value);
        if (response) {
            console.log('Successfully set expiry time')
        } else {
            console.log(`Unsuccessful. Key ${keyRedis} does not exist!`)
        }
    } catch (err) {
        console.log(err, err.stack);
    }
}

async function readRedisKey(keyRedis) {
    try {
        const response = await getAsync(keyRedis);
        console.log(`Read response: ${response}`);
    } catch (err) {
        console.log(err, err.stack);
    }
}

async function writeRedisObject(objRedis, value) {
    try {
        const response = await setObjAsync(objRedis, value);
        console.log(`Write Object response: ${response}`);
    } catch (err) {
        console.log(err, err.stack);
    }
}

async function readRedisObject(objRedis) {
    try {
        const response = await readObjAsync(objRedis);
        console.log('Read Object response:');
        console.log(response)
    } catch (err) {
        console.log(err, err.stack);
    }
}