import { Octokit } from 'octokit';

const getOctokit = () => {
	return new Octokit({
		auth: process.env.AUHT_TOKEN,
	});
};

const getConfig = (fileName: string) => {
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

export const getFile = async (storyName: string) => {
	try {
		const storyFile = await getOctokit().request(
			`GET ${getConfig(storyName).url}`,
			getConfig(storyName).config
		);
		return storyFile;
	} catch (error) {
		return null;
	}
};

export const putStory = async (
	storyName: string,
	content: string,
	sha: string | null,
	title: string | null,
	authors: string | null
) => {
	try {
		if (!sha && title && authors) {
			const parsedAuthors = authors.split(';');
			await addStoryConfig(storyName, title, parsedAuthors);
		}

		await upsertStory(storyName, content, sha);

		return {
			isUpload: true,
			error: '',
		};
	} catch (error) {
		return {
			isUpload: false,
			error: error as string,
		};
	}
};

const addStoryConfig = async (
	storyName: string,
	title: string,
	authors: string[]
) => {
	const config = getConfig('stories.json');
	const originalFile = await getFile('stories.json');
	const originalBufferContent = Buffer.from(
		originalFile?.data.content,
		'base64'
	);
	const originalStringContent = originalBufferContent.toString('utf8');
	const originalJsonContent = JSON.parse(originalStringContent);
	const newJsonContent = {
		...originalJsonContent,
		[storyName]: {
			authors,
			title,
		},
	};

	getOctokit().request(`PUT ${getConfig('stories.json').url}`, {
		...config.config,
		message: `feat: update stories.json`,
		committer: {
			...config.committer,
		},
		content: Buffer.from(JSON.stringify(newJsonContent)).toString('base64'),
		sha: originalFile?.data.sha,
	});
};

const upsertStory = async (
	storyName: string,
	content: string,
	sha: string | null
) => {
	const config = getConfig(`${storyName}.md`);

	await getOctokit().request(`PUT ${config.url}`, {
		...config.config,
		message: `feat: add or update ${storyName}`,
		committer: {
			...config.committer,
		},
		content,
		sha,
	});
};
