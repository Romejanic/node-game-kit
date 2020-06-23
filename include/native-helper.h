#pragma once

// Includes
#include <node.h>

// Type Conversions
#define TO_STRING(x) v8::String::NewFromUtf8(isolate, x)
#define TO_NUMBER(x) v8::Number::New(isolate, x)
#define TO_BOOLEAN(x) v8::Boolean::New(isolate, x)

// Function Helpers
#define NATIVE_FUNCTION(name) void name(const v8::FunctionCallbackInfo<v8::Value>& args)
#define THROW_ERROR(error) isolate->ThrowException(v8::Exception::Error(TO_STRING(error))); return
#define THROW_TYPE_ERROR(error) isolate->ThrowException(v8::Exception::TypeError(TO_STRING(error))); return
#define RETURN(x) args.GetReturnValue().Set(x); return
#define RETURN_UNDEFINED RETURN(v8::Undefined(isolate)); return

// Exports
#define EXPORT_CONST(name, x) exports->Set(TO_STRING(name), TO_NUMBER(x))