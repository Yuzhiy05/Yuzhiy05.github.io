---
title: js学习记录-ES6
createTime: 2025/10/31 00:08:11
permalink: /article/xwbbpjtm/
---

:::info 说明
打 `*` 号基本就没实际试试，有实例的基本上写过一遍，有的 API 就不写了用到自然会用。

以下表示成员的函数时正规写法 `xxx.prototype.prototype_name`，例如 `String.prototype.at()`，都懒得写中间原型。但是 `String.at()` 表示静态非实例函数，所以表示成员函数或属性时连"类名"和原型都不写。
:::

# ES6 的 js

## 变量解构

跟 C++ 结构化绑定和 C# 模式匹配里的位置模式很像。

用于解构可迭代的对象，比如实现 Iterator 接口的对象。

:::warning 注意
js 宽松的语言特性，解构失败的不报错只是对应变量为 `undefined`。

```js
let [bar, foo] = [1];
// foo 为 undefined
```
:::

## 模板字符串

类似于 C# `@"xxx${index}"` 字符串。

- 使用反引号 `` ` ``
- 可以定义多行字符串
- 使用 `${}` 做字符串插值，引用变量、函数和表达式
- 括号中的内容可以嵌套另一个模板字符串，不举例了，用来生成代码

**使用实例：**

```js
let index = 10;
let str = `this template string ${index}`

let str = `this is muilt line
string ${index++}`
```

1. 用模板字符串做代码生成、模板引擎，不介绍。

### 带标签的模板字符串

写个函数 `tag`，调用不使用一般函数调用方法而是 `` tag`123` `` 这样调用，相当于字符串前缀，然后自己写个函数处理参数。

可以用来表示其他语言的字符串，每个语言设计不一样转义符一样，这样搞自己处理转义。用 `str.raw[i]` 和 `values[i]` 来访问字符串和参数。

```js
function loop(str, ...values) {
    return str.raw[0] + values[0] + str.raw[1];
}

let max = 10000;
let min = 1;
let rand = Math.floor(Math.random() * (max - min + 1) + min);
console.log(loop`hello the ${rand} world`);

// 字符串传进去会根据对应的位置解包成
// str.raw[0] str.raw[1] 对应数组成员
// loop`hello the ${rand} world` 相当于 loop([`hello the`,` world`], rand)

// rand 就传到 ...values 展开的是 values 数组里了

let aaa = 10;
console.log(Object.getOwnPropertyNames`123${aaa}456`);
// 输出
// [ '0', '1', 'length', 'raw' ]
```

也就是说使用标签模板字符串调用时 js 会自动帮我把字符串按 `${}` 分隔成一个类字符数组，其中 `raw` 属性就返回原始没转义的字符串。

:::warning 踩坑
使用模板字符串会使得调用方式改变函数行为。

```js
let aaa = 10;
// 带标签的模板字符串
console.log(Object.getOwnPropertyNames`123${aaa}456`);
console.log(Object.keys`123${aaa}456`);

// 模板字符串函数调用——这种调用方法实际传的是空对象
console.log(Object.getOwnPropertySymbols(`123${aaa}456`));
console.log(Object.keys(`123${aaa}456`));

// 使用普通字符串
console.log(Object.getOwnPropertyNames('123${aaa}456'));
console.log(Object.keys('123${aaa}456'));

// 输出
// 带标签的模板字符串
// [ '0', '1', 'length', 'raw' ]
// [ '0', '1' ]

// 模板字符串函数调用
// []
// [ '0', '1', '2', '3', '4', '5', '6', '7' ]

// 普通字符串
// [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'length' ]
// [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11' ]
```

不同调用方式 js 会将模板字符串解析成不同产物。注意使用普通函数调用的方法传递模板字符串实际上传的是空对象，所以模板字符串调用就使用 `` tag`hello` `` 的调用方法。
:::

**主要用法：**
1. 过滤字符串内容，如 HTML 字符串，防止用户输入恶意内容
2. 国际化每个国家数字不一样

正常使用 `console.log` 还是将他放括号里的。

## 字符串新功能

| 方法 | 说明 |
|------|------|
| `String.fromCodePoint()` | 识别大于 0xFFFF 码点，根据 Unicode 码点创建字符串 |
| `String.raw` | 字符串里每个斜杠 `\` 前都加个 `\`，因为 `\` 会转义，专门给模板字符串用的 |

```js
console.log(String.raw`Hi\n${2 + 3}!`)
// 输出
// Hi\n5!

