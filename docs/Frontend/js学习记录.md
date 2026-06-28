---
title: js学习记录
createTime: 2025/08/04 13:47:46
permalink: /article/2pbod4sz/
---

# JS 的常见坑

- 变量提升
- 有代码块但没作用域，变量都是全局的
- 变量没有固定类型，可以多次赋不同的值

:::warning 浮点数精度问题
js 没有整数只有浮点数，`1 == 1.0` 为 `true`，有些操作需要转换成整数 32 位操作会导致精度丢失。

`0.1 + 0.2 == 0.3` 为 `false`，根据 IEEE 754，js 最多保存 15 位整数。
:::

```js
console.log("1==1.0:" + (1 == 1.0));
console.log("0.1 + 0.2 == 0.3:" + (0.1 + 0.2 == 0.3));
console.log("0*infinity:" + (0 * Infinity));
console.log("0/0:" + (0 / 0));
console.log("0/infinity:" + (0 / Infinity));

// 输出
// 1==1.0:true
// 0.1 + 0.2 == 0.3:false
// 0*infinity:NaN
// 0/0:NaN
// 0/infinity:0
```

## js 的类型

**原始类型：**
1. 数值（1，1.1 之类的，js 内部只有浮点）
2. 字符串（'xxx'，"xxxx"）
3. 布尔值（bool）

对象是特殊类型，由不同类型复合而成。

`null` 和 `undefined` 分别为不同的特殊类型。

## null 和 undefined

js 沿用之前的语言习惯，其中的类型都是对象，所以 `null` 只是空对象并没有单独做出一个类型，同时 `null` 对象转换为数值是为 0，和 C 语言、Java 一样。

`undefined` 表示此处无定义，转换成整数为 `NaN`。尽管在做 `instanceof` 进行比较时他们两仍相等，但却表达了不同的语义。

## parseInt / parseFloat 函数

将字符串转换为整数，参数不是字符串的先转换为字符串再转换为整数。

字符串会一个字符一个字符的转换，遇到不能转换的字符就返回已经转换好的数值，自动过滤前导空格、换行。

```js
parseInt('8a')    // 8
parseInt('12**')  // 12
```

首个字符不能转换就返回 `NaN`：

```js
parseInt('abc')  // NaN
parseInt('.3')   // NaN
```

