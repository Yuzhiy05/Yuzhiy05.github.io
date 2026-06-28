---
title: 使用cmake进行安装
createTime: 2026/06/21 23:31:33
permalink: /article/rxrz0z56/
---

## 目标对象可安装的类型

| 类型 | 说明 |
|------|------|
| `ARCHIVE` | 静态库 (.a / .lib), DLL 导出库 (.lib) |
| `LIBRARY` | 动态库 (.so), 模块, 其他动态装载类型. 不包含 Window's DLL (.dll) 和 MacOS frameworks. |
| `RUNTIME` | 除 MacOS bundles 之外所有可执行文件；包括 Window's DLLs (.dll). |
| `OBJECT` | 对象库. |
| `FILE_SET <set-name>` | 头文件库 |

以下都是 MacOS 系统用的不用管：

| 类型 | 说明 |
|------|------|
| `FRAMEWORK` | 属于 MacOS frameworks 的静态动态库 |
| `BUNDLE` | MacOS bundle 可执行文件 |
| `PUBLIC_HEADER` / `PRIVATE_HEADER` / `RESOURCE` | MacOS frameworks 用的 |

::: tip
一般运行时安装到 `bin`，库安装在 `lib`，头文件安装到 `include`，老生常谈了。
:::

现代 cmake 是以 target 目标构建的，安装只需要一行命令：`install()`。

安装分以下三个流程：

### 1. 安装二进制文件/库文件

```cmake
install(
    TARGETS hello
    EXPORT HelloTargets)

install(
    TARGETS sharedlib
    EXPORT HelloTargets
    FILE_SET HEADERS)
```

这里安装 sharedlib 中不仅安装了 sharedlib 库本身还通过 `FILE_SET HEADERS` 安装了他暴露的头文件。这和：

```cmake
target_source(sharedlib PUBLIC FILE_SET HEADERS
FILES
      include/sharedlib/api.h)
```

是对偶的，也就是说 `target_source` 里写 `FILE_SET HEADERS`，这里 `install` 命令标识的 `FILE_SET HEADERS` 才生效。

其中 `EXPORT` 选项将导出目标 `HelloTargets` 与安装文件 hello sharedlib 相关联，这样所有被关联的安装的二进制或库对象都在同一个导出目标里。

### 2. 导出目标本身

```cmake
install(
  EXPORT HelloTargets
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/Hello
  NAMESPACE Hello::
)
```

这个命令导出导出目标本身。这个导出目标包含了以库 `HelloTargets` 为单位的所有信息，包括生成了那些目标 target、include 路径、link 依赖、编译选项、namespace（`Tutorial::XXX`）。他生成到 `<Exportname>Targets.cmake` 文件里。

| 参数 | 说明 |
|------|------|
| `DESTINATION` | 使用相对路径，通过和 `CMAKE_INSTALL_PREFIX` 拼接确定安装位置 |
| `NAMESPACE` | 就是相当于库名，比如我用 Abseil 库的 String 模块里的东西我需要 `Abseil::String` 或者 Boost 库的 asio 模块 |

### 3. 导出配置文件

```cmake
install(
  FILES
    cmake/HelloConfig.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/Hello
)
```

cmake 的 `find_package` 通过找 `<libname>Config.cmake` 这个配置文件找到包的相关信息，`<libname>Config.cmake` 文件相当于这些包的入口，一般要"自己写"，也可以用 `configure_package_config_file` 命令来生成包配置文件。

### 4. 导出版本文件

```cmake
write_basic_package_version_file(
  ${CMAKE_CURRENT_BINARY_DIR}/TutorialConfigVersion.cmake
  COMPATIBILITY ExactVersion
)

install(
  FILES
    cmake/TutorialConfig.cmake
  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/Tutorial
)
```

和 `project` 里 `VERSION` 参数相关的版本文件，让 `find_package` 找到符合版本的包：

```cmake
project(hello
    VERSION 1.0.0
)
```
