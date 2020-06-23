const fs = require("fs").promises;

module.exports = async function(path, prefix) {
    let lines = (await fs.readFile(path))
    .split("\n");
    //
    let consts = [];
    let methods = [];
    //
    for(let line of lines) {
        if(line.startsWith(`#define ${prefix}_`)) {
            let trimmed = line.substring("#define ".length);
            consts.push(trimmed.substring(0, trimmed.indexOf(" ")));
        }
    }
    // debug output
    await fs.writeFile(path + "_export.json", JSON.stringify(consts));
};