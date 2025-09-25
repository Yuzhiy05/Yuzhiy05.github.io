---
title: js学习记录
createTime: 2025/08/04 13:47:46
permalink: /article/2pbod4sz/
---


# JS的常见坑
变量提升 
有代码块但是没作用域变量都是全局的 
变量没有固定类型,可以多次赋不同的值

js 没有整数只有浮点数 1==1.0 true 有些操作需要转换成整数32位操作会导致精度丢失
0.1 + 0.2 == 0.3 false 浮点数精度问题
根据iEEE 754 js最多保存15位整数
```js
console.log("1==1.0:" + (1 == 1.0));
console.log("0.1 + 0.2 == 0.3:" + (0.1 + 0.2 == 0.3));
console.log("0*infinity:" + (0 * Infinity));
console.log("0/0:" + (0 / 0));
console.log("0/infinity:" + (0 / Infinity));

1==1.0:true
0.1 + 0.2 == 0.3:false
0*infinity:NaN
0/0:NaN
0/infinity:0

```


### js的类型
原始类型 
1.数值1，1.1之类的(js内部只有浮点) 
2.字符串 'xxx',"xxxx"
3.bool

对象时特殊类型 由不同类型符合

null和undefined 分别为不同的特殊类型
### null 和undefined
js 沿用之前的语言习惯 其中的类型都是对象 所以null只是空对象并没有单独做出一个类型,同时null对象转换为数值是为0和c语言,java一样
，undefined 表示此处无定义,转换成整数为Nan ；尽管在做 instanceof 进行比较时他们两仍相等,但却表达了不同的语义


### parseInt/parseFloat 函数

将字符串转换为整数,参数不是字符串的先转换为字符串再转换为整数
字符串会一个字符一个字符的转换,遇到不能转换的字符就返回已经转换好的数值
自动过滤前导空格 换行
parseInt('8a') // 8
parseInt('12**') // 12

首个字符不能转换就返回NaN
parseInt('abc') // NaN
parseInt('.3') // NaN

