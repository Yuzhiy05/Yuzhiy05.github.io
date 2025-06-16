---
title: c#随记
createTime: 2024/12/04 16:06:14
permalink: /article/vqkwmfa2/
---


System.Collections.Generic
c#中的泛型集合

Thread
C#线程分前台线程和后台线程，前台线程需要进程等待其结束，而后台进程在前台进程执行完
后进程结束时自动中止。

```c#
public bool IsBackground { get; set; }
```

:::tip
默认情况下
主线程，所有通过Thread构造函数构造的线程都为前台线程(IsBackground返回false)
由运行时提供的线程池线程，从非托管代码进入托管执行环境的所有线程为后台线程
:::

:::info
| 类型           | 版本                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| .NET           | Core 1.0, Core 1.1, Core 2.0, Core 2.1, Core 2.2, Core 3.0, Core 3.1, 5, 6, 7, 8, 9          |
| .NET Framework | 1.1, 2.0, 3.0, 3.5, 4.0, 4.5, 4.5.1, 4.5.2, 4.6, 4.6.1, 4.6.2, 4.7, 4.7.1, 4.7.2, 4.8, 4.8.1 |
| .NET Standard  | 2.0, 2.1                                                                                     |
:::

```c#
public static bool Yield ();
```
让出当前线程的时间片给，由操作系统选择其他线程。
仅限于执行调用线程的处理器。 操作系统不会将执行切换到另一个处理器，即使该处理器处于空闲状态或正在运行优先级较低的线程也是如此。 如果没有其他线程已准备好在当前处理器上执行，则操作系统不会生成执行，此方法返回 false
此方法等效于使用平台调用调用本机 Win32 SwitchToThread 函数。

```c#
[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public void Start ();
```
启动线程

控件的Invoke方法
在主线程间开子线程，如果子线程需要修改主线程的空间则需要Invoke方法.不然线程间资源无法跨线程访问。同时Invoke会把委托交给主线程运行。阻塞当前子线程。当主线程执行完成后返回子线程所谓"同步"

Invoke
```c#
private void button1_Click(object sender, EventArgs e)
{
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+"AAA");
            var invokeThread = new Thread(new ThreadStart(StartMethod));
            invokeThread.Start();
            string a = string.Empty;
            for (int i = 0; i < 3; i++)      //调整循环次数，看的会更清楚
            {
                Thread.Sleep(1000);   
                a = a + "B";
            }
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+a);
}
 private void StartMethod()
{
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+"CCC");
            button1.Invoke(new Action(invokeMethod));  
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+"DDD");
}

 private void invokeMethod()
{
            //Thread.Sleep(3000);
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString() + "EEE");
}
```

和begininvoke的区别

```c#
private void button1_Click(object sender, EventArgs e)
{
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+"AAA");
            var invokeThread = new Thread(new ThreadStart(StartMethod));
            invokeThread.Start();
            string a = string.Empty;
            for (int i = 0; i < 3; i++)      //调整循环次数，看的会更清楚
            {
                Thread.Sleep(1000);   
                a = a + "B";
            }
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+a);
}

 private void StartMethod()
{
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+"CCC");
            button1.BeginInvoke(new Action(invokeMethod));  
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString()+"DDD");
}

 private void beginInvokeMethod()
        {
            //Thread.Sleep(3000);
            MessageBox.Show(Thread.CurrentThread.GetHashCode().ToString() + "EEEEEEEEEEEE");
        }
```

将方法委托给主线程后，子线程可继续执行DDD而不需要等待主线程返回。

在多线程编程中，我们经常要在工作线程中去更新界面显示，而在多线程中直接调用界面控件的方法是错误的做法，Invoke 和 BeginInvoke 就是为了解决这个问题而出现的，使你在多线程中安全的更新界面显示。

正确的做法是将工作线程中涉及更新界面的代码封装为一个方法，通过 Invoke 或者 BeginInvoke 去调用，两者的区别就是一个导致工作线程等待，而另外一个则不会

