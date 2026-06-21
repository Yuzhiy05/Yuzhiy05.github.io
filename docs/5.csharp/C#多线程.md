---
title: C#多线程
createTime: 2025/09/09 10:57:50
permalink: /article/7nnotyg2/
---

### C# 多线程初入

Thread
Threadpool
在c++ 等语言中的的线程通常都是使用直接映射操作系统的抽象的Thread类 C#中也存在但是C#提供了相对更高级的抽象来管理线程称为"task"任务。同时C#是托管语言即使是Thread线程抽象也是比c++ 线程抽象度更高的托管线程
Task
Task.Factory



## Threadpool
c# 提供的线程池功能
可以执行任务,排队发送任务等
定义在System.Threading中的静态类为全局提供线程池
线程池的线程都是后台线程,也就是说和主线程分离,主线程不会等待后台线程结束才结束

线程池由三个部分组成
工作线程
可在创建线程池指定工作线程数量,在任务过多时线程池也会动态增加,无任务时线程池会主动结束过多的等待线程总之线程池会动态调整负载

I/O线程
调用Windows的IOCP机制
专门处理IO任务

任务队列
一个总的全局任务队列,每个工作线程再对接一个工作任务队列
工作线程先从主要负责对接的任务队列取任务执行,之后才会取总的任务队列,如果实在没有任务可取了就会等待
Task.Run 或 QueueUserWorkItem就是向其中添加任务

### 常用API介绍
```c#
public static class ThreadPool
```

常用的接口
### 1.排入任务队列
```c#
public static bool QueueUserWorkItem(System.Threading.WaitCallback callBack);

public static bool QueueUserWorkItem(System.Threading.WaitCallback callBack, object? state);

public static bool QueueUserWorkItem<TState>(Action<TState> callBack, TState state, bool preferLocal);

//例子
Action<int> rop = t => { Console.WriteLine(t); };
ThreadPool.QueueUserWorkItem(rop, 1,true);
```
参数说明
WaitCallback参数就是回调函数

他类型 长这样
```c#
public delegate void WaitCallback(object? state);
```

TState/Objectc参数 传入回调的参数

Boolean 参数 表示线程亲和性
preferLocal: true → 尝试入当前线程的局部队列；false → 优先放到线程池的共享队列。
目的主要是性能优化（缓存命中、减少同步/窃取开销(ai说的)

返回值 表示方法是否排队成功

他还有三个Unsafe的版本的重载
```c#
public static bool UnsafeQueueUserWorkItem(System.Threading.IThreadPoolWorkItem callBack, bool preferLocal);

public static bool UnsafeQueueUserWorkItem(System.Threading.WaitCallback callBack, object? state);

public static bool UnsafeQueueUserWorkItem<TState>(Action<TState> callBack, TState state, bool preferLocal);
```
引用MSDN的说明
>Unlike the QueueUserWorkItem method, UnsafeQueueUserWorkItem does not propagate the calling stack to the worker thread. This allows code to lose the calling stack and thereby to elevate its security privileges.

waring
>Using UnsafeQueueUserWorkItem could inadvertently open up a security hole. Code access security bases its permission checks on the permissions of all the callers on the stack. When work is queued on a thread pool thread using UnsafeQueueUserWorkItem, the stack of the thread pool thread will not have the context of the actual callers. Malicious code might be able exploit this to avoid permission checks.

意思大致是Unsafe版本不会将调用时的栈传入工作线程,工作线程没有调用时的上下文。
警告说明的是 代码访问安全性的权限检查基于堆栈上所有调用方的权限 Unsafe版本丢失栈信息可能会被恶意代码利用

其中
IThreadPoolWorkItem类型 callback 参数
表示一个存在 Execute()方法的接口
```c#
public interface IThreadPoolWorkItem
{
    public void Execute();
}
```
其他参数和非Unsafe版本一样

### 2.注册等待回调
RegisterWaitForSingleObject
```c#
[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public static RegisteredWaitHandle RegisterWaitForSingleObject(WaitHandle waitObject, WaitOrTimerCallback callBack, object? state, TimeSpan timeout, bool executeOnlyOnce);

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public static RegisteredWaitHandle RegisterWaitForSingleObject(WaitHandle waitObject, WaitOrTimerCallback callBack, object? state, int millisecondsTimeOutInterval, bool executeOnlyOnce);

[System.Runtime.Versioning.UnsupportedOSPlatform("browser")]
public static RegisteredWaitHandle RegisterWaitForSingleObject(WaitHandle waitObject, WaitOrTimerCallback callBack, object? state, long millisecondsTimeOutInterval, bool executeOnlyOnce);
```
参数说明

waitObject WaitHandle类型 封装了等待对共享资源进行独占访问的操作系统特定的对象类似mutex 但是这里不能是mutex

callBack  长这样类型的委托
类型
```c#
public delegate void WaitOrTimerCallback(object? state, bool timedOut);
```

state 传递给回调的参数

timeout 表示的超时时间。 如果 timeout 为 0，则函数立刻执行并立即返回。 如果 timeout 为 -1，则函数的超时间隔永远不过期

