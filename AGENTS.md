# 项目风险评估

## 操作规范

**每次修改都要保证有回退机制，用户可以在任何修改后回退。**

### 回退机制要求
1. 修改前必须创建备份（配置文件、重要文件）
2. 修改前确保当前工作区已提交或有备份点
3. 提供明确的回退命令或步骤
4. 验证回退机制有效后再进行下一步操作

### 提交规范
1. **所有提交都需要用户确认后再提交**
2. 每次生成新的备份文件或不需要提交的文件/类型时，都需要写入 `.gitignore`
3. 提交格式：`<type>: <description>`（type 使用英文，description 使用中文）

## 当前依赖版本

| 依赖 | 当前版本 | 最新版本 | 变化幅度 |
|------|----------|----------|----------|
| vuepress | 2.0.0-rc.30 | 2.0.0-rc.30 | 已更新 |
| @vuepress/bundler-vite | 2.0.0-rc.30 | 2.0.0-rc.30 | 已更新 |
| @vuepress/theme-default | 2.0.0-rc.130 | 2.0.0-rc.130 | 已更新 |
| vuepress-theme-plume | 1.0.0-rc.203 | 1.0.0-rc.203 | 已更新 |
| vue | 3.5.38 | 3.5.38 | 已更新 |
| sass-embedded | 1.100.0 | 1.100.0 | 已更新 |

## 升级需要解决的问题

### 1. 配置迁移（必须）
- `notes` 配置需要迁移到 `collections` 格式
- 新版本中 `collections` 和 `notes` 不能同时存在

### 2. 新增依赖（必须）
- 需要安装 `@vuepress/shiki-twoslash` 以支持 twoslash 功能

### 3. Vue 模板解析问题
- 普通文本中的泛型语法 `<T>` 需要转义为 `\<T\>`
- 已在当前版本修复

### 4. pnpm-lock.yaml 变化
- 依赖更新会导致 lock 文件大量变化（约5700行）

## 风险评估

| 风险项 | 风险等级 | 说明 |
|--------|----------|------|
| 配置兼容性 | 中 | 需要迁移 notes 到 collections |
| 主题功能变化 | 低 | 主要是 bug 修复和新功能 |
| 构建失败 | 低 | 已知问题都有解决方案 |
| 样式变化 | 低 | 主题更新主要是功能增强 |

## 升级步骤

1. 备份当前配置
2. 更新 package.json 依赖版本
3. 安装 `@vuepress/shiki-twoslash`
4. 将 `notes` 配置迁移到 `collections` 格式
5. 运行 `pnpm install`
6. 测试构建和开发服务器

## 已知问题及解决方案

### 问题1: 代码块中的泛型被解析为 HTML
**症状**: `<T>` 被 Vue 模板编译器解析为 HTML 标签
**解决**: 在普通文本中使用 `\<T\>` 转义

### 问题2: collections 和 notes 配置冲突
**症状**: 同时配置时 notes 会被忽略
**解决**: 只使用 collections 配置

#### 详细解释
在 `vuepress-theme-plume 1.0.0-rc.203` 中，主题引入了新的 `collections` 配置来统一管理内容集合，替代了原来的 `notes` 和 `blog` 配置。

新版本有一个兼容函数 `compatBlogAndNotesToCollections`，代码逻辑如下：
```javascript
function compatBlogAndNotesToCollections(options) {
    if (!options.collections?.length) {
        // 只有当 collections 为空时，才将 notes 转换为 collections
        if (options.notes) {
            // 转换逻辑...
        }
    }
    // 删除 notes 配置
    deleteKey(options, ["blog", "notes"]);
}
```

**关键点：**
- 如果同时配置了 `collections` 和 `notes`，`notes` 会被忽略
- 只有当 `collections` 为空时，`notes` 才会自动转换为 `collections` 格式
- 必须将所有配置统一到 `collections` 中：
  - 博客：`{ type: 'post', dir: 'blog', ... }`
  - 笔记：`{ type: 'doc', dir: 'notes/test1', ... }`

### 问题3: 缺少 shiki-twoslash 依赖
**症状**: twoslash 功能无法使用
**解决**: 安装 `@vuepress/shiki-twoslash`

## 结论

**升级可行**，主要工作量在于配置迁移。需要将 `notes.ts` 中的笔记配置转换为 `plume.config.ts` 中的 `collections` 格式。

## 回退机制

### 备份点
- **Git 标签**: `backup/before-upgrade`
- **配置文件备份**: `*.bak` 文件

### 回退命令

**方式1: 使用 Git 标签回退**
```bash
git checkout backup/before-upgrade
```

**方式2: 恢复配置文件**
```bash
# 恢复配置文件
Copy-Item docs/.vuepress/config.ts.bak docs/.vuepress/config.ts -Force
Copy-Item docs/.vuepress/theme.ts.bak docs/.vuepress/theme.ts -Force
Copy-Item docs/.vuepress/plume.config.ts.bak docs/.vuepress/plume.config.ts -Force
Copy-Item docs/.vuepress/notes.ts.bak docs/.vuepress/notes.ts -Force
Copy-Item docs/.vuepress/navbar.ts.bak docs/.vuepress/navbar.ts -Force
Copy-Item package.json.bak package.json -Force

# 重新安装依赖
pnpm install
```

**方式3: 完全回退（丢弃所有更改）**
```bash
git checkout -- .
git clean -fd
pnpm install
```
