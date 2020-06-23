const genSources = require("./source-gen");

let headerFiles = [
    "include/GLFW/glfw3.h", "GLFW"
];

(async function() {
    for(let i = 0; i < headerFiles.length; i += 2) {
        process.stdout.write("Generating " + headerFiles[i+1] + " (" + headerFiles[i] + ")... ");
        await genSources(headerFiles[0], headerFiles[1]);
        console.log("Done!");
    }
})().catch(console.error);