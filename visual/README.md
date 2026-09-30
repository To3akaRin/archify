# PR #625 最终视觉对照

比较基础：`6bc47e51fc95c153a71e36df411546ef60d3908d`（#615）；候选：`c45ea534a405303890f4795e03412cffb849b1a8`。

本目录包含三个完全相同输入在两版本上的独立 HTML、交付回执、真实 Chrome 截图及检查日志。未修改 JSON 来美化修复后效果，未编辑截图或 SVG。打开 `index.html` 浏览对照，点击图片查看原尺寸；每个 HTML 可独立打开并切换主题。

## 环境与证据范围

- Node `22.23.1` / zlib `1.3.1-e00f703`；Google Chrome 154.0.8037.59。
- 主对照：1440×900，light/dark，DPR 1，100% 缩放，READ，静止动画，字体和布局稳定后截图；每次使用新的临时浏览器 profile。
- 补充图：2048×1320 的相同两主题，保留于各自 screenshots/；本次感知结论限定逐张检查过的 12 张 1440×900 图。
- 三个输入合计六个独立 HTML、24 张 PNG；12 次 deliver/visual-check 命令均退出 0。
- 三个案例均无 transition label，标签检查覆盖节点标签及泳道标题；起始圆点和箭线由密集案例覆盖。不能据此声称覆盖关系标签或任意布局。
- dark 的线和泳道文字延续既有低对比度样式，本次没有修改颜色；正常尺寸能辨认线间隔，但未做 WCAG 对比度验收。
- 工具 receipt 的 visualReview=pending 保持原样；下表是 Codex 逐图查看后的观察，不代表维护者批准。

## 逐图观察

| 案例 / 主题 | before 实际观察 | after 实际观察 | 本次图像观察结论 |
|---|---|---|---|
| 最小六条回线 / light | [修复前左侧竖线被 SVG 边界裁切，同时穿过 Wait、Retry、Terminal 标题区域；自动浏览器测量仍报告 pass。](minimal-six-loops/before/screenshots/minimal-six-loops.before.visual-check.1440x900.light.png) | [六条回线改走节点右侧，完整连接 A/B/C/D；左侧四个标题区域清空，节点标签未被遮挡；可区分平行回线。](minimal-six-loops/after/screenshots/minimal-six-loops.after.visual-check.1440x900.light.png) | 在此输入和状态下，修复后回线完整、轨道可辨，未观察到节点/泳道标签或已有 start 标记碰撞 |
| 最小六条回线 / dark | [修复前左侧竖线被 SVG 边界裁切，同时穿过 Wait、Retry、Terminal 标题区域；自动浏览器测量仍报告 pass。](minimal-six-loops/before/screenshots/minimal-six-loops.before.visual-check.1440x900.dark.png) | [六条回线改走节点右侧，完整连接 A/B/C/D；左侧四个标题区域清空，节点标签未被遮挡；可区分平行回线。](minimal-six-loops/after/screenshots/minimal-six-loops.after.visual-check.1440x900.dark.png) | 在此输入和状态下，修复后回线完整、轨道可辨，未观察到节点/泳道标签或已有 start 标记碰撞 |
| 密集十条回线与初始标记 / light | [修复前部分左侧回线缺失长竖段、只有端点线段抵达裁切边界，main/retry 标题区域拥挤；邻列 M 初始标记原本位于右側。](dense-start-marker/before/screenshots/dense-start-marker.before.visual-check.1440x900.light.png) | [十条线在 A/C 右側紧凑排列，长竖线和弯折均完整可见；与 B 节点、M 的绿色初始圆点及箭线保持可见间隔，泳道和节点标题未被线覆盖。](dense-start-marker/after/screenshots/dense-start-marker.after.visual-check.1440x900.light.png) | 在此输入和状态下，修复后回线完整、轨道可辨，未观察到节点/泳道标签或已有 start 标记碰撞 |
| 密集十条回线与初始标记 / dark | [修复前部分左侧回线缺失长竖段、只有端点线段抵达裁切边界，main/retry 标题区域拥挤；邻列 M 初始标记原本位于右側。](dense-start-marker/before/screenshots/dense-start-marker.before.visual-check.1440x900.dark.png) | [十条线在 A/C 右側紧凑排列，长竖线和弯折均完整可见；与 B 节点、M 的绿色初始圆点及箭线保持可见间隔，泳道和节点标题未被线覆盖。](dense-start-marker/after/screenshots/dense-start-marker.after.visual-check.1440x900.dark.png) | 在此输入和状态下，修复后回线完整、轨道可辨，未观察到节点/泳道标签或已有 start 标记碰撞 |
| 更宽中间节点 / light | [修复前回线在左边界裁切并经过泳道标题，宽节点 b 完整显示。](extra-1-wide-middle-right-lifecycle/before/screenshots/extra-1-wide-middle-right-lifecycle.before.visual-check.1440x900.light.png) | [十条线绕到宽中间节点 b 的右边，最内侧轨道也与 b 的右边框有明显间隔；所有回线和 a/c 箭头完整，未穿过 b 或下方 Outside 节点，左侧标题区域清空。](extra-1-wide-middle-right-lifecycle/after/screenshots/extra-1-wide-middle-right-lifecycle.after.visual-check.1440x900.light.png) | 在此输入和状态下，修复后回线完整、轨道可辨，未观察到节点/泳道标签或已有 start 标记碰撞 |
| 更宽中间节点 / dark | [修复前回线在左边界裁切并经过泳道标题，宽节点 b 完整显示。](extra-1-wide-middle-right-lifecycle/before/screenshots/extra-1-wide-middle-right-lifecycle.before.visual-check.1440x900.dark.png) | [十条线绕到宽中间节点 b 的右边，最内侧轨道也与 b 的右边框有明显间隔；所有回线和 a/c 箭头完整，未穿过 b 或下方 Outside 节点，左侧标题区域清空。](extra-1-wide-middle-right-lifecycle/after/screenshots/extra-1-wide-middle-right-lifecycle.after.visual-check.1440x900.dark.png) | 在此输入和状态下，修复后回线完整、轨道可辨，未观察到节点/泳道标签或已有 start 标记碰撞 |

