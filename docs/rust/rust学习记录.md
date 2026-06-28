---
title: rust学习记录
createTime: 2026/06/21 23:31:33
permalink: /article/hgmwfx9h/
---

## rust 模块最佳实践

文件路径长这样：

```
src/
  main.rs
  a.rs
  a/
    a1.rs
```

分别这么写：

**main.rs**

```rust
mod a;
...
```

**a.rs**

```rust
pub mod a1;
```

**a1.rs**

```rust
pub fn somefunction()...
```

:::info 说明
你要分几个文件夹，就写一个对应名称 `.rs` 文件导入模块。
:::

### 旧写法

```
src/
  main.rs
  a/
    mod.rs
    a.rs
  b/
    mod.rs
    b.rs
```

其中 `mod.rs` 内容为：

```rust
pub mod a;
```

:::warning 注意
这是旧rust 2018之前支持的写法，但这样写会每个文件夹下都存在。
:::

## 常见问题

### Q: rust 对整数溢出的行为都认为是错误？

> 问题：rust 对整数溢出的行为都认为是错误?不管其是否是有符号或无符号

### Q: rust 一个字符 4 字节，明确表示 utf-32 编码吗？

> 问题：rust 一个字符 4字节 明确表示utf-32编码吗？

**A**: 是4字节，但不是utf32编码。编码规则和存储大小是两回事，rust无明确规定编码规则。

### Q: rust 无法在期待 bool 的语境中自动将 i32 转换为 bool

> 问题：rust 无法再期待bool的语境中自动将i32类型的值转换为bool

### Q: Rust 设计理念：永远不会自动创建数据的"深拷贝"

### Q: 两种 MyBox 写法有什么区别？

```rust
// 写法1
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

// 写法2
struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> Self {
        MyBox(x)
    }
}
```

**A**: 无区别。

### Q: rust 的 enum 枚举项可以指定任意类型，是否说明 enum 就是一种 struct？

### Q: Deref 强制转换过程

```rust
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

> 问题：这里调用hello的过程 经历的是 `&MyBox<String>` 被解引用强制转换加上了*变成 `*(&MyBox<String>)` 调用了deref 再被转换为`&String`，再被加上* `*(&String)` 调用deref 变成`&str` 符合函数调用参数?

### Q: 关于生命周期标注

> 问题：生命周期标注不修改任何引用的生命周期，仅仅是在约束传入函数或结构的引用，要求编译器检查传入参数的引用符合约束?

## 语句和表达式

==rust基于表达式的语言==。

> Statements are instructions that perform some action and do not return a value.
> Expressions evaluate to a resultant value. Let's look at some examples.

- **语句**：执行操作不返回值的'指令'
- **表达式**：计算并产生一个值

这是一个语句：

```rust
let y = 6;
```

:::warning 注意
c/c++可以这么写 rust不行（y=6是语句而不是表达式）：

```cpp
x = y = 6
```
:::

代码块`{}` 也是个表达式：

```rust
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
```

:::info 方法查找规则
如果 `a:Integer`，那么 `a.add(1)` 的查找过程：

1. 首先找接受首个参数为 Integer 的 add 方法 → 没有
2. 继续找接受首个参数为 &Integer 的 add 方法 → 没有
3. 继续找接受首个参数为 &mut Integer 的 add 方法 → 找到
4. 调用 `Add::add(&mut a, 1)`

如果 `a:&Integer`：

1. 首先找接受首个参数为 &Integer 的 add 方法 → 没有
2. 继续找接受首个参数为 &&Integer 的 add 方法 → 没有
3. 继续找接受首个参数为 &mut &Integer 的 add 方法 → 没有
4. **自动解引用**：重复上一轮查找
5. 找到接受首个参数为 &mut Integer 的 add 方法
6. 调用 `Add::add(&mut *(a), 1)`
:::

其中 `x+1` 也是表达式，注意他末尾没有分号 `';'`，如果有他也是语句。

rust可以隐式返回最后一个表达式的值作为函数返回值（不写return）：

```rust
fn ff(i:i32)->i32 {
   ++i
}
```

if语句也是表达式，这样写合法：

```rust
let number = if condition { 5 } else { 6 };

// 这样写报错：if表达式的求值结果类型不兼容
if condition { 5 } else { "six" }
```

## 所有权与借用

- ==rust 非Copy类型赋值都是默认移动转移所有权==
- ==同一时刻不可创建多个可变引用== - 语言层面避免并发写入
- ==可变引用与不可变引用不能同时存在== - 避免不可变引用的值无效
- 引用的最后一次引用处之后失效，失效后可创建可变引用
- 结构更新语法和其他变量赋值一样会移动变量导致原变量失效

## 方法定义

定义函数方法（成员函数）用 `.` 访问，函数首个参数加上 `&self`（即 `self:&Self`）：

```rust
struct Txt {
    name: String,
    age: i32,
}

