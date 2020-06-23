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
        } else if(line.startsWith(`${prefix}API `)) {
            let trimmed = line.substring(`${prefix}API `.length);
            let header = trimmed.substring(0, trimmed.indexOf("("));
            let returnType = header.substring(0, header.lastIndexOf(" "));
            let functionName = header.substring(header.lastIndexOf(" ")+1);
            methods[functionName] = {
                returnType,
                arguments: []
            };
            let args = trimmed.substring(trimmed.indexOf("(")+1,trimmed.indexOf(")")).split(", ");
            if(args == "void") continue; // skip no arguments
            for(let argStr of args) {
                let type = argStr.substring(0, argStr.lastIndexOf(" "));
                let name = argStr.substring(argStr.lastIndexOf(" ")+1);
                methods[functionName].arguments.push({
                    type, name
                });
            }
        }
    }
    // debug output
    await fs.writeFile(`debug_${prefix}_members.json`, JSON.stringify({ consts, methods }, null, 4));
    //

};