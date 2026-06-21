---
title: 配置cmake
createTime: 2026/06/21 23:31:33
permalink: /article/89jcugmg/
---




## 配置cmake

CMake Tutorial 有这样一个例子

需要在编译时根据不同厂商选择压缩算法的软件

通过使用 -D 参数在命令行输入参数传递 需要使用的压缩算法
或者使用option命令
这两种方式设置都是缓存变量，全局可见的 不清理或者删除构建文件夹  -D参数设置都不会变
```camke
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

tips 使用set也可以设置缓存变量
```cmake
set(StickyCacheVariable "I will not change" CACHE STRING "")
set(StickyCacheVariable "Overwrite StickyCache" CACHE STRING "")

message("StickyCacheVariable: ${StickyCacheVariable}")
```

```shell
cmake -P StickyCacheVariable.cmake
StickyCacheVariable: I will not chang
```

在命令行使用 -D设置变量 在所有cmakelists内命令之前所有在命令行设置的变量优先级很高

```shell
cmake \
  -DStickyCacheVariable="Commandline always wins" \
  -P StickyCacheVariable.cmake
StickyCacheVariable: Commandline always wins
```

同时set也会遮蔽 已经存在的缓存变量
```cmake
set(ShadowVariable "In the shadows" CACHE STRING "")
set(ShadowVariable "Hiding the cache variable")
message("ShadowVariable: ${ShadowVariable}")

unset(ShadowVariable)
message("ShadowVariable: ${ShadowVariable}")
```

```shell
cmake -P ShadowVariable.cmake
ShadowVariable: Hiding the cache variable
ShadowVariable: In the shadows
```

在build/CMakeCache.txt cmake缓存文件中 保存者类似
`MAKE_CXX_COMPILER:FILEPATH=.../clang/llvm/bin/clang++.exe` 这样格式的缓存变量
在命令行中使用 -D\<var\>=\<value\> 优先级比这里缓存变量文件的优先级还高

tips cmake里一切皆是字符串 
包括cmakecache 里 \<Name\>:\<Type\>=\<Value\>形式的说明


### 设置编译器参数

c++ 标准

cmake提供的的全局缓存变量使用CMAKE_开头

-DCMAKE_CXX_STANDARD=20



### cmake预设CMakePreset

为了解决每次构建都要输入过多命令行参数的问题,可以使用cmake预设文件
```shell
cmake \
      -B build \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_CXX_STANDARD=20 \
      -DCMAKE_CXX_EXTENSIONS=ON \
      -DTUTORIAL_BUILD_UTILITIES=OFF \
      ...
      cmake --build build
```
每次配置都需要输入上述冗长的命令 尽管某些终端有历史记录 但添加和修改预设也很麻烦

cmakepreset将这些常用长时间保持的变量统一保存起来 cmake预设是一个json文件众所周知json文件是键值对的集合
所以cmake缓存变量很方便的保存在一起


如下命令使用预设 
cmake -B build --perset example-preset

tips -D在命令行中传递参数和预设传递参数可以昏庸 但命令行 参数优先级最高

预设可以使用宏变量${marc}

target_compile_features 现在基本上用来指定目标的cxx版本 其他参数基本上不用这个
```shell
 target_compile_features(hello PRIVATE cxx_std_23)
```

target_compile_definitions 为目标所包含的文件的所有编译单元都加上指定的宏定义 实现上是通过—D参数传递给编译器
```shell
target_compile_definitions(hello PUBLIC HELLO_WORLD=1)
```

target_compile_options 通过此命令向编译器传递 -Wall -Werror 等编译选项

tips 为支持 多编译器构建不同编译器前端接受的编译选项不同 
使用  CMAKE_CXX_COMPILER_FRONTEND_VARIANT 变量来查看使用的编译器前端接受哪一类编译器前端
例如clang 就接受 gcc的编译器参数 ;clang-cl 接受msvc的参数

```shell
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


target_link_directories()  如同 以-L 参数向编译器参数指定需要链接的库目录

target_include_directories() 如同 以-I 参数向编译器参数指定需要包含的头文件目录
这两个命令直接指明链接的目录 基本上不直接用 使用现代cmake都使用属性直接管理


需要链接库(头文件库也可)直接使用这个更现代的命令
target_link_directories()

### 生成库
cmake中的库分为一下几类与c++概念中的库查不多是对应的

STATIC 静态库

SHARED 共享库/动态库

MODULE c++20概念的模块 不是直接对应cmake里的模块库对应到支持的别的语言那就是别的东西 这里只讨论c++

OBJECT 对象库 也就是编译后产生还没链接的二进制文件

INTERFACE 接口库 差不多等于头文件库没有生成目标

tips
使用add_library(MyLib) 创建库时第二个参数不写 STATIC/SHARED 时会根据BUILD_SHARED_LIBS和BUILD_SHARED_LIBS 这两个变量决定生成什么库 ，但是 BUILD_SHARED_LIBS这个变量cmake默认不设置那么你什么都不做cmake默认生成静态库。一般都会写

生成动态库

```shell
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

### 编译环境/依赖 检测

1.check_include_files 命令要求cmake检查系统中是否存在头文件

```shell
include(CheckIncludeFiles)
check_include_files(microsoft.ui.h HAVE_SYS_WINUI LANGUAGE CXX)
```


2.check_source_compiles 检查是否能编译某段独立代码




tips
使用 表示cmake中的多行字符串
[=*[...内容]*=]  两边等号数量要一致,内容里不含有`]]`时可以不写等号

在check_source_compiles输入多行代码时经常使用
```shell
include(CheckSourceCompiles)

check_source_compiles(CXX [[
  int main()
  {
    auto lambda = []() { return 42; };
    return lambda();
  }
]] HAVE_CXX11_LAMBDAS)
```

3.check_ipo_supported 检测是否支持链接时LTO(IPO 又叫Interprocedural optimization 程序间优化)优化 2026年了现在c++编译器都支持没啥好说的

4.CheckCompilerFlag 检测编译器是否支持某个选项

