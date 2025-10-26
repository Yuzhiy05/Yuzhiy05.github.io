

# js 的现代特性

## 异步的前情提要
首先需要指出的是js是单线程的,毕竟他被设计时是作为浏览器脚本来用的,所以尽量简单;但解析的js的引擎是多线程的例如V8
js的执行上下文。[参考](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)

解释一下`执行上下文` 这是mdn里的专有名词可以搜到

就是执行函数中的栈 包含一些当前执行函数的:变量 函数 对象 ,函数退出时需要返回的地址;js里有许多回调函数应用,回调执行到暂停点会返回调用栈等到暂停点被调用时再次进入回调函数,所以上下文还保存着回调函数的地址
执行上下文差不多对应这样一种抽象:调用函数时; 为执行函数所创建的栈空间

每一个函数或者  setTimeout() 或 setInterval() 创建的执行的js代码段 被称为 **任务**.

js引擎作为web浏览器的脚本都是执行在html中<\script>\的,网页卡顿暂停会给用户不好的体验,所以js脚本一般是非阻塞的,但同时js所有代码都运行在唯一一个主线程上,除非使用为js提供运行环境提供的特殊api(node.js ​-Worker Threads;浏览器的-webworker)才能创建新的线程


### js的事件循环

js提供的事件循环机制其实是js引擎维护了 多个**任务**和**微任务**组成的任务队列。为了方便叙述 下面用一个任务队列和一个微任务队列说明


任务(有的js教程里称为宏任务,估计是和微任务对称)即暂时理解为函数 或者 eval setTimeout() 或 setInterval() 执行的代码段

微任务 可以暂时认为为 Promise 的使用then时的回调函数 执行的任务,和有async/await 暂停执行又恢复执行的任务

一个例子
```js
    setTimeout(()=>console.log("1:这是任务,会在下一个事件循环执行"), 0);

    new Promise((resolve) => {
        console.log("2:这是个同步任务");
        resolve("3:这是个微任务,在同步任务执行完后执行")
    }).then(console.log);

    console.log("4:这是个同步任务,在本轮事件循环之前执行")
//输出
2:这是个同步任务
4:这是个同步任务,在本轮事件循环之前执行
3:这是个微任务,在同步任务执行完后执行
1:这是任务,会在下一个事件循环执行
```

尽管setTimeout设置的事件为0 属于任务也会在下轮事件循环开始执行
这几个console.log 函数都被抽象为一个个任务 其中在then中作为回调函数调用的被作为微任务
正常在代码块中由上至下执行的是任务(或者说同步任务)上一个任务不执行完下一个任务不会执行。

js依此来维护一个任务队列,也就是函数中的同步代码,只有同步任务执行完-同步任务队列为空,此时才开始从执行微任务
微任务执行完-微任务队列为空才会开始执行下一个事件循环

通常 一个.js文件或者被HTML包含的多个\<script\>中的js文件都在一个事件循环中

刚学习 只需要了解三个 进入下一个事件循环的方式 
1.setTimeout() /setInterval() 目前在node.js环境下唯一手动进入下一个事件循环的方法

2.I/O事件的回调 fs.readFile

3.UI中点击事件的回调发生 UI渲染

还有两个 分别是 浏览器空闲时执行的回调 和 手动构造`任务`的方法

## Promise
类似于 c# 的 async await 其返回值Task<result> 和c++ 的多线程工具 future/promise(可惜没做成语言特性) c++20的co_awiwt更像，不过js是单线程的异步操作不一定需要使用线程来实现

异步函数不直接返回所需对象,而是返回一个`承诺` 对象
这个承诺对象自然而然的分三种情况
1.待定
2.完成
3.失败

mdn这么介绍的
> 待定（pending）：初始状态，既没有被兑现，也没有被拒绝。
> 已兑现（fulfilled）：意味着操作成功完成。
> 已拒绝（rejected）：意味着操作失败

这个承若对象外部是改不了的

### 怎么玩?
使用new 调用构造函数生成Promise对象
```js
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```
Promise 构造函数 接受一个函数 其函数传入两个参数 这两个参数是固定式的叫 resolve 和reject 由js引擎控制
这里的resolve和reject 叫什么都行,在构造Promise时js会自动传入两个函数作为参数供你使用。

其中你写了一堆逻辑和操作之后根据条件判断
使用resolve 把该promise的状态置为完成 或者使用rejected把状态置为失败。其中resolve/reject 的参数就是Promise传递出去的结果
相当于返回值的概念.

同时resolve(new Promise...) 兑现的内容也可以是一个新的Promise 

