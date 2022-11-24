import axios from "axios";
import { Quest, QuestParticipant } from "../models/Quest";
import { Task } from "./Task";

const PARTICIPANT_XP_PER_QUEST = 4000;

export class CheckQuestXpContributions implements Task {
  constructor(private clanId: string) { }

  async run(): Promise<Date> {
    const { data } = await axios.get<Quest | null>(`/clans/${this.clanId}/quests/active`);
    if (!data || !Object.keys(data).length) {
      // Check again if a quest is running after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    const amountTiers = data.quest.rewards.length;
    const xpPerTier = PARTICIPANT_XP_PER_QUEST / amountTiers;
    const shouldHaveXp = xpPerTier * data.tier;

    for (const participant of data.participants) {
      if (participant.xp < shouldHaveXp) {
        await this.notifyPlayerNotEnoughtXp(participant);
      }
    }

    // Rerun one hour after tier ends.
    return new Date(Date.parse(data.tierEndTime) + 60 * 60 * 1000);
  }

  async notifyPlayerNotEnoughtXp(player: QuestParticipant) {
    console.info(`[INFO] Send player not enough xp notification to ${player.username}`);

    await axios.post(`/clans/${this.clanId}/chat`, {
      message: `${player.username} macht zu wenig Quest XP.`
    });
  }
}
