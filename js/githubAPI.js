const baseURL = "https://api.github.com/users";
const ghUser = "Yik-Wee"; // my username on GitHub

async function getRepos(username) {
    const reposURL = `${baseURL}/${username}/repos`;
    let repos = await fetch(reposURL, { method: "GET", type: "public" });
    if (!repos.ok) throw new Error(`Error fetching repos for ${username}`);
    repos = await repos.json();
    return repos;
}

async function displayRepos(username) {
    let repos = await getRepos(username);

    for (let repo of repos) {
        let { name, html_url } = repo;
        // let languagesURL = repo['languages_url'];

        let repoName = document.createElement("li");
        repoName.className = "repo-name";

        let repoHyperlink = document.createElement("a");
        repoHyperlink.href = html_url;
        repoHyperlink.textContent = name;
        repoHyperlink.target = "_blank";
        repoName.appendChild(repoHyperlink);
        document.getElementById("repo-names").appendChild(repoName);
    }
}

displayRepos(ghUser);
