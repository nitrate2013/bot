const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  cooldown: 6,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with the bots current ping")
    .setIntegrationTypes([0, 1]),
  async execute(interaction) {
    const pingembed = new EmbedBuilder()
      .setColor("#131313")
      .setDescription("**Pinging...**");

    const sent = await interaction.followUp({
      embeds: [pingembed],
      fetchReply: true,
    });
    pingembed.setDescription(
      `**${sent.createdTimestamp - interaction.createdTimestamp}ms**`
    );
    interaction.editReply({
      embeds: [pingembed],
      fetchReply: true,
    });
  },
};
