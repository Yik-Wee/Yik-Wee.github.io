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

// TODO
// /**
//  *
//  * @param {HTMLElement} element The element to make resizable by dragging its borders
//  * @param {HTMLElement} handle The border of the element
//  */
// function makeResizable(element, handle) {}

/**
 *
 * @param {AppWindow} appWindow
 */
function makeFocusable(appWindow) {
    function onClick(e) {
        if (appWindow.isFocussed()) return;

        for (let win of AppWindow.activeWindows) {
            if (win.isFocussed()) {
                win.unfocusAppWindow();
            }
        }
        appWindow.focusAppWindow();
    }

    appWindow.addEventListener("click", onClick);
    appWindow.addEventListener("touchstart", onClick);
}

const appWindowPrefix = "app-window-";

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

        this.setAttribute("id", appWindowPrefix + title.toLowerCase()); // <app-window id={title}></app-window>

        const quitButton = document.createElement("div");
        quitButton.setAttribute("class", "quit-button");
        quitButton.textContent = "x";

        // click/touchstart to remove window
        quitButton.addEventListener("click", this.remove.bind(this));
        quitButton.addEventListener("touchstart", this.remove.bind(this));

        top.append(titleArea, quitButton);

        // make window draggable
        makeDraggable(wrapper, top);
        makeFocusable(this);
        // TODO make resizable

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

function spawnWindow(appWindowAttrs, appWindowInnerHTML) {
    const windowId = appWindowPrefix + appWindowAttrs.title?.toLowerCase();
    const possibleAppWindow = document.getElementById(windowId);
    if (possibleAppWindow) {
        possibleAppWindow.click(); // click to focus the window
        console.log(`${windowId} already exists`);
        return;
    }

    const windows = document.getElementById("windows");
    const newWindow = document.createElement("app-window");
    for (const attr in appWindowAttrs) {
        newWindow.setAttribute(attr, appWindowAttrs[attr]);
    }
    newWindow.innerHTML = appWindowInnerHTML;
    windows.appendChild(newWindow);
    return newWindow;
}

window.onload = (e) => {  // spawn each AppWindow after delay
    const spawnDelay = 250;
    setTimeout(() => {
        spawnWindow(aboutMeAttrs, aboutMeHTML);
    }, spawnDelay);
    setTimeout(() => {
        spawnWindow(languagesAttrs, languagesHTML);
    }, spawnDelay*2);
};
