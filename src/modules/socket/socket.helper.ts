import { ENDPOINTS, SERVER, RABITMQ } from '../../constant/response';
import * as Helpers from '../../helpers';
import RedisHelper from '../../helpers/common/redis.helper';
import utilities from '../../helpers/common/utilities.helper';
const redisTradingDb = process.env.redisTradingPairDb;
import App from '../../app';
import rabbitmqHelper from '../../helpers/common/rabbitmq.helper';
import { parseConnectionUrl } from 'nodemailer/lib/shared';
const globalVar: any = global;
class SocketHelper {

  /**
   * GET ORDER WITH USER ID AND ORDER ID and PAIR ID
   */
  public async emitBuySell(pair: any, socketId: any) {
    let buyList: any = await RedisHelper.getString('orderBook_' + pair + '_0', redisTradingDb);
    if (buyList) {
      // console.log(buyList);
    } else {
      buyList = [];
    }

    let sellList: any = await RedisHelper.getString('orderBook_' + pair + '_1', redisTradingDb);
    if (sellList) {
      // console.log(sellList);
    } else {
      sellList = [];
    }
    // send data to front server

    globalVar.socketConnection.of('socket').to(socketId).emit('buyOrders', buyList);
    globalVar.socketConnection.of('socket').to(socketId).emit('sellOrders', sellList);

    return true;
  }

  public async emitTradeData(pair: any, socketId: any) {
    let tradeData: any = await RedisHelper.getString('tradeBook_' + pair, redisTradingDb);
    if (tradeData !== null) {
      // exist
    } else {
      tradeData = [];
    }
    await globalVar.socketConnection.of('socket').to(socketId).emit('trades', tradeData);

    // send trade of this user only now

    // this.pushYoursTrade(tradeData, socketId);

    return true;
  }

  public async emitStat(pair: any, socketId: any) {
    let statData: any = await RedisHelper.getString('stat_' + pair, redisTradingDb);
    if (statData) {
      // console.log(statData);
    } else {
      statData = [];
    }
    await globalVar.socketConnection.of('socket').to(socketId).emit('stat_' + pair, statData);
    return true;
  }

  public async emitStatAllPair(pair: any, socketId: any) {
    let newValue: any;
    let allpAir: any = await RedisHelper.getString('pairListing', redisTradingDb);
    // console.log('typeof', typeof(allpAir));
    // console.log('this is all pair datatttttttttttaaaaa', allpAir)
    allpAir = JSON.parse(allpAir);
    // console.log('allpAir-------', allpAir);

    for (let newValue of allpAir) {
      // console.log('this is pair need to get data for stat ---', newValue.pair_key);
      let statData: any = await RedisHelper.getString('stat_' + newValue.pair_key, redisTradingDb);
      if (statData !== null) {
        // console.log('this is data for pair I am going to emit', statData);
        statData = JSON.parse(statData);

        console.log('==>', statData);
        statData.pair = newValue.pair_key;
        statData = JSON.stringify(statData);
        console.log('==>', statData);

      } else {
        statData = [];
      }
      console.log('emmiting stat for pair', newValue.pair_key);
      await globalVar.socketConnection.of('socket').to(socketId).emit('stat_' + newValue.pair_key, statData);
      await globalVar.socketConnection.of('socket').to(socketId).emit('allStat', statData);

    }



    //  Object.entries(allpAir).forEach(
    //   async([key, value]) => {
    //     newValue = '';
    //     newValue = value;
    //     console.log('this is pair need to get data for stat ---', newValue.pair_key);
    //     let statData: any =  await RedisHelper.getString('stat_' + newValue.pair_key , redisTradingDb);
    //     if (statData !== null) {
    //       console.log('this is data for pair I am going to emit', statData);
    //     } else {
    //       statData = [];
    //     }
    //     console.log('emmiting stat for pair', newValue.pair_key);
    //     globalVar.socketConnection.of('socket').to(socketId).emit('stat_' + newValue.pair_key , JSON.stringify(statData));

    //   },
    // );

    // let statData: any = await RedisHelper.getString('stat_' + pair , redisTradingDb);
    // if (statData) {
    //   console.log(statData);
    // } else {
    //   statData = [];
    // }
    // await globalVar.socketConnection.of('socket').to(socketId).emit('stat_' + pair , statData);

    return true;
  }




