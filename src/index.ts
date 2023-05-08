import * as dotenv from 'dotenv';
import axios from "axios";
import { Scheduler } from './Scheduler';

dotenv.config();

axios.defaults.baseURL = `https://api.wolvesville.com`;
axios.defaults.headers = {
  Authorization: `Bot ${process.env.API_KEY}`,
} as any;

const argv = process.argv.slice(2);
if (argv.length && argv[0] !== `scheduler`) {
  if (argv[0] === `req`) {
    axios.get(argv[1]).then(({ data }) => {
      console.log(data);
    });
  }
} else {
  const scheduler = new Scheduler();
  scheduler.loadClans().then(() => {
    scheduler.start();
  });
}
