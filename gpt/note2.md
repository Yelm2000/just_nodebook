# **这是我的codex学习使用笔记**
# Features
## workflow
### 概要
- 在“项目”视图中搜索项目。当您记得某个短语或分支的名称但记不住标题时，可以点击 `Cmd / Ctrl + G` 来搜索相关的聊天记录。
- 快速聊天快捷键：在 macOS 系统上是 `Cmd+Option+N` ，在 Windows 系统上是 `Ctrl+Alt+N` 。
- 引入其他工具和背景信息
  - 当某些**文件或图片**信息与当前请求相关时，可以直接将它们附加到聊天中。
  - 安装**插件**以引入来自其他服务的上下文信息和操作功能。
  - 当您的组织或开发人员通过模型上下文协议提供了相关工具时，请配置 **MCP 服务器**。
  - 如果有的话，可以利用**记忆**来将过去工作中的有用信息带入未来的对话中。
### `@Sites` 
- 允许 ChatGPT 创建、托管、优化并分享网站、网络应用程序和游戏
### @Visualize
- 可以将问题、想法和信息转化为图表、地图、示意图、计算器、模拟程序以及互动式解释
- 在请求中明确说明结果、来源材料、问题以及有用的互动信息。可以参考这个例子：
- @Visualize 供需如何决定市场价格。让我移动每条曲线，标记均衡，并解释价格和数量是如何变化的。供需如何决定市场价格。让我移动每条曲线，标记均衡，并解释价格和数量是如何变化的。
- 告诉 ChatGPT 应该使用哪些信息来进行翻译，比如聊天中的内容、粘贴的数据、附件，或者任何可用的数据源
### Scheduled tasks  预定的任务
- 直接和gpt说要设置一个定时任务就行
- 所有的预定任务在已安排里面
- 设置任务：界面设置或者按设置（⚙️）图标输入RRULE:FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0
- 当希望将定时任务产生的变更与未完成的本地工作分离时，可以使用工作树。
  - 而当希望定时任务直接在主目录中执行时，则可以使用本地模式。
  - 在不需要版本控制的项目中，定时任务可以直接在项目目录中执行。
  - 而且，同一个定时任务可以在多个项目中同时运行。
- 本质就是定了闹钟，发送提示语，所以可以单独开个窗口检查提示语对不对
- 使用 $skill-name 来在定时任务提示中显式地触发某个技能
### Long-running work  长期持续的工作（/paln、/goal）
- 对于需要多个步骤才能完成的工作，给 ChatGPT 一个明确的 **结果、约束条件以及完成工作** 的标准。将相关的工作放在同一个聊天环境中，这样 ChatGPT 就可以利用相同的上下文来决定下一步的行动，并判断工作是否已完成。
- 在 ChatGPT 桌面应用中，输入 /goal 即可进入目标模式。进度条允许你在 ChatGPT 运行期间暂停、继续、编辑或清除目标任务。
- 结果仍然不清楚，就从 /plan 开始吧。让 ChatGPT 对你进行访谈，找出其中的限制因素，然后将结果转化为具有可衡量成功标准的目标。接着用 /goal 来制定更详细的目标。
### Notifications  通知/提示
- 通知功能可以让你知道哪些工作需要立即处理。这些通知的控制和发送渠道会根据不同的界面而有所不同。
### Codex Micro  代码微
- 一个操作gpt的键盘工具
## 能力
### @Browser 浏览器
- ChatGPT 桌面应用程序内置的浏览器功能。
  内置的浏览器使用的是与常规浏览器不同的浏览器配置文件。它不会自动共享你的现有标签页或浏览器会话信息。
  当任务需要登录时，你可以直接进行登录。
  打开“设置”>“浏览器”，可以管理浏览器数据以及设备上可用的配置文件导入功能。
