
import BigNumber from 'bignumber.js';
import * as request from 'request';
import { BIGNUMBER } from '../../constant/response';

const saltRounds = 10;

class UtilitiesHelper {

  public async curlRequest(endpoint: string, header: object, data: any = '', rType: string = 'GET') {
    // console.log(endpoint);
    // console.log(data);
    return new Promise((resolve, reject) => {
      const options = {
        url: endpoint,
        // tslint:disable-next-line:object-shorthand-properties-first
        data,
        headers: header,
      };

      try {
        if (rType === 'GET') {
          request.get(options, (error, response, body) => {
            if (error) {
              reject(error);
            }
            const obj = {
              statusCode: (response) ? response.statusCode : 0,
              response: body,
            };
            resolve(obj);
          });
        }
        if (rType === 'POST') {
          const sendData = JSON.stringify(data);
          const options1 = {
            url: endpoint,
            // tslint:disable-next-line:object-shorthand-properties-first
            body:sendData,
            headers: header,
          };
          request.post(options1, (error, response, body) => {
            if (error) {
              console.log('post error', error);
              reject(error);
            }
            const obj = {
              statusCode: (response) ? response.statusCode : 0,
              response: body,
            };
            resolve(obj);
          });
        }
      } catch (error) {
        console.log('error curl', error);
        reject(error);
      }
    });
  }

  public bn_operations(firstParams: any, secondParams: any, operation: any) {
    const a: any = new BigNumber(firstParams.toString());
    const b: any = new BigNumber(secondParams.toString());
    switch (operation.toLowerCase()) {
      case '-':
        return a.minus(b).toString();
        break;
      case '+':
        return a.plus(b).toString();
        break;
      case '*':
      case 'x':
        return a.multipliedBy(b).toString();
        break;
      case '÷':
      case '/':
        return a.dividedBy(b).toString();
        break;
      case '>=':
        return a.isGreaterThanOrEqualTo(b);
        break;
      case '>':
        return a.isGreaterThan(b);
        break;
      case '<=':
        return a.isLessThanOrEqualTo(b);
        break;
      case '<':
        return a.isLessThan(b);
        break;
      case '==':
        return a.isEqualTo(b);
        break;
      default:
        break;
    }
  }

  public convert_to_bn(value: any) {
    const x = new BigNumber(value);
    const y = new BigNumber(BIGNUMBER.SMALLESTUNIT);
    return x.multipliedBy(y).toNumber();
  }

}
export default new UtilitiesHelper();
