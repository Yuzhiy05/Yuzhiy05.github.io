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