### Computer Use  计算机使用
- 通过使用计算机，ChatGPT 可以在 macOS 或 Windows 操作系统上查看和操作图形用户界面。它可以用于那些命令行工具或结构化集成工具无法满足的任务，比如检查桌面应用程序、使用浏览器、修改应用程序设置、处理无法作为插件使用的数据源，或者修复仅在图形用户界面中出现的错误。
- @Computer or @AppName
### Plugins  插件
- Skills+Connectors+MCP servers+Browser extensions+Hooks+Scheduled task templates
- @插件名
### Web search  网络搜索
- 当您的任务需要依赖最新信息时，请使用实时搜索功能。在 config.toml 中设置 web_search = "live" ，在 web_search = "disabled" 中设置该工具的运行状态，使其处于关闭状态。在 "indexed" 模式下，只有在搜索索引满足特定条件时，才允许外部网络访问。当 Codex 以完全访问权限运行时，网络搜索将默认使用实时结果。
### Image generation  图像生成
- $imagegen
### Image inputs  图像输入
-在按住 Shift 的同时，将图片拖入提示生成器以将其作为上下文信息
### Appshots  应用截图
- mac才能用，快捷键即可截屏
### Chrome extension  Chrome 扩展程序
- 使用 Chrome 扩展程序，让 ChatGPT 控制你的 Chrome 浏览器。ChatGPT 可以访问你已经登录过的网站，如 LinkedIn、Salesforce、Gmail，或是企业内部工具。
- Cmd+Shift+.：在您正在查看的页面旁边打开 ChatGPT，可以对该页面进行提问，或者继续处理需要利用其上下文以及本地文件和关联应用程序的任务。当任务需要上下文信息时，ChatGPT 可以使用您打开的标签页中的上下文数据。
### Work with files  处理文件
## reference 参考内容
### Commands  命令
- 快捷键：Ctrl +/查看快捷键
- 深层链接：codex://
### Slash commands  快捷命令
- 快捷命令允许你在不离开聊天界面的情况下执行各种操作。可用的命令会根据你的环境和权限而有所不同。
- 即/ $
### Settings 设置
### Troubleshooting  故障排除

# Configuration   配置
- 配置决定了 ChatGPT 以及 Codex 开发工具在聊天、代码仓库和机器上的行为方式。持久化的上下文存储、配置文件、仓库管理功能、子代理、外部连接以及 Windows 系统设置等因素共同协作，使得这些工作流程能够保持一致，无论是对个人还是团队来说都是如此。
## Customization  定制化
- 在 Codex 中，自定义功能是由多个相互协作的组件共同实现的：
  - 项目指导方针（ AGENTS.md ）：用于持续性的指示操作。
  - 记忆信息（Meories）：从以往的工作中获得的、有助于理解当前情境
  - Skills：适用于可重复使用工作流程的技能以及领域专业知识
  - MCP：用于访问外部工具和共享系统的 MCP
  - Subagents ：负责将工作分配给专业子代理的代理人员
- AGENTS.md 决定了行为，Meories传递了局部上下文信息；Skills实现了可重复的过程；MCP 将 Codex 与局部工作空间之外的系统连接起来。
- AGENTS Guidance：AGENTS.md 提供了耐用的项目指导文档，该文档会随你的仓库一起保存，并在代理程序开始工作之前生效。请尽量保持文档的简短性。
  - 可以包括：
    - 构建和测试命令
    - 审查预期目标
    - 回购协议特定条款规范
    - 针对特定目录的说明/指导等
  -  何时更新 AGENTS.md
    - 反复犯错
    - 阅读量过大：如果系统能够找到正确的文件，但同时读取了过多的文档，那么就需要增加路由指导功能（明确哪些目录/文件应该优先处理）。
    - 在 GitHub 上：在拉取请求评论中，给 @codex 加上一个标签，不用自己打开 AGENTS.md 手工修改，可以直接在 PR 评论里命令 Codex 把这次经验整理进去。
    - 自动化漂移检查：使用定时任务来定期执行检查（例如每天一次），以发现指导中的漏洞，检查最近的代码改动和 PR，寻找 AGENTS.md 中已经过时、缺失或者反复被人工纠正的规则，并提出应该新增或修改哪些 AGENTS.md 内容。
