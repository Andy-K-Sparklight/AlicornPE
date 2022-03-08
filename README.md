# Alicorn Pocket Edition

携带版迷你 Alicorn。

## 为什么我们又需要一个新的启动器？

Alicorn JE运行得很漂亮，但是她太大了。通常而言，人们喜欢一个可随身携带的小型启动器，并且只是想玩一玩 Vanilla 服务器，而不需要如此多的其它功能。为此，我们设计了 Alicorn PE。

## 构建

Alicorn PE 比 Alicorn JE 的构建要求更高：

- 构建 Alicorn PE 可以使用任意机器，但是 Alicorn PE 使用 Clicorn 作为底层支持，它的编译只能在一台 GNU/Linux 机器上完成。

- Node.js，没有明确版本要求，但越新越好

- 较快的网络连接

- Git

- Zip

Alicorn JE 不官方支持 macOS，因此 Alicorn PE 也不支持。

Alicorn PE 总是和 Clicorn 一起构建，因此，请在继续之前，阅读 [Clicorn](https://github.com/Andy-K-Sparklight/Clicorn.git) 中的相关内容。

### 构建 Alicorn PE

1. 克隆本仓库和 [Clicorn](https://github.com/Andy-K-Sparklight/Clicorn.git)：
   
   ```shell
   git clone https://github.com/Andy-K-Sparklight/AlicornPE.git
   git clone https://github.com/Andy-K-Sparklight/Clicorn.git
   ```

2. 安装依赖和构建：
   
   ```shell
   cd AlicornPE
   yarn
   yarn release
   yarn pack
   mv out/pack.zip ../Clicorn/
   cd ..
   ```
   
   这会生成最终编译所需要的文件。
