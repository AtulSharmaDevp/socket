import { config } from 'dotenv' ;
import { resolve } from 'path';
export async function initiate() {
  return new Promise((resolve1) => {
    /** */
    if (process.env.NODE_ENV === 'prod') {
      console.log('::YOU ARE ON PRODUCTION MODE::');
      config({ path: resolve(__dirname, './prod.env') });  
    } else if (process.env.NODE_ENV === 'stage') {
      console.log('::YOU ARE ON STAGING MODE::');
      config({ path: resolve(__dirname, './stage.env') });
    } else if (process.env.NODE_ENV === 'dev') {
      console.log('::YOU ARE ON dev MODE::');
      config({ path: resolve(__dirname, './dev.env') });
    } else if (process.env.NODE_ENV === 'qa') {
      console.log('::YOU ARE ON qa MODE::');
      config({ path: resolve(__dirname, './qa.env') });
    } else {
      console.log('::YOU ARE ON LOCAL MODE (else):');
      config({ path: resolve(__dirname, './stage.env') });
    }
    resolve1(true);
  });
}
