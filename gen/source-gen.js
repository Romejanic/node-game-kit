const fs = require("fs").promises;

const SRC_TEMPLATE = require("fs").readFileSync("src/_template.cpp").toString();

const TYPE_MAP = {
    "void": "undefined",
    "int": "number",
    "float": "number",
    "double": "number",
    "const char*": "string",
    "double*": "pointer"
};

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
    // generate source file
    let src = SRC_TEMPLATE.split("\n");
    for(let i in src) {
        let line = src[i].trim();
        switch(line) {
            case "//<INCLUDE-HEADER>":
                src[i] = `#include <${path.substring("include/".length)}>`;
                break;
            case "//<CONSTANTS>":
                let constStr = "";
                for(let c of consts) {
                    constStr += `\tEXPORT_CONST("${c.substring(c.indexOf("_")+1)}", ${c});\n`;
                }
                src[i] = constStr;
                break;
            case "//<FUNC-EXPORTS>":
                let funcStr = "";
                for(let funcName in methods) {
                    funcName = funcName.substring(prefix.length);
                    let jsName = funcName.charAt(0).toLowerCase() + funcName.substring(1);
                    funcStr += `\tNODE_SET_METHOD(exports, "${jsName}", ${funcName});\n`;
                }
                src[i] = funcStr;
                break;
            case "//<FUNCTIONS>":
                let funcs = "";
                for(let funcName in methods) {
                    let methodName = funcName.substring(prefix.length);
                    let method = methods[funcName];
                    // print function header
                    funcs += `NATIVE_FUNCTION(${methodName}) {\n`;
                    // print function body
                    let hasArgs = method.arguments.length > 0;
                    let hasReturn = method.returnType !== "void";
                    if(hasArgs || hasReturn) {
                        // reference isolate if needed
                        funcs += `\tv8::Isolate* isolate = args.GetIsolate();\n`;
                    }
                    if(hasArgs) {
                        let argCount = method.arguments.length;
                        funcs += `\tif(args.Length() < ${method.arguments.length}) { THROW_ERROR("${methodName} takes ${argCount} arguments."); }\n`;
                        for(let i = 0; i < argCount; i++) {
                            switch(TYPE_MAP[method.arguments[i].type]) {
                                case "number":
                                    funcs += `\tif(!args[${i}]->IsNumber()) { THROW_TYPE_ERROR("${method.arguments[i].name} is of type ${TYPE_MAP[method.arguments[i].type]}!"); }\n\t${method.arguments[i].type} arg${i} = args[${i}]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);\n`;
                                    break;
                                default:
                                    funcs += `\t//!UNKNOWN TYPE for arg${i}!//\n`;
                                    break;
                            }
                        }
                    } else if(hasReturn) {
                        funcs += `\t${method.returnType} ret = ${funcName}();\n\tRETURN(TO_NUMBER(ret));\n`;
                    } else {
                        // just call function and move on
                        funcs += `\t${funcName}();\n`;
                    }
                    // end function
                    funcs += `}\n`;
                }
                src[i] = funcs;
                break;
            default:
                continue; // skip line
        }
    }
    // write source to file
    src = src.join("\n");
    await fs.writeFile(`./src/${prefix.toLowerCase()}.cpp`, src);
};