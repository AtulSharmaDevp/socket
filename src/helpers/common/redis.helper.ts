import * as redis from 'redis';
class RedisHelper {
  public client: redis.RedisClient;
  private host: any = process.env.REDIS_HOSTNAME;
  private port: string = process.env.REDIS_PORT;
  private auth: string = process.env.REDIS_AUTH;
  private redisObj: any = redis;
  constructor() {
    this.client = redis.createClient(this.port, this.host);
    this.client.auth(this.auth);
    this.client.on('connect', () => {
      console.log('Redis Connected');
    });
  }
  // Set String value for given key
  // Note expires time secounds
  public async setString(key: string, value: string, expires: number= 0, database: string = '') {
    if (database !== '') {
      this.client.select(database);
    }
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (err, reply) => {
        if (err) {
          return reject(err);
        }
        // Add Expire Time if provided
        if (expires !== 0) {
          this.client.expire(key, (expires * 60));
        }
        resolve(reply);
      });
    });
  }
  // Get String value for given key
  public async getString(key: string,  database: string = '0') {
    if (database !== '') {
      this.client.select(database);
    }
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
  public async destroyDb(dbKey: string) {
    return new Promise((resolve, reject) => {
      this.client.del('dbKey', (err, response) => {
        if (response === 1) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

}
export default new RedisHelper();
