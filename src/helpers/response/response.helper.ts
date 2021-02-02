import { RESPONSES } from '../../constant/response';
class ResponseHelper {
  public success(response: any, responseData: any = {}) {
    return response.status(RESPONSES.SUCCESS).send(responseData);
  }
  public error(response: any, responseData: any = {}) {
    return response.status(RESPONSES.BADREQUEST).send(responseData);
  }
}
export default new ResponseHelper();
