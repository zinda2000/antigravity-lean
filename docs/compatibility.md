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
