---
title: C#接口
createTime: 2025/05/23 23:07:51
permalink: /article/yemrteud/
---

### 关于 CLR Via C#（第四版）一些待讨论的问题

环境：.NET 8.0 / C#12

**1. 原书中文版 262 页中有这样一段描述：**

> C# 编译器要求将实现接口的方法（后文简称"接口方法"）标记为 `public`。CLR 要求将接口方法标记为 `virtual`。不将方法显式标记为 `virtual`，编译器会将它们标记为 `virtual` 和 `sealed`。

在 MSDN 中 <https://learn.microsoft.com/zh-cn/dotnet/csharp/language-reference/keywords/interface>：

> 从 C# 11 开始，接口可以定义 static abstract 或 static virtual 成员来声明实现类型必须提供声明的成员。
> 没有实现的接口成员不能包含访问修饰符。具有默认实现的成员可以包含任何访问修饰符。

C# 的语言规范：

```csharp
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

这里根本没有声明方法是否可以用 virtual 修饰。

**使用编译器后可以：**

- **Q**：接口方法可以添加 virtual 修饰符吗？
- **A**：可以，必须提供默认实现

> 从 C# 11 开始，接口可以声明除字段之外的所有成员类型的 static abstract 和 static virtual 成员。
> static virtual 方法几乎完全是在泛型接口中声明的。

### 泛型接口可以为同接口不同类型参数的定义多个实现

[显式接口实现](https://learn.microsoft.com/zh-cn/dotnet/csharp/programming-guide/interfaces/explicit-interface-implementation)

```csharp
public sealed class Number : IComparable<int>, IComparable<string>
{
    // 实现同一接口的 CompareTo 多个不同类型参数
    public int Value { get; set; }

    public int CompareTo(string other)
    {
        return Convert.ToInt32(other) + Value;
    }

    public int CompareTo(int other)
    {
        return Value.CompareTo(other);
    }
}
```

类中不可声明相同名字的属性，但是可以实现参数不同相同名称的索引器，其中索引器在被编译为 IL 后名字为 Item。

### 实现 IList 接口

*待补充*

### 实现 IEnumerable 接口

关于实现可枚举接口，一开始我不能理解，我以为需要实现类似 C++ 一样的迭代器。实际上 `IEnumerator` 就是 C# 的迭代器。同时我不明白的是，为什么实现 `IEnumerable` 只需要实现 `GetEnumerator`（返回一个可枚举器）而通过实现 `IEnumerator` 来实现迭代（通过实现 `MoveNext()`、`Current`、`Reset`）。在我看来可枚举的容器可以自己干这件事（实现 `IEnumerable`）。

MSDN 举了两个[例子](https://learn.microsoft.com/zh-cn/dotnet/api/system.collections.generic.ienumerable-1.getenumerator?view=net-8.0#--)和[例子2](https://learn.microsoft.com/zh-cn/dotnet/api/system.collections.ienumerator?view=net-8.0#examples)。

首先说例2，为了实现 `IEnumerable` 和 `IEnumerator`，实现接口的类 People 和 PeopleEnum 内部定义了 `Person[] _person` 数组。我心想这不扯淡吗？内部定义了数组，那 MoveNext 不就是数组索引 `i++`、`_person[i++]` 和 Current `_person[i]` 吗，这件事 People 这个类自己就能做非要搞一个 IEnumerator。顺便当时我觉得这样的实现太 low 且偷懒了；需要实现一个类似 C++ 迭代器的东西，同样例1使用了 string。

因此我检查了 C# 标准库的实现：

- [List](https://github.com/dotnet/runtime/blob/5535e31a712343a63f5d7d796cd874e563e5ac14/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/List.cs#L1145)
- [string 的枚举器 charEnumerator](https://github.com/dotnet/runtime/blob/5535e31a712343a63f5d7d796cd874e563e5ac14/src/libraries/System.Private.CoreLib/src/System/CharEnumerator.cs#L10)

这两个实现里 List 的 Enumerator 使用了 List 做成员，charEnumerator 使用了 string 做成员。我有些无法理解为什么这么做，假设 List 本身无法可枚举需要借助其他辅助类来实现，那么官方实现却使用该容器本身来实现。

既然容器本身可以实现 MoveNext、Current 这些可枚举的操作，为什么还需要 IEnumerable 可枚举器之类的接口呢？

::: tip 注意
`public interface IEnumerable<out T> : System.Collections.IEnumerable`，注意泛型 `IEnumerable<T>` 的定义。

实现接口 `IEnumerable<T>` 时同时还要实现一个非泛型版本，不过一般都是泛型版本实现调用非泛型版本。
:::

```csharp
// Returns an enumerator for this list with the given
// permission for removal of elements. If modifications made to the list
// while an enumeration is in progress, the MoveNext and
// GetObject methods of the enumerator will throw an exception.
public Enumerator GetEnumerator() => new Enumerator(this);

