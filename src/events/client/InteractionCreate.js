const { Events, EmbedBuilder, Collection } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction) return;
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    const { locale } = interaction;

    if (!interaction.isAutocomplete()) {
      await interaction.deferReply({
        ephemeral: command.ephemeral || false,
        allowedMentions: {
          repliedUser: false,
        },
        flags: [4096],
      });
    }

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        const embed = new EmbedBuilder()
          .setColor("#131313")
          .setDescription(
            `You are executing commands too quickly! Please wait <t:${expiredTimestamp}:R> to use \`${command.data.name}\` again.`
          );
        return interaction.editReply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction);
      console.log(`${interaction.user.tag} has ran /${interaction.commandName}`);
    } catch (error) {
      console.error(error);
      const { locale } = interaction;
      const embed = new EmbedBuilder()
        .setColor("#131313")
        .setDescription("Oh no! Looks like the error has showed up!");

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.editReply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
