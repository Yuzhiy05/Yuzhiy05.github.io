---
title: 安装c++常见库
createTime: 2025/05/13 23:10:45
permalink: /article/y019uwz3/
---
#安装c++ 常见库的的一些流程

我的工具链比较特殊
使用clang 和 微软的STL标准库 系统跟手动指定链接器使用lld 构建系统用ninja

## boost
1.在boost页面下载源码,解压
2.点击booststrap.bat执行脚本，生成b2.exe
3.执行命令行中执行
```powershell
//这个在win下用vs工具链构建的vc140库不能给clang -target=x86_64-windows-msvc用
b2 install --prefix=D:\workfile\lib\boost  --build-type=complete --with-regex address-model=64 link= static runtime-link=shared

//这个不能生成.lib导出库 被cmake IMPORTED_IMPLIB not set for imported target "Boost::regex" configuration"Debug". 拒绝

./b2 install --prefix=D:\workfile\lib\boost1.88-clang-14 --build-type=complete toolset=clang address-model=64 link=shared runtime-link=shared --with-system --with-regex define=BOOST_USE_WINDOWS_H,BOOST_REGEX_STANDALONE,REGEX_FOUND,BOOST_REGEX_DYN_LINK  cxxflags="--target=x86_64-windows-msvc -std=c++14 --sysroot=..\\windows-msvc-sysroot" linkflags="--target=x86_64-windows-msvc --sysroot=..\\windows-msvc-sysroot -fuse-ld=lld —D_DLL=1 -lmsvcrt" 

./b2 install --prefix=D:\workfile\lib\boost1.89-clang --build-type=complete --with-regex --with-system toolset=clang  address-model=64 cxxflags="--target=x86_64-windows-msvc -std=c++23" linkflags="--target=x86_64-windows-msvc --sysroot=..\\windows-msvc-sysroot -fuse-ld=lld —D_DLL=1 -lmsvcrt" define=BOOST_USE_WINDOWS_H -DBOOST_REGEX_STANDALONE=on link=shared runtime-link=shared

//测试的参数
define=BOOST_USE_WINDOWS_H  -D_DLL -lmsvcrt variant=release,debug target-os=windows

./b2 install --prefix=D:\workfile\lib\boost1.88-clang --build-type=complete --with-system --with-regex toolset=clang  address-model=64  cxxflags="--target=x86_64-windows-msvc -std=c++23" linkflags=" --sysroot=..\\windows-msvc-sysroot" link=shared runtime-link=shared

//这两个用clang-cl生成的用不了
./b2 install --prefix=D:\workfile\lib\boost-clang-win --build-type=complete --with-regex --with-system toolset=clang-win  address-model=64  cxxflags="--target=x86_64-windows-msvc /std:c++latest /Zc:__cplusplus" define=BOOST_USE_WINDOWS_H link=shared runtime-link=shared

// 这个能生成导入库 用的clang-windows-gnu 后面一点参数不能跟
./b2 install --prefix=D:\workfile\lib\boost1.87-clang --build-type=complete --with-system --with-regex toolset=clang  address-model=64
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
```shell
./b2 install --prefix=D:\workfile\lib\boost-clang --build-type=complete --with-system --with-regex toolset=clang  address-model=64  cxxflags="--target=x86_64-windows-msvc -std=c++23" linkflags="--target=x86_64-windows-msvc --sysroot=...\\windows-msvc-sysroot -fuse-ld=lld" link=shared runtime-link=shared
```
1.单纯指定 cxxstd=14 等级低于17 不加define=BOOST_REGEX_DYN_LINK
是没有.lib 导出库的
2.指定cxxstd=14 添加define=BOOST_REGEX_DYN_LINK
没有.lib 导出库
3.2的基础上加 define=BOOST_REGEX_STANDALONE
没有.lib导出库
4.使用-std=c++03 define=BOOST_REGEX_DYN_LINK

BOOST_REGEX_STANDALONE,BOOST_REGEX_DYN_LINK

```shell
PS D:..\lib> llvm-objdump -p boost_regex-clang21-mt-d-x64-1_88.dll

