import { SlashCommandBuilder } from '@discordjs/builders';
import {
	EmbedBuilder,
	ChatInputCommandInteraction,
	CacheType,
	Interaction,
} from 'discord.js';
import { getFile } from '../utils/github';

const registerCommand = new SlashCommandBuilder()
	.setName('list')
	.setDescription('Liste les histoires présentent sur le site');

export class ListCommand {
	static isThis = (interaction: Interaction<CacheType>) => {
		return (
			interaction.isChatInputCommand() && interaction.commandName === 'list'
		);
	};

	static execute = async (
		interaction: ChatInputCommandInteraction<CacheType>
	) => {
		const stories = await getFile('stories.json');

		if (!stories) {
			interaction.reply(`:x: Fichier stories.json introuvable`);
			return;
		}

		const storiesBufferContent = Buffer.from(stories.data.content, 'base64');
		const storiesStringContent = storiesBufferContent.toString('utf8');
		const storiesJsonContent = JSON.parse(storiesStringContent);
		const storiesToString = Object.keys(storiesJsonContent)
			.map(
				(k) =>
					`${k} -> ${storiesJsonContent[k].title} par ${storiesJsonContent[
						k
					].authors.join(' & ')}`
			)
			.join('\n');

		const embedMessage = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('Liste des histoires')
			.setURL('https://dev-fabula.netlify.app/')
			.setDescription(storiesToString);

		interaction.reply({
			embeds: [embedMessage],
		});
	};
}

export default registerCommand.toJSON();
