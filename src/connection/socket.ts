// require('./globalfunctions');
import { ENDPOINTS, SERVER } from "../constant/response";
import * as Helpers from "../helpers";
import * as jwt from "jsonwebtoken";
const socketHelper = Helpers.socketHelper.default;
const utilities = Helpers.Utilities;
const globalData: any = global;

globalData.member = "";
globalData.userSocket = {};

module.exports = async (io: any) => {
  // console.log(io);
  io.of("socket").on("connection", async (socket: any) => {
    console.log("user connected");
    /**
     * Function to set value of global userPair variable
     * @param
     * @return 'empty'
     * @author atul sharma
     * @since 25-april-2019
     */
    socket.on("currentPair", async (data: any) => {
      if (data.data !== "undefined") {
        // console.log("emitttttttttttttttttttttttttttttt ", data);
        // console.log("emitttttttttttttttttttttttttttttt ", socket.id);

        // delete socket id if exist from both active user and logged in user
        // console.log('going to delete ------------------->>>>>>');
        await deleteSocketIfExist(socket, data.pair, socket.id);
        // console.log('coming after delete ------------------->>>>>>');

        socket.join(data.pair); // created a room
        const activeUsers: any = [];
        let activeUsrss: any = await Helpers.RedisHelper.getString(
          "activeUser"
        );
        if (activeUsrss !== null) {
          activeUsrss = JSON.parse(activeUsrss);
          // console.log('activeUsrssactiveUsrssactiveUsrss', activeUsrss);
          await activeUsrss.push({
            userSocketId: socket.id,
            userPair: data.pair
          });
          await Helpers.RedisHelper.setString(
            "activeUser",
            JSON.stringify(activeUsrss),
            1440
          );
        } else {
          await activeUsers.push({
            userSocketId: socket.id,
            userPair: data.pair
          });
          await Helpers.RedisHelper.setString(
            "activeUser",
            JSON.stringify(activeUsers),
            1440
          );
        }

        if (data.member !== 0) {
          console.log("data.member !== 0 ", socket.id);
          let member_id: any = "";
          const logedinUser: any = [];
          let logedinUserss: any = await Helpers.RedisHelper.getString(
            "loggedinUsers"
          );
          if (logedinUserss !== null) {
            logedinUserss = JSON.parse(logedinUserss);

            // console.log('loginnnnnUsrssactiveUsrssactiveUsrss', logedinUserss);

            member_id = await jwt.verify(
              data.member,
              process.env.JWTSECRET,
              async (err: any, decoded: any) => {
                if (err) {
                  console.log(
                    "error while decoding user token under socket connection"
                  );
                  return false;
                }
                console.log("After decode", decoded);
                console.log("data.member", data.member);
                return decoded.jwtData;
              }
            );
            console.log("member_id", member_id);
            await logedinUserss.push({
              userSocketId: socket.id,
              userPair: data.pair,
              userId: member_id
            });
            await Helpers.RedisHelper.setString(
              "loggedinUsers",
              JSON.stringify(logedinUserss),
              1440
            );
          } else {
            await logedinUser.push({
              userSocketId: socket.id,
              userPair: data.pair,
              userId: member_id
            });
            await Helpers.RedisHelper.setString(
              "loggedinUsers",
              JSON.stringify(logedinUser),
              1440
            );
          }

          // console.log('stat data',data)
          const pair = data.pair.split(/[_]/);
          const fromcoin = pair[0];
          const tocoin = pair[1];
          await socketHelper.balanceUpdateOnTrade(member_id, data.pair);
          /** 
          console.log(fromcoin);
          console.log(tocoin);

          const getUserInfoFirst = await Helpers.socketHelper.default.getBalance(fromcoin, data.accessToken,  data.pair);
          const getUserInfoSecond = await Helpers.socketHelper.default.getBalance(tocoin, data.accessToken,  data.pair);

          console.log('this is wallet balances firstttt coin btc ', getUserInfoFirst.response);
          if (getUserInfoFirst.response !== undefined) {
            // tslint:disable-next-line:max-line-length
            await Helpers.RedisHelper.setString('walletbalance_' + fromcoin + '_' + data.member, JSON.stringify(JSON.parse(getUserInfoFirst.response).data), 1440);
          }

          console.log('this is wallet balances firstttt coin second ', getUserInfoSecond.response);

          if (getUserInfoSecond.response !== undefined) {
            // tslint:disable-next-line:max-line-length
            await Helpers.RedisHelper.setString('walletbalance_' + tocoin + '_' + data.member, JSON.stringify(JSON.parse(getUserInfoSecond.response).data), 1440);
          }

          if (getUserInfoFirst !== false) {
            await socketHelper.emitBalances(fromcoin, socket.id, getUserInfoFirst);
          }

          if (getUserInfoSecond !== false) {
            await socketHelper.emitBalances(tocoin, socket.id, getUserInfoSecond);
          }
          // await socketHelper.emitBalances(data.pair, socket.id, getUserInfoSecond);

          // console.log('FIRST', getUserInfoFirst);
          // console.log('SECOND', getUserInfoSecond);
          */
        }
        console.log("1111111111111111111111");
        socketHelper.emitBuySell(data.pair, socket.id);
        console.log("222222222222222222222");
        socketHelper.emitTradeData(data.pair, socket.id);
        console.log("333333333333333333333");
        // socketHelper.emitStat(data.pair, socket.id);
        socketHelper.emitStatAllPair(data.pair, socket.id);
        console.log("4444444444444444444444");
        // await Helpers.RedisHelper.destroyDb('activeUser');
      }
    });
    /**
     * Function to empty global activeUsers variable in disconnetion
     * @param
     * @return 'empty'
     * @author Atul Sharma
     * @since 25-april-2019
     */

    socket.on("disconnect", async () => {
      console.log("Socket Discounted");
      if (
        typeof process.env.BUYSELL_ENABLED !== "undefined" &&
        process.env.BUYSELL_ENABLED === "yes"
      ) {
        console.log(
          "UNSC+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
        );
        await Helpers.PriceSocketHelper.default.unsubscribeAll(socket.id);
      }
      let activeUsr: any = await Helpers.RedisHelper.getString("activeUser");
      activeUsr = JSON.parse(activeUsr);
      if (activeUsr == null) {
        return false;
      }
      activeUsr = activeUsr.filter((x: any) => x.userSocketId !== socket.id);
      await Helpers.RedisHelper.setString(
        "activeUser",
        JSON.stringify(activeUsr),
        1440
      );

      let loginUser: any = await Helpers.RedisHelper.getString("loggedinUsers");
      loginUser = JSON.parse(loginUser);
      loginUser = loginUser.filter((x: any) => x.userSocketId !== socket.id);
      await Helpers.RedisHelper.setString(
        "loggedinUsers",
        JSON.stringify(loginUser),
        1440
      );
    });
    // Buy/Sell price update
    socket.on("subscribe_buysell_price_update", async (data: any) => {
      console.log("SOKCET ID SUBSCRIBE" + socket.id + ` ${data}`);
      console.log(data);
      //const rooms = io.sockets.adapter.sids[socket.id];
      //for (const room of rooms) {
      //socket.leave(rooms);
      //}
      // var clients = io.sockets.clients();
      // var clients = io.sockets.clients('room'); // all users from room `room`
      socket.join(data);
      setTimeout(async () => {
        await Helpers.PriceSocketHelper.default.subscribePair(data, socket.id);
      }, 2000);
    });
    socket.on("unsubscribe_buysell_price_update", (data: any) => {
      socket.leave(data);
      Helpers.PriceSocketHelper.default.unsubscribePair(data, socket.id);
    });
    // Buy/Sell price update end...
  });
};

