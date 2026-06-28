---
title: 配置cmake
createTime: 2026/06/21 23:31:33
permalink: /article/89jcugmg/
---

## 配置cmake

CMake Tutorial 有这样一个例子

需要在编译时根据不同厂商选择压缩算法的软件

通过使用 `-D` 参数在命令行输入参数传递需要使用的压缩算法，或者使用 `option` 命令。这两种方式设置都是缓存变量，全局可见的。不清理或者删除构建文件夹，`-D` 参数设置都不会变。

```cmake
option(COMPRESSION_SOFTWARE_USE_ZLIB "Support Zlib compression" ON)
option(COMPRESSION_SOFTWARE_USE_ZSTD "Support Zstd compression" ON)
#也可以通过cmake -D传递参数
if(COMPRESSION_SOFTWARE_USE_ZLIB)
  message(STATUS "I will use Zlib!")
  # ...
endif()

if(COMPRESSION_SOFTWARE_USE_ZSTD)
  message(STATUS "I will use Zstd!")
  # ...
endif()
```

::: tip
使用 `set` 也可以设置缓存变量
:::

```cmake
set(StickyCacheVariable "I will not change" CACHE STRING "")
set(StickyCacheVariable "Overwrite StickyCache" CACHE STRING "")

message("StickyCacheVariable: ${StickyCacheVariable}")
```

```bash
cmake -P StickyCacheVariable.cmake
StickyCacheVariable: I will not chang
```

在命令行使用 `-D` 设置变量，在所有 CMakeLists 内命令之前，所有在命令行设置的变量优先级很高。

```bash
cmake \
  -DStickyCacheVariable="Commandline always wins" \
  -P StickyCacheVariable.cmake
StickyCacheVariable: Commandline always wins
```

同时 `set` 也会遮蔽已经存在的缓存变量：

```cmake
set(ShadowVariable "In the shadows" CACHE STRING "")
set(ShadowVariable "Hiding the cache variable")
message("ShadowVariable: ${ShadowVariable}")

unset(ShadowVariable)
message("ShadowVariable: ${ShadowVariable}")
```

```bash
cmake -P ShadowVariable.cmake
ShadowVariable: Hiding the cache variable
ShadowVariable: In the shadows
```

在 `build/CMakeCache.txt` cmake 缓存文件中保存着类似 `MAKE_CXX_COMPILER:FILEPATH=.../clang/llvm/bin/clang++.exe` 这样格式的缓存变量。在命令行中使用 `-D<var>=<value>` 优先级比这里缓存变量文件的优先级还高。

::: info
cmake 里一切皆是字符串，包括 CMakeCache 里 `<Name>:<Type>=<Value>` 形式的说明。
:::

### 设置编译器参数

C++ 标准

cmake 提供的全局缓存变量使用 `CMAKE_` 开头

`-DCMAKE_CXX_STANDARD=20`

### cmake 预设 CMakePreset

为了解决每次构建都要输入过多命令行参数的问题，可以使用 cmake 预设文件：

```bash
cmake \
      -B build \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_CXX_STANDARD=20 \
      -DCMAKE_CXX_EXTENSIONS=ON \
      -DTUTORIAL_BUILD_UTILITIES=OFF \
      ...
      cmake --build build
```

每次配置都需要输入上述冗长的命令，尽管某些终端有历史记录，但添加和修改预设也很麻烦。

cmake preset 将这些常用长时间保持的变量统一保存起来。cmake 预设是一个 json 文件，众所周知 json 文件是键值对的集合，所以 cmake 缓存变量很方便的保存在一起。

如下命令使用预设：

```bash
cmake -B build --preset example-preset
```

::: warning
`-D` 在命令行中传递参数和预设传递参数可以混用，但命令行参数优先级最高
:::

预设可以使用宏变量 `${marc}`

`target_compile_features` 现在基本上用来指定目标的 C++ 版本，其他参数基本上不用这个：

```cmake
target_compile_features(hello PRIVATE cxx_std_23)
```

`target_compile_definitions` 为目标所包含的文件的所有编译单元都加上指定的宏定义，实现上是通过 `-D` 参数传递给编译器：

