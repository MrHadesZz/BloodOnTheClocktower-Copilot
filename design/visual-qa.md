# 界面视觉核对

设计参考：[workbench-concept.png](workbench-concept.png)。使用内置 Image Gen 生成；提示词：

> Use case: ui-mockup. Asset type: visual concept screenshot for a real desktop web app, 1440x900 composition. Primary request: complete first screen of a Chinese-language Blood on the Clocktower player reasoning workbench called 钟楼推理台. Show the whole usable app, not a marketing page: restrained header with project name, current day/branch, local save indicator; wide quick-entry input with preview button; left rail with 8 numbered player seats in a readable vertical list, claim and alive/dead status; large central reasoning workspace with a clear conditional conclusion, assumptions, supported counterexample/witness view, and query controls; right contextual panel for event timeline and source details. Include a compact lower section edge indicating more timeline continues below. Style: sophisticated editorial analytical tool, dark ink/navy base, off-white canvas, restrained vermilion accents, faint circular clocktower/seat motif behind the main result, thin rules, excellent Chinese typography hierarchy, generous yet practical spacing. Code-native-looking controls and labels. Keep every control plausibly implementable in React/CSS. Avoid generic card grid, fake charts, probability gauges, decorative badges, chat bot bubbles, and hero imagery. Use short Chinese labels such as 钟楼推理台, 快速记录, 玩家, 条件推理, 假设, 反例, 时间线, 预览录入. Dense information must remain legible at screenshot scale. Also provide coherent mobile collapse cues within visual language if possible, but prioritize full desktop surface.

最终浏览器截图：[桌面 1586×944](../output/playwright/workbench-desktop.png) · [手机 390×844](../output/playwright/workbench-mobile.png)。使用 Playwright CLI + 已安装 Chromium；当前环境无可调用的内置 Browser 工具。`view_image` 因 WSLg/bubblewrap 挂载错误无法读取本地文件，改用 shell 读取截图并在工具中作为图片逐张目视检查。

核对点：

1. **结构**：桌面保留深色顶栏、左侧八人座位、中央记录与推理、右侧时间线；手机改为底部三标签。
2. **字色**：深海军蓝、白色主画布、朱红操作与结论强调接近概念图；缺字后已打包 Noto CJK 字体，中文不再显示方框。
3. **层级**：标题、快速记录、条件结论、查询与角色分配见证在首屏依次可见；玩家列表与时间线可独立滚动。
4. **图形**：顶栏改用细线钟楼 SVG；结论背景保留浅色圆形钟楼水印。图标和按钮为可交互 HTML/SVG。
5. **响应式**：修复了手机端玩家列表未铺满屏幕的问题；390px 下页面水平滚动宽度等于视口宽度，移动端菜单可访问导入/导出/分支/重置。
6. **文案**：概念图生成了“恶魔概率”等与 TDD 冲突的内容，实际界面改用分支限定的必然/可能、精确角色分配数和反例；这是有意修正。例子中的人物名称也替换为座位号，避免把虚构发言混进设计包的 H0 事实。

浏览器执行过：录入预览与确认、角色声明不改变硬计数、勾选占卜师 N1 能力有效得到无解、撤销冲突前提恢复可满足、移动端玩家和时间线切换。最终干净加载的浏览器控制台为 0 errors / 0 warnings。
