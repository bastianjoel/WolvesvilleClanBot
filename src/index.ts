import * as dotenv from 'dotenv';
import axios from "axios";
import { Scheduler } from './Scheduler';

dotenv.config();

axios.defaults.baseURL = `https://api.wolvesville.com`;
axios.defaults.headers = {
  Authorization: `Bot ${process.env.API_KEY}`,
} as any;

const scheduler = new Scheduler();
scheduler.loadClans().then(() => {
  scheduler.start();
});
