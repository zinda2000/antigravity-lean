# Antigravity Lean

**省额度，也提高效率。** 面向 Google AI Ultra 家庭组用户的 Antigravity 工作流工具包与交互安装向导。

[English](README.en.md) · [下载最新版](https://github.com/zinda2000/antigravity-lean/releases/latest) · [兼容性与验证](docs/compatibility.md)

> **每位家庭成员在自己的电脑上安装。工具不收集账号信息，也不假设能读取全家人的实时额度。**
> 社区项目，与 Google 无隶属关系。无账号登录、无 API Key、无遥测、无后台服务。

### 不只省额度，也让工作更快

Flash 模型通常响应更快，适合代码检索、日志分析、常规修改和按计划执行等任务，能减少等待时间、加快反馈循环。复杂架构设计、疑难排查和关键决策，则交给更强的推理模型。

Antigravity Lean 提倡按任务难度、模型能力和可用额度合理分配工作：简单任务快速完成，复杂任务集中思考，再通过清晰的计划和交接减少重复分析。科学管理模型，既有助于节约额度，也能提高日常开发效率。

实际速度、质量和额度消耗因模型、任务与服务状态而异。

## 30 秒开始

需要 **Node.js 20 或更新版本**（[官方下载](https://nodejs.org/)），以及已经安装的 Antigravity App 或 agy CLI。向导本身不需要 npm install，不需要管理员权限。

**不熟悉 Git：** 下载 [最新 Release](https://github.com/zinda2000/antigravity-lean/releases/latest) 中的 ZIP，完整解压到普通文件夹。Windows 双击 `install.cmd`；macOS/Linux 在该目录执行 `sh install.sh`。

**熟悉 Git：**

```bash
git clone https://github.com/zinda2000/antigravity-lean.git
cd antigravity-lean
node bin/antigravity-lean.mjs
```

向导依次询问语言、安装范围、项目路径（项目安装时）、策略、两组额度状态、模型显示名称，然后展示预览。只有输入 `yes` 才写入配置。额度状态可选 `unknown`；它是手动记录，不能代替 View Usage。

Windows 也可以运行 `.\install.ps1`。若系统策略不允许运行脚本，使用 `install.cmd` 或上面的 Node 命令即可，无需更改系统策略。

## 安装后有什么变化

- 精简常驻规则：定向读文件、控制工具输出、复用检索结果，避免盲目重试。
- 按需规划技能：复杂任务产出计划、任务列表和简洁交接；简单修改直接完成。
- 只读 Flash 探索代理：适合范围较大的代码检索；小任务不强制委派。
- 可调整的模型建议：规划、执行、复核分开设置，用户自行切换模型。
- 安装预览、完整性检查、备份升级，以及保留用户修改的卸载流程。

重新启动 Antigravity 会话，在 **Customizations** 中查看规则、技能和代理。CLI 可对向导输出的安装目录执行 `agy plugin validate "安装目录"`。如果 CLI 没有发现全局目录里的插件，可执行 `agy plugin install "安装目录"` 导入；导入后应重新检查 CLI 实际加载的副本。

## 三种策略

| 策略 | 规划 | 日常执行 | 复核 |
| --- | --- | --- | --- |
| balanced（默认） | Gemini 4 Argon Medium | Gemini 3.8 Flash Medium | 必要时 Claude Sonnet 5.5 Medium |
| gemini-first | Gemini 4 Argon Medium | Gemini 3.8 Flash Medium | Gemini 4 Argon Medium |
| claude-first | Claude Opus 5.5 Medium | Claude Sonnet 5.5 Medium | Claude Sonnet 5.5 Medium |

这些名称来自用户提供的 2026 年 10 月界面，只是可编辑的显示名称，不是通用 API 模型 ID。可用模型以自己的账户为准；更强模型与复核都按需使用，不要求每个任务调用。GPT-OSS 120B (Medium) 可手动选用。

**额度边界：**

- 参考界面将 **Gemini Models** 与 **Claude and GPT models** 分组；不要假设 Claude 与 GPT 之间还有独立池。分组可能随服务变化，请查看自己的 View Usage。
- 同时检查 **Weekly Limit Remaining** 与 **Five Hour Limit Remaining**。五小时显示 100% 不代表周额度已经恢复。
- 工具不自动读取额度、不自动切换模型、不绕过限制。两组均耗尽时等待重置；不会替你启用额外付费额度。
- 标记 Gemini 耗尽时，向导不安装 Flash 探索代理。以后状态恢复，可重新运行向导更新配置。
- 基础用量限制与可分享的 AI credits 是不同概念。家庭共享的实际权益因产品、订阅与地区而异，不承诺每个人的所有基础额度都来自同一个池。[Google One 家庭共享说明](https://support.google.com/googleone/answer/16287445)

## 安装范围与管理

全局安装：`~/.gemini/config/plugins/antigravity-lean/`；项目安装：`<项目>/.agents/plugins/antigravity-lean/`。不会覆盖你的 GEMINI.md、AGENTS.md 或其他插件。

```bash
# 先预览，再确认安装
node bin/antigravity-lean.mjs install --scope global --profile balanced --dry-run
node bin/antigravity-lean.mjs install --scope global --profile balanced --yes

# 项目安装（路径有空格时保留引号）
node bin/antigravity-lean.mjs install --scope project --project "/path/to/project" --yes

# 检查 / 卸载；项目安装时补上 --scope project --project "路径"
node bin/antigravity-lean.mjs doctor
node bin/antigravity-lean.mjs uninstall --dry-run
node bin/antigravity-lean.mjs uninstall --yes
```

`doctor` 只检查所选安装目录的文件完整性；它不能证明代理遵循规则、模型已切换或额度已节省。CLI 用户可结合 `/context` 与 Customizations 检查当前会话实际加载情况。

更新：在源码目录执行 `git pull --ff-only` 后重新运行向导。已有受管理文件未改动时，更新会保留旧版到同级 `.antigravity-lean-backups/`。如有手动修改或额外文件，安装器会拒绝覆盖，先自行备份并整理。卸载只删除校验未变的受管理文件，保留修改和其他文件；备份也会保留。符号链接目录不支持安装。不要同时运行安装与卸载。

## 只要默认配置？原生插件安装

```bash
agy plugin install https://github.com/zinda2000/antigravity-lean
agy plugin list
```

原生入口安装仓库的默认 balanced 配置，不运行向导。**向导安装与原生安装选择一种，避免重复加载。** 原生安装由 `agy plugin uninstall antigravity-lean` 管理；向导的 doctor/卸载只管理向导创建的目录。切换安装方式前，先用原安装方式卸载。

## 开发与反馈

```bash
npm test
agy plugin validate . --strict
npm pack --dry-run
```

零生产依赖。CI 覆盖 Windows、macOS、Linux 与 Node 20/22/24；当前实际运行结果见 [兼容性记录](docs/compatibility.md)。反馈时附系统、Antigravity 版本、安装方式和错误信息，删除账号与私人路径。MIT License。

规则和代理是自然语言指导，不能保证所有模型始终遵循。这里没有宣称“固定节省比例”“350 Tokens”或“100% 兼容旧版本”。
