

# 生成器表达式

先看两个个典型用法非常常见

```shell
target_include_directories(
    MyTarget
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
```
头文件在构建时在${CMAKE_CURRENT_SOURCE_DIR}/include 安装时在include

根据构建时的配置在Debug和Release 模式下定义宏
例如日志Debug模式更详细
或者Debug和Release代码走不同分支
```shell
target_compile_definitions(MyApp PRIVATE "MYAPP_BUILD_CONFIG=$<CONFIG>")
```

形如 $\<KEYWORD:value\>的表达式  `KEYWORD` 会在构建和安装时被求值 如果求值结果为1 则value值被保留