// 这样调用不行报错
console.log(String.raw('Hi\u000A!'))
// TypeError: Cannot convert undefined or null to object
```

### 实例方法

| 方法 | 说明 |
|------|------|
| `includes(searchStr, searchIndex)` | 是否包含搜索字符串，从 `searchIndex` 位置开始 |
| `startsWith(searchStr, searchIndex)` | 是否在开头，从 `searchIndex` 位置开始 |
| `endsWith(searchStr, length)` | 是否在末尾，第二个参数指示字符串的前 i 个字符串 |
| `repeat(count)` | 将字符串重复 count 次，返回新字符串 |
| `padStart(length, str)` | 头补全，预期补全后的长度，str 补全字符串 |
| `padEnd(length, str)` | 尾补全 |
| `trimStart()` | 清空头空格、tab、换行符 |
| `trimEnd()` | 清空尾空格、tab、换行符 |
| `matchAll()` | 正则表达式匹配 |
| `replaceAll(pattern, replacement)` | 替换所有匹配 |
| `at(index)` | 允许负数的索引访问，负数表示从末尾偏移 |

原有的 `replace` 函数只能替换首个匹配，全部替换得写正则表达式，于是就提供一个新功能。

:::tip 参考
详见 [replaceAll 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E6%8C%87%E5%AE%9A%E5%87%BD%E6%95%B0%E4%BD%9C%E4%B8%BA%E6%9B%BF%E6%8D%A2%E9%A1%B9)
:::

### 暂时不用了解的

- `normalize()`：Unicode 正规化
- `toWellFormed()`：处理代理字符串的

## 正则表达式和 ES6 扩展 *

暂时不看。

## 数值扩展

**1. 新的二进制和八进制写法**

- `0o` 或 `0O` 表示 8 进制
- `0b` 或 `0B` 表示 2 进制

**2. 数值分隔符**

欧美人习惯每三个数值间加逗号或者下划线 `_`，毕竟人家说 100 000（10万）叫 one hundred thousand（一百个千）。

所以 js 引入了数值下划线 `100_000`，这玩意实际上就等于 `100000`，只不过写起来好看。作为参数传递、写入内存、输出都不影响，就纯语法糖。

:::warning 注意
别写到那种一眼看上去不对的用法上：

```js
0_b111111000    // 错误
0b_111111000    // 错误
3_.141          // 错误
3._141          // 错误
1_e12           // 错误
1e_12           // 错误
123__456        // 错误
_1464301        // 错误
1464301_        // 错误
```
:::

**3. 两个判断数值的静态函数**

| 方法 | 说明 |
|------|------|
| `Number.isFinite()` | 是否有限 |
| `Number.isNaN()` | 是否是 NaN，不是 NaN 就是数值，返回 `false` |

:::info 注意
ES5 里有这两函数的全局版本，全局版本调用前会先用 `Number` 构造函数转换到数值类型再判断。
:::

**4. 全局版本数值解析**

| 方法 | 说明 |
|------|------|
| `Number.parseInt()` | 等同于全局 `parseInt` |
| `Number.parseFloat()` | 等同于全局 `parseFloat` |

这两的全局版本现在为了模块化更清晰放 Number 对象里当静态函数了，行为不变。

### 精度相关

**5. Number.isInteger(number)**

判断是否整数。有点搞笑这玩意，js 存储整数也是 IEEE 754 小数存储的，超过精度的数值判断会失准。其次和其他 Number 函数性质一样，非数值类型参数直接返回 `false`。

**6. Number.EPSILON 属性**

一个常量。js 数值不是 IEEE 754 的小数吗，这里引入一个很小误差的误差值（大于 1 的最小可表示小数 1.000...1 减去 1 算出来的误差），也就是说算来算去数值比这个误差小那就没意义。

实际上不等的数值相减小于这个最小误差，那么这两数在 js 里也相等，这玩意就类似于高数里那个极限趋近的 ε。

**7. Number.isSafeInteger()**

ES6 表示数值的上下限 `Number.MAX_SAFE_INTEGER` 和 `Number.MIN_SAFE_INTEGER`，也就是 -2 的 53 次方和 2 的 53 次方。这个函数就是判断这个数值在不在 js 的可表示范围内。

## Math 扩展 *

| 方法 | 说明 |
|------|------|
| `Math.trunc()` | 截断小数部分，返回整数部分 |
| `Math.sign()` | 返回符号，不是 Number 的会先转成 Number |
| `Math.clz32()` | 把数值转换成 32 位无符号数，算这里面有多少前导 0 |
| `Math.imul(a, b)` | 把两个数转成带符号整数然后相乘 |
| `Math.fround()` | 返回一个数的 32 位单精度浮点数形式 |
| `Math.f16round()` | 和上面差不多 16 位精度的浮点数 |
| `Math.hypot(a, b, c)` | 平方和的平方根 |

```js
(0x7fffffff * 0x7fffffff) | 0  // 0
Math.imul(0x7fffffff, 0x7fffffff)  // 1
```

### 对数

| 方法 | 说明 |
|------|------|
| `Math.expm1(x)` | 以 e 为底的对数 - 1 |
| `Math.log1p(x)` | ln(1+x) |
| `Math.log10(x)` | 以 10 为底的对数 |
| `Math.log2(x)` | 以 2 为底的对数 |

### 三角函数

`Math.sinh(x)`、`Math.cosh(x)`、`Math.tanh(x)`、`Math.asinh(x)`、`Math.acosh(x)`、`Math.atanh(x)`

## BigInt *

128 的大整形，用的时候后面带 `n`。`1n` 相当于数值 1 的大整形，其他很多操作和 Number 很像，有些会不一致，不想管细究没意思。

## 函数

### 默认实参

参数不给是 `undefined`。

ES6 前默认实参得这么写：

```js
function log(x, y) {
    y = y || 'World';
    console.log(x, y);
}
```

现在能直接：

```js
function multiply(a, b = 1) {
    return a * b;
}
```

:::tip 注意
默认参数是表达式，每次函数调用都会重新计算。
:::

默认参数是非尾参数不会被忽略，显而易见的，也就是说你想不写参数只能把默认参数放尾部，不然给的参数不对对应不上默认参数。

```js
function f(x = 1, y) {
    console.log(x, y);
}

f()              // 1, undefined
f(2)             // 2, undefined
f(, 1)           // 报错
f(undefined, 1)  // 1, 1
```

你想忽略得显式传 `undefined`，这就和不写参数的想法本末倒置了。注意 `null` 和 `undefined` 语义不一样，传 `null` 就是空不会触发默认参数因为你传了 `null`。

:::info 作用域
有默认参数时参数初始化有单独作用域。看此[教程](https://wangdoc.com/es6/function#%E4%BD%9C%E7%94%A8%E5%9F%9F)。
:::

传对象可以用解包搞默认参数：

```js
function ff({a = 1, b = 1} = {}) {
    console.log(a, b);
}

function m2({x, y} = { x: 0, y: 0 }) {
    return [x, y];
}
```

### 剩余参数 / rest 参数

你不确定参数有多少，可以写成 `...parm` 的样子，`parm` 表示参数的数组。

```js
function f(...parm) {
    console.log(Object.prototype.toString.call(parm));
    parm.forEach(value => console.log(value));
}
f(5, 4, 3, 2, 1)
// 输出
// [object Array]
// 5
// 4
// 3
// 2
// 1
```

这样就不需要 `arguments` 数组了（它就不是数组而是一个类数组的对象还得 `Array.from` 转换成数组才能用数组的操作）。

:::warning 注意
剩余参数只能是参数尾当最后参数，没有 `(a, ...b, c)` 这种。
:::

### name 属性

函数的定义的名字，三个例子：

```js
function ff() {
    console.log('function declaration');
}
let ff1 = () => console.log('arrow function');

