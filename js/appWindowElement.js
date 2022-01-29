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

/**
 *
 * @param {HTMLElement} element The element to make resizable by dragging its borders
 * @param {HTMLElement} handle The border of the element
 */
function makeResizable(element, handle) {}

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

const appWindowIdPrefix = "app-window-";

/**
 *
 * @param {string | number} windowNumber the id of the window to remove
 */
function removeAppWindow(windowNumber) {
    const windowId = `${appWindowIdPrefix}${windowNumber}`;
    const appWindow = document.getElementById(windowId);
    if (appWindow != null) {
        appWindow.remove();
        AppWindow.windowCount--;
        console.log(AppWindow.windowCount, "windows active");
    } else {
        console.log(`<app-window id="${windowId}"> not found`);
    }
}

class AppWindow extends HTMLElement {
    static windowCount = 0;
    static activeWindows = [];

    constructor() {
        super();
        AppWindow.activeWindows.push(this);
        AppWindow.windowCount++;
        console.log(AppWindow.windowCount, "windows active");
    }

    connectedCallback() {
        let shadow = this.attachShadow({ mode: "open" });
        this.setAttribute("id", `${appWindowIdPrefix}${AppWindow.windowCount}`);

        // Make the window (div)
        let width = this.getAttribute("width") || "200px";
        let height = this.getAttribute("height") || "200px";
        const wrapper = document.createElement("div");
        wrapper.setAttribute("class", "wrapper");
        wrapper.setAttribute("style", `height: ${height}; width: ${width};`);
        wrapper.style.height = height;
        wrapper.style.width = width;
        wrapper.style.top =
            100 + Math.random() * (window.screen.height - 500) + "px";
        wrapper.style.left =
            100 + Math.random() * (document.body.clientWidth - 300) + "px";
        console.log(document.body.clientWidth, window.screen.height);

        // Make the top of window (title + quit 'x')
        const top = document.createElement("div");
        top.setAttribute("class", "window-top");

        const titleArea = document.createElement("div");
        const title = this.getAttribute("title");
        titleArea.setAttribute("class", "overflow-ellipses title-area");
        titleArea.textContent = title;

        const quitButton = document.createElement("button");
        quitButton.textContent = "x";
        quitButton.setAttribute(
            "onclick",
            `removeAppWindow(${AppWindow.windowCount})`
        );

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
