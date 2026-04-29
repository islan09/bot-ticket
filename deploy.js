require('dotenv').config();

const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1493791176631779559";
const GUILD_ID = "1493771658723459184";

const commands = [
  new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Abrir ticket')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Registrando comando...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('Comando registrado!');
  } catch (error) {
    console.error(error);
  }
})();