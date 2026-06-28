---
lang: zh-CN
title: c++编程语言第四版
description: c++编程语言第四版导读
createTime: 2024/11/02 12:45:16
permalink: /article/j3qgcpng/
---

# c++之旅
### 导言  
本文是The Cpp Programming Language 4th edition的学习记录
> If you find this "lightning tour"
confusing, skip to the more systematic presentation starting in Chapter 6 

总的来说前五张只是速览，并不该纠结于细节问题

## The Basics

首先一如其他编程或计算机书籍一样，一个从源码到可执行文件的流程图介绍。不过这里本老爹也借此重申了所谓**c++的兼容性**。
>When we talk about portability of C++ programs, we usually
mean portability of source code; that is, the source code can be successfully compiled and run on a
variety of systems

也就是说谈论兼容性说的是源码兼容,一份符合c++标准的源码应该可以保证在任何所支持平台和对应版本的编译器编译的。尽管这是常识，不过我还是写这里用作提醒。
然后本老爹引入一个名词**实体**。
>The ISO C++ standard defines two kinds of entities:  
• Core language features, such as built-in types (e.g., char and int) and loops (e.g., for-statements and while-statements)  
>• Standard-library components, such as containers (e.g., vector and map) and I/O operations
(e.g., << and getline())  

不过这里和cppreference所述的[实体](https://zh.cppreference.com/w/cpp/language/basic_concepts)有些出入。我不知为何*语句(statement)*也被划入实体的范畴。不过相比"**对象**"这个概念，实体确实很少有人去讨论或表述。就我的理解实体就是在c++程序中能被操作或识别的事物。他是真实存在的概念但不必通过占用内存，执行操作之类事件观测他的存在。

>C++ is a statically typed language. That is, the type of every entity (e.g., object, value, name,
and expression) must be known to the compiler at its point of use. The type of an object determines
the set of operations applicable to it

我觉得这是很有用的一句话。因为接受这句话或许能帮助我解决初学c++时期的一些困惑。我个人认为它和我之后所认识到的**严格别名优化**或通过union进行类型转换所造成的UB相关。

>Every C++ program must have exactly one global function named main(). The program starts
by executing that function. The int value returned by main(), if any, is the program’s return value to
"the system." If no value is returned, the system will receive a value indicating successful completion.

这段话或许能从所有c++相关书籍中都能找到。尽管如此我还是摘抄下来，因为后面本老爹给出了一个有趣的例子。之后本老爹解释了一段经典*helloworld*程序中每个字符的意思.这里对于稍微接触过C++的人来说应该都没什么好看的。

>Every name and every expression has a type that determines the operations that may be performed on it  
A declaration is a statement that introduces a name into the program. It specifies a type for the named entity:  
• A type defines a set of possible values and a set of operations (for an object).  
• An object is some memory that holds a value of some type.  
• A value is a set of bits interpreted according to a type.  
• A variable is a named object

这里很清楚的说明了一个"名字"或者说*id-expression*,和表达式都有其类型来指定它所能执行的操作。**也就是说表达式也有其类型**。声明是向程序中引入一个名字，这个名字指代所声明类型的**实体**.这里更细致的说明可能要引入[标识符(identifier)](https://zh.cppreference.com/w/cpp/language/identifiers)的概念，不过对初学者可能没有必要。剩下五句解释很简单，不过其中引入了**对象**的概念，不过这里本老爹似乎是因为前文叙述了阅读此部分的要求而没有解释。

>Each fundamental type corresponds directly to hardware facilities and has a fixed size that determines the range of values that can be stored it

这里没什么好说的每个基础类型都有其硬件表示。不过这里如果不是基本类型似乎可以扩展到**值表示**和**对象表示**的概念上。

>A char variable is of the natural size to hold a character on a given machine (typically an 8-bit byte), and the sizes of other types are quoted in multiples of the size of a char. The size of a type is implementation-defined (i.e., it can vary among different machines) and can be obtained by the sizeof operator; for example, sizeof(char) equals 1 and sizeof(int) is often 4

这一大段我认为很重要也很容易被人忽略。直接说就是char类型所占用字节数是由实现定义的，不过通常为8。也有例外，有些平台一个char类型占9个字节比如*PDP-11*。c++为了实现其兼容性这里不作规定似乎是很重要的一点。**每个类型都为char类型大小的整数倍，** 这里似乎能为**unsigned char数组作存储重用**和进行**类型转换**埋下伏笔。

之后介绍了c++基本类型所能做的操作，也简单的介绍了一下类型转换，即在不同类型进行赋值和计算操作时，类型会做相应的转换。
```cpp
double d = 2.2; //初始化浮点数
int i = 7; // 初始化整数
d = d+i; // 求和赋值给d
i=d∗i; // 将产生的值赋值给i(将双精度浮点数截断转换为整型)
```
>C++ offers a variety of notations for expressing initialization, such as the = used above, and a universal form based on curly-brace-delimited initializer lists

简单的说c++提供了花括号初始化器，是得我们在初始化变量时(定义),可以这么写
```cpp
double d1 = 2.3;
double d2 {2.3};
complex<double> z = 1; // a complex number with double-precision floating-point scalars
complex<double> z2 {d1,d2};
complex<double> z3 = {1,2}; // the = is optional with { ... }
vector<int> v {1,2,3,4,5,6};
```
使用花括号初始化器需要注意一点的是它无法窄化转换。同时复制列表初始化器可以通过auto占位符推导到*std::initializer_list*，而直接列表初始化则不能。

>A constant (§2.2.3) cannot be left uninitialized and a variable should only be left uninitialized in extremely rare circumstances

后一句的那种少部分情况应该能在嵌入式中看到。

> Don’t introduce a name until you have a suitable value for it.
          
这里与我所作的一样，不同于c语言在进函数体开头就声明所需要的类型，而是在需要的地方声明他，应该有意识的控制所用变量的作用域。

>We use auto where we don’t hav e a specific reason to mention the type explicitly. ‘‘Specific
reasons’’ include:  
• The definition is in a large scope where we want to make the type clearly visible to readers
of our code.   
• We want to be explicit about a variable’s range or precision (e.g., double rather than float)

本老爹给了两种情况对不使用auto的情况，其他情况都是能用则用。不过对于第二种因为重载运算符我们也可以使用auto来自动推导。同时auto也经常被用做泛型编程来避免写很长的类型名。在是否使用auto的问题上推荐herb的一篇文章[GotW #94 Solution: AAA Style (Almost Always Auto)](https://herbsutter.com/2013/08/12/gotw-94-solution-aaa-style-almost-always-auto/)
```cpp
//这里需要补充下例子
auto i=0uz;//c++23可以这样。这样可以使用auto也清楚类型具体的精度(长度)
```
>C++ supports two notions of immutability (§7.5):  
• const: meaning roughly "I promise not to change this value"(§7.5). This is used primarily to specify interfaces, so that data can be passed to functions without fear of it being modified. The compiler enforces the promise made by const.  
• constexpr: meaning roughly"to be evaluated at compile time"(§10.4). This is used primarily to specify constants, to allow placement of data in memory where it is unlikely to be corrupted, and for performance

尽管本老爹说这是大致意思，不过对初学者来说能够理解避很多错误,比如相当有部分的人喜欢修改常量表达式的值，或使用const_cast转换const引用的指针或引用以为这就可以直接修改所引用或指向的值了(假设所引用或指向对象同样拥有const 修饰)。并且这种和编译器的"承诺"也同时帮助编译器进行常量优化。此外constexpr的限定的函数在c++14之后也更放松，同时也引入了更为严格的constevl关键字来指定必须进行编译器计算。cosntexpr修饰的函数不一定进行编译期求值，这是根据其中所使用的变量和传递的参数是否为常量表达式决定的，因此我们不必同一个功能的函数仅仅因为是否常量求值而写两个版本。在经常使用常量表达式的地方，这里只举了三个例子如模板参数，case标签，数组边界。同时编译期求值是除了性能考虑，不变性的概念是非常的设计考量。关于不变性，后面在关于类的设计中本老爹会叙述。

2.2.4与2.2.5章节作者的叙述通俗易懂相对简单，不过其中一个例子很重要
```cpp
char  a[6]="hello";
char* p=&a[0];
char* p2=a;//数组隐式转换到指针 
//地址相同
```
单看初始化表达式的子表达式也应该知道这两不是得到的不是一个类型，不过数组隐式转化到指针丢失了长度信息。我们不能因为单纯的地址相同，汇编相同等实现原因来直接断言两个抽象的类型或操作是一样的。同时，鉴于之前有人直接将数组复制给另一个数组妄图进行每个元素的复制。书上这个例子也暗示了不能这样做，所以直接写了一个for循环进行赋值。或使用std::array
```cpp
//Consider copying ten elements from one array to another:
void copy_fct()
{
int v1[10] = {0,1,2,3,4,5,6,7,8,9};
int v2[10]; // to become a copy of v1
v2=v1 //error
for (auto i=0; i!=10; ++i) // copy elements
v2[i]=v1[i];
// ...
}
```
同时介绍的这个c++11的范围for循环也很有用，我们可以不用指定边界。对于任意序列我们都可以
```cpp
void print()
{
int v[] = {0,1,2,3,4,5,6,7,8,9};
for (auto x : v) // for each x in v
cout << x << '\n';
for (auto x : {10,21,32,43,54,65})
cout << x << '\n';
for (auto& x : {10,21,32,43,54,65}) //我不想单纯的复制序列中的元素而是希望引用，使用auto&这样的写法
cout << ++x << '\n';  
// ...
}
```
这里的任意序列可以用很多种形式如std::iota(1,10),std::vector,std::array,std::map等标准库容器都支持范围for语句。

通常我们需要让声明的指针指向一个有效类型的地址，这样解引用才不会无效。不过有时我们也需要一个不属于任何对象的地址，**nullptr**。nullptr可以对任意指针类型使用,不过在一些老的c风格代码中使用0或NULL表示空指针。
```cpp
double∗ pd = nullptr;
Link<Record>∗ lst = nullptr; // pointer to a Link to a Record
int x = nullptr; // error : nullptr is a pointer not an integer
```
### 像内建类型一样使用自定义类型
当我们使用struct或class构建自定义类型时我更希望像内建类型一样使用,不过为了实现这一步也走过许多弯路
```cpp
struct A {int a,int b};
A* ptr=(A*)malloc(sizeof(A));
ptr->a=10;
ptr->b=11;        //c风格写法

class stack{
/*member*/
};
class stack * ptr2 =new stack //c with class 其中new是构建函数不同于现在的new运算符

struct vector{        //一个朴素的想法
    double*p;
    int elem;
void vector_init(vector &v,int s){
    v.p=new double[s];
    v.elem=s;
}
vector v;
vector_init(v,5);
};
```
class和struct关键字的区别仅在于默认的访问控制符和继承时的默认控制。

尽管将数据与操作分离有一些数据处理的优势，但正如前文所说c++作为静态语言每个类型除了必要的数据还拥有可以对自身执行的操作集合。我们既然希望像内建类型一样使用自定义类这是必不可少的。由此引入的class关键字更像是不单单数据集合而是对某个具体事物的抽象。其中诞生了构造函数，至此我们可以这样声明自定义类型vector:
```cpp
class Vector {
public:
Vector(int s) :elem{new double[s]}, sz{s} { } // 构造函数
double& operator[](int i) { return elem[i]; } // 下标访问
int size() { return sz; }
private:
double∗ elem; 
int sz; s
};
Vector vec(6); //像内建类型一样使用。
```
这个和类同名的函数为构造函数，它不用声明返回类型，或者说它的返回类型就是类本身的类型。由此通过构造函数替换上诉例子中的成员函数vector_init()，与普通函数不同的是构造函数保证被用来初始化对象，也就是说想要构造类对象必须经过构造函数完成其初始化。同样的上诉```:elem{new double[s]}, sz{s} ```语法为成员初始化器列表，这样我们不用在函数体内进行初始化操作了。同时注意成员初始化器列表的初始化顺序按成员声明顺序进行，也就是说`elme`的初始化一定早于`sz`。同时这里应该引入错误处理的概念，不过为了简化，略过。

:::warning
注意:emun和emun class的区别
:::

```cpp
enum class Color { red, blue , green };
enum  Traffic_light { green, yellow, red };
int i = Color::red; // 错误不能隐式转换
Color c = 2; // 错误2不是Color类型
int b=Traffic_light::red;//可以
```
默认的枚举体enum 只能进行赋值，初始化，相等性比较操作。但用户自定义类型的可以通过重载实现更多操作。
```cpp
Traffic_light& operator++(Traffic_light& t)
{
switch (t) {
case Traffic_light::green: return t=Traffic_light::yellow;
case Traffic_light::yellow: return t=Traffic_light::red;
case Traffic_light::red: return t=Traffic_light::green;
}
}
Traffic_light light=Traffic_light::red;
Traffic_light next = ++light; // next becomes Traffic_light::green;
```
模块化，分离编译，命名空间，错误处理，异常略过。
### 不变式(Invariants)
程序运行中一直保持为真的前提条件。比如上诉原文异常标题下，使用异常捕获out_of_range。程序运行中数组的索引始终处于[0,size)范围内，或 elme始终是指向 double [size]的指针，类似这样的陈述这就是类中的不变式。不变式的概念是c++中通过构造和析构函数管理内存的基本概念。
>Often, a function has no way of completing its assigned task after an exception is thrown.Then, "handling"an exception simply means doing some minimal local cleanup and rethrowing the exception

通常函数无法完成分配任务时需要抛出异常，并且处理剩余的清理工作。异常是RAII的关键概念。

静态断言略过。