impl Txt {
    fn new() {}
}
```

rust的模式匹配和传统的cpp其他语言很不一样，模式匹配要求表达式的的结果类型在每个匹配都一致。

## 生命周期

:::info 孤儿规则
==不能为外部类型实现外部 trait==。例如，不能在 aggregator crate 中为 `Vec<T>` 实现 Display trait。
:::

生命周期标注是为了防止悬垂引用。对于非传递引用的情景完全不需要生命周期标注。

对于函数返回值来说，它不可能返回一个函数内部变量的引用（这里不考虑堆变量与static静态变量），函数内部创建变量的生命周期返回引用必然造成悬垂引用。那么只有函数参数接受引用，返回值和这个参数相关联时才需要显示的生命周期标注。

> 这些规则适用于 fn 定义，以及 impl 块。

> 第一条规则是每一个是引用的参数都有它自己的生命周期参数。换句话说就是，有一个引用参数的函数有一个生命周期参数：`fn foo<'a>(x: &'a i32)`，有两个引用参数的函数有两个不同的生命周期参数，`fn foo<'a, 'b>(x: &'a i32, y: &'b i32)`，依此类推。

> 第二条规则是如果只有一个输入生命周期参数，那么它被赋予所有输出生命周期参数：`fn foo<'a>(x: &'a i32) -> &'a i32`。

> 第三条规则是如果方法有多个输入生命周期参数并且其中一个参数是 `&self` 或 `&mut self`，说明是个对象的方法(method)，那么所有输出生命周期参数被赋予 self 的生命周期。

:::warning 重要
==结构体中声明的引用需要生命周期标注==，表明结构体变量的生命周期不能长于所引用对象，以此来保证任何有效的结构体类型变量其内部引用对象也是有效的。
:::

### 处理错误值

```rust
if let Err(e) = run(config) {
    println!("Application error: {}", e);
    process::exit(1);
}
```

## 类型推断

Rust会根据上下文推断类型：

```rust
let v = Vec::new();

// 不写这个rust编译器报错
v.push(1);

let example_closure = |x| x;

let s = example_closure(String::from("hello"));
let n = example_closure(5); // 会报错
```

与c++一样任意两个闭包类型都不相同，并且与函数一样闭包也实现以下三个Fn trait：

| Trait | 说明 |
|-------|------|
| `FnOnce` | 获取所有权 |
| `FnMut` | 可变借用 |
| `Fn` | 不可变借用 |

## 迭代器

| 方法 | 说明 |
|------|------|
| `into_iter` | 获取所有权并返回所有权 |
| `iter_mut` | 迭代器的可变引用 |
| `iter` | 不可变引用的迭代器 |

- **迭代器消费器**：例如 `iter.sum()`
- **迭代器适配器**：例如 `iter.map(fn:Fn)`

## cargo

```bash
cargo build          # 默认dev
cargo build --release # 指定release
```

控制优化等级：

```toml
[profile.dev]
opt-level = 0

[profile.release]
opt-level = 3
```

```bash
cargo doc --open
```

会生成当前crate的文档，只需要在代码里用三斜杠 `///` 写markdown注释内容，cargo文档功能能自动生成html。

## Rust语法

rust的引用就是指针。

### 函数调用中的解引用强制转换

函数调用类型和传入类型实现了如下trait时调用解引用强制转换：

| Trait | 转换 |
|-------|------|
| `T: Deref<Target=U>` | 从 &T 到 &U |
| `T: DerefMut<Target=U>` | 从 &mut T 到 &mut U |
| `T: Deref<Target=U>` | 从 &mut T 到 &U |

> 当所涉及到的类型定义了 Deref trait，Rust 会分析这些类型并使用任意多次 `Deref::deref` 调用以获得匹配参数的类型。

也就是说被多次warper包裹的类型只要实现了对应类型Deref trait，如同使用warper包裹的类型一样 `&T`，rust就会自动调用实现的deref以匹配符合函数的参数。典型的如 `&String -> &str`：

```rust
fn f(&str) {
    ...
}
let string = String::from("hello");
f(&string);
```

这里发生了解引用强制转换。

和 `Box<T> -> T`：

```rust
fn take_str(s: &str) {
    println!("长度: {}, 内容: {}", s.len(), s);
}

fn main() {
    let boxed_string = Box::new("Hello Rust".to_string());

    // Box<String> 自动解引用为 &str
    take_str(&boxed_string);
    // 等价于：take_str(&(*boxed_string)); // 手动解引用
}
```

### 自动解引用

在非调用方法的情景也自动解引用了：

```rust
let x = 10;
let y = &x;

println!("{}", y);
```

### 实现Drop trait

类似于c++的析构函数。

