---
title: Winui3-xaml学习
createTime: 2025/12/21 14:16:09
permalink: /article/g6eg2tsi/
---

# XAML 说明

==XAML 是从 XML 继承来的标记型语言==。

XML 用来存储和传输数据。

没有 XAML 的渲染用 HTML 代替，类似闭合标签的语法声明。

XAML 由以下结构组成：

```xml
<Page
    x:Class="Application1.BlankPage"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
>
</Page>
```

## 常见的设计问题

仿照 WinUI3 Gallery 一个常见的设计问题。

了解了 Grid 设计布局后，按一般思维，通常会有这样一个设计：

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

        <TitleBar x:Name="titleBar"
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

        <Frame Grid.Row="1" Grid.Column="1" x:Name="contentFrame"/>
    </Grid>
</Grid>
```

## 重点：NavigationView 和 Frame

按一般设计的想法，是在一个 Grid 布局中设计两列，一列显示导航栏，一列显示 Frame 主体内容。==但这样设计 Navigation 导航栏伸缩变化时内容区不会随之变化==。

参考 WinUI3 Gallery 的设计，是将显示内容的 Frame 放在 NavigationView 导航栏里，由导航栏自己管理内容区域：

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
