import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandStringOption,
  escapeMarkdown,
} from "discord.js";
import { DiscordSaveData } from "../../../models/datastore/Discord";
import { DataStore } from "../../../DataStore";
import { XpEvent } from "../../../models/datastore/XpEvent";

const identifierOption = (option: SlashCommandStringOption) =>
  option
    .setName("identifier")
    .setDescription("Identifier of the xp event")
    .setRequired(true);

const teamnameOption = (option: SlashCommandStringOption) =>
  option
    .setName("team")
    .setDescription("Name of the team")
    .setRequired(true)
    .setAutocomplete(true)
    .setMaxLength(128);

const memberOption = (num: number) => (option: SlashCommandStringOption) =>
  option
    .setName(`member_${num}`)
    .setDescription("Wolvesville username")
    .setAutocomplete(true);

export const data = new SlashCommandBuilder()
  .setName("xp-event-team")
  .setDescription("Xp event team actions.")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("add")
      .setDescription("Add up to five member to a team.")
      .addStringOption(identifierOption)
      .addStringOption(teamnameOption)
      .addStringOption(memberOption(1))
      .addStringOption(memberOption(2))
      .addStringOption(memberOption(3))
      .addStringOption(memberOption(4))
      .addStringOption(memberOption(5)),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Removes a team.")
      .addStringOption(identifierOption)
      .addStringOption(teamnameOption),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("Lists all teams")
      .addStringOption(identifierOption),
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
    await interaction.reply(
      `Clan not registered for this server or identifier wrong.`,
    );
    return;
  }

  if (xpEvent.creatorId !== interaction.member.user.id) {
    await interaction.reply(`You are not allowed to edit this xp event.`);
    return;
  }

  if (!xpEvent.teams) {
    xpEvent.teams = {};
  }

  const command = interaction.options.getSubcommand();
  const teamId = interaction.options.getString("team");
  if (command === `add`) {
    if (!xpEvent.teams[teamId]) {
      xpEvent.teams[teamId] = {
        name: teamId,
        members: [],
      };
    }

    for (let i = 0; i < 5; i++) {
      const member = interaction.options.getString(`member_${i + 1}`);
      if (member && xpEvent.teams[teamId].members.indexOf(member) === -1) {
        xpEvent.teams[teamId].members.push(member);
      }
    }

    DataStore.update(storeName, xpEvent);
    DataStore.write(storeName);

    const memberNames = [];
    for (const memberId of xpEvent.teams[teamId].members) {
      if (xpEvent.participants[memberId]) {
        memberNames.push(
          escapeMarkdown(xpEvent.participants[memberId].username),
        );
      }
    }

    await interaction.reply(
      `Updated team ${teamId}:\n${memberNames.sort().join(`\n`)}`,
    );
  } else if (command === `remove`) {
    if (xpEvent.teams && xpEvent.teams[teamId]) {
      delete xpEvent.teams[teamId];
      if (!Object.keys(xpEvent.teams).length) {
        xpEvent.teams = undefined;
      }
    }

    DataStore.update(storeName, xpEvent);
    DataStore.write(storeName);

    await interaction.reply(`Removed team ${teamId}`);
  } else if (command === `list`) {
    const teams: string[] = [];
    for (const teamId of Object.keys(xpEvent.teams || {})) {
      const team = xpEvent.teams[teamId];
      teams.push(
        `${team.name}\n> ${team.members
          .map((id) => xpEvent.participants[id].username)
          .filter((v) => v)
          .join(`, `)}\n`,
      );
    }

    await interaction.reply(`# Teams\n${teams.join(`\n`)}`);
  }
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const eventId = interaction.options.getString("identifier").toUpperCase();
  const storeName = `xp-event-${interaction.guildId}-${eventId}`;
  const xpEvent = DataStore.read<XpEvent>(storeName);
  if (!xpEvent) {
    await interaction.respond([]);
    return;
  }

  const focusedOption = interaction.options.getFocused(true);
  const searchTerm = focusedOption.value.toLowerCase();

  if (focusedOption.name.startsWith(`member_`)) {
    const choices = Object.keys(xpEvent.participants)
      .filter((r) =>
        xpEvent.participants[r].username.toLowerCase().startsWith(searchTerm),
      )
      .slice(0, 24)
      .map((r) => ({ name: xpEvent.participants[r].username, value: r }));
    await interaction.respond(choices);
  } else if (focusedOption.name === `team`) {
    const choices = Object.keys(xpEvent.teams || {})
      .filter((r) => xpEvent.teams[r].name.toLowerCase().startsWith(searchTerm))
      .slice(0, 23)
      .map((r) => ({ name: xpEvent.teams[r].name, value: r }));
    if (
      focusedOption.value &&
      !choices.find((v) => v.name === focusedOption.value)
    ) {
      choices.unshift({
        name: focusedOption.value,
        value: focusedOption.value,
      });
    }

    await interaction.respond(choices);
  }
}
