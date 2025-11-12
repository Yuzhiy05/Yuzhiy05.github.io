---
title: c#数据类型
createTime: 2025/01/04 21:54:15
permalink: /article/tlw73yi4/
---



1.简单介绍常见的C#应用到的数据类型

Datatable

命名空间:
System.Data

Datatable是个抽象上的二维表

构造函数
DataTable()	
在不使用参数的情况下初始化 DataTable 类的新实例。

DataTable(String)	
使用指定的表名初始化 DataTable 类的新实例。

DataTable(String, String)	
使用指定的表名和命名空间初始化 DataTable 类的新实例。

存在一个过时的构造函数不予展示


常用属性

CaseSensitive	
指示表中的字符串比较是否区分大小写。

ChildRelations	
获取此 DataTable 的子关系的集合。

Columns	
获取属于该表的列的集合。

Constraints	
获取由该表维护的约束的集合。

Container	
获取组件的容器。
(继承自 MarshalByValueComponent)


DataSet	
获取此表所属的 DataSet。

DefaultView	
获取可能包含筛选视图或游标位置的表的自定义视图。


HasErrors	
获取一个值，该值指示该表所属的 DataSet 的任何表的任何行中是否有错误。



MinimumCapacity	
获取或设置该表最初的起始大小。


Rows	
获取属于该表的行的集合。

Site	
获取或设置 ISite 的 DataTable。

TableName	
获取或设置 DataTable 的名称。

不常用的属性:（折叠）
DesignMode	
获取指示组件当前是否处于设计模式的值。
(继承自 MarshalByValueComponent)

DisplayExpression	
获取或设置一个表达式，该表达式返回的值用于在用户界面中表示此表。 DisplayExpression 属性用于在用户界面中显示此表名。

Events	
获取附加到该组件的事件处理程序的列表。(继承自 MarshalByValueComponent)

ExtendedProperties	
获取自定义用户信息的集合。

IsInitialized	
获取一个值，该值指示是否已初始化 DataTable。

Locale	
获取或设置用于比较表中字符串的区域设置信息。

Namespace	
获取或设置 DataTable 中所存储数据的 XML 表示形式的命名空间。

ParentRelations	
获取该 DataTable 的父关系的集合。

Prefix	
获取或设置 DataTable 中所存储数据的 XML 表示形式的命名空间。

PrimaryKey	
获取或设置用作数据表主键的列数组。

RemotingFormat	
获取或设置序列化格式。

常见方法

BeginInit()	
开始初始化在窗体上使用或由另一个组件使用的 DataTable。 初始化发生在运行时。

Clear()	
清除所有数据的 DataTable。

Clone()	
克隆 DataTable 的结构，包括所有 DataTable 架构和约束。

EndInit()	
结束在窗体上使用或由另一个组件使用的 DataTable 的初始化。 初始化发生在运行时。

ImportRow(DataRow)	
将 DataRow 复制到 DataTable 中，保留任何属性设置以及初始值和当前值。

Merge(DataTable)	
将指定的 DataTable 与当前 DataTable 合并。

Merge(DataTable, Boolean)	
将指定的 DataTable 与当前 DataTable 合并，指示是否保留当前 DataTable 中的更改。

Merge(DataTable, Boolean, MissingSchemaAction)	
将指定的 DataTable 与当前 DataTable 合并，指示是否保留更改以及如何处理当前 DataTable 中缺失的架构

NewRow()	
创建与该表具有相同架构的新 DataRow。

Select()	
获取由所有 DataRow 对象组成的数组。

Select(String)	
获取由与筛选条件匹配的所有 DataRow 对象组成的数组。

Select(String, String)	
以指定排序顺序，获取由与筛选条件匹配的所有 DataRow 对象组成的数组。

Select(String, String, DataViewRowState)	
以与指定状态匹配的排序顺序，获取由与筛选条件匹配的所有 DataRow 对象组成的数组。

示例