内存这块：堆内存，Rust有Box等智能指针，没有new来创建指向堆内存的裸指针。其次是分配器，没有直接操作堆内存指针的手段（unsafe除外，unsafe也不在rust入门的学习进度里）。

也就是除了堆内存之外其他需要清理的资源，如：

- 数据库链接
- 文件句柄
- http链接
- 系统资源：锁

之类的需要使用Drop trait。

:::info RAII 与锁
对于锁来说，作用域使用raii管理锁很好。但是作用域限制了锁的粒度，临界区并没有代码块那么大，有时需要raii管理的情况下提前释放锁。

使用 `std::mem::drop`（这是个 prelude），直接调用 `drop(lock)` 即可。
:::

### 智能指针

| 类型 | C++ 对应 | 说明 |
|------|----------|------|
| `Box<T>` | `std::unique_ptr` | 独占所有权 |
| `Arc<T>` | `std::shared_ptr` | 原子引用计数，线程安全 |
| `Rc<T>` | - | 引用计数不是原子的，单线程使用 |
| `RefCell<T>` | - | 单一所有者内部可变 |
| `Weak<T>` | `std::weak_ptr` | 弱引用 |

:::warning RefCell 使用注意
因为rust的借用检查有时过于严格，有些更改是函数内部局部且微小的，这时候却需要获取对象的可变借用。Rust的规则要求可变借用和不可变借用不能同时存在，这导致仅仅是内部的一些小修改必须独占对象（不可变借用）。

==使用RefCell创建两个可变借用时rust会在运行时报错panic!== `borrow_mut()` 也可变借用一样不能同时出现两个，只不过不在编译时报错。
:::

### 关于可访问性

结构体字段默认都是私有的，只不过在模块作用域下可见：

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
    let mut c = A { a: 1 };
    c.a = 10; // error[E0616]: field `a` of struct `A` is private
}
```

对比c++：

```cpp
struct A {
 private:
    int a = 0;
};
int main() {
    auto c = A{};
    c.a = 1; // error: 'int A::a' is private within this context
}
```

### 同质容器

使用 `Box<dyn Draw>` 实现鸭子类型。

:::info trait 对象要求
符合对象安全要求的trait才能作为 trait对象：

1. 返回值类型不为 Self
2. 方法没有任何泛型类型参数

也就是不能依赖任何具体对象的trait才能。
:::

## 模式匹配

模式由以下一些内容组合而成：

- 字面量
- 解构的数组、枚举、结构体或者元组
- 变量
- 通配符
- 占位符

### match

```rust
match VALUE {
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
    PATTERN => EXPRESSION,
}
```

箭头前的部分被称为模式（我之前一直以为模式算表达式之类的）。

### if let

只关心一个情况的 match 语句简写：

```rust
if let Some(color) = favorite_color {
    println!("Using your favorite color, {}, as the background", color);
}
```

这个例子中 `Some(color)` 部分被称为模式。具体语法参考[链接](https://doc.rust-lang.org/reference/patterns.html)，里面介绍了模式多种类型。

### while let

从书里偷来一个例子不介绍了：

```rust
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

### for

也是偷了一个例子，可以像cpp结构化绑定和c#模式匹配一样for循环解包：

```rust
let v = vec!['a', 'b', 'c'];

for (index, value) in v.iter().enumerate() {
    println!("{} is at index {}", value, index);
}
```

对比c++：

```cpp
std::vector<int> numbers{1, 3, 5, 7};
for (auto const [index, num] : std::views::enumerate(numbers))
{
    ++num;
    std::cout << numbers[index] << ' ';
}
```

对比c#：

```c#
var v = new[] { 'a', 'b', 'c' };
foreach (var (index, value) in v.Select((value, index) => (index, value)))
{
    Console.WriteLine($"{value} is at index {index}");
}
```

### let 声明

let 声明也使用了模式匹配：

```rust
let x = 5;

let PATTERN = EXPRESSION;

// 典型的结构元组 c#也能这么写
let (x, y, z) = (1, 2, 3);
```

### 函数参数

依旧从书中偷了一个例子：

```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("Current location: ({}, {})", x, y);
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```

js有类似写法（函数参数解构）：

```js
function printCoordinates({x, y}) {
    console.log(`Current location: (${x}, ${y})`);
}
printCoordinates({x: 10, y: 20});
```

## rust的类型介绍

### 切片类型和DST（动态大小类型）

`&str` 和 `&[T]`

### 元组结构体

结构体内部字段都是无名的：

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
}
```

### 其他类型

- **无字段的unit类型**：`struct A;` 等价于 `()`
- **never type**：`!` 不返回任何类型

### 枚举enum

```rust
enum Status {
    Value(u32),
    Stop,
}

let list_of_statuses: Vec<Status> =
    (0u32..20)
    .map(Status::Value)
    .collect();
