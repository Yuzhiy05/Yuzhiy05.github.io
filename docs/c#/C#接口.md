---
title: C#接口
createTime: 2025/05/23 23:07:51
permalink: /article/yemrteud/
---


### 关于CLA via C# (第四版)一些待讨论的问题
环境.net 8.0 c#12
1.原书中文版262页中有这样一段描述
>C#编译器要求将实现接口的方法(后文简称"接口方法")标记为`public`。CLR要求将将接口方法标记为`virtual`。不将方法显式标记为 `virtual`,编译器会将它们标记为`virtual`和`sealed`;

在msdn中<https://learn.microsoft.com/zh-cn/dotnet/csharp/language-reference/keywords/interface>
>从 C# 11 开始，接口可以定义 static abstract 或 static virtual 成员来声明实现类型必须提供声明的成员。
>没有实现的接口成员不能包含访问修饰符。 具有默认实现的成员可以包含任何访问修饰符。
c#的语言规范
```c#
interface_method_declaration
    : attributes? 'new'? return_type interface_method_header
    | attributes? 'new'? ref_kind ref_return_type interface_method_header
    ;

interface_method_header
    : identifier '(' parameter_list? ')' ';'
    | identifier type_parameter_list '(' parameter_list? ')'
      type_parameter_constraints_clause* ';'
    ;
```
这里根本没有声明方法是否可以用virtual修饰.


使用编译器后可以

1.Q：接口方法可以添加virtual 修饰符吗?
1.A:可以,必须提供默认实现

>从 C# 11 开始，接口可以声明除字段之外的所有成员类型的 static abstract 和 static virtual 成员
>static virtual 方法几乎完全是在泛型接口中声明的
参考


### 泛型接口可以为同接口不同类型参数的定义多个实现。
[显式接口实现](https://learn.microsoft.com/zh-cn/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation)
```c#
 public sealed class Number : IComparable<int>,IComparable<string>
 {    //实现同一接口的CompareTo多个不同类型参数
     public int Value { get; set; }
     public int CompareTo(string other)
     {
         return Convert.ToInt32(other)+Value;
     }
     public int CompareTo(int other)
     {
         return Value.CompareTo(other);
     }
 }
```

类中不可声明相同名字的属性,但是可以实现参数不同相同名称的索引器,其中索引器在被编译为IL后名字为Item

### 实现Ilist接口


### 实现IEnumerable 接口

