---
title: fast_io_sixfile
createTime: 2024/12/03 14:53:25
permalink: /article/72dkdlbu/
---

# fast_io中的六种文件

wine nt win32 posix c filebuf

### c_file
c_file类创建出来的对象，它有个成员变量fp或者native_handle()方法（都一样）
```cpp
using namespace ::fast_io::io;
fast_io::c_file cf(u8"文件路径\\out\\cfile_test.txt", fast_io::open_mode::out);

println(cf, "helloworld");//fastio print

fprintf(cf.fp,"Hello %s\n", "World");//c api
fprintf(cf.native_handle(), "cfile_test %s\n", "native_handle()");

static_assert(sizeof(FILE*)==sizeof(c_file),"FILE* 大小与c_file相同")
//fast_io::c_file_unlocked cf2(u8"hello2.txt", fast_io::open_mode::in|fast_io::open_mode::out|fast_io::open_mode::trunc);
```

```cpp
FILE* fp=fopen();
```

:::info
fp通常再c编程中指代文件打开后返回的FILE* 文件指针
c_file就是一个C语言的FILE* 的包装，它有移动语义的，可以放进容器里，而且类型的大小，布局和FILE*完全相同
c_file还有别的字符的版本，例如wc_file, u8c_file, u16c_file, u32c_file
这个就是自动管理FILE*的类，自动关文件
很多代码的接口就只支持FILE*
c_file可以用fast_io的api，也可以用C语言的api
:::

c_file还有另一个类c_file_unlocked
因为c_file所有的操作都会上锁的
如果你不要上锁，那用c_file_unlocked
因为FILE*的操作在POSIX标准中是上锁的
你也可以手工锁
```cpp
c_file cf;
cf.lock();
cf.unlock();

c_file cf;
std::lock_guard guard{cf};
```

不过你不用管
它都上锁的

只是说它提供api你可以手工锁

之后变成无锁版本来操作

这样就可以优化

或者你知道你不会多线程中使用这个FILE*

你可以直接用c_file_unlocked

如果是c_file

可以竞争读写

它所有操作都会上锁之后操作的

它就会调用这个

当然是跨平台的，帮你包装好了

