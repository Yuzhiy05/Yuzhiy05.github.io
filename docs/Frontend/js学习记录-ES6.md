

打*号基本就没实际试试 有实例的基本上写过一遍 有的api就不写了用到自然会用
以下表示成员的函数时正规写法 `xxx.prototype.prototype_name` 例如`String.prototype.at()` 都懒得写中间原型
但是`String.at()` 表示静态 非实例函数。 所以表示成员函数或属性时连"类名"和原型都不写

# ES6 的js

###变量解构

跟c++ 结构化绑定 和 c# 模式匹配里的 位置模式 很像

用于结构可迭代的对象 比如实现Iterator 接口的对象

js宽松的语言特性 解构失败的不报错只是对应变量为undefined

```js
let [bar, foo] = [1];

foo 为 undefined
```



## 模板字符串

类似于 c# `@"xxx${index}"` 字符串
使用反引号 ` `` `
可以定义多行字符串
使用${} 做字符串插值  引用变量函数 和表达式
括号中的内容可以嵌套另一个模板字符串,不举例了 用来生成代码
使用实例
```js
let index=10;
let str=`this template string ${index}`

let str=`this is muilt line
string ${index++}`
```

1.用模板字符串做代码生成 模板引擎 不介绍


带标签的模板字符串
写个函数`tag` 调用不使用一般函数调用方法而是
` tag`123` ` 这样调用 
相当于字符串前缀,然后自己写个函数处理参数

可以用来表示其他语言的字符串,每个语言设计不一样转义符一样这,这样搞自己处理转义
用str.raw[i] 和values[i]来访问字符串和参数
例如
```js
function loop(str,...values) {

    return str.raw[0] + values[0] + str.raw[1];
}

let max = 10000;
let min = 1;
let rand = Math.floor(Math.random() * (max - min + 1) + min);
console.log(loop`hello the ${rand} world`);

字符串传进去会根基对应的位置解包成
str.raw[0] str.raw[1] 对应数组成员
loop`hello the ${rand} world` 相当于 loop([`hello the`,` world`],rand)

rand就传到 ...values 展开的是values数组里了

let aaa = 10;
console.log(Object.getOwnPropertyNames`123${aaa}456`);
//输出
[ '0', '1', 'length', 'raw' ]
```
也就是说使用标签模板字符串调用时js会自动帮我把字符串 按${} 分隔成一个 类字符数组
其中raw属性就返回原始没转义的字符串

tips 有点坑
使用模板字符串会使得调用方式改变函数行为

```js
let aaa = 10;
//带标签的模板字符串
console.log(Object.getOwnPropertyNames`123${aaa}456`);
console.log(Object.keys`123${aaa}456`);
//输出模板字符串
//这种调用方法实际传的是空对象
console.log(Object.getOwnPropertySymbols(`123${aaa}456`));
console.log(Object.keys(`123${aaa}456`));

//使用普通字符串
console.log(Object.getOwnPropertyNames('123${aaa}456'));
console.log(Object.keys('123${aaa}456'));
//输出
//带标签的模板字符串
[ '0', '1', 'length', 'raw' ]
[ '0', '1' ]

//模板字符串函数调用
[]
[
  '0', '1', '2',
  '3', '4', '5',
  '6', '7'
]

//普通字符串
[
  '0',      '1',  '2',
  '3',      '4',  '5',
  '6',      '7',  '8',
  '9',      '10', '11',
  'length'
]
[
  '0', '1', '2',  '3',
  '4', '5', '6',  '7',
  '8', '9', '10', '11'
]
```
不同调用方式js会将模板字符串解析成不同产物
注意使用普通函数调用的方法传递模板字符串实际上传的是空对象,所以模板字符串调用就使用` tag`hello` ` 的调用方法

主要用法
1.过滤字符串内容
如 HTML 字符串，防止用户输入恶意内容

2.国际化每个国家数字不一样


## 字符串新加了几个功能

String.fromCodePoint() 识别大于0xFFFF 码点 根据Unicode码点创建字符串

String.raw 字符串里每个斜杠\ 前都加个 \  因为\ 会转义 专门给模板字符串用的

