


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

tips msdn的说明 上面下两个是同义
```c#
if (ct.IsCancellationRequested)
{
     ct.ThrowIfCancellationRequested();
}
if (token.IsCancellationRequested)   
    throw new OperationCanceledException(token);
```
