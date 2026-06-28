---
title: C#初始化语法
createTime: 2026/06/21 23:31:33
permalink: /article/rx2k3xa4/
---

## 集合初始化语法

MSDN[链接](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/object-and-collection-initializers#collection-initializers)

:::info 说明
MSDN说的有点水，我补充一些内容。

MSDN两个例子：
1. 集合表达式初始化
2. 集合初始化器初始化
:::

```csharp
List<int> l=[1,2,4,5,6];  //集合表达式初始化
List<int> digits = new List<int> { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }; //集合初始化器初始化
```

众所周知方法2就是下面这玩意的语法糖：

```csharp
List<int> digits=new List<int>();
digits.Add(0);
...
digits.Add(9);
```

对于类类型：

```csharp
public record class TestClass(string name, int age)
{
    public TestClass()
        : this("Default Name", 0) { }
}
```

:::info 说明
这个类用 record 和主构造函数这么定义纯粹是我不想写两个属性的 get/set 了，虽然 record class 和 class 有区别但是这个例子里没区别。
:::

在此之前介绍一个 C#9 的语法：==**目标类型化 new (target-typed new)**==

简单说就是能推导出类型的情况下可以省略 new 后面的类型：

```csharp
// var 可以左边由右边推导
var x=new int[5];

// 这里 new 可以由左边推导不写类型
List<int> x2=new(){1,2,4,5};
List<int> xs = new();
List<int> ys = new(capacity: 10_000);
```

:::tip 注意
注意以下写法：

```csharp
var t = new { "111",1 };//error 无效的匿名类

var t = new { Name="111",Id=1 };//声明匿名类

new (){...} //集合初始值设定项
new SomeClass{}//集合初始值设定

var t=new SomeClass() //对象初始化
SomeClass t = new (){ Name="111", Id=1 };//默认初始化对象并指定属性名设定属性值
```
:::

`List<TestClass>` 的初始化有以下几种写法：

```csharp
// 1. 集合表达式语法
List<TestClass> l1 =
[
    new TestClass("John", 30),
    new TestClass("Jane", 25),
    new TestClass("Bob", 40),
];

// 2. 最原始的集合初始化器
List<TestClass> l2 = new List<TestClass> {
    new TestClass("Jane", 25),
    new TestClass("hell",15),
    new TestClass()
};

// 3. new 后的目标类型可以省略
List<TestClass> l3 = new() {
    new TestClass("Jane", 25),
    new TestClass("hell",15),
    new TestClass()
};

// 4. 集合中每个元素的 new 的目标类型也能省略 - 继续省略
List<TestClass> l4 = new() {
    new("Jane", 25),
    new("hell",15),
    new()
};

var l8=new List<TestClass> {
    new ("Jane", 25),
    new ("hell",15),
    new ()
};

// 5. 如果目标设有属性可以使用属性设置语法而不是构造函数
List<TestClass> l6 = [
    new TestClass{ },
    new (){ name="Jane",age=25 },
    new TestClass{ name="Jane",age=25 }
];

// 6. 错误示例 l7 的三种写法都是语法错误
List<TestClass> l7 = 
[
    {name="Alice",age=35},
    { "111",1 }
    new {"Alice",35}
];
```

### 字典类型初始化

:::info 说明
==Dictionary 类型有点特别，他虽然是 IEnumerable 但是没法用[集合表达式](https://learn.microsoft.com/zh-cn/dotnet/csharp/programming-guide/classes-and-structs/how-to-initialize-a-dictionary-with-a-collection-initializer)==。
:::

参考[链接](https://learn.microsoft.com/zh-cn/dotnet/csharp/programming-guide/classes-and-structs/how-to-initialize-a-dictionary-with-a-collection-initializer)

```csharp
// 传统办法
var moreNumbers = new Dictionary<int,string>
{
    { 19, "1111" },
    { 23, "twenty-three" },
    { 42, "forty-two" }
};

// 使用索引
Dictionary<string, int> dict1 = new()
{
    ["Alice"] = 35,
    ["Bob"] = 40,
    ["Charlie"] = 20,
};

// 元组数组转字典
var tup =new (string, int)[]
{
    ("Alice", 35),
    ("Bob", 40),
    ("Charlie", 20)
}.ToDictionary(t => t.Item1, t => t.Item2);
```

:::info 说明
本质是 `[]` 使用集合表达要求类型需要单参数 `Add(T)` 的重载。
:::

```csharp
List<TestClass> l1 =
[
    new TestClass("John", 30),
    new TestClass("Jane", 25),
    new TestClass("Bob", 40),
];

// 上面这段代码反编译出来就是这个
int num = 3;
List<TestClass> list = new List<TestClass>(num);
CollectionsMarshal.SetCount(list, num);
Span<TestClass> span = CollectionsMarshal.AsSpan(list);
span[0] = new TestClass("John", 30);
span[1] = new TestClass("Jane", 25);
span[2] = new TestClass("Bob", 40);
List<TestClass> l1 = list;
```

### 分布元素

:::info 说明
不多讲，来自 MSDN 的例子，类似 JS 的展开语法。
:::

能展开：

```csharp
List<Cat> allCats = [.. cats, .. moreCats];

List<Cat> additionalCats = [.. cats, new Cat { Name = "Furrytail", Age = 5 }, .. moreCats];

List<TestClass> l1 = new()
{
    new ("John", 30),
    new ("Jane", 25),
    new ("Bob", 40),
};

// 使用分布元素将 l1 中的元素添加到 l2 中
List<TestClass> l2 =
[
    new("first", 0),
    .. l1, //分布元素语法
    new("last", 20),
];
```

### 所有初始化类型的语法

```csharp
public record class Preson(int Id,string name)
{

}

public struct Person2
{
    public required int Id { get; set; } = default(int);
    public required string? Name { get; set; } = default(string);
}

public class SampleWithCollection
{
    // 支持属性集合初始化器（只要是可添加的集合并已被实例化）
    public List<string> Names { get; } = new();
}

public static class ObjectInitSamples
{
    public static void Run()
    {
        // 1. 位置构造
        var a = new Preson(1, "loka");

        // 2. 目标类型化 new（变量有明确类型时省略类型名）
        Preson b = new(2, "bob");

        // 3. 对象初始化器
        var c = new Preson2 { Name = "loka", Id = 1 };

        // 4. with 表达式（records / record struct）
        var d = a with { Name = "alice" }; // 仅对 record/record struct 有效

        // 5. 集合初始化器
        var list = new List<int> { 1, 2, 3 };

        // 6. 字典索引初始化器
        var dict = new Dictionary<string, int> { ["x"] = 10, ["y"] = 20 };

        // 7. 数组初始化器
        int[] arr = { 1, 2, 3 };

        // 8. 属性集合的嵌套初始化器
        var s = new SampleWithCollection { Names = { "loka", "emi" } };

        // 9. 值类型零初始化 / default
        Preson2 zero1 = new();           // struct 零初始化
        var zero2 = default(Preson2);    // 等同效果

        // 10. 反射创建（运行时）
        var viaActivator = Activator.CreateInstance(typeof(Preson), new object[] { 3, "act" }) as Preson;

        // 输出示例
        Console.WriteLine(a);
        Console.WriteLine(b);
        Console.WriteLine(c);
        Console.WriteLine(d);
        Console.WriteLine(string.Join(",", list));
        Console.WriteLine(dict["x"]);
        Console.WriteLine(string.Join(",", arr));
        Console.WriteLine(string.Join(",", s.Names));
        Console.WriteLine(zero1);
        Console.WriteLine(viaActivator);
    }
}
```
