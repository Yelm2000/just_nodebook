# 这是我的copilot学习使用笔记
##定制需求
### instructions VS prompts
- **instructions**：提供指导和约束，影响模型的行为和输出。
- **prompts**：提供具体的输入和上下文，指导模型生成特定的回复。

### instructions
- **文件级**：`.github/instructions/NAME.instructions.md`
- **全局级**：`.github/copilot-instructions.md`
- 在文件开头，创建包含 applyTo 关键字的前辅文块。 使用 glob 语法指定指令应用于的文件或目录。
- 示例：
    ```markdown
    ---
    applyTo: "app/models/**/*.rb"
    ---
    ```

### prompts
- **创建方法**：`.github/prompts/filename.prompt.md`
- 示例：
    ```markdown
    ---
    agent: 'ask'
    model: Claude Sonnet 4
    description: 'Perform a REST API security review'
    ---
    Perform a REST API security review and provide a TODO list of security issues to address.
    * Ensure all endpoints are protected by authentication and authorization
    * Validate all user inputs and sanitize data
    * Implement rate limiting and throttling
    * Implement logging and monitoring for security events
    Return the TODO list in a Markdown format, grouped by priority and issue type.
    ```
- **使用方法**
  - 复制
  - 引用
  - /filename
  
### skills
- 内容放在：项目，.github/skills/skill-name/SKILL.md；个人，适用于全体项目，~/.github/skills/skill-name/SKILL.md
    - 技能子目录名称应全部小写，空格用连字符表示。
    - 内容必须包含name和description
    - example
    ```markdown
    ---
    name: my-skill-name
    description: A clear description of what this skill does and when to use it
    ---
    # My Skill Name
    [Add your instructions here that Claude will follow when this skill is active]
    ## Examples
    - Example usage 1
    - Example usage 2
    ## Guidelines
    - Guideline 1
    - Guideline 2
    ```
- 使用方法
    - description：coplot根据md的description来自动把md的内容注入到模型的上下文中
    - name：直接输入“使用/skill-name skill”这样的描述
- instructions适合通用的、简单的情况，skills适合特殊的、复杂的情况，比如需要调动多个指令、脚本和资源的文件夹的情况。
-https://docs.github.com/en/copilot/reference/customization-cheat-sheet

### custom agents
#### Agent profile format
- 代理配置文件是带有 YAML 前置元数据的 Markdown 文件。最简单的形式包含以下内容：
    - Name: A unique identifier for the custom agent.
    - 名称 ：自定义代理的唯一标识符。
    - Description: Explains the agent's purpose and capabilities.
    - 描述 ：解释代理的目的和能力。
    - Prompt: Custom instructions that define the agent's behavior and expertise.
    - 提示 ：定义代理行为和专业知识的自定义指令。
    - Tools (optional): Specific tools the agent can access. By default, agents can access all available tools, including built-in tools and MCP server tools.
    - 工具 （可选）：代理可以访问的特定工具。默认情况下，代理可以访问所有可用工具，包括内置工具和 MCP 服务器工具。
    - 代理配置文件还可以使用 mcp-server 属性包含 MCP 服务器配置。

## coding agent
- **只适用于github环境**
- 借助 Copilot 编码代理，GitHub Copilot 可以在后台独立完成任务，就像人类开发人员一样。
- 要将任务委派给 Copilot 编码代理，您可以：
- 请求 Copilot 创建新的拉取请求
- 在现有拉取请求的评论中提及 @copilot ，即可请求其进行更改。
- 将安全活动中的安全警报分配给 Copilot。


