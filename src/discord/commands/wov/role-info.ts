import axios from "axios";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { DataStore } from "../../../DataStore";
import { Role } from "../../../models/Role";
import { RoleRotations } from "../../../models/RoleRotation";

export const data = new SlashCommandBuilder()
  .setName("role-info")
  .setDescription("Returns info about an role")
  .addStringOption((option) =>
    option
      .setName("role")
      .setDescription("Name of the role")
      .setRequired(true)
      .setAutocomplete(true),
  );

async function getRoles(): Promise<Role[]> {
  let roleStore = DataStore.read<{ roles: Role[] }>(`wov-roles`);
  if (!roleStore?.roles) {
    const { data } = await axios.get<{ roles: Role[] } | null>(
      `/roles?locale=de`,
    );
    roleStore = data;
    DataStore.update(`wov-roles`, roleStore);
    DataStore.write(`wov-roles`);
  }

  return roleStore.roles;
}

export async function autocomplete(interaction: AutocompleteInteraction) {
  const focusedOption = interaction.options.getFocused(true);
  const searchTerm = focusedOption.value.toLowerCase();
  const choices = (await getRoles())
    .filter((r) => r.name.toLowerCase().startsWith(searchTerm))
    .slice(0, 24)
    .map((r) => ({ name: r.name, value: r.id }));
  await interaction.respond(choices);
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const roleId = interaction.options.getString("role");
  const role = (await getRoles()).find((r) => r.id === roleId);

  const probs = [];
  const { data } = await axios.get<RoleRotations[] | null>(`/roleRotations`);
  for (const mode of data) {
    let prob = 0;
    for (const rotEntry of mode.roleRotations) {
      let found = null;
      for (const gameRoles of rotEntry.roleRotation.roles) {
        found = gameRoles.find(
          (r) =>
            r.role === roleId ||
            (r.roles?.indexOf(roleId) !== -1 &&
              r.roles?.indexOf(roleId) !== undefined),
        );
        if (found) {
          break;
        }
      }
      prob += rotEntry.probability * (found?.probability || 0);
    }

    if (prob > 0) {
      probs.push({
        gamemode: mode.gameMode,
        probability: `${(prob * 100).toFixed(0)}%`,
      });
    }
  }

  const responseEmbed = new EmbedBuilder()
    .setTitle(role.name)
    .setDescription(role.description)
    .setThumbnail(role.image.url)
    .addFields({ name: `Aura`, value: role.aura, inline: true })
    .addFields({ name: `Team`, value: role.team, inline: true })
    .addFields({
      name: `Available in gamemodes`,
      value: probs.map((p) => `${p.gamemode} (${p.probability})`).join(`, `) || `-`,
    });
  await interaction.reply({ embeds: [responseEmbed] });
}
