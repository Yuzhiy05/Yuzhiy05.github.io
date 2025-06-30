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
不要catch(System.Expection ex)捕获所有异常，把异常吞掉,不能无视错误。同时捕获后重新抛会改变异常抛出点，不利于debug。
例外在进行回滚操作时可能需要捕获所有异常,一旦发生异常状态将所作操作进行回滚。并重抛异常。
tips:读者注:不过这个回滚要看异常发生的频率，高频的抛异常然后回滚可能是程序bug，要赶紧debug，异常从来不是在热路径(高频发生)
只捕获预期到的异常。作者举的例子其实不好，有些时候验证函数参数应该用契约而不是等异常发生时抛异常
不过CLR允许异步的异常也就是一个线程抛异常被接到后返回线程池由另一个线程重新抛出(需要使用某些方法)
错误的程序该中止时就要立即中止:使用AppDomian Unload卸载整个应用域或者使用Environment.FailFast强行中止线程。这个方法把错误写入windows application 事件日志,生成错误报告,创建dump，中止程序

该书的20.8.5一节 作者谨慎的介绍了
几种场景,捕获异常后重新抛一个新异常,谨慎使用
1.隐藏具体实现。把原先抛出的异常(非用户预期的)catch后重抛一个用户能理解/预期的新异常。用户不需要关心实现细节。
2.在异常中添加额外的上下文和内容
```c#
private static void do()
{
  try{
    //dosmting
  }
  catch(IOExpection ex){
    //将文件名添加到异常对象中
    ex.Data.Add("Filename",filename);
    throw //重抛同一个对象
  }
}
```

3.编译器会隐式调用类型构造器,假设类型构造器中抛出异常并且没有在类型构造器中捕获(预期之外的异常如DivideByZeroException).编译器会捕获,并重抛一个TypeInitializationException异常。这将告诉你异常发生在类型构造器而不是你的代码。DivideByZeroException之类的异常可能被其他的地方捕获从而恢复了，你甚至不知道你调用了类型构造器(这是编译器隐式调用的)
//这个我还没写代码测试

4.还有一个是使用反射的例子在书429页 20.8.2节我不想看2
20.9节介绍一些如何查看未处理异常和对待未处理异常的态度

5.Vistual studio对异常调试的支持
点击*调试*-*窗口*-*异常设置*
在下方显示勾选框中 *Common Lanuage Runtime Exception* 项 的展开项中
可以勾选指定的异常,在该异常出触发时直接中断不会匹配任意的可被捕获的catch块。只要你怀疑库或组件吞异常了但是不知道在哪里打断点这个方法很有用

一个小趣事
Microsoft 从用户那了解到调用Int32的Prase方法时用户可能经典调用无法解析的数据,频繁调用Parse方法抛出和捕获异常对性能造成了很大的损失。所以微软搞了个TryParse `public static bool TryParse(string? s, out int result);` 这个方法重载很多以这个举例。返回值表示成功或失败,result 的出参在成功时为结果,失败时为0. 不过某些重载中需要提供`System.Globalization.NumberStyles `类型的参数 如果提供的参数不满足要求同样会抛出*ArgumentException*错误

20.12,20.13节分别介绍了CRE约束执行区域(大概意思是划定一块代码finally最好执行，如果不能执行那么在进入try之前就中止--抛异常)契约(书中翻译为协定)不想看



### 异常使用和设计规范

1.c#的一些语法糖会自带finally 语句