```js
console.log(String.raw`Hi\n${2 + 3}!`)
//输出
Hi\n5!

//这样调用不行报错
console.log(String.raw('Hi\u000A!'))
//输出
console.log(String.raw('Hi\u000A!'))
                   ^
TypeError: Cannot convert undefined or null to object
```

实例方法* 
includes(search_str,search_index:number), startsWith(), endsWith()
valueof 只能表示一个字符串是否在字符串里,这几个函数提供更具体的语义
支持第二个参数表示搜索时位置

includes()  是否包含搜选字符串 从search_index 位置开始
startsWith()  是否在开头      从search_index 位置开始
endsWith()   是否在末尾  第二个参数 指示字符串的前i个字符串

repeat(count) 将字符串重复count次 返回新字符串

padStart(length,str)  头补全 预期补全后的长度 str补全字符串 如果原字符串大于等于预期补全后的长度则无效返回原字符串 

padEnd()  尾补全

trimStart() 清空头空格 tab 换行符

trimEnd()  清空头空格 tab 换行符

ES5的 原有的 trim()

matchAll() 正则表达式匹配

replaceAll(pattern, replacement) 替换所有匹配 pattern 可以是字符串也可以是正则表达式 replacement 可以说字符串也可以是
一个正则表达式对应的字符 或者函数能匹配替换的五花八门
详见[链接](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replace#%E6%8C%87%E5%AE%9A%E5%87%BD%E6%95%B0%E4%BD%9C%E4%B8%BA%E6%9B%BF%E6%8D%A2%E9%A1%B9)

原有的replace 函数只能替换首个匹配 全不替换全部得写正则表达式 于是就提供一个新功能

at(index) 允许负数 的[index] 负数表示从末尾偏移index位 但是不能超字符串长度




暂时不用了解的

normalize()  Unicode正规化 

toWellFormed()  处理代理字符串的


## 正则表达式和ES6扩展*
暂时不看

## 数值扩展

1.新的二进制和八进制 写法

只能用 0o 或0O表示8进制

     0B或0b 表示二进制

2.数值分隔符
欧美人习惯每三个数值间加逗号或者下滑线_

毕竟人家说 100 000  10万 叫 one  hundred thousand 一百个千
所以js引入了数值下滑线 **100_000**  这玩意实际上就等于**100000** 只不过写起来好看
作为参数传递 写入内存 输出都不影响就纯语法糖
注意别写到那种一眼看上去不对的用法上就行
比如
```js

0_b111111000
0b_111111000

3_.141
3._141
1_e12
1e_12
123__456
_1464301
1464301_
```
非要在进制表示后,小数点前后,科学计数法e前后,没意义的前后缀加下滑线你不报错谁报错呢? 不要当傻逼

3.两个判断数值的静态函数 
Number.isFinite() 是否有限

Number.isNaN() 是否是NaN 有点绕 不是NaN就是数值 返回 false 
注意ES5 里有这两函数的全局版本 全局版本调用前会先用Number构造函数转换到数值类型再判断

4.全局版本数值解析
Number.parseInt()
Number.parseFloat()
这两的全局版本现在为了模块化更清晰放Number对象里当静态函数了 行为不变

### 精度相关
5.Number.isInteger(number)
判断是否整数
有点搞笑这玩意 js存储整数也是ieee754小数存储的 超过精度的数值判断会失准 其次和其他Number函数性质一样
非数值类型参数直接返回false

6.Number.EPSILON 属性 一个常量
js数值不是IEEE754 的小数吗 这里引入一个很小误差的误差值 (大于1的最小可表示小数1.000...1 (1位符号 8位指数 51位值)减去1算出来的误差) 也就是说算来算去数值比这个误差小那就没意义
实际上不等的数值 相减小于这个最小误差 那么这两数在js里也相等 这玩意就类似于高数里那个极限趋近的 ε

7.Number.isSafeInteger()
ES6 表示数值的上下限
Number.MAX_SAFE_INTEGER和Number.MIN_SAFE_INTEGER 也就是-2的53次方 和2的53次方
这个函数就是判断这个数值在不在js的可表示范围内

## MATH 扩展*

Math.trunc() 截断小数部分 返回整数部分

Math.sign() 返回符号 不是Number的会先转成Number

Math.clz32() **count leading zero bits in 32-bit binary representation of a number**
把数值转换成32位无符号数 算这里面有多少前导0
Math.clz32(1) 就有31个

Math.imul(a,b)  把两个数转成带符号整数然后相乘
下面这个例子js原来功能算不了 存储不了溢出的数值 所以用这个算准确值
```js
(0x7fffffff * 0x7fffffff)|0 // 0

Math.imul(0x7fffffff, 0x7fffffff) // 1
```

Math.fround()   返回一个数的32位单精度浮点数形式 精度缩窄会丢精度

Math.f16round() 和上面差不多16位精度的浮点数

Math.hypot(a,b,c) 平方和的平方根
 $$\begin{array}{c} \sqrt{a^{2} +b^{2}+c^{2}} \end{array}$$
Math.hypot(3, 4);        // 5

### 对数
Math.expm1(x) 以e为底的对数-1  
 $$\begin{array}{c} \e^{x}-1 \end{array}$$

Math.log1p(x) 
  $$\begin{array}{c} \log_{}{(1+x)}  \end{array}$$

Math.log10(x) 
$$\begin{array}{c} \log_{10}{x}  \end{array}$$

Math.log2()
$$\begin{array}{c} \log_{2}{x}  \end{array}$$

### 三角函数
Math.sinh(x) 
Math.cosh(x)
Math.tanh(x) 
Math.asinh(x) 
Math.acosh(x) 
Math.atanh(x)

## BigInt*
128的大整形 用的时候后面带n
1n 相当于数值1 的大整形 其他很多操作和Number很像
有些会不一致 我不想管细究没意思


## 函数

### 默认实参
挺傻逼的 参数不给是undefined
es6 前 默认实参得这么写
```js
function log(x, y) {
  y = y || 'World';
  console.log(x, y);
}
现在能直接
function multiply(a, b = 1) {
  return a * b;
}
```
默认参数是表达式每次函数调用都会重新计算

默认参数是非尾参数不会被忽略 显而易见的
```js
function f(x=1,y){
  console.log(x,y);
}

f() // 1, undefined
f(2) // 2, undefined
f(, 1) // 报错
f(undefined, 1) // 1, 1
```
你想忽略得显示传undefined 这就和不写参数的想法本末倒置了 注意null 和undefined语义不一样传null就是null不会触发默认参数因为你传了null

有默认参数时 参数初始化有单独作用域 这就是个tips我不想细写
看此[教程]<https://wangdoc.com/es6/function#%E4%BD%9C%E7%94%A8%E5%9F%9F>

传对象可以用解包搞默认参数
```js
function ff({a=1,b=1}={})
{
  console.log(a,b);
}

function m2({x, y} = { x: 0, y: 0 }) {
  return [x, y];
}

```


# js的坑
1.
模板字符串做代码生成 实现简单的模板引擎
用现有的就行不要学怎么写

2.
使用标签模板字符串
模板字符串会转义 ,输入的是别的语言的字符串 转义规则不一样在js里转不了
ES2018 放宽限制 对转不了的不报错转换成undefined

3.
只是有使用标签模板字符串
` tag`123` ` 这样调用的时候会放松限制

4. *
Number.isNaN() 
Number.isFinite
因为字符串 '15' 能 转换成数值15 所以全局函数版本先用Number转换数值对象,再isNaN() 返回false 他是一个数不是NaN
对于Number.isFinite 你是字符串就直接判死刑了 返回false 只对数值对象判断
直接用静态函数 你不是数值就直接返回true

5.Number.isInteger(number) 超精度数值判断失准 25.0和25视为一个值
```js
function test_bool(...args) {
    args.forEach((arg) => {
        console.log(arg);
    });
}

test_bool(
    Number.isInteger(25), // true
    Number.isInteger(25.0), // true
    Number.isInteger(3.0000000000000002), // true
    Number.isInteger(5E-324), // false
    Number.isInteger(5E-325), // true
)
//输出true
true
true
true
true
false
true


BigInt*  这个有些操作会和Number不一致
我不想记具体的 有什么问题查MDN就好了

