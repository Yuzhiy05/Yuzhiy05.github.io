---
title: invoke
createTime: 2026/06/21 23:31:33
permalink: /article/87gt4ybw/
---

::: tip 运行环境
以下代码都是我在 Windows 11、.NET 10、VS2026 (Roslyn) 下跑过的
:::

### 导出函数

==这个比较基本，看示例：==

```csharp
[LibraryImport("user32.dll", StringMarshalling = StringMarshalling.Utf16, SetLastError = true)]
private static partial int MessageBoxW(
    IntPtr hWnd,
    string lpText,
    string lpCaption,
    uint uType
);

MessageBoxW(IntPtr.Zero, "Command-line message box", "Attention!", 0);
```

在命令行环境调用 Windows 关于窗口显示 DLL 函数显示一个消息窗口。

关键在于应用于其的属性 ==`LibraryImport`==，专门用来导入外部 DLL 的函数属性。

::: info 对比说明
.NET Framework 引入了一个 `DllImport` 属性和它功能相同但实现不同，现代 C# 基本都用 `LibraryImport` 属性。

参考 MSDN 的[说明](https://learn.microsoft.com/zh-cn/dotnet/standard/native-interop/pinvoke-source-generation#basic-usage)

其中语法上也有些区别，同时支持 AOT。
:::

### 属性说明

| 属性 | 说明 |
|------|------|
| `"user32.dll"` | 构造函数参数，自然就是导入的 DLL 名字 |
| `StringMarshalling = StringMarshalling.Utf16` | 指定导入函数使用 UTF-16 编码生成封送代码。对于 C# 来说一个 char 就是 UTF-16 编码的，C++ 的 char 则是根据平台定义的不小于 8 位 bit |
| `EntryPoint = "MessageBoxW"` | 表明函数入口点，就是 DLL 里这个函数名字；DLL 加载器根据这个名字在 DLL 查找函数；不指定就和声明函数一致 |
| `SetLastError = true` | CLR 会在调用本机函数之后，自动调用 `GetLastError` 函数，并将获取到的错误代码缓存起来；托管代码调用 `Marshal.GetLastPInvokeError()` 方法来获取这个被缓存的错误代码。用这个原因是 Win32 DLL 很多函数失败不通过返回值表示，而是设置一个错误码 |
| `StringMarshallingCustomType` | 自定义封送器，当 `StringMarshalling = Custom` 时使用 |

**其他相关属性：**

```csharp
[return: MarshalAs(UnmanagedType.LPWStr)]  // 或 UnmanagedType.LPStr 等

[UnmanagedCallConv(CallConvs = [typeof(CallConvCdecl)]  // 或 CallConvStdcall, CallConvThiscall)]
```