注意Promise的状态在第一次调用resolve/reject 后就已确定后续再调用resolve/reject都不会启效果

### <strong style="color:red ">这个返回值怎么拿到呢?</strong>

使用then() 函数
then函数的有两个重载 、

then(onFulfilled)
then(onFulfilled, onRejected)

重载1的参数允许传入一个回调函数
这个回调函数的参数就是 在Promise中 被resolve(兑现)的值 也就是说使用then时js会调用你传入的回调函数,并且回调函数传入的参数正是
你在Promise中resolve的值,resolve不仅将状态置为完成，并且表示你要将其参数*兑现*

重载2类似1 只不过允许传入失败时回调函数处理
```js
const promise=new Promise(
  (resolve,reject)=>{
      resolve(10);
  }
);

promise.then((value)=>console.log(value));
//输出
10
```
同时then函数也会返回一个新Promise对象 其中兑现的内容或者拒绝原因 靠传入的回调函数的return语句决定 兑现的内容/返回什么拒绝原因
而不是靠resolve/reject函数了

```js
    //箭头函数 单个表达式就是返回值
    Promise.resolve(10).then(value => value + 10).then(console.log);
    
    //用return语句表示要兑现的内容
    Promise.resolve('第二个Promise')
        .then(message => {
            console.log(message);
            return message+10;
        }).then(console.log);

    //没有return 语句 调用第二个then时传入回调函数console.log的参数为undefined
    Promise.resolve('第三个Promise')
        .then(message => {
            console.log(message);
        }).then(console.log);
//输出
第二个Promise
第三个Promise
20
第二个Promise10
undefined
```
return 的语句的表达式不是Promise对象,会隐式的包装成Promise对象以便链式调用then
如果主动返回一个Promise对象,那么 被返回/兑现的内容 为这个新Promise 需要兑现(在内部resolve)的内容 
```js
Promise.resolve('已解决的对象').then((string) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("在下一个事件循环")
                resolve('在下一个事件循环被兑现')
            }, 1)
        })
    }).then((string) => {
        console.log("等上一个任务执行?")
        console.log(string)
    })
    console.log('本轮事件循环结束')
    //输出
本轮事件循环结束
在下一个事件循环
等上一个任务执行?
在下一个事件循环被兑现
```
这里传入第二个then的回调函数的参数(被兑现的值)就是返回的Promise里被resolve的值,每经过一个then函数的调用Promise的状态一定是非待定的也就是要么完成,要么失败。只要是待定状态(未完成状态)then的回调都不会调用,传入给回调函数的参数不可能是Promise对象(thenable对象)

tips [thenable对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenable)
可以理解为实现了 Thenable接口即then函数 的对象 其行为也要和Promise类似

### 错误处理

then(reject)
Promise.try
catch
finally

Promise的错误可以冒泡 在then调用链里传播

有些人不建议使用then函数的第二个重载
即 then(resolveFun,rejectFun) 要处理错误直接使用catch(rejectFun)

可以认为catch(rejectFun)===then(undefined,rejectFun)

Promise调用链会吞错误不catch就不会把错误传播出去

同样的catch方法为了链式调用,返回的也是Promise对象(thenable对象)

finally 的回调函数 不接受任何参数--finally调用应该和Promise是否成功无关 

其他例子暂时不想写

### 几个典型场景
1.需要等待多个Promise的结果
Promise.all
这是一个典型场景,假如异步读取三个不同文件,后续工作需要所有准备工作完毕才能开始进行
则使用all 将多个promise合成为一个promise;这样所有Promise的状态都完成了这个新和成的Promise的状态才会转变为已完成
其中只要有一个Promise的状态为失败则合成的整个Promise状态都是失败的
```js
const p1 = new Promise(resolve => {
        setTimeout(() => {
            console.log("task A resolve")
            console.info(new Date().toLocaleTimeString())
            resolve('taskA')
        }, 1)
    });
    const p2 = new Promise(resolve => {
        setTimeout(() => {
            console.log('task B resolve')
            console.info(new Date().toLocaleTimeString())
            resolve('task B')
        }, 1000)
    });
    const p3 = new Promise(resolve => {
        setTimeout(() => {
            console.log('task C resolve')
            console.info(new Date().toLocaleTimeString())
            resolve('task C')
        }, 2000);
    });

    console.log('等待任务返回');
    const all_promies = Promise.all([p1, p2, p3]);

    all_promies.then(values => console.log(values)).catch(err => console.warn(err));
  

  //输出
  等待任务返回
task A resolve
19:00:46
task B resolve
19:00:47
task C resolve
19:00:48
[ 'taskA', 'task B', 'task C' ]

```
此时这个合成的Promise对象 传递给回调函数的参数是一个数组,可以使用解包语法

