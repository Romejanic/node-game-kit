function getModule(name) {
    try {
        return require("./build/Release/" + name);
    } catch(e) {
        return require("./build/Debug/" + name);
    }
}

module.exports = {
    Test: getModule("test")
};