export const RESPONSES = {
  SUCCESS: 200,
  CREATED:201,
  ACCEPTED:202,
  NOCONTENT:204,
  BADREQUEST: 400,
  FORBIDDEN:403,
  NOTFOUND:404,
  TIMEOUT:408,
  TOOMANYREQ:429,
  INTERNALSERVER:500,
  BADGATEWAYS:502,
  SERVICEUNAVILABLE:503,
  GATEWAYTIMEOUT:504,
};

export const RES_MSG = {
  INSERT:'Data saved successfully',
  ORDER_LIST: ' order List',
  ERROR: 'An error has been occured',
  ORDER:{
    ERROR: 'An error has been occured while placing order',
  },
};

export const MIDDLEWARE_RESPONSE = {
  JWTERROR: 'Unauthorize Request',
};

export const BIGNUMBER = {
  SMALLESTUNIT: 10000000,
};

export const RABITMQ = {
  NEWORDER: 'newOrder',
  STAT: 'stat',
  CANCELORDER: 'cancelOrder',
  
  TRADE_ZFLBCH : '',
  TRADE_ZFLLTC : '',

  TRADE_BTCBCH:'trade_fire_btc_bch',
  TRADE_BTCLTC:'trade_fire_btc_ltc',
  TRADE_BTCETH:'trade_fire_btc_eth',
  TRADE_BTCAPOLLO:'trade_fire_btc_apl',
  TRADE_BTCUSD:'trade_fire_btc_usd',
  TRADE_BTCZAR:'trade_fire_btc_zar',
  TRADE_BTCDRC:'trade_fire_btc_drc',
  UPDATE_DESPOSIT:'updateDeposits',

  TRADE_BTCZFL:'',

  TRADE_ETHBCH:'trade_fire_eth_bch',
  TRADE_ETHLTC:'trade_fire_eth_ltc',
  TRADE_ETHAPOLLO:'trade_fire_eth_apl',
  TRADE_ETHZFL: '',
  TRADE_ETHUSD:'trade_fire_eth_usd',
  TRADE_ETHZAR:'trade_fire_eth_zar',
  TRADE_ETHDRC:'trade_fire_eth_drc',


  TRADE_APOLLOBTC:'trade_fire_apl_btc',
  TRADE_APOLLOBCH:'trade_fire_apl_bch',
  TRADE_APOLLOETH:'trade_fire_apl_eth',
  TRADE_APOLLOUSD:'trade_fire_apl_usd',
  TRADE_APOLLOZAR:'trade_fire_apl_zar',
  TRADE_APOLLODRC:'trade_fire_apl_drc',

  TRADE_USDTCU:'trade_fire_usdt_cu',
  TRADE_USDTCULONG:'trade_fire_usdt_culong',
  TRADE_USDTCUSHORT:'trade_fire_usdt_cushort',
  SETORDER_POSITIONS:'setorderpositions',
  TRADE_USDTSSLONG:'trade_fire_usdt_sslong',
  TRADE_USDTSSSHORT:'trade_fire_usdt_ssshort',

  TRADE_USDTSRRLONG:'trade_fire_usdt_srrlong',
  TRADE_USDTSRRSHORT:'trade_fire_usdt_srrshort',
  TRADE_USDTSRSCSPRS:'trade_fire_usdt_srscsprs',
  TRADE_USDTSRSCSPRL:'trade_fire_usdt_srscsprl',


  UPDATEBALANCE: 'updateBalance',
  TRADE_BASE: 'trade_fire_',
  STOPLOSS: 'stop_loss',


};

export const ENDPOINTS = {
  GET_USER_BALANCE: '/tradepair/get-balances',
  WALLET_MAIN_GET_BALANCE : `${process.env.WALLET_MAIN}/wallet/`
};

export const SERVER = {
  WALLET_BTC_BCH: process.env.WALLET_BTC_BCH,
  WALLET_BTC_ETH: process.env.WALLET_BTC_ETH,
  WALLET_BTC_APOLLO: process.env.WALLET_BTC_APOLLO,

  WALLET_ETH_BCH: process.env.WALLET_ETH_BCH,
  WALLET_ETH_APOLLO: process.env.WALLET_ETH_APOLLO,

  WALLET_APOLLO_BCH: process.env.WALLET_APOLLO_BCH,
  WALLET_APOLLO_BTC: process.env.WALLET_APOLLO_BTC,
  WALLET_APOLLO_ETH: process.env.WALLET_APOLLO_ETH,
  WALLET_USDT_CU: process.env.WALLET_USDT_CU,
  WALLET_APOLLO_USDT: process.env.WALLET_APOLLO_USDT,
  WALLET_APOLLO_CU: process.env.WALLET_APOLLO_CU,


  WALLET_MAIN: process.env.WALLET_MAIN,



};
