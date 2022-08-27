"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadCommand = void 0;
const builders_1 = require("@discordjs/builders");
const axios_1 = __importDefault(require("axios"));
const github_1 = require("../utils/github");
const registerCommand = new builders_1.SlashCommandBuilder()
    .setName('upload')
    .setDescription('Ajoute ou modifie une histoire sur le site')
    .addAttachmentOption((option) => option
    .setName('fichier')
    .setDescription('L histoire au format .md')
    .setRequired(true))
    .addStringOption((option) => option
    .setName('titre')
    .setDescription(`Titre de l'histoire, si nouvelle`)
    .setRequired(false))
    .addStringOption((option) => option
    .setName('auteurs')
    .setDescription('Auteurs de l histoire, séparés par des ;')
    .setRequired(false));
class UploadCommand {
}
exports.UploadCommand = UploadCommand;
_a = UploadCommand;
UploadCommand.isThis = (interaction) => {
    return (interaction.isChatInputCommand() && interaction.commandName === 'upload');
};
UploadCommand.execute = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const storyTitle = interaction.options.getString('titre');
    const storyAuthors = interaction.options.getString('auteurs');
    const storyFile = interaction.options.getAttachment('fichier');
    const storyDatas = yield (yield axios_1.default.get(storyFile.url)).data;
    const storyFileRepo = yield (0, github_1.getFile)(storyFile.name);
    if (!storyFileRepo && !storyTitle) {
        interaction.reply(`:warning: Vous devez donner le titre de l'histoire`);
        return;
    }
    if (!storyFileRepo && !storyAuthors) {
        interaction.reply(`:warning: Vous devez donner les auteurs de l'histoire`);
        return;
    }
    interaction.reply(':construction: Publication, patientez quelques instants...');
    const upload = yield (0, github_1.putStory)(storyFile.name, Buffer.from(storyDatas).toString('base64'), storyFileRepo === null || storyFileRepo === void 0 ? void 0 : storyFileRepo.data.sha, storyTitle, storyAuthors);
    (_b = interaction.channel) === null || _b === void 0 ? void 0 : _b.send(upload.isUpload
        ? ':tada: Histoire publiée, build en cours...'
        : upload.error);
});
exports.default = registerCommand.toJSON();