  public async emitAllStat() {
    let newValue: any;
    let allpAir: any = await RedisHelper.getString('pairListing', redisTradingDb);
    // console.log('typeof', typeof(allpAir));
    // console.log('this is all pair datatttttttttttaaaaa', allpAir)
    allpAir = JSON.parse(allpAir);
    // console.log('allpAir-------', allpAir);

    for (let newValue of allpAir) {
      // console.log('this is pair need to get data for stat ---', newValue.pair_key);
      let statData: any = await RedisHelper.getString('stat_' + newValue.pair_key, redisTradingDb);
      if (statData !== null) {
        // console.log('this is data for pair I am going to emit', statData);
        statData = JSON.parse(statData);
        console.log('==>', statData);
        statData.pair = newValue.pair_key;

        statData = JSON.stringify(statData);

        console.log('==>', statData);

      } else {
        statData = [];
      }
      console.log('emmiting stat for pair', newValue.pair_key);
      await globalVar.socketConnection.of('socket').to(newValue.pair_key).emit('allStat', statData);

    }

    return true;
  }

  public async emitBalances(coin: any, socketId: any, balances: any) {
    console.log('emmiting balance for ', coin);
    await globalVar.socketConnection.of('socket').to(socketId)
      .emit('wallet', { data: JSON.parse((JSON.parse(balances.response).data.response)).data, pair: coin });
    return true;
  }

  public async pushBuySellOrder(data: any) {
    await globalVar.socketConnection.of('socket').to(data[0]).emit('order', ['add', Number(data[1]), data[2]]);
    return true;
  }

  public async pushStat(data: any) {
    // console.log('data', data);
    const responseCheck = await globalVar.socketConnection.of('socket').to(data[0]).emit('stat_' + data[0], data[1]);
    return true;
  }

  public async pushTrades(data: any) {
    await globalVar.socketConnection.of('socket').to(data[0]).emit('trade', data[1]);
    return true;
  }

  public async pushTradesByPOair(data: any) {
    console.log('single traddddddddddddddeeee', data);
    const userId1 = data[0];
    const userId2 = data[1];
    const tradeData = data[2];
    const markeTlimit = data[7];
    const side = data[8];
    const coin = data[6];
    // send trade to pair room
    // console.log('this is single trade data we are sending',  [[Number(tradeData[0]), Number(tradeData[1]), tradeData[2]]]);

    // console.log('00000000000 here am emiting trade for coin ', coin) 
    console.log('pushing data is', [Number(tradeData[0]), Number(tradeData[1]), Number(tradeData[2]), Number(tradeData[3]), tradeData[4], userId1, userId2, markeTlimit, side]);
    await globalVar.socketConnection.of('socket').to(coin).emit('trade', [[Number(tradeData[0]), Number(tradeData[1]), Number(tradeData[2]), Number(tradeData[3]), tradeData[4], userId1, userId2, markeTlimit, side]]);

    console.log('markeTlimit', markeTlimit)
    if (markeTlimit === null || markeTlimit === 'sell') {
      console.log('updating buy order book here -----')
      await this.updateRedisOrdersList(tradeData[0], tradeData[3], 0, '-', coin); // [buyprice, sellprice , executedprice , date]
    }

    if (markeTlimit === null || markeTlimit === 'buy') {
      console.log('updating sell order book here -----')
      await this.updateRedisOrdersList(tradeData[1], tradeData[3], 1, '-', coin);
    }






    // console.log('3333333333  Balance update here ')
    // now find socket id from user id from login user radis server and update raddis cache for balances
    // now get balances and send to users
    if (userId1 != null) {
      await this.balanceUpdateOnTrade(userId1, coin);
    }

    // console.log('444444444444  Balance update here user 2 ')
    if (userId2 != null) {

      await this.balanceUpdateOnTrade(userId2, coin);
    }


    // console.log('55555555555  trade update ')

    await this.updateTradeCache(Number(tradeData[2]), Number(tradeData[3]), tradeData[4], coin, userId1, userId2, side);


    // await rabbitmqHelper.createQueue(RABITMQ.STOPLOSS, JSON.stringify(data));


    await this.updateStatLastPrice(coin, tradeData[2])
    // here need to update executed orice for this price under stat as well


    return true;
  }

