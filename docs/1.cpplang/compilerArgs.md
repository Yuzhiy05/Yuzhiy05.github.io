


# MSVC 相关参数

/ZI 热重载调试模式
msvc生成调试符号文件.pdb,并且允许编辑模式即热重载也就是允许调试时改源码
```shell
cl /ZI /DEBUG source.cpp
```