## MCP(模型上下文协议)
- 模型上下文协议 (MCP) 是一种开放标准，它定义了应用程序如何与大型语言模型 (LLM) 共享上下文。
- LLM <-> MCP客户端 <-> MCP服务器(数据源连接器)
- MCP客户端负责判断工具用不用、用什么，发送给客户端要那些数据
### vscode拓展商店里面的MCP服务器（github MCP 注册表） VS 本地mcp.json配置的MCP服务器
- 本质都是通过mcp.json配置要运行的服务器进程（command+args）（、环境）来实现的
- 区别是MCP服务器写好了mcp.json相关的配置
### 可以为agent提供
- Tools：mcp服务器启动后，模型自动选择调用
- Resources：chat添加context时选择MCP Resources；或ctrl+shift+P，MCP: Browse Resources
- Prompts：MCP 服务器的配置以 JSON 文件定义为 mcp服务器名: { "prompts": { "prompt名": { ... }}}，用户通过聊天命令 /mcp服务器名.prompt名 调用具体的功能。
- MCP Apps：获取交互式 UI 组件，例如表单、可视化图表和拖放列表，这些组件可直接在聊天中呈现。https://code.visualstudio.com/blogs/2026/01/26/mcp-apps-support



## Tools
- 工具是让模型能够作用于你的开发环境的机制。没有工具， 语言模型只能生成文本。借助工具， 代理可以读取文件、编写代码、运行终端命令、搜索代码库，并连接外部服务。
- 分类
    - 内置工具：Copilot 代理可以访问的工具，例如文件系统访问、终端命令执行和代码搜索。
    - MCP 服务器工具：通过 MCP 服务器提供的工具，允许代理访问特定于项目的数据源或服务。
    - 扩展工具 ：VS Code 扩展通过语言模型工具 API 贡献的工具。扩展工具深度集成于编辑器中，安装扩展后即可使用。
- 当代理处理任务时，模型会检查可用工具并决定调用哪些工具。


##上下文
- 包括：
    - System instructions
    - Customizations
    - User message
    - Conversation history
    - Tool outputs
    - Explicit references
    - Implicit context
- 在prompts和chat中可以输入#来快捷选择要输入的上下文，可以是chat tools也可以是文件，为了明确告诉 AI 你想用整个代码库作为上下文，可以在提示词中添加 #codebase。
    - 常见chat tools：
        - #browser：集成浏览器交互
        - #edit：在工作区中启用修改功能。
        - #edit/createDirectory、#edit/createFile、#edit/editFiles、#edit/editNotebook
        - #execute：执行代码和应用程序
        - #execute/createAndRunTask、#execute/getTerminalOutput、#execute/runInTerminal、#execute/runNotebookCell、#execute/testFailure
        - #newWorkspace
        - #read
        - #read/getNotebookSummary、#read/problems、#read/readFile、#read/readNotebookCellOutput、#read/readNotebookCellOutput、#read/readNotebookCellOutput
        - #search
        - #search/changes、#search/codebase、#search/fileSearch、#search/listDirectory、#search/textSearch、#search/usages
        - #selection
        - #todos：用一个todo list跟踪chat中的请求的执行和进度
        - #vscode/askQuestions：启用后，AI 可以通过“可点击选项”的方式向你提问，以澄清你的需求
        - #vscode/extensions、#vscode/installExtension
        - #vscode/getProjectSetupInfo
        - #vscode/runCommand
        - #vscode/VSCodeAPI
        - #web
        - #web/fetch
        - #fetch 网页
- 可以在chat中输入“/compat 如何压缩”来压缩输入的上下文，或者搜索“Compact Conversation”。









## 使用技巧
- 为 Copilot 编写提示时，要先给一个目标或场景的概括性描述，然后列出具体要求。
- 举例说明：
    - 可以是具体输入输出
    - 也可以是单测
- 分步骤说明复杂问题
- 避免歧义，少用代词，比如这那
- 多添加相关的/命令、#变量、@上下文
- 没有达到预期的对话可以删除来消除影响；还可以引用之前的对话


# todolist
- 配置instructions：提示中文，数据结构，语法
- 配置prompts：cpp编程一个；python脚本一个
- 学习yaml语法
- 学习json语法

###