let ff2 = function test_name() {
    console.log('function expression');
}
console.log(ff.name);   // ff
console.log(ff1.name);  // ff1
console.log(ff2.name);  // test_name
console.log((value => value++).name);  // (空)
```

匿名函数输出被赋值变量的名字；原函数有名字就用原名，匿名函数没赋值给变量就没名字。

### 箭头函数

类似于 C# 的 Lambda 表达式。

```js
value => value + 5;              // 箭头函数简化
() => { console.log("arrow function"); return 10; };

let func_c = (a, b, c) => a + b * c - 10;
console.log(func_c(1, 3, 4));    // 3

() => ({ name: 1 });             // 返回对象要加括号

() => void doesNotReturn();      // 只执行副作用不返回
```

- 参数部分用括号包裹参数，只有一个参数可以不写括号只写参数名，没有参数用一个括号表示没参数
- 函数体部分只有一个语句且你让他作为 return 语句的表达式可以不写大括号加 `return`，多个语句要写大括号和 `return`
- 返回对象要加括号包裹对象，正常人也知道是因为对象表示时和大括号和函数体括号解析有冲突
- 只执行语句不返回对象还只有一条语句可以后跟 `void`
- 函数很多东西：rest 参数、解包赋值、参数默认值... 箭头函数都能用

:::warning 注意
箭头函数没有 `this`、`arguments` 和 `super` 绑定，也不能当构造函数，也不能在函数体里用 `yield`。
:::

## 数组

### 静态函数

**1. Array.from(arrLike, op)**

转换类数组对象为真正的数组。

- 如 `arguments`（这个以后少用）
- DOM 操作返回的 NodeList
- 取代 ES5 里 `Array.prototype.slice.call` 的用法

这是一个 HTML 页面：

```html
<body>
    <h1>Hello, 这是一个 HTML 页面</h1>
    <button accesskey="h" id="btn">点击</button>
    <script src="script.js"></script>
    <button accesskey="h" id="btn">点击2</button>
    <button accesskey="h" id="btn">点击3</button>
</body>
```

获取所有 button，打印一下类型看看：

```js
let buttens = document.querySelectorAll('button');

function getType(obj) {
    const t = typeof obj;
    if (t !== 'object') {
        return t;
    }
    if (obj === null) {
        return 'null';
    }
    return Object.prototype.toString.call(obj).slice(8, -1);
}
let arr_node = Array.from(nodelist);
let arr_node2 = [...nodelist];

console.log(getType(arr_node2));  // Array
console.log(getType(arr_node));   // Array
console.log(getType(nodelist));   // NodeList
```

`op` 参数是类似 `forEach` 或 `map` 的用法中的操作，对遍历的每个元素需要的执行的操作，操作完再塞到数组里返回。

```js
let arr_like = {
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3
};

let arr_from = Array.from(arr_like, (value) => {
    return value.toUpperCase();
});

console.log(getType(arr_from));  // Array
console.log(arr_from);           // [ 'A', 'B', 'C' ]
```

:::warning 注意
`Array.from` 转换的类数组对象需要有 `length` 属性，并且属性名不是 `0, 1, 2, 3` 开始的序列——中间有间断如 `0, 2, 3` 则 1 位置产生的元素是 `undefined`。
:::

**2. Array.of**

弥补 Array 构造的函数功能，使得数组创建的语义统一。

```js
let arr_construct = new Array(1);
console.log(arr_construct);        // [ <1 empty item> ]
console.log(arr_construct.length); // 1
console.log(arr_construct[0]);     // undefined

let arr_construct2 = new Array(1, 2, 3);
console.log(arr_construct2);       // [ 1, 2, 3 ]

let arr_construct3 = new Array();
console.log(arr_construct3);       // []
```

:::info Array 构造函数的坑
Array 的构造函数对于直传一个参数时行为是指定参数长度的空数组。

`Array.of()` 所有的参数都用来组成数组成员，参数是什么生成的数组就是什么。
:::

### 成员方法 / 实例方法

**1. copyWithin(target, start = 0, end = this.length)**

复制数组成员到指定位置。

| 参数 | 说明 |
|------|------|
| `target` | 指定位置，负数就从末尾开始指定 |
| `start` | 起始位置，负值就从末尾开始算 |
| `end` | 结束位置，不指定就到数组末尾 |

```js
[1, 2, 3, 4, 5].copyWithin(0, 2)
// [ 3, 4, 5, 4, 5 ]
```

**2. find 系列**

根据条件查找符合语义的结果。

| 方法 | 说明 |
|------|------|
| `find(Precondition, this)` | 找到首个返回 `true` 的元素 |
| `findIndex(Precondition, this)` | 找到首个符合条件值的索引，替代 `indexOf` |
| `findLast(Precondition, this)` | 从后向前检查 |
| `findLastIndex(Precondition, this)` | 从后向前检查索引 |

`Precondition` 函数声明可为 `function Precondition(value, index, arr)`，按照索引顺序将元素应用到条件数组中。

:::info 注意
`find` 原语义是不会改变数组内容的，但传入的条件函数不一定。
:::

**3. fill(value, start, end)**

填充数组，常用的 `new Array(10).fill(10)`。

:::warning 浅拷贝问题
填充的参数如果是对象，都是浅拷贝，也就是说多个指向 value 对象的指针。

```js
let test_arr = new Array(5).fill({ name: '1145' });
console.log(test_arr);
test_arr[0].name = 'changed';
console.log(test_arr);
// 输出
// [ { name: '1145' }, { name: '1145' }, { name: '1145' }, { name: '1145' }, { name: '1145' } ]
// [ { name: 'changed' }, { name: 'changed' }, { name: 'changed' }, { name: 'changed' }, { name: 'changed' } ]
```

可以看到数组内容全部被改变了。
:::

**4. 新的遍历函数 / 迭代器**

| 方法 | 说明 |
|------|------|
| `keys()` | 类似 `for...in`，返回键的迭代器 |
| `values()` | 类似 `for...of`，返回值的迭代器 |
| `entries()` | 返回键值对的迭代器 |

```js
let arr7 = [10, 20, 30, 40, 50];
for (let index in arr7) {
    console.log(`index:${index}`);
}
for (let index of arr7.keys()) {
    console.log(`key:${index}`);
}
for (let value of arr7) {
    console.log(`value:${value}`);
}
for (let value of arr7.values()) {
    console.log(`value2:${value}`);
}
for (let [index, value] of arr7.entries()) {
    console.log(`index:${index}, value:${value}`);
}