// 实现 IEnumerator<T> 泛型接口
IEnumerator<T> IEnumerable<T>.GetEnumerator() =>
    Count == 0 ? SZGenericArrayEnumerator<T>.Empty :
    GetEnumerator();

// 实现 IEnumerable 非泛型接口
IEnumerator IEnumerable.GetEnumerator() => ((IEnumerable<T>)this).GetEnumerator();
```

在实际 foreach 迭代时每次都会优先调用 public 实例版本，只有在作为调用函数的参数为 `IEnumerator` 时使用接口版本。

::: warning 注意
实现 `IEnumerator` 的属性 `Current` 同样也需要实现两个版本，同样非泛型版本调用泛型版本。
:::

**charEnumerator 示例：**

```csharp
private T _current;

public T Current => _current;

object? IEnumerator.Current
{
    get
    {
        if (_index == 0 || _index == _list._size + 1)
        {
            ThrowHelper.ThrowInvalidOperationException_InvalidOperation_EnumOpCantHappen();
        }
        return Current;
    }
}
```

一般容器内部还会实现一个方法 `MoveNextRare`，用来表示 MoveNext 的抛出的异常：`InvalidOperationException` 集合在枚举器创建后被修改。

`List.IEnumerator.MoveNext` 会在创建时生成一个 `_version` 版本号，这个版本号就是 List 的内部版本号，每次容器被修改时都会 `++`。当 List 被迭代器创建后修改时 Current 就失效了。

### 实现自定义格式化

有两个视角：

**类型定义者**应该实现 `IFormattable` 接口：

```csharp
public string ToString(string? format, IFormatProvider? formatProvider);
```

实现参考 MSDN 的[例子](https://learn.microsoft.com/zh-cn/dotnet/api/system.iformattable?view=net-9.0#examples)。

自定义一个例子：

```csharp
public class MFormattable : IFormattable
{
    public int Value { get; set; }

    public MFormattable(int value)
    {
        Value = value;
    }

    public string ToString(string? format, IFormatProvider? formatProvider)
    {
        if (string.IsNullOrEmpty(format)) format = "G";
        if (formatProvider == null) formatProvider = System.Globalization.CultureInfo.CurrentCulture;
        return format.ToUpperInvariant() switch
        {
            "G" => Value.ToString(formatProvider),
            "X" => Value.ToString("X", formatProvider),
            "C" => Value.ToString("C", formatProvider),
            _ => throw new FormatException($"The '{format}' format string is not supported.")
        };
    }

    public override string ToString() => ToString("G", null);