:::tip 参考
详见 [parseInt 详解](https://wangdoc.com/javascript/types/number#parseint)
:::

## 强制类型转换 Number / String / Boolean

js 中运算符对操作数的类型与实际类型不一致时会发生转换，这种期望其实挺符合一般语境，比如减法就是期望两个数值相减。

### Number

对于字符串，`Number` 转换比 `parseInt` 还严格，只要字符串部分有一点不能转换成数值就会转换成 `NaN`。

```js
Number('324abc')  // NaN
```

对于对象，除非是 `var x = [1]` 这样 `Number(x)` 返回 1，其他都返回 `NaN`。

这是因为对任何对象的转换成原始类型都先调用 `valueOf` 方法，如果返回的还是对象则调用 `toString`。像 `[1,2,3]` 这样的数组转换成字符串 `'1,2,3'`，再对其进行 `Number` 函数这没法转换成数值所以是 `NaN`。

:::tip 自定义 valueOf
其他对象也是一样，基本上没自定义 `valueOf` 的对象，`valueOf` 的结果都是自己本身，都没法转成数值。当然自定义的 `valueOf` 和 `toString` 函数都返回对象，不符合 js 的期望时会直接报错，可见 js 对错误宽容多了。
:::

### String

对于原始类型，如期望一样转换成字面意义的字符串。

对于对象，则在调用 `valueOf` 与 `toString` 顺序进行调换了，先对对象进行 `toString` 操作，再 `valueOf`。

```js
var obj = {
  valueOf: function () {
    return {};
  },
  toString: function () {
    return {};
  }
};

String(obj)
// TypeError: Cannot convert object to primitive value
```

:::warning 注意
对于自定义的对象的 `valueOf` 与 `toString` 方法，js 期望的是两次转换至少要转换到原始类型以便应用 `String` 转换成字符串，但是两次都返回对象这不符合 js 的期望，js 会报类型转换失败。
:::

### Boolean

该转换除了那些特殊意义的值其他都转换为 `true`。

## 隐式类型转换

js 对不同语境时发现类型不匹配会自动隐式的转换类型。

**1. 字符串和数值相加时**

js 的期望的语义其实是字符串链接：

```js
1 + '1'                // '11'
'5' + {}               // "5[object Object]"
'5' + []               // "5"
'5' + function (){}    // "5function (){}"
```

**2. 减号对字符串来说没字符串的语义**

```js
'2' - '1'  // 1
'2' - 1    // 1
```

除此之外 `*` `/` 都表达其数学上的语义，只有 `+` 被借用了表达字符串连接的语义。

## 字符串

:::info 小知识
`String.raw()` 等同于 C# 里的 `@"x\rx\nx"` 原样字符串。
:::

- JS 使用 Unicode 字符集，内部默认单字符 UTF-16
- 四字节字符会被视为两字节字符，`string.length` 返回长度不正确
- 可以单引号也能双引号，也能单引号里双引号，双引号里单引号

```js
'字符串'
"字符串'
'xxxx"aaa"'
"ffff'bbb'b"
```

- 默认一行，不能像 C#、C++ 一样分行，多行可以加 `\`
- 字符串默认不可变，修改字符串内部的操作会失效且不报错

## 对象

键值对构成对象，键值是字符串，使用数值型自动转换成字符串。

```js
var obj = {
  foo: 'Hello',
  bar: 'World'
};

// 属性可以是函数，也就是方法
var obj = {
  p: function (x) {
    return 2 * x;
  }
};
obj.p(1)
```

`foo` 称为对象的属性。

js 还允许属性动态创建，后续加属性，没必要声明时指定：

```js
var o1 = {};
var o2 = { bar: 'hello' };

o1.foo = o2;
console.log(o1.foo.bar)  // hello

// 对象和值
var o1 = {};
var o2 = o1;

o1 = 1;
o2 // {}
```

加圆括号令 js 编译器将 `{xxx}` 内容视为对象：

```js
{console.log("hell0")}          // 代码块
({console.log("1111")})         // 对象，报错

// 访问属性
var foo = 'bar';

var obj = {
    foo: 1,
    bar: 2
};

console.log(obj.foo)    // 1
console.log(obj[foo])   // 2
console.log(obj['foo']) // 1
```

- 使用 `.` 访问属性名
- 使用 `[]` 需要加 `''` 访问属性名，因为属性名本质是字符串

```js
var obj = {
    p: 1,
    2: 22
}
Object.keys(obj)    // 查看属性
delete obj.p        // 删除属性
```

:::tip 删除属性
- 可以删除一个不存在的属性，不报错且返回 `true`
- 删除不可删除的属性会报错
- 删除继承的属性无效果
:::

**属性是否存在 `in` 关键字**

查看的是键是否存在而不是值。

```js
var obj = {
    111: 111,
    222: 222
}
console.log(111 in obj)

// 遍历属性
var obj2 = {
    111: 111,
    222: 222,
    333: 333,
    444: 444,
    555: 555
}
console.log(111 in obj2)

for (var i in obj2) {
    console.log(i + " -> " + obj2[i]);
}
```

和 C# 一样对象都继承 `toString` 方法，但是遍历不出来的（不可遍历的属性），对于不可遍历的属性，直接跳过。

:::warning 注意
教程不建议使用 `with` 语句。
:::

## 函数

函数三种声明方式：

```js
// 直接声明
function ff(x) {
    console.log(x)
}

// 函数表达式
var ff = function(x) {
    console.log(x)
};

// function 后带名字只有函数内部可见，递归调用
var ff = function ff(x) {
    ff(x + 1)
};

// new Function 构造函数，没人用
```

:::tip 变量提升与函数覆盖
和变量不一样的是，后声明的同名函数覆盖之前声明。因为变量提升（不管声明在哪，函数调用前，第二次声明的函数都提升到开头了），第一次声明任何时候都不起作用。

```js
function gr(num) {
    console.log("2222, " + num);
};
gr("Bob");
function gr(num) {
    console.log("333, " + num);
};
gr("Bob");

// 输出
// 333, Bob
// 333, Bob
```
:::

**函数三个属性：**

| 属性 | 说明 |
|------|------|
| `name` | 函数名，对于 `function` 关键字后的名字 |
| `length` | 参数个数 |
| `toString` | 函数源码，包括注释 |

```js
var ff = function ff2() {}
ff.name  // ff2
```

原生函数返回 `native code` 不显示全部源码。

:::info 作用域
js ES5 版本只有：
- 全局作用域
- 函数作用域

ES6 的块级作用域后面介绍。
:::

## 数组

js 对象本身就是一个 key:value 键值对组合，js 的数组就是一个特殊对象，它的所有键都是字符串 `'0'` `'1'` `'2` `'3'`...，不是数字是字符串，因为 js 对象的键默认是字符串。所以数组里类型不一样都不是事。

```js
[1, 2, 3, null, undefined, '1', '2']
```

### 1. slice

切片函数，输入数组的 `start` 和 `end` 索引能截取数组切片，同时可以使用负索引。

```js
var arr = [1, 2, 3, 4, 5];
arr.slice(0, 3)   // [1, 2, 3] 左闭区间，右开区间
arr.slice(3)      // [4, 5] 一直到末尾
arr.slice(-2)     // [4, 5] 倒数第二位开始到末尾
```

### 2. sort

默认按字典序排序。

```js
var arr4 = [111, 1011, 110];
arr4.sort();  // [1011, 110, 111]
```

自定义排序规则需要传函数，两个参数 `a, b`，返回大于 0 则 `a` 排 `b` 前面，否则 `b` 排 `a` 前面。

```js
arr4.sort((a, b) => a - b);
// [110, 111, 1011]
```

:::info 注意
不同于其他语言的是，js 更像 C 语言，其他语言的自定义排序函数都要求返回一个 bool 表示 `a` 与 `b` 的序关系，js 与 C 直接的排序函数直接返回数值，而且这还是 js 推荐写法。
:::

### 3. map

返回新数组的映射函数，类似于 `forEach`。

```js
var arr5 = arr4.map(a => a - 1);

var arr6 = arr4.map((elem, index, arr) => {
    return elem + index + arr.length;
});
```

`map` 本身还有一个接受第二个参数的重载：

```js
var out = [];

[1, 2, 3].forEach(function(elem) {
  this.push(elem * elem);
}, out);

out // [1, 4, 9]
```

:::warning 注意
`map` 和 `forEach` 都会跳过空位，但不会跳过 `null` 和 `undefined`。
:::

:::tip 会改变原数组的方法
`sort`、`reverse`、`splice` 会改变原数组。其他一些常规操作都是生成新数组，且都会接受一个声明为 `function(elem, index, arr)` 的函数。
:::

### 4. reduce / reduceRight

从左向右应用函数，这个例子相当于相加，参数和之前的类似，同时 `reduce` 函数指定了初始值 10。

```js
arr7.reduce((sum, curr, index, arr) => {
    return sum + curr;
}, 10)
```

还有一些其他原型函数，都按字面意思使用没啥坑。

## 类型转换

作为动态类型语言，转换在不同语境是相当随意的，当可以发生转换时就可以转。

```js
var x = [2];
console.log(typeof x);           // object
console.log(x instanceof Array); // true
console.log(1 == 1 && x++);      // 2
console.log(typeof x);           // number

var x = [2, 3, 1];
console.log(typeof x);           // object
console.log(x instanceof Array); // true
console.log(1 == 1 && x++);      // NaN
console.log(typeof x);           // number
```

## 包装对象

加 `new` 的 `Number`、`Boolean`、`String` 构造函数调用，类似于 C# 装箱，原始类型转换成对象，让 js 在调属性的时候统一成一个模型，由对象来调。

:::warning 包装对象的布尔值
包装对象的 bool 和原始 bool 不一样，包装对象毕竟是对象，只有原始 bool 类型的 `false` 才能在 if 语境中表示 `false`（是个对象在 if 语境都转换成 `true`）。

```js
if (new Boolean(false)) {
    console.log('true');
}
console.log(flasebool.valueOf());
// 输出
// true
// false
```
:::

原始类型调用一些属性的时候都是转换成包装对象再调用的。

数值类型记得加括号，不然会被当做小数点：

```js
(10).toString(2)  // 2进制
```

:::warning toFixed 精度问题
`toFixed` 保留几位小数的再转字符串函数，他的舍入规则很蠢，有个对应只保留几位小数的函数 `toPrecision`，他的舍入也不准。归根结底还是底部小数存储有关。

```js
(10.055).toFixed(2)  // 10.05
(10.005).toFixed(2)  // 10.01
```
:::

`fromCharCode` 忽略大于 `0xFFFF` 的多余部分，很坑不想写。

### String 的原型方法

`substring` / `substr`：string 既有类似数组的 `slice` 也有 `substring` / `substr`，有一些隐式行为。

1. 自动调换参数：`start` 参数大于 `end` 参数会调换位置
2. 负数转 0

```js
'JavaScript'.substring(10, 4)  // "Script"
// 等同于
'JavaScript'.substring(4, 10)  // "Script"

'JavaScript'.substring(-3)     // "JavaScript"
'JavaScript'.substring(4, -3)  // "Java"
```

`split` 也有些坑，一般遇不到。

## Date

（待补充）

## 运算符求值

对于 `||` 和 `&&` 运算符，与 C 语言不同的是，首个类型不为 `true` 或 `false` 时返回第二个表达式的值，而不是逻辑运算的结果（bool）值。可能是因为 js 的值在 if 语境下可以隐式的转换成 `true` 或 `false`。

:::info 逻辑运算符理解
以 `&&` 为例，多个 `&&` 使用时，返回首个为 `false` 的表达式。这很好理解，在 C 语言中，`a && b` 需要 `a` 与 `b` 均为真才为真，而 `a` 为真的情况下只需要关注 `b` 的表达式的值即可，所以 js 直接返回 `b` 了，因为 js 的动态类型不同语境可以相互转换，`b` 若能转换为 `false` 在 if 中就直接视为 `false` 了。
:::

:::tip 布尔值转换规则
如果 JavaScript 预期某个位置应该是布尔值，会将该位置上现有的值自动转为布尔值。转换规则是除了下面六个值被转为 `false`，其他值都视为 `true`。

1. `undefined`
2. `null`
3. `false`
4. `0`
5. `NaN`
6. `""` 或 `''`（空字符串）
:::

这样就很好理解逻辑运算符的一些和以前学的 C 语言不一致的地方了，这两毕竟不是同类型的语言不能直接比较。

```js
't' && ''       // ""
't' && 'f'      // "f"
true && 'foo' && '' && 4 && 'foo' && true  // ''

't' || ''       // "t"
't' || 'f'      // "t"
false || 0 || '' || 4 || 'foo' || true     // 4
```

## 运算符比较

**大小比较：**

1. 两个字符串按一般习惯是字典比较

2. 不同类型：
   - 字符串、bool、数值这三个类型大小比较时，js 的思想是看成"你想"做数值比较，所以都会转换为数值

3. 要是有对象参与比较，js 会调用 `valueOf` 方法，希望返回一个原始类型。如果返回的还是对象就调用 `toString` 方法返回字符串，这样就转换成原始类型了。js 在这里只允许类型做一次转换原始类型的操作，如果一次 `valueOf` 不能转换为原始类型，js 采用默认方法 `toString` 转换成原始字符串再以原始类型的规则比较。

当然 js 的对象的属性可以动态添加的，你可以自定义一个 `valueOf` 函数返回一个你想要的原始类型。

```js
var obj1 = { a: 1 };

console.log(typeof obj1.valueOf());         // object
console.log(obj1.valueOf().toString());      // [object Object]
console.log(obj1 >= '[object Objeca]');       // true

obj1.valueOf = function() {
    return 1;
}
```

**相等比较：**

一般有两种语义，对于对象相等比较有时我们会希望比较的两个表达式指向同一个对象，有时只是希望比较其值是否相同。

`===` 严格相等运算符就表达这种引用相等的语义，只有在两个类型相同才会继续比较，类型都不相等直接返回 `false`。

1. 对原始的类型（值类型）只会比较其值
2. 对于对象会比较是否为相同对象

:::info 设计理念
因为相等比较和大小比较一般有不同期望的语义，所以 js 按作者习惯设计的刻意的不一致性。js 语言的设计就是其作者的私货，只不过这些私货其实也是一种范式或大多数人的习惯，所以学习 js 其实是理解这些习惯。
:::

:::tip 小知识
`undefined` 和 `null` 与自身严格相等，但互相不等。
:::

`==` 相等运算符则会在不同类型之间的隐式转换了。

还是两种情形和大小比较类似：
1. 原始类型都会看成数值比较
2. 对象和原始类型比较，对象会经过 `valueOf` 函数 `toString` 的转换

:::warning 反直觉的比较
因为都会转换成数值进行比较，有些比较会反直觉。

```js
false == 'false'    // false
false == '0'        // true

0 == ''             // true
0 == '0'            // true

'true' == true      // false
// 等同于 Number('true') === Number(true)
// 等同于 NaN === 1

'1' == true         // true
// 等同于 Number('1') === Number(true)
// 等同于 1 === 1
```

能转换成数值的字符串都会转换成数值，对 `'true'` 或 `'false'` 可能我们希望他转换成数值的 1、0，其实对字符串转数值来说他是个 `NaN`，所以跟谁比都 `false`。
:::

## 运算符优先级

所有语言都有这个问题，C++ 反而是最大吞噬原则而不是 js 这种左结合或右结合，该用括号用括号不要自作聪明。

js 大多数运算符都是左结合，比如：

```js
1 + 2 + 3  // (1+2)+3
```

以加法举例子其实没什么意思，数值加法具有结合律，怎么加都是一样的，而 js 中明确有乘法比加法高优先级这种普遍设计。

只有赋值运算符 `=`、三元运算符 `?:` 和指数运算符 `**` 是右结合，这也在意料之中。毕竟在写赋值表达式时期望的语义是先算右边表达式再赋值。

```js
var x;
x = 1 + 2 - 3;
// 总是期望
x = (1 + (2 - 3));
```

## js 的错误处理

这里没什么坑，还是继承错误 `Error` 构造错误信息，`throw`、`try...catch...finally` 这一套。

## 变量声明

| 关键字 | 说明 |
|--------|------|
| `let` | 会提升，初始化之前访问会报错 |
| `var` | ES5 会变量提升，未初始化定义为 `undefined`，允许重复声明，作用域规则不清晰 |
| `const` | 不允许修改值，其他都和 `let` 一样 |

**示例：**

```js
{
    var func_area_obj_var = 10;
}
console.log(func_area_obj_var);  // 10

{
    let func_area_obj_let = 11;
}
console.log(func_area_obj_let);  // ReferenceError: func_area_obj_let is not defined
```

:::warning for 循环中的变量声明
有一点经常不被注意就是 for 循环：

使用 `var`：
```js
for (var i = 0; i < 5; i++) {
    console.log(i);
}
console.log("循环值为:" + i)
// 输出
// 0 1 2 3 4
// 循环值为:5
```

使用 `let`：
```js
for (let i = 0; i < 5; i++) {
    console.log(i);
}
console.log("循环值为:" + i)
// 输出
// 0 1 2 3 4
// ReferenceError: i is not defined
```

`var` 是声明在全局的，但 `let` 却和别的语言还是不一致，`let` 是声明在 for 的括号内的。
:::

`let` 和其他语言的 `auto`、`let`、`var` 比较接近，不允许重复声明之类的。现代编程范式都是先声明后使用，ES6 推荐用这个。

:::info var 的作用域
这里 `var` 没有块级变量的意义，只有函数级别变量（和全局），所以 if 块中定义会溢出到外部函数作用域（变量提升）把全局变量覆盖。

```js
var tmp = new Date();

function f() {
  console.log(tmp);
  if (false) {
    var tmp = 'hello world';
  }
}

f(); // undefined
```
:::

块作用域声明函数一个坑不想细看。

同时和别的语言不一样的是，if 语境省略大括号在 js 会被视为没有块作用域。

:::tip const 的语义
`const` 的语义只保证对象不可变，但对象指向的其他数据类型无法保证，要使得对象彻底不可变需要 `Object.freeze` 冻结对象和其属性。
:::

**ES6 顶层对象属性：**

ES6 的顶层对象属性和全局变量不挂钩了。ES5 全局变量在浏览器中相当于大对象 `window` 下面的属性，在 ES6 这两解绑了，除了老的关键字 `var`、`function` 声明的变量和函数。

| 环境 | 顶层对象 |
|------|----------|
| 浏览器 | `window` |
| Node.js | `global` |
| Web Worker | `self` |
| ES2020 标准 | `globalThis`（统一提案） |

## this

（待补充）

## 统一的函数调用

### Function.prototype.call()

首个参数 `this` 表示应用的对象，后跟任意参数。

注意 `prototype`（原型）类似于其他语言的成员方法。一般调用成员函数得先定义成员函数（js 里起码 ES5 里没成员函数这个叫法，不过在我看来就是一个东西）。

```js
let obj = {
    name: '114',
    func: function() {
        console.log('call obj func');
        console.log(this.name);
    }
}
obj.func();
```

你也可以不定义：

```js
let obj2 = {
    name: '114'
}

let func = function(name2) {
    console.log('call call func');
    console.log(this.name + name2);
}
func.call(obj2, '514');
```

用函数调用语法传对象参数调用。

:::info 注意
`call` 在顶层使用不传参，默认使用的顶层对象；在浏览器里叫 `window`；在 Node.js 里叫啥不知道。调用的函数里没 `this` 就没事，有 `this` 没定义就 `undefined`。
:::

还有一个用法：[调用原生方法](https://wangdoc.com/javascript/oop/this#functionprototypeapply)

### Function.prototype.apply()

首个参数 `this` 表示应用的对象，后跟参数数组。和 `call` 一样，只不过参数是以 `[x1, x2, x3...]` 这样的参数传的。

这样数组内容可以被解构成参数。一个典型例子找最大值，所有教程都有这个[例子](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#%E5%B0%9D%E8%AF%95%E4%B8%80%E4%B8%8B)。

因为 `Math.max` 调用都是这么调的，只能找参数最大值：

```js
Math.max(2, -1, 5)  // 5
```

`apply` 这玩意现在可以把数组值结构成参数找到最大值。

空元素变 `undefined`，[例子](https://wangdoc.com/javascript/oop/this#functionprototypeapply:~:text=%EF%BC%882%EF%BC%89-,%E5%B0%86%E6%95%B0%E7%BB%84,-%E7%9A%84%E7%A9%BA%E5%85%83%E7%B4%A0)

还有一个数组 like 转数组：

```js
let array_like = {
    1: '1',
    2: '5',
    5: '6',
    length: 3
}

let array_is = Array.prototype.slice.apply(array_like);
console.log(Array.isArray(array_like));  // false
console.log(Array.isArray(array_is));    // true
```

能这么搞本质是参数对象解包了。上面 `apply` 能干的事 ES6 剩余参数语法都能干，见 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#%E7%94%A8_apply_%E5%B0%86%E6%95%B0%E7%BB%84%E5%90%84%E9%A1%B9%E6%B7%BB%E5%8A%A0%E5%88%B0%E5%8F%A6%E4%B8%80%E4%B8%AA%E6%95%B0%E7%BB%84)

### Function.prototype.bind()

绑定 `this` 不变。

`call` 和 `apply` 也能绑定对象，用一个函数存起来就是了：

```js
let for_bind = {
    name: '114'
}

let apply_bind = function() {
    console.log('apply_bind');
    console.log(this === for_bind)
}
let binded = function() {
    apply_bind.apply(for_bind);
}

binded();
```

这样 `apply_bind` 用的 `this` 需要包裹成一个新函数存起来。

`bind` 干的事就是简化这种写法，和其他语言 `bind` 差不多绑定一个对象为固定参数：

```js
let bind_func_obj = {
    name: '114514',
    func: function() {
        console.log(this.name);
    }
}
let binded_func = bind_func_obj.func;

binded_func();  // undefined
// 因为调用时候不指定对象，this 指向全局
```

这样手动绑定对象，也能绑其他对象：

```js
let other_obj = {
    name: '514'
};
let binded_func2 = bind_func_obj.func.bind(bind_func_obj);
let binded_func3 = bind_func_obj.func.bind(other_obj);
binded_func2();  // 114514
binded_func3();  // 514
```

`bind` 主要就是解决回调函数作为参数，其内部 `this` 乱指的问题，`bind` 完对象后再把返回的函数作为参数传递。

还有一个用法不算坑：和 `call` 一起用组成统一的函数调用语法，让函数调用等价：

```js
f(obj, args...) == obj.f(args...)
```

## 严格模式

js 本来是脚本，现在变成大众化语言，需要搞一点约束让一些写法报错，还要兼容以前老用法，用一个严格模式区分开来。

ES6 新增块级作用域，以后都用 `let` 声明变量而不是 `var`。

## 异步 / 事件循环 / 微任务 / 宏任务

（待补充）

## DOM

选择器参数：DOMString

`getElementsByClassName` 和 `querySelectorAll` 区别：动态和静态区别。

动态只读元素，可以通过具体 DOM 元素修改，但不能直接改。

## ES 模块和 CommonJS 模块

报错：

```
[MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type is not specified and it doesn't parse as CommonJS. Reparsing as ES module because module syntax was detected.
```

在 ES 模块里使用了 `__filename`、`__dirname` 这种全局变量：

```js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENV_PATH = resolve(__dirname, '../.env.development');
```

## 给导出对象起别名

`fs.promises.writeFile` 这个函数名太长用起来麻烦，导出时：

```js
const fsp = require('fs').promises;
await fsp.writeFile('hello.txt', 'Hello, 世界！');

const { promises: fsPromises } = require('fs');
const writeFile = fsPromises.writeFile;
await writeFile('msg.txt', 'Hello!');

const { writeFile } = require('fs').promises;
```

在 ES module 里：

```ts
import { promises as fsPromises } from 'fs';

import fsPromises from 'fs/promises';

// 只引入一个对象
import { writeFile } from 'fs/promises';
```

# js 的 OOP

## 原型对象 / 原型链 / 继承

ES6 用 `class` 抽象出类的概念来描述继承，ES5 这个继承看看得了。

**三个东西：**

**函数**：ES5 的任何函数都能当构造函数，构造函数就是普通函数，内部用 `this` 表示生成对象的属性，加上 `new` 关键字调用。

```js
let People = function(name = '114', end_name = '514', age = 24) {
    this.name = name;
    this.end_name = end_name;
    this.age = age;
    this.func = function() {
        console.log(`${this.age} duse`)
    }
};

let beast = new People();
beast.func();
```

ES5 的 js 没有类概念，但是有原型的概念，类似于基类，这就是 `prototype`。

别的语言用 `class` 定义类时，函数都是统一存储的，也就是说只有实例对象成员函数地址都一样。

```csharp
public class test {
    public int age { get; set; } = 10;
    public void ff() => Console.WriteLine($"{age} desu");
}

var test1 = new test();
```

C# 定义的 test 类成员函数全局只有一份，js 的成员就不一样了每个实例对象都有一份。

:::info 原型的作用
js 把所有"类成员函数"放在对象的原型对象里，所有从原型对象继承来的方法对所有被继承对象效果都一样。这不就是虚函数？js 非要搞这个原型。对其他语言来说 class 里的东西都是类型信息，存编译器里的，js 直接就让我们操作类型信息，尽管他没类型这个概念。
:::

原型链就是对象的原型对象也有自己的原型对象...一直链接到 `Object`，构成一条原型链；`Object` 的原型则是 `null`。

继承就是操作原型对象，主要就两玩意：

**prototype**：

`xx.prototype = yy` 就是指定原型，但一般不这么写。在原型中定义的属性，会被所有定义的类型继承。

```js
// 上面 People 的例子
People.prototype.color = 'white';
```

这样所有 `new` 出来的 People 原型对象都有 `color` 属性了，如果赋值构造函数，构造函数也共享了。

**constructor**：

还是拿 People 举例子，People 属性的原型的构造函数属性指向 People 这个函数，就相当于其他语言的类型信息对象，在 js 里直接暴露给你了。

```js
People.prototype.constructor = People
```

:::warning 注意
最好不要直接替换对象的原型对象。

```js
let People = function(name = '114', end_name = '514', age = 24) {
    this.name = name;
    this.end_name = end_name;
    this.age = age;
    this.func = function() {
        console.log(`${this.age} duse`)
    }
};

let beast = new People();
beast.func();

People.prototype.color = 'white';
console.info(beast.color);  // white

console.log(People.prototype);  // { color: 'white' }

People.prototype = {
    constructor: People,
    name2: '1919',
    fuc_super: function() {
        console.log('调用原型对象')
    }
};
console.log(People.prototype);
console.log(Object.getPrototypeOf(beast));  // { color: 'white' }
console.info(beast.color);  // white

let new_obj = new People();
console.log(new_obj.color);  // undefined
console.log(new_obj.name2);  // 1919
```

在替换了 People 的原型对象后，已经创建对象的原型还是旧的原型对象，所以 `beast.color` 还能输出 `white`。一般都不直接替换原型对象，而是以 `People.prototype.xxx` 或以下方式操作。
:::

**相关 API：**

| API | 说明 |
|-----|------|
| `Object.getPrototypeOf()` | 获取某对象的原型 |
| `Object.setPrototypeOf()` | 设置某对象的原型 |
| `Object.create()` | 从某个已存在对象创建对象，而不手动使用构造函数 |
| `Object.prototype.isPrototypeOf()` | 判断对象是否是参数对象的原型，只要在原型链上的都是 |
| `Object.prototype.__proto__` | 指向对象的原型，以前浏览器用，现在 ES6 已经淘汰了 |
| `Object.getOwnPropertyNames()` | 类似于其他语言反射里的获取所有属性名（数组） |
| `Object.keys()` | 获取像键值一样的可遍历的属性名数组 |
| `Object.prototype.hasOwnProperty()` | 判断是自有属性还是原型链上的属性 |

`for...in` 这种写法在 js 里是遍历属性的，遍历值用 `map` 或者 `forEach`。

```js
for (var name in object) {
    if (object.hasOwnProperty(name)) {
        /* loop code */
    }
}
```

## 继承构造函数

ES6 有类之后写法更偏向有 class 的语言，ES5 的继承写法了解一下即可。

不用 `new` 调用构造函数，非严格模式会什么都不干，对象都没创建。

ES5 的继承分两步：子类调用父类函数，子类原型指向父类原型对象。

```js
// 第一步
let Base = function(name) {
    this.name = name;
}

let Derived = function(name, age) {
    Base.call(this, name);
    this.age = age;
}
Derived.prototype = Object.create(Base.prototype);
Derived.prototype.constructor = Derived;

let new_obj = new Derived('114', '514');
```

ES6 有 class 就没这么多事了。

ES5 js 不提供多重继承，有办法扭曲实现，没意思不用看。

## 模块

ES6 才有模块，ES5 用一些很扭曲的方法实现，了解就好。模块就是复用别人的代码，导出模块中的对象能直接用。

1. ES5 用对象做模块内的任何东西都塞一个对象里，用什么直接调属性写法即可。这种干法要把模块内所有东西都暴露出去。

2. 用构造函数做，构造函数中定义变量的东西实例化后外部访问不到，只能内部定义闭包函数访问到。

3. 模块模式：经典[写法](https://wangdoc.com/javascript/oop/prototype#%E5%B0%81%E8%A3%85%E7%A7%81%E6%9C%89%E5%8F%98%E9%87%8F%E7%AB%8B%E5%8D%B3%E6%89%A7%E8%A1%8C%E5%87%BD%E6%95%B0%E7%9A%84%E5%86%99%E6%B3%95)，看看得了。本质就是变量放函数里，函数作用域外部访问不到，把需要外部暴露的模块 return 出去。

模块的放大模式在 ES5 里是个小坑，ES6 不需要知道。
