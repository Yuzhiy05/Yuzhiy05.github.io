import{_ as n,c as a,b as i,o as e}from"./app-byjQjrGe.js";const l={};function p(t,s){return e(),a("div",null,s[0]||(s[0]=[i(`<h1 id="vscode-搭建cpp环境" tabindex="-1"><a class="header-anchor" href="#vscode-搭建cpp环境"><span>VSCode 搭建cpp环境</span></a></h1><h2 id="准备工作" tabindex="-1"><a class="header-anchor" href="#准备工作"><span>准备工作</span></a></h2><p>1.下载VScode 2.Windows环境下载mingw64<br><a href="https://github.com/trcrsired/llvm-releases" target="_blank" rel="noopener noreferrer">下载链接</a><br> 3.解压缩x86-64 w64-mingw32<br> 4.<em>D:\\workfile\\gcc15\\x86_64-w64-mingw32\\bin</em>与<br><em>D:\\workfile\\gcc15\\x86_64-w64-mingw32\\lib</em><br><em>D:\\workfile\\gcc15\\x86_64-w64-mingw32\\lib32</em> 添加至用户环境变量<em>PATH</em><br> 5.打开下载c++插件</p><h2 id="cmake搭配vscode" tabindex="-1"><a class="header-anchor" href="#cmake搭配vscode"><span>Cmake搭配Vscode</span></a></h2><h3 id="前提介绍" tabindex="-1"><a class="header-anchor" href="#前提介绍"><span>前提介绍</span></a></h3><p>1.CMakePresets.json：用于指定整个项目的构建细节，json中包含</p><div class="language-c++ line-numbers-mode" data-ext="c++" data-title="c++"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">name</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">预设的名称，一般用表示平台或编译期的版本名字</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">vendor</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">可选内容，提供供应商的信息，</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">Cmake一般不管除非有所谓映射</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">不用管</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">displayName</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">此预设的个性化名词</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">无关紧要</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">)</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">一般有编译期名字代替如</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">GCC 15.0.0 x86_64-w64-mingw32</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">description</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">自定义的描述</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">无关紧要</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">)</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">一般使用本地编译期所在路径描述</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">steps</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">A required array of objects describing the steps of the </span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">workflow</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">.</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;"> The</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> first step must be a configure preset</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> and</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> all subsequent steps must be non</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;">-</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> configure presets whose configurePreset field matches the starting configure </span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">preset</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">.</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;"> Each</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> object may contain the following fields:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">type</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">A required </span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">string</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">.</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;"> The</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> first step must be </span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;">configure</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">.</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A;"> Subsequent</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> steps must be either build</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> test</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> or</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> package.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">name</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">A required string representing the name of the configure</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> build</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> test</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> or</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> package preset to run as </span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;">this</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;"> workflow step.</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>2.CmakeLists.txt：告诉Cmake如何构建你的项目</p><h3 id="构建cmakelists" tabindex="-1"><a class="header-anchor" href="#构建cmakelists"><span>构建CmakeLists</span></a></h3><p>1.打开Vscode的命令面板 (Ctrl+Shift+P) 并运行CMake: Quick Start命令<br> 2.输入项目名称，选择c++作为项目语言<br> 3.暂时选择<code>CTest</code>作为测试支持<br> 4.选择<code>Executable</code>作为项目类型时，创建包含<code>main</code>函数的<code>mian.cpp</code>文件 Note:当然想要创建头文件或基础资源时可选择<code>Library</code></p><h3 id="创建-cmakepresets-json" tabindex="-1"><a class="header-anchor" href="#创建-cmakepresets-json"><span>创建 CMakePresets.json</span></a></h3><p>1.选择 添加新的预设值和从编译器创建<br> note:该扩展可自动扫描计算机上的工具包，并创建系统中发现的编译器列表。 2.根据你想要编译器选择 3.输入预设的名字 完成这些步骤后，您就拥有了一个完整的 hello world CMake 项目，其中包含以下文件: <code>main.cpp</code>, <code>CMakeLists.txt</code>, and <code>CMakePresets.json</code>.</p><h2 id="创建一个项目" tabindex="-1"><a class="header-anchor" href="#创建一个项目"><span>创建一个项目</span></a></h2><p><code>tasks.json</code> (构建指导)<br><code>launch.json</code> (debugger 设置)<br><code>c_cpp_properties.json</code> (编译器路径与智能感知设置)</p><p>首次运行程序时，C++ 扩展会创建一个 tasks.json 文件，您可以在项目的 .vscode 文件夹中找到该文件。tasks.json 会存储您的构建配置</p><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>{</span></span>
<span class="line"><span>  &quot;tasks&quot;: [</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      &quot;type&quot;: &quot;cppbuild&quot;,</span></span>
<span class="line"><span>      &quot;label&quot;: &quot;C/C++: g++.exe build active file&quot;,</span></span>
<span class="line"><span>      &quot;command&quot;: &quot;C:\\\\msys64\\\\ucrt64\\\\bin\\\\g++.exe&quot;,</span></span>
<span class="line"><span>      &quot;args&quot;: [</span></span>
<span class="line"><span>        &quot;-fdiagnostics-color=always&quot;,</span></span>
<span class="line"><span>        &quot;-g&quot;,</span></span>
<span class="line"><span>        &quot;\${file}&quot;,</span></span>
<span class="line"><span>        &quot;-o&quot;,</span></span>
<span class="line"><span>        &quot;\${fileDirname}\\\\\${fileBasenameNoExtension}.exe&quot;</span></span>
<span class="line"><span>      ],</span></span>
<span class="line"><span>      &quot;options&quot;: {</span></span>
<span class="line"><span>        &quot;cwd&quot;: &quot;\${fileDirname}&quot;</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      &quot;problemMatcher&quot;: [&quot;$gcc&quot;],</span></span>
<span class="line"><span>      &quot;group&quot;: {</span></span>
<span class="line"><span>        &quot;kind&quot;: &quot;build&quot;,</span></span>
<span class="line"><span>        &quot;isDefault&quot;: true</span></span>
<span class="line"><span>      },</span></span>
<span class="line"><span>      &quot;detail&quot;: &quot;Task generated by Debugger.&quot;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  ],</span></span>
<span class="line"><span>  &quot;version&quot;: &quot;2.0.0&quot;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="使用cmake" tabindex="-1"><a class="header-anchor" href="#使用cmake"><span>使用cmake</span></a></h1><h2 id="cmakelist配置" tabindex="-1"><a class="header-anchor" href="#cmakelist配置"><span>cmakelist配置</span></a></h2><h3 id="生成动态库" tabindex="-1"><a class="header-anchor" href="#生成动态库"><span>生成动态库</span></a></h3><p>1.有如下目录结构</p><div class="language- line-numbers-mode" data-ext="" data-title=""><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>&gt;cmake_study  </span></span>
<span class="line"><span>    |          </span></span>
<span class="line"><span>    |__lib  </span></span>
<span class="line"><span>    |__testFunc  </span></span>
<span class="line"><span>        |__testFunc.c  </span></span>
<span class="line"><span>        |__test2.h</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-cmake line-numbers-mode" data-ext="cmake" data-title="cmake"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span># 新建变量SRC_LIST</span></span>
<span class="line"><span>set(SRC_LIST \${PROJECT_SOURCE_DIR}/testFunc/testFunc.c)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 对 源文件变量 生成动态库 testFunc_shared</span></span>
<span class="line"><span>add_library(testFunc_shared SHARED \${SRC_LIST})</span></span>
<span class="line"><span># 对 源文件变量 生成静态库 testFunc_static</span></span>
<span class="line"><span>add_library(testFunc_static STATIC \${SRC_LIST})</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 设置最终生成的库的名称</span></span>
<span class="line"><span>set_target_properties(testFunc_shared PROPERTIES OUTPUT_NAME &quot;testFunc&quot;)</span></span>
<span class="line"><span>set_target_properties(testFunc_static PROPERTIES OUTPUT_NAME &quot;testFunc&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 设置库文件的输出路径</span></span>
<span class="line"><span>set(LIBRARY_OUTPUT_PATH \${PROJECT_SOURCE_DIR}/lib)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>1.<code>add_library</code>：生成动态库或静态库<br> 第1个参数：指定库的名字<br> 第2个参数：决定是动态还是静态，如果没有就默认静态<br> 第3个参数：指定生成库的源文件<br> 2.<code>set_target_properties</code>：设置最终生成的库的名称，还有其它功能，如设置库的版本号等等<br> 3.<code>LIBRARY_OUTPUT_PATH</code>：库文件的默认输出路径，这里设置为工程目录下的lib目录</p><p>前面使用set_target_properties重新定义了库的输出名称，如果不使用set_target_properties也可以，那么库的名称就是add_library里定义的名称，只是连续2次使用add_library指定库名称时（第一个参数），这个名称不能相同，而set_target_properties可以把名称设置为相同，只是最终生成的库文件后缀不同（一个是.so，一个是.a.win中为dll），这样相对来说会好看点</p><h3 id="链接库" tabindex="-1"><a class="header-anchor" href="#链接库"><span>链接库</span></a></h3><p>有如下文件路径</p><div class="language- line-numbers-mode" data-ext="" data-title=""><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>cmake_study</span></span>
<span class="line"><span>    |</span></span>
<span class="line"><span>    |__bin</span></span>
<span class="line"><span>    |__build</span></span>
<span class="line"><span>    |__src</span></span>
<span class="line"><span>    |__test</span></span>
<span class="line"><span>        |__inc</span></span>
<span class="line"><span>        |   |__test1.h</span></span>
<span class="line"><span>        |__lib</span></span>
<span class="line"><span>            |__test2.lib</span></span>
<span class="line"><span>            |__tets2.dll</span></span>
<span class="line"><span>   cmakelist.txt</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-cmake line-numbers-mode" data-ext="cmake" data-title="cmake"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span># 输出bin文件路径</span></span>
<span class="line"><span>set(EXECUTABLE_OUTPUT_PATH \${PROJECT_SOURCE_DIR}/bin)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 将源代码添加到变量</span></span>
<span class="line"><span>set(src_list \${PROJECT_SOURCE_DIR}/src/main.c)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 添加头文件搜索路径</span></span>
<span class="line"><span>include_directories(\${PROJECT_SOURCE_DIR}/testFunc/inc)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 在指定路径下查找库，并把库的绝对路径存放到变量里</span></span>
<span class="line"><span>find_library(TESTFUNC_LIB testFunc HINTS \${PROJECT_SOURCE_DIR}/testFunc/lib)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 执行源文件</span></span>
<span class="line"><span>add_executable(main \${src_list})</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 把目标文件与库文件进行链接</span></span>
<span class="line"><span>target_link_libraries(main \${TESTFUNC_LIB})</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>PRIVATE 关键字表明 fmt 仅在生成 HelloWorld 时需要，不应传播到其他依赖项目</p><h3 id="cmake-命令速览" tabindex="-1"><a class="header-anchor" href="#cmake-命令速览"><span>cmake 命令速览</span></a></h3><p>cmake -Bbuild -GNinja -S. 以ninja生成 以 当前目录为源码 构建目录为build(如果没有就新建)</p><p>cmake -Bbuild -GNinja -S.. 在build文件夹下执行</p><p>ninja 在build文件夹下执行</p>`,33)]))}const c=n(l,[["render",p],["__file","index.html.vue"]]),r=JSON.parse('{"path":"/article/jaovy4gg/","title":"搭建vscode-cpp环境","lang":"zh-CN","frontmatter":{"title":"搭建vscode-cpp环境","createTime":"2024/07/03 21:23:38","permalink":"/article/jaovy4gg/","description":"VSCode 搭建cpp环境 准备工作 1.下载VScode 2.Windows环境下载mingw64 下载链接 3.解压缩x86-64 w64-mingw32 4.D:\\\\workfile\\\\gcc15\\\\x86_64-w64-mingw32\\\\bin与 D:\\\\workfile\\\\gcc15\\\\x86_64-w64-mingw32\\\\lib D:\\\\workfile...","head":[["meta",{"property":"og:url","content":"https://github.com/Yuzhiy05/Yuzhiy05.github.io/article/jaovy4gg/"}],["meta",{"property":"og:site_name","content":"Yuzhiy"}],["meta",{"property":"og:title","content":"搭建vscode-cpp环境"}],["meta",{"property":"og:description","content":"VSCode 搭建cpp环境 准备工作 1.下载VScode 2.Windows环境下载mingw64 下载链接 3.解压缩x86-64 w64-mingw32 4.D:\\\\workfile\\\\gcc15\\\\x86_64-w64-mingw32\\\\bin与 D:\\\\workfile\\\\gcc15\\\\x86_64-w64-mingw32\\\\lib D:\\\\workfile..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-11-03T13:53:48.000Z"}],["meta",{"property":"article:modified_time","content":"2024-11-03T13:53:48.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"搭建vscode-cpp环境\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-11-03T13:53:48.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":2,"title":"准备工作","slug":"准备工作","link":"#准备工作","children":[]},{"level":2,"title":"Cmake搭配Vscode","slug":"cmake搭配vscode","link":"#cmake搭配vscode","children":[{"level":3,"title":"前提介绍","slug":"前提介绍","link":"#前提介绍","children":[]},{"level":3,"title":"构建CmakeLists","slug":"构建cmakelists","link":"#构建cmakelists","children":[]},{"level":3,"title":"创建 CMakePresets.json","slug":"创建-cmakepresets-json","link":"#创建-cmakepresets-json","children":[]}]},{"level":2,"title":"创建一个项目","slug":"创建一个项目","link":"#创建一个项目","children":[]},{"level":2,"title":"cmakelist配置","slug":"cmakelist配置","link":"#cmakelist配置","children":[{"level":3,"title":"生成动态库","slug":"生成动态库","link":"#生成动态库","children":[]},{"level":3,"title":"链接库","slug":"链接库","link":"#链接库","children":[]},{"level":3,"title":"cmake 命令速览","slug":"cmake-命令速览","link":"#cmake-命令速览","children":[]}]}],"readingTime":{"minutes":3.86,"words":1157},"git":{"createdTime":1730642028000,"updatedTime":1730642028000,"contributors":[{"name":"ImoutoCon1999","email":"ImoutoCon1999@outlook.com","commits":1}]},"autoDesc":true,"filePathRelative":"notes/2.tets2/搭建vscode-cpp环境.md","categoryList":[{"id":"4358b5","sort":10000,"name":"notes"},{"id":"9f6575","sort":2,"name":"tets2"}],"bulletin":false}');export{c as comp,r as data};