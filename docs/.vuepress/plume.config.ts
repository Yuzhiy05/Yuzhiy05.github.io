import { defineThemeConfig, } from 'vuepress-theme-plume'
import navbar from './navbar.js'


export default defineThemeConfig({
  logo: '/pro2.png',
  // docsRepo: 'https://github.com/Yuzhiy05/Yuzhiy05.github.io',
  // docsDir: 'docs',
  navbar,

  // 集合配置（替代 notes）
  collections: [
    // 博客 - 从根目录开始，排除 notes 目录
    {
      type: 'post',
      dir: '/',
      title: '博客',
      link: '/blog/',
      linkPrefix: '/article/',
      exclude: ['notes/**'],
    },
    // 笔记 - 从 notes 配置迁移
    {
      type: 'doc',
      dir: 'notes/test1',
      title: '线性代数',
      linkPrefix: '/test1/',
      sidebar: [
        {
          text: 'test1',
          link: '/test1/',
          items: [
            'chapter3-4.md',
            'exception.md',
          ],
        },
      ],
    },
    {
      type: 'doc',
      dir: 'notes/data_struct',
      title: '数据结构',
      linkPrefix: '/data_struct/',
      sidebar: [
        {
          text: '数据结构',
          link: '/data_struct/',
          items: [
            'map_str.md',
          ],
        },
      ],
    },
    {
      type: 'doc',
      dir: 'notes/math',
      title: '数学',
      linkPrefix: '/math/',
      sidebar: [
        {
          text: 'math',
          link: '/math/',
          items: [
            'mathformula.md'
          ],
        },
      ],
    },
  ],

  profile: {
    name: 'Yuzhiy',
    description: '我心匪石不可转，我心匪席不可卷',
    avatar: '/pro2.png',//头像
    location: 'anhui',
    //organization: '您的组织',
    //circle: true, // 是否为圆形头像
    layout: 'right', // 个人信息在左侧还是右侧，'left' | 'right'
  },
  social: [
    { icon: 'github', link: 'https://github.com/Yuzhiy05/Yuzhiy05.github.io' },
    // ... more
  ],
  });