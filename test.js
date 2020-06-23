const { GLFW } = require("./index");

GLFW.init();

let window = GLFW.createWindow(1280, 720, "Hello javascript!");
GLFW.makeContextCurrent(window);

let loop = setInterval(() => {
    GLFW.swapBuffers(window);
    GLFW.pollEvents();
    if(GLFW.windowShouldClose(window)) {
        clearInterval(loop);
        GLFW.destroyWindow(window);
        GLFW.terminate();
    }
}, 0);