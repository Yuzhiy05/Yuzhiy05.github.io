


### rust 模块最佳实践


文件路径长这样
src/
 main.rs
 a.rs
 a/
 a1.rs
 
分别这么写

main.rs
```Rust
mod a;

...
```

a.rs
```Rust
pub mod a1;
```

a.rs
```Rust
pub fn somefunction()...
```

也就是说你要分几个文件夹 就写一个对应名称.rs 文件导入模块


旧写法
src/
 main.rs
 a/
 mod.rs
 a.rs
 b/
 mod.rs
 b.rs

其中mod.rs 内容为
```Rust
pub mod a;
```
 这样写旧rust 2018之前支持的写法 但这样写会每个文件夹下都存在




Q:rust 对整数溢出的行为都认为是错误?不管其是否是有符号或无符号


Q:rust 一个字符 4字节 明确表示utf-32编码吗？

A:是4字节 但不是utf32编码  编码规则和存储大小是两回事 rust无明确规定编码规则

Q:rust 无法再期待bool的语境中自动将i32类型的值转换为bool

A:

Q：Rust设计理念: 永远也不会自动创建数据的 “深拷贝”


Q:以下两种写法有什么区别?
```Rust
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> Self {
        MyBox(x)
    }
}
```
A:无

Q: rust的enum 的枚举项可以指定任意类型 是否说明enum就是一种struct？

A:

Q:有这么一个例子
```Rust
fn main(){
    let m = MyBox::new(String::from("Rust"));
    hello(&m);
}

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}
impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}
fn hello(name: &str) {
    println!("Hello, {}!", name);
}
```
这里调用hello的过程 经历的是 &MyBox<String> 被解引用强制转换加上了*变成 *(&MyBox<String>) 调用了deref 再被转换为&String
再被加上* ;*(&String) 调用deref 变成&str 符合函数调用参数?

A:

Q:关于生命周期标注,生命周期标注不修改任何引用的生命周期,仅仅是在约束传入函数或结构的引用,要求编译器检查传入参数的引用符合约束?

A:



### 语句和表达式
rust基于表达式的语言
The Rust Programming Language
>Statements are instructions that perform some action and do not return a value.
>Expressions evaluate to a resultant value. Let’s look at some examples.

语句是执行操作不返回值的'指令'
表达式计算并产生一个值

这是一个语句
```Rust
let y = 6;
```

c/c++可以这么写 rust不行(y=6是语句而不是表达式) 

```cpp
x = y = 6
```

代码块`{}` 也是个表达式

```Rust
{
    let x = 3;
    x + 1
}

#[derive(Copy, Clone)]
struct Integer {
    pub value: i32,
}

trait Add for Integer {
    fn add(&mut self, value: i32) -> i32;
}
如果 a:Integer
那么
a.add(1)
首先找 接受首个参数为 Integer 的 add 方法 这里没有
所以继续找 接受首个参数为 &Integer 的 add 方法 这里也没有
继续找 接受首个参数为 &mut Integer 的 add 方法 这里有了
调用 Add::add(&mut a, 1)

如果 a:&Integer
首先找 接受首个参数为 &Integer 的 add 方法 这里没有
继续找 接受首个参数为 &&Integer 的 add 方法 这里也没有
继续找 接受首个参数为 &mut &Integer 的 add 方法 这里也没有

自动解引用
重复上一轮查找
找到 接受首个参数为 &mut Integer 的 add 方法 
调用 Add::add(&mut *(a), 1)
```
其中`x+1` 也是表达式 注意他末尾没有分号';'  如果有他也是语句

rust可以隐式返回最后一个表达式的值作为函数返回值(不写retruen)
```Rust
fu ff(i:i32)->i32
{
   ++i
}
```

if语句也是表达式

这样写合法
```Rust
let number=if condition { 5 } else { 6 }

//这样写报错 说if表达式的求值结果类型不兼容
if condition { 5 } else { "six" }
```

rust 非Copy类型 (copy类型-其他语言算基本类型 int float bool char 能直接放在栈上的) 赋值都是默认移动转移所有权

同一时刻不可创建多个可变引用 -语言层面避免并发写入
和可变引用 与不可变引用。-避免不可变引用的值无效

引用的最后一次引用处之后失效
失效后可创建可变引用


