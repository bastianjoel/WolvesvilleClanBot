import axios from "axios";
import { scheduleJob } from "node-schedule";
import { Clan } from "./models/Clan";
import { Task } from "./tasks/Task";
import { CheckQuestXpContributions } from "./tasks/CheckQuestXpContributions";

export class Scheduler {
  private clans: Clan[];
  private started: boolean = false;

  /**
    * Updates the clans the scheduler will run for
    */
  public async loadClans() {
    this.clans = await axios.get(`/clans/authorized`);
  }

  /**
    * Starts the scheduler with the currently loaded clans
    *
    * This procedure can only be called once.
    * @throws if scheduler already started
    */
  public async start() {
    if (this.started) {
      throw new Error(`Scheduler already started`);
    }

    for (const clan of this.clans) {
      console.info(`[INFO] Running Tasks for Clan ${clan.name}`);

      const cqxc = new CheckQuestXpContributions(clan.id);
      await this.runTask(`CheckQuestXpContributions for ${clan.name}`, cqxc);
    }
  }

  private async runTask(name: string, task: Task) {
    const nextRunAt = await task.run();
    // TODO: Jobs should be persisted and continue when
    //       the application is restarted
    scheduleJob(name, nextRunAt, async () => {
      this.runTask(name, task);
    });
  }
}
