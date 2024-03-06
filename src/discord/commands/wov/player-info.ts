import axios from "axios";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Player } from "../../../models/Player";

export const data = new SlashCommandBuilder()
  .setName("player-info")
  .setDescription("Returns info of a player")
  .addStringOption((option) =>
    option
      .setName("username")
      .setDescription("Username in wolvesville")
      .setRequired(true),
  )
  .setDefaultMemberPermissions(0);

export async function execute(interaction: ChatInputCommandInteraction) {
  const username = interaction.options.getString("username");
  const { data } = await axios.get<Player | null>(`/players/search`, {
    params: { username },
  });
  console.log(data);
  await interaction.reply(data.personalMessage);
}
