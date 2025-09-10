---
title: winui3入门
createTime: 2025/09/09 10:57:50
permalink: /article/ot09u1xs/
---



### 文件选择 
示例

```c#
//选择文件格式
openPicker.FileTypeFilter.Add(".xlsx");
//所有文件
openPicker.FileTypeFilter.Add("*");
不能 *.xlsx *.txt 这样