2.对时间有要求的竞争任务
Promise.race
合成Promise的状态由第一个返回/兑现的Promise决定 例子直接偷[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/race#%E4%BD%BF%E7%94%A8_promise.race)
```js
function sleep(time, value, state) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (state === "兑现") {
        return resolve(value);
      } else {
        return reject(new Error(value));
      }
    }, time);
  });
}

const p1 = sleep(500, "一", "兑现");
const p2 = sleep(100, "二", "兑现");

Promise.race([p1, p2]).then((value) => {
  console.log(value); // “二”
  // 两个都会兑现，但 p2 更快
});

const p3 = sleep(100, "三", "兑现");
const p4 = sleep(500, "四", "拒绝");

Promise.race([p3, p4]).then(
  (value) => {
    console.log(value); // “三”
    // p3 更快，所以它兑现
  },
  (error) => {
    // 不会被调用
  },
);

const p5 = sleep(500, "五", "兑现");
const p6 = sleep(100, "六", "拒绝");

Promise.race([p5, p6]).then(
  (value) => {
    // 不会被调用
  },
  (error) => {
    console.error(error.message); // “六”
    // p6 更快，所以它拒绝
  },
);
```
最快返回的Promise的状态 决定了合成的Promise的状态

3.对状态不在特别在意,多个任务只要有一个成功的就好
只有所有任务都被拒绝了才会返回 AggregateError 其中error属性表明被拒绝原因的数组

Promise.any
例子 看下MDN
```js
const pErr = new Promise((resolve, reject) => {
  reject("总是失败");
});

const pSlow = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "最终完成");
});

const pFast = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "很快完成");
});

Promise.any([pErr, pSlow, pFast]).then((value) => {
  console.log(value);
  // pFast 第一个兑现
});
// 打印：
// 很快完成
```
到时候我写个html 三个按钮的例子 随便点击三个按钮只要有一个响应了就触发事件 上面这个例子只能当做玩法介绍
没啥实际意义

上面几个使用方法后面有时间都补一些实际一点的例子

### 剩余几个静态函数
Promise.reolove(value)  直接返回一个已完成/兑现的 Promise对象 兑现内容为传入的参数value

Promise.reject(error)          直接返回一个失败的 Promise对象 拒绝理由为为传入的参数error

Promise.allSettled(iterable)   传入的iterable对象中的所有Promise都确定时(要么成功要么失败)返回一个数组对象里面保存了
所有Promise的状态和值 
从MDN偷的例子
```js
Promise.allSettled([
  Promise.resolve(33),
  new Promise((resolve) => setTimeout(() => resolve(66), 0)),
  99,
  Promise.reject(new Error("一个错误")),
]).then((values) => console.log(values));

// [
//   { status: 'fulfilled', value: 33 },
//   { status: 'fulfilled', value: 66 },
//   { status: 'fulfilled', value: 99 },
//   { status: 'rejected', reason: Error: 一个错误 }
// ]
```

这几个函数的参数都可以传Promise(原封不动返回) thenable对象(调用then时会调用thenable对象实现的then) ,也可以不传参直接返回对应状态无兑现值/拒绝理由的Promise;一般都会传原始值

## async/await

很多语言都有这个关键字,js里这两个关键字就是Promise/then常见用法的语法糖

和其他语言的关键字一样 async 放在需要声明的函数前 看例子就知道怎么写了
同时await只能在async函数里使用 async具有传染性,基本上每个设计这两个关键字的语言都有这些特性

通过使用语法糖的形式将返回值包装成Promise 对象;await语句返回兑现的值 而不是Promise

让ai写了个例子 我自己写的依托
```js
 let count = 0;

    // 模拟异步任务1：1秒后增加 count 并打印
    function task1() {
        return new Promise((resolve) => {
            setTimeout(() => {
                for (let i = 0; i < 1000; i += 1) {
                    if (i % 250 == 0) console.log(`[task1] 正在处理 ${i}`);
                }
                count += 10;
                console.log(`[task1] 完成，count += 10，当前 count = ${count}`);
                resolve('task1-result');
            }, 1000);
        });
    }

    // 模拟异步任务2：1秒后增加 count 并打印
    function task2() {
        return new Promise((resolve) => {
            setTimeout(() => {
                for (let i = 0; i < 1000; i += 1) {
                    if (i % 250 == 0) console.log(`[task2] 正在处理 ${i}`);
                }
                count += 20;
                console.log(`[task2] 完成，count += 20，当前 count = ${count}`);
                resolve('task2-result');
            }, 1000);
        });
    }

    // async 函数，清晰地表达异步流程
    async function runTasks() {
        console.log('=== 开始执行异步任务 ===');
        console.log(`初始 count = ${count}`);

        console.log('--- 准备执行 task1 ---');
        const result1 = await task1();  // 等待 task1 的 Promise 完成
        console.log(`task1 返回：${result1}`);

        console.log('--- 准备执行 task2 ---');
        const result2 = await task2();  // 等待 task2 的 Promise 完成
        console.log(`task2 返回：${result2}`);

        console.log(`=== 所有任务完成，最终 count = ${count} ===`);
        return count;
    }

    // 执行并观察
    const finalResultPromise = runTasks();

    // 同步代码，此时任务还没开始或进行中
    console.log(`[同步代码] 当前 count = ${count}`); // 输出 0
    console.log('[同步代码] 等待异步任务完成...');

    // 通过 .then 查看最终结果（等同于 await）
    finalResultPromise.then((finalCount) => {
        console.log(`[Promise.then] 最终返回的 count 是：${finalCount}`);
    });
    //输出
=== 开始执行异步任务 ===
初始 count = 0
--- 准备执行 task1 ---
[同步代码] 当前 count = 0
[同步代码] 等待异步任务完成...
[task1] 正在处理 0
[task1] 正在处理 250
[task1] 正在处理 500
[task1] 正在处理 750
[task1] 完成，count += 10，当前 count = 10
task1 返回：task1-result
--- 准备执行 task2 ---
[task2] 正在处理 0
[task2] 正在处理 250
[task2] 正在处理 500
[task2] 正在处理 750
[task2] 完成，count += 20，当前 count = 30
task2 返回：task2-result
=== 所有任务完成，最终 count = 30 ===
[Promise.then] 最终返回的 count 是：30
```

这一段差不多就是上面async/await的解糖形式 输出一样的 这是我自己写的
```js
 let count = 0;
    function task1() {
        return new Promise((resolve) => {
            setTimeout(() => {
                for (let i = 0; i < 1000; i += 1) {
                    if (i % 250 == 0) console.log(`[task1] 正在处理 ${i}`);
                }
                count += 10;
                console.log(`[task1] 完成，count += 10，当前 count = ${count}`);
                resolve('task1-result');
            }, 1000);
        });
    }

    // 模拟异步任务2：1秒后增加 count 并打印
    function task2() {
        return new Promise((resolve) => {
            setTimeout(() => {
                for (let i = 0; i < 1000; i += 1) {
                    if (i % 250 == 0) console.log(`[task2] 正在处理 ${i}`);
                }
                count += 20;
                console.log(`[task2] 完成，count += 20，当前 count = ${count}`);
                resolve('task2-result');
            }, 1000);
        });
    }

    console.log('=== 开始执行异步任务 ===');
    console.log(`初始 count = ${count}`);
    task1().then((result1) => {
        console.log(`task1 返回：${result1}`);

        console.log('--- 准备执行 task2 ---');
        return task2();
    }).then((result2) => {
        console.log(`task2 返回：${result2}`);
        console.log(`=== 所有任务完成，最终 count = ${count} ===`);
        return count;
    }).then((finalCount) => {
        console.log(`[Promise.then] 最终返回的 count 是：${finalCount}`);
    });
    console.log(`[同步代码] 当前 count = ${count}`); // 输出 0
    console.log('[同步代码] 等待异步任务完成...');
```
对异步函数(声明为async的) 使用await 的等待的实际值

`let x=await dosth()` 

不使用await返回的是Promise对象,后续用then函数获取正真的值或者再次使用await等待
```js
//任务先启动
let x=dosth()
//干点别的
x.then(()=>{
  //开始处理结果
})
//或者 真正需要dosth()的时候在这里等待x的结果
let result=await x
//下面处理结果
```
整个async函数被await划分成几个部分 await表达式后跟的函数调用类似于Promise中setTimeout的部分;当然这个例子不明显,setTimeout只是延迟执行不是真正开线程并行。在await之后的部分可以认为是传入then的回调函数的代码,在then中返回第二个Promise(task2),await task2的后续部分同样可以被认为是then的回调函数的代码。

这样一个async函数作为Promise的语法糖实际是Promise和then拆分成多个部分
MDN也有一个[例子](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function#%E5%BC%82%E6%AD%A5%E5%87%BD%E6%95%B0%E5%92%8C%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F)

async函数中能使用try/catch/finally








