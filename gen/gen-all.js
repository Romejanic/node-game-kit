const genSources = require("./source-gen");
const fs = require("fs");

let headerFiles = [
    "include/GLFW/glfw3.h", "GLFW"
];

(async function() {
    for(let i = 0; i < headerFiles.length; i += 2) {
        if(fs.existsSync("./src/" + headerFiles[i+1].toLowerCase() + ".cpp")) {
            console.log("Skipping " + headerFiles[i+1] + " (already exists)");
            continue;
        }
        process.stdout.write("Generating " + headerFiles[i+1] + " (" + headerFiles[i] + ")... ");
        await genSources(headerFiles[0], headerFiles[1]);
        console.log("Done!");
    }
})().catch(console.error);