---
title: winui3入门
createTime: 2025/09/09 10:57:50
permalink: /article/ot09u1xs/
---

### XAML

这是一种类似于 HTML 的标记型语言，来源于 XML。XML 原意是用来传输数据的，经过改造的 XAML 用来生成 UI 布局的设计文件。

和 HTML 不同的是，HTML 可以通过浏览器映射到 DOM 元素，通过 JS 可以动态删除修改 DOM 元素节点。

而 XAML 则是声明式标记语言，他被编译后生成对应的 C++/C# 代码的 UI 文件 `*.g.cs`。

WinUI3 项目（笼统的说）通过 XAML 编译器将 XAML 编译成对应的 C++/C# 代码，将 XAML 声明的控件元素映射到 `.cs` 的类中去。

### Frame

*待补充*

### 文件选择

示例：

```csharp
// 选择文件格式
openPicker.FileTypeFilter.Add(".xlsx");
// 所有文件
openPicker.FileTypeFilter.Add("*");
// 不能 *.xlsx *.txt 这样
```

### 资源字典

使用统一格式的控件：

```xml
<!-- Resources/Styles.xaml -->
<ResourceDictionary>
    <Style TargetType="Button" x:Key="MyButtonStyle">
        <Setter Property="Background" Value="Blue"/>
        <Setter Property="Foreground" Value="White"/>
    </Style>
</ResourceDictionary>
```

在该页声明：

```xml
<Application.Resources>
    <ResourceDictionary Source="ms-appx:///Resources/Styles.xaml"/>
</Application.Resources>
```

使用：

```xml
<Button Content="Styled Button" Style="{StaticResource MyButtonStyle}"/>
```

使用 `Microsoft.UI.Xaml.Controls` 命名控件的控件，需要这样引入：

```xml
xmlns:muxc="using:Microsoft.UI.Xaml.Controls"
```

## winui3 控件速查

| 分类 | 控件 | 说明 |
|------|------|------|
| **布局** | Grid、StackPanel、Canvas、RelativePanel、VariableSizedWrapGrid | 控制 UI 元素的排列方式 |
| **文本显示** | TextBlock、RichTextBlock | 显示文字（不可编辑 vs 富文本） |
| **输入** | TextBox、PasswordBox、RichEditBox、ComboBox、Slider、ToggleSwitch、CheckBox、RadioButton | 接收用户输入 |
| **按钮类** | Button、RepeatButton、HyperlinkButton | 触发操作 |
| **列表/数据** | ListView、GridView、ItemsRepeater、DataGrid（社区版） | 显示集合数据 |
| **导航** | NavigationView、Frame、Pivot（旧）/ TabView | 页面/内容切换 |
| **弹窗/提示** | ContentDialog、MessageDialog、TeachingTip、ToolTip | 对话框、提示 |
| **进度/状态** | ProgressBar、ProgressRing、RatingControl | 显示进度或评分 |
| **媒体** | Image、MediaPlayerElement | 显示图片或播放音视频 |
| **容器/装饰** | Border、ScrollViewer、Viewbox | 包装美化或滚动 |
| **命令栏** | CommandBar、MenuBar | 快捷操作区 |

### 使用 Grid

这样定义了一个 Grid 布局，三行三列，每行每列设置占比：

```xml
<Grid>
    <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>   <!-- 行高由内容决定 -->
        <RowDefinition Height="*"/>      <!-- 占剩余空间的 1 份 -->
        <RowDefinition Height="100"/>    <!-- 固定 100 像素 -->
    </Grid.RowDefinitions>

    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto"/>  <!-- 列宽由内容决定 -->
        <ColumnDefinition Width="*"/>     <!-- 占剩余空间的 1 份 -->
        <ColumnDefinition Width="200"/>   <!-- 固定 200 像素 -->
    </Grid.ColumnDefinitions>
</Grid>
```

::: tip Grid 长度说明
- `Height="Auto"` — 占比根据子元素决定
- `*` — 占剩余空间的一份
- `2*` — 占剩余空间的两份
- `Height="100"` — 数字就是固定像素
:::

在 C# 代码中设置：

```csharp
grid.ColumnDefinitions[0].Width = new GridLength(2, GridUnitType.Star);   // 2*
grid.ColumnDefinitions[1].Width = new GridLength(100);                   // 固定 100px
grid.RowDefinitions[0].Height = GridLength.Auto;                         // Auto
```

