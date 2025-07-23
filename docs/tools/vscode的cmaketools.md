---
title: vscode的cmaketools
createTime: 2025/07/05 00:29:16
permalink: /article/19lgyzty/
---
# cmaketools 插件的一些问题

指定生成器
使用插件生成的cmakepresets cmake预设不能指定
cmake_cxx_flag和cmake_c_flag
和生成器
```json
"generator": "Ninja"

"CMAKE_CXX_FLAGS": "--target=x86_64-windows-gnu --sysroot=D:\\workfile\\toolchain\\compiler\\x86_64-windows-gnu\\x86_64-windows-gnu -fuse-ld=lld  -rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -Wno-unused-command-line-argument -stdlib=libc++",

"CMAKE_C_FLAGS": "--target=x86_64-windows-gnu --sysroot=D:\\workfile\\toolchain\\compiler\\x86_64-windows-gnu\\x86_64-windows-gnu -fuse-ld=lld -rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -lntdll -Wno-unused-command-line-argument "
```

配置中 Cmake: Preferred Generators 项指定生成器

Clangd设置中 
Clangd: Arguments

--compile-commands-dir=${workspaceFolder}/out/build/clang_debug

这个指定路径是固定的,需要
生成预设的时候改这个

"binaryDir": "${sourceDir}/out/build/${presetName}",