[lock语句](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/lock)
下面这玩意看不出来
```c#
public static void MLockTest()
{
    int count = 0;
    object syncObj = new object();

    var t1 = Task.Run(() =>
    {
        for (int i = 0; i < 5; i++)
        {
            lock (syncObj)
            {
                count++;
                Console.WriteLine($"[线程1] Count is now {count}");
            }
            Thread.Sleep(10);
        }
    });

    var t2 = Task.Run(() =>
    {
        for (int i = 0; i < 5; i++)
        {
            lock (syncObj)
            {
                count++;
                Console.WriteLine($"[线程2] Count is now {count}");
            }
            Thread.Sleep(10);
        }
    });

    t1.Wait();
    t2.Wait();

}

//缩减一下
public static void ForIL1()
{
    int count = 0;
    var lockObj = new System.Threading.Lock();
    lock (lockObj)
    {
        count++;
        Console.WriteLine($"Count is now {count}");
    }
}
//下面这是生成Il
.method public hidebysig static void  ForIL1() cil managed
{
  // 代码大小       78 (0x4e)
  .maxstack  2
  .locals init (int32 V_0,
           class [System.Runtime]System.Threading.Lock V_1,
           valuetype [System.Runtime]System.Threading.Lock/Scope V_2,
           valuetype [System.Runtime]System.Runtime.CompilerServices.DefaultInterpolatedStringHandler V_3)
  IL_0000:  nop
  IL_0001:  ldc.i4.0
  IL_0002:  stloc.0
  IL_0003:  newobj     instance void [System.Runtime]System.Threading.Lock::.ctor()
  IL_0008:  stloc.1
  IL_0009:  ldloc.1
  IL_000a:  callvirt   instance valuetype [System.Runtime]System.Threading.Lock/Scope [System.Runtime]System.Threading.Lock::EnterScope()
  IL_000f:  stloc.2
  .try
  {
    IL_0010:  nop
    IL_0011:  ldloc.0
    IL_0012:  ldc.i4.1
    IL_0013:  add
    IL_0014:  stloc.0
    IL_0015:  ldc.i4.s   13
    IL_0017:  ldc.i4.1
    IL_0018:  newobj     instance void [System.Runtime]System.Runtime.CompilerServices.DefaultInterpolatedStringHandler::.ctor(int32,
                                                                                                                               int32)
    IL_001d:  stloc.3
    IL_001e:  ldloca.s   V_3
    IL_0020:  ldstr      "Count is now "
    IL_0025:  call       instance void [System.Runtime]System.Runtime.CompilerServices.DefaultInterpolatedStringHandler::AppendLiteral(string)
    IL_002a:  nop
    IL_002b:  ldloca.s   V_3
    IL_002d:  ldloc.0
    IL_002e:  call       instance void [System.Runtime]System.Runtime.CompilerServices.DefaultInterpolatedStringHandler::AppendFormatted<int32>(!!0)
    IL_0033:  nop
    IL_0034:  ldloca.s   V_3
    IL_0036:  call       instance string [System.Runtime]System.Runtime.CompilerServices.DefaultInterpolatedStringHandler::ToStringAndClear()
    IL_003b:  call       void [System.Console]System.Console::WriteLine(string)
    IL_0040:  nop
    IL_0041:  nop
    IL_0042:  leave.s    IL_004d
  }  // end .try
  finally
  {
    IL_0044:  ldloca.s   V_2
    IL_0046:  call       instance void [System.Runtime]System.Threading.Lock/Scope::Dispose()
    IL_004b:  nop
    IL_004c:  endfinally
  }  // end handler
  IL_004d:  ret
} // end of method Program::ForIL1
```
可以看到使用try和finally
根据MSDN的说法Lock(x) x是System.Threading.Lock时是
```c#
using (x.EnterScope())
{
    // Your code...
}
```
的语法糖，而using语句又是try-finally的语法糖
顺便说一下Lock类是.net9 C#13 新加的

2.使用using 语句 结束时调用对象的Dispose方法
比较典型的例子 是使用文件流的类 FileStream

3.foreach 语句结束后调用枚举器 的Dispose方法释放资源

