---
title: 完全使用vscode工作
createTime: 2026/08/05 14:10:50
permalink: /article/i5bdazq2/
---
# 背景

visual stdio 有点重。

而 QtCreator 不仅重，UI 也一般，对 AI 的集成也不好，git 管理也烂，git diff 显然没有 vscode 搭配插件好用。

对于简单的 qt 项目我想换成 Vscode 配合插件。

以下以 Qtc / qtc 指代 QtCreator 这个 IDE。
# 功能分类

## 编译 c++ 部分

### Qtc 部分功能

QtCreator 典型的使用构建配置设定的参数，本质上构建是在命令行中以 `-D` 为参数使用 `cmake` 命令。

以下流程 cmake 都有显然的命令：

1. configure：`cmake -S <src> -B <build_path> -G <generator>`
2. build：`cmake --build <config_path> --target`
3. clean：`cmake --build`

主要看一下 QtCreator 在构建设置中 `init Configuration` 的参数。

ai看到这给我改成表

| 参数 | 说明 |
|------|------|
| `CMAKE_BUILD_TYPE` | 构建类型 Debug/Release |
| `CMAKE_CXX_COMPILER` / `CMAKE_C_COMPILER` | C/C++ 编译器路径 |
| `CMAKE_GENERATOR` | 指定生成器 |
| `CMAKE_MAKE_PROGRAM` | 实际构建工具的路径，一般来说 Ninja / Visual Studio 18 2026（这不仅是生成器的名字也是构建工具的名字）都会在环境变量中直接找到不需要该指定，不过你有多版本（Qt Maintenance tools 允许下载 Ninja 与你自带 Ninja 共存）对于精细控制就需要 |
| `CMAKE_PREFIX_PATH` | 指定 cmake 的查找路径，这个参数在 cmake 里可以以 `;` 号隔开指定多路径，对 qt 项目就用来指定 qt 安装路径以此让 find_package 找到 qt 的各自包的 |
| `CMAKE_PROJECT_INCLUDE_BEFORE:FILEPATH=%{BuildConfig:BuildDirectory:NativeFilePath}/.qtcreator/cmake-helper/qtcreator-project.cmake` | 指定一个 hook 脚本在配置（configure）前执行，一般都是做一些和项目无关和跨平台的处理 |

直接去看脚本比较典型的：

1. 给 IDE 提供分组信息让 ide 可以按类型分类

```bash
option(QT_CREATOR_SOURCE_GROUPS "Qt Creator source groups extensions" ON)
if (QT_CREATOR_SOURCE_GROUPS)
  source_group("Resources" REGULAR_EXPRESSION "\\.(pdf|plist|png|jpeg|jpg|storyboard|xcassets|qrc|svg|gif|ico|webp)$")
  source_group("Forms" REGULAR_EXPRESSION "\\.(ui)$")
  source_group("State charts" REGULAR_EXPRESSION "\\.(scxml)$")
  source_group("Source Files" REGULAR_EXPRESSION
    "\\.(C|F|M|c|c\\+\\+|cc|cpp|mpp|cxx|ixx|cppm|ccm|cxxm|c\\+\\+m|cu|f|f90|for|fpp|ftn|m|mm|rc|def|r|odl|idl|hpj|bat|qml|js)$"
  )
endif()
```

2. 配置包管理器

```bash
#
# Package manager auto-setup
#
if (QT_CREATOR_ENABLE_PACKAGE_MANAGER_SETUP)
  include(${CMAKE_CURRENT_LIST_DIR}/package-manager.cmake)
endif()
```

3. 根据 kit 的配置决定是否启用 qml debug（这个功能是由 QT_QML_DEBUG 宏开启的）

```bash
#
# QML Debugging
#
if (QT_ENABLE_QML_DEBUG)
  add_compile_definitions($<$<OR:$<CONFIG:Debug>,$<CONFIG:RelWithDebInfo>>:QT_QML_DEBUG>)
endif()
```

当然这个脚本还做了其他工作就不一一叙述了，只说三个我认为有意义的：

| 变量 | 说明 |
|------|------|
| `QT_CREATOR_ENABLE_MAINTENANCE_TOOL_PROVIDER` | 当 find_package 找不到某个 Qt 组件时，Qt Creator 会启用这个功能，并在 IDE 的"问题"面板提供一个链接。点击这个链接，就可以直接调用 Qt Maintenance Tool 来安装缺失的组件，省去手动打开工具查找的麻烦 |
| `QT_CREATOR_ENABLE_PACKAGE_MANAGER_SETUP` | 开启后，Qt Creator 会在配置项目时，尝试自动设置所需的包管理器环境，简化依赖项的管理流程 |
| `QT_ENABLE_QML_DEBUG` | 开启 QML debug 模式 |