在 WinForm开发过程中经常会用到线程，有时候还往往需要在线程中访问线程外的控件，比如：设置textbox的Text属性等等。如果直接设置程序必 定会报出：从不是创建控件的线程访问它，这个异常。通常我们可以采用两种方法来解决。一是通过设置control的属性。二是通过delegate,而通 过delegate也有两种方式，一种是常用的方式，另一种就是匿名方式。下面分别加以说明.
 

首先，通过设置control的一个属性值为false.我们可以在Form_Load方法中添加：Control.CheckForIllegalCrossThreadCalls=false;来解决。设置为false表示不对错误线程的调用进行捕获。这样在线程中对textbox的Text属性进行设置时就不会再报错了。

Invoke(Action)	
在拥有控件的基础窗口句柄的线程上执行指定的委托。

Invoke(Delegate)	
在拥有控件的基础窗口句柄的线程上执行指定的委托。

Invoke(Delegate, Object[])	
在拥有控件的基础窗口句柄的线程上，使用指定的参数列表执行指定的委托。
```c#
Invoke<T>(Func<T>)	
//在拥有控件的基础窗口句柄的线程上执行指定的委托。
```

还有一种多线程的例子
TaskScheduler的方法

TaskScheduler.FromCurrentSynchronizationContext 

ui的线程调度器

返回与当前同步上下文关联的调度器TaskScheduler
与Invoke类似的是此方法也是防止在多线程中在不同的线程更新ui控件的方式

Task下面其实有不同的任务调度器

1.SynchronizationContextTaskScheduler UI同步上下文的任务调度器
2.ThreadPoolTaskScheduler  线程池调度器  TaskScheduler.Default
3.ConcurrentExclusiveSchedulerPair   自定义任务调度器

例子
```c#
   private async void button_ClickAsync(object sender, EventArgs e)
   {
       // 在后台线程上执行一些工作
       await Task.Run(() =>
       {
           Thread.Sleep(2000); // 模拟长时间运行的任务
       });

       // 使用 TaskScheduler.FromCurrentSynchronizationContext 在 UI 线程上更新 UI 控件
       await Task.Factory.StartNew(() =>
       {
           this.textBox.Text = "任务完成";
       }, TaskScheduler.FromCurrentSynchronizationContext());
   }
```
ContinueWith 在任务执行完成后启动，回到UI线程的上下文调用控件

Console.WriteLine("Task Method : Task {0} is running on a thread id: {1}. Is thread pool thread: {2}",
            name, Thread.CurrentThread.ManagedThreadId, Thread.CurrentThread.IsThreadPoolThread);
            Thread.Sleep(TimeSpan.FromSeconds(seconds));



# C#的异常

不同表达式 CLR会记录不同的异常起点

```c#
try{
    ///
}
catch(Exception e){
  throw;            //clr不会改变异常抛出点的认识
}
//
try{
    ///
}
catch(Exception e){
  throw e;            //clr会认为这是异常起点
}
```
CLR via c# 一书中说了这么一种情况，我感觉不对
>不管抛出还是重新抛出异常,但是windows会重置堆栈起点。如果一个异常成为一个未处理的异常,那么向windows error reporting 报告的栈位置就是最后一次抛出或重新抛出的位置(即使CLR知道异常的原始抛出位置)。假如应用程序在字段(?,什么字段这里书上没说明),会使调试工作变的异常困难
问copilot，他给了个例子，他说下面例子:
•	异常包装：如果静态字段初始化失败，CLR 会抛出 TypeInitializationException，它只告诉你“类型初始化失败”，但不会直接告诉你是哪个字段、哪一行代码出错。
•	堆栈丢失细节：未处理异常被 WER 捕获时，堆栈信息只显示“最后一次抛出或重新抛出”的位置（如类型构造器、构造函数），而不是字段初始化的具体表达式。
•	自动生成代码：字段初始化代码通常被编译器插入到构造函数或类型构造器（.cctor）中，堆栈信息只显示到这些自动生成的方法，缺少具体字段名和初始化表达式的上下文。
•	定位困难：如果一个类有多个字段初始化，异常信息不会告诉你是哪个字段出错，只能靠排查或代码审查。

