import axios from "axios";
import { Clan } from "./models/Clan";
import { CheckQuestXpContributions } from "./tasks/CheckQuestXpContributions";

export class Scheduler {
  private clans: Clan[];

  async loadClans() {
    this.clans = await axios.get(`/clans/authorized`);
  }

  async start() {
    for (const clan of this.clans) {
      console.log(`[INFO] Running Tasks for Clan ${clan.name}`);

      const cqxc = new CheckQuestXpContributions(clan.id);
      await cqxc.run();
    }
  }
}