结构更新语法和其他变量赋值一样会移动变量导致原变量失效


定义函数方法(成员函数)用. 访问
函数首个参数加上&self   即(self:&Self)

```Rust
struct Txt{
    name:String
    age:i32
}

impl Txt{
    fn New()
}
```

rust的模式匹配和 传统的cpp其他语言很不一样
模式匹配要求 表达式的的结果类型 在每个匹配都一致


有无构造函数的设计似乎和错误表示的方式有很大关系？

>不能为外部类型实现外部 trait。例如，不能在 aggregator crate 中为 Vec\<T\> 实现 Display trait

生命周期标注是为了防止悬垂引用
对于非传递引用的情景完全不需要生命周期标注?

对于函数返回值来说他就不可能返回一个函数内部变量的引用(这里不考虑堆变量,与static静态变量),函数内部创建变量的生命的周期返回引用必然造成悬垂引用
那么只有函数参数接受引用,返回值和这个参数相关联时才需要显示的生命周期标注？

>这些规则适用于 fn 定义，以及 impl 块。

>第一条规则是每一个是引用的参数都有它自己的生命周期参数。换句话说就是，有一个引用参数的函数有一个生命周期参数：fn foo<'a>(x: &'a i32)，有两个引用参数的函数有两个不同的生命周期参数，fn foo<'a, 'b>(x: &'a i32, y: &'b i32)，依此类推。

>第二条规则是如果只有一个输入生命周期参数，那么它被赋予所有输出生命周期参数：fn foo<'a>(x: &'a i32) -> &'a i32。

>第三条规则是如果方法有多个输入生命周期参数并且其中一个参数是 &self 或 &mut self，说明是个对象的方法(method)(译者注： 这里涉及 Rust 的面向对象，参见第 17 章), 那么所有输出生命周期参数被赋予 self 的生命周期


结构体中声明的引用需要生命周期标注 表明结构体变量的生命周期不能长于所引用对象,以此来保证任何有效的结构体类型变量其内部引用对象也是有效的

处理错误值
```Rust
if let Err(e) = run(config) {
        println!("Application error: {}", e);

        process::exit(1);
    }
```


Rust会根据上下文推断类型
```Rust

let v=Vec::new();

//不写这个rust编译器报错
v.push(1);

let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5);//会报错 

```
与c++一样任意两个闭包类型都不相同
并且与函数一样闭包也实现以下
三个Fn trait
FnOnce

FnMut

Fn




迭代器

into_iter 获取所有权并返回所有权

iter_mut  迭代器的可变引用

iter 不可变引用的迭代器

迭代器消费器 例如iter.sum()

迭代器适配器 例如 iter.map(fn:Fn)


## cargo

cargo build 默认dev

cargo build --release 指定release

控制优化等级
```Toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3

```

cargo doc --open
会生成当前crate的文档

只需要在代码里用三斜杠/// 写markdown注释内容
cargo文档功能能自动生成html

## Rust语法
### 函数调用中的解引用强制转换

函数调用类型和传入类型实现了如下trait时调用解引用强制转换
T: Deref<Target=U> 从 &T 到 &U

T: DerefMut<Target=U> ：从 &mut T 到 &mut U

T: Deref<Target=U> ：从 &mut T 到 &U

>当所涉及到的类型定义了 Deref trait，Rust 会分析这些类型并使用任意多次 Deref::deref 调用以获得匹配参数的类型

也就是说被多次warper包裹的类型只要实现了对应类型Deref trait,如同使用warper包裹的类型一样&T,rust就会自动调用实现的deref以匹配符合函数的参数
典型的如 &String -> $str
```Rust
fn f(&str)
{
    ...
}
let string=String::from("hello");
f(&string);
```
这里发生了解引用强制转换

和Box\<T\>->T
```Rust
fn take_str(s: &str) {
    println!("长度: {}, 内容: {}", s.len(), s);
}

fn main() {
    let boxed_string = Box::new("Hello Rust".to_);
    
    // Box<String> 自动解引用为 &str
    take_str(&boxed_string);
    // 等价于：take_str(&(*boxed_string)); // 手动解引用
}
```


### 自动解引用

在非调用方法的情景也自动解引用了
```Rust
let x=10;
let y=&x;

println!("{}",y);
```

### 实现Drop trait
类似于c++的析构函数


