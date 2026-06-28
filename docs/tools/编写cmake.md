---
title: 编写cmake
createTime: 2024/12/26 22:32:41
permalink: /article/bijxvme0/
---

## 该文章使用的cmake版本为3.28以上

cmake 各变量名字

`PROJECT_SOURCE_DIR` 表示当前项目的根目录也就是当前cmakelist文件所在路径。调用 `project(xxx)` 指定项目后的源代码目录。

`PROJECT_BINARY_DIR` 项目的构建目录通常都在构建文件夹下(build)文件夹下，当使用 `--build` 或指定构建文件夹。

`CMAKE_CURRENT_SOURCE_DIR` 表示当前 `CMakeLists.txt` 所在的源码目录。

`CMAKE_CURRENT_BINARY_DIR` 当前正在处理的 `CMakeLists.txt` 文件对应的构建目录也就是配置时指定的build目录。

:::file-tree
- myProject
  - CMakeLists.txt    # 根CMakeLists     
  - src 
    - CMakeLists.txt  # src目录的CMakeLists
    - main.cpp
  - build    # 构建目录             
:::

根目录的cmakelist：

```cmake
message("SOURCE: ${CMAKE_CURRENT_SOURCE_DIR}")  # 输出: /path/to/myProject
message("BINARY: ${CMAKE_CURRENT_BINARY_DIR}")  # 输出: /path/to/myProject/build
```

src目录的cmakelist：

```cmake
message("SOURCE: ${CMAKE_CURRENT_SOURCE_DIR}")  # 输出: /path/to/MyProject/src
message("BINARY: ${CMAKE_CURRENT_BINARY_DIR}")  # 输出: /path/to/MyProject/build/src
```

`CMAKE_SOURCE_DIR`：根项目源码路径最外层cmakeList（存放main.cpp的地方）。

`CMAKE_BINARY_DIR`：根项目输出路径（存放main.exe的地方）。

| 变量 | 类型 | 说明 |
|------|------|------|
| `PROJECT_IS_TOP_LEVEL` | BOOL | 表示当前项目是否是（最顶层的）根项目 |
| `PROJECT_NAME` | string | 当前项目名 |
| `CMAKE_PROJECT_NAME` | string | 根项目的项目名 |

`EXECUTABLE_OUTPUT_PATH` 可执行文件的输出路径（旧变量不建议使用，可能不生效）。

`CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG` / `CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE` 使用此项代替。

`LIBRARY_OUTPUT_PATH` 库文件的输出路径（旧变量不建议使用，可能不生效）。

| 变量 | 说明 |
|------|------|
| `CMAKE_ARCHIVE_OUTPUT_DIRECTORY` | 静态库输出路径 |
| `CMAKE_LIBRARY_OUTPUT_DIRECTORY` | 动态库输出路径 |

::: tip 小技巧
CMake 的 `${}` 表达式可以嵌套
:::

`CMAKE_CXX_STANDARD` 是一个整数，表示要用的 C++ 标准。比如需要 C++17 那就设为 17，需要 C++23 就设为 23。

`CMAKE_CXX_STANDARD_REQUIRED` 是 BOOL 类型，可以为 ON 或 OFF，默认 OFF。他表示是否一定要支持你指定的 C++ 标准：如果为 OFF 则 CMake 检测到编译器不支持 C++17 时不报错，而是默默调低到 C++14 给你用；为 ON 则发现不支持报错，更安全。通常我们设为 ON。

`CMAKE_CXX_EXTENSIONS` 也是 BOOL 类型，默认为 ON。设为 ON 表示启用 GCC 特有的一些扩展功能；OFF 则关闭 GCC 的扩展功能，只使用标准的 C++。要兼容其他编译器（如 MSVC）的项目，都会设为 OFF 防止不小心用了 GCC 才有的特性。通常我们设为 OFF。

| 变量 | 说明 |
|------|------|
| `CMAKE_BUILD_TOOL` | 执行构建过程的工具。该变量设置为CMake构建时输出所需的程序。对于VS 6，设置为msdev；对于Unix，设置为make或gmake；对于VS 7，设置为devenv；对于Nmake构建文件，值为nmake |
| `CMAKE_DL_LIBS` | 包含dlopen和dlclose的库的名称 |
| `CMAKE_COMMAND` | 指向cmake可执行程序的全路径 |
| `CMAKE_CTEST_COMMAND` | 指向ctest可执行程序的全路径 |
| `CMAKE_EDIT_COMMAND` | cmake-gui或ccmake的全路径 |
| `CMAKE_EXECUTABLE_SUFFIX` | 该平台上可执行程序的后缀 |
| `CMAKE_SIZEOF_VOID_P` | void指针的大小 |
| `CMAKE_SKIP_RPATH` | 如果为真，将不添加运行时路径信息 |
| `CMAKE_GENERATOR` | 构建工程的产生器。它将产生构建文件（e.g. "Unix Makefiles", "Visual Studio 2019", etc.） |

从指定目录中搜寻源文件，并将它们存入变量 `SRC_LIST` 和 `CW_SRC_LIST` 中：

```cmake
aux_source_directory(${PROJECT_SOURCE_DIR} SRC_LIST)
aux_source_directory(${PROJECT_SOURCE_DIR}/cw/src CW_SRC_LIST)
```

此命令不会递归查找子目录，只会识别 `.cpp` `.cc` `.cxx`，不会识别 `.hpp` `.h` 文件。同样 CMake 无法生成知道何时添加了新的源文件，此时需要重新运行 CMake。一般用作：

> 显式模板实例化的项目。模板实例化文件可以存储在 Template 子目录中，并使用此命令自动收集，以避免手动列出所有实例化。

最简单的例子，获取所有源文件进行编译，有如下文件结构：

:::file-tree
- helloproject      
  - build    
    - ...   
  - src
    - demo1.cpp
    - demo2.cxx
    - demo3.h
    - demo4.hpp
    - ...
    - src2
      - demo3.cpp  
  - CMakeLists.txt
  - CMakePresets.json
  - hello.cpp
:::

