---
title: wsl使用
createTime: 2025/04/07 20:40:23
permalink: /article/8b43ygth/
---


### wsl2/linux使用踩坑


记录一些学到的linux命令

```bash
#linux 更新

sudo apt update&& apt upgrade

#ps(process status) 查看进程状态的命令
ps -ef | grep apt
ps -ef| grep dpkg
#查看
#lsof(list open files) 查看进程打开的文件，打开文件的进程端口
sudo lsof /var/lib/dpkg/lock  
sudo lsof /var/lib/dpkg/lock-frontend
#有些时候dpkg被其他进程占用导致上锁，查看占用进程 根据报错查看文件占用

#添加非官方源的包存储库
sudo add-apt-repository ppa:xtradeb/apps -y

#安装apt-fast多线程下载工具
sudo apt install axel
sudo add-apt-repository ppa:apt-fast/stable
sudo apt -y install apt-fast 
#中间配置后
sudo nano /etc/apt-fast.conf
MIRRORS=('')
#镜像地址

echo 'export PATH="/home/yuzhiy/tool/llvm20/bin:$PATH"' >> ~/.bashrc

echo 'export LD_LIBRARY_PATH=~/tools/x86_64-linux-gnu/runtimes/lib:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
//下载glibc,glibc版本不够时下载编译升级，还没搞完
wget https://mirrors.aliyun.com/gnu/glibc/glibc-2.38.tar.

#解压 参数
x 解压
z 对应gzip
v 显示过程
f 压缩文件的名字 
tar -zxvf  

tar -xvf file.tar //解压 tar包

tar -xzvf file.tar.gz //解压tar.gz

tar -xjvf file.tar.bz2   //解压 tar.bz2

tar -xZvf file.tar.Z   //解压tar.Z

unrar e file.rar //解压rar

unzip file.zip //解压zip
```

## 配环境
### 安装llvm工具链

用<https://apt.llvm.org/>的脚本，注意安装的时候装全部
```sh
#测试的时候指定版本就算你只下了一个版本
clang++-20 --version
#写一个main测试一下
clang++-20 main.cpp -o main -std=c++23 -stdlib=libc++ -fuse-ld=lld -lc++ 
#下面这些参数都是可选项-v，是--verbose 报错的时候详细查看执行了哪些命令
-rtlib=compiler-rt -unwindlib=libunwind  -lc++abi -lunwind -v
# 安装的时候要是没 指定all，可能导致少一些组件
sudo ./llvm.sh <version number> all #少这个all
这时候可以手动装
```

### 安装git 对Ubuntu系统来说,添加包源在apt能装上最新的。ubuntu直接apt install有的包太老了
```sh
 add-apt-repository ppa:git-core/ppa
 apt update; apt install git
 #测试一下
git --version
```

### 安装cmake
在wsl装cmake 用wget有时候443 .直接在本机下在通过文件管理器复制到对应文件下。
然后执行
```sh
wget https://github.com/Kitware/CMake/releases/download/v4.0.1/cmake-4.0.1-linux-x86_64.sh
#或者这是为了解决443问题，不过我试了没什么用
 wget --user-agent="Mozilla/5.0" https://github.com/Kitware/CMake/releases/download/v4.0.1/cmake-4.0.1-linux-x86_64.sh
# 路径指定/usr/local 或者/usr都行都是系统路径都能找到
  sh cmake-4.0.1-linux-x86_64.sh --prefix=/usr/local --exclude-subdir
#测试一下
  cmake --version
```

### 安装ninja
注意ninja包叫ninja-build就行，光输ninja找不到包。不过包有些老1.10.1，最新都1.12了凑合用。不过ninja不管在linux或win上都是一个可执行文件可以直接解压完扔/usr/bin 或者/usr/local/bin 里，也不用包管理了
```sh
apt install ninja-build
```


以上除了cmake都是用apt包管理安装的，卸载的时候直接`sudo apt remove <包名>` 就行。cmake怎么删我还没不知道

### 配ssh
为了在Windows上远程链接wsl或者虚拟机得配ssh链接。
#### 在虚拟机/wsl下
虚拟机一般都装了网络工具，如果ifconfig -a不起作用就装一个
```bash
sudo apt install  net-tools 

ifconfig -a
#显示以下内容
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.31.94.122  netmask 255.255.240.0  broadcast 172.31.95.255
        inet6 fe80::215:5dff:fedf:adaa  prefixlen 64  scopeid 0x20<link>
        ether 00:15:5d:df:ad:aa  txqueuelen 1000  (Ethernet)
        RX packets 46384  bytes 91260644 (91.2 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 25980  bytes 2221307 (2.2 MB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 128  bytes 12099 (12.0 KB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 128  bytes 12099 (12.0 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
# 只需要inet后的ip地址 172.31.94.122 就好
```

安装openssh-server
```bash
sudo apt install openssh-server 
#安装ssh

sudo  service  sshd  start
#（启动 ssh）

sudo service ssh --full-restartd 
#修改配置文件后重启ssh

sudo systemctl enable ssh  
#设置自动启动

sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup 
#备份设置

sudo nano /etc/ssh/sshd_config
#将下列内容复制其中
Port 22 
UsePrivilegeSeparation no 
PasswordAuthentication yes 
PermitRootLogin yes 
AllowUsers yuzhiy 
RSAAuthentication yes 
PubKeyAUthentication yes
#注意AllowUsers 后面是本地登录的用户名我是 yuzhiy
```
安装完成后用ssh生成密钥
注意用新算法ed25519，不要用rsa了.后跟GitHub的邮箱
```bash
ssh-keygen -t ed25519 -C "ImoutoCon1999@outlook.com"
```
连续三次回车即可，第一次问你私钥路径，不搞什么幺蛾子都放默认路径里
```bash
Enter file in which to save the key  (/home/yuzhiy/.ssh/id_ed25519):
```
第二次问你 这个私钥要不要加密码 一般是不加直接回车
```bash
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```
然后显示你的公钥路径和公钥内容
```bash
Your public key has been saved in /home/yuzhiy/.ssh/id_ed25519.pub
The key fingerprint is:
xxxx一堆乱起八糟公钥
```
直接把公钥复制到
`github主页`>>`setting(设置)`>>`SSH and GPG keys`里`new SSH key`

测试一下
```bash
ssh -T git@github.com
#显示如下内容就没啥问题了
Hi Yuzhiy05! You've successfully authenticated, but GitHub does not provide shell access.
```
然后直接用git 拉代码 

#### 在本机vscode里
在vscode 里安装微软的SSH插件
Remote-SSH
Remote-SSH:Editing Configuration Files
Remote EXplorer

ctrl+shift+p 打开命令面板
找到remote-ssh插件 Open Configuration File 
当然可以在C:User/<用户名>/.ssh/config 直接打开
复制以下内容,直接在文件资源管理器里打开可能需要管理员权限
```sh
Host Ubuntu-WSL 
    HostName 172.31.x.xxx #服务器ip 虚拟机ifconfig那个
    User yuzhiy # 服务器上的用户名
    Port 22 # ssh端口，一般默认22， 可以修改
```
在vscode的设置json中复制以下内容
```json
"remote.SSH.remotePlatform":{
    "ubuntu_remote": "linux"  // 远程连接时，自动选择linux系统，注意和上面的"host"匹配
},
"remote.SSH.useLocalServer":true,  // 使用本地服务器
```
测试一下
```sh
ssh yuzhiy@<ip_address>
#输入密码 链接成功进入命令行界面
```







