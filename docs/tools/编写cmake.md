---
title: 编写cmake
createTime: 2024/12/26 22:32:41
permalink: /article/bijxvme0/
---


cmake 各变量名字

PROJECT_SOURCE_DIR 表示当前项目的根目录也就是当前cmakelist文件所在路径。调用project(xxx)指定项目后的源代码目录

PROJECT_BINARY_DIR  项目的构建目录通常都在构建文件夹下(build)文件夹下 当使用Bbuild 或指定构建文件夹.

CMAKE_CURRENT_SOURCE_DIR 表示当前CMakeLists.txt 所在的源码目录
CMAKE_CURRENT_BINARY_DIR 表示当前输出目录的位置

CMAKE_SOURCE_DIR：根项目源码路径最外层cmakeList（存放main.cpp的地方）
CMAKE_BINARY_DIR：根项目输出路径（存放main.exe的地方）

PROJECT_IS_TOP_LEVEL：BOOL类型，表示当前项目是否是（最顶层的）根项目
PROJECT_NAME：当前项目名
CMAKE_PROJECT_NAME：根项目的项目名

EXECUTABLE_OUTPUT_PATH 可执行文件的输出路径(旧变量不建议使用，可能不生效)
CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG
CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE
使用此项代替

LIBRARY_OUTPUT_PATH 库文件的输出路径(旧变量不建议使用，可能不生效)
CMAKE_ARCHIVE_OUTPUT_DIRECTORY 静态库输出路径
CMAKE_LIBRARY_OUTPUT_DIRECTORY 动态库输出路径

小技巧：CMake 的 ${} 表达式可以嵌套

CMAKE_CXX_STANDARD 是一个整数，表示要用的 C++ 标准。
比如需要 C++17 那就设为 17，需要 C++23 就设为 23。

CMAKE_CXX_STANDARD_REQUIRED 是 BOOL 类型，可以为 ON 或 OFF，默认OFF。
他表示是否一定要支持你指定的 C++ 标准：如果为 OFF 则 CMake 检测到编译器不支持 C++17 时不报错，而是默默调低到 C++14 给你用；为 ON 则发现不支持报错，更安全。
通常我们设为ON。
CMAKE_CXX_EXTENSIONS 也是 BOOL 类型，默认为 ON。
设为 ON 表示启用 GCC 特有的一些扩展功能；OFF 则关闭 GCC 的扩展功能，只使用标准的 C++。
要兼容其他编译器（如 MSVC）的项目，都会设为 OFF 防止不小心用了 GCC 才有的特性。
通常我们设为OFF

CMAKE_BUILD_TOOL: 执行构建过程的工具。该变量设置为CMake构建时输出所需的程序。对于VS 6， CMAKE_BUILD_TOOL设置为msdev， 对于Unix，它被设置为make 或 gmake。 对于 VS 7， 它被设置为devenv. 对于Nmake构建文件，它的值为nmake。
CMAKE_DL_LIBS: 包含dlopen和dlclose的库的名称。
CMAKE_COMMAND: 指向cmake可执行程序的全路径。
CMAKE_CTEST_COMMAND: 指向ctest可执行程序的全路径。
CMAKE_EDIT_COMMAND: cmake-gui或ccmake的全路径。
CMAKE_EXECUTABLE_SUFFIX: 该平台上可执行程序的后缀。
CMAKE_SIZEOF_VOID_P: void指针的大小。
CMAKE_SKIP_RPATH: 如果为真，将不添加运行时路径信息。默认情况下是如果平台支持运行时信息，将会添加运行时信息到可执行程序当中。这样从构建树中运行程序将很容易。为了在安装过程中忽略掉RPATH，使用CMAKE_SKIP_INSTALL_RPATH。
CMAKE_GENERATOR: 构建工程的产生器。它将产生构建文件 (e.g. "Unix Makefiles", "Visual Studio 2019", etc.)



从指定目录中搜寻源文件，并将它们存入变量SRC_LIST和CW_SRC_LIST中
```cmake
aux_source_directory(${PROJECT_SOURCE_DIR} SRC_LIST)
aux_source_directory(${PROJECT_SOURCE_DIR}/cw/src CW_SRC_LIST)
```
此命令不会递归查找子目录,只会识别.cpp .cc .cxx 不会识别.hpp .h文件 同样CMake 无法生成知道何时添加了新的源文件此时需要重新运行 CMake
一般用作
> 显式模板实例化的项目。模板实例化文件可以存储在 Template 子目录中，并使用此命令自动收集，以避免手动列出所有实例化 

