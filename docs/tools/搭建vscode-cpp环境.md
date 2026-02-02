---
title: 搭建vscode-cpp环境
createTime: 2024/11/05 23:10:14
permalink: /article/wpu7x9jw/
---

# VSCode 搭建cpp环境

## 前提介绍
因为本文使用的编译器为Cqwrteur编译的编译器，所以相比mingw-w64的安装包缺少在linux上的常用构建工具`makefile`,且因为直接解压缩没有写入注册表，环境变量需要读者自己配置。
本文采用ninja作为构建工具，Cmake作为生成.ninja的项目管理工具。
## 准备工作
1.下载VScode,ninja,Cmake  
2.Windows环境下载mingw64    
[下载链接](https://github.com/trcrsired/llvm-releases)  
3.解压缩x86-64 w64-mingw32   
4.添加至用户环境变量`PATH`  
*D:\workfile\gcc15\x86_64-w64-mingw32\bin*  
*D:\workfile\gcc15\x86_64-w64-mingw32\lib*   
*D:\workfile\gcc15\x86_64-w64-mingw32\lib32*     
5.下载c++插件
![alt text](/images/note/vscodetool/pluge.png)

安装编译器需要统一前缀路径
后期配置vscode时  多台电脑登录同一个账户 配置的路径不一致需要改

##  Vscode搭配Cmake
首先需要了解Vscode配置的三个重要的json文件，当然你也可以选择手动在命令行输入编译指令与构建命令.
### task.json  
1.创建一个文件夹`vscodestudy`,一个main.cpp文件,在文件中复制下列代码
```c++
#include<iostream>

int main(){
    std::cout<<"hello world";
}
```
2.由于你装了之前的CPP插件,右上角有一个三角形的运行按钮，点击;在vscode上方的任务栏中会出现默认生成的任务供你选择。我们选择第二个任务[^1]
![alt text](/images/note/vscodetool/task_list_pre.png)   
![alt text](/images/note/vscodetool/vscode_butten_build.png)   
这是根据你本地安装的编译器，且在用户变量中配置后，vscode检测到生成的,本文中使用mingw-w64(GCC)_编译器_，所以只出现了g++相关配置,之后插件会自动生成task.json文件[^1]   
3.这样就拥有了一个单文件的编译器   
4.深入了解task.json   
ide的本质还是在终端调用对应编译器的命令来进行编译的,`task.json`文件就是帮我们在终端进行命令的输出,读者可以在vscode下方的终端中输入` g++ -g main.cpp -o main.exe`命令来手动编译。
```
{
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: g++.exe 生成活动文件",
            "command": "D:\...\x86_64-w64-mingw32\\bin\\g++.exe",
            "args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-o",
                "${fileDirname}\\${fileBasenameNoExtension}.exe"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "调试器生成的任务。"
        }
    ],
    "version": "2.0.0"
}
```
如上是自动生成的`task.json`，因为插件的原因,当鼠标触碰到对应字段上会显示对应字段的意义,以下选取一些进行讲解.
1.`type`为自定义的任务类型,当前只需要了解有默认生成的`cppbuild,shell,process`就好。对于自定义任务，这可以是shell或process。如果指定shell，则该命令将解释为 shell 命令（例如：bash、cmd 或 PowerShell）。如果process指定，则该命令被解释为要执行的进程
2.`lable`任务标签,你可以按你喜欢的方式取名字   
3.`command`实际执行的命令,如果你像环境变量添加了某些路径那么不需要将完整路径写出,如上文的 `g++ -g ...`       
4.` args ` 不是必要的,某些命令就不需要参数,如执行在本地exe程序 
`./main.exe`，你可以直接写入在commnd中而不需要任何参数   
5.

[task.json具体参数](https://code.visualstudio.com/docs/editor/tasks-appendix)
### 常见问题:
[^1]:为什么选择第二个呢?我们创建的文件中使用了c++的标准库`<iostream>`所以需要创建以第二个任务编译器`g++`而不是gcc。如果你不小心点击了第一个任务并运行,则你肯定会在vscode下端的终端中获得如下报错,如果你不小心就是点击到了第一个任务,你可以选择编辑当前vscode打开的文件夹下的.vscode中的`task.json`文件,将`'command'`一行的最后一个`gcc`手动改为`g++`,并且为了避免混淆,将`label`行的`C/C++: g++.exe 生成活动文件`改为 g++或者你喜欢的名字`
```
正在启动生成...
cmd /c chcp 65001>nul && D:\workfile\gcc15\x86_64-w64-mingw32\bin\gcc.exe -fdiagnostics-color=always -g C:\Users\Yuzhiy\Desktop\vscodestudy\main.cpp -o C:\Users\Yuzhiy\Desktop\vscodestudy\main.exe
D:/workfile/gcc15/x86_64-w64-mingw32/bin/../lib/gcc/x86_64-w64-mingw32/15.0.0/../../../../x86_64-w64-mingw32/bin/ld.exe: C:\Users\Yuzhiy\AppData\Local\Temp\cc0yAYeW.o: in function `main':
C:/Users/Yuzhiy/Desktop/vscodestudy/main.cpp:4:(.text+0x1f): undefined reference to `std::basic_ostream<char, std::char_traits<char> >& std::operator<< <std::char_traits<char> >(std::basic_ostream<char, std::char_traits<char> >&, char const*)'
D:/workfile/gcc15/x86_64-w64-mingw32/bin/../lib/gcc/x86_64-w64-mingw32/15.0.0/../../../../x86_64-w64-mingw32/bin/ld.exe: C:\Users\Yuzhiy\AppData\Local\Temp\cc0yAYeW.o:main.cpp:(.rdata$.refptr._ZSt4cout[.refptr._ZSt4cout]+0x0): undefined reference to `std::cout'
collect2.exe: error: ld returned 1 exit status
```
[^2]:`task.json`此文件在你在vscode首次运行且未发现时,自动创建在同一个根目录的`.vscode`文件夹中.

3.Q:`task.json`中的传递给编译器的参数行(args)中的`-fdiagnostics-color=always`参数是什么意思?
A:-fdiagnostics-color=always 即总是输出颜色代码,由于vscode的任务栏中的输出不是真正的终端，是由js文件渲染的伪终端,需要将g++输出的信息渲染为带颜色的输出


1.CMakePresets.json：用于指定整个项目的构建细节，json中包含  
```c++
name
预设的名称，一般用表示平台或编译期的版本名字;

vendor
可选内容，提供供应商的信息，Cmake一般不管除非有所谓映射(不用管)

displayName
此预设的个性化名词(无关紧要)一般有编译期名字代替如"GCC 15.0.0 x86_64-w64-mingw32"

description
自定义的描述(无关紧要)一般使用本地编译期所在路径描述

steps
A required array of objects describing the steps of the workflow. The first step must be a configure preset, and all subsequent steps must be non- configure presets whose configurePreset field matches the starting configure preset. Each object may contain the following fields:

type
A required string. The first step must be configure. Subsequent steps must be either build, test, or package.

name
A required string representing the name of the configure, build, test, or package preset to run as this workflow step.
```
2.CmakeLists.txt：告诉Cmake如何构建你的项目


### 构建CmakeLists
1.打开Vscode的命令面板 (Ctrl+Shift+P) 并运行CMake: Quick Start命令  
2.输入项目名称，选择c++作为项目语言  
3.暂时选择`CTest`作为测试支持  
4.选择`Executable`作为项目类型时，创建包含`main`函数的`mian.cpp`文件 
Note:当然想要创建头文件或基础资源时可选择`Library`  


### 创建 CMakePresets.json 
1.选择 添加新的预设值和从编译器创建  
note:该扩展可自动扫描计算机上的工具包，并创建系统中发现的编译器列表。
2.根据你想要编译器选择
3.输入预设的名字
完成这些步骤后，您就拥有了一个完整的 hello world CMake 项目，其中包含以下文件:
`main.cpp`, `CMakeLists.txt`, and `CMakePresets.json`.



## 创建一个项目

`tasks.json` (构建指导)  
`launch.json` (debugger 设置)  
`c_cpp_properties.json` (编译器路径与智能感知设置)  


首次运行程序时，C++ 扩展会创建一个 tasks.json 文件，您可以在项目的 .vscode 文件夹中找到该文件。tasks.json 会存储您的构建配置

```json
{
  "tasks": [
    {
      "type": "cppbuild",
      "label": "C/C++: g++.exe build active file",
      "command": "C:\\msys64\\ucrt64\\bin\\g++.exe",
      "args": [
        "-fdiagnostics-color=always",
        "-g",
        "${file}",
        "-o",
        "${fileDirname}\\${fileBasenameNoExtension}.exe"
      ],
      "options": {
        "cwd": "${fileDirname}"
      },
      "problemMatcher": ["$gcc"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "detail": "Task generated by Debugger."
    }
  ],
  "version": "2.0.0"
}
```

# 使用cmake
## cmakelist配置
### 生成动态库
1.有如下目录结构 
``` 
>cmake_study  
    |          
    |__lib  
    |__testFunc  
        |__testFunc.c  
        |__test2.h
```
```cmake
# 新建变量SRC_LIST
set(SRC_LIST ${PROJECT_SOURCE_DIR}/testFunc/testFunc.c)

# 对 源文件变量 生成动态库 testFunc_shared
add_library(testFunc_shared SHARED ${SRC_LIST})
# 对 源文件变量 生成静态库 testFunc_static
add_library(testFunc_static STATIC ${SRC_LIST})

# 设置最终生成的库的名称
set_target_properties(testFunc_shared PROPERTIES OUTPUT_NAME "testFunc")
set_target_properties(testFunc_static PROPERTIES OUTPUT_NAME "testFunc")

# 设置库文件的输出路径
set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)
```

1.`add_library`：生成动态库或静态库  
  第1个参数：指定库的名字  
  第2个参数：决定是动态还是静态，如果没有就默认静态  
  第3个参数：指定生成库的源文件  
2.`set_target_properties`：设置最终生成的库的名称，还有其它功能，如设置库的版本号等等  
3.`LIBRARY_OUTPUT_PATH`：库文件的默认输出路径，这里设置为工程目录下的lib目录

前面使用set_target_properties重新定义了库的输出名称，如果不使用set_target_properties也可以，那么库的名称就是add_library里定义的名称，只是连续2次使用add_library指定库名称时（第一个参数），这个名称不能相同，而set_target_properties可以把名称设置为相同，只是最终生成的库文件后缀不同（一个是.so，一个是.a.win中为dll），这样相对来说会好看点 

### 链接库
有如下文件路径
```
cmake_study
    |
    |__bin
    |__build
    |__src
    |__test
        |__inc
        |   |__test1.h
        |__lib
            |__test2.lib
            |__tets2.dll
   cmakelist.txt
```
```cmake
# 输出bin文件路径
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)

# 将源代码添加到变量
set(src_list ${PROJECT_SOURCE_DIR}/src/main.c)

# 添加头文件搜索路径
include_directories(${PROJECT_SOURCE_DIR}/testFunc/inc)

# 在指定路径下查找库，并把库的绝对路径存放到变量里
find_library(TESTFUNC_LIB testFunc HINTS ${PROJECT_SOURCE_DIR}/testFunc/lib)

# 执行源文件
add_executable(main ${src_list})

# 把目标文件与库文件进行链接
target_link_libraries(main ${TESTFUNC_LIB})
```


PRIVATE 关键字表明 fmt 仅在生成 HelloWorld 时需要，不应传播到其他依赖项目
###  cmake 命令速览
```cmake
cmake -S <dir> 指定项目跟目录  根CMakeLists.txt要包含其中 
cmake -B <dir>  指定构建目录   cmake的输出 cmake调用生成器的输出都在这里
cmake  --build <dir> 在指定的构建目录中运行构建系统

cmake cmake --build <dir> --config <cfg> 构建时选择配置

cmake -Bbuild -GNinja -S.  以ninja生成 以 当前目录为源码 构建目录为build(如果没有就新建)

cmake -Bbuild -GNinja -S.. 在build文件夹下执行

cmake --build build --clean-first 先清理再构建
```
ninja 在build文件夹下执行

Visual Studio 17 2022
-G "Visual Studio 18 2026"

使用不同构建器需要切换构建目录
>Note We can't reuse the build directory with different generators. It is necessary to delete the build directory between CMake runs if you want to switch to a different generator using the same build directory.

Vs/vscode可以在launch.vs.json和tasks.vs.json 里使用cmakepreset的key变量
```json
{
  "name": "windows-base",
  "hidden": true,
  "generator": "Ninja",
  "binaryDir": "${sourceDir}/out/build/${presetName}",
  "installDir": "${sourceDir}/out/install/${presetName}",
  "cacheVariables": {
    "CMAKE_C_COMPILER": "cl.exe",
    "CMAKE_CXX_COMPILER": "cl.exe"
  }
   "environment": {
        "MY_ENVIRONMENT_VARIABLE": "Test",
        "PATH": "$env{HOME}/ninja/bin:$penv{PATH}"
  }
  ...
}
```
${cmake.<KEY-NAME>}
${cmake.binaryDir}

也能使用环境变量
${env.<VARIABLE-NAME>}
${env.MY_ENVIRONMENT_VARIABLE}

### cmake基本概念
cmake 一切都是字符串
string是普通字符串 
list是带分号的字符串 


cmake宏和函数区别在于作用域 类似于c++宏 执行宏的副作用会被上下文看到，函数单独创建作用域想返回得set变量set(<var> <value> PARENT_SCOPE) 3.25后 return(PROPAGATE)

cmake变量本身就是字符串,这导致宏和函数传参数名时实绩上只传了变量名字符串而没有传递该变量指向的的实绩内容取值时得用
${${ListVar}} 而不是{${ListVar}}

## cmaketools插件


### 开ASAN 地址检查器

在主要是在编译器和链接器选项前加参数 
gcc/clang -fsanitize=address
msvc    /fsanitize=address
放cmake里
```cmake
if(MSVC)
    target_compile_options(<target_name> PUBLIC /fsanitize=address)
  else()
    target_compile_options(<target_name> PUBLIC -fsanitize=address)
    target_link_options(<target_name> PUBLIC -fsanitize=address)
 endif()
```
注意在vs里使用cmake+msvc时 cmakelist默认模板为了生成调试文件启动热重载会加/ZI参数 把下面这行注释掉就好
```cmake
# 如果支持，请为 MSVC 编译器启用热重载。
if (POLICY CMP0141)
  cmake_policy(SET CMP0141 NEW)
  #set(CMAKE_MSVC_DEBUG_INFORMATION_FORMAT "$<IF:$<AND:$<C_COMPILER_ID:MSVC>,$<CXX_COMPILER_ID:MSVC>>,$<$<CONFIG:Debug,RelWithDebInfo>:EditAndContinue>,$<$<CONFIG:Debug,RelWithDebInfo>:ProgramDatabase>>")
endif()
```

配置一些环境
LLVM_ROOT
BOOST_ROOT
WIN_SYSROOT 