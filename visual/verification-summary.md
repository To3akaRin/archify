# 候选验证摘要

候选：`c45ea534a405303890f4795e03412cffb849b1a8`；比较基础：`6bc47e51fc95c153a71e36df411546ef60d3908d`。主代理执行以下验证，本摘要已回读对应日志汇总及兼容回执。完整运行日志单独提供，不重复打入视觉图包。

| 检查 | 实际结果 | 独立证据文件 | SHA-256 |
|---|---|---|---|
| 完整 npm test | 2337 passed / 0 failed / 87 skipped | `final-npm-test.log` | `8d9c3333d13a57375c81f7c19b01f1f03570121f9facb68512b8fea1ca6cb5d0` |
| Lifecycle 聚焦与真实 Chrome | 42 passed / 0 failed / 0 skipped | `final-lifecycle-browser.log` | `5ad55cd233ee7f9f4c3b1fd64f112c3a2513107ae32da0ff9e4c1efc2606806f` |
| 解压包 smoke | package smoke passed on darwin | `final-package-smoke.log` | `f59091d19fd4ae23ef3a0f91366d6ae2555bfd1f116e91cc811a9184102d9c20` |
| 固定兼容控制 | 8/8 完整 HTML 字节相同 | `receipt.json` | `bc0cb18a7bd710c4f4577e141117498ee75fe4ba80f60353d0e59ae2681e5f05` |

87 个跳过项未计为通过；完整测试与聚焦浏览器测试覆盖范围不同。8 个兼容控制只证明这些固定输入生成的完整 HTML 不变，不代表任意输入的全局兼容。远端 CI、维护者审查与合并状态独立于以上本地结果。

主代理另在浏览器独立检查最终最小案例 light 与密集案例 dark（1440×900），观察未见碰撞，console 无 warn/error。三案例全套 12 张桌面截图的逐图观察在 [README](README.md) 和 [visual-review.json](visual-review.json)；自动截图 receipt 保持原始 pending 状态。