  public async pushCancelOrder(data: any) {
    await globalVar.socketConnection.of('socket').to(data[0]).emit('order', ['subtract', Number(data[1]), data[2]]);
    return true;
  }

  public async pushYoursTrade(tradeData: any, socketId: any) {

    // console.log('sending records');
    let activeUsr: any = await Helpers.RedisHelper.getString('loggedinUsers');
    activeUsr = JSON.parse(activeUsr);

    const loginUser = await activeUsr.filter((x: any) => x.userSocketId === socketId);
    // console.log('processing');
  }

  public async pushBalances(data: any) {
    // console.log('pushing balances', data);
    const userId = data[1];
    const coin = data[0];
    const balances = data[2];
    // console.log(balances);
    // console.log(typeof balances);
    // now find socket id from user id from login user radis server and update raddis cache for balances
    let activeUsr: any = await Helpers.RedisHelper.getString('loggedinUsers');
    activeUsr = JSON.parse(activeUsr);

    const loginUser = await activeUsr.filter((x: any) => x.userId === userId);

    if (loginUser.length > 0) {
      let newValue: any;
      await Object.entries(loginUser).forEach(
        ([key, value]) => {
          newValue = value;
          const socketId = newValue.userSocketId;
          globalVar.socketConnection.of('socket').to(socketId)
            .emit('wallet', { data: balances, pair: coin });

        },
      );

      await Helpers.RedisHelper.setString(
        'walletbalance_' + coin + '_' + data.member, JSON.stringify(balances), 1440);
      return true;

    }

    return true;
  }

  // this function sending buy sell data to active users using by cron server
  // this function also find unique pairs from active users send data to them
  public async sendBuySellTradetoActive() {
    // console.log('sending data to users');
    let activeUsr: any = await Helpers.RedisHelper.getString('activeUser');
    activeUsr = JSON.parse(activeUsr);
    const flags = new Set();
    if (activeUsr == null) {
      return false;
    }
    const uniquePairs = await activeUsr.filter((entry: any) => {
      if (flags.has(entry.userPair)) {
        return false;
      }
      flags.add(entry.userPair);
      return true;
    });

    // console.log('thiss is my unique pair', uniquePairs);

    for (const element of uniquePairs) {
      // console.log('getting values for  =====>>>>>', element);
      let buyList: any = await RedisHelper.getString('orderBook_' + element.userPair + '_0', redisTradingDb);
      if (buyList) {
        // console.log('this is my buy order @ CRON' , buyList);
      } else {
        buyList = [];
      }

      let sellList: any = await RedisHelper.getString('orderBook_' + element.userPair + '_1', redisTradingDb);
      if (sellList) {
        // console.log('this is my sell order @ CRON' , sellList);
      } else {
        sellList = [];
      }

      let tradeData: any = await RedisHelper.getString('tradeBook_' + element.userPair, redisTradingDb);
      if (tradeData) {
        // console.log('this is my tradeData order @ CRON' , tradeData);
      } else {
        tradeData = [];
      }
      // console.log('now emmiting to users joined room for ', element.userPair);
      // console.log('here----------------', element.userPair);
      await globalVar.socketConnection.of('socket').to(element.userPair).emit('buyOrders', buyList);
      await globalVar.socketConnection.of('socket').to(element.userPair).emit('sellOrders', sellList);
      await globalVar.socketConnection.of('socket').to(element.userPair).emit('trades', tradeData);

    }
    // console.log('now it getting truuuuu');
    return true;
  }

