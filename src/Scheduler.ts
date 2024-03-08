import axios from "axios";
import { scheduleJob } from "node-schedule";
import { Clan } from "./models/Clan";
import { Task } from "./tasks/Task";
import { CheckQuestXpContributions } from "./tasks/CheckQuestXpContributions";
import { DataStore } from "./DataStore";

const TASKS = {
  CHECK_QUEST_XP_CONTRIBUTIONS: CheckQuestXpContributions
};

interface TaskCollectionItem {
  identifier: string;
  nextRun: number;
}

interface ClanData {
  info: Clan;
  tasks: TaskCollectionItem[] | null;
  addedAt: number;
}

export class Scheduler {
  private clans: { [key: string]: ClanData } = {};
  private started: boolean = false;

  /**
    * Updates the clans the scheduler will run for
    */
  public async loadClans() {
    const currentClans = DataStore.read<{ [key: string]: ClanData }>(`clans`);

    const { data } = await axios.get<Clan[]>(`/clans/authorized`);
    for (const clan of data) {
      if (currentClans[clan.id]) {
        currentClans[clan.id].info = clan;
        this.clans[clan.id] = currentClans[clan.id];
      } else {
        this.clans[clan.id] = {
          info: clan,
          tasks: null,
          addedAt: Date.now()
        }
      }
    }

    DataStore.update(`clans`, this.clans);
    DataStore.write(`clans`);
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

    this.started = true;

    for (const clanId in this.clans) {
      const clan = this.clans[clanId];
      console.info(`[INFO] Running Tasks for Clan ${clan.info.name}`);

      if (clan.tasks) {
        for (const taskInfo of clan.tasks) {
          if (TASKS[taskInfo.identifier]) {
            const task = new TASKS[taskInfo.identifier](clanId);
            if (taskInfo.nextRun > Date.now()) {
              await this.runTask(clan, taskInfo.identifier, task, new Date(taskInfo.nextRun));
            } else {
              await this.runTask(clan, taskInfo.identifier, task);
            }
          }
        }
      } else {
        for (const taskName in TASKS) {
          if (TASKS[taskName]) {
            const task = new TASKS[taskName](clanId);
            await this.runTask(clan, taskName, task);
          }
        }
      }
    }
  }

  private async runTask(clan: ClanData, name: string, task: Task, runAt?: Date) {
    if (!runAt) {
      runAt = await task.run();
    }
    // TODO: Jobs should be persisted and continue when
    //       the application is restarted
    scheduleJob(`${name} for ${clan.info.name}`, runAt, async () => {
      this.runTask(clan, name, task);
    });
  }
}
