import { plumeTheme } from 'vuepress-theme-plume'

export default plumeTheme({
  hostname: 'https://github.com/Yuzhiy05/Yuzhiy05.github.io',
  //blog: false,开启这个博客页面不显示
  plugins: {
    shiki: {
      twoslash: true,
      lineNumbers: 10,
      languages: ['cpp','powershell', 'csharp','json','cmake','shell','typescript', 'javascript', 'python', 'html', 'css', 'markdown', 'vue'],
    },
    markdownEnhance: { demo: true },
    markdownPower: { caniuse: true, jsfiddle: true,
      fileTree: {
        icon: 'colored', // 'simple' | 'colored'
      }, // :::file-tree  文件树容器
      plot: true, 
      // !!plot!! 隐秘文本
      icons: true, 
      // :[collect:name]:   内联 iconify 图标 
      },
    markdownMath: {
      type: 'katex',
    },
    markdownImage: {
      // 启用 figure
      figure: true,

      // 启用图片懒加载
      lazyload: true,

      // 启用图片标记
      mark: true,

      // 启用图片大小
      size: true,
    }
  },
  autoFrontmatter: {
    permalink: true, // 是否生成永久链接
    createTime: true, // 是否生成创建时间
  },

locales: {
  "/zh/": {
  
  },
  "/en/": {
    
  },
},

})