`QT_QMAKE_EXECUTABLE` 提供可执行的 qmake，这里 qmake 不是用来做构建工具而是提供当前版本的 qt 信息。

`CMAKE_COLOR_DIAGNOSTICS` 启用颜色警告没啥好说的。

还有一些 `current configuration` 的内容，都是一些 qt 参数。

比较典型的是 `QT6_DIR` 和一些其他 lib 的路径。

`QT_CREATOR_SKIP_VCPKG_SETUP` qtc 检测 vcpkg 环境完成和 vcpkg 集成。

### Vscode 复现环境

对于这部分功能我们完全使用 Vscode 的微软官方插件 `Cmake tools (ms-vscode.cmake-tools)` 来复现。

对环境依赖部分例如 `Qt6_Dir` / `CMAKE_PREFIX_PATH` / `CMAKE_CXX_COMPILER` 等依赖本机环境的配置我们放在 `CmakePreset.json` 中。

参考以下预设：

```json
{
    "version": 6,
    "cmakeMinimumRequired": {
        "major": 3,
        "minor": 31,
        "patch": 0
    },
    "configurePresets": [
        {
            "name": "windows-base",
            "hidden": true,
            "generator": "Ninja",
            "binaryDir": "${sourceDir}/out/build/${presetName}",
            "architecture": "x64",
            "cacheVariables": {
                "CMAKE_INSTALL_PREFIX": "${sourceDir}/out/install/${presetName}",
                "CMAKE_CXX_COMPILER": "cl.exe",
                "CMAKE_PREFIX_PATH": "../qt/6.8.3/msvc2022_64",
                "CMAKE_EXPORT_COMPILE_COMMANDS": "1",
                "OpenCV_DIR": "../OpenCV4/opencv/build/x64/vc16/lib"
            },
            "environment": {
                "PATH": "../OpenCV4/opencv/build/x64/vc16/bin;$penv{PATH}"
            }
        }
        {
            "name": "msvc-debug",
            "displayName": "MSVC x64 Debug (Ninja)",
            "inherits": "windows-base",
            "cacheVariables": {
                "CMAKE_BUILD_TYPE": "Debug"
            }
        },
        {
            "name": "msvc2026",
            "displayName": "Visual Studio Community 2026 Preview - amd64",
            "inherits": "windows-base",
            "generator": "Visual Studio 18 2026",
            "toolset": "host=x64",
        }
    ],
    "buildPresets": [
        {
            "name": "msvc-debug",
            "configurePreset": "msvc-debug",
            "configuration": "Debug"
        },
        {
            "name": "msvc2026",
            "displayName": "VS 2026 amd64 Debug",
            "configurePreset": "msvc2026",
            "configuration": "Debug"
        }
    ]
}
```

::: warning 代码异议
原 JSON 中第一个配置对象（`windows-base`）末尾 `"environment"` 块之后缺少逗号（`}` 后直接跟 `{`），会导致 JSON 解析失败；同时 `msvc2026` 对象末尾 `"toolset": "host=x64",` 有多余逗号。此处未修改代码，仅提示。
:::

预设本质就是将之前 Qtc 中以 `-D` 参数传递的变量写入预设而已。

:::tip
我们的目的是使用 vscode 分别在 window / linux 下做本机编译和交叉编译。

在 window 上我们使用 `msvc(cl)` 做编译器、`msbuild` 构建工具时，msbuild 作为构建工具可以自动找到 sysroot 与链接器，所以直接点击 vscode 图标跳转到目的项目还是普通 pwsh 打开目的项目都可以直接编译构建。

但是使用 `msvc` 做编译器、`Ninja` 作为构建工具则没法主动找 sysroot，普通 pwsh 打开的 vscode 无法编译项目，有以下选择：

