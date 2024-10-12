require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const commands = [];

const {
  Client,
  Collection,
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");
const client = new Client({
  intents: [],
});

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, "./commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      if (command.data instanceof SlashCommandBuilder) {
        commands.push(command.data.toJSON());
      } else {
        commands.push(command.data);
      }
    } else {
      console.warn(
        `The command at ${filePath} is missing a required "data" and "execute" property`
      );
    }
  }
}

const rest = new REST().setToken(process.env.token);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands`
    );

    const data = await rest.put(
      Routes.applicationCommands(process.env.clientid),
      {
        body: commands,
      }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands`
    );
  } catch (error) {
    console.error(error);
  }
})();

const ceventsPath = path.join(__dirname, "./events/client");
const ceventFiles = fs
  .readdirSync(ceventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of ceventFiles) {
  const filePath = path.join(ceventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}
client.login(process.env.token);
