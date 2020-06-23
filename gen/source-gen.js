const fs = require("fs").promises;

module.exports = async function(path, prefix) {
    let lines = (await fs.readFile(path)).toString().split("\n");
    //
    let consts = [];
    let methods = {};
    //
    for(let line of lines) {
        line = line.trim();
        if(line.startsWith(`#define ${prefix}_`)) {
            let trimmed = line.substring("#define ".length);
            trimmed = trimmed.substring(0, trimmed.indexOf(" "));
            if(trimmed.length > 0) consts.push(trimmed);
        }
    }
    // debug output
    await fs.writeFile(path + "_export.json", JSON.stringify({ consts, methods }, null, 4));
};