```

## 实现一些常见trait

### 关联类型

## 运算符重载

## 自定义迭代器

## 孤儿原则：为外部类型实现外部trait

为类型实现trait需要类型或trait其一定义在当前crate内，想要为外部类型实现外部trait怎么办呢？例如我需要扩展Vec的功能，为其实现Display。

:::info 解决方案
这就需要 `Wrapper` 包装类型，你不需要为Vec实现 `fmt::Display`，而是为 `struct VecWrapper(Vec<String>)` 实现该trait。

此时包装类型如果希望拥有内部被代理类型的全部功能需要通过实现 `Deref` trait，在调用时返回内部类型。
:::

### 其他trait

- **Sized trait**
- **?Sized trait**
- **Fn trait** 闭包类型

:::tip 函数指针
`fn` 函数指针这是一个类型不是一个trait，这个类型本身实现了 `Fn`、`FnMut` 和 `FnOnce` 三个trait。
:::

一个特殊例子：

```rust
enum Status {
    Value(u32),
    Stop,
}

let list_of_statuses: Vec<Status> =
    (0u32..20)
    .map(Status::Value)
    .collect();
```

## 调用同名方法

## 其他特性

### 类型别名

类似于c++的 `typedef` 和 `using` 别名：

```rust
type Kilometers = i32;

let x: i32 = 5;
let y: Kilometers = 5;
println!("x + y = {}", x + y);
```

## 宏

### 声明宏

其匹配类似于正则表达式匹配，典型例子 `vec!`：

```rust
#![allow(unused)]

#[macro_export]
macro_rules! vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}
```

:::info 宏模式解析
` ( $( $x:expr ),* )` 一整个这个玩意相当于模式匹配中的模式。

从外向内看：

| 语法 | 说明 |
|------|------|
| `(...)` | 最外部的大括号可以换成任意的方括号 `[]`、花括号 `{}`，主要是包裹内部的模式 |
| `$(...)` | 相当于正则表达式中的非捕获分组 |
| `$( ... )*` | 重复捕获 |
| `$( ... )+` | 一次或多次 |
| `$( ... )?` | 零次或一次 |
| `,` | 表示 `$( $x:expr )` 这个模式匹配上后可以出现逗号 |
| `$x:expr` | 表示任何rust类型表达式 |

合起来的意思就是这个模式可以匹配多个带逗号的rust表达式。
:::

```rust
let v = vec![1, 3, 4];
```

这里Rust不在乎括号使用方括号只是更像创建集合。其次 `1,3,4` 和 `$( $x:expr ),*` 匹配上了，其中 `1,3,4` 分别和 `$(temp_vec.push($x);)*` 匹配了3次展开生成了三次 `temp_vec.push` 调用。

最后宏展开结果如下：

```rust
let mut temp_vec = Vec::new();
temp_vec.push(1);
temp_vec.push(2);
temp_vec.push(3);
temp_vec
```

### 过程宏

是接收一个或 `TokenStream` 返回一个 `TokenStream` 的过程。一般有几个用途：

#### 1. derive宏

只能用于结构体和枚举，例如 `#[derive(Debug, Clone, Serialize)]` 为类型实现特定trait，因为这些trait对大多数类型写法都差不多。

```rust
// 没有derive宏，你需要手写：
struct Pancakes;
impl HelloMacro for Pancakes {
    fn hello_macro() {
        println!("Hello, Macro! My name is Pancakes!");
    }
}

// 有了derive宏，只需：
#[derive(HelloMacro)]
struct Pancakes;
// 编译器自动生成上面的impl代码
```

#### 2. 类属性宏

同样是接受任意token流，返回token流，可作用于结构体、枚举和函数。典型例子就是日志。

你写如下代码：

```rust
#[log_call]
fn process_data(data: Vec<u8>) -> Result<(), Error> {
    println!("处理数据...");
    Ok(())
}
```

宏展开成如下代码（编译器实际看到的）：

```rust
fn process_data(data: Vec<u8>) -> Result<(), Error> {
    // 宏自动添加的：记录开始
    println!("[LOG] 调用 process_data, 参数长度: {}", data.len());
    let start = std::time::Instant::now();

    // 你的原始代码
    let result = (|| {
        println!("处理数据...");
        Ok(())
    })();

    // 宏自动添加的：记录结束
    let duration = start.elapsed();
    println!("[LOG] process_data 执行耗时: {:?}", duration);

    result
}
```

这些重复代码都由宏自动生成。

#### 3. 类函数宏

接受任意token，类似函数调用。例子：

```rust
let sql = sql!(SELECT * FROM posts WHERE id=1);
```

像这样的sql语句(DSL)需要解析特定领域语言的用这个宏。

:::info 说明
知道一下有这个东西就好，大部分情况都不需要你写，起码我没到这个程度。
:::
