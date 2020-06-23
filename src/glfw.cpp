#include <native-helper.h>
#include <GLFW/glfw3.h>

NATIVE_FUNCTION(GlfwInit) {
    v8::Isolate* isolate = args.GetIsolate();
    RETURN(TO_BOOLEAN(glfwInit() == GLFW_TRUE));
}

NATIVE_FUNCTION(GlfwTerminate) {
    glfwTerminate();
}

NATIVE_FUNCTION(GlfwDestroyWindow) {
    v8::Isolate* isolate = args.GetIsolate();
    if(args.Length() < 1) {
        THROW_ERROR("You must pass a window handle!");
    }
    if(!args[0]->IsNumber()) {
        THROW_TYPE_ERROR("Window handle must be a number!");
    }
    GLFWwindow* win = reinterpret_cast<GLFWwindow*>(args[0]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0));
    glfwDestroyWindow(win);
    RETURN_UNDEFINED;
}

NATIVE_FUNCTION(GlfwCreateWindow) {
    v8::Isolate* isolate = args.GetIsolate();
    if(args.Length() < 3) {
        THROW_ERROR("This method requires at least 3 parameters");
    }
    if(!args[0]->IsNumber() || !args[1]->IsNumber()) { THROW_TYPE_ERROR("Width and height must be numbers!"); }
    if(!args[2]->IsString()) { THROW_TYPE_ERROR("Title must be a string!"); }
    int width = args[0]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);
    int height = args[1]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);
    v8::String::Utf8Value title(isolate, args[2]);
    GLFWwindow* win = glfwCreateWindow(width, height, (const char*)(*title), NULL, NULL);
    RETURN(TO_NUMBER((uint64_t)win));
}

NATIVE_FUNCTION(GlfwSwapBuffers) {
    v8::Isolate* isolate = args.GetIsolate();
    if(args.Length() < 1) {
        THROW_ERROR("This method requires at least 1 parameter");
    }
    if(!args[0]->IsNumber()) { THROW_TYPE_ERROR("Window handle must be a number!"); }
    int64_t handle = args[0]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);
    GLFWwindow* win = reinterpret_cast<GLFWwindow*>(handle);
    glfwSwapBuffers(win);
}

NATIVE_FUNCTION(GlfwMakeContextCurrent) {
    v8::Isolate* isolate = args.GetIsolate();
    if(args.Length() < 1) {
        THROW_ERROR("This method requires at least 1 parameter");
    }
    if(!args[0]->IsNumber()) { THROW_TYPE_ERROR("Window handle must be a number!"); }
    int64_t handle = args[0]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);
    GLFWwindow* win = reinterpret_cast<GLFWwindow*>(handle);
    glfwMakeContextCurrent(win);
}

NATIVE_FUNCTION(GlfwPollEvents) {
    glfwPollEvents();
}

NATIVE_FUNCTION(GlfwWindowShouldClose) {
    v8::Isolate* isolate = args.GetIsolate();
    if(args.Length() < 1) {
        THROW_ERROR("This method requires at least 1 parameter");
    }
    if(!args[0]->IsNumber()) { THROW_TYPE_ERROR("Window handle must be a number!"); }
    int64_t handle = args[0]->IntegerValue(isolate->GetCurrentContext()).FromMaybe(0);
    GLFWwindow* win = reinterpret_cast<GLFWwindow*>(handle);
    RETURN(TO_BOOLEAN(glfwWindowShouldClose(win) == GLFW_TRUE));
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
    NODE_SET_METHOD(exports, "createWindow", GlfwCreateWindow);
    NODE_SET_METHOD(exports, "destroyWindow", GlfwDestroyWindow);
    NODE_SET_METHOD(exports, "swapBuffers", GlfwSwapBuffers);
    NODE_SET_METHOD(exports, "pollEvents", GlfwPollEvents);
    NODE_SET_METHOD(exports, "makeContextCurrent", GlfwMakeContextCurrent);
    NODE_SET_METHOD(exports, "windowShouldClose", GlfwWindowShouldClose);
}
NODE_MODULE(NODE_GYP_MODULE_NAME, Init);