---
title: vscode_clang
createTime: 2024/12/02 19:37:42
permalink: /article/j3e883z1/
---

## vscode搭配clang

1. 首先是下载，解压（注意使用管理员权限解压）
   [下载链接](https://github.com/trcrsired/llvm-releases)
2. 将 `/.../llvm/bin` 和 `/.../x86_64-windows-gnu/bin` 路径添加到用户 `path`
3. 安装 clangd 插件
4. 创建一个项目文件夹此处为 helloproject，进入文件夹，右键打打开 powershell
5. 测试 clang

```bash
clang --version
```

测试 cmake：

```bash
cmake --version
```

测试 ninja：

```bash
ninja --version
```

编写一个最简单 hello.cpp 文件保存。

首先编写 CmakeLists.txt 和 CmakePresets.json：

```cmake
cmake_minimum_required(VERSION 3.5.0)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED true)
set(CMAKE_CXX_EXTENSIONS OFF)

project(hello)

add_executable(hello hello.cpp)
```

```json
{"version": 8,
    "configurePresets": [
        {
            "name": "clang",
            "hidden": false,
            "generator": "Ninja",
            "binaryDir": "${sourceDir}/build/${presetName}",
            "cacheVariables": {
                "CMAKE_BUILD_TYPE": "Debug",
                "CMAKE_C_COMPILER": "D:\\workfile\\compiler\\clang\\llvm\\bin\\clang.exe",
                "CMAKE_CXX_COMPILER": "D:\\workfile\\compiler\\clang\\llvm\\bin\\clang++.exe",
                "CMAKE_CXX_FLAGS": "--target=x86_64-windows-gnu --sysroot=D:\\workfile\\compiler\\clang\\x86_64-windows-gnu -fuse-ld=lld  -rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -Wno-unused-command-line-argument  -fcolor-diagnostics -stdlib=libc++",
                "CMAKE_C_FLAGS": "--target=x86_64-windows-gnu --sysroot=D:\\workfile\\compiler\\clang\\x86_64-windows-gnu -fuse-ld=lld -rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -Wno-unused-command-line-argument -fcolor-diagnostics "
            }
        }
    ]
}
```

在当前项目文件夹下打开 powershell，或使用 vscode 的终端，依次输入以下命令：

```powershell
cmake -Bbuild --preset clang .

ninja -C build hello

./hello
```

这就是完整的使用 cmake 和 ninja 的构建，并执行的过程。

准备工作做好后，首先开始配置 vscode 相关配置：

### task.json

task.json 相当于任务配置文件，而一个 task 任务相当于执行一个个命令行命令。把一个个命令行命令抽象成任务。也就是说用 task.json 中的任务代替你执行上述的命令。

相比每次开始新项目时重新写 task.json，vscode 支持配置默认任务。这是写在 `C:\Users\<用户名>\AppData\Roaming\Code\User\profiles` 文件中的全局任务设置。

当然这里我们先选择配置任务而不是默认生成的任务，注意这个默认生成的任务是全局的。点击配置任务后，命令面板也就是出现的下拉框。如果之前没有配置本地任务，则会出现 `使用模板创建 task.json 文件`，点击后，选择 `Other` 后会在本地项目的文件夹下创建一个 .vscode 文件夹其中包含一个 task.json 文件。其中包含了 vscode 模板创建的任务一般为 `echo Hello`。

:::file-tree
- helloproject   
  - .vscode   
    - task.json    
  - build    
    - Cmakefile    
      - ...   
    - .ninja_deps  
    - .ninja_log
    - build.ninja
    - cmake_install.cmake
    - CmakeCache.txt
    - hello.exe
  - CmakeLists.txt
  - CmakePresets.json
  - hello.cpp
:::

首先提供以下三个最基础的代替上述命令的任务：

```json
"version": "2.0.0",
    "tasks": [
        {
            "type": "shell",
            "label": "cmake-build",
            "command": "cmake",
            "args": [
                "-Bbuild",
                "--preset",
                "clang",
                "."
            ],
            "options": {
                "cwd": "${workspaceFolder}/"
            },
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "cmake构建",
            "problemMatcher": []
        },
        {
            "type": "shell",
            "label": "ninja-make",
            "command": "ninja ",
            "args": [
                "-v"
            ],
            "options": {
                "cwd": "${workspaceFolder}/build"
            },
            "problemMatcher": [],
            "group": {
                "kind": "build",
                "isDefault": false
            },
            "detail": "ninja编译"
        },
        {
            "label": "执行",
            "type": "shell",
            "command": "./hello",
            "options": {
                "cwd": "${workspaceFolder}/build"
            },
            "problemMatcher": [],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "执行exe",
            "dependsOrder": "sequence",
            "dependsOn": [
                "cmake-build",
                "ninja-make"
            ]
        }
    ]
```

保存 task.json 文件后点击 vscode 的任务栏的 `终端` 选项，点击运行任务。在出现的下拉框中点击 `执行`。vscode 的终端列表会按顺序执行之前的三个任务。不过这还不够，我们需要对 vscode 的任务与生成的 cmake 做更多的定制，以便于像使用 ide 一样顺畅。当然我们也可以选择使用一些插件，这些后续再述。

### 了解task.json

[参考链接](https://code.visualstudio.com/Docs/editor/tasks)

简单介绍一些每个任务的属性：

| 属性 | 说明 |
|------|------|
| `label` | 任务的名字或者任务的标签，这是自定义的 |
| `type` | 任务类型。没装插件那就只有 `shell` 或 `process`。shell 为要在终端中执行的任务，而 process 为需要执行的进程 |
| `command` | 具体的命令。command 中的命令会原样传输给 shell，但有时一些命令需要转义才能完成此时命令需要包含正确的引号或转义字符 |
| `args` | 命令的参数通常不需要特别设置，但是不同 shell 的转义字符不同需要进行不同设置 |
| `options` | 覆盖一些默认值，例如 `"cwd": "${workspaceFolder}/build"` 此项使得你的命令在当前工作目录下的 build 文件夹下执行。这对一些指令比较有用。例如 ninja 命令的必须在含有构建文件的夹下执行。存在 `cwd`（当前工作目录）、`env`（环境变量）、`shell` |
| `problemMatcher` | 错误匹配，运行结果报错通常含有一大段内容。此项可以帮助你快速定位问题，通常需要手动写正则表达式 |
| `group` | 任务的分组通常是自定义，但是这与后续的 debug 配置有关 |
| `detail` | 显示在任务名字下方的任务的详细描述 |
| `dependsOrder` | 组合任务的依赖顺序，如上例一样如果此属性指定了 `sequence`。那么会顺序执行 dependsOn 中声明的任务 |
| `dependsOn` | 组合任务，将已存在任务加入依赖中。通常未设置 dependsOrder 属性任务会并行执行 |
| `presentation` | 控制终端的行为 |

```powershell
$env:path.split(";")
```

```bash
clang++ -o main.exe main.cpp --target=x86_64-windows-msvc --sysroot=D:\\workfile\\compiler\\windows-msvc-sysroot -fuse-ld=lld -D_DLL=1 -lmsvcrt  -flto=thin
```

| 参数 | 说明 |
|------|------|
| `-L<dir>`, `--library-directory <arg>` | Add directory to library search path |
| `-flto-jobs=<arg>` | Controls the backend parallelism of -flto=thin (default of 0 means the number of threads will be derived from the number of CPUs detected) |
| `-flto=<arg>` | Set LTO mode. `<arg>` must be 'thin' or 'full'. |
| `-fuse-ld=lld` | 指定链接器为 lld |
| `-rtlib=compiler-rt` | 指定[低级运行时库](https://compiler-rt.llvm.org/) |
| `-unwindlib=libunwind` | 这玩意不支持 windows 系统时是给 elf 格式文件用的，参考[这个](https://github.com/libunwind/libunwind)。指定栈回退的库确定 ELF 程序执行线程的当前调用链，并在该调用链的任意点恢复执行。主要是处理异常和调用栈（debug）的 |
| `-lunwind` | 链接 unwind 库 |
| `-lc++abi` | 链接 cxxabi 库。libc++abi is a new implementation of low level support for a standard C++ library. 简单说就是 libc++ 的底层实现比如异常的一些[玩意](https://libcxxabi.llvm.org/) |
| `-lntdll` | ntdll 是 windows 的内核 dll NT Layer DLL，包含一些系统调用、异常处理等功能 |
| `-stdlib=<arg>` | C++ standard library to use. `<arg>` must be 'libc++', 'libstdc++' or 'platform'. |

::: info
[-Wno-unused-command-line-argument](https://maskray.me/blog/2023-08-25-clang-wunused-command-line-argument) 关闭未使用参数的警告。
:::

```bash
cmake --build . #在build文件夹下编译项目

cmake --build ./build -t(--target) <目标>

ninja -C build #两步操作：1.进入build文件夹 2.编译项目

ninja -C build <目标> #同上
```

::: tip
`--trace`：CMake 3.7 添加了 `--trace-source="filename"` 选项，这让你可以打印出你想看的特定文件运行时执行的每一行。
:::

在 build 文件夹下：

```bash
ninja -t clean #清除构建文件  

ninja <目标> #编译对应项目 有时你的引入的库依赖太多文件 此时只构建你的目标文件

ninja -v #详细模式构建所有目标
```

### clang 查看模板实例化

```bash
clang++ -Xclang -ast-print -fsyntax-only test.cpp --target=x86_64-windows-gnu --sysroot=D:\workfile\toolchain\compiler\x86_64-windows-gnu\x86_64-windows-gnu -fuse-ld=lld -flto=thin -rtlib=compiler-rt -stdlib=libc++ -std=c++20 >> ./test.txt
```

输出到 test.txt，通过裁剪生成实例化文件。

test.cpp 文件：

```cpp
#include <iostream>


void bbegin(); //起始点

template<typename T>
struct A{
  T a;
  T* b;
};

template <class... T> void print_(const T &...arg) {
  (std::cout << ... << arg) << std::endl;
}
template <bool f, class U, class... T>
constexpr auto sub_1(const U &val, const T &...arg) {
  if constexpr (f)
    return (val - ... - arg);
  else
    return (arg - ... - val);
}
void func() {
  print_("hhh", 'k', 1);
  auto x1 = sub_1<false>(10, 3, 5);
 A x{1,new int{1}};
}
void eend();//结束点

int main(){
  func();
}
```

### 通用调试器参数

| 参数 | 说明 |
|------|------|
| `program` | 要调试的程序路径，一般我都填 `"${command:cmake.launchTargetPath}"` |
| `cwd` | 工作目录，程序运行时的路径，差不多就是你 cd 进哪个目录下再启动程序的意思。这玩意影响你程序里使用相对路径找文件。我一般填 `"${workspaceRoot}"` |
| `args` | 在命令行里传给 debugger 的参数。意思就是你的 debugger 是在 shell 里运行还是直接程序运行。你装了不同的 debugger 插件会提供不同的类型，比如我下了 `LLDB` 插件 type 这里就可以填 `lldb` |
| `preLaunchTask` | 调试前启动的任务，一般是编译。但是我现在用 vscode-cmake-tools 插件完成编译构建，debug 都是 build 完之后点所以我一般不填。你要是手动构建的话这个得加一下每次 debug 前都构建最新的程序 |
| `stopAtEntry` | 是否在 main 函数处停住 |
| `externalConsole` | 使用系统终端还是 vscode 的内置终端 |
| `env` | 环境变量 |
| `console` | 控制使用哪种终端，vscode 内部还是外部控制台，有三个选项 `internalConsole`、`integratedTerminal` 或 `externalTerminal` |
| `internalConsoleOptions` | 调试期间调试控制台可见性 |

### 远程调试相关参数

| 参数 | 说明 |
|------|------|
| `sourceFileMap` | 让调试信息中的路径映射到对应路径 |
| `pipeTransport` | 管道传输 |

### cppdbg 类型专用的属性

这些属性是给装了微软的官方 cpp 插件 `ms-vscode.cpptools` 用的；这个插件提供了 debug 类型叫 `cppdbg`。然后这个插件前端通过这两个属性指定 debugger 类型和路径。

::: info
大概是因为 gdb 提供一个叫 gdb-mi 的接口来让 ide 和 debugger 交互，然后 lldb 为了兼容 gdb 的也搞了个 lldb-mi 接口。比如设置端点两个调试器都能用同一个命令：

```bash
-break-insert <file>:<line>
```

这样调试器可以用统一的接口去操作底层调试器。具体问 ai 就好。
:::

| 参数 | 说明 |
|------|------|
| `MIMode` | `"lldb"` |
| `miDebuggerPath` | `"/usr/bin/lldb-mi"` |
| `setupCommands` | 调试会话开始之前，向调试器发送一组初始化命令，这也是 MI 接口操作的 |
| `initCommands` | 这个是属性是使用 lldb 插件专用的属性和上一个属性效果差不多 |
| `externalConsole` | 是否启用系统外部终端，这个内置终端不支持交互？ |