const iter = arr7.entries();
let first = iter.next().value;
let second = iter.next().value;

console.log(first);   // [ 0, 10 ]
console.log(second);  // [ 1, 20 ]
```

**5. includes(value)**

是否包含指定值，和字符串成员一样。之前查找都用 `indexOf` 还要比较不等于 -1。

**6. 拉平数组**

| 方法 | 说明 |
|------|------|
| `flat(depth = 1)` | 拉平数组，depth 深度可指定，指定 `Infinity` 为参数就是把所有层数都拉平 |
| `flatMap(op, this)` | 拉平数组的操作，只能拉一层 |

```js
console.log([1, 2, [3, [4, 5]]].flat())
// [ 1, 2, 3, [ 4, 5 ] ]
```

**7. at(index)**

支持负数索引的 `[]`。`[-1]` 负索引的数组访问符 js 里没有语义，访问对象时语义是访问属性名为 -1 的对象。现在使用 `at(index)`，`at(-1)` 是倒数第一个元素，注意索引不能超数组长度。

**8. 不改变原数组，返回原数组拷贝的操作**

| 方法 | 对应原方法 | 说明 |
|------|------------|------|
| `toReversed()` | `reverse()` | 逆序，返回新数组 |
| `toSorted()` | `sort()` | 排序，返回新数组 |
| `toSpliced(start, deleteCount, item1...)` | `splice()` | 删除指定位置元素并填充，返回新数组 |
| `with(index, value)` | `splice(index, 1, value)` | 替换指定位置元素，返回新数组 |

### 数组展开

`...[1, 3, 4]` 成 `1, 3, 4`。

```js
let arr = [1, 2, 3, 4];
f(0, ...arr, 5, 6)
// 实际传入的参数是 0, 1, 2, 3, 4, 5, 6

let arr1 = [7, 8, 9]
let arr2 = [1, 2, 3, 4, 5, 6, ...arr1, 10, 11]
// 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
```

将数组展开为参数，展开成员进行赋值传值都可以。配合解构，类似于函数使用 `apply`，但是以后不需要写 `apply`，可以更直观的调用。

:::tip 展开语法
`...` 这三个点运算符叫[展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)，具体看 MDN。

实现了 Iterator 接口的对象——可迭代对象都能展开。
:::

## 对象

**1. 简化写法**

现在能跟写类一样直接写成员函数和成员了，和 OOP 语言越来越像了，只不过属性名和属性值变量名同名。

```js
let a = { bbb }           // 等价于 let a = { bbb: bbb }

let c = {
    ff() { ... }          // 等价于 ff: function() { ... }
}

// 直接返回对象更简单了
function ff(a, b) {
    a++; b++;
    return { a, b };
}
```

使用表达式定义属性名：

```js
const value = 42;
let obj2 = {
    ['some' + 'Key']: 123,
    [value]: 456
}
console.log(obj2.someKey);  // 123
console.log(obj2[42]);      // 456
```

**2. 反射函数属性名**

```js
let obj3 = {
    cc1: 123,
    ff() {
        console.log(ff);
    }
}
console.log(obj3.cc1.name);  // undefined
console.log(obj3.ff.name)    // ff
```

**3. 遍历对象属性的注意事项**

| 方法 | 说明 |
|------|------|
| `for...in` | 所有可遍历，包括继承的属性 |
| `Object.keys` | 所有可遍历，非继承属性 |
| `Object.getOwnPropertyNames(obj)` | 自身所有属性包括不可遍历的，继承的不包含 |
| `Object.getOwnPropertySymbols(obj)` | 自身的 Symbol 属性，只有这个会返回 Symbol 属性 |
| `Reflect.ownKeys(obj)` | 反射自身所有属性，不管是否 Symbol |

遍历顺序：
1. 数值键根据数值升序
2. 遍历字符键根据加入顺序
3. 遍历 Symbol 键根据加入顺序

```js
let arr_test = [1, 3, 4];
let desc = Object.getOwnPropertyDescriptors(arr_test);
console.log(desc);
for (let key in arr_test) {
    console.log(`key:${key}, value:${desc[key].value}`);
}
// 输出
// { '0': { value: 1, writable: true, enumerable: true, configurable: true },
//   '1': { value: 3, writable: true, enumerable: true, configurable: true },
//   '2': { value: 4, writable: true, enumerable: true, configurable: true },
//   length: { value: 3, writable: true, enumerable: false, configurable: false } }
// key:0, value:1
// key:1, value:3
// key:2, value:4
```

:::info 可枚举属性
可以发现 `length` 属性的属性描述符中 `enumerable` 可枚举项为 `false`，正因为如此才会在 `for...in` 中被屏蔽不会被枚举到。

除此之外 `Object.keys`、`assign` 也会屏蔽可枚举项为 `false` 的属性（还会屏蔽继承的属性，`for...in` 不会）。
:::

**4. 简化表示对象原型**

`super` 关键字只能用在对象方法里，在内部替代 `Object.getPrototypeOf()`。

**5. 对象也能解包、解构赋值**

**6. 展开运算符**

`...` 解包运算符可以用在对象上，展开对象自身且属性描述内可枚举的属性，基本上替代了 `Object.assign`。

```js
let {x, y, ...z} = {x: 1, y: 2, z: 3, o: 4}
// x 1, y 2, z {z: 3, o: 4}
```

:::warning 注意
解构赋值是浅拷贝，同时不能复制从原型对象继承的属性。

[例子](https://wangdoc.com/es6/object#%E8%A7%A3%E6%9E%84%E8%B5%8B%E5%80%BC)
:::

## 异常错误对象

- `AggregateError`：封装了多个错误的对象，一个操作抛多个异常的时候用
- `Error` 对象现在有 `case` 属性，提供一个报错原型不一定要字符串，具体看 MDN

## Symbol

ES6 新增的原始类型，用来标记唯一值、防止冲突的，一般用在对象属性名中。

这个类型类似于字符串，可以用字符串初始化他，在期望字符串的场合都会使用打印的字符串，用字符串初始化其实是给 Symbol 添加描述，不然声明两个 Symbol 实际不一样，但人看不出区别。

:::info 特性
任意两个 Symbol 类型都是不相等的，声明一堆 Symbol 类型的值尽管参数一样 `===` 判断都不指代同一对象。
:::

**实例属性：**

`description` 就是描述 Symbol 字符串，也就是构造时传入的字符串。

```js
let syb1 = Symbol('111');
let syb2 = Symbol('222');

