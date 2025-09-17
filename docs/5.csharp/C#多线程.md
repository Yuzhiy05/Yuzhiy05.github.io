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



//CTS
//这个重载第一个回调Register 注册的函数 抛出的异常不会阻止后续回调函数调用
public void Cancel();

//指示 回调抛出的异常是否需要立即传播
public void Cancel(bool throwOnFirstException);

//异步的取消,同时注册的回调也是异步调用
public System.Threading.Tasks.Task CancelAsync();
```
Ai说CancellationToken 没有一个 <b style="color:red"> Register\<T\>(Action\<T\>, T) </b>这样重载的成员函数是因为泛型
增加内存和jit编译，该函数主要给引用类型用的;装箱的性能损失可以接受;api灵活——在ui场景用(我意淫的);历史原因——CancellationToken 是在 .NET Framework 4.0 中引入的，当时泛型的使用还没有像现在这样普遍。为了保持向后兼容性，API 的设计可能更倾向于非泛型的实现。

1.Register 注册回调函数在后进先出的队列中(底层实现是双向链表),后注册的函数在取消发生时最先调用。

2.两个Cancel的重载 
无参和Cancel(false)的版本 在回调的调用链发生异常时都不会立即抛出异常;阻止注册的函数的调用。所以这重载在回调函数抛出异常时都将异常合并到一个`AggregateException`类里再抛出

```c#
 public static async Task CTSTest()
 {
     var cts = new CancellationTokenSource();
     var token = cts.Token;
     try
     {
         token.Register(() => {
         Console.WriteLine("Cancellation requested，首个注册的回调函数.");
         throw new ArgumentOutOfRangeException("Amount of shapes must be positive."); });
     token.Register(() => {
         Console.WriteLine("第二个注册的回调函数.");
         throw new StackOverflowException("Stack overflow in cancellation callback.");
     });
    
     Console.WriteLine($"IsCancellationRequested: {token.IsCancellationRequested}");
     Console.WriteLine($"CanBeCanceled: {token.CanBeCanceled}");
     // 注册取消回调
     token.Register(() => { Console.WriteLine("最后一个注册，被取消后首个调用的回调函数.");
         throw new NullReferenceException("空引用了");   });
     
     
         var task = Task.Run(() =>
         {
             for (int i = 0; i < 10; i++)
             {
                 token.ThrowIfCancellationRequested();
                 Console.WriteLine($"Doing work... {i + 1}");
                 Thread.Sleep(1);
             }
             Console.WriteLine("当前时间为:{0:HH:mm:ss.fff}", DateTime.Now);
         }, token);
         await Task.Delay(500);
     
         Console.WriteLine("当前时间为:{0:HH:mm:ss.fff}", DateTime.Now);
         cts.Cancel(true);
         //把此处的Cancel(true)改为Cancel()或Cancel(false)会执行到所有注册回调结束
         await task;
         Console.WriteLine($"IsCancellationRequested after cancel: {token.IsCancellationRequested}");
     }
     catch (OperationCanceledException)
     {
         Console.WriteLine("Operation was canceled.");
     }
     catch (AggregateException ae)
     {
         Console.WriteLine("catch AggregateException.");
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
     catch(Exception ex)
     {
         Console.WriteLine($"Unexpected exception: {ex.Message}");
     }
     finally
     {
         cts.Dispose();
     }
     cts.Dispose();
 }
```

output
```
IsCancellationRequested: False
CanBeCanceled: True
Doing work... 1
Doing work... 2
Doing work... 3
Doing work... 4
Doing work... 5
Doing work... 6
Doing work... 7
Doing work... 8
Doing work... 9
Doing work... 10
当前时间为:02:00:15.379
当前时间为:02:00:15.727
最后一个注册，被取消后首个调用的回调函数.
Unexpected exception: 空引用了
```

使用Cancel()或cts.Cancel(false) 后
output
```
IsCancellationRequested: False
CanBeCanceled: True
Doing work... 1
Doing work... 2
Doing work... 3
Doing work... 4
Doing work... 5
Doing work... 6
Doing work... 7
Doing work... 8
Doing work... 9
Doing work... 10
当前时间为:02:02:34.876
当前时间为:02:02:35.244
最后一个注册，被取消后首个调用的回调函数.
第二个注册的回调函数.
Cancellation requested，首个注册的回调函数.
catch AggregateException.
Task failed: 空引用了
Task failed: Stack overflow in cancellation callback.
Task failed: Specified argument was out of the range of valid values. (Parameter 'Amount of shapes must be positive.')
```
可以看到返回的异常全部以AggregateException整合后抛出,且只要执行Cancel,Register注册的回调函数一定会调用，不管任务有没有执行完

同样关于定时取消也可以在构造CancellationTokenSource时作为参数传入TimeSpan 
```c#
CancellationTokenSource cts = new CancellationTokenSource(1000);  

_ = Task.Run(()=>{...},cts.Token);  

```

同时取消令牌只能取消一次,也就说只能做一次状态转换,已经取消的状态不能转换回来

### CancelAfter()

有两个重载
```c#
public void CancelAfter(int millisecondsDelay);

public void CancelAfter(TimeSpan delay);
```
注意事项: 多次Cancel 以最后一次为准

举例子
```c#
 public static async Task CTSCancelAfterTest()
 {
     var cts = new CancellationTokenSource();
     var token = cts.Token;

     token.Register(() => {
         Console.WriteLine("已经取消;当前时间{0:HH:mm:ss.fff}",DateTime.Now);
     });
     try
     {
         var task = Task.Run(() =>
         {
             for (int i = 0; i < 30; i++)
             {
                 token.ThrowIfCancellationRequested();
                 Console.WriteLine($"Doing work... {i + 1}");
                 Thread.Sleep(200);
             }
             Console.WriteLine("任务结束，当前时间为:{0:HH:mm:ss.fff}", DateTime.Now);
         }, token);
         await Task.Delay(500);
         Console.WriteLine("两秒钟后取消，当前时间为:{0:HH:mm:ss.fff}", DateTime.Now);
         cts.CancelAfter(2000); // 2秒后取消
         Console.WriteLine("三秒钟后取消，当前时间为:{0:HH:mm:ss.fff}", DateTime.Now);
         cts.CancelAfter(3000); // 1秒后取消，以最后一次为准
         //
         await task;
     }
     catch (OperationCanceledException)
     {
         Console.WriteLine("Operation was canceled.");
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
```
在我的电脑上输出

```
Doing work... 1
Doing work... 2
Doing work... 3
两秒钟后取消，当前时间为:23:29:20.553
三秒钟后取消，当前时间为:23:29:20.563
Doing work... 4
Doing work... 5
Doing work... 6
Doing work... 7
Doing work... 8
Doing work... 9
Doing work... 10
Doing work... 11
Doing work... 12
Doing work... 13
Doing work... 14
Doing work... 15
Doing work... 16
Doing work... 17
已经取消;当前时间23:29:23.566
Operation was canceled.
```

可以看到任务实际是在最后一个三秒钟内取消的

### 关联取消,CreateLinkedTokenSource
四个重载

```c#
public static System.Threading.CancellationTokenSource CreateLinkedTokenSource (scoped ReadOnlySpan<System.Threading.CancellationToken> tokens);

public static System.Threading.CancellationTokenSource CreateLinkedTokenSource (System.Threading.CancellationToken token);

public static System.Threading.CancellationTokenSource CreateLinkedTokenSource (params System.Threading.CancellationToken[] tokens);

public static System.Threading.CancellationTokenSource CreateLinkedTokenSource (System.Threading.CancellationToken token1, System.Threading.CancellationToken token2);

```

MSDN有个[例子](https://learn.microsoft.com/zh-cn/dotnet/standard/threading/how-to-listen-for-multiple-cancellation-requests)

首先CT-Cancellationtoken只是个取消信号接受器,信号发射器是CTS，当我们从外部获取一个或多个token时我自己在函数内部也想取消或者一个取消多个token一起取消,可以用此方法把token都关联起来主动管理

注意调用时token状态是取消了,创建的CTS也是取消状态,第三个数值重载中有一个token是取消状态创建的CTS也是取消状态