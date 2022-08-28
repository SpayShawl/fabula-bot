import { SlashCommandBuilder } from '@discordjs/builders';
import axios from 'axios';
import {
	ChatInputCommandInteraction,
	CacheType,
	Interaction,
} from 'discord.js';
import { getFile, putStory } from '../utils/github';

const registerCommand = new SlashCommandBuilder()
	.setName('upload')
	.setDescription('Ajoute ou modifie une histoire sur le site')
	.addAttachmentOption((option) =>
		option
			.setName('fichier')
			.setDescription('L histoire au format .txt')
			.setRequired(true)
	)
	.addStringOption((option) =>
		option
			.setName('titre')
			.setDescription(`Titre de l'histoire, si nouvelle`)
			.setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName('auteurs')
			.setDescription('Auteurs de l histoire, séparés par des ;')
			.setRequired(false)
	);

export class UploadCommand {
	static isThis = (interaction: Interaction<CacheType>) => {
		return (
			interaction.isChatInputCommand() && interaction.commandName === 'upload'
		);
	};

	static execute = async (
		interaction: ChatInputCommandInteraction<CacheType>
	) => {
		const storyTitle = interaction.options.getString('titre');
		const storyAuthors = interaction.options.getString('auteurs');
		const storyFile = interaction.options.getAttachment('fichier');
		const fileName = storyFile!.name!.slice(0, -4);
		const storyDatas = await (await axios.get(storyFile!.url)).data;
		const storyFileRepo = await getFile(`${fileName}.md`);

		if (!storyFileRepo && !storyTitle) {
			interaction.reply(`:warning: Vous devez donner le titre de l'histoire`);
			return;
		}

		if (!storyFileRepo && !storyAuthors) {
			interaction.reply(
				`:warning: Vous devez donner les auteurs de l'histoire`
			);
			return;
		}

		interaction.reply(
			':construction: Publication, patientez quelques instants...'
		);

		const upload = await putStory(
			fileName,
			Buffer.from(storyDatas).toString('base64'),
			storyFileRepo?.data.sha,
			storyTitle,
			storyAuthors
		);

		interaction.channel?.send(
			upload.isUpload
				? ':tada: Histoire publiée, build en cours...'
				: upload.error
		);
	};
}

export default registerCommand.toJSON();
