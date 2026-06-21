---
title: C#的异步设施
createTime: 2026/06/21 23:31:33
permalink: /article/3972351t/
---



# C#的异步设置

## 同步上下文

在winfrom 等ui中更ui控件需要回到ui线程执行

这是一个使用同步上下文的例子
```c#
var form = new Form();
var label = new Label { Text = "Initial text", Dock = DockStyle.Fill };
form.Controls.Add(label);
 
form.Shown += async (sender, e) =>
{
            // 拿到 UI 的同步上下文
    var syncContext = SynchronizationContext.Current;
 
    await Task.Run(() =>
    {
        // 在后台线程中运行
        Thread.Sleep(2000);
        Console.WriteLine($"Background thread: {Environment.CurrentManagedThreadId}");
 
        // 通过syncContext将操作调度回 UI 线程
        syncContext.Post(_ =>
        {
                    // 如下代码会在 UI 线程中执行
            Console.WriteLine($"UI thread: {Environment.CurrentManagedThreadId}");
            label.Text = "Updated text";
        }, null);
    });
};
```

但使用await关键字时会自动捕获当前执行的上下文
所以这样即可
```c#
form.Shown += async (sender, e) =>
{
    await Task.Delay(2000); // 非阻塞等待，自动回到 UI 线程
    Console.WriteLine($"UI thread: {Environment.CurrentManagedThreadId}");
    label.Text = "Updated text";
};
```

### 一个特殊例子ConfigureAwait(false)

作用:不回到原先的同步上下文执行,默认情况是切换回到线程池执行

说烂了这个例子:
```c#
using System.Windows.Forms; 
//winFrom的ui线程
public class DeadlockExample
{
    private static readonly HttpClient _http = new HttpClient();
    
    // 异步方法：内部没有 ConfigureAwait(false)
    private async Task<string> FetchDataAsync()
    {
        // await 会捕获 SynchronizationContext（UI 线程上下文）
        var response = await _http.GetStringAsync("https://httpbin.org/delay/1");
        return response.Substring(0, 10);  // 后续代码需要在原上下文执行
    }
    
    // UI 按钮点击事件（在 UI 线程执行）
    private void Button_Click(object sender, EventArgs e)
    {
        // ⚠️ 同步阻塞等待异步方法 → 死锁！
        string result = FetchDataAsync().Result;
        Console.WriteLine(result);  // 永远不会执行到这里
    }
}
```
在ui线程中使用.Result/.Wait同步阻塞方法,异步方法FetchDataAsync使用await时默认捕获了同步上下文,后续代码执行需要回到原来`同步上下文`执行也就是回到原来的ui线程执行。原来的ui线程被同步阻塞方法阻塞了,因此造成了死锁。

对于本例子可以改成`await _http.GetStringAsync("https://httpbin.org/delay/1").ConfigureAwait(false)`
或修改同步阻塞为`string result = await FetchDataAsync()`。因为本例不更新ui所以可以不需要强制回到ui线程。
如果不关注上下文可以使用 **ConfigureAwait(false)** 
现在大多数情况都没有同步上下文了:WinFrom你用吗？不用关注;WPF你用吗？用的话可以关注;控制台程序/后台线程?,没有同步上下文;ASP.NET Core?没有同步上下文。只有那些自定义的环境需要同步上下文,这里定制需求就很高了。