1. 使用 Visual Studio 自带的 `Developer PowerShell for Vs 18` 命令行启动 vscode，里面包含了 vc 工具链的环境变量，这样 vscode 就可以继承其中的环境
2. 使用 `../VS2026/Common7/Tools/` 路径下的 `Launch-VsDevShell.ps1` 的脚本来配置 vs 的开发环境，并且在 `cmake tools` 插件的相关设置项 `cmake.buildTask` 勾选使用 task.json 执行任务，不然 cmake tools 内置的命令行工具没法看到。这样可以编辑运行 cli 的参数让这两个环境能写入终端
3. 在 cmakepreset 里手写 sysroot 等路径，这个不建议
4. 使用 cmake tools 的设置项 `"cmake.useVsDeveloperEnvironment": "auto"`，在 Windows 上使用 CMake 预设时，使用 Visual Studio 环境作为父环境
5. `terminal.integrated.profiles.windows` 这个设置中 `args` 项写入 `vcvars64.bat`

**推荐选项 4。**

在 linux 开发环境上选项 4 无效果，不影响使用。
:::

:::tip
`vcvarsall.bat / vcvars64.bat / ...` 与 `VsDevCmd.bat` 都有差不多配置开发环境功能，只不过一个专供 c++，一个给所有 Vs 相关例如 .net 配置环境。
:::

## 项目配置部分

### CMakelists

Qtc 生成的有以下专门的几行命令：

```bash
#1
set(QT_QML_GENERATE_QMLLS_INI ON)
#2
find_package(Qt6 REQUIRED COMPONENTS Quick QuickControls2 SerialPort)
#3
qt_standard_project_setup(REQUIRES 6.8)
```

