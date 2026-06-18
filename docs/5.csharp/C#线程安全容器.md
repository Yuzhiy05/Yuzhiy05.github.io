
# 线程安全容器
## BlockingCollection 阻塞集合

底层有两个其他线程安全集合组成
ConcurrentQueue

ConcurrentStack

这两个类型都实现了IProducerConsumerCollection接口

观察BlockingCollection的构造函数
```c#
public BlockingCollection();

public BlockingCollection(IProducerConsumerCollection<T> collection);

public BlockingCollection(int boundedCapacity);

public BlockingCollection(IProducerConsumerCollection<T> collection, int boundedCapacity);


BlockingCollection<string> bc = new BlockingCollection<string>(new ConcurrentBag<string>(), 1000 );
```

参数说明
collection 这里指代底层使用的容器可以用ConcurrentQueue或ConcurrentStack
没有参数的构造函数版本默认底层使用ConcurrentQueue

boundedCapacity 参数指定该容器最大容量,最大容量会影响容器的行为

注意边界上限在创建BlockingCollection 时需要指明,没有指定边界容量-即调用默认构造函数的版本则无上限。

BlockingCollection其实是一个线程安全的生产者消费者模型

例子
生产者容量为1
生产者循环生产10次
消费者每次获取值消费
```c#
public static void blockingCol_test(ManualResetEventSlim done)
{
    int count = 0;
    var blc = new BlockingCollection<string>(1);

    Task.Run(() =>
    {
        while (true)
        {
            blc.Add("string" + count++);
            if (count > 10)
            {
                blc.CompleteAdding();
                break;
            }
        }
    });

    Task.Run(() =>
    {
        try
        {
            foreach (var item in blc.GetConsumingEnumerable())
            {
                Thread.Sleep(100);
                Console.WriteLine("Worker thread is processing: " + item);
            }
        }
        finally
        {
            done.Set();
        }
    });
}

public staic void main()
{
    using (var done = new ManualResetEventSlim(false))
   {
    MCurrentCollectIion_test.blockingCol_test(done);
    done.Wait();
   }
}
```

注意一个函数
GetConsumingEnumerable 它提供了可供消费者消费的集合。
当这个集合为空时blc.GetConsumingEnumerable()这行代码的调用会阻塞

它可传入cancellationToken使用起来和其他可传入取消标记的方法一致
除此之外还有其他从集合中取值/消费 方式

```c#
public IEnumerable<T> GetConsumingEnumerable(CancellationToken cancellationToken);

public IEnumerable<T> GetConsumingEnumerable();

public T Take();

public T Take(System.Threading.CancellationToken cancellationToken);

public static int TakeFromAny(BlockingCollection<T>[] collections, out T? item);

public static int TakeFromAny(BlockingCollection<T>[] collections, out T? item,CancellationToken cancellationToken);
```
Take与GetConsumingEnumerable函数 都会将返回的项或集合从移除BlockingCollection,同时他们都会在容器为空时进行等待从而阻塞线程

TakeFromAny 则可以从多个BlockingCollection中消费(移出)元素 返回值int 为被移除集合的索引

三个个和集合状态相关的属性和函数
```c#
public void CompleteAdding();

public bool IsCompleted { get; }

public bool IsAddingCompleted { get; }
```
当调用CompleteAdding时表示该集合已完成生产

任何因调用消费的方法(Take与GetConsumingEnumerable)但容器内可消费项为0导致的等待都将恢复。也就是说当生产完成时,消费者
线程将集合消费完时也不会阻塞了

向集合内添加消费项可使用

Add 与Take对偶也有存在canceltoken的重载

AddToAny 静态函数版本和TakeFromany对偶参数类型一致

TryAdd   返回bool表示是否插入成功的版本 与Add不同该插入除了重载附带时间版本;在容器已满的时候不会像Add版本一样阻塞而是立即返回插入失败
TryAddToAny

向BlockingCollection容器添加元素时,只要指定了最大边界值。当存储的元素数量Count等于最大边界BoundedCapacity时
继续再增加元素,生产者线程则会阻塞;这很符合生产者-消费者模型的直觉

TryAdd的重载和Add重载都差不多,有两个个重载需要注意一下
```c#
public bool TryAdd(T item, int millisecondsTimeout,CancellationToken cancellationToken);
public bool TryAdd(T item, TimeSpan timeout);
```
millisecondsTimeout/timeout  表示超时等待的时间,容器可能满了需要消费者消费才能插入 

tips
Take与TakeFromAny也有Try版本
注意这个重载 其他重载都有超时参数,这个重载在容器为空时会立刻返回false
```c#
public bool TryTake(out T item);
```
具体参考[链接](https://learn.microsoft.com/zh-cn/dotnet/api/system.collections.concurrent.blockingcollection-1.add?view=net-10.0)

tips2 注意BlockingCollection 需要显式调用Dipoes方法或者使用using语句保护

在winui3中实现该功能的[进度条](https://learn.microsoft.com/zh-cn/dotnet/standard/collections/thread-safe/how-to-add-and-take-items#example-2)

其他例子参考[这里](https://learn.microsoft.com/zh-cn/dotnet/standard/collections/thread-safe/blockingcollection-overview)



