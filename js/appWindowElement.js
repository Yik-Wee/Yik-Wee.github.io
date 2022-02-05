const appWindowPrefix = "app-window-";

/**
 *
 * @param {HTMLElement} element The element to make draggable
 * @param {HTMLElement} childElement The child of element to click to drag
 */
function makeDraggable(element, childElement) {
    let [pos1, pos2, pos3, pos4] = [0, 0, 0, 0];
    childElement.onmousedown = childElement.ontouchstart = (e) => {
        e.preventDefault();
        pos3 = e.clientX || e.targetTouches[0].clientX;
        pos4 = e.clientY || e.targetTouches[0].clientY;

        document.onmouseup = document.ontouchend = (e) => {
            document.onmouseup = null;
            document.ontouchend = null;
            document.onmousemove = null;
            document.ontouchmove = null;
        };
        document.onmousemove = (e) => {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            element.style.top = element.offsetTop - pos2 + "px";
            element.style.left = element.offsetLeft - pos1 + "px";
        };
        document.ontouchmove = (e) => {
            e.preventDefault();
            const touchLocation = e.targetTouches[0];

            element.style.top = touchLocation.pageY + "px";
            element.style.left = touchLocation.pageX + "px";
        };
    };
}

class AppWindow extends HTMLElement {
    static activeWindows = [];

    constructor() {
        super();
        AppWindow.activeWindows.push(this);
    }

    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" });

        // Make the window (div)
        let width = this.getAttribute("width") || "200px";
        let height = this.getAttribute("height") || "200px";
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "wrapper");
        wrapper.style.height = height;
        wrapper.style.width = width;
        wrapper.style.top = this.getAttribute("pos-y") || "0";
        wrapper.style.left = this.getAttribute("pos-x") || "0";

        // Make the top of window (title + quit 'x')
        const top = document.createElement("div");
        top.setAttribute("class", "window-top");

        const titleArea = document.createElement("div");
        const title = this.getAttribute("title");
        titleArea.setAttribute("class", "overflow-ellipses title-area");
        titleArea.textContent = title;

        // id not set - auto set id
        // e.g. <app-window title="About Me" id="app-window-about-me"></app-window>
        if (!this.getAttribute("id")) {
            const thisId =
                appWindowPrefix + title.trim().toLowerCase().replace(" ", "-");
            this.setAttribute("id", thisId);
        }

        const quitButton = document.createElement("div");
        quitButton.setAttribute("class", "quit-button");
        quitButton.textContent = "x";

        // click/touchstart to remove window
        quitButton.addEventListener("click", this.remove.bind(this));
        quitButton.addEventListener("touchstart", this.remove.bind(this));

        top.append(titleArea, quitButton);

        // make window draggable
        makeDraggable(wrapper, top);

        // make focussable (z-index++ on click)
        this.onclick = this.ontouchstart = (e) => {
            if (this.isFocussed()) return;

            // in case >1 windows focussed (ppl hackermans the html)
            for (const win of AppWindow.activeWindows) {
                if (win.isFocussed()) {
                    win.unfocusAppWindow();
                }
            }
            this.focusAppWindow();
        };

        // make the body of the window
        const body = document.createElement("div");

        body.setAttribute("class", "window-body");
        setTimeout(() => {
            body.append(...this.childNodes);
        }, 0);

        wrapper.append(top, body);

        // add stylesheet for app-window
        let style = document.createElement("link");
        style.setAttribute("rel", "stylesheet");
        style.setAttribute("type", "text/css");
        style.setAttribute("href", "/css/appWindow.css");

        shadow.append(style, wrapper);
        this.wrapper = wrapper;
        this.fadeIn();
    }

    fadeIn() {
        this.animate([{ opacity: "0" }, { opacity: "1" }], { duration: 250 });
    }

    isFocussed() {
        return this.wrapper.classList.contains("window-focus");
    }

    unfocusAppWindow() {
        this.wrapper.classList.remove("window-focus");
    }

    focusAppWindow() {
        this.wrapper.classList.add("window-focus");
    }
}

customElements.define("app-window", AppWindow);

function getAppWindowById(id) {
    return document.getElementById(id);
}

window.onload = (e) => {
    const windowsContainer = document.getElementById("windows");

    const aboutMeId = appWindowPrefix + "about-me";
    const aboutMe = getAppWindowById(aboutMeId);
    window.spawnAboutMe = () => {
        if (getAppWindowById(aboutMeId)) return;
        windowsContainer.append(aboutMe);
        // app-window elems alr init'd so connectedCallback/fadeIn won't be called again
        aboutMe.fadeIn();
    };

    const languagesId = appWindowPrefix + "languages";
    const languages = getAppWindowById(languagesId);
    window.spawnLanguages = () => {
        if (getAppWindowById(languagesId)) return;
        windowsContainer.append(languages);
        languages.fadeIn();
    };
};
