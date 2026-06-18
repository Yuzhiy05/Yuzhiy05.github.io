---
title: Winui3-xaml学习
createTime: 2025/12/21 14:16:09
permalink: /article/g6eg2tsi/
---




# Xaml说明
xaml 是从xml继承来的标记型语言

xml 用来存储和传输数据?

没有xaml的渲染用html代替

类似闭合标签的语法声明

xaml 由
```html
<Page
    x:Class="Application1.BlankPage"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
>


```

仿照winui3 Gallery一个常见的设计问题

了解了Grid设计布局后 按一般思维 通常会有这样一个设计
```xml
<Grid>
    <!-- 整体布局 -->
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <!-- 标题栏 -->
        <RowDefinition Height="*"/>
        <!-- 主内容区 -->
    </Grid.RowDefinitions>
      <!-- 主内容区 -->
        <Grid Grid.Row="1">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="*"/>
            </Grid.RowDefinitions>
            <Grid.ColumnDefinitions>
            <ColumnDefinition Width="Auto"/>
            <!-- 导航栏 -->
            <ColumnDefinition Width="*"/>
            <!-- 内容区 -->
            </Grid.ColumnDefinitions>
            <TitleBar  x:Name="titleBar"
BackRequested="TitleBar_BackRequested"
IsBackButtonVisible="{x:Bind contentFrame.CanGoBack, Mode=OneWay}"
IsPaneToggleButtonVisible="true"
PaneToggleRequested="TitleBar_PaneToggleRequested" />
            <NavigationView x:Name="nvTopage"
                Grid.Row="1"
                Grid.Column="0"
                IsBackButtonVisible="Collapsed"
                IsPaneToggleButtonVisible="False"
                SelectionChanged="OnNavigationViewSelectionChanged">
                <NavigationView.MenuItems>
                    <NavigationViewItem x:Name="Home" Icon="Play" Content="Home" Tag="SamplePage1" />
                    <NavigationViewItem x:Name="Expen" Icon="Save" Content="Expen" Tag="SamplePage2" />
                    <NavigationViewItem x:Name="Test"  Icon="Refresh" Content="Test" Tag="SamplePage3" />
                    <NavigationViewItem x:Name="Newpage" Icon="Download" Content="Newpage" Tag="SamplePage4" />
                    <NavigationViewItem x:Name="Openfile" Icon="OpenFile" Content="openfile" Tag="xxx"/>
                    <NavigationViewItem x:Name="Todo" Icon="Account" Content="材料" Tag="test"/>
                </NavigationView.MenuItems>
            </NavigationView>
            <Frame  Grid.Row="1" Grid.Column="1" x:Name="contentFrame"/>
        </Grid>
 </Grid>       
```

重点在导航栏 NavigationView  和Frame之中
```xml
 <ColumnDefinition Width="Auto"/>
            <!-- 导航栏 -->
<ColumnDefinition Width="*"/>
```
按一般设计的想法 是在一个Grid布局中设计两列,一列显示导航栏，一列显示Fream主体内容.但这样设计Navigation导航栏伸缩变化时内容区不会随之变化
参考winui3 Gallery的设计是将显示内容的Fream放在NavigationView导航栏里由导航栏自己管理内容区域
```xml
<NavigationView x:Name="nvTopage"
    Grid.Row="1"
    IsBackButtonVisible="Collapsed"
    IsPaneToggleButtonVisible="False"
    SelectionChanged="OnNavigationViewSelectionChanged">
    <NavigationView.MenuItems>
        <NavigationViewItem x:Name="Home" Icon="Play" Content="Home" Tag="SamplePage1" />
        <NavigationViewItem x:Name="Expen" Icon="Save" Content="Expen" Tag="SamplePage2" />
        <NavigationViewItem x:Name="Test"  Icon="Refresh" Content="Test" Tag="SamplePage3" />
        <NavigationViewItem x:Name="Newpage" Icon="Download" Content="Newpage" Tag="SamplePage4" />
        <NavigationViewItem x:Name="Openfile" Icon="OpenFile" Content="openfile" Tag="xxx"/>
        <NavigationViewItem x:Name="Todo" Icon="Account" Content="材料" Tag="test"/>
    </NavigationView.MenuItems>
    <Frame x:Name="contentFrame"/>
</NavigationView>
```
