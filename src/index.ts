import * as dotenv from 'dotenv';
import axios from "axios";
import { Scheduler } from './Scheduler';

dotenv.config();

import './discord';

axios.defaults.baseURL = `https://api.wolvesville.com`;
axios.defaults.headers.common = {
  Authorization: `Bot ${process.env.WOLVESVILLE_API_KEY}`,
};

const scheduler = new Scheduler();
scheduler.loadClans().then(() => {
  scheduler.start();
});

