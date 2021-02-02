// Author : Navjeet Singh
// Date : 14-june-2019
// Purpose : Test all possible end points for user section.

import * as chai from 'chai';
import 'chai-http';
import 'mocha';
import { Response } from 'superagent';
// tslint:disable-next-line:no-var-requires
chai.use(require('chai-http'));
const expect = chai.expect;
const request = chai.request;
// It will test all possible end points for user module.
describe('User Endpoints Testcases', () => {
  // This will post dummy login detials to login end point and expect it to give success.
  it('Should login the user', async () => {
    const res: Response = await request('http://0.0.0.0:8083').post('/user/login').send({
      email : 'testuser1@mailinator.com',
      password : 'testpassword',
    });
    expect(res).to.have.status(200);
  });
});
