import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as ejs from 'ejs';
import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as path from 'path';
import * as config from '../src/config/';
import * as Helper from './helpers/index';
import { Controller } from './interfaces';
import { errorMiddleware } from './middlewares';

const globalData: any = global;
// import { passportMiddleware } from './middlewares/';
class App {
  public app: express.Application;
  constructor(controllers: Controller[]) {
    // config.initiate();
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  public listen() {
    const ser = this.app.listen(process.env.PORT ? process.env.PORT : 7000, () => {
      console.log(`App listening on the port ${process.env.PORT ? process.env.PORT : 7000}`);
      this.socketConnect(ser);

      // console.log('Process ' + process.pid + ' is listening to all incoming requests');

    });
  }
  public getServer() {
    return this.app;
  }
  private initializeMiddlewares() {
    this.app.use(bodyParser.urlencoded({ extended:true }));
    this.app.use(cookieParser());
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.set('view engine', 'ejs');
    this.app.get('/*', (req, res, next) => {
      res.header('Access-Control-Allow-Credentials' , 'true');
      next();
    });
    this.app.use(cors({ origin: 'http://localhost' }));

  }
  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
    this.app.get('/status', (req, res) => {
      return res.json({ status : 'success' });
    });
  }
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private socketConnect(ser: any) {
    const io = require('socket.io')(ser);
    require('./connection/socket')(io);
    globalData.socketConnection = io;
    global = globalData;
  }

}
export default App;