  public async getBalance(coin: any, jwtToken: any, pairData: any) {
    const getEndpoint = `${ENDPOINTS.WALLET_MAIN_GET_BALANCE}${coin}/get_balance`;
    let getUserInfo: any;
    let tradingHost: any;
    // tradingHost = await this.getWalletHost(pairData);
    // console.log(`Getting wallet balance ${coin} 
    // ##/n
    // ${getEndpoint}
    // ## ${jwtToken}
    // ` );
    getUserInfo = await utilities.curlRequest(
      getEndpoint,
      { 'api-access-token': jwtToken, 'Content-Type': 'application/json' },
    );
    console.log('getUserInfo', getUserInfo);
    if (getUserInfo.statusCode === 200) {
      return getUserInfo;
    }
    return false;
  }

  public async getWalletHost(coin: any) {
    let walletUrl: any = '';

    var process_env_dict: any = {};
    process_env_dict['env'] = process.env;
    walletUrl = JSON.parse(JSON.stringify(process_env_dict))['env']['WALLET_MAIN'];

    console.log('this is wallet host', walletUrl);
    return walletUrl;

  }

  /**
   * UPDATE REDIS SERVER ORDER LIST
   * @param price // pair id
   * @param units // 0 or 1`
   * @param orderType // 0 or 1 (its by price)
   * @param operation // + or -
   */
  public async updateRedisOrdersList(price: number, units: number, orderType: number, operation: string, coin: string) {

    // console.log('-------------------------(', operation ,')-------------------------------')
    console.log(' updating cache --------------', redisTradingDb, 'price --- >', price, '  coin ---> ', coin, ' orderType -----> ', orderType);

    try {
      let openBook: any = [];
      const redisConfig: any = await RedisHelper.getString('orderBook_' + coin + '_' + orderType, redisTradingDb);
      // console.log('cjhexkccccccccccccc', 'orderBook_'  + coin + '_' + orderType);
      // console.log('here updating redis cache ', redisConfig);
      if (redisConfig !== null || redisConfig.length > 0) {
        // console.log('li0st exist');
        openBook = JSON.parse(redisConfig);
        const priceObj = await openBook.filter((e: any) => e[0] === Number(price));
        let amt = 0;
        if (priceObj.length > 0) {
          if (operation === '+') {
            amt = await utilities.bn_operations(priceObj[0][1], units, '+');
          } else {
            amt = await utilities.bn_operations(priceObj[0][1], units, '-');
          }
          const newObj = [
            Number(price),
            Number(amt),
            Number(utilities.bn_operations(amt, price, '*')),
          ];
          const index = await openBook.findIndex((e: any) => e[0] === Number(price));
          if (Number(amt) <= 0) {
            openBook.splice(index, 1);
          } else {
            openBook[index] = newObj;
          }

          // console.log('before saving ------------', openBook);

          RedisHelper.setString('orderBook_' + coin + '_' + orderType, JSON.stringify(openBook), 0, redisTradingDb);

          console.log('updateddddddddd');
        } else {
          // this price you are searching is not available
          console.log('this price you are searching is not available');

        }

        // console.log('openBook', openBook);

      } else {
        console.log('here no any new order just coming here to minus the balance after trade');
      }
      return true; // just for next

    } catch (error) {
      console.log('errrrorororororo', error);
      return true; // just for next

    }

  }

