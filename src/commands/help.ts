import { SlashCommandBuilder } from '@discordjs/builders';
import {
	EmbedBuilder,
	ChatInputCommandInteraction,
	CacheType,
	Interaction,
} from 'discord.js';

const registerCommand = new SlashCommandBuilder()
	.setName('help')
	.setDescription(`Affiche l'utilisation des commandes`);

export class HelpCommand {
	static isThis = (interaction: Interaction<CacheType>) => {
		return (
			interaction.isChatInputCommand() && interaction.commandName === 'help'
		);
	};

	static execute = async (
		interaction: ChatInputCommandInteraction<CacheType>
	) => {
		const message = `/help => Affiche ce message
    /list => Affiche la liste des histoires : {nom du fichier} => {titre} par {auteurs}
    /upload => 
      **- Pour poster une nouvelle histoire :** 
        1. Créez un fichier .txt et nommez le avec l'alias de votre histoire, c'est ce nom qui vous permettra, plus tard, d'éditer votre histoire.
        2. Faites /upload, mettez votre fichier et définissez le titre officiel et le nom des auteurs en les séparants par un ';' 

              Exemple : /upload solo.txt Histoire Solo Spay Shawl
              Exemple : /upload duo.txt Histoire Duo King;Haeys

        3. Attendez un petit peu, le bot "Maxime" devrait envoyer un message pour confirmer que l'histoire à été publiée
        4. Un problème ? Pingez Spay Shawl

      **- Pour éditer une nouvelle histoire :** 
        1. Modifiez le fichier .txt /!\\ Il doit avoir le MEME nom que celui de l'histoire que vous voulez éditez. 
              Si vous avez un doute, utilisez /list pour voir son nom.
        2. Faites /upload et mettez le fichier. Pas la peine de remettre le titre ou les auteurs

              Exemple : /upload solo.txt

        3. Attendez un petit peu, le bot "Maxime" devrait envoyer un message pour confirmer que l'histoire à été modifiée
        4. Un problème ? Pingez Spay Shawl
    `;
		const embedMessage = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('Comment utiliser le bot ?')
			.setDescription(message);

		interaction.reply({
			embeds: [embedMessage],
		});
	};
}

export default registerCommand.toJSON();
