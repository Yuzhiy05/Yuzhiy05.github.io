---
title: winFrom控件
createTime: 2024/12/17 15:35:59
permalink: /article/i26uhz4h/
---


-tableLayoutPanel
控制控件布局
![alt text](/images/csharp/tablelayoutPanel.png)
从工具箱拉取控件后设置tableLayoutPanel的布局`dock`为`Fill`(中间部分)此效果为沾满整个基类(父窗口)
其中
dock属性控制子控件在父窗口的停靠位置；anchor属性控制子控件与父控件之间的距离
![panel2](/images/csharp/tablelayoutPanel2.png)


![panel3](/images/csharp/tablelayoutPanel3.png)



- chart
  

chart 控件主要有四个重要属性

### ChartArea   
ChartAreaCollection  ChartAreas
绘图区
其中可以设置许多独立的属性，绘图区是为了给下面的图表提供绘图区域，其本身不提供关于图标的任何数据
其中一些属性
例如X轴 Y轴 刻度线
属性
Axis //关于表示图表区坐标轴的数组
例如 Axis[0] 表示X轴  Axis[1] 表示Y轴

AxisX 主X轴 等价于 Axis[0] 
AsisY 主Y轴 等价于 Axis[1]

关于坐标轴的属性
```c#
var cha=chart1.ChartAreas["ChartArea1"];
//网格线。辅助线
cha.AxisX.MajorGrid.Enabled  //是否显示坐标轴网格(主要辅助线)
cha.AxisX.MajorGrid.LineDashStyle = ChartDashStyle.Dash; //网格类型 短横线
cha.AxisX.MajorGrid.LineColor = Color.Gray  //网格线颜色
cha.AxisX.MajorGrid.LineWidth = 3//网格线宽度
//
cha.AxisX.MajorTickMark.Enabled=false; //关闭刻度线显示默认开启
cha.AxisX.LabelStyle.Format="#格式字段";//设置X轴显示样式
//绘图区
cha.BackColor=System.Drawing.Color.Transparent; //设置区域内背景透明

cha.AxisX.ArrowStyle = AxisArrowStyle.Triangle //x轴箭头

cha.AxisX.Interval=1 坐标轴刻度间距
cha.AxisX.IntervalOffset=1 坐标轴刻度偏移量

cha.AxisX.Title = "随机数";//坐标轴标题
cha.AxisX.TitleAlignment=StringAlignment.Center;坐标轴对齐方式

```
AlignmentOrientation 图标区对齐方向 默认为Vertical 垂直对齐
AlignmentStyle 图表区对齐的元素
AlignWithChartArea   对齐参照的绘图区名称 `AlignWithChartArea = "ChartArea1"`;那么 以ChartArea1参考对齐
InnerPlotPosition 图表在绘图区的位置默认为自动
Position 同上
Name 绘图区名称

### Series 
图表集合  SeriesCollection  
这就是关于绘图的具体数据和图表
饼图 柱状图 折线图等
每一个series类似于折线图的一条数据曲线
属性

Label 显示数据点文本 (例如数值90，那么在显示数值点的地方显示该文本)
LabelFromat  数据点文本格式
LabelAngle  数据点文本的角度

Name 数据series的名称
Palette 数据表面板颜色
ToolTip  文本提示  (鼠标移动到对应数据点地方显示的提示)
ChartArea 设置该图表的显示的绘图区 
ChartType 图表类型  (SeriesChartType枚举中的类型)  SeriesChartType.Line
Points 图标中的点集合用于绑定数据
Color 线条颜色
BorderWidth 线条粗细
IsValueShowAsLable  是否显示数据点

MarkerBorderColor 标记点边框颜色
MarkerStyle  标记点类型(MarkerStyle枚举中的类型)  MarkerStyle.Circle
MarkerBorderWidth 标记点边框大小
MarkerColor 标记点中心颜色
MarkerSize  标记点大小

Points 数据点集合
XValueType 绑定到X轴上的值类型 默认是auto 根据传入类型变化
YValueType
XValueMembers x轴绑定的数据类型
YValueMembers 
XAxisType 指示使用主坐标轴还是副坐标轴
YAxisType 


4.其他ChartType的特殊设置

//饼图说明设置，这用来设置饼图每一块的信息显示在什么地方
ct.Series[0]["PieLabelStyle"] = "Outside";//将文字移到外侧
ct.Series[0]["PieLineColor"] = "Black";//绘制黑色的连线。
//柱状图其他设置
ct.Series[0]["DrawingStyle"] = "Emboss"; //设置柱状平面形状
ct.Series[0]["PointWidth"] = "0.5"; //设置柱状大小

如何使用
添加series
```c#
chart1.Series.Add("Series2");
//或
var dataTableSeries = new Series("datable");
// 一系列操作设置series的属性
chart1.Series.Add(dataTableSeries);
//Series类型为SeriesCollection 本质是多个series的集合 因为series是不规则名词单复数都用一个词所以表示集合的Series(eriesCollection)和表示单个series对象的标识都用一个词表示这里以首字母大小写区分


```

### Legends  图例属性
Lenged对象

属性
Alignment 对齐方式
AutoFitMinFontSize 设置自动调整的图例的最小字体
BackColor 背景颜色  当绘图区本身有颜色最好设置为透明transparent
Position  图例位置
IsTextAutoFix 图例大小是否关于图例区域大小调整


### Annotations
AnnotationCollection
批注集合




|控件|适用于|
|----|-----|
|chart|.NET Framework 4.8.1|

