---
title: win下的生成工具
createTime: 2024/12/07 00:32:09
permalink: /article/pc9qmrqh/
---

## dumpbin工具的使用

1）查看它的输入信息，可以看到加载的 dll 及 dll 函数：

```bash
dumpbin /dependents xxx.exe # 简化版，到加载的dll 
dumpbin -imports xxx.exe # 可以看到dll及dll函数
```

2）列出导出函数：

```bash
dumpbin /dependents xxx.dll
dumpbin –exports xxx.dll
```

## llvm 工具

```bash
llvm-objdump -x xxx.exe #列出引用的所有头文件
```
