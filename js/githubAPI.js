const baseURL = 'https://api.github.com/users';
const ghUser = 'Yik-Wee'  // my username on GitHub

async function getRepos(username) {
    const reposURL = `${baseURL}/${username}/repos`;
    let repos = await fetch(reposURL, { method: 'GET', type: 'public' });

    if (!repos.ok)
        throw new Error(`Error fetching repos for ${username}`)

    repos = await repos.json();
    return repos;
}

async function displayRepos(username) {
    let repos = await getRepos(username);

    for (let repo of repos) {
        let { name, html_url } = repo;
        // let languagesURL = repo['languages_url'];

        let repoName = document.createElement('li');
        repoName.className = "repo-name";

        let repoHyperlink = document.createElement('a');
        repoHyperlink.href = html_url;
        repoHyperlink.textContent = name;
        repoHyperlink.target = '_blank';
        repoName.appendChild(repoHyperlink);
        document.getElementById('repo-names').appendChild(repoName);
    }
}

function initAccordions() {
    let accordions = document.getElementsByClassName("accordion");

    for (let i = 0; i < accordions.length; i++) {
        accordions[i].addEventListener("click", event => {
            console.log(event.target);
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */
            event.target.classList.toggle("active");
            
            /* Toggle between hiding and showing the active panel */
            var panel = event.target.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
}

displayRepos(ghUser).then(() => initAccordions());
