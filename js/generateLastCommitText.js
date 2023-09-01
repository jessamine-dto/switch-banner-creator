async function fetchLastCommit(repository) {
    return await fetch(`https://api.github.com/repos/${repository}/commits?per_page=1`)
        .then(res => res.ok ? res.json() : null) // if res is not ok, return null;
        .then((res) => res[0]) // then this will error trying to perform null[0]
        .catch(() => null); // and be caught here
}
async function generateLastCommitText(repository) {
    const lastCommit = await fetchLastCommit(repository);
    if (lastCommit === null) {
        return "Unable to load version";
    }
    const commitDate = lastCommit.commit.author.date;
    const formattedDate = new Date(commitDate).toLocaleDateString("en-US", { dateStyle: "short" });
    const formattedHash = lastCommit.sha.slice(0, 7);
    return `Last updated ${formattedDate} (commit ${formattedHash})`;
}
export default async function assignLastCommitToElement(element, repository) {
    element.textContent = await generateLastCommitText(repository);
}
