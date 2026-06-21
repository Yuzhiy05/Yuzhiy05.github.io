---
title: 使用cmake测试
createTime: 2026/06/21 23:31:33
permalink: /article/3p0nmnyp/
---


# c++测试

## 单纯使用ctest

使用ctest的过程和我们自己写一个可执行目标,把库链接进来.自己写测试函数调用库里类或函数,根据输出判断测试是否正确没什么两样

假设我们已经有了一个库现在需要添加测试
创建一个测试文件夹tests

:::file-tree
-Project
 -build
 -CMakeLists.txt
 -src
  -... #库源码
 -tests
  -testlib.cpp
  -CMakeLists.txt
:::

在tests文件夹下
写测试程序,不一定要cpp可执行程序都行
ctest只关心这个可执行程序能不能跑 测试返回是不是0
当然你要是测试库那肯定要写cpp然后链接进来
例子来自这[cmake教程](https://cmake.org/cmake/help/latest/guide/tutorial/Testing%20and%20CTest.html#solution)
我懒的写了,只是演示一下其实把STEP8看一下也会了，我就记录一下我操作过一遍了
```c++
#include <string>
#include <MathFunctions.h>
int main(int argc, char* argv[])
{
  if (argc < 2) {
    return -1;
  }
  std::string op(argv[1]);
  if (op == "add") {
    return mathfunctions::OpAdd(1.0, 1.0) != 2.0;
  } else if (op == "mul") {
    return mathfunctions::OpMul(5.0, 5.0) != 25.0;
  } else if (op == "sqrt") {
    return mathfunctions::sqrt(25.0) != 5.0;
  } else if (op == "sub") {
    return mathfunctions::OpSub(5.0, 1.0) != 4.0;
  }
  return -1;
}
```

在根cmakelists里启动测试
这些都是公式化的,换个项目也是这么写
```shell
根CMakeList.txt

option(BUILD_TESTING "Enable testing and build tests" ON)
if(BUILD_TESTING)
  enable_testing()
  add_subdirectory(tests)
endif()
```

enable_testing 命令启用测试 包含了include(Ctest) (有的老教程让你include(Ctest))
添加测试文件夹tests

在tests/CMakeLists.txt里 设置用于可执行目标 调用可执行目标 ctest根据返回判断是否成功
下面这些内容也是公式化的
```shell
add_executable(TestMathFunctions)

target_sources(TestMathFunctions
  PRIVATE
    TestMathFunctions.cxx
)
target_link_libraries(TestMathFunctions
  PRIVATE
    MathFunctions
)

add_test(
NAME add
COMMAND TestMathFunctions add
)
```

执行测试

首先配置
cmake -B build --preset="xxx"
编译
cmake --build build

启动所有测试
ctest --test-dir build

--test-dir指定测试所在文件夹 不写这个参数/不指定默认在当前文件夹

直接ctest 就是在本地文件夹执行所有测试

启动指定测试
ctest --test-dir build -R add
-R 参数用正则表达式查找对应测试名字执行测试
就是add_test命令里NAME 参数


其他[参数](https://cmake.org/cmake/help/latest/manual/ctest.1.html#run-tests)指定
翻译一些

>If using a multi-config generator, eg Visual Studio, it will be necessary to specify a configuration with ctest -C \<config\> \<remaining flags\>, where \<config\> is a value like Debug or Release. This is true whenever using a multi-config generator, and won't be called out specifically in future commands.

多配置生成器需要用
-C \<cfg\>, --build-config \<cfg\> 参数指定使用哪个配置
意思就是这些生成器生成的Debug和Release 等配置和生成文件不分开放 他们生成的构建文件既能给Debug用又能给Release用

-V, --verbose 详细输出

-VV, --extra-verbose 更详细的输出

-E \<regex\>  符合正常表达式的不测试,其他测试

-j [\<level\>], --parallel [\<level\>] 指定并行测试

-Q, --quiet 退出

-O \<file\>, --output-log \<file\> 指定输出日志文件名

-N, --show-only[=\<format\>]  只输出测试名不执行

--output-on-failure  输出 测试失败项返回的所有错误结果

--stop-on-failure  测试失败时停止测试

--timeout \<seconds\> 一般都在目标属性里设置

## 使用Google Test

1.cmake配置
任何cmake教程都有这部分
公式cmake代码
```shell
#找cmake包
find_package(GTest REQUIRED)

add_executable(test_math test_math.cpp)
target_link_libraries(test_math PRIVATE GTest::GTest GTest::Main)

# 手动注册test
add_test(NAME Math.Add COMMAND test_math --gtest_filter=Math.Add)
add_test(NAME Math.Sub  COMMAND test_math --gtest_filter=Math.Sub)
# 自动发现并注册所有 GTest 用例
gtest_discover_tests(test_math
    WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}
    PROPERTIES VS_DEBUGGER_WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
)

//设置测试属性
set_tests_properties(test_math PROPERTIES
    TIMEOUT 30
    LABELS "unit"
)
```
--gtest_filter 是Gtest框架的测试参数 使用这个参数指定程序中的测试用例

2.Gtest宏
看ai ,ai总结的比我好













