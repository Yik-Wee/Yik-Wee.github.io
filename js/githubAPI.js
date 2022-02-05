const apiBaseURL = "https://api.github.com/users";
const ghUsername = "Yik-Wee"; // my username on GitHub
const repoBaseURL = `https://github.com/${ghUsername}`;
let reposByLanguage = {};

async function getRepos(username) {
    if (!username) return;

    const reposURL = `${apiBaseURL}/${username}/repos?type=public&per_page=100`;
    console.log(reposURL);
    let repos = await fetch(reposURL, { method: "GET" });
    if (!repos.ok) throw new Error(`Error fetching repos for ${username}`);
    repos = await repos.json();
    return repos;
}

async function filterRepos(username) {
    let repos = await getRepos(username);

    for (let repo of repos) {
        console.group(repo.name);
        let languages = await fetch(repo["languages_url"], { method: "GET" });
        if (languages.ok) {
            languages = await languages.json();
            for (const language in languages) {
                console.log(language, languages[language]);
                // if language not key of reposByLanguages
                if (reposByLanguage[language] === undefined) {
                    reposByLanguage[language] = [repo.name];
                } else if (!reposByLanguage[language].includes(language)) {
                    reposByLanguage[language].push(repo.name);
                }
            }
        }
        console.groupEnd();
    }
}

/**
 *
 * @param {string} lang
 * @param {HTMLElement} container
 */
function displayReposByLang(container, event, ...langs) {
    if (event.originalTarget.className === "repo-hyperlink") return;

    let repos = [];
    for (const lang of langs) {
        const reposOfLang = reposByLanguage[lang];
        for (const repoName of reposOfLang) {
            repos.includes(repoName) ? null : repos.push(repoName);
        }
    }

    if (container.classList.contains("displaying-repos")) {
        container.classList.remove("displaying-repos");
        for (const child of container.children) {
            container.removeChild(child);
        }
        return;
    }

    const reposSpan = document.createElement("span");
    reposSpan.setAttribute("class", "repos");
    for (const repoName of repos) {
        const repoHyperlink = document.createElement("a");
        repoHyperlink.setAttribute("href", `${repoBaseURL}/${repoName}`);
        repoHyperlink.setAttribute("target", "_blank");
        repoHyperlink.setAttribute("class", "repo-hyperlink");
        repoHyperlink.textContent = repoName;
        reposSpan.append(repoHyperlink);
    }

    container.append(reposSpan);
    container.classList.add("displaying-repos");
}

filterRepos(ghUsername).then(() => console.log(reposByLanguage));
