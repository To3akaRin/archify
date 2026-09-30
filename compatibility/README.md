# 最终候选兼容性核验

基线：`6bc47e51fc95c153a71e36df411546ef60d3908d`。
候选：`c45ea534a405303890f4795e03412cffb849b1a8`。

**8/8 固定输入的完整 HTML 字节一致；16 次公开 renderer 调用全部退出 0。**

输入列表与原始文件来自 `outputs/archify-20260929/implementation-lifecycle/compatibility-base.json`；本次复制原始 JSON 并在最终两个 checkout 重新生成，未复用旧输出或旧通过结论。维护示例还确认了两 checkout 原始 JSON 字节一致。

| 固定输入 | 覆盖 | 完整 HTML 字节一致 |
| --- | --- | --- |
| `agent-run.lifecycle.json` | 维护 v1 示例 | 是 |
| `deployment-release.lifecycle.json` | 维护 v2 示例 | 是 |
| `outer-loop-1.json` | 1 条原先未越界外绕关系 | 是 |
| `outer-loop-2.json` | 2 条原先未越界外绕关系 | 是 |
| `outer-loop-3.json` | 3 条原先未越界外绕关系 | 是 |
| `outer-loop-4.json` | 4 条原先未越界外绕关系 | 是 |
| `outer-loop-col-1.json` | 左侧空间充分，列 [1] | 是 |
| `outer-loop-col-4.json` | 左侧空间充分，列 [4] | 是 |

工具链：官方 Node 22.23.1 / bundled zlib 1.3.1-e00f703。两个版本均调用已文档化入口：

```sh
/Users/huangjing/.nvm/versions/node/v22.23.1/bin/node <checkout>/archify/renderers/lifecycle/render-lifecycle.mjs <same-input.json> <output.html>
```

`receipt.json` 保存输入及输出 SHA-256、退出状态、文件字节数、完整路径。`logs/` 保存全部 16 次实际命令和 stdout/stderr。`inputs/`、`base/`、`candidate/` 保存复现源与比较产物。

核验范围仅为这 8 个固定输入的输出兼容性，不代表所有输入或视觉缺陷均已覆盖。未添加代码、未修改任何仓库文件。
