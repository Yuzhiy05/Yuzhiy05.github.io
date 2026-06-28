---
title: C#线程安全容器
createTime: 2026/06/21 23:31:33
permalink: /article/dow05eez/
---

# 线程安全容器

## BlockingCollection 阻塞集合

底层有两个其他线程安全集合组成：

- `ConcurrentQueue`
- `ConcurrentStack`

这两个类型都实现了 `IProducerConsumerCollection` 接口。

### 构造函数

```csharp
public BlockingCollection();

public BlockingCollection(IProducerConsumerCollection<T> collection);

public BlockingCollection(int boundedCapacity);

public BlockingCollection(IProducerConsumerCollection<T> collection, int boundedCapacity);

BlockingCollection<string> bc = new BlockingCollection<string>(new ConcurrentBag<string>(), 1000);
```

### 参数说明

| 参数 | 说明 |
|------|------|
| `collection` | 这里指代底层使用的容器，可以用 `ConcurrentQueue` 或 `ConcurrentStack`。没有参数的构造函数版本默认底层使用 `ConcurrentQueue` |
| `boundedCapacity` | 指定该容器最大容量，最大容量会影响容器的行为 |

::: warning 注意
边界上限在创建 `BlockingCollection` 时需要指明，没有指定边界容量（即调用默认构造函数的版本）则无上限。
:::

`BlockingCollection` 其实是一个线程安全的生产者消费者模型。

### 示例

生产者容量为 1，生产者循环生产 10 次，消费者每次获取值消费：

```csharp
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

public static void main()
{
    using (var done = new ManualResetEventSlim(false))
    {
        MCurrentCollectIion_test.blockingCol_test(done);
        done.Wait();
    }
}
```

### 消费方法

::: tip 注意
`GetConsumingEnumerable` 提供了可供消费者消费的集合。当这个集合为空时，`blc.GetConsumingEnumerable()` 这行代码的调用会阻塞。

它可传入 `CancellationToken`，使用起来和其他可传入取消标记的方法一致。
:::

除此之外还有其他从集合中取值/消费方式：

```csharp
public IEnumerable<T> GetConsumingEnumerable(CancellationToken cancellationToken);

public IEnumerable<T> GetConsumingEnumerable();

public T Take();

public T Take(System.Threading.CancellationToken cancellationToken);

public static int TakeFromAny(BlockingCollection<T>[] collections, out T? item);

public static int TakeFromAny(BlockingCollection<T>[] collections, out T? item, CancellationToken cancellationToken);
```

| 方法 | 说明 |
|------|------|
| `Take` | 与 `GetConsumingEnumerable` 函数都会将返回的项或集合从移除 `BlockingCollection`，同时他们都会在容器为空时进行等待从而阻塞线程 |
| `TakeFromAny` | 可以从多个 `BlockingCollection` 中消费（移出）元素，返回值 `int` 为被移除集合的索引 |

### 集合状态相关

三个和集合状态相关的属性和函数：

```csharp
public void CompleteAdding();

public bool IsCompleted { get; }

public bool IsAddingCompleted { get; }
```

当调用 `CompleteAdding` 时表示该集合已完成生产。

任何因调用消费的方法（`Take` 与 `GetConsumingEnumerable`）但容器内可消费项为 0 导致的等待都将恢复。也就是说当生产完成时，消费者线程将集合消费完时也不会阻塞了。

### 添加元素

向集合内添加消费项可使用：

| 方法 | 说明 |
|------|------|
| `Add` | 与 `Take` 对偶，也有存在 `CancellationToken` 的重载 |
| `AddToAny` | 静态函数版本，和 `TakeFromAny` 对偶，参数类型一致 |
| `TryAdd` | 返回 `bool` 表示是否插入成功的版本。与 `Add` 不同，该插入除了重载附带时间版本外，在容器已满的时候不会像 `Add` 版本一样阻塞而是立即返回插入失败 |
| `TryAddToAny` | - |

::: warning 注意
向 `BlockingCollection` 容器添加元素时，只要指定了最大边界值。当存储的元素数量 `Count` 等于最大边界 `BoundedCapacity` 时，继续再增加元素，生产者线程则会阻塞；这很符合生产者-消费者模型的直觉。
:::

### TryAdd 重载

`TryAdd` 的重载和 `Add` 重载都差不多，有两个重载需要注意一下：

```csharp
public bool TryAdd(T item, int millisecondsTimeout, CancellationToken cancellationToken);
public bool TryAdd(T item, TimeSpan timeout);
```

`millisecondsTimeout` / `timeout` 表示超时等待的时间，容器可能满了需要消费者消费才能插入。

::: tip 补充
- `Take` 与 `TakeFromAny` 也有 Try 版本
- 注意这个重载，其他重载都有超时参数，这个重载在容器为空时会立刻返回 false：

```csharp
public bool TryTake(out T item);
```

具体参考[链接](https://learn.microsoft.com/zh-cn/dotnet/api/system.collections.concurrent.blockingcollection-1.add?view=net-10.0)
:::

::: warning 注意
`BlockingCollection` 需要显式调用 `Dispose` 方法或者使用 using 语句保护。
:::

### 参考

- 在 WinUI3 中实现该功能的[进度条](https://learn.microsoft.com/zh-cn/dotnet/standard/collections/thread-safe/how-to-add-and-take-items#example-2)
- 其他例子参考[这里](https://learn.microsoft.com/zh-cn/dotnet/standard/collections/thread-safe/blockingcollection-overview)