```c#
var dt=new DataTable("table1");
var dt2=new DataTable();

var dc =new DataColum();
dt.Columns.Add(dc);
//
dt.Columns.Add("column1",System.Type.GetType("System.string"));
dt.Columns.Add("column2",typeof(String))

var dc2=new DataColumn("column2",typeof(String));
dt.Colums.Add(dc2);

//添加行
//与创建列不同的是，必须使用NewRow创建新建行
var dr=dt.NewRow()
dr["columns1"]="1";
dr[0]="2";
dt.Rows.Add(dr);
//传入值数组添加行
dt.Rows.Add(new Object[] {1, "Smith"});

//使用索引或列名
dt.Rows[0][0]="3";
dt.Rows[0]["column"]="4";
//获取值
var str=dt.Row[0][0].ToString();

//筛选行
//使用Select方法
var drs=dt.Select("column ='4'");
var drs=dt.Select("column is null");
var drs=dt.Select("column like 'yu%'","column desc");
var drs=dt.Select("column ='A' and column ='B'");
//其中的提供筛选的字符串只能含有 列名 与值 和一些关系表达式 > ,< ,=,<> ...
//可以提供一个删选表达式可以有多个筛选条件需要由 and or 连接，也可以简单的排序
//打印数据
private static void PrintRows(DataRow[] rows, string label)
{
    Console.WriteLine("\n{0}", label);
    if(rows.Length <= 0)
    {
        Console.WriteLine("no rows found");
        return;
    }
    foreach(DataRow row in rows)
    {
        foreach(DataColumn column in row.Table.Columns)
        {
            Console.Write("\table {0}", row[column]);
        }
        Console.WriteLine();
    }
}
//删除行
dt.Rows.Remove(dt.Rows[0]);
dt.Rows.RomoveAt(0);//根据行索引删除
//
dt.Rows[0].Delete();
dt.AcceptChanges();
//Remove与RemoveAt 方法都是直接删除
//但Delete方法只是把此行标记为deleted,使用RejectChanges()方法回滚之前的操作
//批量删除时应逆序使用使用索引逆序删除，而不该用foreach，因为删除时索引会发生变化
for(int i=dt.Rows.Count-1,i>=0;i++){
    dt.Rows.RemoveAt(i);
}

//复制表
var dt_new=new DataTable();
dt_new=dt.Copy();
//复制数据与表结构
dt_new.ImportRow(dt.Rows[0]);//将某一行加入到行末尾
//排序
//表排序必须先转换为DataView
DataView dv=dt.DefaultView;
dv.Sort="column DESC,column ASC";
dv.ToTable();
```

DataView
DataView 的主要功能是允许在 Windows 窗体和 Web 窗体上绑定数据。
 DataView 不存储数据，而是表示其相应 DataTable的连接视图。 对 DataView数据的更改会影响 DataTable。 对 DataTable数据所做的更改将影响与之关联的所有 DataView。

属性:
Sort
包含列名后跟`ASC`(升)或`DESC`(降序)的字符串。 默认情况下，列按升序排序。 多个列可以用逗号分隔

LINQ 操作DataTable

DataTable 存在扩展方法的静态类DataTableExtensions 用于linq查询
```c#
AsDataView(DataTable)	
创建并返回支持 LINQ 的 DataView 对象。

AsDataView<T>(EnumerableRowCollection<T>)	
创建并返回一个支持 DataView LINQ 的对象，该对象表示 LINQ to DataSet 查询。

AsEnumerable(DataTable)	
返回一个 IEnumerable<T> 对象，其泛型参数 T 为 DataRow。 此对象可用于 LINQ 表达式或方法查询。

CopyToDataTable<T>(IEnumerable<T>)

//
public static System.Data.EnumerableRowCollection<System.Data.DataRow> AsEnumerable (this System.Data.DataTable source);
```

扩展方法包含在静态类中不需要实例化，首个参数使用this指针，使我们可以使用实例化的对象直接调用静态方法而不是写成`DataTableExtensions.AsEnumerable(table)`.
table.AsAsEnumerable()将DataTable转换位对应的可枚举器 永久绑定，多次调用生成多个永久绑定的可查询对象

```c#
var group = table.AsEnumerable()
                               .GroupBy(row => row.Field<decimal>("Price") > 500 ? "High" : "Low")
                               .Select(group => new 
                               { 
                                   Range = group.Key, 
                                   Count = group.Count() 
                               });

 var sum = table.AsEnumerable().Sum(row => row.Field<decimal>("Price"));

  var query = table.AsEnumerable()
                  .Where(row => row.Field<decimal>("Price") > 50)
                  .OrderBy(row => row.Field<decimal>("Price"));

   var selectedColumns = table.AsEnumerable()
               .Select(row => new
               {
                   ProductName = row.Field<string>("ProductName"),
                   Price = row.Field<decimal>("Price")
               });               
```