syb1.toString()
syb2.toString()

String(syb1)
String(syb2)
```

一般放对象里当属性名，和一般属性名定义差不多，但是注意使用和定义要套在 `[]` 里做表达式属性，不然属性名就成字符串了。

也能定义类似 Enum 的东西：

```js
let syb1 = Symbol('111');
let syb2 = Symbol('222');
let syb3 = Symbol('333')

let obj = {
    [syb1]: '111',
};
obj[syb2] = '222'

Object.defineProperty(obj, syb3, { value: '333' })

console.log(Object.getOwnPropertySymbols(obj))

let Mode = {
    DEBUG: Symbol('debug'),
    RELEASE: Symbol('release'),
    MIN: Symbol('MIN')
}
```

因为能转为字符串，有些时候期望字符串的场合传 Symbol，转换成字符串当唯一字符串使用。

:::tip 遍历 Symbol 属性
遍历 Symbol 声明的属性名得用专门的 `Object.getOwnPropertySymbols()`，其他的 `for...in`、`getOwnPropertyNames` 都找不到。还有个 API 能找到：`Reflect.ownKeys()`。
:::

**静态属性：**

| 方法 | 说明 |
|------|------|
| `Symbol.for(str)` | 查找是否已经用字符串 str 注册了 Symbol，有就返回那个；没有就在全局注册一个并返回 |
| `Symbol.keyFor(symbol)` | 查找全局有没有注册的 Symbol，有就返回该 Symbol 的描述字符串 |

**几个内置 Symbol：** 参考 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)

## 新的数据结构

### Set

类似于 C++ 容器 set，按插入顺序（无序）键值唯一的容器。

**如何创建？**

```js
// 1. 构造函数
let set1 = new Set()
[1, 3, 4, 5].forEach(x => set1.add(x));

let set2 = new Set([1, 3, 4, 5, 6]);

const set3 = new Set(document.querySelectorAll('div'));
```

**小玩法：**

```js
// 数组元素去重
[...new Set(array)]

// 去除字符串的空值部分
[...new Set('ababbc')].join('')
```

**实例属性和方法：**

| 方法/属性 | 说明 |
|-----------|------|
| `size` | 返回 Set 元素个数 |
| `add(value)` | 添加元素，返回 Set，可链式调用 |
| `delete(value)` | 删除对应的值，返回是否删除成功 |
| `has(value)` | 是否有该成员 |
| `clear()` | 清除所有内容 |

和 Array 一样可以用以下方式遍历：
- `keys()`：键遍历（Set 没有键，效果和 `values()` 一样）
- `values()`：值遍历
- `entries()`：键值对遍历
- `forEach()`：回调遍历所有成员
- `for...of`
- `...` 展开运算符

:::tip 集合操作
使用 Set 可以为数组去重，同时可以实现并集、交集、差集。

ES2025 也提供了集合操作：

| 方法 | 说明 |
|------|------|
| `intersection(other)` | 交集 |
| `union(other)` | 并集 |
| `difference(other)` | 差集 |
| `symmetricDifference(other)` | 对称差集 |
| `isSubsetOf(other)` | 判断是否为子集 |
| `isSupersetOf(other)` | 判断是否为超集 |
| `isDisjointFrom(other)` | 判断是否不相交 |

`other` 为 Set 或类 Set 对象。类 Set 对象可以认为是实现了下面三个属性的对象：
- `size`：返回元素数量
- `has(value)`：返回元素是否存在
- `values()`：返回容器中元素的迭代器对象
:::

### WeakSet

类似 Set，但成员只能是对象和 Symbol 值。

这是用来放临时对象，因为 GC 根据可达性分析，只要对象被引用就不会被 GC 清理。用来放置别处引用一旦访问不到该对象可立马被 GC 回收的对象——期望容器内部对象与原对象有相同生存期，不占内存。

### Map

js 的对象本身就是键值对，但 js 对象的键是字符串，使用时也会转换为字符串。

现在 ES6 提供了一个键可以不是字符串的容器。

**创建 Map：**

Map 构造接受一个键值对所组成的数组或者可迭代对象。

```js
const map = new Map([
    [1, '111'],
    [2, '222']
]);
console.log(map.get(1));
```

:::tip 注意
1. 同名键（原始类型）值新值覆盖旧值
2. `==` 但不 `===` 的对象，也就是说内容相同但是不是同一对象（地址不同）的对象作为 Map 的键，不被视为同一个键。原始对象只要 `==` 也就是值相同就会被 Map 视为同一个键。
:::

**实例属性：**

| 方法/属性 | 说明 |
|-----------|------|
| `size` | 成员数量 |
| `set(key, values)` | 添加键值对，返回原 Map 对象 |
| `get(key)` | 获取对应键的值 |
| `has(key)` | 是否有该键 |
| `delete(key)` | 删除键值对，返回是否删除 |
| `clear()` | 清除成员 |

遍历与 Array、Set 类似，还是那几个函数。注意 Map 遍历顺序是插入顺序。

:::info 注意
Map 没有 `filter` 方法，过滤得借助数组。
:::

### WeakMap

类似 Map，但只接受对象（非 null）和 Symbol 值作为键 key。

和 WeakSet 类似，在其中的成员键 key 不干扰 GC，即弱引用，不增减引用计数，而值仍在和一般对象一样。

没有下列实例方法和属性：`keys()`、`values()`、`entries()`、`size`。

只有 `get()`、`set()`、`has()`、`delete()`。

一般引用 DOM 对象，DOM 对象删除时，此处弱引用不会干扰 GC 释放 DOM 对象的内存。

### WeakRef

是更进一步的创建弱引用，也就是说 WeakRef 引用对象不会增加原对象的引用计数——不干扰 GC。

`deref()`：解引用，原对象没被 GC 则返回原对象，否则返回 `undefined`。

用处：作为缓存，缓存存在则取缓存，原对象失效则缓存失效。

## 迭代器 Iterator

遍历容器中的元素是很常见的操作，且对 js 的多数容器或对象例如 Array、Set、Map、DOM NodeList 共有的操作。多数语言都为了将容器和遍历操作分离，来专门实现一个迭代器，而不是将迭代操作耦合到每个容器中。也就是说每个容器只需要实现了某些功能/协议（在别的语言中属于接口），都可以迭代。

js 的可迭代的概念 [参考 MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#%E5%8F%AF%E8%BF%AD%E4%BB%A3%E5%8D%8F%E8%AE%AE)。

这一切都是为了让容器都可以使用 `for...of` 遍历，一种统一的访问容器元素的机制。

:::warning 注意
原先的 `for...in` 会遍历到原型链的属性，为了不破坏 API，对数组对象还会遍历到非数字的属性 `length`。
:::

迭代器类似 C 语言数组的指针。

### 如何实现可迭代？

为对象添加 `[Symbol.iterator]()` 属性（或在原型链上添加该属性），这样 js 每次对对象调用 `for...of` 时都会使用 `[Symbol.iterator]()`。这个属性是个无参返回一个迭代器的函数。

### 如何实现迭代器？

为自建迭代器实现 `next` 方法：

```
IteratorResult next(value[option])  // 参数是可选的
```

返回值符合 IteratorResult 接口要求，差不多就下面这样一个对象：

```js
{ value: [value], done: true/false }
```

`value` 为指向元素的值，`done` 表示是否遍历完毕。

可选的实现：`return(value)`、`throw(exception)`，看 MDN。

**实现一个可迭代的例子：**

这里实现的可迭代对象利用了数组的已有迭代器；显然我们无法像 C 语言一样获得一个数组指针自己在内存上进行操作，从零实现迭代器。

```js
function iterable() {
    this.length = 3;
    this.first_name = '114';
    this.mid_name = '514';
    this.end_name = '1919'
    this[Symbol.iterator] = function() {
        let index = 0;
        const values = [this.first_name, this.mid_name, this.end_name];
        return {
            next: () => {
                if (index < values.length) {
                    return { value: values[index++], done: false };
                } else {
                    return { value: undefined, done: true };
                }
            }
        }
    }
}

