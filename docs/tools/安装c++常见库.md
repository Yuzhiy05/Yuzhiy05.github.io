---
title: 安装c++常见库
createTime: 2025/05/13 23:10:45
permalink: /article/y019uwz3/
---
#安装c++ 常见库的的一些流程


## boost
1.在boost页面下载源码,解压
2.点击booststrap.bat执行脚本，生成b2.exe
3.执行命令行中执行
```powershell
//这个在win下用vs工具链构建的vc140库不能给clang -target=x86_64-windows-msvc用
b2 install --prefix=D:\workfile\lib\boost  --build-type=complete --with-regex address-model=64 link= static runtime-link=shared

//这个能用 自己指定下系统根
./b2 install --prefix=D:\workfile\lib\boost-clang4msabi --build-type=complete --with-regex -–with-system toolset=clang  address-model=64 cxxflags="--target=x86_64-windows-msvc -std=c++23 --sysroot=D:\\workfile\\compiler\\windows-msvc-sysroot" linkflags="--target=x86_64-windows-msvc --sysroot=D:\\workfile\\compiler\\windows-msvc-sysroot -fuse-ld=lld" define=BOOST_USE_WINDOWS_H link=shared runtime-link=shared

//这两个用clang-cl生成的用不了
./b2 install --prefix=D:\workfile\lib\boost-clang-cl --build-type=complete --with-regex -–with-system toolset=clang-win  address-model=64 cxxflags="--target=x86_64-windows-msvc /std"c++latest /Zc:__cplusplus" linkflags="--target=x86_64-windows-msvc -fuse-ld=lld" define=BOOST_USE_WINDOWS_H link=shared runtime-link=shared

```
因为cmake冲突我还手动把库里所有clang21 改为clangw21

prefix:指定安装路径
with:指定安装的库
link:被编译库链接方式
runtime-link:被编译库与其他库的关系。
例如被编译的库为A,A依赖库B ，我的程序C依赖A

|-----|-----|——————|
|link:static<br>runtime-link=static|C静态链接A(C包含A.lib),A静态链接B|只需要C即可|
|link:static<br>runtime-link=shared|C静态链接A(C包含A.lib),A动态链接B|C和B.so/B.dll|
|link:shared<br>runtime-link=shared|C动态链接A,A动态链接B|C和B.so/B.dll和A.so/A.dll|
|link:shared<br>runtime-link=static|C动态链接A,A静态链接B|C和A.so/A.dll(此项可能不能允许)|


A.Windows上lib前缀的为静态链接库,导入库和dll没有

4.在cmake中使用find_packge引用


## abseil
1.
