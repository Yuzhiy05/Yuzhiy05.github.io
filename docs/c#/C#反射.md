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
//却可以

var TStudent=Type.GetType("Struct")//默认区分大小写
Type 的静态成员函数GetType除了接受字符串重载还有
GetType(String, Boolean) //bool位表示抛异常还是返回null
GetType(String, Boolean, Boolean)//第三个bool位表示是否忽略大小写
```
一般使用typeof运算符,很少用GetType

C# 这个typeof和C++ decltype与C typeof相比有些诡谲。他接受类型名,不像c++接受id表达式(变量名)
同时根据类型定义的范围，还有Assembly.GetType,与 Module.GetType 方法在对应范围内查找类型

tips
C# via CLR一书中介绍的获得类型的api在.net9已过时
Type.ReflectionOnlyGetType(String, Boolean, Boolean) 方法
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

3.PropertyInfo 该类所有Property(public int Age { get; set};)或属性的特性Attribute ,一般由Type成员的函数，GetProperty/GetProperties获取

4.FieldInfo  该类的字段  GetFields / GetField 

```
### 获取TypeInfo
通常使用Type类型的拓展方法获取
```c#
public static System.Reflection.TypeInfo GetTypeInfo(this Type type);
public virtual Type AsType();
//
Type type=typeof(sometype)
TypeInfo typeinfo=type.GetTypeInfo();
//转换回去
Type type_=typeinfo.AsType();
```
拿到TypeInfo 后就能查看更多通过属性查看[更多信息](https://learn.microsoft.com/zh-cn/dotnet/api/system.reflection.typeinfo?view=net-8.0#properties),比如其基类,是否public,是否sealed

### 反射的性能
反射需要根据字符串动态查找类型,调用方法时将实参打包成数组，再解包到线程栈上。同时CLR需要确保类型正确

### 获取各个Info
GetProperty/GetProperties 函数的声明
```c#
//所有属性Property
public System.Reflection.PropertyInfo[] GetProperties();
public abstract System.Reflection.PropertyInfo[] GetProperties(System.Reflection.BindingFlags bindingAttr);

//
public System.Reflection.PropertyInfo? GetProperty (string name, System.Reflection.BindingFlags bindingAttr, System.Reflection.Binder? binder, Type? returnType, Type[] types, System.Reflection.ParameterModifier[]? modifiers);

public System.Reflection.PropertyInfo? GetProperty (string name, System.Reflection.BindingFlags bindingAttr);

public System.Reflection.PropertyInfo? GetProperty (string name);

//根据返回类型判断返回哪个
//我个人认为这个重载没有必要,c#不允许声明两个名字相同仅仅返回类型不同的属性,这个重载只有在索引器能用到
public System.Reflection.PropertyInfo? GetProperty (string name, Type? returnType);
```
BindingFlags 这玩意用来控制搜索属性的条件,这个枚举类型是其他反射类型都用要的
<https://learn.microsoft.com/zh-cn/dotnet/api/system.reflection.bindingflags?view=net-8.0>
举个例子
```c#
Type type = typeof(MReflect);
var properties = type.GetProperties(BindingFlags.Public|BindingFlags.Instance);
foreach (var prop in properties)
{
    Console.WriteLine($"Property: {prop.Name}");
    //获取属性的特性
    var attributes = prop.GetCustomAttributes(false);
    foreach (var attr in attributes)
    {
        Console.WriteLine($"  Attribute: {attr.GetType().Name}");
        if (attr is DescriptionAttribute descriptionAttribute)
        {
            Console.WriteLine($"  Description: {descriptionAttribute.Description}");
        }
    }
}


```
这里BindingFlags.Public|BindingFlags.Instance 组合可以获取到公共的实例属性(也就是非静态成员)
此函数的无参重载相当于,有参调用使用 BindingFlags.Instance | BindingFlags.Static | BindingFlags.Public 这些参数
### 部分BindingFlags说明
BindingFlags.Static    静态属性
BindingFlags.Instance  实例属性(也就是所谓非静态成员)
BindingFlags.Public  公共属性 ,因为不能对属性的两个访问器set,get同时添加访问修饰符号.所以即使 一个访问器被修饰为private，仍被视为公共属性被检索到.
`public int c_3 { get; private set; } = 3;`
BindingFlags.NonPublic   类中私有成员,根据oop原则基类私有成员，被继承就不可访问.所以只会返回基类protected(继承后为private)与internal 成员
BindingFlags.FlattenHierarchy  继承层次结构的属性

BindingFlags.DeclaredOnly  仅搜索该Type表示的类中的属性，基类不搜索

tips.net7 之后返回的属性根据元数据排序，返回的属性顺序是确定的.


使用GetProperty获取单个属性
```c#
 public static void MReflectGetProperty(string property_name)
 {
     Type type = typeof(MReflect);
     //获取属性
     PropertyInfo prop = type.GetProperty(property_name, typeof(int));

     if (prop is not null)
     {
         Console.WriteLine($"Property Name: {prop.Name}");
         Console.WriteLine($"Property Type: {prop.PropertyType}");
         //获取属性的值
         MReflect instance = new MReflect();
         //判断是否为索引器
         if (prop.GetIndexParameters().Length > 0)
         {
             var value = prop.GetValue(instance, new object[] { 1 });
             Console.WriteLine($"Property Value: {value}");
         }
         else
         {
             var value = prop.GetValue(instance);
             Console.WriteLine($"Property Value: {value}");
         }
     }
     else
     {
         Console.WriteLine($"Property '{property_name}' not found.");
     }
 }
```
其他属性反射使用GetValue,直接传递实例即可
如
```c#
var  instance = new MReflect(); 
var value = prop.GetValue(instance);
//
object instance=Activator.CreateInstance(type);
var value=prop.GetValue(instance);
```
tips 索引器在被编译为IL后名字为Item

### 构造类型实例
有以下几种方法

Activator 类的CreateInstance 和CreateInstanceFrom方法
```c#
//第二个参数绑定器我不知道,第三个参数为传给构造函数的参数，最后一个参数为区域性特定信息,经常设置为null,采用当前线程的CultureInfo
public static object? CreateInstance (Type type, System.Reflection.BindingFlags bindingAttr, System.Reflection.Binder? binder, object?[]? args, System.Globalization.CultureInfo? culture);

public static object? CreateInstance (Type type, params object?[]? args);

public static object? CreateInstance (Type type, bool nonPublic);


//这个重载返回ObjectHandle必须用 Unwrap ()解包。因为这关乎创建在其他可能没被加载的程序集中类的实例
public static System.Runtime.Remoting.ObjectHandle? CreateInstance (string assemblyName, string typeName);

public static object? CreateInstance (Type type);

//这玩意没啥用,编译期类型已知用new 表达式就好了
public static T CreateInstance<T> ();
//还有其他一些重载用来 客户端激活的对象这个不介绍

//这个重载是根据程序集加载指定类型,类型参数为字符串而不是Type,因为获取类型的Type要加载对应的程序集
public static System.Runtime.Remoting.ObjectHandle? CreateInstanceFrom (string assemblyFile, string typeName);

//剩下两个与客户端激活的对象相关暂时不介绍

```
其中第一个重载的BindingFlags参数已经介绍过用来查找的条件,。第二个重载params object []参数用来向构造函数传递参数,第三个重载的bool 参数用来指定 是否存在公共和非公共的无参数构造函数. 

这里有一些[示例](https://learn.microsoft.com/zh-cn/dotnet/api/system.activator.createinstance?view=net-8.0#system-activator-createinstance-1)
比较常用的
```c#
//要被反射的类
//该类在testInfo.dll 程序集中
public class test
{
    private int a = 10;
    public  test() { }
    public  test(int a_) => this.a = a_;

    public int A { get => a; set => a = value; }

    public override string ToString()=>a.ToString();
}

public static void CreatInstanceWiteRef(){
    //方法1,类型定义已知 已经加载程序集
      ObjectHandle handle = Activator.CreateInstance("testInfo", "Person");
      Person p = (Person) handle.Unwrap();
      p.Name = 1;
    //应用插件等场景，只知道类型不知道类型具体定义，继承接口的类型通常是使用者定义的，程序动态加载
      ObjectHandle handle = Activator.CreateInstance("PersonInfo", "Person");
      object p = handle.Unwrap();
      Type t = p.GetType();
      PropertyInfo prop = t.GetProperty("Name");
        if (prop != null)
      prop.SetValue(p, "Samuel");

      MethodInfo method = t.GetMethod("ToString");
      object retVal = method.Invoke(p, null);
        if (retVal != null)
         Console.WriteLine(retVal);
    //最简单的重载
      var instance = Activator.CreateInstance(typeof(test), new object[] { 20 });

      var peoinfo = typeof(test).GetProperty("A");
      peoinfo.SetValue(instance,15);
      var a = peoinfo.GetValue(instance);
      Console.WriteLine($"Property A value: {a}");
}
```
tips 不管是CreateInstance还是CreateInstanceFrom都需要加载对应程序集才能创建其中类型的实例

Assembly.CreateInstance
```c#
//typename为类型的完全限定名(namesapce.class_name,对应类型Type的Fullname属性),此重载会在以BindingFlags 设置为 Public 或 Instance为条件在当前程序集查找，并且不忽视大小写
public object? CreateInstance (string typeName);

//bool参数指定是否忽视大小写
public object? CreateInstance (string typeName, bool ignoreCase);

//带搜索具体搜索的条件的重载
public virtual object? CreateInstance (string typeName, bool ignoreCase, System.Reflection.BindingFlags bindingAttr, System.Reflection.Binder? binder, object[]? args, System.Globalization.CultureInfo? culture, object[]? activationAttributes);
```
tips 关于 CultureInfo 参数默认是当前类型的CultureInfo。不同区域,表示1000的字符串不同转化double自然不同。
简单的用法
```c#
public static void CreatInstanceWiteAssembly()
{    //仅仅是为了介绍用法,实际这样写属于脱裤子放屁
    var assembil_=typeof(test).Assembly;
    string fullname_= typeof(test).FullName;
    var instance = assembil_.CreateInstance(fullname_);
    if (instance is test testInstance)
    {
        Console.WriteLine($"Created instance of {testInstance.GetType().FullName} with A = {testInstance.A}");
        testInstance.A = 30;
        Console.WriteLine($"Updated A = {testInstance.A}");
    }
    else
    {
        Console.WriteLine("Failed to create instance.");
    }
}
```

ConstructorInfo.Invoke 方法




### 反射创建数组,委托,泛型类型
使用反射创建这三种类型需要各自类型中的方法


### 设计可拓展程序
一般由三个步骤

1.创建宿主SDK程序集,其中使用接口或抽象基类.所有插件都要实现该接口或类型。其中使用的类型(返回类型或参数)中最好是MsCorLib.dll定义的类型,因为CLR总是加载与自身匹配版本的程序集,并且只加载一个版本? 。其中需要的自定义类型也在其中定义,因为所有的插件都要引用他.

2.插件实现者引用宿主sdk程序集,实现其中的类型。插件开发者可以所以更新版本

3.创建宿主应用程序集，他引用宿主sdk程序集定义类型实现接口,并且和插件实现不会引用该程序集，所以可以自由更新版本.

tips 跨程序集使用类型时需要关注程序集的版本控制问题

从C# via CLR一书中摘抄的例子?这个例子还没验证在.net9下是否有效
```c#
hostSdk.dll

using System

namespace Wintellect.HostSdk{
    public interface IAddIn{
        string Dosthing(int x);
    }
}

AddInTypes.dll,引用hostSdk.dll

using System;
using  Wintellect.HostSdk;

public sealed class AddIn_A:IAddIn{
    public AddIn_A(){}

    public string Dosthing(int x)=>"AddIn_A:"+x.ToString();
}

public sealed class AddIn_B:IAddIn{
    public AddIn_B(){}

    public string Dosthing(int x)=>"AddIn_B:"+(x*2).ToString();
}

宿主Host.exe 代码 引用HostSDk.dll 

using Systeam;
using Systeam.IO;
using System.Reflection;
using System.Collections.Generic;
using Wintellect.HostSdk

public static class Program{
    static void  Main(string[] args){
      //查找宿主exe所在目录
       String AddInDir = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
//假定加载程序集和宿主exe在同一个目录下
var AddInAssemblies = Directory.EnumerateFiles(AddInDir, "*.dll");
//创建可由宿主使用的所有Type的集合
var AddInTypes = from file in AddInAssemblies
                    let assembly = Assembly.LoadFrom(file)
                    from type in assembly.ExportedTypes
                        //如果类实现了IAddIn接口，该类型就可以被宿主使用
                 where type.IsPublic && typeof(IAddIn).GetTypeInfo().IsAssignableFrom(type.GetTypeInfo())
                 select type;
//宿主发现所有可用的加载项
//构造加载项并使用他们
foreach (var type in AddInTypes)
{
    Console.WriteLine($"Found add-in type: {type.FullName}");
    //可以创建实例或调用方法等操作
    var instance_ = Activator.CreateInstance(type);
    if (instance_ is IAddIn addIn)
    {
        Console.WriteLine(instance_.Dosthing(5));
    }
}
    }
}

```

学习一下MEF?


