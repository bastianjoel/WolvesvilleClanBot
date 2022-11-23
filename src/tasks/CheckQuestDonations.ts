import axios from "axios";
import { Task } from "./Task";

export class CheckQuestDonations implements Task {
  async run() {
    const { data } = await axios.get(`/clans/authorized`);
    console.log(data);
  }
}
