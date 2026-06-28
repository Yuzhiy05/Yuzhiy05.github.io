---
title: rust多线程
createTime: 2026/06/21 23:31:33
permalink: /article/0m5cmlod/
---

# 多线程相关api

## 线程thread

- **spawn**: 创建新线程
- **move**: 移动所有权

## channel

多生产者单消费者设施：`std::sync::mpsc`

例子来自[链接](https://rustwiki.org/en/book/ch16-02-message-passing.html#sending-multiple-values-and-seeing-the-receiver-waiting)

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    for received in rx {
        println!("Got: {}", received);
    }
}
```

:::info 说明
虽然mpsc是多生产者单消费者设施，但 `mpsc::channel()` 返回元组，第一个元素为生产者，第二个元素为消费者。将生产者 `clone` 实现多生产者。
:::

## 互斥体Mutex

rust的互斥体和c++的互斥体 `std::mutex` 有很大区别。

### C++ 用法

```cpp
#include <print>
#include <mutex>
#include <jthread>

std::mutex mtx;

int main() {
    int data = 0;
    std::jthread t([&] {
        std::lock_guard<std::mutex> lock(mtx);
        data = 42;
    });
    std::jthread t2([&] {
        std::lock_guard<std::mutex> lock(mtx);
        std::print("{}", data);
    });
}
```

### Rust 用法

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let data = Arc::new(Mutex::new(0));

    let d1 = Arc::clone(&data);
    let t1 = thread::spawn(move || {
        let mut num = d1.lock().unwrap();
        *num = 42;
    });

    let d2 = Arc::clone(&data);
    let t2 = thread::spawn(move || {
        let num = d2.lock().unwrap();
        println!("{}", *num);
    });

    t1.join().unwrap();
    t2.join().unwrap();
}
```

:::tip 关键区别
==可以看出来rust的Mutex和数据是强关联的——`new` 函数直接使用数据做参数==，c++的mutex和数据无关，他保护哪些数据则完全由程序员控制。

==这是rust要求使用任何数据前强制 `lock`==，否则直接使用类型是 `MutexGuard`。
:::