async function deleteSocketIfExist(socket: any, pair: any, sid: any) {
  // console.log('coming here to delete this socket id ----------', sid);

  let activeUsr: any = await Helpers.RedisHelper.getString("activeUser");
  if (activeUsr == null) {
    await Helpers.RedisHelper.setString("activeUser", JSON.stringify([]), 1440);
  }

  let loginUser: any = await Helpers.RedisHelper.getString("loggedinUsers");
  if (loginUser == null) {
    await Helpers.RedisHelper.setString(
      "loggedinUsers",
      JSON.stringify([]),
      1440
    );
  }

  // STEP 1 : check if user exist in active user

  if (activeUsr !== null) {
    // then find user in active user
    activeUsr = JSON.parse(activeUsr);
    // console.log('an this is my active users', activeUsr);
    const activeUsrExist = await activeUsr.filter(
      (x: any) => x.userSocketId !== sid
    );
    if (activeUsrExist.length > 0) {
      // console.log('this is remaing userssssss' , activeUsrExist);
      await Helpers.RedisHelper.setString(
        "activeUser",
        JSON.stringify(activeUsrExist),
        1440
      );
      // Now update active users cache with new one
    } else {
      await Helpers.RedisHelper.setString(
        "activeUser",
        JSON.stringify([]),
        1440
      );
    }
    const existUserData = await activeUsr.filter(
      (x: any) => x.userSocketId === sid
    );
    if (existUserData.length > 0) {
      let newValue: any;
      await Object.entries(existUserData).forEach(([key, value]) => {
        newValue = value;
        const userPair = newValue.userPair;
        if (userPair !== pair) {
          // console.log('leavingggggggg rooom  for active user ', userPair);
          socket.leave(userPair); // created a room
        }
      });
    }
  }

  if (loginUser !== null) {
    // then find user in active user
    loginUser = JSON.parse(loginUser);
    const loginUserUsrExist = await loginUser.filter(
      (x: any) => x.userSocketId !== sid
    );
    if (loginUserUsrExist.length > 0) {
      await Helpers.RedisHelper.setString(
        "loggedinUsers",
        JSON.stringify(loginUserUsrExist),
        1440
      );
      // Now update active users cache with new one
    } else {
      await Helpers.RedisHelper.setString(
        "loggedinUsers",
        JSON.stringify([]),
        1440
      );
    }
    const existUserDataLogin = await loginUser.filter(
      (x: any) => x.userSocketId === sid
    );
    if (existUserDataLogin.length > 0) {
      let newValue: any;
      await Object.entries(existUserDataLogin).forEach(([key, value]) => {
        newValue = value;
        const userPair = newValue.userPair;
        if (userPair !== pair) {
          // console.log('leavingggggggg rooom  for login user ', userPair);
          socket.leave(userPair); // created a room
        }
      });
    }
  }

  // console.log(sid);
  // let activeUsr: any = await Helpers.RedisHelper.getString('activeUser');
  // activeUsr = JSON.parse(activeUsr);

  // console.log('this is my active users at this time ---------------> ', activeUsr);
  // if (activeUsr == null) {
  //   await Helpers.RedisHelper.setString('activeUser', JSON.stringify([]), 1440);
  //   let loginUser: any = await Helpers.RedisHelper.getString('loggedinUsers');
  //   if (loginUser !== null) {
  //     loginUser = JSON.parse(loginUser);
  //     loginUser = loginUser.filter((x: any) => x.userSocketId !== sid);
  //     // if (activeUsrExist.length > 0) {
  //     //   await Helpers.RedisHelper.setString('loggedinUsers', JSON.stringify(loginUser), 1440);
  //     // } else {
  //     //   await Helpers.RedisHelper.setString('loggedinUsers', JSON.stringify([]), 1440);
  //     // }
  //   } else {
  //     await Helpers.RedisHelper.setString('loggedinUsers', JSON.stringify([]), 1440);
  //   }

  //   return true;
  // }
  // const activeUsrExist = activeUsr.filter((x: any) => x.userSocketId !== sid);

  // // exist than found socket id
  // const existUserData = activeUsr.filter((x: any) => x.userSocketId === sid);
  // console.log('activeUsrExist -------remaining----------', activeUsrExist , '---- lebnhtgetg ', activeUsrExist.length);
  // if (activeUsrExist.length > 0) {

  //   await Helpers.RedisHelper.setString('activeUser', JSON.stringify(activeUsrExist), 1440);

  //   let loginUser: any = await Helpers.RedisHelper.getString('loggedinUsers');
  //   if (loginUser !== null) {
  //     loginUser = JSON.parse(loginUser);
  //     loginUser = loginUser.filter((x: any) => x.userSocketId !== sid);
  //     if (activeUsrExist.length > 0) {
  //       await Helpers.RedisHelper.setString('loggedinUsers', JSON.stringify(loginUser), 1440);
  //     } else {
  //       await Helpers.RedisHelper.setString('loggedinUsers', JSON.stringify([]), 1440);
  //     }
  //   } else {
  //     await Helpers.RedisHelper.setString('loggedinUsers', JSON.stringify([]), 1440);
  //   }

  // } else {
  //   await Helpers.RedisHelper.setString('activeUser', JSON.stringify([]), 1440);
  // }

  // if (existUserData.length > 0) {
  //   let newValue: any;
  //   await Object.entries(existUserData).forEach(
  //     ([key, value]) => {
  //       newValue = value;
  //       const userPair = newValue.userPair;
  //       if (userPair !== pair) {
  //         console.log('leavingggggggg rooom  for ', pair);
  //         socket.leave(pair); // created a room
  //       }
  //     },
  //   );
  // }

  return true;
}
