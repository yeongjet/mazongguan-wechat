import { RedisClient } from '@mazongguan-common/client';

const config = {
    host: '192.168.1.161',
    port: 6379
};

beforeEach((done) => {
    RedisClient.create(config)
    done()
});

afterAll(async () => {
    RedisClient.getInstance().disconnect()
});

test('should set success', async (done) => {
    let result = await RedisClient.getInstance().set('foo', 'bar')
    await RedisClient.getInstance().del('foo')
    expect(result).toEqual('OK')
    done()
});
