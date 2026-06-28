---
title: slint设计学习
createTime: 2026/06/21 23:31:33
permalink: /article/ap9f850g/
---

# slint

==slint 语法和qml很像用 标识符加大括号{} 表示ui控件==，不想html要开始结束标签。

## slint 控件说明

- **ComboBox**: 下拉选项框

:::info 注意
GridLayout 现在不需要导出了
:::

## 组件和元素

和html相似的是slint也有组件与元素的概念

```qml
<Butten>111</Butten>
```

这里就是标签`<Butten>` 创建了一个按钮`元素`，然后多个元素组合成一个大元素给外部用被称为`组件`。

一个slint文件得有一个根元素作组件。

元素名(标识符)可以英文字母大小写、下滑线、数字、破折号(这两不能当开头)组成。

## 条件元素

slint有如下语法来表达元素是否创建：

```qml
if condition : id := Element { ... }

export component Example inherits Window {
    preferred-width: 50px;
    preferred-height: 50px;
    if area.pressed : foo := Rectangle { background: blue; }
    if !area.pressed : Rectangle { background: red; }
    area := TouchArea {}
}
```

## 导入导出和模块

语法和js/ts 很相似。

### 导出组件

声明组件然后导出，也可以在声明的时候同时导出：

```qml
component ButtonHelper inherits Rectangle {
    // ...
}

export component Button inherits Rectangle {
    // ...
}
export { Button }
//或者别名导出
export { Button as ColorButton }
```

### 导入组件

导入也可以别名导入，语法非常类似js：

```qml
import { Button } from "./button.slint";
import { Button as CoolButton } from "../other_theme/button.slint";

export component App inherits Rectangle {
    // ...
    CoolButton {} // from other_theme/button.slint
    Button {} // from button.slint
}
```

导入组件库的方法参考[文档](https://docs.slint.dev/latest/docs/slint/guide/language/coding/file/#component-libraries)

## 函数

slint 可以声明函数，但是只能作为组件的一部分或子组件的一部分，没有全局函数也没有结构体和枚举(slint)内定义函数。使用`function` 关键字。

## 属性

`:` 和 `:{}` 给属性赋值两种写法一样：

```qml
export component Example inherits Window {
    // Simple expression: ends with a semi colon
    width: 42px;
    // or a code block (no semicolon needed)
    height: { 42px }
}
```

### 组件别名

`:=` 是给组件起别名slint类似qml，但是没有id属性：

```qml
component MyButton inherits Text {
    // ...
}

export component MyApp inherits Window {
    preferred-width: 200px;
    preferred-height: 100px;

    hello := MyButton {
        x:0;y:0;
        text: "hello";
    }
    world := MyButton {
        y:0;
        text: "world";
        x: 50px;
    }
}
```

### 预设名字

三个预设名字，望文生义：

| 名称 | 说明 |
|------|------|
| `root` | 根元素 |
| `self` | 当前元素 |
| `parent` | 父元素 |

### 自定义属性

`property` 关键字加指定类型自定义额外属性，可以有默认值。

四种访问限定符：

| 限定符 | 说明 |
|--------|------|
| `private` | 默认，只能被当前组件访问 |
| `in` | 能被组件使用者写入属性 |
| `out` | 只能被组件使用者读取的属性 |
| `in-out` | 既能读取又能访问 |

```qml
property<int> my-second-property: 42;

in property <string> text;
```

### 值变化回调

`changed` 关键字，当属性值变化时设置其回调函数：

```qml
VerticalLayout {
    LineEdit {
        // This callback is invoked when the `text` property of the LineEdit changes
        changed text => { t.text = self.text; }
    }
    t := Text {}
}
```

:::tip 响应式绑定
==现代ui框架都有响应式绑定（依赖的表达式变化时重新求值）的功能==。
:::