  public async updateTradeCache(price: any, amount: any, date: any, pairId: any, fromUid: any, toUid: any, side: any) {
    let currentTrade: any = await RedisHelper.getString('tradeBook_' + pairId);

    currentTrade = JSON.parse(currentTrade);
    // console.log('this is current trade i got ', currentTrade);

    const tradeBook: any = [];
    // console.log('----------- trade Book --------------');
    if (currentTrade == null || currentTrade.length == 0) {
      // add queue to trade
      await tradeBook.push([Number(price), Number(amount), date, fromUid, toUid, side]);



      await RedisHelper.setString('tradeBook_' + pairId, JSON.stringify(tradeBook), 0, redisTradingDb);


    } else {
      // console.log('this is current ordrer', currentTrade);
      currentTrade = await currentTrade.reverse();
      // console.log('this is current ordrer after reverse', currentTrade);

      await currentTrade.push([Number(price), Number(amount), date, fromUid, toUid, side]);

      // console.log('after push data is ', currentTrade);
      const lengthArr = currentTrade.length;

      if (lengthArr > 50) {
        currentTrade = currentTrade.slice(lengthArr - 50, lengthArr);
        // console.log('after slice ', currentTrade);
      }

      currentTrade = await currentTrade.reverse();

      // console.log('again reverse ---------- ', currentTrade)

      // console.log('this is current ordrer after ddddddd after push', currentTrade);

      // console.log('this is current ordrer 2', currentTrade);
      // now update redis server for trade cache
      await RedisHelper.setString('tradeBook_' + pairId, JSON.stringify(currentTrade), 0, redisTradingDb);
    }
    return true
  }

  public async balanceUpdateOnTrade(userId: any, pairCoin: any) {
    console.log('this is my user id ', userId);
    // console.log('after trade updating balances');
    console.log("Sending Balances");
    const token: any = await RedisHelper.getString('jwt_token_' + userId, '0');
    console.log('this is my token', token);
    const pair = pairCoin.split(/[_]/);
    const fromcoin = pair[0];
    const tocoin = pair[1];

    if (token !== null) {
      const getUserInfoFirst = await this.getBalance(fromcoin, token, pairCoin);
      const getUserInfoSecond = await this.getBalance(tocoin, token, pairCoin);

      if (getUserInfoFirst.response === undefined) {
        return false;
      }

      let fUserResponse = getUserInfoFirst.response;
      let SUserResponse = getUserInfoSecond.response;

      if (typeof getUserInfoFirst.response === 'string') {
        fUserResponse = JSON.parse(getUserInfoFirst.response);
      }
      if (typeof getUserInfoSecond.response === 'string') {
        SUserResponse = JSON.parse(getUserInfoSecond.response);
      }

      // console.log(typeof fUserResponse);
      // console.log(typeof SUserResponse);
      // console.log(typeof SUserResponse.data);
      // console.log(typeof fUserResponse.data);
      if (getUserInfoFirst !== false) {
        await this.pushBalances([fromcoin, userId, fUserResponse.data]);

      }



      if (getUserInfoSecond !== false) {
        await this.pushBalances([tocoin, userId, SUserResponse.data]);
      }
    }
    return true

  }

  public async updateStatLastPrice(pair: string, price: number) {

    // console.log(' updating stat hereeee now for price cccccccccccccccccc = ', price);
    let statData: any = await RedisHelper.getString('stat_' + pair, redisTradingDb);
    if (statData != null) {
      // let statNewData: any = await JSON.stringify(statData)
      let statNewData = await JSON.parse(statData);
      // console.log('checkkkk hererer', statNewData);
      console.log(statNewData.p);
      if (statNewData.p != undefined) {
        // insert new price it can b single but need to check in future
        statNewData.p = price
      } else {
        statNewData.p = price
      }
      // console.log('new stat data going to place ', statNewData)
      await RedisHelper.setString('stat_' + pair, JSON.stringify(statNewData), 0, redisTradingDb);

    }
    return true;

  }


  public async pushDeposits(data: any) {
    // console.log('pushing balances', data);
    const userId = data.member_id;
    console.log('will send desposits for userid', userId)
    // console.log(balances);
    // console.log(typeof balances);
    // now find socket id from user id from login user radis server and update raddis cache for balances
    let activeUsr: any = await Helpers.RedisHelper.getString('loggedinUsers');
    activeUsr = JSON.parse(activeUsr);

    const loginUser = await activeUsr.filter((x: any) => x.userId === userId);

    if (loginUser.length > 0) {
      let newValue: any;
      await Object.entries(loginUser).forEach(
        ([key, value]) => {
          newValue = value;
          const socketId = newValue.userSocketId;
          globalVar.socketConnection.of('socket').to(socketId)
            .emit('updateDeposits', { data: true });

        },
      );

    }

    return true;
  }

}

export default new SocketHelper();