## string 字符串类型

 C#的String被视为基元类型,直接使用字面值构造
 但是CLR via c#与微软的copilt ai都和编译器有一些出入
 在书中这段代码是会报错的
 ```c#
 String str2 = new String("hi aaaa.");
 ```
 书中直接声明
 >C#不允许使用new操作符从字面值字符串构造String对象
 但在编译器上试了下是可行的，并且并没有提示
 我在godbolt上使用.net6 coro指定了/langversion:6 c#6标准发现也是可行了。
 Ai说.net8 为String添加了String(string)构造器。我查了一下msdn根本没有。哎ai也喜欢扯淡

 不过差不多可以确定这句可以允许是因为这个构造器,不过这个构造器.net Core 2.1就加了;godbolt也没有也就没法验证了。我到时候找一下CLR via c#(第四版)这本书的c#标准?
 ```C#
 public String (ReadOnlySpan<char> value);
 ```

 第二问题
 字面量使用+ 操作符相连时是在编译期进行的。对非字面量字符串相加实在编译期进行的。这需要在堆上创建存储

 3.使用逐子字符串包含转义符号时
 一个例子说明
 ```c#
stirng filePath="C:\\Windos\\System32\\xxx";
stirng filePath2=@"C:\Windos\System32\xxx";
 ```
 这两结果一样

 4.忽略语言文化的字符串比较
 需要在使用Compare函数添加StringComparison参数 Ordinal,OrdinalIgnoreCase。
 加了这个比较有多快我要测一下?
 书中有个notice
 要我们在进行字符串比较前提升字符串大小写(ToUpperInvariant/ToLowerInvariant)
 书中说微软对大写字符串比较的代码进行的优化,且进行没有区分大小写的比较时FCL(.net类库)会自动转换成大写。且ToUpper对语言文化敏感(这里的说法还没验证)

5.语言文化的字符串比较CompareInfo,暂时不用也不想看

6.StringCompare进行比较:大量不同字符串反复执行同一比较

## 字符串留用
程序中多个相同字符串引用同一个对象
```c#
string str = "Hello";
string str2= "Hello";

Console.WriteLine($"str == str2: {str == str2}"); //true
Console.WriteLine(Object.ReferenceEquals(str, str2)); //按道理是false，但是在.net8上跑是true 被留用了

str=String.Intern(str); // 显式留用
str2=String.Intern(str2); // 显式留用
Console.WriteLine(Object.ReferenceEquals(str, str2)); // True
```

## stringInfro 不想看




### 格式修饰符符说明
数值类型常用格式说明符
| 说明符 | 含义         | 示例输出（1234.56） |
| ------ | ------------ | ------------------- |
| C/c    | 货币         | ￥1,234.56           |
| D/d    | 十进制整数   | 1235                |
| E/e    | 科学计数法   | 1.234560E+003       |
| F/f    | 定点         | 1234.56             |
| G/g    | 常规         | 1234.56             |
| N/n    | 数字         | 1,234.56            |
| P/p    | 百分比       | 123,456.00 %        |
| X/x    | 十六进制整数 | 4D2                 |
| B/b    | 二进制数     | 超了                |
| R/r    | 往返历程     | 还没测              |
注意：D 和 X 只适用于整数类型。
日期和时间类型常用格式说明符
| 说明符 | 含义           | 示例输出               |
| ------ | -------------- | ---------------------- |
| d      | 短日期         | 2025/5/29              |
| D      | 长日期         | 2025年5月29日          |
| t      | 短时间         | 14:30                  |
| T      | 长时间         | 14:30:15               |
| f      | 完整日期短时间 | 2025年5月29日 14:30    |
| F      | 完整日期长时间 | 2025年5月29日 14:30:15 |
| g      | 常规短日期时间 | 2025/5/29 14:30        |
| G      | 常规长日期时间 | 2025/5/29 14:30:15     |

## 格式字符串
```c#
{参数位置,对其:格式修饰符|精度}
//例如 首个参数,打印时10个字符对齐,打印货币类型,保留两位小数
{0,10:C2}
//这玩意打印出来是 
// ¥123.000
//注意¥前还有一个空格用于对齐。¥123.000有8个字符,按要求左对齐9个字符,不够就用空格补充。
var str=string.Format("{0,9:C3}", 123);
Console.WriteLine(str);
//抄的msdn例子
decimal[] amounts = { 16305.32m, 18794.16m };
Console.WriteLine("   Beginning Balance           Ending Balance");
Console.WriteLine("   {0,-28:C2}{1,14:C2}", amounts[0], amounts[1]);
// Displays:
//        Beginning Balance           Ending Balance
//        $16,305.32                      $18,794.16
```

:::tip
```c#
var sb=new StringBuilder("AAA");
 Console.WriteLine($"StringBuilder: {sb}");
 sb.Length = 0; // 这里能清掉sb的对象的内容
 Console.WriteLine($"StringBuilder after clearing: {sb}");
 ```
