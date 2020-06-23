#pragma once
#include <node.h>

// Convert to v8 values
#define TO_STRING(x) v8::String::NewFromUtf8(isolate, x)
#define TO_NUMBER(x) v8::Number::New(isolate, x)
#define TO_BOOLEAN(x) v8::Boolean::New(isolate, x)

// Function header
#define NATIVE_FUNCTION(name) void name(const v8::FunctionCallbackInfo<v8::Value>& args)

// Returns
#define RETURN(x) args.GetReturnValue().Set(x)
#define RETURN_UNDEFINED args.GetReturnValue().Set(v8::Undefined(args.GetIsolate()))

// Export constants
#define EXPORT_CONST(key, val) exports->Set(TO_STRING(key), TO_NUMBER(val))