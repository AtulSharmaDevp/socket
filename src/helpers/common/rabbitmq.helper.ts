import * as amqp from 'amqplib/callback_api';
import { RABITMQ } from '../../constant/response';
import { socketHelper, Utilities } from '../../helpers';

class RabbitMq {
  public channel: any;

  constructor() {
    console.log('Rabbit mq working here');
    this.startServer();
  }
  public async startServer() {
    await this.connect().then(
      (res: any) => {
        this.channel = res;

        this.assertQueue(RABITMQ.CANCELORDER);
        this.assertQueue(RABITMQ.NEWORDER);
        this.assertQueue(RABITMQ.UPDATE_DESPOSIT);
        this.assertQueue(RABITMQ.TRADE_BASE);

        this.assertQueue(RABITMQ.SETORDER_POSITIONS);

        this.assertQueue(RABITMQ.UPDATEBALANCE);
        this.assertQueue(RABITMQ.STAT);

        this.pairStart();
        this.getBuySellOrder();
        this.orderCancel();
        this.updateBalance();

        this.getStat();
        this.getDesposits(); // it will auto sync all depsoits to users

      },
      (error: any) => {
        return error;
      });
  }
  public async connect() {
    return new Promise((resolve, reject) => {
      console.log('Going to connect -----------', process.env.RabbitMq);
      amqp.connect(process.env.RabbitMq, async (err, conn) => {
        if (err) {
          console.log('connection error', err);
          reject(err);
        }
        conn.createChannel(async (eror, ch) => {
          if (eror) {
            console.log('connection stringg error', eror)
            reject(eror);
          }
          resolve(ch);

        });
      });
    });
  }

  public async pairStart() {

    let newconn = await this.channel.consume(
      RABITMQ.TRADE_BASE, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        console.log(`New trade in ${RABITMQ.TRADE_BASE}`, data);
        const resp: any = await socketHelper.default.pushTradesByPOair(data.data);
        if (resp === true) {
          this.channel.ack(msg);
        }
      },
      { noAck: false });

  }

  public assertQueue(queue: string) {
    this.channel.assertQueue(queue, { durable: false });
  }
  public async consumeQueue(queue: string) {

    this.channel.consume(
      queue, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        this.channel.ack(msg);
        return data;
      },
      { noAck: false });
  }

  public async getStat() {
    this.channel.consume(
      RABITMQ.STAT, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        const resp: any = await socketHelper.default.pushStat(data);
        if (resp === true) {
          this.channel.ack(msg);
        }
      },
      { noAck: false });
  }

  public async getBuySellOrder() {
    this.channel.consume(
      RABITMQ.NEWORDER, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        const resp: any = await socketHelper.default.pushBuySellOrder(data);
        if (resp === true) {
          this.channel.ack(msg);
        }
      },
      { noAck: false });
  }


  public async updateBalance() {
    this.channel.consume(
      RABITMQ.UPDATEBALANCE, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        console.log("#######################################UPDATE BALANCE############");
        console.log(data);
        console.log(typeof data[2]);
        data[2] = JSON.parse(data[2].response).data;
        const resp: any = await socketHelper.default.pushBalances(data);
        if (resp === true) {
          this.channel.ack(msg);
        }
      },
      { noAck: false });
  }

  public async orderCancel() {
    this.channel.consume(
      RABITMQ.CANCELORDER, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        const resp: any = await socketHelper.default.pushCancelOrder(data);
        if (resp === true) {
          this.channel.ack(msg);
        }
      },
      { noAck: false });
  }

  public async getDesposits() {
    this.channel.consume(
      RABITMQ.UPDATE_DESPOSIT, async (msg: any) => {
        const data = JSON.parse(msg.content.toString());
        const resp: any = await socketHelper.default.pushDeposits(data);
        if (resp === true) {
          this.channel.ack(msg);
        }
      },
      { noAck: false });
  }

  public createQueue(queue: string, data: any) {
    this.channel.sendToQueue(queue, Buffer.from(data));
  }


}
export default new RabbitMq();
