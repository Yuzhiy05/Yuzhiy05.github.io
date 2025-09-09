

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

