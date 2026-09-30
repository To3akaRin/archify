# #625 宽节点修复独立审查

审查基线：`1e34641c304be9b82f0dad2870a2cef40657e2a4`。
审查对象：工作区宽节点包络修复，尚未包含随后新增的泳道标题修复。

## 已复现问题：统一宽度包络破坏可行的混合跨度路线

优先级 P2。补丁 `grid-routing.mjs` 的换侧预算将所有路线跨越的同列状态取一个宽度包络，并用这一包络替换原端点候选。当短路线不经过某个 `yOffset` 宽节点而长路线经过时，旧版可利用依次外扩的轨道恰好避开宽节点；新候选把短路线也整体向外推，所有候选撞到邻列后又退回负坐标。

使用 `mixed-spans.lifecycle.json` 从公开 `deliver` 入口复现：四个 lane，前五条 `a-c/c-a`，后五条 `a-d/d-a`。额外的宽节点位于 `two` lane、col 0、width 240、yOffset 96，邻列节点位于同 lane、col 1、yOffset 96。

- 修复前：`before.html`，十条长竖轨道 x = 268..358，均在 640px 画布内。
- 首版宽节点补丁：`after.html`，轨道回退到 x = 42,32,22,12,2,-8,-18,-28,-38,-48，五条轨道越界。
- 两次 `deliver` 都返回 `ok:true`，因此单看交付返回值不能检出该回归。

建议先保留端点边界的有限候选，完整避障检查通过则直接复用；若失败，再尝试包含中间宽节点的边界候选。增加这个混合跨度回归即可验证两类需求兼容。

## 已检查且未发现新缺陷的范围

- 作者固定 fromSide / toSide 的换侧 gate 未变。
- 显式 via/channel 在 plannerRouted 处排除，未被本补丁重写。
- 其他列不扩大边界，但仍由完整节点走廊检查约束。
- 初始标记的几何、loopBlocked 和 clearAlternateLoop 标记检查均保留。
- 两侧方向的宽节点回归、固定端口、跨度外同列宽节点已有公开 deliver 测试。

新泳道标题修复及混合跨度修复完成后需要再审最终补丁。本文件记录的是已固定的首版发现，不能当作最终修复状态。


## 最终算法复审：已修复，未发现新的阻断项

已保留端点边界候选优先，全部避障检查失败后才尝试宽节点包络。对独立保存的 `mixed-spans.lifecycle.json` 再次调用公开 `deliver`，`after-final.html` 的全部 `data-composition-points` 与 `before.html` 逐字符串一致，首版发现已解决。源码 SHA-256 保存在 `reviewed-source-hashes.json`。

泳道标题修复检查结论：

- `bandGeometry()` 在 probe 与最终 router 分别重算，适应行间距调整。
- `laneLabels` 已前移到首次调用前，未引入 temporal dead zone。
- 左侧预算扣除标题右边界加 2px 间距，并额外计入每组最大 halo；换侧候选继续按各条路线检查标题矩形。
- fixed side gate、显式 via/channel 路由、initial marker 检查仍保留。
- 端点边界优先和宽包络后备各自只有 regular/compact 两个有限候选，未引入无界搜索。

不同列宽节点的补充核验：v2 的列中心按该列最大显式宽度分配，并保留至少 44px 列间隙；合法 schema 没有 xOffset。因此不同列 bbox 不能与端点所属列的 x 区间重叠，同 cx 筛选与“x 区间重叠”对公共 v2 输入等价。公开 deliver 对邻列 width 140/240/900、yOffset 96 的实验分别得到 64/64/44px 间距，详见 `cross-column-bbox-check.json`。

保留的范围限制：本修复只调整原本越界的自动外绕组，原先已入画的轨道保持原几何，无法把旧有标题视觉缺陷一并宣称已修复。固定侧边且空间不足仍尊重作者约束；`deliver ok` 不等于已完整入画或视觉验收。最终截图与真实浏览器感知验收由 visual_acceptance 代理完成，本独立审查不替代该结论。
