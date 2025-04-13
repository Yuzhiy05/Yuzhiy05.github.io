import{_ as a,c as n,a as e,o as i}from"./app-DBJb0S1i.js";const l={};function p(t,s){return i(),n("div",null,s[0]||(s[0]=[e(`<h3 id="wsl2-linux使用踩坑" tabindex="-1"><a class="header-anchor" href="#wsl2-linux使用踩坑"><span>wsl2/linux使用踩坑</span></a></h3><p>记录一些学到的linux命令</p><div class="language-bash line-numbers-mode" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>#linux 更新</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sudo apt update&amp;&amp; apt upgrade</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#ps(process status) 查看进程状态的命令</span></span>
<span class="line"><span>ps -ef | grep apt</span></span>
<span class="line"><span>ps -ef| grep dpkg</span></span>
<span class="line"><span>#查看</span></span>
<span class="line"><span>#lsof(list open files) 查看进程打开的文件，打开文件的进程端口</span></span>
<span class="line"><span>sudo lsof /var/lib/dpkg/lock  </span></span>
<span class="line"><span>sudo lsof /var/lib/dpkg/lock-frontend</span></span>
<span class="line"><span>#有些时候dpkg被其他进程占用导致上锁，查看占用进程 根据报错查看文件占用</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#添加非官方源的包存储库</span></span>
<span class="line"><span>sudo add-apt-repository ppa:xtradeb/apps -y</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#安装apt-fast多线程下载工具</span></span>
<span class="line"><span>sudo apt install axel</span></span>
<span class="line"><span>sudo add-apt-repository ppa:apt-fast/stable</span></span>
<span class="line"><span>sudo apt -y install apt-fast </span></span>
<span class="line"><span>#中间配置后</span></span>
<span class="line"><span>sudo nano /etc/apt-fast.conf</span></span>
<span class="line"><span>MIRRORS=(&#39;&#39;)</span></span>
<span class="line"><span>#镜像地址</span></span>
<span class="line"><span></span></span>
<span class="line"><span>echo &#39;export PATH=&quot;/home/yuzhiy/tool/llvm20/bin:$PATH&quot;&#39; &gt;&gt; ~/.bashrc</span></span>
<span class="line"><span></span></span>
<span class="line"><span>echo &#39;export LD_LIBRARY_PATH=~/tools/x86_64-linux-gnu/runtimes/lib:$LD_LIBRARY_PATH&#39; &gt;&gt; ~/.bashrc</span></span>
<span class="line"><span>source ~/.bashrc</span></span>
<span class="line"><span>//下载glibc,glibc版本不够时下载编译升级，还没搞完</span></span>
<span class="line"><span>wget https://mirrors.aliyun.com/gnu/glibc/glibc-2.38.tar.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>#解压 参数</span></span>
<span class="line"><span>x 解压</span></span>
<span class="line"><span>z 对应gzip</span></span>
<span class="line"><span>v 显示过程</span></span>
<span class="line"><span>f 压缩文件的名字 </span></span>
<span class="line"><span>tar -zxvf  </span></span>
<span class="line"><span></span></span>
<span class="line"><span>tar -xvf file.tar //解压 tar包</span></span>
<span class="line"><span></span></span>
<span class="line"><span>tar -xzvf file.tar.gz //解压tar.gz</span></span>
<span class="line"><span></span></span>
<span class="line"><span>tar -xjvf file.tar.bz2   //解压 tar.bz2</span></span>
<span class="line"><span></span></span>
<span class="line"><span>tar -xZvf file.tar.Z   //解压tar.Z</span></span>
<span class="line"><span></span></span>
<span class="line"><span>unrar e file.rar //解压rar</span></span>
<span class="line"><span></span></span>
<span class="line"><span>unzip file.zip //解压zip</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="配环境" tabindex="-1"><a class="header-anchor" href="#配环境"><span>配环境</span></a></h2><h3 id="安装llvm工具链" tabindex="-1"><a class="header-anchor" href="#安装llvm工具链"><span>安装llvm工具链</span></a></h3><p>用<a href="https://apt.llvm.org/" target="_blank" rel="noopener noreferrer">https://apt.llvm.org/</a>的脚本，注意安装的时候装全部</p><div class="language-sh" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>#测试的时候指定版本就算你只下了一个版本</span></span>
<span class="line"><span>clang++-20 --version</span></span>
<span class="line"><span>#写一个main测试一下</span></span>
<span class="line"><span>clang++-20 main.cpp -o main -std=c++23 -stdlib=libc++ -fuse-ld=lld -lc++ </span></span>
<span class="line"><span>#下面这些参数都是可选项-v，是--verbose 报错的时候详细查看执行了哪些命令</span></span>
<span class="line"><span>-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -v</span></span>
<span class="line"><span># 安装的时候要是没 指定all，可能导致少一些组件</span></span>
<span class="line"><span>sudo ./llvm.sh &lt;version number&gt; all #少这个all</span></span>
<span class="line"><span>这时候可以手动装</span></span></code></pre></div><h3 id="安装git-对ubuntu系统来说-添加包源在apt能装上最新的。ubuntu直接apt-install有的包太老了" tabindex="-1"><a class="header-anchor" href="#安装git-对ubuntu系统来说-添加包源在apt能装上最新的。ubuntu直接apt-install有的包太老了"><span>安装git 对Ubuntu系统来说,添加包源在apt能装上最新的。ubuntu直接apt install有的包太老了</span></a></h3><div class="language-sh" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span> add-apt-repository ppa:git-core/ppa</span></span>
<span class="line"><span> apt update; apt install git</span></span>
<span class="line"><span> #测试一下</span></span>
<span class="line"><span>git --version</span></span></code></pre></div><h3 id="安装cmake" tabindex="-1"><a class="header-anchor" href="#安装cmake"><span>安装cmake</span></a></h3><p>在wsl装cmake 用wget有时候443 .直接在本机下在通过文件管理器复制到对应文件下。 然后执行</p><div class="language-sh" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>wget https://github.com/Kitware/CMake/releases/download/v4.0.1/cmake-4.0.1-linux-x86_64.sh</span></span>
<span class="line"><span>#或者这是为了解决443问题，不过我试了没什么用</span></span>
<span class="line"><span> wget --user-agent=&quot;Mozilla/5.0&quot; https://github.com/Kitware/CMake/releases/download/v4.0.1/cmake-4.0.1-linux-x86_64.sh</span></span>
<span class="line"><span># 路径指定/usr/local 或者/usr都行都是系统路径都能找到</span></span>
<span class="line"><span>  sh cmake-4.0.1-linux-x86_64.sh --prefix=/usr/local --exclude-subdir</span></span>
<span class="line"><span>#测试一下</span></span>
<span class="line"><span>  cmake --version</span></span></code></pre></div><h3 id="安装ninja" tabindex="-1"><a class="header-anchor" href="#安装ninja"><span>安装ninja</span></a></h3><p>注意ninja包叫ninja-build就行，光输ninja找不到包。不过包有些老1.10.1，最新都1.12了凑合用。不过ninja不管在linux或win上都是一个可执行文件可以直接解压完扔/usr/bin 或者/usr/local/bin 里，也不用包管理了</p><div class="language-sh" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>apt install ninja-build</span></span></code></pre></div><p>以上除了cmake都是用apt包管理安装的，卸载的时候直接<code>sudo apt remove &lt;包名&gt;</code> 就行。cmake怎么删我还没不知道</p><h3 id="配ssh" tabindex="-1"><a class="header-anchor" href="#配ssh"><span>配ssh</span></a></h3><p>为了在Windows上远程链接wsl或者虚拟机得配ssh链接。</p><h4 id="在虚拟机-wsl下" tabindex="-1"><a class="header-anchor" href="#在虚拟机-wsl下"><span>在虚拟机/wsl下</span></a></h4><p>虚拟机一般都装了网络工具，如果ifconfig -a不起作用就装一个</p><div class="language-bash line-numbers-mode" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>sudo apt install  net-tools </span></span>
<span class="line"><span></span></span>
<span class="line"><span>ifconfig -a</span></span>
<span class="line"><span>#显示以下内容</span></span>
<span class="line"><span>eth0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500</span></span>
<span class="line"><span>        inet 172.31.94.122  netmask 255.255.240.0  broadcast 172.31.95.255</span></span>
<span class="line"><span>        inet6 fe80::215:5dff:fedf:adaa  prefixlen 64  scopeid 0x20&lt;link&gt;</span></span>
<span class="line"><span>        ether 00:15:5d:df:ad:aa  txqueuelen 1000  (Ethernet)</span></span>
<span class="line"><span>        RX packets 46384  bytes 91260644 (91.2 MB)</span></span>
<span class="line"><span>        RX errors 0  dropped 0  overruns 0  frame 0</span></span>
<span class="line"><span>        TX packets 25980  bytes 2221307 (2.2 MB)</span></span>
<span class="line"><span>        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0</span></span>
<span class="line"><span></span></span>
<span class="line"><span>lo: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536</span></span>
<span class="line"><span>        inet 127.0.0.1  netmask 255.0.0.0</span></span>
<span class="line"><span>        inet6 ::1  prefixlen 128  scopeid 0x10&lt;host&gt;</span></span>
<span class="line"><span>        loop  txqueuelen 1000  (Local Loopback)</span></span>
<span class="line"><span>        RX packets 128  bytes 12099 (12.0 KB)</span></span>
<span class="line"><span>        RX errors 0  dropped 0  overruns 0  frame 0</span></span>
<span class="line"><span>        TX packets 128  bytes 12099 (12.0 KB)</span></span>
<span class="line"><span>        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0</span></span>
<span class="line"><span># 只需要inet后的ip地址 172.31.94.122 就好</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>安装openssh-server</p><div class="language-bash line-numbers-mode" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>sudo apt install openssh-server </span></span>
<span class="line"><span>#安装ssh</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sudo  service  sshd  start</span></span>
<span class="line"><span>#（启动 ssh）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sudo service ssh --full-restartd </span></span>
<span class="line"><span>#修改配置文件后重启ssh</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sudo systemctl enable ssh  </span></span>
<span class="line"><span>#设置自动启动</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup </span></span>
<span class="line"><span>#备份设置</span></span>
<span class="line"><span></span></span>
<span class="line"><span>sudo nano /etc/ssh/sshd_config</span></span>
<span class="line"><span>#将下列内容复制其中</span></span>
<span class="line"><span>Port 22 </span></span>
<span class="line"><span>UsePrivilegeSeparation no </span></span>
<span class="line"><span>PasswordAuthentication yes </span></span>
<span class="line"><span>PermitRootLogin yes </span></span>
<span class="line"><span>AllowUsers yuzhiy </span></span>
<span class="line"><span>RSAAuthentication yes </span></span>
<span class="line"><span>PubKeyAUthentication yes</span></span>
<span class="line"><span>#注意AllowUsers 后面是本地登录的用户名我是 yuzhiy</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>安装完成后用ssh生成密钥 注意用新算法ed25519，不要用rsa了.后跟GitHub的邮箱</p><div class="language-bash" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>ssh-keygen -t ed25519 -C &quot;ImoutoCon1999@outlook.com&quot;</span></span></code></pre></div><p>连续三次回车即可，第一次问你私钥路径，不搞什么幺蛾子都放默认路径里</p><div class="language-bash" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>Enter file in which to save the key  (/home/yuzhiy/.ssh/id_ed25519):</span></span></code></pre></div><p>第二次问你 这个私钥要不要加密码 一般是不加直接回车</p><div class="language-bash" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>Enter passphrase (empty for no passphrase):</span></span>
<span class="line"><span>Enter same passphrase again:</span></span></code></pre></div><p>然后显示你的公钥路径和公钥内容</p><div class="language-bash" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>Your public key has been saved in /home/yuzhiy/.ssh/id_ed25519.pub</span></span>
<span class="line"><span>The key fingerprint is:</span></span>
<span class="line"><span>xxxx一堆乱起八糟公钥</span></span></code></pre></div><p>直接把公钥复制到 <code>github主页</code>&gt;&gt;<code>setting(设置)</code>&gt;&gt;<code>SSH and GPG keys</code>里<code>new SSH key</code></p><p>测试一下</p><div class="language-bash" data-ext="bash" data-title="bash"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>ssh -T git@github.com</span></span>
<span class="line"><span>#显示如下内容就没啥问题了</span></span>
<span class="line"><span>Hi Yuzhiy05! You&#39;ve successfully authenticated, but GitHub does not provide shell access.</span></span></code></pre></div><p>然后直接用git 拉代码</p><h4 id="在本机vscode里" tabindex="-1"><a class="header-anchor" href="#在本机vscode里"><span>在本机vscode里</span></a></h4><p>在vscode 里安装微软的SSH插件 Remote-SSH Remote-SSH:Editing Configuration Files Remote EXplorer</p><p>ctrl+shift+p 打开命令面板 找到remote-ssh插件 Open Configuration File 当然可以在C:User/&lt;用户名&gt;/.ssh/config 直接打开 复制以下内容,直接在文件资源管理器里打开可能需要管理员权限</p><div class="language-sh" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>Host Ubuntu-WSL </span></span>
<span class="line"><span>    HostName 172.31.x.xxx #服务器ip 虚拟机ifconfig那个</span></span>
<span class="line"><span>    User yuzhiy # 服务器上的用户名</span></span>
<span class="line"><span>    Port 22 # ssh端口，一般默认22， 可以修改</span></span></code></pre></div><p>在vscode的设置json中复制以下内容</p><div class="language-json" data-ext="json" data-title="json"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">remote.SSH.remotePlatform</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">:</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">{</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">    &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">ubuntu_remote</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">linux</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">  // 远程连接时，自动选择linux系统，注意和上面的&quot;host&quot;匹配</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">}</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">,</span></span>
<span class="line"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">remote.SSH.useLocalServer</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">:</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;">true</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE;">,  </span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;">// 使用本地服务器</span></span></code></pre></div><p>测试一下</p><div class="language-sh" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>ssh yuzhiy@&lt;ip_address&gt;</span></span>
<span class="line"><span>#输入密码 链接成功进入命令行界面</span></span></code></pre></div>`,43)]))}const c=a(l,[["render",p],["__file","index.html.vue"]]),r=JSON.parse('{"path":"/article/8b43ygth/","title":"wsl使用","lang":"zh-CN","frontmatter":{"title":"wsl使用","createTime":"2025/04/07 20:40:23","permalink":"/article/8b43ygth/","description":"wsl2/linux使用踩坑 记录一些学到的linux命令 配环境 安装llvm工具链 用https://apt.llvm.org/的脚本，注意安装的时候装全部 安装git 对Ubuntu系统来说,添加包源在apt能装上最新的。ubuntu直接apt install有的包太老了 安装cmake 在wsl装cmake 用wget有时候443 .直接在本机...","head":[["meta",{"property":"og:url","content":"https://github.com/Yuzhiy05/Yuzhiy05.github.io/article/8b43ygth/"}],["meta",{"property":"og:title","content":"wsl使用"}],["meta",{"property":"og:description","content":"wsl2/linux使用踩坑 记录一些学到的linux命令 配环境 安装llvm工具链 用https://apt.llvm.org/的脚本，注意安装的时候装全部 安装git 对Ubuntu系统来说,添加包源在apt能装上最新的。ubuntu直接apt install有的包太老了 安装cmake 在wsl装cmake 用wget有时候443 .直接在本机..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2025-04-13T16:30:20.000Z"}],["meta",{"property":"article:modified_time","content":"2025-04-13T16:30:20.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"wsl使用\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2025-04-13T16:30:20.000Z\\",\\"author\\":[]}"]]},"headers":[{"level":3,"title":"wsl2/linux使用踩坑","slug":"wsl2-linux使用踩坑","link":"#wsl2-linux使用踩坑","children":[]},{"level":2,"title":"配环境","slug":"配环境","link":"#配环境","children":[{"level":3,"title":"安装llvm工具链","slug":"安装llvm工具链","link":"#安装llvm工具链","children":[]},{"level":3,"title":"安装git 对Ubuntu系统来说,添加包源在apt能装上最新的。ubuntu直接apt install有的包太老了","slug":"安装git-对ubuntu系统来说-添加包源在apt能装上最新的。ubuntu直接apt-install有的包太老了","link":"#安装git-对ubuntu系统来说-添加包源在apt能装上最新的。ubuntu直接apt-install有的包太老了","children":[]},{"level":3,"title":"安装cmake","slug":"安装cmake","link":"#安装cmake","children":[]},{"level":3,"title":"安装ninja","slug":"安装ninja","link":"#安装ninja","children":[]},{"level":3,"title":"配ssh","slug":"配ssh","link":"#配ssh","children":[]}]}],"readingTime":{"minutes":4.75,"words":1424},"git":{"createdTime":1744561820000,"updatedTime":1744561820000,"contributors":[{"name":"ImoutoCon1999","email":"ImoutoCon1999@outlook.com","commits":1}]},"autoDesc":true,"filePathRelative":"tools/wsl使用.md","categoryList":[{"id":"4a9315","sort":10001,"name":"tools"}],"bulletin":false}');export{c as comp,r as data};
