---
title: compilerArgs
createTime: 2026/06/21 23:31:33
permalink: /article/wey2mn0v/
---



# MSVC 相关参数

/ZI 热重载调试模式
msvc生成调试符号文件.pdb,并且允许编辑模式即热重载也就是允许调试时改源码
```shell
cl /ZI /DEBUG source.cpp
```