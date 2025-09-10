---
title: C#多线程
createTime: 2025/09/09 10:57:50
permalink: /article/7nnotyg2/
---



### C# 中的任务取消
MSDN的[示例](https://learn.microsoft.com/zh-cn/dotnet/standard/parallel-programming/how-to-cancel-a-task-and-its-children)

1.取消Task
c#中的任务取消是协作式的，什么是协作式的呢。就是说调用方和被调用方协商着来,不能说你想取消就取消。首先被调用方需要接受一个
`CancellationToken` 类型的参数,外部通过`CancellationTokenSource` 类型的实例调用Cancel来请求取消,此时该实例内的Token会将属性`IsCancellationRequested` 设置为true。被调用函数内部使用此通知来自己决定是否取消,被调用函数的函数签名中完全可以不接受CancellationToken类型的参数，或者完全不理会取消请求。在需要取消的场合,通过判断IsCancellationRequested,调用`ct.ThrowIfCancellationRequested();`来抛出异常以此取消任务,当然调用方要try-catch处理异常

这是一个示例
这段代码犯了一个经典错误 参考这篇[文章](https://learn.microsoft.com/zh-cn/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming)
```c#
public class MThread
{

    //学习任务取消CancellationTokenSource
    public static async Task MThreadCancelTest()
    {
        var cts = new System.Threading.CancellationTokenSource();
        var token = cts.Token;
        var task = Task.Run(() => MTaskWillbeCanceled(token,10), token);
        //等待3秒后取消任务
        await Task.Delay(3000);
        cts.Cancel();
        try
        {
            await task;
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("Task was canceled.");
        }
        catch (AggregateException ae)
        {
            foreach (var e in ae.InnerExceptions)
            {
                if (e is OperationCanceledException)
                {
                    Console.WriteLine("Task was canceled.");
                }
                else
                {
                    Console.WriteLine($"Task failed: {e.Message}");
                }
            }
        }
        finally
        {
            cts.Dispose();
        }


    }

    //协作式取消 不是说你想取消就取消 需要任务本身配合检查取消状态，需要函数签名中包含
    // CancellationToken参数 通过抛异常的方式取消任务
    private static async void MTaskWillbeCanceled(CancellationToken ct,int sencond)
    {
        if (ct.IsCancellationRequested)
        {
            Console.WriteLine("Task was canceled before it started.");
            ct.ThrowIfCancellationRequested();
        }
        for(int i = 0; i < sencond; i++)
        {
            // 模拟一些工作
            await Task.Delay(1000);
            Console.WriteLine($"Working... {i + 1} seconds elapsed.");
            // 定期检查取消状态
            if (ct.IsCancellationRequested)
            {
                Console.WriteLine("Task was canceled during execution.");
                ct.ThrowIfCancellationRequested();
            }
        }

    }
}
```

tips msdn的说明 下面两个语句是同义 参考runtime里的[实现](https://github.com/dotnet/runtime/blob/b6127f9c7f6bab00186ec43d4a332053a1d02325/src/libraries/System.Private.CoreLib/src/System/Threading/CancellationToken.cs#L359)
```c#
ct.ThrowIfCancellationRequested();

if (token.IsCancellationRequested)   
    throw new OperationCanceledException(token);
```


### CancellationTokenSource和CancellationToken 一些成员函数的

```c#
Register(Action)	
注册一个将在取消此 CancellationToken 时调用的委托。

Register(Action, Boolean)	
注册一个将在取消此 CancellationToken 时调用的委托。

Register(Action<Object,CancellationToken>, Object)	
注册取消此 CancellationToken 时将调用的委托。

Register(Action<Object>, Object)	
注册一个将在取消此 CancellationToken 时调用的委托。

Register(Action<Object>, Object, Boolean)	
注册一个将在取消此 CancellationToken 时调用的委托
```
Ai说CancellationToken 没有一个 <b style="color:red"> Register\<T\>(Action\<T\>, T) </b>这样重载的成员函数是因为泛型
增加内存和jit编译，该函数主要给引用类型用的;装箱的性能损失可以接受;api灵活——在ui场景用(我意淫的);历史原因——CancellationToken 是在 .NET Framework 4.0 中引入的，当时泛型的使用还没有像现在这样普遍。为了保持向后兼容性，API 的设计可能更倾向于非泛型的实现。