
import { TradepairInterface } from '@modules/tradepair/tradepair.interface';
import { Request } from 'express';

interface RequestWithUser extends Request {
  trading: TradepairInterface;
}

export default RequestWithUser;
