---
title: qml学习
createTime: 2026/06/21 23:31:33
permalink: /article/77e2utuz/
---

### qml组件

qml语法类似于js 在没学和c++交换之前就当js写 qt文档也把当js 
>QML 使用的是符合标准的 JavaScript 引擎
qml符合ECMA-262 规范
虽然没有DOM API和浏览器相关api但是存在符合标准的以下函数<https://doc.qt.io/qt-6/zh/qtqml-javascript-functionlist.html>

声明对象,指定属性
```javascript
Rectangle{
    width: 100; height: 100
}
Text{
    text:"111"
    color:"red"   
}
```

:::tip
属性写同一行要用分号;隔开 不同行不需要
:::

和其他ui框架一样qml也有个所有组件的基类Item

一个qml文件里只能有一个根组件 也就是只有一个 xxx{}
但是可以有多个复用组件
复用组件使用Component 定义

组件中的属性
id 属性表示组件的全局唯一名字

property 关键字主动声明组件包含的属性
声明属性的时候可以顺带初始化

别名属性 :引用同一作用域下的其他属性
一个常用的例子是引用子组件的属性做当前组件某个属性
比如你的按钮是靠外层Rectangle矩形组件 和内部Text 文本组件组合起来的组件
这时候暴露给外部的属性名:buttonText就可以是组件Text 的属性text的别名
外部使用这个Butten组件时候直接操作 buttonText属性 就能修改对应现实文字了
```javascript
Item{
    id:myitem
    //属性语法
    [default][required] [readonly] property <propertyType> <propertyName>
    //例如
    default property string name
    
    使用var占位符表示属性可以是任何类型
    property var someNumber: 1.5
    property var someString: "abc"
    
    //语法
    property alias <name>: <alias reference>
     
    //Butten.qml
    Rectangle {
    property alias buttonText: textItem.text

    width: 100; height: 30; color: "yellow"

    Text { id: textItem }
    }

    main.qml
    Button { buttonText: "Click Me" }
}
```

别名属性还有个访问问题详情见<https://doc.qt.io/qt-6/zh/qtqml-syntax-objectattributes.html#property-aliases-and-types>

默认属性
一个组件可以有一个
用default 关键字声明的属性
之后使用该组件时可以不用写属性名 不写属性名的对象声明都当做给该默认属性赋值

```javascript
Window {
    width: 640
    height: 480
    visible: true
    title: qsTr("Hello World")
    Rectangle{}
    Text{
        text:"111"
        color:"red"
    }
    MouseArea{}
    Image{}
}
```

这里 Rectangle Text  MouseArea Image 前面都没根属性名
是因为window有一个继承来的默认属性 default data : list\<QtObject\>
不写属性名就相当于为这个list 添加你写的对象的属性
```javascript
Text {
    default property var someText

    text: `Hello, ${someText.text}`
}
MyLabel {
    Text { text: "world!" }
}
//这两效果相同
MyLabel {
    someText: Text { text: "world!" }
}
```

和面向对象一样
继承组件后声明和被继承组件同名属性会发生覆盖
这时候使用 virtual,override,final 这三个关键字

有一个和c#属性修饰很像的关键字
required 要求该对象创建时该属性值是必填的

只读属性顾名思义,同时只读属性也是默认属性

信号属性
使用signal 关键字
语法
```javascript
signal \<signalName\>[([<parameterName>: <parameterType>[, ...]])]
```

信号是某些信息的发出者
典型的就是 鼠标点击事件

MouseArea 控件有一个叫Clicked 的信号signal
qml约定俗成的在信号名前加on 表示对应信号处理程序的名字
也就是onClicked

有一个属性更改信号
on\<Property\>Changed
定义了一个属性就隐含了包含了该信号

## 属性绑定
不管是Vue 还是qml 这些ui框架都有个趋势
能监听属性/变量变化 ui随之渲染

## 附加类型
附加类型凭什么能实现
>Steps for Implementing Attached Objects
>When considering the above example, there are several parties involved:

>1.There is an instance of an anonymous attached object type, with an enabled property and a returnPressed signal, that has been attached to the Item object to enable it to access and set these attributes.
>2.The Item object is the attachee, to which the instance of the attached object type has been attached.
>3.Keys is the attaching type, which provides the attachee with a named qualifier, "Keys", through which it may access the attributes of the attached object type.
>When the QML engine processes this code, it creates a single instance of the attached object type and attaches this instance to the Item object, thereby providing it with access to the enabled and returnPressed attributes of the instance.

