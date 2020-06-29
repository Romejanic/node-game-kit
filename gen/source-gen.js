const fs = require("fs").promises;

const SRC_TEMPLATE = require("fs").readFileSync("src/_template.cpp").toString();

const TYPE_MAP = {
    "void": "undefined",
    "int": "number",
    "float": "number",
    "double": "number",
    "const char*": "string",
    "GLFWwindow*": "pointer",
    "GLFWmonitor*": "pointer",
    "GLFWcursor*": "pointer",
    "GLFWglproc": "pointer",
    "GLFWvkproc": "pointer",
    "void*": "pointer",
    "GLenum": "number",
    "GLuint": "number",
    "GLint": "number",
    "GLsizei": "number",
    "GLfloat": "number",
    "GLdouble": "number",
    "GLboolean": "number"
};

module.exports = async function(path, prefix) {
    let lines = (await fs.readFile(path)).toString().split("\n");
    //
    let consts = [];
    let methods = {};
    let objectDefs = {};
    //
    for(let i in lines) {
        let line = lines[i];
        line = line.trim();
        if(line.startsWith(`#define ${prefix}_`)) {
            // CONSTANT
            let trimmed = line.substring("#define ".length);
            trimmed = trimmed.substring(0, trimmed.indexOf(" "));
            if(trimmed.length > 0) consts.push(trimmed);
        } else if(line.startsWith(`${prefix}API `)) {
            // API METHOD
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
                // if(types.indexOf(type) < 0) types.push(type);
            }
        } else if(line.startsWith("typedef struct") && !line.endsWith(";")) {
            // OBJECT STRUCT
            let structName = line.substring("typedef struct ".length).trim();
            if(objectDefs[structName]) {
                continue; // skip if already defined
            }
            objectDefs[structName] = {};
            while(line.indexOf(structName+";") < 0) {
                // next line
                i++; line = lines[i].trim();
                // skip curly braces and comments
                if(line.indexOf("{") < 0 && line.indexOf("}") < 0 && line.indexOf("/*") < 0 && line.indexOf("*/") < 0 && !line.startsWith("*")) {
                    let idx = line.lastIndexOf(" ");
                    let varName = line.substring(idx+1);
                    let varType = line.substring(0,idx);
                    objectDefs[structName][varName.substring(0,varName.length-1)] = varType;
                }
            }
            // check type map
            if(TYPE_MAP[structName] !== "object")  {
                TYPE_MAP[structName] = "object";
            }
            if(TYPE_MAP["const " + structName] !== "object") {
                TYPE_MAP["const "+ structName] = "object";
            }
        }
    }
    // debug output
    await fs.writeFile(`debug_${prefix}_members.json`, JSON.stringify({ consts, methods, objectDefs }, null, 4));
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
                            funcs += convertFromV8Argument(method.arguments[i], i);
                        }
                        let argArr = [];
                        for(let i = 0; i < argCount; i++) {
                            argArr.push(method.arguments[i].name);
                        }
                        argArr = argArr.join(", ");
                        if(hasReturn) {
                            funcs += convertToV8Return(funcName, method, argArr);
                        } else {
                            funcs += `\t${funcName}(${argArr});\n`;
                        }
                    } else if(hasReturn) {
                        funcs += convertToV8Return(funcName, method, "");
                    } else {
                        // just call function and move on
                        funcs += `\t${funcName}();\n`;
                    }
                    // end function
                    funcs += `}\n`;
                }
                src[i] = funcs;
                break;
            case "//<STRUCT-CONVERSION>":
                let structs = "";
                for(let structName in objectDefs) {
                    // v8 -> struct
                    structs += `${structName}* _to${structName}(v8::Local<v8::Object> arg) {\n`;
                    structs += `\tv8::Isolate* isolate = arg->GetIsolate();\n`;
                    structs += `\t${structName}* ret = (${structName}*)malloc(sizeof(${structName}));\n`;
                    for(let varName in objectDefs[structName]) {
                        structs += `\tret->${varName} = arg->Get(TO_STRING("${varName}"))->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);\n`;
                    }
                    structs += `\treturn ret;\n`;
                    structs += `}\n`;
                    // struct -> v8
                    structs += `v8::Local<v8::Object> _from${structName}(const ${structName}* arg) {\n`;
                    structs += `\tv8::Isolate* isolate = v8::Isolate::GetCurrent();\n`;
                    structs += `\tv8::Local<v8::Object> ret = v8::Object::New(isolate);\n`;
                    for(let varName in objectDefs[structName]) {
                        let isArray = varName.indexOf("[") > 0 && varName.charAt(varName.length-1) === "]";
                        if(isArray) {
                            let length = varName.substring(varName.indexOf("[")+1,varName.indexOf("]"));
                            varName = varName.substring(0, varName.indexOf("["));
                            structs += `\tv8::Local<v8::Array> ${varName}Arr = v8::Array::New(isolate, ${length});\n`;
                            structs += `\tfor(int i = 0; i < ${length}; i++) {\n`;
                            structs += `\t\t${varName}Arr->Set(i, TO_NUMBER(arg->${varName}[i]));\n`;
                            structs += `\t}\n`;
                            structs += `\tret->Set(TO_STRING("${varName}"), ${varName}Arr);\n`;
                        } else {
                            structs += `\tret->Set(TO_STRING("${varName}"), TO_NUMBER(arg->${varName}));\n`;
                        }
                    }
                    structs += `\treturn ret;\n`;
                    structs += `}\n`;
                }
                src[i] = structs;
                break;
            default:
                continue; // skip line
        }
    }
    // write source to file
    src = src.join("\n");
    await fs.writeFile(`./src/${prefix.toLowerCase()}.cpp`, src);
};

