import * as chai from 'chai';
import 'chai-http';
import 'mocha';
import { Response } from 'superagent';
// tslint:disable-next-line:no-var-requires
chai.use(require('chai-http'));
const expect = chai.expect;
const request = chai.request;
describe('ServerCheck', () => {
  describe('Route GET /status', () => {
    it('Should GET to /status', async () => {
      const res: Response = await request('http://0.0.0.0:8083').get('/status');
      expect(res).to.have.status(200);
    });
  });
});