    public string ToString(string? format) => ToString(format, null);
}
```

第一个重载是实现 `IFormattable` 的 ToString 方法，第二个重载是实现 Object 的默认 ToString，第三重载就是仅提供自定义格式化器时使用。

使用例子：

```csharp
public class MFormattableTest
{
    public static void Test()
    {
        MFormattable mf = new MFormattable(255);
        Console.WriteLine("{0:G} (Celsius) = {0:X} (Kelvin) = {0:C} (Fahrenheit)\n", mf);
        Console.WriteLine(mf.ToString("G", null)); // General format
        Console.WriteLine(mf.ToString("X", null)); // Hexadecimal format
        Console.WriteLine(mf.ToString("C", System.Globalization.CultureInfo.CurrentCulture)); // Currency format
        try
        {
            Console.WriteLine(mf.ToString("Z", null)); // Unsupported format
        }
        catch (FormatException ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
```

使用例1：`Console.WriteLine("{0:G} (Celsius) = {0:X} (Kelvin) = {0:C} (Fahrenheit)\n", mf);`

内部在对于字符小于 256 时都会使用 FCL 的一个内部类 `ValueStringBuilder`，其中调用的 `internal void AppendFormatHelper(IFormatProvider? provider, string format, ReadOnlySpan<object?> args)` 会解析 `{0:x}` 这种格式符，在类型实现 `IFormattable` 的时候会调用对应类型的 `ToString(string? format, IFormatProvider? formatProvider)` 的重载方法，把参数追加到要输出的字符串中去。

**对于类型使用者**因为无法修改类型代码，只能在外部为类型添加格式化方法，需要实现 `IFormatProvider`、`ICustomFormatter` 两个接口：

```csharp
IFormatProvider
public object? GetFormat(Type? formatType);

ICustomFormatter
public string Format(string? format, object? arg, IFormatProvider? formatProvider);
```

MSDN 的[例子](https://learn.microsoft.com/zh-cn/dotnet/api/system.icustomformatter.format?view=net-9.0#--)

通常 `IFormatProvider`、`ICustomFormatter` 可以由一个需要被格式化的类实现，这样在 `GetFormat` 获取格式化提供者时返回自身，因为自身实现了 `ICustomFormatter` 接口，自己就可以处理自己的格式化。

```csharp
// 为所有传入数值和字符串尾部添加 "NB" 后缀
// {0:x} 添加小写 "nb" 后缀
// {0:Z} 添加大写 "NB" 后缀
public class MCustomFormatter : IFormatProvider, ICustomFormatter
{
    public object? GetFormat(Type? formatType)
    {
        if (formatType == typeof(ICustomFormatter))
            return this;
        return null;
    }

    public string Format(string? format, object? arg, IFormatProvider? formatProvider)
    {
        if (arg == null) return string.Empty;
        if (arg is int or double or string)
        {
            string suffix = "NB";
            if (format == "x")
                suffix = "nb";
            else if (format == "Z")
                suffix = "NB";
            return $"{arg}{suffix}";
        }
        else
        {
            return arg.ToString() ?? string.Empty;
        }
    }
}

public class MCustomFormatterTest
{
    public static void Test()
    {
        MCustomFormatter customFormatter = new MCustomFormatter();
        string formattedInt = string.Format(customFormatter, "{0: xxxx}", 123);
        string formattedDouble = string.Format(customFormatter, "{0:Z}", 45.67);
        string formattedString = string.Format(customFormatter, "{0:x}", "Hello");
        string formattedDefault = string.Format(customFormatter, "{0}", DateTime.Now);
        Console.WriteLine(formattedInt);    // Output: 123NB
        Console.WriteLine(formattedDouble); // Output: 45.67NB
        Console.WriteLine(formattedString); // Output: HelloNB
        Console.WriteLine(formattedDefault); // Output: Current date and time as string
    }
}
```

**常见错误写法：**

```csharp
MCustomFormatter customFormatter = new MCustomFormatter();
Console.WriteLine("{0:x}", customFormatter);
```

这种会输出类型名，因为其中只会调用 ToString 函数，实现了 `IFormattable` 的可以调用对应实现的 ToString。

只有主动调用 Format 函数才能使用对应格式化器去格式化类型。

`string.Format` 会调用这个重载版本：`string Format(IFormatProvider? provider, string format, object? arg0)`，其中再调用 `string FormatHelper(IFormatProvider? provider, string format, ReadOnlySpan<object?> args)`，其中同样会构造 `ValueStringBuilder`，其中调用 `void AppendFormatHelper(IFormatProvider? provider, string format, ReadOnlySpan<object?> args)` 把格式化器传进去再用对应格式化器格式化传入值。

CLR 中解析格式符的逻辑我没看懂，但是作用是把 `"this is{0:B2}"` 传入字符串中把 `{}` 包裹的 `:` 后面的格式符 `B2` 取出来传给格式化器接口 `ICustomFormatter` 的 Format 方法。

```csharp
if (ch != '}')
{
    // Continue consuming optional additional digits.
    while (char.IsAsciiDigit(ch) && index < IndexLimit)
    {
        index = index * 10 + ch - '0';
        ch = MoveNext(format, ref pos);
    }

    // Consume optional whitespace.
    while (ch == ' ')
    {
        ch = MoveNext(format, ref pos);
    }

    // Parse the optional alignment, which is of the form:
    //     comma
    //     optional any number of spaces
    //     optional -
    //     at least one digit
    //     optional any number of spaces
    if (ch == ',')
    {
        // Consume optional whitespace.
        do
        {
            ch = MoveNext(format, ref pos);
        }
        while (ch == ' ');

        // Consume an optional minus sign indicating left alignment.
        if (ch == '-')
        {
            leftJustify = true;
            ch = MoveNext(format, ref pos);
        }

        // Parse alignment digits. The read character must be a digit.
        width = ch - '0';
        if ((uint)width >= 10u)
        {
            ThrowHelper.ThrowFormatInvalidString(pos, ExceptionResource.Format_ExpectedAsciiDigit);
        }
        ch = MoveNext(format, ref pos);
        while (char.IsAsciiDigit(ch) && width < WidthLimit)
        {
            width = width * 10 + ch - '0';
            ch = MoveNext(format, ref pos);
        }

        // Consume optional whitespace
        while (ch == ' ')
        {
            ch = MoveNext(format, ref pos);
        }
    }

    // The next character needs to either be a closing brace for the end of the hole,
    // or a colon indicating the start of the format.
    if (ch != '}')
    {
        if (ch != ':')
        {
            // Unexpected character
            ThrowHelper.ThrowFormatInvalidString(pos, ExceptionResource.Format_UnclosedFormatItem);
        }

        // Search for the closing brace; everything in between is the format,
        // but opening braces aren't allowed.
        int startingPos = pos;
        while (true)
        {
            ch = MoveNext(format, ref pos);

            if (ch == '}')
            {
                // Argument hole closed
                break;
            }

            if (ch == '{')
            {
                // Braces inside the argument hole are not supported
                ThrowHelper.ThrowFormatInvalidString(pos, ExceptionResource.Format_UnclosedFormatItem);
            }
        }

        startingPos++;
        itemFormatSpan = format.AsSpan(startingPos, pos - startingPos);
    }
}
```

::: tip 注意
C# 的标准格式说明符和[自定义格式说明符](https://learn.microsoft.com/zh-cn/dotnet/standard/base-types/standard-numeric-format-strings)提示单个首字母的格式符不符合标准格式字符串就会抛异常：`System.FormatException: Format specifier was invalid.`

```csharp
// 被视为标准格式字符串（单个字符加数值），无效抛异常
int price = 169;
Console.WriteLine("The cost is {0:A22222}.", price);

// 中间空一个字符，有 A+其他字符被视为自定义格式字符串，无法解析时原样输出
Console.WriteLine("The cost is {0:A 22222}.", price);
// 输出 The cost is A 22222.

// 非单个字符的格式串，被视为自定义格式字符串，无法解析时原样输出不抛异常
Console.WriteLine("The cost is {0:AAAAAA}.", price);
// The cost is AAAAAAA.

// 字符串内插调用一个这个函数
public void AppendFormatted<T>(T value)
{
```
:::

::: tip 补充
符合格式字符串中的每个格式化项都会调用一次 `ICustomFormatter.Format` 的格式化方法。参考上面提供的 MSDN 链接中的例子项，下面的语句调用三次 `ICustomFormatter.Format`：

```csharp
Console.WriteLine(String.Format(new MyFormatter(),
    "{0} (binary: {0:B}) (hex: {0:H})", byteValue));
```
:::
