const genSources = require("./source-gen");

let headerFiles = [
    "", "GLFW"
];

(async function() {
    for(let i = 0; i < headerFiles.length; i += 2) {
        console.log("Generating " + headerFiles[i+1] + " (" + headerFiles[i] + ")...");
        await genSources(headerFiles[0], headerFiles[1]);
    }
})().catch(console.error);