::: 


## 元组
c# 因为设计缺陷
存在两个元组
值元组(值类型) System.valueTuple   其中成员的都是字段  元素可变
元组(引用类型) System.Tuple 其中成员的都是属性  元素内容不可变

### Tuple
先介绍元组 System.Tuple 因为没有模板形参包
所以有Tuple.Tuple\<T\> ,...Tuple\<T1,T2,T3,T4,T5,T6,T7,TRest\> 这么多类型

使用
```c#
//静态方法可以进行泛型参数推导
var tuple1=Tuple.Create(1,.2.1,"123",'c');
//使用构造函数构造Tuple需要指明泛型参数
var population = new Tuple<string, int, int, int, int, int, int>(
                           "New York", 7891957, 7781984, 
                           7894862, 7071639, 7322564, 8008278);
```
因为 不同泛型参数的Tuple(Tuple,Tuple\<T\>,...Tuple\<T1,T2...T7,TRest\>) 实际上是不同的九个类型,其构造函数不是泛型方法
所以无法推导类型.一般使用静态方法Tuple.Create,可以进行泛型参数推导

使用形如 item1,item2,item3...的属性名
```c#
tuple1.item1 ，tuple1.item2 ,tuple1.iteam3 
```
来访问tuple中的元素

tips 观察所有Item(index)...属性的声明
```c#
public T1 Item1 { get; }
```
只有get,没有set Tuple的所有元素都是只读的
实现了两个显示接口方法
以Tuple\<T1,T2,T3\> 为例
```c#
int IComparable.CompareTo(object obj);

int IStructuralComparable.CompareTo(object other, System.Collections.IComparer comparer);

bool IStructuralEquatable.Equals(object other, System.Collections.IEqualityComparer comparer);
```
IComparable.CompareTo 默认相等性比较 比较方法是按 Tuple元素Item1,Item2...一个个比较 用于数组排序 Array.Sort()默认调用

IStructuralComparable.CompareTo 可以自定义比较器 比如我只比较两个Tuple 的第二个值的大小来代表两个Tuple的大小 

IStructuralEquatable.Equals 相对性比较

例子 
```C#
public class CustomComparer<T1, T2, T3> : IComparer
{
    public int Compare(Object x, Object y)
    {
        var t = x as Tuple<T1, T2, T3>;
        if (t == null)
            return 0;
        else
        {
            var t2 = y as Tuple<T1, T2, T3>;
            return Comparer<T3>.Default.Compare(t.Item3, t2.Item3);
        }
    }
}
Random random = new Random();

// 创建一个数组，用于存放 10 个 Tuple<int, char, double>
var tuple_arr = new Tuple<int, char, double>[10];

// 循环生成 10 个随机 Tuple
for (int i = 0; i < 10; i++)
{
    int item1 = random.Next(1, 100); // 随机整数，比如 1~99
    char item2 = (char)random.Next(65, 91); // 随机大写字母 A(65) ~ Z(90)
    double item3 = Math.Round(random.NextDouble() * 100, 2); // 随机浮点数 0.00 ~ 99.99

    // 创建 Tuple 并放入数组
    tuple_arr[i] = Tuple.Create(item1, item2, item3);
}

//默认调用IComparable.CompareTo
Array.Sort(tuple_arr);

foreach (var tuple in tuple_arr)
    Console.WriteLine($"[{tuple.Item1}|{tuple.Item2}|{tuple.Item3}]");

//使用IStructuralComparable.CompareTo
Array.Sort(tuple_arr, new CustomComparer<T1, T2, T3>());
foreach (var tuple in tuple_arr)
    Console.WriteLine($"[{tuple.Item1}|{tuple.Item2}|{tuple.Item3}]")
```
这个例子在.net9 上基本上是最新的运行时实际上都没有调用 IStructuralComparable接口而是直接使用默认比较器和IComparable.CompareTo去调用Compare()来进行比较
但是AI和MSDN都介绍说Array.Sort(Array, IComparer) 会调用IStructuralComparable接口CompareTo找Compare方法实际上Debug一下就知道
传入比较器为空,会使用默认比较器。
```c#
public void Sort(Span<T> keys, IComparer<T> comparer)
{
	try
	{
		if (comparer == null)
		{
			comparer = Comparer<T>.Default;
		}
		IntrospectiveSort(keys, comparer.Compare);
	}
    ...//其他代码省略
}
```
>尽管可以直接调用此方法，但它最常由包含 IComparer 参数的集合排序方法调用，这些方法用于对集合的成员进行排序。 例如，它由 Array.Sort(Array, IComparer) 方法以及Add使用 SortedList.SortedList(IComparer) 构造函数实例化的 对象的 方法SortedList调用。
<https://learn.microsoft.com/zh-cn/dotnet/api/system.tuple-6.system-collections-istructuralcomparable-compareto?view=net-9.0#-->
吐槽一下msdn的段落链接也炸了。