const iter = new iterable();
for (let x of iter) {
    console.log(x);
}
```

不过通常会把 `[Symbol.iterator]` 写在数组原型对象上，让每一个用此原型做对象的都有该迭代方法，同时让数据和通用方法分离：

```js
function Iterable() {
    this.first_name = '114';
    this.mid_name = '514';
    this.end_name = '1919';
}

Iterable.prototype[Symbol.iterator] = function() {
    const values = [this.first_name, this.mid_name, this.end_name];
    let index = 0;
    return {
        next: () => {
            if (index < values.length) {
                return { value: values[index++], done: false };
            } else {
                return { value: undefined, done: true };
            }
        }
    };
};
```

再进一步把数据放进数组里：

```js
function Iterable() {
    this.data = ['114', '514', '1919']
}
```

我们发现，自己实现一个可迭代对象不是从零开始造的（也没法造），而是尽可能复用内置对象和类型。

有时对于相似对象，我们可以复用已有的迭代器属性：

```js
let iterable = {
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
}
```

为自定义类数组对象添加可迭代属性，不用自己写迭代器方法了。当然可以替换某些可迭代对象的迭代方法实现使得返回完全不相关的对象。

**一般以下情况会调用迭代器：**

- `for...of`
- 对象解构赋值
- 对象调用展开运算符
- `Array.from(iterable)`
- `Map()`、`Set()`、`WeakMap()`、`WeakSet(iterable)`
- `Promise.all(iterable)`
- `Promise.race(iterable)`

:::tip 小知识
字符串也有迭代器接口，所以可以把字符串解包成单个字符。

```js
let str = 'hello';
let arr = [...str];
console.log(arr);
// [ 'h', 'e', 'l', 'l', 'o' ]
```
:::

## class

为了像其他语言使用 OOP 一样，js 引入 `class` 关键字，让 js 声明对象可以和其他 OOP 语言一样，其内部实现还是原型链那一套，只不过语法不一样了。

### 新语法

原先 js 声明对象得声明一个普通函数，内部使用 `this` 关键字引用想要的属性（这样才算构造函数），同时还要调整原型链，并将这个声明上和普通函数无异只是内部特殊语法的构造函数绑定到原型链的 `construct` 属性上，再使用 `new` 关键字调用该构造函数才能生成对象。不仅和一般语言不同且繁琐。

现在引入了 `class` 可以这么写：

```js
class myObj {
    constructor(a, b) {
        this.a = a - b;
        this.b = a + b;
    }
    toString() {
        return (this.a + this.b).toString();
    }
    ff() {
        console.log('this is ff')
    }
}
```

虽然语法不一样，实际还是原型链那一套。可以看一下两个事实：

```js
console.log(typeof myObj)                    // function
console.log(myObj === myObj.prototype.constructor)  // true
```

同时在类中定义属性/函数 `constructor`、`toString`、`ff` 实际都定义在原型链上：

```js
console.log(Object.getOwnPropertyNames(x))              // [ 'a', 'b' ]
console.log(Object.getOwnPropertyNames(myObj.prototype)) // [ 'constructor', 'toString', 'ff' ]
```

同时和之前类似，定义在 `constructor` 中用 `this.property_name` 引用的属性会作为对象自身的属性，和用 `assign` 与直接在原型上添加属性效果一样。

```js
Object.assign(myObj.prototype, {
    ff2() { console.log('111'); },
    age: 3
})
console.log(Object.getOwnPropertyNames(myObj.prototype))

