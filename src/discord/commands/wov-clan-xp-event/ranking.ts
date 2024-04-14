import axios from "axios";

import { ChatInputCommandInteraction, SlashCommandBuilder, escapeMarkdown } from "discord.js";
import { DiscordSaveData } from "../../../models/datastore/Discord";
import { DataStore } from "../../../DataStore";
import { ClanMember } from "../../../models/ClanMember";
import { XpEvent } from "../../../models/datastore/XpEvent";

export const data = new SlashCommandBuilder()
  .setName("xp-event-ranking")
  .setDescription("Returns the current ranking of a xp event")
  .addStringOption((option) =>
    option
      .setName("identifier")
      .setDescription("Identifier of the xp event")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const eventId = interaction.options.getString("identifier").toUpperCase();
  if (!/\b\w{5}\b/.test(eventId)) {
    await interaction.reply(`Invalid identifier.`);
    return;
  }

  const storeName = `xp-event-${interaction.guildId}-${eventId}`
  const xpEvent = DataStore.read<XpEvent>(storeName);

  const guildData = DataStore.read<DiscordSaveData>(`discord`);
  if (!guildData || !guildData[interaction.guildId] || xpEvent.clanId !== guildData[interaction.guildId].clanId) {
    await interaction.reply(`Clan not registered for this server.`);
    return;
  }

  const clanId = xpEvent.clanId;
  const { data } = await axios.get<ClanMember[] | null>(`/clans/${clanId}/members`);
  const ranking: { id: string; username: string; xp: number; }[] = [];
  for (const member of data) {
    ranking.push({
      id: member.playerId,
      username: member.username,
      xp: member.xp - xpEvent.participants[member.playerId]?.initialXp || 0
    });
  }
  ranking.sort((a, b) => b.xp - a.xp);

  const participantReply: string[] = [];
  for (let i = 0; i < ranking.length; i++) {
    const member = ranking[i];
    participantReply.push(`${i + 1}. ${escapeMarkdown(member.username)} (${member.xp})`)
  }

  await interaction.reply(`# Current Ranking\n${participantReply.join("\n")}`);
}
