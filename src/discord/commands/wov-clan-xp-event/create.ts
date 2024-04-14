import axios from "axios";

import { ChatInputCommandInteraction, SlashCommandBuilder, escapeMarkdown } from "discord.js";
import { DiscordSaveData } from "../../../models/datastore/Discord";
import { DataStore } from "../../../DataStore";
import { ClanMember } from "../../../models/ClanMember";
import { XpEvent } from "../../../models/datastore/XpEvent";

export const data = new SlashCommandBuilder()
  .setName("xp-event-create")
  .setDescription("Creates a xp event. Saves current clan member stats and returns an event identifier.");

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildData = DataStore.read<DiscordSaveData>(`discord`);
  if (!guildData || !guildData[interaction.guildId]) {
    await interaction.reply(`No clan registered to this server.`);
    return;
  }

  const clanId = guildData[interaction.guildId].clanId;
  const eventId = (+new Date).toString(36).slice(-5).toUpperCase();
  const storeName = `xp-event-${interaction.guildId}-${eventId}`

  const xpEvent: XpEvent = {
    id: eventId,
    clanId: clanId,
    creatorId: interaction.member.user.id,
    createdAt: Date.now(),
    participants: {}
  };

  const { data } = await axios.get<ClanMember[] | null>(`/clans/${clanId}/members`);
  const participantReply: string[] = [];
  for (const member of data) {
    participantReply.push(`${escapeMarkdown(member.username)} (${member.xp})`)
    xpEvent.participants[member.playerId] = {
      username: member.username,
      initialXp: member.xp
    };
  }
  participantReply.sort();

  DataStore.update(storeName, xpEvent);
  DataStore.write(storeName);

  await interaction.reply(`Created xp event with identifier \`${eventId}\``);
  await interaction.followUp(`# Participants (start xp)\n${participantReply.join("\n")}`);
}
