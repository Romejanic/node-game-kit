/*
 * ====================== WARNING ========================
 * This file is (mostly) autogenerated. It should NOT be edited
 * unless there are errors to fix or something has gone wrong.
 * 
 * Instead, you should run:
 *  npm run gen-src
 * 
 * to automatically regenerate this file based on the associated
 * header file.
 */

#include <config.h>
#include <native-helper.h>
//<INCLUDE-HEADER>

//==========================STRUCTS==========================//
//<STRUCT-CONVERSION>

//==========================METHODS==========================//
//<FUNCTIONS>

//==========================INIT==========================//

void ExportModule(v8::Local<v8::Object> exports) {
    v8::Isolate* isolate = exports->GetIsolate();
    // Consts
    //<CONSTANTS>
    // Methods
    //<FUNC-EXPORTS>
}
NODE_MODULE(NODE_GYP_MODULE_NAME, ExportModule);