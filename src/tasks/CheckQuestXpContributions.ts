import axios from "axios";
import { Quest, QuestParticipant } from "../models/Quest";
import { Task } from "./Task";

const PARTICIPANT_XP_PER_QUEST = 4000;

export class CheckQuestXpContributions implements Task {
  constructor(private clanId: string) { }

  async run() {
    const { data } = await axios.get<Quest>(`/clans/${this.clanId}/quests/active`);
    const amountTiers = data.quest.rewards.length;
    const xpPerTier = PARTICIPANT_XP_PER_QUEST / amountTiers;
    const shouldHaveXp = xpPerTier * data.tier;

    for (const participant of data.participants) {
      if (participant.xp < shouldHaveXp) {
        await this.notifyPlayerNotEnoughtXp(participant);
      }
    }
  }

  async notifyPlayerNotEnoughtXp(player: QuestParticipant) {
    console.log(`[INFO] Send player not enough xp notification to ${player}`);

    await axios.post(`/clans/${this.clanId}/chat`, {
      message: `${player} macht zu wenig Quest XP.`
    });
  }
}
