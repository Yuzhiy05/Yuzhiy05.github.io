

tips 以下代码都是我在windows11 .net10 vs2026(roslyn)下跑过的

### 导出函数

这个比较基本，看示例
```c#
 [LibraryImport("user32.dll", StringMarshalling = StringMarshalling.Utf16, SetLastError = true)]
 private static partial int MessageBoxW(
     IntPtr hWnd,
     string lpText,
     string lpCaption,
     uint uType
 );

MessageBoxW(IntPtr.Zero, "Command-line message box", "Attention!", 0);
```
在命令行环境调用Windows关于窗口显示dll函数显示一个消息窗口

关键在于应用于其的属性LibraryImport 专门用来导入外部dll的函数属性
.net framework 引入了一个DllImport属性和它功能相同不会实现不同,现代C#基本都用LibraryImport属性
参考msdn的[说明](https://learn.microsoft.com/zh-cn/dotnet/standard/native-interop/pinvoke-source-generation#basic-usage)

其中语法上也有些区别,同时支持aot.

属性说明
属性的构造函数参数"user32.dll"自然就是 导入的dll名字

StringMarshalling = StringMarshalling.Utf16 指定导入函数使用utf16编码生成封送代码
对于c#来说一个char就是utf16编码的 c++的char则是根据平台定义的不小于8位bit

还有个参数没显示
EntryPoint="MessageBoxW"  表明函数入口点,就是dll里这个函数名字;dll加载器根据这个名字在dll查找函数;不指定就和声明函数一致

SetLastError=true   CLR会在调用本机函数之后，自动调用 GetLastError函数，并将获取到的错误代码缓存起来;托管代码调用 Marshal.GetLastPInvokeError()方法来获取这个被缓存的错误代码 
用这个原因是win32 dll很多函数失败不通过返回值表示,而是设置一个错误码

StringMarshallingCustomType: 自定义封送器
    StringMarshallingCustomType = typeof(MyStringMarshaller),  // 当 StringMarshalling = Custom 时使用


[return: MarshalAs(UnmanagedType.LPWStr)]  // 或 UnmanagedType.LPStr 等

[UnmanagedCallConv(CallConvs = [typeof(CallConvCdecl)]  // 或 CallConvStdcall, CallConvThiscall)]