executeOnlyOnce 如果为 true，表示在调用了委托后，线程将不再在 waitObject 参数上等待；如果为 false，表示每次完成等待操作后都重置计时器，直到注销等待

返回类型
RegisteredWaitHandle 这是一个本机资源封装的类型

该函数语义是等待waitObject发出信号线程池调用对应回调 这是个很底层的api可以暂时不管
详细参考[msdn](https://learn.microsoft.com/zh-cn/dotnet/api/system.threading.threadpool.registerwaitforsingleobject?view=net-8.0)
示例也参考上述链接

### 手写简单的线程池

## Task

### 创建Task

1.var t=new Task(Action op); t,Start();
2.Task.Run(Action op)
3.Task.Factory.StartNew

Task.Factory.StartNew 比Task.Run有更多更细致的对任务的控制
例如
CancellationToken
TaskCreationOptions
TaskContinuationOptions
TaskScheduler

同时用来创建一组任务避免每次向Task传递相同参数
### Task的状态
TaskStatus

这是一个表
Created	0	
The task has been initialized but has not yet been scheduled. 可以显示start

WaitingForActivation	1	
The task is waiting to be activated and scheduled internally by the .NET infrastructure. 隐式创建自动开启

WaitingToRun	2	
The task has been scheduled for execution but has not yet begun executing. 被调度还未运行

Running	3	
The task is running but has not yet completed. 正在运行

WaitingForChildrenToComplete	4	
The task has finished executing and is implicitly waiting for attached child tasks to complete. 等待子任务运行完才能结束

//一下三个都叫完成 三种状态Task的IsCompleted 属性都返回true(成功运行结束属性IsCompletedSuccessfully)
RanToCompletion	5	
The task completed execution successfully.

Canceled	6	
The task acknowledged cancellation by throwing an OperationCanceledException with its own CancellationToken while the token was in signaled state, or the task's CancellationToken was already signaled before the task started executing. For more information, see Task Cancellation.

Faulted	7	
The task completed due to an unhandled exception.

## TaskFactory

### 延续任务
ContinueWhenAll
ContinueWhenAny

Not /Only开头的TaskContinueOptions 选项对这两个函数来说都是非法参数
因为无论如何后续任务都会执行


## TaskScheduler 
任务调度器

这个类有些类似Threadpool之于Thread 线程池对象是对具体线程集合的调度那么任务调度器taskschduler就是对抽象任务task的调度。

TaskScheduler属于在Task(任务)和具体线程之前的一层抽象,面向用户时,用户直接使用Task进行任务,在构造Task或TaskFactory时传入
TaskScheduler对象来控制任务具体怎么被调度。而TaskScheduler是对clr多个具体调度器的统一抽象,由具体的调度器再调度任务如何执行。

反编译一下这个类,在github上找以下clr的源码补充一下实现
```c#
public abstract class TaskScheduler
{
    protected TaskScheduler();

    public static TaskScheduler Current { get; }

    public static TaskScheduler Default { get; }
    //
    // 摘要:
    //     Gets the unique ID for this System.Threading.Tasks.TaskScheduler.
    //
    // 返回结果:
    //     Returns the unique ID for this System.Threading.Tasks.TaskScheduler.
    public int Id { get; }
    //
    // 摘要:
    //     Indicates the maximum concurrency level this System.Threading.Tasks.TaskScheduler
    //     is able to support.
    //
    // 返回结果:
    //     Returns an integer that represents the maximum concurrency level. The default
    //     scheduler returns Int32.MaxValue.
    public virtual int MaximumConcurrencyLevel { get; }

    //
    // 摘要:
    //     Occurs when a faulted task's unobserved exception is about to trigger exception
    //     escalation policy, which, by default, would terminate the process.
    public static event EventHandler<UnobservedTaskExceptionEventArgs>? UnobservedTaskException;

    //
    // 摘要:
    //     Creates a System.Threading.Tasks.TaskScheduler associated with the current System.Threading.SynchronizationContext.
    //
    //
    // 返回结果:
    //     A System.Threading.Tasks.TaskScheduler associated with the current System.Threading.SynchronizationContext,
    //     as determined by System.Threading.SynchronizationContext.Current.
    //
    // 异常:
    //   T:System.InvalidOperationException:
    //     The current SynchronizationContext may not be used as a TaskScheduler.
    public static TaskScheduler FromCurrentSynchronizationContext()
    {
        return new SynchronizationContextTaskScheduler();//这是一个内部类
    }
    //
    // 摘要:
    //     For debugger support only, generates an enumerable of System.Threading.Tasks.Task
    //     instances currently queued to the scheduler waiting to be executed.
    //
    // 返回结果:
    //     An enumerable that allows a debugger to traverse the tasks currently queued to
    //     this scheduler.
    //
    // 异常:
    //   T:System.NotSupportedException:
    //     This scheduler is unable to generate a list of queued tasks at this time.
    protected abstract IEnumerable<Task>? GetScheduledTasks();
    //
    // 摘要:
    //     Attempts to execute the provided System.Threading.Tasks.Task on this scheduler.
    //
    //
    // 参数:
    //   task:
    //     A System.Threading.Tasks.Task object to be executed.
    //
    // 返回结果:
    //     A Boolean that is true if task was successfully executed, false if it was not.
    //     A common reason for execution failure is that the task had previously been executed
    //     or is in the process of being executed by another thread.
    //
    // 异常:
    //   T:System.InvalidOperationException:
    //     The task is not associated with this scheduler.
    protected bool TryExecuteTask(Task task);
    //
    // 摘要:
    //     Determines whether the provided System.Threading.Tasks.Task can be executed synchronously
    //     in this call, and if it can, executes it.
    //
    // 参数:
    //   task:
    //     The System.Threading.Tasks.Task to be executed.
    //
    //   taskWasPreviouslyQueued:
    //     A Boolean denoting whether or not task has previously been queued. If this parameter
    //     is True, then the task may have been previously queued (scheduled); if False,
    //     then the task is known not to have been queued, and this call is being made in
    //     order to execute the task inline without queuing it.
    //
    // 返回结果:
    //     A Boolean value indicating whether the task was executed inline.
    //
    // 异常:
    //   T:System.ArgumentNullException:
    //     The task argument is null.
    //
    //   T:System.InvalidOperationException:
    //     The task was already executed.
    protected abstract bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued);
    //
    // 摘要:
    //     Queues a System.Threading.Tasks.Task to the scheduler.
    //
    // 参数:
    //   task:
    //     The System.Threading.Tasks.Task to be queued.
    //
    // 异常:
    //   T:System.ArgumentNullException:
    //     The task argument is null.
    protected internal abstract void QueueTask(Task task);
    //
    // 摘要:
    //     Attempts to dequeue a System.Threading.Tasks.Task that was previously queued
    //     to this scheduler.
    //
    // 参数:
    //   task:
    //     The System.Threading.Tasks.Task to be dequeued.
    //
    // 返回结果:
    //     A Boolean denoting whether the task argument was successfully dequeued.
    //
    // 异常:
    //   T:System.ArgumentNullException:
    //     The task argument is null.
    protected internal virtual bool TryDequeue(Task task);
}

internal sealed class SynchronizationContextTaskScheduler : TaskScheduler
{
        private readonly SynchronizationContext m_synchronizationContext;

        /// <summary>
        /// Constructs a SynchronizationContextTaskScheduler associated with <see cref="SynchronizationContext.Current"/>
        /// </summary>
        /// <exception cref="InvalidOperationException">This constructor expects <see cref="SynchronizationContext.Current"/> to be set.</exception>
        internal SynchronizationContextTaskScheduler()
        {
            m_synchronizationContext = SynchronizationContext.Current ??
                // make sure we have a synccontext to work with
                throw new InvalidOperationException(SR.TaskScheduler_FromCurrentSynchronizationContext_NoCurrent);
        }

        /// <summary>
        /// Implementation of <see cref="TaskScheduler.QueueTask"/> for this scheduler class.
        ///
        /// Simply posts the tasks to be executed on the associated <see cref="SynchronizationContext"/>.
        /// </summary>
        /// <param name="task"></param>
        protected internal override void QueueTask(Task task)
        {
            m_synchronizationContext.Post(s_postCallback, (object)task);
        }

        /// <summary>
        /// Implementation of <see cref="TaskScheduler.TryExecuteTaskInline"/>  for this scheduler class.
        ///
        /// The task will be executed inline only if the call happens within
        /// the associated <see cref="SynchronizationContext"/>.
        /// </summary>
        /// <param name="task"></param>
        /// <param name="taskWasPreviouslyQueued"></param>
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

        /// <summary>
        /// Implements the <see cref="TaskScheduler.MaximumConcurrencyLevel"/> property for
        /// this scheduler class.
        ///
        /// By default it returns 1, because a <see cref="SynchronizationContext"/> based
        /// scheduler only supports execution on a single thread.
        /// </summary>
        public override int MaximumConcurrencyLevel => 1;

        // preallocated SendOrPostCallback delegate
        private static readonly SendOrPostCallback s_postCallback = static s =>
        {
            Debug.Assert(s is Task);
            ((Task)s).ExecuteEntry(); // with double-execute check because SC could be buggy
        };
}  
```
这个类实例有一个静态属性 他返回默认调度器也就是在Threadpool部分所说的全局静态线程池 他的类型ThreadPoolTaskScheduler


### 用法
1.在new Task后使用Start启动作为函数参数传入 注意Task.Run(...)和Task的构造函数参数是没有TaskScheduler类型的,他默认线程池调度器
2.构造TaskFactory时作为构造函数参数传入或作为StartNew参数传入
3.Task.ContinueWith
4.Parallel类内部
5.PLINQ

上三个示例
```c#
1.
var t=new Task(()=>Console.Writleline("hello"));
TaskScheduler uiScheduler = TaskScheduler.FromCurrentSynchronizationContext();
t.Start(uiScheduler);

2.
var customScheduler = new LimitedConcurrencyLevelTaskScheduler(2);

// 使用自定义调度器启动任务
var task = Task.Factory.StartNew(() =>
{
    Console.WriteLine($"Running on thread: {Thread.CurrentThread.ManagedThreadId}");
    // 你的业务逻辑
}, CancellationToken.None, TaskCreationOptions.None, customScheduler);

3.
var initialTask = Task.Run(() => GetData());

// 在不同调度器上执行延续任务
var continuation = initialTask.ContinueWith(
    continuationAction: antecedent => ProcessData(antecedent.Result),
    scheduler: TaskScheduler.FromCurrentSynchronizationContext() // UI线程
);

// 另一个例子：在默认调度器上继续处理
var anotherContinuation = initialTask.ContinueWith(
    antecedent => SaveToDatabase(antecedent.Result),
    TaskScheduler.Default // 线程池
);
4.
// Parallel.ForEach 内部使用 TaskScheduler
var options = new ParallelOptions
{
    TaskScheduler = TaskScheduler.Default, // 可以自定义
    MaxDegreeOfParallelism = Environment.ProcessorCount
};

Parallel.ForEach(collection, options, item => ProcessItem(item));
```

### 默认调度器 TaskScheduler.Default

类型是ThreadPoolTaskScheduler的静态字段
作为 TaskScheduler.Default默认返回的对象

```c#
Task.cs

// An AppDomain-wide default manager.
private static readonly TaskScheduler s_defaultTaskScheduler = new ThreadPoolTaskScheduler();
/// <summary>
/// Gets the default <see cref="TaskScheduler">TaskScheduler</see> instance.
 /// </summary>
public static TaskScheduler Default => s_defaultTaskScheduler;        
```

再看[实现](https://github.com/dotnet/runtime/blob/1d1bf92fcf43aa6981804dc53c5174445069c9e4/src/libraries/System.Private.CoreLib/src/System/Threading/Tasks/ThreadPoolTaskScheduler.cs)

```c#
ThreadPoolTaskScheduler.cs

internal sealed class ThreadPoolTaskScheduler : TaskScheduler
    {
        //实现的其他细节不关注
        // static delegate for threads allocated to handle LongRunning tasks.
        private static readonly ParameterizedThreadStart s_longRunningThreadWork = static s =>
        {
            Debug.Assert(s is Task);
            ((Task)s).ExecuteEntryUnsafe(threadPoolThread: null);
        };

        /// <summary>
        /// Schedules a task to the ThreadPool.
        /// </summary>
        /// <param name="task">The task to schedule.</param>
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

        /// <summary>
        /// This internal function will do this:
        ///   (1) If the task had previously been queued, attempt to pop it and return false if that fails.
        ///   (2) Return whether the task is executed
        ///
        /// IMPORTANT NOTE: TryExecuteTaskInline will NOT throw task exceptions itself. Any wait code path using this function needs
        /// to account for exceptions that need to be propagated, and throw themselves accordingly.
        /// </summary>
        protected override bool TryExecuteTaskInline(Task task, bool taskWasPreviouslyQueued)
        {
            // If the task was previously scheduled, and we can't pop it, then return false.
            if (taskWasPreviouslyQueued && !ThreadPool.TryPopCustomWorkItem(task))
                return false;

            try
            {
                task.ExecuteEntryUnsafe(threadPoolThread: null); // handles switching Task.Current etc.
            }
            finally
            {
                // Only call NWIP() if task was previously queued
                if (taskWasPreviouslyQueued) NotifyWorkItemProgress();
            }

            return true;
        }

        protected internal override bool TryDequeue(Task task)
        {
            // just delegate to TP
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
      ...//实现其他内容
    }
```
实现能看明白
QueueTask  的作用就是把将任务提交到线程池队列
对于使用长任务标记的任务的任务LongRunning 使用单独的线程执行

没有其他特殊Task.Option的任务直接派发到ThreadPool线程池队列,同时对设置PreferFairness了的任务底层线程
会尽量公平,不然底层线程池调度可能会按照性能进行调度

:::tips
`(options & TaskCreationOptions.PreferFairness) == 0`
这里的写法很讨巧
设置Task.Option的枚举值可能是由多个其他枚举复合而成 例如PreferFairness | LongRunning | HideScheduler
这样只需要检测符合枚举中是否存在PreferFairness项即可 而`options == TaskCreationOptions.PreferFairness`对于复合枚举值就不适用了
:::

:::tips
不想介绍Thread的api了
简单说下Thread的构造函数有传入委托的版本,UnsafeStart成员函数接受一个Object对象作为传给委托的参数
具体执行是由Task类型的一个内部方法ExecuteEntryUnsafe执行
:::

```c#
internal void (Thread? threadPoolThread) // used instead of ExecuteEntry() when we don't have to worry about double-execution prevent
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
在本地线程执行就靠ExecuteWithThreadLocal这个私有函数,不想解析了很复杂

TryExecuteTaskInline  在当前线程立刻执行任务避免线程调度
>If the task was previously scheduled, and we can't pop it, then return false.
线程已经被调度的情况,且在线程池中正常执行无法从底层线程池队列移出,无法在当前线程执行则会返回false


TryDequeue 无需多言调用底层Threadpool移出排队任务

GetScheduledTasks 获取调度任务则是从线程池中获取排队的工作项


### 自定义调度器
自定义调度器一般要实现TaskScheduler以下几个方法

QueueTask      这个方法在 StartNew这个方法创建Task时调用;将任务开始调度

```c#
var scheduler = new MTaskScheduler(4);
var factory = new TaskFactory(scheduler);

factory.StartNew(() =>//StartNew内部调用QueueTask
{
    Console.WriteLine(
            $"Task  is running on thread {Thread.CurrentThread.ManagedThreadId}"
    );
    Thread.Sleep(100);
});
```

TryExecuteTaskInline

GetScheduledTasks()


### 获取同步上下文调度器
TaskScheduler.FromCurrentSynchronizationContext()
对于ui上下文来说主线程只有一个,从当前线程获取ui上下文调度器时通过同步上下文的Post方法发送委托到主线程。也就是说在任务(委托)执行
层面由具体的同步上下文调度器调度,该调度再调用SynchronizationContext这一层抽象使用Post方法派发任务到具体的ui线程,而SynchronizationContext又是各个ui线程上下文的抽象,这样的结构和线程池与线程池调度器类似

### 总结
大体上来说 分为
1.任务这些是最高级别抽象
• Task                                                      
• Task\<TResult\>                                             
• TaskFactory                                               
• TaskCompletionSource                                      
• ValueTask / ValueTask\<TResult\>

1. TaskScheduler (抽象类)                          
职责：队列管理、线程分配、执行时机决策             
关键方法：QueueTask(), TryExecuteTaskInline()       
策略模式：定义调度算法，具体实现交给子类 

3.具体实现的调度器
A. ThreadPoolTaskScheduler (系统内置)                        
├── 使用：TaskScheduler.Default                          
├── 内部调用：ThreadPool.QueueUserWorkItem()             
├── 特点：工作线程池，适合短任务                          
└── 限制：不适合长时间阻塞的任务                          
                                                            
B. SynchronizationContextTaskScheduler (系统内置)           
├── 使用：TaskScheduler.FromCurrentSynchronizationContext()
├── 内部机制：Post() 到 SynchronizationContext            
├── 特点：单线程执行（如UI线程）                          
└── 限制：不能执行耗时操作，否则界面卡顿                  
                                                             
C. Custom TaskScheduler (用户自定义)                        
├── 示例：LimitedConcurrencyLevelTaskScheduler           
├── 内部可能调用：ThreadPool / Thread / 自定义线程池      
├── 特点：完全可控的调度策略                              
└── 应用：特殊并发控制、测试框架等  

4.线程执行
1. ThreadPool (全局静态线程池)                               
├── 组成：                                           
│   ├── Worker Threads (工作线程)                      
│   ├── I/O Threads (I/O完成端口线程)                  
│   └── Timer Threads (定时器线程)                     
├── 管理方式：ThreadPool.XXX 静态方法                    
├── 适用场景：CPU密集型短任务、I/O回调                   
└── 特点：线程复用、数量自适应                          
                                                            
2. Dedicated Thread (专用线程)                              
├── 创建方式：new Thread()                             
├── 触发条件：                                        
│   ├── TaskCreationOptions.LongRunning                
│   ├── 自定义调度器显式创建                            
│   └── 某些同步原语（如 ManualResetEvent.WaitOne()） 
├── 适用场景：长时间运行、阻塞型任务                    
└── 特点：独立线程，不受线程池回收影响                  
                                                             
3. UI Thread (UI上下文线程)                                 
├── 本质：特殊的 SynchronizationContext + 消息循环       
├── 实现：WinForms/WPF/MAUI 的消息泵                    
├── 管理方式：Application.Run() / Dispatcher.Run()     
├── 特点：单线程、消息驱动、STA模型                     
└── 限制：不能执行耗时操作  




## 同步上下文
这里有一篇关于同步上下文的[文章](https://learn.microsoft.com/en-us/archive/msdn-magazine/2011/february/msdn-magazine-parallel-computing-it-s-all-about-the-synchronizationcontext)
同步上下文分为
WinFromSynchronizationContext      给winfrom用
DispatcherSynchronizationContext     wpf用
HTTP 请求同步上下文

SynchronizationContext 直接看源码
```c#
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

        /// <summary>
        ///     Optional override for subclasses, for responding to notification that operation is starting.
        /// </summary>
        public virtual void OperationStarted()
        {
        }

        /// <summary>
        ///     Optional override for subclasses, for responding to notification that operation has completed.
        /// </summary>
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
这里最重要的就是Send和Post
查看WindowsFormsSynchronizationContext和DispatcherSynchronizationContext 这两个ui上下文都用自身的实现覆盖默认实现


观察各个实现可以看出即使继承TaskScheduler需要实现QueueTask,但各个调度排队操作都是直接调用底层api的例如
线程同步调度器的QueueTask方法
他直接```m_synchronizationContext.Post(s_postCallback, (object)task);``` 使用的是捕获到的同步上下文的Post方法;假设是WinFrom的同步上下文再看WinFrom的源码
```c#
public override void Post(SendOrPostCallback d, object? state)
        => _controlToSendTo?.BeginInvoke(d, [state]);
```

_controlToSendTo类型是Control类
```c#
public sealed class WindowsFormsSynchronizationContext : SynchronizationContext, IDisposable
{
    private Control? _controlToSendTo;
    private WeakReference<Thread>? _destinationThread;
    ...
}
```
懂WinFrom的肯定知道Control是所有控件的基类,每个控件想要在ui线程上异步执行委托都要使用BeginInvoke执行,这就涉及到windows的消息循环机制,委托被发送到消息队列,再由主线程循环取出再执行。

[control](https://github.com/dotnet/dotnet/blob/b0f34d51fccc69fd334253924abd8d6853fad7aa/src/winforms/src/System.Windows.Forms/System/Windows/Forms/Control.cs#L39)

winfrom每个控件都继承Control其中每个控件在构造函数中都是设置windows上下文
```c#
Control.cs

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

再看线程池也是一样他同样有一个或多个任务队列,再加上多个(和ui不同)执行线程队列,循环取出任务执行。这两个结构是同构的都可以使用
TaskScheduler调度器这个抽象来模拟。

回过头来看很清楚TaskScheduler的api设计了
QueueTask
TryExecuteTask
他们就是将任务发送到对应底层实现的任务队列中

### 什么是同步上下文？
他是一个执行环境,用来管理任务在哪里执行(某个线程?UI线程?-不用关心,这些都是同步上下文该关心的)
通常我们不需要管只需要分清不同的同步上下文即可。
他的Post方法将任务派发到特定线程执行?
通常我们不需要手动调用调用Post方法,`await`关键会自动实现相关调用,await这个异步设施和同步上下文是强相关的
```c#
 var syncContext = new SingleThreadSynchronizationContext();//自定义的同步上下文
    SynchronizationContext.SetSynchronizationContext(syncContext);

    Console.WriteLine($"[Start] Main thread: {Thread.CurrentThread.ManagedThreadId}");

    // --- 调度器的作用 ---
    // Task.Run 使用 TaskScheduler.Default (线程池) 来决定在哪里执行。
    // 调度器选择了线程 3。
    await Task.Run(() => {
        Console.WriteLine($"[Task.Run body] Running on thread from TaskScheduler: {Thread.CurrentThread.ManagedThreadId}");
    });

    // --- 同步上下文的作用 ---
    // await 完成后，需要恢复执行。
    // 它查看捕获的 syncContext，发现不是 null。
    // 于是它调用 syncContext.Post(...)，将下面的代码块作为任务投递过来。
    // 我们的 workerThread (线程 4) 从队列取出并执行。
    Console.WriteLine($"[After await] Now running on the dedicated thread from SyncContext: {Thread.CurrentThread.ManagedThreadId}");

    // 手动调用 Post，效果和 await 背后的机制一模一样。
    SynchronizationContext.Current!.Post(_ => {
        Console.WriteLine($"[Manual Post] Also on the dedicated thread: {Thread.CurrentThread.ManagedThreadId}");
    }, null);

    await Task.Delay(1000); // Delay 的内部实现也会捕获上下文并用 Post 调度延续任务。
    Console.WriteLine($"[After Delay] Still on the dedicated thread: {Thread.CurrentThread.ManagedThreadId}");
```

游戏开发的场景中需要将游戏状态变更或渲染的任务调度到一个专门的线程

或某些网络库的场景中需要一个专门线程处理网络请求

tips同步上下文不是含有某些变量的对象,一开始我总是将他和线程内变量/或线程线程上下文搞混,我以为上下文保存了函数切换前的变量,等到等待函数执行时"同步上下文"除了切换执行环境,还会让上文变量在后续执行中可用,其实不是的。在c#中同步上下文 SynchronizationContext更应该称为"同步环境" ;上下文一词暗含了该对象可能含有变量或是什么;Context翻译成"语境"或"环境"可能更有益于理解。
同时同步上下文的中实现的关键函数Send/Post函数也能反应处同步上下文只是将回调函数/任务 派发/发送到对应"环境"执行而不携带类似函数变量相关的东西。

## TaskCompletionSource 将老旧回调代码改造为异步代码

语义上TaskCompletionSource\<TResult\>充当 Task\<TResult\>的生成器。
通常其他方法创建的task都需要绑定一个委托(构造或者其他函数中显示传递一个委托/函数)
此方法不需要预先设置一个委托/函数

生成TaskCompletionSource\<T\>其中包含一个Task\<T\>属性
SetResult

SetException

SetCanceled
来设置内部Task的状态完成与否,在msdn的c#教程中说明这与Task.Factory.StartNew创建的任务不同。这个方法能让用户显示的控制
生成的Task状态
这表示可以将创建的TaskCompletionSource对象传递出去由不同的逻辑设置Task的状态

同时返回这个task来实现将原本不能使用现代异步设施async/await的api封装成使用Task的现代异步设施

例子1 将回调代码封装为同步代码供外部调用
让ai生成例子
这里例子里WebClient已经被弃用
其异步方法ownloadDataAsync返回void
```c#
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
        data => Console.WriteLine($"下载完成，大小: {data.Length}"),  // 成功回调
        error => Console.WriteLine($"下载失败: {error.Message}")      // 失败回调
    );
    
    // 问题：无法等待，只能继续往下执行，不知道何时完成
}
```
再用一个将老旧api(不返回Task)封装一下的例子
```c#
public class TaskBasedApi
{
    public Task<byte[]> DownloadFileAsync(string url)
    {
        var tcs = new TaskCompletionSource<byte[]>();
        
        WebClient client = new WebClient();
        
        client.DownloadDataCompleted += (sender, e) =>
        {
            if (e.Error != null)
                tcs.TrySetException(e.Error);           // 转换为 Task 异常
            else if (e.Cancelled)
                tcs.TrySetCanceled();                   // 转换为 Task 取消
            else
                tcs.TrySetResult(e.Result);             // 转换为 Task 结果
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
        
        // 可以继续链式调用其他异步操作
        var processed = await ProcessDataAsync(data);
        await SaveAsync(processed);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"下载失败: {ex.Message}");
    }
}
```

核心仍然是把底层回调包装一下,让调用者可以异步
```c#
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

说实在的现在c#里全是Task我还真没找到啥不是现代异步设施的api,起码在封装异步api这块我目前没接触到使用场景
通常用来老式.net Framework的ui框架里

这里介绍了一个有趣[例子](https://www.pluralsight.com/resources/blog/guides/task-taskcompletion-source-csharp)
Other Uses of TaskCompletionSource

大致意思是TaskCompletionSource内部状况可以是任意时刻活跃的这直接对应了用户对ui操作
一个响应用户删除的模态对话框通常需要写三个函数
1.删除按钮
2.确认
3.取消
在这个例子里使用TaskCompletionSource可以简化代码使得逻辑更清晰
文章作者提示使用Set系列函数设置多次状态会抛出异常(多次设置Task状态的行为是不合理了)换TrySet系列函数这不会抛出异常能处理用户
在ui画面多次点击动作


使用TaskCreationOptions.RunContinuationsAsynchronously 来避免死锁
## 并行执行

### Parallel.For与Parallel.ForEach
典型重载的参数解释
```c#
public static Tasks.ParallelLoopResult ForEach<TSource,TLocal>(IEnumerable<TSource> source,ParallelOptions parallelOptions, Func<TLocal> localInit, Func<TSource,ParallelLoopState,TLocal,TLocal> body, Action<TLocal> localFinally);
```
参数
source 需要迭代的集合

parallelOptions 
### ParallelOptions
提供和调度器相关的设置
三个属性
CancellationToken 用来提供取消设置
MaxDegreeOfParallelism 最大并发度设置底层调度器的提供的线程数 设置为-1 并发运行的操作数没有限制 [通常不需要管](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.paralleloptions.maxdegreeofparallelism?view=net-10.0#remarks)
TaskScheduler 设置调度器 设置为null使用当前调度器

localInit 每个调用线程初始调用的回调函数 类型是Func\<TLocal\> 无参数返回泛型参数的委托 主要设置每次调用线程的初始状态TLocal

body 主要执行任务的回调函数 类型 Func\<TSource,ParallelLoopState,TLocal,TLocal\>

TSource 每个具体的迭代项

ParallelLoopState 见下文

第一个TLocal参数 localInit初始任务返回的值
第二个TLocal参数 自然就是这个回调函数的返回值 这个返回值在有localFinally参数时传给它

localFinally 接受body循环结果最终回调函数

所谓并行即把整个循环分成若干块 每块分配一个线程执行,localInit就是每个线程开始时执行的回调;localFinally是每个线程结束时执行的回调 body函数在首次调用localInit后接受其返回值作为参数,多次循环中将自己的返回值作为下一次循环的参数再最后一次传入给localFinally回调函数作为本次线程

### ParallelLoopState 
用来控制循环流
其中两个成员函数 用来停止循环
Stop    尽可能停止立刻停止循环
Break   停止启动所有不大于调用Break最小索引的任务

这两个都只能在设置时尽可能停止后续尚未启动的迭代(任务)而不能阻止已经启动的迭代(任务)
两个例子说明
```c#
var result=Parallel.For(1, 100, (i, state) =>
{
    Console.WriteLine($"Processing {i}");
    if (i == 10)
    {
        Console.WriteLine("Found 10, stopping the loop.");
        state.Stop(); // 停止循环
    }
});
Console.WriteLine("Loop has been stopped.");
//输出
... 过多不显示
Processing 13
Processing 94
Processing 95
Processing 96
Processing 83
Processing 10
Found 10, stopping the loop.
Processing 49
Processing 55
Processing 91
...过多不显示
```
根据输出结果可以看出由于Parallel.For会并行启动多个任务 即使在索引为10的时候停止迭代,但任然有许多任务已经并行启动。

再看Break 语义是告诉调度器“不要再启动索引严格大于这个值的新的迭代”（按索引语义的最佳努力约束）。已启动的迭代不会被强制中止。
```c#
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
输出结果和Stop类似但结束时会设置break时的索引 这里是
Break LowestBreakIteration:10 
Copilot提供了一个示例能说明Break的意义
```c#
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
        // 可能产生副作用的工作，实际应在写入前判断边界或使用 token
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
逻辑上返回了一个在约束中的符合语义的最小值,根据这个最小值确定可处理的范围

### Parallel.For的返回类型
ParallelLoopResult
他有两个成员
IsCompleted         循环是否完成(调用Stop/Break或者传入CTS导致中断都会返回false)
LowestBreakIteration 调用Break时的索引


这些重载中引发异常基本上都
AggregateException
包含在所有线程上引发的全部单个异常的异常

Parallel.For
典型重载简单例子
```c#
public static void ParallelForTest()
{
    //测试这个重载For<TLocal>(Int64, Int64, ParallelOptions, Func<TLocal>, Func<Int64,ParallelLoopState,TLocal,TLocal>, Action<TLocal>)
    Int64 totalSum = 0;
    var hashset = new ConcurrentDictionary<int,byte>();
    var Result=Parallel.For<Int64>(1, 101, 
        () => {Console.WriteLine("每次都会调用")}0L,
        (i, state, localSum) =>
        {
            localSum += i;
            var threadId = Thread.CurrentThread.ManagedThreadId;
            hashset.TryAdd(threadId,0);
            Console.WriteLine($"Index: {i}, LocalSum: {localSum},current thread id:{Thread.CurrentThread.ManagedThreadId}");
            return localSum;
        },
        localSum =>
        {
            Console.WriteLine($"Final LocalSum: {localSum}");
            Interlocked.Add(ref totalSum,localSum);
        });
    Console.WriteLine($"Parallel For completed. IsCompleted: {Result.IsCompleted}");
    Console.WriteLine($"最终结果{totalSum}");
    Console.WriteLine($"不重复线程数:{hashset.Count}");
}
```
这个例子是计算1到101加法使用并行计算
但是把循环次数限制在 **[1,11)** 时
结果
```
Index: 7, LocalSum: 7,current thread id:15
Index: 8, LocalSum: 8,current thread id:16
Index: 4, LocalSum: 4,current thread id:10
Index: 1, LocalSum: 1,current thread id:8
Index: 2, LocalSum: 2,current thread id:12
Final LocalSum: 2
Index: 3, LocalSum: 3,current thread id:11
Final LocalSum: 3
Index: 9, LocalSum: 9,current thread id:17
Final LocalSum: 9
Index: 0, LocalSum: 0,current thread id:2
Final LocalSum: 0
Final LocalSum: 8
Final LocalSum: 4
Final LocalSum: 1
Index: 5, LocalSum: 5,current thread id:13
Final LocalSum: 5
Index: 10, LocalSum: 10,current thread id:18
Final LocalSum: 10
Index: 6, LocalSum: 6,current thread id:14
Final LocalSum: 6
Final LocalSum: 7
Parallel For completed. IsCompleted: True
最终结果55
不重复线程数:10
```
可以看出来循环10次线程开了10个

将循环范围改为[1,101) 
结果
```
最终结果5050
不重复线程数:26
```
大概开了26个线程 

三种上下文[Context](https://learn.microsoft.com/zh-cn/dotnet/api/system.threading.executioncontext?view=net-8.0)
>The ExecutionContext class provides a single container for all information relevant to a logical thread of execution. In .NET Framework, this includes security context, call context, and synchronization context. In .NET Core, the security context and call context are not supported, however, the impersonation context and culture would typically flow with the execution context. Also in .NET Core, the synchronization context does not flow with the execution context, whereas in .NET Framework it may in some cases. For more information, see [ExecutionContext vs SynchronizationContext](https://devblogs.microsoft.com/dotnet/executioncontext-vs-synchronizationcontext/).

## C# 中的任务取消
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


## 定时器
System.Threading  namespace 中的 
Timer 这是一个轻量级的定时器
同时还有PeriodicTimer

同时在
System.Timers
System.Windows.Froms
也存在Timer类型

在C# 4 CLR一书中作者希望我们不要用System.Timers.Timer 它由Component派生为了可以添加在vs的设计器中
这里有一些简要[介绍](https://learn.microsoft.com/zh-cn/dotnet/standard/threading/timers)

现代.net编程 使用sync/await 推荐使用System.Threading.PeriodicTimer

暂停
await Task.Delay(2000); 异步暂停
Thread.Sleep(2000) 同步暂停