很傻逼[遇到了再看](https://wangdoc.com/javascript/types/number#parseint)

### 字符串
tips  String.raw() = c# 里的@"x\rx\nx" 原样字符串
JS使用Unicode字符集
内部默认单字符utf-16
四字节字符会被视为两字节字符.string.Length 返回长度不正确
可以单引号也能双引号,也能单引号里双引号，双引号里单引号
'字符串'
"字符串"

'xxxx"aaa"'
"ffff'bbb'b"
默认一行，不能向c# c++ 一样分行 
多行可以加 \ 

字符串默认不可变
修改字符串内部的操作会失效且不报错

### 对象
键值对构成对象
键值是字符串,使用数值型自动转换成字符串 ,所以写不写'foo':'hello'都不一样
```js
var obj = {
  foo: 'Hello',
  bar: 'World'
};
属性可以是函数,也就是方法
var obj = {
  p: function (x) {
    return 2 * x;
  }
};
obj.p(1)
```
foo 称为对象的属性

js还允许这样 属性动态创建,后续加属性,没必要声明时指定
```js
var o1 = {};
var o2 = { bar: 'hello' };

o1.foo = o2;
console.log(o1.foo.bar)//hello

对象和值
var o1 = {};
var o2 = o1;

o1 = 1;
o2 // {}

```

加圆括号令js编译器将{xxx}内容视为 对象
```js
{console.log("hell0")} //代码块
({console.log("1111")})//对象，报错

访问属性
var foo = 'bar';

var obj = {
    foo: 1,
    bar: 2
};

console.log(obj.foo)  // 1
console.log(obj[foo])  // 2
console.log(obj['foo'])  // 1;
```
使用.访问属性名
使用[]需要加'' 访问属性名,因为属性名本质是字符串
```js
var obj={
    p:1,
    2:22
}
Object.keys(obj) 查看属性

delete obj.p 删除属性
可以删除一个不存在的属性,不报错且返回true
删除不可删除的属性 报错
删除继承的属性无效果
```

属性是否存在 `in` 关键字
查看的是键 是否存在而不是值

```js
var obj={
    111:111
    222:222
}
console.log(111 in obj)

遍历属性
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
向c#一样对象都继承toString方法;但是遍历不出来的(不可遍历的属性)
对于不可遍历的属性，直接跳过

教程不建议使用with语句

### 函数
函数三种声明方式
```js
直接声明
function ff(x){
    console.log(x)
}
函数表达式
var ff=function(x){
    console.log(x)
};
//function 后带名字只有函数内部可见 递归调用
var ff=function ff(x){
    ff(x+1)
};

new Function 构造函数 没人用
```

tips 和变量不一样的是,后声明的同名函数覆盖之前声明。因为变量提升(不管声明在哪,函数调用前，第二次声明的函数都提升到开头了),第一次声明任何时候都不起作用
```js
function gr(num) {
    console.log("2222, " + num);
};
gr("Bob");
function gr(num) {
    console.log("333, " + num);
};
gr("Bob");

PS D:\workfile\TS\Test> npx node greeter.js
333, Bob
333, Bob
```
函数三个属性
name 函数名 对于始终是function 关键字后的名字
`var ff= function ff2(){}`
ff.name 为ff2

这个用来获取参数名字

length 参数个数

toString 函数源码 包括注释(根据这个获得多行字符串,js字符串都是单行的)

原生函数返回 native code 不显示全部源码

tips js es5版本只有
全局作用域 
函数作用域   此作用域和其他语言
es6的块级作用域后面介绍


### 类型转换

作为动态类型语言,转换在不同语境是相当随意的,当可以发生转换时就可以转
```
var x = [2];

console.log(typeof x);

console.log(x instanceof Array);

console.log(1 == 1 && x++);

console.log(typeof x);

//output
object
true
2
number


var x = [2, 3, 1];

console.log(typeof x);

console.log(x instanceof Array);

console.log(1 == 1 && x++);

console.log(typeof x);

//output
object
true
NaN
number
```

### 运算符求值
对于 *||* 和*&&* 运算符 与c语言不同的是,首个类型不为ture或false时返回第二个表达式的值,而不是逻辑运算的结果(bool)值,可能时因为js的值在if语境下可以隐式的转换成true或flase。以&& 为例子 多个&& 使用时 返回首个为false的表达式。这很好理解在c语言中,`a&&b`需要a与b均为真才为真,而a为真的情况下只需要关注b的表达式的值即可,所以js直接返回b了,因为js的动态类型不同语境可以相互转换,b若能转换为flase在if中就直接视为false了


//加一个tips框
有这样一个规则
如果 JavaScript 预期某个位置应该是布尔值，会将该位置上现有的值自动转为布尔值。转换规则是除了下面六个值被转为false，其他值都视为true。

1.undefined
2.null
3.false
4.0
5.NaN
6.""或''（空字符串）

这样就很好理解逻辑运算符的一些和以前学的c语言不一致的地方了-这两毕竟不是同类型的语言不能直接比较
```js
't' && '' // ""
't' && 'f' // "f"
true && 'foo' && '' && 4 && 'foo' && true
// ''

't' || '' // "t"
't' || 'f' // "t"
false || 0 || '' || 4 || 'foo' || true
// 4

```

### 运算符比较
对于大小比较 
1.两个字符串按一般习惯是字典比较

2.不同类型 
2.1字符串 bool 数值 这三个类型大小比较时 js的思想是看成 "你想"做数值比较 所以都会转换为数值

2.2 要是有对象参与比较 js会调用valueOf 方法 希望返回一个原始类型 如果返回的还是对象就调用ToString 方法 返回字符串这样就转换成
原始类型了,js在这里只允许类型做一次转换原始类型的操作,如果一次valueOf 不能转换为原始类型,js采用默认方法ToString 转换成原始字符串再以原始类型的规则比较

当然js的对象的属性可以动态添加的 你可以的自定义一个valueOf函数返回一个你想要的原始类型

```js
var obj1 = { a: 1 };

console.log(typeof obj1.valueOf());

console.log( obj1.valueOf().toString());

console.log(obj1 >= '[object Objeca]');

//output
true
object
[object Object]


obj1.valueOf=function (){
    return 1;
}
```

对于相等比较
一般有两种语义 对于对象 相等比较有时我们会希望比较的两个表达式指向同一个对象,有时只是希望比较其值是否相同。

`===` 严格相等运算符就表达这种*引用相等*的语义只有在两个类型相同才会继续不叫,类型都不相等直接返回false,这也是意料之中

1.对原始的类型(值类型,在c#中我喜欢叫值类型) 只会比较其值 
2.对于对象 会比较是否为相同对象

tips
因为相等比较和大小比较一般有不同期望的语义，所以js按作者习惯设计的刻意的不一致性，我个人认为js语言的设计就是其作者的*私货*只不过这些私货其实也是一种范式或大多数人的习惯，所以学习js其实是理解这些习惯

tips2
undefined和null与自身严格相等 但互相不等

`==` 相等运算符则会在不同类型之间的隐式转换了

还是两种情形和大小比较类似
1.原始类型都会看成数值比较
2.对象和原始类型比较,对象会经过valueOf函数ToString 的转换

tips 因为都会转换成数值进行比较 有些比较会反直觉

```js
false == 'false'    // false
false == '0'        // true

0 == ''             // true
0 == '0'            // true

'true' == true // false
// 等同于 Number('true') === Number(true)
// 等同于 NaN === 1

'1' == true  // true
// 等同于 Number('1') === Number(true)
// 等同于 1 === 1
```
这里可以直接看到能转换成数值的字符串都会转换成数值,对'true' 或'false' 可能我们希望他转换成数值的1,0 其实对字符串转数值来说他是个NaN 所以跟谁比都false

### 运算符优先级
所有语言都有这个问题,c++反而是最大吞噬原则而不是js这种左结合或右结合,该用括号用括号不要自作聪明

js大多数运算符都是左结合比如
```js
1+2+3 
(1+2)+3
```
以加法举例子其实没什么意思,数值加法具有*结合律* 怎么加都是一样的,而js中明确有乘法比加法高优先级这种普遍设计

只有 赋值运算符 `=` 三元运算符`?:=` 和指数运算符`**` 是有结合,这也在意料之中
毕竟在在写赋值表达式时期望的语义是先算右边表达式再赋值
```js
var x;
x=1+2-3;
总是期望
x=(1+(2-3));
```
当然这个例子举的不好,不管是不是右结合console.log出来的表达式的值一样

