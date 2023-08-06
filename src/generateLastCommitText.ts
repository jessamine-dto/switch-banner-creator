const versionSpan = document.getElementById("last-updated") as HTMLSpanElement;



type GithubCommit = {
	commit: {
		author: {
			date: string
		}
	},
	sha: string
};



async function getLastCommit() {
	return await fetch('https://api.github.com/repos/jessamine-dto/switch-banner-creator/commits?per_page=1')
		.then(res => res.json())
		.then(res => {
			return res[0] as GithubCommit;
		})
		.catch(err => {
			return "Unable to load version";
		});
}



export default async function generateLastCommitText() {
	const lastCommit = await getLastCommit();

	if(typeof lastCommit === "string") {
		versionSpan.textContent = "Unable to load version";
		return;
	}

	versionSpan.textContent = `Last updated ${new Date(lastCommit.commit.author.date).toLocaleDateString("en-US", {dateStyle: "long"})} (commit ${lastCommit.sha.slice(0, 7)})`;
}