myObj.prototype.ff3 = function() { console.log(4); }
console.log(Object.getOwnPropertyNames(myObj.prototype))
```

同时 `class` 关键字还支持类表示的写法，使用类声明的名字时不加 `new` 还会报错（ES5 比较宽容，为了防止忘记写 `new` 需要一些额外写法来防止，ES6 使用语法糖直接解决了），每个类默认都需要有一个名为 `constructor` 的构造函数。使用 `this` 声明属性后默认返回对象，这简直和 ES5 的构造函数语法一样，就是为了在语法上更贴近 Java、C++、C# 等语言。

```js
let x = class X {
    constructor() { ... }
    ...
}
```

新的语法里类自身属性（非原型链上的属性）也可以写在类定义顶部：

```js
class X {
    a = 10;
    str = '111'
    constructor() { ... }
}
```

在顶部声明的属性就如同在 `constructor` 函数或原先 ES5 一样在构造函数里添加的属性一样是类实例的属性。

同时为了更贴近 Java、C#，js 的类声明中还可以使用 `get`/`set` 函数和静态方法/属性、私有属性（访问控制）：

```js
class XX {
    a;
    #name_1 = 'str'     // 私有属性外部访问不到
    static #name_2 = 'name'

    constructor(value) {
        this.a = value
    }

    get a() {
        return this.a;
    }

    set a(value) {
        if (value > 0)
            this.a = value + 1;
        else
            throw new Error("message");
    }

    #ff() {
        console.log('这是一个私有方法')
    }

    static set name2(value) {
        this.#name_2 = value;
    }

    static ff() { console.log('this is static func') }
}

let x = new XX(1);
XX.ff();
x.ff()      // 报错 x.ff 不是一个函数
x.a = -1    // throw error
x.#name_1   // 报错
```

:::info get/set 的用处
`get`/`set` 用处与其他 OOP 语言一样隔离任意数值操作，对存取行为进行验证。搭配私有变量，防止意外的访问。
:::

:::warning 私有属性
使用 `#` 号开头在类首部声明私有字段外部无法访问（动态检查），与其他语言的 `private` 关键字不同。`#` 与之前 `_` 下滑线开头声明的内部函数一样。访问时也是带 `#` 号访问。
:::

`static` 修饰函数/属性，调用时也与 C# 一样使用类名访问，而不是类实例。同时 `static` 也可以修饰私有属性。声明为 `static` 的属性和方法相当于声明在类的原型中。

:::tip 判断私有属性
判断某个属性是否是私有属性使用 `in` 关键字。
:::

### 静态变量的初始化

静态变量存在依赖时，通常需要顺序初始化：

```js
dosth(value) => value + 10;
class X {
    static x
    static y
    static z
    constructor(value) {
        this.x = value;
        this.y = dosth(this.x);
        this.z = dosth(this.y)
    }
}
```

这样写每次创建新的对象时都需要执行一遍。如果写在类外面，形式上数据与操作分离了不是一个好的实践。

现在可以直接写 `static` 块，且这些静态的执行是按声明顺序同步执行的：

```js
class X {
    static x = 10;
    static y;
    static z;
    ff() { ... }
    static {
        console.log('静态块1')
        this.y = dosth(this.x)
    }
    ff2() { ... }
    static {
        console.log('静态块2')
        this.z = dosthn(this.y)
    }
}
```

:::tip 注意
class 中的 `this` 指向与其他 OOP 语言无异，都指向 `new` 创建的类实例。
:::

### 接口 / 抽象类类似物

`new.target` 关键字

### 关于私有运算符的设计