最简单的例子

获取所有源文件进行编译
有如下文件结构
:::file-tree

- helloproject      
  - build    
   -...省略
  - src
   - demo1.cpp
   - demo2.cxx
   - demo3.h
   - demo4.hpp
   - ...
   - src2
    - demo3.cpp  
  - CmakeLists.txt
  - CmakePresets.json
  - hello.cpp
:::
添加src文件夹下所有文件进行编译

```cmake
cmake_minimum_required(VERSION 3.5.0)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED true)
set(CMAKE_CXX_EXTENSIONS OFF)
project(hello)

message(STATUS "PROJECT_SOURCE_DIR目录为=${PROJECT_SOURCE_DIR}")
message(STATUS "PROJECT_BINARY_DIR目录为=${PROJECT_BINARY_DIR}")

aux_source_directory(${PROJECT_SOURCE_DIR}/src SRC_LIST)

include_directories(src)

message(STATUS "源码路径SRC_LIST文件=${SRC_LIST}")

add_executable(hello main.cpp ${SRC_LIST})
```

### 列出所有源码 
```cmake
file(GLOB_RECURSE/GLOB  <变量名>  op(可选项):[CONFIGURE_DEPENDS] <expr-path>) 
```
 是一个用来匹配指定路径下所有符合通配符条件的文件的命令。
GLOB_RECURSE 是递归查找目录下的所有文件，
GLOB 则只在指定文件下
CONFIGURE_DEPENDS 标记依赖 当文件夹下新增文件时cmake会重新编译添加进文件
expr-path 简单的正则表达式表示的路径
file() 命令则可以用来获取文件列表