元组在ai都被吐槽为落后,让我使用c#7/.net core2 开始的值元组

### System.valueTuple
c# 为值元组设计了新语法,只需要用括号包裹就可以定义一个匿名元组
```c#
(int,string)t=("loka", 18);
var t=("loka", 18);
```
其中t的类型就是 `(int,string)` 这个表达式

1.元组元素的映射,元组元素可以用如下方式指定名字,如果没有指定名字,但其中的值是引用了别的变量,那么可以推导出该变量初始化的名字当元组名。
```C#
var t = (Sum: 4.5, Count: 3);
Console.WriteLine($"Sum of {t.Count} elements is {t.Sum}.");

(double Sum, int Count) d = (4.5, 3);
Console.WriteLine($"Sum of {d.Count} elements is {d.Sum}.");

//用初始化的变量名推导元组元素的名字
var sum = 4.5;
var count = 3;
var t = (sum, count);
Console.WriteLine($"Sum of {t.count} elements is {t.sum}.");
```
同样可以用默认名Item1,Item2...

2.使用using 定义元组别名
c#12可以说使用,注意使用位置
1.想在单个文件可见
```c#
using System;
using System.Collections.Generic;
using person=(int,string)
```
2.想要在全局可见需要写在所有using之前,并且使用global修饰
```c#
global using person=(int,string)
using System;
using System.Collections.Generic;
```

3.和Tuple有类似的api
其中 元素都是字段
```c#
public T1 Item1;
```

