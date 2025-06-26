# 什么是反射
反射允许在运行时未知的类型,获取有关加载的程序集及其中定义的类型的信息

### 基本类型
Type,TypeInfo

Type 表示 一个类的信息
TypeInfo 则是相较于Type更具体的信息

```c#
//获取一个类型的Type
Type type1=typeof(int);
class Struct{
    private readonly Int32 a=10;
    public Int32 b {get;private set;}=1;
    public String ff(String str) => $"{str}{a}";
    public String ff2(String str) =>String.Format("{0}{1}",str,a);
}
Type TStudent=typeof(Struct);

var type2=Type.GetType("System.Int32");
//参数接受不仅仅是类型名的字符串，其实是AssemblyQualifiedName 程序集合限定名 是类关联的程序集名称和类型的完全限定名称。System.Int32的程序集限定名称 
System.Int32, System.Private.CoreLib, Version=9.0.0.0, Culture=neutral, PublicKeyToken=....
//不过CLR应该做了优化这些基本类型都在CoreLib里，不写，可以根据上下文，或已经加载的程序集找
//tips注意这样写是不行的,type2是null，c#编译器 找不到基元类型因为这些都是clr类型的别名，GetType的string
var type2=Type.GetType("int");
//但是用
var type2=typeof(int)
却可以

var TStudent=Type.GetType("Struct")//默认区分大小写
Type 的静态成员函数GetType除了接受字符串重载还有
GetType(String, Boolean) //bool位表示抛异常还是返回null
GetType(String, Boolean, Boolean)//第三个bool位表示是否忽略大小写
```
一般使用typeof运算符,很少用GetType

C# 这个typeof和C++ decltype与C typeof相比有些诡谲。他接受类型名,不像c++接受id表达式(变量名)
同时根据类型定义的范围，还有Assembly.GetType,与 Module.GetType 方法在对应范围内查找类型


### 使用反射查找类型
类型的元数据都存储在程序集元数据表中

根据程序集的ExportedTypes 属性可以查看程序集内定义的所有元素
```c#
//显示的类型为公共类型，外部可见

var ass=typeof(MReflect).Assembly;//MReflect为包含该代码函数的类型
foreach (var t in ass.ExportedTypes) 
{ 
   Console.WriteLine(t.FullName);
}
//或
Assembly a = Assembly.LoadFrom("csharp4IL.dll");//csharp4IL为包含该代码的程序集，当然也可以查看其他程序集

Type[] types2 = a.GetTypes();
foreach (Type t in types2)
{
    Console.WriteLine(t.FullName);
}

获取到对应类型的Type后，根据具体成员类型 获得该类型的其他成员信息

1.MemberInfo 该类型的所有成员 一般由Type成员的函数 GetMembers 获取

2.MethodInfo  该类型的所有方法,GetMethod,GetMethods

3.PropertyInfo 该类所有Property(public int Age { get; set};) ,一般由Type成员的函数，GetProperty/GetProperties获取

4.FieldInfo  该类的字段  GetFields / GetField 

```

### 反射的性能
反射需要根据字符串动态查找类型,调用方法时将实参打包成数组，再解包到线程栈上。同时CLR需要确保类型正确