file(GLOB_RECURSE SOURCES src/*.cpp include/*.h)
递归地查找 src 和 include 目录下所有以 .cpp 或 .h 结尾的文件，并将它们存储在 SOURCES 变量中。然后，add_executable 命令使用 SOURCES 变量中的文件来生成可执行文件

### 引入第三方静态库
以spdlog为例子
此类库基本为头文件库体积不打使用子模块构建
```powershell
git submodule add <path>仓库地址 注意仓库的分支默认是拉取默认分支

git submodule add -b <branch> <repository> <path>  选择分支拉取

git submodule add git@github.com:gabime/spdlog.git
```

```cmake
add_subdirectory(spdlog) #添加子项目 相对当前cmakelist所在文件夹的相对路径

include_directories(spdlog/include/spdlog) #包含头文件


add_executable(hello main.cpp )

target_link_libraries(hello spdlog) 链接库
```

find_libary

应用于单纯的二进制包，没有配置文件，或者本地项目构建出的库.以下以本地构建的库为例

:::file-tree

- helloproject      
  - build    
   -...省略
  - src
   - demo1.cpp
   - ...
   - lib
   - mylib.dll(构建后生成)
   - mylib
    - build
     -...构建文件(省略)  
    - mylib.h
    - mylib.cpp
    - CmakeLists.txt
  - CmakeLists.txt
  - CmakePresets.json
  - hello.cpp
:::

在路径helloproject/lib/CmakeLists.txt 中
```cmake
#设置库路径
#指定库生成路径
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/lib)
set(LIB_SRC ${PROJECT}/lib/mylib.cpp)
#生成dll
add_library(testshared SHARED ${LIB_SRC})
#生成库的名字(也可以指定其他属性)
set_target_properties(testshared PROPERTIES OUTPUT_NAME "test")
```
在路径helloproject/lib/build/中 执行命令构建目标库
```powershell
cmake .. -G"Ninja"  //生成构建系统 最好指定使用toolchain.cmake配置指定编译器而不是让cmake寻找编译器可能会找到意料之外编译器或版本
cmake --build .  //单个库通常不需要指定目标
```

在路径helloproject/CmakeLists.txt 中
```CMAKE
···
#include_directories(${CMAKE_SOURCE_DIR}/mylib/) #指定头文件搜索路径
find_library(test_path NAMES test PATHS ./lib)
message(STATUS "库全路径为 ${test_path}")

find_library (
          <VAR>
          name | NAMES name1 [name2 ...] [NAMES_PER_DIR]
          [HINTS [path | ENV var]...]
          [PATHS [path | ENV var]...]
          [REGISTRY_VIEW (64|32|64_32|32_64|HOST|TARGET|BOTH)]
          [PATH_SUFFIXES suffix1 [suffix2 ...]]
          [VALIDATOR function]
          [DOC "cache documentation string"]
          [NO_CACHE]
          [REQUIRED]
          [NO_DEFAULT_PATH]
          [NO_PACKAGE_ROOT_PATH]
          [NO_CMAKE_PATH]
          [NO_CMAKE_ENVIRONMENT_PATH]
          [NO_SYSTEM_ENVIRONMENT_PATH]
          [NO_CMAKE_SYSTEM_PATH]
          [NO_CMAKE_INSTALL_PREFIX]
          [CMAKE_FIND_ROOT_PATH_BOTH |
           ONLY_CMAKE_FIND_ROOT_PATH |
           NO_CMAKE_FIND_ROOT_PATH]
         )
```
::: tip
\<VAR\> :首个参数指定查找结果作为变量 (库的全路径包括后缀) 上述命令中为 test_path   当库未被找到，\<var\>中存放的值为`\<var\>-NOTFOUND`。
NO_CACHE 项
只要\<var\>中的值不是`\<var\>-NOTFOUND`(或有值)，那么即使多次调用find_library，\<var\>也不会再刷新(只要找到一个\<var\>，后续每次执行cmake命令得到的\<var\>都是首次找到的\<var\>值（除非清除CMakeCache.txt文件)。该选项将\<var\>变量当成一个普通变量而不是一个缓存条目，需要cmake 3.21及以上的版本支持(理解为全局变量，且会写入CMakeCache.txt文件，在不清除CMakeCache.txt文件的情况下，每次执行cmake都会先从CMakeCache.txt载入该变量的值)
:::
```cmake
//例
make_minimum_required (VERSION 3.21)
project (fl)
find_library (libvar mymath PATHS ./mylib NO_CACHE)
find_library (libvar mymath PATHS ./lib NO_CACHE) # 即使./lib中也存在mymath库，由于在上一步的./mylib中已经找到，因此本条命令不会执行查找
if (${libvar} STREQUAL "libvar-NOTFOUND")
    message (FATAL_ERROR "required mymath library but not found!")
else()
    message (STATUS "mymath library found in ${libvar}")
endif()
//例
make_minimum_required (VERSION 3.21)
project (fl)
find_library (libvar mymath PATHS ./mylib) # libvar是缓存条目，会存入`CMakeCache.txt`，后续即使把PATHS ./mylib改成PATHS ./mylib2（不存在库mymath），也不会保存，因为libvar变量已经从缓存中载入
if (${libvar} STREQUAL "libvar-NOTFOUND")
    message (FATAL_ERROR "required mymath library but not found!")
else()
    message (STATUS "mymath library found in ${libvar}")
endif()
```
NAMES或name: 指定一个或多个库的名字 上述命令中为 NAMES test
::: tip
[PATHS [path | ENV var]...]或[HINTS [path | ENV var]...]: 可选项 指定搜索库的路径 上述命令中为 PATHS ./lib 同时可以指定环境变量
`find_library (libvar mymath PATHS ENV TESTPATH)` 指定环境变量TESTPATH 为查找路径 假设环境变量被设置为./lib
:::

REQUIRED：指定该选项后，当找不到库，会输出一条错误信息并终止cmake处理过程；未指定REQUIRED选项，当find_library未找到库时，后续find_library有针对\<var\>的调用会继续查找。该选项需要cmake 3.18及以上的版本支持

PATH_SUFFIXES：为每个搜索目录添加变量PATH_SUFFIXES指定的后缀目录，假设当前搜索的目录为/A;/C/D，PATH_SUFFIXES指定的后缀目录为PS(当前可以指定多个，以分号分割开即可)，那么除了/A;/C/D之外，/A/PS;/C/D/PS也会被搜索
```cmake
find_library (libvar mymath PATHS ./ PATH_SUFFIXES mylib) # 会从./以及./mylib中搜索指定的mymath库是否存在
```

CMAKE_FIND_ROOT_PATH：指定搜索的根路径

CMAKE_SYSROOT：该选项的值会传递给编译器的--sysroot标记(--sysroot用于指定编译搜索库和头文件的根目的，例如编译器原本搜搜索/A/include和/A/lib，使用--sysroot=DIR后，编译器搜索的库和头文件目录变成/DIR/A/include和/DIR/A/lib)
NO_DEFAULT_PATH:如果指定了，默认搜索路径不会生效
默认搜索路径:CMAKE_LIBRARY_ARCHITECTURE、CMAKE_PREFIX_PATH、CMAKE_LIBRARY_PATH、CMAKE_FRAMEWORK_PATH 指定的路径或
系统环境变量（例如系统环境变量LIB和PATH定义的路径）、系统的默认的库安装路径,例如/usr、/usr/lib等
:::: steps
1.先找包路径\<PackageName\>_ROOT(NO_PACKAGE_ROOT_PATH 或CMAKE_FIND_USE_PACKAGE_ROOT_PATH 为 FALSE则跳过)
\<CurrentPackage\>_ROOT, ENV{\<CurrentPackage\>_ROOT}, \<ParentPackage\>_ROOT, ENV{\<ParentPackage\>_ROOT}
2.cmake缓存变量，即命令行中 -D \<VAR\>=value 设置的变量
例如`cmake . -DCMAKE_XXX_PATH=D:xxx\xxx`
(NO_CMAKE_PATH 如果设置了此项或CMAKE_FIND_USE_CMAKE_PATH 为 FALSE 则跳过) 
other
3.cmake指定的环境变量 CMAKE_FIND_USE_CMAKE_ENVIRONMENT_PATH (设置此项为FALSE或NO_CMAKE_ENVIRONMENT_PATH 跳过此过程) 
other
4.HINT 指定的路径  HINT使用系统内计算的软路径，相对路径 ,PATH指定硬编码的路径
5.编译环境的系统环境变量(例如系统环境变量LIB和PATH定义的路径) (NO_SYSTEM_ENVIRONMENT_PATH或CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH 为FALSE 时跳过)
6.当前系统平台中相关的cmake变量(系统的默认的库安装路径) (CMAKE_INSTALL_PREFIX 和 CMAKE_STAGING_PREFIX) 
NO_CMAKE_SYSTEM_PATH或 CMAKE_FIND_USE_CMAKE_SYSTEM_PATH 为 FALSE 可以跳过所有这些路径搜索
other(关联路径替换为
CMAKE_SYSTEM_PREFIX_PATH  默认前缀 Windows下的/XXXX/Program Files，Linux下的/usr或/usr/local
查找时替换为/XXXX/Program Files/lib , /usr/local/lib进行搜索
CMAKE_SYSTEM_LIBRARY_PATH  默认是当前系统的标准目录

CMAKE_SYSTEM_FRAMEWORK_PATH 给macOS用，其框架路径
) 通常是已安装的软件的位置，比如Linux下软件安装到/usr/local

7.PATHS指定路径 或 简短版本 find_library (\<VAR\> name1 [path1 path2 ...])中的的路径path1,path2...

指定如下这些变量也能忽略上述查找
CMAKE_IGNORE_PATH, CMAKE_IGNORE_PREFIX_PATH, CMAKE_SYSTEM_IGNORE_PATH and CMAKE_SYSTEM_IGNORE_PREFIX_PATH

other：
\<prefix\>/lib/\<arch\> 
 CMAKE_LIBRARY_ARCHITECTURE 如果该变量被设置，那么会搜索目录${CMAKE_PREFIX_PATH}/lib/${CMAKE_LIBRARY_ARCHITECTURE} 
CMAKE_PREFIX_PATH  多个前缀以分号分隔 比如 CMAKE_PREFIX_PATH=A;B
那么会为${CMAKE_PREFIX_PATH}/lib 即 A/lib ,B/lib中查找库
CMAKE_LIBRARY_PATH  指定find_library的库查找目录，默认值为空，多个值时需要以分号分割列表指定 

CMAKE_FRAMEWORK_PATH 给macOS 用的
\<prefix\>/lib/  
::::

默认搜索路径需要涵盖最常用和最不常用的情况，通常 使用NO前缀项忽略
find_library (\<VAR\> NAMES name PATHS paths... NO_DEFAULT_PATH)
find_library (\<VAR\> NAMES name)
NAMES 指定多个名字时，默认每个路径都搜索一遍该名字 (一个名字在多个文件夹搜索)
NAMES_PER_DIR 选项 指定一次考虑一个文件夹(路径)每次搜索所有名字 (多个名字在一个文件夹检索)
查找库名字时先原样查找 给什么查什么 比如
```find_library (lib NAMES mylib PATHS "D:\xxx\xxx" NO_DEFAULT_PATH)```
那么先查找`mylib`  某些平台规定的前后缀(例如.lib或.so)由 CMAKE_FIND_LIBRARY_PREFIXES 和CMAKE_FIND_LIBRARY_SUFFIXES 变量指定 。当然也可以直接写明后缀。如mylib.a(unix) mylib.lib(win)


如果目标库是框架 \<VAR\>变量存储目标库的全路径 \<fullPath\>/A.framework,当框架被当作库使用时 使用-framework A, 和 -F\<fullPath\> 链接框架到目标

如果指定了自定义搜索路径前缀 CMAKE_FIND_LIBRARY_CUSTOM_LIB_SUFFIX 
那么搜索时的 前缀路径lib/ 会替换为 ${CMAKE_FIND_LIBRARY_CUSTOM_LIB_SUFFIX}/(同样存lib32,libx32,lib64 版本)
project()命令启动时如果设置了至少一种语言 那么会自动设置此类变量


FIND_LIBRARY_USE_LIB32_PATHS(同样存lib32,libx32,lib64 版本)
在搜索路径中匹配到lib/后，会为这个目录添加一个后缀，然后在添加后缀后的目录中搜索库
```cmake
cmake_minimum_required (VERSION 3.21)
project (fl)

find_library (libvar mymath PATHS ./lib) # 假设lib目录不存在但是lib64目录存在
if (${libvar} STREQUAL "libvar-NOTFOUND")
    message (FATAL_ERROR "required mymath library but not found!")
else()
    message (STATUS "mymath library found in ${libvar}")
endif()

// 命令行中执行
cmake .

// 执行结果
-- mymath library found in /XXX/lib64/libmymath.a
```


### cmake add_custom_command 命令
还有一个相关的函数 `add_custtom_target`
add_custom_command 有一些典型用法
见cmake文档里的[链接](https://cmake.org/cmake/help/latest/command/add_custom_command.html#examples-generating-files)
典型用法
1.构建动态库前使用代码生成工具生成源文件参与构建
2.在构建事件后执行复制dll到可执行文件夹下，或在构建后执行清理操作

函数原型就不列出了
之说几个重要的参数
第一个重载 :生成文件
第二个重载:构建事件
```C
add_custom_command (OUTPUT output1 [output2 ...]
                   COMMAND command1 [ARGS] [args1...]
                   ...其他参数
                   )

add_custom_command(TARGET <target>
                   PRE_BUILD | PRE_LINK | POST_BUILD
                   COMMAND command1 [ARGS] [args1...]
                   ...其他参数
                   )
```
OUTPUT 指定生成的文件创建在和当前cmakelist同一路径中 只要没有这些文件就会执行命令

COMMAND 后跟实际需要执行的执行，一般是命令行指令，也可以是可执行文件,python命令，自定义脚本凡是能在命令行执行的都能在这里设置

DEPENDS 指定依赖项 当依赖项变动时会执行命令。

graph LR
    D[DEPENDS 指定的目标/文件] --> C[自定义命令]
    C --> O[OUTPUT 生成的文件]

依赖项除了文件还能是由add_custom_target 或 add_library/add_executable  创建的目标。

如果依赖了
目标target  那么此命令会在任何依赖的目标生成前执行。这建立了一个执行命令/生成文件->构建目标的依赖关系

可执行文件或库 则建立文件级别依赖。那么只要重新编译了那么就会执行改命令

已经添加到生成目标的源文件 如`add_executable(cmakestudy main.cpp )` 里的main.cpp 也会建立文件级别依赖

依赖绝对路径和相对路径的化也会建立文件级别依赖 

如果未指定DEPENDS,则命令将在OUTPUT缺失时运行；如果命令实际上没有创建 OUTPUT, 则规则将始终运行


COMMENT 在构建时在执行命令之前输出注释

VERBATIM 告诉cmake 执行的命令的参数不要转义，原样传递给命令

WORKING_DIRECTORY 执行命令前会从cd到该参数指定的路径下

第二个重载

TARGET 依赖的目标 依赖目标变动(该命令会被当做目标构建的一部分)才会执行,换句话说只有目标被构建的时候才会执行,如果目标源文件不变
`cmake --build .  --target hello` 这个命令执行第一次会执行一次命令。再次生成目标，因为源代码没变不需要重新构建所以该命令不会执行。

PRE_BUILD | PRE_LINK | POST_BUILD 命令执行的时机 构建前 链接前 构建后 


用的少的参数
APPEND  在COMMAND后添加命令 注意COMMAND 可以加很多行 没用过

USES_TERMINAL 指定使用的终端 和APPEND 不能一起使用。对于Ninja生成器这会把命令放在console pool中(因为ninja可以并发构建)

JOB_POOL 任务池 Ninja专用的

JOB_SERVER_AWARE 给makefile用的 


### 生成器表达式
用于在生成阶段而不是配置阶段生成数据,一般用来生成路径




















