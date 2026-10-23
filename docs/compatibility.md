# 兼容性与验证 / Compatibility

## 支持目标
- Antigravity App / agy CLI 的当前插件格式：plugin.json、rules、skills、agents。
- Node.js >=20；Windows、macOS、Linux。
- 路径包含空格和中文时应使用终端引号。
- 不承诺所有旧版 Antigravity 支持相同路径、模型或命令。
- CLI 将插件暂存到自己的目录时，向导目录和 CLI 副本分别管理。
- 不与原生插件安装重复使用；既有同名非向导插件不直接覆盖。
- 文件操作防护针对正常本地配置与意外损坏，不是针对有权限同时修改目录的恶意本地进程的安全沙箱。
- 中断安装可能留下同级锁或暂存目录。先确认没有运行中的安装；备份残留目录后手动整理，不要盲删。

## 实测记录
2026-10-23：Windows，本机 Node 24.22.1 / agy 1.4.5。
安装、重复安装、配置升级、备份、完整性检查、保留修改的卸载、
恶意路径、符号链接保护、取消向导及管道输入由自动化测试验证。
跨平台结果以仓库 Actions 为准，不能将仅配置 CI 视为已经通过。

真实代理遵循程度与节省效果需要用代表性任务单独评估；本项目没有宣称已测得省额度比例。
模型名称和额度分组参考用户提供的界面，安装器不查询账号或额度。

## 官方依据
- [Rules](https://www.antigravity.google/docs/rules/)：合法 trigger、按需加载、规则路径与预算。
- [Plugins](https://www.antigravity.google/docs/plugins)：插件结构与 GitHub/目录安装。
- [Subagents](https://www.antigravity.google/docs/subagents)：model: flash、subagent 与工具列表。
- [Google One AI credits](https://support.google.com/googleone/answer/16287445)：家庭共享权益、额度与 credits 的区别。

20,000 Token 是文档描述的聚合规则预算，不是该插件独享预算。
doctor 校验已安装文件的哈希；请结合 Customizations、CLI /context 检查实际加载。

## Windows EPERM / EBUSY 安装失败
0.1.0 在写完暂存插件后立即重命名目录。Windows 的程序占用或瞬时文件扫描可导致该步骤失败，管理员权限也不一定消除文件共享冲突。
0.1.1 对 EPERM、EACCES、EBUSY 增加有时限的重试；不会强制覆盖正式目录或关闭安全软件。
若仍失败，退出使用该目录的 Antigravity/agy 会话或文件查看器，稍等再重试。持续拒绝访问时检查目录权限，不要盲目删除现有配置。
这类错误无法单凭错误码识别具体占用进程。

本机排查发现：在 plugins 内逐步写入完整插件时，目录移动可反复出现 EPERM；相同内容暂存到 plugins 之外再移入时成功。
0.1.1 将暂存位置移到同一文件系统的插件扫描范围之外，避免扫描器提前接触未完成的插件；具体占用进程未被识别。
实际全局安装已成功，doctor 检查通过，agy plugin list 已将 antigravity-lean 列为 enabled。
