---
title: C#多线程
createTime: 2025/09/09 10:57:50
permalink: /article/7nnotyg2/
---

## C# 多线程初入

- Thread
- Threadpool

在c++ 等语言中的的线程通常都是使用直接映射操作系统的抽象的Thread类 C#中也存在但是C#提供了相对更高级的抽象来管理线程称为"task"任务。同时C#是托管语言即使是Thread线程抽象也是比c++ 线程抽象度更高的托管线程

- Task
- Task.Factory

## Threadpool

c# 提供的线程池功能，可以执行任务,排队发送任务等。定义在`System.Threading`中的静态类为全局提供线程池。线程池的线程都是后台线程,也就是说和主线程分离,主线程不会等待后台线程结束才结束。

线程池由三个部分组成：

### 工作线程

可在创建线程池指定工作线程数量,在任务过多时线程池也会动态增加,无任务时线程池会主动结束过多的等待线程总之线程池会动态调整负载。

### I/O线程

调用Windows的IOCP机制，专门处理IO任务。

### 任务队列

一个总的全局任务队列,每个工作线程再对接一个工作任务队列。工作线程先从主要负责对接的任务队列取任务执行,之后才会取总的任务队列,如果实在没有任务可取了就会等待。`Task.Run` 或 `QueueUserWorkItem` 就是向其中添加任务。

### 常用API介绍

```csharp
public static class ThreadPool
```

### 1.排入任务队列

```csharp
public static bool QueueUserWorkItem(System.Threading.WaitCallback callBack);

public static bool QueueUserWorkItem(System.Threading.WaitCallback callBack, object? state);

public static bool QueueUserWorkItem<TState>(Action<TState> callBack, TState state, bool preferLocal);

//例子
Action<int> rop = t => { Console.WriteLine(t); };
ThreadPool.QueueUserWorkItem(rop, 1, true);
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| callBack | WaitCallback | 回调函数 |
| state | object? / TState | 传入回调的参数 |
| preferLocal | bool | 线程亲和性：`true` → 尝试入当前线程的局部队列；`false` → 优先放到线程池的共享队列 |

:::tip
`preferLocal` 参数的目的主要是性能优化（缓存命中、减少同步/窃取开销）。
:::

**返回值：** 表示方法是否排队成功。

`WaitCallback` 类型定义如下：

```csharp
public delegate void WaitCallback(object? state);
```

还有三个 `Unsafe` 版本的重载：

```csharp
public static bool UnsafeQueueUserWorkItem(System.Threading.IThreadPoolWorkItem callBack, bool preferLocal);

public static bool UnsafeQueueUserWorkItem(System.Threading.WaitCallback callBack, object? state);

