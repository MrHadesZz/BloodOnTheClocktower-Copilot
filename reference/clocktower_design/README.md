# Clocktower Reasoning Copilot — Design Package

本包是一份血染钟楼玩家推理辅助工具的技术设计及最小可复算参考材料，不是已完成的Web应用，也不是完整Trouble Brewing求解器。

## 文件

- `technical_design.md`：按需求28节组织的完整中文设计。
- `sources.md`：关键游戏规则和技术文档的官方来源。
- `domain.ts`：建议的TypeScript领域合同；不含规则编译器实现。
- `tool_schema.json`：只读 `check_hypothesis` 工具输入JSON Schema。
- `tool_input_example.json`：与schema匹配的输入示例。
- `verify_walkthrough.py`：Python标准库参考枚举器。
- `test_walkthrough.py`：13项有限范围单元测试。
- `walkthrough_results.json`：实际运行产生的计数输出。
- `test_results.txt`、`validation_report.txt`：本包实际校验结果。

## 运行

Python 3.10或更高版本，无第三方运行依赖：

```bash
python verify_walkthrough.py
python -m unittest -v test_walkthrough.py
```

可选检查领域类型（需要本机安装TypeScript）：

```bash
tsc --strict --noEmit --target ES2022 domain.ts
```

Schema本身为Draft 2020-12。JSON结构验证之后，应用仍需做角色ID、座位ID、游戏时间、权限、最大AST深度和分支版本的语义验证。

## 数字含义

24 → 12 → 8 → 8 → 2 → 1 是明确固定角色袋H0、四位玩家真实角色已作假设、逐步采纳指定报告及健康条件后的**不同初始角色分配数**。

“3号首夜能力有效”的额外假设分支得到0。仅记录声明不会让24自动缩小。所有计数都不是完整TB的无条件候选总数、完整隐藏历史数或真实阵营概率。

参考程序只实现示例用到的首夜信息/投毒与次夜相容性判断。不实现Spy、Recluse、Drunk、Baron、完整提名/投票系统、角色转变或一般自然语言理解。对完整引擎的方案与伪代码在设计文档中，不能把它们误当成已执行的实现。

## 已做与未做

已做：实际运行本例枚举与单元测试；TypeScript类型检查；工具输入schema及正/负例检查；28个顶层章节完整性检查。

未做：完整TB规则引擎、浏览器应用部署、真实玩家试验、Z3-WASM设备/性能验证、概率模型训练、穷尽的论文与竞品审查。
