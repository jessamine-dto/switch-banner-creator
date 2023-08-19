const versionSpan = document.getElementById("last-updated") as HTMLSpanElement;



type GithubCommit = {
	commit: {
		author: {
			date: string
		}
	},
	sha: string
}



type SimplifiedCommit = {
	date: string;
	sha: string;
}



async function fetchLastCommit(repository: string): Promise<string | SimplifiedCommit> {
	return await fetch(`https://api.github.com/repos/${repository}/commits?per_page=1`)
		.then(res => res.json())
		.then((res: GithubCommit[]) => {
			return {
				date: res[0].commit.author.date,
				sha: res[0].sha
			}
		})
		.catch(err => {
			return "Unable to load version";
		});
}



export default async function generateLastCommitText(repository: string) {
	const lastCommit = await fetchLastCommit(repository);

	// i really hate how i had to write this it feels so clunky surely there's a better way
	if(typeof lastCommit === "string") {
		versionSpan.textContent = "Unable to load version";
		return;
	}


	const date = new Date(lastCommit.date).toLocaleDateString("en-US", {dateStyle: "short"});
	const commit = lastCommit.sha.slice(0, 7);

	// i also hate this directly accessing the element jhghjgdfhjkdfg
	versionSpan.textContent = `Last updated ${date} (commit ${commit})`;
}