## 几何证据与限制

`geometry-comparison.json` 对最终 HTML 的 data-composition-points 和节点矩形作对照：三个案例均保留关系 ID/数量、节点矩形与 viewBox；after 全部路由点及 4px crossover halo 在水平画布内。这个静态核对只补充截图，不替代浏览器或感知审查。

| 案例 | 关系数 | before 最小 x / 最大 x | after 最小 x / 最大 x | after halo 水平入画 |
|---|---:|---:|---:|---|
| minimal-six-loops | 6 | -8.00 / 60.00 | 200.00 / 268.00 | 是 |
| dense-start-marker | 10 | -48.00 / 60.00 | 200.00 / 262.90 | 是 |
| extra-1-wide-middle-right-lifecycle | 10 | -48.00 / 110.00 | 250.00 / 408.00 | 是 |

## 复现

本目录附 `generate-evidence.mjs` 与 `cases.json`。需要 Node 22、Chrome 和两个对应完整 SHA 的干净仓库 checkout。输出目录必须不存在。以下 BASE_CHECKOUT、CANDIDATE_CHECKOUT 为需要替换的本机目录：

```sh
node generate-evidence.mjs \
  --base /BASE_CHECKOUT \
  --base-sha 6bc47e51fc95c153a71e36df411546ef60d3908d \
  --candidate /CANDIDATE_CHECKOUT \
  --candidate-sha c45ea534a405303890f4795e03412cffb849b1a8 \
  --chrome '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --run-dir /NEW_OUTPUT_DIRECTORY \
  --extra-input inputs/extra-1-wide-middle-right-lifecycle.lifecycle.json
```

此包中的额外 JSON 文件名带有证据编号，复跑输出目录会据其文件名生成新的案例目录名；输入字节不变，摘要仍应与 manifest 一致。命令 stdout/stderr 与 SHA/环境详情保留在 manifest 及各侧日志。

`manifest.json` 和自动工具 summary 保留生成时的 perceptualReview=pending；本次逐图观察另存 `visual-review.json`，没有覆写自动回执。

工程验证结果另见 [verification-summary.md](verification-summary.md)。完整运行日志由主代理单独提供，不夹入视觉图包。