windows上就调用win的[win的](https://www.man7.org/linux/man-pages/man3/flockfile.3.html)

多线程同时读写同一个全局的c_file是没问题的

一个线程用c_file另一个用它的fp的FILE*也没问题

它用的是FILE*自己的锁
C库提供的锁这个不是文件锁，只是FILE*缓冲区的锁

:::tip  
scan print第一个参数如果是io设备类型就从这里输入或者输出
否则从标准输入输出到输入输出呀

它是io缓冲区的锁
比如你使用C语言的printf
stdio并不会直接把数据写盘的
一个io对象一个缓冲区呀  
:::

```cpp
FILE *fp=fopen();
c_file cf(fp);
```

c_file支持直接用FILE*构造

但你这里不能用c_file

因为你不想把stdout析构函数关掉吧

关掉就ub了
c_file cf(stdout);

语法上正确。但直接程序就炸了

因为析构函数把它关了

c_file一定执行析构的

但你现在手头上就有个FILE*

比如这里stdout

你就想对它用一下fast_io scan print这种api

FILE*直接不能放scan print里

所以你要用
```cpp
c_io_observer ciob{fp}; print(ciob,"hello world");
```

用c_io_observer把它包装起来就行了
这个是个聚合类
它没有析构，也没定义复制移动，甚至没有构造方法

:::tip  
c_file才关，c_io_observer只是观察者print不写设备就相当于写到c_io_observer{stdout}里,【锅楠阳叫兽】
scan同理
从c_io_observer{stdin}里读
因而它不存在C++流还需要与stdio同步的问题
它就是直接操作的C语言的FILE*  
:::

fast_io提供了c_stdout()，它就是c_io_observer{stdout}
但它保证noexcept的，效率会更高的
因为stdout很多C库没加noexcept
实际根本不可能抛出异常(兼容c函数的都是无条件noexcept 这是lakos规则但是编译器是否遵守不知道)

:::info  
u8c_io_observer
这就char8_t版本的FILE*
FILE*本身并不提供char8_t的支持
但fast_io是支持的  
:::

### filebuf_file
首先你需要include fast_io_legacy.h，表示C++流支持
legacy表示旧的东西

但如果看文件流的类方法
fstream
它有一个rdbuf()
返回的是std::filebuf*
std::fstream继承了std::iostream
实际上就是在iostream上加了个std::filebuf
做设备
把上面虚方法重写让它去操作std filebuf
std::filebuf你是可以直接用的
第二种文件了。叫fast_io::filebuf_file
和前面c_file的用法是一样的，不过filebuf_file是没有锁的，它不能多线程同时使用的
```cpp
using namespace ::fast_io::io;
fast_io::filebuf_file fbf(u8"D:\\workfile\\c++ try\\fastio_study\\out\\filebuf_test.txt", fast_io::open_mode::out);
println(fbf, "filebuf_test");
```

这个文件就是一个std::filebuf*的包装器了
就像c_file是FILE*的包装器
它是new/delete打开关闭std::filebuf的
FILE*是用fopen fclose
这里是用的new
new std::filebuf
它也只有一个成员fb,或者native_handle()方法

:::tip  
注意，这里是fb
不是fp
fb是std::filebuf的file buf的简称
fp是FILE Pointer的简称  
:::

它的作用是与C++流互相操作
操作C++流
就像c_file操作C语言FILE*

```cpp
fast_io::filebuf_file fbf("hello.txt", fast_io::open_mode::out);
std::ostream myosm(fbf.fb);
myosm<<"Hello World from std::ostream\n";
print(fbf,"Hello World from fast_io print\n");
```
这样你就得到了一个ostream，或者你用istream，iostream都行
这里有个问题，当然能ostream自然好，可如果某个api就要std::fstream怎么办呢
std::fstream并没有这个方法
构造方法不能接受一个std::streambuf*
因为它把std::filebuf绑定在std::fstream对象里了

所以要这么写
```cpp
 fast_io::filebuf_file fbf("hello.txt", fast_io::open_mode::out);
std::ofstream fout;
 *fout.rdbuf()=std::move(*fbf.fb);
```
得这么写
才能让它变成std::ofstream
这样就把fast_io::filebuf_file里的std::filebuf移动给标准库文件流了
去做缓冲了
因而之后你就不可以再使用这个fast_io::filebuf_file了
再用就得用fast_io::filebuf_io_observer了
就像c_io_observer一样

:::note  
fbf.fb是什么  
:::

它的成员呀
它只有一个成员就是fb
类型是std::filebuf*
```cpp
class filebuf_file
{
public:
//析构移动，还有构造方法略
std::filebuf* fb{};
};
```
它就是这样的
当然具体细节还有别的比如char_type之类我就没列出来

比如你现在手头有个std::ifstream std::ofstream 或 std::fstream
你怎么用fast_io操作它呢？
就像刚才有个FILE*你用c_io_observer操作一样

操作一个fstream

用fast_io

如果只是std::streambuf*，那你用fast_io::streambuf_io_observer，如果std::filebuf*那显然最好了

用fast_io::filebuf_io_observer

不然你得动态转换
将streambuf* 动态转换成filebuf*
你要不在乎它只是filebuf，那就用streambuf_io_observer就行

fs.rdbuf()

我都说了它是对std::filebuf*操作，不是对流本身操作了

fstream ifstream ofstream的rdbuf()方法都是返回这个std::filebuf*的

```cpp
std::fstream fs("D:\\workfile\\c++ try\\fastio_study\\out\\file_buf_test2.txt", std::ios::in | std::ios::out| std::ios::trunc);
fast_io::filebuf_io_observer obf(fs.rdbuf());
println(obf, "file_buftest2");
```

反过来用fast_io::filebuf_file构造std::fstream呢？

还记得么
```cpp
fast_io::filebuf_file fbf(u8"D:\\workfile\\c++ try\\fastio_study\\out\\filebuf_test3.txt", fast_io::open_mode::in | fast_io::open_mode::out | fast_io::open_mode::trunc);
std::ostream myosm(fbf.fb);
myosm << "file_buftest3 from std::ostream\n";
println(fbf, "file_buftest3 from fast_io print");


std::string str{ "file_buftest4_str" };
fast_io::filebuf_file fbf(u8"D:\\workfile\\c++ try\\fastio_study\\out\\filebuf_test4.txt", fast_io::open_mode::in | fast_io::open_mode::out | fast_io::open_mode::trunc);
fast_io::filebuf_io_observer obf2(fbf);

std::fstream fs("D:\\workfile\\c++ try\\fastio_study\\out\\filebuf_test_fstream.txt", std::ios::in | std::ios::out | std::ios::trunc);
fs << str;
*fs.rdbuf() = std::move(*fbf.fb);
fs << str;
```

把filebuf_file里的filebuf移动给文件流本身的filebuf
之后再操作这个fstream的时候就只能filebuf_io_observer了,不能再对filebuf_file操作了

:::tip  
一般C艹的流api都是接受ostream istream这种的
所以一般并不需要必须构造fstream出来
只是就怕哪个脑抽api规定就要fstream
那你就只能移动了  
:::

你不是有一个filebuf_io_observer么
它可以强转成c_io_observer或者c_io_observer_unlocked
static_cast
这样就能让文件流变成C的FILE*来操作

```cpp
fast_io::filebuf_file fbf(u8"D:\\workfile\\c++ try\\fastio_study\\out\\filebuf_to_cfile.txt", fast_io::open_mode::in | fast_io::open_mode::out | fast_io::open_mode::trunc);
fast_io::filebuf_io_observer obf(fbf);
auto cf_io = static_cast<fast_io::c_io_observer>(obf);//单向
println(cf_io, "static_cast filebuf_to_c_io\n");
fprintf(cf_io.fp, "filebuf_to_cfile %s\n", "OOOO");
println(fast_io::mnp::handlevw(cf_io.fp));
println(fast_io::mnp::pointervw(cf_io.fp))
```

:::warning  
只能从filebuf_io_observer向c_io_observer(_unlocked)强转  
:::

c_file才会关文件
c_io_observer是不管的

:::tip  
fast_io::mnp里的都是操纵符
pointervw 指针输出为16进制按你机器长度对齐
handlevw 指针或整型输出，指针输出为16进制按你机器长度对齐，整型输出成10进制不对齐
methodvw是输出方法（成员函数）指针的  
:::

cf_io.fp
因为它是FILE*，所以你当然可以直接对它使用fprintf呀
这个FILE* 不是我提供的，是C++流里本身就有的FILE*
我只是帮你提取出来
因为有些api只能对FILE*用但不能对流用对吧
这样就能在流上使用FILE*的api
但要注意flush再用，不然缓冲区会乱
因为它有两个缓冲了
搞了一大坨，最终就是个FILE*包装器
因为它自己filebuf里有一个对吧
下面FILE*本身还有一个
FILE*是std::filebuf的一个私有或保护成员
三家标准库都是这么实现的
MSVC STL, GNU libstdc++, LLVM libc++都是用FILE*去实现流的

关同步流是不是取消这两个同步
ios::sync_with_stdio(0),cin.tie(0),cout.tie(0)
不是
关流同步就没有用。因为线程不安全。就libstdc++实现了，别人都没实现
而且libstdc++关流同步就线程不安全了
所以一点屁用没有
libstdc++是改下面streambuf*绑定的类型
把它从__gnu_cxx::stdio_sync_filebuf改成绑定__gnu_cxx::stdio_filebuf
你也看到了，不管是哪个，都仍然是stdio

既然文件流是stdio FILE*实现的
我能拿到里头的FILE*
反过来，是不是能用一个FILE*去构造filebuf呢？

```cpp
FILE* fp = fopen("D:\\workfile\\c++ try\\fastio_study\\out\\cfile_to_filebuf.txt", "wb");
if (fp == nullptr) abort();//文件打开失败了
fast_io::c_file cf(fp);
print(cf, "cfile_to_filebuf I am fast_io::c_file\n");
fast_io::filebuf_file fbf(std::move(cf), fast_io::open_mode::out);
std::ostream fout(fbf.fb);
fout << "cfile_to_filebuf FILE* from std::ostream\n";
print(fbf, "Hello FILE* from fast_io::filebuf_file\n");
```

这不是把一个FILE* 变成流了么
你也可以变成fstream

Q:c_file能用file*构造，filebuf_file能用c_file构造，那为什么c_io_observer不能构造filebuf_io_observer

A:它没货呀
都observer了
怎么构造std::filebuf*?
filebuf_file能用c_file构造， c_io_observer可以从filebuf_io_observer强转
下级向上级得移动，上级到下级才能强转
这有个层级问题呀
统一的规则
之后还有别的文件也是这个规则
因为流是用FILE* 实现的，因而流的层级比FILE*高一级
同样你不能用filebuf_file去构造c_file

Q:c_io_observer->fp->c_file->filebuf_file->filebuf_io_observer

A:这是不行的呀
c_io_observer->fp->c_file这一步就是错的
这不是二次释放了？
observer是别人的 FILE*又不是你的
你能给它fclose了？
io_observer的意思就是不能关
只是借用一下
所以你这过程是不成立的
要注意c层和filebuf层这两级的文件或io_observer都自带缓冲的
都是标准库已经有的
所以fast_io操作他们的时候性能比较快
而且可以读入
如果不带缓冲是不能读入的
输出也不是原地的
不是直接在缓冲区上输出的

### posix_file

它的成员不叫fp也不叫fb,叫fd
file descriptor
文件描述符
类型自然就是整型了

```cpp
sizeof(posix_file)==sizeof(posix_io_observer)==sizeof(int)

//用起来也一样了
posix_file pf("posixfile.txt", fast_io::open_mode::out);
print(pf,"Hello World\n");
```

fast_io又不管格式串
只是一个一个输出而已
因为unix上标准输入的文件描述符是0，输出是1,错误是2，因而你打开的文件自然它的fd就是3了
你可以调用POSIX write函数的windows上也能写成_write,  _write(pf.fd,"hello\n",6);
同样fd可以用posix_io_observer包装了对吧
这和c_io_observer filebuf_io_observer 一样的呀
也有u8, w, u16, u32的版本
u8posix_io_observer版本比如说
u8posix_file
posix层没有提供缓冲，所以读入字符串这种会丢弃字符的是不行的，输出的话也没缓冲，直接就走系统调用进内核了

Q:u8, w版本的io_observer能互相转换吗

A:可以。但不能直接强转

```cpp
u8posix_io_observer u8piob{piob.fd};
print(u8piob,u8"Hello World from u8\n");
```
posix, c, filebuf三层之间也是互相可以转化的
posix层显然是C层的下一层对吧
文件描述符实现文件指针，文件指针实现文件缓冲指针

posix层是c层的下层对吧
因而posix_file pf可以移动给c_file，也可以直接移动给filebuf_file
当然都需要加open_mode了
因为移动给filebuf_file就是先构造c_file出来再移动一次
因而如果你有一个fd，这样可以变成一个C++文件流了
也可以同时用fast_io的api来操作
fast_io会尽可能的高效的帮你来操作，比你手工调用函数是要高效的
你看这个也是unix api
fdopen
fast_io就会帮你调fdopen
用fdopen去打开FILE*
```cpp
posix_file pf("posix_file.txt",fast_io::open_mode::out):
filebuf_file fbf(std::move(pf),fast_io::open_mode::out);
```

:::tip  
规则是下级向上级移动文件，上级向下级才能强转观察者  
:::

所以你可以用这个来得到fstream里的文件描述符
你把它变成filebuf_io_observer

```cpp
filebuf_io_observer fiob{fout.rdbuf()};
posix_io_observer piob{static_cast<posix_io_observer>(fiob)};
println("fd in the ofstream fout is ",piob.fd);
```
这样就拿到里头的fd了
看懂了么
因为流是FILE* 实现的，FILE*是用fd实现的
因而fd是可以从流中拿到的

同样构造C层也是一样的

```cpp
posix_file pf("posix_file.txt",fast_io::open_mode::out):
c_file cf(std::move(pf),fast_io::open_mode::out);
fprintf(cf.fp,"hello fd %d\n",pf.fd);

//在windows上lf/crlf转换是posix层提供的，fast_io打开文件默认统一的二进制流，你如果要打开crlf的话就可以在posix层或以上打开文件的时候加fast_io::open_mode::out|fast_io::open_mode::text

filebuf_file fbf("filebuf_file.txt",fast_io::open_mode::out|fast_io::open_mode::text);

c_file cf("c_file.txt",fast_io::open_mode::out|fast_io::open_mode::text);
posix_file pf("posix_file.txt",fast_io::open_mode::out|fast_io::open_mode::text);
```

### win32
下面一个层级就是win32了
win32_io_observer win32_file
posix下面
自然它的成员就叫handle
就是句柄了

因而win上fd和handle都有的，fd是用handle实现的
win32_file win32_io_observer
u8win32_file u8win32_io_obsever一样的
win32可以加_9xa或者_ntw后缀。win32_file_9xa, win32_file_ntw. win32_file是win32_file_9xa还是win32_file_ntw取决于_WIN32_WINNT宏是否被定义。
比如你非得让它在windows95上能运行就9xa，只能在nt上运行就ntw
不然你就win32_file

A系9x内核, W系nt内核.
CreateFileA只应在windows95/98/me上使用.
CreateFileW只应在nt内核上使用
u8win32 file和win32 file
非要都兼容就得用A系，但nt内核上会乱码

既然是handle，你可以把win32_file当HANDLE的raii类，也可以用win32_io_observer去让一个HANDLE调用fast_io的print/scan对吧
和fd, fp, fb一样的呀
只不过这次是handle
handle, fd, fp, fb

win32层是posix层的下层，posix层是win32的上层

因而你可以从上层强转观察者或者从下层构造上层文件对吧
```cpp
posix_file pf("posix_file.txt",fast_io::open_mode::out):
filebuf_file fbf(std::move(pf),fast_io::open_mode::out);
//刚才posix是这样的对吧
win32_file pf("win32_file.txt",fast_io::open_mode::out):
filebuf_file fbf(std::move(pf),fast_io::open_mode::out);
//用win32去构造posix的fd也是可以的
win32_file pf("win32_file.txt",fast_io::open_mode::out):
posix_file fbf(std::move(pf),fast_io::open_mode::out);

//用win32去构造c的fp也是可以的
win32_file wf("win32_file.txt",fast_io::open_mode::out):
c_file cf(std::move(wf),fast_io::open_mode::out);
fprintf(cf.fp,"hello win32 from C: %p\n", cf.fp);
```
这里直接改win32就行了

### nt
下面的层叫nt层
这就是windows的系统调用层了
linux系统调用是稳定的。windows不稳定。windows用的是ntdll.dll来做的
ntdll.dll负责进行系统调用
因而叫nt_file nt_io_observer
成员也是handle
因而它不需要，也不能去移动给win32层。因为它也是handle
win32是在kernel32.dll里的api，他们会去调用ntdll.dll里的api,叫NT API
```cpp
nt_file nf("nt_file.txt",fast_io::open_mode::out):
filebuf_file fbf(std::move(nt),fast_io::open_mode::out);
```
这样就可以直接从NT系统调用api去构造C++ fstream
```cpp
nt_file nf("nt_file,txt",open_mode::out);
win32_io_observer wiob{static_cast<win32_io_observer>(nf)};
```
观察者之间直接转就行
nt和win32虽然层级不同，却不用构造的
他们一样的

### wine
nt层正常就进windows nt内核了
不过嘛，在比如linux上有wine你知道吧
wine会将nt api去用Linux上的api去实现
这就多了一层，wine层
wine_io_observer wine_file
叫host_fd，不过还没实现

这个就是让你能在linux的环境中直接调用wine宿主的api

native_file native_io_observer不过是fast_io选一层去当fast_io的默认实现

目前在除了windows（不含cygwin） 上是用的win32层，别的都用的posix层

而obuf_file不过是在native_file上加了个输出缓冲

native_file是根据你平台fast_io决定的,默认
要不然posix_file要不然win32_file

:::tip  
建议选择ibuf_file 做输入输出
ibuf_file就是basic_ibuf<native_file>
就是native_file上面加个输入缓冲  
:::