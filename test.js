const { GLFW } = require("./index");

// initialize GLFW first
if(!GLFW.init()) {
    throw "GLFW failed to initialize!";
}

// set all of our window hints
// most importantly, set OpenGL version to >=3.2
GLFW.defaultWindowHints();
GLFW.windowHint(GLFW.RESIZABLE, GLFW.TRUE);
GLFW.windowHint(GLFW.VISIBLE, GLFW.FALSE);
GLFW.windowHint(GLFW.CONTEXT_VERSION_MAJOR, 3);
GLFW.windowHint(GLFW.CONTEXT_VERSION_MINOR, 2);
GLFW.windowHint(GLFW.OPENGL_PROFILE, GLFW.OPENGL_CORE_PROFILE);
GLFW.windowHint(GLFW.OPENGL_FORWARD_COMPAT, GLFW.TRUE);

// Create the window
let window = GLFW.createWindow(1280, 720, "Hello javascript!", null, null);
if(!window) {
    GLFW.terminate();
    throw "Failed to create window!";
}

// Center the window on screen
let size = GLFW.getWindowSize(window);
let vidMode = GLFW.getVideoMode(GLFW.getPrimaryMonitor());
GLFW.setWindowPos(window, (vidMode.width-size.width)/2, (vidMode.height-size.height)/2);

// Make the context current and show the window
GLFW.makeContextCurrent(window);
GLFW.showWindow(window);

// Start the render loop
let loop = setInterval(() => {
    // Change title based on window position
    let pos = GLFW.getWindowPos(window);
    GLFW.setWindowTitle(window, `I am at ${pos.xpos} ${pos.ypos}`);

    // Refresh the window and GLFW
    GLFW.swapBuffers(window);
    GLFW.pollEvents();

    // Did the user click the close button?
    if(GLFW.windowShouldClose(window)) {
        // If so, tear down GLFW
        clearInterval(loop);
        GLFW.destroyWindow(window);
        GLFW.terminate();
    }
}, 0);