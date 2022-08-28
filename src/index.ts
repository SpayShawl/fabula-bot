import { config } from 'dotenv';
import {
	CacheType,
	ChatInputCommandInteraction,
	Client,
	GatewayIntentBits,
	Routes,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import UploadBuilder, { UploadCommand } from './commands/upload';
import ListBuilder, { ListCommand } from './commands/list';
import HelpBuilder, { HelpCommand } from './commands/help';

config();

const TOKEN = process.env.TOKEN || '';
const CLIENT_ID = process.env.CLIENT_ID || '';
const GUILD_ID = process.env.GUILD_ID || '';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.on('ready', () => console.log(`${client.user?.tag} has logged in!`));

client.on('interactionCreate', (interaction) => {
	if (UploadCommand.isThis(interaction)) {
		UploadCommand.execute(
			interaction as ChatInputCommandInteraction<CacheType>
		);
	} else if (ListCommand.isThis(interaction)) {
		ListCommand.execute(interaction as ChatInputCommandInteraction<CacheType>);
	} else if (HelpCommand.isThis(interaction)) {
		HelpCommand.execute(interaction as ChatInputCommandInteraction<CacheType>);
	}
});

async function main() {
	const commands = [UploadBuilder, ListBuilder, HelpBuilder];
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
			body: commands,
		});
		client.login(TOKEN);
	} catch (err) {
		console.log(err);
	}
}

main();
