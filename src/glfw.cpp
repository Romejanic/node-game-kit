#include <node.h>
#include <GLFW/glfw3.h>

void GlfwInit(const v8::FunctionCallbackInfo<v8::Value>& args) {
    v8::Isolate* isolate = args.GetIsolate();
    bool result = (glfwInit() == GLFW_TRUE);
    args.GetReturnValue().Set(v8::Boolean::New(isolate, result));
}

void GlfwTerminate(const v8::FunctionCallbackInfo<v8::Value>& args) {
    glfwTerminate();
    args.GetReturnValue().Set(v8::Undefined(args.GetIsolate()));
}

//==========================INIT==========================//

#define EXPORT_CONST(key, val) exports->Set(v8::String::NewFromUtf8(isolate, key), v8::Number::New(isolate, val))

void Init(v8::Local<v8::Object> exports) {
    v8::Isolate* isolate = exports->GetIsolate();
    // Consts
    EXPORT_CONST("VERSION_MAJOR", GLFW_VERSION_MAJOR);
    EXPORT_CONST("VERSION_MINOR", GLFW_VERSION_MINOR);
    // Methods
    NODE_SET_METHOD(exports, "init", GlfwInit);
    NODE_SET_METHOD(exports, "terminate", GlfwTerminate);
}
NODE_MODULE(NODE_GYP_MODULE_NAME, Init);