tips ValueTuple是所有值类型的隐式基类,但不能创建直接从 ValueType 继承的类。 相反，单个编译器提供语言关键字:struct关键字
[参考](https://learn.microsoft.com/zh-cn/dotnet/api/system.valuetype?view=net-9.0#remarks)
另一个用处是在方法中声明ValueTuple参数,使得参数传递值而不是引用

### 元组的赋值与相等性比较
1.元组赋值按类型和元素数量匹配
不看字段名,只要按顺序对应位置的类型相同(或可隐式转换)且元素数量相同。
```c#
 var t = ("1", 12);
 var t2 = ("2", 12);
 var t3 = ("111", 12, 1);
 var t4 = ( 12, "111");
 t = t2;  //可以
 t = t3;  //无法将类型“(string, int, int)”隐式转换为“(string, int)”
 t = t4;  //无法将类型“(int, string)”隐式转换为“(string, int)”
```


2.与赋值一样不考虑元组名字
考虑
1.两元组元素数量相等
2.元组按顺序的两个元素可比较
以下相等比较的表达式 1,3,4报错 元素数量不一致,无法比较的类型连编译都不通过
```c#
public struct Customclass { }

var t1 = (1, 2);
var t2 = (1, '1');
var t3 = (1, 2, 3);
var t4 = (1, new Customclass());
 Console.WriteLine(t1 != t3);//元素数量不对
 Console.WriteLine(t1 != t2);
 Console.WriteLine(t1 == t3);//元素数量不对
 Console.WriteLine(t1 == t2);
 Console.WriteLine(t1 != t4);//无法应用相等比较运算符
```

tips 元组类型可以是表达式,所以在相等比较时会先求值表达式
MSDN偷的例子
```c#
Console.WriteLine((Display(1), Display(2)) == (Display(3), Display(4)));

int Display(int s)
{
    Console.WriteLine(s);
    return s;
}
// Output:
// 1
// 2
// 3
// 4
// False
```



### 解构赋值
四种语法
1.为每个变量单独使用var 
2.不使用var 指明类型 可隐式转换
3.为单独某个元素声明var 另编译器推导其类型
4.在括号外为所有变量声明var 
```c#
 (var name, var age) = ("loka", 18);
 (string name1, int age2) = ("loka", 18);
 (var name2, int age2) = ("loka", 18);
 var(name3, age3) = ("loka", 18); 
```

和模式匹配结合的例子，从MSDN上偷来的
循环访问多个整数，并输出可被 3 整除的整数
```c#
for (int i = 4; i < 20;  i++)
{
    if (Math.DivRem(i, 3) is ( Quotient: var q, Remainder: 0 ))
    {
        Console.WriteLine($"{i} is divisible by 3, with quotient {q}");
    }
}
```

使用`_` 下滑线来忽略元组的某些元素,这被称为弃元
```c#
 var (_, _, _, pop1, _, pop2) = ("New York City", 1960, 2010，1.1，2.1,3);
 Console.WriteLine($"{pop2 - pop1:N0}");
```
### 让用户自定义类型也支持解构
需要为类型声明 如下方法
可以重载多个该方法
参考下面例子
```c#
//声明 如下方法
public void Deconstruct(out [类型]参数名1, out [类型] 参数名2, out [类型]参数名3...){}

//使用
 public class TypeCustomDeconstruct
 {
     private int id;
     private string name;

     public TypeCustomDeconstruct(int id, string name)
     {
         this.id = id;
         this.name = name;
     }

     public void Deconstruct(out int id, out string name)
    {
        id = this.id;
        name = this.name;
    }
    
    //相同参数
    public void Deconstruct(out string type, out string name)
    {
       type = this.type;
       name = this.name;
    }
    
    //相同参数
    public void Deconstruct(out string name, out int id, out string type)
    {
        id = this.id;
        name = this.name;
        type = this.type;
    }
 }

var obj = new TypeCustomDeconstruct(1, "Alice", "male");
var (id, name, sex) = obj;//可行匹配到了
var (name2, id2) = obj; //二义性 无法推导类型无法匹配
var (type, name3) = obj;//二义性 无法推导类型无法匹配
(string id3, string name4) = obj;//二义性 无法匹配尽管指明类型
```
MSDN的说明注意一下
>具有相同数量参数的多个 Deconstruct 方法是不明确的。 在定义 Deconstruct 方法时，必须小心使用不同数量的参数或“arity”。 在重载解析过程中，不能区分具有相同数量参数的 Deconstruct 方法。

~~虽然没有明说为什么不行~~ 不过这表示 **第四个解构赋值** 尽管指明类型但是参数元数的重载有两个也是不能重载解析的
(有大佬说明:语义上是要求要能先返回一个tuple,再拆tuple到两个变量)

同时也可以设置扩展方法的Deconstruct 函数来设定解构行为
```c#
public static void Deconstruct(this [Type] p,out...)
```


## Record 记录类型
拥有值语义的引用类型

使用主构造函数语法来声明Record类型
主构造函数语法(C# 12)即声明类型时后跟类似于函数的参数和括号,编译器会生成签名为此的构造函数
Person的声明使用record修饰并且使用主构造函数后会生成类似Person2的结构(两者完全不等价只是解糖后的行为相似)
```c#
public record Person(int Id, string Name);

public struct Person2(int Id, string Name)
{
    public required int Id { get; init; }
    public required string Name { get; init; }

    public override string ToString()
    {
        return $"Person2:{Id={Id}, Name={Name}}";
    }
}
```
相似在哪?
1.主构造函数声明的参数表示这个参数都需要;初始化时不能不提供-对应required
2.使用主构造函数后这些参数都需要对象值设定语法来指示而不是写在调用函数的参数中
3.初始化完成后,属性是只读的无法再次赋值,只能在类对象初始化时赋值
4.打印对象时会打印对应属性而不是调用Object.ToString()打印其类型
5.相等性比较类似于struct:是比较值是否相同而不是比较引用/地址(是否为同一对象)

```c#
 var tt = new Person();//报错 未提供与“Person.Person(int, string)”的所需参数“Id”对应的参数
 var tt2 = new Person2(1, "loka");//报错 必须在对象初始值设定项或属性构造函数中设置所需的成员'Person2.Id'。必须在对象初始值设定项或属性构造函数中设置所需的成员'Person2.Name'。

var tt=new Person(1,"loka");//可行

var tt2=new Person2 { Name="loka",Id=1 };//可行
```
### 区分Record/Record class/Record struct

1.record ==record class 本身是引用类型 但是具有值语义
2.record struct 是值类型 同样的具有值语义

编译器会自动生成一下内容
1.使用record声明类型;并使用主构造函数语法时,其中参数的位置叫"位置参数",声明的类型叫"位置记录"
对于record class 编译器会创建对应参数类型的属性

对于record struct 编译器会创建对应参数类型的读写属性

2.创建的构造函数参数声明顺序与位置参数一致

3.record struct生成的字段会初始化为默认值

4.编译器创建一个包含所有"位置参数"的Deconstruct方法

5.值相等的 Object.Equals(Object)  Object.GetHashCode()   == 和 !=

上面那个例子可以扩写一下
```c#
``diff
public record struct Person(int Id, string Name);
``

public struct Person2
{
    public required int Id { get; set; } = default(int);
    public required string? Name { get; set; } = default(string);

    public Person2(int Id_, string Name_)
    {
        Id = Id_;
        Name = Name_;
    }

    public void Deconstruct(out int id, out string name)
    {
        id = Id;
        name = Name;
    }

    public override string ToString() => $"Preson2: Id={Id}, Name={Name}";
}

```
Person这个位置记录 创建的类型解糖后差不多为Person2;因为创建的属性是个读写属性
同时
>从 C# 11 开始，如果你没有初始化结构中的所有字段，编译器会将代码添加到将这些字段初始化为默认值的构造函数中。 分配给其 default 值的结构将初始化为 0 位模式。 使用 new 初始化的结构体初始化为 0 位模式，然后执行所有字段初始值设定项和构造函数。**每个 struct 都具有一个 public 无参数构造函数。**
所以可以使用初始值设定语法,参考下方初始值设定语法
```c#
var tt2=new Person2 { Name="loka",Id=1 };
```
再看record/record class的例子
```c#
public record class Person3(string FirstName, string LastName);

public class Person4
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }

    public Person4(string FirstName_, string LastName_)
    {
        FirstName = FirstName_;
        LastName = LastName_;
    }

    public void Deconstruct(out string FirstName_, out string LastName_)
    {
        FirstName_ = FirstName;
        LastName_ = LastName;
    }

    public override string ToString() => $"Preson2: Id={FirstName}, Name={LastName}";
}
```
此处Person3的位置记录声明了类似Person4 的类型
但是这里使用如下初始化语法
```c#
 var pre2= new Person3("1", "loka");//可以
 var pre3= new Person3 { FirstName = "2", LastName = "jeff" };//报错:未提供与“Person3.Person3(string, string)”的所需参数“FirstName”对应的参数
 pre2.FirstName="emi";//报错:只能在对象初始值设定项中或在实例构造函数或 "init" 访问器中的 "this" 或 "base" 上分配 init-only 属性或索引器 "Person3.FirstName"。
```
属性赋值语句的报错侧面证实了位置record声明的效果:声明了仅初始化(构造函数中/或对象初始值设定语法中)中(init-only)可以赋值的属性

`var pre3= new Person3 { FirstName = "2", LastName = "jeff" }` 该表达式报错参考下方说明:此语法糖实际上是先调用无参的构造函数,再利用属性的set函数赋值,编译器通过语法检查防止你在初始化外赋值。
因为结构struct会默认生成一个public的无参构造函数,而class不会这么做。所以record class/record 与record struct在初始化语法上存在一些差异

如果你对编译器默认生成的属性不满意,
可以主动声明一个同名属性把编译器生成属性覆盖掉
可以自定义属性访问器
可添加字段 但必须用位置参数初始化字段

参考下面例子
```c#
public record Person5(string FirstName, string LastName,int age)
{
    //在记录中定义字段 因为析构函数的需要所以 需要初始化该字段 不一定非要位置字段
    public string FirstName_ = FirstName;
   
   //对默认生成的属性不满意 自定义同名属性和访问器覆盖默认实现
    private int age
    {
        get { return age + 1; }
        set { if (value> 0) age = value; }
    }
    
    //对默认生成的属性不满意单纯的指向修改访问控制符
    // (不自定义访问器)实际仍是自动的属性则必须要初始化这个属性
    private string LastName
    {
        get;
        init;
    } = LastName;//=""

    //和声明类成员一样声明属性 不一定需要位置属性(在主构造函数声明)
    public string FullName => $"{FirstName} {LastName}";
}
```




## 对象初始值设定语法
可以对象初始化时手动指定属性的值
```c#
public class outClass
{
    public int Id { get; set; }
    public string Name { get; set; }

    public override string ToString()=> $"outClass: Id={Id}, Name={Name}";

}

public class test_type1
{
    public int Id { get; set; }
    public string Name { get; set; }

    public string[] C = new string[2];
    
    //注意这里的注释
    public outClass out_class_ { get; set; }//=new outClass();

    public test_type1()
    {
        Id = 0;
        Name = "default";
    }

    public test_type1(int id)
    {
        Id = id;
    }
}

public static void test()
{
    var t1 = new test_type1 { Id = 10, Name = "Alice" };
    var t2 = new test_type1(20) { Name = "Bob" };

    // 方法 A：使用嵌套的索引初始化（默认构造已为 C 分配了数组）
    var t3 = new test_type1()
    {
        Id = 10,
        Name = "Alice",
        C = { [0] = "1", [1] = "2" },
        out_class_ = { Id = 11, Name = "111" },
    };

    // 方法 B：直接赋一个新的数组（更明确，也可改变长度）
    var t4 = new test_type1
    {
        Id = 11,
        Name = "Carol",
        C = new string[] { "a", "b" },
    };

   
    Console.WriteLine($"{t3.Id} {t3.Name} C[0]={t3.C[0]} C[1]={t3.C[1]},out_class_={t3.out_class_}");
    Console.WriteLine($"{t4.Id} {t4.Name} C[0]={t4.C[0]} C[1]={t4.C[1]},out_class_={t3.out_class_}");
}
```
这段代码在t3初始化时会抛异常:System.NullReferenceException:“Object reference not set to an instance of an object.”
暂时不管,先介绍这个语法:对象初始化的时候可以使用大括号的语法对每个声明为public的属性或字段赋值。如t1和t2

对于t3和t4的示例,演示了嵌套类型"初始化"的语法
对于嵌套对象 可以使用不带new的 `Property = { ... }`语法初始化嵌套对象，如例子t3,t4所示

**该语法本质是先创建对象再赋值**,所以这里t3初始化抛异常的原型是因为先初始化时构造函数什么都没干;out_class_==null.
要想修复这个问题可以在属性声明时初始化 ` public outClass out_class_ { get; set; }=new outClass();`
或在无参构造函数中初始化该属性;或在{}初始化时使用`new(){...}` 语法"初始化"(赋值)
```c#
public test_type1()
{
    Id = 0;
    Name = "default";
    <span style="
    color: #22863a;
    background-color: #f0fff4;
    padding: 0 4px;
    border-radius: 3px;
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
    font-size: 14px;
    display: inline-block;
    margin: 0;">
    +out_class_ = new outClass(); </span>
    
    //测试一下博客的markdown解析器支不支持这个语法
    ```diff
    + out_class_ = new outClass();
    ```
}
```

针对t1,t2的初始化语句 使用ILDsm查看后(.net9环境)
```IL
  IL_0001:  newobj     instance void csharp4IL.Test_object_initializers/test_type1::.ctor()
  IL_0006:  dup
  IL_0007:  ldc.i4.s   10
  IL_0009:  callvirt   instance void csharp4IL.Test_object_initializers/test_type1::set_Id(int32)
  IL_000e:  nop
  IL_000f:  dup
  IL_0010:  ldstr      "Alice"
  IL_0015:  callvirt   instance void csharp4IL.Test_object_initializers/test_type1::set_Name(string)
  IL_001a:  nop
  IL_001b:  stloc.0
  IL_001c:  ldc.i4.s   20
  IL_001e:  newobj     instance void csharp4IL.Test_object_initializers/test_type1::.ctor(int32)
  IL_0023:  dup
  IL_0024:  ldstr      "Bob"
  IL_0029:  callvirt   instance void csharp4IL.Test_object_initializers/test_type1::set_Name(string)
```

可以明显看到先newobj,调用构造函数生成对象后再调用set函数赋值属性

显而易见的是
1.`out_class_ = { Id = 11, Name = "111" }` 也就是`Property = { ... }`此语法复用对象的实例
2.`out_class_ = new() { Id = 11, Name = "111" } Property = new() { ... }` 创建新的对象实例并替换原有对象


同时对于没有设置set的只读属性(类对象) 语法1`Property = { ... }`也可以相应初始化该属性
从MSDN偷来的例子
```c#
public class Settings
    {
        public string Theme { get; set; } = "Light";
        public int FontSize { get; set; } = 12;
    }

    public class Application
    {
        public string Name { get; set; } = "";
        // This property is read-only - it can only be set during construction
        public Settings AppSettings { get; } = new();
    }

    public static void Example()
    {
        // You can still initialize the nested object's properties
        // even though AppSettings property has no setter
        var app = new Application
        {
            Name = "MyApp",
            AppSettings = { Theme = "Dark", FontSize = 14 }
        };

        // This would cause a compile error because AppSettings has no setter:
        // app.AppSettings = new Settings { Theme = "Dark", FontSize = 14 };

        Console.WriteLine($"App: {app.Name}, Theme: {app.AppSettings.Theme}, Font Size: {app.AppSettings.FontSize}");
    }
```

### init访问器/required修饰符