...其他符号...
Export Table:
 DLL name: boost_regex-clang21-mt-d-x64-1_88.dll
 Ordinal base: 1
 Ordinal      RVA  Name
       1   0x2140  _ZN5boost24scoped_static_mutex_lock4lockEv
       2   0x2200  _ZN5boost24scoped_static_mutex_lock6unlockEv
       3   0x20f0  _ZN5boost24scoped_static_mutex_lockC1ERNS_12static_mutexEb
       4   0x20f0  _ZN5boost24scoped_static_mutex_lockC2ERNS_12static_mutexEb
       5   0x21c0  _ZN5boost24scoped_static_mutex_lockD1Ev
       6   0x21c0  _ZN5boost24scoped_static_mutex_lockD2Ev
       7  0x6c2f8  _ZTVN5boost13re_detail_50023abstract_protected_callE
       8   0x1470  regcompA
       9   0x2240  regcompW
      10   0x1800  regerrorA
      11   0x25d0  regerrorW
      12   0x1c30  regexecA
      13   0x29c0  regexecW
      14   0x17a0  regfreeA
      15   0x2570  regfreeW

# 使用dumpbin查看vc生成的dll
PS D:..\boost\lib> dumpbin /EXPORTS  boost_regex-vc143-mt-gd-x64-1_87.dll
Microsoft (R) COFF/PE Dumper Version 14.44.35207.1
Copyright (C) Microsoft Corporation.  All rights reserved.


Dump of file boost_regex-vc143-mt-gd-x64-1_87.dll

File Type: DLL

  Section contains the following exports for boost_regex-vc143-mt-gd-x64-1_87.dll

    00000000 characteristics
    FFFFFFFF time date stamp
        0.00 version
           1 ordinal base
           8 number of functions
           8 number of names

    ordinal hint RVA      name

          1    0 00001000 regcompA = regcompA
          2    1 00037F50 regcompW = regcompW
          3    2 00001290 regerrorA = regerrorA
          4    3 000381E0 regerrorW = regerrorW
          5    4 000015F0 regexecA = regexecA
          6    5 00038560 regexecW = regexecW
          7    6 00001950 regfreeA = regfreeA
          8    7 000388C0 regfreeW = regfreeW

  Summary

        2000 .data
        A000 .pdata
       1A000 .rdata
        1000 .reloc
        1000 .rsrc
       B8000 .text
```

✅这个试了可以 把 系统根之类的写cxxflag里
```powershell
./b2 install --prefix=D:\workfile\lib\boost1.89-clang --build-type=complete --with-regex toolset=clang  address-model=64 cxxflags="--target=x86_64-windows-msvc -std=c++20 -fuse-ld=lld --sysroot=..\\windows-msvc-sysroot" linkflags="--target=x86_64-windows-msvc --sysroot=..\\windows-msvc-sysroot -fuse-ld=lld -lmsvcrt -D_DLL=1" -DBOOST_REGEX_STANDALONE=on link=shared runtime-link=shared
```

regex这个库比较特殊 因为用到了system中表示boost::err_code 所以需要编译成动态库 但是可以通过 -DBOOST_REGEX_STANDALONE=on
使用独立模式减掉这个依赖 从而当头文件库使用。

所以头文件库的话cmake里需要 `target_include_directories(boost_test PUBLIC ${Boost_INCLUDE_DIRS})` 而不是
`target_link_libraries(boost_test PRIVATE Boost::regex)` 

独立模式下Regex使用b2编译完只有dll没有lib 所以 用target_link_libraries报错configcmake根本没生成导入库

## abseil
1.✅ 在官网基础上 本来想用toolchain.cmake脚本设置这些参数发现不行总是失败
```powershell
cmake .. -G"Ninja" -DCMAKE_CXX_COMPILER="D:\\workfile\\compiler\\clang\\llvm\\bin\\clang++.exe" -DCMAKE_SYSROOT="D:\\workfile\\compiler\\windows-msvc-sysroot"  -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=23 -DCMAKE_CXX_FLAGS="--target=x86_64-windows-msvc --sysroot=D:/workfile/compiler/windows-msvc-sysroot -fuse-ld=lld"
``` 