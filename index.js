function getModule(name) {
    try {
        return require("./build/Release/" + name + ".node");
    } catch(e) {
        return require("./build/Debug/" + name + ".node");
    }
}

module.exports = {
    GLFW: getModule("glfw")
};