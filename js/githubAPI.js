const apiBaseURL = "https://api.github.com/users";
const ghUsername = "Yik-Wee"; // my username on GitHub
const repoBaseURL = `https://github.com/${ghUsername}`;

/**
 * e.g. {
 *     "Python": [
 *          {
 *              "name": "py-repo-1",
 *              "description": "py-repo-1's description...",
 *          },
 *          ...
 *      ],
 *      "TypeScript": [
 *          {
 *              "name": "ts-repo-1",
 *              "description": "ts-repo-1's description..."
 *          },
 *          ...
 *      ]
 * }
 */
let reposByLanguage = {};

/**
 * Fetches the repos of the GitHub user `username`
 * @param {string} username
 * @returns The array of repo data fetched from the GitHub API if response was ok
 * @returns An empty array otherwise
 */
async function getRepos(username) {
    if (!username) return;

    const reposURL = `${apiBaseURL}/${username}/repos?type=public&per_page=100`;
    console.log(reposURL);
    let repos = await fetch(reposURL, { method: "GET" });
    if (!repos.ok) {
        console.error(`Error fetching repos for ${username}`);
        return [];
    }
    repos = await repos.json();
    return repos;
}

/**
 *
 * @param {string} languagesURL
 * @returns array of languages from `languagesURL` if response was ok
 * @returns empty array otherwise
 */
async function getLanguages(languagesURL) {
    let langs = await fetch(languagesURL, { method: "GET" });
    if (!langs.ok) {
        console.error(`Error fetching languages from ${languagesURL}`);
        return [];
    }
    langs = await langs.json();
    return langs;
}

function getCachedRepos() {
    const cachedJSONString = localStorage.getItem("cachedRepos");
    try {
        // convert stored json string to js obj
        const cachedRepos = JSON.parse(cachedJSONString);

        // cachedRepos cannot be empty
        if (Object.keys(cachedRepos).length === 0) return;

        // check that cached repos is correct format
        for (const lang in cachedRepos) {
            // lang must be string
            if (typeof lang !== "string") return;

            // value must be arr of repos
            const repos = cachedRepos[lang];
            if (repos.constructor !== Array) return;

            // each repo in arr of repos must have name, description attr
            for (const repo of repos) {
                if (!repo.name || !typeof repo.description === "string") return;
            }
        }

        // correct format, return cachedRepos
        return cachedRepos;
    } catch (err) {
        return;
    }
}

async function filterRepos(username) {
    const timestamp = parseInt(localStorage.getItem("timestamp")) || 0;
    const timeNow = Date.now();
    const cachedReposByLanguage = getCachedRepos();
    const cacheDuration = 600_000; // 600_000 ms = 10 min before caching next API call

    // cached repos exist and API cache not expired
    if (
        cachedReposByLanguage !== undefined &&
        timeNow - timestamp < cacheDuration
    ) {
        console.info("Using cached repos");

        // use the cache instead to avoid exceeding github api rate limit
        reposByLanguage = cachedReposByLanguage;
        return;
    }

    // no cached repos found OR API cache has expired (10 min) -> new req
    let repos = await getRepos(username);

    for (let repo of repos) {
        const { name, languages_url, description } = repo;

        console.group(name);
        console.log(description);

        let languages = await getLanguages(languages_url);
        for (const language in languages) {
            console.log(language, languages[language]);
            const repoInfo = { name, description };

            // if language not key of reposByLanguages
            if (reposByLanguage[language] === undefined) {
                reposByLanguage[language] = [repoInfo];
            } else {
                reposByLanguage[language].push(repoInfo);
            }
        }
        console.groupEnd();
    }

    localStorage.setItem("timestamp", Date.now().toString());
    localStorage.setItem("cachedRepos", JSON.stringify(reposByLanguage));
}

/**
 * Displays info of repos written in specified languages `langs` in the `container`
 * @param {string} lang the languages to filter the repos by
 * @param {HTMLElement} container the container to display the repos in
 */
function displayReposByLang(container, event, ...langs) {
    if (event.originalTarget.className === "repo-hyperlink") return;
    /**
     * [
     *      {
     *          name: "repo-1",
     *          description: "desc-1",
     *      },
     *      {
     *          name: "repo-2",
     *          description: "desc-2",
     *      },
     *      ...
     * ]
     */
    let repos = [];

    // add repo of each lang specified to repos without duplicates
    for (const lang of langs) {
        const reposOfLang = reposByLanguage[lang];

        // repos of specified lang(s) undefined -> no such repos exist
        if (reposOfLang === undefined) {
            console.warn(`No repos written in ${langs}`);
            return;
        }

        for (const repoInfo of reposOfLang) {
            // the repo of `name` alr inside repos -> don't add duplicate
            let exists = false;

            // linear search to find existing repo info (inefficient but wtv not many repos)
            for (const existingRepoInfo of repos) {
                if (existingRepoInfo.name === repoInfo.name) {
                    exists = true;
                    break;
                }
            }

            if (!exists) repos.push(repoInfo); // no duplicates -> add
        }
    }

    // container is already displaying repos -> click again to stop displaying
    if (container.classList.contains("displaying-repos")) {
        // remove display styling
        container.classList.remove("displaying-repos");

        // remove each child (`repoInfo`) of the active display container
        for (const child of container.children) {
            container.removeChild(child);
        }
        return;
    }

    // container not alr displaying repos -> add content & styling
    const reposSpan = document.createElement("span");
    reposSpan.setAttribute("class", "repos");

    // add name & desc of each repo to display container
    for (const { name, description } of repos) {
        const repoHyperlink = document.createElement("a");
        repoHyperlink.setAttribute("href", `${repoBaseURL}/${name}`);
        repoHyperlink.setAttribute("target", "_blank");
        repoHyperlink.setAttribute("class", "repo-hyperlink");
        repoHyperlink.textContent = name;

        const descContainer = document.createElement("div");
        descContainer.setAttribute("class", "repo-description");
        descContainer.textContent = description;

        const repoInfoContainer = document.createElement("div");
        repoInfoContainer.setAttribute("class", "repo");
        repoInfoContainer.append(repoHyperlink, descContainer);
        reposSpan.append(repoInfoContainer);
    }

    container.append(reposSpan);
    container.classList.add("displaying-repos");
}

filterRepos(ghUsername).then(() => console.log(reposByLanguage));
