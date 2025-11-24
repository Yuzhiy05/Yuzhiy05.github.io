---
title: install_lib
createTime: 2025/02/27 08:55:42
permalink: /article/das5rb6v/
---
### 安装 abseil


```powershell
cmake --build . --target clean //清除构建生成

Remove-Item -Recurse -Force *  //ps 删除当前文件夹下所有文件

按如下顺序构建
cmake .. -DCMAKE_TOOLCHAIN_FILE=D:/workfile/compiler/toolchaincmake/clang-msvc-toolchain.cmake  -G "Ninja" -DCMAKE_BUILD_TYPE=Release //单配置生成器指定

cmake --build . --config Release //Release 构建项目

cmake 安装  cmake --install . --prefix "D:\workfile\lib\abseil" //指定安装地址
//指定多配置生成器
cmake -B build -G "Visual Studio 17 2022"

# 构建 Release
cmake --build build --config Release

# 安装 Release
cmake --install build --config Release --prefix /path/to/install

//其他细化命令
cmake .. -G"Ninja" -DCMAKE_CXX_COMPILER="...\\clang\\llvm\\bin\\clang++.exe" -DCMAKE_SYSROOT="...\\windows-msvc-sysroot" 

cmake .. -G"Ninja" -DCMAKE_CXX_COMPILER="D:\\workfile\\compiler\\clang\\llvm\\bin\\clang++.exe" -DCMAKE_SYSROOT="...\\clang\\x86_64-windows-gnu" 


```