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
Object.defineProperty(exports, "__esModule", { value: true });
exports.putStory = exports.getFile = void 0;
const octokit_1 = require("octokit");
const getOctokit = () => {
    return new octokit_1.Octokit({
        auth: process.env.AUHT_TOKEN,
    });
};
const getConfig = (fileName) => {
    return {
        url: `/repos/${process.env.OWNER}/${process.env.REPO}/contents/${process.env.STORIES_PATH}/${fileName}`,
        config: {
            owner: process.env.OWNER,
            repo: process.env.REPO,
            path: `${process.env.STORIES_PATH}/${fileName}`,
        },
        committer: {
            name: process.env.OWNER,
            email: process.env.MAIL,
        },
    };
};
const getFile = (storyName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const storyFile = yield getOctokit().request(`GET ${getConfig(storyName).url}`, getConfig(storyName).config);
        return storyFile;
    }
    catch (error) {
        return null;
    }
});
exports.getFile = getFile;
const putStory = (storyName, content, sha, title, authors) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!sha && title && authors) {
            const parsedName = storyName.substring(0, storyName.length - 3);
            const parsedAuthors = authors.split(';');
            yield addStoryConfig(parsedName, title, parsedAuthors);
        }
        yield upsertStory(storyName, content, sha);
        return {
            isUpload: true,
            error: '',
        };
    }
    catch (error) {
        return {
            isUpload: false,
            error: error,
        };
    }
});
exports.putStory = putStory;
const addStoryConfig = (storyName, title, authors) => __awaiter(void 0, void 0, void 0, function* () {
    const config = getConfig('stories.json');
    const originalFile = yield (0, exports.getFile)('stories.json');
    const originalBufferContent = Buffer.from(originalFile === null || originalFile === void 0 ? void 0 : originalFile.data.content, 'base64');
    const originalStringContent = originalBufferContent.toString('utf8');
    const originalJsonContent = JSON.parse(originalStringContent);
    const newJsonContent = Object.assign(Object.assign({}, originalJsonContent), { [storyName]: {
            authors,
            title,
        } });
    getOctokit().request(`PUT ${getConfig('stories.json').url}`, Object.assign(Object.assign({}, config.config), { message: `feat: update stories.json`, committer: Object.assign({}, config.committer), content: Buffer.from(JSON.stringify(newJsonContent)).toString('base64'), sha: originalFile === null || originalFile === void 0 ? void 0 : originalFile.data.sha }));
});
const upsertStory = (storyName, content, sha) => __awaiter(void 0, void 0, void 0, function* () {
    const config = getConfig(storyName);
    yield getOctokit().request(`PUT ${getConfig(storyName).url}`, Object.assign(Object.assign({}, config.config), { message: `feat: add or update ${storyName}`, committer: Object.assign({}, config.committer), content,
        sha }));
});
