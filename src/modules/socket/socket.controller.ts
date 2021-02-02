import * as Interfaces from '@interfaces';
import * as cron from 'cron';
import * as express from 'express';
import * as helpers from '../../helpers';

const socketHelper = helpers.socketHelper.default;
const CronJob = cron.CronJob;
class SocketController implements Interfaces.Controller {
  public path = '/socket';
  public router = express.Router();
  constructor() {
    console.log('timestamp', new Date().getTime());
    this.cronSendBuySellOrder();
    this.emitallStat();
    // this.test();
  }

  public cronSendBuySellOrder() {
    const cronJob =
     new CronJob('*/60 * * * * *', () => {
       console.log('one minumt');
       socketHelper.sendBuySellTradetoActive();
       // send all data again to all active users irrespective to their pairs subscribed
     },          null, true, 'America/Los_Angeles');
  }


  public emitallStat() {
    const cronJob =
     new CronJob('*/60 * * * * *', () => {
       console.log('one minumt');
       socketHelper.emitAllStat();
       // send all data again to all active users irrespective to their pairs subscribed
     },          null, true, 'America/Los_Angeles');
  }


  public test(){
    //  console.log('pairrrrrrrrrrrrrrrrrrr -> ', process.env.PAIR);
    //  console.log('portttttttttttttttttttt -> ', process.env.PORT);
    // let a: any = JSON.stringify({"v":null,"o":null,"c":null,"h":null,"l":null, "p":1234})
    // a = JSON.parse(a);
    // console.log(a.p);
    // if(a.p != undefined){
    //   // insert new price
    //   a.p = 1234
    // }
  }
}
export default SocketController;