## 绑定数据

`x:Bind` 和 `Binding`，通过 `ElementName` 或 `RelativeSource` 引入属性。

```xml
<Grid Grid.Row="1">
    <Grid.ColumnDefinitions>
        <ColumnDefinition Width="Auto"/>
        <!-- 导航栏 -->
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="*"/>
        <!-- 内容区 -->
    </Grid.ColumnDefinitions>

    <!-- 左侧导航栏 -->
    <muxc:NavigationView 
        Grid.Column="0"
        PaneDisplayMode="LeftCompact"
        IsSettingsVisible="False"
        IsBackButtonVisible="Collapsed"
        SelectedItem="{x:Bind SelectedNavItem, Mode=TwoWay}">

        <muxc:NavigationView.MenuItems>
            <muxc:NavigationViewItem 
                Icon="Home" 
                Content="首页" 
                Tag="home"/>
            <muxc:NavigationViewItem 
                Icon="Document" 
                Content="文件" 
                Tag="files"/>
            <muxc:NavigationViewItem 
                Icon="Setting" 
                Content="设置" 
                Tag="settings"/>
        </muxc:NavigationView.MenuItems>
    </muxc:NavigationView>

    <Frame Grid.Column="1" x:Name="MainFream"/>
    <!-- 右侧内容区 -->
    <Grid Grid.Column="2" Padding="24">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <!-- 操作区 -->
            <RowDefinition Height="*"/>
            <!-- 显示区 -->
        </Grid.RowDefinitions>

        <!-- 文件导入框 -->
        <Border 
            Grid.Row="0"
            Background="{ThemeResource CardBackgroundFillColorDefaultBrush}"
            CornerRadius="8"
            Padding="24"
            Margin="0,0,0,24">
            <StackPanel Orientation="Vertical" Spacing="16">
                <TextBlock 
                    Text="导入文件"
                    Style="{StaticResource SubtitleTextBlockStyle}"/>

                <Button 
                    HorizontalAlignment="Left"
                    Click="OnImportFileClick">
                    <Button.Content>
                        <StackPanel Orientation="Horizontal" Spacing="8">
                            <SymbolIcon Symbol="OpenFile"/>
                            <TextBlock Text="选择文件"/>
                        </StackPanel>
                    </Button.Content>
                </Button>

                <Button HorizontalAlignment="Left"
                Click="OnDrivePage" Content="导航去主页面">
                </Button>
                <TextBlock 
                    Text="或拖放文件到此处"
                    Style="{StaticResource CaptionTextBlockStyle}"
                    Foreground="{ThemeResource TextFillColorSecondaryBrush}"/>
            </StackPanel>
        </Border>

        <!-- 文件显示区 -->
        <Border 
            Grid.Row="1"
            Background="{ThemeResource CardBackgroundFillColorDefaultBrush}"
            CornerRadius="8"
            Padding="24">
            <Grid>
                <TextBlock 
                    x:Name="ContentDisplay"
                    TextWrapping="Wrap"
                    Style="{StaticResource BodyTextBlockStyle}"/>

                <!-- 空状态提示 -->
                <muxc:InfoBar 
                    x:Name="EmptyStateInfo"
                    IsOpen="True"
                    Title="无内容"
                    Message="请导入文件以查看内容"
                    Severity="Informational"
                    HorizontalAlignment="Center"
                    VerticalAlignment="Center"/>
            </Grid>
        </Border>
    </Grid>
</Grid>
```

## MVVM

以下为 AI 生成的例子，已手动验证。

### CommunityToolkit 实现

```csharp
public partial class UserViewModel : ObservableObject
{
    [ObservableProperty]
    [NotifyPropertyChangedFor(nameof(FullName))]
    [NotifyPropertyChangedFor(nameof(CanSubmit))]
    private string firstName;
    
    partial void OnFirstNameChanged(string value)
    {
        // 声明式：定义时就知道会触发
        Logger.Log($"First name updated to {value}");
        RefreshSuggestions();
    }
    
    [ObservableProperty]
    private string lastName;
    
    partial void OnLastNameChanged(string value)
    {
        // 每个属性的改变后行为都在定义位置清晰可见
    }
}
```

### 实现 ICommand

*待补充*
