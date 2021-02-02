import * as Helpers from "../../helpers";
const globalVar: any = global;

class PriceSocketHelper {
  private buySellEnabled: boolean =
    typeof process.env.BUYSELL_ENABLED !== "undefined" &&
    process.env.BUYSELL_ENABLED === "yes"
      ? true
      : false;
  private buySellService: string = process.env.BUY_SELL;
  private isLoaded: boolean = false;
  private buySellPairs: any = [];
  private mapPairToRedis: any = [];
  constructor() {
    this.startPriceSocket();
  }
  public startPriceSocket() {
    if (this.isLoaded) {
      console.log("In const+++++++++++++++++++", this.buySellEnabled);
      if (this.buySellEnabled) {
        this.getPairList()
          .then(async data => {
            await this.sendPriceUpdates();
          })
          .catch(error => {
            console.log("Error ! WHILE GETTING PAIR LIST");
            console.log(error);
            setTimeout(() => {
              this.startPriceSocket();
            }, 3000);
          });
      }
    } else {
      setTimeout(() => {
        this.isHelpersLoaded();
        this.startPriceSocket();
      });
    }
  }

  public isHelpersLoaded() {
    try {
      this.isLoaded =
        typeof Helpers.Utilities.curlRequest === "function"
          ? true
          : this.isLoaded;
    } catch (error) {
      console.log("Helpers not loaded error ::", error);
    }
  }

  public async getPairList() {
    const activeCoins: any = await Helpers.Utilities.curlRequest(
      `${this.buySellService}/buysell/trading/getactivecoins`,
      { "content-Type": "application/json" }
    );
    if (activeCoins.statusCode === 200) {
      for (const currency of JSON.parse(activeCoins.response).data) {
        console.log("Get pairs");
        await this.saveCurrencyPairs(currency.currency_id);
      }
    }
    return true;
  }

  public async saveCurrencyPairs(currencyId: string) {
    const pairs: any = await Helpers.Utilities.curlRequest(
      `${this.buySellService}/buysell/trading/getPairs/${currencyId}`,
      { "content-Type": "application/json" }
    );
    if (pairs.statusCode === 200) {
      for (const pair of JSON.parse(pairs.response).data) {
        this.buySellPairs.push(pair.api_pair);
      }
    }
  }

  public async subscribePair(pair: any, socketId: string) {
    let pairList: any = await Helpers.RedisHelper.getString(
      `buysell_price_socket_list_${pair}`
    );
    pairList = pairList === null ? [] : JSON.parse(pairList);
    if (pairList.includes(socketId)) {
      console.log("SocketId Exits already");
      return false;
    }
    console.log("Adding socket....");
    pairList.push(socketId);
    console.log(pairList);
    await Helpers.RedisHelper.setString(
      `buysell_price_socket_list_${pair}`,
      JSON.stringify(pairList),
      0,
      "0"
    );
  }
  public async unsubscribePair(pair: any, socketId: string) {
    console.log(pair, socketId);
    let pairList: any = await Helpers.RedisHelper.getString(
      `buysell_price_socket_list_${pair}`
    );
    if (pairList !== null && pairList.includes(socketId)) {
      pairList = JSON.parse(pairList);
      pairList.splice(pairList.indexOf(socketId), 1);
      await Helpers.RedisHelper.setString(
        `buysell_price_socket_list_${pair}`,
        JSON.stringify(pairList),
        0,
        "0"
      );
    }
  }
  public async sendPriceUpdates() {
    setInterval(async () => {
      for (const pair of this.buySellPairs) {
        console.log('buySellPairs ===>',pair);
        let priceObject: any = null;
        if (typeof this.mapPairToRedis[pair] !== "undefined") {
          console.log('comes in if mappair',this.mapPairToRedis[pair]);
          // console.log(this.mapPairToRedis[pair].key);
          priceObject = await Helpers.RedisHelper.getString(
            this.mapPairToRedis[pair].key
          );
        } else {
          const options: any = this.getPriceKeys(pair);
          console.log('in options ===>',options);
          priceObject = await Helpers.RedisHelper.getString(
            `buysell_price_${options[0]}`
          );
          if (priceObject === null) {
            priceObject = await Helpers.RedisHelper.getString(
              `buysell_price_${options[1]}`
            );
            this.mapPairToRedis[pair] = { key: `buysell_price_${options[1]}` };
          } else {
            this.mapPairToRedis[pair] = { key: `buysell_price_${options[0]}` };
          }
        }
        console.log("pair geting from socket server ==>",pair, priceObject);
        await this.sendPriceUpdatesToConnectedSocket(pair, priceObject);
      }
    }, 2000);
  }

  public async sendPriceUpdatesToConnectedSocket(pair: string, price: string) {
    if (price === null) {
      console.log("Price is NULL" + pair);
      return;
    }
    const prices: any = price.split(",");
    let pairList: any = await Helpers.RedisHelper.getString(
      `buysell_price_socket_list_${pair}`
    );
    pairList = pairList === null ? [] : JSON.parse(pairList);
    // for (const socketId of pairList) {
    //   globalVar.socketConnection.of('socket').to(socketId).emit(
    //     'buysell_price_update', { pair , price :  { buyPrice : prices[0], sellPrice : prices[1] } });
    // }

    globalVar.socketConnection
      .of("socket")
      .to(pair)
      .emit("buysell_price_update", {
        pair,
        price: { buyPrice: prices[0], sellPrice: prices[1] }
      });

    // globalVar.socketConnection.of('socket').to(socketId).emit('buyOrders', buyList);
  }

  public getPriceKeys(pair: string) {
    const currencies: any = pair.split("-");
    return [
      `${currencies[0]}_${currencies[1]}`,
      `${currencies[1]}_${currencies[0]}`
    ];
  }
  /**
   * unsubscribe all pairs.
   * @param socketId
   */
  public async unsubscribeAll(socketId: string) {
    console.log(`unsubscribeAll ${socketId}`);
    for (const pair of this.buySellPairs) {
      console.log(`PAIR ${pair}`);
      await this.unsubscribePair(pair, socketId);
    }
  }
}
export default new PriceSocketHelper();
