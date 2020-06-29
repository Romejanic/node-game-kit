{
    "variables": {
        "libs": "<@(module_root_dir)/lib"
    },
    "targets": [
        { # GLFW #
            "target_name": "glfw",
            "sources": ["src/glfw.cpp"],
            "include_dirs": [
                "<@(module_root_dir)/include"
            ],
            "conditions": [
                [ # Windows Conditions
                    "OS=='win'",
                    {
                        "libraries": [
                            "<(libs)/win32/glfw3dll.lib"
                        ],
                        "copies": [
                            {
                                "destination": "./build/Release",
                                "files": [
                                    "./lib/win32/glfw3.dll",
                                    "./lib/win32/glfw3.lib"
                                ]
                            }
                        ],
                        "cflags": [
                            "/verbosity:minimal"
                        ]
                    }
                ]
            ]
        },
        { # OpenGL #
            "target_name": "gl",
            "sources": ["src/gl.cpp"],
            "include_dirs": [
                "<@(module_root_dir)/include"
            ],
            "conditions": [
                [ # Windows Conditions
                    "OS=='win'",
                    {
                        "cflags": [
                            "/verbosity:minimal"
                        ]
                    }
                ]
            ]
        }
    ]
}