QML引擎为附加对象创建附加类型的实例以此来让附加类型接受对应信号
```javascript
Item {
    width: 100; height: 100

    focus: true
    Keys.enabled: false
    Keys.onReturnPressed: console.log("Return key was pressed")
}
```
QML引擎为Item对象创建了Keys类型对象的实例,这个对象有enabled 属性和returnPressed 信号

常见的附加类型
ListView 附加属性 (isCurrentItem,view)
GridView 附加属性
Keys 用于键盘事件处理的附加属性
Component 附加属性 (onCompleted,onDestruction)

:::tip
信号处理函数赋值可以用{}代码块 也就是这么写 也可以用js的箭头函数(lambda表达式) 或者直接使用表达式
:::

```javascript
Status {
    onErrorOccurred: (mgs, line, col) => console.log(`${line}:${col}: ${msg}`)
    onErrorOccurred: {console.log(`${line}:${col}: ${msg}`)}
    onErrorOccurred: console.log(`${line}:${col}: ${msg}`)
    onHello: function () { console.log(arguments, arguments[0], arguments[1]) }
}
```

qml 里也有信号链接

Connections 对象
```javascript
Connections {
    target: area
    function onClicked(mouse) { foo(mouse) }
}
```
target 是某个对象的id属性

或者使用信号自带的connect()方法链接一个信号或者函数 QML教程的例子
```javascript
Rectangle {
    id: relay

    signal messageReceived(string person, string notice)
    signal send()
    onSend: console.log("Send clicked")
    Component.onCompleted: {
        //可链接多个函数
        relay.messageReceived.connect(sendToPost)
        relay.messageReceived("Tom", "Happy Birthday")
    }

    function sendToPost(person: string, notice: string) {
        console.log(`Sending to post: ${person}, ${notice}`)
    }
    //连接其他信号
    Component.onCompleted: {
        mousearea.tapped.connect(send)
    }
}   
```

### 定义类型/属性

一个qml文件只能有一个根组件及类型
定义一个类型就创建一个qml文件
如创建一个MyButten.qml文件
名字有要求:
必须由字母数字字符或下划线组成
必须以大写字母开头
```
//Mybutten.qml
Rectangle
{

}
```

### 绑定的作用范围

:::warning
因为附加属性语法,这个指定很恶心
:::

