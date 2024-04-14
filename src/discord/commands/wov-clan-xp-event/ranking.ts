import axios from "axios";

import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  escapeMarkdown,
} from "discord.js";
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
      .setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const eventId = interaction.options.getString("identifier").toUpperCase();
  if (!/\b\w{5}\b/.test(eventId)) {
    await interaction.reply(`Invalid identifier.`);
    return;
  }

  const storeName = `xp-event-${interaction.guildId}-${eventId}`;
  const xpEvent = DataStore.read<XpEvent>(storeName);

  const guildData = DataStore.read<DiscordSaveData>(`discord`);
  if (
    !guildData ||
    !guildData[interaction.guildId] ||
    xpEvent.clanId !== guildData[interaction.guildId].clanId
  ) {
    await interaction.reply(`Clan not registered for this server.`);
    return;
  }

  const clanId = xpEvent.clanId;
  const { data } = await axios.get<ClanMember[] | null>(
    `/clans/${clanId}/members`,
  );

  if (xpEvent.teams) {
    const ranking: {
      id: string;
      teamName: string;
      usernames: string[];
      xp: number;
    }[] = [];
    const memberXps: { [key: string]: number } = {};
    for (const member of data) {
      memberXps[member.playerId] = member.xp;
    }

    for (const teamId of Object.keys(xpEvent.teams || {})) {
      const team = xpEvent.teams[teamId];
      let xp = 0;
      for (const id of team.members) {
        xp += Math.max(
          0,
          (memberXps[id] || 0) - (xpEvent.participants[id]?.initialXp || 0),
        );
      }
      ranking.push({
        id: teamId,
        teamName: team.name,
        usernames: team.members
          .map((id) => xpEvent.participants[id].username)
          .filter((v) => v),
        xp,
      });
    }
    ranking.sort((a, b) => b.xp - a.xp);

    const teamsReply: string[] = [];
    for (let i = 0; i < ranking.length; i++) {
      const team = ranking[i];
      teamsReply.push(
        `${i + 1}. ${escapeMarkdown(team.teamName)} (${team.xp
        }) - ${team.usernames.join(`, `)}`,
      );
    }

    await interaction.reply(`# Current Ranking\n${teamsReply.join(`\n`)}`);
  } else {
    const ranking: { id: string; username: string; xp: number }[] = [];
    for (const member of data) {
      ranking.push({
        id: member.playerId,
        username: member.username,
        xp: member.xp - (xpEvent.participants[member.playerId]?.initialXp || 0),
      });
    }
    ranking.sort((a, b) => b.xp - a.xp);

    const participantReply: string[] = [];
    for (let i = 0; i < ranking.length; i++) {
      const member = ranking[i];
      participantReply.push(
        `${i + 1}. ${escapeMarkdown(member.username)} (${member.xp})`,
      );
    }

    await interaction.reply(
      `# Current Ranking\n${participantReply.join("\n")}`,
    );
  }
}
