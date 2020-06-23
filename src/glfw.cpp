#include <native-helper.h>
#include <GLFW/glfw3.h>

NATIVE_FUNCTION(GlfwInit) {
    v8::Isolate* isolate = args.GetIsolate();
    RETURN(TO_BOOLEAN(glfwInit() == GLFW_TRUE));
}

NATIVE_FUNCTION(GlfwTerminate) {
    glfwTerminate();
    RETURN_UNDEFINED;
}

//==========================INIT==========================//

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