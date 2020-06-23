#include <node.h>
#include <GLFW/glfw3.h>

void WhoAmI(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    auto message = v8::String::NewFromUtf8(isolate, "sup y'all");
    args.GetReturnValue().Set(message);
}

//==========================INIT==========================//

#define EXPORT_CONST(key, val) exports->Set(v8::String::NewFromUtf8(isolate, key), v8::Number::New(isolate, val))

void Init(v8::Local<v8::Object> exports) {
    v8::Isolate* isolate = exports->GetIsolate();
    // Consts
    EXPORT_CONST("testing", 50);
    // Methods
    NODE_SET_METHOD(exports, "whoAmI", WhoAmI);
}
NODE_MODULE(NODE_GYP_MODULE_NAME, Init);