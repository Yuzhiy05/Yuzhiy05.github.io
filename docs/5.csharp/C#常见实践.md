---
title: C#常见实践
createTime: 2025/11/12 23:30:40
permalink: /article/j80chme0/
---



## 扩展方法

常见实践是在linq中向System.Collections.Generic.IEnumerable\<T\>添加方法

见MSDN内容:如何实现和调用自定义扩展方法
>1.定义包含扩展方法的静态类。 该类不能嵌套在另一个类型内，并且必须对客户端代码可见。 有关可访问性规则的详细信息，请参阅访问修饰符。
>2.将扩展方法实现为静态方法，并且使其可见性至少与所在类的可见性相同。
>3.此方法的第一个参数指定方法所操作的类型；此参数前面必须加上 this 修饰符。
>4.在调用代码中，添加 using 指令，用于指定包含扩展方法类的命名空间。
>5.将方法作为类型的实例方法调用。

```c#
using CustomExtensions;

string s = "The quick brown fox jumped over the lazy dog.";
// Call the method as if it were an
// instance method on the type. Note that the first
// parameter is not specified by the calling code.
int i = s.WordCount();
System.Console.WriteLine($"Word count of s is {i}");


namespace CustomExtensions
{
    // Extension methods must be defined in a static class.
    public static class StringExtension
    {
        // This is the extension method.
        // The first parameter takes the "this" modifier
        // and specifies the type for which the method is defined.
        public static int WordCount(this string str)
        {
            return str.Split(new char[] {' ', '.','?'}, StringSplitOptions.RemoveEmptyEntries).Length;
        }
    }
}
```
tips 重载解析首选类型本身定义的实例或静态方法，而不是扩展方法。扩展方法没有被扩展类任何私有类的访问权限



## 模式匹配的注意事项

### 声明模式
声明模式声明的变量作用域在其外部;
举个例子
```c#
a=>
{
    if(a is int val)
    {
        val=0
    }
   val=2;
}
```
这里val变量在声明处到lambda表达式结束作用域都可见
相当于
```c#
a=>
{
    int val;
    if(a is int)
    {
        val=0;
    }
    val=2;
}
```


### c#一些特性 
函数传递参数 参数传递本身是值传递的,不管引用类型还是值类型
引用类型只是传递了"引用(指针)"的副本虽然都指向同一个对象

加了ref修饰后 传递的就是引用本身了此时函数内部更换对象会影响到外部


具名参数  按任意顺序传参只要知道参数名

传不定长参数 params object[] args /params T[] args

