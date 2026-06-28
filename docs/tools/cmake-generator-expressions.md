---
title: cmake-generator-expressions
createTime: 2026/06/21 23:31:33
permalink: /article/bnn0cz2x/
---

## 生成器表达式

先看两个典型用法，非常常见：

```cmake
target_include_directories(
    MyTarget
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)
```

头文件在构建时在 `${CMAKE_CURRENT_SOURCE_DIR}/include`，安装时在 `include`。

根据构建时的配置在 Debug 和 Release 模式下定义宏，例如日志 Debug 模式更详细，或者 Debug 和 Release 代码走不同分支：

```cmake
target_compile_definitions(MyApp PRIVATE "MYAPP_BUILD_CONFIG=$<CONFIG>")
```

::: info
形如 `$<KEYWORD:value>` 的表达式，`KEYWORD` 会在构建和安装时被求值，如果求值结果为 1 则 value 值被保留。
:::
