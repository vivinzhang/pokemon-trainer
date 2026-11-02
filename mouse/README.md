# 宝可梦鼠标训练营

给低年级孩子练习电脑数独的「选格 → 点击数字」操作。纯静态网页，无构建、无登录、无数据上传，支持直接双击 index.html 离线打开。

- 寻找宝可梦：12 次定位单击。
- 送出数字能量：12 次选格与填数，突出目标。
- 训练家挑战：120 秒，按行列坐标选格填数。
- 默认只练鼠标，取消复选框可使用键盘 1–6（含小键盘）。
- 暂停不计时；切换浏览器标签自动暂停；切换模式会放弃当前一局。
- 最近 30 局保存在当前浏览器 localStorage。离线文件与线上网址的记录独立；清除浏览器数据会清除记录。
- 操作训练直接给出目标数字，无需数独推理。盘面由合法数独终盘抽取提示数，用于模拟比赛视觉，不保证谜题唯一解。
- 常见电脑屏幕采用左右布局，窗口很窄时上下排列。

## 本地预览 / 验证

直接双击 index.html，或通过静态服务器预览。运行 `node --test tests/core.test.cjs` 验证训练状态。

## 图片来源

使用宝可梦官网图鉴官方立绘，下载在 assets 中：

- 皮卡丘 https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/025.png
- 小火龙 https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/004.png
- 耿鬼 https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/094.png

宝可梦角色及图片版权归 Pokémon / Nintendo / Creatures / GAME FREAK 等原权利人所有。本项目为非官方个人学习练习工具，不表示已取得官方授权。

## 六宫格

棋盘为 6×6，使用数字 1–6。可切换标准六宫（每宫 2 行×3 列）或不规则六宫（每宫 6 个边相连的格子）。每行、每列、每宫的终盘数字均为 1–6。宫界由粗线与淡色区分；不规则布局使用 4 套已验证模板，旋转、镜像并随机置换数字。切换宫型会重置当前一局；历史记录包含宫型，保留旧版记录。