参考[链接](https://doc.qt.io/qt-6/zh/qtqml-documents-scope.html#binding-scope-object)

qml因为是符合js的可以动态的隐式依赖

### qml区分分值类型和对象类型

和对象类型不同是
值类型的值修改不会发出Changed信号

### QML 自带List 序列类型
序列类型类似于值类型 每次传递都会值拷贝而不是引用传递(默认共享)
值类型的List 底层是QList
对象类型的List QQmlListProperty

>QML 中的序列一般表现得像 JavaScriptArray 类型，但由于在实现中使用了 C++ 存储类型，所以有一些重要的区别：

>1.从序列中删除一个元素会导致一个默认构造的值取代该元素，而不是undefined 值。
>2.将序列的length 属性设置为大于其当前值的值，将导致序列填充为指定长度的默认构造元素，而不是undefined 元素。
>3.Qt XML 容器类支持有符号（而非无符号）整数索引；因此，尝试访问任何大于qsizetype 可容纳最大数量的索引都将失败

序列容器的值语义会造成一些性能[影响](https://doc.qt.io/qt-6/zh/qtqml-typesystem-references.html)

### qml的js 引擎
qml为js拓展了一些js函数实现本地化
1.Number::toLocaleString 
2.拓展JS Date 类型 fromLocaleDateString, toLocaleDateString

### qml调试

:::info
调试qml需要添加该宏
:::

```cpp
target_compile_definitions(appqml_learn PRIVATE QT_QML_DEBUG)
```

和js差不多用console.log,console.debug,console.info,console.warn 或console.error
console.assert

计时
console.time 和console.timeEnd

console.trace 打印调用栈

console.count 打印特定代码的当前运行次数

console.profile/console.profileEnd  开关[qml性能分析器](https://doc.qt.io/qtcreator/creator-qml-performance-monitor.html)

#### 调试import导入
查找哪些 import 路径
尝试加载哪些 .qmltypes/ .so/ .dll
模块是否找到、失败原因

用QML_IMPORT_TRACE=1 环境变量
加到 int main里
```cpp
 qputenv("QML_IMPORT_TRACE", "1");
```

或者加到Qt Creator的'项目'->'运行设置'->'环境'里

:::warning
在cmakelist里
```bash
set(ENV{QML_IMPORT_TRACE} 1) 
```
不行,— 在 CMake 配置阶段生效，影响的是 CMake 本身及其调用的子进程（如 moc、qmllint 等），等 cmake config 跑完后这个变量就不存在了。
:::

#### 查看qml
在早期没有写c++ 构建出项目之前
我只想看看qml长什么样可以使用`qml`工具查看
```bash
<qt_path>/msvc2022/bin/qml.exe Main.qml
```
参数就是要差看的qml路径

### 导入自定义组件

参考[链接](https://doc.qt.io/qt-6/zh/qtqml-documents-definetypes.html)
和[模块](https://doc.qt.io/qt-6/zh/qtqml-writing-a-module.html)
[qt_add_qml_module](https://doc.qt.io/qt-6/zh/qt-add-qml-module.html)
一直以来我导入自定义组件时都需要加上""(双引号) 也就是引用路径-目录导入
但现在修改一下使用模块导入这样可以不加双引号-模块导入

首先将组件设置为静态库,再将自定义类型文件添加为模块文件
组件文件的结构如下
-Components
 -MyButton.qml
 -MyItem.qml

对于简单项目可以统一写在根cmakelist
```cmake
#注册静态库和模块
qt_add_library(Components STATIC)

qt_add_qml_module(Components
    URI Components
    VERSION 1.0
    QML_FILES
        Component/MyButton.qml
        Component/MyItem.qml
)
target_link_libraries(app
    PRIVATE Qt6::Quick Qt6::Core
    #手动链接组件
    PRIVATE Components
)
```

:::tip
注意这里所有的例子都使用cmake，调用cmake的qt模块api
qt_add_qml_module 会自动生成qmldir不需要手写
:::

:::info
这里有个历史遗留问题qt5 组件用动态链接,qt_add_qml_module会生成插件模块动态链接到主程序
:::

### 自定义组件模块的其他问题

在这一章的段落介绍了qt模块几种方式
1.后备targets:也就是主模块，在构建时就知道依赖并加载的
2.插件targets:运行时按需动态加载的
3.主模块本身就是插件,只能按需动态加载的

>The STATIC QML modules also generate the static QML plugins if NO_PLUGIN is not specified. Targets that import such STATIC QML modules also need to explicitly link to corresponding QML plugins.

通常静态链接的模块直接target_link_libraries就可以了。
这个引用是说一件事:对于静态qml模块
qt_add_qml_module 会同时生成主模块(我这里的例子是Components)和一个叫: \<主库名\>plugin (这里也就是Componentsplugin)的插件模块,要是不想要插件模块在调用qt_add_qml_module时添加参数NO_PLUGIN,不生成插件模块。如果不加该参数，应该显式的链接插件模块(实际测试不需要,链接主模块即可工作)

对于自定义组件我们大概了解两种即可
1.qt_add_library(Components STATIC) + NO_PLUGIN参数   静态库   显式链接`target_link_libraries(app PRIVATE Qt6::Quick Qt6::Core PRIVATE Components)`
2.qt_add_library(Components SHARED)      动态库生成插件   生成产物不需要target_link_libraries 在运行时由qml引擎加载

### 导出c++对象qml使用
和自定义组件类似也是使用 `qt_add_qml_module`
参考[链接](https://doc.qt.io/qt-6/qtqml-cppintegration-definetypes.html#registering-an-instantiable-object-type)可实例化的对象类型
文档有例子

:::warning
注意继承QObject和使用QML_ELEMENT宏该宏需要头文件*QtQml/qqmlregistration.h*
:::

### 导出c++值类型

文档里有写我就不复制了
注意使用Q_GADGET和QML_VALUE_TYPE(class_name)

:::warning
文档提示了以下内容
:::

>Value types cannot be singletons.
>Value types need to be default-constructible and copy-constructible.
>Using QProperty as a member of a value type is problematic. Value types get copied, and you would need to decide what to do with any bindings on the QProperty at that point. You should not use QProperty in value types.
>Value types cannot provide attached properties.
>The API to define extensions to value types (QML_EXTENDED) is not public and subject to future changes.

1.不能是单例
2.可默认构造和复制构造
3.值类型行为是复制，所有QProperty绑定不到你想要的对象上,文档推荐不要使用
4.没有附加属性
5.没懂