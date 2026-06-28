---
title: winFrom控件
createTime: 2024/12/17 15:35:59
permalink: /article/i26uhz4h/
---

## TableLayoutPanel

==控制控件布局==。

![alt text](/images/csharp/tablelayoutPanel.png)

从工具箱拉取控件后设置 TableLayoutPanel 的布局 `dock` 为 `Fill`（中间部分），此效果为沾满整个基类（父窗口）。

::: tip 属性说明
- `dock` 属性：控制子控件在父窗口的停靠位置
- `anchor` 属性：控制子控件与父控件之间的距离
:::

![panel2](/images/csharp/tablelayoutPanel2.png)

![panel3](/images/csharp/tablelayoutPanel3.png)

## Chart

==Chart 控件主要有四个重要属性==。

### ChartArea

`ChartAreaCollection` — 绘图区。

可以设置许多独立的属性，绘图区是为了给下面的图表提供绘图区域，其本身不提供关于图标的任何数据。

**坐标轴属性：**

| 属性 | 说明 |
|------|------|
| `Axis` | 关于表示图表区坐标轴的数组。`Axis[0]` 表示 X 轴，`Axis[1]` 表示 Y 轴 |
| `AxisX` | 主 X 轴，等价于 `Axis[0]` |
| `AxisY` | 主 Y 轴，等价于 `Axis[1]` |

**坐标轴相关属性示例：**

```csharp
var cha = chart1.ChartAreas["ChartArea1"];

// 网格线、辅助线
cha.AxisX.MajorGrid.Enabled                    // 是否显示坐标轴网格（主要辅助线）
cha.AxisX.MajorGrid.LineDashStyle = ChartDashStyle.Dash;  // 网格类型：短横线
cha.AxisX.MajorGrid.LineColor = Color.Gray;    // 网格线颜色
cha.AxisX.MajorGrid.LineWidth = 3;             // 网格线宽度

// 刻度线
cha.AxisX.MajorTickMark.Enabled = false;       // 关闭刻度线显示（默认开启）

// 显示格式
cha.AxisX.LabelStyle.Format = "#格式字段";     // 设置 X 轴显示样式

// 绘图区背景
cha.BackColor = System.Drawing.Color.Transparent;  // 设置区域内背景透明

// 坐标轴箭头
cha.AxisX.ArrowStyle = AxisArrowStyle.Triangle;    // X 轴箭头

// 刻度间距
cha.AxisX.Interval = 1;          // 坐标轴刻度间距
cha.AxisX.IntervalOffset = 1;    // 坐标轴刻度偏移量

// 坐标轴标题
cha.AxisX.Title = "随机数";                       // 坐标轴标题
cha.AxisX.TitleAlignment = StringAlignment.Center; // 坐标轴对齐方式
```

**其他 ChartArea 属性：**

| 属性 | 说明 |
|------|------|
| `AlignmentOrientation` | 图标区对齐方向，默认为 Vertical（垂直对齐） |
| `AlignmentStyle` | 图表区对齐的元素 |
| `AlignWithChartArea` | 对齐参照的绘图区名称。例如 `AlignWithChartArea = "ChartArea1"` 表示以 ChartArea1 参考对齐 |
| `InnerPlotPosition` | 图表在绘图区的位置，默认为自动 |
| `Position` | 同上 |
| `Name` | 绘图区名称 |

### Series

图表集合 `SeriesCollection`，这就是关于绘图的具体数据和图表（饼图、柱状图、折线图等）。每一个 Series 类似于折线图的一条数据曲线。

**基础属性：**

| 属性 | 说明 |
|------|------|
| `Label` | 显示数据点文本（例如数值 90，那么在显示数值点的地方显示该文本） |
| `LabelFormat` | 数据点文本格式 |
| `LabelAngle` | 数据点文本的角度 |
| `Name` | 数据 Series 的名称 |
| `Palette` | 数据表面板颜色 |
| `ToolTip` | 文本提示（鼠标移动到对应数据点地方显示的提示） |
| `ChartArea` | 设置该图表显示的绘图区 |
| `ChartType` | 图表类型（`SeriesChartType` 枚举中的类型），例如 `SeriesChartType.Line` |
| `Points` | 图标中的点集合，用于绑定数据 |
| `Color` | 线条颜色 |
| `BorderWidth` | 线条粗细 |
| `IsValueShownAsLabel` | 是否显示数据点 |

**标记点属性：**

| 属性 | 说明 |
|------|------|
| `MarkerBorderColor` | 标记点边框颜色 |
| `MarkerStyle` | 标记点类型（`MarkerStyle` 枚举中的类型），例如 `MarkerStyle.Circle` |
| `MarkerBorderWidth` | 标记点边框大小 |
| `MarkerColor` | 标记点中心颜色 |
| `MarkerSize` | 标记点大小 |

**数据绑定属性：**

| 属性 | 说明 |
|------|------|
| `Points` | 数据点集合 |
| `XValueType` | 绑定到 X 轴上的值类型，默认是 auto，根据传入类型变化 |
| `YValueType` | 绑定到 Y 轴上的值类型 |
| `XValueMembers` | X 轴绑定的数据类型 |
| `YValueMembers` | Y 轴绑定的数据类型 |
| `XAxisType` | 指示使用主坐标轴还是副坐标轴 |
| `YAxisType` | 指示使用主坐标轴还是副坐标轴 |

**其他 ChartType 的特殊设置：**

```csharp
// 饼图说明设置，用来设置饼图每一块的信息显示在什么地方
ct.Series[0]["PieLabelStyle"] = "Outside";  // 将文字移到外侧
ct.Series[0]["PieLineColor"] = "Black";     // 绘制黑色的连线

// 柱状图其他设置
ct.Series[0]["DrawingStyle"] = "Emboss";    // 设置柱状平面形状
ct.Series[0]["PointWidth"] = "0.5";         // 设置柱状大小
```

**如何使用：添加 Series**

```csharp
chart1.Series.Add("Series2");

// 或
var dataTableSeries = new Series("datable");
// 一系列操作设置 series 的属性
chart1.Series.Add(dataTableSeries);

// Series 类型为 SeriesCollection，本质是多个 Series 的集合
// 因为 Series 是不规则名词，单复数都用一个词
// 所以表示集合的 SeriesCollection 和表示单个 Series 对象的标识都用一个词表示
// 这里以首字母大小写区分
```

### Legends（图例属性）

`Legend` 对象。

| 属性 | 说明 |
|------|------|
| `Alignment` | 对齐方式 |
| `AutoFitMinFontSize` | 设置自动调整的图例的最小字体 |
| `BackColor` | 背景颜色（当绘图区本身有颜色最好设置为透明 `Transparent`） |
| `Position` | 图例位置 |
| `IsTextAutoFit` | 图例大小是否关于图例区域大小调整 |

### Annotations（批注集合）

`AnnotationCollection` — 批注集合。

---

| 控件 | 适用于 |
|------|--------|
| Chart | .NET Framework 4.8.1 |
