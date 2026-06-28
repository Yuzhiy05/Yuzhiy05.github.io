---
title: fast_io_manipulators
createTime: 2024/12/04 14:58:10
permalink: /article/d3sghq29/
---

# fast_io 操纵符

就是比如浮点格式，场宽，整形基底什么的
就是一种类型改它输出方式
操纵符全被定义在fast_io的manipulators命名空间中
用户允许向这个命名空间加自己的操纵符
比如你要将整数16进制输出
```cpp
size_t i=100;
using namespace fast_io::mnp;
println(hex(i));

如果前面要有0x你hex0x
base<36>(i)这是36进制输出
println(base<基底>(i));
```

hex是不是base<16>的特化
还有oct, bin ,dec
把整数按地址格式输出就有addrvw(i)

:::tip
你用操纵符，只是告诉fast_io让它类型能找到正确的
在编译时
它本身并不干活的
:::

:::info
如果要输出char const* cstr，你需要用os_c_str(cstr)或者os_c_str(cstr,n)
前者调用strlen得到长度，后者调用strnlen得到长度
如果要输出指针值，要用pointervw或handlevw
成员函数指针，要用methodvw
:::