参考这篇 [FAQ](https://github.com/tc39/proposal-class-fields/blob/main/PRIVATE_SYNTAX_FAQ.md)

### 继承语法

`extends` 一个典型写法，继承某个类并调用其父类构造函数：

```js
class A {
    #aaa
    constructor(a = 1) {
        this.#aaa = a;
    }
}

class B extends A {
    #bbb
    constructor(a = 1, b) {
        super(a)
        this.#bbb = b;
    }
}
```

:::warning 注意
在调用 `this.#bbb` 需要先调用 `super` 函数，因为子类的 `this` 需要有父类构造函数初始化。与一般 OOP 的语言想象一致的是，class 机制下需要先构造父类，再构造子类。
:::

上述继承语法实际上构造了下面这样的原型链：

```js
console.log(b.__proto__ === B.prototype)       // true
console.log(b.__proto__)                        // A{}
console.log(B.__proto__ === A)                  // true
console.log(B.prototype.__proto__ === A.prototype)  // true
```

B 其实是一个构造函数，他的原型指向构造函数 A。

正如 OOP 理论，私有的属性和方法都不会继承，静态属性和方法则会被继承。注意静态属性的继承是浅拷贝，对原始类型和对象有不一致。

:::tip 小知识
可以继承一些常见容器如 Array，实现自己的容器类型。
:::

---

# js 的坑

**1. 模板字符串做代码生成**

实现简单的模板引擎，用现有的就行不要学怎么写。

**2. 使用标签模板字符串**

模板字符串会转义，输入的是别的语言的字符串转义规则不一样在 js 里转不了。ES2018 放宽限制，对转不了的不报错转换成 `undefined`。

**3. 标签模板字符串调用限制**

`` tag`123` `` 这样调用的时候会放松限制。

**4. Number.isNaN() 和 Number.isFinite**

因为字符串 `'15'` 能转换成数值 15，所以全局函数版本先用 Number 转换数值对象，再 `isNaN()` 返回 `false`（他是一个数不是 NaN）。

对于 `Number.isFinite`，你是字符串就直接判死刑了返回 `false`，只对数值对象判断。直接用静态函数，你不是数值就直接返回 `true`。

**5. Number.isInteger(number)**

超精度数值判断失准，25.0 和 25 视为一个值。

```js
function test_bool(...args) {
    args.forEach((arg) => {
        console.log(arg);
    });
}

test_bool(
    Number.isInteger(25),                // true
    Number.isInteger(25.0),              // true
    Number.isInteger(3.0000000000000002), // true
    Number.isInteger(5E-324),            // false
    Number.isInteger(5E-325),            // true
)
```

**6. BigInt**

这个有些操作会和 Number 不一致，我不想记具体的，有什么问题查 MDN 就好了。

**7. 严格模式**

使用默认参数、解构赋值、拓展运算符，函数内部不能用严格模式。属于设计妥协。

**8. 箭头函数里的 this**

不指向箭头函数本身而是创建时的作用域对象，看这个[例子](https://wangdoc.com/es6/function#rest-%E5%8F%82%E6%95%B0:~:text=%E4%B8%80%E6%AC%A1%E9%83%BD%E6%B2%A1%E6%9B%B4%E6%96%B0%E3%80%82-,%E7%AE%AD%E5%A4%B4%E5%87%BD%E6%95%B0,-%E5%AE%9E%E9%99%85%E4%B8%8A%E5%8F%AF%E4%BB%A5)。

对象定义中使用箭头函数：

```js
const cat = {
    lives: 9,
    jumps: () => {         // ❗ 这是一个箭头函数
        this.lives--;      // 这里的 this 不是 cat！
    }
}
```

同时通过箭头函数没有属于自己的 `this`，其中的 `this` 只会指向定义时外部 `this` 的特性；在事件回调中可以固定 `this` 值使其在调用时不会指向全局或者模块作用域。

**8.1 js 里的作用域就三种：**

1. 模块作用域
2. 全局作用域
3. 函数作用域

也就是说声明对象时的括号 `{}` 是不构成作用域的，这就是上面那个箭头函数的例子里作为对象的属性包裹在对象声明的括号中 `{}`，`this` 也指向外部的原因（作用域是全局，`this` 指向声明时的作用域也就是全局）。

此教程有很多例子我就不写了，反正关于 `this` 坑很多。

**9. Function.prototype.toString()**

现在返回源代码，还包括注释。

**10. try...catch 可以省略 catch 参数**

```js
try {
    // ...
}
catch {
    // ...
}
```

**11. 数组空位**

ES5 中 `[1, 3, , 4, 5]` 其中的空位不是 `undefined`，但是 ES5 的很多遍历函数对空位的行为不一致。`forEach()`、`map()`、`filter()`、`reduce()`、`every()`... 凡是有遍历的对空位的处理分为三种情况反正不一致。

ES6 统一将空位定义为 `undefined`。

```js
let arr_empty = new Array(5);  // 五个空位的数组
console.log(arr_empty[1]);     // undefined
```

`Array.from()` 会将空位处理为 `undefined`。

`...`、`copyWithin`、`fill`、`for...of`、`entries`、`keys`、`values`、`find`、`findIndex` 现在都不会当空位不存在。

**12. ES5 早期数组排序方法缺乏稳定性**

ES2019 全部采用稳定算法。

**13. 解包的模式是属性名而不是位置**

这个例子我假设不知道 `ff` 的实现只知道 `ff` 返回一个对象，我想用自定义的变量名解包就会报错。一般这种情况很少，智能感知会提示返回的变量名的。

```js
let ff = (a, b) => {
    a++;
    b++;
    return { a, b };
};

let { x, y } = ff(10, 20);
console.log(x);  // undefined
console.log(y);  // undefined
```

**14. 表达式属性是个对象会把属性字符串名提升到 Object**

```js
const keyA = {a: 1};
const keyB = {b: 2};

const myObject = {
    [keyA]: 'valueA',
    [keyB]: 'valueB'
};

myObject  // Object {[object Object]: "valueB"}
```

**15. 成员函数的 name 属性**

对 `bind`、Function 构造函数和 `get`、`set`、Symbol 有特定行为。

**16. Map 的键值对**

`set` 同一个键的值最新的值会覆盖旧的值。

```js
const map = new Map([
    [1, '111'],
    [2, '222'],
    [1, '333']]
);
console.log(map.get(1));  // 333
```

用对象做键需要引用：

```js
const map2 = new Map(
    [[{ p: '111' }, 111]]
);
let obj_key = {
    p: '111'
};
map2.set(obj_key, 2);
console.log(map2.get({ p: '111' }))  // undefined
console.log(map2.get(obj_key))       // 2
```

**17. super**

作为函数仅能在类中的 `constructor` 使用，表示调用父类构造函数。

作为对象可以在类中任意函数使用，实例属性中指代父类原型对象（注意是这样的对象 `Base.prototype.x = 2`，`super.x` 可以取到，而属于父类实例对象则取不到了）。同时 `super` 作为对象有一些不一致性参考 MDN。

`super` 调用时使用 `this` 也存在一些不一致性，在此时 `super` 就是 `this`。

```js
class A {
    constructor() {
        this.x = 1;
    }
    print() {
        console.log(this.x);
    }
}

class B extends A {
    constructor() {
        super();
        this.x = 2;
    }
    m() {
        super.print();
    }
}

let b = new B();
b.m()  // 2

class A {
    constructor() {
        this.x = 1;
    }
}

class B extends A {
    constructor() {
        super();
        this.x = 2;
        super.x = 3;
        console.log(super.x);  // undefined
        console.log(this.x);   // 3
    }
}

let b = new B();
```

静态属性中 `super` 指向父类对象实例。

**18. prototype 和 \_\_proto\_\_ 和 Object.getPrototypeOf(obj)**

`prototype` 是构造函数特有的属性，class 相当于构造函数的语法糖，使用 class 声明的也有这个属性。

```js
function Person(name) {
    this.name = name;
}

// 给 Person 的 prototype 添加方法
Person.prototype.sayHello = function() {
    console.log(`Hello, I'm ${this.name}`);
};

const person = new Person('Alice');
person.sayHello();  // Hello, I'm Alice

// Person 是一个函数，所以有 prototype 属性
console.log(Person.prototype);  // { sayHello: [Function], constructor: [Function: Person] }

// 但 person 是个实例对象，没有 prototype 属性（普通对象默认没有 prototype 属性）
console.log(person.prototype);  // undefined
```

`__proto__` 是每个对象都有的一个非标准化但是实现都有的属性，指向每个对象的原型，构造原型链的。

```js
function Person() {}
const p = new Person();

// p.__proto__ 指向 Person.prototype
console.log(p.__proto__ === Person.prototype);  // true

// Person.prototype 的 __proto__ 指向 Object.prototype
console.log(Person.prototype.__proto__ === Object.prototype);  // true

// Object.prototype.__proto__ 是 null
console.log(Object.prototype.__proto__);  // null
```

`Object.getPrototypeOf(obj)` 是 `__proto__` 的替代，获取原型对象的标准方法。

```js
function Person() {}
const p = new Person();

// 获取 p 的原型，等同于 p.__proto__
console.log(Object.getPrototypeOf(p) === Person.prototype);  // true

// 获取 Person.prototype 的原型，就是 Object.prototype
console.log(Object.getPrototypeOf(Person.prototype) === Object.prototype);  // true
```