我在vs跑了一下，能定位到 x = GetValue()这一行啊,纯扯淡
```c#
class test{
 static int x = GetValue(); // 静态字段初始化
 static int GetValue() => throw new Exception("fail");
}
//clr via c# 给出一个写法
private void somedemo()
{
    bool trysuceeeds = false;
    try
    {
        //
        trysuceeeds = true;
    }
    finally
    {
        if ( !trysuceeeds)
        {
            /*捕获代码放这里*/
        }
    }
}
```
tips c# 构造函数 成员初始化列表 只允许this,和base? 没找到资料
抄书自定义异常类


一些作者认为的异常处理原则

作者举了一个例子
```c#
private static Object OneStatement(Stream stream_,char charToFind)
{
    return (charToFind+":"+stream_.GetType()+string.Empty+(stream_.Position+512m))
        .Where(c => c == charToFind).ToArray();
}
```
这里需要看一下生成IL
有许多抛异常的地方,这里抛的异常都是不是代码编写者能控制的，我们不可能预料掉所有的异常，所以不可能catch所有的异常。像OutOfMemoryException 这种异常很少发生就不需要管。牺牲一些代码的可靠性换取开发效率。同时用Exception更广泛基类异常去catch派生类的异常也不对，每个错误的恢复处理都不同，所以具体的错误要更具体的处理

### 错误状态
使用异常会中止执行，导致状态被破坏，例如如一个转账函数，一方扣钱，另一方加钱，中间发生了异常就会导致状态错误。这种严重的状态错误就不可能catch异常后让他继续执行了。
关于回滚,上述问题触发时，一个解决办法是使用回滚操作把状态回退，但回滚操作必须简单到不抛出异常，不然状态会变得更遭
1.执行catch或finllay中的代码时,CLR不允许线程终止
[Thread.Abort Method](https://learn.microsoft.com/en-us/dotnet/api/system.threading.thread.abort?view=net-9.0)
Remarks
>Unexecuted finally blocks are executed before the thread is aborted.

这里是说finally不执行只有在某些立即终止的异常的情况下
[try-finally](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements#the-try-finally-statement)
>Execution of the finally block depends on whether the operating system chooses to trigger an exception unwind operation. The only cases where finally blocks aren't executed involve immediate termination of a program. For example, such a termination might happen because of the Environment.FailFast call or an OverflowException or InvalidProgramException exception. Most operating systems perform a reasonable resource clean-up as part of stopping and unloading the process.


```c#
public static void Transfer(int from,int to,Decimal amount)
    {
        try
        {
            //do nothing
        }
        finally
        {
            from-= (int)amount;
            //这里不可能因为•	Thread.Abort()中止，当然手动调用会，线程在执行 finally 块时收到中止请求，CLR 会延迟中止
            to += (int)amount;
        }

    }
```

2.使用契约 System.Diagnostics.Contracts.Contract
验证参数的状态,不满足状态的参数在代码执行前抛出异常
//这部分我还没看得参考msdn

3.约束执行区域 CER
消除潜在的异常
//这部分我也没看
4.使用事务 System.Transactions.Transaction
如数据库，数据要么修改要么不修改

5.使用Monitor 获取释放线程同步锁
//没看，这是多线程内容我会安排尽早阅读

6.如果状态无法修复了就该直接中止，不要让错误状态蔓延，然后重启应用
使用AppDomian Unload卸载整个应用域或者使用Environment.FailFast强行中止线程。这个方法把错误写入windows application 事件日志,生成错误报告,创建dump，中止程序

### 异常使用和设计规范