4.析构器,对象销毁时在finally块中调用基类的Finalize方法
```c#
public static void ForIL1()
{
    var numbers = new List<int>();
    using (StreamReader reader = File.OpenText("C:/Users/Yuzhiy/Desktop/111.txt"))
    {
        string line;
        while ((line = reader.ReadLine()) is not null)
        {
            if (int.TryParse(line, out int number))
            {
                numbers.Add(number);
            }
        }
    }
    foreach (var number in numbers)
    {
        Console.WriteLine(number);
    }
}
//下面是生成的IL
.method public hidebysig static void  ForIL1() cil managed
{
  // 代码大小       138 (0x8a)
  .maxstack  2
  .locals init (class [System.Collections]System.Collections.Generic.List`1<int32> V_0,
           class [System.Runtime]System.IO.StreamReader V_1,
           string V_2,
           int32 V_3,
           bool V_4,
           bool V_5,
           valuetype [System.Collections]System.Collections.Generic.List`1/Enumerator<int32> V_6,
           int32 V_7)
  IL_0000:  nop
  IL_0001:  newobj     instance void class [System.Collections]System.Collections.Generic.List`1<int32>::.ctor()
  IL_0006:  stloc.0
  IL_0007:  ldstr      "C:/Users/Yuzhiy/Desktop/111.txt"
  IL_000c:  call       class [System.Runtime]System.IO.StreamReader [System.Runtime]System.IO.File::OpenText(string)
  IL_0011:  stloc.1
  .try
  {
    IL_0012:  nop
    IL_0013:  br.s       IL_002f
    IL_0015:  nop
    IL_0016:  ldloc.2
    IL_0017:  ldloca.s   V_3
    IL_0019:  call       bool [System.Runtime]System.Int32::TryParse(string,
                                                                     int32&)
    IL_001e:  stloc.s    V_4
    IL_0020:  ldloc.s    V_4
    IL_0022:  brfalse.s  IL_002e
    IL_0024:  nop
    IL_0025:  ldloc.0
    IL_0026:  ldloc.3
    IL_0027:  callvirt   instance void class [System.Collections]System.Collections.Generic.List`1<int32>::Add(!0)
    IL_002c:  nop
    IL_002d:  nop
    IL_002e:  nop
    IL_002f:  ldloc.1
    IL_0030:  callvirt   instance string [System.Runtime]System.IO.TextReader::ReadLine()
    IL_0035:  dup
    IL_0036:  stloc.2
    IL_0037:  ldnull
    IL_0038:  ceq
    IL_003a:  ldc.i4.0
    IL_003b:  ceq
    IL_003d:  stloc.s    V_5
    IL_003f:  ldloc.s    V_5
    IL_0041:  brtrue.s   IL_0015
    IL_0043:  nop
    IL_0044:  leave.s    IL_0051
  }  // end .try
  finally
  {
    IL_0046:  ldloc.1
    IL_0047:  brfalse.s  IL_0050
    IL_0049:  ldloc.1
    IL_004a:  callvirt   instance void [System.Runtime]System.IDisposable::Dispose()
    IL_004f:  nop
    IL_0050:  endfinally
  }  // end handler
  IL_0051:  nop
  IL_0052:  ldloc.0
  IL_0053:  callvirt   instance valuetype [System.Collections]System.Collections.Generic.List`1/Enumerator<!0> class [System.Collections]System.Collections.Generic.List`1<int32>::GetEnumerator()
  IL_0058:  stloc.s    V_6
  .try
  {
    IL_005a:  br.s       IL_006f
    IL_005c:  ldloca.s   V_6
    IL_005e:  call       instance !0 valuetype [System.Collections]System.Collections.Generic.List`1/Enumerator<int32>::get_Current()
    IL_0063:  stloc.s    V_7
    IL_0065:  nop
    IL_0066:  ldloc.s    V_7
    IL_0068:  call       void [System.Console]System.Console::WriteLine(int32)
    IL_006d:  nop
    IL_006e:  nop
    IL_006f:  ldloca.s   V_6
    IL_0071:  call       instance bool valuetype [System.Collections]System.Collections.Generic.List`1/Enumerator<int32>::MoveNext()
    IL_0076:  brtrue.s   IL_005c
    IL_0078:  leave.s    IL_0089
  }  // end .try
  finally
  {
    IL_007a:  ldloca.s   V_6
    IL_007c:  constrained. valuetype [System.Collections]System.Collections.Generic.List`1/Enumerator<int32>
    IL_0082:  callvirt   instance void [System.Runtime]System.IDisposable::Dispose()
    IL_0087:  nop
    IL_0088:  endfinally
  }  // end handler
  IL_0089:  ret
} // end of method Program::ForIL1
```、
可以看到分别为using语句和foreach语句分别生成的try-finally块并执行对应的Dispoe方法

## c#中的记时功能
很多时候程序需要计时,需要个now,timespan之类的东西

Stopwatch 这玩意说三个属性

```c#
跑了从start到stop 经过多少秒返回的TimeSpan
public TimeSpan Elapsed { get; }
//返回值为毫秒
public long ElapsedMilliseconds { get; }
//返回时钟周期
public long ElapsedTicks { get; }
//这两有关联
public static readonly long Frequency;
```
Stopwatch.Frequency 表示一个频率。计时器测量时间的最小单位。tick这玩意就表示时钟的"滴答"
假设Frequency=10,000,000。说明计时器一秒跳1千万次，以这个频率计时。
由于1秒=1,000,000,000纳秒(10亿) 。这样算每tick一下过了
1,000,000,000ns/10,000,000 tick=100 ns/tick.说明这个时钟每跳动一下走了100ns.
将该值转换为其他单位时
```c#
var second=(double)stopwatch.ElapsedTicks / Stopwatch.Frequency;
var nanosecond=(double)stopwatch.ElapsedTicks / Stopwatch.Frequency*1000L;
```
几个常用方法解释
Start 计数器开始计数
Stop  停止计数
Restart 停止计时并删除已经累计时间,并重新开始计时
Reset  停止计时,累计时间清零
StartNew 这玩意和其他不一样他是静态函数,调用他返回一个新StopWatch实例并使用Start()
还有两个静态方法
```c#
var start=Stopwatch.GetTimestamp();
 Thread.Sleep(100); // 模拟一些耗时操作
var end = Stopwatch.GetTimestamp();

Console.WriteLine(Stopwatch.GetElapsedTime(start,end));
//或者没end，GetElapsedTime还有重载
//Stopwatch.GetElapsedTime(start)获取时间戳到现在经过的时间.

```
使用GetElapsedTime不用自己end-start再转换,这个方法直接返回一个Timespan,GetTimestamp返回一个long类型的当前时间刻度(tick)