```cmake
target_compile_definitions(hello PUBLIC HELLO_WORLD=1)
```

`target_compile_options` 通过此命令向编译器传递 `-Wall` `-Werror` 等编译选项。

::: tip 多编译器构建
为支持多编译器构建，不同编译器前端接受的编译选项不同。使用 `CMAKE_CXX_COMPILER_FRONTEND_VARIANT` 变量来查看使用的编译器前端接受哪一类编译器前端。例如 clang 就接受 gcc 的编译器参数；clang-cl 接受 msvc 的参数。
:::

```cmake
if(
  (CMAKE_CXX_COMPILER_ID STREQUAL "MSVC") OR
  (CMAKE_CXX_COMPILER_FRONTEND_VARIANT STREQUAL "MSVC")
)

  target_compile_options(Tutorial PRIVATE /W3)

elseif(
  (CMAKE_CXX_COMPILER_ID STREQUAL "GNU") OR
  (CMAKE_CXX_COMPILER_ID MATCHES "Clang")
)

  target_compile_options(Tutorial PRIVATE -Wall)

endif()
```

`target_link_directories()` 如同以 `-L` 参数向编译器参数指定需要链接的库目录。

`target_include_directories()` 如同以 `-I` 参数向编译器参数指定需要包含的头文件目录。

这两个命令直接指明链接的目录，基本上不直接用。使用现代 cmake 都使用属性直接管理。

需要链接库（头文件库也可）直接使用这个更现代的命令：`target_link_directories()`

### 生成库

cmake 中的库分为以下几类，与 C++ 概念中的库差不多是对应的：

| 库类型 | 说明 |
|--------|------|
| `STATIC` | 静态库 |
| `SHARED` | 共享库/动态库 |
| `MODULE` | C++20 概念的模块，不是直接对应 cmake 里的模块库，对应到支持的别的语言那就是别的东西，这里只讨论 C++ |
| `OBJECT` | 对象库，也就是编译后产生还没链接的二进制文件 |
| `INTERFACE` | 接口库，差不多等于头文件库，没有生成目标 |

::: tip
使用 `add_library(MyLib)` 创建库时第二个参数不写 `STATIC/SHARED`，会根据 `BUILD_SHARED_LIBS` 这个变量决定生成什么库。但是 `BUILD_SHARED_LIBS` 这个变量 cmake 默认不设置，那么你什么都不做 cmake 默认生成静态库。一般都会写。
:::

生成动态库：

```cmake
add_library(testshared SHARED)

target_sources(testshared 
  PRIVATE
    testshared.cxx

  PUBLIC
    FILE_SET HEADERS #让ide发现头文件
    FILES
      testshared.h
)

#这两种写法都行
add_library(generate_sql_core
    src/preprocessfile.cpp
)

# 把头文件显式列为 target 源，方便 VS 关联和显示
target_sources(generate_sql_core
    PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/include/preprocessfile.h
)

# PUBLIC include：用于安装与使用时的接口头路径
target_include_directories(generate_sql_core
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
)
```

### 编译环境/依赖检测

1. `check_include_files` 命令要求 cmake 检查系统中是否存在头文件

```cmake
include(CheckIncludeFiles)
check_include_files(microsoft.ui.h HAVE_SYS_WINUI LANGUAGE CXX)
```

2. `check_source_compiles` 检查是否能编译某段独立代码

::: info
使用 `[[...]]` 表示 cmake 中的多行字符串，`[=[...]=]` 两边等号数量要一致，内容里不含有 `]]` 时可以不写等号。在 `check_source_compiles` 输入多行代码时经常使用。
:::

```cmake
include(CheckSourceCompiles)

check_source_compiles(CXX [[
  int main()
  {
    auto lambda = []() { return 42; };
    return lambda();
  }
]] HAVE_CXX11_LAMBDAS)
```

3. `check_ipo_supported` 检测是否支持链接时 LTO（IPO 又叫 Interprocedural optimization 程序间优化）优化。2026 年了现在 C++ 编译器都支持没啥好说的。

4. `CheckCompilerFlag` 检测编译器是否支持某个选项
