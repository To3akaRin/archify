# 最终候选验证记录

- PR #625 候选：`c45ea534a405303890f4795e03412cffb849b1a8`。
- 开发版本依赖 #615：`6bc47e51fc95c153a71e36df411546ef60d3908d`。
- 上游 dev 基线：`f12947c420810399cfbaa254870de4f41b087bba`。
- 工具链：官方 Node 22.23.1 / zlib 1.3.1-e00f703；Google Chrome 154.0.8037.59；macOS。

## 结果

| 检查 | 最终结果 |
| --- | --- |
| `npm test`，在 `archify/` 执行 | 2424 项：2337 通过，0 失败，87 跳过；日志 `logs/final-npm-test.log` |
| lifecycle route-bounds / v2 / planner / rail-browser / band-title，显式真实 Chrome | 42 通过，0 失败，0 跳过；日志 `logs/final-lifecycle-browser.log` |
| ZIP 两次官方工具链构建 | 字节一致，SHA-256 `216506ac3eeac47dfd114e16c9df36a8cdd4aa3057f0e55d7977455acef81b43` |
| 解压包 `package-smoke.mjs` | 通过，针对独立解压目录，不针对带 node_modules 的源码目录 |
| 8 个不受影响的固定案例 | 16 次公开 render 成功，8/8 完整 HTML 字节一致；见 `compatibility/receipt.json` |
| 最终视觉材料 | 3 固定输入、6 独立 HTML、24 PNG；12 次 deliver/visual-check 退出 0 |
| 逐图视觉观察 | 已查看12张1440×900修复前后浅深主题图；修复后无观察到的节点/泳道标题/初始标记碰撞 |

全量测试中的跳过项没有计为通过。浏览器相关目标检查另行显式运行。视觉结论限定所提供输入和尺寸，不代替维护者最终批准。

## 当前依赖范围

`dev` 已同步稳定发布清单。#615 仅准备 `3.0.2-dev.1` 开发身份及其派生标签/产物，满足真实 `Unreleased` 修改的版本规则。#625 相对该依赖仅有7个文件：2个运行时实现、1个回归测试、2个契约/renderer文档、CHANGELOG与ZIP。

## 重现命令

```sh
export PATH=/path/to/official-node22/bin:$PATH
cd /path/to/archify-repository/archify
npm test
ARCHIFY_CHROME='/path/to/chrome' node --test \
  test/lifecycle-route-bounds.test.mjs test/lifecycle-v2.test.mjs \
  test/lifecycle-planner.test.mjs test/lifecycle-rail-browser.test.mjs \
  test/lifecycle-band-title.test.mjs
cd ..
scripts/build-zip.sh /tmp/archify-pr625.zip
cmp archify.zip /tmp/archify-pr625.zip
mkdir -p /tmp/archify-pr625-extracted
unzip -q archify.zip -d /tmp/archify-pr625-extracted
node scripts/package-smoke.mjs /tmp/archify-pr625-extracted/archify
```

远端 CI 链接在 PR 中单独记录，不将本地通过写成远端通过。
