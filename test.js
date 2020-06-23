const { GLFW } = require("./index");

GLFW.init();
GLFW.terminate();

console.log(GLFW.VERSION_MAJOR, GLFW.VERSION_MINOR);