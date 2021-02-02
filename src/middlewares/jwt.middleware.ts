
import * as Interfaces from '@interfaces';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { MIDDLEWARE_RESPONSE } from '../constant/response';
import * as Helpers from '../helpers';
declare module 'express' {
    interface Request {
      userInfo: any;
    }
}
const setResponse = Helpers.ResponseHelper;

function validateToken(request: Request, response: Response, next: NextFunction) {
  const token = request.body.accessToken || request.query.accessToken || request.headers['api-access-token'];
  // console.log(token);
  jwt.verify(token, process.env.JWTSECRET, async (err: any, decoded: any) => {
    if (err) {
      return setResponse.error(response, err.message);
    }
    try {
      const exist = await Helpers.RedisHelper.getString('jwt_token_' + decoded.jwtData);
      console.log('exist', exist);
        // check if token exist or not
      if (exist != null) {
        request.userInfo = decoded;
        next();
      } else {
        return setResponse.error(response, MIDDLEWARE_RESPONSE.JWTERROR);
      }
    } catch (error) {
      return setResponse.error(response, MIDDLEWARE_RESPONSE.JWTERROR);

    }
  });
}

export default validateToken;