1. `QT_QML_GENERATE_QMLLS_INI` 参数启用后会生成 `qmlls.ini` 文件，这个玩意是给 qmlls 也就是 qml 的语言服务器看的，给 qml 生成感知和提示
2. 查找 qt6 组件和相应的 cmake 脚本
3. 参考一下这个 [qt_standard_project_setup](https://doc.qt.io/qt-6/qt-standard-project-setup.html#description)，这个命令依赖上一个命令引入的 qt-cmake 包

ai遇到以下内容改成表

| 手动配置的命令 | qt_standard_project_setup(REQUIRES 6.8) 是否包含？ | 说明 |
|------|------|------|
| `set(CMAKE_AUTOMOC ON)` | ✅ 包含 | 会为后续创建的目标默认开启 Qt 的元对象编译器（MOC） |
| `set(CMAKE_AUTORCC ON)` | ❌ 不包含 | 这个命令不负责开启资源编译器（RCC）。如果需要，仍需手动设置 |
| `set(CMAKE_AUTOUIC ON)` | ✅ 包含 | 会为后续创建的目标默认开启 Qt 的用户界面编译器（UIC） |
| `qt_policy(SET QTP0001 NEW)` / `qt_policy(SET QTP0004 NEW)` | ✅ 包含 | 当指定 REQUIRES 6.8 时，它会自动将 QTP0001 到 QTP0005 的所有策略都设置为 NEW |

:::tip
vscode 中依赖 Qt core `theqtcompany.qt-core` 插件。
:::

## QML 部分

qml 语法高亮、跳转依赖 Qt qml 插件（theqtcompany.qt-qml）。

### qtc 的智能感知功能整理

1. **自定义 qml 组件定义跳转**

依赖 qt_add_qml_module。

[说明1](https://doc.qt.io/qt-6/qt-add-qml-module.html#declaring-module-dependencies)

> Adding the module to DEPENDENCIES is not necessary if the module is already imported via the IMPORTS option. The recommended way is to use the lighter alternative DEPENDENCIES over IMPORTS.

[说明2](https://doc.qt.io/qt-6/qt6-modernize-qml-modules.html#replace-output-directory-and-import-path-with-dependencies-target)

importPaths 键存在且官方定义，但它定位是"手工声明额外导入路径"；Qt 文档对"工具链如何找到模块"给的官方答案是 DEPENDENCIES TARGET——它会自动把依赖模块的输出目录写入生成的 .qmlls.ini 的 importPaths（源码链路：Qt6QmlMacros.cmake:DEPENDENCIES 解析 → 写入 QT_QML_IMPORT_PATH target property → 生成 ini 时读取）。

:::tip
跳转到构建副本内，同时自定义组件要按照官方推荐添加模块。
:::

2. **C++ 类型导入 qml**

Qt 6.8 的 qmlls 并不支持 QML → C++ 定义跳转，参考[链接](https://doc.qt.io/qt-6.8/qtqml-tooling-qmlls.html#known-limitations)（[6.11 可以](https://www.qt.io/blog/whats-new-in-qml-language-server-in-6.11?ref=dailydev)）。

3. **官方控件跳转**

例如 Button，因为他在 QtQuick.Controls 下有具体的 Button.qml 文件，只要正确的 import 就可以跳转。

类似 Rectangle 这种类型，在本地的 QtQuick 路径中 `...\qt\6.8.3\msvc2022_64\qml\QtQuick\plugins.qmltypes` 能发现：

```shell
Component {
        file: "private/qquickrectangle_p.h"
        name: "QQuickRectangle"
        accessSemantics: "reference"
        defaultProperty: "data"
        parentProperty: "parent"
        prototype: "QQuickItem"
        exports: [
            "QtQuick/Rectangle 2.0",
            "QtQuick/Rectangle 2.1",
            "QtQuick/Rectangle 2.4",
            "QtQuick/Rectangle 2.7",
            "QtQuick/Rectangle 2.11",
            "QtQuick/Rectangle 6.0",
            "QtQuick/Rectangle 6.3",
            "QtQuick/Rectangle 6.7"
        ]
```

说明类似 Rectangle 的组件其实是通过 c++ 类型导出的，没有 .qml 也就无法跳转。

4. **QML 语法补全 / 属性提示 / QML 错误检查**

只要 import 路径正确，补全和属性提示都可以靠 qmldir 中的 typeinfo 找到 .qmltypes 从而实现补全和检查。

5. **import QtQuick 跳转**

qtc 没有该功能，但是有导入路径信息。

6. **qml module 识别**

7. **qml preview 预览**

只要可以编译即可预览，Ctrl+Shift+P → 输入 `QML: Start QML Preview for Current File`。

:::tip
ai 在我项目里测出来 qt 6.8.3 的去 qmlls 有 bug，以下是实测输出：

- 现象：textDocument/definition 对自定义 QML 类型（如 Main.qml 里的 MyButton）返回空结果，除非目标文件（MyButton.qml）已经在编辑器里打开。id、属性、信号跳转都正常，唯独类型跳转不行。
- 源码根因（qqmllsutils.cpp）：
  - `findDefinitionOf()` 的 QmlComponentIdentifier 分支直接调用 `Location::tryFrom(semanticScope->filePath(), ...)`
  - `Location::tryFrom` 要求目标文件已经在 DOM 中：`someItem.goToFile(fileName)` 找不到就返回空（"Could not find file in the dom!"）
  - 而文件只有通过 LSP 的 didOpen 通知才会被加载进 code model——未被打开的类型文件虽然在磁盘上，但不在 DOM 里 → 跳转返回空
- 实测复现（LSP 直测）：
  - 只打开 Main.qml：MyButton@17:15 定义请求 → []
  - 同时打开 MyButton.qml：同一请求 → 成功返回 MyButton.qml
- 修复状态：dev 分支（扩展下载的 0.7）已修复——findDefinitionOfType 在 tryFrom 失败后落到 createCppTypeLocation 的磁盘路径兜底（纯 QFileInfo 检查，不再依赖 DOM），所以 0.7 下未打开的文件也能跳转。

换句话说使用的 qmlls 要在 qt 6.8.3 之后附带的或者插件自带的。
:::

:::tip
vscode 的 qml 插件一直在 `Qmlls running background build: Building ""`，这是因为 `qt-qml.qmlls.useNoCMakeCalls` 参数未设置，qml 插件就会自动在后台 build 目标来获取项目信息。

参考这个[链接](https://www.qt.io/blog/whats-new-in-qml-language-server-in-6.11?ref=dailydev)中的 `CMake Calls` 这一章，这是用来解决定义在 c++ 中的 qml 组件修改属性后因为语言服务器没有读取到最新 build 而假警告的问题。
:::

## c++ 部分

c++ 部分的智能感知功能都是由插件 clangd 提供。

包括 QT 的宏补全和高亮。



---

:::warning
> 以下内容由 AI(deepseek-v4-flash)在 2026-08-12 的实测调试中输出,结论均经过 LSP 协议直测/日志/源码验证。
:::

## 附录:qmlls 实战调试总结(为什么用 nightly / 踩过的配置坑)

### 1. 为什么使用 nightly(standalone)qmlls

VSCode 的 Qt 扩展(`theqtcompany.qt-qml` 1.14.0)默认自动下载 standalone qmlls(独立发布,基于更新的 Qt 开发分支,tag 0.7 / commit 0bb2db5908 / 2026-07-20 构建),而不是 Qt 6.8.3 安装目录自带的 qmlls:

| 对比项                    | Qt 6.8.3 自带 qmlls     | standalone(nightly)    |
| ------------------------- | ----------------------- | ---------------------- |
| 跳转 QML 类型             | 有已知 bug(见上文 tips) | ✅ 正常                 |
| 语义 token                | 基本可用                | ✅ 正常                 |
| workspaceFolders 多工作区 | 支持有限                | ✅ 完整支持             |
| 新功能/修复               | 冻结在 6.8.3            | 持续更新(扩展自动跟进) |

**结论:继续用扩展自动下载的 standalone 版即可**,它就是为 VSCode 集成而维护的。扩展也支持通过 `qt-qml.qmlls.customExePath` 指定自定义服务器路径。

### 2. 调试中遇到的配置问题(按解决顺序)

| #   | 现象                                            | 根因                                                                                                                                                                                                                                                                  | 解决                                                                                 |
| --- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | 补全时好时坏、类型信息过期                      | 多个构建目录并存(out/build/msvc-debug 与 Qt Creator 的 build/Qt_6_8_3_MSVC2022_64bit-Debug),`.qmlls.ini` 被 Qt Creator 配置时改写指向未构建目录                                                                                                                       | 统一构建目录;不要让 Qt Creator 配置同一项目                                          |
| 2   | 输入 `fon` 不弹补全,`font.` 才弹                | VSCode 设置 `editor.quickSuggestions.other: "offWhenInlineCompletions"` 抑制打字弹窗(内联补全优先)                                                                                                                                                                    | 改为 `"on"` 或 Ctrl+Space 手动触发                                                   |
| 3   | 组件属性渲染全是白色                            | 主题(One Monokai)没有 `semanticTokenColors` 规则,语义 token 落到默认回退作用域                                                                                                                                                                                        | settings.json 加 `editor.semanticTokenColorCustomizations.rules` 配色                |
| 4   | qmlls 崩溃 0xC0000005(访问冲突)                 | 打字快触发 `$/cancelRequest` 请求取消 + 文档更新并发竞态(standalone 0.6 和 6.8.3 都有)                                                                                                                                                                                | 崩溃后 Reload Window;报 Qt 等修复                                                    |
| 5   | **C++ 跳转"无定义" + 头文件不自动构建**(最隐蔽) | 扩展 1.14.0 bug:创建客户端时传了 `workspaceFolder` 选项 → vscode-languageclient 跳过 WorkspaceFoldersFeature 注册 → 不声明 `capabilities.workspace.workspaceFolders` → nightly qmlls 的 `openInitialWorkspace` 硬门禁不通过 → 工作区从未注册 → headerDirectories 为空 | **修补扩展 `out/extension.js`**(删除 `workspaceFolder:this._folder` 一处),已实测修复 |

### 3. 两个关键机制(实测验证)

**A. qmlls 的 workspace 注册门禁**(qworkspace.cpp):
```cpp
void WorkspaceHandlers::clientInitialized(QLanguageServer *server) {
    // 只在客户端声明了该能力时才注册工作区!
    if (clientInfo.capabilities.workspace
        && clientInfo.capabilities.workspace->workspaceFolders.value_or(false)) {
        openInitialWorkspace(clientInfo);
    }
}
```
工作区不注册的连锁后果:`buildPathsForFileUrl` 的 C++ 头文件搜索(headerDirectories)为空 → C++ 跳转全空;`addFileWatches` 为 no-op → 头文件变化不触发自动构建。

**B. 自动构建链路**(已验证可用):watcher 监视 C++ 文件 → `cmake --build <build_dir> -t all_qmltyperegistrations`(只重生成 qmltypes,不编译) → `reloadAllOpenFiles()` → qmllint 同步更新。改 C++ 头文件后保存,5-10 秒内自动生效。

### 4. 现状与注意事项

- ✅ Go to C++ Definition 正常(类型名/MyObject 跳 .h)
- ✅ 头文件修改后 CMake 自动构建正常(qmltypes 更新 → qmllint 不报假警告)
- ⚠️ **扩展更新后补丁会失效**——再出现"无定义"需重打补丁(备份在 `extension.js.bak`)
- ⚠️ nightly 遗留 bug(建议报 QTBUG):
  1. C++ 属性/方法跳转返回无效位置 (-1,-1)(类型名跳转正常)
  2. 请求取消 + 文档更新竞态崩溃 (0xC0000005)
- 🔧 启动时服务器会在 initialize 响应前用客户端 id 发 `workspace/semanticTokens/refresh`(协议违规,客户端回 -32601),实测不影响任何功能