添加src文件夹下所有文件进行编译：

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
file(GLOB_RECURSE/GLOB <变量名> op(可选项):[CONFIGURE_DEPENDS] <expr-path>)
```

是一个用来匹配指定路径下所有符合通配符条件的文件的命令。

| 命令 | 说明 |
|------|------|
| `GLOB_RECURSE` | 递归查找目录下的所有文件 |
| `GLOB` | 只在指定文件下 |
| `CONFIGURE_DEPENDS` | 标记依赖，当文件夹下新增文件时cmake会重新编译添加进文件 |
| `expr-path` | 简单的正则表达式表示的路径 |

`file()` 命令则可以用来获取文件列表。

```cmake
file(GLOB_RECURSE SOURCES src/*.cpp include/*.h)
```

递归地查找 src 和 include 目录下所有以 `.cpp` 或 `.h` 结尾的文件，并将它们存储在 `SOURCES` 变量中。然后，`add_executable` 命令使用 `SOURCES` 变量中的文件来生成可执行文件。

### 构建目标

```cmake
add_executable(target_name files...)
```

`add_executable` 和 `add_library` 能直接参数后跟文件列表表示该目标依赖文件（编译的文件）。项目变大了文件散布在子文件夹写一堆文件。

早期解决办法：

1. `include` 命令直接包含子文件夹的 `CMakeLists.txt`
2. 在子文件夹中使用 `list` 命令将文件路径打包成变量
3. `file(GLOB_RECURSE src ...)` 列举文件
4. `set(FILEPATH ...)` 手写文件
5. `aux_source_directory(.cpp)`

```cmake
# root cmakelists.txt

include(A/cmakelists.txt)
include(B/cmakelists.txt)

add_executable(target_name ${filepath})

# 子目录A cmakelist.txt

list(APPEND filepath
${CMAKE_CURRENT_SOURCE_DIR}/a.cpp
${CMAKE_CURRENT_SOURCE_DIR}/b.cpp
)
```

现在有更现代的方法：`target_sources` 添加源码，其中参数路径可以使用生成器表达式。

```cmake
# 签名
target_sources(
<target>
  [<INTERFACE|PUBLIC|PRIVATE>
   [FILE_SET <set> [TYPE <type>] [BASE_DIRS <dirs>...] [FILES <files>...]]...
  ]...
)

target_sources(taget_name
[PRIVATE|PUBLIC|INTERFACE]
<impl_file>  myfunc.cpp  #实现文件 默认在CMAKE_CURRENT_SOURCE_DIR下
[FILE_SET <file_set_name> # 文件集名称 你叫TYPE类型里的名称就可以省略TYPE
TYPE  [HEADERS|CXX_MODULES]]
BASE_DIR <dir>     #要包含文件跟目录 一般是include 不写就相当于当前源码路径
FILES  <filepath> #要包含的具体文件

... //能写好几个

)
```

::: tip
参考[文档](https://cmake.org/cmake/help/latest/command/target_sources.html#file-sets)

>Files in a PRIVATE or PUBLIC file set are marked as source files for the purposes of IDE integration

被标记为源的 .h 文件可以被 IDE 找到，防止 IDE 爆红找不到头文件。
:::

| 参数 | 说明 |
|------|------|
| `PRIVATE` | 告诉目标编译源文件，也就是编译时带上这些文件 |
| `INTERFACE` | 给 head_only 库用 -> 把文件集合（引用的文件）放 INTERFACE_HEADER_SETS 变量里 |
| `PUBLIC` | target_sources 里用的少，表示 PRIVATE 加 INTERFACE |

`FILE_SET` 文件集名称可以取任意不加下滑线等正常英文名，这一项区别 C++ 头文件和模块的。不使用模块用头文件的话使用管用方式就好。

`FILES` 这里的参数表示具体参与构建的文件，可以使用生成器表达式。

引入 target 是为了跟踪：

- The artifact kind (executable, library, header collection, etc)
- Source files
- Include directories
- Output name of an executable or library
- Dependencies
- Compiler and linker flags

例子：

```cmake
target_link_libraries(Tutorial
  PRIVATE
    MathFunctions
)
```

::: info
>The order here is only loosely relevant. That we call target_link_libraries() prior to defining MathFunctions with add_library() doesn't matter to CMake. We are recording that Tutorial has a dependency on something named MathFunctions, but what MathFunctions means isn't resolved at this stage.
>
>The only target which needs to be defined when calling a CMake command like target_sources() or target_link_libraries() is the target being modified.

调用 `target_link_libraries` 前只需要 Tutorial 的定义即可，MathFunctions 定义无所谓，`add_library(MathFunctions)` 在前在后无关紧要。
:::

### add_subdirectory

集成子项目的cmakelists。

::: info
cmake 处理子项目的子项目的cmakelists时，相对路径都是基于子项目的而不是包含他的上一级cmakelist。
:::

### 引入第三方静态库

以spdlog为例，此类库基本为头文件库体积不大，使用子模块构建：

```bash
git submodule add <path>仓库地址 注意仓库的分支默认是拉取默认分支

git submodule add -b <branch> <repository> <path>  选择分支拉取

git submodule add git@github.com:gabime/spdlog.git
```

```cmake
add_subdirectory(spdlog) #添加子项目 相对当前cmakelist所在文件夹的相对路径

include_directories(spdlog/include/spdlog) #包含头文件


add_executable(hello main.cpp )

target_link_libraries(hello spdlog) #链接库
```

### find_library

应用于单纯的二进制包，没有配置文件，或者本地项目构建出的库。以下以本地构建的库为例：

:::file-tree
- helloproject      
  - build    
    - ...省略
  - src
    - demo1.cpp
    - ...
    - lib
    - mylib.dll(构建后生成)
    - mylib
      - build
        - ...构建文件(省略)  
      - mylib.h
      - mylib.cpp
      - CMakeLists.txt
  - CMakeLists.txt
  - CMakePresets.json
  - hello.cpp
:::

在路径 `helloproject/lib/CmakeLists.txt` 中：

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

在路径 `helloproject/lib/build/` 中执行命令构建目标库：

```bash
cmake .. -G"Ninja"  #生成构建系统 最好指定使用toolchain.cmake配置指定编译器而不是让cmake寻找编译器可能会找到意料之外编译器或版本
cmake --build .  #单个库通常不需要指定目标
```

在路径 `helloproject/CmakeLists.txt` 中：

```cmake
...
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
`<VAR>`：首个参数指定查找结果作为变量（库的全路径包括后缀），上述命令中为 `test_path`。当库未被找到，`<var>` 中存放的值为 `<var>-NOTFOUND`。

`NO_CACHE` 项：只要 `<var>` 中的值不是 `<var>-NOTFOUND`（或有值），那么即使多次调用 `find_library`，`<var>` 也不会再刷新（只要找到一个 `<var>`，后续每次执行 cmake 命令得到的 `<var>` 都是首次找到的 `<var>` 值（除非清除 CMakeCache.txt 文件）。该选项将 `<var>` 变量当成一个普通变量而不是一个缓存条目，需要 cmake 3.21 及以上的版本支持（理解为全局变量，且会写入 CMakeCache.txt 文件，在不清除 CMakeCache.txt 文件的情况下，每次执行 cmake 都会先从 CMakeCache.txt 载入该变量的值）。
:::

```cmake
#例
cmake_minimum_required (VERSION 3.21)
project (fl)
find_library (libvar mymath PATHS ./mylib NO_CACHE)
find_library (libvar mymath PATHS ./lib NO_CACHE) # 即使./lib中也存在mymath库，由于在上一步的./mylib中已经找到，因此本条命令不会执行查找
if (${libvar} STREQUAL "libvar-NOTFOUND")
    message (FATAL_ERROR "required mymath library but not found!")
else()
    message (STATUS "mymath library found in ${libvar}")
endif()

#例
cmake_minimum_required (VERSION 3.21)
project (fl)
find_library (libvar mymath PATHS ./mylib) # libvar是缓存条目，会存入CMakeCache.txt，后续即使把PATHS ./mylib改成PATHS ./mylib2（不存在库mymath），也不会保存，因为libvar变量已经从缓存中载入
if (${libvar} STREQUAL "libvar-NOTFOUND")
    message (FATAL_ERROR "required mymath library but not found!")
else()
    message (STATUS "mymath library found in ${libvar}")
endif()
```

`NAMES` 或 `name`：指定一个或多个库的名字，上述命令中为 `NAMES test`。

::: tip
`[PATHS [path | ENV var]...]` 或 `[HINTS [path | ENV var]...]`：可选项，指定搜索库的路径，上述命令中为 `PATHS ./lib`。同时可以指定环境变量。

`find_library (libvar mymath PATHS ENV TESTPATH)` 指定环境变量 `TESTPATH` 为查找路径，假设环境变量被设置为 `./lib`。
:::

`REQUIRED`：指定该选项后，当找不到库，会输出一条错误信息并终止 cmake 处理过程；未指定 REQUIRED 选项，当 `find_library` 未找到库时，后续 `find_library` 有针对 `<var>` 的调用会继续查找。该选项需要 cmake 3.18 及以上的版本支持。

`PATH_SUFFIXES`：为每个搜索目录添加变量 `PATH_SUFFIXES` 指定的后缀目录，假设当前搜索的目录为 `/A;/C/D`，`PATH_SUFFIXES` 指定的后缀目录为 `PS`（当前可以指定多个，以分号分割开即可），那么除了 `/A;/C/D` 之外，`/A/PS;/C/D/PS` 也会被搜索。

```cmake
find_library (libvar mymath PATHS ./ PATH_SUFFIXES mylib) # 会从./以及./mylib中搜索指定的mymath库是否存在
```

`CMAKE_FIND_ROOT_PATH`：指定搜索的根路径。

`CMAKE_SYSROOT`：该选项的值会传递给编译器的 `--sysroot` 标记（`--sysroot` 用于指定编译搜索库和头文件的根目的，例如编译器原本搜索 `/A/include` 和 `/A/lib`，使用 `--sysroot=DIR` 后，编译器搜索的库和头文件目录变成 `/DIR/A/include` 和 `/DIR/A/lib`）。

`NO_DEFAULT_PATH`：如果指定了，默认搜索路径不会生效。

默认搜索路径：`CMAKE_LIBRARY_ARCHITECTURE`、`CMAKE_PREFIX_PATH`、`CMAKE_LIBRARY_PATH`、`CMAKE_FRAMEWORK_PATH` 指定的路径或系统环境变量（例如系统环境变量 `LIB` 和 `PATH` 定义的路径）、系统的默认的库安装路径，例如 `/usr`、`/usr/lib` 等。

::: steps
1. 先找包路径 `<PackageName>_ROOT`（`NO_PACKAGE_ROOT_PATH` 或 `CMAKE_FIND_USE_PACKAGE_ROOT_PATH` 为 FALSE 则跳过）
   - `<CurrentPackage>_ROOT`, `ENV{<CurrentPackage>_ROOT}`, `<ParentPackage>_ROOT`, `ENV{<ParentPackage>_ROOT}`

2. cmake 缓存变量，即命令行中 `-D <VAR>=value` 设置的变量，例如 `cmake . -DCMAKE_XXX_PATH=D:xxx\xxx`
   - `NO_CMAKE_PATH` 如果设置了此项或 `CMAKE_FIND_USE_CMAKE_PATH` 为 FALSE 则跳过

3. cmake 指定的环境变量
   - `CMAKE_FIND_USE_CMAKE_ENVIRONMENT_PATH` 设置此项为 FALSE 或 `NO_CMAKE_ENVIRONMENT_PATH` 跳过此过程

4. `HINT` 指定的路径
   - `HINT` 使用系统内计算的软路径，相对路径；`PATH` 指定硬编码的路径

5. 编译环境的系统环境变量（例如系统环境变量 `LIB` 和 `PATH` 定义的路径）
   - `NO_SYSTEM_ENVIRONMENT_PATH` 或 `CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH` 为 FALSE 时跳过

6. 当前系统平台中相关的 cmake 变量（系统的默认的库安装路径）
   - `CMAKE_INSTALL_PREFIX` 和 `CMAKE_STAGING_PREFIX`
   - `NO_CMAKE_SYSTEM_PATH` 或 `CMAKE_FIND_USE_CMAKE_SYSTEM_PATH` 为 FALSE 可以跳过所有这些路径搜索
   - 关联路径替换为：
     - `CMAKE_SYSTEM_PREFIX_PATH` 默认前缀 Windows 下的 `/XXXX/Program Files`，Linux 下的 `/usr` 或 `/usr/local`
     - `CMAKE_SYSTEM_LIBRARY_PATH` 默认是当前系统的标准目录
     - `CMAKE_SYSTEM_FRAMEWORK_PATH` 给 macOS 用，其框架路径
   - 通常是已安装的软件的位置，比如 Linux 下软件安装到 `/usr/local`

7. `PATHS` 指定路径或简短版本 `find_library (<VAR> name1 [path1 path2 ...])` 中的路径 path1, path2...

指定如下这些变量也能忽略上述查找：`CMAKE_IGNORE_PATH`, `CMAKE_IGNORE_PREFIX_PATH`, `CMAKE_SYSTEM_IGNORE_PATH` 和 `CMAKE_SYSTEM_IGNORE_PREFIX_PATH`。

other：
- `<prefix>/lib/<arch>`：`CMAKE_LIBRARY_ARCHITECTURE` 如果该变量被设置，那么会搜索目录 `${CMAKE_PREFIX_PATH}/lib/${CMAKE_LIBRARY_ARCHITECTURE}`
- `CMAKE_PREFIX_PATH` 多个前缀以分号分隔，比如 `CMAKE_PREFIX_PATH=A;B`，那么会为 `${CMAKE_PREFIX_PATH}/lib` 即 `A/lib`, `B/lib` 中查找库
- `CMAKE_LIBRARY_PATH` 指定 `find_library` 的库查找目录，默认值为空，多个值时需要以分号分割列表指定
- `CMAKE_FRAMEWORK_PATH` 给 macOS 用的
- `<prefix>/lib/`
:::

默认搜索路径需要涵盖最常用和最不常用的情况，通常使用 `NO` 前缀项忽略。

```cmake
find_library (<VAR> NAMES name PATHS paths... NO_DEFAULT_PATH)
find_library (<VAR> NAMES name)
```

`NAMES` 指定多个名字时，默认每个路径都搜索一遍该名字（一个名字在多个文件夹搜索）。

`NAMES_PER_DIR` 选项指定一次考虑一个文件夹（路径）每次搜索所有名字（多个名字在一个文件夹检索）。

查找库名字时先原样查找，给什么查什么，比如：

```cmake
find_library (lib NAMES mylib PATHS "D:\xxx\xxx" NO_DEFAULT_PATH)
```

那么先查找 `mylib`。某些平台规定的前后缀（例如 `.lib` 或 `.so`）由 `CMAKE_FIND_LIBRARY_PREFIXES` 和 `CMAKE_FIND_LIBRARY_SUFFIXES` 变量指定。当然也可以直接写明后缀，如 `mylib.a`（unix）`mylib.lib`（win）。

如果目标库是框架，`<VAR>` 变量存储目标库的全路径 `<fullPath>/A.framework`。当框架被当作库使用时，使用 `-framework A` 和 `-F<fullPath>` 链接框架到目标。

如果指定了自定义搜索路径前缀 `CMAKE_FIND_LIBRARY_CUSTOM_LIB_SUFFIX`，那么搜索时的前缀路径 `lib/` 会替换为 `${CMAKE_FIND_LIBRARY_CUSTOM_LIB_SUFFIX}/`（同样存 `lib32`, `libx32`, `lib64` 版本）。`project()` 命令启动时如果设置了至少一种语言，那么会自动设置此类变量。

`FIND_LIBRARY_USE_LIB32_PATHS`（同样存 `lib32`, `libx32`, `lib64` 版本）：在搜索路径中匹配到 `lib/` 后，会为这个目录添加一个后缀，然后在添加后缀后的目录中搜索库。

```cmake
cmake_minimum_required (VERSION 3.21)
project (fl)

find_library (libvar mymath PATHS ./lib) # 假设lib目录不存在但是lib64目录存在
if (${libvar} STREQUAL "libvar-NOTFOUND")
    message (FATAL_ERROR "required mymath library but not found!")
else()
    message (STATUS "mymath library found in ${libvar}")
endif()

# 命令行中执行
cmake .

# 执行结果
-- mymath library found in /XXX/lib64/libmymath.a
```

### cmake的构建命令

如果你使用 `cmake --build` 而不是直接调用更底层的构建系统（译者注：比如直接使用 `make`），你可以用 `-v` 参数在构建时获得详细的输出（CMake 3.14+），用 `-j N` 指定用 N 个 CPU 核心并行构建项目（CMake 3.12+），以及用 `--target`（任意版本的 CMake）或 `-t`（CMake 3.15+）来选择一个目标进行部分地构建。这些命令因不同的构建系统而异，例如 `VERBOSE=1 make` 和 `ninja -v`。你也可以使用环境变量替代它们，例如 `CMAKE_BUILD_PARALLEL_LEVEL`（CMake 3.12+）和 `VERBOSE`（CMake 3.14+）。

### cmake add_custom_command 命令

还有一个相关的函数 `add_custom_target`。

`add_custom_command` 有一些典型用法，见 cmake 文档里的[链接](https://cmake.org/cmake/help/latest/command/add_custom_command.html#examples-generating-files)。

典型用法：
1. 构建动态库前使用代码生成工具生成源文件参与构建
2. 在构建事件后执行复制 dll 到可执行文件夹下，或在构建后执行清理操作

函数原型就不列出了，只说几个重要的参数。

第一个重载：生成文件；第二个重载：构建事件。

```cmake
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

| 参数 | 说明 |
|------|------|
| `OUTPUT` | 指定生成的文件创建在和当前cmakelist同一路径中，只要没有这些文件就会执行命令 |
| `COMMAND` | 后跟实际需要执行的执行，一般是命令行指令，也可以是可执行文件、python命令、自定义脚本，凡是能在命令行执行的都能在这里设置 |
| `DEPENDS` | 指定依赖项，当依赖项变动时会执行命令。时间戳 |

::: info
>If DEPENDS is not specified, the command will run whenever the OUTPUT is missing

不指定 `DEPENDS`，那么 `OUTPUT` 缺失每次都会执行。
:::

依赖关系：`DEPENDS 指定的目标/文件` -> `自定义命令` -> `OUTPUT 生成的文件`

依赖项除了文件还能是由 `add_custom_target` 或 `add_library`/`add_executable` 创建的目标。

如果依赖了目标 target，那么此命令会在任何依赖的目标生成前执行。这建立了一个执行命令/生成文件->构建目标的依赖关系。

可执行文件或库则建立文件级别依赖。那么只要重新编译了那么就会执行该命令。

已经添加到生成目标的源文件，如 `add_executable(cmakestudy main.cpp)` 里的 `main.cpp` 也会建立文件级别依赖。

依赖绝对路径和相对路径的话也会建立文件级别依赖。

如果未指定 `DEPENDS`，则命令将在 `OUTPUT` 缺失时运行；如果命令实际上没有创建 `OUTPUT`，则规则将始终运行。

`BYPRODUCTS` 非主要构建产物（副产品），ninja 明确支持。

::: info
>Specify the files the command is expected to produce but whose modification time may or may not be newer than the dependencies.

指定生成的文件可能会比依赖项更新，或者不更新。这个解释好拗口，大致意思是，这是副产品有时候生成有时候不生成，这时候依赖副产品的构建可能就会出问题。你指定了这是副产品，那么 Ninja 生成器就能处理正确依赖，在你不能保证生成最新的文件时候依然能构建。
:::

| 参数 | 说明 |
|------|------|
| `COMMENT` | 构建时在执行命令之前输出注释 |
| `VERBATIM` | 告诉 cmake 执行的命令的参数不要转义，原样传递给命令 |
| `WORKING_DIRECTORY` | 执行命令前会从 cd 到该参数指定的路径下 |

第二个重载：

`TARGET`：依赖的目标，依赖目标变动（该命令会被当做目标构建的一部分）才会执行，换句话说只有目标被构建的时候才会执行。如果目标源文件不变，`cmake --build . --target hello` 这个命令执行第一次会执行一次命令。再次生成目标，因为源代码没变不需要重新构建所以该命令不会执行。

`PRE_BUILD | PRE_LINK | POST_BUILD`：命令执行的时机，构建前、链接前、构建后。

::: warning
>This option has unique behavior for the Visual Studio Generators. When using one of the Visual Studio generators, the command will run before any other rules are executed within the target. With all other generators, this option behaves the same as PRE_LINK instead. Because of this, it is recommended to avoid using PRE_BUILD except when it is known that a Visual Studio generator is being used

这里单独解释了 `PRE_BUILD`，对于 VS 生成器来说，使用此参数会在任意构建行为前执行，对其他生成器，`PRE_BUILD` 和 `PRE_LINK` 效果一样，别生成器可能不支持此参数，我用 Ninja 是这样的。
:::

```bash
add_custom_command(
    TARGET hello
    PRE_BUILD
    COMMAND ${CMAKE_COMMAND} -E echo "This is a pre-build command for hello target"
    COMMENT "Pre-build command for hello target"
)

[proc] 正在执行命令: D:...\cmake\bin\cmake.EXE --build C:.../deve_env/build/clang-msvc-clangd-debug --target hello --
[build] [1/5] generate_time-alawys
[build] [2/5] Generating output files-DEPENDS
[build] [3/5] Generating CXX dyndep file CMakeFiles/hello.dir/CXX.dd
[build] [4/4] Linking CXX executable C:...deve_env\out\hello.exe
[build] This is a pre-build command for hello target
[driver] 生成完毕: 00:00:02.193
[build] 生成已完成，退出代码为 0

#换成PRE_LINK
[proc] 正在执行命令: D:..\cmake\bin\cmake.EXE --build C:.../deve_env/build/clang-msvc-clangd-debug --target hello --
[build] [1/5] generate_time-alawys
[build] [2/5] Generating output files-DEPENDS
[build] [3/5] Generating CXX dyndep file CMakeFiles/hello.dir/CXX.dd
[build] [4/4] Linking CXX executable C:...\deve_env\out\hello.exe
[build] This is a pre-link command for hello target
[driver] 生成完毕: 00:00:01.963
[build] 生成已完成，退出代码为 0
```

很奇怪的是这里 COMMENT 没打印出来，而且 echo 消息都是在链接后打印出来的，可能 Ninja 编译期都不支持此参数？这个需要查一下文档。

这个重载用法基本上就是构建后复制、签名、打包。

用的少的参数：

| 参数 | 说明 |
|------|------|
| `APPEND` | 在 COMMAND 后添加命令，注意 COMMAND 可以加很多行，对同一文件多次处理时使用多个 `add_custom_command` 时存在一个命令链，没用过 |
| `USES_TERMINAL` | 指定使用的终端，和 APPEND 不能一起使用。对于 Ninja 生成器这会把命令放在 console pool 中（因为 ninja 可以并发构建） |
| `JOB_POOL` | 任务池，Ninja 专用的 |
| `JOB_SERVER_AWARE` | 给 makefile 用的，没去了解 |

例子：

```cmake
add_custom_command(
    TARGET cmakestudy
    PRE_LINK
    COMMAND ${CMAKE_COMMAND} -E echo "testfile2\n" > output2.txt
    COMMENT "test for pre_link output file2"
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    VERBATIM
)
```

关于这个命令我搜到一个[问题](https://discourse.cmake.org/t/define-a-pre-build-command-without-creating-a-new-target/1623/3)。利用：

>If `DEPENDS` is not specified, the command will run whenever the `OUTPUT` is missing; if the command does not actually create the OUTPUT, the rule will always run.

`OUTPUT` 指定一个虚拟文件，实际命令中不生成他，以此来每次构建时都执行该命令。

```cmake
add_custom_command(OUTPUT "foo" "${VisualT_BINARY_DIR}/src/buildDate.h"
                   COMMAND ${CMAKE_COMMAND} -P "${VisualT_BINARY_DIR}/cmake/ConfigureBuildDate.cmake"
                   COMMENT "generating build date header"
                   )
add_library(VisualT_library SHARED "${private_headers}" "${public_headers}" "${sources}") #buildDate.h is contained in "private_headers"
```

这里不生产 foo，让每次构建 `VisualT_library` 时都执行 `ConfigureBuildDate` 脚本。实际确实有时候执行有时候不执行，有时候执行两次。这个问题和 Makefile 相关，[解决方案](https://gitlab.kitware.com/cmake/cmake/-/issues/21061)。

在学习此命令时，我问了 deepseek：add_custom_command 什么时候才会执行。他告诉我三种情况：

1. `OUTPUT` 生成的文件不存在时
2. `DEPENDS` 中依赖的文件比 `OUTPUT` 文件更新时
3. 其他命令或目标依赖此 `OUTPUT` 时

例一：一开始我写一个规则

```cmake
add_custom_command(
    OUTPUT ${OUTPUT2}
    COMMAND ${CMAKE_COMMAND} -P echo "hello" > ${OUTPUT2}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "Generating output files-DEPENDS"
    VERBATIM
)
```

然后没有指定任何依赖，配置后点击生成，构建时 COMMENT 没打印，也没文件生成。后来我才明白要让生成文件参与目标的构建，被构建目标依赖命令才会执行。按照 cmake 文档的实例，文档中依靠工具生成模板 .c 文件然后添加到构建目标的依赖中，在构建目标生成之前，该命令会执行。

```cmake
add_executable(hello main.cpp ${OUTPUT2})
add_library(lib xx.cpp ${OUTPUT2})
#这样不行,添加依赖只能添加目标的依赖而不能是文件
add_dependencies(hello ${OUTPUT2})
#但是自定义创建一个目标再令其依赖${OUTPUT2}
add_custom_target(
    test1
    DEPENDS ${OUTPUT2}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "generate_time2-alawys"
    VERBATIM
)
#再令该目标与生成的目标建立依赖
add_dependencies(hello test1)
#或手动构建该目标
cmake -build. --target test1
```

都可以执行生成 `${OUTPUT2}` 的命令。注意需要在构建目标的过程中形成依赖，我一开始的错误是即使没有将依赖连接到构建目标上，所以命令根本不会执行。

例2：这个例子是我当初想要试试 `add_custom_command` 是否真的依赖 `DEPENDS` 声明的文件或目标；根据依赖比 `OUTPUT` 生成文件要新从而生成文件，我写了如下测试：

```cmake
set(OUTPUT1 ${CMAKE_CURRENT_SOURCE_DIR}/log.txt)
set(OUTPUT2 ${CMAKE_CURRENT_SOURCE_DIR}/log2.txt)
add_custom_command(
    OUTPUT ${OUTPUT1}
    COMMAND echo "This is a custom command that generates output files" > ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "Generating output files1"
    VERBATIM
)
add_custom_command(
    OUTPUT ${OUTPUT2}
    COMMAND echo "This is a custom command that generates output files" > ${OUTPUT2}
    BYPRODUCTS ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "Generating output files2"
    VERBATIM
)
add_executable(hello main.cpp ${OUTPUT2})
```

我很快就发现了问题，`${OUTPUT1}` 每次生成的内容都是一样的，所以依赖项不会更新，即使修改源码重新构建也只会执行配置后开始的第一次。注意 Ninja 是增量构建，如果文件没有变动反复生成同一目标实际是不会构建的只会报：

```
[build] ninja: no work to do.
```

所以我寄希望与生成当前时间写入文件中（这样就不需要我每次都手动改动文件来观测了），我的期望是每次生成时写入新的当前时间到 `${OUTPUT1}`，因为生成 `${OUTPUT2}` 依赖 `${OUTPUT1}`，所以命令 Generating output files2 总会执行。我新增如下测试：

```cmake
#新增和修改部分,其他地方和之前一致
string(TIMESTAMP TIME_NOW "%m-%d-%H:%M:%S")
message(STATUS "当前时间: ${TIME_NOW}")
add_custom_command(
    OUTPUT ${OUTPUT1}
    COMMAND echo "This is time is${TIME_NOW}" > ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "Generating output files1"
    VERBATIM
)
...
```

该测试也只是在第一次配置后执行，之后就不执行了。分析一下：目标 hello 依赖 `${OUTPUT2}`，`${OUTPUT2}` 依赖 `${OUTPUT1}`。

`${OUTPUT1}->${OUTPUT2}->hello` 很明显 OUTPUT1 是没有依赖的，所以生成后只要该文件不删除那么就不会执行，所以 OUTPUT2 也不会执行。随后我使用 `add_custom_target`，以为目标默认都不是最新的所以每次都会执行构建行为：

```cmake
string(TIMESTAMP TIME_NOW "%m-%d-%H:%M:%S")
set(OUTPUT1 ${CMAKE_CURRENT_SOURCE_DIR}/log.txt)
set(OUTPUT2 ${CMAKE_CURRENT_SOURCE_DIR}/log2.txt)
message(STATUS "当前时间: ${TIME_NOW}")
add_custom_target(
    alawys_run
    COMMAND echo "This is time is${TIME_NOW}" > ${OUTPUT1}
    BYPRODUCTS ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "Generating output files1"
    VERBATIM
)
add_custom_command(
    OUTPUT ${OUTPUT2}
    COMMAND echo "This is a custom command that generates output files" > ${OUTPUT2}
    DEPENDS ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    COMMENT "Generating output files2"
    VERBATIM
)

add_executable(hello main.cpp)
add_dependencies(hello alawys_run)
```

让 hello 依赖 alawys_run，`${OUTPUT2}` 再依赖 alawys_run 的生成文件 `${OUTPUT1}`。按道理，这两个命令都会执行的，但实际是只执行一次就歇菜了。这是为什么呢？我搞了好久才明白：

```cmake
string(TIMESTAMP TIME_NOW "%m-%d-%H:%M:%S")
```

这里生成的时间戳是静态的，每次 configure 也就是 `cmake --build ./build -G ninja -S .` 的时候就生成了，之后每次构建时间就是相同的。要想动态的只能使用脚本。我在 Windows 上构建，Powershell 脚本很简单：

```powershell
#ps1
$time = Get-Date -Format "MM-dd-HH:mm:ss"
Add-Content -Path "log.txt" -Value $time
#cmake 脚本
string(TIMESTAMP now "%m-%d-%H:%M:%S")
file(APPEND log2.txt "${now}\n")
```

调用脚本才能动态生成时间：

```cmake
set(OUTPUT1 ${CMAKE_CURRENT_SOURCE_DIR}/script/log.txt)
set(OUTPUT2 ${CMAKE_CURRENT_SOURCE_DIR}/script/log2.txt)



# 强制每次都执行
add_custom_target(
    generate_time
    COMMAND powershell -ExecutionPolicy Bypass -File ./cr_time.ps1
    #DEPENDS ${OUTPUT1}
    BYPRODUCTS ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/script
    COMMENT "generate_time-alawys"
    VERBATIM
)
#上下两个脚本执行一个就行了
add_custom_target(
    generate_time2
    DEPENDS ${OUTPUT2}
    #DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/script/TEST.txt
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/script
    COMMENT "generate_time2-alawys"
    VERBATIM
)
add_custom_command(
    OUTPUT ${OUTPUT2}
    COMMAND ${CMAKE_COMMAND} -P ${CMAKE_CURRENT_SOURCE_DIR}/script/cr_time_c.cmake
    DEPENDS ${OUTPUT1}
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/script
    COMMENT "Generating output files-DEPENDS"
    VERBATIM
)


add_executable(hello main.cpp)
#这里选择执行哪个就添加哪个做依赖
add_dependencies(hello generate_time generate_time2)
```

### add_custom_target

首先声明一点，现代 cmake 构建是以 target（目标）来构建代码的，创建目标避免声明式的全局依赖。之前都是用类似 `include_directories`、`link_directories` 这种命令，这种命令是全局在子项目头文件和链接库也会包含进来。为了更好更模块化的项目管理构建，使用面向目标的命令。`add_custom_target` 正是有别于 `add_library` 和 `add_executable` 创建一个自定义目标。这个目标不一定需要生成目标，通常执行一些外部脚本，例如编写 C++ 程序需要一些前置文件，由 python 脚本或其他语言的现有程序生成，那么以此创建一个目标来执行命令更加符合现代 cmake 的用法。

首先熟悉一下该命令的参数：

```cmake
add_custom_target(Name [ALL] [command1 [args1...]]
                  [COMMAND command2 [args2...] ...]
                  [DEPENDS depend depend depend ...]
                  [BYPRODUCTS [files...]]
                  [WORKING_DIRECTORY dir]
                  [COMMENT comment]
                  [JOB_POOL job_pool]
                  [JOB_SERVER_AWARE <bool>]
                  [VERBATIM] [USES_TERMINAL]
                  [COMMAND_EXPAND_LISTS]
                  [SOURCES src1 [src2...]])
```

| 参数 | 说明 |
|------|------|
| `Name` | 目标的名字 |
| `ALL` | 用来指示是否作为默认构建的目标。当我们执行 `cmake --build .` 而不在最后指定目标时，指示这个会在我们构建全部目标时把此目标加入构建。后面的可以跟命令但这是隐式的行为，一般使用 COMMAND 声明后写命令 |
| `COMMAND` | 传入的命令，多个命令按顺序执行但不构成有状态的偏序。该命令同时可以把其他 `add_executable` 创建的目标作为参数，也就是说可以先生成其他可执行文件，再执行作为此次构建的依赖。COMMAND 的参数可以使用生成器表达式 |
| `BYPRODUCTS` | 命令执行的副产物，命令不一定每一次执行都生成一个一定的文件所以叫副产物，有时生成有时不生成。这玩意可以提供依赖无论是 `add_custom_target` 还是 `add_custom_command`、`add_dependencies` 用此声明的名字，都可以作为这些命令的 DEPENDS 的依赖项 |
| `WORKING_DIRECTORY` | 命令执行时的路径，可以使用生成器表达式 |
| `COMMENT` | 构建时 echo 命令行的提示信息，可以使用生成器表达式 |
| `DEPENDS` | 类似 `add_custom_command` 页的介绍，也可以依赖同一 cmakelist 文件中 `add_custom_command()` 创建的 OUTPUT 的文件和依赖的文件项 |
| `COMMAND_EXPAND_LISTS` | 让 COMMAND 中的参数列表会展开，假如你传的是 `${MY_ARGS}` 这样一个变量，这个变量包含多个参数，会当整个字符串都当一个参数传进去 |
| `SOURCES` | 指定该目标的源文件，这些文件不会参与编译不影响构建，这是给 VSCode、CLion 这些 IDE 的插件看到你定义了这个目标就会在图形化界面里添加到该目标下面方便你编辑和管理 |
| `VERBATIM` | 转义的传入参数为了原样传入参数，也就说不用写 `\a` `\"` 这样的转义符 cmake 自动帮你转义 |
| `JOB_POOLS` | ninja 这些多线程构建器会使用，和 USES_TERMINAL 不兼容 |

::: warning
该命令是在执行 `cmake --build .` 也就是调用内部生成器构建编译代码时执行的。`add_custom_target` 在语义上只有生成的副产品而没有生成文件，cmake 文档明确说：就算生成和目标同名的文件都会当做过时的所以只要添加依赖，每次构建都会生成。所以用来生产时构建时日志。
:::

### 生成器表达式

==用于在生成阶段而不是配置阶段生成数据==，一般用来生成路径。

config：使用 `cmake -B build -G Ninja -S . --preset xxx` 这是在配置（config）cmake。

`cmake --build build --target <target_name>` 这是在生成阶段。

生成器表达式的语法：

```cmake
<KEYWORD:condition[,...]> 或 $<KEYWORD:argument>
```

示例1：库添加头文件

```cmake
target_include_directories(generate_sql_core
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
)
```

这里 `BUILD_INTERFACE` 表示构建时候包含的头文件，`INSTALL_INTERFACE` 表示安装该库后别人通过 `find_library` 命令找到该库后 cmake 包含的头文件。

示例2：windows 使用动态库，构建完成后复制动态库 dll 到 exe 可执行文件夹下

```cmake
add_custom_command(
    TARGET sharedlib
    POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
        $<TARGET_FILE:sharedlib>
        $<TARGET_FILE_DIR:hello>/$<TARGET_FILE_NAME:sharedlib>
    COMMENT "复制 DLL 到 exe 目录下（使用生成器表达式）"
    VERBATIM
    )
```

| 生成器表达式 | 说明 |
|-------------|------|
| `TARGET_FILE` | 这里的生成器表达式表示目标 sharedlib 的二进制文件（dll）的绝对路径 `.../sharedlib.dll` |
| `TARGET_FILE_DIR` | 很明显表示 hello（构建目标依赖动态库）二进制文件（exe）的目录 |
| `TARGET_FILE_NAME` | 因为库可以有别名具体生成的 dll 文件名不一定是 sharedlib，这里可以准确生成正确的文件名 |

其他生成器表达式参考[链接](https://cmake.org/cmake/help/latest/manual/cmake-generator-expressions.7.html#genex:TARGET_PROPERTY)。

## 为项目添加依赖

### find_package

该指令有两种模式查找包：

**module 模式**：该模式 cmake 通过搜索文件名格式为 `Find<PackageName>.cmake` 的脚本文件，由该脚本来找包。在 cmake 安装路径 `<cmake_path>/share/cmake<version>/` 可以看到一些该格式的脚本，这些都是 cmake 维护一份查找常用软件包的脚本。当然这些脚本通常不是库提供者维护的可能会有些过时。同时也可以自主维护一个 `Find<PackageName>.cmake` 脚本。

通常在调用 `find_package` 的 module 模式之前，设置 `CMAKE_MODULE_PATH` 变量为 `Find<PackageName>.cmake` 的查找路径让 cmake 找到需要的脚本。其次会去 cmake 维护的路径搜索。

**config 模式**：这个推荐且比较常使用；除非特殊指定一般 module 模式查找失败是会使用该模式。通常在 github 下载包后，使用 cmake 构建完成，项目的 `<packagename>/lib/cmake/` 路径会存在形如 `<PackageName>Config.cmake` 或 `<LowercasePackageName>-config.cmake`、`<lowercasePackageName>-config-version.cmake`、`<PackageName>ConfigVersion.cmake` 的文件，前两个比较常见，这些是由软件/包开发者同步维护的。cmake 的 config 模式正是通过搜索该文件来查找引入软件包。

同文件夹下可能还存在 `<PackageName>ConfigVersion.cmake` 或 `<LowercasePackageName>-config-version.cmake` 脚本用来指示包的版本并验证包版本是否满足查找要求。只要 `<PackageName>Config.cmake` 被找到且版本满足要求那么包就被视为被找到，一个常用变量 `<PackageName>_FOUND` 被设置为 true。

::: tip
一个 `<PackageName>Config.cmake` 可能包含多个导出的目标，这些目标可能是经过子模块构建的，然后通过 cmake 命令 `include()` 包含该 `.cmake` 的脚本文件来引入目标。
:::

使用 `find_package` 的 config 模式之前一般会设置 `CMAKE_PREFIX_PATH` 变量来引入包路径。

假设存在一个包路径为 `./libs/A_package/lib/cmake/A_compent/A_packageConfig.cmake`，那么就要把 `CMAKE_PREFIX_PATH` 设置为 `./libs/A_package`。同时也可以设置一个同名环境变量 `CMAKE_PREFIX_PATH` 来指示包搜索路径。

`<PackageName>_DIR` 也可以指示搜索路径，不过这个路径要指示到 `./lib/cmake/A_compent/`。

find_package 的函数签名：

```cmake
#典型用法
find_package(<PackageName> [<version>] [REQUIRED] [COMPONENTS <components>...])
#该签名只有PackageName是必要的


#常见写法
find_package(Catch2)
find_package(GTest REQUIRED)
find_package(Boost 1.79 COMPONENTS date_time)

#基本签名 Basic Signature
find_package(<PackageName> [version] [EXACT] [QUIET] [MODULE]
             [REQUIRED|OPTIONAL] [[COMPONENTS] [components...]]
             [OPTIONAL_COMPONENTS components...]
             [REGISTRY_VIEW  (64|32|64_32|32_64|HOST|TARGET|BOTH)]
             [GLOBAL]
             [NO_POLICY_SCOPE]
             [BYPASS_PROVIDER]
             [UNWIND_INCLUDE])
```

介绍一下 Basic Signature，被 module 和 config 模式同时支持。这两种模式找到包都会设置一个 `<PackageName>_FOUND` 变量指示是否找到包。

一些参数的用处：

| 参数 | 说明 |
|------|------|
| `[QUIET]` | 禁用信息提示，REQUIRED 的包找不到不会报错 |
| `[OPTIONAL]` | 指示的包是可选的，找不到不报错 |
| `[REQUIRED]` | 指示的包是必要的，找不到包 cmake 会报错并停止配置 |
| `[[COMPONENTS] [components...]]` | COMPONENTS 关键字后跟该包需要引入的组件名，例如 Boost 库下的 regex asio 等组件，任意一个组件找不到则整个包被视为找不到 |
| `[version]` | 指示所查询的包版本，两种参数形式：1. `major[.minor[.patch[.tweak]]]`；2. `versionMin...[<]versionMax` 范围形式的两端都包含在内，用了 `<` 符号排除端点 |
| `[EXACT]` | 该参数指示搜索包的版本和 version 完全相同（和 version 的范围参数版本不兼容） |

::: tip
REQUIRED/OPTIONAL 后可以直接跟组件名而不用写 COMPONENTS 关键字，例如：

```cmake
find_package(absl REQUIRED strings flat_hash_map Time)
```

注意 `[version]` `[EXACT]` 参数和 `[COMPONENTS]` 如果不设置会被外部调用的同参数继承。也就是说 `find_package` 指定了 `[version]` `[EXACT]`、`[COMPONENTS]` 参数，所查找到的 `.cmake` 脚本中再次调用 `find_package` 且没指定这三个参数，那么这个子调用也会应用这三个参数。

对于常见调用 `find_package(Catch2)` 不声明组件的调用，具体行为是找到所有组件，不找任何组件或任意个组件由 config.cmake 脚本来决定，cmake 不对这种用法做规定。
:::

*无关紧要的参数说明*

| 参数 | 说明 |
|------|------|
| `[OPTIONAL_COMPONENTS components...]` | 由该参数指示的组件找不到无所谓，只要 required 的组件找到就表示该包被找到 |
| `[REGISTRY_VIEW]` | windows 上有用，通过注册表查询 |
| `[GLOBAL]` | 将引入的组件提升到全局，`CMAKE_FIND_PACKAGE_TARGETS_GLOBAL` 变量也能做这件事 |
| `[BYPASS_PROVIDER]` | 我也没弄懂干嘛的 |
| `[UNWIND_INCLUDE]` | 应用在 `find_package` 中调用 `find_package` 的情况；找不到包就相当于编程语言抛异常栈回溯一层层返回了，不让他继续 `find_package` 和 `include` 了 |

除了基本签名还有一个完整签名的 `find_package`，我省略了部分参数保留部分对我来说有用的解释一下：

```cmake
find_package(<PackageName> [version] [EXACT] [QUIET]
             [REQUIRED|OPTIONAL] [[COMPONENTS] [components...]]
             [CONFIG|NO_MODULE]
             ...
             [NAMES name1 [name2 ...]]
             [CONFIGS config1 [config2 ...]]
             [HINTS path1 [path2 ...]]
             [PATHS path1 [path2 ...]]
             ...
             [PATH_SUFFIXES suffix1 [suffix2 ...]]
             ...)
```

| 参数 | 说明 |
|------|------|
| `[CONFIG\|NO_MODULE]` | 这两是同义词，设置了这个就表示使用 config 模式，会跳过 module 模式的搜索过程 |
| `[NAMES]` | 包名的可选项，设置了此项就不会查找 `<PackageName>` 而是把 names1... 当包名查找 |
| `[CONFIGS]` | 该命令默认会找格式为 `<PackageName>Config.cmake` 的脚本，但是有时脚本名字不叫这一类，该参数允许你指定一类名字 |
| `[PATH_SUFFIXES]` | 为搜索路径指定后缀 |

搜索中所有被考虑的版本的脚本文件的路径放在 `<PackageName>_CONSIDERED_CONFIGS` 变量里，对应的版本文件路径存在 `<PackageName>_CONSIDERED_VERSIONS`。

**config 模式查找顺序**：首先不管什么模式都先在 `CMAKE_FIND_PACKAGE_REDIRECTS_DIR` 指示路径下查找，根据前缀路径和特定格式的路径查找。

可能的前缀，查找顺序为：

::: steps
1. **找根路径**
   - cmake 变量 `<Package_name>_root`（Package_name 大小写都可）
   - 环境变量 `<Package_name>_root`

2. **将如下三个缓存变量做搜索前缀**，在命令行中由 `-DVAR=VALUE` 指定
   - `CMAKE_PREFIX_PATH`
   - `CMAKE_FRAMEWORK_PATH`
   - `CMAKE_APPBUNDLE_PATH`
   - 调用时传参 `NO_CMAKE_PATH` 或设置 `CMAKE_FIND_USE_CMAKE_PATH` 为 FALSE 避免

3. **以下特定环境变量**，一般由 shell 指定的
   - `<PackageName>_DIR`
   - `CMAKE_PREFIX_PATH`
   - `CMAKE_FRAMEWORK_PATH`
   - `CMAKE_APPBUNDLE_PATH`
   - 调用时传参 `NO_CMAKE_ENVIRONMENT_PATH` 或设置 `CMAKE_FIND_USE_CMAKE_ENVIRONMENT_PATH` 为 FALSE

4. **HINTS** 指定的路径
   - `HINTS` 一般由其他已存在的路径组合，相对路径；`PATH` 指定硬编码的路径

5. **编译环境的系统环境变量**（例如系统环境变量 `LIB` 和 `PATH` 定义的路径）
   - `NO_SYSTEM_ENVIRONMENT_PATH` 或 `CMAKE_FIND_USE_SYSTEM_ENVIRONMENT_PATH` 为 FALSE 时跳过

6. **用户注册表**（windows 系统用）

7. **平台指定的 cmake 变量**
   - cmake 在不同平台会设置下面不同变量前缀
   - `CMAKE_INSTALL_PREFIX` / `CMAKE_STAGING_PREFIX`
   - `CMAKE_SYSTEM_PREFIX_PATH`
   - `CMAKE_SYSTEM_FRAMEWORK_PATH`
   - `CMAKE_SYSTEM_APPBUNDLE_PATH`
   - 通过调用时传递 `NO_CMAKE_SYSTEM_PATH` 或设置 `CMAKE_FIND_USE_CMAKE_SYSTEM_PATH` 为 FALSE 跳过上面这些路径的查询

8. **系统注册表**

9. **调用时传递 PATHS** 硬编码路径
:::

::: tip
根路径会传递（按 cmake 文档所说包的根变量被被维护成一个栈），也就是说 `find_package` 查找的 `.cmake` 脚本中又调用了 `find_package`，那么这个子调用的查找路径会包含上一层父调用的。在调用 `find_package` 时手动传 `NO_PACKAGE_ROOT_PATH` 参数或设置变量 `CMAKE_FIND_USE_PACKAGE_ROOT_PATH` 为 FALSE 来避免。

linux 软件可能安装在 `/usr/local`，cmake 就根据平台习惯把指定这些路径为此类变量。

设置 `CMAKE_IGNORE_PATH`, `CMAKE_IGNORE_PREFIX_PATH`, `CMAKE_SYSTEM_IGNORE_PATH` 和 `CMAKE_SYSTEM_IGNORE_PREFIX_PATH` 同样会导致上述路径被忽略。
:::

根据以上路径前缀+特定格式组合成搜索路径，按顺序找到第一个可用的包就不会再找了。见[文档表](https://cmake.org/cmake/help/latest/command/find_package.html#id21)。

例如：
```
./libs/absl/cmake/
./libs/absl/lib/cmake/
```

对于存在多个版本包的配置文件搜索的规则的细致说明参考[文档](https://cmake.org/cmake/help/latest/command/find_package.html#command:find_package:~:text=For%20search%20paths%20which%20contain%20glob%20expressions)。

以下变量也会影响到搜索的路径：

| 变量 | 说明 |
|------|------|
| `CMAKE_FIND_ROOT_PATH` | 默认为空，会重定向 `find_package` 的搜索路径 |
| `CMAKE_SYSROOT` | 除了影响 `find_package` 的搜索结果还会影响别的一般不用 |

::: tip
搜索成功后会缓存变量；要清除构建文件修改路径才能影响。
:::

以下三个变量会改变 `find_package` 包是否必要的行为，在 `find_package` 之前设置：

| 变量 | 说明 |
|------|------|
| `CMAKE_DISABLE_FIND_PACKAGE_<PackageName>` | 不让该包被查找，1.模拟包找不到情况 2.该包内容包含在项目里 |
| `CMAKE_REQUIRE_FIND_PACKAGE_<PackageName>` | 让包称为必须的，该设置优先级高于 `find_package` 传参 OPTIONAL |

常见写法：

```cmake
set(LIB_PATH "D:/workfile/lib")
set(CMAKE_PREFIX_PATH "${LIB_PATH}/abseil")
find_package(absl REQUIRED strings flat_hash_map)
if(absl_FOUND)
    get_target_property(tmp absl::strings INTERFACE_INCLUDE_DIRECTORIES)
    message(STATUS "absl::strings includes: ${tmp}")
    #一般不用写
    #target_include_directories(hello PRIVATE ${LIB_PATH}/abseil/include/absl)
    target_link_libraries(hello PRIVATE absl::strings) 
else()
    message(FATAL_ERROR "Could not find absl")
endif()
```

### FetchContent

### install

### CPS

Common Package Specification 通用包描述文件，以后再看我现在还没用到。

### CPack 生成安装包