public static bool UnsafeQueueUserWorkItem<TState>(Action<TState> callBack, TState state, bool preferLocal);
```

:::warning Unsafe 版本的安全风险
引用MSDN的说明：

> Unlike the QueueUserWorkItem method, UnsafeQueueUserWorkItem does not propagate the calling stack to the worker thread. This allows code to lose the calling stack and thereby to elevate its security privileges.

> Using UnsafeQueueUserWorkItem could inadvertently open up a security hole. Code access security bases its permission checks on the permissions of all the callers on the stack. When work is queued on a thread pool thread using UnsafeQueueUserWorkItem, the stack of the thread pool thread will not have the context of the actual callers. Malicious code might be able exploit this to avoid permission checks.

意思大致是Unsafe版本不会将调用时的栈传入工作线程,工作线程没有调用时的上下文。代码访问安全性的权限检查基于堆栈上所有调用方的权限,Unsafe版本丢失栈信息可能会被恶意代码利用。
:::

其中 `IThreadPoolWorkItem` 类型 callback 参数表示一个存在 `Execute()` 方法的接口：

```csharp
public interface IThreadPoolWorkItem
{
    public void Execute();
}
```

其他参数和非Unsafe版本一样。

### 2.注册等待回调

`RegisterWaitForSingleObject` 方法：

```csharp
[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public static RegisteredWaitHandle RegisterWaitForSingleObject(WaitHandle waitObject, WaitOrTimerCallback callBack, object? state, TimeSpan timeout, bool executeOnlyOnce);

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public static RegisteredWaitHandle RegisterWaitForSingleObject(WaitHandle waitObject, WaitOrTimerCallback callBack, object? state, int millisecondsTimeOutInterval, bool executeOnlyOnce);

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public static RegisteredWaitHandle RegisterWaitForSingleObject(WaitHandle waitObject, WaitOrTimerCallback callBack, object? state, long millisecondsTimeOutInterval, bool executeOnlyOnce);
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| waitObject | WaitHandle | 封装了等待对共享资源进行独占访问的操作系统特定的对象（类似mutex，但这里不能是mutex） |
| callBack | WaitOrTimerCallback | 回调委托 |
| state | object? | 传递给回调的参数 |
| timeout | TimeSpan / int / long | 超时时间。为 0 则函数立刻执行并立即返回；为 -1 则函数的超时间隔永远不过期 |
| executeOnlyOnce | bool | `true` 表示在调用了委托后，线程将不再在 waitObject 参数上等待；`false` 表示每次完成等待操作后都重置计时器，直到注销等待 |

**返回类型：** `RegisteredWaitHandle`（本机资源封装的类型）

`WaitOrTimerCallback` 类型定义：

```csharp
public delegate void WaitOrTimerCallback(object? state, bool timedOut);
```

该函数语义是等待 `waitObject` 发出信号线程池调用对应回调。这是个很底层的api可以暂时不管。

详细参考 [msdn](https://learn.microsoft.com/zh-cn/dotnet/api/system.threading.threadpool.registerwaitforsingleobject?view=net-8.0)

### 手写简单的线程池

## Task

==Task 是 C# 中更高级的抽象来管理线程==

### 创建Task

1. `var t = new Task(Action op); t.Start();`
2. `Task.Run(Action op)`
3. `Task.Factory.StartNew`

`Task.Factory.StartNew` 比 `Task.Run` 有更多更细致的对任务的控制，例如：
- CancellationToken
- TaskCreationOptions
- TaskContinuationOptions
- TaskScheduler

同时用来创建一组任务避免每次向Task传递相同参数。

### Task的状态

`TaskStatus` 枚举：

| 值 | 名称 | 说明 |
|----|------|------|
| 0 | Created | The task has been initialized but has not yet been scheduled. 可以显示start |
| 1 | WaitingForActivation | The task is waiting to be activated and scheduled internally by the .NET infrastructure. 隐式创建自动开启 |
| 2 | WaitingToRun | The task has been scheduled for execution but has not yet begun executing. 被调度还未运行 |
| 3 | Running | The task is running but has not yet completed. 正在运行 |
| 4 | WaitingForChildrenToComplete | The task has finished executing and is implicitly waiting for attached child tasks to complete. 等待子任务运行完才能结束 |
| 5 | RanToCompletion | The task completed execution successfully. |
| 6 | Canceled | The task acknowledged cancellation by throwing an OperationCanceledException with its own CancellationToken while the token was in signaled state, or the task's CancellationToken was already signaled before the task started executing. |
| 7 | Faulted | The task completed due to an unhandled exception. |

:::tip
以下三个状态都叫完成，三种状态Task的 `IsCompleted` 属性都返回 `true`（成功运行结束属性 `IsCompletedSuccessfully`）：
- RanToCompletion (5)
- Canceled (6)
- Faulted (7)
:::

## TaskFactory

### 延续任务

- ContinueWhenAll
- ContinueWhenAny

:::warning 注意
`Not` / `Only` 开头的 `TaskContinueOptions` 选项对这两个函数来说都是非法参数，因为无论如何后续任务都会执行。
:::

## TaskScheduler

任务调度器，这个类有些类似 `Threadpool` 之于 `Thread`。线程池对象是对具体线程集合的调度，那么任务调度器 `TaskScheduler` 就是对抽象任务 `Task` 的调度。

`TaskScheduler` 属于在 `Task`（任务）和具体线程之前的一层抽象。面向用户时，用户直接使用 `Task` 进行任务，在构造 `Task` 或 `TaskFactory` 时传入 `TaskScheduler` 对象来控制任务具体怎么被调度。而 `TaskScheduler` 是对CLR多个具体调度器的统一抽象，由具体的调度器再调度任务如何执行。

反编译一下这个类：

```csharp
public abstract class TaskScheduler
{
    protected TaskScheduler();

    public static TaskScheduler Current { get; }

    public static TaskScheduler Default { get; }

    public int Id { get; }

    public virtual int MaximumConcurrencyLevel { get; }

    public static event EventHandler<UnobservedTaskExceptionEventArgs>? UnobservedTaskException;

    public static TaskScheduler FromCurrentSynchronizationContext()
    {
        return new SynchronizationContextTaskScheduler(); // 这是一个内部类
    }

    protected abstract IEnumerable<Task>? GetScheduledTasks();

    protected bool TryExecuteTask(Task task);

    protected abstract bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued);

    protected internal abstract void QueueTask(Task task);

    protected internal virtual bool TryDequeue(Task task);
}

internal sealed class SynchronizationContextTaskScheduler : TaskScheduler
{
    private readonly SynchronizationContext m_synchronizationContext;

    internal SynchronizationContextTaskScheduler()
    {
        m_synchronizationContext = SynchronizationContext.Current ??
            throw new InvalidOperationException(SR.TaskScheduler_FromCurrentSynchronizationContext_NoCurrent);
    }

    protected internal override void QueueTask(Task task)
    {
        m_synchronizationContext.Post(s_postCallback, (object)task);
    }

    protected override bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued)
    {
        if (SynchronizationContext.Current == m_synchronizationContext)
        {
            return TryExecuteTask(task);
        }
        else
        {
            return false;
        }
    }

    protected override IEnumerable<Task>? GetScheduledTasks()
    {
        return null;
    }

    public override int MaximumConcurrencyLevel => 1;

    private static readonly SendOrPostCallback s_postCallback = static s =>
    {
        Debug.Assert(s is Task);
        ((Task)s).ExecuteEntry();
    };
}
```

这个类实例有一个静态属性 `Default`，返回默认调度器也就是在Threadpool部分所说的全局静态线程池，他的类型 `ThreadPoolTaskScheduler`。

### 用法

1. 在 `new Task` 后使用 `Start` 启动作为函数参数传入。注意 `Task.Run(...)` 和 `Task` 的构造函数参数是没有 `TaskScheduler` 类型的，他默认线程池调度器
2. 构造 `TaskFactory` 时作为构造函数参数传入或作为 `StartNew` 参数传入
3. `Task.ContinueWith`
4. `Parallel` 类内部
5. PLINQ

示例：

```csharp
// 1. 使用 Start 方法传入调度器
var t = new Task(() => Console.WriteLine("hello"));
TaskScheduler uiScheduler = TaskScheduler.FromCurrentSynchronizationContext();
t.Start(uiScheduler);

// 2. 使用 TaskFactory 传入调度器
var customScheduler = new LimitedConcurrencyLevelTaskScheduler(2);
var task = Task.Factory.StartNew(() =>
{
    Console.WriteLine($"Running on thread: {Thread.CurrentThread.ManagedThreadId}");
}, CancellationToken.None, TaskCreationOptions.None, customScheduler);

// 3. ContinueWith 使用调度器
var initialTask = Task.Run(() => GetData());
var continuation = initialTask.ContinueWith(
    continuationAction: antecedent => ProcessData(antecedent.Result),
    scheduler: TaskScheduler.FromCurrentSynchronizationContext() // UI线程
);
var anotherContinuation = initialTask.ContinueWith(
    antecedent => SaveToDatabase(antecedent.Result),
    TaskScheduler.Default // 线程池
);

// 4. Parallel.ForEach 内部使用 TaskScheduler
var options = new ParallelOptions
{
    TaskScheduler = TaskScheduler.Default,
    MaxDegreeOfParallelism = Environment.ProcessorCount
};
Parallel.ForEach(collection, options, item => ProcessItem(item));
```

### 默认调度器 TaskScheduler.Default

类型是 `ThreadPoolTaskScheduler` 的静态字段，作为 `TaskScheduler.Default` 默认返回的对象。

```csharp
// Task.cs
private static readonly TaskScheduler s_defaultTaskScheduler = new ThreadPoolTaskScheduler();

public static TaskScheduler Default => s_defaultTaskScheduler;
```

再看 [实现](https://github.com/dotnet/runtime/blob/1d1bf92fcf43aa6981804dc53c5174445069c9e4/src/libraries/System.Private.CoreLib/src/System/Threading/Tasks/ThreadPoolTaskScheduler.cs)：

```csharp
// ThreadPoolTaskScheduler.cs
internal sealed class ThreadPoolTaskScheduler : TaskScheduler
{
    private static readonly ParameterizedThreadStart s_longRunningThreadWork = static s =>
    {
        Debug.Assert(s is Task);
        ((Task)s).ExecuteEntryUnsafe(threadPoolThread: null);
    };

    protected internal override void QueueTask(Task task)
    {
        TaskCreationOptions options = task.Options;
        if (Thread.IsThreadStartSupported && (options & TaskCreationOptions.LongRunning) != 0)
        {
            // Run LongRunning tasks on their own dedicated thread.
            new Thread(s_longRunningThreadWork)
            {
                IsBackground = true,
                Name = ".NET Long Running Task"
            }.UnsafeStart(task);
        }
        else
        {
            // Normal handling for non-LongRunning tasks.
            ThreadPool.UnsafeQueueUserWorkItemInternal(task, (options & TaskCreationOptions.PreferFairness) == 0);
        }
    }

    protected override bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued)
    {
        if (taskWasPreviouslyQueued && !ThreadPool.TryPopCustomWorkItem(task))
            return false;

        try
        {
            task.ExecuteEntryUnsafe(threadPoolThread: null);
        }
        finally
        {
            if (taskWasPreviouslyQueued) NotifyWorkItemProgress();
        }

        return true;
    }

    protected internal override bool TryDequeue(Task task)
    {
        return ThreadPool.TryPopCustomWorkItem(task);
    }

    protected override IEnumerable<Task> GetScheduledTasks()
    {
        return FilterTasksFromWorkItems(ThreadPool.GetQueuedWorkItems());
    }

    private static IEnumerable<Task> FilterTasksFromWorkItems(IEnumerable<object> tpwItems)
    {
        foreach (object tpwi in tpwItems)
        {
            if (tpwi is Task t)
            {
                yield return t;
            }
        }
    }
    // ...其他实现内容
}
```

**实现说明：**
- `QueueTask` 的作用就是把将任务提交到线程池队列
- 对于使用长任务标记的任务 `LongRunning`，使用单独的线程执行
- 没有其他特殊 `Task.Option` 的任务直接派发到 `ThreadPool` 线程池队列，同时对设置 `PreferFairness` 了的任务底层线程会尽量公平，不然底层线程池调度可能会按照性能进行调度

:::tip
`(options & TaskCreationOptions.PreferFairness) == 0` 这里的写法很讨巧。设置 `Task.Option` 的枚举值可能是由多个其他枚举复合而成，例如 `PreferFairness | LongRunning | HideScheduler`。这样只需要检测符合枚举中是否存在 `PreferFairness` 项即可，而 `options == TaskCreationOptions.PreferFairness` 对于复合枚举值就不适用了。
:::

:::tip
关于 Thread 的 API：Thread 的构造函数有传入委托的版本，`UnsafeStart` 成员函数接受一个 `Object` 对象作为传给委托的参数。具体执行是由 `Task` 类型的一个内部方法 `ExecuteEntryUnsafe` 执行。
:::

```csharp
internal void ExecuteEntryUnsafe(Thread? threadPoolThread)
{
    // Remember that we started running the task delegate.
    m_stateFlags |= (int)TaskStateFlags.DelegateInvoked;

    if (!IsCancellationRequested & !IsCanceled)
    {
        ExecuteWithThreadLocal(ref t_currentTask, threadPoolThread);
    }
    else
    {
        ExecuteEntryCancellationRequestedOrCanceled();
    }
}
```

在本地线程执行就靠 `ExecuteWithThreadLocal` 这个私有函数。

**TryExecuteTaskInline** 在当前线程立刻执行任务避免线程调度：

> If the task was previously scheduled, and we can't pop it, then return false.

线程已经被调度的情况,且在线程池中正常执行无法从底层线程池队列移出,无法在当前线程执行则会返回false。

**TryDequeue** 无需多言，调用底层 `ThreadPool` 移出排队任务。

**GetScheduledTasks** 获取调度任务则是从线程池中获取排队的工作项。

### 自定义调度器

自定义调度器一般要实现 `TaskScheduler` 以下几个方法：

- `QueueTask` - 这个方法在 `StartNew` 这个方法创建Task时调用，将任务开始调度
- `TryExecuteTaskInline`
- `GetScheduledTasks()`

```csharp
var scheduler = new MTaskScheduler(4);
var factory = new TaskFactory(scheduler);

factory.StartNew(() => // StartNew内部调用QueueTask
{
    Console.WriteLine($"Task is running on thread {Thread.CurrentThread.ManagedThreadId}");
    Thread.Sleep(100);
});
```

### 获取同步上下文调度器

`TaskScheduler.FromCurrentSynchronizationContext()`

对于UI上下文来说主线程只有一个，从当前线程获取UI上下文调度器时通过同步上下文的 `Post` 方法发送委托到主线程。也就是说在任务（委托）执行层面由具体的同步上下文调度器调度，该调度再调用 `SynchronizationContext` 这一层抽象使用 `Post` 方法派发任务到具体的UI线程，而 `SynchronizationContext` 又是各个UI线程上下文的抽象，这样的结构和线程池与线程池调度器类似。

### 总结

大体上来说分为：

**1. 任务（最高级别抽象）**
- `Task`
- `Task<TResult>`
- `TaskFactory`
- `TaskCompletionSource`
- `ValueTask` / `ValueTask<TResult>`

**2. TaskScheduler（抽象类）**
- 职责：队列管理、线程分配、执行时机决策
- 关键方法：`QueueTask()`, `TryExecuteTaskInline()`
- 策略模式：定义调度算法，具体实现交给子类

**3. 具体实现的调度器**

| 调度器 | 使用方式 | 内部机制 | 特点 | 限制 |
|--------|----------|----------|------|------|
| ThreadPoolTaskScheduler（系统内置） | `TaskScheduler.Default` | `ThreadPool.QueueUserWorkItem()` | 工作线程池，适合短任务 | 不适合长时间阻塞的任务 |
| SynchronizationContextTaskScheduler（系统内置） | `TaskScheduler.FromCurrentSynchronizationContext()` | `Post()` 到 SynchronizationContext | 单线程执行（如UI线程） | 不能执行耗时操作，否则界面卡顿 |
| Custom TaskScheduler（用户自定义） | 自定义实现 | ThreadPool / Thread / 自定义线程池 | 完全可控的调度策略 | 特殊并发控制、测试框架等 |

**4. 线程执行**

| 线程类型 | 组成/创建方式 | 适用场景 | 特点 |
|----------|---------------|----------|------|
| ThreadPool（全局静态线程池） | Worker Threads, I/O Threads, Timer Threads | CPU密集型短任务、I/O回调 | 线程复用、数量自适应 |
| Dedicated Thread（专用线程） | `new Thread()` | 长时间运行、阻塞型任务 | 独立线程，不受线程池回收影响 |
| UI Thread（UI上下文线程） | SynchronizationContext + 消息循环 | UI交互 | 单线程、消息驱动、STA模型 |

## 同步上下文

==同步上下文是一个执行环境，用来管理任务在哪里执行==

这里有一篇关于同步上下文的 [文章](https://learn.microsoft.com/en-us/archive/msdn-magazine/2011/february/msdn-magazine-parallel-computing-it-s-all-about-the-synchronizationcontext)

同步上下文分为：
- `WinFromSynchronizationContext` - 给WinForm用
- `DispatcherSynchronizationContext` - WPF用
- HTTP 请求同步上下文

`SynchronizationContext` 源码：

```csharp
using System.Collections.Generic;

namespace System.Threading
{
    public partial class SynchronizationContext
    {
        private bool _requireWaitNotification;

        public SynchronizationContext()
        {
        }

        public static SynchronizationContext? Current => Thread.CurrentThread._synchronizationContext;

        protected void SetWaitNotificationRequired() => _requireWaitNotification = true;

        public bool IsWaitNotificationRequired() => _requireWaitNotification;

        public virtual void Send(SendOrPostCallback d, object? state) => d(state);

        public virtual void Post(SendOrPostCallback d, object? state)
            => ThreadPool.QueueUserWorkItem(static s => s.Key(s.Value), new KeyValuePair<SendOrPostCallback, object?>(d, state), preferLocal: false);

        public virtual void OperationStarted()
        {
        }

        public virtual void OperationCompleted()
        {
        }

        [CLSCompliant(false)]
        public virtual int Wait(IntPtr[] waitHandles, bool waitAll, int millisecondsTimeout)
        {
            return WaitHelper(waitHandles, waitAll, millisecondsTimeout);
        }

        [CLSCompliant(false)]
        protected static int WaitHelper(IntPtr[] waitHandles, bool waitAll, int millisecondsTimeout)
        {
            ArgumentNullException.ThrowIfNull(waitHandles);
            return WaitHandle.WaitMultipleIgnoringSyncContext(waitHandles, waitAll, millisecondsTimeout);
        }

        public static void SetSynchronizationContext(SynchronizationContext? syncContext) => Thread.CurrentThread._synchronizationContext = syncContext;

        public virtual SynchronizationContext CreateCopy() => new SynchronizationContext();
    }
}
```

这里最重要的就是 `Send` 和 `Post`。查看 `WindowsFormsSynchronizationContext` 和 `DispatcherSynchronizationContext`，这两个UI上下文都用自身的实现覆盖默认实现。

观察各个实现可以看出即使继承 `TaskScheduler` 需要实现 `QueueTask`，但各个调度排队操作都是直接调用底层API。例如线程同步调度器的 `QueueTask` 方法：

```csharp
m_synchronizationContext.Post(s_postCallback, (object)task);
```

使用的是捕获到的同步上下文的 `Post` 方法。假设是WinForm的同步上下文，再看WinForm的源码：

```csharp
public override void Post(SendOrPostCallback d, object? state)
    => _controlToSendTo?.BeginInvoke(d, [state]);
```

`_controlToSendTo` 类型是 `Control` 类：

```csharp
public sealed class WindowsFormsSynchronizationContext : SynchronizationContext, IDisposable
{
    private Control? _controlToSendTo;
    private WeakReference<Thread>? _destinationThread;
    // ...
}
```

懂WinForm的肯定知道 `Control` 是所有控件的基类，每个控件想要在UI线程上异步执行委托都要使用 `BeginInvoke` 执行，这就涉及到Windows的消息循环机制，委托被发送到消息队列，再由主线程循环取出再执行。

参考 [Control 源码](https://github.com/dotnet/dotnet/blob/b0f34d51fccc69fd334253924abd8d6853fad7aa/src/winforms/src/System.Windows.Forms/System/Windows/Forms/Control.cs#L39)

WinForm每个控件都继承 `Control`，其中每个控件在构造函数中都是设置Windows上下文：

```csharp
// Control.cs
public unsafe partial class Control :
    Component,
    ISupportOleDropSource,
    IDropTarget,
    ISynchronizeInvoke,
    IWin32Window,
    IArrangedElement,
    IBindableComponent,
    IKeyboardToolTip,
    IHandle<HWND>
{
    public Control() : this(true)
    {
    }

    internal Control(bool autoInstallSyncContext) : base()
    {
        // Set up for async operations on this thread.
        if (autoInstallSyncContext)
        {
            WindowsFormsSynchronizationContext.InstallIfNeeded();
        }
    }
}
```

再看线程池也是一样，他同样有一个或多个任务队列，再加上多个（和UI不同）执行线程队列，循环取出任务执行。这两个结构是同构的，都可以使用 `TaskScheduler` 调度器这个抽象来模拟。

回过头来看很清楚 `TaskScheduler` 的API设计了：
- `QueueTask`
- `TryExecuteTask`

他们就是将任务发送到对应底层实现的任务队列中。

### 什么是同步上下文？

他是一个执行环境,用来管理任务在哪里执行（某个线程?UI线程?-不用关心,这些都是同步上下文该关心的）。通常我们不需要管只需要分清不同的同步上下文即可。他的 `Post` 方法将任务派发到特定线程执行。

通常我们不需要手动调用 `Post` 方法，`await` 关键字会自动实现相关调用，`await` 这个异步设施和同步上下文是强相关的。

```csharp
var syncContext = new SingleThreadSynchronizationContext(); // 自定义的同步上下文
SynchronizationContext.SetSynchronizationContext(syncContext);

Console.WriteLine($"[Start] Main thread: {Thread.CurrentThread.ManagedThreadId}");

// --- 调度器的作用 ---
// Task.Run 使用 TaskScheduler.Default (线程池) 来决定在哪里执行。
await Task.Run(() => {
    Console.WriteLine($"[Task.Run body] Running on thread from TaskScheduler: {Thread.CurrentThread.ManagedThreadId}");
});

// --- 同步上下文的作用 ---
// await 完成后，需要恢复执行。
// 它查看捕获的 syncContext，发现不是 null。
// 于是它调用 syncContext.Post(...)，将下面的代码块作为任务投递过来。
Console.WriteLine($"[After await] Now running on the dedicated thread from SyncContext: {Thread.CurrentThread.ManagedThreadId}");

// 手动调用 Post，效果和 await 背后的机制一模一样。
SynchronizationContext.Current!.Post(_ => {
    Console.WriteLine($"[Manual Post] Also on the dedicated thread: {Thread.CurrentThread.ManagedThreadId}");
}, null);

await Task.Delay(1000);
Console.WriteLine($"[After Delay] Still on the dedicated thread: {Thread.CurrentThread.ManagedThreadId}");
```

游戏开发的场景中需要将游戏状态变更或渲染的任务调度到一个专门的线程，或某些网络库的场景中需要一个专门线程处理网络请求。

:::tip 关于同步上下文的理解
同步上下文不是含有某些变量的对象。上下文一词暗含了该对象可能含有变量或是什么，`Context` 翻译成"语境"或"环境"可能更有益于理解。

同步上下文中实现的关键函数 `Send` / `Post` 也能反应出同步上下文只是将回调函数/任务 派发/发送到对应"环境"执行，而不携带类似函数变量相关的东西。
:::

## TaskCompletionSource 将老旧回调代码改造为异步代码

语义上 `TaskCompletionSource<TResult>` 充当 `Task<TResult>` 的生成器。通常其他方法创建的task都需要绑定一个委托（构造或者其他函数中显式传递一个委托/函数），此方法不需要预先设置一个委托/函数。

生成 `TaskCompletionSource<T>` 其中包含一个 `Task<T>` 属性，通过以下方法设置内部Task的状态：
- `SetResult`
- `SetException`
- `SetCanceled`

在MSDN的C#教程中说明这与 `Task.Factory.StartNew` 创建的任务不同。这个方法能让用户显式的控制生成的Task状态。这表示可以将创建的 `TaskCompletionSource` 对象传递出去由不同的逻辑设置Task的状态。

同时返回这个task来实现将原本不能使用现代异步设施 `async` / `await` 的API封装成使用Task的现代异步设施。

### 示例1：将回调代码封装为同步代码供外部调用

```csharp
public class CallbackBasedApi
{
    public void DownloadFileAsync(string url, Action<byte[]> onSuccess, Action<Exception> onError)
    {
        WebClient client = new WebClient();
        client.DownloadDataCompleted += (sender, e) =>
        {
            if (e.Error != null)
                onError(e.Error);
            else
                onSuccess(e.Result);
        };
        client.DownloadDataAsync(new Uri(url));
    }
}

// 使用方式（无法直接使用 await）
void OldWay()
{
    DownloadFileAsync(
        "https://example.com/file",
        data => Console.WriteLine($"下载完成，大小: {data.Length}"),
        error => Console.WriteLine($"下载失败: {error.Message}")
    );
    // 问题：无法等待，只能继续往下执行，不知道何时完成
}
```

再用一个将老旧API（不返回Task）封装一下的例子：

```csharp
public class TaskBasedApi
{
    public Task<byte[]> DownloadFileAsync(string url)
    {
        var tcs = new TaskCompletionSource<byte[]>();
        WebClient client = new WebClient();

        client.DownloadDataCompleted += (sender, e) =>
        {
            if (e.Error != null)
                tcs.TrySetException(e.Error);
            else if (e.Cancelled)
                tcs.TrySetCanceled();
            else
                tcs.TrySetResult(e.Result);
        };

        client.DownloadDataAsync(new Uri(url));
        return tcs.Task;  // 返回 Task，调用者可以用 await
    }
}

// 使用方式（优雅的 async/await）
async Task NewWay()
{
    try
    {
        byte[] data = await DownloadFileAsync("https://example.com/file");
        Console.WriteLine($"下载完成，大小: {data.Length}");
        var processed = await ProcessDataAsync(data);
        await SaveAsync(processed);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"下载失败: {ex.Message}");
    }
}
```

核心仍然是把底层回调包装一下，让调用者可以异步：

```csharp
// 转换公式：
// 回调函数 (onSuccess, onError) + 异步操作 → Task<T>

// 转换前：回调风格
void OperationAsync(params, Action<T> success, Action<Exception> error)

// 转换后：Task 风格
Task<T> OperationAsync(params)

// 内部实现原理：
Task<T> OperationAsync(params)
{
    var tcs = new TaskCompletionSource<T>();

    // 底层仍然是回调模式
    StartAsyncOperation(params,
        result => tcs.TrySetResult(result),      // 回调 → SetResult
        error => tcs.TrySetException(error));    // 回调 → SetException

    return tcs.Task;  // 返回 Task 给调用者
}
```

说实在的现在C#里全是Task我还真没找到啥不是现代异步设施的API，起码在封装异步API这块我目前没接触到使用场景，通常用来老式 .NET Framework 的UI框架里。

这里介绍了一个有趣 [例子](https://www.pluralsight.com/resources/blog/guides/task-taskcompletion-source-csharp)

大致意思是 `TaskCompletionSource` 内部状况可以是任意时刻活跃的，这直接对应了用户对UI操作。一个响应用户删除的模态对话框通常需要写三个函数：
1. 删除按钮
2. 确认
3. 取消

在这个例子里使用 `TaskCompletionSource` 可以简化代码使得逻辑更清晰。

:::warning 注意
使用 `Set` 系列函数设置多次状态会抛出异常（多次设置Task状态的行为是不合理的），换 `TrySet` 系列函数则不会抛出异常，能处理用户在UI画面多次点击动作。

使用 `TaskCreationOptions.RunContinuationsAsynchronously` 来避免死锁。
:::

## 并行执行

### Parallel.For与Parallel.ForEach

典型重载的参数解释：

```csharp
public static Tasks.ParallelLoopResult ForEach<TSource, TLocal>(
    IEnumerable<TSource> source,
    ParallelOptions parallelOptions,
    Func<TLocal> localInit,
    Func<TSource, ParallelLoopState, TLocal, TLocal> body,
    Action<TLocal> localFinally
);
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| source | IEnumerable\<TSource\> | 需要迭代的集合 |
| parallelOptions | ParallelOptions | 提供和调度器相关的设置 |
| localInit | Func\<TLocal\> | 每个调用线程初始调用的回调函数，主要设置每次调用线程的初始状态 |
| body | Func\<TSource, ParallelLoopState, TLocal, TLocal\> | 主要执行任务的回调函数 |
| localFinally | Action\<TLocal\> | 接受body循环结果最终回调函数 |

### ParallelOptions

提供和调度器相关的设置，三个属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| CancellationToken | CancellationToken | 用来提供取消设置 |
| MaxDegreeOfParallelism | int | 最大并发度设置底层调度器的提供的线程数。设置为 -1 并发运行的操作数没有限制。[通常不需要管](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.paralleloptions.maxdegreeofparallelism?view=net-10.0#remarks) |
| TaskScheduler | TaskScheduler | 设置调度器，设置为 null 使用当前调度器 |

所谓并行即把整个循环分成若干块，每块分配一个线程执行。`localInit` 就是每个线程开始时执行的回调；`localFinally` 是每个线程结束时执行的回调。`body` 函数在首次调用 `localInit` 后接受其返回值作为参数，多次循环中将自己的返回值作为下一次循环的参数，最后一次传入给 `localFinally` 回调函数作为本次线程的结果。

### ParallelLoopState

用来控制循环流，其中两个成员函数用来停止循环：

| 方法 | 说明 |
|------|------|
| Stop | 尽可能停止立刻停止循环 |
| Break | 停止启动所有不大于调用Break最小索引的任务 |

这两个都只能在设置时尽可能停止后续尚未启动的迭代（任务）而不能阻止已经启动的迭代（任务）。

**Stop 示例：**

```csharp
var result = Parallel.For(1, 100, (i, state) =>
{
    Console.WriteLine($"Processing {i}");
    if (i == 10)
    {
        Console.WriteLine("Found 10, stopping the loop.");
        state.Stop(); // 停止循环
    }
});
Console.WriteLine("Loop has been stopped.");
// 输出：
// ...过多不显示
// Processing 13
// Processing 94
// Processing 10
// Found 10, stopping the loop.
// Processing 49
// ...过多不显示
```

根据输出结果可以看出由于 `Parallel.For` 会并行启动多个任务，即使在索引为10的时候停止迭代，但仍然有许多任务已经并行启动。

**Break 示例：**

语义是告诉调度器"不要再启动索引严格大于这个值的新的迭代"（按索引语义的最佳努力约束）。已启动的迭代不会被强制中止。

```csharp
var result2 = Parallel.For(1, 100, (i, state) =>
{
    Console.WriteLine($"Processing {i}");
    if (i == 10)
    {
        Console.WriteLine("Found 10, breaking the loop.");
        state.Break(); // 中断循环
    }
});
Console.WriteLine("Loop has been broken.");
Console.WriteLine($"Break LowestBreakIteration:{result2.LowestBreakIteration}");
```

输出结果和Stop类似但结束时会设置break时的索引：`Break LowestBreakIteration:10`

Copilot提供了一个示例能说明Break的意义：

```csharp
// 示例：并行搜索第一个符合条件的索引，记录 LowestBreakIteration 用于后处理过滤
var bag = new ConcurrentBag<int>();
var result = Parallel.For(0, n, (i, state) =>
{
    if (IsMatch(i))
    {
        bag.Add(i);
        state.Break(); // 请求按索引停止更大索引的启动
    }
    else
    {
        DoWork(i);
    }
});
// 循环返回后
if (!result.IsCompleted && result.LowestBreakIteration.HasValue)
{
    Console.WriteLine($"最小 Break 索引: {result.LowestBreakIteration.Value}");
    // 只处理索引 <= LowestBreakIteration.Value 的结果，或对 bag 进行过滤
}
```

逻辑上返回了一个在约束中的符合语义的最小值，根据这个最小值确定可处理的范围。

### Parallel.For的返回类型

`ParallelLoopResult` 有两个成员：

| 成员 | 类型 | 说明 |
|------|------|------|
| IsCompleted | bool | 循环是否完成（调用Stop/Break或者传入CTS导致中断都会返回false） |
| LowestBreakIteration | long? | 调用Break时的索引 |

这些重载中引发异常基本上都包含在 `AggregateException` 中，包含在所有线程上引发的全部单个异常的异常。

### Parallel.For 典型重载示例

```csharp
public static void ParallelForTest()
{
    Int64 totalSum = 0;
    var hashset = new ConcurrentDictionary<int, byte>();
    var Result = Parallel.For<Int64>(1, 101,
        () => {
            Console.WriteLine("每次都会调用");
            return 0L;
        },
        (i, state, localSum) =>
        {
            localSum += i;
            var threadId = Thread.CurrentThread.ManagedThreadId;
            hashset.TryAdd(threadId, 0);
            Console.WriteLine($"Index: {i}, LocalSum: {localSum}, current thread id:{Thread.CurrentThread.ManagedThreadId}");
            return localSum;
        },
        localSum =>
        {
            Console.WriteLine($"Final LocalSum: {localSum}");
            Interlocked.Add(ref totalSum, localSum);
        });
    Console.WriteLine($"Parallel For completed. IsCompleted: {Result.IsCompleted}");
    Console.WriteLine($"最终结果{totalSum}");
    Console.WriteLine($"不重复线程数:{hashset.Count}");
}
```

这个例子是计算1到101加法使用并行计算。但是把循环次数限制在 **[1,11)** 时，结果：

```
Index: 7, LocalSum: 7, current thread id:15
Index: 8, LocalSum: 8, current thread id:16
Index: 4, LocalSum: 4, current thread id:10
Index: 1, LocalSum: 1, current thread id:8
Index: 2, LocalSum: 2, current thread id:12
Final LocalSum: 2
Index: 3, LocalSum: 3, current thread id:11
Final LocalSum: 3
Index: 9, LocalSum: 9, current thread id:17
Final LocalSum: 9
Index: 0, LocalSum: 0, current thread id:2
Final LocalSum: 0
Final LocalSum: 8
Final LocalSum: 4
Final LocalSum: 1
Index: 5, LocalSum: 5, current thread id:13
Final LocalSum: 5
Index: 10, LocalSum: 10, current thread id:18
Final LocalSum: 10
Index: 6, LocalSum: 6, current thread id:14
Final LocalSum: 6
Final LocalSum: 7
Parallel For completed. IsCompleted: True
最终结果55
不重复线程数:10
```

可以看出来循环10次线程开了10个。

将循环范围改为 [1,101) ，结果：

```
最终结果5050
不重复线程数:26
```

大概开了26个线程。

:::tip 三种上下文
参考 [ExecutionContext](https://learn.microsoft.com/zh-cn/dotnet/api/system.threading.executioncontext?view=net-8.0)

> The ExecutionContext class provides a single container for all information relevant to a logical thread of execution. In .NET Framework, this includes security context, call context, and synchronization context. In .NET Core, the security context and call context are not supported, however, the impersonation context and culture would typically flow with the execution context. Also in .NET Core, the synchronization context does not flow with the execution context, whereas in .NET Framework it may in some cases.

参考 [ExecutionContext vs SynchronizationContext](https://devblogs.microsoft.com/dotnet/executioncontext-vs-synchronizationcontext/)
:::

## C# 中的任务取消

MSDN的 [示例](https://learn.microsoft.com/zh-cn/dotnet/standard/parallel-programming/how-to-cancel-a-task-and-its-children)

### 取消Task

C#中的任务取消是协作式的，什么是协作式的呢。就是说调用方和被调用方协商着来,不能说你想取消就取消。首先被调用方需要接受一个 `CancellationToken` 类型的参数,外部通过 `CancellationTokenSource` 类型的实例调用 `Cancel` 来请求取消,此时该实例内的Token会将属性 `IsCancellationRequested` 设置为 `true`。

被调用函数内部使用此通知来自己决定是否取消,被调用函数的函数签名中完全可以不接受 `CancellationToken` 类型的参数，或者完全不理会取消请求。在需要取消的场合,通过判断 `IsCancellationRequested`,调用 `ct.ThrowIfCancellationRequested()` 来抛出异常以此取消任务,当然调用方要try-catch处理异常。

:::warning 经典错误
这段代码犯了一个经典错误，参考这篇 [文章](https://learn.microsoft.com/zh-cn/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming)
:::

```csharp
public class MThread
{
    public static async Task MThreadCancelTest()
    {
        var cts = new System.Threading.CancellationTokenSource();
        var token = cts.Token;
        var task = Task.Run(() => MTaskWillbeCanceled(token, 10), token);
        // 等待3秒后取消任务
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

    // 协作式取消 不是说你想取消就取消 需要任务本身配合检查取消状态
    private static async void MTaskWillbeCanceled(CancellationToken ct, int second)
    {
        if (ct.IsCancellationRequested)
        {
            Console.WriteLine("Task was canceled before it started.");
            ct.ThrowIfCancellationRequested();
        }
        for (int i = 0; i < second; i++)
        {
            await Task.Delay(1000);
            Console.WriteLine($"Working... {i + 1} seconds elapsed.");
            if (ct.IsCancellationRequested)
            {
                Console.WriteLine("Task was canceled during execution.");
                ct.ThrowIfCancellationRequested();
            }
        }
    }
}
```

:::tip
MSDN的说明：下面两个语句是同义，参考 runtime 里的 [实现](https://github.com/dotnet/runtime/blob/b6127f9c7f6bab00186ec43d4a332053a1d02325/src/libraries/System.Private.CoreLib/src/System/Threading/CancellationToken.cs#L359)

```csharp
ct.ThrowIfCancellationRequested();

if (token.IsCancellationRequested)
    throw new OperationCanceledException(token);
```
:::

### CancellationTokenSource和CancellationToken 成员函数

```csharp
// CancellationToken.Register 重载
Register(Action)
Register(Action, Boolean)
Register(Action<Object, CancellationToken>, Object)
Register(Action<Object>, Object)
Register(Action<Object>, Object, Boolean)

// CancellationTokenSource
public void Cancel();
public void Cancel(bool throwOnFirstException);
public System.Threading.Tasks.Task CancelAsync();
```

:::tip 关于泛型重载
CancellationToken 没有一个 `Register<T>(Action<T>, T)` 这样重载的成员函数是因为泛型增加内存和JIT编译，该函数主要给引用类型用的；装箱的性能损失可以接受；API灵活——在UI场景用；历史原因——CancellationToken 是在 .NET Framework 4.0 中引入的，当时泛型的使用还没有像现在这样普遍。为了保持向后兼容性，API 的设计可能更倾向于非泛型的实现。
:::

**Register** 注册回调函数在后进先出的队列中（底层实现是双向链表），后注册的函数在取消发生时最先调用。

**Cancel 重载说明：**

| 方法 | 异常处理 |
|------|----------|
| `Cancel()` / `Cancel(false)` | 回调的调用链发生异常时不会立即抛出异常，阻止后续注册函数的调用。异常合并到 `AggregateException` 类里再抛出 |
| `Cancel(true)` | 第一个回调抛出异常后立即传播，后续回调不会执行 |

```csharp
public static async Task CTSTest()
{
    var cts = new CancellationTokenSource();
    var token = cts.Token;
    try
    {
        token.Register(() => {
            Console.WriteLine("Cancellation requested，首个注册的回调函数.");
            throw new ArgumentOutOfRangeException("Amount of shapes must be positive.");
        });
        token.Register(() => {
            Console.WriteLine("第二个注册的回调函数.");
            throw new StackOverflowException("Stack overflow in cancellation callback.");
        });

        Console.WriteLine($"IsCancellationRequested: {token.IsCancellationRequested}");
        Console.WriteLine($"CanBeCanceled: {token.CanBeCanceled}");

        token.Register(() => {
            Console.WriteLine("最后一个注册，被取消后首个调用的回调函数.");
            throw new NullReferenceException("空引用了");
        });

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
        // 把此处的Cancel(true)改为Cancel()或Cancel(false)会执行到所有注册回调结束
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
    catch (Exception ex)
    {
        Console.WriteLine($"Unexpected exception: {ex.Message}");
    }
    finally
    {
        cts.Dispose();
    }
}
```

**使用 `Cancel(true)` 输出：**

```
IsCancellationRequested: False
CanBeCanceled: True
Doing work... 1
Doing work... 2
...
Doing work... 10
当前时间为:02:00:15.379
当前时间为:02:00:15.727
最后一个注册，被取消后首个调用的回调函数.
Unexpected exception: 空引用了
```

**使用 `Cancel()` 或 `Cancel(false)` 输出：**

```
IsCancellationRequested: False
CanBeCanceled: True
Doing work... 1
...
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

可以看到返回的异常全部以 `AggregateException` 整合后抛出，且只要执行 `Cancel`，`Register` 注册的回调函数一定会调用，不管任务有没有执行完。

同样关于定时取消也可以在构造 `CancellationTokenSource` 时作为参数传入 `TimeSpan`：

```csharp
CancellationTokenSource cts = new CancellationTokenSource(1000);
_ = Task.Run(() => { ... }, cts.Token);
```

:::warning 注意
取消令牌只能取消一次，也就是说只能做一次状态转换，已经取消的状态不能转换回来。
:::

### CancelAfter()

有两个重载：

```csharp
public void CancelAfter(int millisecondsDelay);
public void CancelAfter(TimeSpan delay);
```

:::warning 注意
多次 `Cancel` 以最后一次为准。
:::

```csharp
public static async Task CTSCancelAfterTest()
{
    var cts = new CancellationTokenSource();
    var token = cts.Token;

    token.Register(() => {
        Console.WriteLine("已经取消;当前时间{0:HH:mm:ss.fff}", DateTime.Now);
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
        cts.CancelAfter(3000); // 3秒后取消，以最后一次为准
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

输出：

```
Doing work... 1
Doing work... 2
Doing work... 3
两秒钟后取消，当前时间为:23:29:20.553
三秒钟后取消，当前时间为:23:29:20.563
Doing work... 4
...
Doing work... 17
已经取消;当前时间23:29:23.566
Operation was canceled.
```

可以看到任务实际是在最后一个三秒钟内取消的。

### 关联取消，CreateLinkedTokenSource

四个重载：

```csharp
public static System.Threading.CancellationTokenSource CreateLinkedTokenSource(scoped ReadOnlySpan<System.Threading.CancellationToken> tokens);

public static System.Threading.CancellationTokenSource CreateLinkedTokenSource(System.Threading.CancellationToken token);

public static System.Threading.CancellationTokenSource CreateLinkedTokenSource(params System.Threading.CancellationToken[] tokens);

public static System.Threading.CancellationTokenSource CreateLinkedTokenSource(System.Threading.CancellationToken token1, System.Threading.CancellationToken token2);
```

MSDN有个 [例子](https://learn.microsoft.com/zh-cn/dotnet/standard/threading/how-to-listen-for-multiple-cancellation-requests)

首先CT-CancellationToken只是个取消信号接受器，信号发射器是CTS。当我们从外部获取一个或多个token时，我自己在函数内部也想取消或者一个取消多个token一起取消，可以用此方法把token都关联起来主动管理。

:::warning 注意
调用时token状态是取消了，创建的CTS也是取消状态。第三个数值重载中有一个token是取消状态，创建的CTS也是取消状态。
:::

## 定时器

`System.Threading` namespace 中的：
- `Timer` - 这是一个轻量级的定时器
- `PeriodicTimer`

同时在以下命名空间也存在Timer类型：
- `System.Timers`
- `System.Windows.Forms`

在《C# 4 CLR》一书中作者希望我们不要用 `System.Timers.Timer`，它由 `Component` 派生为了可以添加在VS的设计器中。

这里有一些简要 [介绍](https://learn.microsoft.com/zh-cn/dotnet/standard/threading/timers)

:::tip 现代 .NET 编程建议
使用 `async`/`await` 推荐使用 `System.Threading.PeriodicTimer`。
:::

### 暂停方法

| 方法 | 类型 | 说明 |
|------|------|------|
| `await Task.Delay(2000)` | 异步暂停 | 推荐在异步方法中使用 |
| `Thread.Sleep(2000)` | 同步暂停 | 会阻塞当前线程 |