- Skills：为 Codex 提供了可重复使用的功能。因为技能能够支持更丰富的指令、脚本和引用，同时还能在多个任务中重复使用。因为技能能够支持更丰富的指令、脚本和引用，同时还能在多个任务中重复使用。技能会被加载到系统中，并能被代理识别（至少包括其元数据），因此 Codex 可以自动发现并选择这些技能。这样就能在不增加过多上下文信息的情况下，实现复杂的工作流程。
- MCP：当工作流程需要依赖外部系统时（如线性系统、GitHub、文档服务器、设计工具等），MCP 就派上用场了。
- Subagents：当您准备好将那些需要大量精力或技术性的任务委托给下属代理人时，就可以这样做。
## Memory 记忆
- 在 ChatGPT 桌面应用中，可以使用 /memories 来选择聊天会话是使用本地存储的数据，还是会生成新的记忆。当您需要开启或关闭此功能时，可以通过设置中的“个性化”选项来进行管理。
- “Chronicle”是一个仅适用于桌面的功能，它能够帮助 Codex 从屏幕上恢复最近的工作环境，从而重建内存中的相关信息。
- 可以使用 /memories 来控制当前聊天的内存使用行为。在聊天层面，你可以决定当前聊天是否可以使用已有的记忆数据，以及 Codex 是否可以利用该聊天记录来生成新的记忆内容。
## Chronicle  编年史

# Config file 配置文件
## Config basics 配置基础知识
- .codex/config.toml
- 配置优先级:
  - CLI 标志和 --config 覆盖选项
  - 项目配置文件： .codex/config.toml ，按照从项目根目录到当前工作目录的顺序排列（最近的位置优先；仅适用于受信任的项目）
  - 已选择用于存储个人资料的配置文件，文件编号为 --profile profile-name （ ~/.codex/profile-name.config.toml ）
  - 用户配置： ~/.codex/config.toml
  - 系统配置（如果存在）： /etc/codex/config.toml 在 Unix 系统上
  - 内置默认设置
  - 可以理解为有很多配置选项，chatgpt会按照进入处理文件的顺序加载配置文件，覆盖对应配置选项
- 常见的配置选项
  - 默认模型：model = "gpt-5.6"
  - 审批提示：approval_policy = "on-request"
  - 沙盒等级：sandbox_mode = "workspace-write"
  - 权限配置文件：Codex 还支持名为“权限配置文件”的功能，这些配置文件可用于管理可重复使用的文件系统和网络策略。内置的配置文件分别是 :read-only 、 :workspace 和 :danger-full-access 。自定义配置文件则使用 [permissions.<name>] 表，并关联相应的 default_permissions 值。更多关于权限配置的信息，请参考相关章节。
  - Windows 沙盒模式：[windows] sandbox = "elevated"。在 Windows 操作系统上运行 Codex 时，请将在 windows 表中设置的原生沙盒模式改为 elevated 。只有当你没有管理员权限或者提升权限后的安装失败时，才使用 unelevated 模式
  - 网络搜索模式：web_search = "cached" 
    - "cached" （默认设置）会从网络搜索缓存中获取结果。
    - "indexed" 仅在搜索索引处理完请求后，才允许外部网络访问。
    - "live" 可以从网络上获取最新数据（与 --search 相同）。
    - "disabled" 会关闭网络搜索工具
  - Reasoning effort  推理努力：model_reasoning_effort = "high"，观察在获得支持时，模型会投入多少推理努力来解决问题。
  - 沟通方式：personality = "friendly" # or "pragmatic" or "none"
  - TUI 键位映射：就是快捷键
  - 命令环境：可以控制 Codex 发送给所生成的命令的各种环境变量。使用带有键的过滤器功能，只保留你需要的那些变量。
    - [shell_environment_policy]
      ignore_default_excludes = false
      [shell_environment_policy.filters]
      "PATH" = "include"
      "HOME" = "include"
  - ignore_default_excludes 默认设置为 true ，这样就会跳过对包含 KEY 、 SECRET 或 TOKEN 的变量名进行自动过滤的操作。当你需要这种自动过滤功能时，可以将变量名设置为 false 。关于排除规则、优先级以及旧版配置的相关信息，请参阅 Shell 环境策略。
- 日志目录：log_dir = "/absolute/path/to/codex-logs"
- 特性标志：可以使用 config.toml 中的 [features] #表格来切换可选功能与实验性功能。
## Advanced Configuration  高级配置








