function convertFromV8Argument(arg, i) {
    let out = addTypeCheck(arg, i);
    switch(arg.type) {
        case "int":
        case "GLuint":
        case "GLint":
            out += `\t${arg.type} ${arg.name} = args[${i}]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);\n`;
            break;
        case "double":
        case "float":
        case "GLfloat":
        case "GLdouble":
            out += `\t${arg.type} ${arg.name} = args[${i}]->NumberValue(isolate->GetCurrentContext()).FromMaybe(0);\n`;
            break;
        case "const char*":
            out += `\tconst char* ${arg.name} = (const char*)(*v8::String::Utf8Value(isolate, args[${i}]));\n`;
            break;
        default:
            if(TYPE_MAP[arg.type] === "pointer") {
                out += `\t${arg.type} ${arg.name};\n`;
                out += `\tif(args[${i}]->IsNullOrUndefined()) { ${arg.name} = NULL; }\n`;
                out += `\telse { ${arg.name} = reinterpret_cast<${arg.type}>(args[${i}]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0)); }\n`;
            }
            break;
    }
    return out;
}

function addTypeCheck(arg, i) {
    switch(TYPE_MAP[arg.type]) {
        case "number":
            return `\tif(!args[${i}]->IsNumber()) { THROW_TYPE_ERROR("${arg.name} is of type ${TYPE_MAP[arg.type]}!"); }\n`;
        case "pointer":
            return `\tif(!args[${i}]->IsNumber() && !args[${i}]->IsNullOrUndefined()) { THROW_TYPE_ERROR("${arg.name} is of type ${TYPE_MAP[arg.type]}!"); }\n`;
        case "string":
            return `\tif(!args[${i}]->IsString()) { THROW_TYPE_ERROR("${arg.name} is of type ${TYPE_MAP[arg.type]}!"); }\n`;
        default:
            return `\t//!UNKNOWN TYPE for ${arg.name} (type: '${arg.type}')!//\n`;
    }
}

function convertToV8Return(name, method, argArr) {
    if(method.returnType.endsWith("fun")) {
        // we can't return function callbacks in js, so treat
        // it like a void method
        return `\t${name}(${argArr});\n`;
    }
    let out = `\t${method.returnType} ret = ${name}(${argArr});\n`;
    switch(method.returnType) {
        case "int":
        case "float":
        case "double":
        case "uint64_t":
            out += `\tRETURN(TO_NUMBER(ret));\n`;
            break;
        case "const char*":
            out += `\tRETURN(TO_STRING(ret));\n`;
            break;
        default:
            if(TYPE_MAP[method.returnType] === "pointer") {
                out += `\tRETURN(TO_NUMBER((uint64_t)ret));\n`;
            } else if(TYPE_MAP[method.returnType.substring(0,method.returnType.length-1)] === "object") {
                let structName = method.returnType.startsWith("const ") ? method.returnType.substring("const ".length) : method.returnType;
                out += `\tRETURN(_from${structName.substring(0,structName.length-1)}(ret));\n`;
            } else {
                out += `\t//!UNKNOWN RETURN TYPE for ${name}//\n`;
            }
            break;
    }
    return out;
}