内存这块:堆内存 
Rust有Box 等智能指针 
没有new来创建指向堆内存的裸指针
其次是分配器  
没有直接操作堆内存指针的手段
unsafe除外,unsafe也不在rust入门的学习进度里

也就是除了堆内存之外其他需要清理的资源
如
数据库链接 
文件句柄 
http链接
系统资源:锁
之类的需要使用
Drop trait

对于锁来说 作用域使用raii管理锁很好
但是作用域限制了锁的粒度,临界区并没有代码块那么大,有时需要raii管理的情况下提前释放锁

使用
std::mem::drop 这是个 prelude 
直接调用drop(lock)即可

### 智能指针

Box\<T\> std::unqiue_ptr

Arc\<T\>  std::shared_ptr 

Rc\<T\>  引用计数不是原子的,单线程使用; 这是为什么解决rust自身语言设计不能同时存在多个可变引用的解决方案

RefCell\<T\> 单一所有者内部可变  也就是说RefCell创建出来本身不可变但是可以获取他保护对象的可变引用

因为rust的借用检查有时过于严格,有些更改是函数内部局部且微小的,这时候却需要获取对象的可变借用
Rust的规则要求可变借用和不可变借用不能同时存在,这导致仅仅是内部的一些小修改必须独占对象(不可变借用)
使用RefCell创建两个可变借用时 rust会在运行时报错panic!
borrow_mut()也可变借用一样不能同时出现两个,只不过不在编译时报错

Weak\<T\> std::weak_ptr

### 关于可访问性
结构体字段默认都是私有的,只不过在模块作用域下可见
```rust
use crate::C::A;
mod C {
    pub struct A {
        a: i32,
    }
fn f() {
    let mut c = A { a: 1 };
    c.a = 10;
}
}
fn main() {
    let mut c = A { a: 1 };//
    c.a=10; //error[E0616]: field `a` of struct `A` is private
}
```
这个

```cpp
struct A{
 private:
 int a=0;
};
int main(){
auto c=A{};
    c.a=1;//error: 'int A::a' is private within this context
}
```


### 同质容器
使用 Box<dyn Draw>实现鸭子类型

符合对象安全要求的trait才能作为 trait对象
1.返回值类型不为 Self        
2.方法没有任何泛型类型参数
也就是不能依赖任何具体对象的trait才能


## 模式匹配
模式由以下一些内容组合而成：

字面量
解构的数组、枚举、结构体或者元组
变量
通配符
占位符

语法
### match
```Rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}

```
箭头前的部分被称为模式(我之前一直以为模式算表达式之类的)

### if let
只关心一个情况的 match 语句简写
```Rust
  if let Some(color) = favorite_color {
        println!("Using your favorite color, {}, as the background", color);
    }
```
这个例子中 `Some(color)` 部分被称为模式
具体语法参考[链接](https://doc.rust-lang.org/reference/patterns.html)
里面介绍了模式多种类型

while let
从书里偷来一个例子不介绍了
```Rust

#![allow(unused)]
fn main() {
let mut stack = Vec::new();

stack.push(1);
stack.push(2);
stack.push(3);

while let Some(top) = stack.pop() {
    println!("{}", top);
}
}
```
for 
也是偷了一个例子，可以像cpp结构化绑定和c#模式匹配一样for循环解包
```Rust
let v = vec!['a', 'b', 'c'];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

```cpp
 std::vector<int> numbers{1, 3, 5, 7};
for (auto const [index, num] : std::views::enumerate(numbers))
{
    ++num; // the type is int&
    std::cout << numbers[index] << ' ';
}
```

```c#
var v = new[] { 'a', 'b', 'c' };
foreach (var (index, value) in v.Select((value, index) => (index, value)))
{
    Console.WriteLine($"{value} is at index {index}");
}
```

let 声明也使用了模式匹配
```Rust
let x = 5;

let PATTERN = EXPRESSION;

//典型的结构元组 c#也能这么写
let (x, y, z) = (1, 2, 3);
```

函数参数
依旧从书中偷了一个例子
```Rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({}, {})", x, y);
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```
js有类似写法
函数参数解构
```js
function printCoordinates({x, y}) {
    console.log(`Current location: (${x}, ${y})`);
}
printCoordinates({x: 10, y: 20});

```

